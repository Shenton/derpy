const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const activitySchema = new Schema({
    activity: {
        type: String,
        unique: true,
        required: true,
    },
    enabled: Boolean,
    revision: Number,
});

activitySchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

// Get
async function get(query) {
    try {
        const data = await Activity.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => activity => get: ', err);
        return false;
    }
}

// Add
async function add(value) {
    const activity = new Activity({
        activity: value,
        enabled: true,
        revision: 0,
    });

    try {
        const newActivity = await activity.save();

        if(newActivity === activity) {
            logger.info(`collection => activity => add: Added activity: ${value}`);
            return 200;
        }
        else {
            logger.error('collection => activity => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => activity => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Activity.updateOne(filter, doc);
        logger.debug('collection => activity => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => activity => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Activity.deleteOne(filter);
        logger.debug('collection => activity => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => activity => delete: error: ', err);
        return false;
    }
}

exports.getActivity = get;
exports.addActivity = add;
exports.updateActivity = update;
exports.deleteActivity = del;
