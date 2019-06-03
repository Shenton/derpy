// Derpy globals
const { config, getSafe, logger } = require('../../app');

const commandName = 'neige';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

// Return a random neige
const letters = 'abcdefghijklmnopqrstuvwxyz';
function getNeige() {
    const out = [];
    const words = Math.floor(Math.random() * 5 + 8);
    for (let i = 1; i <= words; i++) {
        let word = '';
        const wordLen = Math.floor(Math.random() * 4 + 4);
        for (let ii = 1; ii <= wordLen; ii++) word += letters[Math.floor(Math.random() * 26)];
        out.push(word);
    }
    return out.join(' ') + ', neige!';
}

module.exports = {
    name: commandName,
    //aliases: ['rand', 'r'],
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    description: 'Roll un nombre au hasard',
    execute(message) {
        message.channel.send(getNeige())
            .catch(logger.error);
    },
};