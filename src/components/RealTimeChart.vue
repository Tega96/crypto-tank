<script setup lang="ts">
import { computed, watch, ref, onUnmounted } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from "echarts/components";
import { UniversalTransition } from "echarts/features";
import { useThrottleFn, useDark } from "@vueuse/core";
import type { NumericMetric } from "../types/metrics";

// Register ECharts components (tree-shaking for smaller bundle)
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  UniversalTransition,
]);

const props = defineProps<{
  title: string;
  data: NumericMetric[];
  chartType?: "line" | "bar" | "area";
}>();

const isDark = useDark();
const chartRef = ref<InstanceType<typeof VChart> | null>(null);

// Group data by category for multi-series charts
const seriesData = computed(() => {
  const grouped = new Map<string, NumericMetric[]>();

  props.data.forEach((metric) => {
    if (!grouped.has(metric.category)) {
      grouped.set(metric.category, []);
    }
    grouped.get(metric.category)!.push(metric);
  });

  return Array.from(grouped.entries()).map(([category, metrics]) => ({
    category,
    data: metrics.map((m) => [m.timestamp, m.value]),
  }));
});

// Build ECharts option
const chartOption = computed(() => {
  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      backgroundColor: isDark.value ? "#1F2937" : "#FFFFFF",
      borderColor: isDark.value ? "#374151" : "#E5E7EB",
      textStyle: { color: isDark.value ? "#F9FAFB" : "#111827" },
    },
    legend: {
      data: seriesData.value.map((s) => s.category),
      textStyle: { color: isDark.value ? "#9CA3AF" : "#6B7280" },
      top: 0,
    },
    grid: {
      top: 50,
      right: 30,
      bottom: 30,
      left: 50,
    },
    xAxis: {
      type: "time",
      axisLine: { lineStyle: { color: isDark.value ? "#4B5563" : "#D1D5DB" } },
      axisLabel: { color: isDark.value ? "#9CA3AF" : "#6B7280" },
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: { color: isDark.value ? "#374151" : "#F3F4F6" },
      },
      axisLabel: { color: isDark.value ? "#9CA3AF" : "#6B7280" },
    },
    dataZoom: [
      {
        type: "slider",
        start: 0,
        end: 100,
        height: 20,
        bottom: 0,
        backgroundColor: isDark.value ? "#1F2937" : "#FFFFFF",
        dataBackground: {
          lineStyle: { color: isDark.value ? "#4B5563" : "#D1D5DB" },
          areaStyle: { color: isDark.value ? "#374151" : "#F3F4F6" },
        },
      },
    ],
    series: seriesData.value.map((series, index) => ({
      name: series.category,
      type: props.chartType === "bar" ? "bar" : "line",
      data: series.data,
      smooth: true,
      symbol: "none", // Remove dots for performance with large datasets
      lineStyle: {
        color: colors[index % colors.length],
        width: 2,
      },
      itemStyle: {
        color: colors[index % colors.length],
      },
      areaStyle:
        props.chartType === "area"
          ? {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: `${colors[index % colors.length]}40` },
                  { offset: 1, color: `${colors[index % colors.length]}00` },
                ],
              },
            }
          : undefined,
      animationDuration: 300,
      animationDurationUpdate: 200,
    })),
  };
});

// Throttle updates for performance
const throttledData = useThrottleFn(() => {
  if (chartRef.value) {
    // vue-echarts handles options reactively, but we can force update if needed
  }
}, 100);

watch(
  () => props.data.length,
  () => {
    throttledData();
  },
);

onUnmounted(() => {
  // ECharts cleanup handled by vue-echarts
});
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
  >
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ title }}
    </h3>
    <div class="w-full" style="height: 350px">
      <div
        v-if="!data.length"
        class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
      >
        No data available
      </div>
      <VChart
        v-else
        ref="chartRef"
        :option="chartOption"
        :style="{ height: '350px', width: '100%' }"
        autoresize
      />
    </div>
  </div>
</template>
