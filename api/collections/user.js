const mongoose = require('../mongo');
const Schema = mongoose.Schema;
const uuidv4 = require('uuid/v4');

const { ownerID } = require('../config');

const { logger } = require('../logger');

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

const User = mongoose.model('User', userSchema);

// Helpers
async function getNewUUID() {
    const uuid = uuidv4();

    try {
        const query = await User.findOne({ uniqueID: uuid }).select('uniqueID').lean();

        query.then(data => {
            if (data) return getNewUUID();
            else return uuid;
        });
    }
    catch(err) {
        logger.error('Collections => User => getNewUUID: ', err);
        return false;
    }
}

// Get
async function getUserLean(query) {
    try {
        const data = await User.findOne(query).lean();
        return data;
    }
    catch(err) {
        logger.error('Collections => User => getUserLean: ', err);
        return false;
    }
}

async function getUUID(conditions) {
    try {
        const data = await User.findOne(conditions, 'uniqueID').lean();
        return data;
    }
    catch(err) {
        logger.error('Collections => User => getUUI: ', err);
        return false;
    }
}

// Add
async function addUser(memberID, username, discriminator, avatar, accessToken, tokenType, expires, refreshToken) {
    let uniqueID = uuidv4();
    const isOwner = memberID === ownerID ? true : false;
    const hasAccess = false;

    uniqueID = getNewUUID();

    if (!uniqueID) {
        logger.error('Collections => User => Adduser: Cannot get a new uuid');
        return false;
    }

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
        await user.save();
        logger.info(`Collections => User => Adduser: Added user: ${username} with id: ${memberID} and uuid: ${uniqueID}`);
        return uniqueID;
    }
    catch(err) {
        logger.error('Collections => User => Adduser => save: ', err);
        return false;
    }
}

// Update
async function updateUser(filter, doc) {
    try {
        const data = await User.updateOne(filter, doc);
        return data;
    }
    catch(err) {
        logger.error('Collections => User => updateUser: ', err);
        return false;
    }
}

exports.addUser = addUser;
exports.getUserLean = getUserLean;
exports.updateUser = updateUser;
exports.getUUID = getUUID;
