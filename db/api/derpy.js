const { logger } = require('../logger');
const validator = require('../validator');

const { getDerpy, addDerpy, updateDerpy } = require('../collection/derpy');

async function get(name) {
    if (!name) return { success: false, status: 400, errors: ['"name" is missing'] };
    if (!validator.letters(name)) return { success: false, status: 400, errors: ['"name" is invalid'] };

    const data = await getDerpy({ name: name }, 'value');

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(name, data) {
    if (!name) return { success: false, status: 400, errors: ['"name" is missing'] };
    if (!validator.letters(name)) return { success: false, status: 400, errors: ['"name" is invalid'] };

    if (!data) {
        logger.error('api => derpy => Add: Missing parameter.');

        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const success = await addDerpy(name, data);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function update(name, data) {
    if (!name) return { success: false, status: 400, errors: ['"name" is missing'] };
    if (!validator.letters(name)) return { success: false, status: 400, errors: ['"name" is invalid'] };

    if (!data) {
        logger.error('api => derpy => update: Missing parameter.');

        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const success = await updateDerpy({ name: name }, { value: data });

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getDerpy = get;
module.exports.addDerpy = add;
module.exports.updateDerpy = update;
