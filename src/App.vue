<script setup lang="ts">
import { useRoute } from "vue-router";
import { RouterView } from "vue-router";
import TheHeader from "@/components/layout/TheHeader.vue";
import TheFooter from "@/components/layout/TheFooter.vue";
import PageTransition from "@/components/PageTransition.vue";
import Toast from "@/components/ui/Toast.vue";

const route = useRoute();
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
