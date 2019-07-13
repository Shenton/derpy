// npm modules
const { Attachment } = require('discord.js');
const path = require('path');

// Derpy modules
const logger = require('../logger');
const { prefix } = require('../config');
const { rootDir, helpEmbed } = require('../variables');
const { dbCommandGet } = require('../methods');

// Variables
const commandName = 'help';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = false;
let aliases = ['aide'];
let description = 'Affiche la liste des commandes';
let usage = '<Sans argument affiche la liste des commandes|[commande] Affiche l\'aide de la commande>';
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
            allowedChannels: allowedChannels,
            allowedRoles: allowedRoles,
            guildOnly: guildOnly,
            aliases: aliases,
            description: description,
            usage: usage,
            cooldown: cooldown,
            execute(message, args) {
                const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
                let embed;
                if (!args.length) {
                    embed = helpEmbed;
                }
                else {
                    const { commands } = message.client;
                    let name = args[0].toLowerCase();
                    if (name.startsWith(prefix)) name = name.slice(prefix.length);

                    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));
                    if (!command) {
                        return message.reply('cette commande n\'existe pas.')
                            .catch(logger.error);
                    }

                    embed = {
                        color: 0x25701e,
                        author: {
                            name: `Aide sur la commande ${prefix + name}`,
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
                        const aliasesList = command.aliases.map(x => prefix + x).join(' ');
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
                            value: `\`${prefix}${command.name} ${command.usage}\``,
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
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
