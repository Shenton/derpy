// npm modules
const jsonfile = require('jsonfile');

// Derpy globals
const { client, logger, rootDir } = require('../../app');

const out = {};

client.guilds.array().forEach(guild => {
    out[guild.name] = {
        'id': guild.id,
        'roles': {},
        'channels': {},
        'members': {},
    };
    guild.roles.array().forEach(role => {
        out[guild.name].roles[role.name] = {
            'id': role.id,
        };
    });
    guild.channels.array().forEach(channel => {
        out[guild.name].channels[channel.name] = {
            'type': channel.type,
            'id': channel.id,
        };
    });
    guild.members.array().forEach(member => {
        out[guild.name].members[member.displayName] = {
            'id': member.id,
        };
    });
    //logger.info(guild.name);
    jsonfile.writeFile(rootDir + '/data/dev.json', out, { spaces: 2, EOL: '\r\n' }, function(err) {
        if (err) logger.error(err);
    });
});

logger.debug('Module dev loaded');
