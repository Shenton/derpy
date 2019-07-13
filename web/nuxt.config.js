const { baseURL } = require('./config');

module.exports = {
    env: {
        version: process.env.npm_package_version,
    },
    srcDir: __dirname,
    rootDir: __dirname,
    modulesDir: ['../node_modules'],
    modules: [
        '@nuxtjs/axios',
        'bootstrap-vue/nuxt',
    ],
    axios: {
        baseURL: baseURL + '/api/',
    },
    bootstrapVue: {
        bootstrapCSS: false,
        bootstrapVueCSS: false,
    },
    plugins: [
        '~/plugins/toast.client',
        '~/plugins/scroll-to-top.client',
        '~/plugins/axios-error-handler',
    ],
    router: {
        esModule: false,
    },
    css: [
        '~/assets/scss/main.scss',
    ],
    head: {
        title: 'Derpy',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: 'Front-end of Derpy the Discord bot' },
        ],
        link: [
            { rel: 'favicon', href: '/img/alien-icon.png' },
        ],
        script: [
            { src: 'https://kit.fontawesome.com/2a418142fb.js', defer: true },
            {
                src: 'https://code.jquery.com/jquery-3.4.1.min.js',
                integrity: 'sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=',
                crossorigin: 'anonymous',
                defer: true,
            },
        ],
    },
    htmlAttrs: {
        lang: 'fr',
    },
    messages: {
        error_404: 'Page non trouvée',
        server_error: 'Erreur serveur',
        back_to_home: 'Retour à l\'accueil',
        server_error_details: 'Une erreur a eu lieu et ta page ne peut pas être affichée. Si tu es le propriétaire, vérifies tes logs pour plus d\'information',
        client_error: 'Erreur',
        client_error_details: 'Une erreur a eu lieu pendant le rendu de la page. Utilise la console des outils de développeur pour plus d\'information',
    },
};
