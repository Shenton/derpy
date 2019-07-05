const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const derpySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: {},
        required: true,
    },
    revision: Number,
});

derpySchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Derpy = mongoose.models.Derpy || mongoose.model('Derpy', derpySchema);

// Get
async function get(query, select) {
    try {
        const data = await Derpy.find(query, select).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => derpy => get: ', err);
        return false;
    }
}

// Add
async function add(name, value) {
    const derp = new Derpy({
        name: name,
        value: value,
        revision: 0,
    });

    try {
        const newEntry = await derp.save();

        if(newEntry === derp) {
            logger.info(`collection => derpy => add: ${name}`);
            return 200;
        }
        else {
            logger.error('collection => derpy => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => derpy => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Derpy.updateOne(filter, doc);
        // Disabled ATM, spam too much
        //logger.debug('collection => derpy => update: filter: %o - doc: %o', filter, doc);
        logger.debug(`collection => derpy => update: filter: ${filter} - doc: ${doc}`);
        return data;
    }
    catch(err) {
        logger.error('collection => derpy => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Derpy.deleteOne(filter);
        logger.debug('collection => derpy => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => derpy => delete: error: ', err);
        return false;
    }
}

exports.getDerpy = get;
exports.addDerpy = add;
exports.updateDerpy = update;
exports.deleteDerpy = del;
