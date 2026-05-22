using System;
using System.Collections.Generic;
using EduTechSystem.Models;

namespace EduTechSystem.Relatorios
{
    // Classe responsavel por gerar relatorios e calcular estatisticas da turma
    public class RelatorioTurma
    {
        // calcula a media geral de uma lista de notas
        public double CalcularMediaGeral(List<double> medias)
        {
            if (medias.Count == 0)
                return 0;

            double soma = 0;
            foreach (double m in medias)
            {
                soma += m;
            }

            return Math.Round(soma / medias.Count, 2);
        }

        // conta quantos alunos passaram
        public int ContarAprovados(List<double> medias)
        {
            int aprovados = 0;
            foreach (double m in medias)
            {
                if (m >= 7.0)
                    aprovados++;
            }
            return aprovados;
        }

        // calcula o percentual de aprovacao da turma
        public double PercentualAprovacao(List<double> medias)
        {
            if (medias.Count == 0)
                return 0;

            int aprovados = ContarAprovados(medias);
            return Math.Round((double)aprovados / medias.Count * 100, 1);
        }

        // retorna lista de alunos que estao em risco
        // alunos com NP1 menor que 5.0 em pelo menos 2 materias
        public List<string> AlunosEmRisco(List<Aluno> alunos)
        {
            List<string> emRisco = new List<string>();
            Aluno a_temp = new Aluno(); // instancia temporaria para usar o metodo

            foreach (Aluno a in alunos)
            {
                int qtdRisco = 0;
                foreach (Nota n in a.GetNotas())
                {
                    if (a_temp.EstaEmRisco(n))
                        qtdRisco++;
                }

                if (qtdRisco >= 2)
                    emRisco.Add(a.Login);
            }

            return emRisco;
        }
    }
}
