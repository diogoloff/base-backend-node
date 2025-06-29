const db = require('../../config/conexao');
const { estaVazio, trataErro } = require("../../utils/generica");
const { executarTransacao } = require("../../utils/bancoDados");
const { criarHash, gerarToken, randomicoUUID } = require('../../utils/cript');

/**
 * Recupera todos os usuários do banco.
 *
 * @returns {Array} - Lista de usuários.
 */
const listarUsuarios = async () => {
    try {
        const usuarios = await db('usuarios')
            .select('id', 'nome', 'sobreNome', 'email', 'usuarioAdmin', 'ativo', 'banido', 'tema', 'dataCadastro', 'ultimoAcesso', 'ultimaAlteracao', 'avatar');

        return { status: 200, mensagem: "Consulta efetuada!", usuarios };
    } catch (erro) {
        return { status: 500, mensagem: trataErro(erro, "Erro interno ao consultar usuário!"), erro: true }
    }  
};

/**
 * Busca usuário por id.
 *
 * @param {number} usuarioId - ID do usuário.
 * @returns {object} Dados do usuário.
 */
const buscarUsuario = async (usuarioId) => {
    try {
        const usuario = await db('usuarios')
            .select('id', 'nome', 'sobreNome', 'email', 'usuarioAdmin', 'ativo', 'banido', 'tema', 'dataCadastro', 'ultimoAcesso', 'ultimaAlteracao', 'avatar', 'senhaHash')
            .where({ id: usuarioId })
            .first();

        return { status: 200, mensagem: "Consulta efetuada!", usuario };
    } catch (erro) {
        return { status: 500, mensagem: trataErro(erro, "Erro interno ao consultar usuário!"), erro: true }
    }  
};

/**
 * Busca usuário por e-mail.
 *
 * @param {string} email - Email do usuário.
 * @returns {object} Dados do usuário.
 */
const buscarPorEmail = async (email) => {
     return await db("usuarios")
        .select('id', 'nome', 'sobreNome', 'email', 'usuarioAdmin', 'ativo', 'banido', 'tema', 'dataCadastro', 'ultimoAcesso', 'ultimaAlteracao', 'avatar', 'senhaHash')
        .where({ email })
        .first();
};

/**
 * Cria um usuário.
 *
 * @param {object} dadosUsuario - Dados do usuário.
 * @returns {object} Dados da inclusão.
 */
const criarUsuario = async (dadosUsuario) => {
    return executarTransacao(async (trx) => {
        dadosUsuario.senhaHash = await criarHash(dadosUsuario.senha, 10);
        delete dadosUsuario.senha;

        const [novoUsuarioId] = await trx('usuarios')
            .insert({ ...dadosUsuario, dataCadastro: db.fn.now(), ativo: 0 });

        return { status: 201, mensagem: "Usuário criado com sucesso!", idUsuario: novoUsuarioId };
    },  "Erro interno ao criar usuário.");
};

/**
 * Atualiza um usuário.
 *
 * @param {number} usuarioId - Id do usuário.
 * @param {object} dadosUsuario - Dados do usuário.
 * @returns {object} Dados da alteração.
 */
const atualizarUsuario = async (usuarioId, dadosUsuario) => {
    return executarTransacao(async (trx) => {

        if (!estaVazio(dadosUsuario.senha)) {
            dadosUsuario.senhaHash = await criarHash(dadosUsuario.senha, 10);
            delete dadosUsuario.senha;    
        }

        const usuarioAlterado = await trx('usuarios')
            .update({ ...dadosUsuario, ultimaAlteracao: db.fn.now() })
            .where({ id: usuarioId });

        return { status: 200, mensagem: "Dados do usuário atualizados com sucesso!", usuarioAlterado };
    },  "Erro interno ao atualizar usuário.");
};

/**
 * Ativa um usuário.
 *
 * @param {number} usuarioId - Id do usuário.
 * @returns {object} Dados da ativação.
 */
const ativarUsuario = async (usuarioId) => {
    return executarTransacao(async (trx) => {
        await trx('usuarios')
            .where({ id: usuarioId })
            .update({ ativo: 1 });

        return { status: 200, mensagem: "Usuário ativado com sucesso!" };
    }, "Erro interno em ativar usuário.");
};


/**
 * Desativa um usuário.
 *
 * @param {number} usuarioId - Id do usuário.
 * @returns {object} Dados da desativação.
 */
const desativarUsuario = async (usuarioId) => {
    return executarTransacao(async (trx) => {
        await trx('usuarios')
            .where({ id: usuarioId })
            .update({ ativo: 0 });

        return { status: 200, mensagem: "Usuário desativado com sucesso!" };
    }, "Erro interno em desativar usduário.");
};

/**
 * Busca token por código do token.
 *
 * @param {number} idUsuario - Id usuário.
 * @returns {object} Dados da deleção.
 */
const deletarUsuario = async (idUsuario) => {
    return executarTransacao(async (trx) => {
        await trx("usuarios")
            .where({ id: idUsuario })
            .del();

        return { status: 200, mensagem: "Usuário deletado com sucesso!" };
    }, "Erro interno ao deletar usuário.");
};

/**
 * Busca token por código do token.
 *
 * @param {string} token - Código do token.
 * @returns {object} Dados do token.
 */
const buscarPorToken = async (token) => {
    return await db("usuariostokens")
        .select('id', 'usuarioId', 'codigoToken', 'validadeToken', 'usado', 'tipo')
        .where({ codigoToken: token })
        .first();
};

/**
 * Verifica se o token de cadastro esta ativo.
 *
 * @param {string} token - Código do token.
 * @param {string} email - Email do usuario.
 * @returns {object} Dados do token.
 */
const verificarTokenAtivacao = async (token, email) => {
    return await db('usuariostokens')
        .select('usuariostokens.id', 'usuariostokens.usuarioId', 'usuarios.nome')
        .join('usuarios', 'usuarios.id', '=', 'usuariostokens.usuarioId')
        .where({ 'usuariostokens.codigoToken': token, 'usuarios.email': email, 'usuariostokens.usado': 0, 'usuariostokens.tipo': 0 })
        .andWhere('usuariostokens.validadeToken', '>', db.fn.now())        
        .first();
};

/**
 * Verifica se o token de recuperação de senha esta ativo.
 *
 * @param {string} token - Código do token.
 * @param {string} email - Email do usuario.
 * @returns {object} Dados do token.
 */
const verificarTokenSenha = async (token, email) => {
    return await db('usuariostokens')
        .select('usuariostokens.id', 'usuariostokens.usuarioId', 'usuarios.nome')
        .join('usuarios', 'usuarios.id', '=', 'usuariostokens.usuarioId')
        .where({ 'usuariostokens.codigoToken': token, 'usuarios.email': email, 'usuariostokens.usado': 0, 'usuariostokens.tipo': 1 })
        .andWhere('usuariostokens.validadeToken', '>', db.fn.now())       
        .first();
};

/**
 * Atualiza o token como utilizado.
 *
 * @param {number} tokenId - ID do token.
 * @returns {object} Dados da atualização.
 */
const marcarTokenComoUsado = async (tokenId) => {
    return executarTransacao(async (trx) => {
        return await trx('usuariostokens')
            .where({ id: tokenId })
            .update({ usado: 1 });
    }, "Erro interno ao atualizar token.");
};

/**
 * Salva um novo token.
 *
 * @param {object} dadosToken - Dados do token.
 * @returns {object} Dados da atualização.
 */
const salvarToken = async (dadosToken) => {    
    return executarTransacao(async (trx) => {
        const [novoTokenId] = await trx('usuariostokens')
            .insert(dadosToken);

        return { status: 201, mensagem: "Token criado com sucesso!", idToken: novoTokenId };
    },  "Erro interno ao criar token.");
};

/**
 * Gera um token JWT para autenticação do usuário.
 *
 * @param {number} usuarioId - ID do usuário autenticado.
 * @param {string} email - E-mail do usuário autenticado.
 * @param {boolean} admin - Indica se o usuário é.
 * @param {Request} req - Passa a requisição.
 * @returns {object} Token gerado e status da autenticação.
 */
const gerarTokenAutenticacao = async (usuarioId, email, admin, req) => {
    return executarTransacao(async (trx) => {

        const jti = randomicoUUID();
        const duracaoEmSegundos = 60 * 60; // 1h
        const expDataHora = Math.floor(Date.now() / 1000) + duracaoEmSegundos;
        const expiraEm = new Date(expDataHora * 1000);


        const payload = { 
            id: usuarioId, 
            email, 
            admin, 
            jti, 
            exp: expDataHora };

        const token = gerarToken(payload);

        await trx('usuariostokenssessao')
            .insert({ 
                usuarioId,
                token,
                jti,
                criadoEm: db.fn.now(),
                expiraEm,
                revogado: false,
                ipOrigem: req.ip,
                userAgent: req.headers['user-agent'] 
            });

        await trx('usuarios')
            .update({ ultimoAcesso: db.fn.now() })
            .where({ id: usuarioId });

        return { status: 200, mensagem: "Token gerado com sucesso!", token };

    }, "Erro ao gerar token de autenticação.");
};

/**
 * Verifica o token JWT se esta valido no banco de dados.
 *
 * @param {string} jti - Token autenticado.
 * @returns {object} Dados do token na tabela.
 */
const verificarTokenAutenticacao = async (jti) => {
    return await db('usuariostokenssessao')
        .select('id', 'usuarioId', 'token', 'jti', 'criadoEm', 'expiraEm', 'revogado', 'ipOrigem', 'userAgent')
        .where({ jti, revogado: 0 })
        .andWhere('expiraEm', '>', db.fn.now())       
        .first();
};

/**
 * Revoga um token JWT de autenticação do usuário.
 *
 * @param {string} jti - Token autenticado.
 * @returns {object} Dados da revogação.
 */
const revogarToken = async (jti) => {
    return executarTransacao(async (trx) => {

        const atualizado = await trx('usuariostokenssessao')
            .where({ jti })
            .update({ revogado: true });

        if (atualizado === 0) {
            return { status: 404, mensagem: "Sessão não encontrada ou já revogada.", erro: true };
        }

        return { status: 200, mensagem: "Logout realizado com sucesso!", atualizado };

    }, "Erro interno ao encerrar sessão.");
};

module.exports = {
    listarUsuarios,
    buscarUsuario,
    buscarPorEmail,
    criarUsuario,
    atualizarUsuario,
    ativarUsuario,
    desativarUsuario,
    deletarUsuario,
    buscarPorToken,
    verificarTokenAtivacao,
    verificarTokenSenha,
    marcarTokenComoUsado,
    salvarToken,
    gerarTokenAutenticacao,
    verificarTokenAutenticacao,
    revogarToken 
};