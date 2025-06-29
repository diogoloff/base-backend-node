const cron = require('node-cron');
const db = require('../config/conexao'); 

cron.schedule('0 3 * * *', async () => {

    const agora = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`[${agora}] Iniciando limpeza de tokens expirados...`);

    try {
        await db.transaction(async trx => {
        const resultado = await trx('usuariostokens')
            .where('validadeToken', '<', db.fn.now())
            .del();

            await trx.commit();

            console.log(`Tokens expirados removidos: ${resultado}`);
        });
    } catch (erro) {
        console.error('Erro ao limpar tokens expirados:', erro);
    }
},
{
    timezone: 'America/Sao_Paulo'
});
