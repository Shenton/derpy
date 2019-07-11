// Derpy modules
const logger = require('../logger');
const config = require('../config');
const client = require('../client');
const { guildID } = require('../variables');
const { getModule } = require('../../db/api/modules');
const { getResponse } = require('../../db/api/response');

// Database calls
let textChannels = [];
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'music' }, 'textChannels');
        textChannels = (query && query.data) ? query.data[0].textChannels : [];
    }
    catch(err) {
        logger.error('module => response => getModuleChannels: ', err);
    }
}

let exactResponses;
let containResponses;
let exact;
let contain;
async function getModuleConfig() {
    exactResponses = {};
    containResponses = {};
    exact = [];
    contain = [];

    try {
        const query = await getResponse();

        if (!query.success) return;

        for (let i = 0; i < query.data.length; i++) {
            const item = query.data[i];
            const enabled = item.enabled;
            const type = item.type;
            const trigger = item.trigger.toLowerCase();
            const response = item.response;

            if (enabled && type === 'exact') {
                exactResponses[trigger] = response;
                exact.push(trigger);
            }
            else if (enabled && type === 'contain') {
                containResponses[trigger] = response;
                contain.push(trigger);
            }
        }
    }
    catch(err) {
        logger.error('module => response => getModuleConfig: ', err);
    }
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
        || textChannels.length && !textChannels.includes(message.channel.id)) return;

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

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'response:channels') await getModuleChannels();
    else if (message.message === 'response:config') await getModuleConfig();
});

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module response loaded');
