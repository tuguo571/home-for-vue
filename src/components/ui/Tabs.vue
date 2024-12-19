<script setup lang="ts">
import { ref } from "vue";

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

const props = defineProps<{
  tabs: Tab[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const activeTab = ref(props.modelValue);

const switchTab = (tabId: string) => {
  activeTab.value = tabId;
  emit("update:modelValue", tabId);
};
</script>

<template>
  <div class="border-b border-gray-200 dark:border-gray-700">
    <nav class="flex space-x-8" aria-label="Tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="switchTab(tab.id)"
        class="py-4 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap"
        :class="[
          activeTab === tab.id
            ? 'border-primary text-primary'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
        ]"
      >
        <span v-if="tab.icon" class="text-lg">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </nav>
  </div>
</template>
