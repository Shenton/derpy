<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Modules"
        lead="Configuration générique des modules."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container class="pb-5">
        <b-table
            hover
            head-variant="light"
            :items="modules"
            :fields="fields"
            :tbody-tr-class="rowClass"
        />
    </b-container>
</div>
</template>

<script>
export default {
    name: 'modules-index',
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.hasAccess) return redirect('/');
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('public/modules');
            return { modules: data };
        }
        catch(err) {
            //
        }
    },
    data() {
        return {
            title: 'Modules',
            modules: [],
            fields: [
                {
                    key: 'name',
                    label: 'Module',
                    sortable: true,
                },
            ],
        };
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
    },
    methods: {
        rowClass(item) {
            if (!item) return;
            if (item.enabled) return 'table-success';
            return 'table-danger';
        },
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
};
</script>
