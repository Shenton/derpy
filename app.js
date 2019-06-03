// npm modules
const Discord = require('discord.js');
const jsonfile = require('jsonfile');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// App root directory
const rootDir = __dirname;

// Logger
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
        new transports.File({ filename: path.join(rootDir, 'log', 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(rootDir, 'log', 'combined.log') }),
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

exports.logger = logger;
exports.client = client;
exports.loadConfig = loadConfig;
exports.config = config;
exports.rootDir = rootDir;
exports.getSafe = getSafe;

// Init the bot
require('./src/client');
