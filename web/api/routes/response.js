const router = require('express').Router();

const { logger } = require('../../logger');

const { getResponse, addResponse, updateResponse, deleteResponse } = require('../../../db/api/response');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => response => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => response => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner && !req.session.discordAuth.hasAccess) {
        logger.warn(`api => routes => response => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
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

    const data = await getResponse();

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

    const data = await addResponse(req.body);

    res.status(data.status);

    if (data.success) res.json({ success: true });
    else res.json(data.errors);
});

router.patch('/:id', async function(req, res) {
    const access = hasAccess(req, 'patch');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await updateResponse(req.params.id, req.body);

    res.status(data.status);

    if (data.success) res.json({ modified: data.modified });
    else res.json(data.errors);
});

router.delete('/:id', async function(req, res) {
    const access = hasAccess(req, 'delete');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    if (!req.session.discordAuth.isOwner) {
        logger.warn(`api => routes => response => delete: user is not owner user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await deleteResponse(req.params.id);

    res.status(data.status);

    if (data.success) res.json({ success: true });
    else res.json(data.errors);
});

module.exports = router;
