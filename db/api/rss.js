const { logger } = require('../logger');
const validator = require('../validator');

const { addRss, getRss, updateRss, deleteRss } = require('../collection/rss');

async function get(query) {
    if (!query) query = {};

    const data = await getRss(query);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data.name || !data.feed || !data.nameURL) {
        logger.error('api => rss => Add: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.response(data.name)) badRequest.push('"name" is not valid');
    if (!validator.url(data.feed)) badRequest.push('"feed" is not valid');
    if (!validator.url(data.nameURL)) badRequest.push('"nameURL" is not valid');
    if (data.logo && !validator.logo(data.logo)) badRequest.push('"logo" is not valid');
    if (data.description && !validator.response(data.description)) badRequest.push('"description" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await addRss(data.name, data.feed, data.nameURL, data.logo, data.description);

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
    if (!validator.response(name)) return { success: false, status: 400, errors: ['"player" is invalid'] };

    return await update({ name: name }, data);
}

async function update(filter, data) {
    const badRequest = [];

    if (!data.name && !data.feed && !data.nameURL && !data.logo && !data.description && !data.enabled && !data.lastFeeds) {
        logger.error('api => rss => update: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.name) {
        if (!validator.response(data.name)) badRequest.push('"name" is not valid');
        else doc.name = data.name;
    }

    if (data.feed) {
        if (!validator.url(data.feed)) badRequest.push('"feed" is not valid');
        else doc.feed = data.feed;
    }

    if (data.nameURL) {
        if (!validator.url(data.nameURL)) badRequest.push('"nameURL" is not valid');
        else doc.nameURL = data.nameURL;
    }

    if (data.logo) {
        if (!validator.logo(data.logo)) badRequest.push('"logo" is not valid');
        else doc.logo = data.logo;
    }

    if (data.description) {
        if (!validator.response(data.description)) badRequest.push('"description" is not valid');
        else doc.description = data.description;
    }

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (data.lastFeeds) {
        if (!validator.object(data.lastFeeds)) badRequest.push('"lastFeeds" is not valid');
        else doc.lastFeeds = data.lastFeeds;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateRss(filter, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(id) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deleteRss({ _id: id });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

exports.getRss = get;
exports.addRss = add;
exports.updateRssByID = updateByID;
exports.updateRssByName = updateByName;
exports.deleteRss = del;
