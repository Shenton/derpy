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
            { rel: 'stylesheet', href: 'https://unpkg.com/bulmaswatch/darkly/bulmaswatch.min.css' },
            { rel: 'favicon', href: 'favicon.ico' },
        ],
        script: [
            { src: 'https://kit.fontawesome.com/2a418142fb.js', defer: true },
            { src: 'https://code.jquery.com/jquery-3.4.1.min.js', defer: true },
            { src: '~/assets/js/main.js', defer: true },
        ],
    },
    router: {
        esModule: false,
    },
    srcDir: __dirname,
    rootDir: __dirname,
    modulesDir: ['../node_modules'],
};
