const validator = {};

validator.snowflake = (snowflake) => {
    if (typeof snowflake !== 'string') return false;
    return /^[0-9]{17,18}$/.test(snowflake);
};

validator.snowflakeArray = (array) => {
    if (typeof array !== 'object') return false;
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (!validator.snowflake(item)) return false;
    }
    return true;
};

validator.memberID = validator.snowflake;
validator.channelID = validator.snowflake;
validator.channelIDs = validator.snowflakeArray;
validator.roleIDs = validator.snowflakeArray;

validator.username = (username) => {
    if (typeof username !== 'string') return false;
    if (username.length < 2 || username.length > 32) return false;
    if (username == 'discordtag' || username == 'everyone' || username == 'here') return false;
    if (/@|#|:|```/.test(username)) return false;
    return true;
};

validator.discriminator = (discriminator) => {
    if (typeof discriminator !== 'string') return false;
    return /^[0-9]{4}$/.test(discriminator);
};

validator.avatar = (avatar) => {
    if (typeof avatar !== 'string') return false;
    return /^[a-z0-9]{32}$/.test(avatar);
};

validator.token = (token) => {
    if (typeof token !== 'string') return false;
    return /^[a-zA-Z0-9]{30}$/.test(token);
};

validator.letters = (letters) => {
    if (typeof letters !== 'string') return false;
    return /^[a-zA-Z]+$/.test(letters);
};

validator.unsignedInteger = (integer) => {
    if (Number(integer) > -1) return true;
    return false;
};

validator.uuidv4 = (uuid) => {
    if (typeof uuid !== 'string') return false;
    return /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i.test(uuid);
};

validator.response = (response) => {
    if (typeof response !== 'string') return false;
    if (response === '') return false;
    if (response.length > 256) return false;
    if (/<|>|```/.test(response)) return false;
    return true;
};

validator.isBoolean = (bool) => {
    if (typeof bool !== 'boolean') return false;
    return true;
};

validator.mongoID = (id) => {
    if (typeof id !== 'string') return false;
    return /^[a-zA-Z0-9]{24}$/.test(id);
};

validator.moduleName = (name) => {
    if (typeof name !== 'string') return false;
    return /^[a-zA-Z0-9]{3,10}$/.test(name);
};

validator.activity = (name) => {
    if (typeof name !== 'string') return false;
    if (name === '') return false;
    if (name > 100) return false;
    return true;
};

validator.player = (name) => {
    if (typeof name !== 'string') return false;
    return /^[a-zA-Z0-9_-]{1,30}$/.test(name);
};

validator.object = (object) => {
    if (typeof object !== 'object') return false;
    return true;
};

validator.subreddit = (name) => {
    if (typeof name !== 'string') return false;
    return /^[a-zA-Z0-9_]{2,22}$/.test(name);
};

validator.listing = (listing) => {
    if (typeof listing !== 'string') return false;
    if (listing !== 'hot' && listing !== 'new' && listing !== 'rising'
        && listing !== 'controversial' && listing !== 'top' && listing !== 'gilded') {

        return false;
    }
    return true;
};

validator.redditType = (type) => {
    if (typeof type !== 'string') return false;
    if (type !== 'image') return false;
    return true;
};

validator.redditLimit = (limit) => {
    if (typeof limit !== 'number') return false;
    if (limit !== 25 && limit !== 50 && limit !== 75 && limit !== 100) return false;
    return true;
};

validator.url = (url) => {
    if (typeof url !== 'string') return false;
    return /^(?:\w+:)?\/\/([^\s.]+\.\S{2}[:?\d]*)\S*$/.test(url);
};

validator.logo = (logo) => {
    if (typeof logo !== 'string') return false;
    return /^[a-z0-9]{2,22}(\.jpeg|\.jpg|\.png){1}$/.test(logo);
};

validator.isString = (string) => {
    if (typeof string !== 'string') return false;
    return true;
};

validator.command = (command) => {
    if (typeof command !== 'string') return false;
    return /^[a-z0-9]{2,8}$/.test(command);
};

validator.mp3 = validator.command;

validator.quote = (quote) => {
    if (typeof quote !== 'string') return false;
    if (quote === '') return false;
    if (quote.length > 1000) return false;
    if (/<|>|```/.test(quote)) return false;
    return true;
};

module.exports = validator;
