<script setup lang="ts">
import { computed } from "vue";
import { useDashboardStore } from "../stores/dashboard";

const props = defineProps<{
  stream: any;
  store: ReturnType<typeof useDashboardStore>;
}>();

const timeRanges = [
  { label: "1m", value: 60 * 1000 },
  { label: "5m", value: 5 * 60 * 1000 },
  { label: "15m", value: 15 * 60 * 1000 },
  { label: "1h", value: 60 * 60 * 1000 },
  { label: "Real-time", value: -1 }, // Special value for no limit
];

const categories = ["cpu", "memory", "stock", "network"];

const isActive = (category: string) =>
  props.store.activeMetricIds.has(category);
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
    <div class="flex flex-wrap gap-4 items-center justify-between">
      <!-- Time range selector -->
      <div class="flex gap-2">
        <button
          v-for="range in timeRanges"
          :key="range.label"
          @click="
            range.value === -1
              ? store.setTimeRange(Infinity)
              : store.setTimeRange(range.value)
          "
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            (range.value === -1 && store.timeRange === Infinity) ||
            range.value === store.timeRange
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
          ]"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- Pause/Resume -->
      <button
        @click="stream.isRunning.value ? stream.pause() : stream.resume()"
        :class="[
          'px-4 py-1.5 text-sm font-medium rounded-md transition-colors',
          stream.isRunning.value
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200',
        ]"
      >
        {{ stream.isRunning.value ? "⏸ Pause" : "▶ Resume" }}
      </button>

      <!-- Metric toggles -->
      <div class="flex gap-2">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="store.toggleMetric(cat)"
          :class="[
            'px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors',
            isActive(cat)
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 border border-transparent hover:bg-gray-200',
          ]"
        >
          {{ cat }}
        </button>
      </div>
    </div>
  </div>
</template>
