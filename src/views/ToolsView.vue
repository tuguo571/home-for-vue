<script setup lang="ts">
import { ref } from "vue";
import ToolLayout from "@/components/layout/ToolLayout.vue";
import Tabs from "@/components/ui/Tabs.vue";

const activeTab = ref("tools");

const tabs = [
  { id: "tools", label: "实用工具", icon: "🛠" },
  { id: "bookmarks", label: "个人导航", icon: "🔖" },
  { id: "sites", label: "个人站点", icon: "🏠" },
];

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  status: "online" | "developing" | "planning";
}

const tools = ref<Tool[]>([
  {
    id: "json",
    title: "JSON 格式化",
    description: "JSON 格式化、压缩、验证工具",
    icon: "📝",
    path: "/tools/json",
    status: "online",
  },
  {
    id: "timestamp",
    title: "时间戳转换",
    description: "Unix 时间戳与日期格式互转工具",
    icon: "⏰",
    path: "/tools/timestamp",
    status: "online",
  },
  {
    id: "base64",
    title: "Base64 编解码",
    description: "文本、图片的 Base64 编解码工具",
    icon: "🔄",
    path: "/tools/base64",
    status: "developing",
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
</script>

<template>
  <ToolLayout title="工具集" description="实用工具与个人导航">
    <div class="max-w-6xl mx-auto">
      <Tabs v-model="activeTab" :tabs="tabs" />

      <!-- 工具列表 -->
      <div v-show="activeTab === 'tools'" class="py-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <router-link
            v-for="tool in tools"
            :key="tool.id"
            :to="tool.path"
            class="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-start gap-4">
              <span class="text-3xl">{{ tool.icon }}</span>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <h3
                    class="text-lg font-semibold group-hover:text-primary transition-colors"
                  >
                    {{ tool.title }}
                  </h3>
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
                <p class="text-gray-600 dark:text-gray-300">
                  {{ tool.description }}
                </p>
              </div>
            </div>
          </router-link>
        </div>
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
  </ToolLayout>
</template>
