<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="PUBG - Match"
        :lead="'Match: ' + matchID"
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container>
        <b-card :img-src="'/img/pubg/' + match.match.map + '.png'" :img-alt="match.match.map" img-left>
            <b-list-group class="ml-2 mr-2" flush>
                <b-list-group-item>
                    <b-row>
                        <b-col cols="2">Date:</b-col>
                        <b-col>{{ momentDate(match.match.time) }}</b-col>
                    </b-row>
                </b-list-group-item>
                <b-list-group-item>
                    <b-row>
                        <b-col cols="2">Carte:</b-col>
                        <b-col>{{ mapName[match.match.map] }}</b-col>
                    </b-row>
                </b-list-group-item>
                <b-list-group-item>
                    <b-row>
                        <b-col cols="2">Mode:</b-col>
                        <b-col>{{ gameModeFormat(match.match.mode) }}</b-col>
                    </b-row>
                </b-list-group-item>
                <b-list-group-item>
                    <b-row>
                        <b-col cols="2">Durée:</b-col>
                        <b-col>{{ humanizeDuration(match.match.duration) }}</b-col>
                    </b-row>
                </b-list-group-item>
                <b-list-group-item>
                    <b-card-group deck>
                        <b-card
                            v-for="(team, index) in match.match.teams"
                            :key="index"
                            :header="'Classement: ' + team.rank"
                            header-bg-variant="primary"
                            class="m-2"
                        >
                            <ul class="ml-1 mt-2">
                                <li v-for="(player, index2) in team.players" :key="index2">
                                    {{ player.name }}
                                </li>
                            </ul>
                        </b-card>
                    </b-card-group>
                </b-list-group-item>
            </b-list-group>
        </b-card>
    </b-container>
    <b-container v-for="(team, index) in match.match.teams" :key="index">
        <div v-for="(player, index2) in team.players" :key="index2" class="mt-5">
            <h2>{{ player.name }}</h2>
            <hr class="border-primary">
            <b-card header-bg-variant="primary" header="Combat" class="mb-3">
                <b-row class="m-0">
                    <b-col cols="4" class="p-1">
                        <table class="table table-hover table-striped table-dark table-bordered m-0">
                            <tbody>
                                <tr>
                                    <td>Frags</td>
                                    <td>{{ player.kills }}</td>
                                </tr>
                                <tr>
                                    <td>Headshots</td>
                                    <td>{{ player.headshotKills }}</td>
                                </tr>
                                <tr>
                                    <td>DBNOs</td>
                                    <td>{{ player.DBNOs }}</td>
                                </tr>
                                <tr>
                                    <td>Assists</td>
                                    <td>{{ player.assists }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                    <b-col cols="4" class="p-1">
                        <table class="table table-hover table-striped table-dark table-bordered m-0">
                            <tbody>
                                <tr>
                                    <td>Dégats</td>
                                    <td>{{ Math.round(player.damageDealt) }}</td>
                                </tr>
                                <tr>
                                    <td>Distance</td>
                                    <td>{{ humanizeMeters(player.longestKill) }}</td>
                                </tr>
                                <tr>
                                    <td>Série</td>
                                    <td>{{ player.killStreaks }}</td>
                                </tr>
                                <tr>
                                    <td>Classement</td>
                                    <td>{{ player.killPlace }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                    <b-col cols="4" class="p-1">
                        <table class="table table-hover table-striped table-dark table-bordered m-0">
                            <tbody>
                                <tr>
                                    <td>Frags (véhicule)</td>
                                    <td>{{ player.roadKills }}</td>
                                </tr>
                                <tr>
                                    <td>Véhicule détruits</td>
                                    <td>{{ player.vehicleDestroys }}</td>
                                </tr>
                                <tr>
                                    <td>Frags amis</td>
                                    <td>{{ player.teamKills }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                </b-row>
            </b-card>
            <b-card header-bg-variant="primary" header="Informations supplémentaires">
                <b-row class="m-0">
                    <b-col cols="4" class="p-1">
                        <table class="table table-hover table-striped table-dark table-bordered m-0">
                            <tbody>
                                <tr>
                                    <td>Soins</td>
                                    <td>{{ player.heals }}</td>
                                </tr>
                                <tr>
                                    <td>Boosts</td>
                                    <td>{{ player.boosts }}</td>
                                </tr>
                                <tr>
                                    <td>Réanimations</td>
                                    <td>{{ player.revives }}</td>
                                </tr>
                                <tr>
                                    <td>Temps de survie</td>
                                    <td>{{ humanizeDuration(player.timeSurvived) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                    <b-col cols="4" class="p-1">
                        <table class="table table-hover table-striped table-dark table-bordered m-0">
                            <tbody>
                                <tr>
                                    <td>Distance (marche)</td>
                                    <td>{{ humanizeMeters(player.walkDistance) }}</td>
                                </tr>
                                <tr>
                                    <td>Distance (véhicule)</td>
                                    <td>{{ humanizeMeters(player.rideDistance) }}</td>
                                </tr>
                                <tr>
                                    <td>Distance (nage)</td>
                                    <td>{{ humanizeMeters(player.swimDistance) }}</td>
                                </tr>
                                <tr>
                                    <td>Loots!! (armes)</td>
                                    <td>{{ player.weaponsAcquired }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                    <b-col cols="4" class="p-1">
                        <table class="table table-hover table-striped table-dark table-bordered m-0">
                            <tbody>
                                <tr>
                                    <td>Classement</td>
                                    <td>{{ player.winPlace }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </b-col>
                </b-row>
            </b-card>
            <div v-if="match.telemetry[player.name]">
                <hr>
                <h4>Frags</h4>
                <b-table
                    hover
                    head-variant="light"
                    :items="match.telemetry[player.name].frag"
                    :fields="fragFields"
                />
                <hr>
                <h4>Armes</h4>
                <b-row v-for="(row, index3) in getWeaponStats(match.telemetry[player.name].weapon)" :key="'weaponStats' + index3" class="mt-3">
                    <b-col v-for="(weapon, weaponName) in row" :key="weaponName" cols="6">
                        <b-card header-bg-variant="primary" :header="causerName[weaponName]">
                            <b-row class="m-0">
                                <b-col cols="6">
                                    <div class="chart-size">
                                        <c-pie :data="weapon.shotsChartData" :options="weapon.chartOptions" />
                                    </div>
                                </b-col>
                                <b-col cols="6">
                                    <div class="chart-size">
                                        <c-pie v-if="weapon.hits > 0" :data="weapon.headshotsChartData" :options="weapon.chartOptions" />
                                    </div>
                                </b-col>
                            </b-row>
                        </b-card>
                    </b-col>
                </b-row>
                <hr>
                <h4>Dégats faits</h4>
                <b-card
                    v-for="(victim, victimName) in getDamageStats(match.telemetry[player.name].damageDone)"
                    :key="'damageStats' + victimName"
                    :header="victimName"
                    header-bg-variant="primary"
                    align="center"
                    class="mt-3"
                >
                    <b-row>
                        <b-col cols="6">
                            <div class="chart-size-500">
                                <c-radar :data="victim.damageChartData" :options="victim.damageChartOptions" />
                            </div>
                        </b-col>
                        <b-col cols="6">
                            <div class="chart-size-500">
                                <c-bar :data="victim.hitChartData" :options="victim.hitChartOptions" />
                            </div>
                        </b-col>
                    </b-row>
                </b-card>
            </div>
        </div>
    </b-container>
    <!-- <b-container>
        <pre v-if="inDev" class="text-white">{{ JSON.stringify(match, null, 2) }}</pre>
    </b-container> -->
</div>
</template>

<script>
import moment from 'moment';
import HumanizeDuration from 'humanize-duration';
import 'chartjs-plugin-colorschemes';

import ChartPie from '../../components/chart-pie';
import ChartRadar from '../../components/chart-radar';
import ChartBar from '../../components/chart-bar';
import { causerNames, gameModes, mapNames } from '../../../bot/class/pubgVars';
//import ChartHorizontalBar from '../../components/chart-horizontal-bar';

moment.locale('fr');

export default {
    name: 'match',
    components: {
        'c-pie': ChartPie,
        'c-radar': ChartRadar,
        'c-bar': ChartBar,
        //'c-horizontal-bar': ChartHorizontalBar,
    },
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.statsAccess) return redirect('/');
    },
    async asyncData({ params, $axios }) {
        const matchID = params.matchID;
        let match = {};

        try {
            const data = await $axios.$get('stats/match/' + matchID);

            if (data) match = data[0];
        }
        catch(err) {
            //
        }

        return { matchID: matchID, match: match };
    },
    data() {
        return {
            title: 'Match',
            matchID: '',
            match: {},
            mapName: mapNames,
            gameMode: gameModes,
            causerName: causerNames,
            locationName: {
                ArmShot: 'Bras',
                HeadShot: 'Tête',
                LegShot: 'Jambe',
                None: 'Aucun',
                NonSpecific: 'Générique',
                PelvisShot: 'Burnes',
                TorsoShot: 'Torse',
            },
            fragFields: [
                {
                    key: 'name',
                    label: 'Nom',
                    sortable: true,
                    thStyle: {
                        width: '25%',
                    },
                },
                {
                    key: 'weapon',
                    label: 'Arme',
                    sortable: true,
                    thStyle: {
                        width: '25%',
                    },
                    formatter: (value) => {
                        return this.causerName[value];
                    },
                },
                {
                    key: 'location',
                    label: 'Localisation',
                    sortable: true,
                    thStyle: {
                        width: '25%',
                    },
                    formatter: (value) => {
                        return this.locationName[value];
                    },
                },
                {
                    key: 'distance',
                    label: 'Distance',
                    sortable: true,
                    thStyle: {
                        width: '25%',
                    },
                    formatter: (value) => {
                        return this.humanizeMeters(value, null, true);
                    },
                },
            ],
            chartScheme: 'office.Capital6',
            inDev: process.env.NODE_ENV == 'development' ? true : false,
        };
    },
    // computed: {

    // },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
    },
    methods: {
        momentDate(date) {
            return moment(date).format('LLLL');
        },
        gameModeFormat(matchMode) {
            const { gameType, gameMode, gamePOV } = this.gameMode[matchMode];
            const mode = `${gameType ? gameType + ' ' : ''}${gameMode ? gameMode + ' ' : ''}${gamePOV ? gamePOV : ''}`;
            return mode;
        },
        humanizeDuration(duration) {
            return HumanizeDuration(Math.round(duration) * 1000, { language: 'fr' });
        },
        humanizeMeters(meters, short, isTelemetry) {
            meters = isTelemetry ? meters / 100 : meters;
            meters = Math.round(meters);
            const quotient = Math.floor(meters / 1000);
            const remainder = meters % 1000;

            if (quotient > 0) {
                return `${quotient} ${short ? 'k' : `kilomètre${quotient > 1 ? 's' : ''}`}, ${remainder} ${short ? 'm' : 'mètres'}`;
            }
            else {
                return `${remainder} ${short ? 'm' : 'mètres'}`;
            }
        },
        getWeaponStats(weaponObject) {
            let count = 0;
            let row = {};
            const out = [];

            for (const weaponName in weaponObject) {
                if (weaponName) {
                    const weapon = Object.create(weaponObject[weaponName]);

                    if (count == 2) {
                        out.push(row);
                        count = 0;
                        row = {};
                    }

                    const shotsChartData = {
                        labels: ['Tires', 'Touches'],
                        datasets: [{
                            data: [weapon.shots, weapon.hits],
                            borderWidth: 1,
                        }],
                    };

                    const headshotsChartData = {
                        labels: ['Corps', 'Tête'],
                        datasets: [{
                            data: [weapon.hits, weapon.headShots],
                            borderWidth: 1,
                        }],
                    };

                    const chartOptions = {
                        responsive: true,
                        legend: {
                            position: 'bottom',
                        },
                        animation: {
                            animateScale: true,
                            animateRotate: true,
                        },
                        tooltips: {
                            callbacks: {
                                label: function(tooltipItem, data) {
                                    const label = data.labels[tooltipItem.index];
                                    const dataset = data.datasets[tooltipItem.datasetIndex];
                                    const total = dataset.data.reduce((a, b) => {
                                        return a + b;
                                    });
                                    const value = dataset.data[tooltipItem.index];
                                    const percentage = Math.floor(((value / total) * 100) + 0.5);
                                    return `${label}: ${value} (${percentage}%)`;
                                },
                            },
                        },
                        ticks: {
                            beginAtZero: true,
                        },
                        plugins: {
                            colorschemes: {
                                scheme: this.chartScheme,
                            },
                        },
                    };

                    weapon.shotsChartData = shotsChartData;
                    weapon.headshotsChartData = headshotsChartData;
                    weapon.chartOptions = chartOptions;

                    row[weaponName] = weapon;
                    count++;
                }
            }

            if (count) out.push(row);

            return out;
        },
        getDamageStats(damageObject) {
            const locationIndex = {
                HeadShot: 0,
                TorsoShot: 1,
                ArmShot: 2,
                PelvisShot: 3,
                LegShot: 4,
                NonSpecific: 5,
                None: 6,
            };
            const out = {};

            for (const victimName in damageObject) {
                const victim = Object.create(damageObject[victimName]);

                const damageChartData = {
                    labels: ['Tête', 'Torse', 'Bras', 'Burnes', 'Jambe', 'Générique', 'Aucun'],
                    datasets: [],
                };

                const hitChartData = {
                    labels: ['Tête', 'Torse', 'Bras', 'Burnes', 'Jambe', 'Générique', 'Aucun'],
                    datasets: [],
                };

                for (const weaponName in victim) {
                    const weapon = victim[weaponName];
                    const damageData = [0, 0, 0, 0, 0, 0, 0];
                    const hitData = [0, 0, 0, 0, 0, 0, 0];

                    for (const locationName in weapon) {
                        const index = locationIndex[locationName];
                        const data = weapon[locationName];

                        damageData[index] = data.damage;
                        hitData[index] = data.hits;
                    }

                    damageChartData.datasets.push({
                        label: causerNames[weaponName],
                        data: damageData,
                        borderWidth: 1,
                    });

                    hitChartData.datasets.push({
                        label: causerNames[weaponName],
                        data: hitData,
                        borderWidth: 1,
                    });
                }

                const chartOptions = {
                    responsive: true,
                    legend: {
                        position: 'bottom',
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                const label = data.labels[tooltipItem.index];
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const total = dataset.data.reduce((a, b) => {
                                    return a + b;
                                });
                                const value = dataset.data[tooltipItem.index];
                                const percentage = Math.floor(((value / total) * 100) + 0.5);
                                return `${label}: ${value} (${percentage}%)`;
                            },
                        },
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                    plugins: {
                        colorschemes: {
                            scheme: this.chartScheme,
                        },
                    },
                };

                const damageChartOptions = Object.assign({
                    title: {
                        display: true,
                        text: 'Dégats',
                    },
                }, chartOptions);

                const hitChartOptions = Object.assign({
                    title: {
                        display: true,
                        text: 'Touches',
                    },
                }, chartOptions);

                victim.damageChartData = damageChartData;
                victim.hitChartData = hitChartData;
                victim.damageChartOptions = damageChartOptions;
                victim.hitChartOptions = hitChartOptions;

                out[victimName] = victim;
            }

            return out;
        },
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
    validate({ params }) {
        return /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i.test(params.matchID);
    },
};
</script>

<style>
.card-body {
    padding: 0;
}

.card-img-top {
    object-fit: scale-down;
}

.chart-size {
    width: 250px;
}

.chart-size-500 {
    width: 500px;
}
</style>
