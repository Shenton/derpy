const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const quoteSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    quotes: Array,
    enabled: Boolean,
    revision: Number,
});

quoteSchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Quote = mongoose.models.Quote || mongoose.model('Quote', quoteSchema);

// Get
async function get(query) {
    try {
        const data = await Quote.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => quote => get: ', err);
        return false;
    }
}

// Add
async function add(name) {
    const quote = new Quote({
        quote: name,
        enabled: false,
        revision: 0,
    });

    try {
        const newQuote = await quote.save();

        if(newQuote === quote) {
            logger.info(`collection => quote => add: Added quote: ${name}`);
            return 200;
        }
        else {
            logger.error('collection => quote => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => quote => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Quote.updateOne(filter, doc);
        logger.debug('collection => quote => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => quote => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Quote.deleteOne(filter);
        logger.debug('collection => quote => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => quote => delete: error: ', err);
        return false;
    }
}

exports.getQuote = get;
exports.addQuote = add;
exports.updateQuote = update;
exports.deleteQuote = del;
