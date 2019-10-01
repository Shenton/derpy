<script>
import { Bar } from 'vue-chartjs';

export default {
    name: 'c-bar',
    extends: Bar,
    props: {
        data: {
            type: Object,
            required: true,
        },
        options:{
            type: Object,
            default: () => {
                return {};
            },
        },
    },
    mounted() {
        this.renderChart(this.data, this.options);
    },
};
</script>
