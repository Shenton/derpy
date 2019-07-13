// Derpy modules
const logger = require('../../logger');
const pubg = require('../../modules/pubg');
const { dbCommandGet } = require('../../methods');

// Variables
const commandName = 'match';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = [];
let description = 'Affiche le dernier match de pubg enregistré';
let usage = false;
let cooldown = 10;

async function init() {
    try {
        const data = await dbCommandGet(commandName);

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
                pubg.displayLastMatch(message);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
