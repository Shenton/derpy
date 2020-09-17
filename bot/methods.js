const logger = require('./logger');
const client = require('./client');
const { guildID, channelID } = require('./variables');
const { getDerpy, updateDerpy, addDerpy } = require('../db/api/derpy');
const { getCommand, addCommand, updateCommandByName } = require('../db/api/commands');

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
            client.guilds.resolve(guildID).channels.resolve(channelID).send(message)
                .catch(logger.error);
        }
    }
    else {
        client.guilds.resolve(guildID).channels.resolve(channelID).send('Bye!')
            .catch(logger.error);
    }

    setTimeout(() => process.exit(), 3000);
}

function getInformation() {
    const output = {};
    const guild = client.guilds.resolve(guildID);

    if (guild && guild.available) {
        const channels = guild.channels.cache.array();
        const members = guild.members.cache.array();
        const roles = guild.roles.cache.array();

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
            const memberRoles = member.roles.cache.array();

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

async function dbDerpyGet(name, defaultValue) {
    try {
        const query = await getDerpy(name);

        if (query.status === 404) {
            await addDerpy(name, defaultValue);
            return defaultValue;
        }

        const value = query.data[0].value;

        if (value) return value;
        else return defaultValue;
    }
    catch(err) {
        logger.error('methods => dbDerpyGet: ', err);
    }
}

async function dbDerpyUpdate(name, value) {
    try {
        const query = await updateDerpy(name, { value: value });

        if (query.success) return true;
        else return false;
    }
    catch(err) {
        logger.error('methods => dbDerpyUpdate: ', err);
    }
}

async function dbCommandGet(name, description, usage, aliases, cooldown) {
    try {
        const query = await getCommand({ name: name });

        if (query.status === 404) {
            const request = await addCommand({
                name: name,
                description: description,
                usage: usage,
                aliases: aliases,
                cooldown: cooldown,
            });

            if (!request.success) {
                logger.error(`Adding command: ${name} failed. Error code: ${request.status}. Errors: ${request.errors}`);
            }
            return false;
        }

        /**
         *
         * Temporary fix
         *
         */
        if (description && !query.data[0].description) await updateCommandByName(name, { description: description });
        if (usage && !query.data[0].usage) await updateCommandByName(name, { usage: usage });
        if (aliases.length && !query.data[0].aliases.length) await updateCommandByName(name, { aliases: aliases });
        if (cooldown && !query.data[0].cooldown) await updateCommandByName(name, { cooldown: cooldown });
        /**
         *
         * /Temporary fix
         *
         */

        const data = query.data[0];

        if (data) return data;
        else return false;
    }
    catch(err) {
        logger.error('methods => dbCommandGet: ', err);
    }
}

exports.getSafe = getSafe;
exports.restartDerpy = restartDerpy;
exports.getInformation = getInformation;
exports.dbDerpyGet = dbDerpyGet;
exports.dbDerpyUpdate = dbDerpyUpdate;
exports.dbCommandGet = dbCommandGet;
