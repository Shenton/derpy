const fs = require('fs');
const path = require('path');
const JsonDB = require('node-json-db');

const { client, logger, rootDir, config, helpEmbed } = require('../app');
const { modulesList } = require('./variables');

const db = new JsonDB(path.join(rootDir, 'data/db/derpy'), true, true);

modulesList.forEach(mod => {
    try {
        db.getData(`/config/modules/${mod.name}`);
    }
    catch (err) {
        db.push(`/config/modules/${mod.name}/load`, true);
        logger.debug(err);
    }
});

modulesList.forEach(mod => {
    const load = db.getData(`/config/modules/${mod.name}/load`);

    if (load) {
        if (mod.load) require(`./modules/${mod.name}`);

        if (mod.commands) {
            const commandFiles = fs.readdirSync(path.join(rootDir, 'src/commands', mod.name)).filter(file => file.endsWith('.js'));
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
});
