const { Nuxt, Builder } = require('nuxt');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');

const { port, sessionSecret, authSecret, dbConnect, dbName } = require('./config');

const app = require('express')();

// Logger
const { logger, morganInfo, morganError } = require('./logger');
app.use(morganInfo);
app.use(morganError);

//db
const { getOneUser } = require('../db/api/user');

// We instantiate Nuxt.js with the options
const nuxtConfig = require('./nuxt.config.js');
nuxtConfig.dev = process.env.NODE_ENV === 'development' ? true : false;
const nuxt = new Nuxt(nuxtConfig);

// Security
app.use(helmet());
app.disable('x-powered-by');

// Middlewares
app.use(cookieParser(authSecret));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Session
const store = new MongoDBStore({
    uri: dbConnect + dbName,
    collection: 'sessions',
});
store.on('error', error => logger.error(error));

const sess = {
    secret: sessionSecret,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    store: store,
    resave: false,
    saveUninitialized: false,
};

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sess.cookie.secure = true;
}

app.use(session(sess));

// Set the discord session object
app.use(async function(req, res, next) {
    if (!req.signedCookies.uuid) return next();

    const uniqueID = req.signedCookies.uuid;

    if (!uniqueID) return next();

    if (!req.session.discordAuth) {
        const query = await getOneUser({ uniqueID: uniqueID });

        if (!query.success) {
            logger.error('web main => discord session: ' + query.errors.join(', '));
            return next();
        }

        req.session.discordAuth = {
            memberID: query.data.memberID,
            isOwner: query.data.isOwner,
            hasAccess: query.data.hasAccess,
            username: query.data.username,
            discriminator: query.data.discriminator,
            avatar: query.data.avatar,
        };

        req.session.save();
    }
    next();
});

// APIs
app.use('/api/auth', require('./api/routes/auth'));
app.use('/api/discord', require('./api/routes/discord'));
app.use('/api/system', require('./api/routes/system'));

// DB APIs
app.use('/api/public', require('./api/routes/public'));
app.use('/api/derpy', require('./api/routes/derpy'));
app.use('/api/commands', require('./api/routes/commands'));
app.use('/api/modules', require('./api/routes/modules'));
app.use('/api/activity', require('./api/routes/activity'));
app.use('/api/mp3', require('./api/routes/mp3'));
app.use('/api/player', require('./api/routes/player'));
app.use('/api/reddit', require('./api/routes/reddit'));
app.use('/api/rss', require('./api/routes/rss'));
app.use('/api/response', require('./api/routes/response'));

// Render every route with Nuxt.js
app.use(nuxt.render);

// Build only in dev mode with hot-reloading
if (nuxtConfig.dev) new Builder(nuxt).build().then(listen);
else listen();

function listen() {
    app.listen(port, '0.0.0.0');
    logger.info('Web server listening on `localhost:' + port + '`.');
}
