const db = require('../config/conexao');
const { trataErro } = require("./generica");

module.exports = {
	/**
	 * Executa um bloco de código dentro de uma transação no banco de dados.
	 *
	 * Essa função cria uma transação, executa o callback fornecido dentro dela, e 
	 * gerencia corretamente o commit ou rollback, garantindo consistência nos dados.
	 *
	 * @param {Function} callback - Função assíncrona que contém a lógica a ser executada dentro da transação.
	 *                             Deve aceitar um parâmetro `trx`, que representa a transação ativa.
	 * @param {string} [mensagemErro] - Mensagem personalizada de erro caso ocorra uma falha na execução.
	 *                                  Caso não seja especificada, será usada uma mensagem padrão.
	 * @returns {Promise<Object>} - Retorna o resultado da operação dentro da transação ou uma mensagem de erro formatada.
	 *
	 * Exemplo de uso:
	 * 
	 * executarTransacao(async (trx) => {
	 *     const [novoUsuarioId] = await trx('usuarios').insert({ nome: 'Diogo' });
	 *     return { status: 201, mensagem: "Usuário criado!", idUsuario: novoUsuarioId };
	 * }, "Erro ao criar usuário.");
	 */
	executarTransacao: async (callback, mensagemErro) => {
    	const trx = await db.transaction();

		try {
			const resultado = await callback(trx);
			await trx.commit();
			return resultado;
		} catch (erro) {
			await trx.rollback();
			return { status: 500, mensagem: trataErro(erro, mensagemErro || "Erro na transação."), erro: true };
		} finally {
			trx.isCompleted() && trx.destroy();
		}
	}
}