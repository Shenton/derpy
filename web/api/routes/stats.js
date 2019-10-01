const router = require('express').Router();

//const { logger } = require('../../logger');

const { getMatch } = require('../../../db/api/match');

router.get('/match', async function(req, res) {
    const data = await getMatch({}, 'matchID match');

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

router.get('/match/:id', async function(req, res) {
    const data = await getMatch({ matchID: req.params.id }, 'matchID match');

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

module.exports = router;
