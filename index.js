/*
 # MODULOS UTILIZADOS #
    express             -   Servidor HTTP para API
    express-rate-limit  -   Controle de acessos, força bruta por exemplo
    rate-limit-redis    -   Controle para trabalhar com redis, usar por exemplo um bloqueio de banimento armazenando os IPs
    ioredis             -   Redis em si
    knex                -   Comunicação com banco de dados
    mysql2              -   lib do mysql ( no projeto original continha a mysql e a mysql2 pelo que vi é uma evolução da 1, não é necessário as duas para rodar o projeto inclusive segundo foruns pode gerar conflitos ) 
    cors                -   Valida a origem das requisições AJAX, se não estiver setado qualquer aplicativo poderia fazer requisições (Não bloqueia o acesso a API se pessoa mau intencionada souber o endereço)
    jsonwebtoken        -   Utilitário para geração do token JWT mais moderno e seguro
    bcrypt, crypto      -   Utilitarios de criptografia
    moment              -   Manipulação de data e hora

    nodemon             -   Somente em desenvolvimento
    
 # PASTAS #
    api                 -   Contem as APIs e as rotinas efetivas da aplicação. Separado por subpastas uma para cada API exemplo "usuario" e dentro temos service, controller e routes
    config              -   Contem funções para configuração e funcionamento do backend, como autenticação, conexão do banco e limites de acessos
    schemas             -   Contem os arquivos de Schemas JSON utilizados na API
    tasks               -   Contem tarefas automatizadas
    utils               -   Contem funções genericas que podem ser utilizadas em outros arquivos
*/

const express = require('express');
const dotenv = require('dotenv');
const app = express();

// Carregar as variaveis de ambiente
dotenv.config();

// Configurações globais middlewares
const { configurarMiddleware } = require('./config/middlewares');
configurarMiddleware(app);

// Rotas da API
require('./api/usuarios/usuariosRoutes')(app);

// Conexão com banco de dados
const db = require('./config/conexao');
db.raw('SELECT 1') // Executa uma consulta simples para validar a conexão
    .then(() => console.log("✅ Banco de dados conectado com sucesso!"))
    .catch((erro) => console.error("❌ Erro na conexão com o banco:", erro));

// Agenda a tarefa de limpeza de tokens
require('./tasks/limparTokensExpirados');

// Agenda a tarefa de limpeza de sessoes
require('./tasks/limparSessoesExpiradas');

// Inicializar servidor
const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));