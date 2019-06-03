const pubg = require('../modules/pubg');

// Derpy globals
const { config, getSafe } = require('../../app');

const commandName = 'match';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

module.exports = {
    name: commandName,
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    description: 'Affiche le dernier match de pubg enregistré',
    cooldown: 10,
    execute(message) {
        pubg.displayLastMatch(message);
    },
};
