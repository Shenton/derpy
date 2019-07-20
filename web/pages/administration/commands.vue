<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Administration: Commandes"
        lead="Configure les commandes de Derpy."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container v-if="commands.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            selectable
            select-mode="single"
            selectedVariant="primary"
            :current-page="currentPage"
            :per-page="perPage"
            :items="commands"
            :fields="fields"
            @row-selected="rowSelected"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)" />
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <CommandUpdateForm :data="row.item" :commandsAndAliases="commandsAndAliases" @submitUpdate="submitUpdate" />
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
        <p>Pour que les modifications soit prisent en compte, il faut redémarrer Derpy.</p>
        <b-button block :variant="restartVariant" @click="restartDerpy()">
            <b-spinner v-if="restarting" small />
            <span v-else>Redémarrer Derpy</span>
        </b-button>
    </b-container>
</div>
</template>

<script>
import CommandUpdateForm from '../../components/command-update-form';

export default {
    name: 'administration-commands',
    components: {
        CommandUpdateForm,
    },
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
    data() {
        return {
            title: 'Administration: Commandes',
            commands: [],
            commandsAndAliases: [],
            fields: [
                {
                    key: 'name',
                    label: 'Commande',
                    sortable: true,
                    thStyle: {
                        width: '80%',
                    },
                },
                {
                    key: 'enabledCheckBox',
                    label: 'Activée',
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
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('commands');
            const commands = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { commands: commands };
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
        this.totalRows = this.commands.length;
        this.setCommandsAndAliases();
    },
    methods: {
        async submitUpdate(id, doc) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: doc,
                    url: 'commands/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Commande modifiée');

                    try {
                        const data = await this.$axios.$get('commands');
                        this.commands = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.commands.length;
                        this.setCommandsAndAliases();
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition de la commande');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Commande non trouvée', 'Cette commande existe déjà', methodMessage);
        },
        toggleEnabled(id, enabled) {
            if (enabled) this.submitUpdate(id, { enabled: false });
            else this.submitUpdate(id, { enabled: true });
        },
        rowSelected(row) {
            this.hideRowDetails();
            if (!row.length) return;
            const items = row[0];
            items._showDetails = !items._showDetails;
        },
        hideRowDetails() {
            this.commands.map(items => items._showDetails = false);
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
        setCommandsAndAliases() {
            this.commandsAndAliases = [];

            for (let i = 0; i < this.commands.length; i++) {
                const command = this.commands[i];

                this.commandsAndAliases.push(command.name);

                if (command.aliases && command.aliases.length) {
                    command.aliases.forEach(alias => {
                        this.commandsAndAliases.push(alias);
                    });
                }
            }
        },
    },
};
</script>
