const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const matchSchema = new Schema({
    matchID: {
        type: String,
        unique: true,
        required: true,
    },
    match: {
        type: Object,
        required: true,
    },
    telemetry: Object,
});

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

// Get
async function get(query) {
    try {
        const data = await Match.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => match => get: ', err);
        return false;
    }
}

// Add
async function add(matchID, data) {
    const match = new Match({
        matchID: matchID,
        match: data,
    });

    try {
        const newMatch = await match.save();

        if(newMatch === match) {
            logger.info(`collection => match => add: Added match: ${matchID}`);
            return 200;
        }
        else {
            logger.error('collection => match => add => save failed: newMatch / match mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => match => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Match.updateOne(filter, doc);
        //logger.debug('collection => match => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => match => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Match.deleteOne(filter);
        logger.debug('collection => match => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => match => delete: error: ', err);
        return false;
    }
}

exports.getMatch = get;
exports.addMatch = add;
exports.updateMatch = update;
exports.deleteMatch = del;
