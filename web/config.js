const path = require('path');
const jsonfile = require('jsonfile');

let config;

if (process.env.NODE_ENV === 'development') {
    config = jsonfile.readFileSync(path.join('..', 'config-dev.json'));
}
else {
    config = jsonfile.readFileSync(path.join('..', 'config.json'));
}

config.webServer.discordRedirectCallback = config.webServer.baseURL + '/api/discord/callback';

module.exports = config;
