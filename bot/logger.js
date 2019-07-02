const { createLogger, format, transports } = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

const errorTransport = new transports.DailyRotateFile({
    level: 'error',
    filename: path.join('..', 'log', 'bot-error-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
});
const combinedTransport = new transports.DailyRotateFile({
    filename: path.join('..', 'log', 'bot-combined-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
});
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'bot' },
    transports: [errorTransport, combinedTransport],
});
// If we are in dev we want to also output the log to the console
if (process.env.NODE_ENV === 'development') {
    const myFormat = format.printf(({ level, message, label, timestamp, stack }) => {
        let color = '';

        if (level == 'debug') color = '\x1b[36m';
        else if (level == 'info') color = '\x1b[32m';
        else if (level == 'error') color = '\x1b[31m';
        else if (level == 'warn') color = '\x1b[33m';

        return `\x1b[44m[${label}]\x1b[0m ${timestamp} ${level}: ${color + message}\x1b[0m${stack ? `\n\x1b[30m${stack}\x1b[0m` : ''}`;
    });
    logger.add(new transports.Console({
        level: 'debug',
        prettyPrint: true,
        format: format.combine(
            format.label({ label: 'bot' }),
            format.timestamp({ format: 'HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            myFormat
        ),
    }));
}
errorTransport.on('rotate', function(oldFilename, newFilename) {
    logger.info(`Rotating log file: ${oldFilename} => ${newFilename}`);
});
combinedTransport.on('rotate', function(oldFilename, newFilename) {
    logger.info(`Rotating log file: ${oldFilename} => ${newFilename}`);
});

module.exports = logger;
