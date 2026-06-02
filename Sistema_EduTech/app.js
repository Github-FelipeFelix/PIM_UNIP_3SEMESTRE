// JavaScript do painel do aluno
// monta o boletim e os cards com os dados do aluno logado

document.addEventListener('DOMContentLoaded', function() {
    var sessao = exigirLogin('aluno');
    if (!sessao) return;

    var dados = carregarDados();
    var aluno = buscarAluno(dados, sessao.login);
    if (!aluno) return;

    document.getElementById('aluno-info').textContent =
        sessao.nome + ' — ' + aluno.ra + ' — Turma ' + aluno.turma;

    montarBoletim(aluno);
    montarCards(aluno);
    montarRelatorio(dados, aluno);

    document.getElementById('num-colegas').textContent = dados.alunos.length;
});

// preenche a tabela do boletim
function montarBoletim(aluno) {
    var corpo = document.getElementById('corpo-boletim');
    corpo.innerHTML = '';

    for (var i = 0; i < aluno.notas.length; i++) {
        var nota = aluno.notas[i];
        var media = calcularMedia(nota.np1, nota.pim, nota.np2);
        var situacao = situacaoNota(nota);

        var linha = document.createElement('tr');
        linha.innerHTML =
            '<td data-label="Matéria">' + nota.materia + '</td>' +
            '<td data-label="NP1">' + nota.np1.toFixed(1) + '</td>' +
            '<td data-label="PIM">' + nota.pim.toFixed(1) + '</td>' +
            '<td data-label="NP2">' + nota.np2.toFixed(1) + '</td>' +
            '<td data-label="Média">' + media.toFixed(1) + '</td>' +
            '<td data-label="Situação"><span class="badge ' + classeSituacao(situacao) + '">' + situacao + '</span></td>';
        corpo.appendChild(linha);
    }
}

// preenche os cards de resumo do desempenho
function montarCards(aluno) {
    var somaMedias = 0;
    var qtdMaterias = 0;
    var emRisco = 0;

    for (var i = 0; i < aluno.notas.length; i++) {
        var nota = aluno.notas[i];
        if (situacaoNota(nota) === 'Sem Nota') continue; // materia recem matriculada nao conta

        somaMedias += calcularMedia(nota.np1, nota.pim, nota.np2);
        qtdMaterias++;
        if (nota.np1 < 5.0) emRisco++;
    }

    // media geral arredondada para 1 casa
    var mediaGeral = qtdMaterias > 0 ? Math.round((somaMedias / qtdMaterias) * 10) / 10 : 0;

    document.getElementById('num-media').textContent = mediaGeral.toFixed(1);
    document.getElementById('info-media').textContent = mediaGeral >= 7.0 ? 'Aprovado' : 'Abaixo da média';

    document.getElementById('num-risco').textContent = emRisco;
    document.getElementById('info-risco').textContent = emRisco > 0 ? 'Precisa de atenção' : 'Tudo em dia';

    document.getElementById('num-freq').textContent = aluno.frequencia + '%';
    document.getElementById('info-freq').textContent = aluno.frequencia >= 75 ? 'Dentro do limite' : 'Abaixo do mínimo';
}

// compara a media do aluno com a media da turma em cada materia
function montarRelatorio(dados, aluno) {
    var corpo = document.getElementById('corpo-relatorio');
    corpo.innerHTML = '';

    for (var i = 0; i < aluno.notas.length; i++) {
        var nota = aluno.notas[i];
        var temNota = situacaoNota(nota) !== 'Sem Nota';
        var minhaMedia = calcularMedia(nota.np1, nota.pim, nota.np2);

        // media da turma nessa materia (so de quem tem nota lancada)
        var soma = 0;
        var qtd = 0;
        for (var j = 0; j < dados.alunos.length; j++) {
            var notaColega = buscarNota(dados.alunos[j], nota.materia);
            if (!notaColega || situacaoNota(notaColega) === 'Sem Nota') continue;
            soma += calcularMedia(notaColega.np1, notaColega.pim, notaColega.np2);
            qtd++;
        }
        var mediaTurma = qtd > 0 ? soma / qtd : 0;

        var comparacao = '-';
        var classe = 'cinza';
        if (temNota && qtd > 0) {
            if (minhaMedia >= mediaTurma) {
                comparacao = 'Acima da turma';
                classe = 'verde';
            } else {
                comparacao = 'Abaixo da turma';
                classe = 'vermelho';
            }
        }

        var linha = document.createElement('tr');
        linha.innerHTML =
            '<td data-label="Matéria">' + nota.materia + '</td>' +
            '<td data-label="Minha Média">' + (temNota ? minhaMedia.toFixed(1) : '-') + '</td>' +
            '<td data-label="Média da Turma">' + (qtd > 0 ? mediaTurma.toFixed(1) : '-') + '</td>' +
            '<td data-label="Comparação"><span class="badge ' + classe + '">' + comparacao + '</span></td>';
        corpo.appendChild(linha);
    }
}
