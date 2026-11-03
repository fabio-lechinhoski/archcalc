import React from 'react';
import { Terminal, Globe, ArrowRight, Layers, ShieldCheck, FileCode } from 'lucide-react';

interface BackendGuideSectionProps {
  onBaixarProjetoCompleto: () => void;
}

export const BackendGuideSection: React.FC<BackendGuideSectionProps> = ({
  onBaixarProjetoCompleto,
}) => {
  return (
    <section
      id="guia-backend"
      className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs font-mono text-sky-700">
            ARQUITETURA DE SOFTWARE · GUIA PARA QUEM ESTÁ RETORNANDO À PROGRAMAÇÃO
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Como funciona a arquitetura em Python (Do Terminal ao Backend Web)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Como você já tem base em lógica de programação, o segredo para organizar bem este projeto é <strong>separar o cálculo matemático da interface</strong>. Assim, o mesmo arquivo <code>calculadora_interiores.py</code> funciona tanto no terminal quanto em um servidor web.
          </p>
        </div>

        <button
          type="button"
          onClick={onBaixarProjetoCompleto}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Baixar Módulo calculadora_interiores.py
        </button>
      </div>

      {/* Comparativo: Quando você precisa ou não de um Backend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">CENÁRIO A · SEM BACKEND</span>
            <Terminal className="w-4 h-4 text-slate-700" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            01. Script Local de Terminal (CLI) ou App Desktop
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Se apenas você vai usar a calculadora no seu computador, <strong>você não precisa de backend</strong>. O próprio Python lê os dados pelo teclado com <code>input()</code>, chama as funções de cálculo e imprime na tela com <code>print()</code>.
          </p>
          <div className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs space-y-1">
            <div className="text-slate-400"># Fluxo direto no mesmo processo:</div>
            <div>Entrada (input) → Função Python → Saída (print)</div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-sky-700">CENÁRIO B · COM BACKEND WEB</span>
            <Globe className="w-4 h-4 text-sky-700" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            02. Aplicação Web (Navegador + Servidor Python)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Os navegadores (Chrome, Safari) só executam HTML, CSS e JavaScript nativamente — eles não rodam Python direto. Por isso criamos um <strong>Backend</strong>: um programa Python que fica rodando em um servidor esperando pedidos via protocolo HTTP.
          </p>
          <div className="p-3 rounded-lg bg-slate-900 text-sky-300 font-mono text-xs space-y-1">
            <div className="text-slate-400"># Fluxo Cliente-Servidor via JSON:</div>
            <div>Navegador (JS) → HTTP POST JSON → Python (Flask) → JSON</div>
          </div>
        </div>
      </div>

      {/* Passo a passo das 4 etapas de um Backend do zero */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900">
          O Ciclo de Vida de uma Requisição no Backend (Passo a Passo)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-700">
              <span>ETAPA 01</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Empacotamento JSON</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quando você clica em &ldquo;Calcular&rdquo;, o Frontend transforma os campos do formulário em um texto estruturado chamado <strong>JSON</strong> (muito parecido com um <code>dict</code> do Python) e envia para o endereço <code>/api/calcular</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-700">
              <span>ETAPA 02</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Roteamento (Endpoint)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No Python, um microframework como <strong>Flask</strong> ou <strong>FastAPI</strong> usa um decorador <code>@app.route(&quot;/api/calcular&quot;)</code> para associar aquela URL a uma função Python específica.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-700">
              <span>ETAPA 03</span>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Validação e Cálculo</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              A rota extrai os dados (<code>request.get_json()</code>) e chama sua função pura <code>calcular_piso()</code> dentro de um bloco <code>try / except</code>. Se houver largura negativa ou divisão por zero, o erro é capturado.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-700">
              <span>ETAPA 04</span>
              <FileCode className="w-3.5 h-3.5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900">Resposta HTTP Status</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              O Python converte o dicionário de resposta novamente em JSON (<code>jsonify()</code>) acompanhado do código de status HTTP: <code>200 OK</code> para sucesso ou <code>422</code> para erro de validação.
            </p>
          </div>
        </div>
      </div>

      {/* Estrutura de pastas recomendada */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-2 border border-slate-800">
          <div className="text-sky-400 font-semibold mb-2">
            Estrutura de Pastas Recomendada no seu PC:
          </div>
          <div>meu_projeto_interiores/</div>
          <div className="pl-4 text-emerald-300">├── calculadora_interiores.py <span className="text-slate-400"># Funções puras (Cálculos)</span></div>
          <div className="pl-4 text-amber-300">├── menu_terminal.py          <span className="text-slate-400"># Para usar no Terminal</span></div>
          <div className="pl-4 text-sky-300">├── app_backend.py            <span className="text-slate-400"># Servidor Web (Flask)</span></div>
          <div className="pl-4 text-slate-300">└── test_calculadora.py       <span className="text-slate-400"># Testes automatizados</span></div>
        </div>

        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900">
            Resumo dos Principais Conceitos Python para Revisar
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-mono font-semibold text-slate-900">**dados (Kwargs Unpacking)</div>
              <p className="text-slate-600 mt-1">
                Passar <code>calcular_piso(**dados)</code> desempacota um dicionário <code>{`{"largura": 4, "comprimento": 5}`}</code> diretamente nos parâmetros nomeados da função.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-mono font-semibold text-slate-900">Divisão: / vs // vs %</div>
              <p className="text-slate-600 mt-1">
                Em Python 3, <code>10 / 2</code> retorna <code>5.0</code> (float). Já <code>22 // 18</code> retorna <code>1</code> (quociente inteiro) e <code>22 % 18</code> retorna <code>4</code> (resto).
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-mono font-semibold text-slate-900">math.ceil() vs round()</div>
              <p className="text-slate-600 mt-1">
                <code>round(x, 2)</code> formata metragens e preços; <code>math.ceil(x)</code> garante que você nunca compre menos caixas de piso ou galões do que a obra exige.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="font-mono font-semibold text-slate-900">Dicionários (dict) como Retorno</div>
              <p className="text-slate-600 mt-1">
                Retornar um <code>dict</code> com chaves descritivas (<code>&quot;caixas_necessarias&quot;: 15</code>) é muito mais legível e seguro do que retornar uma tupla sem nomes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
