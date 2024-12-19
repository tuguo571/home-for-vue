<script setup lang="ts">
import { ref, computed } from "vue";
import PageTransition from "@/components/PageTransition.vue";
import Tabs from "@/components/ui/Tabs.vue";
import JsonFormatterView from "@/views/tools/JsonFormatterView.vue";
import TimestampView from "@/views/tools/TimestampView.vue";
import BookmarksView from "@/views/tools/BookmarksView.vue";

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
  status: "completed" | "developing" | "planning";
}

interface Tool {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  component: any;
  status: "online" | "developing" | "planning";
}

const activeTab = ref("projects");
const activeToolId = ref<number | null>(null);

const tabs = [
  { id: "projects", label: "个人项目", icon: "🎨" },
  { id: "tools", label: "在线工具", icon: "🛠" },
  { id: "bookmarks", label: "网址导航", icon: "🔖" },
];

const projects = ref<Project[]>([
  {
    id: 1,
    title: "个人主页",
    description:
      "基于 Vue 3 + TypeScript 开发的个人主页，支持暗色模式和主题定制",
    tags: ["Vue 3", "TypeScript", "Tailwind CSS"],
    image: "https://picsum.photos/800/600?random=1",
    link: "https://your-site.com",
    status: "completed",
  },
  {
    id: 2,
    title: "在线工具集",
    description: "包含多个实用的在线工具，如 JSON 格式化、时间戳转换等",
    tags: ["Vue", "工具集", "在线应用"],
    image: "https://picsum.photos/800/600?random=2",
    link: "/tools",
    status: "developing",
  },
]);

const tools = ref<Tool[]>([
  {
    id: 1,
    title: "JSON 格式化工具",
    description: "在线 JSON 格式化工具，支持压缩、美化、验证和转换等功能",
    tags: ["JSON", "格式化", "在线工具"],
    image: "https://picsum.photos/800/600?random=1",
    component: JsonFormatterView,
    status: "online",
  },
  {
    id: 2,
    title: "时间戳转换器",
    description: "时间戳与日期格式互转工具，支持多种格式和时区设置",
    tags: ["时间戳", "日期转换", "时区"],
    image: "https://picsum.photos/800/600?random=2",
    component: TimestampView,
    status: "online",
  },
]);

const activeTool = computed(() =>
  tools.value.find((tool) => tool.id === activeToolId.value),
);

const showToolList = () => {
  activeToolId.value = null;
};

// 加载状态
const isLoading = ref(false);

// 模拟加载效果
const handleTabChange = async () => {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 300));
  isLoading.value = false;
};
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <PageTransition name="bounce">
      <div class="max-w-4xl mx-auto text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">个人项目</h1>
      </div>
    </PageTransition>

    <div class="max-w-6xl mx-auto">
      <div class="mb-12">
        <Tabs
          v-model="activeTab"
          :tabs="tabs"
          @update:modelValue="handleTabChange"
        />
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div
          class="loader dark:border-t-gray-700 dark:border-r-gray-700 dark:border-l-gray-700"
        ></div>
      </div>

      <template v-else>
        <!-- 项目列表 -->
        <TransitionGroup
          v-show="activeTab === 'projects'"
          name="list"
          tag="div"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
        >
          <article
            v-for="project in projects"
            :key="project.id"
            class="group bg-white dark:bg-gray-800/90 rounded-xl shadow-lg overflow-hidden hover:shadow-xl dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2 relative dark:border dark:border-gray-700/50 dark:hover:glow-lg dark:hover:border-primary/30"
          >
            <!-- 项目卡片悬停效果 -->
            <div
              class="absolute inset-0 bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 dark:group-hover:backdrop-blur-sm"
            ></div>
            <div class="relative h-48 overflow-hidden">
              <img
                :src="project.image"
                :alt="project.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4"
              >
                <a
                  v-if="project.link && project.status === 'completed'"
                  :href="project.link"
                  target="_blank"
                  class="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                >
                  访问项目
                </a>
                <span
                  v-if="project.status !== 'completed'"
                  class="px-6 py-2 bg-white/20 rounded-full text-white"
                >
                  {{ project.status === "developing" ? "开发中" : "规划中" }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xl font-semibold dark:text-gray-100">
                  {{ project.title }}
                </h3>
                <span
                  class="text-sm px-2 py-1 rounded"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100':
                      project.status === 'completed',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100':
                      project.status === 'developing',
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100':
                      project.status === 'planning',
                  }"
                >
                  {{
                    project.status === "completed"
                      ? "已完成"
                      : project.status === "developing"
                        ? "开发中"
                        : "规划中"
                  }}
                </span>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ project.description }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="px-3 py-1 bg-primary-10 dark:bg-primary/10 text-primary dark:text-primary-light rounded-full text-sm"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </TransitionGroup>

        <!-- 工具列表 -->
        <TransitionGroup
          v-show="activeTab === 'tools' && !activeToolId"
          name="list"
          tag="div"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
        >
          <article
            v-for="tool in tools"
            :key="tool.id"
            class="group bg-white dark:bg-gray-800/90 rounded-xl shadow-lg overflow-hidden hover:shadow-xl dark:hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2 relative dark:border dark:border-gray-700/50 dark:hover:glow-lg dark:hover:border-primary/30"
          >
            <!-- 工具卡片悬停效果 -->
            <div
              class="absolute inset-0 bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-300 dark:group-hover:backdrop-blur-sm"
            ></div>
            <div class="relative h-48 overflow-hidden">
              <img
                :src="tool.image"
                :alt="tool.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4"
              >
                <button
                  v-if="tool.status === 'online'"
                  @click="activeToolId = tool.id"
                  class="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                >
                  立即使用
                </button>
                <span
                  v-if="tool.status !== 'online'"
                  class="px-6 py-2 bg-white/20 rounded-full text-white"
                >
                  {{ tool.status === "developing" ? "开发中" : "规划中" }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xl font-semibold dark:text-gray-100">
                  {{ tool.title }}
                </h3>
                <span
                  class="text-sm px-2 py-1 rounded"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100':
                      tool.status === 'completed',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100':
                      tool.status === 'developing',
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100':
                      tool.status === 'planning',
                  }"
                >
                  {{
                    tool.status === "completed"
                      ? "已完成"
                      : tool.status === "developing"
                        ? "开发中"
                        : "规划中"
                  }}
                </span>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                {{ tool.description }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in tool.tags"
                  :key="tag"
                  class="px-3 py-1 bg-primary-10 dark:bg-primary/10 text-primary dark:text-primary-light rounded-full text-sm"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </TransitionGroup>

        <!-- 网址导航 -->
        <div v-show="activeTab === 'bookmarks'">
          <BookmarksView />
        </div>

        <!-- 工具详情页 -->
        <div v-if="activeTab === 'tools' && activeToolId" class="relative">
          <button
            @click="showToolList"
            class="absolute -top-16 left-0 px-4 py-2 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors"
          >
            <span class="text-xl">←</span>
            <span>返回工具列表</span>
          </button>
          <component
            v-if="activeTool?.component"
            :is="activeTool.component"
          ></component>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 列表动画 */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(30px);
}

.list-leave-active {
  position: absolute;
}

/* 加载动画 */
.loader {
  width: 48px;
  height: 48px;
  border: 5px solid;
  border-color: #f3f3f3;
  border-bottom-color: var(--color-primary);
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 暗色模式特效 */
@media (prefers-color-scheme: dark) {
  .dark\:hover\:glow-lg:hover {
    box-shadow: 0 0 20px var(--color-primary);
  }
}
</style>
