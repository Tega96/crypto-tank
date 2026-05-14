<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  show: boolean;
  count: number;
}>();

const emit = defineEmits<{
  dismiss: [];
}>();

const dismissed = ref(false);

function dismiss() {
  dismissed.value = true;
  emit("dismiss");
  setTimeout(() => {
    dismissed.value = false;
  }, 5000);
}
</script>

<template>
  <div
    v-if="show && !dismissed"
    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-none"
  >
    <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-red-600 dark:text-red-400">⚠️</span>
          <p class="text-sm text-red-700 dark:text-red-300">
            {{ count }} error{{ count > 1 ? "s" : "" }} detected. Check console
            for details.
          </p>
        </div>
        <button
          @click="dismiss"
          class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>
