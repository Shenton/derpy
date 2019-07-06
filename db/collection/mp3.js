const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const mp3Schema = new Schema({
    mp3: {
        type: String,
        unique: true,
        required: true,
    },
    enabled: Boolean,
    revision: Number,
});

mp3Schema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const MP3 = mongoose.models.MP3 || mongoose.model('MP3', mp3Schema);

// Get
async function get(query) {
    try {
        const data = await MP3.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => mp3 => get: ', err);
        return false;
    }
}

// Add
async function add(value) {
    const mp3 = new MP3({
        mp3: value,
        enabled: false,
        revision: 0,
    });

    try {
        const newMP3 = await mp3.save();

        if(newMP3 === mp3) {
            logger.info(`collection => mp3 => add: Added mp3: ${value}`);
            return 200;
        }
        else {
            logger.error('collection => mp3 => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => mp3 => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await MP3.updateOne(filter, doc);
        logger.debug('collection => mp3 => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => mp3 => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await MP3.deleteOne(filter);
        logger.debug('collection => mp3 => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => mp3 => delete: error: ', err);
        return false;
    }
}

exports.getMP3 = get;
exports.addMP3 = add;
exports.updateMP3 = update;
exports.deleteMP3 = del;
