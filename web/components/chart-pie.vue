<script>
import { Pie } from 'vue-chartjs';

export default {
    name: 'c-pie',
    extends: Pie,
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
