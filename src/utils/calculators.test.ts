import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App';
import {
  calcularPiso,
  calcularPintura,
  calcularBTU,
  calcularOperacaoBasica,
  ItemMemorial,
} from './calculators';
import {
  codificarTextoPDF,
  gerarConteudoPDFMemorial,
  gerarBytesPDFMemorial,
  gerarNomeArquivoPDFMemorial,
  exportarMemorialParaPDF,
} from './pdfMemorial';

test('calcularPiso calcula área líquida, margem de recorte e caixas arredondadas para cima', () => {
  const res = calcularPiso({
    largura: 4.5,
    comprimento: 6.0,
    margemRecortePercent: 10,
    areaPorCaixa: 2.0,
    precoPorM2: 100,
  });

  assert.equal(res.areaLiquida, 27);
  assert.equal(res.areaComRecorte, 29.7);
  assert.equal(res.areaPerda, 2.7);
  assert.equal(res.caixasNecessarias, 15);
  assert.equal(res.areaTotalComprada, 30);
  assert.equal(res.custoEstimado, 3000);
});

test('calcularPiso rejeita dimensões inválidas', () => {
  assert.throws(
    () =>
      calcularPiso({
        largura: 0,
        comprimento: 5,
        margemRecortePercent: 10,
        areaPorCaixa: 2,
      }),
    /largura do ambiente deve ser maior que zero/
  );
});

test('calcularPintura desconta aberturas, aplica demãos e otimiza latas de 18L e galões de 3.6L', () => {
  const res = calcularPintura({
    larguraParede: 12,
    alturaParede: 2.8,
    areaAberturas: 3.6,
    numeroDemaos: 2,
    rendimentoPorLitro: 10,
  });

  // Área bruta: 12 * 2.8 = 33.6 m²
  // Área líquida: 33.6 - 3.6 = 30.0 m²
  // Área com 2 demãos: 60.0 m²
  // Litros exatos: 60 / 10 = 6.0 L
  // Com margem de 10%: 6.6 L -> 0 latas de 18L e 2 galões de 3.6L (7.2L)
  assert.equal(res.areaBruta, 33.6);
  assert.equal(res.areaLiquida, 30);
  assert.equal(res.areaTotalPintura, 60);
  assert.equal(res.litrosExatos, 6);
  assert.equal(res.litrosComMargem, 6.6);
  assert.equal(res.latas18L, 0);
  assert.equal(res.galoes3_6L, 2);
});

test('calcularBTU aplica fator de sol da manhã (600) e sol da tarde (800) corretamente', () => {
  const manha = calcularBTU({
    areaAmbiente: 15,
    incidenciaSolar: 'manha',
    numeroPessoas: 2,
    numeroEletronicos: 1,
  });
  // 15 * 600 = 9000 + 1 pessoa extra (600) + 1 eletrônico (600) = 10200 -> comercial 12000
  assert.equal(manha.btuArea, 9000);
  assert.equal(manha.pessoasAdicionais, 1);
  assert.equal(manha.btuPessoas, 600);
  assert.equal(manha.btuEletronicos, 600);
  assert.equal(manha.btuTotal, 10200);
  assert.equal(manha.capacidadeComercial, 12000);

  const tarde = calcularBTU({
    areaAmbiente: 20,
    incidenciaSolar: 'tarde',
    numeroPessoas: 3,
    numeroEletronicos: 2,
  });
  // 20 * 800 = 16000 + 2 pessoas extras (1200) + 2 eletrônicos (1200) = 18400 -> comercial 24000
  assert.equal(tarde.btuTotal, 18400);
  assert.equal(tarde.capacidadeComercial, 24000);
});

test('calcularOperacaoBasica executa operações do Python e protege contra divisão por zero', () => {
  const soma = calcularOperacaoBasica({ valorA: 12.5, valorB: 7.5, operador: '+' });
  assert.equal(soma.resultado, 20);
  assert.equal(soma.erro, null);

  const divInteira = calcularOperacaoBasica({ valorA: 22, valorB: 18, operador: '//' });
  assert.equal(divInteira.resultado, 1);

  const resto = calcularOperacaoBasica({ valorA: 22, valorB: 18, operador: '%' });
  assert.equal(resto.resultado, 4);

  const divZero = calcularOperacaoBasica({ valorA: 10, valorB: 0, operador: '/' });
  assert.equal(divZero.resultado, null);
  assert.match(divZero.erro || '', /ZeroDivisionError/);
});

test('codificarTextoPDF escapa delimitadores PDF, converte setas e codifica caracteres WinAnsi em octal', () => {
  const texto = 'Living (90x90) · 29.70 m² → 30.00 m²';
  const codificado = codificarTextoPDF(texto);

  assert.match(codificado, /\\\(90x90\\\)/);
  assert.match(codificado, /->/);
  assert.match(codificado, /m\\262/); // ² = 0xB2 = 0262 octal
});

test('gerarConteudoPDFMemorial e gerarBytesPDFMemorial geram documento PDF 1.4 válido com paginação e itens do memorial', () => {
  const itensExemplo: ItemMemorial[] = [
    {
      id: 'item-1',
      categoria: 'piso',
      ambiente: 'Living Integrado (Porcelanato 90x90)',
      resumoTecnico: '4.50m × 6.00m · Margem recorte +10%',
      valorPrincipal: '29.70 m² (15 caixas)',
      detalheSecundario: 'Área líquida: 27.00 m² · Compra fechada: 30.00 m²',
      codigoPythonGerado: 'Porcelanato Retificado · Caixa 2,00 m²',
      criadoEm: 'Projeto Base',
    },
    {
      id: 'item-2',
      categoria: 'pintura',
      ambiente: 'Suíte Master (Acrílico Fosco)',
      resumoTecnico: 'Parede 14.0m × 2.80m · Vãos: 4.20 m² · 2 demãos',
      valorPrincipal: '7.70 L (3× Galão 3,6L)',
      detalheSecundario: 'Área líquida: 35.00 m² · Rendimento: 10 m²/L',
      codigoPythonGerado: 'Tinta Acrílica Premium · Reserva +10%',
      criadoEm: 'Projeto Base',
    },
    {
      id: 'item-3',
      categoria: 'btu',
      ambiente: 'Home Office (Face Oeste)',
      resumoTecnico: '15.0 m² · Sol da Tarde (800 BTU/m²) · 2 pessoas',
      valorPrincipal: '15.000 BTU/h → 18.000 BTU/h',
      detalheSecundario: 'Split Hi-Wall Inverter Residencial',
      codigoPythonGerado: 'Climatização Residencial · Ciclo Frio/Quente',
      criadoEm: 'Projeto Base',
    },
  ];

  const pdfString = gerarConteudoPDFMemorial(itensExemplo, {
    filtroAtivo: 'todos',
    dataEmissao: new Date(2026, 10, 3, 17, 15),
  });

  assert.ok(pdfString.startsWith('%PDF-1.4\n'));
  assert.ok(pdfString.endsWith('%%EOF\n'));
  assert.match(pdfString, /ARCHICALC/);
  assert.match(pdfString, /Living Integrado/);
  assert.match(pdfString, /15\.000 BTU\/h -> 18\.000 BTU\/h/);
  assert.match(pdfString, /xref\n0 8\n/);

  const bytes = gerarBytesPDFMemorial(itensExemplo, { filtroAtivo: 'todos' });
  assert.ok(bytes instanceof Uint8Array);
  assert.equal(bytes.length, pdfString.length);
  assert.equal(String.fromCharCode(...bytes.slice(0, 8)), '%PDF-1.4');

  // Verifica paginação automática com muitos itens (> 12 itens gera 2+ páginas)
  const muitosItens: ItemMemorial[] = Array.from({ length: 16 }, (_, idx) => ({
    ...itensExemplo[idx % itensExemplo.length],
    id: `item-lote-${idx + 1}`,
    ambiente: `Ambiente Técnico ${idx + 1}`,
  }));
  const pdfMultiPagina = gerarConteudoPDFMemorial(muitosItens);
  assert.match(pdfMultiPagina, /\/Count [23]/);
  assert.match(pdfMultiPagina, /Pagina 2 de [23]/);

  assert.equal(gerarNomeArquivoPDFMemorial('todos'), 'memorial-descritivo-completo.pdf');
  assert.equal(gerarNomeArquivoPDFMemorial('piso'), 'memorial-descritivo-piso.pdf');
  assert.equal(exportarMemorialParaPDF(itensExemplo, { filtroAtivo: 'pintura' }), 'memorial-descritivo-pintura.pdf');
});

test('App renderiza a seção Memorial de Cálculo com o botão Exportar PDF habilitado e todas as calculadoras preservadas', () => {
  const html = renderToStaticMarkup(React.createElement(App));

  assert.match(html, /Calculadora Técnica de Design de Interiores/);
  assert.match(html, /Memorial de Cálculo de Interiores \(3\)/);
  assert.match(html, /data-testid="btn-exportar-pdf"/);
  assert.match(html, /Exportar PDF/);
  assert.match(html, /Living Integrado \(Porcelanato 90x90\)/);
  assert.match(html, /Suíte Master \(Acrílico Fosco\)/);
  assert.match(html, /Home Office \(Face Oeste\)/);
});
