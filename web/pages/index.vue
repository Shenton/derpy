<template>
<div>
    <b-jumbotron fluid bg-variant="dark" text-variant="light" class="mt-3 pt-4 pb-4" header="Derpy" lead="Le bot qui Hurr Durr Derp!!"></b-jumbotron>
    <b-container>
        <div class="shadow-sm p-3 mb-5 bg-secondary rounded">
            <p>{{ $store.state.auth.name }}<br></p>
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
