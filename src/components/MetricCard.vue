<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "../stores/dashboard";
import { useTransition } from "@vueuse/core";
import type { NumericMetric } from "../types/metrics";

const props = defineProps<{
  store: ReturnType<typeof useDashboardStore>;
}>();

// Compute latest stats
const stats = computed(() => {
  const metrics = props.store.filteredMetrics.value;

  if (metrics.length === 0) return [];

  const categories = ["cpu", "memory", "stock", "network"];

  return categories
    .map((cat) => {
      const catMetrics = metrics.filter((m) => m.category === cat);
      if (catMetrics.length === 0) return null;

      const latest = catMetrics[catMetrics.length - 1];
      const values = catMetrics.map((m) => m.value);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      return { category: cat, latest, avg, min, max };
    })
    .filter(Boolean);
});

// Animated number display
function useAnimatedNumber(value: number) {
  return useTransition(value, { duration: 300 });
}

function formatValue(value: number, unit: string) {
  return `${value.toFixed(1)} ${unit}`;
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div
      v-for="stat in stats"
      :key="stat.category"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div class="flex items-start justify-between mb-3">
        <h3
          class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase"
        >
          {{ stat.category }}
        </h3>
        <span
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
          :class="{
            'bg-blue-100 text-blue-800': stat.category === 'cpu',
            'bg-green-100 text-green-800': stat.category === 'memory',
            'bg-purple-100 text-purple-800': stat.category === 'stock',
            'bg-orange-100 text-orange-800': stat.category === 'network',
          }"
        >
          Live
        </span>
      </div>

      <div class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ Math.round(useAnimatedNumber(stat.latest.value)) }}
        <span class="text-lg font-normal text-gray-500">{{
          stat.latest.unit
        }}</span>
      </div>

      <div class="grid grid-cols-3 gap-2 text-xs">
        <div class="text-center">
          <div class="text-gray-500 dark:text-gray-400">Avg</div>
          <div class="font-medium text-gray-700 dark:text-gray-300">
            {{ Math.round(stat.avg) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-gray-500 dark:text-gray-400">Min</div>
          <div class="font-medium text-gray-700 dark:text-gray-300">
            {{ Math.round(stat.min) }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-gray-500 dark:text-gray-400">Max</div>
          <div class="font-medium text-gray-700 dark:text-gray-300">
            {{ Math.round(stat.max) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
