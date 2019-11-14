<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: PUBG"
        lead="Liste des joueurs et configuration du module PUBG."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container v-if="players.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :current-page="currentPage"
            :per-page="perPage"
            :items="players"
            :fields="fields"
            @row-selected="rowSelected"
        >
            <template v-slot:cell(enabledCheckBox)="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)" />
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <PlayerUpdateForm :data="row.item" @submitPlayerUpdate="submitPlayerUpdate" @submitPlayerDelete="submitPlayerDelete" />
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
        <h4>Ajouter un nouveau joueur</h4>
        <hr class="border-primary">
        <b-form v-if="showNewForm" class="mb-5" @submit="submitNewPlayer" @reset="resetNew">
            <b-form-group>
                <b-form-input v-model="newPlayer" placeholder="Le joueur" required />
            </b-form-group>
            <b-button type="submit" variant="primary">Ajouter</b-button>
            <b-button type="reset">Annuler</b-button>
        </b-form>
    </b-container>
</div>
</template>

<script>
import PlayerUpdateForm from '../../components/player-update-form';

export default {
    name: 'module-pubg',
    components: {
        PlayerUpdateForm,
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
    data() {
        return {
            title: 'Module: PUBG',
            players: [],
            fields: [
                {
                    key: 'player',
                    label: 'Joueur',
                    sortable: true,
                    thStyle: {
                        width: '80%',
                    },
                },
                {
                    key: 'enabledCheckBox',
                    label: 'Activé',
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
            newPlayer: '',
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('player');
            const players = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { players: players };
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
        this.totalRows = this.players.length;
    },
    methods: {
        async submitNewPlayer(event) {
            event.preventDefault();

            try {
                await this.$axios({
                    method: 'post',
                    data: { player: this.newPlayer },
                    url: 'player',
                });

                this.$toast.success('Joueur ajouté');
                this.resetNew();

                try {
                    const data = await this.$axios.$get('player');
                    this.players = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.players.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'ajout du joueur');
            }
        },
        async submitPlayerUpdate(id, doc) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: doc,
                    url: 'player/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Joueur modifié');

                    try {
                        const data = await this.$axios.$get('player');
                        this.players = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.players.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition du joueur');
            }
        },
        async submitPlayerDelete(id) {
            this.hideRowDetails();

            try {
                await this.$axios({
                    method: 'delete',
                    url: 'player/' + id,
                });

                this.$toast.success('Joueur supprimé');

                try {
                    const data = await this.$axios.get('player');
                    this.players = data.data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                    this.totalRows = this.players.length;
                }
                catch(err) {
                    this.$axiosGetErrorHandler(err);
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec la suppression du joueur');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Joueur non trouvé', 'Ce joueur existe déjà', methodMessage);
        },
        toggleEnabled(id, enabled) {
            if (enabled) this.submitPlayerUpdate(id, { enabled: false });
            else this.submitPlayerUpdate(id, { enabled: true });
        },
        rowSelected(row) {
            this.hideRowDetails();
            if (!row.length) return;
            const items = row[0];
            items._showDetails = !items._showDetails;
        },
        hideRowDetails() {
            this.players.map(items => items._showDetails = false);
        },
        resetNew(event) {
            if (event) event.preventDefault();

            this.newPlayer = '';

            // Trick to reset/clear native browser form validation state
            this.showNewForm = false;
            this.$nextTick(() => {
                this.showNewForm = true;
            });
        },
    },
};
</script>
