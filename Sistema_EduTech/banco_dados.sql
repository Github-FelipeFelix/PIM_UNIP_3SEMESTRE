-- Banco de dados do sistema EduTech Integrada
-- Criado para o PIM III - UNIP ADS 2026
-- Usando SQL Server

CREATE DATABASE EduTechDB;
GO
USE EduTechDB;
GO

-- tabela de usuarios do sistema
CREATE TABLE Usuarios (
    usuario_login  VARCHAR(50)  NOT NULL,
    hash_senha     VARCHAR(64)  NOT NULL,
    tipo           VARCHAR(20)  NOT NULL, -- pode ser: admin, professor ou aluno
    email          VARCHAR(100) NULL,
    ativo          BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_Usuarios PRIMARY KEY (usuario_login)
);

-- tabela de turmas
CREATE TABLE Turmas (
    turma_id    VARCHAR(20)  NOT NULL,
    descricao   VARCHAR(100) NOT NULL,
    periodo     VARCHAR(20)  NOT NULL,
    ano_letivo  INT          NOT NULL,
    CONSTRAINT PK_Turmas PRIMARY KEY (turma_id)
);

-- tabela de professores
CREATE TABLE Professores (
    professor_id   VARCHAR(50)  NOT NULL,
    nome           VARCHAR(100) NOT NULL,
    especialidade  VARCHAR(100) NULL,
    usuario_login  VARCHAR(50)  NOT NULL,
    CONSTRAINT PK_Professores PRIMARY KEY (professor_id),
    CONSTRAINT FK_Prof_Usuario FOREIGN KEY (usuario_login)
        REFERENCES Usuarios(usuario_login)
);

-- tabela de alunos
-- os dados pessoais ficam criptografados por causa da LGPD
CREATE TABLE Alunos (
    ra_criptografado    VARCHAR(255) NOT NULL,
    nome_criptografado  VARCHAR(255) NOT NULL,
    turma_id            VARCHAR(20)  NULL,
    usuario_login       VARCHAR(50)  NOT NULL,
    CONSTRAINT PK_Alunos PRIMARY KEY (ra_criptografado),
    CONSTRAINT FK_Aluno_Turma   FOREIGN KEY (turma_id)
        REFERENCES Turmas(turma_id),
    CONSTRAINT FK_Aluno_Usuario FOREIGN KEY (usuario_login)
        REFERENCES Usuarios(usuario_login)
);

-- tabela de materias
CREATE TABLE Materias (
    materia_id    INT         IDENTITY(1,1) NOT NULL,
    nome          VARCHAR(80) NOT NULL,
    carga_horaria INT         NOT NULL DEFAULT 40,
    CONSTRAINT PK_Materias PRIMARY KEY (materia_id)
);

-- tabela de notas
-- a media ja e calculada automaticamente pelo banco
CREATE TABLE Notas (
    id_nota          INT           IDENTITY(1,1) NOT NULL,
    ra_criptografado VARCHAR(255)  NOT NULL,
    materia_id       INT           NOT NULL,
    np1              DECIMAL(4,2)  NOT NULL DEFAULT 0.00,
    np2              DECIMAL(4,2)  NOT NULL DEFAULT 0.00,
    pim              DECIMAL(4,2)  NOT NULL DEFAULT 0.00,
    media_final AS (((np1 * 4) + (pim * 2) + (np2 * 4)) / 10) PERSISTED,
    CONSTRAINT PK_Notas PRIMARY KEY (id_nota),
    CONSTRAINT FK_Nota_Aluno   FOREIGN KEY (ra_criptografado)
        REFERENCES Alunos(ra_criptografado),
    CONSTRAINT FK_Nota_Materia FOREIGN KEY (materia_id)
        REFERENCES Materias(materia_id)
);

-- tabela de log para registrar acoes no sistema
CREATE TABLE LogsAcesso (
    log_id        INT          IDENTITY(1,1) NOT NULL,
    usuario_login VARCHAR(50)  NOT NULL,
    acao          VARCHAR(200) NOT NULL,
    data_hora     DATETIME     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_Logs PRIMARY KEY (log_id)
);

-- indices para deixar as consultas mais rapidas
CREATE INDEX IX_Notas_RA    ON Notas(ra_criptografado);
CREATE INDEX IX_Alunos_Turma ON Alunos(turma_id);
GO

-- inserindo as materias do curso
INSERT INTO Materias (nome, carga_horaria) VALUES
    ('Matematica',                    80),
    ('Lingua Portuguesa',             60),
    ('Algoritmos e Logica',           80),
    ('Engenharia de Software',        60),
    ('Banco de Dados',                80),
    ('Programacao Orientada a Obj.',  80),
    ('Desenvolvimento Web',           60),
    ('Redes de Computadores',         40),
    ('Ingles Tecnico',                40),
    ('Gestao de Projetos',            40);
GO
