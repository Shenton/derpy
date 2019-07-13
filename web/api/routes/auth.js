const router = require('express').Router();
const bcrypt = require('bcrypt');

const { logger } = require('../../logger');

const { baseURL, discordClientID, discordRedirectCallback } = require('../../config');

router.get('/login', function(req, res) {
    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            logger.error('Routes => auth => bcrypt salt error: ', err);
            /**
             *
             * This should redirect to an error page
             *
             *
             */
            return res.redirect(baseURL);
        }

        bcrypt.hash(req.sessionID, salt, function(err, hash) {
            if (err) {
                logger.error('Routes => auth => login => bcrypt hash error: ', err);
                /**
                 *
                 * This should redirect to an error page
                 *
                 *
                 */
                return res.redirect(baseURL);
            }

            logger.debug('Routes => auth => login => bcrypt hash: ' + hash);
            req.session.discordState = hash;

            const callback = encodeURIComponent(discordRedirectCallback);
            const url = 'https://discordapp.com/api/oauth2/authorize'
                + '?client_id=' + discordClientID
                + '&redirect_uri=' + callback
                + '&response_type=code'
                + '&scope=identify%20guilds'
                + '&state=' + hash;

            res.redirect(url);
        });
    });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            logger.error('Routes => auth => logout => bcrypt hash error: ', err);
            /**
             *
             * This should redirect to an error page
             *
             *
             */
            return res.redirect(baseURL);
        }
        res.clearCookie('uuid');
        res.redirect(baseURL);
    });
});

module.exports = router;
