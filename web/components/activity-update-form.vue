<template>
<div class=" p-3">
    <b-form @submit="submitUpdate">
        <b-form-group>
            <b-form-input v-model="activity" required />
        </b-form-group>
        <b-form-group>
            <b-button type="submit" variant="primary">Modifier</b-button>
            <b-button v-if="$store.state.auth.isOwner" class="float-right" variant="danger" @click="submitDelete">Supprimer</b-button>
        </b-form-group>
    </b-form>
</div>
</template>

<script>
export default {
    name: 'activity-update-form',
    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            activityID: '',
            trigger: '',
            activity: '',
            type: '',
        };
    },
    mounted() {
        this.activityID = this.data._id;
        this.activity = this.data.activity;
    },
    methods: {
        submitUpdate(event) {
            event.preventDefault();
            this.$emit('submitUpdate', this.activityID, { activity: this.activity });
        },
        submitDelete() {
            this.$emit('submitDelete', this.activityID);
        },
    },
};
</script>
