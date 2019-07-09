const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const redditSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    listing: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    limit: Number,
    enabled: Boolean,
    revision: Number,
});

redditSchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Reddit = mongoose.models.Reddit || mongoose.model('Reddit', redditSchema);

// Get
async function get(query) {
    try {
        const data = await Reddit.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => reddit => get: ', err);
        return false;
    }
}

// Add
async function add(name, listing, type, limit) {
    const reddit = new Reddit({
        name: name,
        listing: listing,
        type: type,
        limit: limit,
        enabled: false,
        revision: 0,
    });

    try {
        const newReddit = await reddit.save();

        if(newReddit === reddit) {
            logger.info(`collection => reddit => add: Added reddit: ${name}`);
            return 200;
        }
        else {
            logger.error('collection => reddit => add => save failed: newReddit / reddit mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => reddit => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Reddit.updateOne(filter, doc);
        logger.debug('collection => reddit => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => reddit => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Reddit.deleteOne(filter);
        logger.debug('collection => reddit => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => reddit => delete: error: ', err);
        return false;
    }
}

exports.getReddit = get;
exports.addReddit = add;
exports.updateReddit = update;
exports.deleteReddit = del;
