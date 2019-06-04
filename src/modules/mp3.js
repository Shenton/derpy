// npm modules
const fs = require('fs');
const path = require('path');

// Derpy globals
const { config, logger, rootDir, getSafe, client } = require('../../app');

const moduleName = 'mp3';
const allowedGuild = getSafe(() => config.moduleConfig[moduleName].guildID, config.guildID);
const allowedChannel = getSafe(() => config.moduleConfig[moduleName].channelID, config.channelID);
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
    // Is a command (start with prefix), is not a bot
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    // Can the command be executed on this guild
    if (message.guild.id != allowedGuild) return;

    // Can the command be executed on this channel
    if (message.channel.id != allowedChannel) return;

    // Is already playing
    if (isPlaying) return;

    // Grab and test the command
    const command = message.content.slice(config.prefix.length);
    if (!testCommand(command)) return;

    // Does this command exists
    if (!mp3List.includes(command)) return;

    const { voiceChannel } = message.member;

    if (!voiceChannel) return;

    if (!allowedVoiceChannels.includes(voiceChannel.id)) {
        return message.reply('Je ne suis pas autorisé à ouvrir ma tronche dans ce canal.')
            .catch(logger.error);
    }

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
