// Derpy globals
const { config, getSafe } = require('../../../app');

const commandName = 'add';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

const { commandAdd } = require('../../modules/music');

module.exports = {
    name: commandName,
    aliases: ['ajouter', 'a'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    cooldown: 10,
    args: true,
    //usage: '<URL de youtube|URL de soundcloud>',
    usage: '<URL de youtube>',
    description: 'Ajoute une musique à la playlist',
    execute(message, args) {
        commandAdd(message, args);
    },
};
