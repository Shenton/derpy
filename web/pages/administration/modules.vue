<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Administration: Modules"
        lead="Configuration générique des modules."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container class="pb-5">
        <b-table
            hover
            head-variant="light"
            :current-page="currentPage"
            :per-page="perPage"
            :items="modulesData"
            :fields="fields"
        >
            <template v-slot:cell(enabledCheckBox)="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item.name, row.item.enabled)" />
                </b-form>
            </template>
        </b-table>
        <b-row>
            <b-col>
                <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
            </b-col>
            <b-col>
                <b-form-group label-cols-sm="3" label="Nombre par page" class="mb-0">
                    <b-form-select v-model="perPage" :options="pageOptions" />
                </b-form-group>
            </b-col>
        </b-row>
        <hr class="border-primary">
        <p>Pour activer/désactiver les modules il faut redémarrer Derpy.</p>
        <b-button block :variant="restartVariant" @click="restartDerpy()">
            <b-spinner v-if="restarting" small />
            <span v-else>Redémarrer Derpy</span>
        </b-button>
    </b-container>
    <moduleConfiguration v-for="mod in modulesData" :key="mod.key" :data="mod" @submitUpdate="submitUpdate" />
</div>
</template>

<script>
import moduleConfiguration from '../../components/module-configuration';
import { setTimeout } from 'timers';

export default {
    name: 'administration-modules',
    components: {
        moduleConfiguration,
    },
    fetch({ store, redirect }) {
        if (!store.state.auth.isAuth) return redirect('/');
        if (!store.state.auth.hasAccess) return redirect('/');
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('modules');
            const modules = data.map(items => ({ ...items, key: `${items._id}/${items.revision}` }));
            return { modulesData: modules };
        }
        catch(err) {
            //
        }
    },
    data() {
        return {
            title: 'Administration: Modules',
            modulesData: [],
            fields: [
                {
                    key: 'name',
                    label: 'Module',
                    sortable: true,
                    thStyle: {
                        width: '80%',
                    },
                },
                {
                    key: 'enabledCheckBox',
                    label: 'Activé',
                    sortable: true,
                    thStyle: {
                        width: '20%',
                    },
                },
            ],
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [5, 10, 15],
            restarting: false,
            restartVariant: 'primary',
        };
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.$store.dispatch('botinfo/getInfo');
        this.totalRows = this.modulesData.length;
    },
    methods: {
        async submitUpdate(name, doc) {
            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: doc,
                    url: 'modules/' + name,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Module modifié');

                    try {
                        const data = await this.$axios.$get('modules');
                        const modules = data.map(items => ({ ...items, key: `${items._id}/${items.revision}` }));
                        this.modulesData = modules;
                        this.totalRows = this.modulesData.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.$axiosPostErrorHandler(err, 'Module non trouvé', 'Ce module existe déjà', 'Erreur avec l\'édition du module');
            }
        },
        toggleEnabled(name, enabled) {
            if (enabled) this.submitUpdate(name, { enabled: true });
            else this.submitUpdate(name, { enabled: false });
        },
        async restartDerpy() {
            try {
                this.restarting = true;
                await this.$axios.$get('system/restart');
                this.restarting = false;
                this.restartVariant = 'success';
                setTimeout(() => this.restartVariant = 'primary', 3000);
            }
            catch(err) {
                this.restarting = false;
                this.restartVariant = 'danger';
                setTimeout(() => this.restartVariant = 'primary', 3000);
            }
        },
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
};
</script>
