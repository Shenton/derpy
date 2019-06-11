const { config, client }  = require('../app');

function getGuild() {
    return client.guilds.get(config.guildID).name
}

exports.getGuild = getGuild;
