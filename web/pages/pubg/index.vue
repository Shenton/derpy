<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="PUBG"
        lead="Liste des derniers matchs"
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container>
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :current-page="currentPage"
            :per-page="perPage"
            :items="matches"
            :fields="fields"
            @row-selected="rowSelected"
        >
            <template v-slot:cell(date)="data">
                {{ momentCalendar(data.value) }}
            </template>
            <template v-slot:cell(stats)="row">
                <b-link :to="'/pubg/' + row.item.matchID">Afficher</b-link>
            </template>
            <template slot="row-details" slot-scope="row">
                <b-row>
                    <b-col v-for="(team, index) in row.item.match.teams" :key="index">
                        <b-list-group>
                            <b-list-group-item v-for="(player, index2) in team.players" :key="index2" class="d-flex justify-content-between align-items-center">
                                {{ player.name }}
                                <div>
                                    <b-badge variant="primary" pill>{{ Math.round(player.damageDealt) }}</b-badge>
                                    <b-badge variant="primary" pill>{{ player.kills }}</b-badge>
                                </div>
                            </b-list-group-item>
                        </b-list-group>
                    </b-col>
                </b-row>
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
</div>
</template>

<script>
import moment from 'moment';
import { mapNames, gameModes } from '../../../bot/class/pubgVars';

moment.locale('fr');

export default {
    name: 'pubg',
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.statsAccess) return redirect('/');
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('stats/match');
            /**
             *
             * At one point this should be removed
             *
             */
            let matches = data.filter(items => items.match.teams);
            matches = matches.map(items => ({ ...items, _showDetails: false, key: items._id }));
            return { matches: matches };
        }
        catch(err) {
            //
        }
    },
    data() {
        return {
            title: 'PUBG',
            matches: [],
            fields: [
                {
                    key: 'date',
                    label: 'Date',
                    sortable: true,
                    sortByFormatted: true,
                    thStyle: {
                        width: '20%',
                    },
                    formatter: (value, key, item) => {
                        return item.match.time;
                    },
                },
                {
                    key: 'map',
                    label: 'Carte',
                    sortable: true,
                    thStyle: {
                        width: '20%',
                    },
                    formatter: (value, key, item) => {
                        return this.mapName[item.match.map];
                    },
                },
                {
                    key: 'mode',
                    label: 'Mode',
                    sortable: true,
                    thStyle: {
                        width: '20%',
                    },
                    formatter: (value, key, item) => {
                        const { gameType, gameMode, gamePOV } = this.gameMode[item.match.mode];
                        const mode = `${gameType ? gameType + ' ' : ''}${gameMode ? gameMode + ' ' : ''}${gamePOV ? gamePOV : ''}`;
                        return mode;
                    },
                },
                {
                    key: 'match',
                    label: 'Classement',
                    sortable: true,
                    thStyle: {
                        width: '20%',
                    },
                    formatter: (value, key, item) => {
                        const teams = item.match.teams;

                        if (teams.length == 1) {
                            return teams[0].rank;
                        }
                        else {
                            let out = '';

                            for (let i = 0; i < teams.length; i++) {
                                const team = teams[i];
                                out += `Èquipe #${i + 1}: ${team.rank} `;
                            }

                            return out;
                        }
                    },
                },
                {
                    key: 'stats',
                    label: 'Statistiques',
                    sortable: false,
                    thStyle: {
                        width: '20%',
                    },
                },
            ],
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [5, 10, 15],
            sortBy: 'date',
            sortDesc: true,
            mapName: mapNames,
            gameMode: gameModes,
        };
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.matches.length;
    },
    methods: {
        rowSelected(row) {
            this.hideRowDetails();
            if (!row.length) return;
            const items = row[0];
            items._showDetails = !items._showDetails;
        },
        hideRowDetails() {
            this.matches.map(items => items._showDetails = false);
        },
        momentCalendar(date) {
            return moment(date).calendar();
        },
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
};
</script>
