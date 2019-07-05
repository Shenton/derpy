// npm modules
const fs = require('fs');
const path = require('path');

// Derpy modules
const logger = require('../logger');
const config = require('../config');
const client = require('../client');
const { rootDir, guildID } = require('../variables');
const { getModule } = require('../../db/api/modules');

// Database call
let voiceChannels = [];
async function getModuleChannels() {
    try {
        const query = await getModule({ name: 'mp3' }, 'voiceChannels');
        voiceChannels = (query && query.data) ? query.data[0].voiceChannels : [];
    }
    catch(err) {
        logger.error('module => mp3 => getModuleConfig: ', err);
    }
}
getModuleChannels();

const mp3List = [];
let isPlaying = false;

const files = fs.readdirSync(path.join(rootDir, 'assets/mp3')).filter(file => file.endsWith('.mp3'));
for (const file of files) {
    const commandName = path.basename(file, '.mp3');
    mp3List.push(commandName);
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
        || !message.content.startsWith(config.prefix)
        || isPlaying) return;

    // Grab and test the command
    const command = message.content.slice(config.prefix.length);
    if (!testCommand(command)) return;

    // Does this command exists
    if (!mp3List.includes(command)) return;

    // Grab the voice channel of the member
    const { voiceChannel } = message.member;

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
        const dispatcher = connection.playFile(file);
        dispatcher.on('start', () => {
            isPlaying = true;
        });
        dispatcher.on('end', () => {
            isPlaying = false;
            voiceChannel.leave();
        });
        dispatcher.on('error', err => {
            isPlaying = false;
            voiceChannel.leave();
            logger.error(err);
        });
        dispatcher.on('debug', debug => {
            logger.debug(debug);
        });
    });
});
