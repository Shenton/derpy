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

function restartDerpy(messageObject, message) {
    db.push('/restart/restarted', true);
    if (message) {
        if (messageObject) {
            messageObject.channel.send(message)
                .catch(logger.error);
        }
        else {
            client.guilds.get(guildID).channels.get(channelID).send(message)
                .catch(logger.error);
        }
    }
    else {
        client.guilds.get(guildID).channels.get(channelID).send('Bye!')
            .catch(logger.error);
    }

    setTimeout(() => process.exit(), 3000);
}

exports.getSafe = getSafe;
exports.restartDerpy = restartDerpy;
