// Derpy globals
const { config, getSafe } = require('../../app');

const commandName = 'pause';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandPause } = require('../modules/music');

module.exports = {
    name: commandName,
    //aliases: ['jouer', 'lire', 'p'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    cooldown: 5,
    description: 'Pause la musique',
    execute(message) {
        commandPause(message);
    },
};
