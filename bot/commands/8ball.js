// Derpy modules
const logger = require('../logger');
const { dbCommandGet } = require('../methods');

// Variables
const commandName = '8ball';
let allowedChannels = [];
let allowedRoles = [];
let guildOnly = false;
let aliases = [];
let description = 'La boule magique numéro 8';
let usage = false;
let cooldown = 3;

// Les réponses évasives
//Essaye plus tard, Essaye encore, Pas d'avis, C'est ton destin, Le sort en est jeté, Une chance sur deux, Repose ta question
// Les réponses affirmatives
// D'après moi oui, C'est certain, Oui absolument, Tu peux compter dessus, Sans aucun doute, Très probable, Oui, C'est bien parti
// Les réponses négatives
// C'est non, Peu probable, Faut pas rêver, N'y compte pas, Impossible

const answers = [
    'Essaye plus tard',
    'D\'après moi oui',
    'Essaye encore',
    'C\'est certain',
    'C\'est non',
    'Pas d\'avis',
    'Oui absolument',
    'C\'est ton destin',
    'Tu peux compter dessus',
    'Peu probable',
    'Le sort en est jeté',
    'Sans aucun doute',
    'Faut pas rêver',
    'Une chance sur deux',
    'Très probable',
    'N\'y compte pas',
    'Repose ta question',
    'Oui',
    'Impossible',
    'C\'est bien parti',
];

// Return a random answer
function randomAnswer() {
    const answer = answers[Math.floor(Math.random() * answers.length)];
    return answer;
}

async function init() {
    try {
        const data = await dbCommandGet(commandName, description, usage, aliases, cooldown);

        if (data) {
            if (!data.enabled) return false;

            if (data.allowedChannels && data.allowedChannels.length) allowedChannels = data.allowedChannels;
            if (data.allowedRoles && data.allowedRoles.length) allowedRoles = data.allowedRoles;
            if (data.guildOnly) guildOnly = true;
            if (data.aliases && data.aliases.length) aliases = data.aliases;
            if (data.description) description = data.description;
            if (data.usage) usage = data.usage;
            if (data.cooldown) cooldown = data.cooldown;
        }

        return {
            name: commandName,
            aliases: aliases,
            allowedChannels: allowedChannels,
            allowedRoles: allowedRoles,
            guildOnly: guildOnly,
            description: description,
            usage: usage,
            cooldown: cooldown,
            execute(message) {
                const answer = randomAnswer();

                message.channel.send(`${answer}, <@${message.member.id}>.`)
                    .catch(logger.error);
            },
        };
    }
    catch(err) {
        logger.error(`command => ${commandName} error: `, err);
    }
}

exports.init = init;
