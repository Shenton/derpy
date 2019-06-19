const { baseURL } = require('./config').api;

module.exports = {
    srcDir: __dirname,
    rootDir: __dirname,
    modulesDir: ['../node_modules'],
    modules: [
        '@nuxtjs/axios',
    ],
    axios: {
        baseURL: baseURL,
    },
    plugins: [
        '~/plugins/client/bulma.client.js',
    ],
    env: {
        version: process.env.npm_package_version,
    },
    head: {
        title: 'Derpy',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: 'Derpy the Dicord bot front-end' },
        ],
        link: [
            { rel: 'stylesheet', href: 'https://unpkg.com/bulmaswatch/darkly/bulmaswatch.min.css' },
            { rel: 'favicon', href: '/img/alien-icon.png' },
        ],
        script: [
            { src: 'https://kit.fontawesome.com/2a418142fb.js', defer: true },
            { src: 'https://code.jquery.com/jquery-3.4.1.min.js', defer: true },
        ],
    },
    router: {
        esModule: false,
    },
};
