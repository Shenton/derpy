// npm modules
const path = require('path');
const jsonfile = require('jsonfile');

// Derpy globals
const { client, config, rootDir, getSafe, logger } = require('../../app');

const moduleName = 'response';
const allowedGuild = getSafe(() => config.moduleConfig[moduleName].guildID, config.guildID);
const allowedChannel = getSafe(() => config.moduleConfig[moduleName].channelID, config.channelID);

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
    if (message.author.bot) return;

    if (message.guild.id != allowedGuild) return;

    if (message.channel.id != allowedChannel) return;

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
