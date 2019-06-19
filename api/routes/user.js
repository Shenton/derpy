const router = require('express').Router();

const { addUser, getUUID, getUserLean, updateUser } = require('../collections/user');
const { logger } = require('../logger');
const validator = require('../validator');

router.get('/', function(req, res) {
});

router.get('/:uniqueID', function(req, res) {
    const badRequest = [];

    if (!validator.uuidv4(req.params.uniqueID)) {
        badRequest.push('"uniqueID" is not valid');
        res.statusCode = 400;
        return res.json({ errors: badRequest });
    }

    const query = getUserLean({ uniqueID: req.params.uniqueID });

    if (!query) {
        res.statusCode = 500;
        return res.json({ errors: ['Internal API error'] });
    }

    query.then(data => {
        if (data) {
            res.statusCode = 200;
            return res.json(data);
        }
        else {
            res.statusCode = 404;
            return res.json({ errors: ['User not found'] });
        }
    });
});

router.get('/uuid/:memberID', function(req, res) {
    const badRequest = [];

    if (!validator.memberID(req.params.memberID)) {
        badRequest.push('"memberID" is not valid');
        res.statusCode = 400;
        return res.json({ errors: badRequest });
    }

    const query = getUUID({ memberID: req.params.memberID });

    if (!query) {
        res.statusCode = 500;
        return res.json({ errors: ['Internal API error'] });
    }

    query.then(data => {
        if (data) {
            res.statusCode = 200;
            return res.json(data);
        }
        else {
            res.statusCode = 404;
            return res.json(data);
        }
    });
});

router.post('/', function(req, res) {
    const badRequest = [];

    if (!req.body || !req.body.memberID || !req.body.username || !req.body.discriminator || !req.body.avatar
        || !req.body.accessToken || !req.body.tokenType || !req.body.expires || !req.body.refreshToken) {

        logger.error('Collections => User => Adduser: Missing parameter.');

        res.statusCode = 400;
        return res.json({ errors: ['Missing parameters'] });
    }

    if (!validator.memberID(req.body.memberID)) badRequest.push('"memberID" is not valid');
    if (!validator.username(req.body.username)) badRequest.push('"username" is not valid');
    if (!validator.discriminator(req.body.discriminator)) badRequest.push('"discriminator" is not valid');
    if (!validator.avatar(req.body.avatar)) badRequest.push('"avatar" is not valid');
    if (!validator.token(req.body.accessToken)) badRequest.push('"accessToken" is not valid');
    if (!validator.letters(req.body.tokenType)) badRequest.push('"tokenType" is not valid');
    if (!validator.unsignedInteger(req.body.expires)) badRequest.push('"expires" is not valid');
    if (!validator.token(req.body.refreshToken)) badRequest.push('"refreshToken" is not valid');

    if (badRequest.length) {
        res.statusCode = 400;
        return res.json({ errors: badRequest });
    }

    const uniqueID = addUser(req.body.memberID, req.body.username, req.body.discriminator, req.body.avatar,
        req.body.accessToken, req.body.tokenType, req.body.expires, req.body.refreshToken);

    if (uniqueID) {
        res.statusCode = 200;
        return res.json({ uniqueID: uniqueID });
    }
    else {
        res.statusCode = 500;
        return res.json({ errors: ['Internal API error'] });
    }
});

router.patch('/:memberID', function(req, res) {
    if (!req.params.memberID || !validator.memberID(req.params.memberID)) {
        res.statusCode = 400;
        return res.json({ errors: ['"memberID" is not valid or missing'] });
    }

    const badRequest = [];

    if (!req.body || (!req.body.memberID && !req.body.username && !req.body.discriminator && !req.body.avatar
        && !req.body.accessToken && !req.body.tokenType && !req.body.expires && !req.body.refreshToken)) {

        logger.error('Collections => User => Adduser: Missing parameter.');

        res.statusCode = 400;
        return res.json({ errors: ['Missing parameters'] });
    }

    const doc = {};

    if (req.body.username) {
        if (!validator.username(req.body.username)) badRequest.push('"username" is not valid');
        else doc.username = req.body.username;
    }
    if (req.body.discriminator) {
        if (!validator.discriminator(req.body.discriminator)) badRequest.push('"discriminator" is not valid');
        else doc.discriminator = req.body.discriminator;
    }
    if (req.body.avatar) {
        if (!validator.avatar(req.body.avatar)) badRequest.push('"avatar" is not valid');
        else doc.avatar = req.body.avatar;
    }
    if (req.body.accessToken) {
        if (!validator.token(req.body.accessToken)) badRequest.push('"accessToken" is not valid');
        else doc.accessToken = req.body.accessToken;
    }
    if (req.body.tokenType) {
        if (!validator.letters(req.body.tokenType)) badRequest.push('"tokenType" is not valid');
        else doc.tokenType = req.body.tokenType;
    }
    if (req.body.expires) {
        if (!validator.unsignedInteger(req.body.expires)) badRequest.push('"expires" is not valid');
        else doc.expires = req.body.expires;
    }
    if (req.body.refreshToken) {
        if (!validator.token(req.body.refreshToken)) badRequest.push('"refreshToken" is not valid');
        else doc.refreshToken = req.body.refreshToken;
    }

    const query = updateUser({ memberID: req.params.memberID }, doc);

    if (query) {
        res.statusCode = 200;
        return res.json({ modified: query.nModified });
    }
    else {
        res.statusCode = 500;
        return res.json({ errors: ['Internal API error'] });
    }
});

module.exports = router;
