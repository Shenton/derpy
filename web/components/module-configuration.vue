<template>
    <b-container v-if="data.channels > 0" class="mb-3">
        <h2>{{ name }}</h2>
        <hr class="border-primary">
        <b-form @submit="submitUpdate">
            <b-card class="mb-3" no-body>
                <b-tabs content-class="mt-3" fill card>
                    <b-tab title="Canal (texte)" :disabled="!channelTypes.textChannel">
                        <b-form-group label="Sélectionne sur quel canal textuel le module doit poster">
                            <b-form-radio-group
                                v-model="form.textChannel"
                                :options="textOptions"
                                stacked
                            ></b-form-radio-group>
                        </b-form-group>
                    </b-tab>
                    <b-tab title="Canaux (texte)" :disabled="!channelTypes.textChannels">
                        <b-form-group label="Sélectionne sur quels canaux textuels le module doit poster">
                            <b-form-checkbox-group
                                v-model="form.textChannels"
                                :options="textOptions"
                                switches
                                stacked
                            ></b-form-checkbox-group>
                        </b-form-group>
                    </b-tab>
                    <b-tab title="Canal (voix)" :disabled="!channelTypes.voiceChannel">
                        <b-form-group label="Sélectionne sur quel canal vocal le module doit poster">
                            <b-form-radio-group
                                v-model="form.voiceChannel"
                                :options="voiceOptions"
                                stacked
                            ></b-form-radio-group>
                        </b-form-group>
                    </b-tab>
                    <b-tab title="Canaux (voix)" :disabled="!channelTypes.voiceChannels">
                        <b-form-group label="Sélectionne sur quels canaux vocaux le module doit poster">
                            <b-form-checkbox-group
                                v-model="form.voiceChannels"
                                :options="voiceOptions"
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
    </b-container>
</template>

<script>
export default {
    name: 'module-configuration',
    props: ['data'],
    data() {
        return {
            name: null,
            channelTypes: {},
            form: {
                enabled : null,
                textChannel: null,
                textChannels: [],
                voiceChannel: null,
                voiceChannels: [],
            },
            textOptions: [],
            voiceOptions: [],
        };
    },
    mounted() {
        this.name = this.data.name;
        this.channelTypes = this.getChannelTypes(this.data.channels);
        this.textOptions = this.$store.state.botinfo.info.textOptions;
        this.voiceOptions = this.$store.state.botinfo.info.voiceOptions;
        this.setDefaultValues();
    },
    methods: {
        setDefaultValues() {
            this.form.enabled = this.data.enabled;
            this.form.textChannel = this.data.textChannel;
            this.form.textChannels = this.data.textChannels;
            this.form.voiceChannel = this.data.voiceChannel;
            this.form.voiceChannels = this.data.voiceChannels;
        },
        getChannelTypes(octal) {
            const out = {
                textChannel: false,
                textChannels: false,
                voiceChannel: false,
                voiceChannels: false,
            };

            if (octal >= 8) {
                out.voiceChannels = true;
                octal -= 8;
            }

            if (octal >= 4) {
                out.voiceChannel = true;
                octal -= 4;
            }

            if (octal >= 2) {
                out.textChannels = true;
                octal -= 2;
            }

            if (octal == 1) {
                out.textChannel = true;
            }

            return out;
        },
        submitUpdate(event) {
            event.preventDefault();
            this.$emit('submitUpdate', this.name, {
                enabled: this.form.enabled,
                textChannel: this.form.textChannel,
                textChannels: this.form.textChannels,
                voiceChannel: this.form.voiceChannel,
                voiceChannels: this.form.voiceChannels,
            });
        },
    }
}
</script>
