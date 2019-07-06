const { logger } = require('../logger');
const validator = require('../validator');

const { addMP3, getMP3, updateMP3, deleteMP3 } = require('../collection/mp3');

async function get(query) {
    if (!query) query = {};

    const data = await getMP3(query);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data || !data.mp3) {
        logger.error('api => mp3 => Add: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.mp3(data.mp3)) badRequest.push('"mp3" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await addMP3(data.mp3);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function update(id, data) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const badRequest = [];

    if (!data && !data.mp3 && !data.enabled) {
        logger.error('api => mp3 => update: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.mp3) {
        if (!validator.mp3(data.mp3)) badRequest.push('"mp3" is not valid');
        else doc.mp3 = data.mp3;
    }

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateMP3({ _id: id }, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(id) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deleteMP3({ _id: id });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getMP3 = get;
module.exports.addMP3 = add;
module.exports.updateMP3 = update;
module.exports.deleteMP3 = del;
