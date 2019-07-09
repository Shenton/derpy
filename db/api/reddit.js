const { logger } = require('../logger');
const validator = require('../validator');

const { addReddit, getReddit, updateReddit, deleteReddit } = require('../collection/reddit');

async function get(query) {
    if (!query) query = {};

    const data = await getReddit(query);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data || !data.name || !data.listing || !data.type) {
        logger.error('api => reddit => Add: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.subreddit(data.name)) badRequest.push('"name" is not valid');
    if (!validator.listing(data.listing)) badRequest.push('"listing" is not valid');
    if (!validator.redditType(data.type)) badRequest.push('"type" is not valid');
    if (!validator.redditLimit(data.limit)) badRequest.push('"limit" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await addReddit(data.name, data.listing, data.type, data.limit);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function update(id, data) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const badRequest = [];

    if (!data && !data.name && !data.listing && !data.type && !data.limit && !data.enabled) {
        logger.error('api => reddit => update: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.name) {
        if (!validator.subreddit(data.name)) badRequest.push('"name" is not valid');
        else doc.name = data.name;
    }

    if (data.listing) {
        if (!validator.listing(data.listing)) badRequest.push('"listing" is not valid');
        else doc.listing = data.listing;
    }

    if (data.type) {
        if (!validator.redditType(data.type)) badRequest.push('"type" is not valid');
        else doc.type = data.type;
    }

    if (data.limit) {
        if (!validator.redditLimit(data.limit)) badRequest.push('"limit" is not valid');
        else doc.limit = data.limit;
    }

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateReddit({ _id: id }, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(id) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deleteReddit({ _id: id });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getReddit = get;
module.exports.addReddit = add;
module.exports.updateReddit = update;
module.exports.deleteReddit = del;
