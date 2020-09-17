//npm modules
//const { MessageAttachment } = require('discord.js');
//const path = require('path');

// Derpy modules
const logger = require('../logger');
//const client = require('../client');
//const { rootDir } = require('../variables');
const { dbCommandGet } = require('../methods');

// Variables
const commandName = 'muteall';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = true;
let aliases = ['ma'];
let description = 'Mute tous les membres du canal ou tu te trouves';
let usage = false;
let cooldown = 3;

async function init() {
    try {
        const data = await dbCommandGet(commandName, description, usage, aliases, cooldown);

        if (data) {
            if (!data.enabled) return false;

            if (data.allowedChannels && data.allowedChannels.length) allowedChannels = data.allowedChannels;
            if (data.allowedRoles && data.allowedRoles.length) allowedRoles = data.allowedRoles;
            if (data.guildOnly) guildOnly = true;
            if (data.aliases && data.aliases.length) aliases = data.aliases;
            if (data.description) description = data.description;
            if (data.usage) usage = data.usage;
            if (data.cooldown) cooldown = data.cooldown;
        }

        return {
            name: commandName,
            allowedChannels: allowedChannels,
            allowedRoles: allowedRoles,
            guildOnly: guildOnly,
            aliases: aliases,
            description: description,
            usage: usage,
            async execute(message) {
                const { voiceChannel } = message.member;
                const members = voiceChannel.members.array();

                for (let i = 0; i < members.length; i++) {
                    const member = members[i];

                    member.setDeaf(true)
                        .catch(logger.error);

                    member.setMute(true)
                        .catch(logger.error);
                }
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
