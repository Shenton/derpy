// Derpy globals
const { config } = require('../../../app');
const { getSafe } = require('../../methods');

const { setNewActivity } = require('../../modules/activity');

const commandName = 'activity';
const allowedChannels = getSafe(() => config.commandConfig[commandName].allowedChannels, false);
const allowedRoles = getSafe(() => config.commandConfig[commandName].allowedRoles, false);

module.exports = {
    name: commandName,
    allowedChannel: allowedChannels,
    allowedRoles: allowedRoles,
    cooldown: 60,
    description: 'Change l\'activité du bot au hasard',
    execute() {
        setNewActivity();
    },
};
