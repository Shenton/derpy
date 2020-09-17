// npm modules
const path = require('path');
const Parser = require('rss-parser');
const { MessageAttachment } = require('discord.js');

// Derpy modules
const logger = require('../logger');
const client = require('../client');
const { rootDir, guildID } = require('../variables');
const { getModule } = require('../../db/api/modules.js');
const { dbDerpyGet } = require('../methods');
const { getRss, updateRssByName } = require('../../db/api/rss');

// Variables
let feeds;
let lastFeeds;
let textChannel = false;
let intervalTime = 60000;

// Declare objects
const parser = new Parser();

// DB helpers
async function updateLastFeeds(name, singleLastFeeds) {
    const data = { lastFeeds: singleLastFeeds };

    try {
        const query = await updateRssByName(name, data);

        if (query.success) return true;
        return false;
    }
    catch(err) {
        logger.error('module => rss => updateLastFeeds: ', err);
        return false;
    }
}

// Database calls
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'rss' }, 'textChannel');
        textChannel = (query && query.data) ? query.data[0].textChannel : false;
    }
    catch(err) {
        logger.error('module => rss => getModuleChannels: ', err);
    }
}

async function getModuleConfig() {
    intervalTime = await dbDerpyGet('rssIntervalTime', intervalTime);
    updateInterval(intervalTime);

    feeds = [];
    lastFeeds = {};
    try {
        const query = await getRss();

        if (!query.success) return;

        for (let i = 0; i < query.data.length; i++) {
            const item = query.data[i];
            const name = item.name;

            if (item.enabled) {
                feeds.push({
                    name: name,
                    feed: item.feed,
                    nameURL: item.nameURL,
                    logo: item.logo,
                    description: item.description,
                });

                lastFeeds[name] = item.lastFeeds || [];
            }
        }
    }
    catch(err) {
        logger.error('module => rss => getModuleConfig: ', err);
    }
}

function updateRssFeeds() {
    for (let i = 0; i < feeds.length; i++) {
        const feed = feeds[i];
        const name = feed.name;
        let gotNew = false;

        parser.parseURL(feed.feed)
            .then(async content => {
                if (content.items.length) {
                    content.items.reverse().forEach(item => {
                        if (!lastFeeds[name].includes(item.link)) {
                            displayFeed(name, feed.nameURL, feed.description, feed.logo, item.title, item.link, item.contentSnippet);
                            lastFeeds[name].push(item.link);
                            gotNew = true;
                        }
                    });
                }

                if (gotNew) {
                    while (lastFeeds[name].length > 100) lastFeeds[name].shift();
                    await updateLastFeeds(name, lastFeeds[name]);
                }
            })
            .catch(err => {
                logger.error('Module => rss => parser error: %o', err);
            });
    }
}

function displayFeed(name, nameURL, description, img, title, url, content) {
    img = img || 'rss.png';

    const area51 = new MessageAttachment(path.join(rootDir, 'assets/img/area51.png'));
    const logo = new MessageAttachment(path.join(rootDir, `assets/img/rss/${img}`));

    const embedContent = {
        color: 0x0099ff,
        title: name,
        url: nameURL,
        author: {
            name: title,
            icon_url: `attachment://${img}`,
            url: url,
        },
        fields: [],
        timestamp: new Date(),
        footer: {
            text: 'Derpy v' + process.env.npm_package_version,
            icon_url: 'attachment://area51.png',
        },
    };

    if (description) embedContent.description = description;

    if (content) {
        embedContent.fields.push(
            {
                name: 'Aperçu',
                value: content,
            },
        );
    }

    if (!textChannel) return logger.error('rss module is enabled, but the text channel is not defined.');

    client.guilds.resolve(guildID).channels.resolve(textChannel).send({ files: [area51, logo], embed: embedContent })
        .catch(logger.error);
}

let timeout;
function updateInterval(time) {
    if (timeout) clearInterval(timeout);
    timeout = setInterval(updateRssFeeds, time);
    logger.debug('Starting rss interval, seconds: ' + time / 1000);
}

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'rss:channels') await getModuleChannels();
    else if (message.message === 'rss:config') await getModuleConfig();
});

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module rss loaded');
