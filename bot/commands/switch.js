// Derpy modules
const logger = require('../logger');
const { dbCommandGet } = require('../methods');

// Variables
const commandName = 'switch';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = [];
let description = 'Change de région entre eu-west et eu-central';
let usage = false;
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
            allowedChannels: allowedChannels,
            allowedRoles: allowedRoles,
            guildOnly: guildOnly,
            aliases: aliases,
            description: description,
            usage: usage,
            async execute(message) {
                const current = message.guild.region;
                let newRegion;

                if (current === 'europe') newRegion = 'russia';
                else if (current === 'russia') newRegion = 'europe';
                else newRegion = 'europe';

                message.guild.setRegion(newRegion)
                    .then(
                        message.channel.send(`Région changée pour: ${newRegion}.`)
                            .catch(logger.error)
                    )
                    .catch(err => {
                        logger.error(`Region change failed - Member: ${message.author.tag} - Region: ${newRegion}\n`, err);
                        message.reply(`la région ${newRegion} n'existe pas.`);
                    });
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
