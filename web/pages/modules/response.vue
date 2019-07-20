<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: Response"
        lead="Définis un déclencheur, le bot postera la réponse."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container v-if="responses.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :current-page="currentPage"
            :per-page="perPage"
            :items="responses"
            :fields="fields"
            @row-selected="rowSelected"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)" />
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <ResponseUpdateForm :data="row.item" @submitUpdate="submitUpdate" @submitDelete="submitDelete" />
            </template>
        </b-table>
        <b-row>
            <b-col>
                <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
            </b-col>
            <b-col>
                <b-form-group label-cols-sm="3" label="Nombre par page" class="mb-0">
                    <b-form-select v-model="perPage" :options="pageOptions" />
                </b-form-group>
            </b-col>
        </b-row>
    </b-container>
    <b-container>
        <h4>Ajouter une nouvelle réponse</h4>
        <hr class="border-primary">
        <b-form v-if="showNewForm" @submit="submitNew" @reset="resetNew">
            <b-form-group>
                <b-form-input v-model="newForm.trigger" placeholder="Le déclencheur" required />
            </b-form-group>
            <b-form-group>
                <b-form-input v-model="newForm.response" placeholder="La réponse" required />
            </b-form-group>
            <b-row>
                <b-col>
                    <b-form-select v-model="newForm.type" :options="responseSelectOptions" />
                </b-col>
                <b-col>
                    <b-button type="submit" variant="primary">Ajouter</b-button>
                    <b-button type="reset">Annuler</b-button>
                </b-col>
            </b-row>
        </b-form>
    </b-container>
</div>
</template>

<script>
import ResponseUpdateForm from '../../components/response-update-form';

export default {
    name: 'module-response',
    components: {
        ResponseUpdateForm,
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
    data() {
        return {
            title: 'Module: Response',
            responses: [],
            fields: [
                {
                    key: 'trigger',
                    label: 'Déclencheur',
                    sortable: true,
                    thStyle: {
                        width: '40%',
                    },
                },
                {
                    key: 'response',
                    label: 'Réponse',
                    sortable: true,
                    thStyle: {
                        width: '40%',
                    },
                },
                {
                    key: 'enabledCheckBox',
                    label: 'Activée',
                    sortable: true,
                    thStyle: {
                        width: '20%',
                    },
                },
            ],
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [5, 10, 15],
            showNewForm: true,
            newForm: {
                trigger: '',
                response: '',
                type: 'exact',
            },
            responseSelectOptions: [
                { value: 'exact', text: 'Exact' },
                { value: 'contain', text: 'Contient' },
            ],
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('response');
            const responses = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { responses: responses };
        }
        catch(err) {
            //
        }
    },
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.hasAccess) return redirect('/');
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.responses.length;
    },
    methods: {
        async submitNew(event) {
            event.preventDefault();

            try {
                await this.$axios({
                    method: 'post',
                    data: { trigger: this.newForm.trigger, response: this.newForm.response, type: this.newForm.type },
                    url: 'response',
                });

                this.$toast.success('Réponse ajoutée');
                this.resetNew();

                try {
                    const data = await this.$axios.$get('response');
                    this.responses = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.responses.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'ajout de la réponse');
            }
        },
        async submitUpdate(id, doc) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: doc,
                    url: 'response/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Réponse modifiée');

                    try {
                        const data = await this.$axios.$get('response');
                        this.responses = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.responses.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition de la réponse');
            }
        },
        async submitDelete(id) {
            this.hideRowDetails();

            try {
                await this.$axios({
                    method: 'delete',
                    url: 'response/' + id,
                });

                this.$toast.success('Réponse supprimée');

                try {
                    const data = await this.$axios.$get('response');
                    this.responses = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.responses.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec la suppression de la réponse');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Réponse non trouvée', 'Cette réponse existe déjà', methodMessage);
        },
        toggleEnabled(id, enabled) {
            if (enabled) this.submitUpdate(id, { enabled: false });
            else this.submitUpdate(id, { enabled: true });
        },
        rowSelected(row) {
            this.hideRowDetails();
            if (!row.length) return;
            const items = row[0];
            items._showDetails = !items._showDetails;
        },
        hideRowDetails() {
            this.responses.map(items => items._showDetails = false);
        },
        resetNew(event) {
            if (event) event.preventDefault();

            this.newForm.trigger = '';
            this.newForm.response = '';
            this.newForm.type = 'exact';

            // Trick to reset/clear native browser form validation state
            this.showNewForm = false;
            this.$nextTick(() => {
                this.showNewForm = true;
            });
        },
    },
};
</script>
