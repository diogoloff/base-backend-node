const usuariosService = require('./usuariosService');
const { validarUsuario, trataErrosSchema } = require('../../schemas/listaSchemas');
const { estaVazio, trataErro, dataHoraAtual } = require("../../utils/generica");
const { randomicoUUID, compararHash, decodificarToken } = require("../../utils/cript");
const { emailCadastro, emailBoasVindas, emailRecuperarSenha, sendEmail } = require("../../utils/mail");
const { resErroClient, resErroServer, resErroValidacao, resSucesso } = require("../../utils/retornoHttp");

/**
 * Realiza validação se a senha atende aos requisitos minimos
 */
const pontuacaoSenha = (senha, opcoes) => {
    
    let numeroPassos = 5;

    // Opções padrão
    const opcoesPadrao = {
        tamanhoMinimo: opcoes?.tamanhoMinimo || 8,
        verMinusculo: opcoes?.verMinusculo || true,        
        verMaiusculo: opcoes?.verMaiusculo || true,
        verNumero: opcoes?.verNumero || true,
        verEspecial: opcoes?.verEspecial || true
    };

    const pontuacaoBase = () => {
        let passos = 1;
        
        if (opcoesPadrao.verMinusculo === true) {
            passos++;
        }

        if (opcoesPadrao.verMaiusculo === true) {
            passos++;
        }

        if (opcoesPadrao.verNumero === true) {
            passos++;
        }

        if (opcoesPadrao.verEspecial === true) {
            passos++;
        }

        numeroPassos = passos;

        return 100 / numeroPassos;
    }

    const validarTamanho = () => {
        return senha.length >= 8;  // 20 pontos
    }

    const validarMinusculo = () => {
        return /[a-z]/.test(senha);  // 20 pontos
    }

    const validarMaiusculo = () => {
        return /[A-Z]/.test(senha);  // 20 pontos
    }

    const validarNumero = () => {
        return /[0-9]/.test(senha);  // 20 pontos
    }

    const validarEspecial = () => {
        return /[~`!#@$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(senha);  // 20 pontos
    } 

    const calcularPontuacao = () => {
        let pontos = 0;
        let pontosBase = pontuacaoBase();
        
        if (validarTamanho() === true) {
            pontos = pontos + pontosBase;
        }

        if (opcoesPadrao.verMinusculo === true && validarMinusculo() === true) {
            pontos = pontos + pontosBase;
        }

        if (opcoesPadrao.verMaiusculo === true && validarMaiusculo() === true ) {
            pontos = pontos + pontosBase;
        }

        if (opcoesPadrao.verNumero === true && validarNumero() === true ) {
            pontos = pontos + pontosBase;
        }

        if (opcoesPadrao.verEspecial === true && validarEspecial() === true ) {
            pontos = pontos + pontosBase;
        }

        return pontos;
    }

    return calcularPontuacao();
}

/**
 * Realiza validação se a senha atende aos requisitos minimos e a pontução acima de 75
 */
const validarSenha = (senha) => {
    return pontuacaoSenha(senha) > 75;
}

/**
 * Envia o email para ativação da conta. 
 */
const emailAtivacao = async (email, idUsuario) => {

    try {
        let token;
        let existe;

        do {
            token = randomicoUUID();
            existe = await usuariosService.buscarPorToken(token);
        } while (existe);

        const dadosToken = { 
            usuarioId: idUsuario, 
            codigoToken: token, 
            tipo: 0,
            validadeToken: dataHoraAtual().add(1, "day").format("YYYY-MM-DD HH:mm:ss") 
        }

        const resultado = await usuariosService.salvarToken(dadosToken);
        if (resultado.erro) {
            return false; 
        }

        // Gerar e enviar o e-mail de ativação
        const link = `${process.env.ORIGEM}/login/activate/${token}?email=${encodeURIComponent(email)}`;
        const subject = `${process.env.APP_NOME} - Ativar Conta`;
        const htmlBody = emailCadastro(link);
        await sendEmail(subject, htmlBody, email);

        return true;
    } catch (erro) {
        trataErro(erro);
        return false;
    }  
};

/**
 * Envia o email para redefinição de senha. 
 */
const emailRedefinicaoSenha = async (email, idUsuario, nomeUsuario) => {

    try {
        let token;
        let existe;

        do {
            token = randomicoUUID();
            existe = await usuariosService.buscarPorToken(token);
        } while (existe);

        const dadosToken = { 
            usuarioId: idUsuario, 
            codigoToken: token, 
            tipo: 1,
            validadeToken: dataHoraAtual().add(1, "hour").format("YYYY-MM-DD HH:mm:ss") 
        }

        const resultado = await usuariosService.salvarToken(dadosToken);
        if (resultado.erro) {
            return false; 
        }

        // Gerar e enviar o e-mail de ativação
        const link = `${process.env.ORIGEM}/login/passrecover/${token}?email=${encodeURIComponent(email)}`;
        const subject = `${process.env.APP_NOME} - Recuperação de senha`;
        const htmlBody = emailRecuperarSenha(nomeUsuario, link);
        await sendEmail(subject, htmlBody, email);

        return true;
    } catch (erro) {
        trataErro(erro);
        return false;
    }  
};

/**
 * Retorna a lista de todos os usuários cadastrados.
 */
const listarUsuarios = async (req, res) => {
    try {

        const usuarioLogado = req.user;

        if (!usuarioLogado.admin) {
            return resErroClient(res, "Acesso negado. Você não tem permissão para listar os usuários.", 403);
        }

        const resultado = await usuariosService.listarUsuarios();

        resSucesso(res, resultado.mensagem, resultado.status, resultado);
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao listar usuários."));
    }
};

/**
 * Função responsável por recuperar as informações de um usuário pelo ID.
 */
const buscarUsuario = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || !Number.isInteger(id)) {
            return resErroClient(res, "ID inválido! Deve ser um número inteiro.")
        }

        const usuarioLogado = req.user;

        // Verifica se o usuário logado é ADMIN ou está buscando seus próprios dados
        if (usuarioLogado.id !== parseInt(id) && !usuarioLogado.admin) {
            return resErroClient(res, "Acesso negado. Você não tem permissão para visualizar este usuário.", 403);

        }

        const resultado = await usuariosService.buscarUsuario(id);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }

        resSucesso(res, resultado.mensagem, resultado.status, resultado);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar usuário." });
    }
};

/**
 * Cria um novo usuário na aplicação.
 */
const criarUsuario = async (req, res) => {
    try {
        const dadosUsuario = req.body;

        if (estaVazio(dadosUsuario)) {
            return resErroClient(res, "Nenhum dado foi enviado para cadastro.");
        }

        // Fixo faz parte da validação do Schema
        dadosUsuario.operacao = 'incluir'; 

        if (!validarUsuario(dadosUsuario)) {
            return resErroClient(res, trataErrosSchema(validarUsuario.errors));
        }

        if (!validarSenha(dadosUsuario.senha)) {
            return resErroValidacao(res, "Senha não atende aos requisitos mínimos.");
        }

        const usuarioExistente = await usuariosService.buscarPorEmail(dadosUsuario.email);
        if (usuarioExistente) {
            return resErroValidacao(res, "E-mail já está em uso.");
        }

        // Remove o atributo operação, pois não faz parte da gravação
        delete dadosUsuario.operacao; 

        const resultado = await usuariosService.criarUsuario(dadosUsuario);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }

        const enviou = await emailAtivacao(dadosUsuario.email, resultado.idUsuario);
        if (!enviou) {
            // Remove o usuário se o e-mail falhar
            await usuariosService.deletarUsuario(resultado.idUsuario); 
            return resErroServer(res, "Erro ao enviar e-mail de ativação. Cadastro cancelado.")
        }

        resSucesso(res, resultado.mensagem, resultado.status, resultado);
    } catch (erro) {
        resErroServer(res, trataErro(erro,  "Erro ao cadastrar usuário."))
    }
};

/**
 * Atualiza os dados de um usuário conforme a operação informada.
 */
const atualizarUsuario = async (req, res) => {

    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || !Number.isInteger(id)) {
            return resErroClient(res, "ID inválido! Deve ser um número inteiro.")
        }

        const usuarioLogado = req.user;

        // Verifica se o usuário logado é ADMIN ou está buscando seus próprios dados
        if (usuarioLogado.id !== parseInt(id) && !usuarioLogado.admin) {
            return resErroClient(res, "Acesso negado. Você não tem permissão para atualizar este usuário.", 403);
        }

        const dadosUsuario = req.body;

        if (estaVazio(dadosUsuario)) {
            return resErroClient(res, "Nenhum dado foi enviado para alteração.")
        }

        if ((dadosUsuario.operacao === "editarEmail") || (dadosUsuario.operacao === "editarSenha")) {
            if (dadosUsuario.operacao === "editarEmail") {
                
                const usuarioExistente = await usuariosService.buscarPorEmail(dadosUsuario.email);
                if ((usuarioExistente) && (usuarioExistente.id !== id)) {
                    return resErroValidacao(res, "E-mail já está em uso.");
                }

                delete dadosUsuario.senha;
            } else {
                if (!validarSenha(dadosUsuario.senha)) {
                    return resErroValidacao(res, "Senha não atende aos requisitos mínimos.");
                }

                delete dadosUsuario.email;
            }

            const dados = await usuariosService.buscarUsuario(id);
            const senhaValida = await compararHash(dadosUsuario.senhaAtual, dados.senhaHash);
            if (!senhaValida) {
                return resErroValidacao(res, "Senha inválida.");
            }

            delete dadosUsuario.senhaAtual;
        } else {
            if (dadosUsuario.operacao === "incluir") {
                return resErroClient(res, "Requisição inválida.");     
            } 

            // Remover alteração de dados que não podem ser alterados no cadastro normal
            delete dadosUsuario.senha;
            delete dadosUsuario.email;
        }

        if (!validarUsuario(dadosUsuario)) {
            return resErroClient(res, trataErrosSchema(validarUsuario.errors));
        }

        // Remove o atributo operação, pois não faz parte da gravação
        delete dadosUsuario.operacao; 

        const resultado = await usuariosService.atualizarUsuario(id, dadosUsuario);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }
        
        resSucesso(res, resultado.mensagem, resultado.status, resultado);
    } catch (erro) {
        resErroServer(res, trataErro(erro,  "Erro ao atualizar usuário."))
    }
};

/**
 * Função responsável por ativar a conta do usuário com base no token enviado por e-mail.
 */
const ativarUsuario = async (req, res) => {
    const { token, email } = req.body;

    if (estaVazio(token) || estaVazio(email)) {
        return resErroClient(res, "Requisição inválida.")
    }

    try {
        const tokenInfo = await usuariosService.verificarTokenAtivacao(token, email);
        if (!tokenInfo) {
            return resErroValidacao(res, "Token inválido ou expirado.");
        }

        const resultadoToken = await usuariosService.marcarTokenComoUsado(tokenInfo.id);
        if (resultadoToken.erro) {
            return resErroServer(res, resultadoToken.mensagem);    
        }

        const resultado = await usuariosService.ativarUsuario(tokenInfo.usuarioId);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }

        const link =  `${process.env.ORIGEM}/login`;
        const subject  = `${process.env.APP_NOME} - Conta Ativada`;
        const htmlBody = emailBoasVindas(tokenInfo.nome, link);
        await sendEmail(subject, htmlBody, email);

        resSucesso(res, resultado.mensagem, resultado.status);
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao ativar a conta."));
    }
};

/**
 * Função responsável por desativar um usuário.
 */
const desativarUsuario = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || !Number.isInteger(id)) {
            return resErroClient(res, "ID inválido! Deve ser um número inteiro.")
        }

        const usuarioLogado = req.user;

        // Verifica se o usuário logado é ADMIN ou está buscando seus próprios dados
        if ((usuarioLogado.id !== id) && (!usuarioLogado.admin)) {
            return resErroClient(res, "Acesso negado. Você não tem permissão para desativar este usuário.", 403);
        }

        const resultado = await usuariosService.desativarUsuario(id);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }

        resSucesso(res, resultado.mensagem, resultado.status);
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao desativar o usuario."));
    }
};

/**
 * Função responsável por desativar um usuário.
 */
const deletarUsuario = async (req, res) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id) || !Number.isInteger(id)) {
            return resErroClient(res, "ID inválido! Deve ser um número inteiro.")
        }

        const usuarioLogado = req.user;

        // Verifica se o usuário logado é ADMIN ou está buscando seus próprios dados
        if (!usuarioLogado.admin) {
            return resErroClient(res, "Acesso negado. Você não tem permissão para deletar este usuário.", 403);
        }

        const resultado = await usuariosService.deletarUsuario(id);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }

        resSucesso(res, resultado.mensagem, resultado.status);
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao deletar o usuario."));
    }
};

/**
 * Função responsável por gerar um novo token de ativação para um usuário não ativado.
 */
const gerarNovoTokenUsuario = async (req, res) => {
    const { email } = req.body;

    if (estaVazio(email)) {
        return resErroClient(res, "Requisição inválida.")
    }

    try {
        const usuarioExistente = await usuariosService.buscarPorEmail(email);
        if (!usuarioExistente) {
            return resErroValidacao(res, "E-mail não encontrado.");
        }

        if (usuarioExistente.ativo === 1) {
            return resErroValidacao(res, "Conta já ativada.");    
        }

        const enviou = await emailAtivacao(email, usuarioExistente.id);
        if (!enviou) {
            return resErroServer(res, "Erro ao enviar e-mail de ativação. Tente mais tarde ou contate o suporte.");
        }   
        
        resSucesso(res, "Um novo e-mail de ativação foi enviado com sucesso!");
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao gerar ativação da conta."));
    }
}

/**
 * Função responsável por solicitar a redefinição de senha do usuário.
 */
const solicitarRedefinirSenha = async (req, res) => {
    const { email } = req.body;

    if (estaVazio(email)) {
        return resErroClient(res, "Requisição inválida.")
    }   

    try {
        const usuarioExistente = await usuariosService.buscarPorEmail(email);
        if (!usuarioExistente) {
            return resErroValidacao(res, "E-mail não encontrado.");
        }

        if (usuarioExistente.ativo === 0) {
            return resErroValidacao(res, "Conta não ativada.");    
        }

        const enviou = await emailRedefinicaoSenha(email, usuarioExistente.id, usuarioExistente.nome);
        if (!enviou) {
            return resErroServer(res, "Erro ao enviar e-mail de redefinição de senha. Tente mais tarde ou contate o suporte.");
        }   
        
        resSucesso(res, "Um e-mail para redefinição de senha foi enviado com sucesso!");
    } catch (error) {
        resErroServer(res, trataErro(erro, "Erro ao solicitar redefinição de senha."));    
    }
}

/**
 * Função responsável por redefinir a senha do usuário após a verificação do token.
 */
const redefinirSenha = async (req, res) => {
    const { token, email, senha } = req.body;

    if (estaVazio(token) || estaVazio(email) || estaVazio(senha)) {
        return resErroClient(res, "Requisição inválida.")
    }

    try {
        const tokenInfo = await usuariosService.verificarTokenSenha(token, email);
        if (!tokenInfo) {
            return resErroValidacao(res, "Token inválido ou expirado.");
        }

        const dadosUsuario = { senha };
        dadosUsuario.operacao = 'editarSenha';

        if (!validarSenha(dadosUsuario.senha)) {
            return resErroValidacao(res, "Senha não atende aos requisitos mínimos.");
        }

        if (!validarUsuario(dadosUsuario)) {
            return resErroClient(res, trataErrosSchema(validarUsuario.errors));
        }
        delete dadosUsuario.operacao;

        const resultadoToken = await usuariosService.marcarTokenComoUsado(tokenInfo.id);
        if (resultadoToken.erro) {
            return resErroServer(res, resultadoToken.mensagem);    
        }

        const resultado = await usuariosService.atualizarUsuario(tokenInfo.usuarioId, dadosUsuario);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }
        
        resSucesso(res, "Senha redefinida com sucesso!");
    } catch (error) {
        resErroServer(res, trataErro(erro, "Erro ao redefinir senha."));        
    }
}

/**
 * Função responsável por autenticar um usuário no sistema.
 */
const loginUsuario = async (req, res) => {

    const { email, senha } = req.body;

    if (estaVazio(email) || estaVazio(senha)) {
        return resErroClient(res, "E-mail e senha são obrigatórios.");   
    }

    try {
        const usuarioExistente = await usuariosService.buscarPorEmail(email);
        if (!usuarioExistente) {
            return resErroValidacao(res, "Usuário ou senha inválidos.");
        }

        const senhaValida = await compararHash(senha, usuarioExistente.senhaHash);
        if (!senhaValida) {
            return resErroValidacao(res, "Usuário ou senha inválidos.");
        }

        if (usuarioExistente.ativo === 0) {
            return resErroValidacao(res, "Conta não ativa. Ative sua conta primeiro.");    
        }

        if (usuarioExistente.banido === 1) {
            return resErroValidacao(res, "Conta banida. Você não poderá logar ao sistema.");    
        }

        const resultado = await usuariosService.gerarTokenAutenticacao(usuarioExistente.id, usuarioExistente.email, usuarioExistente.usuarioAdmin, req);
        if (resultado.erro) {
            return resErroServer(res, resultado.mensagem);    
        }

        resSucesso(res, resultado.mensagem, resultado.status, resultado);
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao realizar login."));
    }
};

/**
 * Função responsável por deslogar um usuário no sistema.
 */
const logoutUsuario = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return resErroClient(res, "Token não informado.");  
    }

    try {
        // apenas extrai dados, sem verificar expiração/assinatura
        const tokenDecodificado = decodificarToken(token); 
        const { jti } = tokenDecodificado;

        if (!jti) {
            return resErroClient(res, "Token não contém JTI.");  
        }

        const resultado = await usuariosService.revogarToken(jti);
        if (resultado.erro) {
            if (resultado.status === 404) {
                return resErroServer(res, resultado.mensagem, resultado.status); 
            } 

            return resErroServer(res, resultado.mensagem);       
        }

        resSucesso(res, resultado.mensagem, resultado.status, resultado);
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao encerrar a sessão."));
    }
};

/**
 * Função responsável por registrar violações.
 */
const registrarViolacao = async (req, motivo) => {
    try {
        await usuariosService.incluirViolacao(req, motivo)
    } catch (erro) {
        resErroServer(res, trataErro(erro, "Erro ao incluir violação."));
    }
};

module.exports = {
    listarUsuarios,
    buscarUsuario,
    criarUsuario,
    atualizarUsuario,
    ativarUsuario,
    desativarUsuario,
    deletarUsuario,
    gerarNovoTokenUsuario,
    solicitarRedefinirSenha,
    redefinirSenha,
    loginUsuario,
    logoutUsuario,
    registrarViolacao
};