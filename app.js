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
        format.json()
    ),
    defaultMeta: { service: 'Derpy' },
    transports: [errorTransport, combinedTransport],
});
// If we are in dev we want to also output the log to the console
if (process.env.NODE_ENV === 'development') {
    const myFormat = format.printf(({ level, message, label, timestamp, stack }) => {
        let color = '\x1b[37m';

        if (level == 'debug') color = '\x1b[36m';
        else if (level == 'info') color = '\x1b[32m';
        else if (level == 'error') color = '\x1b[31m';

        return `[${label}] ${timestamp} ${level}: ${color + message}\x1b[0m${stack ? `\n\x1b[30m${stack}\x1b[0m` : ''}`;
    });
    logger.add(new transports.Console({
        level: 'debug',
        prettyPrint: true,
        format: format.combine(
            format.label({ label: 'Derpy' }),
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

// Export what will be used globaly
// Variables
exports.rootDir = rootDir;
exports.guildID = config.guildID;
exports.channelID = config.channelID;

// Objects
exports.logger = logger;
exports.client = client;
exports.config = config;

// Methods
exports.loadConfig = loadConfig;

// Init the bot
require('./src/client');
