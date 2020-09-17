// npm modules
const path = require('path');
const humanizeDuration = require('humanize-duration');
const moment = require('moment');
const fs = require('fs-extra');
const axiosModule = require('axios');
const { MessageAttachment } = require('discord.js');
const jsonfile = require('jsonfile');

// Derpy modules
const logger = require('../logger');
const client = require('../client');
const { pubgApiKey } = require('../config');
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

async function getSingleTelemetry(matchID) {
    try {
        const query = await getMatch({ matchID: matchID });

        if (!query.success) return false;

        const telemetry = query.data[0].telemetry;
        return telemetry;
    }
    catch(err) {
        logger.error('module => pubg => getSingleTelemetry: ', err);
        return false;
    }
}

// async function getMatches() {
//     try {
//         const query = await getMatch();

//         if (!query.success) return {};

//         const data = query.data;
//         const output = {};
//         for (let i = 0; i < data.length; i++) {
//             const matchID = data[i].matchID;
//             const match = data[i].match;
//             output[matchID] = match;
//         }

//         return output;
//     }
//     catch(err) {
//         logger.error('module => pubg => getMatches: ', err);
//         return {};
//     }
// }

async function addTelemetry(matchID, telemetry) {
    try {
        const data = { telemetry: telemetry };
        const query = await updateMatch(matchID, data);

        if (query.success) return true;
        return false;
    }
    catch(err) {
        logger.error('module => pubg => addTelemetry: ', err);
        return false;
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

    const playersCount = playersArray.length ? playersArray.length : 1;
    const callsNeeded = Math.ceil(playersCount / 6);
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
const pubg = new pubgClass(pubgApiKey, shard, playersArray);
pubg.on('error', logger.error.bind(logger));
const mapNames = pubg.mapName();
const locationNames = pubg.locationName();
const causerNames = pubg.causerName();
const gameModes = pubg.gameMode();
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

function humanizeMeters(meters, short, isTelemetry) {
    meters = isTelemetry ? meters / 100 : meters;
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
    try {
        const match = await getSingleMatch(id);

        if (!match) return;

        const matchTime = humanizeDuration(match.duration * 1000, { language: 'fr' });
        const matchDate = moment(match.time).locale('fr').format('LLLL');
        const { gameType, gameMode, gamePOV } = gameModes[match.mode];

        const area51 = new MessageAttachment(path.join(rootDir, 'assets/img/area51.png'));
        const pubgIcon = new MessageAttachment(path.join(rootDir, 'assets/img/pubgIcon.gif'));
        const mapThumb = new MessageAttachment(path.join(rootDir, `assets/img/${match.map}.png`));

        const teams = match.teams;

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];

            const mode = `${gameType ? gameType + ' • ' : ''}${gameMode ? gameMode + ' • ' : ''}${gamePOV ? gamePOV : ''}`;
            const title = team.rank == '1'
                ? `${mapNames[match.map]} • ${mode} • Winner Winner Chicken Dinner, Bitch!`
                : `${mapNames[match.map]} • ${mode} • Top ${team.rank}`;

            const embedContent = {
                color: 0xb26f1e,
                author: {
                    name: title,
                    icon_url: 'attachment://pubgIcon.gif',
                },
                description: `\`${matchTime} • ${matchDate}\``,
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
            const playersCount = team.players.length;

            let totalDamage = 0;
            let totalKills = 0;
            let totalHeadshots = 0;
            let totalDBNOs = 0;

            for (let ii = 0; ii < team.players.length; ii++) {
                const data = team.players[ii];
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
                        value: `\`\`\`css\n${data.name} [${damage} dégats]\`\`\``,
                        inline: true,
                    },
                    {
                        name: '\u200b',
                        value: `[op.gg](https://pubg.op.gg/user/${data.name}) • [pubg.sh](https://pubg.sh/${data.name}/steam/${id})`,
                        inline: true,
                    },
                    {
                        name: 'Frags',
                        value: `\`\`\`swift\nFrags: ${data.kills} (HS: ${data.headshotKills})\nDBNOs: ${data.DBNOs}\nAssists: ${data.assists}\`\`\``,
                        //inline: true,
                    },
                    {
                        name: 'Survie',
                        value: `\`\`\`swift\nSoins: ${data.heals}\nBoosts: ${data.boosts}\nRelève: ${data.revives}\`\`\``,
                        //inline: true,
                    },
                    {
                        name: 'Informations',
                        value: `\`\`\`swift\nSurvie: ${timeSurvived}\nFragDist: ${longestKill}\nVéhicule: ${rideDistance} (VK: ${data.roadKills}) (VD: ${data.vehicleDestroys})\nHiking: ${walkDistance}\nNage: ${swimDistance}\nTK: ${data.teamKills}\nArmes: ${data.weaponsAcquired}\`\`\``,
                    },
                );

                // this is a blank line separator between players
                count++;
                if (count != playersCount) {
                    embedContent.fields.push(
                        {
                            name: '\u200b',
                            value: '\u200b',
                        },
                    );
                }
            }

            if (gameMode !== 'Solo') {
                embedContent.fields.push(
                    {
                        name: '\u200b',
                        value: '\u200b',
                    },
                    {
                        name: 'Totaux',
                        value: `\`\`\`py\n@ Dégats: ${totalDamage}\nFrags: ${totalKills} (HS: ${totalHeadshots})\nDBNOs: ${totalDBNOs}\`\`\``,
                    },
                );
            }

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
    }
    catch(err) {
        logger.error('module => pubg => displayMatch: ', err);
    }
}

async function displayMatchShort(id, message) {
    try {
        const match = await getSingleMatch(id);

        if (!match) return;

        const matchTime = humanizeDuration(match.duration * 1000, { language: 'fr' });
        const matchDate = moment(match.time).locale('fr').format('LLLL');
        const { gameType, gameMode, gamePOV } = gameModes[match.mode];

        const area51 = new MessageAttachment(path.join(rootDir, 'assets/img/area51.png'));
        const pubgIcon = new MessageAttachment(path.join(rootDir, 'assets/img/pubgIcon.gif'));
        const mapThumb = new MessageAttachment(path.join(rootDir, `assets/img/${match.map}.png`));

        const teams = match.teams;

        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];

            const mode = `${gameType ? gameType + ' • ' : ''}${gameMode ? gameMode + ' • ' : ''}${gamePOV ? gamePOV : ''}`;
            const title = team.rank == '1'
                ? `${mapNames[match.map]} • ${mode} • Winner Winner Chicken Dinner, Bitch!`
                : `${mapNames[match.map]} • ${mode} • Top ${team.rank}`;

            const embedContent = {
                color: 0xb26f1e,
                author: {
                    name: title,
                    icon_url: 'attachment://pubgIcon.gif',
                },
                description: `\`${matchTime} • ${matchDate}\``,
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

            for (let ii = 0; ii < team.players.length; ii++) {
                const data = team.players[ii];
                const damage = Math.round(data.damageDealt);
                const timeSurvived = shortHumanizer(Math.round(data.timeSurvived) * 1000);
                const longestKill = humanizeMeters(data.longestKill, true);

                totalDamage += damage;
                totalKills += data.kills;
                totalHeadshots += data.headshotKills;
                totalDBNOs += data.DBNOs;

                // Embeds fields before discord BREAKING modifications, 2 colums to 3 colums even with thumbnail
                // embedContent.fields.push(
                //     {
                //         name: 'Joueur',
                //         value: `\`\`\`css\n${data.name} [${damage} dégats]\`\`\``,
                //         inline: true,
                //     },
                //     {
                //         name: '\u200b',
                //         value: `[op.gg](https://pubg.op.gg/user/${data.name}) • [pubg.sh](https://pubg.sh/${data.name}/steam/${id})`,
                //         inline: true,
                //     },
                //     {
                //         name: 'Frags',
                //         value: `\`\`\`swift\nFrags: ${data.kills} (HS: ${data.headshotKills})\nDBNOs: ${data.DBNOs}\nFragDist: ${longestKill}\`\`\``,
                //         inline: true,
                //     },
                //     {
                //         name: 'Survie',
                //         value: `\`\`\`swift\nSoins: ${data.heals}\nBoosts: ${data.boosts}\nTemps: ${timeSurvived}\`\`\``,
                //         inline: true,
                //     }
                // );

                embedContent.fields.push(
                    {
                        name: 'Joueur',
                        value: `\`\`\`css\n${data.name} [${damage} dégats]\`\`\``,
                        //inline: true,
                    },
                    // {
                    //     name: '\u200b',
                    //     value: `[op.gg](https://pubg.op.gg/user/${data.name}) • [pubg.sh](https://pubg.sh/${data.name}/steam/${id})`,
                    //     //inline: true,
                    // },
                    {
                        name: 'Frags',
                        value: `\`\`\`swift\nFrags: ${data.kills} (HS: ${data.headshotKills})\nDBNOs: ${data.DBNOs}\nFragDist: ${longestKill}\`\`\``,
                        inline: true,
                    },
                    {
                        name: 'Survie',
                        value: `\`\`\`swift\nSoins: ${data.heals}\nBoosts: ${data.boosts}\nTemps: ${timeSurvived}\`\`\``,
                        inline: true,
                    },
                );
            }

            if (gameMode !== 'Solo') {
                embedContent.fields.push(
                    {
                        name: 'Totaux',
                        value: `\`\`\`py\n@ Dégats: ${totalDamage}\nFrags: ${totalKills} (HS: ${totalHeadshots})\nDBNOs: ${totalDBNOs}\`\`\``,
                    },
                );
            }

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
    }
    catch(err) {
        logger.error('module => pubg => displayMatchShort: ', err);
    }
}

function roundStat(stat) {
    return stat.toFixed(2);
}

async function displayTelemetry(id, message, player) {
    const telemetry = await getSingleTelemetry(id);

    if (!telemetry) return;
    if (!telemetry[player]) return message.reply('ce joueur n\'a pas participé au dernier match.');

    const area51 = new MessageAttachment(path.join(rootDir, 'assets/img/area51.png'));
    const pubgIcon = new MessageAttachment(path.join(rootDir, 'assets/img/pubgIcon.gif'));
    const stats = telemetry[player];

    const embedContent = {
        color: 0xb26f1e,
        author: {
            name: 'Statistiques avancées pour ' + player,
            icon_url: 'attachment://pubgIcon.gif',
        },
        description: `\`Match ID: ${telemetry.matchID}\``,
        fields: [],
        timestamp: new Date(),
        footer: {
            text: 'Derpy v' + process.env.npm_package_version,
            icon_url: 'attachment://area51.png',
        },
    };

    if (stats.weapon) {
        const field = {
            name: 'Armes',
            value: '```py\n',
        };

        for (const name in stats.weapon) {
            const weapon = stats.weapon[name];
            const weaponName = causerNames[name] || name;

            if (weaponName && weapon.shots) {
                field.value += `@ ${weaponName}\nTir${weapon.shots > 1 ? 's' : ''}: ${weapon.shots} `
                + `Touche${weapon.hits > 1 ? 's' : ''}: ${weapon.hits} (HS: ${weapon.headShots})\n`
                + `Précision: ${roundStat(weapon.accuracy)}% (HS: ${roundStat(weapon.hsPercent)}%)\n\n`;
            }
        }

        field.value += '```';
        embedContent.fields.push(field);
    }

    if (stats.frag) {
        const field = {
            name: 'Frags',
            value: '```py\n',
        };
        let total = 0;

        stats.frag.forEach(frag => {
            const distance = humanizeMeters(frag.distance, false, true);
            const weapon = causerNames[frag.weapon] || frag.weapon;
            const location = locationNames[frag.location] || frag.location;
            field.value += `@ ${frag.name}\nArme: ${weapon}\nLocalisation: ${location}\nDistance: ${distance}\n\n`;
            total++;
        });

        field.value += `Total: ${total}\`\`\``;
        embedContent.fields.push(field);
    }

    if (stats.damageDone) {
        const field = {
            name: 'Dégats faits',
            value: '```py\n',
        };
        let total = 0;

        for (const victimName in stats.damageDone) {
            const victim = stats.damageDone[victimName];

            field.value += `@ ${victimName}\n`;

            for (const weaponName in victim) {
                const locations = victim[weaponName];
                const weapon = causerNames[weaponName] || weaponName;

                field.value += `${weapon} - `;

                for (const locationName in locations) {
                    const data = locations[locationName];
                    const where = locationNames[locationName] || locationName;
                    const damage = Math.round(data.damage);

                    field.value += `${where}: ${damage} (${data.hits}) `;
                    total += damage;
                }

                field.value += '\n';
            }

            field.value += '\n';
        }

        field.value += `Total: ${total}\`\`\``;
        embedContent.fields.push(field);
    }

    if (stats.damageTaken) {
        const field = {
            name: 'Dégats subits',
            value: '```py\n',
        };
        let total = 0;

        for (const attackerName in stats.damageTaken) {
            const victim = stats.damageTaken[attackerName];

            field.value += `@ ${attackerName}\n`;

            for (const weaponName in victim) {
                const locations = victim[weaponName];
                const weapon = causerNames[weaponName] || weaponName;

                field.value += `${weapon} - `;

                for (const locationName in locations) {
                    const data = locations[locationName];
                    const where = locationNames[locationName] || locationName;
                    const damage = Math.round(data.damage);

                    field.value += `${where}: ${damage} (${data.hits}) `;
                    total += damage;
                }

                field.value += '\n';
            }

            field.value += '\n';
        }

        if (stats.blue) field.value += `Bleu: ${Math.round(stats.blue)}\n\n`;

        field.value += `Total: ${total}${stats.blue ? ' (' + (total + Math.round(stats.blue)) + ')' : ''}\`\`\``;
        embedContent.fields.push(field);
    }

    if (stats.death) {
        const distance = humanizeMeters(stats.death.distance, false, true);
        const weapon = causerNames[stats.death.weapon] || stats.death.weapon;
        const location = locationNames[stats.death.location] || stats.death.location;

        const field = {
            name: 'Mort',
            value: `\`\`\`py\n@ ${stats.death.name}\nArme: ${weapon}\nLocalisation: ${location}\nDistance: ${distance}\`\`\``,
        };

        embedContent.fields.push(field);
    }

    message.channel.send({ files: [area51, pubgIcon], embed: embedContent })
        .catch(logger.error);
}

async function cleanMatches() {
    try {
        const query = await getMatch();

        if (!query.success) return;

        const data = query.data;

        if (data.length > 60) {
            const count = data.length - 60;

            for (let i = 0; i < count; i++) {
                const matchID = data[i].matchID;
                const match = data[i].match;
                const telemetryFile = match.telemetryURL.substring(match.telemetryURL.lastIndexOf('/') + 1);
                const success = await deleteSingleMatch(matchID);

                if (success) {
                    fs.remove(path.join(rootDir, 'data/pubg/telemetry/raw', telemetryFile))
                        .then(() => {
                            logger.debug(`Removed match: ${matchID} - With telemetry file: ${telemetryFile}`);
                        })
                        .catch(err => {
                            logger.error('module => pubg => cleanMatches: ', err);
                        });
                }
            }
        }
    }
    catch(err) {
        logger.error('module => pubg => cleanMatches: ', err);
    }
}

async function gotNewMatch(idS) {
    const filtered = [...new Set(idS)];

    filtered.forEach(async matchID => {
        try {
            // Get formated to array match from pubg api class, store it, display the match
            logger.debug(`Getting match id: ${matchID}`);
            const match = await pubg.getMatch(matchID);
            if (typeof match !== 'object') return;

            await addSingleMatch(matchID, match);
            await dbDerpyUpdate('lastDisplayedMatch', matchID);
            displayMatchShort(matchID);

            // Get the telemetry json
            const url = match.telemetryURL.match(/^https:\/\/telemetry-cdn\.playbattlegrounds\.com\/bluehole-pubg\/(.+)$/)[1];
            const fileName = match.telemetryURL.substring(match.telemetryURL.lastIndexOf('/') + 1);
            const filePath = path.join(rootDir, 'data/pubg/telemetry/raw', fileName);
            const writeStream = fs.createWriteStream(filePath);

            axios(url)
                .then(res => {
                    if (res.status == 200) {
                        res.data.pipe(writeStream);
                        writeStream.on('finish', () => {
                            logger.debug('Downloaded: ' + match.telemetryURL);
                            const telemetryJson = jsonfile.readFileSync(filePath);
                            const telemetry = pubg.parseTelemetry(telemetryJson);

                            addTelemetry(matchID, telemetry);
                        });
                        writeStream.on('error', (err) => {
                            logger.error('module => pubg => gotNewMatch writestream error: %o', err);
                        });
                    }
                })
                .catch(err => {
                    if (err.response) {
                        logger.error('module => pubg => gotNewMatch axios status: %o, data: %o', err.response.status, err.response.data);
                    }
                    else if (err.request) {
                        logger.error('module => pubg => gotNewMatch axios req: %o', err.response.request);
                    }
                    else {
                        logger.error('module => pubg => gotNewMatch axios message: %o', err.response.message);
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
    logger.debug('module => pubg: Updating players last match');
    const players = await pubg.getPlayersLastMatch();

    if (typeof players !== 'object') {
        logger.error('module => pubg => updatePlayersLastMatch: players is not an object, players: %o', players);
        return;
    }
    let gotNew = false;
    const idS = [];

    for (const player in players) {
        const lastMatches = await getPlayerLastMatch(player);
        const matches = players[player];
        let shouldUpdateDB = false;

        logger.debug(`module => pubg => updatePlayersLastMatch: lastMatches: ${lastMatches}, matches: ${matches}`);

        // If matches is not an object, the player did not play for some time
        if (typeof matches === 'object') {
            // PUBG modified the API and the last matches array order is now random (thanks btw)
            // If lastMatches is not an object it was the old method using a string, fix that
            if (typeof lastMatches !== 'object') await updatePlayerLastMatch(player, matches);

            for (const index in matches) {
                const match = matches[index];

                if (!lastMatches.includes(match)) {
                    gotNew = true;
                    shouldUpdateDB = true;
                    idS.push(match);
                }
            }
        }

        if (shouldUpdateDB) await updatePlayerLastMatch(player, matches);
    }

    if (gotNew) gotNewMatch(idS);
}

async function displayLastMatch(messageObj) {
    try {
        const matches = await getPlayersLastMatchArray();

        const filteredMatches = [...new Set(matches)];
        filteredMatches.forEach(match => {
            if (match) displayMatch(match, messageObj);
            //if (match) displayMatchShort(match, messageObj);
        });
    }
    catch(err) {
        logger.error('module => pubg => displayLastMatch: %o', err);
    }
}

async function displayFullMatch(messageObj) {
    try {
        const match = await dbDerpyGet('lastDisplayedMatch', false);
        if (match) displayMatch(match, messageObj);
    }
    catch(err) {
        logger.error('module => pubg => displayFullMatch: %o', err);
    }
}

async function commandStats(messageObj, args) {
    let player;

    if (args.length) {
        player = args[0];
        if(!/^[a-zA-Z0-9_-]{1,30}$/.test(player)) return;
    }
    else {
        player = messageObj.author.username;
    }

    try {
        const match = await dbDerpyGet('lastDisplayedMatch', false);
        if (match) displayTelemetry(match, messageObj, player);
    }
    catch(err) {
        logger.error('module => pubg => commandStats: %o', err);
    }
}

let timeout;
function updateInterval(time) {
    if (timeout) clearInterval(timeout);
    timeout = setInterval(updatePlayersLastMatch, time);
    logger.debug('Starting pubg interval, seconds: ' + time / 1000);
}

exports.displayLastMatch = displayLastMatch;
exports.displayFullMatch = displayFullMatch;
exports.commandStats = commandStats;

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'pubg:channels') await getModuleChannels();
    else if (message.message === 'pubg:config') await getModuleConfig();
});

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module pubg loaded');
