const { logger } = require('../logger');
const validator = require('../validator');

const { addResponse, getResponse, updateResponse, deleteResponse } = require('../collection/response');

async function get(query) {
    if (!query) query = {};

    const data = await getResponse(query);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data.trigger || !data.response || !data.type) {
        logger.error('api => response => Add: Missing parameter.');

        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.response(data.trigger)) badRequest.push('"trigger" is not valid');
    if (!validator.response(data.response)) badRequest.push('"response" is not valid');
    if (data.type !== 'exact' && data.type !== 'contain') badRequest.push('"type" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await addResponse(data.trigger, data.response, data.type);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function update(id, data) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const badRequest = [];

    if (!data && !data.trigger && !data.response && !data.type) {
        logger.error('api => response => update: Missing parameter.');

        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.trigger) {
        if (!validator.response(data.trigger)) badRequest.push('"trigger" is not valid');
        else doc.trigger = data.trigger;
    }

    if (data.response) {
        if (!validator.response(data.response)) badRequest.push('"response" is not valid');
        else doc.response = data.response;
    }

    if (data.type) {
        if (data.type !== 'exact' && data.type !== 'contain') badRequest.push('"type" is not valid');
        else doc.type = data.type;
    }

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateResponse({ _id: id }, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(id) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deleteResponse({ _id: id });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getResponse = get;
module.exports.addResponse = add;
module.exports.updateResponse = update;
module.exports.deleteResponse = del;
