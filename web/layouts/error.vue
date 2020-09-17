<template>
<b-container class="pt-5 pb-5 text-center align-middle">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="90"
        height="90"
        fill="#DBE1EC"
        viewBox="0 0 48 48"
    >
        <path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z" />
    </svg>

    <h3>{{ message }}</h3>
    <p v-if="statusCode === 404">
        <NuxtLink to="/">{{ messages.back_to_home }}</NuxtLink>
    </p>
    <p v-else-if="statusCode === 500">
        {{ messages.server_error }}
    </p>
    <p v-else-if="debug">
        {{ messages.client_error_details }}
    </p>
</b-container>
</template>

<script>
export default {
    name: 'nuxt-error',
    props: {
        error: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            debug: process.env.NODE_ENV === 'development' ? true : false,
            messages: {
                error_404: 'Page non trouvée',
                server_error: 'Erreur serveur',
                back_to_home: 'Retour à l\'accueil',
                server_error_details: 'Une erreur a eu lieu et ta page ne peut pas être affichée. Si tu es le propriétaire, vérifies tes logs pour plus d\'information',
                client_error: 'Erreur',
                client_error_details: 'Une erreur a eu lieu pendant le rendu de la page. Utilise la console des outils de développeur pour plus d\'information',
            },
        };
    },
    computed: {
        statusCode() {
            return (this.error && this.error.statusCode) || 500;
        },
        message() {
            return this.error.message || this.messages.client_error;
        },
    },
    head() {
        return {
            title: this.message,
        };
    },
};
</script>
