const { logger } = require('../logger');
const validator = require('../validator');

const { addUser, getUser, updateUser } = require('../collection/user');

async function get(filter) {
    const badRequest = [];
    const f = {};

    if (filter && filter.memberID) {
        if (!validator.memberID(filter.memberID)) badRequest.push('"memberID" is not valid');
        else f.memberID = filter.memberID;
    }
    else if (filter && filter.uniqueID) {
        if (!validator.uuidv4(filter.uniqueID)) badRequest.push('"uniqueID" is not valid');
        else f.uniqueID = filter.uniqueID;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const data = await getUser(f);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function getOne(filter) {
    const badRequest = [];
    const f = {};

    if (!filter) return { success: false, status: 400, errors: ['filter is missing'] };

    if (filter.memberID) {
        if (!validator.memberID(filter.memberID)) badRequest.push('"memberID" is not valid');
        else f.memberID = filter.memberID;
    }
    else if (filter.uniqueID) {
        if (!validator.uuidv4(filter.uniqueID)) badRequest.push('"uniqueID" is not valid');
        else f.uniqueID = filter.uniqueID;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const data = await getUser(f);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data[0] };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function add(data) {
    const badRequest = [];

    if (!data.memberID || !data.username || !data.discriminator || !data.avatar
        || !data.accessToken || !data.tokenType || !data.expires || !data.refreshToken) {

        logger.error('api => user => add: Missing parameter.');

        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    if (!validator.memberID(data.memberID)) badRequest.push('"memberID" is not valid');
    if (!validator.username(data.username)) badRequest.push('"username" is not valid');
    if (!validator.discriminator(data.discriminator)) badRequest.push('"discriminator" is not valid');
    if (!validator.avatar(data.avatar)) badRequest.push('"avatar" is not valid');
    if (!validator.token(data.accessToken)) badRequest.push('"accessToken" is not valid');
    if (!validator.letters(data.tokenType)) badRequest.push('"tokenType" is not valid');
    if (!validator.unsignedInteger(data.expires)) badRequest.push('"expires" is not valid');
    if (!validator.token(data.refreshToken)) badRequest.push('"refreshToken" is not valid');

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const uniqueID = await addUser(data.memberID, data.username, data.discriminator, data.avatar,
        data.accessToken, data.tokenType, data.expires, data.refreshToken);

    if (uniqueID) return { success: true, status: 200, data: { uniqueID: uniqueID } };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

async function update(filter, data) {
    const badFilter = [];
    const f = {};

    if (!filter || (!filter.memberID && !filter.uniqueID && !filter._id)) {
        return { success: false, status: 400, errors: ['filter is missing'] };
    }

    if (filter.memberID) {
        if (!validator.memberID(filter.memberID)) badFilter.push('"memberID" is not valid');
        else f.memberID = filter.memberID;
    }
    else if (filter.uniqueID) {
        if (!validator.uuidv4(filter.uniqueID)) badFilter.push('"uniqueID" is not valid');
        else f.uniqueID = filter.uniqueID;
    }
    else if (filter._id) {
        if (!validator.mongoID(filter._id)) badFilter.push('"_id" is not valid');
        else f._id = filter._id;
    }

    if (badFilter.length) return { success: false, status: 400, errors: badFilter };

    const badRequest = [];

    if (!data.memberID && !data.username && !data.discriminator && !data.avatar && !data.accessToken
        && !data.tokenType && !data.expires && !data.refreshToken && data.hasAccess === 'undefined') {

        logger.error('api => user => update: Missing parameter.');
        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.username) {
        if (!validator.username(data.username)) badRequest.push('"username" is not valid');
        else doc.username = data.username;
    }
    if (data.discriminator) {
        if (!validator.discriminator(data.discriminator)) badRequest.push('"discriminator" is not valid');
        else doc.discriminator = data.discriminator;
    }
    if (data.avatar) {
        if (!validator.avatar(data.avatar)) badRequest.push('"avatar" is not valid');
        else doc.avatar = data.avatar;
    }
    if (data.accessToken) {
        if (!validator.token(data.accessToken)) badRequest.push('"accessToken" is not valid');
        else doc.accessToken = data.accessToken;
    }
    if (data.tokenType) {
        if (!validator.letters(data.tokenType)) badRequest.push('"tokenType" is not valid');
        else doc.tokenType = data.tokenType;
    }
    if (data.expires) {
        if (!validator.unsignedInteger(data.expires)) badRequest.push('"expires" is not valid');
        else doc.expires = data.expires;
    }
    if (data.refreshToken) {
        if (!validator.token(data.refreshToken)) badRequest.push('"refreshToken" is not valid');
        else doc.refreshToken = data.refreshToken;
    }
    if (data.hasAccess === true || data.hasAccess === false) {
        if (!validator.isBoolean(data.hasAccess)) badRequest.push('"hasAccess" is not valid');
        else doc.hasAccess = data.hasAccess;
    }
    if (data.statsAccess === true || data.statsAccess === false) {
        if (!validator.isBoolean(data.statsAccess)) badRequest.push('"statsAccess" is not valid');
        else doc.statsAccess = data.statsAccess;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateUser(f, doc);

    if (success) return { success: true, status: 200 };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

module.exports.getUser = get;
module.exports.getOneUser = getOne;
module.exports.addUser = add;
module.exports.updateUser = update;
