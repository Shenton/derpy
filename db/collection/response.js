const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const responseSchema = new Schema({
    trigger: {
        type: String,
        required: true,
        unique: true,
    },
    response: {
        type: String,
        required: true,
    },
    type: String,
    enabled: Boolean,
    revision: Number,
});

responseSchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Response = mongoose.models.Response || mongoose.model('Response', responseSchema);

// Get
async function get(query) {
    try {
        const data = await Response.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => response => get: ', err);
        return false;
    }
}

// Add
async function add(trigger, res, type) {
    const response = new Response({
        trigger: trigger,
        response: res,
        type: type,
        enabled: true,
        revision: 0,
    });

    try {
        const newResponse = await response.save();

        if(newResponse === response) {
            logger.info(`collection => response => add: Added response: ${res} with trigger: ${trigger} and type: ${type}`);
            return 200;
        }
        else {
            logger.error('collection => response => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => response => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Response.updateOne(filter, doc);
        logger.debug('collection => response => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => response => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Response.deleteOne(filter);
        logger.debug('collection => response => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => response => delete: error: ', err);
        return false;
    }
}

exports.getResponse = get;
exports.addResponse = add;
exports.updateResponse = update;
exports.deleteResponse = del;
