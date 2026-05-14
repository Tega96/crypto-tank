<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watchEffect } from "vue";
import { useDashboardStore } from "../stores/dashboard";
import type { EventLog } from "../types/metrics";
import { format } from "date-fns";

const props = defineProps<{
  events: EventLog[];
  store: ReturnType<typeof useDashboardStore>;
}>();

const feedContainer = ref<HTMLDivElement | null>(null);
const isAtBottom = ref(true);

// Detect if user has scrolled up (so we don't auto-scroll)
function onScroll() {
  if (!feedContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = feedContainer.value;
  // User is at bottom if within 50px of the end
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 50;
}

// Auto-scroll to bottom when new events come (only if user is at bottom)
watchEffect(() => {
  if (props.events.length > 0 && isAtBottom.value) {
    nextTick(() => {
      if (feedContainer.value) {
        feedContainer.value.scrollTop = feedContainer.value.scrollHeight;
      }
    });
  }
});

const severityColors = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <!-- Feed header with filters -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Feed
          <span class="text-sm font-normal text-gray-500 ml-2">
            ({{ events.length }} events)
          </span>
        </h3>

        <div class="flex gap-2">
          <!-- Search -->
          <input
            :value="store.searchQuery"
            @input="
              store.setSearchQuery(($event.target as HTMLInputElement).value)
            "
            type="text"
            placeholder="Search events..."
            class="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <!-- Severity filter -->
          <select
            :value="store.selectedSeverity"
            @change="
              store.setSeverity(($event.target as HTMLSelectElement).value)
            "
            class="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Feed content -->
    <div
      ref="feedContainer"
      @scroll="onScroll"
      class="max-h-[400px] overflow-y-auto feed-scroll"
    >
      <div
        v-if="!events.length"
        class="p-8 text-center text-gray-500 dark:text-gray-400"
      >
        No events to display
      </div>

      <div
        v-for="(event, index) in events"
        :key="event.id"
        class="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fade-in"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <!-- Severity badge -->
              <span
                :class="[
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  severityColors[event.severity],
                ]"
              >
                {{ event.severity }}
              </span>

              <!-- Type badge -->
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ event.type }}
              </span>
            </div>

            <p class="text-sm text-gray-900 dark:text-white truncate">
              {{ event.message }}
            </p>

            <div
              class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              <span>{{ event.source }}</span>
              <span>•</span>
              <span>{{ format(event.timestamp, "HH:mm:ss") }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
