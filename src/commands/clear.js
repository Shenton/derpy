// Derpy globals
const { config, getSafe } = require('../../app');

const commandName = 'clear';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

const { commandClear } = require('../modules/music');

module.exports = {
    name: commandName,
    //aliases: ['jouer', 'lire', 'p'],
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    cooldown: 10,
    description: 'Joue une vidéo youtube',
    execute(message) {
        commandClear(message);
    },
};
