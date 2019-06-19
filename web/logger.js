const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');
const path = require('path');
require('winston-daily-rotate-file');

// Declare daily rotate transports objects
const errorTransport = new transports.DailyRotateFile({
    level: 'error',
    filename: path.join('..', 'log', 'web-error-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
});
errorTransport.on('rotate', function(oldFilename, newFilename) {
    logger.info(`Rotating log file: ${oldFilename} => ${newFilename}`);
});

const combinedTransport = new transports.DailyRotateFile({
    filename: path.join('..', 'log', 'web-combined-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
});
combinedTransport.on('rotate', function(oldFilename, newFilename) {
    logger.info(`Rotating log file: ${oldFilename} => ${newFilename}`);
});

const accessTransport = new transports.DailyRotateFile({
    filename: path.join('..', 'log', 'web-access-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
});
accessTransport.on('rotate', function(oldFilename, newFilename) {
    logger.info(`Rotating log file: ${oldFilename} => ${newFilename}`);
});

// Creating loggers
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    defaultMeta: { service: 'web' },
    transports: [errorTransport, combinedTransport],
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
        let color = '\x1b[37m';

        if (level == 'debug') color = '\x1b[36m';
        else if (level == 'info') color = '\x1b[32m';
        else if (level == 'error') color = '\x1b[31m';

        return `\x1b[42m[${label}]\x1b[0m ${timestamp} ${level}: ${color + message}\x1b[0m${stack ? `\n\x1b[30m${stack}\x1b[0m` : ''}`;
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
