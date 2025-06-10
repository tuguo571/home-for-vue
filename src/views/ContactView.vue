<script setup lang="ts">
import { ref } from "vue";
import CommentSystem from "../components/ui/CommentSystem.vue";

// 显示模式：comment 或 external
const showCommentSystem = ref(true);

// 跳转到外部留言板
const goToGuestbook = () => {
  window.open(import.meta.env.VITE_GUESTBOOK_URL, "_blank");
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <div class="max-w-4xl mx-auto">
      <!-- <h1
        class="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient"
      >
        联系我
      </h1> -->
      <!-- <p
        class="text-sm md:text-base text-gray-600 dark:text-gray-300 text-center mb-0"
      >
        有任何问题或建议？请随时邮箱
        <a
          href="mailto:yf@linux.do"
          class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          yf@linux.do
        </a>
        联系我，或在下方留言板留言
      </p> -->

      <!-- 评论系统留言板 -->
      <div
        v-if="showCommentSystem"
        class="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-4 md:p-8"
      >
        <h2
          class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-3 md:mb-4 text-center"
        >
          💬 留言板
        </h2>
        <p
          class="text-sm md:text-base text-gray-600 dark:text-gray-300 text-center mb-4"
        >
          欢迎在这里留下您的想法和建议，也可以通过邮箱
          <a
            href="mailto:yf@linux.do"
            class="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            yf@linux.do
          </a>
          与我联系
        </p>
        <CommentSystem
          :default-system="'twikoo'"
          :show-selector="true"
          :theme="'auto'"
          :term="'contact'"
          :enable-twikoo="true"
          :enable-giscus="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-gradient {
  background-size: 200% auto;
  animation: gradient 4s linear infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
