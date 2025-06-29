module.exports = app => {
    const usuariosController = require('./usuariosController.js');
    const { middlewareAutenticacao, middlewareUsuarioAdmin } = require('../../config/middlewares');
    const { protegerRotaPublica } = require('../../config/rateLimiter.js');

    // Rotas públicas
    app.post('/usuarios', protegerRotaPublica, usuariosController.criarUsuario);
    app.post('/usuarios/login', protegerRotaPublica, usuariosController.loginUsuario);
    app.post('/usuarios/ativar', protegerRotaPublica, usuariosController.ativarUsuario);
    app.post('/usuarios/novo-token', protegerRotaPublica, usuariosController.gerarNovoTokenUsuario);
    app.post('/usuarios/solicitar-senha', protegerRotaPublica, usuariosController.solicitarRedefinirSenha);
    app.post('/usuarios/nova-senha', protegerRotaPublica, usuariosController.redefinirSenha);

    // Rotas protegidas
    app.get('/usuarios', middlewareAutenticacao, middlewareUsuarioAdmin, usuariosController.listarUsuarios);
    app.get('/usuarios/:id', middlewareAutenticacao, usuariosController.buscarUsuario);
    app.put('/usuarios/:id', middlewareAutenticacao, usuariosController.atualizarUsuario);
    app.patch('/usuarios/:id/desativar', middlewareAutenticacao, usuariosController.desativarUsuario);
    app.delete('/usuarios/:id', middlewareAutenticacao, middlewareUsuarioAdmin, usuariosController.deletarUsuario);
    app.post('/usuarios/logout', middlewareAutenticacao, usuariosController.logoutUsuario);
}