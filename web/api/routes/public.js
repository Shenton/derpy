const router = require('express').Router();

//const { logger } = require('../../logger');

const { getDerpy } = require('../../../db/api/derpy');

router.get('/information', async function(req, res) {
    const data = await getDerpy('information');

    res.status(data.status);

    if (data.success) res.json(data.data);
    else res.json(data.errors);
});

module.exports = router;
