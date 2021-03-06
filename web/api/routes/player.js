const router = require('express').Router();

const { logger } = require('../../logger');

const { getPlayer, addPlayer, updatePlayerByID, deletePlayer } = require('../../../db/api/player');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => player => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => player => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner && !req.session.discordAuth.hasAccess) {
        logger.warn(`api => routes => player => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
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

    const data = await getPlayer();

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

router.post('/', async function(req, res) {
    const access = hasAccess(req, 'post');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await addPlayer(req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ success: true });
        logger.info(`User: ${req.session.discordAuth.username} added player: %o`, req.body);
        process.send({ app: 'web', message: 'pubg:config' });
    }
    else {
        res.json(data.errors);
    }
});

router.patch('/:id', async function(req, res) {
    const access = hasAccess(req, 'patch');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await updatePlayerByID(req.params.id, req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ modified: data.modified });
        logger.info(`User: ${req.session.discordAuth.username} edited player: %o`, req.body);
        process.send({ app: 'web', message: 'pubg:config' });
    }
    else {
        res.json(data.errors);
    }
});

router.delete('/:id', async function(req, res) {
    const access = hasAccess(req, 'delete');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    if (!req.session.discordAuth.isOwner) {
        logger.warn(`api => routes => player => delete: user is not owner user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await deletePlayer(req.params.id);

    res.status(data.status);

    if (data.success) {
        res.json({ success: true });
        logger.info(`User: ${req.session.discordAuth.username} deleted a player`);
        process.send({ app: 'web', message: 'pubg:config' });
    }
    else {
        res.json(data.errors);
    }
});

module.exports = router;
