<template>
  <footer
    class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    ref="footerRef"
  >
    <div class="container mx-auto px-4 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- 左侧版权信息 -->
        <div
          class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
          ref="copyrightRef"
        >
          <span>© {{ new Date().getFullYear() }}</span>
          <a
            href="https://www.mmm.sd/"
            target="_blank"
            class="font-medium hover:text-blue-500 transition-colors"
          >
            Handsome
          </a>
          <span>. All rights reserved.</span>
        </div>

        <!-- 右侧链接和服务商信息 -->
        <div
          class="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
        >
          <!-- 导航链接 -->
          <div class="flex items-center gap-4">
            <template v-for="link in footerConfig.links" :key="link.text">
              <router-link
                v-if="link.to"
                :to="link.to"
                class="hover:text-blue-500 transition-colors"
              >
                {{ link.text }}
              </router-link>
              <a
                v-else-if="link.href"
                :href="link.href"
                :target="link.target"
                class="hover:text-blue-500 transition-colors"
              >
                {{ link.text }}
              </a>
            </template>
          </div>

          <!-- 分隔符 -->
          <div class="hidden md:block text-gray-300 dark:text-gray-600">|</div>

          <!-- 服务商信息 -->
          <div class="flex items-center gap-2">
            <span>本网站由</span>
            <a
              :href="footerConfig.provider.link"
              target="_blank"
              class="inline-flex items-center hover:text-blue-500 transition-colors group"
            >
              <img
                :src="footerConfig.provider.logo"
                :alt="`${footerConfig.provider.name} Logo`"
                class="w-4 h-4 mr-1 group-hover:scale-110 transition-transform"
              />
              <span class="group-hover:text-blue-500 transition-colors">
                {{ footerConfig.provider.name }}
              </span>
            </a>
            <span>{{ footerConfig.provider.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { footerConfig } from "@/config/footer";

const router = useRouter();
const footerRef = ref<HTMLElement | null>(null);
const copyrightRef = ref<HTMLElement | null>(null);

// 版权验证函数
const verifyCopyright = () => {
  const footer = footerRef.value;
  const copyright = copyrightRef.value;

  if (!footer || !copyright) return;

  // 检查版权信息是否存在且完整
  const isValid =
    copyright.textContent?.includes("© " + new Date().getFullYear()) &&
    copyright.textContent?.includes("Handsome") &&
    copyright.textContent?.includes("All rights reserved");

  // 如果版权信息被修改，重定向到博客
  if (!isValid) {
    window.location.href = "https://www.mmm.sd/";
  }
};

// 定期检查版权信息
let intervalId: number;

onMounted(() => {
  verifyCopyright();
  intervalId = window.setInterval(verifyCopyright, 1000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    window.clearInterval(intervalId);
  }
});
</script>
