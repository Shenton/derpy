<template>
<div>
    <b-jumbotron
        fluid
        bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Administration: Membres"
        lead="L'administration des membres."
    />
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs" />
    </b-container>
    <b-container v-if="members.length" class="pb-5">
        <b-table
            hover
            head-variant="light"
            :current-page="currentPage"
            :per-page="perPage"
            :items="members"
            :fields="fields"
        >
            <template v-slot:cell(fullName)="row">
                {{ row.item.username }}<span class="text-primary">#{{ row.item.discriminator }}</span>{{ row.item.isOwner ? '  (Owner)' : '' }}
            </template>
            <template v-slot:cell(accessCheckBox)="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.hasAccess" name="check-button" switch @change="toggleAccess(row.item._id, row.item.hasAccess)" />
                </b-form>
            </template>
            <template v-slot:cell(statsAccessCheckBox)="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.statsAccess" name="check-button" switch @change="toggleStatsAccess(row.item._id, row.item.statsAccess)" />
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
    </b-container>
</div>
</template>

<script>
export default {
    name: 'administration-members',
    head() {
        return {
            titleTemplate: '%s - ' + this.title,
        };
    },
    data() {
        return {
            title: 'Administration: Membres',
            members: [],
            fields: [
                {
                    key: 'fullName',
                    label: 'Membre',
                    sortable: true,
                    thStyle: {
                        width: '60%',
                    },
                },
                {
                    key: 'accessCheckBox',
                    label: 'Accès',
                    sortable: true,
                    thStyle: {
                        width: '20%',
                    },
                },
                {
                    key: 'statsAccessCheckBox',
                    label: 'Accès stats',
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
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('members');
            const members = data.map(items => ({ ...items, key: `${items._id}/${items.revision}` }));
            return { members: members };
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
        this.totalRows = this.members.length;
    },
    methods: {
        async submitUpdate(id, doc) {
            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: doc,
                    url: 'members/' + id,
                });

                if (res.data.modifed === 0) {
                    this.$toast.warning('Aucune modification');
                }
                else {
                    this.$toast.success('Membre modifié');

                    try {
                        const data = await this.$axios.$get('members');
                        this.members = data.map(items => ({ ...items, key: `${items._id}/${items.revision}` }));
                        this.totalRows = this.members.length;
                    }
                    catch(err) {
                        this.$axiosGetErrorHandler(err);
                    }
                }
            }
            catch(err) {
                this.axiosPostError(err, 'Erreur avec l\'édition du membre');
            }
        },
        axiosPostError(err, methodMessage) {
            this.$axiosPostErrorHandler(err, 'Membre non trouvée', 'Ce membre existe déjà', methodMessage);
        },
        toggleAccess(id, access) {
            if (access) this.submitUpdate(id, { hasAccess: false });
            else this.submitUpdate(id, { hasAccess: true });
        },
        toggleStatsAccess(id, access) {
            if (access) this.submitUpdate(id, { statsAccess: false });
            else this.submitUpdate(id, { statsAccess: true });
        },
    },
};
</script>
