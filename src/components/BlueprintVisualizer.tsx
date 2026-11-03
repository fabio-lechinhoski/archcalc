import React from 'react';
import {
  TipoCalculo,
  ResultadoPiso,
  ResultadoPintura,
  ResultadoBTU,
  ResultadoOperacaoBasica,
} from '../utils/calculators';

interface BlueprintVisualizerProps {
  tipoAtivo: TipoCalculo;
  resultadoPiso: ResultadoPiso;
  resultadoPintura: ResultadoPintura;
  resultadoBTU: ResultadoBTU;
  resultadoBasica: ResultadoOperacaoBasica;
  onUsarResultadoBasico?: (destino: 'piso_largura' | 'pintura_largura' | 'btu_area', valor: number) => void;
}

export const BlueprintVisualizer: React.FC<BlueprintVisualizerProps> = ({
  tipoAtivo,
  resultadoPiso,
  resultadoPintura,
  resultadoBTU,
  resultadoBasica,
  onUsarResultadoBasico,
}) => {
  if (tipoAtivo === 'piso') {
    const { largura, comprimento, margemRecortePercent, areaLiquida, areaComRecorte, caixasNecessarias } =
      resultadoPiso;
    const maxDim = Math.max(largura, comprimento, 1);
    const rectW = Math.max(90, Math.min(240, (comprimento / maxDim) * 230));
    const rectH = Math.max(65, Math.min(135, (largura / maxDim) * 135));
    const startX = (360 - rectW) / 2;
    const startY = (195 - rectH) / 2 + 6;
    const diagonal = margemRecortePercent >= 15;

    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 h-full flex flex-col justify-between space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-sky-400">PLANTA TÉCNICA · PAGINAÇÃO DE PISO</span>
            <h2 className="text-base font-semibold text-white mt-0.5">
              Malha {comprimento.toFixed(2)}m × {largura.toFixed(2)}m ({diagonal ? 'Paginação Diagonal / Especial' : 'Paginação Reta'})
            </h2>
          </div>
          <div className="text-xs font-mono text-amber-300 tabular-nums">
            Margem +{margemRecortePercent}%
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-lg border border-slate-800/80 p-3 flex items-center justify-center">
          <svg
            viewBox="0 0 360 200"
            className="w-full h-48"
            role="img"
            aria-label={`Planta técnica do piso de ${comprimento} por ${largura} metros`}
          >
            <defs>
              <pattern
                id="tileGridStraight"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="0.9"
                  strokeOpacity="0.45"
                />
              </pattern>
              <pattern
                id="tileGridDiag"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1"
                  strokeOpacity="0.55"
                />
              </pattern>
            </defs>

            <rect
              x={startX - 8}
              y={startY - 8}
              width={rectW + 16}
              height={rectH + 16}
              rx="4"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />

            <rect
              x={startX}
              y={startY}
              width={rectW}
              height={rectH}
              fill={diagonal ? 'url(#tileGridDiag)' : 'url(#tileGridStraight)'}
              stroke="#38BDF8"
              strokeWidth="2"
            />

            <line
              x1={startX}
              y1={startY - 16}
              x2={startX + rectW}
              y2={startY - 16}
              stroke="#94A3B8"
              strokeWidth="1"
            />
            <text
              x={startX + rectW / 2}
              y={startY - 21}
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
            >
              {comprimento.toFixed(2)} m
            </text>

            <text
              x={startX - 14}
              y={startY + rectH / 2 + 4}
              textAnchor="end"
              fill="#E2E8F0"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
            >
              {largura.toFixed(2)} m
            </text>

            <rect
              x={startX + rectW / 2 - 48}
              y={startY + rectH / 2 - 12}
              width="96"
              height="24"
              rx="4"
              fill="#0F172A"
              fillOpacity="0.88"
              stroke="#334155"
              strokeWidth="1"
            />
            <text
              x={startX + rectW / 2}
              y={startY + rectH / 2 + 4}
              textAnchor="middle"
              fill="#38BDF8"
              fontSize="11"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
            >
              {areaLiquida.toFixed(2)} m²
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Área Total c/ Margem</div>
            <div className="font-mono text-sm font-semibold text-sky-300 mt-1 tabular-nums">
              {areaComRecorte.toFixed(2)} m² (+{resultadoPiso.areaPerda.toFixed(2)} m² perda)
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Especificação de Compra</div>
            <div className="font-mono text-sm font-semibold text-amber-300 mt-1 tabular-nums">
              {caixasNecessarias} caixas ({resultadoPiso.areaTotalComprada.toFixed(2)} m²)
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tipoAtivo === 'pintura') {
    const {
      areaBruta,
      areaAberturas,
      areaLiquida,
      numeroDemaos,
      litrosExatos,
      litrosComMargem,
      latas18L,
      galoes3_6L,
    } = resultadoPintura;
    const proporcaoAbertura = Math.min(0.65, Math.max(0.08, areaAberturas / Math.max(areaBruta, 1)));
    const aberturaW = Math.max(108, Math.round(180 * Math.sqrt(proporcaoAbertura)));
    const aberturaH = Math.max(42, Math.round(95 * Math.sqrt(proporcaoAbertura)));

    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 h-full flex flex-col justify-between space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-emerald-400">ELEVAÇÃO DE PAREDE · RENDIMENTO DE TINTA</span>
            <h2 className="text-base font-semibold text-white mt-0.5">
              Área Útil Pintável: {areaLiquida.toFixed(2)} m² × {numeroDemaos} demão(s)
            </h2>
          </div>
          <div className="text-xs font-mono text-emerald-300 tabular-nums">
            {litrosComMargem.toFixed(2)} L (+10% reserva)
          </div>
        </div>

        <div className="bg-slate-950/70 rounded-lg border border-slate-800/80 p-3 flex items-center justify-center">
          <svg
            viewBox="0 0 360 190"
            className="w-full h-48"
            role="img"
            aria-label="Elevação da parede com desconto de vãos de portas e janelas"
          >
            <rect
              x="60"
              y="24"
              width="240"
              height="130"
              rx="3"
              fill="#065F46"
              fillOpacity="0.35"
              stroke="#10B981"
              strokeWidth="2"
            />
            {areaAberturas > 0 && (
              <g>
                <rect
                  x={180 - aberturaW / 2}
                  y={154 - aberturaH}
                  width={aberturaW}
                  height={aberturaH}
                  fill="#0F172A"
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text
                  x="180"
                  y={154 - aberturaH / 2 + 4}
                  textAnchor="middle"
                  fill="#FDA4AF"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  -{areaAberturas.toFixed(1)} m² (Vãos)
                </text>
              </g>
            )}
            <text
              x="180"
              y="46"
              textAnchor="middle"
              fill="#A7F3D0"
              fontSize="11"
              fontWeight="600"
              fontFamily="JetBrains Mono, monospace"
            >
              Área Pintável: {areaLiquida.toFixed(2)} m² ({numeroDemaos}x demãos)
            </text>
            <text
              x="180"
              y="174"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="11"
              fontFamily="JetBrains Mono, monospace"
            >
              Área Bruta: {areaBruta.toFixed(2)} m² | Cobertura Total: {resultadoPintura.areaTotalPintura.toFixed(2)} m²
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Consumo Estimado</div>
            <div className="font-mono text-sm font-semibold text-white mt-1 tabular-nums">
              {litrosExatos.toFixed(2)} L (Exato) · {litrosComMargem.toFixed(2)} L (c/ Reserva)
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="text-slate-400">Embalagens Comerciais</div>
            <div className="font-mono text-sm font-semibold text-emerald-300 mt-1 tabular-nums">
              {latas18L}× Lata 18L + {galoes3_6L}× Galão 3,6L ({resultadoPintura.totalLitrosRecomendados} L)
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tipoAtivo === 'btu') {
    const {
      areaAmbiente,
      incidenciaSolar,
      fatorPorM2,
      btuArea,
      btuPessoas,
      btuEletronicos,
      btuTotal,
      capacidadeComercial,
      classificacaoCiclo,
    } = resultadoBTU;

    const pctArea = Math.round((btuArea / Math.max(btuTotal, 1)) * 100);
    const pctPessoas = Math.round((btuPessoas / Math.max(btuTotal, 1)) * 100);
    const pctEletro = Math.max(0, 100 - pctArea - pctPessoas);

    return (
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 h-full flex flex-col justify-between space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-mono text-sky-400">BALANÇO TÉRMICO · CLIMATIZAÇÃO DE INTERIORES</span>
            <h2 className="text-base font-semibold text-white mt-0.5">
              Demanda: {btuTotal.toLocaleString('pt-BR')} BTU/h → Comercial: {capacidadeComercial.toLocaleString('pt-BR')} BTU/h
            </h2>
          </div>
          <div className="text-xs font-mono text-amber-300 tabular-nums">
            {fatorPorM2} BTU/m² ({incidenciaSolar === 'tarde' ? 'Sol da Tarde' : 'Sol da Manhã'})
          </div>
        </div>

        <div className="space-y-4 my-auto">
          <div>
            <div className="flex justify-between text-xs font-mono text-slate-300 mb-2 tabular-nums">
              <span>Área ({areaAmbiente} m²): {btuArea} BTU</span>
              <span>Pessoas extras: +{btuPessoas} BTU</span>
              <span>Eletrônicos: +{btuEletronicos} BTU</span>
            </div>
            <div className="w-full h-5 bg-slate-950 rounded-md overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${pctArea}%` }}
                className="bg-sky-500 h-full transition-all duration-200"
                title={`Área: ${btuArea} BTU`}
              />
              <div
                style={{ width: `${pctPessoas}%` }}
                className="bg-amber-500 h-full transition-all duration-200"
                title={`Pessoas: ${btuPessoas} BTU`}
              />
              <div
                style={{ width: `${pctEletro}%` }}
                className="bg-emerald-500 h-full transition-all duration-200"
                title={`Eletrônicos: ${btuEletronicos} BTU`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">Carga Calculada</div>
              <div className="text-base font-mono font-semibold text-white mt-1 tabular-nums">
                {btuTotal.toLocaleString('pt-BR')} BTU/h
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">Aparelho Comercial</div>
              <div className="text-base font-mono font-semibold text-sky-400 mt-1 tabular-nums">
                {capacidadeComercial.toLocaleString('pt-BR')} BTU/h
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <div className="text-slate-400">Especificação</div>
              <div className="text-xs font-medium text-slate-200 mt-1">
                {classificacaoCiclo}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 h-full flex flex-col justify-between space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono text-amber-400">VISOR DE CÁLCULO AUXILIAR</span>
          <h2 className="text-base font-semibold text-white mt-0.5">
            Expressão: <code className="font-mono text-sky-300">{resultadoBasica.expressaoPython}</code>
          </h2>
        </div>
      </div>

      <div className="p-5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
        <div className="text-xs text-slate-400 mb-1">Operação Selecionada</div>
        <div className="text-base text-slate-200 tabular-nums">
          {resultadoBasica.expressaoPython}
        </div>
        {resultadoBasica.erro ? (
          <div className="text-rose-400 mt-3 text-xs">
            Não é possível dividir por zero. Informe um divisor diferente de 0.
          </div>
        ) : (
          <div className="text-2xl text-emerald-400 mt-3 font-bold tabular-nums">
            = {resultadoBasica.resultado}
          </div>
        )}
      </div>

      {resultadoBasica.resultado !== null && resultadoBasica.resultado > 0 && onUsarResultadoBasico && (
        <div className="pt-2 border-t border-slate-800 text-xs">
          <div className="text-slate-400 mb-2">Aplicar resultado ({resultadoBasica.resultado}) diretamente em:</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onUsarResultadoBasico('piso_largura', resultadoBasica.resultado!)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium transition-colors whitespace-nowrap shrink-0"
            >
              Largura do Piso
            </button>
            <button
              type="button"
              onClick={() => onUsarResultadoBasico('pintura_largura', resultadoBasica.resultado!)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium transition-colors whitespace-nowrap shrink-0"
            >
              Parede (Pintura)
            </button>
            <button
              type="button"
              onClick={() => onUsarResultadoBasico('btu_area', resultadoBasica.resultado!)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition-colors whitespace-nowrap shrink-0"
            >
              Área BTU (m²)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
