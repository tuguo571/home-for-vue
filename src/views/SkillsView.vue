<script setup lang="ts">
const frontendSkills = [
  { name: "Vue.js", level: 90 },
  { name: "TypeScript", level: 85 },
  { name: "CSS", level: 88 },
];

const backendSkills = [
  { name: "Java", level: 82 },
  { name: "数据库", level: 75 },
];
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold text-center mb-12">技能专长</h1>
    <div class="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
      <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 class="text-xl font-semibold mb-4">前端开发</h2>
        <div class="space-y-4">
          <div v-for="skill in frontendSkills" :key="skill.name">
            <div class="flex justify-between mb-1">
              <span>{{ skill.name }}</span>
              <span>{{ skill.level }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                class="bg-primary h-2 rounded-full transition-all duration-500"
                :style="{ width: skill.level + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 class="text-xl font-semibold mb-4">后端技能</h2>
        <div class="space-y-4">
          <div v-for="skill in backendSkills" :key="skill.name">
            <div class="flex justify-between mb-1">
              <span>{{ skill.name }}</span>
              <span>{{ skill.level }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                class="bg-primary h-2 rounded-full transition-all duration-500"
                :style="{ width: skill.level + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
