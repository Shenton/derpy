<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: Activity"
        lead="Change l'activité de Derpy au hasard."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <b-container v-if="activities.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :current-page="currentPage"
            :per-page="perPage"
            @row-selected="rowSelected"
            :items="activities"
            :fields="fields"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)"></b-form-checkbox>
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <ActivityUpdateForm @submitUpdate="submitUpdate" @submitDelete="submitDelete" :data="row.item"/>
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
        <h4>Ajouter une nouvelle activité</h4>
        <hr class="border-primary">
        <b-form @submit="submitNew" @reset="resetNew" v-if="showNewForm">
            <b-form-group>
                <b-form-input v-model="newForm.activity" placeholder="L'activité" required></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Ajouter</b-button>
            <b-button type="reset">Annuler</b-button>
        </b-form>
    </b-container>
</div>
</template>

<script>
import ActivityUpdateForm from '../../components/activity-update-form';

export default {
    name: 'Activity',
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
            title: 'Module: Activity',
            activities: [],
            fields: [
                {
                    key: 'activity',
                    label: 'Activité',
                    sortable: true,
                    thStyle: {
                        width: '80%'
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
                activity: '',
            },
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('activity');
            const activities = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { activities: activities };
        }
        catch(err) {}
        
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.activities.length;
    },
    methods: {
        async submitNew(event) {
            event.preventDefault();

            try {
                const res = await this.$axios({
                    method: 'post',
                    data: { activity: this.newForm.activity },
                    url: 'activity',
                });

                this.$toast.success('Activité ajoutée');
                this.resetNew();

                try {
                    const data = await this.$axios.$get('activity');
                    this.activities = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.activities.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'ajout de l\'activité');
            }
        },
        async submitUpdate(id, data) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: data,
                    url: 'activity/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Activité modifiée');

                    try {
                        const data = await this.$axios.$get('activity');
                        this.activities = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.activities.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition de l\'activité');
            }
        },
        async submitDelete(id) {
            this.hideRowDetails();

            try {
                await this.$axios({
                    method: 'delete',
                    url: 'activity/' + id,
                });

                this.$toast.success('Activité supprimée');

                try {
                    const data = await this.$axios.get('activity');
                    this.activities = data.data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.activities.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec la suppression de l\'activité');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Activité non trouvée', 'Cette activité existe déjà', methodMessage);
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
            this.activities.map(items => items._showDetails = false);
        },
        resetNew(event) {
            if (event) event.preventDefault();

            this.newForm.activity = '';

            // Trick to reset/clear native browser form validation state
            this.showNewForm = false;
            this.$nextTick(() => {
                this.showNewForm = true;
            })
        },
    },
    components: {
        ActivityUpdateForm,
    },
};
</script>
