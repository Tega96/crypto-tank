<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { useDataStream } from "./composables/useDataStream";
import { useDashboardStore } from "./stores/dashboard";
// import DashboardControls from "./components/DashboardControls.vue";
// import MetricCards from "./components/MetricCards.vue";
// import RealTimeChart from "./components/RealTimeChart.vue";
import ActivityFeed from "./components/ActivityFeed.vue";
import ErrorBanner from "./components/ErrorBanner.vue";

const stream = useDataStream();
const store = useDashboardStore();
const isDark = useDark();
const toggleDark = useToggle(isDark);
const showError = ref(false);

let unsubMetric: (() => void) | null = null;
let unsubEvent: (() => void) | null = null;

onMounted(() => {
  // Subscribe to the stream and pipe data into the store
  unsubMetric = stream.onMetric((metric) => {
    store.addMetric(metric);
  });

  unsubEvent = stream.onEvent((event) => {
    store.addEvent(event);
  });

  // Start streaming!
  stream.start(500); // Generate data every 500ms
});

// Cleanup summary on unmount
onUnmounted(() => {
  unsubMetric?.();
  unsubEvent?.();
});
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
  >
    <!-- Header -->
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Crypto-Tank Dashboard
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Live monitoring system
            </p>
          </div>

          <div class="flex items-center gap-4">
            <!-- Connection status indicator -->
            <div class="flex items-center gap-2">
              <span
                class="inline-block w-2 h-2 rounded-full"
                :class="{
                  'bg-green-500 animate-pulse':
                    stream.connectionStatus.value === 'connected',
                  'bg-yellow-500': stream.connectionStatus.value === 'paused',
                  'bg-red-500': stream.connectionStatus.value === 'error',
                  'bg-gray-400': stream.connectionStatus.value === 'idle',
                }"
              />
              <span class="text-sm text-gray-600 dark:text-gray-300">
                {{ stream.connectionStatus.value }}
              </span>
            </div>
            <button
              @click="toggleDark()"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ isDark ? "☀️" : "🌙" }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <ErrorBanner
      :show="stream.errorCount.value > 0"
      :count="stream.errorCount.value"
      @dismiss="showError = false"
    />

    <!-- Main content -->
    <!-- <main class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <DashboardControls :stream="stream" :store="store" />

      <MetricCards :store="store" />
 -->

    

    <!-- Charts grid -->
    <!--<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RealTimeChart
          title="Metric Trends"
          :data="store.filteredMetrics.value"
          chart-type="line"
        />
        <RealTimeChart
          title="CPU & Memory Usage"
          :data="
            store.filteredMetrics.value.filter((m) =>
              ['cpu', 'memory'].includes(m.category),
            )
          "
          chart-type="area"
        />
        <RealTimeChart
          title="Stock Price Movement"
          :data="
            store.filteredMetrics.value.filter((m) => m.category === 'stock')
          "
          chart-type="line"
        />
        <RealTimeChart
          title="Network Traffic"
          :data="
            store.filteredMetrics.value.filter((m) => m.category === 'network')
          "
          chart-type="bar"
        />
      </div>

    -->

    <!-- Activity Feed -->
      <div class="mt-6">
        <ActivityFeed :events="store.filteredEvents.value" :store="store" /> 
      </div>
    <!-- </main> -->

  </div>
</template>
