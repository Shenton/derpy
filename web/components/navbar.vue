<template>
<b-navbar :sticky="true" toggleable="lg" type="dark" variant="primary">
    <b-container>
        <b-navbar-toggle target="nav-collapse" />

        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-brand to="/">
                <b-img width="32" height="32" src="/img/alien-icon.png" alt="logo" />&nbsp;Derpy
            </b-navbar-brand>

            <b-navbar-nav>
                <b-nav-item-dropdown v-if="$store.state.auth.hasAccess" text="Modules">
                    <b-dropdown-item to="/modules/activity">Activity</b-dropdown-item>
                    <b-dropdown-item to="/modules/mp3">mp3</b-dropdown-item>
                    <b-dropdown-item to="/modules/pubg">PUBG</b-dropdown-item>
                    <b-dropdown-item to="/modules/quote">Quote</b-dropdown-item>
                    <b-dropdown-item to="/modules/reddit">Reddit</b-dropdown-item>
                    <b-dropdown-item to="/modules/response">Response</b-dropdown-item>
                    <b-dropdown-item to="/modules/rss">RSS</b-dropdown-item>
                </b-nav-item-dropdown>
                <b-nav-item-dropdown v-if="$store.state.auth.isOwner" text="Administration">
                    <b-dropdown-item to="/administration/commands">Commandes</b-dropdown-item>
                    <b-dropdown-item to="/administration">Configuration</b-dropdown-item>
                    <b-dropdown-item to="/administration/logs">Journaux</b-dropdown-item>
                    <b-dropdown-item to="/administration/members">Membres</b-dropdown-item>
                    <b-dropdown-item to="/administration/modules">Modules</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
        </b-collapse>

        <b-dropdown v-if="$store.state.auth.isAuth" variant="primary" right>
            <template slot="button-content">
                <img rounded="circle" width="32" :src="$store.state.auth.avatar" alt="avatar">
            </template>
            <b-dropdown-text>
                <strong><span class="text-primary">{{ $store.state.auth.name }}</span></strong><span class="text-secondary">#{{ $store.state.auth.discriminator }}</span>
            </b-dropdown-text>
            <b-dropdown-divider />
            <b-dropdown-item href="/api/auth/logout">Déconnexion</b-dropdown-item>
        </b-dropdown>

        <b-button v-else v-b-popover.hover.bottom="'Connexion avec Discord'" variant="secondary" href="/api/auth/login">
            Connexion&nbsp;&nbsp;<i class="fab fa-discord" />
        </b-button>
    </b-container>
</b-navbar>
</template>
