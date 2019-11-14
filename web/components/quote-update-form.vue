<template>
<div class=" p-3">
    <b-form @submit="submitUpdate">
        <b-form-group>
            <b-form-input v-model="name" required />
        </b-form-group>
        <b-table
            hover
            head-variant="light"
            :current-page="currentPage"
            :per-page="perPage"
            :items="quotesTable"
            :fields="fields"
        >
            <template v-slot:cell(delete)="row">
                <i class="far fa-trash-alt text-danger" @click="deleteQuote(row.item.index)" />
            </template>
        </b-table>
        <b-row>
            <b-col>
                <b-pagination v-model="currentPage" :total-rows="totalRows" :per-page="perPage" class="my-0" />
            </b-col>
            <b-col>
                <b-form-group label-cols-sm="4" label="Nombre par page" class="mb-3">
                    <b-form-select v-model="perPage" :options="pageOptions" />
                </b-form-group>
            </b-col>
        </b-row>
        <b-form-group>
            <b-form-textarea
                v-model="newQuotes"
                placeholder="Ajouter des citations, une par ligne"
                rows="3"
            />
        </b-form-group>
        <b-form-group>
            <b-button type="submit" variant="primary">
                Modifier
            </b-button>
            <b-button v-if="$store.state.auth.isOwner" class="float-right" variant="danger" @click="submitDelete">
                Supprimer
            </b-button>
        </b-form-group>
    </b-form>
</div>
</template>

<script>
export default {
    name: 'quote-update-form',
    props: {
        data: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            quoteID: null,
            name: null,
            quotes: [],
            quotesTable: [],
            fields: [
                {
                    key: 'quote',
                    label: 'Citation',
                    sortable: true,
                    thStyle: {
                        width: '90%',
                    },
                },
                {
                    key: 'delete',
                    label: 'Supprimer',
                    sortable: true,
                    thStyle: {
                        width: '10%',
                    },
                },
            ],
            totalRows: 1,
            currentPage: 1,
            perPage: 10,
            pageOptions: [5, 10, 15],
            newQuotes: null,
        };
    },
    mounted() {
        this.quoteID = this.data._id;
        this.name = this.data.name;
        this.quotes = this.data.quotes;

        for (let i = 0; i < this.quotes.length; i++) {
            const quote = this.quotes[i];
            this.quotesTable.push({ index: i, quote: quote });
        }
        this.totalRows = this.quotesTable.length;
    },
    methods: {
        deleteQuote(index) {
            this.quotes.splice(index, 1);
            this.newQuotes = null;
            this.submitUpdate();
        },
        submitUpdate(event) {
            if (event) event.preventDefault();

            const newQuotes = this.newQuotes ? this.newQuotes.split('\n') : null;
            if (newQuotes) this.quotes = this.quotes.concat(newQuotes);

            this.$emit('submitUpdate', this.quoteID, {
                name: this.name,
                quotes: this.quotes,
            });
        },
        submitDelete() {
            this.$emit('submitDelete', this.quoteID);
        },
    },
};
</script>
