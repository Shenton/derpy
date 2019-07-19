// Derpy modules
const logger = require('../logger');
const client = require('../client');
const { prefix } = require('../config');
const { guildID } = require('../variables');
const { getModule } = require('../../db/api/modules');
const { getQuote } = require('../../db/api/quote');

// Module variables
let commands = [];
let quotes = {};

// Database call
let textChannels = [];
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'quote' }, 'textChannels');
        textChannels = (query && query.data) ? query.data[0].textChannels : [];
    }
    catch(err) {
        logger.error('module => quote => getModuleChannels: ', err);
    }
}

async function getModuleConfig() {
    try {
        // Get the DB data
        const query = await getQuote();
        if (!query.success && query.status !== 404) {
            logger.error('module => quote => getModuleConfig: DB query failed, errors: %o', query.errors);
            return;
        }
        const dbData = query.data || [];

        commands = [];
        quotes = {};

        for (let i = 0; i < dbData.length; i++) {
            const quote = dbData[i];
            const commandName = quote.name;

            // Does a command already exists with this name
            const command = client.commands.get(commandName) ||
                client.commands.find(cmd => cmd.aliases && cmd.aliases.length && cmd.aliases.includes(commandName));
            if (command) {
                logger.error(`module => quote => getModuleConfig: A command with this name (${commandName}) already exists.`);
            }
            else if (quote.enabled) {
                commands.push(commandName);
                quotes[commandName] = quote.quotes;
            }
        }
    }
    catch(err) {
        logger.error('module => quote => getModuleConfig: ', err);
    }
}

function testCommand(string) {
    return /^[a-z0-9]+$/.test(string);
}

function getRandomQuote(name) {
    const q = quotes[name];
    if (!q) return false;

    const quote = q[Math.floor(Math.random() * q.length)];
    if (!quote) return false;
    if (quote === '') return false;
    return quote;
}

client.on('message', message => {
    /**
     * Is the author a bot
     * Is the channel not a text channel
     * Is the guild not the one we are serving
     * Is not a command (start with prefix)
     * Is not an allowed channel
     *
     * then return
     */
    if (message.author.bot
        || message.channel.type !== 'text'
        || message.guild.id != guildID
        || !message.content.startsWith(prefix)
        || textChannels.length && !textChannels.includes(message.channel.id)) return;

    // Grab and test the command
    const command = message.content.slice(prefix.length);
    if (!testCommand(command)) return;

    // Does this command exists
    if (!commands.includes(command)) return;

    // Grab a quote
    const quote = getRandomQuote(command);

    // Delete the command
    message.delete();

    // Display the quote
    message.channel.send(quote)
        .catch(logger.error);
});

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'quote:channels') await getModuleChannels();
    else if (message.message === 'quote:config') await getModuleConfig();
});

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module quote loaded');
