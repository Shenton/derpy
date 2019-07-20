const router = require('express').Router();

const { logger } = require('../../logger');

const mongoose = require('../../../db/mongo');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => user => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => user => ${method}: access without discord session set`);
        return false;
    }

    if (!req.session.discordAuth.isOwner) {
        logger.warn(`api => routes => user => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        return false;
    }

    return true;
}

function find(name, query, skip, limit, cb) {
    mongoose.connection.db.collection(name, function(err, collection) {
        if (err) {
            logger.error('routes => logs => find: ', err);
        }
        else {
            collection.find(query)
                .sort('_id', -1)
                .skip(skip)
                .limit(limit)
                .toArray(cb);
        }
    });
}

router.get('/:logtype/:page?', async function(req, res) {
    const access = hasAccess(req, 'get');
    if (!access) return res.status(401).send('Unauthorized');
    if (!req.params.logtype) return res.status(400).send('Bad request');

    const logtype = req.params.logtype;
    const page = Number(req.params.page);

    if (logtype !== 'bot' && logtype !== 'db' && logtype !== 'web' && logtype !== 'webaccess') {
        return res.status(400).send('Bad request');
    }
    if (page && typeof page !== 'number') return res.status(400).send('Bad request');

    const limit = 20;
    const skip = page ? page * limit : 0;

    find('log' + logtype, {}, skip, limit, function(err, docs) {
        if (err) logger.error('routes => logs => get: ', err);
        else res.json(docs);
    });
});

module.exports = router;

