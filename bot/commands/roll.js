// Derpy modules
const logger = require('../logger');
const { dbCommandGet } = require('../methods');

// Variables
const commandName = 'roll';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = false;
let aliases = ['rand', 'r'];
let description = 'Roll un nombre au hasard';
let usage = '<Sans argument roll entre 1 et 100|[Nombre] Roll entre 1 et le nombre|[Nombre] [Nombre]>';
let cooldown = 3;

// Return a random number
function getRoll(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

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
                const min = Number(args[0]) || 1;
                const max = Number(args[1]) || 100;

                const roll = getRoll(min, max);
                message.channel.send(`<@${message.author.id}> rolled: ${roll}`)
                    .catch(logger.error);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
