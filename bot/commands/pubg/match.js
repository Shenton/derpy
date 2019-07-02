const pubg = require('../../modules/pubg');

// Derpy globals
const { config } = require('../../../bot');
const { getSafe } = require('../../methods');

const commandName = 'match';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    guildOnly: true,
    description: 'Affiche le dernier match de pubg enregistré',
    cooldown: 10,
    execute(message) {
        pubg.displayLastMatch(message);
    },
};
