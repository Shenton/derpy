<template>
<div class=" p-3">
    <b-form @submit="submitUpdate">
        <b-form-group>
            <b-form-input v-model="trigger" required />
        </b-form-group>
        <b-form-group>
            <b-form-input v-model="response" required />
        </b-form-group>
        <b-form-group>
            <b-row>
                <b-col>
                    <b-form-select v-model="type" :options="options" />
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
        </b-form-group>
    </b-form>
</div>
</template>

<script>
export default {
    name: 'response-update-form',
    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            options: [
                { value: 'exact', text: 'Exact' },
                { value: 'contain', text: 'Contient' },
            ],
            responseID: '',
            trigger: '',
            response: '',
            type: '',
        };
    },
    mounted() {
        this.responseID = this.data._id;
        this.trigger = this.data.trigger;
        this.response = this.data.response;
        this.type = this.data.type;
    },
    methods: {
        submitUpdate(event) {
            event.preventDefault();
            this.$emit('submitUpdate', this.responseID, { trigger: this.trigger, response: this.response, type: this.type });
        },
        submitDelete() {
            this.$emit('submitDelete', this.responseID);
        },
    },
};
</script>
