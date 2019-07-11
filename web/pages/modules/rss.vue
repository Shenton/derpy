<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: RSS"
        lead="Poste les nouvelles entrées d'un flux RSS."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <b-container v-if="feeds.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :current-page="currentPage"
            :per-page="perPage"
            @row-selected="rowSelected"
            :items="feeds"
            :fields="fields"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)"></b-form-checkbox>
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <RssUpdateForm @submitUpdate="submitUpdateRss" @submitDelete="submitDeleteRss" :data="row.item" :logos="logoSelectOptions"/>
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
    <b-container class="pb-5">
        <h4>Ajouter un nouveau flux</h4>
        <hr class="border-primary">
        <b-form @submit="submitNewRss" @reset="resetNewRss" v-if="showNewForm">
            <b-form-group>
                <b-form-input v-model="newForm.name" placeholder="Le nom du flux" required></b-form-input>
            </b-form-group>
            <b-form-group>
                <b-form-input v-model="newForm.feed" placeholder="L'addresse du flux" required></b-form-input>
            </b-form-group>
            <b-form-group>
                <b-form-input v-model="newForm.nameURL" placeholder="L'addresse du site" required></b-form-input>
            </b-form-group>
            <b-form-group>
                <b-form-input v-model="newForm.description" placeholder="La description/slogan du site"></b-form-input>
            </b-form-group>
            <b-row>
                <b-col>
                    <b-form-select v-model="newForm.logo" :options="logoSelectOptions">
                    </b-form-select>
                </b-col>
                <b-col>
                    <b-button type="submit" variant="primary">Ajouter</b-button>
                    <b-button type="reset">Annuler</b-button>
                </b-col>
            </b-row>
        </b-form>
    </b-container>
    <b-container>
        <h4>Ajouter un nouveau logo</h4>
        <hr class="border-primary">
        <b-form v-if="showNewLogo">
            <b-form-group v-if="isUploading">
                <b-progress :max="uploadProgressMax" height="2.5rem" show-progress show-value>
                    <b-progress-bar :value="uploadProgress" :variant="uploadVariant">
                        Progression: <strong>{{ uploadProgress }}%</strong>
                    </b-progress-bar>
                </b-progress>
            </b-form-group>

            <b-form-group v-else>
                <b-form-file name="newLogo" placeholder="Choisir un fichier jpeg ou png" accept=".jpeg,.jpg,.png" :state="newLogoValidation" v-model="newLogo"></b-form-file>
                <b-form-invalid-feedback :state="newLogoValidation">
                    Le fichier doit être un jpeg ou un png de 1mo max, le nom ne doit contenir que des lettres minuscules ou des chiffres et être compris entre 2 et 22 charactères.
                </b-form-invalid-feedback>
            </b-form-group>

            <b-form-group>
                <b-button variant="primary" :disabled="!newLogoValidation" @click="uploadFile">Téléverser</b-button>
                <b-button variant="secondary" @click="newLogo = null">Annuler</b-button>
            </b-form-group>
        </b-form>
    </b-container>
</div>
</template>

<script>
import RssUpdateForm from '../../components/rss-update-form';

export default {
    name: 'rss',
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
            title: 'Module: RSS',
            feeds: [],
            fields: [
                {
                    key: 'name',
                    label: 'Nom',
                    sortable: true,
                    thStyle: {
                        width: '20%'
                    }
                },
                {
                    key: 'feed',
                    label: 'Flux',
                    sortable: true,
                    thStyle: {
                        width: '40%'
                    }
                },
                {
                    key: 'enabledCheckBox',
                    label: 'Activée',
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
            newForm: {
                name: null,
                feed: null,
                nameURL: null,
                logo: null,
                description: null,
            },
            logos: [],
            logoSelectOptions: [],
            showNewLogo: true,
            newLogo: null,
            uploadDisabled: true,
            isUploading: false,
            uploadProgress: 50,
            uploadProgressMax: 100,
            uploadVariant: 'primary',
        };
    },
    async asyncData({ $axios }) {
        let feeds;
        let files;

        try {
            const data = await $axios.$get('rss');
            feeds = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
        }
        catch(err) {
            feeds = [];
        }

        try {
            const data = await $axios.$get('rss/logos');
            files = data;
        }
        catch(err) {
            files = [];
        }
        
        return { feeds: feeds, logos: files };
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.feeds.length;
        this.setLogosSelect();
    },
    computed: {
        newLogoValidation() {
            if (!this.newLogo) return null;
            if (this.newLogo.type !== 'image/jpeg' && this.newLogo.type !== 'image/png') return false;
            if (this.newLogo.size > 1024 * 1024) return false;
            return /^[a-z0-9]{2,22}(\.jpeg|\.jpg|\.png){1}$/.test(this.newLogo.name);
        },
    },
    methods: {
        async submitNewRss(event) {
            event.preventDefault();

            try {
                const res = await this.$axios({
                    method: 'post',
                    data: {
                        name: this.newForm.name,
                        feed: this.newForm.feed,
                        nameURL: this.newForm.nameURL,
                        logo: this.newForm.logo,
                        description: this.newForm.description
                    },
                    url: 'rss',
                });

                this.$toast.success('Flux ajouté');
                this.resetNewRss();

                try {
                    const data = await this.$axios.$get('rss');
                    this.feeds = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.feeds.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'ajout du flux');
            }
        },
        async submitUpdateRss(id, data) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: data,
                    url: 'rss/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Flux modifié');

                    try {
                        const data = await this.$axios.$get('rss');
                        this.feeds = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.feeds.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition du flux');
            }
        },
        async submitDeleteRss(id) {
            this.hideRowDetails();

            try {
                await this.$axios({
                    method: 'delete',
                    url: 'rss/' + id,
                });

                this.$toast.success('Flux supprimé');

                try {
                    const data = await this.$axios.$get('rss');
                    this.feeds = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.feeds.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec la suppression du flux');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Flux non trouvé', 'Ce flux existe déjà', methodMessage);
        },
        toggleEnabled(id, enabled) {
            if (enabled) this.submitUpdateRss(id, { enabled: false });
            else this.submitUpdateRss(id, { enabled: true });
        },
        rowSelected(row) {
            this.hideRowDetails();
            if (!row.length) return;
            const items = row[0];
            items._showDetails = !items._showDetails;
        },
        hideRowDetails() {
            this.feeds.map(items => items._showDetails = false);
        },
        resetNewRss(event) {
            if (event) event.preventDefault();

            this.newForm.name = null;
            this.newForm.feed = null;
            this.newForm.nameURL = null;
            this.newForm.logo = null;
            this.newForm.description = null;

            // Trick to reset/clear native browser form validation state
            this.showNewForm = false;
            this.$nextTick(() => {
                this.showNewForm = true;
            })
        },
        async uploadFile(event) {
            event.preventDefault();

            try {
                const vm = this;
                const formData = new FormData();
                formData.append('file', this.newLogo);

                this.isUploading = true;

                const res = await this.$axios({
                    method: 'post',
                    url: 'rss/upload',
                    data: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: function(progressEvent) {
                        vm.uploadProgress = Math.round(progressEvent.loaded / progressEvent.total * 100);
                    },
                });

                this.uploadVariant = 'success';
                this.$toast.success('Fichier téléversé');

                setTimeout(() => {
                    this.newLogo = null;
                    this.isUploading = false
                    this.uploadProgress = 0;
                    this.uploadVariant = 'primary';
                    this.getLogos();
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
                    this.newLogo = null;
                    this.isUploading = false
                    this.uploadProgress = 0;
                    this.uploadVariant = 'primary';
                }, 5000);
            }
        },
        async getLogos() {
            try {
                const data = await this.$axios.$get('rss/logos');
                this.logos = data;
                this.setLogosSelect();
            }
            catch(err) {
                this.logos = [];
                this.setLogosSelect();
            }
        },
        setLogosSelect() {
            this.logoSelectOptions = [{ value: 'null', text: 'Le logo du site', disabled: true, slot: 'first' }];
            for (let i = 0; i < this.logos.length; i++) {
                const file = this.logos[i];
                const match = file.match(/^([a-z0-9]{2,22})(\.jpeg|\.jpg|\.png){1}$/);
                const fileName = match[1];

                this.logoSelectOptions.push({ value: file, text: fileName });
            }
        },
    },
    components: {
        RssUpdateForm,
    },
};
</script>
