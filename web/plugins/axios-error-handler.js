import Vue from 'vue';

Vue.prototype.$axiosGetErrorHandler = function(err) {
    const code = parseInt(err.response && err.response.status);

    if (code === 400) {
        this.$toast.warning('Requête invalide');
    }
    else if (code === 401) {
        this.$toast.warning('Accès non autorisé à la base de donnée');
    }
    else if (code === 404) {
        this.$toast.error('Données non trouvées');
    }
    else {
        this.$toast.error('Erreur avec la récupération des données');
    }
};

Vue.prototype.$axiosPostErrorHandler = function(err, notFound, alreadyExists, serverError) {
    const code = parseInt(err.response && err.response.status);

    if (code === 400) {
        this.$toast.warning('Requête invalide');
    }
    else if (code === 401) {
        this.$toast.warning('Accès non autorisé à la base de donnée');
    }
    else if (code === 404) {
        this.$toast.warning(notFound);
    }
    else if (code === 409) {
        this.$toast.warning(alreadyExists);
    }
    else {
        this.$toast.error(serverError);
    }
};
