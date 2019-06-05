// npm modules
const fs = require('fs');
const path = require('path');

// Derpy globals
const { config, logger, rootDir, client, guildID } = require('../../app');

const { allowedVoiceChannels } = config.moduleConfig.music;

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
    // This bot is designed to only serve one guild
    if (message.guild.id != guildID) return;

    // Is a command (start with prefix), is not a bot
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    // Can the command be executed on this channel
    //if (message.channel.id != allowedChannel) return;

    // Is already playing
    if (isPlaying) return;

    // Grab and test the command
    const command = message.content.slice(config.prefix.length);
    if (!testCommand(command)) return;

    // Does this command exists
    if (!mp3List.includes(command)) return;

    // Grab the voice channel of the member
    const { voiceChannel } = message.member;

    // The member is not in a voice channel
    if (!voiceChannel) return;

    // This is not  an allowed voice channel
    if (!allowedVoiceChannels.includes(voiceChannel.id)) {
        return message.reply('Je ne suis pas autorisé à ouvrir ma tronche dans ce canal.')
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
        dispatcher.on('error', (err) => {
            isPlaying = false;
            voiceChannel.leave();
            logger.error(err);
        });
        dispatcher.on('debug', (debug) => {
            logger.debug(debug);
        });
    });
});
