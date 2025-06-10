<template>
  <div class="comment-system">
    <!-- 评论系统选择器 -->
    <div v-if="showSelector" class="comment-selector mb-6">
      <div class="flex items-center justify-center space-x-4">
        <button
          @click="setCommentSystem('twikoo')"
          :class="[
            'flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200',
            currentSystem === 'twikoo'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
          ]"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Twikoo
        </button>

        <button
          @click="setCommentSystem('giscus')"
          :class="[
            'flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200',
            currentSystem === 'giscus'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
          ]"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
          Giscus
        </button>
      </div>

      <!-- 系统说明 -->
      <div class="text-center mt-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          <span v-if="currentSystem === 'twikoo'">
            💬 Twikoo 评论系统 - 支持 Markdown 语法和表情包
          </span>
          <span v-else>
            🔗 Giscus 评论系统 - 基于 GitHub Discussions 的评论系统
          </span>
        </p>
      </div>
    </div>

    <!-- 评论组件容器 -->
    <div class="comment-container">
      <!-- Twikoo 评论组件 -->
      <div v-if="currentSystem === 'twikoo'" key="twikoo">
        <TwikooComment />
      </div>

      <!-- Giscus 评论组件 -->
      <div v-else-if="currentSystem === 'giscus'" key="giscus">
        <GiscusComment :theme="theme" :term="term" />
      </div>

      <!-- 禁用状态 -->
      <div v-else class="text-center py-8">
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <svg
            class="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
            评论功能已禁用
          </h3>
          <p class="text-gray-600 dark:text-gray-400">管理员已禁用评论功能</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import TwikooComment from "./TwikooComment.vue";
import GiscusComment from "./GiscusComment.vue";
import {
  clearTextSelection,
  createSelectionChangeListener,
} from "../../utils/selection";

// Props
interface Props {
  defaultSystem?: "twikoo" | "giscus" | "disabled";
  showSelector?: boolean;
  theme?: "light" | "dark" | "auto";
  term?: string; // 用于 Giscus 特定映射
  enableTwikoo?: boolean;
  enableGiscus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultSystem: "twikoo", // 默认使用 Twikoo，因为它已经配置好了
  showSelector: true,
  theme: "auto",
  term: "",
  enableTwikoo: true,
  enableGiscus: true,
});

// Emits
const emit = defineEmits<{
  systemChange: [system: string];
}>();

// 响应式状态
const currentSystem = ref<"twikoo" | "giscus" | "disabled">(
  props.defaultSystem,
);

// 计算可用的评论系统
const availableSystems = computed(() => {
  const systems: Array<"twikoo" | "giscus"> = [];
  if (props.enableTwikoo) systems.push("twikoo");
  if (props.enableGiscus) systems.push("giscus");
  return systems;
});

// 设置评论系统
const setCommentSystem = (system: "twikoo" | "giscus" | "disabled") => {
  if (system === "twikoo" && !props.enableTwikoo) return;
  if (system === "giscus" && !props.enableGiscus) return;

  // 清理当前系统的选中状态
  clearTextSelection();

  // 延迟切换以确保清理完成
  setTimeout(() => {
    currentSystem.value = system;
    emit("systemChange", system);

    // 保存用户偏好到 localStorage
    localStorage.setItem("preferred-comment-system", system);
  }, 100);
};

// 从 localStorage 恢复用户偏好
const restoreUserPreference = () => {
  const saved = localStorage.getItem("preferred-comment-system") as
    | "twikoo"
    | "giscus"
    | null;

  if (saved && availableSystems.value.includes(saved)) {
    currentSystem.value = saved;
  } else if (availableSystems.value.length > 0) {
    // 如果没有保存的偏好或偏好的系统不可用，使用第一个可用的系统
    currentSystem.value = availableSystems.value[0];
  } else {
    // 如果没有可用的评论系统，禁用评论
    currentSystem.value = "disabled";
  }
};

// 选择变化监听器清理函数
let cleanupSelectionListener: (() => void) | null = null;

// 组件挂载时恢复用户偏好
onMounted(() => {
  restoreUserPreference();

  // 创建选择变化监听器，防止选择跨越评论系统边界
  cleanupSelectionListener = createSelectionChangeListener(
    (selection) => {
      if (selection && selection.rangeCount > 0) {
        // 检查选择是否跨越了评论系统边界
        const range = selection.getRangeAt(0);
        const commentContainer = document.querySelector(".comment-system");

        if (commentContainer) {
          const commentRect = commentContainer.getBoundingClientRect();
          const rangeRect = range.getBoundingClientRect();

          // 如果选择跨越了评论系统边界，清理选择
          if (
            rangeRect.top < commentRect.top ||
            rangeRect.bottom > commentRect.bottom ||
            rangeRect.left < commentRect.left ||
            rangeRect.right > commentRect.right
          ) {
            clearTextSelection();
          }
        }
      }
    },
    { debounce: 100 },
  );
});

// 组件卸载时清理
onUnmounted(() => {
  // 清理选择变化监听器
  if (cleanupSelectionListener) {
    cleanupSelectionListener();
    cleanupSelectionListener = null;
  }

  // 清理文本选择
  clearTextSelection();
});
</script>

<style scoped>
.comment-system {
  width: 100%;
}

.comment-selector {
  border-bottom: 1px solid rgb(229 231 235);
  padding-bottom: 1.5rem;
}

.dark .comment-selector {
  border-bottom-color: rgb(55 65 81);
}

.comment-container {
  width: 100%;
}

/* 按钮悬停效果 */
.comment-selector button {
  position: relative;
  overflow: hidden;
}

.comment-selector button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.comment-selector button:hover::before {
  left: 100%;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .comment-selector .flex {
    flex-direction: column;
    space-x: 0;
    gap: 0.75rem;
  }

  .comment-selector button {
    width: 100%;
    justify-content: center;
  }
}

/* 过渡动画 */
.comment-container > div {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
