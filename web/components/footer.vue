<template>
    <footer>
        <hr>
        <div class="row">
            <div class="col">
                <p>
                    <nuxt-link to="//github.com/Shenton"><i class="fab fa-github"></i> GitHub</nuxt-link>
                    <nuxt-link to="//discord.gg/DcBQmJ3"><i class="fab fa-discord"></i> Discord</nuxt-link>
                </p>
            </div>
            <div class="col text-right">
                <p><i class="far fa-copyright fa-rotate-180"></i> {{theYear}} shenton.fr</p>
            </div>
        </div>
    </footer>
</template>

<script>
export default {
    data() {
        return {
            theYear: '2019'
        };
    },
    created() {
        
    },
    computed: {
        faGithub() {
            return faGithub;
        },
        faDiscord() {
            return faDiscord;
        },
    },
};
</script>

<style>

</style>
