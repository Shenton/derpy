// Derpy globals
const { config, getSafe } = require('../../app');

const commandName = 'stop';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

const { commandStop } = require('../modules/music');

module.exports = {
    name: commandName,
    aliases: ['arret', 's'],
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    description: 'Joue une vidéo youtube',
    execute(message) {
        commandStop(message);
    },
};