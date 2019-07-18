const router = require('express').Router();

//const { logger } = require('../../logger');

const { getDerpy } = require('../../../db/api/derpy');
const { getModule } = require('../../../db/api/modules');
const { getCommand } = require('../../../db/api/commands');

router.get('/information', async function(req, res) {
    const data = await getDerpy('information');

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

router.get('/modules', async function(req, res) {
    const data = await getModule({}, 'name enabled');

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

router.get('/commands', async function(req, res) {
    const data = await getCommand({}, 'name aliases enabled');

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

module.exports = router;
