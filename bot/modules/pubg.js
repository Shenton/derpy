// npm modules
const path = require('path');
const humanizeDuration = require('humanize-duration');
const moment = require('moment');
const fs = require('fs-extra');
const axiosModule = require('axios');
const { Attachment } = require('discord.js');

// Derpy modules
const logger = require('../logger');
const config = require('../config');
const client = require('../client');
const { rootDir, guildID } = require('../variables');
const { getModule } = require('../../db/api/modules');
const { getPlayer, updatePlayerByPlayer } = require('../../db/api/player');
const { getMatch, addMatch, updateMatch, deleteMatch } = require('../../db/api/match');
const { dbDerpyGet, dbDerpyUpdate } = require('../methods');

// DB helpers
async function getPlayersArray() {
    try {
        const query = await getPlayer();

        if (!query.success) return [];

        const data = query.data;
        const output = [];
        for (let i = 0; i < data.length; i++) {
            const player = data[i].player;
            const enabled = data[i].enabled;
            if (enabled) output.push(player);
        }

        return output;
    }
    catch(err) {
        logger.error('module => pubg => getPlayersArray: ', err);
        return [];
    }
}

async function getPlayersLastMatchArray() {
    try {
        const query = await getPlayer();

        if (!query.success) return [];

        const data = query.data;
        const output = [];
        for (let i = 0; i < data.length; i++) {
            const lastMatch = data[i].lastMatch;
            const enabled = data[i].enabled;
            if (enabled) output.push(lastMatch);
        }

        return output;
    }
    catch(err) {
        logger.error('module => pubg => getPlayersLastMatchArray: ', err);
        return [];
    }
}

async function getPlayerLastMatch(player) {
    try {
        const query = await getPlayer({ player: player });

        if (!query.success) return false;

        const lastMatch = query.data[0].lastMatch;
        return lastMatch;
    }
    catch(err) {
        logger.error('module => pubg => getPlayerLastMatch: ', err);
        return false;
    }
}

async function getSingleMatch(matchID) {
    try {
        const query = await getMatch({ matchID: matchID });

        if (!query.success) return false;

        const match = query.data[0].match;
        return match;
    }
    catch(err) {
        logger.error('module => pubg => getSingleMatch: ', err);
        return false;
    }
}

async function getMatches() {
    try {
        const query = await getMatch();

        if (!query.success) return {};

        const data = query.data;
        const output = {};
        for (let i = 0; i < data.length; i++) {
            const matchID = data[i].matchID;
            const match = data[i].match;
            output[matchID] = match;
        }

        return output;
    }
    catch(err) {
        logger.error('module => pubg => getMatches: ', err);
        return {};
    }
}

async function addSingleMatch(matchID, match) {
    try {
        const exists = await getSingleMatch(matchID);
        let query;

        if (exists) {
            const data = { match: match };
            query = await updateMatch(matchID, data);
        }
        else {
            const data = {
                matchID: matchID,
                match: match,
            };
            query = await addMatch(data);
        }

        if (query.success) return true;
        return false;
    }
    catch(err) {
        logger.error('module => pubg => addSingleMatch: ', err);
        return false;
    }
}

async function updatePlayerLastMatch(player, matchID) {
    const data = { lastMatch: matchID };

    try {
        const query = await updatePlayerByPlayer(player, data);

        if (query.success) return true;
        return false;
    }
    catch(err) {
        logger.error('module => pubg => updatePlayerLastMatch: ', err);
        return false;
    }
}

async function deleteSingleMatch(matchID) {
    try {
        const query = await deleteMatch(matchID);

        if (query.success) return true;
        return false;
    }
    catch(err) {
        logger.error('module => pubg => deleteSingleMatch: ', err);
        return false;
    }
}

// Database calls
let textChannel = false;
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'pubg' }, 'textChannel');
        textChannel = (query && query.data) ? query.data[0].textChannel : false;
    }
    catch(err) {
        logger.error('module => pubg => getModuleChannels: ', err);
    }
}

let shard = 'steam';
let playersArray = [];
let callsPerMinute = 1;
async function getModuleConfig() {
    playersArray = await getPlayersArray();
    shard = await dbDerpyGet('pubgShard', shard);
    callsPerMinute = await dbDerpyGet('pubgCallsPerMinute', callsPerMinute);

    const callsNeeded = Math.ceil(playersArray.length / 6);
    const time = 60 / callsPerMinute * callsNeeded * 1000;
    updateInterval(time);

    // Create this DB entry if it did not exists
    await dbDerpyGet('lastDisplayedMatch', false);

    // Update PUBG class variables
    if (pubg) {
        pubg.updatePlayers(playersArray);
        pubg.updateShard(shard);
    }
}

// PUBG class
const pubgClass = require('../class/pubg');

// Declare objects
const pubg = new pubgClass(config.pubgApiKey, shard, playersArray);
const mapName = pubg.mapName();
const axios = axiosModule.create({
    responseType: 'stream',
    baseURL: 'https://telemetry-cdn.playbattlegrounds.com/bluehole-pubg/',
    headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
    },
});
const shortHumanizer = humanizeDuration.humanizer({
    language: 'shortFr',
    languages: {
        shortFr: {
            y: () => 'a',
            mo: () => 'mo',
            w: () => 'se',
            d: () => 'j',
            h: () => 'h',
            m: () => 'm',
            s: () => 's',
            ms: () => 'ms',
        },
    },
});

// Check if data/pubg/telemetry/raw exists, create it if not
fs.ensureDirSync(path.join(rootDir, 'data/pubg/telemetry/raw'), 0o744);

function humanizeMeters(meters, short) {
    meters = Math.round(meters);
    const quotient = Math.floor(meters / 1000);
    const remainder = meters % 1000;

    if (quotient > 0) {
        return `${quotient} ${short ? 'k' : `kilomètre${quotient > 1 ? 's' : ''}`}, ${remainder} ${short ? 'm' : 'mètres'}`;
    }
    else {
        return `${remainder} ${short ? 'm' : 'mètres'}`;
    }
}

async function displayMatch(id, message) {
    const match = await getSingleMatch(id);

    if (!match) return;

    const matchTime = humanizeDuration(match.duration * 1000, { language: 'fr' });
    const matchDate = moment(match.time).locale('fr').format('LLLL');

    const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
    const pubgIcon = new Attachment(path.join(rootDir, 'assets/img/pubgIcon.gif'));
    const mapThumb = new Attachment(path.join(rootDir, `assets/img/${match.map}.png`));

    let top = 100;
    for (const player in match.players) {
        if (match.players[player].winPlace > top) {
            top = match.players[player].winPlace;
        }
    }

    const title = top == '1'
        ? `${mapName[match.map]} :: ${match.mode} :: Winner Winner Chicken Dinner, Bitch!`
        : `${mapName[match.map]} :: ${match.mode} :: Top ${top}`;

    const embedContent = {
        color: 0xb26f1e,
        author: {
            name: title,
            icon_url: 'attachment://pubgIcon.gif',
        },
        description: `\`${matchTime} :: ${matchDate}\``,
        thumbnail: {
            url: `attachment://${match.map}.png`,
        },
        fields: [],
        timestamp: new Date(),
        footer: {
            text: 'Derpy v' + process.env.npm_package_version,
            icon_url: 'attachment://area51.png',
        },
    };

    let count = 0;
    const playersCount = Object.keys(match.players).length;

    let totalDamage = 0;
    let totalKills = 0;
    let totalHeadshots = 0;
    let totalDBNOs = 0;

    for (const player in match.players) {
        const data = match.players[player];
        const damage = Math.round(data.damageDealt);
        const timeSurvived = humanizeDuration(Math.round(data.timeSurvived) * 1000, { language: 'fr' });
        const rideDistance = humanizeMeters(data.rideDistance);
        const walkDistance = humanizeMeters(data.walkDistance);
        const swimDistance = humanizeMeters(data.swimDistance);
        const longestKill = humanizeMeters(data.longestKill);

        totalDamage += damage;
        totalKills += data.kills;
        totalHeadshots += data.headshotKills;
        totalDBNOs += data.DBNOs;

        embedContent.fields.push(
            {
                name: 'Joueur',
                value: `\`\`\`css\n${player} [${damage} dégats]\`\`\``,
                inline: true,
            },
            {
                name: '\u200b',
                value: `[op.gg](https://pubg.op.gg/user/${player}) :: [pubg.sh](https://pubg.sh/${player}/steam/${id})`,
                inline: true,
            },
            {
                name: 'Frags',
                value: `\`\`\`swift\nFrags: ${data.kills} (HS: ${data.headshotKills})\nDBNOs: ${data.DBNOs}\nAssists: ${data.assists}\`\`\``,
                inline: true,
            },
            {
                name: 'Survie',
                value: `\`\`\`swift\nSoins: ${data.heals}\nBoosts: ${data.boosts}\nRelève: ${data.revives}\`\`\``,
                inline: true,
            },
            {
                name: 'Informations',
                value: `\`\`\`swift\nSurvie: ${timeSurvived}\nFragDist: ${longestKill}\nVéhicule: ${rideDistance} (VK: ${data.roadKills}) (VD: ${data.vehicleDestroys})\nHiking: ${walkDistance}\nNage: ${swimDistance}\nTK: ${data.teamKills}\nArmes: ${data.weaponsAcquired}\`\`\``,
            }
        );

        // this is a blank kine separator between players
        count++;
        if (count != playersCount) {
            embedContent.fields.push(
                {
                    name: '\u200b',
                    value: '\u200b',
                }
            );
        }
    }

    embedContent.fields.push(
        {
            name: '\u200b',
            value: '\u200b',
        },
        {
            name: 'Totaux',
            value: `\`\`\`css\n[${totalDamage} dégats]\nFrags: ${totalKills} (HS: ${totalHeadshots})\nDBNOs: ${totalDBNOs}\`\`\``,
        },
    );

    if (message) {
        message.channel.send({ files: [area51, pubgIcon, mapThumb], embed: embedContent })
            .catch(logger.error);
    }
    else {
        if (!textChannel) return logger.error('PUBG module is enabled, but the text channel is not defined.');

        client.guilds.get(guildID).channels.get(textChannel).send({ files: [area51, pubgIcon, mapThumb], embed: embedContent })
            .catch(logger.error);
    }
}

async function displayMatchShort(id, message) {
    const match = await getSingleMatch(id);

    if (!match) return;

    const matchTime = humanizeDuration(match.duration * 1000, { language: 'fr' });
    const matchDate = moment(match.time).locale('fr').format('LLLL');

    const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
    const pubgIcon = new Attachment(path.join(rootDir, 'assets/img/pubgIcon.gif'));
    const mapThumb = new Attachment(path.join(rootDir, `assets/img/${match.map}.png`));

    let top = 100;
    for (const player in match.players) {
        if (match.players[player].winPlace < top) {
            top = match.players[player].winPlace;
        }
    }

    const title = top == '1'
        ? `${mapName[match.map]} :: ${match.mode} :: Winner Winner Chicken Dinner, Bitch!`
        : `${mapName[match.map]} :: ${match.mode} :: Top ${top}`;

    const embedContent = {
        color: 0xb26f1e,
        author: {
            name: title,
            icon_url: 'attachment://pubgIcon.gif',
        },
        description: `\`${matchTime} :: ${matchDate}\``,
        thumbnail: {
            url: `attachment://${match.map}.png`,
        },
        fields: [],
        timestamp: new Date(),
        footer: {
            text: 'Derpy v' + process.env.npm_package_version,
            icon_url: 'attachment://area51.png',
        },
    };

    let totalDamage = 0;
    let totalKills = 0;
    let totalHeadshots = 0;
    let totalDBNOs = 0;

    for (const player in match.players) {
        const data = match.players[player];
        const damage = Math.round(data.damageDealt);
        const timeSurvived = shortHumanizer(Math.round(data.timeSurvived) * 1000);
        const longestKill = humanizeMeters(data.longestKill, true);

        totalDamage += damage;
        totalKills += data.kills;
        totalHeadshots += data.headshotKills;
        totalDBNOs += data.DBNOs;

        embedContent.fields.push(
            {
                name: 'Joueur',
                value: `\`\`\`css\n${player} [${damage} dégats]\`\`\``,
                inline: true,
            },
            {
                name: '\u200b',
                value: `[op.gg](https://pubg.op.gg/user/${player}) :: [pubg.sh](https://pubg.sh/${player}/steam/${id})`,
                inline: true,
            },
            {
                name: 'Frags',
                value: `\`\`\`swift\nFrags: ${data.kills} (HS: ${data.headshotKills})\nDBNOs: ${data.DBNOs}\nFragDist: ${longestKill}\`\`\``,
                inline: true,
            },
            {
                name: 'Survie',
                value: `\`\`\`swift\nSoins: ${data.heals}\nBoosts: ${data.boosts}\nTemps: ${timeSurvived}\`\`\``,
                inline: true,
            }
        );
    }

    embedContent.fields.push(
        {
            name: 'Totaux',
            value: `\`\`\`css\n[${totalDamage} dégats]\nFrags: ${totalKills} (HS: ${totalHeadshots})\nDBNOs: ${totalDBNOs}\`\`\``,
        },
    );

    if (message) {
        message.channel.send({ files: [area51, pubgIcon, mapThumb], embed: embedContent })
            .catch(logger.error);
    }
    else {
        if (!textChannel) return logger.error('PUBG module is enabled, but the text channel is not defined.');

        client.guilds.get(guildID).channels.get(textChannel).send({ files: [area51, pubgIcon, mapThumb], embed: embedContent })
            .catch(logger.error);
    }
}

async function cleanMatches() {
    const matches = await getMatches();
    const timeToInfo = {};
    const timeArray = [];

    for (const id in matches) {
        const match = matches[id];
        const time = moment(match.time).format('x');
        const fileName = match.telemetryURL.substring(match.telemetryURL.lastIndexOf('/') + 1);
        timeArray.push(time);
        timeToInfo[time] = {
            'id': id,
            'telemetry': fileName,
        };
    }

    if (timeArray.length > 20) {
        timeArray.sort((a, b) => b - a);
        for (let i = 20; i <= timeArray.length - 1; i++) {
            const match = timeToInfo[timeArray[i]];
            const success = await deleteSingleMatch(match.id);

            if (success) {
                fs.remove(path.join(rootDir, 'data/pubg/telemetry/raw', match.telemetry))
                    .then(() => {
                        logger.debug(`Removed match: ${match.id} - With telemetry file: ${match.telemetry}`);
                    })
                    .catch(err => {
                        logger.error(err);
                    });
            }
        }
    }
}

async function gotNewMatch(idS) {
    const filtered = [...new Set(idS)];

    filtered.forEach(async matchID => {
        try {
            // Get formated to array match from pubg api class, store it, display the match
            logger.debug(`Getting match id: ${matchID}`);
            const match = await pubg.getMatch(matchID);
            if (typeof match !== 'object') {
                logger.error(match);
                return;
            }
            await addSingleMatch(matchID, match);
            await dbDerpyUpdate('lastDisplayedMatch', matchID);
            displayMatchShort(matchID);

            // Get the telemetry json
            const url = match.telemetryURL.match(/^https:\/\/telemetry-cdn\.playbattlegrounds\.com\/bluehole-pubg\/(.+)$/)[1];
            const fileName = match.telemetryURL.substring(match.telemetryURL.lastIndexOf('/') + 1);
            const writeStream = fs.createWriteStream(path.join(rootDir, 'data/pubg/telemetry/raw', fileName));
            axios(url)
                .then(res => {
                    if (res.status == 200) {
                        res.data.pipe(writeStream);
                        writeStream.on('finish', () => {
                            logger.debug('Downloaded: ' + match.telemetryURL);
                        });
                        writeStream.on('error', (err) => {
                            logger.error(err);
                        });
                    }
                })
                .catch(err => {
                    if (err.response) {
                        logger.error(err.response.status);
                        logger.error(err.response.data);
                    }
                    else if (err.request) {
                        logger.error(err.request);
                    }
                    else {
                        logger.error(err.message);
                    }
                });
        }
        catch(err) {
            logger.error(err);
        }
    });

    cleanMatches();
}

async function updatePlayersLastMatch() {
    logger.debug('Updating players last match');
    const matches = await pubg.getPlayersLastMatch();

    if (typeof matches !== 'object') {
        logger.error('module => pubg => updatePlayersLastMatch: matches is not an object, matches: %o', matches);
        return;
    }
    let gotNew = false;
    const idS = [];

    for (const player in matches) {
        const lastMatch = await getPlayerLastMatch(player);
        const matchID = matches[player];

        if (matchID !== null && lastMatch !== matchID) {
            await updatePlayerLastMatch(player, matchID);
            gotNew = true;
            idS.push(matchID);
        }
    }

    if (gotNew) gotNewMatch(idS);
}

async function displayLastMatch(messageObj) {
    const matches = await getPlayersLastMatchArray();

    const filteredMatches = [...new Set(matches)];
    filteredMatches.forEach(match => {
        //if (match) displayMatch(match, messageObj);
        if (match) displayMatchShort(match, messageObj);
    });
}

async function displayFullMatch(messageObj) {
    try {
        const match = await dbDerpyGet('lastDisplayedMatch', false);
        if (match) displayMatch(match, messageObj);
    }
    catch(err) {
        logger.error(err);
    }
}

if (process.env.NODE_ENV === 'production') updatePlayersLastMatch();

let timeout;
function updateInterval(time) {
    if (timeout) clearInterval(timeout);
    timeout = setInterval(updatePlayersLastMatch, time);
    logger.debug('Starting pubg interval, seconds: ' + time / 1000);
}

exports.displayLastMatch = displayLastMatch;
exports.displayFullMatch = displayFullMatch;

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'pubg:channels') await getModuleChannels();
    else if (message.message === 'pubg:config') await getModuleConfig();
});

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module pubg loaded');
