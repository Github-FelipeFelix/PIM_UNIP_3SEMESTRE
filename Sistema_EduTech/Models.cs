using System;
using System.Collections.Generic;

namespace EduTechSystem.Models
{
    // Classe base que representa qualquer usuario do sistema
    // Aluno, Professor e Admin vao herdar desta classe
    public class Usuario
    {
        public string Login   { get; set; }
        public string Senha   { get; set; } // guarda o hash, nao a senha real
        public string Tipo    { get; set; } // admin, professor ou aluno
        public string Email   { get; set; }
        public bool   Ativo   { get; set; } = true;

        // metodo para verificar se a senha esta correta
        public bool VerificarSenha(string senhaDigitada)
        {
            // gera o hash da senha digitada e compara com o que esta salvo
            string hashDigitado = GerarHash(senhaDigitada);
            return hashDigitado == this.Senha;
        }

        // gera o hash SHA256 de uma string
        private string GerarHash(string texto)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(texto);
            byte[] hash  = sha.ComputeHash(bytes);
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }

    // Classe Aluno herda de Usuario (heranca)
    // tem tudo que Usuario tem, mais os dados academicos
    public class Aluno : Usuario
    {
        public string NomeCriptografado { get; set; }
        public string RaCriptografado   { get; set; }
        public string TurmaId           { get; set; }

        // lista de notas do aluno (encapsulamento)
        private List<Nota> notas = new List<Nota>();

        public Aluno()
        {
            Tipo = "aluno";
        }

        // adiciona uma nota na lista
        public void AdicionarNota(Nota n)
        {
            notas.Add(n);
        }

        // retorna todas as notas
        public List<Nota> GetNotas()
        {
            return notas;
        }

        // calcula a media usando a formula da UNIP
        // formula: (NP1 x 4 + PIM x 2 + NP2 x 4) / 10
        public double CalcularMedia(Nota n)
        {
            double media = ((n.Np1 * 4) + (n.Pim * 2) + (n.Np2 * 4)) / 10;
            return Math.Round(media, 2);
        }

        // verifica se o aluno passou ou nao
        public string VerificarSituacao(Nota n)
        {
            double media = CalcularMedia(n);

            if (media >= 7.0)
            {
                return "Aprovado";
            }
            else
            {
                return "Reprovado";
            }
        }

        // verifica se o aluno esta em risco de reprovar
        // se a NP1 for menor que 5, o aluno precisa de atencao
        public bool EstaEmRisco(Nota n)
        {
            return n.Np1 < 5.0;
        }
    }

    // Classe Professor herda de Usuario
    public class Professor : Usuario
    {
        public string ProfessorId  { get; set; }
        public string Nome         { get; set; }
        public string Especialidade { get; set; }

        public Professor()
        {
            Tipo = "professor";
        }
    }

    // Classe Admin herda de Usuario
    public class Admin : Usuario
    {
        public Admin()
        {
            Tipo = "admin";
        }
    }

    // Classe para guardar as notas de uma materia
    public class Nota
    {
        public int    MateriaId { get; set; }
        public string Materia   { get; set; }
        public double Np1       { get; set; }
        public double Np2       { get; set; }
        public double Pim       { get; set; }
    }

    // Classe que representa uma turma
    public class Turma
    {
        public string TurmaId   { get; set; }
        public string Descricao { get; set; }
        public string Periodo   { get; set; }
        public int    AnoLetivo { get; set; }

        // lista de alunos da turma
        private List<Aluno> alunos = new List<Aluno>();

        // adiciona um aluno na turma
        public void AdicionarAluno(Aluno a)
        {
            a.TurmaId = this.TurmaId;
            alunos.Add(a);
        }

        // retorna quantos alunos tem na turma
        public int TotalAlunos()
        {
            return alunos.Count;
        }

        // retorna a lista de alunos
        public List<Aluno> GetAlunos()
        {
            return alunos;
        }
    }
}
