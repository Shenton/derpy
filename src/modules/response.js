// npm modules
const path = require('path');
const jsonfile = require('jsonfile');

// Derpy globals
const { client, config, rootDir, logger, guildID } = require('../../app');
const { getSafe } = require('../methods');
const allowedChannels = getSafe(() => config.moduleConfig.response.allowedChannels, false);

const responses = jsonfile.readFileSync(path.join(rootDir, 'assets/json/response.json'));
const exactResponses = responses.exact;
const containResponses = responses.contain;

const exact = [];
for (const trigger in exactResponses) {
    exact.push(trigger);
}
const contain = [];
for (const trigger in containResponses) {
    contain.push(trigger);
}

client.on('message', message => {
    /**
     * Is the author a bot
     * Is the channel not a text channel
     * Is the guild not the one we are serving
     * Is not an allowed channel
     *
     * then return
     */
    if (message.author.bot
        || message.channel.type !== 'text'
        || message.guild.id != guildID
        || allowedChannels && !allowedChannels.includes(message.channel.id)) return;

    const content = message.content.toLowerCase();
    let response;

    if (exact.includes(content)) {
        response = exactResponses[content];
    }
    else {
        contain.forEach(trigger => {
            if (content.includes(trigger)) response = containResponses[trigger];
        });
    }

    if (!response) return;

    if (response.includes('{member}')) {
        // Immune for the owner
        if (message.author.id == config.ownerID) return;
        response = response.replace('{member}', `<@${message.author.id}>`);
    }

    message.channel.send(response)
        .catch(logger.error);
});

logger.debug('Module response loaded');
