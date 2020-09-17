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
                >
                    <template slot="weaponImage" slot-scope="row">
                        <b-img :src="'/img/pubg/' + causerToID[row.item.weapon] + '.png'" :alt="causerToID[row.item.weapon]" height="20" />
                    </template>
                </b-table>
                <hr>
                <h4>Armes</h4>
                <b-row v-for="(row, index3) in getWeaponStats(match.telemetry[player.name].weapon)" :key="'weaponStats' + index3" class="mt-3">
                    <b-col v-for="(weapon, weaponName) in row" :key="weaponName" cols="6">
                        <b-card
                            :img-src="'/img/pubg/' + (causerToID[weaponName] || weaponName) + '.png'"
                            :img-alt="weaponName"
                            img-height="60vh"
                            img-width="100%"
                            img-top
                        >
                            <b-row>
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
    <b-container>
        <pre v-if="inDev" class="text-white">{{ JSON.stringify(match, null, 2) }}</pre>
    </b-container>
</div>
</template>

<script>
import moment from 'moment';
import HumanizeDuration from 'humanize-duration';
import 'chartjs-plugin-colorschemes';

import ChartPie from '../../components/chart-pie';
import ChartRadar from '../../components/chart-radar';
import ChartBar from '../../components/chart-bar';
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
                'lab-tpp': { gameType: 'Lab', gameMode: 'None', gamePOV: 'TPP' },
                'lab-fpp': { gameType: 'Lab', gameMode: 'None', gamePOV: 'FPP' },
                'tdm': { gameType: 'TDM', gameMode: 'None', gamePOV: 'FPP' },
            },
            causerToID:{
                ProjGrenade_C: 'Item_Weapon_Grenade_C',
                ProjMolotov_C: 'Item_Weapon_Molotov_C',
                BP_MolotovFireDebuff_C: 'Item_Weapon_Molotov_C',
                WeapAK47_C: 'Item_Weapon_AK47_C',
                WeapAUG_C: 'Item_Weapon_AUG_C',
                WeapAWM_C: 'Item_Weapon_AWM_C',
                WeapBerreta686_C: 'Item_Weapon_Berreta686_C',
                WeapBerylM762_C: 'Item_Weapon_BerylM762_C',
                WeapBizonPP19_C: 'Item_Weapon_BizonPP19_C',
                WeapCowbar_C: 'Item_Weapon_Cowbar_C',
                WeapCrossbow_1_C: 'Item_Weapon_Crossbow_C',
                WeapDesertEagle_C: 'Item_Weapon_DesertEagle_C',
                WeapDP12_C: 'Item_Weapon_DP12_C',
                WeapDP28_C: 'Item_Weapon_DP28_C',
                WeapFNFal_C: 'Item_Weapon_FNFal_C',
                WeapG18_C: 'Item_Weapon_G18_C',
                WeapG36C_C: 'Item_Weapon_G36C_C',
                WeapGroza_C: 'Item_Weapon_Groza_C',
                WeapHK416_C: 'Item_Weapon_HK416_C',
                WeapKar98k_C: 'Item_Weapon_Kar98k_C',
                WeapM16A4_C: 'Item_Weapon_M16A4_C',
                WeapM1911_C: 'Item_Weapon_M1911_C',
                WeapM249_C: 'Item_Weapon_M249_C',
                WeapM24_C: 'Item_Weapon_M24_C',
                WeapM9_C: 'Item_Weapon_M9_C',
                WeapMachete_C: 'Item_Weapon_Machete_C',
                WeapMini14_C: 'Item_Weapon_Mini14_C',
                WeapMk14_C: 'Item_Weapon_Mk14_C',
                WeapMk47Mutant_C: 'Item_Weapon_Mk47Mutant_C',
                WeapMP5K_C: 'Item_Weapon_MP5K_C',
                WeapNagantM1895_C: 'Item_Weapon_NagantM1895_C',
                WeapPan_C: 'Item_Weapon_Pan_C',
                WeapQBU88_C: 'Item_Weapon_QBU88_C',
                WeapQBZ95_C: 'Item_Weapon_QBZ95_C',
                WeapRhino_C: 'Item_Weapon_Rhino_C',
                WeapSaiga12_C: 'Item_Weapon_Saiga12_C',
                WeapSawnoff_C: 'Item_Weapon_Sawnoff_C',
                'WeapSCAR-L_C': 'Item_Weapon_SCAR-L_C',
                WeapSickle_C: 'Item_Weapon_Sickle_C',
                WeapSKS_C: 'Item_Weapon_SKS_C',
                BP_Spiketrap_C: 'Item_Weapon_SpikeTrap_C',
                ProjStickyGrenade_C: 'Item_Weapon_StickyGrenade_C',
                WeapThompson_C: 'Item_Weapon_Thompson_C',
                WeapUMP_C: 'Item_Weapon_UMP_C',
                WeapUZI_C: 'Item_Weapon_UZI_C',
                WeapVector_C: 'Item_Weapon_Vector_C',
                WeapVSS_C: 'Item_Weapon_VSS_C',
                Weapvz61Skorpion_C: 'Item_Weapon_vz61Skorpion_C',
                WeapWin94_C: 'Item_Weapon_Win1894_C',
                WeapWinchester_C: 'Item_Weapon_Winchester_C',
            },
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
                    key: 'weaponImage',
                    label: 'Arme',
                    sortable: true,
                    thStyle: {
                        width: '25%',
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
                        label: weaponName,
                        data: damageData,
                        borderWidth: 1,
                    });

                    hitChartData.datasets.push({
                        label: weaponName,
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
