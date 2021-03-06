const router = require('express').Router();

const { logger } = require('../../logger');

const { getModule, updateModule } = require('../../../db/api/modules');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => modules => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => modules => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner) {
        logger.warn(`api => routes => modules => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
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

    const data = await getModule();

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

router.patch('/:name', async function(req, res) {
    const access = hasAccess(req, 'patch');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await updateModule(req.params.name, req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ modified: data.modified });
        logger.info(`User: ${req.session.discordAuth.username} edited module: %o`, req.params.name);
        process.send({ app: 'web', message: req.params.name + ':channels' });
    }
    else {
        res.json(data.errors);
    }
});

module.exports = router;
