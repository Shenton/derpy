const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const modulesSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    enabled: {
        type: Boolean,
        required: true,
    },
    channels: Number,
    textChannel: String,
    textChannels: Array,
    voiceChannel: String,
    voiceChannels: Array,
    revision: Number,
});

modulesSchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Modules = mongoose.models.Module || mongoose.model('Module', modulesSchema);

// Get
async function get(query, select) {
    try {
        const data = await Modules.find(query, select).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => modules => get: ', err);
        return false;
    }
}

// Add
async function add(name, channels) {
    const mod = new Modules({
        name: name,
        enabled: false,
        channels: channels,
        revision: 0,
    });

    try {
        const newModule = await mod.save();

        if(newModule === mod) {
            logger.info(`collection => modules => add: Added module: ${name}`);
            return 200;
        }
        else {
            logger.error('collection => modules => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => modules => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Modules.updateOne(filter, doc);
        logger.debug('collection => modules => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => modules => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Modules.deleteOne(filter);
        logger.debug('collection => modules => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => modules => delete: error: ', err);
        return false;
    }
}

exports.getModule = get;
exports.addModule = add;
exports.updateModule = update;
exports.deleteModule = del;
