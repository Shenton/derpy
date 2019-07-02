export const actions = {
    async nuxtServerInit({ dispatch }, { req }) {
        // auth store
        await dispatch('auth/authUser', req);
        await dispatch('botinfo/getInfo');
    },
};
