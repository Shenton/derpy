// npm modules
const path = require('path');
const jsonfile = require('jsonfile');

// Derpy globals
const { config, rootDir, getSafe, logger } = require('../../app');

const commandName = 'jcvd';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

// Return a random jcvd quote
function getRandomQuote() {
    const jcvd = jsonfile.readFileSync(path.join(rootDir, 'assets/json/jcvd.json'));
    return jcvd[Math.floor(Math.random() * jcvd.length)];
}

module.exports = {
    name: commandName,
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    description: 'Une citation de Jean Claude Van Damme au hasard',
    execute(message) {
        message.channel.send(getRandomQuote())
            .catch(logger.error);
    },
};