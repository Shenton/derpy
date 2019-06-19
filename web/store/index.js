export const actions = {
    async nuxtServerInit({ dispatch }, { req }) {
        await dispatch('auth/authUser', req);
    },
};
