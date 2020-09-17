//npm modules
const { MessageAttachment } = require('discord.js');
const path = require('path');

// Derpy modules
const logger = require('../logger');
const client = require('../client');
const { rootDir } = require('../variables');
const { dbCommandGet } = require('../methods');

// Variables
const commandName = 'region';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = [];
let description = 'Liste les régions ou change de région';
let usage = '<Sans argument liste les régions|[region] change pour cette région>';
let cooldown = 3;

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
            async execute(message, args) {
                const regionsList = [];
                let regionOptimal;
                await client.fetchVoiceRegions()
                    .then(regions => {
                        regions.array().forEach(region => {
                            if (region.optimal && !region.deprecated && !region.vip && !region.custom) {
                                regionsList.push(region.id);
                                regionOptimal = region.id;
                            }
                            else if (!region.deprecated && !region.vip && !region.custom) {
                                regionsList.push(region.id);
                            }
                        });
                    });

                if (!args.length) {
                    const area51 = new MessageAttachment(path.join(rootDir, 'assets/img/area51.png'));
                    const embed = {
                        color: 0x25701e,
                        author: {
                            name: 'Liste des régions',
                            icon_url: 'attachment://area51.png',
                        },
                        fields: [
                            {
                                name: 'Région actuelle',
                                value: `\`\`\`css\n${message.guild.region}\`\`\``,
                            },
                            {
                                name: 'Région optimale',
                                value: `\`\`\`css\n${regionOptimal}\`\`\``,
                            },
                            {
                                name: 'Régions',
                                value: `\`\`\`css\n${regionsList.join(', ')}\`\`\``,
                            },
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: 'Derpy v' + process.env.npm_package_version,
                            icon_url: 'attachment://area51.png',
                        },
                    };
                    return message.channel.send({ files: [area51], embed: embed })
                        .catch(logger.error);
                }

                const newRegion = args[0];
                message.guild.setRegion(newRegion)
                    .then(
                        message.channel.send(`Région changée pour: ${newRegion}.`)
                            .catch(logger.error),
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
