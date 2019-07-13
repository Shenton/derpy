export const state = () => ({
    info: {},
});

export const mutations = {
    setInfo(s, value) {
        s.info = value;
    },
};

export const actions = {
    async getInfo({ commit }) {
        try {
            const data = await this.$axios('public/information');
            const info = data.data[0].value;
            const textChannels = info.textChannels;
            const voiceChannels = info.voiceChannels;
            const roles = info.roles;
            info.textOptions = [];
            info.voiceOptions = [];
            info.rolesOptions = [];

            for (let i = 0; i < textChannels.length; i++) {
                const item = textChannels[i];
                info.textOptions.push({ text: item.name, value: item.id });
            }

            for (let i = 0; i < voiceChannels.length; i++) {
                const item = voiceChannels[i];
                info.voiceOptions.push({ text: item.name, value: item.id });
            }

            for (let i = 0; i < roles.length; i++) {
                const item = roles[i];
                info.rolesOptions.push({ text: item.name, value: item.id });
            }

            commit('setInfo', info);
        }
        catch(err) {
            commit('setInfo', {});
        }
    },
};
