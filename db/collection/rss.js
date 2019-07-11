const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const rssSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    feed: {
        type: String,
        required: true,
    },
    nameURL: String,
    logo: String,
    description: String,
    lastFeeds: Array,
    enabled: Boolean,
    revision: Number,
});

rssSchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Rss = mongoose.models.Rss || mongoose.model('Rss', rssSchema);

// Get
async function get(query) {
    try {
        const data = await Rss.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => rss => get: ', err);
        return false;
    }
}

// Add
async function add(name, feed, nameURL, logo, description) {
    const rss = new Rss({
        name: name,
        feed: feed,
        nameURL: nameURL,
        logo: logo,
        description: description,
        lastFeeds: [],
        enabled: false,
        revision: 0,
    });

    try {
        const newRss = await rss.save();

        if(newRss === rss) {
            logger.info(`collection => rss => add: Added rss: ${feed}`);
            return 200;
        }
        else {
            logger.error('collection => rss => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => rss => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Rss.updateOne(filter, doc);
        logger.debug('collection => rss => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => rss => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Rss.deleteOne(filter);
        logger.debug('collection => rss => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => rss => delete: error: ', err);
        return false;
    }
}

exports.getRss = get;
exports.addRss = add;
exports.updateRss = update;
exports.deleteRss = del;
