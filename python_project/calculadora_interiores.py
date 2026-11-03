"""
ArchiCalc Py — Calculadora Técnica de Interiores & Operações Básicas
====================================================================
Módulo didático em Python 3 para quem está retomando a programação.

Principais conceitos utilizados:
1. Type Hints (float, int, str, dict): Documentam os tipos esperados.
2. Módulo `math` (math.ceil): Arredondamento sempre para cima (essencial
   para compra de caixas de piso e galões de tinta, evitando falta de material).
3. Funções Puras: Cada função recebe parâmetros claros, valida entradas
   e retorna um dicionário estruturado (fácil de converter para JSON em um backend).
4. Tratamento de Exceções (ValueError / ZeroDivisionError): Protege o código
   contra entradas negativas ou divisão por zero.
"""

import math
import sys
import json
from typing import Dict, Any, Union


# ============================================================================
# 1. OPERAÇÕES MATEMÁTICAS BÁSICAS
# ============================================================================
def operacao_basica(valor_a: float, valor_b: float, operador: str) -> Dict[str, Any]:
    """
    Realiza operações aritméticas básicas do Python (+, -, *, /, **, //, %).
    """
    if operador in ("/", "//", "%") and valor_b == 0:
        raise ZeroDivisionError("Não é possível dividir por zero.")

    operacoes = {
        "+": lambda a, b: a + b,
        "-": lambda a, b: a - b,
        "*": lambda a, b: a * b,
        "/": lambda a, b: a / b,
        "**": lambda a, b: a ** b,
        "//": lambda a, b: a // b,
        "%": lambda a, b: a % b,
    }

    if operador not in operacoes:
        raise ValueError(f"Operador inválido: '{operador}'. Use +, -, *, /, **, // ou %.")

    resultado = operacoes[operador](valor_a, valor_b)
    return {
        "expressao": f"{valor_a} {operador} {valor_b}",
        "resultado": round(resultado, 4),
        "tipo_python": type(resultado).__name__,
    }


# ============================================================================
# 2. CÁLCULO DE PISO E REVESTIMENTO (COM MARGEM DE RECORTE)
# ============================================================================
def calcular_piso(
    largura: float,
    comprimento: float,
    margem_recorte_percent: float = 10.0,
    area_por_caixa: float = 2.0,
    preco_m2: float = 89.90,
) -> Dict[str, Union[float, int]]:
    """
    Calcula a área de piso necessária considerando perda de recorte (ex: 10% reta, 15% diagonal)
    e a quantidade fechada de caixas comerciais.
    """
    if largura <= 0 or comprimento <= 0:
        raise ValueError("Largura e comprimento devem ser maiores que zero.")
    if not (0 <= margem_recorte_percent <= 50):
        raise ValueError("A margem de recorte deve estar entre 0% e 50%.")
    if area_por_caixa <= 0:
        raise ValueError("A área por caixa deve ser maior que zero.")

    area_liquida = largura * comprimento
    fator_seguranca = 1 + (margem_recorte_percent / 100.0)
    area_com_recorte = area_liquida * fator_seguranca
    area_perda = area_com_recorte - area_liquida

    # math.ceil arredonda para o próximo número inteiro (não se compra meia caixa!)
    caixas_necessarias = math.ceil(area_com_recorte / area_por_caixa)
    area_total_comprada = caixas_necessarias * area_por_caixa
    custo_estimado = area_total_comprada * preco_m2

    return {
        "area_liquida_m2": round(area_liquida, 2),
        "margem_recorte_percent": margem_recorte_percent,
        "area_perda_m2": round(area_perda, 2),
        "area_com_recorte_m2": round(area_com_recorte, 2),
        "caixas_necessarias": caixas_necessarias,
        "area_total_comprada_m2": round(area_total_comprada, 2),
        "custo_estimado_brl": round(custo_estimado, 2),
    }


# ============================================================================
# 3. CÁLCULO DE PINTURA (LITROS E LATAS COMERCIAIS)
# ============================================================================
def calcular_pintura(
    largura_parede: float,
    altura_parede: float,
    area_aberturas: float = 0.0,
    numero_demaos: int = 2,
    rendimento_m2_por_litro: float = 10.0,
) -> Dict[str, Union[float, int]]:
    """
    Calcula litros de tinta descontando portas/janelas, multiplicando pelo número
    de demãos e otimizando a compra entre Latas (18L) e Galões (3,6L).
    """
    area_bruta = largura_parede * altura_parede
    if largura_parede <= 0 or altura_parede <= 0:
        raise ValueError("As dimensões da parede devem ser maiores que zero.")
    if area_aberturas < 0 or area_aberturas >= area_bruta:
        raise ValueError("A área de aberturas deve ser menor que a área bruta da parede.")
    if numero_demaos < 1:
        raise ValueError("O número de demãos deve ser pelo menos 1.")

    area_liquida = area_bruta - area_aberturas
    area_total_pintura = area_liquida * numero_demaos
    litros_exatos = area_total_pintura / rendimento_m2_por_litro
    litros_com_margem = litros_exatos * 1.10  # +10% reserva técnica

    # Divisão inteira (//) para latas de 18L e math.ceil para o restante em galões de 3.6L
    latas_18l = int(litros_com_margem // 18)
    restante = litros_com_margem - (latas_18l * 18)
    galoes_3_6l = math.ceil(restante / 3.6) if restante > 0 else 0

    if galoes_3_6l >= 5:
        latas_18l += 1
        galoes_3_6l = 0

    return {
        "area_bruta_m2": round(area_bruta, 2),
        "area_liquida_m2": round(area_liquida, 2),
        "area_total_demaos_m2": round(area_total_pintura, 2),
        "litros_exatos": round(litros_exatos, 2),
        "litros_com_margem": round(litros_com_margem, 2),
        "latas_18l": latas_18l,
        "galoes_3_6l": galoes_3_6l,
    }


# ============================================================================
# 4. DIMENSIONAMENTO DE AR-CONDICIONADO (CARGA TÉRMICA EM BTUs)
# ============================================================================
def calcular_btu(
    area_ambiente: float,
    incidencia_solar: str = "manha",
    numero_pessoas: int = 2,
    numero_eletronicos: int = 1,
) -> Dict[str, Union[float, int, str]]:
    """
    Calcula a carga térmica em BTU/h:
    - Sol da manhã / sombra: 600 BTU/m²
    - Sol da tarde: 800 BTU/m²
    - +600 BTU por pessoa adicional (a 1ª pessoa já entra na conta base)
    - +600 BTU por equipamento eletrônico (TV, computador, iluminação quente)
    """
    if area_ambiente <= 0:
        raise ValueError("A área do ambiente deve ser maior que zero.")
    if numero_pessoas < 1:
        raise ValueError("O ambiente deve considerar ao menos 1 pessoa.")

    fator_m2 = 800 if incidencia_solar == "tarde" else 600
    btu_area = round(area_ambiente * fator_m2)
    pessoas_adicionais = max(0, numero_pessoas - 1)
    btu_pessoas = pessoas_adicionais * 600
    btu_eletronicos = max(0, numero_eletronicos) * 600
    btu_total = btu_area + btu_pessoas + btu_eletronicos

    capacidades_comerciais = [7000, 9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000]
    capacidade_recomendada = next(
        (cap for cap in capacidades_comerciais if cap >= btu_total),
        math.ceil(btu_total / 6000) * 6000,
    )

    return {
        "btu_area": btu_area,
        "btu_pessoas": btu_pessoas,
        "btu_eletronicos": btu_eletronicos,
        "btu_total": btu_total,
        "capacidade_comercial_btu": capacidade_recomendada,
    }


if __name__ == "__main__":
    # Permite execução via linha de comando (ou chamada pelo backend Node/Express via JSON)
    if len(sys.argv) > 2 and sys.argv[1] == "--json":
        payload = json.loads(sys.argv[2])
        tipo = payload.get("tipo")
        dados = payload.get("dados", {})
        try:
            if tipo == "piso":
                saida = calcular_piso(**dados)
            elif tipo == "pintura":
                saida = calcular_pintura(**dados)
            elif tipo == "btu":
                saida = calcular_btu(**dados)
            elif tipo == "basica":
                saida = operacao_basica(**dados)
            else:
                raise ValueError(f"Tipo de cálculo desconhecido: {tipo}")
            print(json.dumps({"sucesso": True, "resultado": saida}, ensure_ascii=False))
        except Exception as exc:
            print(json.dumps({"sucesso": False, "erro": str(exc)}, ensure_ascii=False))
    else:
        print("=== Demonstração: Calculadora Técnica de Interiores (Python 3) ===")
        print("1. Piso (4.5m x 6.0m, +10% recorte):", calcular_piso(4.5, 6.0, 10, 2.0))
        print("2. Pintura (12m x 2.8m, 2 demãos):", calcular_pintura(12.0, 2.8, 3.6, 2, 10.0))
        print("3. Ar-Condicionado (18m², sol da tarde):", calcular_btu(18.0, "tarde", 2, 1))
        print("4. Matemática Básica (22 // 18):", operacao_basica(22, 18, "//"))
