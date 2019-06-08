const JsonDB = require('node-json-db');
const path = require('path');

const { rootDir, logger, client, guildID, channelID } = require('../app');

const db = new JsonDB(path.join(rootDir, 'data/db/derpy'), true, true);

// Try to execute the provided function, return value if it fails
function getSafe(fn, value) {
    try {
        return fn() ? fn() : value;
    }
    catch (err) {
        logger.debug(err);
        return value;
    }
}

function restartDerpy() {
    db.push('/restart/restarted', true);
    client.guilds.get(guildID).channels.get(channelID).send('Bye!')
        .then(process.exit())
        .catch(logger.error);
}

exports.getSafe = getSafe;
exports.restartDerpy = restartDerpy;
