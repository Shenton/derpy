const router = require('express').Router();

const { logger } = require('../../logger');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => derpy => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => derpy => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner) {
        logger.warn(`api => routes => derpy => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        return false;
    }

    return true;
}

router.get('/restart', async function(req, res) {
    const access = hasAccess(req, 'get');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    logger.info(`User: ${req.session.discordAuth.username} called restart`);

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

module.exports = router;
