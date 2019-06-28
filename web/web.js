const { Nuxt, Builder } = require('nuxt');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');

const { port, sessionSecret, authSecret } = require('./config').webServer;

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

// Session
const store = new MongoDBStore({
    uri: 'mongodb://localhost/derpy',
    collection: 'sessions',
});
store.on('error', error => logger.log(error));

const sess = {
    secret: sessionSecret,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    store: store,
    resave: true,
    saveUninitialized: true,
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
    logger.debug(uniqueID);

    if (!uniqueID) return next();

    if (!req.session.discordAuth) {
        const query = await getOneUser({ uniqueID: uniqueID });

        if (!query.success) return logger.error('web main => discord session: ' + query.errors.join(', '));

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
app.use('/api/response', require('./api/routes/response'));

// Render every route with Nuxt.js
app.use(nuxt.render);

// Build only in dev mode with hot-reloading
if (nuxtConfig.dev) {
    new Builder(nuxt).build()
        .then(listen);
}
else {
    listen();
}

function listen() {
    app.listen(port, '0.0.0.0');
    logger.info('Web server listening on `localhost:' + port + '`.');
}
