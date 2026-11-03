import { ItemMemorial, TipoCalculo } from './calculators';

export interface OpcoesExportacaoPDF {
  tituloProjeto?: string;
  filtroAtivo?: 'todos' | TipoCalculo;
  dataEmissao?: Date;
}

const MAPA_CP1252_EXTENDIDO: Record<number, number> = {
  0x20ac: 0x80, // €
  0x201a: 0x82, // ‚
  0x0192: 0x83, // ƒ
  0x201e: 0x84, // „
  0x2026: 0x85, // …
  0x2020: 0x86, // †
  0x2021: 0x87, // ‡
  0x02c6: 0x88, // ˆ
  0x2030: 0x89, // ‰
  0x0160: 0x8a, // Š
  0x2039: 0x8b, // ‹
  0x0152: 0x8c, // Œ
  0x017d: 0x8e, // Ž
  0x2018: 0x91, // ‘
  0x2019: 0x92, // ’
  0x201c: 0x93, // “
  0x201d: 0x94, // ”
  0x2022: 0x95, // •
  0x2013: 0x96, // –
  0x2014: 0x97, // —
  0x02dc: 0x98, // ˜
  0x2122: 0x99, // ™
  0x0161: 0x9a, // š
  0x203a: 0x9b, // ›
  0x0153: 0x9c, // œ
  0x017e: 0x9e, // ž
  0x0178: 0x9f, // Ÿ
};

/**
 * Converte uma string Unicode para literal PDF compatível com WinAnsiEncoding,
 * preservando caracteres ASCII legíveis e escapando acentos/símbolos em octal (\ddd).
 */
export function codificarTextoPDF(texto: string): string {
  const normalizado = String(texto ?? '')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/≈/g, '~')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/≠/g, '!=');

  let resultado = '';
  for (let i = 0; i < normalizado.length; i++) {
    const code = normalizado.charCodeAt(i);

    if (code === 0x5c) {
      resultado += '\\\\';
    } else if (code === 0x28) {
      resultado += '\\(';
    } else if (code === 0x29) {
      resultado += '\\)';
    } else if (code >= 0x20 && code <= 0x7e) {
      resultado += normalizado[i];
    } else if (code >= 0xa0 && code <= 0xff) {
      resultado += '\\' + code.toString(8).padStart(3, '0');
    } else if (MAPA_CP1252_EXTENDIDO[code] !== undefined) {
      resultado += '\\' + MAPA_CP1252_EXTENDIDO[code].toString(8).padStart(3, '0');
    } else {
      resultado += ' ';
    }
  }

  return resultado;
}

/**
 * Quebra um texto longo em múltiplas linhas respeitando o limite de caracteres por linha.
 */
export function quebrarTextoEmLinhas(texto: string, maxCaracteres: number): string[] {
  const limpo = String(texto ?? '').trim();
  if (!limpo) return [''];
  if (limpo.length <= maxCaracteres) return [limpo];

  const palavras = limpo.split(/\s+/);
  const linhas: string[] = [];
  let linhaAtual = '';

  for (const palavra of palavras) {
    if (!linhaAtual) {
      if (palavra.length > maxCaracteres) {
        linhas.push(palavra.slice(0, maxCaracteres));
        linhaAtual = palavra.slice(maxCaracteres);
      } else {
        linhaAtual = palavra;
      }
    } else if (linhaAtual.length + 1 + palavra.length <= maxCaracteres) {
      linhaAtual += ' ' + palavra;
    } else {
      linhas.push(linhaAtual);
      if (palavra.length > maxCaracteres) {
        linhas.push(palavra.slice(0, maxCaracteres));
        linhaAtual = palavra.slice(maxCaracteres);
      } else {
        linhaAtual = palavra;
      }
    }
  }

  if (linhaAtual) {
    linhas.push(linhaAtual);
  }

  return linhas;
}

function obterNomeCategoria(categoria: TipoCalculo): string {
  switch (categoria) {
    case 'piso':
      return 'PISO & REVESTIMENTO';
    case 'pintura':
      return 'PINTURA DE PAREDES';
    case 'btu':
      return 'CLIMATIZACAO (BTU/h)';
    case 'basica':
      return 'MATEMATICA AUXILIAR';
  }
}

function obterNomeFiltro(filtro: 'todos' | TipoCalculo): string {
  if (filtro === 'todos') return 'Todos os Modulos';
  return obterNomeCategoria(filtro);
}

function obterCorCategoriaRGB(categoria: TipoCalculo): string {
  switch (categoria) {
    case 'piso':
      return '0.008 0.518 0.780'; // Sky 600 (#0284C7)
    case 'pintura':
      return '0.020 0.588 0.412'; // Emerald 600 (#059669)
    case 'btu':
      return '0.851 0.467 0.024'; // Amber 600 (#D97706)
    case 'basica':
      return '0.310 0.275 0.898'; // Indigo 600 (#4F46E5)
  }
}

function formatarDataEmissao(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

interface BlocoItemPreparado {
  item: ItemMemorial;
  indiceGlobal: number;
  linhasAmbiente: string[];
  linhasResumo: string[];
  linhasDetalhe: string[];
  linhasEspecificacao: string[];
  linhasValor: string[];
  alturaBloco: number;
}

function prepararBlocoItem(item: ItemMemorial, indiceGlobal: number): BlocoItemPreparado {
  const linhasAmbiente = quebrarTextoEmLinhas(item.ambiente, 24);
  const linhasResumo = quebrarTextoEmLinhas(item.resumoTecnico, 32);
  const linhasDetalhe = quebrarTextoEmLinhas(item.detalheSecundario, 34);
  const linhasEspecificacao = quebrarTextoEmLinhas(item.codigoPythonGerado, 20);
  const linhasValor = quebrarTextoEmLinhas(item.valorPrincipal, 28);

  const qtdLinhasCol1 = linhasAmbiente.length + 1; // +1 para categoria/data
  const qtdLinhasCol2 = linhasResumo.length + linhasDetalhe.length;
  const qtdLinhasCol3 = linhasEspecificacao.length;
  const qtdLinhasCol4 = linhasValor.length;

  const maxLinhas = Math.max(qtdLinhasCol1, qtdLinhasCol2, qtdLinhasCol3, qtdLinhasCol4, 2);
  const alturaBloco = Math.max(46, maxLinhas * 12 + 18);

  return {
    item,
    indiceGlobal,
    linhasAmbiente,
    linhasResumo,
    linhasDetalhe,
    linhasEspecificacao,
    linhasValor,
    alturaBloco,
  };
}

/**
 * Gera o conteúdo completo de um documento PDF 1.4 contendo os cálculos do Memorial Descritivo.
 */
export function gerarConteudoPDFMemorial(
  itens: ItemMemorial[],
  opcoes: OpcoesExportacaoPDF = {}
): string {
  const tituloProjeto = opcoes.tituloProjeto?.trim() || 'Memorial Descritivo e de Calculo de Interiores';
  const filtroAtivo = opcoes.filtroAtivo ?? 'todos';
  const dataEmissao = opcoes.dataEmissao ?? new Date();
  const dataTexto = formatarDataEmissao(dataEmissao);

  const contagemCategorias = {
    piso: itens.filter((i) => i.categoria === 'piso').length,
    pintura: itens.filter((i) => i.categoria === 'pintura').length,
    btu: itens.filter((i) => i.categoria === 'btu').length,
    basica: itens.filter((i) => i.categoria === 'basica').length,
  };

  const blocos = itens.map((item, idx) => prepararBlocoItem(item, idx + 1));

  // Paginação automática em folhas A4 (595 x 842 pt)
  const paginasBlocos: BlocoItemPreparado[][] = [];
  if (blocos.length === 0) {
    paginasBlocos.push([]);
  } else {
    let paginaAtual: BlocoItemPreparado[] = [];
    let yCursor = 640; // Na página 1, após cabeçalho e cards de resumo
    const yMinimo = 82; // Espaço reservado para o rodapé técnico

    for (const bloco of blocos) {
      if (paginaAtual.length > 0 && yCursor - bloco.alturaBloco < yMinimo) {
        paginasBlocos.push(paginaAtual);
        paginaAtual = [bloco];
        yCursor = 696 - bloco.alturaBloco - 6; // Nas páginas seguintes não há faixa de cards KPI
      } else {
        paginaAtual.push(bloco);
        yCursor -= bloco.alturaBloco + 6;
      }
    }

    if (paginaAtual.length > 0) {
      paginasBlocos.push(paginaAtual);
    }
  }

  const totalPaginas = paginasBlocos.length;

  const streamsPaginas: string[] = paginasBlocos.map((blocosPagina, idxPagina) => {
    const numeroPagina = idxPagina + 1;
    const cmd: string[] = [];

    const desenharTexto = (
      texto: string,
      x: number,
      y: number,
      fonte: 'F1' | 'F2' | 'F3' = 'F1',
      tamanho: number = 9,
      corRGB: string = '0.059 0.090 0.165'
    ) => {
      cmd.push(
        `BT /${fonte} ${tamanho} Tf ${corRGB} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${codificarTextoPDF(texto)}) Tj ET`
      );
    };

    // 1. Cabeçalho Institucional ArchiCalc
    cmd.push('0.059 0.090 0.165 rg 36 738 523 68 re f'); // Fundo Slate 900
    cmd.push('0.008 0.518 0.780 rg 36 802 523 4 re f'); // Barra superior Sky 600

    desenharTexto('ARCHICALC — MEMORIAL DESCRITIVO DE CALCULO', 48, 782, 'F2', 12, '1 1 1');
    desenharTexto(tituloProjeto, 48, 767, 'F1', 9, '0.796 0.835 0.882');
    desenharTexto(
      `Filtro: ${obterNomeFiltro(filtroAtivo)} · Total exportado: ${itens.length} calculo(s)`,
      48,
      751,
      'F1',
      8,
      '0.220 0.741 0.973'
    );

    desenharTexto('EMISSAO TECNICA', 445, 784, 'F2', 7.5, '0.580 0.639 0.722');
    desenharTexto(dataTexto, 445, 770, 'F3', 8.5, '1 1 1');
    desenharTexto(`Pagina ${numeroPagina} de ${totalPaginas}`, 445, 752, 'F1', 8, '0.796 0.835 0.882');

    let yTopoTabela = 720;

    // 2. Resumo por Categoria (exibido na primeira página)
    if (numeroPagina === 1) {
      const cards = [
        {
          titulo: '01. PISO & PAGINACAO',
          valor: `${contagemCategorias.piso} registro(s)`,
          cor: '0.008 0.518 0.780',
        },
        {
          titulo: '02. PINTURA (LITROS)',
          valor: `${contagemCategorias.pintura} registro(s)`,
          cor: '0.020 0.588 0.412',
        },
        {
          titulo: '03. CLIMATIZACAO (BTU)',
          valor: `${contagemCategorias.btu} registro(s)`,
          cor: '0.851 0.467 0.024',
        },
        {
          titulo: '04. MATEMATICA AUX.',
          valor: `${contagemCategorias.basica} registro(s)`,
          cor: '0.310 0.275 0.898',
        },
      ];

      cards.forEach((card, i) => {
        const cardX = 36 + i * 132.5;
        const cardY = 684;
        const cardW = 125.5;
        const cardH = 42;

        cmd.push(`0.973 0.980 0.988 rg ${cardX.toFixed(2)} ${cardY} ${cardW.toFixed(2)} ${cardH} re f`);
        cmd.push(`0.886 0.910 0.941 RG 0.7 w ${cardX.toFixed(2)} ${cardY} ${cardW.toFixed(2)} ${cardH} re S`);
        cmd.push(`${card.cor} rg ${cardX.toFixed(2)} ${cardY + cardH - 3} ${cardW.toFixed(2)} 3 re f`);

        desenharTexto(card.titulo, cardX + 8, cardY + 24, 'F2', 7, '0.392 0.455 0.545');
        desenharTexto(card.valor, cardX + 8, cardY + 10, 'F2', 9.5, '0.059 0.090 0.165');
      });

      yTopoTabela = 668;
    }

    // 3. Cabeçalho da Tabela de Quantitativos
    const alturaCabecalhoTabela = 22;
    const yBaseCabecalho = yTopoTabela - alturaCabecalhoTabela;
    cmd.push(`0.945 0.961 0.976 rg 36 ${yBaseCabecalho} 523 ${alturaCabecalhoTabela} re f`);
    cmd.push(`0.796 0.835 0.882 RG 0.7 w 36 ${yBaseCabecalho} 523 ${alturaCabecalhoTabela} re S`);

    desenharTexto('AMBIENTE / CATEGORIA', 44, yBaseCabecalho + 7, 'F2', 7.5, '0.278 0.333 0.412');
    desenharTexto('PARAMETROS TECNICOS E DETALHAMENTO', 180, yBaseCabecalho + 7, 'F2', 7.5, '0.278 0.333 0.412');
    desenharTexto('ESPECIFICACAO', 345, yBaseCabecalho + 7, 'F2', 7.5, '0.278 0.333 0.412');
    desenharTexto('RESULTADO QUANTITATIVO', 435, yBaseCabecalho + 7, 'F2', 7.5, '0.278 0.333 0.412');

    let yCursor = yBaseCabecalho - 6;

    if (blocosPagina.length === 0) {
      cmd.push('0.980 0.984 0.992 rg 36 580 523 54 re f');
      cmd.push('0.886 0.910 0.941 RG 0.7 w 36 580 523 54 re S');
      desenharTexto(
        'Nenhum calculo registrado no memorial para este filtro.',
        165,
        604,
        'F2',
        9,
        '0.392 0.455 0.545'
      );
    } else {
      for (const bloco of blocosPagina) {
        const yFundo = yCursor - bloco.alturaBloco;
        const corCat = obterCorCategoriaRGB(bloco.item.categoria);

        // Fundo e borda da linha
        cmd.push(`1 1 1 rg 36 ${yFundo.toFixed(2)} 523 ${bloco.alturaBloco.toFixed(2)} re f`);
        cmd.push(`0.886 0.910 0.941 RG 0.6 w 36 ${yFundo.toFixed(2)} 523 ${bloco.alturaBloco.toFixed(2)} re S`);
        // Indicador lateral colorido por categoria
        cmd.push(`${corCat} rg 36 ${yFundo.toFixed(2)} 3.5 ${bloco.alturaBloco.toFixed(2)} re f`);

        const yPrimeiraLinha = yCursor - 14;

        // Coluna 1: Ambiente e Categoria
        let yCol1 = yPrimeiraLinha;
        for (const linhaAmb of bloco.linhasAmbiente) {
          desenharTexto(linhaAmb, 45, yCol1, 'F2', 8.5, '0.059 0.090 0.165');
          yCol1 -= 11;
        }
        desenharTexto(
          `#${String(bloco.indiceGlobal).padStart(2, '0')} · ${bloco.item.categoria.toUpperCase()} · ${bloco.item.criadoEm}`,
          45,
          yCol1 - 1,
          'F1',
          7,
          '0.392 0.455 0.545'
        );

        // Coluna 2: Parâmetros Técnicos e Detalhe Secundário
        let yCol2 = yPrimeiraLinha;
        for (const linhaRes of bloco.linhasResumo) {
          desenharTexto(linhaRes, 180, yCol2, 'F1', 8, '0.118 0.161 0.231');
          yCol2 -= 11;
        }
        for (const linhaDet of bloco.linhasDetalhe) {
          desenharTexto(linhaDet, 180, yCol2 - 1, 'F1', 7.5, '0.392 0.455 0.545');
          yCol2 -= 10.5;
        }

        // Coluna 3: Especificação Complementar
        let yCol3 = yPrimeiraLinha;
        for (const linhaEsp of bloco.linhasEspecificacao) {
          desenharTexto(linhaEsp, 345, yCol3, 'F3', 7.2, '0.200 0.255 0.333');
          yCol3 -= 10.5;
        }

        // Coluna 4: Resultado Quantitativo Principal
        let yCol4 = yPrimeiraLinha;
        for (const linhaVal of bloco.linhasValor) {
          desenharTexto(linhaVal, 435, yCol4, 'F2', 8, corCat);
          yCol4 -= 11;
        }

        yCursor = yFundo - 6;
      }
    }

    // 4. Rodapé Técnico Normativo
    cmd.push('0.886 0.910 0.941 RG 0.7 w 36 62 m 559 62 l S');
    desenharTexto(
      'Criterios Tecnicos ArchiCalc: Piso com margem de recorte (5% a 20%) e caixas fechadas; Pintura com desconto de vaos e +10% reserva; BTU 600/800 por m2.',
      36,
      49,
      'F1',
      6.8,
      '0.392 0.455 0.545'
    );
    desenharTexto(
      'ArchiCalc — Calculadora Tecnica de Design de Interiores & Estudio Python',
      36,
      36,
      'F2',
      7.5,
      '0.278 0.333 0.412'
    );
    desenharTexto(
      `Documento exportado em PDF · Pagina ${numeroPagina}/${totalPaginas}`,
      415,
      36,
      'F1',
      7.5,
      '0.392 0.455 0.545'
    );

    return cmd.join('\n');
  });

  // Montagem dos objetos PDF 1.4
  // Obj 1: Catalog
  // Obj 2: Pages
  // Obj 3: Font F1 (Helvetica)
  // Obj 4: Font F2 (Helvetica-Bold)
  // Obj 5: Font F3 (Courier)
  // Para cada página i (0..N-1):
  //   Obj (6 + i * 2): Page
  //   Obj (7 + i * 2): Content Stream
  const objetos: string[] = [];

  const idsPaginas: number[] = [];
  for (let i = 0; i < totalPaginas; i++) {
    idsPaginas.push(6 + i * 2);
  }

  objetos.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objetos.push(
    `2 0 obj\n<< /Type /Pages /Kids [${idsPaginas.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPaginas} >>\nendobj`
  );
  objetos.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj'
  );
  objetos.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj'
  );
  objetos.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj'
  );

  for (let i = 0; i < totalPaginas; i++) {
    const pageObjId = 6 + i * 2;
    const contentObjId = 7 + i * 2;
    const stream = streamsPaginas[i];

    objetos.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj`
    );
    objetos.push(
      `${contentObjId} 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`
    );
  }

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0]; // Índice 0 reservado para entrada livre padrão

  for (const obj of objetos) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const startXref = pdf.length;
  const totalObjetos = objetos.length + 1;

  pdf += `xref\n0 ${totalObjetos}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < totalObjetos; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${totalObjetos} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return pdf;
}

/**
 * Converte o documento PDF gerado em um array de bytes (Uint8Array).
 */
export function gerarBytesPDFMemorial(
  itens: ItemMemorial[],
  opcoes: OpcoesExportacaoPDF = {}
): Uint8Array<ArrayBuffer> {
  const conteudo = gerarConteudoPDFMemorial(itens, opcoes);
  const buffer = new ArrayBuffer(conteudo.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < conteudo.length; i++) {
    bytes[i] = conteudo.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Gera o nome de arquivo padrão para exportação do Memorial Descritivo em PDF.
 */
export function gerarNomeArquivoPDFMemorial(filtroAtivo: 'todos' | TipoCalculo = 'todos'): string {
  const sufixo = filtroAtivo === 'todos' ? 'completo' : filtroAtivo;
  return `memorial-descritivo-${sufixo}.pdf`;
}

/**
 * Dispara o download do arquivo PDF no navegador contendo os cálculos do Memorial Descritivo.
 */
export function exportarMemorialParaPDF(
  itens: ItemMemorial[],
  opcoes: OpcoesExportacaoPDF = {}
): string {
  const bytes = gerarBytesPDFMemorial(itens, opcoes);
  const nomeArquivo = gerarNomeArquivoPDFMemorial(opcoes.filtroAtivo ?? 'todos');

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return nomeArquivo;
}
