const winston = require('winston');
require('winston-daily-rotate-file');

const transporteDiario = new winston.transports.DailyRotateFile({
    filename: 'logs/app-%DATE%.log',
    auditFile: 'logs/rotacao-audit.json',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,            
    maxFiles: '7d',                  // mantém logs dos últimos 7 dias
    level: 'error',                  // ou info/debug, como preferir
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}${stack ? `\n${stack}` : ''}`;
        })
    )
});

const gerarLog = winston.createLogger({
    transports: [transporteDiario]
});

module.exports = {
    gerarLog   
}