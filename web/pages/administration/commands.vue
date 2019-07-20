<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Administration: Commandes"
        lead="Configure les commandes de Derpy."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
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
            @row-selected="rowSelected"
            :items="commands"
            :fields="fields"
        >
            <template slot="enabledCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.enabled" name="check-button" switch @change="toggleEnabled(row.item._id, row.item.enabled)"></b-form-checkbox>
                </b-form>
            </template>
            <template slot="row-details" slot-scope="row">
                <CommandUpdateForm @submitUpdate="submitUpdate" :data="row.item" :commandsAndAliases="commandsAndAliases"/>
            </template>
        </b-table>
        <b-row>
            <b-col>
                <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0"></b-pagination>
            </b-col>
            <b-col>
                <b-form-group label-cols-sm="3" label="Nombre par page" class="mb-0">
                    <b-form-select v-model="perPage" :options="pageOptions"></b-form-select>
                </b-form-group>
            </b-col>
        </b-row>
        <hr class="border-primary">
        <p>Pour que les modifications soit prisent en compte, il faut redémarrer Derpy.</p>
        <b-button @click="restartDerpy()" block :variant="restartVariant">
            <b-spinner v-if="restarting" small></b-spinner>
            <span v-else>Redémarrer Derpy</span>
        </b-button>
    </b-container>
</div>
</template>

<script>
import CommandUpdateForm from '../../components/command-update-form';

export default {
    name: 'Commandes',
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
            title: 'Administration: Commandes',
            commands: [],
            commandsAndAliases: [],
            fields: [
                {
                    key: 'name',
                    label: 'Commande',
                    sortable: true,
                    thStyle: {
                        width: '80%'
                    }
                },
                {
                    key: 'enabledCheckBox',
                    label: 'Activée',
                    sortable: true,
                    thStyle: {
                        width: '20%'
                    }
                },
            ],
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [5, 10, 15],
            restarting: false,
            restartVariant: 'primary',
        }
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('commands');
            const commands = data.map(items => ({ ...items, _showDetails: false, key: `${items._id}/${items.revision}` }));
            return { commands: commands };
        }
        catch(err) {}
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.commands.length;
        this.setCommandsAndAliases();
    },
    methods: {
        async submitUpdate(id, data) {
            this.hideRowDetails();

            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: data,
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
                const res = await this.$axios.$get('system/restart');
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
    components: {
        CommandUpdateForm,
    },
}
</script>
