// npm modules
const path = require('path');
const moment = require('moment');
const { MessageAttachment } = require('discord.js');

// Derpy globals
const logger = require('../logger');
const client = require('../client');
const { getModule } = require('../../db/api/modules');
const { rootDir, guildID } = require('../variables');
const { getReddit } = require('../../db/api/reddit');

// Reddit class & object
const RedditWatcher = require('../class/reddit');
const reddit = new RedditWatcher();

// Database calls
let textChannel = false;
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'reddit' }, 'textChannel');
        textChannel = (query && query.data) ? query.data[0].textChannel : false;
    }
    catch(err) {
        logger.error('module => reddit => getModuleChannels: ', err);
    }
}

async function getModuleConfig() {
    reddit.destroy();

    const imageSubreddit = [];

    try {
        const query = await getReddit();

        if (!query.success) return;

        for (let i = 0; i < query.data.length; i++) {
            const item = query.data[i];
            const limit = item.limit || 25;

            if (item.enabled && item.type === 'image') {
                imageSubreddit.push({
                    name: item.name,
                    listing: item.listing,
                    limit: limit,
                });
            }
        }
    }
    catch(err) {
        logger.error('module => activity => getModuleConfig: ', err);
    }

    imageSubreddit.forEach(sub => {
        reddit.listingWatcher(sub)
            .on('gotNew', post => {
                const urlmatch = /\.([a-zA-Z]+$)/.test(post.data.url);
                if (!post.data.stickied && post.kind === 't3' && urlmatch) {
                    displayImagePost(post.data);
                }
            })
            .on('error', logger.error.bind(logger));
    });
}

function displayImagePost(post) {
    const area51 = new MessageAttachment(path.join(rootDir, 'assets/img/area51.png'));
    const redditIcon = new MessageAttachment(path.join(rootDir, 'assets/img/reddit.png'));

    const postDate = moment(post.created_utc * 1000).locale('fr').format('LLLL');

    const embedContent = {
        color: 0x48135b,
        title: post.subreddit,
        url: 'https://www.reddit.com/' + post.subreddit_name_prefixed,
        author: {
            name: post.title,
            icon_url: 'attachment://reddit.png',
            url: 'https://www.reddit.com' + post.permalink,
        },
        description: `\`${post.author} :: ${postDate}\``,
        image: {
            url: post.url,
        },
        timestamp: new Date(),
        footer: {
            text: 'Derpy v' + process.env.npm_package_version,
            icon_url: 'attachment://area51.png',
        },
    };

    if (!textChannel) return logger.error(`Reddit module is enabled and sub: ${post.subreddit} is defined, but the text channel is not.`);

    client.guilds.resolve(guildID).channels.resolve(textChannel).send({ files: [area51, redditIcon], embed: embedContent })
        .catch(logger.error);
}

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'reddit:channels') await getModuleChannels();
    else if (message.message === 'reddit:config') await getModuleConfig();
});

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module reddit loaded');
