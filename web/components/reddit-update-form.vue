<template>
<div class=" p-3">
    <b-form @submit="submitUpdate">
        <b-form-group>
            <b-form-input v-model="name" placeholder="Le subreddit" required></b-form-input>
        </b-form-group>
        <b-form-group>
            <b-row>
                <b-col>
                    <b-form-select v-model="listing" :options="listings"></b-form-select>
                </b-col>
                <b-col>
                    <b-form-select v-model="limit" :options="limits"></b-form-select>
                </b-col>
            </b-row>
        </b-form-group>
        <b-form-group>
            <b-button type="submit" variant="primary">Modifier</b-button>
            <b-button v-if="$store.state.auth.isOwner" class="float-right" @click="submitDelete" variant="danger">Supprimer</b-button>
        </b-form-group>
    </b-form>
</div>
</template>

<script>
export default {
    name: 'reddit-update-form',
    props: ['data'],
    data() {
        return {
            listings: [
                { value: 'hot', text: 'Populaire' },
                { value: 'new', text: 'Nouveau' },
                { value: 'rising', text: 'En progression' },
                { value: 'controversial', text: 'Controversé' },
                { value: 'top', text: 'Le meilleur' },
                { value: 'gilded', text: 'Doré' },
            ],
            limits: [
                { value: 25, text: 'Une page' },
                { value: 50, text: 'Deux pages' },
                { value: 75, text: 'Trois pages' },
                { value: 100, text: 'Quatre pages' },
            ],
            redditID: '',
            name: '',
            listing: '',
            limit: 0,
            //type: '',
        };
    },
    mounted() {
        this.redditID = this.data._id;
        this.name = this.data.name;
        this.listing = this.data.listing;
        this.limit = this.data.limit;
        //this.type = this.data.type;
    },
    methods: {
        submitUpdate(event) {
            event.preventDefault();
            //this.$emit('submitUpdate', this.redditID, { name: this.name, listing: this.listing, limit: this.limit, type: this.type });
            this.$emit('submitUpdate', this.redditID, { name: this.name, listing: this.listing, limit: this.limit });
        },
        submitDelete() {
            this.$emit('submitDelete', this.redditID);
        },
    },
}
</script>
