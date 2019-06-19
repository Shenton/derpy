<template>
    
</template>

<script>
export default {
    data() {
        return {
            title: 'Accueil',
            currentGuild: 'Non diponible',
        };
    },
    head () {
        return {
            titleTemplate: '%s - ' + this.title,
        }
    },
    fetch ({ store, redirect }) {
        if (!store.state.auth.isAuth) {
            return redirect('/')
        }
    },
};
</script>

<style>

</style>
