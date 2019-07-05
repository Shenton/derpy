const { logger } = require('../logger');
const validator = require('../validator');

const { addModule, getModule, updateModule } = require('../collection/modules');

async function populateDB() {
    const { modulesList } = require('../../bot/publicVariables');

    let dbData;

    try {
        dbData = await get();

        // First time launching the app
        if (dbData.status === 404) {
            for (let i = 0; i < modulesList.length; i++) {
                if (!modulesList[i].isFake) {
                    const name = modulesList[i].name;
                    const channels = modulesList[i].channels || 0;
                    addModule(name, channels);
                }
            }
        }
        else {
            const modulesNames = [];

            for (let i = 0; i < dbData.data.length; i++) {
                const name = dbData.data[i].name;
                modulesNames.push(name);
            }

            for (let i = 0; i < modulesList.length; i++) {
                const name = modulesList[i].name;
                const channels = modulesList[i].channels || 0;
                const isFake = modulesList[i].isFake;

                if (!isFake && !modulesNames.includes(name)) addModule(name, channels);
            }
        }
    }
    catch(err) {
        logger.error('api => modules => populateDB: ', err);
    }
}

populateDB();

async function get(query, select) {
    if (!query) query = {};

    const data = await getModule(query, select);

    if (!data) return { success: false, status: 500, errors: ['Internal API error'] };

    if (data.length) return { success: true, status: 200, data: data };
    else return { success: false, status: 404, errors: ['Data not found'] };
}

async function update(name, data) {
    if (!name) return { success: false, status: 400, errors: ['"name" is missing'] };
    if (!validator.moduleName(name)) return { success: false, status: 400, errors: ['"name" is invalid'] };

    const badRequest = [];

    if (!data && !data.enabled && !data.textChannel && !data.textChannels
        && !data.voiceChannel && !data.voiceChannels) {

        logger.error('api => modules => update: Missing parameter.');

        return { success: false, status: 400, errors: ['Missing parameters'] };
    }

    const doc = {};

    if (data.enabled === true || data.enabled === false) {
        if (!validator.isBoolean(data.enabled)) badRequest.push('"enabled" is not valid');
        else doc.enabled = data.enabled;
    }

    if (data.textChannel) {
        if (!validator.channelID(data.textChannel)) badRequest.push('"textChannel" is not valid');
        else doc.textChannel = data.textChannel;
    }

    if (data.textChannels) {
        if (!validator.channelIDs(data.textChannels)) badRequest.push('"textChannels" is not valid');
        else doc.textChannels = data.textChannels;
    }

    if (data.voiceChannel) {
        if (!validator.channelID(data.voiceChannel)) badRequest.push('"voiceChannel" is not valid');
        else doc.voiceChannel = data.voiceChannel;
    }

    if (data.voiceChannels) {
        if (!validator.channelIDs(data.voiceChannels)) badRequest.push('"voiceChannels" is not valid');
        else doc.voiceChannels = data.voiceChannels;
    }

    if (badRequest.length) return { success: false, status: 400, errors: badRequest };

    const success = await updateModule({ name: name }, doc);

    if (success) return { success: true, status: 200, modified: success.nModified };
    else return { success: false, status: 500, errors: ['Internal API error'] };
}

// async function del(name) {
//     if (!name) return { success: false, status: 400, errors: ['"name" is missing'] };
//     if (!validator.moduleName(name)) return { success: false, status: 400, errors: ['"name" is invalid'] };

//     const success = await deleteModule({ name: name });

//     if (success) return { success: true, status: 200 };
//     else return { success: false, status: 500, errors: ['Internal API error'] };
// }

module.exports.getModule = get;
module.exports.updateModule = update;
//module.exports.deleteModule = del;
