const router = require('express').Router();

const { logger } = require('../../logger');

const { getDerpy } = require('../../../db/api/derpy');

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

// System calls
router.get('/restart', async function(req, res) {
    const access = hasAccess(req, 'get');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const timer = setTimeout(() => {
        res.status(500).send('Error');
    }, 60000);

    process.send({ app: 'web', message: 'restart' });
    process.once('message', message => {
        if (typeof message !== 'object') return;
        if (!message.message) return;

        if (message.message === 'ready') {
            clearTimeout(timer);
            res.status(200).send('Derpy ready');
        }
    });
});

// DB calls
router.get('/:name', async function(req, res) {
    const access = hasAccess(req, 'get');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await getDerpy(req.params.name);

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

module.exports = router;
