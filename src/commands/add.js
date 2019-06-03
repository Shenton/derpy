// Derpy globals
const { config, getSafe } = require('../../app');

const commandName = 'add';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

const { commandAdd } = require('../modules/music');

module.exports = {
    name: commandName,
    aliases: ['ajouter', 'a'],
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    cooldown: 30,
    description: 'Ajoute une vidéo youtube à la playlist',
    execute(message, args) {
        commandAdd(message, args);
    },
};