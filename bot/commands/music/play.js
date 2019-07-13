// Derpy modules
const logger = require('../../logger');
const { commandPlay } = require('../../modules/music');
const { dbCommandGet } = require('../../methods');

// Variables
const commandName = 'play';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = ['jouer', 'p'];
let description = 'Joue une musique';
let usage = '<Sans argument joue la playlist|[URL de youtube]|[recherche]>';
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
            execute(message, args) {
                commandPlay(message, args);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
