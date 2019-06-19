// Derpy globals
const { config } = require('../../../bot');
const { getSafe } = require('../../methods');

const commandName = 'stop';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandStop } = require('../../modules/music');

module.exports = {
    name: commandName,
    aliases: ['arret', 's'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    guildOnly: true,
    description: 'Stop la lecture de la musique',
    execute(message) {
        commandStop(message);
    },
};
