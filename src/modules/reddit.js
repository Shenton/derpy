// npm modules
const path = require('path');
const Snooper = require('reddit-snooper');
const moment = require('moment');
const { Attachment } = require('discord.js');

// Derpy globals
const { client, config, logger, rootDir, getSafe } = require('../../app');

const moduleName = 'reddit';
const allowedGuild = getSafe(() => config.moduleConfig[moduleName].guildID, config.guildID);
const allowedChannel = getSafe(() => config.moduleConfig[moduleName].channelID, config.channelID);

// Declare objects
const snooper = new Snooper({
    //username: 'reddit_username',
    //password: 'reddit password',
    app_id: config.moduleConfig.reddit.appID,
    api_secret: config.moduleConfig.reddit.appSecret,
    //user_agent: 'OPTIONAL user agent for your bot',

    automatic_retries: true,
    api_requests_per_minute: 12,
});

function displayImagePost(post) {
    const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
    const redditIcon = new Attachment(path.join(rootDir, 'assets/img/reddit.png'));

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

    client.guilds.get(allowedGuild).channels.get(allowedChannel).send({ files: [area51, redditIcon], embed: embedContent })
        .catch(logger.error);
}

config.reddit.imageSubreddit.forEach(sub => {
    snooper.watcher.getListingWatcher(sub.name, {
        listing: sub.listing,
        limit: sub.limit,
    })
        .on('item', function(post) {
            const urlmatch = /\.([a-zA-Z]+$)/.test(post.data.url.match);
            if (!post.data.stickied && post.kind === 't3' && urlmatch) {
                displayImagePost(post.data);
            }

        })
        .on('error', logger.error.bind(logger));
});

logger.debug('Module reddit loaded');
