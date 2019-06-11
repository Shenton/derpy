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
    <div class="box">
        <div class="columns is-flex">
            <div class="column is-half">
                <p>Actuellement je m'occupe de la guilde {{ currentGuild }}.</p>
            </div>
            <div class="column">
            </div>
        </div>
    </div>
</section>
</template>

<script>
//const { getGuild } = require('../methods');

export default {
    name: "Home",
    data() {
        return {
            //currentGuild: getGuild(),
        };
    },
    created() {
        
    },
}
</script>

<style>

</style>
