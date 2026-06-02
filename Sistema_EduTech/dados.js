// dados.js - guarda e carrega os dados do sistema no localStorage
// enquanto a API com o back em C# nao fica pronta, o navegador faz o papel do banco

var CHAVE_DADOS = 'edutech_dados';
var CHAVE_SESSAO = 'edutech_sessao';

// dados iniciais de exemplo (os mesmos do Program.cs e do banco_dados.sql)
function dadosIniciais() {
    return {
        usuarios: {
            'felipe': { senha: '1234', tipo: 'aluno',     nome: 'Felipe' },
            'marina': { senha: '1234', tipo: 'aluno',     nome: 'Marina' },
            'joao':   { senha: '1234', tipo: 'aluno',     nome: 'João' },
            'carlos': { senha: '1234', tipo: 'professor', nome: 'Carlos' },
            'admin':  { senha: '1234', tipo: 'admin',     nome: 'Administrador' }
        },
        alunos: [
            {
                login: 'felipe', ra: 'RA001', turma: 'ADS3N', frequencia: 91,
                notas: [
                    { materia: 'Banco de Dados', np1: 8.0, pim: 7.5, np2: 8.5 },
                    { materia: 'Programação OO', np1: 4.5, pim: 6.0, np2: 7.0 }
                ]
            },
            {
                login: 'marina', ra: 'RA002', turma: 'ADS3N', frequencia: 78,
                notas: [
                    { materia: 'Banco de Dados', np1: 3.0, pim: 4.0, np2: 5.0 },
                    { materia: 'Programação OO', np1: 4.0, pim: 5.0, np2: 6.0 }
                ]
            },
            {
                login: 'joao', ra: 'RA003', turma: 'ADS3N', frequencia: 95,
                notas: [
                    { materia: 'Banco de Dados', np1: 9.5, pim: 9.0, np2: 9.0 },
                    { materia: 'Programação OO', np1: 8.0, pim: 8.0, np2: 8.5 }
                ]
            }
        ],
        materias: ['Banco de Dados', 'Programação OO', 'Engenharia de Software', 'Redes de Computadores'],
        log: []
    };
}

function carregarDados() {
    var texto = localStorage.getItem(CHAVE_DADOS);
    if (!texto) {
        var dados = dadosIniciais();
        salvarDados(dados);
        return dados;
    }
    return JSON.parse(texto);
}

function salvarDados(dados) {
    localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
}

// volta tudo para os dados de exemplo
function restaurarDados() {
    salvarDados(dadosIniciais());
}

// registra uma acao no log (quem fez, o que fez e quando)
function registrarLog(usuario, acao) {
    var dados = carregarDados();
    dados.log.push({
        data: new Date().toLocaleString('pt-BR'),
        usuario: usuario,
        acao: acao
    });
    salvarDados(dados);
}

// --- sessao do usuario logado ---

function sessaoAtual() {
    var texto = localStorage.getItem(CHAVE_SESSAO);
    return texto ? JSON.parse(texto) : null;
}

// confere usuario e senha e abre a sessao
// obs: na demonstracao a senha fica simples; no back em C# ela vira hash SHA256 (Models.cs)
function fazerLogin(login, senha) {
    var dados = carregarDados();
    var usuario = dados.usuarios[login];
    if (!usuario || usuario.senha !== senha) {
        return null;
    }
    var sessao = { login: login, tipo: usuario.tipo, nome: usuario.nome };
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    registrarLog(login, 'fez login no sistema');
    return sessao;
}

function sair() {
    var sessao = sessaoAtual();
    if (sessao) {
        registrarLog(sessao.login, 'saiu do sistema');
    }
    localStorage.removeItem(CHAVE_SESSAO);
    window.location.href = 'login.html';
}

// paginas internas chamam isso no comeco; sem login (ou tipo errado) volta pro login
function exigirLogin(tipo) {
    var sessao = sessaoAtual();
    if (!sessao || (tipo && sessao.tipo !== tipo)) {
        window.location.href = 'login.html';
        return null;
    }
    return sessao;
}

// --- regras de negocio (mesmas do Models.cs) ---

// formula de calculo de media da UNIP
function calcularMedia(np1, pim, np2) {
    var media = ((np1 * 4) + (pim * 2) + (np2 * 4)) / 10;
    return Math.round(media * 100) / 100; // arredonda para 2 casas
}

function situacaoNota(nota) {
    if (nota.np1 === 0 && nota.pim === 0 && nota.np2 === 0) {
        return 'Sem Nota'; // materia recem matriculada
    }
    if (nota.np1 < 5.0) {
        return 'Em Risco';
    }
    var media = calcularMedia(nota.np1, nota.pim, nota.np2);
    return media >= 7.0 ? 'Aprovado' : 'Reprovado';
}

// cor do badge conforme a situacao
function classeSituacao(situacao) {
    if (situacao === 'Aprovado') return 'verde';
    if (situacao === 'Sem Nota') return 'cinza';
    return 'vermelho';
}

function buscarAluno(dados, login) {
    for (var i = 0; i < dados.alunos.length; i++) {
        if (dados.alunos[i].login === login) {
            return dados.alunos[i];
        }
    }
    return null;
}

function buscarNota(aluno, materia) {
    for (var i = 0; i < aluno.notas.length; i++) {
        if (aluno.notas[i].materia === materia) {
            return aluno.notas[i];
        }
    }
    return null;
}
