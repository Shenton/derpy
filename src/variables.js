const modulesList = [
    {
        name: 'activity',
        load: true,
        commands: true,
    },
    {
        name: 'admin',
        load: false,
        commands: true,
    },
    {
        name: 'mp3',
        load: true,
        commands: false,
    },
    {
        name: 'music',
        load: false,
        commands: true,
        publicName: 'Musique',
    },
    {
        name: 'pubg',
        load: true,
        commands: true,
        publicName: 'PUBG',
    },
    {
        name: 'reddit',
        load: true,
        commands: false,
    },
    {
        name: 'response',
        load: true,
        commands: false,
    },
    {
        name: 'rss',
        load: true,
        commands: false,
    },
];

exports.modulesList = modulesList;
