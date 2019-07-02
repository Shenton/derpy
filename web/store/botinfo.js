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
            info.textOptions = [];
            info.voiceOptions = [];

            for (let i = 0; i < textChannels.length; i++) {
                const c = textChannels[i];
                info.textOptions.push({ text: c.name, value: c.id });
            }

            for (let i = 0; i < voiceChannels.length; i++) {
                const c = voiceChannels[i];
                info.voiceOptions.push({ text: c.name, value: c.id });
            }

            commit('setInfo', info);
        }
        catch(err) {
            commit('setInfo', {});
        }
    },
};
