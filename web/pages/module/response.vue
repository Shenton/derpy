<template>
<section>
    <div class="hero is-light">
        <div class="hero-body">
            <div class="container">
                <h1 class="title">Module: Response</h1>
                <h2 class="subtitle">Défini un déclencheur, le bot répondra avec la réponse.</h2>
            </div>
        </div>
    </div>
    <section  class="section">
        <div class="container">
            <div class="box">
                <form>
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" placeholder="Le déclencheur" v-model="trigger">
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" placeholder="La réponse" v-model="response">
                        </div>
                    </div>
                    <div class="field is-grouped">
                        <div class="control">
                            <div class="select">
                                <select ref="form-type">
                                    <option value="exact">Exact</option>
                                    <option value="contain">Contient</option>
                                </select>
                            </div>
                        </div>
                        <div class="control">
                            <button type="submit" @submit.prevent="submitForm" class="button is-link">Ajouter</button>
                        </div>
                        <div class="control">
                            <button class="button is-text">Annuler</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </section>
</section>
</template>

<script>
export default {
    data() {
        return {
            title: 'Module: Response',
            trigger: '',
            response: '',
        };
    },
    head () {
        return {
            titleTemplate: '%s - ' + this.title,
        }
    },
    fetch ({ store, redirect }) {
        if (!store.state.auth.isAuth) {
            return redirect('/')
        }
    },
    methods: {
        submitForm() {
            this.$axios({
                method: 'post',
                data: { trigger: this.trigger, response: this.response },
                url: '/response',
            })
                // refresh page.then()
        }
    }
};
</script>

<style>

</style>
