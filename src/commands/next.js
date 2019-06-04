// Derpy globals
const { config, getSafe } = require('../../app');

const commandName = 'next';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

const { commandNext } = require('../modules/music');

module.exports = {
    name: commandName,
    aliases: ['suivant', 'n'],
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    cooldown: 10,
    description: 'Joue la prochaine vidéo de la playlist',
    execute(message) {
        commandNext(message);
    },
};