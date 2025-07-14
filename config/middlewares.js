const bodyParser = require('body-parser');
const cors = require('cors');
const usuariosService = require('../api/usuarios/usuariosService');
const { verificarToken } = require('../utils/cript');
const { resErroClient } = require('../utils/retornoHttp');
const { registrarViolacao } = require('../api/usuarios/usuariosController');

const configurarMiddleware = (app) => {
    // Transformar o body em JSON e permitir URLs codificadas
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    // Necessario para confirar em proxies (ngnix, load balancer, etc...)
    app.set('trust proxy', true);

    // Configurar CORS
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
}

// Middleware de autenticação JWT
const middlewareAutenticacao = async  (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return resErroClient(res, "Acesso negado. Token não fornecido.", 401);
    }

    try {
        const decoded = verificarToken(token);
        if (decoded === null) {
            return resErroClient(res, "Token inválido ou expirado.", 403);    
        }

        const sessao = await usuariosService.verificarTokenAutenticacao(decoded.jti);
        if (!sessao) {
            // Emite um alerta no console de tentativa de conexão de token revogado,
            // isto poderia evoluir para um painel de auditoria
            await registrarViolacao(req, `Token revogado usado — JTI: ${decoded.jti}`);
           
            return resErroClient(res, "Sessão inválida ou expirada.", 401);    
        }

        if (sessao.ipOrigem !== req.ip || sessao.userAgent !== req.headers['user-agent']) {
            // Emite um alerta no console de token utilizado por outra forma tipo interceptado,
            // isto poderia evoluir para um painel de auditoria
            await registrarViolacao(req, `Tentativa de uso de token com origem diferente. IP esperado: ${sessao.ipOrigem}`);

            return res.status(401).json({ mensagem: 'Token utilizado de origem não reconhecida.' });
        }

        req.user = decoded; // Adiciona dados do usuário à requisição
    } catch (erro) {
        return resErroClient(res, "Token inválido ou expirado.", 403);
    }

    next();
}

const middlewareUsuarioAdmin = async (req, res, next) => {
    const usuarioLogado = req.user;

    // Busca o status real do usuário no banco
    const retorno = await usuariosService.buscarUsuario(usuarioLogado.id);

    if (!retorno || !retorno.usuario || !retorno.usuario.usuarioAdmin || !retorno.usuario.ativo) {
        await registrarViolacao(req, "Acesso negado. Tentativa de ação ADMIN.");
        return resErroClient(res, "Acesso negado. Você não tem permissão para executar esta ação.", 403);
    }

    next();
};

module.exports = { configurarMiddleware, middlewareAutenticacao, middlewareUsuarioAdmin };