import {
  InputPiso,
  ResultadoPiso,
  InputPintura,
  ResultadoPintura,
  InputBTU,
  ResultadoBTU,
  InputOperacaoBasica,
  ResultadoOperacaoBasica,
} from './calculators';

export interface ConceitoPython {
  termo: string;
  linhaReferencia: string;
  resumoCurto: string;
  explicacaoDetalhada: string;
}

export function gerarCodigoPythonPiso(input: InputPiso, res: ResultadoPiso): string {
  return `import math

def calcular_piso(
    largura: float,
    comprimento: float,
    margem_recorte: float = 10.0,
    area_caixa: float = 2.0
) -> dict:
    """Calcula área líquida, margem e total de caixas."""
    if largura <= 0 or comprimento <= 0:
        raise ValueError("Dimensões devem ser > 0.")

    # 1. Área líquida do ambiente (m²)
    area_liquida = largura * comprimento

    # 2. Fator de segurança p/ recortes (10% -> 1.10)
    fator_perda = 1 + (margem_recorte / 100)
    area_com_recorte = area_liquida * fator_perda

    # 3. Arredonda p/ cima (não vende meia caixa)
    caixas = math.ceil(area_com_recorte / area_caixa)

    return {
        "area_liquida": round(area_liquida, 2),
        "area_com_recorte": round(area_com_recorte, 2),
        "caixas_necessarias": caixas,
        "area_comprada": round(caixas * area_caixa, 2)
    }

# --- Execução com os dados atuais da tela ---
resultado = calcular_piso(
    largura=${input.largura},
    comprimento=${input.comprimento},
    margem_recorte=${input.margemRecortePercent},
    area_caixa=${input.areaPorCaixa}
)
print(resultado)
# {'area_liquida': ${res.areaLiquida}, 'area_com_recorte': ${res.areaComRecorte},
#  'caixas_necessarias': ${res.caixasNecessarias}, 'area_comprada': ${res.areaTotalComprada}}`;
}

export function gerarCodigoPythonPintura(input: InputPintura, res: ResultadoPintura): string {
  return `import math

def calcular_pintura(
    largura_parede: float,
    altura_parede: float,
    area_aberturas: float,
    demaos: int = 2,
    rendimento_litro: float = 10.0
) -> dict:
    """Calcula litros e embalagens (18L e 3.6L)."""
    area_bruta = largura_parede * altura_parede
    area_liquida = max(0.0, area_bruta - area_aberturas)

    # Área total multiplicada pelo nº de demãos
    area_total_pintura = area_liquida * demaos
    litros_exatos = area_total_pintura / rendimento_litro
    litros_reserva = litros_exatos * 1.10  # +10% reserva

    # Operador // extrai latas inteiras de 18L
    latas_18l = int(litros_reserva // 18)
    restante = litros_reserva - (latas_18l * 18)
    galoes_3_6l = (
        math.ceil(restante / 3.6) if restante > 0 else 0
    )

    return {
        "area_liquida_m2": round(area_liquida, 2),
        "litros_reserva": round(litros_reserva, 2),
        "latas_18l": latas_18l,
        "galoes_3_6l": galoes_3_6l
    }

# --- Execução com os dados atuais da tela ---
resultado = calcular_pintura(
    largura_parede=${input.larguraParede},
    altura_parede=${input.alturaParede},
    area_aberturas=${input.areaAberturas},
    demaos=${input.numeroDemaos},
    rendimento_litro=${input.rendimentoPorLitro}
)
print(resultado)
# {'area_liquida_m2': ${res.areaLiquida}, 'litros_reserva': ${res.litrosComMargem},
#  'latas_18l': ${res.latas18L}, 'galoes_3_6l': ${res.galoes3_6L}}`;
}

export function gerarCodigoPythonBTU(input: InputBTU, res: ResultadoBTU): string {
  return `def calcular_btu(
    area_m2: float,
    sol: str = "manha",
    pessoas: int = 2,
    eletronicos: int = 1
) -> dict:
    """Dimensiona ar-condicionado em BTU/h."""
    # Ternário: 800 p/ sol da tarde, 600 p/ manhã
    fator_solar = 800 if sol == "tarde" else 600
    btu_area = round(area_m2 * fator_solar)

    # 1ª pessoa já entra na carga base do ambiente
    pessoas_extras = max(0, pessoas - 1)
    btu_total = (
        btu_area
        + (pessoas_extras * 600)
        + (eletronicos * 600)
    )

    comerciais = [7000, 9000, 12000, 18000, 24000, 30000]
    recomendado = next(
        (c for c in comerciais if c >= btu_total),
        btu_total
    )

    return {
        "btu_calculado": btu_total,
        "aparelho_btu": recomendado
    }

# --- Execução com os dados atuais da tela ---
resultado = calcular_btu(
    area_m2=${input.areaAmbiente},
    sol="${input.incidenciaSolar}",
    pessoas=${input.numeroPessoas},
    eletronicos=${input.numeroEletronicos}
)
print(resultado)
# {'btu_calculado': ${res.btuTotal}, 'aparelho_btu': ${res.capacidadeComercial}}`;
}

export function gerarCodigoPythonBasica(input: InputOperacaoBasica, res: ResultadoOperacaoBasica): string {
  const saidaComentada = res.erro
    ? `# Exceção -> "${res.erro}"`
    : `# Saída: ${res.resultado} (tipo: ${res.tipoRetornoPython})`;

  return `def calcular_operacao(
    a: float, b: float, operador: str
) -> float:
    """Executa operações básicas com proteção."""
    # Dicionário de funções anônimas (lambda)
    operacoes = {
        "+": lambda x, y: x + y,
        "-": lambda x, y: x - y,
        "*": lambda x, y: x * y,
        "/": lambda x, y: x / y,   # Divisão float
        "**": lambda x, y: x ** y, # Potenciação
        "//": lambda x, y: x // y, # Divisão inteira
        "%": lambda x, y: x % y,   # Resto (módulo)
    }

    if operador not in operacoes:
        raise ValueError("Operador inválido")

    try:
        return round(operacoes[operador](a, b), 4)
    except ZeroDivisionError:
        raise ZeroDivisionError("Divisão por zero!")

# --- Execução com os dados atuais da tela ---
res = calcular_operacao(${input.valorA}, ${input.valorB}, "${input.operador}")
print(f"Resultado: {res} ({type(res).__name__})")
${saidaComentada}`;
}

export const CONCEITOS_POR_MODULO: Record<string, ConceitoPython[]> = {
  piso: [
    {
      termo: 'Type Hints (largura: float -> dict)',
      linhaReferencia: 'def calcular_piso(largura: float, ...) -> dict:',
      resumoCurto: 'Tipagem explícita opcional introduzida no Python 3.5+.',
      explicacaoDetalhada:
        'Se você já programou em C, Java ou TypeScript, vai reconhecer os tipos. Em Python a tipagem continua dinâmica em tempo de execução, mas os Type Hints permitem que o editor (VS Code/PyCharm) avise erros antes de rodar o programa.',
    },
    {
      termo: 'math.ceil() vs round()',
      linhaReferencia: 'caixas = math.ceil(area_com_recorte / area_caixa)',
      resumoCurto: 'Arredondamento sempre para o teto inteiro superior.',
      explicacaoDetalhada:
        'Em engenharia e interiores, usar round(14.2) daria 14 caixas e faltaria piso na obra! O math.ceil(14.05) garante que qualquer fração extra suba para 15 caixas fechadas.',
    },
    {
      termo: 'Parâmetros com Valor Padrão',
      linhaReferencia: 'margem_recorte: float = 10.0',
      resumoCurto: 'Torna argumentos opcionais na chamada da função.',
      explicacaoDetalhada:
        'Se quem chamar calcular_piso(4.5, 6.0) omitir a margem, o Python assume automaticamente 10.0% (paginação reta padrão). Se for paginação diagonal, basta passar 15.0.',
    },
  ],
  pintura: [
    {
      termo: 'Divisão Inteira (//) e Resto',
      linhaReferencia: 'latas_18l = int(litros_com_reserva // 18)',
      resumoCurto: 'Extrai apenas a parte inteira da divisão sem casas decimais.',
      explicacaoDetalhada:
        'Para otimizar embalagens de tinta, primeiro descobrimos quantas latas grandes de 18L cabem inteiras usando // 18. O que sobrar (resto) é dividido por 3.6L com math.ceil() para completar com galões menores.',
    },
    {
      termo: 'Função Nativa max(0.0, valor)',
      linhaReferencia: 'area_liquida = max(0.0, area_bruta - area_aberturas)',
      resumoCurto: 'Evita números negativos de forma limpa sem vários ifs.',
      explicacaoDetalhada:
        'Padrão clássico em Python chamado "clamping" (limitador inferior). Garante que o resultado nunca seja menor que zero caso haja algum arredondamento limite.',
    },
  ],
  btu: [
    {
      termo: 'Expressão Condicional (Ternário)',
      linhaReferencia: 'fator_solar = 800 if sol == "tarde" else 600',
      resumoCurto: 'Decisão if/else em uma única linha legível.',
      explicacaoDetalhada:
        'Em vez de usar o operador ? : de outras linguagens, o Python lê quase como inglês/português: "use 800 se o sol for da tarde, senão use 600".',
    },
    {
      termo: 'Generator Expression com next()',
      linhaReferencia: 'next((c for c in comerciais if c >= btu_total), btu_total)',
      resumoCurto: 'Encontra o primeiro item da lista que atende a uma condição.',
      explicacaoDetalhada:
        'Percorre a lista ordenada [7000, 9000, 12000, 18000...] e para imediatamente no primeiro aparelho cuja potência seja maior ou igual à carga térmica calculada.',
    },
  ],
  basica: [
    {
      termo: 'Dispatch Table com Dicionário + Lambda',
      linhaReferencia: 'operacoes = { "+": lambda x, y: x + y, ... }',
      resumoCurto: 'Substitui longas cadeias de if/elif/else por busca direta O(1).',
      explicacaoDetalhada:
        'Em Python, funções são cidadãs de primeira classe (podem ser guardadas dentro de dicionários). Uma função lambda é apenas uma função curta de uma linha: lambda parâmetros: retorno.',
    },
    {
      termo: 'Tratamento de Exceção (try / except)',
      linhaReferencia: 'except ZeroDivisionError:',
      resumoCurto: 'Captura erros em tempo de execução sem travar o programa.',
      explicacaoDetalhada:
        'Equivalente ao try/catch de Java ou JavaScript. Em Python, capturamos especificamente o erro ZeroDivisionError para devolver uma mensagem amigável ao usuário.',
    },
  ],
};

export const CODIGO_BACKEND_FLASK_COMPLETO = `# arquivo: app_backend.py
# Como rodar no seu computador:
# 1. pip install flask flask-cors
# 2. python app_backend.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from calculadora_interiores import (
    calcular_piso,
    calcular_pintura,
    calcular_btu,
    operacao_basica
)

app = Flask(__name__)
CORS(app)  # Permite que o Frontend (HTML/JS/React) converse com o Python

@app.route("/api/calcular", methods=["POST"])
def endpoint_calcular():
    """
    Recebe um JSON do Frontend, chama a função Python correspondente
    e devolve o resultado também em JSON.
    """
    # 1. Lê o pacote JSON enviado pelo navegador
    corpo_requisicao = request.get_json()
    tipo = corpo_requisicao.get("tipo")
    dados = corpo_requisicao.get("dados", {})

    try:
        # 2. Roteia para a função pura de negócio usando **dados (desempacotamento)
        if tipo == "piso":
            resultado = calcular_piso(**dados)
        elif tipo == "pintura":
            resultado = calcular_pintura(**dados)
        elif tipo == "btu":
            resultado = calcular_btu(**dados)
        elif tipo == "basica":
            resultado = operacao_basica(**dados)
        else:
            return jsonify({"sucesso": False, "erro": "Tipo inválido"}), 400

        # 3. Retorna HTTP 200 (OK) com os cálculos prontos
        return jsonify({
            "sucesso": True,
            "tipo": tipo,
            "resultado": resultado
        }), 200

    except (ValueError, ZeroDivisionError) as erro_validacao:
        # 4. Se o usuário enviou número negativo ou divisão por zero -> HTTP 422
        return jsonify({
            "sucesso": False,
            "erro": str(erro_validacao)
        }), 422

if __name__ == "__main__":
    print("Servidor Backend Python rodando em http://localhost:5000")
    app.run(port=5000, debug=True)
`;

export const CODIGO_CLI_COMPLETO = `# arquivo: menu_terminal.py
# Caso você queira rodar 100% no terminal sem precisar de navegador/backend!
# Como rodar: python menu_terminal.py

from calculadora_interiores import (
    calcular_piso,
    calcular_pintura,
    calcular_btu,
    operacao_basica
)

def menu_principal():
    while True:
        print("\\n" + "=" * 50)
        print(" ARCHICALC PY - CALCULADORA TÉCNICA DE INTERIORES")
        print("=" * 50)
        print(" [1] Calcular Piso e Margem de Recorte (m² e Caixas)")
        print(" [2] Calcular Pintura de Parede (Litros e Latas)")
        print(" [3] Dimensionar Ar-Condicionado (BTU/h)")
        print(" [4] Calculadora Matemática Básica (+, -, *, /, //, %)")
        print(" [0] Sair")

        opcao = input("\\nEscolha uma opção: ").strip()

        try:
            if opcao == "1":
                larg = float(input("Largura do ambiente (m): "))
                comp = float(input("Comprimento do ambiente (m): "))
                margem = float(input("Margem de recorte % (ex: 10 ou 15): ") or 10)
                caixa = float(input("m² por caixa de piso (ex: 2.0): ") or 2.0)
                res = calcular_piso(larg, comp, margem, caixa)
                print(f"\\n-> Área Líquida: {res['area_liquida_m2']} m²")
                print(f"-> Área c/ Recorte: {res['area_com_recorte_m2']} m²")
                print(f"-> Comprar: {res['caixas_necessarias']} caixas ({res['area_total_comprada_m2']} m²)")

            elif opcao == "2":
                larg = float(input("Comprimento total das paredes (m): "))
                alt = float(input("Pé-direito / altura (m): "))
                abert = float(input("Área de portas/janelas (m²): ") or 0)
                demaos = int(input("Número de demãos (ex: 2): ") or 2)
                rend = float(input("Rendimento da tinta m²/L (ex: 10): ") or 10)
                res = calcular_pintura(larg, alt, abert, demaos, rend)
                print(f"\\n-> Área Líquida: {res['area_liquida_m2']} m²")
                print(f"-> Litros c/ reserva (10%): {res['litros_com_margem']} L")
                print(f"-> Sugestão: {res['latas_18l']} lata(s) 18L + {res['galoes_3_6l']} galão(ões) 3.6L")

            elif opcao == "3":
                area = float(input("Área do ambiente (m²): "))
                sol = input("Incidência solar (manha/tarde): ").strip().lower()
                pessoas = int(input("Total de pessoas no ambiente: "))
                eletro = int(input("Qtd. de aparelhos eletrônicos: "))
                res = calcular_btu(area, sol, pessoas, eletro)
                print(f"\\n-> Carga Térmica: {res['btu_total']} BTU/h")
                print(f"-> Aparelho Comercial: {res['capacidade_comercial_btu']} BTU/h")

            elif opcao == "4":
                a = float(input("Primeiro número: "))
                op = input("Operador (+, -, *, /, **, //, %): ").strip()
                b = float(input("Segundo número: "))
                res = operacao_basica(a, b, op)
                print(f"\\n-> {res['expressao']} = {res['resultado']} (tipo: {res['tipo_python']})")

            elif opcao == "0":
                print("Encerrando ArchiCalc Py. Bons estudos!")
                break
            else:
                print("Opção inválida. Tente novamente.")

        except ValueError as erro:
            print(f"\\n[Erro de Valor]: {erro}")
        except ZeroDivisionError as erro:
            print(f"\\n[Erro Matemático]: {erro}")

if __name__ == "__main__":
    menu_principal()
`;
