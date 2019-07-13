<template>
<div class=" p-3">
    <b-form @submit="submitUpdate">
        <b-card class="mb-3" no-body>
            <b-tabs content-class="mt-3" fill card>
                <b-tab title="Canaux">
                    <b-form-group label="Sélectionne sur quels canaux textuels la commande peut être exécutée">
                        <b-form-checkbox-group
                            v-model="form.allowedChannels"
                            :options="textOptions"
                            switches
                            stacked
                        ></b-form-checkbox-group>
                    </b-form-group>
                </b-tab>
                <b-tab title="Roles">
                    <b-form-group label="Sélectionne quels roles peuvent exécuter la commande">
                        <b-form-checkbox-group
                            v-model="form.allowedRoles"
                            :options="rolesOptions"
                            switches
                            stacked
                        ></b-form-checkbox-group>
                    </b-form-group>
                </b-tab>
            </b-tabs>
        </b-card>
        <b-row>
            <b-col><b-button type="submit" block variant="primary">Appliquer les modifications</b-button></b-col>
            <b-col><b-button @click="setDefaultValues()" block variant="secondary">Annuler les modifications</b-button></b-col>
        </b-row>
    </b-form>
</div>
</template>

<script>
export default {
    name: 'command-update-form',
    props: ['data'],
    data() {
        return {
            commandID: null,
            allowedChannels: [],
            roles: [],
            form: {
                allowedChannels: [],
                allowedRoles: [],
            },
            textOptions: [],
            rolesOptions: [],
        };
    },
    mounted() {
        this.textOptions = this.$store.state.botinfo.info.textOptions;
        this.rolesOptions = this.$store.state.botinfo.info.rolesOptions;
        this.commandID = this.data._id;
        this.allowedChannels = this.data.allowedChannels;
        this.allowedRoles = this.data.allowedRoles;
        this.setDefaultValues();
    },
    methods: {
        setDefaultValues() {
            this.form.allowedChannels = this.data.allowedChannels;
            this.form.allowedRoles = this.data.allowedRoles;
        },
        submitUpdate(event) {
            event.preventDefault();
            this.$emit('submitUpdate', this.commandID, { allowedChannels: this.form.allowedChannels, allowedRoles: this.form.allowedRoles });
        },
    },
}
</script>
