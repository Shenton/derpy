// Derpy modules
const logger = require('../../logger');
const { commandStop } = require('../../modules/music');
const { dbCommandGet } = require('../../methods');

// Variables
const commandName = 'stop';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = ['arret', 's'];
let description = 'Stop la lecture de la musique';
let usage = false;
let cooldown = 3;

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
                commandStop(message);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
