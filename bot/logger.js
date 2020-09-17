const { createLogger, format, transports } = require('winston');
require('winston-mongodb');

const { dbConnect, dbName, debug } = require('./config');

const logLevel = debug ? 'debug' : 'info';

const transport = new transports.MongoDB({
    level: logLevel,
    db: dbConnect + dbName,
    collection: 'logbot',
});

const logger = createLogger({
    level: logLevel,
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
    ),
    defaultMeta: { service: 'bot' },
    transports: [transport],
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
            myFormat,
        ),
    }));
}

module.exports = logger;
