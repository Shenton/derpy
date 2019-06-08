// Derpy globals
const { config } = require('../../../app');
const { getSafe, restartDerpy } = require('../../methods');

const commandName = 'restart';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    ownerOnly: true,
    description: 'Redémarre le bot',
    execute() {
        restartDerpy();
    },
};
