// npm modules
const { Attachment } = require('discord.js');
const path = require('path');

// Derpy globals
const { config, rootDir, logger, helpEmbed } = require('../../bot');
const { getSafe } = require('../methods');

const commandName = 'help';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    aliases: ['aide'],
    description: 'Affiche la liste des commandes',
    usage: '<Sans argument affiche la liste des comandes|[commande] Affiche l\'aide de la commande>',
    execute(message, args) {
        const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
        let embed;
        if (!args.length) {
            embed = helpEmbed;
        }
        else {
            const { commands } = message.client;
            let name = args[0].toLowerCase();
            if (name.startsWith(config.prefix)) name = name.slice(config.prefix.length);

            const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
            if (!command) {
                return message.reply('cette commande n\'existe pas.')
                    .catch(logger.error);
            }

            embed = {
                color: 0x25701e,
                author: {
                    name: `Aide sur la commande ${config.prefix + name}`,
                    icon_url: 'attachment://area51.png',
                },
                fields: [],
                timestamp: new Date(),
                footer: {
                    text: 'Derpy v' + process.env.npm_package_version,
                    icon_url: 'attachment://area51.png',
                },
            };

            if (command.aliases) {
                const aliases = command.aliases;
                const aliasesList = aliases.map(x => config.prefix + x).join(' ');
                embed.fields.push({
                    name: 'Alias',
                    value: `\`${aliasesList}\``,
                });
            }
            if (command.description) {
                embed.fields.push({
                    name: 'Description',
                    value: `\`${command.description}\``,
                });
            }
            if (command.usage) {
                embed.fields.push({
                    name: 'Utilisation',
                    value: `\`${config.prefix}${command.name} ${command.usage}\``,
                });
            }
            embed.fields.push({
                name: 'Cooldown',
                value: `\`${command.cooldown || 3} seconde(s)\``,
            });
        }

        message.author.send({ files: [area51], embed: embed })
            .catch(err => {
                logger.error(`Could not send help DM to ${message.author.tag}.\n`, err);
                message.reply('je ne peux pas t\'envoyer de message, tu as désactivé les DM?')
                    .catch(logger.error);
            });
    },
};
