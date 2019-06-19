const router = require('express').Router();
const bcrypt = require('bcrypt');
const axios = require('axios');
const qs = require('qs');

const { logger } = require('../logger');
const { addUser, updateUser, getUUID } = require('../api/user');

const { baseURL, discordClientID, discordClientSecret, discordRedirectCallback } = require('../config').webServer;

let userData = {};
let uuid = '';

router.get('/callback', function(req, res) {
    if (!req.query.code) return logger.error('API => discord => callback: No code provided');
    if (!req.query.state) return logger.error('API => discord => callback: No state provided');

    bcrypt.compare(req.sessionID, req.query.state)
        .then(function(check) {
            if (!check) return logger.warn('API => discord => callback: state did not check', req);
        })
        .catch(err => {
            return logger.error('API => discord => callback: bcrypt error. ', err);
        });

    logger.debug('API => discord => callback recieved code:' + req.query.code);

    const tokenURL = 'https://discordapp.com/api/oauth2/token';
    const tokenData = {
        'client_id': discordClientID,
        'client_secret': discordClientSecret,
        'grant_type': 'authorization_code',
        'code': req.query.code,
        'redirect_uri': discordRedirectCallback,
        'scope': 'identify guilds',
    };
    const tokenOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(tokenData),
        url: tokenURL,
    };

    axios(tokenOptions)
        .then(tokenResponse => {
            logger.debug('API => discord => callback: token response: %o', tokenResponse.data);

            if (!tokenResponse.data.access_token
                || !tokenResponse.data.token_type
                || !tokenResponse.data.expires_in
                || !tokenResponse.data.refresh_token
                || !tokenResponse.data.scope) {
                logger.warn('API => discord => callback: Data missing from token response.');
                /**
                 *
                 * This should redirect to an error page
                 *
                 *
                 */
                return res.redirect(baseURL);
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
        .then(userResponse => {
            logger.debug('API => discord => callback: user response: %o', userResponse.data);

            if (!userResponse.data.username
                || !userResponse.data.avatar
                || !userResponse.data.discriminator
                || !userResponse.data.id) {
                logger.warn('API => discord => callback: Data missing from @me response.');
                /**
                 *
                 * This should redirect to an error page
                 *
                 *
                 */
                return res.redirect(baseURL);
            }

            userData.username = userResponse.data.username;
            userData.avatar = userResponse.data.avatar;
            userData.discriminator = userResponse.data.discriminator;
            userData.memberID = userResponse.data.id;

            return getUUID(userResponse.data.id);
        })
        .then(existsResponse => {
            if (existsResponse.status == 404) {
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

                return addUser(data);
            }
            else if (existsResponse.status == 200) {
                const data = {
                    accessToken: userData.accessToken,
                    tokenType: userData.tokenType,
                    expires: userData.expires,
                    refreshToken: userData.refreshToken,
                    username: userData.username,
                    avatar: userData.avatar,
                    discriminator: userData.discriminator,
                };

                uuid = existsResponse.data.uniqueID;

                return updateUser(userData.memberID, data);
            }

            userData = {};
            res.redirect(baseURL);
        })
        .then(addUserResponse => {
            if (addUserResponse.status == 200) {
                if (addUserResponse.data.uniqueID) uuid = addUserResponse.data.uniqueID;

                const cookieOptions = {
                    maxAge: 30 * 24 * 60 * 1000,
                    signed: true,
                };

                if (process.env.NODE_ENV === 'production') {
                    cookieOptions.secure = true;
                }

                res.cookie('uuid', uuid, cookieOptions);
            }
            else {
                let errors = 'Unknown error';

                if (addUserResponse.data && addUserResponse.data.errors) {
                    errors = addUserResponse.data.errors.join(', ');
                }

                logger.error(`API => discord => callback: add user error - status: ${addUserResponse.status} - errors: ${errors}`);
            }

            res.redirect(baseURL);
        })
        .catch(err => {
            let errorString;

            if (err.response) errorString = `API => discord => callback => Axios: Status: ${err.response.status} Data: ${JSON.stringify(err.response.data)}`;
            else if (err.request) errorString = `API => discord => callback => Axios: Request: ${err.request}`;
            else errorString = `API => discord => callback => Axios: Message: ${err.message}`;

            logger.error(errorString);
            /**
             *
             * This should redirect to an error page
             *
             *
             */
            return res.redirect(baseURL);
        });
});

module.exports = router;
