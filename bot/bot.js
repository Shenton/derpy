// npm modules
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Derpy modules
const logger = require('./logger');
const { prefix, ownerID, discordToken } = require('./config');
const { rootDir, guildID, helpEmbed } = require('./variables');
const { getDerpy, addDerpy, updateDerpy } = require('../db/collection/derpy');
const { getInformation } = require('./methods');

// Main Discord client
const client = require('./client');

// Logger
if (process.env.NODE_ENV === 'development') client.on('debug', logger.debug.bind(logger));
client.on('error', logger.error.bind(logger));

// Require and declare the commands
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(rootDir, 'commands')).filter(file => file.endsWith('.js'));
const commandsList = [];
(async () => {
    for (let i = 0; i < commandFiles.length; i++) {
        const file = commandFiles[i];
        const commandModule = require(`./commands/${file}`);
        const command = await commandModule.init();

        if (command) {
            client.commands.set(command.name, command);
            commandsList.push(prefix + command.name);
        }
    }
    const commandsString = commandsList.join(' ');
    helpEmbed.fields.push({ name: 'Génériques', value: `\`${commandsString}\`` });
})();

// Commands handling
const cooldowns = new Collection();
client.on('message', message => {

    // This bot is designed to only serve one guild
    if (message.channel.type === 'text' && message.guild.id != guildID) return;

    // Is a command (start with prefix), is not a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    /**
     * Set the command name and the arguments
     * Set the command to an object
     * Check if the command exists
     */
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.length && cmd.aliases.includes(commandName));
    if (!command) return;

    // Is the command owner only
    if (command.ownerOnly && message.author.id != ownerID) {
        logger.warn(`User ${message.author.username} (${message.author.tag}) try to use owner command ${commandName}`);
        return message.reply('tu ne peux pas utiliser cette commande.')
            .catch(logger.error);
    }

    // The command cannot be used in DM
    if (message.channel.type !== 'text' && command.guildOnly) {
        return message.reply('cette commande ne peut pas être utilisée en privé.')
            .catch(logger.error);
    }

    // Can the command be executed on this channel
    if (message.channel.type === 'text' && command.allowedChannels.length &&
        !command.allowedChannels.includes(message.channel.id)) {
        return message.reply('cette commande ne peut pas être utilisée sur ce canal.')
            .catch(logger.error);
    }

    // Do the member has role access
    let hasRoleAccess = false;
    if (message.author.id === ownerID) {
        hasRoleAccess = true;
    }
    else if (command.allowedRoles.length) {
        message.member.roles.array().forEach(role => {
            if (command.allowedRoles.includes(role.id)) hasRoleAccess = true;
        });
    }
    else {
        hasRoleAccess = true;
    }
    if (!hasRoleAccess) {
        return message.reply('tu ne peux pas utiliser cette commande.')
            .catch(logger.error);
    }

    /**
     * Add the command to the cooldown collection object, if needed
     * Check if the member has this command in cooldown, return a message if true
     * Add the member to the cooldown collection if the command can be executed
     */
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime && message.author.id != ownerID) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`merci d'attendre ${timeLeft.toFixed(1)} seconde(s) avant d'utiliser "${command.name}".`)
                .catch(logger.error);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Required args handling
    if (command.args && !args.length) {
        let reply = 'cette commande a besoin d\'argument(s).';
        if (command.usage) reply += `\nUtilisation: \`${prefix}${command.name} ${command.usage}\``;
        return message.reply(reply)
            .catch(logger.error);
    }

    logger.info(`User ${message.author.tag} used command: ${commandName} - with args: ${args}`);

    // Execute the command
    try {
        command.execute(message, args);
        if (message.deletable && !message.deleted) {
            message.delete()
                .then(msg => logger.debug(`Deleted message from ${msg.author.username}`))
                .catch(err => logger.error('main file => on message => delete message: ', err));
        }
    }
    catch (err) {
        logger.error(err);
        message.reply('il y a eu une erreur avec l\'exécution de cette commande.')
            .catch(logger.error);
    }
});

/**
 * When the bot is connected and ready to interact with the Discord server/guild/whatever
 * Call the bot modules loader
 */
client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('Hurr Durr Derp');

    // Modules loader
    require('./loader');

    // const restarted = db.getData('/restart/restarted');
    // if (restarted) {
    //     client.guilds.get(guildID).channels.get(channelID).send('Je suis de retour!')
    //         .catch(logger.error);
    //     db.push('/restart/restarted', false);
    // }

    // Populate the database with the bot information
    setbotInfo();

    // Send a process message when ready
    process.send({ app: 'bot', message: 'ready' });
});

client.on('channelCreate', () => setbotInfo());
client.on('channelDelete', () => setbotInfo());
client.on('channelUpdate', () => setbotInfo());
client.on('guildMemberAdd', () => setbotInfo());
client.on('guildMemberRemove', () => setbotInfo());
client.on('guildMemberUpdate', () => setbotInfo());
client.on('guildUpdate', () => setbotInfo());
client.on('roleCreate', () => setbotInfo());
client.on('roleDelete', () => setbotInfo());
client.on('roleUpdate', () => setbotInfo());

async function setbotInfo() {
    const info = getInformation();

    try {
        const data = await getDerpy({ name: 'information' });

        if (data.length) updateDerpy({ name: 'information' }, { value: info });
        else addDerpy('information', info);
    }
    catch(err) {
        logger.error('bot => client.js => getBotInfo error: ', err);
    }
}

// Restart process message
process.on('message', message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'restart') process.exit(1);
    else if (message.message === 'fullrestart') process.exit(0);
});

// Log Derpy to Discord
client.login(discordToken);
