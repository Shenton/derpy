// Derpy modules
const logger = require('../logger');
const { dbCommandGet } = require('../methods');

// Variables
const commandName = 'neige';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = false;
let aliases = [];
let description = 'Mets du Reums dans le bot';
let usage = false;
let cooldown = 3;

// Return a random neige
const letters = 'abcdefghijklmnopqrstuvwxyz';
function getNeige() {
    const out = [];
    const words = Math.floor(Math.random() * 5 + 8);
    for (let i = 1; i <= words; i++) {
        let word = '';
        const wordLen = Math.floor(Math.random() * 4 + 4);
        for (let ii = 1; ii <= wordLen; ii++) word += letters[Math.floor(Math.random() * 26)];
        out.push(word);
    }
    return out.join(' ') + ', neige!';
}

async function init() {
    try {
        const data = await dbCommandGet(commandName, description, usage, aliases, cooldown);

        if (data) {
            if (!data.enabled) return false;

            if (data.allowedChannels && data.allowedChannels.length) allowedChannels = data.allowedChannels;
            if (data.allowedRoles && data.allowedRoles.length) allowedRoles = data.allowedRoles;
            if (data.guildOnly) guildOnly = true;
            if (data.aliases && data.aliases.length) aliases = data.aliases;
            if (data.description) description = data.description;
            if (data.usage) usage = data.usage;
            if (data.cooldown) cooldown = data.cooldown;
        }

        return {
            name: commandName,
            aliases: aliases,
            allowedChannels: allowedChannels,
            allowedRoles: allowedRoles,
            guildOnly: guildOnly,
            description: description,
            usage: usage,
            cooldown: cooldown,
            execute(message) {
                message.channel.send(getNeige())
                    .catch(logger.error);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
