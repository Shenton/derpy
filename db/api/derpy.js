//const { logger } = require('../logger');
const validator = require('../validator');

const { getDerpy } = require('../collection/derpy');

async function get(query) {
    if (!query) return { success: false, status: 400, errors: ['"name" is missing'] };
    if (!validator.derpyName(query)) return { success: false, status: 400, errors: ['"name" is invalid'] };

    const data = await getDerpy({ name: query }, 'value');

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}


module.exports.getDerpy = get;
