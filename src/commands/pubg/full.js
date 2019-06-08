const pubg = require('../../modules/pubg');

// Derpy globals
const { config } = require('../../../app');
const { getSafe } = require('../../methods');

const commandName = 'full';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    description: 'Affiche la totalité des informations du dernier match de pubg affiché',
    cooldown: 10,
    execute(message) {
        pubg.displayFullMatch(message);
    },
};
