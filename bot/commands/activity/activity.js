// Derpy modules
const logger = require('../../logger');
const { setNewActivity } = require('../../modules/activity');
const { dbCommandGet } = require('../../methods');

// Variables
const commandName = 'activity';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = false;
let aliases = [];
let description = 'Change l\'activité du bot au hasard';
let usage = false;
let cooldown = 60;

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
            execute() {
                setNewActivity();
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
