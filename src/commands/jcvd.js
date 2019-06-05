// npm modules
const path = require('path');
const jsonfile = require('jsonfile');

// Derpy globals
const { config, rootDir, getSafe, logger } = require('../../app');

const commandName = 'jcvd';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

// Return a random jcvd quote
function getRandomQuote() {
    const jcvd = jsonfile.readFileSync(path.join(rootDir, 'assets/json/jcvd.json'));
    return jcvd[Math.floor(Math.random() * jcvd.length)];
}

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    description: 'Une citation de Jean Claude Van Damme au hasard',
    execute(message) {
        message.channel.send(getRandomQuote())
            .catch(logger.error);
    },
};