// Derpy globals
const { loadConfig, logger } = require('../../../bot');

module.exports = {
    name: 'reload',
    ownerOnly: true,
    description: 'Recharge la configuration du bot',
    execute(message) {
        if (loadConfig()) {
            message.channel.send(`Configuration de Derpy v${process.env.npm_package_version} rechargée`)
                .catch(logger.error);
        }
    },
};
