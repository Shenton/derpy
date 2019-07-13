const { guildID, channelID, prefix } = require('./config');
const { modulesList } = require('./publicVariables');

exports.rootDir = __dirname;
exports.guildID = guildID;
exports.channelID = channelID;
exports.helpEmbed = {
    color: 0x25701e,
    author: {
        name: 'Voici la liste de mes commandes',
        icon_url: 'attachment://area51.png',
    },
    description: `Utilise ${prefix}help <nom de la command>, pour avoir plus d'informations.`,
    fields: [],
    timestamp: new Date(),
    footer: {
        text: 'Derpy v' + process.env.npm_package_version,
        icon_url: 'attachment://area51.png',
    },
};
exports.modulesList = modulesList;