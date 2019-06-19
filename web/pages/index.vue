<template>
<section>
    <div class="hero is-light">
        <div class="hero-body">
            <div class="container">
                <h1 class="title">Derpy</h1>
                <h2 class="subtitle">Le bot qui Hurr Durr Derp!!</h2>
            </div>
        </div>
    </div>
    <section  class="section">
        <div class="container">
        <div class="box">
            <div class="columns is-flex">
                <div class="column is-half">
                    <!--<p>Actuellement je m'occupe de la guilde {{ currentGuild }}.</p>-->
                    <p>{{ $store.state.auth.name }}<br></p>
                </div>
                <div class="column">
                </div>
            </div>
        </div>
    </div>
    </section>
</section>
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
    created() {
        
    },
}
</script>

<style>

</style>
