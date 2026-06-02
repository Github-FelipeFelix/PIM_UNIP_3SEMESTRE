// tela de login: confere usuario e senha e manda cada tipo para a tela certa

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('botao-entrar').addEventListener('click', entrar);

    // apertar Enter no campo de senha tambem entra
    document.getElementById('senha').addEventListener('keydown', function(evento) {
        if (evento.key === 'Enter') {
            entrar();
        }
    });
});

function entrar() {
    var login = document.getElementById('login').value.trim().toLowerCase();
    var senha = document.getElementById('senha').value;
    var erro = document.getElementById('erro');

    var sessao = fazerLogin(login, senha);
    if (!sessao) {
        erro.textContent = 'Usuário ou senha errados.';
        return;
    }

    // cada tipo de usuario tem a sua tela
    if (sessao.tipo === 'aluno') {
        window.location.href = 'index.html';
    } else if (sessao.tipo === 'professor') {
        window.location.href = 'professor.html';
    } else {
        window.location.href = 'admin.html';
    }
}
