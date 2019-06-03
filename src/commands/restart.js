// npm modules
const path = require('path');
const JsonDB = require('node-json-db');

// Derpy globals
const { rootDir, config, getSafe, logger } = require('../../app');

const db = new JsonDB(path.join(rootDir, 'data/db/derpy'), true, true);

const commandName = 'restart';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

module.exports = {
    name: commandName,
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
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