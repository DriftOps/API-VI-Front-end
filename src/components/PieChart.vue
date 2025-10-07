<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import { Chart, PieController, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(PieController, ArcElement, Tooltip, Legend);

interface Meal {
  name: string;
  calories: number;
}

export default defineComponent({
  props: {
    meals: {
      type: Array as () => Meal[],
      required: true,
    },
  },
  setup(props) {
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    let chart: Chart | null = null;

    const renderChart = () => {
      if (!chartCanvas.value) return;
      if (chart) chart.destroy();

      chart = new Chart(chartCanvas.value, {
        type: "pie",
        data: {
          labels: props.meals.map((m) => m.name),
          datasets: [
            {
              data: props.meals.map((m) => m.calories),
              backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56", "#4bc0c0", "#9966ff"],
            },
          ],
        },
      });
    };

    onMounted(renderChart);
    watch(() => props.meals, renderChart, { deep: true });

    return { chartCanvas };
  },
});
</script>
