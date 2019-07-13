<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Configuration"
        lead="Configuration de Derpy."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <b-container>
        <b-form @submit="submitUpdate">
            <h2>Music</h2>
            <hr class="border-primary">
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

            <h2>PUBG</h2>
            <hr class="border-primary">
            <h4>PUBG shard: <strong class="text-primary">{{ form.shard }}</strong></h4>
            <hr class="border-primary">
            <b-form-select class="mb-5" v-model="form.shard" :options="shardsSelectOptions"></b-form-select>

            <h4>Nombre d'appels à l'API de PUBG par minute: <strong class="text-primary">{{ form.callsPerMinute }}</strong></h4>
            <hr class="border-primary">
            <b-input-group class="mb-5" prepend="1" append="8">
                <b-form-input v-model="form.callsPerMinute" type="range" min="1" max="8"></b-form-input>
            </b-input-group>

            <b-button type="submit" block variant="primary">Appliquer les modifications</b-button>
        </b-form>
    </b-container>
</div>
</template>

<script>
export default {
    name: 'Configuration',
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.isOwner) return redirect('/');
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        }
    },
    data() {
        return {
            title: 'Configuration',
            maxVideoDuration: 0,
            maxPlaylistSize: 0,
            volume: 0,
            shard: 'steam',
            shardsSelectOptions: [
                { value: 'kakao', text: 'Kakao' },
                { value: 'psn', text: 'PS4' },
                { value: 'steam', text: 'Steam' },
                { value: 'tournament', text: 'Tournaments' },
                { value: 'xbox', text: 'Xbox' },
            ],
            callsPerMinute: 1,
            form: {
                maxVideoDuration: 0,
                maxPlaylistSize: 0,
                volume: 0,
                shard: 'steam',
                callsPerMinute : 1,
            }
        }
    },
    async asyncData({ $axios }) {
        try {
            const maxVideoDuration = await $axios.$get('derpy/maxVideoDuration');
            const maxPlaylistSize = await $axios.$get('derpy/maxPlaylistSize');
            const volume = await $axios.$get('derpy/volume');
            const shard = await $axios.$get('derpy/pubgShard');
            const callsPerMinute = await $axios.$get('derpy/pubgCallsPerMinute');

            return {
                maxVideoDuration: maxVideoDuration[0].value,
                maxPlaylistSize: maxPlaylistSize[0].value,
                volume: volume[0].value,
                shard: shard[0].value,
                callsPerMinute: callsPerMinute[0].value,
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
            shard: this.shard,
            callsPerMinute: this.callsPerMinute,
        }
    },
    methods: {
        async submitUpdate(event) {
            event.preventDefault();

            const maxVideoDuration = this.form.maxVideoDuration * 60;
            const maxPlaylistSize = this.form.maxPlaylistSize;
            const volume = this.form.volume / 100;
            const shard = this.form.shard;
            const callsPerMinute = this.form.callsPerMinute;

            if (maxVideoDuration === this.maxVideoDuration
                && maxPlaylistSize === this.maxPlaylistSize
                && volume === this.volume
                && shard === this.shard
                && callsPerMinute === this.callsPerMinute) {

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

            if (shard !== this.shard) {
                const value = await this.update(shard, 'pubgShard', 'Shard modifiée');
                this.shard = value;
                this.form.shard = value;
            }
            if (callsPerMinute !== this.callsPerMinute) {
                const value = await this.update(callsPerMinute, 'pubgCallsPerMinute', 'Nombre d\'appels à l\'API de PUBG modifié');
                this.callsPerMinute = value;
                this.form.callsPerMinute = value;
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
