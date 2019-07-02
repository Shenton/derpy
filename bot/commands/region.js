//npm modules
const { Attachment } = require('discord.js');
const path = require('path');

// Derpy globals
const { config, logger, client, rootDir } = require('../../bot');
const { getSafe } = require('../methods');

const commandName = 'region';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    guildOnly: true,
    description: 'Liste les régions ou change de région',
    usage: '<Sans argument liste les régions|[region] change pour cette région>',
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
            const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
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
                    .catch(logger.error)
            )
            .catch(err => {
                logger.error(`Region change failed - Member: ${message.author.tag} - Region: ${newRegion}\n`, err);
                message.reply(`la région ${newRegion} n'existe pas.`);
            });
    },
};
