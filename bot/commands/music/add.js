// Derpy modules
const logger = require('../../logger');
const { commandAdd } = require('../../modules/music');
const { dbCommandGet } = require('../../methods');

// Variables
const commandName = 'add';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = ['ajouter', 'a'];
let description = 'Ajoute une musique à la playlist';
let usage = '<[URL de youtube]|[recherche]>';
let cooldown = 10;

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
            args: true,
            execute(message, args) {
                commandAdd(message, args);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
