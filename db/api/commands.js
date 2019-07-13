const { logger } = require('../logger');
const validator = require('../validator');

const { addCommand, getCommand, updateCommand, deleteCommand } = require('../collection/commands');

async function get(query, select) {
    if (!query) query = {};

    const data = await getCommand(query, select);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data.name) {
        logger.error('api => commands => Add: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.command(data.name)) badRequest.push('"name" is not valid');
    if (data.description && !validator.isString(data.description)) badRequest.push('"description" is not valid');
    if (data.usage && !validator.isString(data.usage)) badRequest.push('"usage" is not valid');
    if (data.aliases && !validator.object(data.aliases)) badRequest.push('"aliases" is not valid');
    if (data.allowedChannels && !validator.channelIDs(data.allowedChannels)) badRequest.push('"allowedChannels" is not valid');
    if (data.allowedRoles && !validator.roleIDs(data.allowedRoles)) badRequest.push('"allowedRoless" is not valid');
    if (data.ownerOnly && !validator.isBoolean(data.ownerOnly)) badRequest.push('"ownerOnly" is not valid');
    if (data.guildOnly && !validator.isBoolean(data.guildOnly)) badRequest.push('"guildOnly" is not valid');
    if (data.cooldown && !validator.unsignedInteger(data.cooldown)) badRequest.push('"cooldown" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await addCommand(data.name, data.description, data.usage, data.aliases,
        data.allowedChannels, data.allowedRoles, data.ownerOnly, data.guildOnly);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function updateByID(id, data) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    return await update({ _id: id }, data);
}

async function updateByName(name, data) {
    if (!name) return { success: false, status: 400, errors: ['"name" is missing'] };
    if (!validator.command(name)) return { success: false, status: 400, errors: ['"name" is invalid'] };

    return await update({ name: name }, data);
}

async function update(filter, data) {
    const badRequest = [];

    if (!data && !data.trigger && !data.commands && !data.type) {
        logger.error('api => commands => update: Missing parameter.');

        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.description) {
        if (!validator.isString(data.description)) badRequest.push('"description" is not valid');
        else doc.description = data.description;
    }

    if (data.usage) {
        if (!validator.isString(data.usage)) badRequest.push('"usage" is not valid');
        else doc.usage = data.usage;
    }

    if (data.aliases) {
        if (!validator.object(data.aliases)) badRequest.push('"aliases" is not valid');
        else doc.aliases = data.aliases;
    }

    if (data.allowedChannels) {
        if (!validator.channelIDs(data.allowedChannels)) badRequest.push('"allowedChannels" is not valid');
        else doc.allowedChannels = data.allowedChannels;
    }

    if (data.allowedRoles) {
        if (!validator.roleIDs(data.allowedRoles)) badRequest.push('"allowedRoles" is not valid');
        else doc.allowedRoles = data.allowedRoles;
    }

    if (data.ownerOnly) {
        if (!validator.isBoolean(data.ownerOnly)) badRequest.push('"ownerOnly" is not valid');
        else doc.ownerOnly = data.ownerOnly;
    }

    if (data.guildOnly) {
        if (!validator.isBoolean(data.guildOnly)) badRequest.push('"guildOnly" is not valid');
        else doc.guildOnly = data.guildOnly;
    }

    if (data.cooldown) {
        if (!validator.unsignedInteger(data.cooldown)) badRequest.push('"cooldown" is not valid');
        else doc.cooldown = data.cooldown;
    }

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateCommand(filter, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(id) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deleteCommand({ _id: id });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getCommand = get;
module.exports.addCommand = add;
module.exports.updateCommandByID = updateByID;
module.exports.updateCommandByName = updateByName;
module.exports.deleteCommand = del;
