import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  calcularPiso,
  calcularPintura,
  calcularBTU,
  calcularOperacaoBasica,
} from './src/utils/calculators';

const execFileAsync = promisify(execFile);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rota didática de Backend: POST /api/calcular
  // Tenta executar o script Python real (python_project/calculadora_interiores.py)
  // e retorna o pacote completo de telemetria HTTP + saída Python para fins didáticos.
  app.post('/api/calcular', async (req, res) => {
    const inicio = performance.now();
    const { tipo, dados } = req.body || {};

    if (!tipo || !dados) {
      res.status(400).json({
        sucesso: false,
        statusHttp: 400,
        erro: 'Payload inválido. Envie { "tipo": "...", "dados": { ... } }',
      });
      return;
    }

    const scriptPath = path.resolve(process.cwd(), 'python_project', 'calculadora_interiores.py');

    try {
      // Tenta executar via interpretador Python 3 real do servidor
      const { stdout } = await execFileAsync(
        'python3',
        [scriptPath, '--json', JSON.stringify({ tipo, dados })],
        { timeout: 4000 }
      );
      const parsed = JSON.parse(stdout.trim());
      const duracaoMs = Number((performance.now() - inicio).toFixed(2));

      if (!parsed.sucesso) {
        res.status(422).json({
          sucesso: false,
          statusHttp: 422,
          motorExecucao: 'Python 3 (calculadora_interiores.py)',
          duracaoMs,
          erro: parsed.erro,
        });
        return;
      }

      res.status(200).json({
        sucesso: true,
        statusHttp: 200,
        motorExecucao: 'Python 3 (calculadora_interiores.py)',
        duracaoMs,
        tipo,
        entradaRecebida: dados,
        resultado: parsed.resultado,
      });
    } catch {
      // Fallback determinístico caso python3 não esteja disponível no ambiente
      try {
        let resultado: unknown;
        if (tipo === 'piso') {
          const r = calcularPiso({
            largura: Number(dados.largura),
            comprimento: Number(dados.comprimento),
            margemRecortePercent: Number(dados.margem_recorte_percent ?? 10),
            areaPorCaixa: Number(dados.area_por_caixa ?? 2),
            precoPorM2: Number(dados.preco_m2 ?? 89.9),
          });
          resultado = {
            area_liquida_m2: r.areaLiquida,
            margem_recorte_percent: r.margemRecortePercent,
            area_perda_m2: r.areaPerda,
            area_com_recorte_m2: r.areaComRecorte,
            caixas_necessarias: r.caixasNecessarias,
            area_total_comprada_m2: r.areaTotalComprada,
            custo_estimado_brl: r.custoEstimado,
          };
        } else if (tipo === 'pintura') {
          const r = calcularPintura({
            larguraParede: Number(dados.largura_parede),
            alturaParede: Number(dados.altura_parede),
            areaAberturas: Number(dados.area_aberturas ?? 0),
            numeroDemaos: Number(dados.numero_demaos ?? 2),
            rendimentoPorLitro: Number(dados.rendimento_m2_por_litro ?? 10),
          });
          resultado = {
            area_bruta_m2: r.areaBruta,
            area_liquida_m2: r.areaLiquida,
            area_total_demaos_m2: r.areaTotalPintura,
            litros_exatos: r.litrosExatos,
            litros_com_margem: r.litrosComMargem,
            latas_18l: r.latas18L,
            galoes_3_6l: r.galoes3_6L,
          };
        } else if (tipo === 'btu') {
          const r = calcularBTU({
            areaAmbiente: Number(dados.area_ambiente),
            incidenciaSolar: dados.incidencia_solar === 'tarde' ? 'tarde' : 'manha',
            numeroPessoas: Number(dados.numero_pessoas ?? 2),
            numeroEletronicos: Number(dados.numero_eletronicos ?? 1),
          });
          resultado = {
            btu_area: r.btuArea,
            btu_pessoas: r.btuPessoas,
            btu_eletronicos: r.btuEletronicos,
            btu_total: r.btuTotal,
            capacidade_comercial_btu: r.capacidadeComercial,
          };
        } else if (tipo === 'basica') {
          const r = calcularOperacaoBasica({
            valorA: Number(dados.valor_a),
            valorB: Number(dados.valor_b),
            operador: dados.operador || '+',
          });
          if (r.erro) {
            throw new Error(r.erro);
          }
          resultado = {
            expressao: r.expressaoPython,
            resultado: r.resultado,
            tipo_python: r.tipoRetornoPython,
          };
        } else {
          res.status(400).json({ sucesso: false, statusHttp: 400, erro: 'Tipo inválido' });
          return;
        }

        const duracaoMs = Number((performance.now() - inicio).toFixed(2));
        res.status(200).json({
          sucesso: true,
          statusHttp: 200,
          motorExecucao: 'Runtime Backend API (/api/calcular)',
          duracaoMs,
          tipo,
          entradaRecebida: dados,
          resultado,
        });
      } catch (err: unknown) {
        const duracaoMs = Number((performance.now() - inicio).toFixed(2));
        res.status(422).json({
          sucesso: false,
          statusHttp: 422,
          motorExecucao: 'Runtime Backend API (/api/calcular)',
          duracaoMs,
          erro: err instanceof Error ? err.message : 'Erro de validação',
        });
      }
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
