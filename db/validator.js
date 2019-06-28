const validator = {};

validator.memberID = (memberID) => {
    return /^[0-9]{17,18}$/.test(memberID);
};

validator.username = (username) => {
    if (username.length < 2 || username.length > 32) return false;
    if (username == 'discordtag' || username == 'everyone' || username == 'here') return false;
    if (/@|#|:|```/.test(username)) return false;
    return true;
};

validator.discriminator = (discriminator) => {
    return /^[0-9]{4}$/.test(discriminator);
};

validator.avatar = (avatar) => {
    return /^[a-z0-9]{32}$/.test(avatar);
};

validator.token = (token) => {
    return /^[a-zA-Z0-9]{30}$/.test(token);
};

validator.letters = (letters) => {
    return /^[a-zA-Z]+$/.test(letters);
};

validator.unsignedInteger = (integer) => {
    if (Number(integer) > -1) return true;
    return false;
};

validator.uuidv4 = (uuid) => {
    return /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i.test(uuid);
};

validator.response = (string) => {
    if (string.length > 100) return false;
    if (/<|>|```/.test(string)) return false;
    return true;
};

validator.isBoolean = (bool) => {
    if (typeof bool !== 'boolean') return false;
    return true;
};

validator.mongoID = (id) => {
    return /^[a-zA-Z0-9]{24}$/.test(id);
};

module.exports = validator;
