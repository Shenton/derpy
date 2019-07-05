// npm modules
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const path = require('path');
const { Attachment } = require('discord.js');
const htmlspecialchars = require('html-specialchars');

// Derpy modules
const logger = require('../logger');
const config = require('../config');
const client = require('../client');
const { rootDir, guildID, channelID } = require('../variables');
const { getModule } = require('../../db/api/modules');
const { dbDerpyGet, dbDerpyUpdate } = require('../methods');

// Database calls
let voiceChannels = [];
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'music' }, 'voiceChannels');
        voiceChannels = (query && query.data) ? query.data[0].voiceChannels : [];
    }
    catch(err) {
        logger.error('module => music => getModuleChannels: ', err);
    }
}

let maxVideoDuration = 600;
let maxPlaylistSize = 20;
let volume = 0.5;
async function getModuleConfig() {
    try {
        maxVideoDuration = await dbDerpyGet('maxVideoDuration', maxVideoDuration);
        maxPlaylistSize = await dbDerpyGet('maxPlaylistSize', maxPlaylistSize);
        volume = await dbDerpyGet('volume', volume);
    }
    catch(err) {
        logger.error('module => music => getModuleConfig: ', err);
    }
}

// Declare objects
const youtube = new Youtube(config.youtubeApiKey);

// Module variables
let playlist = [];
let isPlaying = {
    status: false,
    where: {},
    who: {},
};
let dispatcher = {};
let isSearching = false;
let wasStopped = false;
const emojiList = ['\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3', '\u0036\u20E3'];
const emojiToIndex = {
    '\u0031\u20E3': 0,
    '\u0032\u20E3': 1,
    '\u0033\u20E3': 2,
    '\u0034\u20E3': 3,
    '\u0035\u20E3': 4,
    '\u0036\u20E3': 5,
};

// Test if the string is an URL.
function isURL(string) {
    return /^(?:\w+:)?\/\/([^\s.]+\.\S{2}[:?\d]*)\S*$/.test(string);
}
// Test if the string is a youtube URL, we are calling the youtube API with this.
function testURL(string) {
    return /(?:youtube\.com\/\S*(?:(?:\/e(?:mbed))?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([a-zA-Z0-9_-]{6,11})/.test(string);
}
// Test if the string contains unwanted characters, we are calling the youtube API with this.
function testSearch(string) {
    return /^[a-zA-Z0-9\s-|]+$/.test(string);
}

// Search youtube and ask the member to choose a video
async function searchYoutube(message, search) {
    if (!search || search.length === 0) return { valid: false, response: 'si il n\'y a rien à chercher, je ne risque pas de trouver.' };
    if (search.length > 50) return { valid: false, response: 'le nombre de charactères autorisé pour une recherche est dépassé (50).' };
    if (!testSearch(search)) return { valid: false, response: 'la recherche contient des charactères non autorisés.' };
    if (isSearching) return { valid: false, response: 'je suis déjà en train de rechercher une vidéo, attends ton tour.' };

    isSearching = true;

    try {
        const videos = await youtube.searchVideos(search, 6);

        if (videos.length === 0) return { valid: false, response: 'Aucune vidéo trouvée.' };

        // Construct the embed
        const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
        const youtubeIcon = new Attachment(path.join(rootDir, 'assets/img/youtubeIcon.png'));
        const embedContent = {
            color: 0x9b0f29,
            author: {
                name: 'Résultat de la recherche YouTube',
                icon_url: 'attachment://youtubeIcon.png',
            },
            description: 'Utilise la réaction correspondante pour choisir la vidéo',
            fields: [],
            timestamp: new Date(),
            footer: {
                text: 'Derpy v' + process.env.npm_package_version,
                icon_url: 'attachment://area51.png',
            },
        };

        for (let i = 0; i < videos.length; i += 2) {
            const video1 = videos[i];
            const video2 = videos[i + 1];
            const entry1 = video1 ? `\`${i + 1} - ${htmlspecialchars.unescape(video1.title)}\`` : '\u200b';
            const entry2 = video2 ? `\`${i + 2} - ${htmlspecialchars.unescape(video2.title)}\`` : '\u200b';

            embedContent.fields.push({
                name: entry1,
                value: entry2,
            });
        }

        // Send the embed message
        const embedObject = await message.channel.send({ files: [area51, youtubeIcon], embed: embedContent });

        // Add the reactions to the message
        embedObject.react('\u0031\u20E3')
            .then(() => embedObject.react('\u0032\u20E3'))
            .then(() => embedObject.react('\u0033\u20E3'))
            .then(() => embedObject.react('\u0034\u20E3'))
            .then(() => embedObject.react('\u0035\u20E3'))
            .then(() => embedObject.react('\u0036\u20E3'))
            .then(() => embedObject.react('❌'))
            .catch(logger.error);

        // Await for the reaction
        try {
            const filter = (reaction, user) => (reaction.emoji.name === '\u0031\u20E3'
                || reaction.emoji.name === '\u0032\u20E3'
                || reaction.emoji.name === '\u0033\u20E3'
                || reaction.emoji.name === '\u0034\u20E3'
                || reaction.emoji.name === '\u0035\u20E3'
                || reaction.emoji.name === '\u0036\u20E3'
                || reaction.emoji.name === '❌')
                && user.id === message.author.id;

            const awaitObject = await embedObject.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] });
            const emoji = awaitObject.first().emoji.name;
            let response;

            if (emoji === '❌') {
                response = { valid: false, response: 'recherche annulée.' };
            }
            else if (emojiList.includes(emoji)) {
                const index = emojiToIndex[emoji];
                response = { valid: true, url: videos[index].url };
            }
            else {
                response = { valid: false, response: 'stop faire n\'importe quoi, espèce de troll.' };
            }

            embedObject.delete();
            isSearching = false;
            return response;
        }
        catch(err) {
            logger.debug(err);
            embedObject.delete().catch(logger.error);
            isSearching = false;
            return { valid: false, response: 'il y a eu une erreur avec la recherche, ou t\'es trop lent.' };
        }
    }
    catch(err) {
        logger.error(err);
        isSearching = false;
        return { valid: false, response: 'Il y a eu une erreur avec la recherche.' };
    }
}

// Query the youtube API, and return an object { valid: <true|false>, url: <video object|what went wrong>}
async function getVideoObject(message, request) {
    let url;

    if (isURL(request[0])) {
        if (testURL(request[0])) url = request[0];
        else return { valid: false, url: 'l\'URL n\'est pas valide, seule les vidéos youtube sont supportées.' };
    }
    else {
        const search = request.join(' ');
        const searchResult = await searchYoutube(message, search);
        console.log(searchResult);

        if (searchResult.valid) url = searchResult.url;
        else return searchResult;
    }

    // url should not be empty, but just in case. Prevent unnecessary call to the youtube API.
    if (!url) return { valid: false };

    return youtube.getVideo(url)
        .then(video => {
            if (video) {
                if (video.raw.snippet.liveBroadcastContent === 'live') return { valid: false, response: 'je ne lirais pas un live, espèce de troll.' };
                if (video.durationSeconds > maxVideoDuration) return { valid: false, response: 'je ne lirais pas une vidéo aussi longue, espèce de troll.' };

                const title = htmlspecialchars.unescape(video.title);
                return { valid: true, url: video.url, title: title };
            }
            else {
                return { valid: false, response: 'je n\'ai pas trouvé cette vidéo.' };
            }
        })
        .catch(err => {
            logger.error(err);
            return { valid: false, response: 'il y a eu une erreur en tentant de récupérer la vidéo, ou tu ne sais pas faire un copier/coller.' };
        });
}

function play(message, where, source, who) {
    // If where exists it was called by commandPlay(), ignore the playlist
    if (!where) {
        const item = playlist.shift();
        if (!item) return;
        ({ where, source, who } = item);

        // Check if we can play the video in the voice channel
        const member = where.guild.members.get(who.id);
        if (!member.voiceChannel) {
            return message.channel.send(`Tu n'es plus dans un canal vocal <@${who.id}>, ta vidéo a été retiré de la playlist.`)
                .catch(logger.error);
        }
        if (!voiceChannels.includes(member.voiceChannelID)) {
            return message.channel.send(`Tu n'es plus dans un canal vocal autorisé <@${who.id}>, ta vidéo a été retiré de la playlist.`)
                .catch(logger.error);
        }
        const members = member.voiceChannel.members.array();
        for (let i = 0; i < members.length; i++) {
            const m = members[i];
            if (!m.user.bot && m.presence.game) {
                return message.channel.send(`Quelqu'un joue dans ce canal <@${who.id}>, ta vidéo a été retiré de la playlist.`)
                    .catch(logger.error);
            }
        }
        if (member.voiceChannelID != where.id) where = member.voiceChannel;
    }

    where.join().then(connection => {
        const stream = ytdl(source, { filter: 'audioonly' });
        if (volume > 1) volume = 1;
        dispatcher = connection.playStream(stream);
        dispatcher.setVolume(volume);
        dispatcher.on('start', () => {
            isPlaying = {
                status: true,
                where: where,
                who: who,
            };
        });
        dispatcher.on('end', () => {
            if (!wasStopped && playlist.length > 0) {
                play(message);
                return;
            }
            isPlaying.where.leave();
            isPlaying.status = false;
            wasStopped = false;
        });
        dispatcher.on('error', (err) => {
            isPlaying.where.leave();
            isPlaying.status = false;
            wasStopped = false;
            logger.error(err);
        });
        dispatcher.on('debug', (debug) => {
            logger.debug(debug);
        });
    });
}

function canPlayHere(message, voiceChannel) {
    if (!voiceChannel) {
        message.reply('il faut être dans un canal vocal, tard!')
            .catch(logger.error);
        return false;
    }

    if (!voiceChannels.includes(voiceChannel.id)) {
        message.reply('je ne suis pas autorisé à ouvrir ma tronche dans ce canal.')
            .catch(logger.error);
        return false;
    }

    const members = voiceChannel.members.array();
    for (let i = 0; i < members.length; i++) {
        const member = members[i];
        if (!member.user.bot && member.presence.game) {
            message.reply('quelqu\'un joue dans ce canal.')
                .catch(logger.error);
            return false;
        }
    }

    return true;
}

async function commandAdd(message, request) {
    if (!request || !request[0]) return message.reply('si il n\'y a rien à chercher, je ne risque pas de trouver.').catch(logger.error);
    if (request[0].length > 80) return message.reply('le nombre de charactères autorisé pour une URL dépassé (80).').catch(logger.error);

    const { voiceChannel } = message.member;
    if (!canPlayHere(message, voiceChannel)) return;

    // Add the video
    try {
        const video = await getVideoObject(message, request);
        if (video.valid) {
            if (playlist.length >= maxPlaylistSize) return message.reply('la playlist est pleine.').catch(logger.error);
            playlist.push({ source: video.url, where: voiceChannel, who: message.author, title: video.title });
            message.reply(`la vidéo ${video.title} a été ajoutée à la playlist`).catch(logger.error);
        }
        else if (video.response) {
            message.reply(video.response);
        }
    }
    catch(err) {
        logger.error(err);
        message.reply('il y a eu une erreur en tentant d\'ajouter la vidéo.').catch(logger.error);
    }
}

async function commandPlay(message, request) {
    // The command is not authorized when we are already playing a video
    if (isPlaying.status) {
        return message.reply(`je suis déjà en train de lire une vidéo, utilise ${config.prefix}add pour en ajouter une à la playlist.`)
            .catch(logger.error);
    }

    // Empty args, the member want to play the playlist
    if (!request || !request[0]) {
        if (playlist.length === 0) return message.reply('la playlist est vide.').catch(logger.error);
        return play(message);
    }

    if (request[0].length > 80) return message.reply('le nombre de charactères autorisé pour une URL dépassé (80).').catch(logger.error);

    const { voiceChannel } = message.member;
    if (!canPlayHere(message, voiceChannel)) return;

    // Play the video
    try {
        const video = await getVideoObject(message, request);
        if (video.valid) {
            play(message, voiceChannel, video.url, message.author);
        }
        else if (video.response) {
            message.reply(video.response);
        }
    }
    catch(err) {
        logger.error(err);
        message.reply('il y a eu une erreur en tentant de lire la vidéo.')
            .catch(logger.error);
    }
}

function commandPause(message) {
    if (!isPlaying.status) return;
    if (message.member.voiceChannel.id != isPlaying.where.id) return message.reply('tu n\'es pas dans le même canal que moi, stop troller manant!').catch(logger.error);
    if (dispatcher.paused) dispatcher.resume();
    else dispatcher.pause();
}

function commandStop(message) {
    if (!isPlaying.status) return;
    if (message.member.voiceChannel.id != isPlaying.where.id) return message.reply('tu n\'es pas dans le même canal que moi, stop troller manant!').catch(logger.error);
    wasStopped = true;
    dispatcher.end();
}

function commandPlaylist(message) {
    if (playlist.length === 0) return message.reply('la playlist est vide.').catch(logger.error);

    const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
    const youtubeIcon = new Attachment(path.join(rootDir, 'assets/img/youtubeIcon.png'));

    const embedContent = {
        color: 0x9b0f29,
        author: {
            name: 'Liste de lecture',
            icon_url: 'attachment://youtubeIcon.png',
        },
        description: '',
        fields: [],
        timestamp: new Date(),
        footer: {
            text: 'Derpy v' + process.env.npm_package_version,
            icon_url: 'attachment://area51.png',
        },
    };

    playlist.forEach(item => {
        embedContent.fields.push(
            {
                name: item.title,
                value: `\`\`\`\nMembre: ${item.who.username}\nCanal: ${item.where.name}\`\`\``,
                //inline: true,
            });
    });
    message.channel.send({ files: [area51, youtubeIcon], embed: embedContent });
}

function commandNext(message) {
    if (playlist.length === 0) return message.reply('la playlist est vide.').catch(logger.error);
    dispatcher.end();
}

function commandClear(message) {
    if (playlist.length === 0) return message.reply('la playlist est vide.').catch(logger.error);
    playlist = [];
    message.reply('la playlist a été effacée.').catch(logger.error);
}

async function commandVolume(message, args) {
    if (!args.length) {
        message.reply(`le volume est de ${volume * 100}.`)
            .catch(logger.error);
    }
    else {
        const newVolume = Number(args[0]);

        if (!newVolume || newVolume < 0 || newVolume > 100 || !Number.isInteger(newVolume)) {
            return message.reply('il faut fournir un nombre entier compris en 0 et 100.')
                .catch(logger.error);
        }

        volume = newVolume / 100;
        if (isPlaying.status) dispatcher.setVolume(volume);
        await dbDerpyUpdate('volume', volume);
    }
}

// This will follow the trolls who launch a music and leave the channel
client.on('voiceStateUpdate', (oldMember, newMember) => {
    // Not playing, nothing to do
    if (!isPlaying.status) return;

    // The bot was moved
    if (newMember.id == client.user.id && oldMember.voiceChannelID != newMember.voiceChannelID) {
        // Get the the member who initiated the command, and join his voice channel
        const member = newMember.guild.members.get(isPlaying.who.id);
        member.voiceChannel.join();
    }

    // The member who moved is not the one who asked for a music, nothing to do
    if (isPlaying.who.id != newMember.id) return;

    // Check if the member left the channel
    if (oldMember.voiceChannelID != newMember.voiceChannelID) {
        // If the member did not move to an authorized channel, this will also handle a vocal disconnection
        if (!voiceChannels.includes(newMember.voiceChannelID)) {
            // Stop the music, taunt the troll
            dispatcher.end();
            client.guilds.get(guildID).channels.get(channelID).send(`Bien tenté <@${isPlaying.who.id}>, mais non.`)
                .catch(logger.error);
        }
        else {
            // Follow the troll
            isPlaying.where = newMember.voiceChannel;
            newMember.voiceChannel.join();
        }
    }
});

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'music:channels') await getModuleChannels();
    else if (message.message === 'music:config') await getModuleConfig();
});

exports.commandPlay = commandPlay;
exports.commandAdd = commandAdd;
exports.commandPause = commandPause;
exports.commandStop = commandStop;
exports.commandPlaylist = commandPlaylist;
exports.commandNext = commandNext;
exports.commandClear = commandClear;
exports.commandVolume = commandVolume;

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module music loaded');
