const { logger } = require('../logger');
const validator = require('../validator');

const { addMatch, getMatch, updateMatch, deleteMatch } = require('../collection/match');

async function get(query) {
    if (!query) query = {};

    const data = await getMatch(query);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data.matchID || !data.match) {
        logger.error('api => match => Add: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.uuidv4(data.matchID)) badRequest.push('"matchID" is not valid');
    if (!validator.object(data.match)) badRequest.push('"match" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await addMatch(data.matchID, data.match);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function update(matchID, data) {
    if (!matchID) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.uuidv4(matchID)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const badRequest = [];

    if (!data && !data.match) {
        logger.error('api => match => update: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.match) {
        if (!validator.object(data.match)) badRequest.push('"match" is not valid');
        else doc.match = data.match;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateMatch({ matchID: matchID }, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(matchID) {
    if (!matchID) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.uuidv4(matchID)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deleteMatch({ matchID: matchID });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

exports.getMatch = get;
exports.addMatch = add;
exports.updateMatch = update;
exports.deleteMatch = del;
