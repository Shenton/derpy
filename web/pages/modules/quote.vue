<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: Quote"
        lead="Associe une commande à une liste de citations."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container v-if="quotes.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :current-page="currentPage"
            :per-page="perPage"
            :items="quotes"
            :fields="fields"
            @row-selected="rowSelected"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)" />
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <QuoteUpdateForm :data="row.item" @submitUpdate="submitUpdate" @submitDelete="submitDelete" />
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
        <h4>Ajouter une nouvelle commande</h4>
        <hr class="border-primary">
        <b-form v-if="showNewForm" @submit="submitNew" @reset="resetNew">
            <b-form-group>
                <b-form-input v-model="newForm.name" placeholder="La commande" required />
            </b-form-group>
            <b-button type="submit" variant="primary">Ajouter</b-button>
            <b-button type="reset">Annuler</b-button>
        </b-form>
    </b-container>
</div>
</template>

<script>
import QuoteUpdateForm from '../../components/quote-update-form';

export default {
    name: 'module-quote',
    components: {
        QuoteUpdateForm,
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
    data() {
        return {
            title: 'Module: Quote',
            quotes: [],
            fields: [
                {
                    key: 'name',
                    label: 'Commande',
                    sortable: true,
                    thStyle: {
                        width: '40%',
                    },
                },
                {
                    key: 'quotes',
                    label: 'Citation(s)',
                    sortable: true,
                    thStyle: {
                        width: '40%',
                    },
                    formatter: (value) => {
                        return value.length;
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
                name: null,
            },
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('quote');
            const quotes = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { quotes: quotes };
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
        this.totalRows = this.quotes.length;
    },
    methods: {
        async submitNew(event) {
            event.preventDefault();

            try {
                await this.$axios({
                    method: 'post',
                    data: { name: this.newForm.name },
                    url: 'quote',
                });

                this.$toast.success('Commande ajoutée');
                this.resetNew();

                try {
                    const data = await this.$axios.$get('quote');
                    this.quotes = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.quotes.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'ajout de la commande');
            }
        },
        async submitUpdate(id, doc) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: doc,
                    url: 'quote/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Citation modifiée');

                    try {
                        const data = await this.$axios.$get('quote');
                        this.quotes = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.quotes.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition de la citation');
            }
        },
        async submitDelete(id) {
            this.hideRowDetails();

            try {
                await this.$axios({
                    method: 'delete',
                    url: 'quote/' + id,
                });

                this.$toast.success('Commande supprimée');

                try {
                    const data = await this.$axios.get('quote');
                    this.quotes = data.data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.quotes.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec la suppression de la commande');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Commande non trouvée', 'Cette commande existe déjà', methodMessage);
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
            this.quotes.map(items => items._showDetails = false);
        },
        resetNew(event) {
            if (event) event.preventDefault();

            this.newForm.name = null;

            // Trick to reset/clear native browser form validation state
            this.showNewForm = false;
            this.$nextTick(() => {
                this.showNewForm = true;
            });
        },
    },
};
</script>
