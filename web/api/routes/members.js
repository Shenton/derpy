const router = require('express').Router();

const { logger } = require('../../logger');

const { getUser, updateUser } = require('../../../db/api/user');

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

router.get('/', async function(req, res) {
    const access = hasAccess(req, 'get');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await getUser();

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

router.patch('/:id', async function(req, res) {
    const access = hasAccess(req, 'patch');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await updateUser({ _id: req.params.id }, req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ modified: data.modified });
        logger.info(`User: ${req.session.discordAuth.username} edited user: %o - %o`, req.params.id, req.body);
        //process.send({ app: 'web', message: 'user:config' });
    }
    else {
        res.json(data.errors);
    }
});

module.exports = router;
