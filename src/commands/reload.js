// Derpy globals
const { loadConfig, config, getSafe, logger } = require('../../app');

const commandName = 'reload';
const allowedGuild = getSafe(() => config.commandConfig[commandName].guildID, false);
const allowedChannel = getSafe(() => config.commandConfig[commandName].channelID, false);
const allowedRolesString = getSafe(() => config.commandConfig[commandName].allowedRoles, false);
const allowedRoles = allowedRolesString ? allowedRolesString.split(',') : false;

module.exports = {
    name: commandName,
    allowedGuild: allowedGuild,
    allowedChannel: allowedChannel,
    allowedRoles: allowedRoles,
    ownerOnly: true,
    description: 'Recharge la configuration du bot',
    execute(message) {
        if (loadConfig()) {
            message.channel.send(`Configuration de Derpy v${process.env.npm_package_version} rechargée`)
                .catch(logger.error);
        }
    },
};
