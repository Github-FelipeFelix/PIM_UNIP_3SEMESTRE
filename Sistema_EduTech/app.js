// JavaScript do sistema EduTech Integrada

// formula de calculo de media da UNIP
function calcularMedia(np1, pim, np2) {
    var media = ((np1 * 4) + (pim * 2) + (np2 * 4)) / 10;
    return Math.round(media * 100) / 100; // arredonda para 2 casas
}

// atualiza os badges de situacao de cada linha da tabela
function atualizarSituacao() {
    var linhas = document.querySelectorAll('.tabela-notas tbody tr');

    for (var i = 0; i < linhas.length; i++) {
        var celulas = linhas[i].querySelectorAll('td');

        if (celulas.length < 6) continue;

        var np1 = parseFloat(celulas[1].textContent) || 0;
        var pim = parseFloat(celulas[2].textContent) || 0;
        var np2 = parseFloat(celulas[3].textContent) || 0;
        var media = calcularMedia(np1, pim, np2);

        // atualiza a media na tabela
        celulas[4].textContent = media.toFixed(1);

        // atualiza o badge de situacao
        var badge = celulas[5].querySelector('.badge');
        if (badge) {
            if (np1 < 5.0) {
                badge.textContent = 'Em Risco';
                badge.className = 'badge vermelho';
            } else if (media >= 7.0) {
                badge.textContent = 'Aprovado';
                badge.className = 'badge verde';
            } else {
                badge.textContent = 'Reprovado';
                badge.className = 'badge vermelho';
            }
        }
    }
}

// roda quando a pagina carregar
document.addEventListener('DOMContentLoaded', function() {
    atualizarSituacao();
});
