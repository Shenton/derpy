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
                <b-link :to="'/pubg/' + row.item.matchID">Lien</b-link>
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
            mapName: {
                'Desert_Main': 'Miramar',
                'DihorOtok_Main': 'Vikendi',
                'Erangel_Main': 'Erangel',
                'Baltic_Main': 'Erangel',
                'Range_Main': 'Camp Jackal',
                'Savage_Main': 'Sanhok',
                'Summerland_Main': 'Karakin',
            },
            gameMode: {
                duo: { gameType: null, gameMode: 'Duo', gamePOV: 'TPP' },
                'duo-fpp': { gameType: null, gameMode: 'Duo', gamePOV: 'FPP' },
                solo: { gameType: null, gameMode: 'Solo', gamePOV: 'TPP' },
                'solo-fpp': { gameType: null, gameMode: 'Solo', gamePOV: 'FPP' },
                squad: { gameType: null, gameMode: 'Squad', gamePOV: 'TPP' },
                'squad-fpp': { gameType: null, gameMode: 'Squad', gamePOV: 'FPP' },
                'conquest-duo': { gameType: 'Conquest', gameMode: 'Duo', gamePOV: 'TPP' },
                'conquest-duo-fpp': { gameType: 'Conquest', gameMode: 'Duo', gamePOV: 'FPP' },
                'conquest-solo': { gameType: 'Conquest', gameMode: 'Solo', gamePOV: 'TPP' },
                'conquest-solo-fpp': { gameType: 'Conquest', gameMode: 'Solo', gamePOV: 'FPP' },
                'conquest-squad': { gameType: 'Conquest', gameMode: 'Squad', gamePOV: 'TPP' },
                'conquest-squad-fpp': { gameType: 'Conquest', gameMode: 'Squad', gamePOV: 'FPP' },
                'esports-duo': { gameType: 'Esports', gameMode: 'Duo', gamePOV: 'TPP' },
                'esports-duo-fpp': { gameType: 'Esports', gameMode: 'Duo', gamePOV: 'FPP' },
                'esports-solo': { gameType: 'Esports', gameMode: 'Solo', gamePOV: 'TPP' },
                'esports-solo-fpp': { gameType: 'Esports', gameMode: 'Solo', gamePOV: 'FPP' },
                'esports-squad': { gameType: 'Esports', gameMode: 'Squad', gamePOV: 'TPP' },
                'esports-squad-fpp': { gameType: 'Esports', gameMode: 'Squad', gamePOV: 'FPP' },
                'normal-duo': { gameType: 'Normal', gameMode: 'Duo', gamePOV: 'TPP' },
                'normal-duo-fpp': { gameType: 'Normal', gameMode: 'Duo', gamePOV: 'FPP' },
                'normal-solo': { gameType: 'Normal', gameMode: 'Solo', gamePOV: 'TPP' },
                'normal-solo-fpp': { gameType: 'Normal', gameMode: 'Solo', gamePOV: 'FPP' },
                'normal-squad': { gameType: 'Normal', gameMode: 'Squad', gamePOV: 'TPP' },
                'normal-squad-fpp': { gameType: 'Normal', gameMode: 'Squad', gamePOV: 'FPP' },
                'war-duo': { gameType: 'War', gameMode: 'Duo', gamePOV: 'TPP' },
                'war-duo-fpp': { gameType: 'War', gameMode: 'Duo', gamePOV: 'FPP' },
                'war-solo': { gameType: 'War', gameMode: 'Solo', gamePOV: 'TPP' },
                'war-solo-fpp': { gameType: 'War', gameMode: 'Solo', gamePOV: 'FPP' },
                'war-squad': { gameType: 'War', gameMode: 'Squad', gamePOV: 'TPP' },
                'war-squad-fpp': { gameType: 'War', gameMode: 'Squad', gamePOV: 'FPP' },
                'zombie-duo': { gameType: 'Zombie', gameMode: 'Duo', gamePOV: 'TPP' },
                'zombie-duo-fpp': { gameType: 'Zombie', gameMode: 'Duo', gamePOV: 'FPP' },
                'zombie-solo': { gameType: 'Zombie', gameMode: 'Solo', gamePOV: 'TPP' },
                'zombie-solo-fpp': { gameType: 'Zombie', gameMode: 'Solo', gamePOV: 'FPP' },
                'zombie-squad': { gameType: 'Zombie', gameMode: 'Squad', gamePOV: 'TPP' },
                'zombie-squad-fpp': { gameType: 'Zombie', gameMode: 'Squad', gamePOV: 'FPP' },
                'lab-tpp': { gameType: 'Lab', gameMode: null, gamePOV: 'TPP' },
                'lab-fpp': { gameType: 'Lab', gameMode: null, gamePOV: 'FPP' },
                'tdm': { gameType: 'TDM', gameMode: null, gamePOV: 'FPP' },
            },
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
