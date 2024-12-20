<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RouterView } from "vue-router";
import TheHeader from "./components/layout/TheHeader.vue";
import TheFooter from "./components/layout/TheFooter.vue";
import PageTransition from "./components/PageTransition.vue";
import Toast from "./components/ui/Toast.vue";
import Modal from "./components/ui/Modal.vue";
import { noticeConfig } from "./config/notice";
import type { NoticeButton } from "./types/notice";
import { siteConfig } from "./config/site";

const route = useRoute();
const router = useRouter();

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

const showNotice = ref(false);

// 处理按钮点击
const handleNoticeAction = (button: NoticeButton) => {
  const now = Date.now();
  const showAfter = button.showAfter ?? noticeConfig.defaultShowAfter;

  // 设置下次显示��间
  if (showAfter !== undefined) {
    localStorage.setItem(
      `notice_${noticeConfig.id}`,
      showAfter === null ? "refresh" : String(now + showAfter),
    );
  }

  // 处理按钮动作
  switch (button.action) {
    case "close":
      showNotice.value = false;
      break;
    case "navigate":
      showNotice.value = false;
      if (button.to) {
        router.push(button.to);
      }
      break;
    case "link":
      if (button.href) {
        window.open(button.href, "_blank");
      }
      showNotice.value = false;
      break;
    case "custom":
      if (button.handler) {
        button.handler();
      }
      showNotice.value = false;
      break;
  }
};

// 检查是否显示公告
const checkNotice = () => {
  const nextShowTime = localStorage.getItem(`notice_${noticeConfig.id}`);

  if (
    !nextShowTime ||
    nextShowTime === "refresh" ||
    Date.now() >= Number(nextShowTime)
  ) {
    showNotice.value = true;
  }
};

onMounted(() => {
  checkNotice();
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-main text-primary">
    <TheHeader />
    <main class="flex-grow pt-16 md:pt-20">
      <router-view v-slot="{ Component }">
        <PageTransition :name="(route.meta.transition as string) || 'fade'">
          <component :is="Component" />
        </PageTransition>
      </router-view>
    </main>
    <TheFooter />
    <Toast />
    <Modal
      v-model:show="showNotice"
      :title="noticeConfig.title"
      :width="noticeConfig.width"
      :mask-closable="noticeConfig.maskClosable"
      :show-close="noticeConfig.showClose"
    >
      <div v-html="noticeConfig.content"></div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            v-for="button in noticeConfig.buttons"
            :key="button.text"
            class="px-4 py-2 text-sm font-medium rounded-md transition-colors"
            :class="{
              'text-white bg-primary hover:bg-primary-dark':
                button.type === 'primary',
              'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600':
                button.type === 'secondary',
              'text-white bg-red-500 hover:bg-red-600':
                button.type === 'danger',
            }"
            @click="handleNoticeAction(button)"
          >
            {{ button.text }}
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>
