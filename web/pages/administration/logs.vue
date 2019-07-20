<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Administration: Logs"
        lead="Affiche les logs des différentes applications."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container>
        <b-form-group>
            <b-form-select v-model="category" :options="options" @change="getLogs()" />
        </b-form-group>
        <b-form-group>
            <b-form-checkbox-group
                v-model="levels"
                :options="levelsOptions"
                switches
                @change="triggerFilter()"
            />
        </b-form-group>
        <b-table
            hover
            head-variant="light"
            :items="logs"
            :fields="fields"
            :tbody-tr-class="rowClass"
            sort-by="timestamp"
            :sort-desc="true"
            :filter="filter"
            :filter-function="filterFunc"
        />
    </b-container>
</div>
</template>

<script>
import moment from 'moment';

export default {
    name: 'administration-logs',
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
    data() {
        return {
            title: 'Administration: Logs',
            logs: [],
            category: 'bot',
            page: 1,
            options: [
                { value: 'bot', text: 'Bot' },
                { value: 'db', text: 'Database' },
                { value: 'web', text: 'Front end' },
                { value: 'webaccess', text: 'Front end access' },
            ],
            filter: 1,
            levels: ['info', 'warn', 'error', 'debug'],
            levelsOptions: [
                { text: 'Information', value: 'info' },
                { text: 'Warning', value: 'warn' },
                { text: 'Erreur', value: 'error' },
                { text: 'Debug', value: 'debug' },
            ],
            fields: [
                {
                    key: 'timestamp',
                    label: 'Date',
                    sortable: true,
                    thStyle: {
                        width: '30%',
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
                        width: '70%',
                    },
                },
            ],
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('logs/bot');
            //const commands = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { logs: data };
        }
        catch(err) {
            //
        }
    },
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.isOwner) return redirect('/');
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
    },
    created() {
        if (process.browser) window.addEventListener('scroll', this.handleScroll);
    },
    destroyed() {
        if (process.browser) window.removeEventListener('scroll', this.handleScroll);
    },
    methods: {
        async getLogs() {
            try {
                const data = await this.$axios.$get(`logs/${this.category}`);
                this.page = 1;
                this.logs = data;
            }
            catch(err) {
                //
            }
        },
        async getMoreLogs() {
            try {
                const data = await this.$axios.$get(`logs/${this.category}/${this.page}`);
                this.logs = this.logs.concat(data);
            }
            catch(err) {
                //
            }
        },
        handleScroll() {
            if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
                this.page++;
                this.getMoreLogs();
            }
        },
        rowClass(item) {
            if (!item) return;
            if (item.level === 'info') return 'table-info';
            else if (item.level === 'error') return 'table-danger';
            else if (item.level === 'warn') return 'table-warning';
            else if (item.level === 'debug') return 'table-debug';
        },
        filterFunc(item) {
            const level = item.level;

            if (!level) return true;

            return this.levels.includes(level);
        },
        triggerFilter() {
            let f = this.filter;
            f++;
            this.filter = f;
        },
    },
};
</script>
