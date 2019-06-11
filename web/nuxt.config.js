const path = require('path');

const { rootDir } = require('../app');

module.exports = {
    head: {
        titleTemplate: '%s - Derpy',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },

            // hid is used as unique identifier. Do not use `vmid` for it as it will not work
            { hid: 'description', name: 'description', content: 'Meta description' },
        ],
        link: [
            { rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/bootswatch/4.3.1/darkly/bootstrap.min.css' },
            { rel: 'favicon', href: 'favicon.ico' },
        ],
        script: [
            { src: 'https://kit.fontawesome.com/2a418142fb.js', defer: true },
            { src: 'https://code.jquery.com/jquery-3.3.1.slim.min.js', defer: true },
            { src: 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js', defer: true },
            { src: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js', defer: true },
        ],
    },
    srcDir: path.join(rootDir, 'web'),
    rootDir: path.join(rootDir, 'web'),
    modulesDir: ['../node_modules'],
};
