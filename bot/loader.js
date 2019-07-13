const fs = require('fs');
const path = require('path');

const logger = require('./logger');
const client = require('./client');
const { prefix } = require('./config');
const { rootDir, helpEmbed } = require('./variables');
const { modulesList } = require('./variables');
const { getModule } = require('../db/api/modules');

modulesList.forEach(async mod => {
    try {
        const query = await getModule({ name: mod.name }, 'enabled');
        const load = (query && query.data) ? query.data[0].enabled : false;

        if (load) {
            if (mod.load) {
                const { getModuleChannels, getModuleConfig } = require(`./modules/${mod.name}`);
                if (getModuleChannels) await getModuleChannels();
                if (getModuleConfig) await getModuleConfig();
            }

            if (mod.commands) {
                const commandFiles = fs.readdirSync(path.join(rootDir, 'commands', mod.name)).filter(file => file.endsWith('.js'));
                const commandsList = [];
                for (const file of commandFiles) {
                    const commandModule = require(`./commands/${mod.name}/${file}`);
                    const command = await commandModule.init();

                    if (command) {
                        client.commands.set(command.name, command);
                        commandsList.push(prefix + command.name);
                    }
                }

                if (mod.publicName) {
                    const commandsString = commandsList.join(' ');
                    helpEmbed.fields.push({ name: mod.publicName, value: `\`${commandsString}\`` });
                }
            }
        }
    }
    catch(err) {
        logger.error('bot => loader => modulesList.forEach: ', err);
    }
});
