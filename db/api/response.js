const { logger } = require('../logger');
const validator = require('../validator');

const { addResponse, getResponseLean, updateResponse } = require('../collection/response');

function get() {
    const query = getResponseLean({});

    if (!query) return { success: false, errors: ['Internal API error'] };

    query.then(data => {
        if (data) return { success: true, data: data };
        else return { success: false, errors: ['Data not found'] };
    });
}

function add(data) {
    const badRequest = [];

    if (!data.trigger || !data.response || !data.type) {
        logger.error('api => response => Add: Missing parameter.');

        return { success: false, errors: ['Missing parameters'] };
    }

    if (!validator.response(data.trigger)) badRequest.push('"trigger" is not valid');
    if (!validator.response(data.response)) badRequest.push('"response" is not valid');
    if (data.type !== 'exact' && data.type !== 'contain') badRequest.push('"type" is not valid');

    if (badRequest.length) return { success: false, errors: badRequest };

    const success = addResponse(data.trigger, data.response, data.type);

    if (success) return { success: true };
    else return { success: false, errors: ['Internal API error'] };
}

function update(id, data) {
    if (!id) return { success: false, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, errors: ['"id" is invalid'] };

    const badRequest = [];

    if (!data || !data.trigger || !data.response || !data.type) {
        logger.error('api => response => update: Missing parameter.');

        return { success: false, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (!validator.response(data.trigger)) badRequest.push('"trigger" is not valid');
    else doc.trigger = data.trigger;

    if (!validator.response(data.response)) badRequest.push('"response" is not valid');
    else doc.response = data.response;

    if (data.type !== 'exact' && data.type !== 'contain') badRequest.push('"type" is not valid');
    else doc.type = data.type;

    if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
    else doc.enabled = data.enabled;

    if (badRequest.length) return { success: false, errors: badRequest };

    const success = updateResponse({ memberID: id }, doc);

    if (success) return { success: true };
    else return { success: false, errors: ['Internal API error'] };
}

module.exports.getResponse = get;
module.exports.addResponse = add;
module.exports.updateResponse = update;
