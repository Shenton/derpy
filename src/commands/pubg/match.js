const pubg = require('../../modules/pubg');

// Derpy globals
const { config, getSafe } = require('../../../app');

const commandName = 'match';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    description: 'Affiche le dernier match de pubg enregistré',
    cooldown: 10,
    execute(message) {
        pubg.displayLastMatch(message);
    },
};
