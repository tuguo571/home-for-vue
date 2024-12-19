<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import { RouterView } from "vue-router";
import TheHeader from "@/components/layout/TheHeader.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
import PageTransition from "@/components/PageTransition.vue";
import Toast from "@/components/ui/Toast.vue";
import { siteConfig } from "@/config/site";

const route = useRoute();

// 监听路由变化更新页面标题和描述
watch(
  () => route.meta,
  (meta) => {
    if (meta.title) {
      document.title = `${meta.title} | ${siteConfig.name}`;
    }
    if (meta.description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", meta.description as string);
    }
    if (meta.keywords) {
      document
        .querySelector('meta[name="keywords"]')
        ?.setAttribute("content", meta.keywords as string);
    }
    // 更新 Open Graph 标签
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", meta.title as string);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", meta.description as string);
  },
);
</script>

<template>
  <div
    class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
  >
    <TheHeader />
    <main class="min-h-screen pt-20 pb-16">
      <RouterView v-slot="{ Component }">
        <PageTransition :name="route.meta.transition || 'fade'">
          <component :is="Component" />
        </PageTransition>
      </RouterView>
    </main>
    <TheFooter />
    <Toast />
  </div>
</template>
