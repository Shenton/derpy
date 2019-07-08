const logger = require('../logger');
const client = require('../client');

const { getActivity } = require('../../db/api/activity');

let activities = [];
async function getModuleConfig() {
    try {
        const query = await getActivity();

        if (!query.success) return;

        activities = [];

        for (let i = 0; i < query.data.length; i++) {
            const item = query.data[i];
            if (item.enabled) activities.push(item.activity);
        }
    }
    catch(err) {
        logger.error('module => activity => getModuleConfig: ', err);
    }
}

function setNewActivity() {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    client.user.setActivity(activity);
}

setInterval(() => {
    const rand = Math.random();
    if (rand > 0.4 && rand < 0.6) setNewActivity();
}, 5 * 60 * 1000);

exports.setNewActivity = setNewActivity;

process.on('message', async message => {
    if (typeof message !== 'object') return;
    if (!message.message) return;

    if (message.message === 'activity:config') await getModuleConfig();
});

exports.getModuleConfig = getModuleConfig;

logger.debug('Module activity loaded');
