<template>
<div class=" p-3">
    <b-form @submit="submitUpdate">
        <b-form-group>
            <b-form-input v-model="player" required></b-form-input>
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
    name: 'player-update-form',
    props: ['data'],
    data() {
        return {
            playerID: '',
            trigger: '',
            player: '',
            type: '',
        };
    },
    mounted() {
        this.playerID = this.data._id;
        this.player = this.data.player;
    },
    methods: {
        submitUpdate(event) {
            event.preventDefault();
            this.$emit('submitPlayerUpdate', this.playerID, { player: this.player });
        },
        submitDelete() {
            this.$emit('submitPlayerDelete', this.playerID);
        },
    },
}
</script>
