// Derpy globals
const { config, getSafe, logger } = require('../../app');

const commandName = 'roll';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

// Return a random number
function getRoll(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = {
    name: commandName,
    aliases: ['rand', 'r'],
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    description: 'Roll un nombre au hasard',
    execute(message, args) {
        const min = Number(args[0]) || 1;
        const max = Number(args[1]) || 100;

        const roll = getRoll(min, max);
        message.channel.send(`<@${message.author.id}> rolled: ${roll}`)
            .catch(logger.error);
    },
};
