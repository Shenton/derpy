<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: mp3"
        lead="Joue des courts mp3 sur les canaux vocaux."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <b-container v-if="mp3s.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            :current-page="currentPage"
            :per-page="perPage"
            :items="mp3s"
            :fields="fields"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)"></b-form-checkbox>
                </b-form>
            </template>
        </b-table>
        <b-row>
            <b-col>
                <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0"></b-pagination>
            </b-col>
            <b-col>
                <b-form-group label-cols-sm="3" label="Nombre par page" class="mb-0">
                    <b-form-select v-model="perPage" :options="pageOptions"></b-form-select>
                </b-form-group>
            </b-col>
        </b-row>
    </b-container>
    <b-container>
        <h4>Ajouter un nouveau mp3</h4>
        <hr class="border-primary">
        <b-form v-if="showNewForm">
            <b-form-group v-if="isUploading">
                <b-progress :max="uploadProgressMax" height="2.5rem" show-progress show-value>
                    <b-progress-bar :value="uploadProgress" :variant="uploadVariant">
                        Progression: <strong>{{ uploadProgress }}%</strong>
                    </b-progress-bar>
                </b-progress>
            </b-form-group>

            <b-form-group v-else>
                <b-form-file name="newMP3" placeholder="Choisir un fichier mp3" accept=".mp3" :state="newMP3Validation" v-model="newMP3"></b-form-file>
                <b-form-invalid-feedback :state="newMP3Validation">
                    Le fichier doit être un mp3 de 1mo max, le nom ne doit contenir que des lettres minuscules ou des chiffres et être compris entre 3 et 10 charactères.
                </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group>
                <b-button variant="primary" :disabled="!newMP3Validation" @click="uploadFile">Téléverser</b-button>
                <b-button variant="secondary" @click="newMP3 = null">Annuler</b-button>
            </b-form-group>
        </b-form>
    </b-container>
</div>
</template>

<script>
export default {
    name: 'mp3',
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
            title: 'Module: mp3',
            mp3s: [],
            fields: [
                {
                    key: 'mp3',
                    label: 'mp3',
                    sortable: true,
                    thStyle: {
                        width: '80%'
                    }
                },
                {
                    key: 'enabledCheckBox',
                    label: 'Activé',
                    sortable: true,
                    thStyle: {
                        width: '20%'
                    }
                },
            ],
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [5, 10, 15],
            showNewForm: true,
            newMP3: null,
            uploadDisabled: true,
            isUploading: false,
            uploadProgress: 50,
            uploadProgressMax: 100,
            uploadVariant: 'primary',
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('mp3');
            const mp3s = data.map(items => ({ ...items, key: `${items._id}/${items.revision}` }));
            return { mp3s: mp3s };
        }
        catch(err) {}
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.mp3s.length;
    },
    computed: {
        newMP3Validation() {
            if (!this.newMP3) return null;
            if (this.newMP3.type !== 'audio/mpeg') return false;
            if (this.newMP3.size > 1024 * 1024) return false;
            return /^[a-z0-9]{3,10}\.mp3$/.test(this.newMP3.name);
        },
    },
    methods: {
        async getMP3s() {
            try {
                const data = await this.$axios.$get('mp3');
                this.mp3s = data.map(items => ({ ...items, key: `${items._id}/${items.revision}` }));
                this.totalRows = this.mp3s.length;
            }
            catch(err) {
                this.$axiosGetErrorHandler(err);
            }
        },
        async uploadFile(event) {
            event.preventDefault();

            try {
                const vm = this;
                const formData = new FormData();
                formData.append('file', this.newMP3);

                this.isUploading = true;

                const res = await this.$axios({
                    method: 'post',
                    url: 'mp3/upload',
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: function(progressEvent) {
                        vm.uploadProgress = Math.round(progressEvent.loaded / progressEvent.total * 100);
                    },
                });

                this.uploadVariant = 'success';
                this.$toast.success('Fichier téléversé');

                setTimeout(() => {
                    this.newMP3 = null;
                    this.isUploading = false
                    this.uploadProgress = 0;
                    this.uploadVariant = 'primary';
                    this.getMP3s();
                }, 5000);
            }
            catch(err) {
                const code = parseInt(err.response && err.response.status);

                if (code === 404) this.$toast.warning('Aucun fichier téléversé');
                else if (code === 415) this.$toast.warning('Mauvais type de fichier');
                else if (code === 413) this.$toast.warning('Fichier trop volumineux');
                else if (code === 400) this.$toast.warning('Nom de fichier ou extension invalide');
                else if (code === 409) this.$toast.warning('Le fichier existe déjà');
                else this.$toast.warning('Erreur avec le téléversement du fichier');

                this.uploadVariant = 'danger';

                setTimeout(() => {
                    this.newMP3 = null;
                    this.isUploading = false
                    this.uploadProgress = 0;
                    this.uploadVariant = 'primary';
                }, 5000);
            }
        },
        async submitUpdate(id, data) {
            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: data,
                    url: 'mp3/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('mp3 modifié');
                    this.getMP3s();
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition du mp3');
            }
        },
        async submitDelete(id) {
            try {
                await this.$axios({
                    method: 'delete',
                    url: 'mp3/' + id,
                });

                this.$toast.success('mp3 supprimé');
                this.getMP3s();
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec la suppression du mp3');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'mp3 non trouvée', 'Ce mp3 existe déjà', methodMessage);
        },
        toggleEnabled(id, enabled) {
            if (enabled) this.submitUpdate(id, { enabled: false });
            else this.submitUpdate(id, { enabled: true });
        },
        resetNew(event) {
            if (event) event.preventDefault();

            this.newForm.mp3 = '';

            // Trick to reset/clear native browser form validation state
            this.showNewForm = false;
            this.$nextTick(() => {
                this.showNewForm = true;
            })
        },
    },
};
</script>

<style>

</style>
