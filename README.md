> Aplicação web para dimensionamento de materiais, cálculo de carga térmica (BTUs) e geração de memorial descritivo em projetos de arquitetura e interiores.

## 🚀 Sobre o Projeto

O **ArchiCalc** automatiza cálculos técnicos e quantitativos de obra que costumam ser feitos manualmente em planilhas. A aplicação processa medidas de ambientes para estimar insumos com margem de perda, gera esquemas visuais de paginação e exporta relatórios técnicos em PDF e scripts em Python.

## 🛠️ Tecnologias e Stack

- **Core:** React, TypeScript, Vite
- **Estilização:** CSS3 (Flexbox, Grid Layout, Dark/Light Mode)
- **Qualidade & Testes:** Testes unitários automatizados (calculators.test.ts)
- **Exportação & Automação:** Geração de relatórios em PDF (pdfMemorial.ts) e templates em Python (pythonTemplates.ts)
- **Integração IA:** Gemini API

## ✨ Funcionalidades

1. **Módulo de Pisos e Revestimentos:** Cálculo de caixas e área líquida com adição percentual customizável de margem de recorte e perda.
2. **Módulo de Pintura:** Estimativa de litros de tinta necessários com base na metragem das paredes.
3. **Módulo de Climatização (BTUs):** Dimensionamento da potência de ar-condicionado para o ambiente.
4. **Memorial de Cálculo & Exportação:** Consolidação dos itens calculados em tabela descritiva com exportação para PDF e script Python.
5. **Planta Técnica & Esquema:** Visualização interativa da paginação e malha do ambiente.

## ⚙️ Como Executar o Projeto Localmente

**Pré-requisitos:** Node.js instalado.

1. Clone o repositório:
```bash
git clone https://github.com/fabio-lechinhoski/archcalc.git
```

2. Acesse a pasta do projeto e instale as dependências:
```bash
cd archcalc
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
