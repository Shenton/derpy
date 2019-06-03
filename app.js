// npm modules
const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const path = require('path');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// App root directory
const rootDir = __dirname;

// Logger
const errorTransport = new transports.DailyRotateFile({
    level: 'error',
    filename: path.join(rootDir, 'log', 'error-%DATE%.log'),
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '10m',
    maxFiles: '30d',
});
const combinedTransport = new transports.DailyRotateFile({
    filename: path.join(rootDir, 'log', 'combined-%DATE%.log'),
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
        format.json(),
    ),
    defaultMeta: { service: 'Derpy' },
    transports: [
        errorTransport,
        combinedTransport,
    ],
});
// If we are in dev we want to also output the log to the console
if (process.env.NODE_ENV === 'development') {
    const myFormat = format.printf(({ level, message, label, timestamp }) => {
        return `[${label}] ${timestamp} ${level}: ${message}`;
    });
    logger.add(new transports.Console({
        level: 'debug',
        format: format.combine(
            format.label({ label: 'Derpy' }),
            format.timestamp({ format: 'HH:mm:ss' }),
            format.errors({ stack: true }),
            format.splat(),
            format.colorize(),
            myFormat,
        ),
    }));
}
errorTransport.on('rotate', function(oldFilename, newFilename) {
    logger.info(`Rotating log file: ${oldFilename} => ${newFilename}`);
});
combinedTransport.on('rotate', function(oldFilename, newFilename) {
    logger.info(`Rotating log file: ${oldFilename} => ${newFilename}`);
});

// Config object
let config = null;
function loadConfig() {
    if (process.env.NODE_ENV === 'development') {
        config = jsonfile.readFileSync(path.join(rootDir, 'config-dev.json'));
    }
    else {
        config = jsonfile.readFileSync(path.join(rootDir, 'config.json'));
    }
    return true;
}
loadConfig();

// Main Discord client instance
const client = new Discord.Client();

// Discord client logging
if (process.env.NODE_ENV === 'development') client.on('debug', logger.debug.bind(logger));
client.on('error', logger.error.bind(logger));

// Try to execute the provided function, return value if it fails
function getSafe(fn, value) {
    try {
        return fn() ? fn() : value;
    }
    catch (err) {
        logger.debug(err);
        return value;
    }
}

// Export what will be used globaly
// Variables
exports.rootDir = rootDir;

// Objects
exports.logger = logger;
exports.client = client;
exports.config = config;

// Methods
exports.getSafe = getSafe;
exports.loadConfig = loadConfig;

// Init the bot
require('./src/client');
