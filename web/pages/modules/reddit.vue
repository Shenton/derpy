<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: Reddit"
        lead="Poste les publications populaire, nouveau, en progression, controversé, le meilleur, doré, de Reddit."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container v-if="imageSubreddit.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :current-page="currentPage"
            :per-page="perPage"
            :items="imageSubreddit"
            :fields="fields"
            @row-selected="rowSelected"
        >
            <template v-slot:cell(enabledCheckBox)="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)" />
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <RedditUpdateForm :data="row.item" @submitUpdate="submitUpdate" @submitDelete="submitDelete" />
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
        <h4>Ajouter un nouveau sub</h4>
        <hr class="border-primary">
        <b-form v-if="showNewForm" @submit="submitNew" @reset="resetNew">
            <b-form-group>
                <b-form-input v-model="newForm.name" placeholder="Le subreddit" required />
            </b-form-group>
            <b-form-group>
                <b-row>
                    <b-col>
                        <b-form-select v-model="newForm.listing" :options="listingSelectOptions" />
                    </b-col>
                    <b-col>
                        <b-form-select v-model="newForm.limit" :options="limitSelectOptions" />
                    </b-col>
                </b-row>
            </b-form-group>
            <b-form-group>
                <b-button type="submit" variant="primary">Ajouter</b-button>
                <b-button type="reset">Annuler</b-button>
            </b-form-group>
        </b-form>
    </b-container>
</div>
</template>

<script>
import RedditUpdateForm from '../../components/reddit-update-form';

export default {
    name: 'module-reddit',
    components: {
        RedditUpdateForm,
    },
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.hasAccess) return redirect('/');
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('reddit');
            const imageSubreddit = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { imageSubreddit: imageSubreddit };
        }
        catch(err) {
            //
        }
    },
    data() {
        return {
            title: 'Module: Reddit',
            imageSubreddit: [],
            fields: [
                {
                    key: 'name',
                    label: 'Subreddit',
                    sortable: true,
                    thStyle: {
                        width: '40%',
                    },
                },
                {
                    key: 'listing',
                    label: 'liste',
                    sortable: true,
                    thStyle: {
                        width: '40%',
                    },
                    formatter: 'listingFormatter',
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
            listingNames: {
                hot: 'Populaire',
                new: 'Nouveau',
                rising: 'En progression',
                controversial: 'Controversé',
                top: 'Le meilleur',
                gilded: 'Doré',
            },
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [5, 10, 15],
            showNewForm: true,
            newForm: {
                name: '',
                listing: 'hot',
                limit: 25,
                type: 'image',
            },
            listingSelectOptions: [
                { value: 'hot', text: 'Populaire' },
                { value: 'new', text: 'Nouveau' },
                { value: 'rising', text: 'En progression' },
                { value: 'controversial', text: 'Controversé' },
                { value: 'top', text: 'Le meilleur' },
                { value: 'gilded', text: 'Doré' },
            ],
            limitSelectOptions: [
                { value: 25, text: 'Une page' },
                { value: 50, text: 'Deux pages' },
                { value: 75, text: 'Trois pages' },
                { value: 100, text: 'Quatre pages' },
            ],
        };
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.imageSubreddit.length;
    },
    methods: {
        async submitNew(event) {
            event.preventDefault();

            try {
                await this.$axios({
                    method: 'post',
                    data: { name: this.newForm.name, listing: this.newForm.listing, limit: this.newForm.limit, type: this.newForm.type },
                    url: 'reddit',
                });

                this.$toast.success('Subreddit ajoutée');
                this.resetNew();

                try {
                    const data = await this.$axios.$get('reddit');
                    this.imageSubreddit = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.imageSubreddit.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'ajout du subreddit');
            }
        },
        async submitUpdate(id, doc) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: doc,
                    url: 'reddit/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Subreddit modifiée');

                    try {
                        const data = await this.$axios.$get('reddit');
                        this.imageSubreddit = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.imageSubreddit.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition du subreddit');
            }
        },
        async submitDelete(id) {
            this.hideRowDetails();

            try {
                await this.$axios({
                    method: 'delete',
                    url: 'reddit/' + id,
                });

                this.$toast.success('Subreddit supprimée');

                try {
                    const data = await this.$axios.$get('reddit');
                    this.imageSubreddit = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.imageSubreddit.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec la suppression du subreddit');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Subreddit non trouvé', 'Ce subreddit existe déjà', methodMessage);
        },
        toggleEnabled(id, enabled) {
            !!enabled;
            !enabled;
            this.submitUpdate(id, { enabled: enabled });
        },
        rowSelected(row) {
            this.hideRowDetails();
            if (!row.length) return;
            const items = row[0];
            items._showDetails = !items._showDetails;
        },
        hideRowDetails() {
            this.imageSubreddit.map(items => items._showDetails = false);
        },
        resetNew(event) {
            if (event) event.preventDefault();

            this.newForm.name = '';
            this.newForm.listing = 'hot';
            this.newForm.limit = 25;
            this.newForm.type = 'image';

            // Trick to reset/clear native browser form validation state
            this.showNewForm = false;
            this.$nextTick(() => {
                this.showNewForm = true;
            });
        },
        listingFormatter(value) {
            return this.listingNames[value];
        },
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
};
</script>
