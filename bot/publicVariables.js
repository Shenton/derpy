/**
 * THIS SHOULD NOT REQUIRE ANYTHING !!!
 */

/**
 * modulesList
 *
 * name => The name of the module file
 * load => The module will be loaded with the loader
 * commands => The module got commands, located in the folder src/commands/<module name>/
 * publicName => The public name of the module, without this the commands help for the module will not be generated
 * isFake => Fake modules are used to provide a commands group, so they are disabled when the module is
 * channels => like a linux file permission octal, 8 = voiceChannels, 4 = voiceChannel, 2 = textChannels, 1 = textChannel, 0 = nothing
 *             This is used to define what kind of channel permission the module should get when loading, it is also used wihtin the front-end
 */
const modulesList = [
    {
        name: 'activity',
        load: true,
        commands: true,
        publicName: 'Activité',
        channels: 0,
    },
    {
        name: 'mp3',
        load: true,
        commands: false,
        channels: 8,
    },
    {
        name: 'music',
        load: true,
        commands: true,
        publicName: 'Musique',
        channels: 8,
    },
    {
        name: 'pubg',
        load: true,
        commands: true,
        publicName: 'PUBG',
        channels: 1,
    },
    {
        name: 'reddit',
        load: true,
        commands: false,
        channels: 1,
    },
    {
        name: 'response',
        load: true,
        commands: false,
        channels: 2,
    },
    {
        name: 'rss',
        load: true,
        commands: false,
        channels: 1,
    },
];

exports.modulesList = modulesList;
