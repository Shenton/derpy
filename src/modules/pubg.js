// npm modules
const path = require('path');
const JsonDB = require('node-json-db');
const humanizeDuration = require('humanize-duration');
const moment = require('moment');
const fs = require('fs-extra');
const axiosModule = require('axios');
const { Attachment } = require('discord.js');

// Derpy globals
const { client, config, logger, rootDir, guildID } = require('../../app');
const { channelID } = config.moduleConfig.pubg;

// local class
const pubgClass = require('../class/pubg');

// Declare objects
const db = new JsonDB(path.join(rootDir, 'data/db/pubg'), true, true);
const pubg = new pubgClass(config.moduleConfig.pubg.apiKey, config.moduleConfig.pubg.shard, config.moduleConfig.pubg.players);
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

// Create the database structure if empty
pubg.players.forEach(player => {
    try {
        db.getData(`/players/${player}/lastMatch`);
    }
    catch(err) {
        db.push(`/players/${player}/lastMatch`, '');
        logger.debug(err);
    }
});
try {
    db.getData('/matches');
}
catch(err) {
    db.push('/matches', {});
    logger.debug(err);
}

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

function displayMatch(id, message) {
    const match = db.getData(`/matches/${id}`);

    const matchTime = humanizeDuration(match.duration * 1000, { language: 'fr' });
    const matchDate = moment(match.time).locale('fr').format('LLLL');

    const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
    const pubgIcon = new Attachment(path.join(rootDir, 'assets/img/pubgIcon.gif'));
    const mapThumb = new Attachment(path.join(rootDir, `assets/img/${match.map}.png`));

    let top = 0;
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
        client.guilds.get(guildID).channels.get(channelID).send({ files: [area51, pubgIcon, mapThumb], embed: embedContent })
            .catch(logger.error);
    }
}

function displayMatchShort(id, message) {
    const match = db.getData(`/matches/${id}`);
    const matchTime = humanizeDuration(match.duration * 1000, { language: 'fr' });
    const matchDate = moment(match.time).locale('fr').format('LLLL');

    const area51 = new Attachment(path.join(rootDir, 'assets/img/area51.png'));
    const pubgIcon = new Attachment(path.join(rootDir, 'assets/img/pubgIcon.gif'));
    const mapThumb = new Attachment(path.join(rootDir, `assets/img/${match.map}.png`));

    let top = 0;
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
        client.guilds.get(guildID).channels.get(channelID).send({ files: [area51, pubgIcon, mapThumb], embed: embedContent })
            .catch(logger.error);
    }
}

function cleanMatches() {
    const matches = db.getData('/matches');
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
            db.delete(`/matches/${match.id}`);
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

function gotNewMatch(idS) {
    const filtered = [...new Set(idS)];

    filtered.forEach(async id => {
        try {
            // Get formated to array match from pubg api class, store it, display the match
            logger.debug(`Getting match id: ${id}`);
            const match = await pubg.getMatch(id);
            if (typeof match != 'object') {
                logger.error(match);
                return;
            }
            await db.push(`/matches/${id}`, match);
            await db.push('/lastDisplayedMatch', id);
            displayMatchShort(id);

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
    if (typeof matches != 'object') {
        logger.error(matches);
        return;
    }
    let gotNew = false;
    const idS = [];

    for (const player in matches) {
        if (db.getData(`/players/${player}/lastMatch`) != matches[player]) {
            db.push(`/players/${player}/lastMatch`, matches[player]);
            if (matches[player] != null) {
                gotNew = true;
                idS.push(matches[player]);
            }
        }
    }

    if (gotNew) {
        gotNewMatch(idS);
    }
}

function displayLastMatch(messageObj) {
    const players = db.getData('/players');
    const matches = [];

    for (const player in players) {
        matches.push(players[player].lastMatch);
    }

    const filteredMatches = [...new Set(matches)];
    filteredMatches.forEach(match => {
        //if (match) displayMatch(match, messageObj);
        if (match) displayMatchShort(match, messageObj);
    });
}

function displayFullMatch(messageObj) {
    try {
        const match = db.getData('/lastDisplayedMatch');
        displayMatch(match, messageObj);
    }
    catch(err) {
        logger.error(err);
    }
}

if (process.env.NODE_ENV === 'production') updatePlayersLastMatch();
setInterval(updatePlayersLastMatch, config.moduleConfig.pubg.updateInterval);
logger.info('Starting pubg interval');

exports.displayLastMatch = displayLastMatch;
exports.displayFullMatch = displayFullMatch;

logger.debug('Module pubg loaded');
