const router = require('express').Router();

const { logger } = require('../../logger');

const { getDerpy, updateDerpy } = require('../../../db/api/derpy');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => derpy => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => derpy => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner && !req.session.discordAuth.hasAccess) {
        logger.warn(`api => routes => derpy => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        return false;
    }

    return true;
}

router.get('/:name', async function(req, res) {
    const access = hasAccess(req, 'get');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    console.log(req.params.name)
    const query = await getDerpy(req.params.name);

    res.status(query.status);

    if (query.success) res.json(query.data);
    else res.json(query.errors);
});

router.patch('/:name', async function(req, res) {
    const access = hasAccess(req, 'patch');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const query = await updateDerpy(req.params.name, req.body);

    res.status(query.status);

    if (query.success) {
        res.json({ modified: query.modified });
        logger.info(`User: ${req.session.discordAuth.username} edited response: %o`, req.body);
        process.send({ app: 'web', message: 'music:config' });
    }
    else {
        res.json(query.errors);
    }
});

module.exports = router;
