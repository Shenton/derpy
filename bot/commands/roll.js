// Derpy globals
const { config, logger } = require('../../bot');
const { getSafe } = require('../methods');

const commandName = 'roll';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

// Return a random number
function getRoll(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    name: commandName,
    aliases: ['rand', 'r'],
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    description: 'Roll un nombre au hasard',
    usage: '<Sans argument roll entre 1 et 100|[Nombre] Roll entre 1 et le nombre|[Nombre] [Nombre]>',
    execute(message, args) {
        const min = Number(args[0]) || 1;
        const max = Number(args[1]) || 100;

        const roll = getRoll(min, max);
        message.channel.send(`<@${message.author.id}> rolled: ${roll}`)
            .catch(logger.error);
    },
};