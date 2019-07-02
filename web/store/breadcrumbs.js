const pathToName = {};

export const state = () => ({
    crumbs: [],
});

export const mutations = {
    setCrumbs(s, value) {
        s.crumbs = value;
    },
};

export const actions = {
    setCrumbs({ commit }, rPath) {
        if (rPath === '/') {
            commit('setCrumbs', [{ text: 'Accueil', to: '/' }]);
        }
        else {
            rPath = rPath.slice(1);
            const paths = rPath.split('/');
            const crumbs = [{ text: 'Accueil', to: '/' }];
            let path = '';

            for (let i = 0; i < paths.length; i++) {
                const name = paths[i];
                const pName = pathToName[name] ? pathToName[name] : name.charAt(0).toUpperCase() + name.slice(1);
                path += '/' + name;
                crumbs.push({ text: pName, to: path });
            }

            commit('setCrumbs', crumbs);
        }
    },
};
