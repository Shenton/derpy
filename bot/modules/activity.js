const logger = require('../logger');
const client = require('../client');

const activities = [
    'Star Citizen',
    'Call of Duty: Black Ops IIII',
    'Candy Crush',
    'ATLAS',
    'Hurr Durr Derp',
    'la Fistinière',
    'Diablo Immortal',
    'Escape from Tarkov',
    'Ricochet',
    'left 4 Dead 2',
    'Goat Simulator',
    'Bluestacks',
    'Euro Truck Simulator 2',
    'Fortnite',
];

function setNewActivity() {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    client.user.setActivity(activity);
}

setInterval(() => {
    const rand = Math.random();
    if (rand > 0.4 && rand < 0.6) setNewActivity();
}, 5 * 60 * 1000);

exports.setNewActivity = setNewActivity;

//exports.getModuleChannels = getModuleChannels;
//exports.getModuleConfig = getModuleConfig;

logger.debug('Module activity loaded');
