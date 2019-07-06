const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const { logger } = require('../../logger');

const { getMP3, addMP3, updateMP3, deleteMP3 } = require('../../../db/api/mp3');

function hasAccess(req, method) {
    if (!req.session) {
        logger.warn(`api => routes => mp3 => ${method}: access without session`);
        return false;
    }

    if (!req.session.discordAuth) {
        logger.warn(`api => routes => mp3 => ${method}: access without discord session set`);
        return false;
    }
    if (!req.session.discordAuth.isOwner && !req.session.discordAuth.hasAccess) {
        logger.warn(`api => routes => mp3 => ${method}: user did not have access user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
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

    const data = await getMP3();

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

    const data = await addMP3(req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ success: true });
        logger.info(`User: ${req.session.discordAuth.username} added mp3: %o`, req.body);
        process.send({ app: 'web', message: 'mp3:config' });
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

    const data = await updateMP3(req.params.id, req.body);

    res.status(data.status);

    if (data.success) {
        res.json({ modified: data.modified });
        logger.info(`User: ${req.session.discordAuth.username} edited mp3: %o`, req.body);
        process.send({ app: 'web', message: 'mp3:config' });
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
        logger.warn(`api => routes => mp3 => delete: user is not owner user: ${req.session.discordAuth.username} id: ${req.session.discordAuth.memberID}`);
        res.status(401);
        return res.send('Unauthorized');
    }

    const data = await deleteMP3(req.params.id);

    res.status(data.status);

    if (data.success) {
        res.json({ success: true });
        logger.info(`User: ${req.session.discordAuth.username} deleted a mp3`);
        process.send({ app: 'web', message: 'mp3:config' });
    }
    else {
        res.json(data.errors);
    }
});

// Upload
router.post('/upload', function(req, res) {
    const access = hasAccess(req, 'delete');

    if (!access) {
        res.status(401);
        return res.send('Unauthorized');
    }

    if (Object.keys(req.files).length === 0) {
        return res.status(404).json({ success: false, errors: ['No files were uploaded'] });
    }

    const file = req.files.file;

    if (file.mimetype !== 'audio/mpeg') return res.status(415).json({ success: false, errors: ['Wrong mime type'] });
    if (file.size > 1024 * 1024) return res.status(413).json({ success: false, errors: ['File size too big'] });
    if (!/^[a-z0-9]{3,10}\.mp3$/.test(file.name)) return res.status(400).json({ success: false, errors: ['File name or ext not supported'] });

    const dir = path.join(__dirname, '../../../bot/assets/mp3');
    const filePath = path.join(dir, file.name);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mp3'));

    if (files.includes(file.name)) return res.status(409).json({ success: false, errors: ['The file already exists'] });

    file.mv(filePath, function(err) {
        if (err) {
            logger.error('api => routes => mp3 => upload: ', err);
            return res.status(500).json({ success: false, errors: ['Error while uploading the file'] });
        }
        res.json({ success: true });
        process.send({ app: 'web', message: 'mp3:config' });
        logger.info(`api => routes => mp3 => upload: User: ${req.session.discordAuth.username} uploaded file: ${file.name}`);
    });
});

module.exports = router;
