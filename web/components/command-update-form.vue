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
                <b-tab title="Alias">
                    <h5>
                        <b-badge class="mr-1" variant="primary" v-for="alias in form.aliases" v-bind:key="alias">
                            {{ alias }}&nbsp;&nbsp;<i class="far fa-trash-alt" @click="removeAlias(alias)"></i>
                        </b-badge>
                    </h5>
                    <b-form-group label="Nouvel alias">
                        <b-form-input v-model="newAlias" :state="addAliasValidation"></b-form-input>
                        <b-form-invalid-feedback :state="addAliasValidation">
                            Ce nom de commande existe déjà, ou le nom est invalide. Il doit être entre 2 et 8 charactères et ne peut contenir que des minuscules et des chiffres.
                        </b-form-invalid-feedback>
                    </b-form-group>
                    <b-form-group>
                        <b-button variant="primary" @click="addAlias()">Ajouter</b-button>
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
    props: [
        'data',
        'commandsAndAliases',
    ],
    data() {
        return {
            commandID: null,
            allowedChannels: [],
            roles: [],
            form: {
                allowedChannels: [],
                allowedRoles: [],
                aliases: [],
                cooldown: 0,
            },
            textOptions: [],
            rolesOptions: [],
            newAlias: null,
        };
    },
    mounted() {
        this.textOptions = this.$store.state.botinfo.info.textOptions;
        this.rolesOptions = this.$store.state.botinfo.info.rolesOptions;
        this.commandID = this.data._id;
        this.setDefaultValues();
        console.log(this.commandsAndAliases)
    },
    methods: {
        setDefaultValues() {
            this.form.allowedChannels = this.data.allowedChannels;
            this.form.allowedRoles = this.data.allowedRoles;
            this.form.aliases = this.data.aliases.slice(0);
            this.form.cooldown = this.data.cooldown;
        },
        submitUpdate(event) {
            event.preventDefault();
            this.$emit('submitUpdate', this.commandID, {
                allowedChannels: this.form.allowedChannels,
                allowedRoles: this.form.allowedRoles,
                aliases: this.form.aliases,
                cooldown: this.form.cooldown,
            });
        },
        addAlias() {
            const alias = this.newAlias;
            this.newAlias = null;

            if (!alias) return;
            if (alias === '') return;

            this.form.aliases.push(alias);
        },
        removeAlias(alias) {
            this.form.aliases = this.form.aliases.filter(element => {
                return element !== alias;
            });
        },
    },
    computed: {
        addAliasValidation() {
            const alias = this.newAlias;

            if (!alias) return null;
            if (this.commandsAndAliases.includes(alias)) return false;
            return this.$validator.alias(alias);
        },
    },
}
</script>
