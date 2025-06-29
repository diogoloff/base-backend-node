/**
 * Garante que a resposta seja sempre um objeto JSON estruturado.
 * Inclui sucesso (true/false), mensagem e opcionalmente um objeto de dados.
 * @param {string|object} msg - Mensagem a ser tratada.
 * @param {boolean} sucesso - Define se a resposta indica sucesso (true) ou erro (false).
 * @param {object|null} dados - Dados opcionais que acompanham a resposta.
 * @returns {object} - Objeto padronizado para retorno na API.
 */
function trataMensagem(msg, sucesso, dados = null) {
    const resposta = {
        sucesso,
        mensagem: typeof msg === "string" ? msg : "Erro desconhecido."
    };

    if (dados) {
        if ('mensagem' in dados) delete dados.mensagem;
        if ('status' in dados) delete dados.status;
        resposta.dados = dados;
    }
    
    return resposta;
}

/**
 * Módulo para padronização de respostas HTTP na API.
 * Todas as respostas seguem um formato consistente com os atributos:
 * - sucesso (true/false)
 * - mensagem (string com informações sobre a resposta)
 * - dados (opcional, contendo informações adicionais)
 */

module.exports = {
    /**
     * Retorna um erro de validação (422 - Unprocessable Entity).
     * Indica que a requisição está bem formatada, mas não pode ser processada 
     * devido a regras de negócio ou validações.
     *
     * @param {Response} res - Objeto de resposta da requisição.
     * @param {string|object} msg - Mensagem de erro ou objeto com detalhes do erro.
     * @param {number} [status=422] - Código HTTP do erro (default 422).
     * @param {object|null} dados - Dados adicionais relacionados ao erro.
     */
    resErroValidacao: (res, msg, status = 422, dados = null) => {
        res.status(status).json(trataMensagem(msg, false, dados));
    },

    /**
     * Retorna um erro do cliente (400 - Bad Request).
     * Usado quando a requisição contém erros de estrutura ou parâmetros inválidos.
     *
     * @param {Response} res - Objeto de resposta da requisição.
     * @param {string|object} msg - Mensagem de erro ou objeto com detalhes.
     * @param {number} [status=400] - Código HTTP do erro (default 400).
     * @param {object|null} dados - Dados adicionais sobre o erro.
     */
    resErroClient: (res, msg, status = 400, dados = null) => {
        res.status(status).json(trataMensagem(msg, false, dados))
    },

    /**
     * Retorna um erro de permissão (403 - Forbidden).
     * Indica que o usuário não tem permissão para realizar a ação solicitada.
     *
     * @param {Response} res - Objeto de resposta da requisição.
     * @param {string|object} msg - Mensagem informando o erro de permissão.
     * @param {number} [status=403] - Código HTTP do erro (default 403).
     * @param {object|null} dados - Dados adicionais sobre a permissão negada.
     */
    resErroPermissao: (res, msg, status = 403, dados = null) => {
        res.status(status).json(trataMensagem(msg, false, dados));
    },

    /**
     * Retorna um erro de recurso não encontrado (404 - Not Found).
     * Usado quando um recurso solicitado não existe no sistema.
     *
     * @param {Response} res - Objeto de resposta da requisição.
     * @param {string|object} msg - Mensagem informando que o recurso não foi encontrado.
     * @param {number} [status=404] - Código HTTP do erro (default 404).
     * @param {object|null} dados - Dados adicionais sobre o recurso inexistente.
     */
    resNaoEncontrado: (res, msg, status = 404, dados = null) => {
        res.status(status).json(trataMensagem(msg, false, dados));
    },

    /**
     * Retorna um erro interno do servidor (500 - Internal Server Error).
     * Indica que ocorreu um problema inesperado na execução da requisição.
     *
     * @param {Response} res - Objeto de resposta da requisição.
     * @param {string|object} msg - Mensagem descrevendo o erro interno.
     * @param {number} [status=500] - Código HTTP do erro (default 500).
     * @param {object|null} dados - Dados adicionais sobre o erro interno.
     */
    resErroServer: (res, msg, status = 500, dados = null) => {
        res.status(status).json(trataMensagem(msg, false, dados))
    }, 
    
    /**
     * Retorna uma resposta de sucesso (200 - OK).
     * Indica que a requisição foi processada corretamente.
     *
     * @param {Response} res - Objeto de resposta da requisição.
     * @param {string|object} msg - Mensagem de confirmação da operação bem-sucedida.
     * @param {number} [status=200] - Código HTTP do sucesso (default 200).
     * @param {object|null} dados - Dados adicionais sobre o resultado da operação.
     */
    resSucesso: (res, msg, status = 200, dados = null) => {
        res.status(status).json(trataMensagem(msg, true, dados))
    }
}