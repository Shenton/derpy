<script>
import { Radar } from 'vue-chartjs';

export default {
    name: 'c-radar',
    extends: Radar,
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
