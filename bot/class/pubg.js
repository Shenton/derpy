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
}

module.exports = pubgClass;
