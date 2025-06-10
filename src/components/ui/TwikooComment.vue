<template>
  <div class="twikoo-comment-container">
    <!-- 加载状态 -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-8 md:py-12"
    >
      <div class="flex items-center space-x-3">
        <svg
          class="animate-spin h-6 w-6 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-gray-600 dark:text-gray-300">正在加载留言板...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="text-center py-8 md:py-12">
      <div class="bg-red-50 dark:bg-red-900/50 rounded-lg p-6">
        <svg
          class="mx-auto h-12 w-12 text-red-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          留言板加载失败
        </h3>
        <p class="text-red-600 dark:text-red-300 mb-4">
          {{ errorMessage }}
        </p>
        <button
          @click="initTwikoo"
          class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          重新加载
        </button>
      </div>
    </div>

    <!-- Twikoo 容器 -->
    <div
      v-show="!isLoading && !hasError"
      id="twikoo-container"
      class="twikoo-container"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { getTwikooConfig, validateTwikooConfig } from "../../config/twikoo";

// 响应式状态
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref("");

// Twikoo 配置
const twikooConfig = getTwikooConfig();

// 声明全局 twikoo 对象
declare global {
  interface Window {
    twikoo: any;
  }
}

/**
 * 动态加载 Twikoo 脚本
 */
const loadTwikooScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.twikoo) {
      resolve();
      return;
    }

    // 检查是否已经有脚本标签
    const existingScript = document.querySelector(
      `script[src="${twikooConfig.cdnUrl}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("脚本加载失败")),
      );
      return;
    }

    // 创建脚本标签
    const script = document.createElement("script");
    script.src = twikooConfig.cdnUrl;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      console.log("Twikoo 脚本加载成功");
      resolve();
    };

    script.onerror = () => {
      console.error("Twikoo 脚本加载失败");
      reject(new Error("无法加载 Twikoo 脚本"));
    };

    document.head.appendChild(script);
  });
};

/**
 * 清理容器和选中状态
 */
const cleanupTwikooContainer = () => {
  const container = document.getElementById("twikoo-container");
  if (!container) return;

  // 清除文本选择
  try {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }
  } catch (error) {
    console.warn("清理文本选择时出错:", error);
  }

  // 清空容器
  container.innerHTML = "";
};

/**
 * 初始化 Twikoo
 */
const initTwikoo = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = "";

    // 验证配置
    if (!validateTwikooConfig(twikooConfig)) {
      throw new Error("Twikoo 配置无效");
    }

    // 加载脚本
    await loadTwikooScript();

    // 等待 DOM 更新
    await nextTick();

    // 检查容器是否存在
    const container = document.getElementById("twikoo-container");
    if (!container) {
      throw new Error("找不到 Twikoo 容器");
    }

    // 清理容器和选中状态
    cleanupTwikooContainer();

    // 初始化 Twikoo
    await window.twikoo.init({
      envId: twikooConfig.envId,
      el: "#twikoo-container",
      path: twikooConfig.path,
      lang: "zh-CN",
      region: twikooConfig.region,
    });

    console.log("Twikoo 初始化成功");
  } catch (error: any) {
    console.error("Twikoo 初始化失败:", error);
    hasError.value = true;
    errorMessage.value = error.message || "初始化失败，请稍后重试";
  } finally {
    isLoading.value = false;
  }
};

// 组件挂载时初始化
onMounted(() => {
  initTwikoo();
});

// 组件卸载时清理
onUnmounted(() => {
  // 完整清理容器
  cleanupTwikooContainer();
});
</script>

<style scoped>
.twikoo-comment-container {
  width: 100%;
  min-height: 200px;
}

.twikoo-container {
  width: 100%;
}

/* 深色模式适配 */
:deep(.twikoo) {
  color-scheme: light dark;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .twikoo-container {
    font-size: 14px;
  }
}
</style>
