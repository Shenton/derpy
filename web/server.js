const { Nuxt, Builder } = require('nuxt');

const { config, logger } = require('../app');
const { port } = config.webServer;

const app = require('express')();

// We instantiate Nuxt.js with the options
const nuxtConfig = require('./nuxt.config.js');
nuxtConfig.dev = process.env.NODE_ENV === 'development' ? true : false;
const nuxt = new Nuxt(nuxtConfig);

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
