const fs = require('fs');
const path = require('path');

const logger = require('./logger');
const config = require('./config');
const client = require('./client');
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
                    const command = require(`./commands/${mod.name}/${file}`);
                    client.commands.set(command.name, command);

                    const commandName = path.basename(file, '.js');
                    commandsList.push(config.prefix + commandName);
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
