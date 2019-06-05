// npm modules
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const path = require('path');
const { Attachment } = require('discord.js');
const htmlspecialchars = require('html-specialchars');

// Derpy globals
const { config, logger, rootDir, client, guildID, channelID } = require('../../app');

const { maxVideoDuration, allowedVoiceChannels, maxPlaylistSize } = config.moduleConfig.music;

// Declare objects
const youtube = new Youtube(config.moduleConfig.music.youtubeApiKey);

// Module variables
let playlist = [];
let isPlaying = {
    status: false,
    where: {},
    who: {},
};
let dispatcher = {};
let isSearching = false;
const searchExitResponses = ['exit', 'nope', 'sortie'];
let wasStopped = false;

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

// Query the youtube API, and return an object { valid: <true|false>, url: <video object|what went wrong>}
async function getVideoObject(message, request) {
    let url;

    if (isURL(request[0])) {
        if (testURL(request[0])) url = request[0];
        else return { valid: false, url: 'URL non valide, seule les vidéos youtube sont supportées.' };
    }
    else {
        const search = request.join(' ');

        if (!search || search.length === 0) return { valid: false, url: 'Si il n\'y a rien à chercher, je ne risque pas de trouver.' };
        if (search.length > 50) return { valid: false, url: 'Nombre de charactères autorisé pour une recherche dépassé (50).' };
        if (!testSearch(search)) return { valid: false, url: 'La recherche contient des charactères non autorisés.' };

        try {
            if (isSearching) return { valid: false, url: 'Je suis déjà en train de rechercher une vidéo, attends ton tour.' };
            isSearching = true;

            const videos = await youtube.searchVideos(search);

            if (videos.length === 0) return { valid: false, url: 'Aucune vidéo trouvée.' };

            const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
            const youtubeIcon = new Attachment(path.join(rootDir, 'assets/img/youtubeIcon.png'));

            const embedContent = {
                color: 0x9b0f29,
                author: {
                    name: 'Résultat de la recherche YouTube',
                    icon_url: 'attachment://youtubeIcon.png',
                },
                description: 'Choisir la vidéos en répondant avec son numéro',
                fields: [],
                timestamp: new Date(),
                footer: {
                    text: 'Derpy v' + process.env.npm_package_version,
                    icon_url: 'attachment://area51.png',
                },
            };

            let count = 1;
            videos.forEach(video => {
                embedContent.fields.push(
                    {
                        name: htmlspecialchars.unescape(video.title),
                        value: `\`\`\`swift\nNuméro:${count}\`\`\``,
                        //inline: true,
                    });
                count++;
            });
            const embedObject = await message.channel.send({ files: [area51, youtubeIcon], embed: embedContent });

            try {
                const filter = m => (/^[1-5]?$/.test(m.content) || searchExitResponses.includes(m.content)) && m.author.id == message.author.id;
                const messageObject = await message.channel.awaitMessages(filter, { max: 1, maxMatches: 1, time: 60000, errors: ['time'] });

                if (searchExitResponses.includes(messageObject.first().content)) {
                    embedObject.delete();
                    messageObject.first().delete();
                    isSearching = false;
                    return { valid: false, url: 'Recherche annulée.' };
                }
                else {
                    const index = Number(messageObject.first().content);

                    if (!index) {
                        embedObject.delete();
                        messageObject.first().delete();
                        isSearching = false;
                        return { valid: false, url: 'Il faut répondre avec un chiffre.' };
                    }
                    else {
                        embedObject.delete();
                        messageObject.first().delete();
                        isSearching = false;
                        url = videos[index - 1].url;
                    }
                }
            }
            catch(err) {
                logger.error(err);
                embedObject.delete()
                    .catch(logger.error);
                isSearching = false;
                return { valid: false, url: 'Il y a eu une erreur avec la recherche, ou t\'es trop lent.' };
            }
        }
        catch(err) {
            logger.error(err);
            isSearching = false;
            return { valid: false, url: 'Il y a eu une erreur avec la recherche.' };
        }
    }

    // url should not be empty, but just in case. Prevent unnecessary call to the youtube API.
    if (!url) return { valid: false };

    try {
        const video = await youtube.getVideo(url);
        if (video) {
            if (video.raw.snippet.liveBroadcastContent === 'live') return { valid: false, url: 'Je ne lirais pas un live, espèce de troll.' };
            if (video.durationSeconds > maxVideoDuration) return { valid: false, url: 'Je ne lirais pas une vidéo aussi longue, espèce de troll.' };

            const title = htmlspecialchars.unescape(video.title);
            return { valid: true, url: video.url, title: title };
        }
        else {
            return { valid: false, url: 'Vidéo non trouvée.' };
        }
    }
    catch(err) {
        logger.error(err);
        return { valid: false, url: 'Il y a eu une erreur en tentant de récupérer la vidéo.' };
    }
}

function play(message, where, source, who) {
    let playOnce = false;

    // It was called by the command play, just play this video.
    if (where) {
        playOnce = true;
    }
    else {
        const item = playlist.shift();
        if (!item) return;
        ({ where, source, who } = item);

        // Check if the member who asked a video is still in the same voice channel
        const member = where.guild.members.get(who.id);
        if (!member.voiceChannel) {
            return message.channel.send(`Tu n'es plus dans un canal vocal <@${who.id}>, ta vidéo a été retiré de la playlist.`)
                .catch(logger.error);
        }
        if (!allowedVoiceChannels.includes(member.voiceChannelID)) {
            return message.channel.send(`Tu n'es plus dans un canal vocal autorisé <@${who.id}>, ta vidéo a été retiré de la playlist.`)
                .catch(logger.error);
        }
        if (member.voiceChannelID != where.id) where = member.voiceChannel;
    }

    where.join().then(connection => {
        const stream = ytdl(source, { filter: 'audioonly' });
        dispatcher = connection.playStream(stream);
        dispatcher.on('start', () => {
            isPlaying = {
                status: true,
                where: where,
                who: who,
            };
        });
        dispatcher.on('end', () => {
            if (!playOnce && !wasStopped && playlist.length > 0) {
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

async function commandAdd(message, request) {
    if (!request || !request[0]) return message.reply('Si il n\'y a rien à chercher, je ne risque pas de trouver.').catch(logger.error);
    if (request[0].length > 80) return message.reply('Nombre de charactères autorisé pour une URL dépassé (80).').catch(logger.error);

    const { voiceChannel } = message.member;

    if (!voiceChannel) return message.reply('Il faut être dans un canal vocal, tard!').catch(logger.error);
    if (!allowedVoiceChannels.includes(voiceChannel.id)) {
        return message.reply('Je ne suis pas autorisé à ouvrir ma tronche dans ce canal.')
            .catch(logger.error);
    }

    // Add the video
    try {
        const video = await getVideoObject(message, request);
        if (video.valid) {
            if (playlist.length >= maxPlaylistSize) return message.reply('La playlist est pleine.').catch(logger.error);
            playlist.push({ source: video.url, where: voiceChannel, who: message.author, title: video.title });
            message.reply(`Vidéo ${video.title} ajoutée à la playlist`).catch(logger.error);
        }
        else if (video.url) {
            message.reply(video.url);
        }
    }
    catch(err) {
        logger.error(err);
        message.reply('Il y a eu une erreur en tentant d\'ajouter la vidéo.').catch(logger.error);
    }
}

async function commandPlay(message, request) {
    // The command is not authorized when we are already playing a video
    if (isPlaying.status) {
        return message.reply(`Je suis déjà en train de lire une vidéo, utilise ${config.prefix}add pour en ajouter une à la playlist.`)
            .catch(logger.error);
    }

    const { voiceChannel } = message.member;

    // Empty args, the member want to play the playlist
    if (!request || !request[0]) {
        if (playlist.length === 0) return message.reply('La playlist est vide.').catch(logger.error);
        return play(message);
    }

    if (request[0].length > 80) return message.reply('Nombre de charactères autorisé pour une URL dépassé (80).').catch(logger.error);

    if (!voiceChannel) return message.reply('Il faut être dans un canal vocal, tard!').catch(logger.error);
    if (!allowedVoiceChannels.includes(voiceChannel.id)) {
        return message.reply('Je ne suis pas autorisé à ouvrir ma tronche dans ce canal.')
            .catch(logger.error);
    }

    // Play the video
    try {
        const video = await getVideoObject(message, request);
        if (video.valid) {
            play(message, voiceChannel, video.url, message.author);
        }
        else if (video.url) {
            message.reply(video.url);
        }
    }
    catch(err) {
        logger.error(err);
        message.reply('Il y a eu une erreur en tentant de lire la vidéo.').catch(logger.error);
    }
}

function commandPause(message) {
    if (!isPlaying.status) return;
    if (message.member.voiceChannel.id != isPlaying.where.id) return message.reply('Tu n\'es pas dans le même canal que moi, stop troller manant!').catch(logger.error);
    if (dispatcher.paused) dispatcher.resume();
    else dispatcher.pause();
}

function commandStop(message) {
    if (!isPlaying.status) return;
    if (message.member.voiceChannel.id != isPlaying.where.id) return message.reply('Tu n\'es pas dans le même canal que moi, stop troller manant!').catch(logger.error);
    wasStopped = true;
    dispatcher.end();
}

function commandPlaylist(message) {
    if (playlist.length === 0) return message.reply('La playlist est vide.').catch(logger.error);

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
    if (playlist.length === 0) return message.reply('La playlist est vide.').catch(logger.error);
    dispatcher.end();
}

function commandClear(message) {
    if (playlist.length === 0) return message.reply('La playlist est vide.').catch(logger.error);
    playlist = [];
    message.reply('La playlist a été effacée.').catch(logger.error);
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
        if (!allowedVoiceChannels.includes(newMember.voiceChannelID)) {
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

exports.commandPlay = commandPlay;
exports.commandAdd = commandAdd;
exports.commandPause = commandPause;
exports.commandStop = commandStop;
exports.commandPlaylist = commandPlaylist;
exports.commandNext = commandNext;
exports.commandClear = commandClear;

logger.debug('Module music loaded');
