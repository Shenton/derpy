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
        <b-row class="mb-5">
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
        <b-row class="mb-5">
            <b-col>
                <h2>Modules activés</h2>
                <hr class="border-primary">
                <p>{{ activatedModules() }}</p>
            </b-col>
            <b-col>
                <h2>Commandes activées</h2>
                <hr class="border-primary">
                <p>{{ activatedCommands() }}</p>
            </b-col>
        </b-row>
    </b-container>
</div>
</template>

<script>
export default {
    name: 'Accueil',
    data() {
        return {
            title: 'Accueil',
            modules: [],
            commands: [],

        };
    },
    head () {
        return {
            titleTemplate: '%s - ' + this.title,
        }
    },
    async asyncData({ $axios }) {
        try {
            const modules = await $axios.$get('public/modules');
            const commands = await $axios.$get('public/commands');
            return { modules: modules, commands: commands };
        }
        catch(err) {}
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.$store.dispatch('botinfo/getInfo');
    },
    methods: {
        activatedModules() {
            return this.modules.map(m => m.enabled ? m.name : null).join(' ');
        },
        activatedCommands() {
            return this.commands.map(m => m.enabled ? m.name : null).join(' ');
        }
    },
}
</script>
