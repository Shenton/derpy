// Derpy globals
const { config } = require('../../../app');
const { getSafe } = require('../../methods');

const commandName = 'playlist';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandPlaylist } = require('../../modules/music');

module.exports = {
    name: commandName,
    aliases: ['list', 'liste', 'pl'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    cooldown: 5,
    description: 'Affiche la liste de lecture',
    execute(message) {
        commandPlaylist(message);
    },
};
