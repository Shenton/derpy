const { logger } = require('../logger');
const validator = require('../validator');

const { addPlayer, getPlayer, updatePlayer, deletePlayer } = require('../collection/player');

async function get(query) {
    if (!query) query = {};

    const data = await getPlayer(query);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data.player) {
        logger.error('api => player => Add: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.player(data.player)) badRequest.push('"player" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await addPlayer(data.player);

    if (success === 200) return { success: true, status: 200 };
    else if (success === 409) return { success: false, status: 409, errors: ['Already exists'] };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function updateByID(id, data) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    return await update({ _id: id }, data);
}

async function updateByPlayer(player, data) {
    if (!player) return { success: false, status: 400, errors: ['"player" is missing'] };
    if (!validator.player(player)) return { success: false, status: 400, errors: ['"player" is invalid'] };

    return await update({ player: player }, data);
}

async function update(filter, data) {
    const badRequest = [];

    if (!data && !data.player && !data.enabled) {
        logger.error('api => player => update: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.player) {
        if (!validator.player(data.player)) badRequest.push('"player" is not valid');
        else doc.player = data.player;
    }

    if (data.lastMatch) {
        if (!validator.uuidv4Array(data.lastMatch)) badRequest.push('"lastMatch" is not valid');
        else doc.lastMatch = data.lastMatch;
    }

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updatePlayer(filter, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function del(id) {
    if (!id) return { success: false, status: 400, errors: ['"id" is missing'] };
    if (!validator.mongoID(id)) return { success: false, status: 400, errors: ['"id" is invalid'] };

    const success = await deletePlayer({ _id: id });

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getPlayer = get;
module.exports.addPlayer = add;
module.exports.updatePlayerByID = updateByID;
module.exports.updatePlayerByPlayer = updateByPlayer;
module.exports.deletePlayer = del;
