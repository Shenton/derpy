const axiosModule = require('axios');
let axios;

const httpErrors = {
    '401': 'Unauthorized',
    '404': 'Not Found',
    '415': 'Unsupported media type',
    '429': 'Too many requests',
};

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

    async getMatch(id) {
        try {
            const res = await axios(`matches/${id}`);
            if (res.status > 400) {
                return (httpErrors[res.status]) ? httpErrors[res.status] : res.status;
            }

            const out = {};
            out['duration'] = res.data.data.attributes.duration;
            out['map'] = res.data.data.attributes.mapName;
            out['time'] = res.data.data.attributes.createdAt;
            out['mode'] = res.data.data.attributes.gameMode;
            out['players'] = {};

            res.data.included.forEach(element => {
                if (element.type == 'participant' && this.players.includes(element.attributes.stats.name)) {
                    out.players[element.attributes.stats.name] = {
                        'DBNOs': element.attributes.stats.DBNOs,
                        'assists': element.attributes.stats.assists,
                        'boosts': element.attributes.stats.boosts,
                        'damageDealt': element.attributes.stats.damageDealt,
                        'deathType': element.attributes.stats.deathType,
                        'headshotKills': element.attributes.stats.headshotKills,
                        'heals': element.attributes.stats.heals,
                        'killPlace': element.attributes.stats.killPlace,
                        'killPoints': element.attributes.stats.killPoints,
                        'killStreaks': element.attributes.stats.killStreaks,
                        'kills': element.attributes.stats.kills,
                        'longestKill': element.attributes.stats.longestKill,
                        'revives': element.attributes.stats.revives,
                        'rideDistance': element.attributes.stats.rideDistance,
                        'roadKills': element.attributes.stats.roadKills,
                        'swimDistance': element.attributes.stats.swimDistance,
                        'teamKills': element.attributes.stats.teamKills,
                        'timeSurvived': element.attributes.stats.timeSurvived,
                        'vehicleDestroys': element.attributes.stats.vehicleDestroys,
                        'walkDistance': element.attributes.stats.walkDistance,
                        'weaponsAcquired': element.attributes.stats.weaponsAcquired,
                        'winPlace': element.attributes.stats.winPlace,
                    };
                }
                else if (element.type == 'asset' && element.id == res.data.data.relationships.assets.data[0].id) {
                    out['telemetryURL'] = element.attributes.URL;
                }
            });

            return out;
        }
        catch(err) {
            throw err;
        }
    }
}

module.exports = pubgClass;
