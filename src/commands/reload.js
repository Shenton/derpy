// Derpy globals
const { loadConfig, config, getSafe, logger } = require('../../app');

const commandName = 'reload';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
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
