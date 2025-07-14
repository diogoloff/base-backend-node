const cron = require('node-cron');
const db = require('../config/conexao'); 

cron.schedule('0 5 * * *', async () => {

    const agora = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`[${agora}] Iniciando limpeza das violações de acesso...`);

    try {
        await db.transaction(async trx => {
        const resultado = await trx('violacoesacesso')
            .where('data', '<', db.raw('DATE_SUB(NOW(), INTERVAL 7 DAY)'))
            .del();

            await trx.commit();

            console.log(`Dados removidos: ${resultado}`);
        });
    } catch (erro) {
        console.error('Erro ao limpar violações de acesso:', erro);
    }
},
{
    timezone: 'America/Sao_Paulo'
});
