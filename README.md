# ArchiCalc | Calculadora Técnica & Gestão de Projetos de Interiores

<div align="center">
<img width="1000" alt="ArchiCalc Interface" src="docs/dark-mode-desktop.png" />
</div>

> Aplicação web front-end desenvolvida para otimizar o fluxo de trabalho de arquitetos e designers de interiores, unindo precisão matemática, layout responsivo e recursos de inteligência artificial generativa.

---

## 🚀 Sobre o Projeto
O **ArchiCalc** foi concebido para resolver dores reais na rotina de projetos de interiores. A ferramenta automatiza cálculos complexos e repetitivos do dia a dia profissional, como dimensionamento de revestimentos com margem de perda/recorte, estimativa de consumo de tinta por parede, cálculo de carga térmica (BTUs) e operações matemáticas aplicadas a ambientes. Além disso, a aplicação conta com geração de memorial descritivo em PDF e integração com IA via Google AI Studio.

## 🛠️ Tecnologias e Stack
Este projeto foi construído utilizando tecnologias modernas de desenvolvimento web e engenharia de software:
* **Core:** React, TypeScript, Vite
* **Estilização:** CSS3 Avançado (Flexbox, Grid Layout, Dark/Light Mode)
* **Qualidade & Testes:** Suíte de testes unitários automatizados (`calculators.test.ts`)
* **Exportação & Integração:** Geração de relatórios em PDF (`pdfMemorial.ts`) e automação com Python (`pythonTemplates.ts`)
* **IA Generativa:** Google AI Studio / Gemini API

## ✨ Funcionalidades
1. **Módulo de Pisos e Revestimentos:** Cálculo exato de caixas e área líquida com adição percentual customizável de margem de recorte/perda.
2. **Módulo de Pintura:** Estimativa de litros de tinta necessários com base na metragem das paredes.
3. **Módulo de Climatização (BTUs):** Dimensionamento da potência ideal de ar-condicionado para o ambiente.
4. **Memorial de Cálculo & Exportação:** Consolidação dos itens calculados em uma tabela descritiva com opção de exportação para PDF e script.
5. **Planta Técnica & Esquema:** Visualização interativa da paginação e malha do ambiente.

## ⚙️ Como Executar o Projeto Localmente

**Pré-requisitos:** Certifique-se de ter o **Node.js** instalado em sua máquina.

1. Clone o repositório:
   ```bash
   git clone [https://github.com/fabio-lechinhoski/archcalc.git](https://github.com/fabio-lechinhoski/archcalc.git)
