<script>
import { HorizontalBar } from 'vue-chartjs';

export default {
    name: 'c-horizontal-bar',
    extends: HorizontalBar,
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
