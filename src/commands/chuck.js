// npm modules
const path = require('path');
const jsonfile = require('jsonfile');

// Derpy globals
const { config, rootDir, getSafe, logger } = require('../../app');

const commandName = 'chuck';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

// Return a random chuck norris fact
function getRandomFact() {
    const chuckNorris = jsonfile.readFileSync(path.join(rootDir, 'assets/json/chuck-norris.json'));
    return chuckNorris[Math.floor(Math.random() * chuckNorris.length)].fact;
}

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    description: 'Une Chuck Norris fact au hasard',
    execute(message) {
        message.channel.send(getRandomFact())
            .catch(logger.error);
    },
};
