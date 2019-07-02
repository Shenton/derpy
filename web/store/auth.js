//const cookieparser = process.server ? require('cookieparser') : undefined;

export const state = () => ({
    isAuth: null,
    name: null,
    discriminator: null,
    memberID: null,
    avatar: null,
    isOwner: null,
    hasAccess: null,
});

export const mutations = {
    setIsAuth(s, value) {
        s.isAuth = value;
    },
    setName(s, value) {
        s.name = value;
    },
    setDiscriminator(s, value) {
        s.discriminator = value;
    },
    setMemberID(s, value) {
        s.memberID = value;
    },
    setAvatar(s, value) {
        s.avatar = value;
    },
    setIsOwner(s, value) {
        s.isOwner = value;
    },
    setHasAccess(s, value) {
        s.hasAccess = value;
    },
};

export const actions = {
    authUser({ commit }, req) {
        if (req.session.discordAuth) {
            const hasAccess = req.session.discordAuth.isOwner ? true : req.session.discordAuth.hasAccess ? true : false;
            const avatar = `https://cdn.discordapp.com/avatars/${req.session.discordAuth.memberID}/${req.session.discordAuth.avatar}.png`;

            commit('setIsAuth', true);
            commit('setName', req.session.discordAuth.username);
            commit('setDiscriminator', req.session.discordAuth.discriminator);
            commit('setMemberID', req.session.discordAuth.memberID);
            commit('setAvatar', avatar);
            commit('setIsOwner', req.session.discordAuth.isOwner);
            commit('setHasAccess', hasAccess);
        }
        else {
            commit('setIsAuth', null);
            commit('setName', null);
            commit('setDiscriminator', null);
            commit('setMemberID', null);
            commit('setAvatar', null);
            commit('setIsOwner', null);
            commit('setHasAccess', null);
        }
    },
};
