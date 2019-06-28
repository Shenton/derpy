<template>
<b-container>
    <b-row>
        <b-col>
            <p>
                <a href="https://github.com/Shenton/derpy"><i class="fab fa-github"></i>&nbsp;GitHub</a>
                <a href="https://discord.gg/DcBQmJ3"><i class="fab fa-discord"></i>&nbsp;Discord</a>
            </p>
        </b-col>
        <b-col>
            <p class="text-right">Derpy v{{ derpyVersion }}, <i class="far fa-copyright fa-rotate-180"></i> {{ theYear }} shenton.fr</p>
        </b-col>
    </b-row>
</b-container>
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
