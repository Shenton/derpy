<template>
<div class="navbar-padding-bottom">
    <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="container">
            <div class="navbar-brand">
                <a class="navbar-item" href="/">
                    <img src="/img/alien-icon.png" width="28" height="28">
                </a>

                <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>

            <div id="navbar" class="navbar-menu">
                <div class="navbar-start">
                    <nuxt-link class="navbar-item" to="/">Accueil</nuxt-link>
                    <div v-if="$store.state.auth.hasAccess" class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">Modules</a>
                        <div class="navbar-dropdown">
                            <nuxt-link class="navbar-item" to="/module/response">Response</nuxt-link>
                            <!--<hr class="navbar-divider">-->
                        </div>
                    </div>
                    <div v-if="$store.state.auth.isOwner" class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link">Administration</a>
                        <div class="navbar-dropdown">
                            <nuxt-link class="navbar-item" to="/module/response">Membres</nuxt-link>
                            <!--<hr class="navbar-divider">-->
                        </div>
                    </div>
                </div>
                <div class="navbar-end">
                    <div class="navbar-item">
                        <div v-if="$store.state.auth.isAuth" class="dropdown is-right">
                            <div class="dropdown-trigger">
                                <button class="button" aria-haspopup="true" aria-controls="dropdown-menu-discord">
                                    <figure class="image is-32x32">
                                        <img class="is-rounded" :src="$store.state.auth.avatar">
                                    </figure>
                                    <span class="icon is-small">
                                        <i class="fas fa-angle-down" aria-hidden="true"></i>
                                    </span>
                                </button>
                            </div>
                            <div class="dropdown-menu" id="dropdown-menu-discord" role="menu">
                                <div class="dropdown-content">
                                    <div class="dropdown-item">
                                        <p><strong><span class="has-text-info">{{ $store.state.auth.name }}</span></strong><span class="has-text-grey">#{{ $store.state.auth.discriminator }}</span></p>
                                    </div>
                                    <hr class="dropdown-divider">
                                    <div class="dropdown-item">
                                        <a href="/api/auth/logout" class="dropdown-item">Déconnexion</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="buttons">
                            <a href="/api/auth/login" class="button is-light">Connexion</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</div>
</template>

<script>
export default {
}
</script>

<style>
.navbar-padding-bottom {
    padding-bottom: 20px;
}
.navbar {
    border-radius: 0 !important;
}
</style>