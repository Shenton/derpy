// Derpy modules
const logger = require('../../logger');
const { commandVolume } = require('../../modules/music');
const { dbCommandGet } = require('../../methods');

// Variables
const commandName = 'volume';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = ['vol', 'son'];
let description = 'Ajuste le volume du bot';
let usage = '<Sans argument affiche le volume|[0-100]>';
let cooldown = 5;

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
            execute(message, args) {
                commandVolume(message, args);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
