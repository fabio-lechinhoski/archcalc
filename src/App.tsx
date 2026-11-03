import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  PaintBucket,
  Wind,
  Calculator,
  Plus,
  Trash2,
  Download,
  FileDown,
  RotateCcw,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import {
  TipoCalculo,
  IncidenciaSolar,
  OperadorBasico,
  calcularPiso,
  calcularPintura,
  calcularBTU,
  calcularOperacaoBasica,
  validarInputPiso,
  validarInputPintura,
  validarInputBTU,
  ItemMemorial,
} from './utils/calculators';
import { exportarMemorialParaPDF } from './utils/pdfMemorial';
import { CODIGO_CLI_COMPLETO } from './utils/pythonTemplates';
import { BlueprintVisualizer } from './components/BlueprintVisualizer';

const MEMORIAL_INICIAL: ItemMemorial[] = [
  {
    id: 'seed-1',
    categoria: 'piso',
    ambiente: 'Living Integrado (Porcelanato 90x90)',
    resumoTecnico: '4.50m × 6.00m · Margem recorte +10% (Paginação Reta)',
    valorPrincipal: '29.70 m² (15 caixas)',
    detalheSecundario: 'Área líquida: 27.00 m² · Compra fechada: 30.00 m²',
    codigoPythonGerado: 'Porcelanato Retificado · Caixa 2,00 m²',
    criadoEm: 'Projeto Base',
  },
  {
    id: 'seed-2',
    categoria: 'pintura',
    ambiente: 'Suíte Master (Acrílico Fosco)',
    resumoTecnico: 'Parede 14.0m × 2.80m · Vãos: 4.20 m² · 2 demãos',
    valorPrincipal: '7.70 L (3× Galão 3,6L)',
    detalheSecundario: 'Área líquida: 35.00 m² · Rendimento: 10 m²/L',
    codigoPythonGerado: 'Tinta Acrílica Premium · Reserva +10%',
    criadoEm: 'Projeto Base',
  },
  {
    id: 'seed-3',
    categoria: 'btu',
    ambiente: 'Home Office (Face Oeste)',
    resumoTecnico: '15.0 m² · Sol da Tarde (800 BTU/m²) · 2 pessoas · 2 eletrônicos',
    valorPrincipal: '15.000 BTU/h → 18.000 BTU/h',
    detalheSecundario: 'Split Hi-Wall Inverter Residencial',
    codigoPythonGerado: 'Climatização Residencial · Ciclo Frio/Quente',
    criadoEm: 'Projeto Base',
  },
];

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('archicalc-theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('archicalc-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('archicalc-theme', 'light');
    }
  }, [darkMode]);

  const [tipoAtivo, setTipoAtivo] = useState<TipoCalculo>('piso');
  const [nomeAmbiente, setNomeAmbiente] = useState<string>('Sala de Estar Principal');

  // 1. Estado: Piso e Revestimento
  const [larguraPiso, setLarguraPiso] = useState<string>('4.5');
  const [comprimentoPiso, setComprimentoPiso] = useState<string>('6.0');
  const [margemRecorte, setMargemRecorte] = useState<string>('10');
  const [areaCaixaPiso, setAreaCaixaPiso] = useState<string>('2.0');
  const [precoM2Piso] = useState<string>('89.90');

  // 2. Estado: Pintura de Paredes
  const [larguraParede, setLarguraParede] = useState<string>('12.0');
  const [alturaParede, setAlturaParede] = useState<string>('2.8');
  const [areaAberturas, setAreaAberturas] = useState<string>('3.6');
  const [numeroDemaos, setNumeroDemaos] = useState<string>('2');
  const [rendimentoTinta, setRendimentoTinta] = useState<string>('10.0');

  // 3. Estado: Ar-Condicionado (BTUs)
  const [areaAmbienteBTU, setAreaAmbienteBTU] = useState<string>('18.0');
  const [incidenciaSolar, setIncidenciaSolar] = useState<IncidenciaSolar>('tarde');
  const [numeroPessoas, setNumeroPessoas] = useState<string>('2');
  const [numeroEletronicos, setNumeroEletronicos] = useState<string>('2');

  // 4. Estado: Calculadora Matemática Básica
  const [valorA, setValorA] = useState<string>('29.7');
  const [valorB, setValorB] = useState<string>('2.0');
  const [operadorBasico, setOperadorBasico] = useState<OperadorBasico>('/');

  // 5. Estado: Memorial de Cálculo e Filtros
  const [itensMemorial, setItensMemorial] = useState<ItemMemorial[]>(MEMORIAL_INICIAL);
  const [filtroMemorial, setFiltroMemorial] = useState<'todos' | TipoCalculo>('todos');
  const [mensagemFeedback, setMensagemFeedback] = useState<string | null>(null);
  const [mensagemExportacaoPDF, setMensagemExportacaoPDF] = useState<string | null>(null);

  const inputPisoObj = useMemo(
    () => ({
      largura: Number(larguraPiso),
      comprimento: Number(comprimentoPiso),
      margemRecortePercent: Number(margemRecorte),
      areaPorCaixa: Number(areaCaixaPiso),
      precoPorM2: Number(precoM2Piso),
    }),
    [larguraPiso, comprimentoPiso, margemRecorte, areaCaixaPiso, precoM2Piso]
  );

  const erroPiso = useMemo(() => validarInputPiso(inputPisoObj), [inputPisoObj]);

  const resultadoPiso = useMemo(() => {
    if (erroPiso) {
      return calcularPiso({
        largura: 4.5,
        comprimento: 6.0,
        margemRecortePercent: 10,
        areaPorCaixa: 2.0,
        precoPorM2: 89.9,
      });
    }
    return calcularPiso(inputPisoObj);
  }, [inputPisoObj, erroPiso]);

  const inputPinturaObj = useMemo(
    () => ({
      larguraParede: Number(larguraParede),
      alturaParede: Number(alturaParede),
      areaAberturas: Number(areaAberturas),
      numeroDemaos: Number(numeroDemaos),
      rendimentoPorLitro: Number(rendimentoTinta),
    }),
    [larguraParede, alturaParede, areaAberturas, numeroDemaos, rendimentoTinta]
  );

  const erroPintura = useMemo(() => validarInputPintura(inputPinturaObj), [inputPinturaObj]);

  const resultadoPintura = useMemo(() => {
    if (erroPintura) {
      return calcularPintura({
        larguraParede: 12.0,
        alturaParede: 2.8,
        areaAberturas: 3.6,
        numeroDemaos: 2,
        rendimentoPorLitro: 10.0,
      });
    }
    return calcularPintura(inputPinturaObj);
  }, [inputPinturaObj, erroPintura]);

  const inputBTUObj = useMemo(
    () => ({
      areaAmbiente: Number(areaAmbienteBTU),
      incidenciaSolar,
      numeroPessoas: Number(numeroPessoas),
      numeroEletronicos: Number(numeroEletronicos),
    }),
    [areaAmbienteBTU, incidenciaSolar, numeroPessoas, numeroEletronicos]
  );

  const erroBTU = useMemo(() => validarInputBTU(inputBTUObj), [inputBTUObj]);

  const resultadoBTU = useMemo(() => {
    if (erroBTU) {
      return calcularBTU({
        areaAmbiente: 18.0,
        incidenciaSolar: 'tarde',
        numeroPessoas: 2,
        numeroEletronicos: 2,
      });
    }
    return calcularBTU(inputBTUObj);
  }, [inputBTUObj, erroBTU]);

  const inputBasicaObj = useMemo(
    () => ({
      valorA: Number(valorA),
      valorB: Number(valorB),
      operador: operadorBasico,
    }),
    [valorA, valorB, operadorBasico]
  );

  const resultadoBasica = useMemo(() => calcularOperacaoBasica(inputBasicaObj), [inputBasicaObj]);

  const baixarArquivoPython = (nomeArquivo: string, conteudo: string) => {
    const blob = new Blob([conteudo], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const adicionarAoMemorial = () => {
    const ambienteLimpo = nomeAmbiente.trim() || 'Ambiente sem nome';

    if (tipoAtivo === 'piso' && erroPiso) return;
    if (tipoAtivo === 'pintura' && erroPintura) return;
    if (tipoAtivo === 'btu' && erroBTU) return;
    if (tipoAtivo === 'basica' && resultadoBasica.erro) return;

    let novoItem: ItemMemorial;
    const id = `item-${Date.now()}`;

    if (tipoAtivo === 'piso') {
      novoItem = {
        id,
        categoria: 'piso',
        ambiente: ambienteLimpo,
        resumoTecnico: `${resultadoPiso.largura}m × ${resultadoPiso.comprimento}m · Margem +${resultadoPiso.margemRecortePercent}%`,
        valorPrincipal: `${resultadoPiso.areaComRecorte.toFixed(2)} m² (${resultadoPiso.caixasNecessarias} caixas)`,
        detalheSecundario: `Líquida: ${resultadoPiso.areaLiquida.toFixed(2)} m² · R$ ${resultadoPiso.custoEstimado.toFixed(2)}`,
        codigoPythonGerado: `Caixa ${resultadoPiso.areaPorCaixa} m² · Compra: ${resultadoPiso.areaTotalComprada.toFixed(2)} m²`,
        criadoEm: 'Agora',
      };
    } else if (tipoAtivo === 'pintura') {
      novoItem = {
        id,
        categoria: 'pintura',
        ambiente: ambienteLimpo,
        resumoTecnico: `Parede ${larguraParede}m × ${alturaParede}m · Vãos: ${areaAberturas} m² · ${numeroDemaos} demãos`,
        valorPrincipal: `${resultadoPintura.litrosComMargem.toFixed(2)} L (${resultadoPintura.latas18L}× 18L + ${resultadoPintura.galoes3_6L}× 3,6L)`,
        detalheSecundario: `Área líquida: ${resultadoPintura.areaLiquida.toFixed(2)} m²`,
        codigoPythonGerado: `Rendimento ${rendimentoTinta} m²/L · Reserva +10%`,
        criadoEm: 'Agora',
      };
    } else if (tipoAtivo === 'btu') {
      novoItem = {
        id,
        categoria: 'btu',
        ambiente: ambienteLimpo,
        resumoTecnico: `${resultadoBTU.areaAmbiente} m² · Sol da ${resultadoBTU.incidenciaSolar === 'tarde' ? 'Tarde' : 'Manhã'} · ${numeroPessoas} pess.`,
        valorPrincipal: `${resultadoBTU.btuTotal.toLocaleString('pt-BR')} BTU/h → ${resultadoBTU.capacidadeComercial.toLocaleString('pt-BR')} BTU/h`,
        detalheSecundario: resultadoBTU.classificacaoCiclo,
        codigoPythonGerado: `Fator ${resultadoBTU.fatorPorM2} BTU/m² · ${numeroEletronicos} eletrônico(s)`,
        criadoEm: 'Agora',
      };
    } else {
      novoItem = {
        id,
        categoria: 'basica',
        ambiente: `${ambienteLimpo} (Cálculo Auxiliar)`,
        resumoTecnico: `Operação: ${resultadoBasica.expressaoPython}`,
        valorPrincipal: `= ${resultadoBasica.resultado}`,
        detalheSecundario: 'Memória de cálculo auxiliar',
        codigoPythonGerado: `${resultadoBasica.expressaoPython} = ${resultadoBasica.resultado}`,
        criadoEm: 'Agora',
      };
    }

    setItensMemorial((prev) => [novoItem, ...prev]);
    setMensagemFeedback(`"${ambienteLimpo}" adicionado ao Memorial de Cálculo.`);
    setTimeout(() => setMensagemFeedback(null), 3000);
  };

  const usarResultadoBasicoEmModulo = (
    destino: 'piso_largura' | 'pintura_largura' | 'btu_area',
    valor: number
  ) => {
    const formatado = String(Number(valor.toFixed(2)));
    if (destino === 'piso_largura') {
      setLarguraPiso(formatado);
      setTipoAtivo('piso');
    } else if (destino === 'pintura_largura') {
      setLarguraParede(formatado);
      setTipoAtivo('pintura');
    } else if (destino === 'btu_area') {
      setAreaAmbienteBTU(formatado);
      setTipoAtivo('btu');
    }
  };

  const itensFiltrados = useMemo(() => {
    if (filtroMemorial === 'todos') return itensMemorial;
    return itensMemorial.filter((item) => item.categoria === filtroMemorial);
  }, [itensMemorial, filtroMemorial]);

  const exportarPDFMemorial = () => {
    if (itensFiltrados.length === 0) return;
    const nomeArquivo = exportarMemorialParaPDF(itensFiltrados, {
      filtroAtivo: filtroMemorial,
    });
    setMensagemExportacaoPDF(
      `PDF gerado com sucesso: ${nomeArquivo} (${itensFiltrados.length} ${
        itensFiltrados.length === 1 ? 'item exportado' : 'itens exportados'
      }).`
    );
    setTimeout(() => setMensagemExportacaoPDF(null), 4000);
  };

  const erroModuloAtivo =
    tipoAtivo === 'piso'
      ? erroPiso
      : tipoAtivo === 'pintura'
      ? erroPintura
      : tipoAtivo === 'btu'
      ? erroBTU
      : resultadoBasica.erro;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)] transition-colors duration-150">
      {/* Top Bar Contract: 3 zonas */}
      <header className="sticky top-0 z-30 bg-[var(--bg-surface)]/95 backdrop-blur border-b border-[var(--border-subtle)] px-6 py-3.5 transition-colors duration-150">
        <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-8">
          <a
            href="#topo"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-display whitespace-nowrap shrink-0"
          >
            ArchiCalc
          </a>

          <nav
            aria-label="Navegação principal"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#bancada-calculo"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Calculadoras
            </a>
            <a
              href="#planta-visual"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Planta &amp; Esquema
            </a>
            <a
              href="#memorial-calculo"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Memorial de Cálculo
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => baixarArquivoPython('calculadora_interiores.py', CODIGO_CLI_COMPLETO)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar Script .PY
            </button>
          </div>
        </div>
      </header>

      <main id="topo" className="flex-1 max-w-[1380px] w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        <section id="bancada-calculo" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono text-sky-700 dark:text-sky-400">
                  DESIGN DE INTERIORES · QUANTITATIVOS E MEMORIAL DE PROJETO
                </span>
                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  aria-label={darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
                  className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {darkMode ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-slate-700" />
                      Modo Escuro
                    </>
                  )}
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
                Calculadora Técnica de Design de Interiores
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Dimensione <strong>revestimentos e pisos com margem de recorte</strong>, <strong>litros de tinta por parede</strong>, <strong>carga térmica em BTUs</strong> e realize <strong>operações matemáticas básicas</strong> para o seu projeto.
              </p>
            </div>

            {/* Seletor de Módulo Técnico (4 Calculadoras) */}
            <div
              className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-800/90 rounded-xl"
              role="tablist"
              aria-label="Selecione o módulo da calculadora"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tipoAtivo === 'piso'}
                onClick={() => {
                  setTipoAtivo('piso');
                  setNomeAmbiente('Sala de Estar Principal');
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  tipoAtivo === 'piso'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                01. Piso (m² &amp; Recorte)
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tipoAtivo === 'pintura'}
                onClick={() => {
                  setTipoAtivo('pintura');
                  setNomeAmbiente('Paredes da Suíte Master');
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  tipoAtivo === 'pintura'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PaintBucket className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                02. Pintura (Litros)
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tipoAtivo === 'btu'}
                onClick={() => {
                  setTipoAtivo('btu');
                  setNomeAmbiente('Home Office Climatizado');
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  tipoAtivo === 'btu'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wind className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                03. Ar-Condicionado (BTUs)
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tipoAtivo === 'basica'}
                onClick={() => {
                  setTipoAtivo('basica');
                  setNomeAmbiente('Cálculo Auxiliar de Obra');
                }}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  tipoAtivo === 'basica'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                04. Matemática Básica
              </button>
            </div>
          </div>

          {/* Grid Principal: Formulário Técnico (7 col) | Visualizador Arquitetônico (5 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-6 h-full flex flex-col justify-between transition-colors duration-150">
                <div className="space-y-6">
                  {/* Identificação do ambiente + Presets rápidos */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex-1">
                      <label
                        htmlFor="input-nome-ambiente"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
                      >
                        Identificação do Ambiente ou Etapa
                      </label>
                      <input
                        id="input-nome-ambiente"
                        type="text"
                        value={nomeAmbiente}
                        onChange={(e) => setNomeAmbiente(e.target.value)}
                        placeholder="Ex: Sala de Jantar, Suíte 01..."
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
                      />
                    </div>

                    {tipoAtivo === 'piso' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setNomeAmbiente('Living Reto (10% perda)');
                            setLarguraPiso('4.5');
                            setComprimentoPiso('6.0');
                            setMargemRecorte('10');
                            setAreaCaixaPiso('2.0');
                          }}
                          className="px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          Preset: Paginação Reta (10%)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNomeAmbiente('Varanda Diagonal (15% perda)');
                            setLarguraPiso('3.2');
                            setComprimentoPiso('5.5');
                            setMargemRecorte('15');
                            setAreaCaixaPiso('1.44');
                          }}
                          className="px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                        >
                          Preset: Diagonal (15%)
                        </button>
                      </div>
                    )}
                  </div>

                  {/* FORMULÁRIO 1: PISO E REVESTIMENTO */}
                  {tipoAtivo === 'piso' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label
                            htmlFor="piso-largura"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Largura (m)
                          </label>
                          <input
                            id="piso-largura"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={larguraPiso}
                            onChange={(e) => setLarguraPiso(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="piso-comprimento"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Comprimento (m)
                          </label>
                          <input
                            id="piso-comprimento"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={comprimentoPiso}
                            onChange={(e) => setComprimentoPiso(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="piso-margem"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Margem Recorte (%)
                          </label>
                          <select
                            id="piso-margem"
                            value={margemRecorte}
                            onChange={(e) => setMargemRecorte(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          >
                            <option value="5">5% (Mosaico)</option>
                            <option value="10">10% (Reta)</option>
                            <option value="15">15% (Diagonal)</option>
                            <option value="20">20% (Especial)</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="piso-caixa"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            m² por Caixa
                          </label>
                          <input
                            id="piso-caixa"
                            type="number"
                            step="0.01"
                            min="0.1"
                            value={areaCaixaPiso}
                            onChange={(e) => setAreaCaixaPiso(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Área Líquida</div>
                          <div
                            data-testid="kpi-piso-liquida"
                            className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums"
                          >
                            {resultadoPiso.areaLiquida.toFixed(2)} m²
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sem perdas</div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-sky-50/70 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800">
                          <div className="text-xs text-sky-900 dark:text-sky-300 font-medium">
                            Área c/ Recorte (+{resultadoPiso.margemRecortePercent}%)
                          </div>
                          <div
                            data-testid="kpi-piso-recorte"
                            className="text-lg font-bold font-mono text-sky-700 dark:text-sky-300 mt-1 tabular-nums"
                          >
                            {resultadoPiso.areaComRecorte.toFixed(2)} m²
                          </div>
                          <div className="text-xs text-sky-700 dark:text-sky-400 mt-0.5">
                            +{resultadoPiso.areaPerda.toFixed(2)} m² reserva
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white border border-slate-900 dark:border-slate-700">
                          <div className="text-xs text-slate-300">Total de Caixas</div>
                          <div
                            data-testid="kpi-piso-caixas"
                            className="text-lg font-bold font-mono text-amber-400 mt-1 tabular-nums"
                          >
                            {resultadoPiso.caixasNecessarias} cx
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">
                            ({resultadoPiso.areaTotalComprada.toFixed(2)} m² reais)
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Orçamento Estimado</div>
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                            R$ {resultadoPiso.custoEstimado.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Base R$ {Number(precoM2Piso || 89.9).toFixed(2)}/m²
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORMULÁRIO 2: PINTURA DE PAREDES */}
                  {tipoAtivo === 'pintura' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
                        <div>
                          <label
                            htmlFor="pintura-largura"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Paredes (m linear)
                          </label>
                          <input
                            id="pintura-largura"
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={larguraParede}
                            onChange={(e) => setLarguraParede(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="pintura-altura"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Pé-direito (m)
                          </label>
                          <input
                            id="pintura-altura"
                            type="number"
                            step="0.05"
                            min="0.5"
                            value={alturaParede}
                            onChange={(e) => setAlturaParede(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="pintura-aberturas"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Vãos/Portas (m²)
                          </label>
                          <input
                            id="pintura-aberturas"
                            type="number"
                            step="0.1"
                            min="0"
                            value={areaAberturas}
                            onChange={(e) => setAreaAberturas(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="pintura-demaos"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Nº de Demãos
                          </label>
                          <select
                            id="pintura-demaos"
                            value={numeroDemaos}
                            onChange={(e) => setNumeroDemaos(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          >
                            <option value="1">1 demão</option>
                            <option value="2">2 demãos</option>
                            <option value="3">3 demãos</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="pintura-rendimento"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Rendimento (m²/L)
                          </label>
                          <input
                            id="pintura-rendimento"
                            type="number"
                            step="0.5"
                            min="1"
                            value={rendimentoTinta}
                            onChange={(e) => setRendimentoTinta(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Área Pintável</div>
                          <div
                            data-testid="kpi-pintura-liquida"
                            className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums"
                          >
                            {resultadoPintura.areaLiquida.toFixed(2)} m²
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Bruta: {resultadoPintura.areaBruta.toFixed(2)} m²
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Litros Exatos</div>
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                            {resultadoPintura.litrosExatos.toFixed(2)} L
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Total {resultadoPintura.areaTotalPintura.toFixed(1)} m² ({resultadoPintura.numeroDemaos}x)
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800">
                          <div className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">Litros + 10% Reserva</div>
                          <div
                            data-testid="kpi-pintura-litros"
                            className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1 tabular-nums"
                          >
                            {resultadoPintura.litrosComMargem.toFixed(2)} L
                          </div>
                          <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">P/ perdas de rolo</div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white border border-slate-900 dark:border-slate-700">
                          <div className="text-xs text-slate-300">Compra Sugerida</div>
                          <div
                            data-testid="kpi-pintura-embalagens"
                            className="text-base font-bold font-mono text-emerald-400 mt-1 tabular-nums"
                          >
                            {resultadoPintura.latas18L}×18L + {resultadoPintura.galoes3_6L}×3,6L
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">
                            Total: {resultadoPintura.totalLitrosRecomendados} L
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORMULÁRIO 3: AR-CONDICIONADO (BTUs) */}
                  {tipoAtivo === 'btu' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label
                            htmlFor="btu-area"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Área do Ambiente (m²)
                          </label>
                          <input
                            id="btu-area"
                            type="number"
                            step="0.5"
                            min="1"
                            value={areaAmbienteBTU}
                            onChange={(e) => setAreaAmbienteBTU(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="btu-sol"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Incidência Solar
                          </label>
                          <select
                            id="btu-sol"
                            value={incidenciaSolar}
                            onChange={(e) => setIncidenciaSolar(e.target.value as IncidenciaSolar)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
                          >
                            <option value="manha">Sol da Manhã (600)</option>
                            <option value="tarde">Sol da Tarde (800)</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="btu-pessoas"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Nº de Pessoas
                          </label>
                          <input
                            id="btu-pessoas"
                            type="number"
                            step="1"
                            min="1"
                            value={numeroPessoas}
                            onChange={(e) => setNumeroPessoas(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="btu-eletronicos"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Fontes de Calor / Eletrônicos
                          </label>
                          <input
                            id="btu-eletronicos"
                            type="number"
                            step="1"
                            min="0"
                            value={numeroEletronicos}
                            onChange={(e) => setNumeroEletronicos(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Carga da Área</div>
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                            {resultadoBTU.btuArea.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {resultadoBTU.fatorPorM2} BTU × {resultadoBTU.areaAmbiente} m²
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                          <div className="text-xs text-slate-500 dark:text-slate-400">Pessoas + Eletrônicos</div>
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                            +{(resultadoBTU.btuPessoas + resultadoBTU.btuEletronicos).toLocaleString('pt-BR')}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            +{resultadoBTU.pessoasAdicionais} pess. extra / {numeroEletronicos} eq.
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                          <div className="text-xs text-amber-900 dark:text-amber-300 font-medium">Carga Térmica Exata</div>
                          <div
                            data-testid="kpi-btu-total"
                            className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300 mt-1 tabular-nums"
                          >
                            {resultadoBTU.btuTotal.toLocaleString('pt-BR')} BTU
                          </div>
                          <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Demanda térmica</div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-slate-900 dark:bg-slate-950 text-white border border-slate-900 dark:border-slate-700">
                          <div className="text-xs text-slate-300">Potência Comercial</div>
                          <div
                            data-testid="kpi-btu-comercial"
                            className="text-lg font-bold font-mono text-sky-400 mt-1 tabular-nums"
                          >
                            {resultadoBTU.capacidadeComercial.toLocaleString('pt-BR')} BTU
                          </div>
                          <div className="text-xs text-slate-300 mt-0.5">Aparelho indicado</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORMULÁRIO 4: OPERAÇÕES MATEMÁTICAS BÁSICAS */}
                  {tipoAtivo === 'basica' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor="basica-valor-a"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Primeiro Número
                          </label>
                          <input
                            id="basica-valor-a"
                            type="number"
                            step="any"
                            value={valorA}
                            onChange={(e) => setValorA(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="basica-operador"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Operação Matemática
                          </label>
                          <select
                            id="basica-operador"
                            value={operadorBasico}
                            onChange={(e) => setOperadorBasico(e.target.value as OperadorBasico)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none"
                          >
                            <option value="+">+ (Adição / Soma)</option>
                            <option value="-">- (Subtração)</option>
                            <option value="*">* (Multiplicação)</option>
                            <option value="/">/ (Divisão Real)</option>
                            <option value="//">// (Divisão Inteira)</option>
                            <option value="%">% (Resto da Divisão)</option>
                            <option value="**">** (Potenciação)</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="basica-valor-b"
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1"
                          >
                            Segundo Número
                          </label>
                          <input
                            id="basica-valor-b"
                            type="number"
                            step="any"
                            value={valorB}
                            onChange={(e) => setValorB(e.target.value)}
                            className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-sky-600 dark:focus:border-sky-400 focus:outline-none tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(['+', '-', '*', '/', '//', '%', '**'] as OperadorBasico[]).map((op) => (
                            <button
                              key={op}
                              type="button"
                              onClick={() => setOperadorBasico(op)}
                              className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg border transition-colors ${
                                operadorBasico === op
                                  ? 'bg-slate-900 dark:bg-sky-600 text-white border-slate-900 dark:border-sky-600'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              {op}
                            </button>
                          ))}
                        </div>

                        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Resultado:</span>
                          <span
                            data-testid="kpi-basica-resultado"
                            className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums"
                          >
                            {resultadoBasica.erro ? 'Erro' : resultadoBasica.resultado}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {erroModuloAtivo && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Atenção nos dados informados: </span>
                        <span>{erroModuloAtivo}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de Ação: Salvar no Memorial */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {mensagemFeedback ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">{mensagemFeedback}</span>
                    ) : (
                      <span>Salve este cálculo no memorial abaixo para compor o orçamento do projeto.</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(erroModuloAtivo)}
                    onClick={adicionarAoMemorial}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar ao Memorial de Cálculo
                  </button>
                </div>
              </div>
            </div>

            {/* ZONA DIREITA (5 colunas): Planta e Esquema Visual */}
            <div id="planta-visual" className="lg:col-span-5">
              <BlueprintVisualizer
                tipoAtivo={tipoAtivo}
                resultadoPiso={resultadoPiso}
                resultadoPintura={resultadoPintura}
                resultadoBTU={resultadoBTU}
                resultadoBasica={resultadoBasica}
                onUsarResultadoBasico={usarResultadoBasicoEmModulo}
              />
            </div>
          </div>
        </section>

        {/* Seção: Memorial de Cálculo do Projeto */}
        <section
          id="memorial-calculo"
          className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-6 space-y-5 transition-colors duration-150"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                MEMORIAL DESCRITIVO · QUANTITATIVOS DE DESIGN DE INTERIORES
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Memorial de Cálculo de Interiores ({itensFiltrados.length})
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {(
                  [
                    { id: 'todos', label: 'Todos' },
                    { id: 'piso', label: 'Piso' },
                    { id: 'pintura', label: 'Pintura' },
                    { id: 'btu', label: 'BTUs' },
                    { id: 'basica', label: 'Matemática' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFiltroMemorial(f.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      filtroMemorial === f.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {itensMemorial.length > 0 && (
                <button
                  type="button"
                  onClick={() => setItensMemorial([])}
                  className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Limpar Tudo
                </button>
              )}

              <button
                type="button"
                data-testid="btn-exportar-pdf"
                disabled={itensFiltrados.length === 0}
                onClick={exportarPDFMemorial}
                title={
                  itensFiltrados.length === 0
                    ? 'Adicione ao menos um cálculo para exportar em PDF'
                    : 'Exportar os cálculos exibidos no memorial descritivo em PDF'
                }
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <FileDown className="w-3.5 h-3.5" />
                Exportar PDF
              </button>
            </div>
          </div>

          {mensagemExportacaoPDF && (
            <div
              role="status"
              data-testid="feedback-exportacao-pdf"
              className="px-3.5 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center justify-between"
            >
              <span>{mensagemExportacaoPDF}</span>
            </div>
          )}

          {itensFiltrados.length === 0 ? (
            <div className="py-10 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Nenhum cálculo registrado neste filtro do memorial.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Utilize o botão &ldquo;Adicionar ao Memorial de Cálculo&rdquo; acima ou restaure os exemplos iniciais para comparar ambientes.
              </p>
              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFiltroMemorial('todos');
                    setItensMemorial(MEMORIAL_INICIAL);
                  }}
                  className="px-3.5 py-2 bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Exemplos Base
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3 pr-4">Ambiente / Categoria</th>
                    <th className="py-3 px-4">Parâmetros Técnicos</th>
                    <th className="py-3 px-4">Especificação Complementar</th>
                    <th className="py-3 px-4 text-right">Resultado Quantitativo</th>
                    <th className="py-3 pl-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  {itensFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.ambiente}</div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.categoria.toUpperCase()} · {item.criadoEm}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div>{item.resumoTecnico}</div>
                        <div className="text-slate-400 dark:text-slate-400 mt-0.5">{item.detalheSecundario}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {item.codigoPythonGerado}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                        {item.valorPrincipal}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          type="button"
                          aria-label={`Remover ${item.ambiente}`}
                          onClick={() =>
                            setItensMemorial((prev) => prev.filter((i) => i.id !== item.id))
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 px-6 mt-12 transition-colors duration-150">
        <div className="max-w-[1380px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            ArchiCalc — Calculadora Técnica de Design de Interiores
          </div>
          <div className="flex items-center gap-3">
            <span>Piso &amp; Paginação</span>
            <span aria-hidden="true">·</span>
            <span>Pintura (Litros &amp; Latas)</span>
            <span aria-hidden="true">·</span>
            <span>Climatização (BTU/h)</span>
            <span aria-hidden="true">·</span>
            <span>Calculadora Auxiliar</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
