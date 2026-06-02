// painel do administrador: resumo da turma, matriculas e log de acoes

document.addEventListener('DOMContentLoaded', function() {
    var sessao = exigirLogin('admin');
    if (!sessao) return;

    document.getElementById('botao-matricular').addEventListener('click', matricular);
    document.getElementById('botao-restaurar').addEventListener('click', restaurar);

    montarTudo();
});

function montarTudo() {
    var dados = carregarDados();
    montarCards(dados);
    montarSelects(dados);
    montarMatriculas(dados);
    montarLog(dados);
}

// cards com as estatisticas da turma (mesmas contas do Relatorios.cs)
function montarCards(dados) {
    var medias = [];
    for (var i = 0; i < dados.alunos.length; i++) {
        var notas = dados.alunos[i].notas;
        for (var j = 0; j < notas.length; j++) {
            if (situacaoNota(notas[j]) === 'Sem Nota') continue; // sem nota lancada fica fora da conta
            medias.push(calcularMedia(notas[j].np1, notas[j].pim, notas[j].np2));
        }
    }

    var soma = 0;
    var aprovados = 0;
    for (var k = 0; k < medias.length; k++) {
        soma += medias[k];
        if (medias[k] >= 7.0) aprovados++;
    }

    var mediaGeral = medias.length > 0 ? soma / medias.length : 0;
    var taxa = medias.length > 0 ? Math.round((aprovados / medias.length) * 100) : 0;

    document.getElementById('num-alunos').textContent = dados.alunos.length;
    document.getElementById('num-media').textContent = mediaGeral.toFixed(2);
    document.getElementById('num-aprovacao').textContent = taxa + '%';

    // alunos em risco em 2 ou mais materias (mesma regra do analise_dados.py)
    var nomesRisco = [];
    for (var a = 0; a < dados.alunos.length; a++) {
        var qtd = 0;
        for (var n = 0; n < dados.alunos[a].notas.length; n++) {
            if (situacaoNota(dados.alunos[a].notas[n]) === 'Em Risco') qtd++;
        }
        if (qtd >= 2) {
            nomesRisco.push(dados.usuarios[dados.alunos[a].login].nome);
        }
    }

    document.getElementById('num-risco').textContent = nomesRisco.length;
    document.getElementById('info-risco').textContent =
        nomesRisco.length > 0 ? nomesRisco.join(', ') : 'Nenhum aluno';
}

// preenche os selects de aluno e materia
function montarSelects(dados) {
    var selectAluno = document.getElementById('select-aluno');
    var selectMateria = document.getElementById('select-materia');
    selectAluno.innerHTML = '';
    selectMateria.innerHTML = '';

    for (var i = 0; i < dados.alunos.length; i++) {
        var opcao = document.createElement('option');
        opcao.value = dados.alunos[i].login;
        opcao.textContent = dados.usuarios[dados.alunos[i].login].nome;
        selectAluno.appendChild(opcao);
    }

    for (var j = 0; j < dados.materias.length; j++) {
        var opcaoM = document.createElement('option');
        opcaoM.value = dados.materias[j];
        opcaoM.textContent = dados.materias[j];
        selectMateria.appendChild(opcaoM);
    }
}

// tabela de alunos com as materias em que estao matriculados
function montarMatriculas(dados) {
    var corpo = document.getElementById('corpo-matriculas');
    corpo.innerHTML = '';

    for (var i = 0; i < dados.alunos.length; i++) {
        var aluno = dados.alunos[i];
        var nomes = [];
        for (var j = 0; j < aluno.notas.length; j++) {
            nomes.push(aluno.notas[j].materia);
        }

        var linha = document.createElement('tr');
        linha.innerHTML =
            '<td data-label="Aluno">' + dados.usuarios[aluno.login].nome + '</td>' +
            '<td data-label="RA">' + aluno.ra + '</td>' +
            '<td data-label="Matérias matriculadas">' + nomes.join(', ') + '</td>';
        corpo.appendChild(linha);
    }
}

// matricula o aluno escolhido na materia escolhida (com notas zeradas)
function matricular() {
    var dados = carregarDados();
    var login = document.getElementById('select-aluno').value;
    var materia = document.getElementById('select-materia').value;
    var msg = document.getElementById('msg-matricula');

    var aluno = buscarAluno(dados, login);
    if (buscarNota(aluno, materia)) {
        msg.textContent = 'O aluno já está matriculado nessa matéria.';
        msg.className = 'msg-erro';
        return;
    }

    aluno.notas.push({ materia: materia, np1: 0, pim: 0, np2: 0 });
    salvarDados(dados);

    var sessao = sessaoAtual();
    registrarLog(sessao.login, 'matriculou ' + dados.usuarios[login].nome + ' em ' + materia);

    msg.textContent = 'Matrícula feita!';
    msg.className = 'msg-ok';
    setTimeout(function() { msg.textContent = ''; }, 3000);

    montarTudo();
}

// tabela do log, do mais recente para o mais antigo
function montarLog(dados) {
    var corpo = document.getElementById('corpo-log');
    corpo.innerHTML = '';

    if (dados.log.length === 0) {
        corpo.innerHTML = '<tr><td colspan="3">Nenhuma ação registrada ainda.</td></tr>';
        return;
    }

    for (var i = dados.log.length - 1; i >= 0; i--) {
        var registro = dados.log[i];
        var linha = document.createElement('tr');
        linha.innerHTML =
            '<td data-label="Data/Hora">' + registro.data + '</td>' +
            '<td data-label="Usuário">' + registro.usuario + '</td>' +
            '<td data-label="Ação">' + registro.acao + '</td>';
        corpo.appendChild(linha);
    }
}

// volta os dados de exemplo (bom para resetar antes de uma demonstracao)
function restaurar() {
    if (!confirm('Isso apaga as alterações e volta os dados de exemplo. Continuar?')) {
        return;
    }
    restaurarDados();

    var sessao = sessaoAtual();
    registrarLog(sessao.login, 'restaurou os dados de exemplo');

    montarTudo();
}
