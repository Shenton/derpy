<template>
<div>
    <b-jumbotron
        fluid bg-variant="dark"
        text-variant="light"
        class="mt-3 mb-3 pt-4 pb-4"
        header="Administration: Membres"
        lead="L'administration des membres."
    ></b-jumbotron>
    <b-container>
        <b-breadcrumb :items="$store.state.breadcrumbs.crumbs"></b-breadcrumb>
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
            <template slot="fullName" slot-scope="row">
                {{ row.item.username }}<span class="text-primary">#{{ row.item.discriminator }}</span>{{ row.item.isOwner ? '  (Owner)' : '' }}
            </template>
            <template slot="accessCheckBox" slot-scope="row">
                <b-form>
                    <b-form-checkbox v-model="row.item.hasAccess" name="check-button" switch @change="toggleAccess(row.item._id, row.item.hasAccess)"></b-form-checkbox>
                </b-form>
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
    </b-container>
</div>
</template>

<script>
export default {
    name: 'Membres',
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
            title: 'Administration: Membres',
            members: [],
            fields: [
                {
                    key: 'fullName',
                    label: 'Membre',
                    sortable: true,
                    thStyle: {
                        width: '80%'
                    }
                },
                {
                    key: 'accessCheckBox',
                    label: 'Accès',
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
        };
    },
    async asyncData({ $axios }) {
        try {
            const data = await $axios.$get('members');
            const members = data.map(items => ({ ...items, key: `${items._id}/${items.revision}` }));
            return { members: members };
        }
        catch(err) {}
        
    },
    mounted() {
        this.$store.dispatch('breadcrumbs/setCrumbs', this.$route.path);
        this.totalRows = this.members.length;
    },
    methods: {
        async submitUpdate(id, data) {
            try {
                const res = await this.$axios({
                    method: 'patch',
                    data: data,
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
            this.$axiosPostErrorHandler(err, 'Activité non trouvée', 'Cette activité existe déjà', methodMessage);
        },
        toggleAccess(id, access) {
            if (access) this.submitUpdate(id, { hasAccess: false });
            else this.submitUpdate(id, { hasAccess: true });
        },
    },
};
</script>
