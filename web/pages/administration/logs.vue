<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Administration: Logs"
        lead="Affiche les logs des différentes applications."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
    </b-container>
    <b-container>
        <b-form-group>
            <b-form-select v-model="selected" :options="options" @change="getLogs()"></b-form-select>
        </b-form-group>
        <b-table
            hover
            head-variant="light"
            :items="logs"
            :fields="fields"
            :tbody-tr-class="rowClass"
            sort-by="timestamp"
            :sort-desc="true"
        ></b-table>
    </b-container>
</div>
</template>

<script>
import moment from 'moment';

export default {
    name: 'Logs',
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.isOwner) return redirect('/');
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        }
    },
    data() {
        return {
            title: 'Administration: Logs',
            logs: [],
            selected: 'bot',
            options: [
                { value: 'bot', text: 'Bot' },
                { value: 'db', text: 'Database' },
                { value: 'web', text: 'Front end' },
                { value: 'webaccess', text: 'Front end access' },
            ],
            fields: [
                {
                    key: 'timestamp',
                    label: 'Date',
                    sortable: true,
                    thStyle: {
                        width: '30%'
                    },
                    formatter: value => {
                        return moment(value).format('DD/MM/YYYY HH:mm:ss.SSS');
                    },
                },
                {
                    key: 'message',
                    label: 'Message',
                    sortable: true,
                    thStyle: {
                        width: '70%'
                    }
                },
            ],
        }
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('logs/bot');
            //const commands = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { logs: data };
        }
        catch(err) {}
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
    },
    methods: {
        async getLogs() {
            try {
                const data = await this.$axios.$get('logs/' + this.selected);
                //const commands = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                this.logs = data;
            }
            catch(err) {}
        },
        rowClass(item) {
            if (!item) return;
            if (item.level === 'info') return 'table-info';
            else if (item.level === 'error') return 'table-danger';
            else if (item.level === 'warn') return 'table-warning';
        },
    },
}
</script>

<style>

</style>
