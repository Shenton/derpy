// Derpy globals
const { config } = require('../../../app');
const { getSafe } = require('../../methods');

const commandName = 'clear';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandClear } = require('../../modules/music');

module.exports = {
    name: commandName,
    //aliases: ['jouer', 'lire', 'p'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    guildOnly: true,
    cooldown: 10,
    description: 'Vide la playlist',
    execute(message) {
        commandClear(message);
    },
};
