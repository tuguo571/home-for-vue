<template>
  <div class="giscus-comment-container">
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
        <span class="text-gray-600 dark:text-gray-300"
          >正在加载评论系统...</span
        >
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
          评论系统加载失败
        </h3>
        <p class="text-red-600 dark:text-red-300 mb-4">
          {{ errorMessage }}
        </p>
        <button
          @click="initGiscus"
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

    <!-- Giscus 容器 -->
    <div
      v-show="!isLoading && !hasError"
      ref="giscusContainer"
      class="giscus-container"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import {
  getGiscusConfig,
  validateGiscusConfig,
  getGiscusTheme,
  GISCUS_SCRIPT_URL,
} from "../../config/giscus";

// Props
interface Props {
  theme?: "light" | "dark" | "auto";
  term?: string; // 用于特定映射的术语
}

const props = withDefaults(defineProps<Props>(), {
  theme: "auto",
  term: "",
});

// 响应式状态
const isLoading = ref(true);
const hasError = ref(false);
const errorMessage = ref("");
const giscusContainer = ref<HTMLElement | null>(null);

// Giscus 配置
const giscusConfig = getGiscusConfig();

// 当前主题
const currentTheme = ref<string>("preferred_color_scheme");

/**
 * 获取当前主题
 */
const getCurrentTheme = (): string => {
  if (props.theme === "auto") {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return getGiscusTheme(isDark);
  }
  return props.theme;
};

/**
 * 动态加载 Giscus 脚本并初始化
 */
const loadAndInitGiscus = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经有脚本标签
    const existingScript = document.querySelector(
      `script[src="${GISCUS_SCRIPT_URL}"]`,
    );
    if (existingScript) {
      // 如果脚本已存在，直接初始化
      initGiscusWidget();
      resolve();
      return;
    }

    // 创建脚本标签
    const script = document.createElement("script");
    script.src = GISCUS_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";

    // 设置 Giscus 配置属性
    script.setAttribute("data-repo", giscusConfig.repo);
    script.setAttribute("data-repo-id", giscusConfig.repoId);
    script.setAttribute("data-category", giscusConfig.category);
    script.setAttribute("data-category-id", giscusConfig.categoryId);
    script.setAttribute("data-mapping", giscusConfig.mapping);
    script.setAttribute("data-strict", giscusConfig.strict || "0");
    script.setAttribute(
      "data-reactions-enabled",
      giscusConfig.reactionsEnabled || "1",
    );
    script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata || "0");
    script.setAttribute(
      "data-input-position",
      giscusConfig.inputPosition || "bottom",
    );
    script.setAttribute("data-theme", getCurrentTheme());
    script.setAttribute("data-lang", giscusConfig.lang || "zh-CN");
    script.setAttribute("data-loading", giscusConfig.loading || "lazy");

    // 如果有特定术语，设置 data-term
    if (props.term && giscusConfig.mapping === "specific") {
      script.setAttribute("data-term", props.term);
    }

    script.onload = () => {
      console.log("Giscus 脚本加载成功");
      resolve();
    };

    script.onerror = () => {
      console.error("Giscus 脚本加载失败");
      reject(new Error("无法加载 Giscus 脚本"));
    };

    // 将脚本添加到容器中而不是 head
    if (giscusContainer.value) {
      giscusContainer.value.appendChild(script);
    } else {
      reject(new Error("找不到 Giscus 容器"));
    }
  });
};

/**
 * 初始化 Giscus 小部件（当脚本已存在时）
 */
const initGiscusWidget = () => {
  if (!giscusContainer.value) return;

  // 清理容器和选中状态
  cleanupContainer();

  // 创建 Giscus 脚本元素
  const script = document.createElement("script");
  script.src = GISCUS_SCRIPT_URL;
  script.async = true;
  script.crossOrigin = "anonymous";

  // 设置配置属性
  script.setAttribute("data-repo", giscusConfig.repo);
  script.setAttribute("data-repo-id", giscusConfig.repoId);
  script.setAttribute("data-category", giscusConfig.category);
  script.setAttribute("data-category-id", giscusConfig.categoryId);
  script.setAttribute("data-mapping", giscusConfig.mapping);
  script.setAttribute("data-strict", giscusConfig.strict || "0");
  script.setAttribute(
    "data-reactions-enabled",
    giscusConfig.reactionsEnabled || "1",
  );
  script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata || "0");
  script.setAttribute(
    "data-input-position",
    giscusConfig.inputPosition || "bottom",
  );
  script.setAttribute("data-theme", getCurrentTheme());
  script.setAttribute("data-lang", giscusConfig.lang || "zh-CN");
  script.setAttribute("data-loading", giscusConfig.loading || "lazy");

  if (props.term && giscusConfig.mapping === "specific") {
    script.setAttribute("data-term", props.term);
  }

  giscusContainer.value.appendChild(script);
};

/**
 * 清理容器和选中状态
 */
const cleanupContainer = () => {
  if (!giscusContainer.value) return;

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

  // 移除所有事件监听器
  const iframes = giscusContainer.value.querySelectorAll("iframe");
  iframes.forEach((iframe) => {
    try {
      iframe.remove();
    } catch (error) {
      console.warn("移除 iframe 时出错:", error);
    }
  });

  // 清空容器
  giscusContainer.value.innerHTML = "";
};

/**
 * 初始化 Giscus
 */
const initGiscus = async () => {
  try {
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = "";

    // 验证配置
    if (!validateGiscusConfig(giscusConfig)) {
      throw new Error("Giscus 配置无效，请检查仓库信息");
    }

    // 等待 DOM 更新
    await nextTick();

    // 检查容器是否存在
    if (!giscusContainer.value) {
      throw new Error("找不到 Giscus 容器");
    }

    // 加载并初始化 Giscus
    await loadAndInitGiscus();

    console.log("Giscus 初始化成功");
  } catch (error: any) {
    console.error("Giscus 初始化失败:", error);
    hasError.value = true;
    errorMessage.value = error.message || "初始化失败，请稍后重试";
  } finally {
    isLoading.value = false;
  }
};

/**
 * 更新主题
 */
const updateTheme = (newTheme: string) => {
  const iframe = giscusContainer.value?.querySelector("iframe");
  if (iframe) {
    const message = {
      type: "set-theme",
      theme: newTheme,
    };
    iframe.contentWindow?.postMessage(
      { giscus: message },
      "https://giscus.app",
    );
  }
};

// 监听主题变化
watch(
  () => props.theme,
  () => {
    const newTheme = getCurrentTheme();
    if (newTheme !== currentTheme.value) {
      currentTheme.value = newTheme;
      updateTheme(newTheme);
    }
  },
);

// 监听系统主题变化
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const handleThemeChange = () => {
  if (props.theme === "auto") {
    const newTheme = getCurrentTheme();
    if (newTheme !== currentTheme.value) {
      currentTheme.value = newTheme;
      updateTheme(newTheme);
    }
  }
};

// 组件挂载时初始化
onMounted(() => {
  currentTheme.value = getCurrentTheme();
  initGiscus();

  // 监听系统主题变化
  mediaQuery.addEventListener("change", handleThemeChange);
});

// 组件卸载时清理
onUnmounted(() => {
  // 移除主题变化监听器
  mediaQuery.removeEventListener("change", handleThemeChange);

  // 完整清理容器
  cleanupContainer();
});
</script>

<style scoped>
.giscus-comment-container {
  width: 100%;
  min-height: 200px;
}

.giscus-container {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .giscus-container {
    font-size: 14px;
  }
}

/* Giscus 样式调整 */
:deep(.giscus) {
  color-scheme: light dark;
}

:deep(.giscus-frame) {
  border-radius: 8px;
  border: 1px solid rgb(229 231 235);
}

:deep(.dark .giscus-frame) {
  border-color: rgb(55 65 81);
}
</style>
