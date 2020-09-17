// npm modules
const fs = require('fs');
const path = require('path');

// Derpy modules
const logger = require('../logger');
const client = require('../client');
const { prefix } = require('../config');
const { rootDir, guildID } = require('../variables');
const { getModule } = require('../../db/api/modules');
const { getMP3, addMP3 } = require('../../db/api/mp3');

// Module variables
let mp3List = [];
let isPlaying = false;

// Database call
let voiceChannels = [];
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'mp3' }, 'voiceChannels');
        voiceChannels = (query && query.data) ? query.data[0].voiceChannels : [];
    }
    catch(err) {
        logger.error('module => mp3 => getModuleChannels: ', err);
    }
}

async function getModuleConfig() {
    try {
        // Get the files array
        const files = fs.readdirSync(path.join(rootDir, 'assets/mp3')).filter(file => file.endsWith('.mp3'));

        // Get the DB data
        const query = await getMP3();
        if (!query.success && query.status !== 404) {
            logger.error('module => mp3 => getModuleConfig: DB query failed, errors: %o', query.errors);
            return;
        }
        const dbData = query.data || [];

        mp3List = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const commandName = path.basename(file, '.mp3');

            // Does the command/mp3 exists within the DB
            const exists = dbData.find(element => {
                return element.mp3 === commandName;
            });

            // It exists, use it if it is enabled
            if (exists) {
                // Does the command/mp3 is enabled
                const enabled = dbData.find(element => {
                    return element.mp3 === commandName && element.enabled;
                });

                // Does a command already exists with this name
                const command = client.commands.get(commandName) ||
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.length && cmd.aliases.includes(commandName));
                if (command) logger.error(`module => mp3 => getModuleConfig: A command with this name (${commandName}) already exists.`);
                else if (enabled) mp3List.push(commandName);
            }
            else {
                try {
                    await addMP3({ mp3: commandName });
                }
                catch(err) {
                    logger.error('module => mp3 => getModuleConfig: ', err);
                }
            }
        }
    }
    catch(err) {
        logger.error('module => mp3 => getModuleConfig: ', err);
    }
}

function testCommand(string) {
    return /^[a-z0-9]+$/.test(string);
}

client.on('message', message => {
    /**
     * Is the author a bot
     * Is the channel not a text channel
     * Is the guild not the one we are serving
     * Is not a command (start with prefix)
     * Is already playing
     *
     * then return
     */
    if (message.author.bot
        || message.channel.type !== 'text'
        || message.guild.id != guildID
        || !message.content.startsWith(prefix)
        || isPlaying) return;

    // Grab and test the command
    const command = message.content.slice(prefix.length);
    if (!testCommand(command)) return;

    // Does this command exists
    if (!mp3List.includes(command)) return;

    // Grab the voice channel of the member
    const voiceChannel = message.member.voice.channel;

    // The member is not in a voice channel
    if (!voiceChannel) return;

    // This is not an allowed voice channel
    if (!voiceChannels.includes(voiceChannel.id)) {
        return message.reply('je ne suis pas autorisé à ouvrir ma tronche dans ce canal.')
            .catch(logger.error);
    }

    // Delete the command
    message.delete();

    // Play the mp3
    voiceChannel.join().then(connection => {
        const file = path.join(rootDir, 'assets/mp3', command + '.mp3');
        const dispatcher = connection.play(file);
        dispatcher.on('start', () => {
            isPlaying = true;
        });
        dispatcher.on('finish', () => {
            setTimeout(() => {
                isPlaying = false;
                voiceChannel.leave();
            }, 2000);
        });
        dispatcher.on('error', err => {
            isPlaying = false;
            voiceChannel.leave();
            logger.error('module => mp3 => main event: ', err);
        });
        dispatcher.on('debug', debug => {
            logger.debug('module => mp3 => main event: ', debug);
        });
    });
});

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'mp3:channels') await getModuleChannels();
    else if (message.message === 'mp3:config') await getModuleConfig();
});

exports.getModuleChannels = getModuleChannels;
exports.getModuleConfig = getModuleConfig;

logger.debug('Module mp3 loaded');
