const { logger } = require('../logger');
const validator = require('../validator');
const { getCommandsAndAliases } = require('../methods');

const { addQuote, getQuote, updateQuote, deleteQuote } = require('../collection/quote');

async function get(query) {
    if (!query) query = {};

    const data = await getQuote(query);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data || !data.name) {
        logger.error('api => quote => Add: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.command(data.name)) badRequest.push('"quote" is not valid');
    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const commandsAndAliases = await getCommandsAndAliases();
    if (!commandsAndAliases) return { success: false, status: 500, errors: ['Internal API error'] };
    if (commandsAndAliases.includes(data.name)) return { success: false, status: 409, errors: ['Command already exists'] };

    const success = await addQuote(data.name);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function update(id, data) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const badRequest = [];

    if (!data && !data.name && !data.enabled && !data.quotes) {
        logger.error('api => quote => update: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.name) {
        const commandsAndAliases = await getCommandsAndAliases();
        if (!commandsAndAliases) return { success: false, status: 500, errors: ['Internal API error'] };
        if (commandsAndAliases.includes(data.name)) return { success: false, status: 409, errors: ['Command already exists'] };
        if (!validator.quote(data.name)) badRequest.push('"name" is not valid');
        else doc.name = data.name;
    }

    if (data.quotes) {
        if (!validator.object(data.quotes)) badRequest.push('"quotes" is not valid');
        else doc.quotes = data.quotes;
    }

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateQuote({ _id: id }, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(id) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deleteQuote({ _id: id });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getQuote = get;
module.exports.addQuote = add;
module.exports.updateQuote = update;
module.exports.deleteQuote = del;
