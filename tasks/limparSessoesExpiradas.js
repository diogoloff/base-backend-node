const cron = require('node-cron');
const db = require('../config/conexao'); 

cron.schedule('0 4 * * *', async () => {

    const agora = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`[${agora}] Iniciando limpeza de sessão expiradas...`);

    try {
        await db.transaction(async trx => {
        const resultado = await trx('usuariostokenssessao')
            .where('expiraEm', '<', db.fn.now())
            .orWhere('revogado', 1)
            .del();

            await trx.commit();

            console.log(`Sessoes expiradas removidas: ${resultado}`);
        });
    } catch (erro) {
        console.error('Erro ao limpar sessões expirados:', erro);
    }
},
{
    timezone: 'America/Sao_Paulo'
});
