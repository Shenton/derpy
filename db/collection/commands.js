const mongoose = require('../mongo');
const Schema = mongoose.Schema;

const { logger } = require('../logger');

const commandsSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    enabled: {
        type: Boolean,
        required: true,
    },
    description: String,
    usage: String,
    aliases: Array,
    allowedChannels: Array,
    allowedRoles: Array,
    ownerOnly: Boolean,
    guildOnly: Boolean,
    cooldown: Number,
    revision: Number,
});

commandsSchema.pre('updateOne', function() {
    this.updateOne({}, { $inc: { revision: 1 } });
});

const Commands = mongoose.models.Command || mongoose.model('Command', commandsSchema);

// Get
async function get(query, select) {
    try {
        const data = await Commands.find(query, select).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => commands => get: ', err);
        return false;
    }
}

// Add
async function add(name, description, usage, aliases, allowedChannels, allowedRoles, ownerOnly, guildOnly, cooldown) {
    const mod = new Commands({
        name: name,
        enabled: false,
        description: description,
        usage: usage,
        aliases: aliases,
        allowedChannels: allowedChannels,
        allowedRoles: allowedRoles,
        ownerOnly: ownerOnly,
        guildOnly: guildOnly,
        cooldown: cooldown,
        revision: 0,
    });

    try {
        const newCommand = await mod.save();

        if(newCommand === mod) {
            logger.info(`collection => commands => add: Added command: ${name}`);
            return 200;
        }
        else {
            logger.error('collection => commands => add => save failed: newUser / user mismatch');
            return 500;
        }
    }
    catch(err) {
        logger.error('collection => commands => add: error: ', err);
        if (err.name === 'MongoError' && err.code === 11000) return 409;
        return 500;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await Commands.updateOne(filter, doc);
        logger.debug('collection => commands => update: filter: %o - doc: %o', filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collection => commands => update: error: ', err);
        return false;
    }
}

// Delete
async function del(filter) {
    try {
        const data = await Commands.deleteOne(filter);
        logger.debug('collection => commands => delete: filter: %o', filter);
        return data;
    }
    catch(err) {
        logger.error('collection => commands => delete: error: ', err);
        return false;
    }
}

exports.getCommand = get;
exports.addCommand = add;
exports.updateCommand = update;
exports.deleteCommand = del;
