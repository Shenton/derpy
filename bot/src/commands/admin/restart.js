// Derpy globals
const { restartDerpy } = require('../../methods');

module.exports = {
    name: 'restart',
    ownerOnly: true,
    description: 'Redémarre le bot',
    execute() {
        restartDerpy();
    },
};
