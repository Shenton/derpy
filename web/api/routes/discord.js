const router = require('express').Router();
const bcrypt = require('bcrypt');
const axios = require('axios');
const qs = require('qs');

const { logger } = require('../../logger');
const { getOneUser, addUser, updateUser } = require('../../../db/api/user');

const { baseURL, discordClientID, discordClientSecret, discordRedirectCallback } = require('../../config');

function getMemberInfo(sessionID, state, code) {
    const userData = {};

    bcrypt.compare(sessionID, state)
        .then(function(check) {
            if (!check) {
                logger.warn('API => discord => callback: state did not check');
                return false;
            }
        })
        .catch(err => {
            logger.error('API => discord => callback: bcrypt error. ', err);
            return false;
        });

    logger.debug('API => discord => callback recieved code:' + code);

    const tokenURL = 'https://discordapp.com/api/oauth2/token';
    const tokenData = {
        'client_id': discordClientID,
        'client_secret': discordClientSecret,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': discordRedirectCallback,
        'scope': 'identify guilds',
    };
    const tokenOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(tokenData),
        url: tokenURL,
    };

    return axios(tokenOptions)
        .then(tokenResponse => {
            logger.debug('API => discord => callback: token response: %o', tokenResponse.data);

            if (!tokenResponse.data.access_token
                || !tokenResponse.data.token_type
                || !tokenResponse.data.expires_in
                || !tokenResponse.data.refresh_token
                || !tokenResponse.data.scope) {
                logger.warn('API => discord => callback: Data missing from token response.');
                return false;
            }

            const expires = Math.floor(tokenResponse.data.expires_in * 1000) + Date.now();
            userData.accessToken = tokenResponse.data.access_token;
            userData.tokenType = tokenResponse.data.token_type;
            userData.expires = expires;
            userData.refreshToken = tokenResponse.data.refresh_token;

            const userURL = 'http://discordapp.com/api/users/@me';
            const userOptions = {
                method: 'GET',
                headers: { 'Authorization': `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}` },
                url: userURL,
            };

            return axios(userOptions);
        })
        .then(async userResponse => {
            logger.debug('API => discord => callback: user response: %o', userResponse.data);

            if (!userResponse.data.username
                || !userResponse.data.avatar
                || !userResponse.data.discriminator
                || !userResponse.data.id) {
                logger.warn('API => discord => callback: Data missing from @me response.');
                return false;
            }

            userData.username = userResponse.data.username;
            userData.avatar = userResponse.data.avatar;
            userData.discriminator = userResponse.data.discriminator;
            userData.memberID = userResponse.data.id;

            return userData;
        })
        .catch(err => {
            let errorString;

            if (err.response) errorString = `API => discord => callback => Axios: Status: ${err.response.status} Data: ${JSON.stringify(err.response.data)}`;
            else if (err.request) errorString = `API => discord => callback => Axios: Request: ${err.request}`;
            else errorString = `API => discord => callback => Axios: Message: ${err.message}`;

            logger.error(errorString);
            return false;
        });
}

router.get('/callback', async function(req, res) {
    if (!req.query.code) return logger.error('API => discord => callback: No code provided');
    if (!req.query.state) return logger.error('API => discord => callback: No state provided');

    let uuid;

    const userData = await getMemberInfo(req.sessionID, req.query.state, req.query.code);

    if (!userData) {
        logger.warn('API => discord => callback: userData false, if the discord API is up this should not happen!!');
        /**
         *
         * This should redirect to an error page
         *
         *
         */
        return res.redirect(baseURL);
    }

    const existsQuery = await getOneUser({ memberID: userData.memberID });

    let userQuery;

    if (existsQuery.status == 404) {
        const data = {
            accessToken: userData.accessToken,
            tokenType: userData.tokenType,
            expires: userData.expires,
            refreshToken: userData.refreshToken,
            username: userData.username,
            avatar: userData.avatar,
            discriminator: userData.discriminator,
            memberID: userData.memberID,
        };

        userQuery = await addUser(data);
        uuid = userQuery.data.uniqueID;
    }
    else if (existsQuery.status == 200) {
        const data = {
            accessToken: userData.accessToken,
            tokenType: userData.tokenType,
            expires: userData.expires,
            refreshToken: userData.refreshToken,
            username: userData.username,
            avatar: userData.avatar,
            discriminator: userData.discriminator,
        };

        userQuery = await updateUser({ memberID: userData.memberID }, data);
        uuid = existsQuery.data.uniqueID;
    }
    else {
        res.redirect(baseURL);
    }

    if (userQuery.status == 200 && uuid) {
        const cookieOptions = { maxAge: 30 * 24 * 60 * 1000, signed: true };

        if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

        res.cookie('uuid', uuid, cookieOptions);
    }
    else {
        logger.error(`API => discord => callback: add user error - status: ${userQuery.status} - errors: ${userQuery.errors.join(', ')}`);
    }

    res.redirect(baseURL);
});

module.exports = router;
