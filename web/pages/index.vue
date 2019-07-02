<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Derpy"
        lead="Le bot qui Hurr Durr Derp!!"
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <b-container>
        <h2>{{ $store.state.botinfo.info.name }}</h2>
        <hr class="border-primary">
        <b-row>
            <b-col class="text-center">
                <p>Membres</p>
                <h3>{{ $store.state.botinfo.info.memberCount }}</h3>
            </b-col>
            <b-col class="text-center">
                <p>Canaux texte</p>
                <h3>{{ $store.state.botinfo.info.textChannels.length }}</h3>
            </b-col>
            <b-col class="text-center">
                <p>Canaux voix</p>
                <h3>{{ $store.state.botinfo.info.voiceChannels.length }}</h3>
            </b-col>
        </b-row>
        <div class="shadow-sm p-3 mb-5 bg-secondary rounded">
            <p>{{ $store.state.botinfo.info }}</p>
            <b-button @click="makeToast()" class="mb-2">Test</b-button>
        </div>
    </b-container>
</div>
</template>

<script>
export default {
    name: 'Accueil',
    data() {
        return {
            title: 'Accueil',
        };
    },
    head () {
        return {
            titleTemplate: '%s - ' + this.title,
        }
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.$store.dispatch('botinfo/getInfo');
    },
    methods: {
        makeToast() {
            const n = Math.floor(Math.random() * 4) + 1;

            if (n == 1) this.$toast.success('Test');
            else if (n == 2) this.$toast.warning('Test');
            else if (n == 3) this.$toast.info('Test');
            else if (n == 4) this.$toast.error('Test');
        }
    },
}
</script>

<style>

</style>
