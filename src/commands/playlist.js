// Derpy globals
const { config, getSafe } = require('../../app');

const commandName = 'playlist';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

const { commandPlaylist } = require('../modules/music');

module.exports = {
    name: commandName,
    aliases: ['list', 'liste', 'pl'],
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    cooldown: 5,
    description: 'Affiche la liste de lecture',
    execute(message) {
        commandPlaylist(message);
    },
};
