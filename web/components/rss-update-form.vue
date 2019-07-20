<template>
<div class=" p-3">
    <b-form @submit="submitUpdate">
        <b-form-group>
            <b-form-input v-model="name" placeholder="Le nom du flux" required />
        </b-form-group>
        <b-form-group>
            <b-form-input v-model="feed" placeholder="L'addresse du flux" required />
        </b-form-group>
        <b-form-group>
            <b-form-input v-model="nameURL" placeholder="L'addresse du site" required />
        </b-form-group>
        <b-form-group>
            <b-form-input v-model="description" placeholder="La description/slogan du site" />
        </b-form-group>
        <b-row>
            <b-col>
                <b-form-select v-model="logo" :options="logos" />
            </b-col>
            <b-col>
                <b-button type="submit" variant="primary">
                    Modifier
                </b-button>
                <b-button v-if="$store.state.auth.isOwner" class="float-right" variant="danger" @click="submitDelete">
                    Supprimer
                </b-button>
            </b-col>
        </b-row>
    </b-form>
</div>
</template>

<script>
export default {
    name: 'rss-update-form',
    props: {
        data: {
            type: Object,
            required: true,
        },
        logos: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            rssID: null,
            name: null,
            feed: null,
            nameURL: null,
            logo: null,
            description: null,
            logoSelectOptions: null,
        };
    },
    mounted() {
        this.rssID = this.data._id;
        this.name = this.data.name;
        this.feed = this.data.feed;
        this.nameURL = this.data.nameURL;
        this.logo = this.data.logo;
        this.description = this.data.description;
    },
    methods: {
        submitUpdate(event) {
            event.preventDefault();
            this.$emit('submitUpdate', this.rssID, {
                name: this.name,
                feed: this.feed,
                nameURL: this.nameURL,
                logo: this.logo,
                description: this.description,
            });
        },
        submitDelete() {
            this.$emit('submitDelete', this.rssID);
        },
    },
};
</script>
