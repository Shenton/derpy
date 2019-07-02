const logger = require('./logger');
const client = require('./client');
const config = require('./config');
const { guildID, channelID } = require('./variables');

// Try to execute the provided function, return value if it fails
function getSafe(fn, value) {
    try {
        return fn() ? fn() : value;
    }
    catch (err) {
        //logger.debug(err);
        return value;
    }
}

function restartDerpy(messageObject, message) {
    //db.push('/restart/restarted', true);
    if (message) {
        if (messageObject) {
            messageObject.channel.send(message)
                .catch(logger.error);
        }
        else {
            client.guilds.get(guildID).channels.get(channelID).send(message)
                .catch(logger.error);
        }
    }
    else {
        client.guilds.get(guildID).channels.get(channelID).send('Bye!')
            .catch(logger.error);
    }

    setTimeout(() => process.exit(), 3000);
}

function getInformation() {
    const output = {};
    const guild = client.guilds.get(config.guildID);

    if (guild && guild.available) {
        const channels = guild.channels.array();
        const members = guild.members.array();
        const roles = guild.roles.array();

        output.icon = guild.icon;
        output.iconURL = guild.iconURL;
        output.id = guild.id;
        output.memberCount = guild.memberCount;
        output.name = guild.name;

        output.channels = [];
        output.textChannels = [];
        output.voiceChannels = [];


        for (let i = 0; i < channels.length; i++) {
            const channel = channels[i];

            output.channels.push({
                id: channel.id,
                name: channel.name,
                type: channel.type,
            });

            if (channel.type === 'text') output.textChannels.push({ id: channel.id, name: channel.name });
            if (channel.type === 'voice') output.voiceChannels.push({ id: channel.id, name: channel.name });
        }

        output.members = [];

        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const memberRoles = member.roles.array();

            const r = [];

            for (let ii = 0; ii < memberRoles.length; ii++) {
                const role = memberRoles[ii];
                r.push({
                    id: role.id,
                    name: role.name,
                });
            }

            output.members.push({
                avatar: member.user.avatar,
                avatarURL: member.user.avatarURL,
                bot: member.user.bot,
                defaultAvatarURL: member.user.defaultAvatarURL,
                discriminator: member.user.discriminator,
                displayAvatarURL: member.user.displayAvatarURL,
                id: member.user.id,
                tag: member.user.tag,
                username: member.user.username,
                roles: r,
            });
        }

        output.roles = [];

        for (let i = 0; i < roles.length; i++) {
            const role = roles[i];

            output.roles.push({
                id: role.id,
                name: role.name,
            });
        }
    }

    return output;
}

exports.getSafe = getSafe;
exports.restartDerpy = restartDerpy;
exports.getInformation = getInformation;
