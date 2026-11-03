export type TipoCalculo = 'piso' | 'pintura' | 'btu' | 'basica';

export type IncidenciaSolar = 'manha' | 'tarde';

export type OperadorBasico = '+' | '-' | '*' | '/' | '**' | '//' | '%';

export interface InputPiso {
  largura: number;
  comprimento: number;
  margemRecortePercent: number;
  areaPorCaixa: number;
  precoPorM2?: number;
}

export interface ResultadoPiso {
  largura: number;
  comprimento: number;
  areaLiquida: number;
  margemRecortePercent: number;
  fatorSeguranca: number;
  areaPerda: number;
  areaComRecorte: number;
  areaPorCaixa: number;
  caixasNecessarias: number;
  areaTotalComprada: number;
  custoEstimado: number;
}

export interface InputPintura {
  larguraParede: number;
  alturaParede: number;
  areaAberturas: number;
  numeroDemaos: number;
  rendimentoPorLitro: number;
}

export interface ResultadoPintura {
  areaBruta: number;
  areaAberturas: number;
  areaLiquida: number;
  numeroDemaos: number;
  areaTotalPintura: number;
  rendimentoPorLitro: number;
  litrosExatos: number;
  litrosComMargem: number;
  latas18L: number;
  galoes3_6L: number;
  totalLitrosRecomendados: number;
}

export interface InputBTU {
  areaAmbiente: number;
  incidenciaSolar: IncidenciaSolar;
  numeroPessoas: number;
  numeroEletronicos: number;
}

export interface ResultadoBTU {
  areaAmbiente: number;
  incidenciaSolar: IncidenciaSolar;
  fatorPorM2: number;
  btuArea: number;
  pessoasAdicionais: number;
  btuPessoas: number;
  btuEletronicos: number;
  btuTotal: number;
  capacidadeComercial: number;
  classificacaoCiclo: string;
}

export interface InputOperacaoBasica {
  valorA: number;
  valorB: number;
  operador: OperadorBasico;
}

export interface ResultadoOperacaoBasica {
  valorA: number;
  valorB: number;
  operador: OperadorBasico;
  resultado: number | null;
  erro: string | null;
  expressaoPython: string;
  tipoRetornoPython: string;
  explicacaoOperador: string;
}

export interface ItemMemorial {
  id: string;
  categoria: TipoCalculo;
  ambiente: string;
  resumoTecnico: string;
  valorPrincipal: string;
  detalheSecundario: string;
  codigoPythonGerado: string;
  criadoEm: string;
}

function arredondar(valor: number, casas: number = 2): number {
  const fator = Math.pow(10, casas);
  return Math.round((valor + Number.EPSILON) * fator) / fator;
}

export function validarInputPiso(input: InputPiso): string | null {
  if (!Number.isFinite(input.largura) || input.largura <= 0) {
    return 'A largura do ambiente deve ser maior que zero.';
  }
  if (!Number.isFinite(input.comprimento) || input.comprimento <= 0) {
    return 'O comprimento do ambiente deve ser maior que zero.';
  }
  if (!Number.isFinite(input.margemRecortePercent) || input.margemRecortePercent < 0 || input.margemRecortePercent > 50) {
    return 'A margem de recorte deve estar entre 0% e 50%.';
  }
  if (!Number.isFinite(input.areaPorCaixa) || input.areaPorCaixa <= 0) {
    return 'A metragem por caixa deve ser maior que zero.';
  }
  return null;
}

export function calcularPiso(input: InputPiso): ResultadoPiso {
  const erro = validarInputPiso(input);
  if (erro) {
    throw new Error(erro);
  }

  const areaLiquida = arredondar(input.largura * input.comprimento, 2);
  const fatorSeguranca = arredondar(1 + input.margemRecortePercent / 100, 4);
  const areaComRecorte = arredondar(areaLiquida * fatorSeguranca, 2);
  const areaPerda = arredondar(areaComRecorte - areaLiquida, 2);
  const caixasNecessarias = Math.ceil(areaComRecorte / input.areaPorCaixa);
  const areaTotalComprada = arredondar(caixasNecessarias * input.areaPorCaixa, 2);
  const precoM2 = input.precoPorM2 !== undefined && input.precoPorM2 >= 0 ? input.precoPorM2 : 89.9;
  const custoEstimado = arredondar(areaTotalComprada * precoM2, 2);

  return {
    largura: input.largura,
    comprimento: input.comprimento,
    areaLiquida,
    margemRecortePercent: input.margemRecortePercent,
    fatorSeguranca,
    areaPerda,
    areaComRecorte,
    areaPorCaixa: input.areaPorCaixa,
    caixasNecessarias,
    areaTotalComprada,
    custoEstimado,
  };
}

export function validarInputPintura(input: InputPintura): string | null {
  if (!Number.isFinite(input.larguraParede) || input.larguraParede <= 0) {
    return 'O comprimento total das paredes deve ser maior que zero.';
  }
  if (!Number.isFinite(input.alturaParede) || input.alturaParede <= 0) {
    return 'O pé-direito (altura) deve ser maior que zero.';
  }
  const areaBruta = input.larguraParede * input.alturaParede;
  if (!Number.isFinite(input.areaAberturas) || input.areaAberturas < 0) {
    return 'A área de portas e janelas não pode ser negativa.';
  }
  if (input.areaAberturas >= areaBruta) {
    return 'A área de aberturas (portas/janelas) não pode ser maior ou igual à área total da parede.';
  }
  if (!Number.isFinite(input.numeroDemaos) || input.numeroDemaos < 1 || !Number.isInteger(input.numeroDemaos)) {
    return 'O número de demãos deve ser um inteiro maior ou igual a 1.';
  }
  if (!Number.isFinite(input.rendimentoPorLitro) || input.rendimentoPorLitro <= 0) {
    return 'O rendimento da tinta (m²/L) deve ser maior que zero.';
  }
  return null;
}

export function calcularPintura(input: InputPintura): ResultadoPintura {
  const erro = validarInputPintura(input);
  if (erro) {
    throw new Error(erro);
  }

  const areaBruta = arredondar(input.larguraParede * input.alturaParede, 2);
  const areaLiquida = arredondar(areaBruta - input.areaAberturas, 2);
  const areaTotalPintura = arredondar(areaLiquida * input.numeroDemaos, 2);
  const litrosExatos = arredondar(areaTotalPintura / input.rendimentoPorLitro, 2);
  // Margem técnica de 10% para retoques e perdas no rolo/bandeja
  const litrosComMargem = arredondar(litrosExatos * 1.1, 2);

  // Otimização comercial: Latas de 18L e Galões de 3.6L
  const latas18L = Math.floor(litrosComMargem / 18);
  const restanteLitros = litrosComMargem - latas18L * 18;
  const galoes3_6L = restanteLitros > 0 ? Math.ceil(restanteLitros / 3.6) : 0;

  // Se 5 galões de 3.6L (18L) forem sugeridos, compensa 1 lata de 18L
  let latasFinais = latas18L;
  let galoesFinais = galoes3_6L;
  if (galoesFinais >= 5) {
    latasFinais += 1;
    galoesFinais = 0;
  }

  const totalLitrosRecomendados = arredondar(latasFinais * 18 + galoesFinais * 3.6, 1);

  return {
    areaBruta,
    areaAberturas: input.areaAberturas,
    areaLiquida,
    numeroDemaos: input.numeroDemaos,
    areaTotalPintura,
    rendimentoPorLitro: input.rendimentoPorLitro,
    litrosExatos,
    litrosComMargem,
    latas18L: latasFinais,
    galoes3_6L: galoesFinais,
    totalLitrosRecomendados,
  };
}

const CAPACIDADES_COMERCIAIS_BTU = [7000, 9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

export function validarInputBTU(input: InputBTU): string | null {
  if (!Number.isFinite(input.areaAmbiente) || input.areaAmbiente <= 0) {
    return 'A área do ambiente deve ser maior que zero.';
  }
  if (!Number.isFinite(input.numeroPessoas) || input.numeroPessoas < 1 || !Number.isInteger(input.numeroPessoas)) {
    return 'O número de pessoas deve ser um inteiro maior ou igual a 1.';
  }
  if (!Number.isFinite(input.numeroEletronicos) || input.numeroEletronicos < 0 || !Number.isInteger(input.numeroEletronicos)) {
    return 'O número de equipamentos eletrônicos deve ser um inteiro maior ou igual a zero.';
  }
  return null;
}

export function calcularBTU(input: InputBTU): ResultadoBTU {
  const erro = validarInputBTU(input);
  if (erro) {
    throw new Error(erro);
  }

  const fatorPorM2 = input.incidenciaSolar === 'tarde' ? 800 : 600;
  const btuArea = Math.round(input.areaAmbiente * fatorPorM2);
  // A primeira pessoa já é contemplada na carga térmica base do ambiente
  const pessoasAdicionais = Math.max(0, input.numeroPessoas - 1);
  const btuPessoas = pessoasAdicionais * 600;
  const btuEletronicos = input.numeroEletronicos * 600;
  const btuTotal = btuArea + btuPessoas + btuEletronicos;

  const capacidadeComercial =
    CAPACIDADES_COMERCIAIS_BTU.find((cap) => cap >= btuTotal) ||
    Math.ceil(btuTotal / 6000) * 6000;

  let classificacaoCiclo = 'Split Hi-Wall Inverter Residencial';
  if (capacidadeComercial >= 24000 && capacidadeComercial <= 30000) {
    classificacaoCiclo = 'Split Hi-Wall / Cassete de Médio Porte';
  } else if (capacidadeComercial > 30000) {
    classificacaoCiclo = 'Split Piso-Teto / Cassete Comercial';
  }

  return {
    areaAmbiente: input.areaAmbiente,
    incidenciaSolar: input.incidenciaSolar,
    fatorPorM2,
    btuArea,
    pessoasAdicionais,
    btuPessoas,
    btuEletronicos,
    btuTotal,
    capacidadeComercial,
    classificacaoCiclo,
  };
}

export function calcularOperacaoBasica(input: InputOperacaoBasica): ResultadoOperacaoBasica {
  const { valorA, valorB, operador } = input;
  const expressaoPython = `${valorA} ${operador} ${valorB}`;

  if (!Number.isFinite(valorA) || !Number.isFinite(valorB)) {
    return {
      valorA,
      valorB,
      operador,
      resultado: null,
      erro: 'ValueError: Os operandos devem ser números válidos (int ou float).',
      expressaoPython,
      tipoRetornoPython: 'None',
      explicacaoOperador: 'Em Python, entradas de texto (str) precisam ser convertidas via float() antes do cálculo.',
    };
  }

  if ((operador === '/' || operador === '//' || operador === '%') && valorB === 0) {
    return {
      valorA,
      valorB,
      operador,
      resultado: null,
      erro: 'ZeroDivisionError: division by zero — Não é possível dividir por zero.',
      expressaoPython,
      tipoRetornoPython: 'ZeroDivisionError',
      explicacaoOperador:
        'Em Python, dividir qualquer número por 0 lança a exceção ZeroDivisionError. Usamos blocos try/except ou validação if b == 0 para proteger o programa.',
    };
  }

  let resultadoBruto = 0;
  let explicacaoOperador = '';

  switch (operador) {
    case '+':
      resultadoBruto = valorA + valorB;
      explicacaoOperador = 'Adição (+): Soma dois valores numéricos. Útil para somar metragens de múltiplos ambientes.';
      break;
    case '-':
      resultadoBruto = valorA - valorB;
      explicacaoOperador = 'Subtração (-): Desconta vãos (portas, janelas ou shafts) da área bruta.';
      break;
    case '*':
      resultadoBruto = valorA * valorB;
      explicacaoOperador = 'Multiplicação (*): Base do cálculo de área (largura * comprimento) e fatores de segurança.';
      break;
    case '/':
      resultadoBruto = valorA / valorB;
      explicacaoOperador = 'Divisão Real (/): No Python 3, o operador / sempre retorna um float (número com casas decimais), mesmo dividindo dois inteiros (ex: 10 / 2 retorna 5.0).';
      break;
    case '**':
      resultadoBruto = Math.pow(valorA, valorB);
      explicacaoOperador = 'Potenciação (**): Em Python usa-se ** (e não ^) para elevar um número a uma potência (ex: lado ** 2 para área de um quadrado).';
      break;
    case '//':
      resultadoBruto = Math.floor(valorA / valorB);
      explicacaoOperador = 'Divisão Inteira (//): Descarta a parte fracionária (piso da divisão). Muito usada para descobrir quantas latas inteiras de 18L cabem na litragem total.';
      break;
    case '%':
      resultadoBruto = ((valorA % valorB) + valorB) % valorB;
      explicacaoOperador = 'Módulo / Resto (%): Retorna o que sobra da divisão inteira. Exemplo: 22 litros % 18L = 4 litros restantes para completar com galões de 3,6L.';
      break;
  }

  const resultado = arredondar(resultadoBruto, 4);
  const ehInteiro = Number.isInteger(valorA) && Number.isInteger(valorB) && operador !== '/';
  const tipoRetornoPython = ehInteiro ? 'int' : 'float';

  return {
    valorA,
    valorB,
    operador,
    resultado,
    erro: null,
    expressaoPython,
    tipoRetornoPython,
    explicacaoOperador,
  };
}
