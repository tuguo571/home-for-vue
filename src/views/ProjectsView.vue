<script setup lang="ts">
import { ref, computed } from "vue";
import PageTransition from "@/components/PageTransition.vue";
import Tabs from "@/components/ui/Tabs.vue";

interface Tool {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
  status: "online" | "developing" | "planning";
}

const tools = ref<Tool[]>([
  {
    id: 1,
    title: "JSON 格式化工具",
    description: "在线 JSON 格式化工具，支持压缩、美化、验证和转换等功能",
    tags: ["JSON", "格式化", "在线工具"],
    image: "https://picsum.photos/800/600?random=1",
    link: "/tools/json",
    status: "online",
  },
  {
    id: 2,
    title: "时间戳转换器",
    description: "时间戳与日期格式互转工具，支持多种格式和时区设置",
    tags: ["时间戳", "日期转换", "时区"],
    image: "https://picsum.photos/800/600?random=2",
    link: "/tools/timestamp",
    status: "online",
  },
  {
    id: 3,
    title: "Base64 编解码",
    description: "支持文本、图片、文件的 Base64 编码和解码功能",
    tags: ["Base64", "编码解码", "文件处理"],
    image: "https://picsum.photos/800/600?random=3",
    link: "/tools/base64",
    status: "developing",
  },
  {
    id: 4,
    title: "正则表达式测试",
    description: "在线正则表达式测试工具，提供常用正则示例和实时匹配高亮",
    tags: ["正则表达式", "测试工具", "字符串匹配"],
    image: "https://picsum.photos/800/600?random=4",
    link: "/tools/regex",
    status: "planning",
  },
]);

interface BookmarkCategory {
  name: string;
  items: {
    title: string;
    description: string;
    url: string;
    icon: string;
  }[];
}

const bookmarks = ref<BookmarkCategory[]>([
  {
    name: "常用工具",
    items: [
      {
        title: "ChatGPT",
        description: "AI 助手",
        url: "https://chat.openai.com",
        icon: "🤖",
      },
      {
        title: "GitHub",
        description: "代码托管平台",
        url: "https://github.com",
        icon: "📦",
      },
    ],
  },
  {
    name: "学习资源",
    items: [
      {
        title: "Vue.js",
        description: "渐进式 JavaScript 框架",
        url: "https://vuejs.org",
        icon: "💚",
      },
      {
        title: "MDN",
        description: "Web 开发文档",
        url: "https://developer.mozilla.org",
        icon: "📚",
      },
    ],
  },
]);

interface Site {
  title: string;
  description: string;
  url: string;
  icon: string;
  status: "online" | "developing" | "planning";
  tags: string[];
}

const sites = ref<Site[]>([
  {
    title: "个人博客",
    description: "技术分享、生活随笔",
    url: "https://blog.example.com",
    icon: "📝",
    status: "online",
    tags: ["博客", "技术", "生活"],
  },
  {
    title: "项目展示",
    description: "个人项目作品集",
    url: "https://projects.example.com",
    icon: "🎨",
    status: "developing",
    tags: ["作品集", "项目"],
  },
  {
    title: "在线简历",
    description: "个人简历展示",
    url: "https://resume.example.com",
    icon: "📄",
    status: "planning",
    tags: ["简历", "个人"],
  },
]);

// 过滤标签
const allTags = computed(() => [
  ...new Set(tools.value.flatMap((p) => p.tags)),
]);
const selectedTags = ref<string[]>([]);

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag);
  if (index === -1) {
    selectedTags.value.push(tag);
  } else {
    selectedTags.value.splice(index, 1);
  }
};

const filteredTools = computed(() => {
  if (selectedTags.value.length === 0) return tools.value;
  return tools.value.filter((tool) =>
    selectedTags.value.every((tag) => tool.tags.includes(tag)),
  );
});

const activeTab = ref("tools");

const tabs = [
  { id: "tools", label: "实用工具", icon: "🛠" },
  { id: "bookmarks", label: "个人导航", icon: "🔖" },
  { id: "sites", label: "个人站点", icon: "🏠" },
];
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <PageTransition name="bounce">
      <div class="max-w-4xl mx-auto text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">项目展示</h1>
        <p class="text-gray-600 dark:text-gray-300">实用工具与个人导航</p>
      </div>
    </PageTransition>

    <div class="max-w-6xl mx-auto">
      <Tabs v-model="activeTab" :tabs="tabs" />

      <!-- 工具列表 -->
      <div v-show="activeTab === 'tools'" class="py-8">
        <!-- 标签过滤器 -->
        <div class="mb-8">
          <PageTransition name="slide-right">
            <h2 class="text-lg font-semibold mb-4">工具分类</h2>
          </PageTransition>
          <PageTransition name="slide-left">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="tag in allTags"
                :key="tag"
                class="px-3 py-1 rounded-full text-sm transition-all duration-300"
                :class="[
                  selectedTags.includes(tag)
                    ? 'bg-primary text-white scale-110'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105',
                ]"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </PageTransition>
        </div>

        <TransitionGroup
          name="list"
          tag="div"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <article
            v-for="tool in filteredTools"
            :key="tool.id"
            class="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:rotate-1"
          >
            <div class="relative h-48 overflow-hidden">
              <img
                :src="tool.image"
                :alt="tool.title"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
              >
                <router-link
                  v-if="tool.link && tool.status === 'online'"
                  :to="tool.link"
                  class="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
                >
                  立即使用
                </router-link>
                <span
                  v-else
                  class="px-6 py-2 bg-white/20 rounded-full text-white"
                >
                  {{ tool.status === "developing" ? "开发中" : "规划中" }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-xl font-semibold">{{ tool.title }}</h3>
                <span
                  class="text-sm px-2 py-1 rounded"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100':
                      tool.status === 'online',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100':
                      tool.status === 'developing',
                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100':
                      tool.status === 'planning',
                  }"
                >
                  {{
                    tool.status === "online"
                      ? "可用"
                      : tool.status === "developing"
                        ? "开发中"
                        : "规划中"
                  }}
                </span>
              </div>
              <p class="text-gray-600 dark:text-gray-300 mb-4">
                {{ tool.description }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in tool.tags"
                  :key="tag"
                  class="px-3 py-1 bg-primary-10 text-primary rounded-full text-sm"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </article>
        </TransitionGroup>
      </div>

      <!-- 书签列表 -->
      <div v-show="activeTab === 'bookmarks'" class="py-8 space-y-8">
        <div
          v-for="category in bookmarks"
          :key="category.name"
          class="space-y-4"
        >
          <h2 class="text-xl font-bold">{{ category.name }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              v-for="item in category.items"
              :key="item.url"
              :href="item.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div class="flex items-start space-x-3">
                <span class="text-2xl">{{ item.icon }}</span>
                <div>
                  <h3
                    class="font-semibold group-hover:text-primary transition-colors"
                  >
                    {{ item.title }}
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- 个人站点列表 -->
      <div v-show="activeTab === 'sites'" class="py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            v-for="site in sites"
            :key="site.url"
            :href="site.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-start gap-4">
              <span class="text-3xl">{{ site.icon }}</span>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h3
                    class="text-lg font-semibold group-hover:text-primary transition-colors"
                  >
                    {{ site.title }}
                  </h3>
                  <span
                    class="text-sm px-2 py-1 rounded"
                    :class="{
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100':
                        site.status === 'online',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100':
                        site.status === 'developing',
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100':
                        site.status === 'planning',
                    }"
                  >
                    {{
                      site.status === "online"
                        ? "可用"
                        : site.status === "developing"
                          ? "开发中"
                          : "规划中"
                    }}
                  </span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-3">
                  {{ site.description }}
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="tag in site.tags"
                    :key="tag"
                    class="px-2 py-0.5 text-xs bg-primary-10 text-primary rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
