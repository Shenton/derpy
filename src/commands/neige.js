// Derpy globals
const { config, logger } = require('../../app');
const { getSafe } = require('../methods');

const commandName = 'neige';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

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
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    description: 'Mets du Reums dans le bot',
    execute(message) {
        message.channel.send(getNeige())
            .catch(logger.error);
    },
};