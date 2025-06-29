const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { randomUUID } = require("crypto");

module.exports = {
	/**
	 * Retornar um texto aleatório de acordo com a data, retorna por padrão 12 caracteres
	 * @return {string}
	 */
	randomicoTextoBaseData: () => {
		return (+new Date() * Math.random()).toString(36);
	},

	/**
	 * Retornar um UUID aleatório
	 * @return {string}
	 */
	randomicoUUID: () => {
    	return randomUUID().replace(/-/g, ""); 
	},

	/**
	 * Gera um hash seguro para um determinado texto.
	 * 
	 * @param {string} texto - O texto que será criptografado.
	 * @returns {Promise<string>} Retorna uma promessa contendo o hash gerado.
	 */
	criarHash: async (texto) => {
		return await bcrypt.hash(texto, 10)
	},

	/**
	 * Compara um texto com um hash pré-existente.
	 * 
	 * @param {string} texto - O texto original que será transformado em hash.
	 * @param {string} hash - O hash previamente gerado que será comparado.
	 * @returns {boolean} Retorna verdadeiro se o novo hash gerado a partir do texto for igual ao hash informado.
	 */
	compararHash: async (texto, hash) => {
		return bcrypt.compare(texto, hash);
	},
	
	/**
	 * Valida o token informado.
	 *
	 * @param {object} token - O token em si.
	 * @returns {string} - Token JWT assinado e pronto para uso.
	 */
	gerarToken: (token) => {
		return jwt.sign(token, process.env.JWT_SECRET, { algorithm: 'HS256' });
	},

	/**
	 * Gera um token JWT para autenticação do usuário.
	 *
	 * @param {object} token - O token em si.
	 * @returns {string} - Token JWT decodificado.
	 */
	decodificarToken: (token) => {
		return jwt.decode(token);
	},

	/**
	 * Verifica e decodifica um token JWT.
	 * 
	 * @param {string} token - Token JWT enviado pelo cliente.
	 * @returns {object|null} - Dados do token se válido, ou `null` se inválido.
	 */
	verificarToken: (token) => {
		try {
			return jwt.verify(token, process.env.JWT_SECRET);
		} catch (erro) {
			return null;
		}
	}
}