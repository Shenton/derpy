// npm modules
const path = require('path');
const JsonDB = require('node-json-db');
const Parser = require('rss-parser');
const { Attachment } = require('discord.js');

// Derpy globals
const { client, config, logger, rootDir, guildID } = require('../../app');

// Variables
const { feeds, channelID } = config.moduleConfig.rss;
const lastFeeds = {};

// Declare objects
const db = new JsonDB(path.join(rootDir, 'data/db/rss'), true, true);
const parser = new Parser();

// Create the database structure if empty
for (const origin in feeds) {
    try {
        const tryLastFeeds = db.getData(`/feeds/${origin}/lastFeeds`);
        lastFeeds[origin] = tryLastFeeds;
    }
    catch(err) {
        db.push(`/feeds/${origin}/lastFeeds`, []);
        lastFeeds[origin] = [];
        logger.debug(err);
    }
}

function displayFeed(origin, originURL, originDescription, originLogo, title, url, content) {
    const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
    const logo = new Attachment(path.join(rootDir, `assets/img/${originLogo}`));

    const embedContent = {
        color: 0x0099ff,
        title: origin,
        url: originURL,
        author: {
            name: title,
            icon_url: `attachment://${originLogo}`,
            url: url,
        },
        description: originDescription,
        fields: [],
        timestamp: new Date(),
        footer: {
            text: 'Derpy v' + process.env.npm_package_version,
            icon_url: 'attachment://area51.png',
        },
    };

    if (content) {
        embedContent.fields.push(
            {
                name: 'Aperçu',
                value: content,
            }
        );
    }

    client.guilds.get(guildID).channels.get(channelID).send({ files: [area51, logo], embed: embedContent })
        .catch(logger.error);
}

function updateRssFeeds() {
    for (const origin in feeds) {
        parser.parseURL(feeds[origin].feed)
            .then(content => {
                if (content.items.length) {
                    content.items.reverse().forEach(item => {
                        if (!lastFeeds[origin].includes(item.link)) {
                            displayFeed(origin, feeds[origin].url, feeds[origin].description, feeds[origin].img, item.title, item.link, item.contentSnippet);
                            lastFeeds[origin].push(item.link);
                        }
                    });
                }

                while (lastFeeds[origin].length > 50) lastFeeds[origin].shift();
                db.push(`/feeds/${origin}/lastFeeds`, lastFeeds[origin]);
            })
            .catch(logger.error);
    }
}

if (process.env.NODE_ENV === 'production') updateRssFeeds();
updateRssFeeds();
setInterval(updateRssFeeds, config.moduleConfig.rss.updateInterval);
logger.info('Starting rss interval');

logger.debug('Module rss loaded');
