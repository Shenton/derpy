<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Module: PUBG"
        lead="Liste des joueurs et configuration du module PUBG."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
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
            @row-selected="rowSelected"
            :items="players"
            :fields="fields"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)"></b-form-checkbox>
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <PlayerUpdateForm @submitPlayerUpdate="submitPlayerUpdate" @submitPlayerDelete="submitPlayerDelete" :data="row.item"/>
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
        <h4>Ajouter un nouveau joueur</h4>
        <hr class="border-primary">
        <b-form class="mb-5" @submit="submitNewPlayer" @reset="resetNew" v-if="showNewForm">
            <b-form-group>
                <b-form-input v-model="newPlayer" placeholder="Le joueur" required></b-form-input>
            </b-form-group>
            <b-button type="submit" variant="primary">Ajouter</b-button>
            <b-button type="reset">Annuler</b-button>
        </b-form>

        <b-form @submit="submitConfigUpdate">
            <h4>PUBG shard: <strong class="text-primary">{{ configForm.shard }}</strong></h4>
            <hr class="border-primary">
            <b-form-select class="mb-5" v-model="configForm.shard" :options="shardsSelectOptions"></b-form-select>

            <h4>Nombre d'appels à l'API de PUBG par minute: <strong class="text-primary">{{ configForm.callsPerMinute }}</strong></h4>
            <hr class="border-primary">
            <b-input-group class="mb-5" prepend="1" append="8">
                <b-form-input v-model="configForm.callsPerMinute" type="range" min="1" max="8"></b-form-input>
            </b-input-group>

            <b-button type="submit" block variant="primary">Appliquer les modifications</b-button>
        </b-form>
    </b-container>
</div>
</template>

<script>
import PlayerUpdateForm from '../../components/player-update-form';

export default {
    name: 'PUBG',
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
            title: 'Module: PUBG',
            players: [],
            fields: [
                {
                    key: 'player',
                    label: 'Joueur',
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
            newPlayer: '',
            shard: 'steam',
            shardsSelectOptions: [
                { value: 'kakao', text: 'Kakao' },
                { value: 'psn', text: 'PS4' },
                { value: 'steam', text: 'Steam' },
                { value: 'tournament', text: 'Tournaments' },
                { value: 'xbox', text: 'Xbox' },
            ],
            callsPerMinute: 1,
            configForm: {
                shard: 'steam',
                callsPerMinute : 1,
            }
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('player');
            const players = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            const shard = await $axios.$get('derpy/pubgShard');
            const callsPerMinute = await $axios.$get('derpy/pubgCallsPerMinute');
            return {
                players: players,
                shard: shard[0].value,
                callsPerMinute: callsPerMinute[0].value,
            };
        }
        catch(err) {}
        
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.players.length;
        this.configForm = {
            shard: this.shard,
            callsPerMinute: this.callsPerMinute,
        }
    },
    methods: {
        async submitNewPlayer(event) {
            event.preventDefault();

            try {
                const res = await this.$axios({
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
        async submitPlayerUpdate(id, data) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: data,
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
        async submitConfigUpdate(event) {
            event.preventDefault();

            const shard = this.configForm.shard;
            const callsPerMinute = this.configForm.callsPerMinute;

            if (shard === this.shard && callsPerMinute === this.callsPerMinute) {
                this.$toast.warning('Aucune modification');
            }

            if (shard !== this.shard) {
                const value = await this.update(shard, 'pubgShard', 'Shard modifiée');
                this.shard = value;
                this.configForm.shard = value;
            }
            if (callsPerMinute !== this.callsPerMinute) {
                const value = await this.update(callsPerMinute, 'pubgCallsPerMinute', 'Nombre d\'appels à l\'API de PUBG modifié');
                this.callsPerMinute = value;
                this.configForm.callsPerMinute = value;
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
            })
        },
    },
    components: {
        PlayerUpdateForm,
    },
};
</script>
