<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: Music"
        lead="Joue de la musique sur les canaux vocaux."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <b-container>
        <b-form @submit="submitUpdate">
            <h4>Durée maximum des vidéos: <strong class="text-primary">{{ form.maxVideoDuration }} minute{{ form.maxVideoDuration > 1 ? 's' : '' }}</strong></h4>
            <hr class="border-primary">
            <b-input-group prepend="0" append="60" class="mb-5">
                <b-form-input v-model="form.maxVideoDuration" type="range" min="0" max="60"></b-form-input>
            </b-input-group>

            <h4>Nombre d'entrées maximum de la liste de lecture: <strong class="text-primary">{{ form.maxPlaylistSize }} entrée{{ form.maxPlaylistSize > 1 ? 's' : '' }}</strong></h4>
            <hr class="border-primary">
            <b-input-group prepend="0" append="40" class="mb-5">
                <b-form-input v-model="form.maxPlaylistSize" type="range" min="0" max="40"></b-form-input>
            </b-input-group>

            <h4>Volume: <strong class="text-primary">{{ form.volume }}</strong></h4>
            <hr class="border-primary">
            <b-input-group prepend="0" append="100" class="mb-5">
                <b-form-input v-model="form.volume" type="range" min="0" max="100"></b-form-input>
            </b-input-group>

            <b-button type="submit" block variant="primary">Appliquer les modifications</b-button>
        </b-form>
    </b-container>
</div>
</template>

<script>
export default {
    name: 'Music',
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.hasAccess) return redirect('/');
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        }
    },
    data() {
        return {
            title: 'Module: Music',
            maxVideoDuration: 0,
            maxPlaylistSize: 0,
            volume: 0,
            form: {
                maxVideoDuration: 0,
                maxPlaylistSize: 0,
                volume: 0,
            }
        }
    },
    async asyncData({ $axios }) {
        try {
            const maxVideoDuration = await $axios.$get('derpy/maxVideoDuration');
            const maxPlaylistSize = await $axios.$get('derpy/maxPlaylistSize');
            const volume = await $axios.$get('derpy/volume');

            return {
                maxVideoDuration: maxVideoDuration[0].value,
                maxPlaylistSize: maxPlaylistSize[0].value,
                volume: volume[0].value,
            };
        }
        catch(err) {}
        
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.form = {
                maxVideoDuration: this.maxVideoDuration / 60,
                maxPlaylistSize: this.maxPlaylistSize,
                volume: this.volume * 100,
            }
    },
    methods: {
        async submitUpdate(event) {
            event.preventDefault();

            const maxVideoDuration = this.form.maxVideoDuration * 60;
            const maxPlaylistSize = this.form.maxPlaylistSize;
            const volume = this.form.volume / 100;

            if (maxVideoDuration === this.maxVideoDuration && maxPlaylistSize === this.maxPlaylistSize && volume === this.volume) {
                this.$toast.warning('Aucune modification');
            }

            if (maxVideoDuration !== this.maxVideoDuration) {
                const value = await this.update(maxVideoDuration, 'maxVideoDuration', 'Durée maximum des vidéos modifiée');
                this.maxVideoDuration = value;
                this.form.maxVideoDuration = value / 60;
            }
            if (maxPlaylistSize !== this.maxPlaylistSize) {
                const value = await this.update(maxPlaylistSize, 'maxPlaylistSize', 'Nombre d\'entrées maximum de la liste de lecture modifiée');
                this.maxPlaylistSize = value;
                this.form.maxPlaylistSize = value;
            }
            if (volume !== this.volume) {
                const value = await this.update(volume, 'volume', 'Volume modifié');
                this.volume = value;
                this.form.volume = value * 100;
            }
        },
        async update(value, name, success) {
            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: { value: value },
                    url: 'derpy/' + name,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success(success);

                    try {
                        const data = await this.$axios.$get('derpy/' + name);
                        return data[0].value;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.$axiosPostErrorHandler(err, 'Configuration non trouvé', 'Cette configuration existe déjà', 'Erreur avec l\'édition de la configuration');
            }
        }
    }
}
</script>

<style>

</style>
