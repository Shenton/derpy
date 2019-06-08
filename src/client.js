// npm modules
const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const JsonDB = require('node-json-db');

const { client, config, logger, rootDir, guildID, channelID, helpEmbed } = require('../app');

const db = new JsonDB(path.join(rootDir, 'data/db/derpy'), true, true);
try {
    db.getData('/restart/restarted');
}
catch (err) {
    db.push('/restart/restarted', false);
    logger.debug(err);
}

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

/**
 * When the bot is connected and ready to interact with the Discord server/guild/whatever
 * Call the bot modules loader
 */
client.once('ready', () => {
    logger.info(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity('Hurr Durr Derp');

    // Modules loader
    require('./loader');

    const restarted = db.getData('/restart/restarted');
    if (restarted) {
        client.guilds.get(guildID).channels.get(channelID).send('Je suis de retour!')
            .catch(logger.error);
        db.push('/restart/restarted', false);
    }

    //client.fetchVoiceRegions().then(regions => regions.array().forEach(region => logger.debug('%o', region)));
});

// Require and declare the commands
const commandFiles = fs.readdirSync(path.join(rootDir, 'src/commands')).filter(file => file.endsWith('.js'));
const commandsList = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);

    const commandName = path.basename(file, '.js');
    commandsList.push(config.prefix + commandName);
}
const commandsString = commandsList.join(' ');
helpEmbed.fields.push({ name: 'Génériques', value: `\`${commandsString}\`` });

// Commands handling
client.on('message', message => {
    // This bot is designed to only serve one guild
    if (message.channel.type === 'text' && message.guild.id != guildID) return;

    // Is a command (start with prefix), is not a bot
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    /**
   * Set the command name and the arguments
   * Set the command to an object
   * Check if the command exists
   */
    const args = message.content.slice(config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // Is the command owner only
    if (command.ownerOnly && message.author.id != config.ownerID) {
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
    if (message.channel.type === 'text' && command.allowedChannels &&
        !command.allowedChannels.includes(message.channel.id)) {
        return message.reply('cette commande ne peut pas être utilisée sur ce canal.')
            .catch(logger.error);
    }

    // Do the member has role access
    let hasRoleAccess = false;
    if (command.allowedRoles) {
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
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime && message.author.id != config.ownerID) {
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
        if (command.usage) reply += `\nUtilisation: \`${config.prefix}${command.name} ${command.usage}\``;
        return message.reply(reply)
            .catch(logger.error);
    }

    logger.info(`User ${message.author.tag} used command: ${commandName} - with args: ${args}`);

    // Execute the command
    try {
        command.execute(message, args);
        if (message.channel.type === 'text') message.delete();
    }
    catch (err) {
        logger.error(err);
        message.reply('il y a eu une erreur avec l\'exécution de cette commande.')
            .catch(logger.error);
    }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(config.discordToken);
