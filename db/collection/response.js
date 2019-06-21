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
});

const Response = mongoose.model('Response', responseSchema);

// Get
async function get(query) {
    try {
        const data = await Response.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => response => getOneLean: ', err);
        return false;
    }
}

// Add
async function add(trigger, response, type) {
    const query = new Response({
        trigger: trigger,
        response: response,
        type: type,
        enabled: true,
    });

    try {
        await query.save();
        logger.info(`collection => response => add: Added response: ${response} with trigger: ${trigger} and type: ${type}`);
        return true;
    }
    catch(err) {
        logger.error('collection => response => add => save: ', err);
        return false;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Response.updateOne(filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => response => update: ', err);
        return false;
    }
}

exports.getResponseLean = get;
exports.addResponse = add;
exports.updateResponse = update;
