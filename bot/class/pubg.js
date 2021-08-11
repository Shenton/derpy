const axiosModule = require('axios');
const EventEmitter = require('events');

const { mapNames, locationNames, causerNames, gameModes, itemIdToDamageCauser } = require('./pubgVars');

const httpErrors = {
    '401': 'Unauthorized',
    '404': 'Not Found',
    '415': 'Unsupported media type',
    '429': 'Too many requests',
};

function addData(playerStats, player, type, data) {
    if (!playerStats[player]) playerStats[player] = {};

    if (type == 'damageDone') {
        if (!playerStats[player][type]) playerStats[player][type] = {};
        if (!playerStats[player][type][data.victim]) playerStats[player][type][data.victim] = {};
        if (!playerStats[player][type][data.victim][data.weapon]) playerStats[player][type][data.victim][data.weapon] = {};
        if (!playerStats[player][type][data.victim][data.weapon][data.location]) {
            playerStats[player][type][data.victim][data.weapon][data.location] = { damage: 0, hits: 0 };
        }
        playerStats[player][type][data.victim][data.weapon][data.location].damage += data.damage;
        playerStats[player][type][data.victim][data.weapon][data.location].hits++;
        addData(playerStats, player, 'weaponhit', data);
    }
    else if (type == 'damageTaken') {
        if (!playerStats[player][type]) playerStats[player][type] = {};
        if (!playerStats[player][type][data.attacker]) playerStats[player][type][data.attacker] = {};
        if (!playerStats[player][type][data.attacker][data.weapon]) playerStats[player][type][data.attacker][data.weapon] = {};
        if (!playerStats[player][type][data.attacker][data.weapon][data.location]) {
            playerStats[player][type][data.attacker][data.weapon][data.location] = { damage: 0, hits: 0 };
        }
        playerStats[player][type][data.attacker][data.weapon][data.location].damage += data.damage;
        playerStats[player][type][data.attacker][data.weapon][data.location].hits++;
    }
    else if (type == 'frag') {
        if (!playerStats[player][type]) playerStats[player][type] = [];
        playerStats[player][type].push(data);
    }
    else if (type == 'blue') {
        if (!playerStats[player][type]) playerStats[player][type] = 0;
        playerStats[player][type] += data;
    }
    else if (type == 'weaponshot') {
        const weapon = itemIdToDamageCauser[data.weapon] ? itemIdToDamageCauser[data.weapon] : data.weapon;

        if (!playerStats[player]['weapon']) playerStats[player]['weapon'] = {};
        if (!playerStats[player]['weapon'][weapon]) playerStats[player]['weapon'][weapon] = { shots: 0, hits: 0, headShots: 0 };
        if (data.fireWeaponStackCount > playerStats[player]['weapon'][weapon].shots) {
            playerStats[player]['weapon'][weapon].shots = data.fireWeaponStackCount;
        }
    }
    else if (type == 'weaponhit') {
        if (!playerStats[player]['weapon']) playerStats[player]['weapon'] = {};
        if (!playerStats[player]['weapon'][data.weapon]) playerStats[player]['weapon'][data.weapon] = { shots: 0, hits: 0, headShots: 0 };
        if (data.location === 'HeadShot') {
            playerStats[player]['weapon'][data.weapon].hits++;
            playerStats[player]['weapon'][data.weapon].headShots++;
        }
        else {
            playerStats[player]['weapon'][data.weapon].hits++;
        }
    }
    else if (type == 'death') {
        playerStats[player][type] = data;
    }
}

let axios;

class pubgClass extends EventEmitter {
    constructor(apiKey, shard, players) {
        super();

        this.apiKey = apiKey;
        this.shard = shard;
        this.players = players;
        this.playersFormated = [];

        // Slice the players array into 6 comma separated player names
        for (let i = 0, len = players.length; i < len; i += 6) {
            this.playersFormated.push(players.slice(i, i + 6).join());
        }

        axios = axiosModule.create({
            baseURL: `https://api.pubg.com/shards/${shard}/`,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/vnd.api+json',
            },
        });
    }

    updatePlayers(players) {
        this.players = players;
        this.playersFormated = [];

        for (let i = 0, len = players.length; i < len; i += 6) {
            this.playersFormated.push(players.slice(i, i + 6).join());
        }
    }

    updateShard(shard) {
        this.shard = shard;
        axios.defaults.baseURL = `https://api.pubg.com/shards/${shard}/`;
    }

    mapName() {
        return mapNames;
    }

    locationName() {
        return locationNames;
    }

    causerName() {
        return causerNames;
    }

    gameMode() {
        return gameModes;
    }

    async getPlayersLastMatch() {
        try {
            const out = {};

            await Promise.all(this.playersFormated.map(async players => {
                const res = await axios(`players?filter[playerNames]=${players}`);

                if (res.status > 400) {
                    this.emit('error', 'pubg class error => getPlayersLastMatch: res status: ' + (httpErrors[res.status]) ? httpErrors[res.status] : res.status);
                    return false;
                }

                res.data.data.forEach(player => {
                    // If the player did not play for a long time the last match did not exists
                    out[player.attributes.name] = player.relationships.matches.data[0] ? player.relationships.matches.data[0].id : null;

                    // This will fetch the whole array, was used when PUBG screw the API (it was returning randomly ordered last matches)
                    //out[player.attributes.name] = player.relationships.matches.data[0] ? player.relationships.matches.data.map(m => m.id) : false;
                });
            }));

            return out;
        }
        catch(err) {
            this.emit('error', 'pubg class error => getPlayersLastMatch: ' + err);
        }
    }

    async getMatch(matchID) {
        try {
            const res = await axios(`matches/${matchID}`);
            if (res.status > 400) {
                this.emit('error', 'pubg class error => getMatch: res status: ' + (httpErrors[res.status]) ? httpErrors[res.status] : res.status);
                return false;
            }
            if (res.data.data.attributes.mapName === 'Range_Main') return false;

            const out = {};
            out['duration'] = res.data.data.attributes.duration;
            out['map'] = res.data.data.attributes.mapName;
            out['time'] = res.data.data.attributes.createdAt;
            out['mode'] = res.data.data.attributes.gameMode;
            out['teams'] = [];

            const playerIDs = [];
            const playerStats = {};
            const teams = {};

            const included = res.data.included;

            // Grab the watched players IDs
            included.forEach(element => {
                if (element.type === 'participant' && this.players.includes(element.attributes.stats.name)) {
                    playerIDs.push(element.id);
                    playerStats[element.id] = element.attributes.stats;
                }
                else if (element.type == 'asset' && element.id == res.data.data.relationships.assets.data[0].id) {
                    out['telemetryURL'] = element.attributes.URL;
                }
            });

            // Grab the teams
            included.forEach(element => {
                if (element.type === 'roster') {
                    element.relationships.participants.data.forEach(player => {
                        if (playerIDs.includes(player.id) && !teams[element.id]) {
                            teams[element.id] = {
                                rank: element.attributes.stats.rank,
                                playerIDs: element.relationships.participants.data.map(p => p.id),
                                players: [],
                            };
                        }
                    });
                }
            });

            // Add/grab the players stats
            for (const teamID in teams) {
                teams[teamID].playerIDs.forEach(id => {
                    if (playerStats[id]) {
                        teams[teamID].players.push(playerStats[id]);
                    }
                    else {
                        included.forEach(element => {
                            if (element.type === 'participant' && element.id === id) {
                                teams[teamID].players.push(element.attributes.stats);
                            }
                        });
                    }
                });

                out['teams'].push(teams[teamID]);
            }

            return out;
        }
        catch(err) {
            this.emit('error', 'pubg class error => getMatch: ' + err);
        }
    }

    parseTelemetry(telemetry) {
        const playerStats = {};
        const DBNOs = {};
        const players = this.players;

        const matchID = telemetry[0].MatchId.match(/^.+\.(.+)$/)[1];
        playerStats.matchID = matchID;

        telemetry.forEach(element => {
            if (element._T === 'LogPlayerMakeGroggy') {
                if ((element.attacker && players.includes(element.attacker.name)) || (element.victim && players.includes(element.victim.name))) {
                    DBNOs[element.dBNOId] = {
                        weapon: element.damageCauserName,
                        location: element.damageReason,
                        distance: element.distance,
                    };
                }
            }
            else if (element._T === 'LogPlayerTakeDamage') {
                if (element.attacker && element.damage && players.includes(element.attacker.name) && !players.includes(element.victim.name)) {
                    addData(playerStats, element.attacker.name, 'damageDone', {
                        victim: element.victim.name,
                        damage: element.damage,
                        location: element.damageReason,
                        weapon: element.damageCauserName,
                    });
                }
                else if (element.attacker && element.damage && players.includes(element.victim.name)) {
                    addData(playerStats, element.victim.name, 'damageTaken', {
                        attacker: element.attacker.name,
                        damage: element.damage,
                        location: element.damageReason,
                        weapon: element.damageCauserName,
                    });
                }
                else if (!element.attacker && players.includes(element.victim.name) && element.damageTypeCategory == 'Damage_BlueZone' && element.damage) {
                    addData(playerStats, element.victim.name, 'blue', element.damage);
                }
            }
            else if (element._T === 'LogPlayerKillV2') {
                if (element.killer && players.includes(element.killer.name) && !players.includes(element.victim.name)) {
                    addData(playerStats, element.killer.name, 'frag', {
                        name: element.victim.name,
                        dBNOId: element.dBNOId != -1 ? element.dBNOId : undefined,
                        weapon: element.killerDamageInfo.damageCauserName,
                        location: element.killerDamageInfo.damageReason,
                        distance: element.killerDamageInfo.distance,
                    });
                }
                else if (element.killer && players.includes(element.victim.name)) {
                    addData(playerStats, element.victim.name, 'death', {
                        name: element.killer.name,
                        dBNOId: element.dBNOId != -1 ? element.dBNOId : undefined,
                        weapon: element.killerDamageInfo.damageCauserName,
                        location: element.killerDamageInfo.damageReason,
                        distance: element.killerDamageInfo.distance,
                    });
                }
            }
            else if (element._T === 'LogPlayerAttack') {
                if (players.includes(element.attacker.name)) {
                    addData(playerStats, element.attacker.name, 'weaponshot', { weapon: element.weapon.itemId, fireWeaponStackCount: element.fireWeaponStackCount });
                }
            }
        });

        for (const playerName in playerStats) {
            const player = playerStats[playerName];

            if (player.weapon) {
                for (const weaponName in player.weapon) {
                    const weapon = player.weapon[weaponName];
                    const accuracy = (weapon.hits / weapon.shots * 100) || 0;
                    const hsPercent = (weapon.headShots / weapon.hits * 100) || 0;

                    playerStats[playerName].weapon[weaponName].accuracy = accuracy;
                    playerStats[playerName].weapon[weaponName].hsPercent = hsPercent;
                }
            }

            if (player.frag) {
                for (const fragName in player.frag) {
                    const frag = player.frag[fragName];
                    const data = DBNOs[frag.dBNOId];

                    if (data) {
                        playerStats[playerName].frag[fragName].weapon = data.weapon;
                        playerStats[playerName].frag[fragName].location = data.location;
                        playerStats[playerName].frag[fragName].distance = data.distance;
                        playerStats[playerName].frag[fragName].dBNOId = undefined;
                    }
                }
            }

            if (player.death) {
                const data = DBNOs[player.death.dBNOId];

                if (data) {
                    playerStats[playerName].death.weapon = data.weapon;
                    playerStats[playerName].death.location = data.location;
                    playerStats[playerName].death.distance = data.distance;
                    playerStats[playerName].death.dBNOId = undefined;
                }
            }
        }

        return playerStats;
    }
}

module.exports = pubgClass;
