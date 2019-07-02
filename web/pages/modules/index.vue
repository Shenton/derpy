<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Modules"
        lead="Configuration générique des modules."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <moduleConfiguration v-for="mod in modulesData" :key="`${mod._id}/${mod.revision}`" :data="mod" @submitUpdate="submitUpdate"/>
</div>
</template>

<script>
import moduleConfiguration from '../../components/module-configuration';

export default {
    name: 'modules',
    data() {
        return {
            modulesData: [],
        }
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('modules');
            //console.log('DATA: %o', data)
            return { modulesData: data };
        }
        catch(err) {}
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.$store.dispatch('botinfo/getInfo');
    },
    methods: {
        async submitUpdate(name, data) {
            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: data,
                    url: 'modules/' + name,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Module modifié');

                    try {
                        const data = await this.$axios.get('modules');
                        this.modulesData = data.data;
                    }
                    catch(err) {
                        this.axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosErrorHandler(err, 'Erreur avec l\'édition du module');
            }
        },
        axiosErrorHandler(err, methodMessage) {
            const code = parseInt(err.response && err.response.status);

            if (code === 400) {
                this.$toast.warning('Requête invalide');
            }
            else if (code === 401) {
                this.$toast.warning('Accès non autorisé à la base de donnée');
            }
            else if (code === 404) {
                this.$toast.warning('Module non trouvée');
            }
            else if (code === 409) {
                this.$toast.warning('Ce module existe déjà');
            }
            else {
                this.$toast.error(methodMessage);
            }
        },
        axiosGetErrorHandler(err) {
            const code = parseInt(err.response && err.response.status);

            if (code === 400) {
                this.$toast.warning('Requête invalide');
            }
            else if (code === 401) {
                this.$toast.warning('Accès non autorisé à la base de donnée');
            }
            else if (code === 404) {
                this.modulesData = [];
            }
            else {
                this.$toast.error('Erreur avec la récupération des modules');
            }
        },
    },
    components: {
        moduleConfiguration,
    },
}
</script>

<style>

</style>
