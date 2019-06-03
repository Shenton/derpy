// npm modules
const path = require('path');
const jsonfile = require('jsonfile');

// Derpy globals
const { config, rootDir, getSafe, logger } = require('../../app');

const commandName = 'chuck';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

// Return a random chuck norris fact
function getRandomFact() {
    const chuckNorris = jsonfile.readFileSync(path.join(rootDir, 'assets/json/chuck-norris.json'));
    return chuckNorris[Math.floor(Math.random() * chuckNorris.length)].fact;
}

module.exports = {
    name: commandName,
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    description: 'Une Chuck Norris fact au hasard',
    execute(message) {
        message.channel.send(getRandomFact())
            .catch(logger.error);
    },
};
