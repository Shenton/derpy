// Derpy globals
const { config } = require('../../../app');
const { getSafe } = require('../../methods');

const commandName = 'play';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandPlay } = require('../../modules/music');

module.exports = {
    name: commandName,
    aliases: ['jouer', 'lire', 'p'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    cooldown: 10,
    description: 'Joue une musique',
    usage: '<Sans argument joue la playlist|[URL de youtube]|[recherche]>',
    execute(message, args) {
        commandPlay(message, args);
    },
};
