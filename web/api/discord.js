const axios = require('axios');

const { baseURL } = require('../config').api;

async function setDiscordSession(req, uniqueID) {
    await axios.get(`${baseURL}/user/${uniqueID}`)
        .then(user => {
            req.session.discordAuth = {
                memberID: user.data.memberID,
                isOwner: user.data.isOwner,
                hasAccess: user.data.hasAccess,
                username: user.data.username,
                discriminator: user.data.discriminator,
                avatar: user.data.avatar,
            };

            req.session.save();
        });
}

exports.setDiscordSession = setDiscordSession;
