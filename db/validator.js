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
    if (response.length > 100) return false;
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

validator.mp3 = (name) => {
    if (typeof name !== 'string') return false;
    return /^[a-z0-9]{3,8}$/.test(name);
};

validator.player = (name) => {
    if (typeof name !== 'string') return false;
    return /^[a-zA-Z0-9_-]{1,30}$/.test(name);
};

validator.object = (object) => {
    if (typeof object !== 'object') return false;
    return true;
};

module.exports = validator;
