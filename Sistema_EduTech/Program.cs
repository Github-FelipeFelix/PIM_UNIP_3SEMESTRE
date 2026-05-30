using System;
using System.Collections.Generic;
using EduTechSystem.Models;
using EduTechSystem.Relatorios;

namespace EduTechSystem
{
    // Programa de demonstracao do sistema EduTech Integrada
    // Mostra as classes funcionando: login com hash, boletim e relatorio da turma
    // Para rodar: dotnet run
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("=========================================");
            Console.WriteLine("   EduTech Integrada - Gestao Academica");
            Console.WriteLine("=========================================");
            Console.WriteLine();

            // --- login: a senha fica salva como hash SHA256, nunca em texto ---
            Usuario professor = new Professor { Login = "carlos", Nome = "Carlos" };
            // hash SHA256 da senha "1234" (no sistema real isso vem do banco)
            professor.Senha = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";

            Console.WriteLine("Login do professor:");
            Console.WriteLine("  senha '1234'   -> " + (professor.VerificarSenha("1234") ? "acesso liberado" : "negado"));
            Console.WriteLine("  senha 'errada' -> " + (professor.VerificarSenha("errada") ? "acesso liberado" : "negado"));
            Console.WriteLine();

            // --- monta uma turma com alguns alunos e notas ---
            Turma turma = new Turma
            {
                TurmaId = "ADS3N",
                Descricao = "ADS 3 semestre",
                Periodo = "Noturno",
                AnoLetivo = 2026
            };

            Aluno felipe = new Aluno { Login = "felipe" };
            felipe.AdicionarNota(new Nota { Materia = "Banco de Dados", Np1 = 8.0, Pim = 7.5, Np2 = 8.5 });
            felipe.AdicionarNota(new Nota { Materia = "Programacao OO", Np1 = 4.5, Pim = 6.0, Np2 = 7.0 });

            Aluno marina = new Aluno { Login = "marina" };
            marina.AdicionarNota(new Nota { Materia = "Banco de Dados", Np1 = 3.0, Pim = 4.0, Np2 = 5.0 });
            marina.AdicionarNota(new Nota { Materia = "Programacao OO", Np1 = 4.0, Pim = 5.0, Np2 = 6.0 });

            Aluno joao = new Aluno { Login = "joao" };
            joao.AdicionarNota(new Nota { Materia = "Banco de Dados", Np1 = 9.5, Pim = 9.0, Np2 = 9.0 });
            joao.AdicionarNota(new Nota { Materia = "Programacao OO", Np1 = 8.0, Pim = 8.0, Np2 = 8.5 });

            turma.AdicionarAluno(felipe);
            turma.AdicionarAluno(marina);
            turma.AdicionarAluno(joao);

            // --- boletim de cada aluno (calculo pela formula da UNIP) ---
            List<double> medias = new List<double>();
            foreach (Aluno aluno in turma.GetAlunos())
            {
                Console.WriteLine("Boletim de " + aluno.Login + ":");
                foreach (Nota n in aluno.GetNotas())
                {
                    double media = aluno.CalcularMedia(n);
                    medias.Add(media);
                    string aviso = aluno.EstaEmRisco(n) ? "  <- em risco (NP1 < 5)" : "";
                    Console.WriteLine("  " + n.Materia.PadRight(18) + "media " + media + " - " + aluno.VerificarSituacao(n) + aviso);
                }
                Console.WriteLine();
            }

            // --- relatorio geral da turma ---
            RelatorioTurma rel = new RelatorioTurma();
            Console.WriteLine("----- Relatorio da turma " + turma.TurmaId + " -----");
            Console.WriteLine("Total de alunos:    " + turma.TotalAlunos());
            Console.WriteLine("Media geral:        " + rel.CalcularMediaGeral(medias));
            Console.WriteLine("Aprovados:          " + rel.ContarAprovados(medias));
            Console.WriteLine("Taxa de aprovacao:  " + rel.PercentualAprovacao(medias) + "%");

            List<string> emRisco = rel.AlunosEmRisco(turma.GetAlunos());
            string lista = emRisco.Count > 0 ? string.Join(", ", emRisco) : "nenhum";
            Console.WriteLine("Em risco em 2+ materias: " + lista);
        }
    }
}
