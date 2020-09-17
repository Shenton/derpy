<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Derpy"
        lead="Le bot qui Hurr Durr Derp!!"
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
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
                <h2>Modules</h2>
                <hr class="border-primary">
                <h5>
                    <b-badge v-for="mod in modules" :key="mod.name" :variant="mod.enabled ? 'success' : 'danger'" class="mr-1">
                        {{ mod.name }}
                    </b-badge>
                </h5>
            </b-col>
            <b-col>
                <h2>Commandes</h2>
                <hr class="border-primary">
                <h5>
                    <b-badge v-for="command in commands" :key="command.name" :variant="command.enabled ? 'success' : 'danger'" class="mr-1">
                        {{ command.name }}
                    </b-badge>
                </h5>
            </b-col>
        </b-row>
    </b-container>
</div>
</template>

<script>
export default {
    name: 'index',
    async asyncData({ $axios }) {
        try {
            const modules = await $axios.$get('public/modules');
            const commands = await $axios.$get('public/commands');
            return { modules: modules, commands: commands };
        }
        catch(err) {
            //
        }
    },
    data() {
        return {
            title: 'Accueil',
            modules: [],
            commands: [],

        };
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.$store.dispatch('botinfo/getInfo');
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
};
</script>
