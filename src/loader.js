const fs = require('fs');
const path = require('path');
const JsonDB = require('node-json-db');

const { client, logger, rootDir } = require('../app');
const modulesList = [
    {
        name: 'admin',
        load: false,
        commands: true,
    },
    {
        name: 'mp3',
        load: true,
        commands: false,
    },
    {
        name: 'music',
        load: false,
        commands: true,
    },
    {
        name: 'pubg',
        load: true,
        commands: true,
    },
    {
        name: 'reddit',
        load: true,
        commands: false,
    },
    {
        name: 'response',
        load: true,
        commands: false,
    },
    {
        name: 'rss',
        load: true,
        commands: false,
    },
];

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
            for (const file of commandFiles) {
                const command = require(`./commands/${mod.name}/${file}`);
                client.commands.set(command.name, command);
            }
        }
    }
});