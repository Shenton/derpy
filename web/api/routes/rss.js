const router = require('express').Router();
const path = require('path');
const fs = require('fs');

const { logger } = require('../../logger');
const { getRss, addRss, updateRssByID, deleteRss } = require('../../../db/api/rss');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => rss => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => rss => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner && !req.session.discordAuth.hasAccess) {
        logger.warn(`api => routes => rss => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        return false;
    }

    return true;
}

// DB
router.get('/', async function(req, res) {
    const access = hasAccess(req, 'get');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await getRss();

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

    const data = await addRss(req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ success: true });
        logger.info(`User: ${req.session.discordAuth.username} added rss: %o`, req.body);
        process.send({ app: 'web', message: 'rss:config' });
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

    const data = await updateRssByID(req.params.id, req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ modified: data.modified });
        logger.info(`User: ${req.session.discordAuth.username} edited rss: %o`, req.body);
        process.send({ app: 'web', message: 'rss:config' });
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
        logger.warn(`api => routes => rss => delete: user is not owner user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await deleteRss(req.params.id);

    res.status(data.status);

    if (data.success) {
        res.json({ success: true });
        logger.info(`User: ${req.session.discordAuth.username} deleted a rss`);
        process.send({ app: 'web', message: 'rss:config' });
    }
    else {
        res.json(data.errors);
    }
});

// Upload
router.post('/upload', function(req, res) {
    const access = hasAccess(req, 'upload');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    if (Object.keys(req.files).length === 0) {
        return res.status(404).json({ success: false, errors: ['No files were uploaded'] });
    }

    const file = req.files.file;

    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') return res.status(415).json({ success: false, errors: ['Wrong mime type'] });
    if (file.size > 1024 * 1024) return res.status(413).json({ success: false, errors: ['File size too big'] });
    if (!/^[a-z0-9]{2,22}(\.jpeg|\.jpg|\.png){1}$/.test(file.name)) return res.status(400).json({ success: false, errors: ['File name or ext not supported'] });

    const dir = path.join(__dirname, '../../../bot/assets/img/rss');
    const filePath = path.join(dir, file.name);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

    if (files.includes(file.name)) return res.status(409).json({ success: false, errors: ['The file already exists'] });

    file.mv(filePath, function(err) {
        if (err) {
            logger.error('api => routes => rss => upload: ', err);
            return res.status(500).json({ success: false, errors: ['Error while uploading the file'] });
        }

        logger.info(`api => routes => rss => upload: User: ${req.session.discordAuth.username} uploaded file: ${file.name}`);
        //process.send({ app: 'web', message: 'rss:config' });
        res.json({ success: true });
    });
});

// Logos
router.get('/logos', function(req, res) {
    const access = hasAccess(req, 'logos');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    const dir = path.join(__dirname, '../../../bot/assets/img/rss');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

    if (files && files.length) {
        res.json(files);
    }
    else {
        res.status(404).json([]);
    }
});

module.exports = router;
