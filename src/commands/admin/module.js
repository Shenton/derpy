const path = require('path');
const JsonDB = require('node-json-db');
const { Attachment } = require('discord.js');

const { rootDir, config, logger } = require('../../../app');
const { restartDerpy } = require('../../methods');
const { modulesList } = require('../../variables');

const db = new JsonDB(path.join(rootDir, 'data/db/derpy'), true, true);

module.exports = {
    name: 'module',
    ownerOnly: true,
    description: 'Gère les modules',
    usage: '<[module on|off]>',
    execute(message, args) {
        if (!args.length) {
            const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
            const modulesNames = [];
            modulesList.forEach(mod => modulesNames.push(mod.name));

            const embed = {
                color: 0x25701e,
                author: {
                    name: 'Modules',
                    icon_url: 'attachment://area51.png',
                },
                fields: [{
                    name: 'Liste des modules',
                    value: modulesNames.join(', '),
                }],
                timestamp: new Date(),
                footer: {
                    text: 'Derpy v' + process.env.npm_package_version,
                    icon_url: 'attachment://area51.png',
                },
            };

            message.author.send({ files: [area51], embed: embed })
                .catch(err => {
                    logger.error(`Could not send module DM to ${message.author.tag}.\n`, err);
                    message.reply('je ne peux pas t\'envoyer de message, tu as désactivé les DM?')
                        .catch(logger.error);
                });
        }
        else {
            const moduleName = args[0];
            const newState = args[1];

            if (!moduleName || !newState || (newState !== 'on' && newState !== 'off')) {
                return message.reply(`Mauvaise utilisation de la commande. Utilisation: \`${config.prefix}module <[module on|off]>\``)
                    .catch(logger.error);
            }

            for (let i = 0; i <= modulesList.length; i++) {
                const mod = modulesList[i];
                if (moduleName === mod.name) {
                    const loadModule = newState === 'on' ? true : false;
                    const isLoaded = db.getData(`/config/modules/${mod.name}/load`);

                    if (isLoaded === loadModule) {
                        return message.reply(`Le module ${mod.name} est déjà ${loadModule ? 'activé' : 'désactivé'}.`)
                            .catch(logger.error);
                    }

                    db.push(`/config/modules/${mod.name}/load`, loadModule);
                    return restartDerpy(message, `Module ${moduleName} ${loadModule ? 'activé' : 'désactivé'}, je redémarre.`);
                }
            }

            return message.reply(`le module ${moduleName} n'existe pas.`)
                .catch(logger.error);
        }
    },
};