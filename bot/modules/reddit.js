// npm modules
const path = require('path');
const moment = require('moment');
const { Attachment } = require('discord.js');
const RedditWatcher = require('../class/reddit');

// Derpy globals
const { client, config, logger, rootDir, guildID } = require('../../bot');
const { channelID, imageSubreddit } = config.moduleConfig.reddit;

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

    client.guilds.get(guildID).channels.get(channelID).send({ files: [area51, redditIcon], embed: embedContent })
        .catch(logger.error);
}

const reddit = new RedditWatcher();

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

logger.debug('Module reddit loaded');
