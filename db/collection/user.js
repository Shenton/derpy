const mongoose = require('../mongo');
const Schema = mongoose.Schema;
const uuidv4 = require('uuid/v4');

const { logger } = require('../logger');
const { ownerID } = require('../config');

const userSchema = new Schema({
    memberID: {
        type: String,
        required: true,
        unique: true,
    },
    uniqueID: {
        type: String,
        required: true,
        unique: true,
    },
    isOwner: Boolean,
    hasAccess: Boolean,
    username: String,
    discriminator: String,
    avatar: String,
    accessToken: String,
    tokenType: String,
    expires: Number,
    refreshToken: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Helpers
async function getNewUUID() {
    const uuid = uuidv4();

    try {
        const data = await User.find({ uniqueID: uuid }).select('uniqueID').lean();

        if (data.length) return getNewUUID();
        else return uuid;
    }
    catch(err) {
        logger.error('collection => user => getNewUUID: ', err);
        return false;
    }
}

// Get
async function get(query) {
    try {
        const data = await User.find(query).lean();
        return data;
    }
    catch(err) {
        logger.error('collection => user => get: ', err);
        return false;
    }
}

// Add
async function add(memberID, username, discriminator, avatar, accessToken, tokenType, expires, refreshToken) {
    const isOwner = memberID === ownerID ? true : false;
    const hasAccess = false;

    const uniqueID = await getNewUUID();

    const user = new User({
        memberID: memberID,
        uniqueID: uniqueID,
        isOwner: isOwner,
        hasAccess: hasAccess,
        username: username,
        discriminator: discriminator,
        avatar: avatar,
        accessToken: accessToken,
        tokenType: tokenType,
        expires: expires,
        refreshToken: refreshToken,
    });

    try {
        const newUser = await user.save();

        if (newUser === user) {
            logger.info(`collection => user => add: Added user: ${username} with id: ${memberID} and uuid: ${uniqueID}`);
            return uniqueID;
        }
        else {
            logger.error('collection => user => add => save failed: newUser / user mismatch');
            return false;
        }
    }
    catch(err) {
        logger.error('collection => user => add => save: ', err);
        return false;
    }
}

// Update
async function update(filter, doc) {
    try {
        const data = await User.updateOne(filter, doc);
        return data;
    }
    catch(err) {
        logger.error('collections => user => updateUser: ', err);
        return false;
    }
}

exports.getUser = get;
exports.addUser = add;
exports.updateUser = update;
