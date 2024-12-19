<script setup lang="ts">
import { ref } from "vue";
import PageTransition from "@/components/PageTransition.vue";

const titles = ref(["后端全干工程师", "热爱编程", "热爱生活"]);
const currentTitleIndex = ref(0);

setInterval(() => {
  currentTitleIndex.value = (currentTitleIndex.value + 1) % titles.value.length;
}, 3000);
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-20 md:py-32">
      <div class="max-w-4xl mx-auto text-center">
        <PageTransition name="bounce">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            <span class="block mb-4">你好 👋</span>
            <span class="block">我是 Handsome</span>
          </h1>
        </PageTransition>

        <div class="h-8 mb-8">
          <transition name="fade" mode="out-in">
            <p
              :key="currentTitleIndex"
              class="text-xl md:text-2xl text-primary"
            >
              {{ titles[currentTitleIndex] }}
            </p>
          </transition>
        </div>

        <PageTransition name="slide-right">
          <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12">
            生活原本沉闷，
            <br class="hidden md:block" />
            但跑起来就有风。
          </p>
        </PageTransition>

        <PageTransition name="slide-left">
          <div class="flex flex-col md:flex-row gap-4 justify-center">
            <router-link to="/projects" class="btn-primary">
              查看作品
            </router-link>
            <router-link to="/contact" class="btn-secondary">
              联系我
            </router-link>
          </div>
        </PageTransition>
      </div>

      <!-- 技能标签云 -->
      <PageTransition name="scale">
        <div class="mt-20 flex flex-wrap justify-center gap-4">
          <span
            v-for="skill in [
              'Vue.js',
              'TypeScript',
              'Tailwind CSS',
              'Node.js',
              'React',
              'Git',
            ]"
            :key="skill"
            class="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:scale-110 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-300"
          >
            {{ skill }}
          </span>
        </div>
      </PageTransition>
    </section>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 技能标签悬停效果 */
@media (hover: hover) {
  .skill-tag:hover {
    transform: translateY(-2px) rotate(2deg);
  }
}
</style>
