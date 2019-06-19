const axios = require('axios');

//const { logger } = require('../logger');

const { port } = require('../config').api;

const baseURL = `http://localhost:${port}/user/`;

// function axiosErrorHandler(err) {
//     let errorString;

//     if (err.response) errorString = `API call => user => Axios: Status: ${err.response.status} Data: ${JSON.stringify(err.response.data)}`;
//     else if (err.request) errorString = `API call => user => Axios: Request: ${err.request}`;
//     else errorString = `API call => user => Axios: Message: ${err.message}`;

//     logger.error(errorString);
// }

// function exists(memberID) {
//     const url = `${baseURL}exists/${memberID}`;
//     const options = {
//         method: 'get',
//         validateStatus: false,
//         url: url,
//     };

//     return axios(options);
// }

function addUser(data) {
    const url = baseURL;
    const options = {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        validateStatus: false,
        data: data,
        url: url,
    };

    return axios(options);
}

function updateUser(memberID, data) {
    const url = `${baseURL}${memberID}`;
    const options = {
        method: 'patch',
        headers: { 'Content-Type': 'application/json' },
        validateStatus: false,
        data: data,
        url: url,
    };

    return axios(options);
}

function getUUID(memberID) {
    const url = `${baseURL}uuid/${memberID}`;
    const options = {
        method: 'get',
        validateStatus: false,
        url: url,
    };

    return axios(options);
}

//exports.userExists = exists;
exports.getUUID = getUUID;
exports.addUser = addUser;
exports.updateUser = updateUser;
