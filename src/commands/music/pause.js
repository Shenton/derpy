// Derpy globals
const { config } = require('../../../app');
const { getSafe } = require('../../methods');

const commandName = 'pause';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandPause } = require('../../modules/music');

module.exports = {
    name: commandName,
    //aliases: ['jouer', 'lire', 'p'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    guildOnly: true,
    cooldown: 5,
    description: 'Pause la musique',
    execute(message) {
        commandPause(message);
    },
};
