// npm modules
const path = require('path');
const JsonDB = require('node-json-db');

// Derpy globals
const { rootDir, config, getSafe, logger } = require('../../app');

const db = new JsonDB(path.join(rootDir, 'data/db/derpy'), true, true);

const commandName = 'restart';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    ownerOnly: true,
    description: 'Redémarre le bot',
    execute(message) {
        db.push('/restart/restarted', true);
        db.push('/restart/guild', message.guild.id);
        db.push('/restart/channel', message.channel.id);
        message.channel.send('Bye!')
            .catch(logger.error);
        process.exit();
    },
};