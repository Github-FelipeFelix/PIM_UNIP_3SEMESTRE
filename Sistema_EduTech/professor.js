// diario eletronico do professor: lancar e salvar notas
// a media e a situacao recalculam na hora que o professor digita

var materiaAtual = '';

document.addEventListener('DOMContentLoaded', function() {
    var sessao = exigirLogin('professor');
    if (!sessao) return;

    document.getElementById('prof-info').textContent =
        'Professor(a) ' + sessao.nome + ' — Turma ADS3N';

    // preenche o select com as materias
    var dados = carregarDados();
    var select = document.getElementById('select-materia');
    for (var i = 0; i < dados.materias.length; i++) {
        var opcao = document.createElement('option');
        opcao.value = dados.materias[i];
        opcao.textContent = dados.materias[i];
        select.appendChild(opcao);
    }

    materiaAtual = select.value;
    select.addEventListener('change', function() {
        materiaAtual = select.value;
        montarDiario();
    });

    document.getElementById('botao-salvar').addEventListener('click', salvarNotas);

    // recalcula a linha quando qualquer nota muda
    document.getElementById('corpo-diario').addEventListener('input', function(evento) {
        var linha = evento.target.closest('tr');
        if (linha) {
            atualizarLinha(linha);
        }
    });

    montarDiario();
});

// monta a tabela com um input para cada nota
function montarDiario() {
    var dados = carregarDados();
    var corpo = document.getElementById('corpo-diario');
    corpo.innerHTML = '';

    for (var i = 0; i < dados.alunos.length; i++) {
        var aluno = dados.alunos[i];
        var nota = buscarNota(aluno, materiaAtual);
        if (!nota) continue; // aluno nao matriculado nessa materia

        var nome = dados.usuarios[aluno.login].nome;
        var linha = document.createElement('tr');
        linha.setAttribute('data-login', aluno.login);
        linha.innerHTML =
            '<td data-label="Aluno">' + nome + '</td>' +
            '<td data-label="RA">' + aluno.ra + '</td>' +
            '<td data-label="NP1"><input class="nota-input" type="number" min="0" max="10" step="0.5" value="' + nota.np1 + '"></td>' +
            '<td data-label="PIM"><input class="nota-input" type="number" min="0" max="10" step="0.5" value="' + nota.pim + '"></td>' +
            '<td data-label="NP2"><input class="nota-input" type="number" min="0" max="10" step="0.5" value="' + nota.np2 + '"></td>' +
            '<td data-label="Média" class="celula-media"></td>' +
            '<td data-label="Situação"><span class="badge cinza"></span></td>';
        corpo.appendChild(linha);
        atualizarLinha(linha);
    }

    // materia sem ninguem matriculado
    if (corpo.children.length === 0) {
        corpo.innerHTML = '<tr><td colspan="7">Nenhum aluno matriculado nessa matéria ainda. ' +
            'A matrícula é feita na tela do administrador.</td></tr>';
    }
}

// le os tres inputs de uma linha da tabela
function lerLinha(linha) {
    var inputs = linha.querySelectorAll('input');
    return {
        np1: parseFloat(inputs[0].value) || 0,
        pim: parseFloat(inputs[1].value) || 0,
        np2: parseFloat(inputs[2].value) || 0
    };
}

// atualiza a media e o badge de uma linha
function atualizarLinha(linha) {
    var nota = lerLinha(linha);
    var media = calcularMedia(nota.np1, nota.pim, nota.np2);
    var situacao = situacaoNota(nota);

    linha.querySelector('.celula-media').textContent = media.toFixed(1);

    var badge = linha.querySelector('.badge');
    badge.textContent = situacao;
    badge.className = 'badge ' + classeSituacao(situacao);
}

// grava as notas da materia atual no localStorage
function salvarNotas() {
    var dados = carregarDados();
    var linhas = document.querySelectorAll('#corpo-diario tr');

    for (var i = 0; i < linhas.length; i++) {
        var login = linhas[i].getAttribute('data-login');
        var valores = lerLinha(linhas[i]);

        var aluno = buscarAluno(dados, login);
        var nota = buscarNota(aluno, materiaAtual);
        if (nota) {
            nota.np1 = valores.np1;
            nota.pim = valores.pim;
            nota.np2 = valores.np2;
        }
    }

    salvarDados(dados);

    var sessao = sessaoAtual();
    registrarLog(sessao.login, 'lançou notas de ' + materiaAtual);

    var msg = document.getElementById('msg');
    msg.textContent = 'Notas salvas!';
    setTimeout(function() { msg.textContent = ''; }, 3000);
}
