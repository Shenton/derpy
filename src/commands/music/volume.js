// Derpy globals
const { config } = require('../../../app');
const { getSafe } = require('../../methods');

const commandName = 'volume';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandVolume } = require('../../modules/music');

module.exports = {
    name: commandName,
    aliases: ['vol', 'son'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    cooldown: 5,
    description: 'Ajuste le volume du bot',
    usage: '<Sans argument affiche le volume|[0-100]>',
    execute(message, args) {
        commandVolume(message, args);
    },
};
