// Derpy globals
const { config, getSafe } = require('../../../app');

const commandName = 'next';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandNext } = require('../../modules/music');

module.exports = {
    name: commandName,
    aliases: ['suivant', 'n'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    cooldown: 10,
    description: 'Joue la prochaine musique de la playlist',
    execute(message) {
        commandNext(message);
    },
};
