# Script de analise de dados do sistema EduTech Integrada
# Usado para identificar alunos em risco e gerar estatisticas da turma
# PIM III - UNIP ADS 2026

import json

# formula de media da UNIP
def calcular_media(np1, pim, np2):
    media = ((np1 * 4) + (pim * 2) + (np2 * 4)) / 10
    return round(media, 2)

# verifica se o aluno esta em risco (NP1 menor que 5)
def esta_em_risco(np1):
    return np1 < 5.0

# verifica se o aluno passou
def aprovado(media):
    return media >= 7.0

# calcula as estatisticas de uma turma em uma materia
def estatisticas_turma(lista_notas):
    if len(lista_notas) == 0:
        return None

    medias = []
    aprovados = 0
    em_risco = 0

    for nota in lista_notas:
        media = calcular_media(nota['np1'], nota['pim'], nota['np2'])
        medias.append(media)

        if aprovado(media):
            aprovados += 1

        if esta_em_risco(nota['np1']):
            em_risco += 1

    media_turma = round(sum(medias) / len(medias), 2)
    taxa_aprovacao = round(aprovados / len(lista_notas) * 100, 1)

    resultado = {
        'media_turma': media_turma,
        'maior_media': max(medias),
        'menor_media': min(medias),
        'aprovados': aprovados,
        'reprovados': len(lista_notas) - aprovados,
        'em_risco': em_risco,
        'taxa_aprovacao': taxa_aprovacao
    }

    return resultado

# identifica quais alunos estao em risco em varias materias
def alunos_em_risco(dados):
    # conta quantas materias cada aluno esta em risco
    contagem = {}

    for registro in dados:
        ra = registro['ra']
        if esta_em_risco(registro['np1']):
            if ra not in contagem:
                contagem[ra] = 0
            contagem[ra] += 1

    # alunos com risco em 2 ou mais materias precisam de atencao
    lista_risco = []
    for ra, qtd in contagem.items():
        if qtd >= 2:
            lista_risco.append(ra)

    return lista_risco

# carrega os dados de um arquivo json
def carregar_dados(caminho):
    try:
        with open(caminho, 'r', encoding='utf-8') as arquivo:
            dados = json.load(arquivo)
        return dados
    except FileNotFoundError:
        print(f'Arquivo {caminho} nao encontrado.')
        return []
    except Exception as e:
        print(f'Erro ao ler o arquivo: {e}')
        return []

# exemplo de uso
if __name__ == '__main__':
    # dados de exemplo para testar
    notas_exemplo = [
        {'ra': 'RA001', 'materia': 'Banco de Dados',  'np1': 8.0, 'np2': 8.5, 'pim': 7.5},
        {'ra': 'RA001', 'materia': 'Programacao OO',  'np1': 4.5, 'np2': 7.0, 'pim': 6.0},
        {'ra': 'RA002', 'materia': 'Banco de Dados',  'np1': 3.0, 'np2': 5.0, 'pim': 4.0},
        {'ra': 'RA002', 'materia': 'Programacao OO',  'np1': 4.0, 'np2': 6.0, 'pim': 5.0},
        {'ra': 'RA003', 'materia': 'Banco de Dados',  'np1': 9.5, 'np2': 9.0, 'pim': 9.0},
        {'ra': 'RA003', 'materia': 'Programacao OO',  'np1': 8.0, 'np2': 8.5, 'pim': 8.0},
    ]

    # filtra so banco de dados para ver as estatisticas
    bd = [n for n in notas_exemplo if n['materia'] == 'Banco de Dados']
    stats = estatisticas_turma(bd)

    print('=== Estatisticas - Banco de Dados ===')
    print(f'Media da turma: {stats["media_turma"]}')
    print(f'Taxa de aprovacao: {stats["taxa_aprovacao"]}%')
    print(f'Alunos em risco: {stats["em_risco"]}')

    print()
    risco = alunos_em_risco(notas_exemplo)
    if risco:
        print(f'ATENCAO - Alunos em risco alto: {", ".join(risco)}')
    else:
        print('Nenhum aluno em risco alto.')
