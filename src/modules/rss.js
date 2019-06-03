// npm modules
const path = require('path');
const JsonDB = require('node-json-db');
const Parser = require('rss-parser');
const { Attachment } = require('discord.js');

// Derpy globals
const { client, config, logger, rootDir, getSafe } = require('../../app');

const moduleName = 'rss';
const allowedGuild = getSafe(() => config.moduleConfig[moduleName].guildID, config.guildID);
const allowedChannel = getSafe(() => config.moduleConfig[moduleName].channelID, config.channelID);

// Declare objects
const db = new JsonDB(path.join(rootDir, 'data/db/rss'), true, true);
const parser = new Parser();

// Create the database structure if empty
for (const origin in config.rss) {
    try {
        db.getData(`/rss/${origin}/lastFeed`);
    }
    catch(err) {
        db.push(`/rss/${origin}/lastFeed`, '');
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

    client.guilds.get(allowedGuild).channels.get(allowedChannel).send({ files: [area51, logo], embed: embedContent })
        .catch(logger.error);
}

async function updateRssFeeds() {
    for (const origin in config.rss) {
        const lastFeed = db.getData(`/rss/${origin}/lastFeed`);
        const content = await parser.parseURL(config.rss[origin].feed);
        let count = 0;

        content.items.forEach(item => {
            if (lastFeed === item.link) content.items.splice(count, 1000);
            count++;
        });

        if (content.items.length) {
            db.push(`/rss/${origin}/lastFeed`, content.items[0].link);

            content.items.reverse().forEach(item => {
                displayFeed(origin, config.rss[origin].url, config.rss[origin].description, config.rss[origin].img, item.title, item.link, item.contentSnippet);
            });
        }
    }
}

if (process.env.NODE_ENV === 'production') updateRssFeeds();
setInterval(updateRssFeeds, 20 * 60 * 1000);
logger.info('Starting rss interval');

logger.debug('Module rss loaded');
