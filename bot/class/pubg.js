const axiosModule = require('axios');
let axios;

const httpErrors = {
    '401': 'Unauthorized',
    '404': 'Not Found',
    '415': 'Unsupported media type',
    '429': 'Too many requests',
};

const itemIdToDamageCauser = {
    Item_Weapon_AK47_C: 'WeapAK47_C',
    Item_Weapon_AUG_C: 'WeapAUG_C',
    Item_Weapon_AWM_C: 'WeapAWM_C',
    Item_Weapon_Berreta686_C: 'WeapBerreta686_C',
    Item_Weapon_BerylM762_C: 'WeapBerylM762_C',
    Item_Weapon_BizonPP19_C: 'WeapBizonPP19_C',
    Item_Weapon_Cowbar_C: 'WeapCowbar_C',
    Item_Weapon_Crossbow_C: 'WeapCrossbow_1_C',
    Item_Weapon_DesertEagle_C: 'WeapDesertEagle_C',
    Item_Weapon_DP28_C: 'WeapDP28_C',
    Item_Weapon_FNFal_C: 'WeapFNFal_C',
    Item_Weapon_G18_C: 'WeapG18_C',
    Item_Weapon_G36C_C: 'WeapG36C_C',
    Item_Weapon_Grenade_C: 'ProjGrenade_C',
    Item_Weapon_Grenade_Warmode_C: 'ProjGrenade_C',
    Item_Weapon_Groza_C: 'WeapGroza_C',
    Item_Weapon_HK416_C: 'WeapHK416_C',
    Item_Weapon_Kar98k_C: 'WeapKar98k_C',
    Item_Weapon_M16A4_C: 'WeapM16A4_C',
    Item_Weapon_M1911_C: 'WeapM1911_C',
    Item_Weapon_M249_C: 'WeapM249_C',
    Item_Weapon_M24_C: 'WeapM24_C',
    Item_Weapon_M9_C: 'WeapM9_C',
    Item_Weapon_Machete_C: 'WeapMachete_C',
    Item_Weapon_Mini14_C: 'WeapMini14_C',
    Item_Weapon_Mk14_C: 'WeapMk14_C',
    Item_Weapon_Mk47Mutant_C: 'WeapMk47Mutant_C',
    Item_Weapon_Molotov_C: 'ProjMolotov_C',
    Item_Weapon_MP5K_C: 'WeapMP5K_C',
    Item_Weapon_NagantM1895_C: 'WeapNagantM1895_C',
    Item_Weapon_Pan_C: 'WeapPan_C',
    Item_Weapon_QBU88_C: 'WeapQBU88_C',
    Item_Weapon_QBZ95_C: 'WeapQBZ95_C',
    Item_Weapon_Rhino_C: 'WeapRhino_C',
    Item_Weapon_Saiga12_C: 'WeapSaiga12_C',
    Item_Weapon_Sawnoff_C: 'WeapSawnoff_C',
    'Item_Weapon_SCAR-L_C': 'WeapSCAR-L_C',
    Item_Weapon_Sickle_C: 'WeapSickle_C',
    Item_Weapon_SKS_C: 'WeapSKS_C',
    Item_Weapon_Thompson_C: 'WeapThompson_C',
    Item_Weapon_UMP_C: 'WeapUMP_C',
    Item_Weapon_UZI_C: 'WeapUZI_C',
    Item_Weapon_Vector_C: 'WeapVector_C',
    Item_Weapon_VSS_C: 'WeapVSS_C',
    Item_Weapon_vz61Skorpion_C: 'Weapvz61Skorpion_C',
    Item_Weapon_Win1894_C: 'WeapWin94_C',
    Item_Weapon_Winchester_C: 'WeapWinchester_C',
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

class pubgClass {
    constructor(apiKey, shard, players) {
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
        return {
            'Desert_Main': 'Miramar',
            'DihorOtok_Main': 'Vikendi',
            'Erangel_Main': 'Erangel',
            'Baltic_Main': 'Erangel',
            'Range_Main': 'Camp Jackal',
            'Savage_Main': 'Sanhok',
        };
    }

    async getPlayersLastMatch() {
        try {
            const out = {};

            await Promise.all(this.playersFormated.map(async players => {
                const res = await axios(`players?filter[playerNames]=${players}`);

                if (res.status > 400) return (httpErrors[res.status]) ? httpErrors[res.status] : res.status;

                res.data.data.forEach(player => {
                    // If the player did not play for a long time the last match did not exists
                    out[player.attributes.name] = player.relationships.matches.data[0] ? player.relationships.matches.data[0].id : null;
                });
            }));

            return out;
        }
        catch(err) {
            throw err;
        }
    }

    async getMatch(matchID) {
        try {
            const res = await axios(`matches/${matchID}`);
            if (res.status > 400) return (httpErrors[res.status]) ? httpErrors[res.status] : res.status;
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
            throw err;
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
            else if (element._T === 'LogPlayerKill') {
                if (element.killer && players.includes(element.killer.name) && !players.includes(element.victim.name)) {
                    addData(playerStats, element.killer.name, 'frag', {
                        name: element.victim.name,
                        dBNOId: element.dBNOId != -1 ? element.dBNOId : undefined,
                        weapon: element.damageCauserName,
                        location: element.damageReason,
                        distance: element.distance,
                    });
                }
                else if (element.killer && players.includes(element.victim.name)) {
                    addData(playerStats, element.victim.name, 'death', {
                        name: element.killer.name,
                        dBNOId: element.dBNOId != -1 ? element.dBNOId : undefined,
                        weapon: element.damageCauserName,
                        location: element.damageReason,
                        distance: element.distance,
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
