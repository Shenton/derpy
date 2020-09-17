const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const playerSchema = new Schema({
    player: {
        type: String,
        unique: true,
        required: true,
    },
    enabled: Boolean,
    lastMatch: Array,
    revision: Number,
});

playerSchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Player = mongoose.models.Player || mongoose.model('Player', playerSchema);

// Get
async function get(query) {
    try {
        const data = await Player.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => player => get: ', err);
        return false;
    }
}

// Add
async function add(value) {
    const player = new Player({
        player: value,
        enabled: false,
        revision: 0,
    });

    try {
        const newPlayer = await player.save();

        if(newPlayer === player) {
            logger.info(`collection => player => add: Added player: ${value}`);
            return 200;
        }
        else {
            logger.error('collection => player => add => save failed: newPlayer / player mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => player => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Player.updateOne(filter, doc);
        logger.debug('collection => player => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => player => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Player.deleteOne(filter);
        logger.debug('collection => player => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => player => delete: error: ', err);
        return false;
    }
}

exports.getPlayer = get;
exports.addPlayer = add;
exports.updatePlayer = update;
exports.deletePlayer = del;
