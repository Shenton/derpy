const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');

require('winston-mongodb');

const { dbConnect, dbName } = require('./config');

const transport = new transports.MongoDB({
    db: dbConnect + dbName,
    collection: 'logweb',
});

const accessTransport = new transports.MongoDB({
    db: dbConnect + dbName,
    collection: 'logwebaccess',
});

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'web' },
    transports: [transport],
});

const accessLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'web-access' },
    transports: [accessTransport],
});

// If we are in dev we want to also output the log to the console
// Also defining Morgan format
if (process.env.NODE_ENV === 'development') {
    const myFormat = format.printf(({ level, message, label, timestamp, stack }) => {
        let color = '';

        if (level == 'debug') color = '\x1b[36m';
        else if (level == 'info') color = '\x1b[32m';
        else if (level == 'error') color = '\x1b[31m';
        else if (level == 'warn') color = '\x1b[33m';

        return `\x1b[42m[${label}]\x1b[0m ${timestamp} ${level}: ${color + message}\x1b[0m${stack ? `\n[30m${stack}\x1b[0m` : ''}`;
    });

    logger.add(new transports.Console({
        level: 'debug',
        prettyPrint: true,
        format: format.combine(
            format.label({ label: 'web' }),
            format.timestamp({ format: 'HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            myFormat
        ),
    }));

    accessLogger.add(new transports.Console({
        level: 'debug',
        prettyPrint: true,
        format: format.combine(
            format.label({ label: 'web-access' }),
            format.timestamp({ format: 'HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            myFormat
        ),
    }));
}

// Morgan
accessLogger.streamInfo = {
    write: function(message) {
        accessLogger.info(message);
    },
};
const morganInfo = morgan('tiny', {
    skip: function(req, res) {
        return res.statusCode >= 400;
    },
    stream: accessLogger.streamInfo,
});

accessLogger.streamError = {
    write: function(message) {
        accessLogger.error(message);
    },
};
const morganError = morgan('tiny', {
    skip: function(req, res) {
        return res.statusCode < 400;
    },
    stream: accessLogger.streamError,
});

exports.logger = logger;
exports.morganInfo = morganInfo;
exports.morganError = morganError;
