const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis();

const limitarRequisicoesPublico = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
    }),
    windowMs: 10 * 60 * 1000, // Janela de 10 minutos
    max: 10,                  // Máximo de 10 requisições nessa janela
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    handler: async (req, res, next, optoins) => {
        const ip = req.ip;
        const key = `ratelimit:violacoes:${ip}`;

        await redisClient.incr(key); // incrementa as tentativas
        await redisClient.expire(key, 60 * 60); // 1h de banimento

        return res.status(429).json({
            mensagem: "Limite atingido. Aguarde 10 minutos para tentar novamente."
        });
    }    
}); 

const verificarPenalidade = async (req, res, next) => {
    const ip = req.ip;
    const key = `ratelimit:violacoes:${ip}`;
    const violacoes = parseInt(await redisClient.get(key)) || 0;

    if (violacoes >= 3) {
        return res.status(429).json({
            mensagem: "Você excedeu o número de tentativas. Tente novamente em 1 hora."
        });
    }

    next(); 
};

const protegerRotaPublica = [verificarPenalidade, limitarRequisicoesPublico];

module.exports = { 
    limitarRequisicoesPublico, 
    verificarPenalidade, 
    protegerRotaPublica };