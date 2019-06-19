<template>
<div class="container">
    <div class="columns is-flex">
        <div class="column is-half">
            <p>
                <a href="https://github.com/Shenton/derpy"><i class="fab fa-github"></i>&nbsp;GitHub</a>
                <a href="https://discord.gg/DcBQmJ3"><i class="fab fa-discord"></i>&nbsp;Discord</a>
            </p>
        </div>
        <div class="column has-text-right">
            <p>Derpy v{{ derpyVersion }}, <i class="far fa-copyright fa-rotate-180"></i> {{ theYear }} shenton.fr</p>
        </div>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            theYear: new Date().getFullYear(),
            derpyVersion: process.env.version,
        };
    },
};
</script>

<style>

</style>
