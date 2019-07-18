const router = require('express').Router();

const { logger } = require('../../logger');

const { getCommand, updateCommandByID } = require('../../../db/api/commands');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => commands => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => commands => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner) {
        logger.warn(`api => routes => commands => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
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

    const query = await getCommand();

    res.status(query.status);

    if (query.success) res.json(query.data);
    else res.json(query.errors);
});

router.patch('/:id', async function(req, res) {
    const access = hasAccess(req, 'patch');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const query = await updateCommandByID(req.params.id, req.body);

    res.status(query.status);

    if (query.success) {
        res.json({ modified: query.modified });
        logger.info(`User: ${req.session.discordAuth.username} edited module: %o`, req.params.id);
        //process.send({ app: 'web', message: req.params.name + ':channels' });
    }
    else {
        res.json(query.errors);
    }
});

module.exports = router;
