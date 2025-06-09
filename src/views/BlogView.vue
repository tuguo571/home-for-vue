<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import type { Ref } from "vue";
import { fetchLocalBlogPosts } from "../utils/markdown";
import type { BlogPost } from "../types/blog";
import PageTransition from "../components/PageTransition.vue";

// 目录项接口
interface TocItem {
  id: string;
  text: string;
  level: number;
  element?: HTMLElement;
}

const posts: Ref<BlogPost[]> = ref([]);
const loading = ref(true);
const error = ref<string | null>(null);
const currentPage = ref(1);
const postsPerPage = 6;

// 文章详情模态框
const showModal = ref(false);
const selectedPost = ref<BlogPost | null>(null);

// 目录相关状态
const showToc = ref(true); // 默认显示目录
const tocItems = ref<TocItem[]>([]);
const activeHeadingId = ref<string>("");
const contentContainer = ref<HTMLElement | null>(null);

// 全屏阅读状态
const isFullWidth = ref(true); // 默认全屏显示

// 阅读进度
const readingProgress = ref(0); // 阅读进度

// 计算总页数
const totalPages = computed(() => Math.ceil(posts.value.length / postsPerPage));

// 添加排序功能
const sortByDate = computed(() => {
  return [...posts.value].sort((a, b) => b.date.getTime() - a.date.getTime());
});

// 获取当前页的文章（使用排序后的数组）
const currentPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage;
  const end = start + postsPerPage;
  return sortByDate.value.slice(start, end);
});

// 页码数组
const pageNumbers = computed(() => {
  const pages = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pages.push(i);
  }
  return pages;
});

// 切换页面
function changePage(page: number) {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    changePage(currentPage.value - 1);
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    changePage(currentPage.value + 1);
  }
}

// 加载博客文章
async function loadBlogPosts() {
  try {
    loading.value = true;
    posts.value = await fetchLocalBlogPosts();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "获取博客文章失败";
  } finally {
    loading.value = false;
  }
}

// 显示文章详情
function showPostContent(post: BlogPost) {
  selectedPost.value = post;
  showModal.value = true;
  // 防止背景滚动
  document.body.style.overflow = "hidden";
  // 添加键盘事件监听
  document.addEventListener("keydown", handleKeyDown);

  // 等待DOM更新后生成目录
  nextTick(() => {
    generateToc();
    setupScrollListener();
  });
}

// 关闭模态框
function closeModal() {
  showModal.value = false;
  selectedPost.value = null;
  // 恢复背景滚动
  document.body.style.overflow = "auto";
  // 移除键盘事件监听
  document.removeEventListener("keydown", handleKeyDown);
  // 清理目录和滚动监听
  tocItems.value = [];
  activeHeadingId.value = "";
  showToc.value = true; // 重置为默认显示状态
  isFullWidth.value = true; // 重置为默认全屏状态
  removeScrollListener();
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape" && showModal.value) {
    closeModal();
  }
}

// 滚动到顶部
function scrollToTop() {
  const contentElement = document.querySelector("#modal-content");
  if (contentElement) {
    contentElement.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// 生成目录
function generateToc() {
  const contentElement = document.querySelector(".markdown-content");
  if (!contentElement) return;

  const headings = contentElement.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const items: TocItem[] = [];

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent || "";
    const id = `heading-${index}`;

    // 为标题添加ID
    heading.id = id;

    items.push({
      id,
      text,
      level,
      element: heading as HTMLElement,
    });
  });

  tocItems.value = items;
}

// 跳转到指定标题
function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  const container = document.querySelector("#modal-content");

  if (element && container) {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scrollTop =
      container.scrollTop + elementRect.top - containerRect.top - 80;

    container.scrollTo({
      top: scrollTop,
      behavior: "smooth",
    });

    activeHeadingId.value = id;
  }
}

// 设置滚动监听
function setupScrollListener() {
  const container = document.querySelector("#modal-content");
  if (container) {
    contentContainer.value = container as HTMLElement;
    container.addEventListener("scroll", handleScroll);
  }
}

// 移除滚动监听
function removeScrollListener() {
  if (contentContainer.value) {
    contentContainer.value.removeEventListener("scroll", handleScroll);
    contentContainer.value = null;
  }
}

// 处理滚动事件
function handleScroll() {
  const container = contentContainer.value;
  if (!container) return;

  // 计算阅读进度
  const scrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight - container.clientHeight;
  readingProgress.value =
    scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

  // 更新活跃标题
  if (tocItems.value.length === 0) return;

  const containerRect = container.getBoundingClientRect();
  let activeId = "";

  // 找到当前可见的标题
  for (let i = tocItems.value.length - 1; i >= 0; i--) {
    const item = tocItems.value[i];
    const element = document.getElementById(item.id);

    if (element) {
      const elementRect = element.getBoundingClientRect();
      if (elementRect.top <= containerRect.top + 100) {
        activeId = item.id;
        break;
      }
    }
  }

  activeHeadingId.value = activeId;
}

// 切换目录显示
function toggleToc() {
  showToc.value = !showToc.value;
}

// 切换全屏宽度
function toggleFullWidth() {
  isFullWidth.value = !isFullWidth.value;
}

// 计算阅读时间（基于平均阅读速度 200 字/分钟）
function calculateReadingTime(content: string): number {
  const textContent = content.replace(/<[^>]*>/g, ""); // 移除HTML标签
  const wordCount = textContent.length;
  return Math.ceil(wordCount / 200);
}

onMounted(() => {
  loadBlogPosts();
});

// 格式化日期
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-12">
      <PageTransition>
        <div class="text-center mb-6">
          <h1
            class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            博客文章
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            分享技术见解和学习心得
          </p>
        </div>
      </PageTransition>

      <!-- 加载状态 -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-16"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"
        ></div>
        <p class="text-gray-600 dark:text-gray-400">正在加载文章...</p>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="text-center py-16">
        <div
          class="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          加载失败
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
        <button
          @click="loadBlogPosts"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重新加载
        </button>
      </div>

      <!-- 博客列表 -->
      <div v-else>
        <!-- 文章统计 -->
        <div class="text-center mb-6">
          <div class="flex items-center justify-center space-x-6">
            <span class="text-gray-700 dark:text-gray-300 font-medium">
              共 {{ posts.length }} 篇文章
            </span>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <PageTransition
            v-for="post in currentPosts"
            :key="post.link"
            name="fade"
            class="h-full"
          >
            <article
              class="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
              @click="showPostContent(post)"
            >
              <div class="p-6">
                <!-- 文章元信息 -->
                <div class="flex items-center justify-between mb-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    {{ post.category }}
                  </span>
                  <time
                    :datetime="post.date.toISOString()"
                    class="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {{ formatDate(post.date) }}
                  </time>
                </div>

                <!-- 文章标题 -->
                <h2
                  class="text-lg font-semibold mb-3 text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug"
                >
                  {{ post.title }}
                </h2>

                <!-- 文章描述 -->
                <p
                  class="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed mb-4"
                  v-html="post.description"
                ></p>

                <!-- 阅读更多 -->
                <div
                  class="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors"
                >
                  <span>阅读全文</span>
                  <svg
                    class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </article>
          </PageTransition>
        </div>

        <!-- 分页控件 -->
        <div
          v-if="totalPages > 1"
          class="flex justify-center items-center space-x-2 mt-12"
        >
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            上一页
          </button>

          <div class="flex space-x-1">
            <button
              v-for="page in pageNumbers"
              :key="page"
              @click="changePage(page)"
              :class="[
                'w-9 h-9 text-sm font-medium rounded-lg flex items-center justify-center transition-colors',
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            下一页
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && !error && posts.length === 0"
        class="text-center py-16"
      >
        <div
          class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          暂无博客文章
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          还没有发布任何文章，请稍后再来查看
        </p>
      </div>
    </div>

    <!-- 文章详情全屏模态框 -->
    <div
      v-if="showModal && selectedPost"
      class="fixed inset-0 z-50 bg-white dark:bg-gray-900"
      @click="closeModal"
    >
      <div class="h-full w-full flex overflow-hidden relative" @click.stop>
        <!-- 右上角关闭按钮 -->
        <button
          @click="closeModal"
          class="absolute top-4 right-4 z-30 p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-200"
          title="关闭全屏阅读 (ESC)"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- 全屏模态框内容 -->
        <div class="flex-1 flex overflow-hidden">
          <!-- 目录侧边栏 -->
          <div
            v-if="showToc && tocItems.length > 0"
            class="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto h-full"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  文章目录
                </h3>
                <button
                  @click="toggleToc"
                  class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <nav class="space-y-1">
                <button
                  v-for="item in tocItems"
                  :key="item.id"
                  @click="scrollToHeading(item.id)"
                  :class="[
                    'block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 toc-item',
                    `toc-level-${item.level}`,
                    activeHeadingId === item.id
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200',
                  ]"
                >
                  {{ item.text }}
                </button>
              </nav>
            </div>
          </div>

          <!-- 主要内容区域 -->
          <div
            class="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative"
            id="modal-content"
            ref="contentContainer"
            @scroll="handleScroll"
          >
            <!-- 阅读进度条 -->
            <div
              class="fixed top-0 left-0 right-0 z-30 h-1 bg-gray-200 dark:bg-gray-700"
            >
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                :style="{ width: `${readingProgress}%` }"
              ></div>
            </div>

            <!-- 悬浮按钮组 -->
            <div class="fixed bottom-6 right-6 z-20 flex flex-col space-y-2">
              <!-- 目录按钮 -->
              <button
                @click="toggleToc"
                :class="[
                  'p-3 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
                  showToc
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
                ]"
                title="目录导航"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>

              <!-- 全屏宽度按钮 -->
              <button
                @click="toggleFullWidth"
                :class="[
                  'p-3 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
                  isFullWidth
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:text-green-600 dark:hover:text-green-400',
                ]"
                title="全屏宽度"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>

              <!-- 返回顶部按钮 -->
              <button
                @click="scrollToTop"
                class="p-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-full shadow-md hover:shadow-lg hover:text-blue-600 dark:hover:text-blue-400 transform hover:scale-105 transition-all duration-200"
                title="返回顶部"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </button>
            </div>

            <!-- 文章内容容器 -->
            <div
              :class="[
                'mx-auto py-8',
                isFullWidth ? 'max-w-none px-4' : 'max-w-4xl px-8',
              ]"
            >
              <!-- 文章头部信息 -->
              <div
                class="text-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700"
              >
                <h1
                  class="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight"
                >
                  {{ selectedPost.title }}
                </h1>
                <div
                  class="flex items-center justify-center flex-wrap gap-4 text-sm"
                >
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-700 font-medium"
                  >
                    {{ selectedPost.category }}
                  </span>
                  <div
                    class="flex items-center text-gray-500 dark:text-gray-400"
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <time>{{ formatDate(selectedPost.date) }}</time>
                  </div>
                  <div
                    class="flex items-center text-gray-500 dark:text-gray-400"
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span
                      >约
                      {{ calculateReadingTime(selectedPost.content || "") }}
                      分钟阅读</span
                    >
                  </div>
                  <div
                    class="flex items-center text-gray-500 dark:text-gray-400"
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>{{ Math.round(readingProgress) }}% 已读</span>
                  </div>
                </div>
              </div>

              <!-- 文章内容 -->
              <div
                class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8"
              >
                <div
                  class="prose prose-lg max-w-none dark:prose-invert markdown-content"
                  v-html="selectedPost.content"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 卡片悬停效果和动画 */
.group:hover {
  transform: translateY(-4px);
}

/* 渐变动画 */
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* 脉冲动画优化 */
@keyframes pulse-soft {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse-soft 2s ease-in-out infinite;
}

/* Markdown 内容样式 - 使用固定值确保生效 */
.markdown-content {
  line-height: 1.7 !important;
  color: #111827 !important;
}

.dark .markdown-content {
  color: #f9fafb !important;
}

/* 强制标题样式 - 使用固定像素值 */
.markdown-content h1 {
  font-size: 32px !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
  margin-top: 32px !important;
  margin-bottom: 16px !important;
  color: #111827 !important;
  border-bottom: 2px solid #e5e7eb !important;
  padding-bottom: 8px !important;
  display: block !important;
}

.dark .markdown-content h1 {
  color: #f9fafb !important;
  border-bottom-color: #374151 !important;
}

.markdown-content h2 {
  font-size: 24px !important;
  font-weight: 600 !important;
  line-height: 1.3 !important;
  margin-top: 32px !important;
  margin-bottom: 16px !important;
  color: #111827 !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding-bottom: 4px !important;
  display: block !important;
}

.dark .markdown-content h2 {
  color: #f9fafb !important;
  border-bottom-color: #374151 !important;
}

.markdown-content h3 {
  font-size: 20px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin-top: 24px !important;
  margin-bottom: 12px !important;
  color: #111827 !important;
  display: block !important;
}

.dark .markdown-content h3 {
  color: #f9fafb !important;
}

.markdown-content h4 {
  font-size: 18px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin-top: 24px !important;
  margin-bottom: 12px !important;
  color: #111827 !important;
  display: block !important;
}

.dark .markdown-content h4 {
  color: #f9fafb !important;
}

.markdown-content h5 {
  font-size: 16px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin-top: 16px !important;
  margin-bottom: 8px !important;
  color: #111827 !important;
  display: block !important;
}

.dark .markdown-content h5 {
  color: #f9fafb !important;
}

.markdown-content h6 {
  font-size: 14px !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin-top: 16px !important;
  margin-bottom: 8px !important;
  color: #111827 !important;
  display: block !important;
}

.dark .markdown-content h6 {
  color: #f9fafb !important;
}

.markdown-content p {
  margin-bottom: 1rem !important;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 1rem !important;
  padding-left: 1.5rem !important;
}

.markdown-content li {
  margin-bottom: 0.5rem !important;
}

.markdown-content strong {
  font-weight: 600 !important;
  color: var(--color-text-primary, #111827) !important;
}

.markdown-content code {
  background-color: var(--color-bg-secondary, #f9fafb) !important;
  padding: 0.2rem 0.4rem !important;
  border-radius: 0.25rem !important;
  font-size: 0.875rem !important;
  font-family: "Courier New", monospace !important;
}

.markdown-content pre {
  background-color: var(--color-bg-secondary, #f9fafb) !important;
  padding: 1rem !important;
  border-radius: 0.5rem !important;
  overflow-x: auto !important;
  margin-bottom: 1rem !important;
}

.markdown-content pre code {
  background-color: transparent !important;
  padding: 0 !important;
}

.markdown-content blockquote {
  border-left: 4px solid var(--color-primary, #3b82f6) !important;
  padding-left: 1rem !important;
  margin: 1rem 0 !important;
  font-style: italic !important;
  color: var(--color-text-secondary, #4b5563) !important;
}

.markdown-content a {
  color: var(--color-primary, #3b82f6) !important;
  text-decoration: underline !important;
}

.markdown-content a:hover {
  color: var(--color-primary-dark, #2563eb) !important;
}

.markdown-content hr {
  border: none !important;
  border-top: 1px solid var(--color-border-light, #f3f4f6) !important;
  margin: 2rem 0 !important;
}

.markdown-content ol {
  list-style-type: decimal !important;
  margin-bottom: 1rem !important;
  padding-left: 1.5rem !important;
}

.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid var(--color-border-light);
  padding: 0.5rem;
  text-align: left;
}

.markdown-content th {
  background-color: var(--color-bg-secondary);
  font-weight: 600;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* 全屏模态框样式优化 */
.fixed.inset-0.z-50 {
  backdrop-filter: blur(2px);
}

/* 全屏阅读时的滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* 暗色模式下的滚动条 */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}

/* 全屏模式下的内容区域优化 */
.prose.prose-lg {
  font-size: 1.125rem;
  line-height: 1.8;
}

/* 全屏模式下的标题间距优化 */
.prose.prose-lg h1:first-child {
  margin-top: 0 !important;
}

/* 全屏模态框背景模糊效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* 目录样式 */
.toc-item {
  position: relative;
}

.toc-level-1 {
  margin-left: 0;
  font-weight: 600;
}

.toc-level-2 {
  margin-left: 1rem;
  font-weight: 500;
}

.toc-level-3 {
  margin-left: 2rem;
}

.toc-level-4 {
  margin-left: 3rem;
}

.toc-level-5 {
  margin-left: 4rem;
}

.toc-level-6 {
  margin-left: 5rem;
}

/* 目录滚动条样式 */
.w-80::-webkit-scrollbar {
  width: 6px;
}

.w-80::-webkit-scrollbar-track {
  background: transparent;
}

.w-80::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.w-80::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* 暗色模式下的目录滚动条 */
.dark .w-80::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.3);
}

.dark .w-80::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.5);
}

/* 响应式优化 */
@media (max-width: 768px) {
  .max-w-4xl {
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .prose.prose-lg {
    font-size: 1rem;
    line-height: 1.7;
  }

  /* 移动端头部优化 */
  .px-8 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* 移动端卡片优化 */
  .grid.gap-8 {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  /* 移动端标题优化 */
  .text-5xl {
    font-size: 2.5rem;
  }

  /* 移动端目录优化 */
  .w-80 {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    height: 100%;
  }

  /* 移动端头部信息优化 */
  .flex.items-center.justify-center.space-x-6 {
    flex-direction: column;
    space-x: 0;
    gap: 0.75rem;
  }

  .text-3xl {
    font-size: 1.5rem;
  }

  /* 移动端悬浮按钮优化 */
  .fixed.bottom-6.right-6 {
    bottom: 1rem;
    right: 1rem;
  }

  .fixed.bottom-6.right-6 button {
    padding: 0.5rem;
  }

  .fixed.bottom-6.right-6 svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* 移动端字体调节组优化 */
  .fixed.bottom-6.right-6 .bg-white\/95 {
    padding: 0.375rem 0.5rem;
  }

  .fixed.bottom-6.right-6 .min-w-\[2\.5rem\] {
    min-width: 2rem;
  }

  .fixed.bottom-6.right-6 .w-7 {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* 移动端工具提示隐藏 */
  .fixed.bottom-6.right-6 .absolute.-left-20 {
    display: none;
  }

  /* 移动端右上角关闭按钮优化 */
  .absolute.top-4.right-4 {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.5rem;
  }

  .absolute.top-4.right-4 svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* 代码块增强样式 */
.markdown-content pre {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 1.5rem !important;
  margin: 1.5rem 0 !important;
  overflow-x: auto !important;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.dark .markdown-content pre {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border-color: #475569 !important;
}

.markdown-content pre code {
  background: transparent !important;
  color: #334155 !important;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace !important;
  font-size: 0.875rem !important;
  line-height: 1.6 !important;
}

.dark .markdown-content pre code {
  color: #e2e8f0 !important;
}

/* 引用块增强样式 */
.markdown-content blockquote {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
  border-left: 4px solid #0ea5e9 !important;
  border-radius: 0 8px 8px 0 !important;
  padding: 1.5rem !important;
  margin: 1.5rem 0 !important;
  position: relative !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

.dark .markdown-content blockquote {
  background: linear-gradient(135deg, #0c4a6e 0%, #075985 100%) !important;
  border-left-color: #38bdf8 !important;
  color: #e0f2fe !important;
}

.markdown-content blockquote::before {
  content: '"';
  position: absolute;
  top: 0.5rem;
  left: 1rem;
  font-size: 2rem;
  color: #0ea5e9;
  opacity: 0.3;
  font-family: serif;
}

/* 表格增强样式 */
.markdown-content table {
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  border: none !important;
}

.markdown-content th {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 1rem !important;
  border: none !important;
}

.markdown-content td {
  padding: 0.75rem 1rem !important;
  border-bottom: 1px solid #e5e7eb !important;
  border-left: none !important;
  border-right: none !important;
}

.dark .markdown-content td {
  border-bottom-color: #374151 !important;
}

.markdown-content tr:nth-child(even) td {
  background-color: #f9fafb !important;
}

.dark .markdown-content tr:nth-child(even) td {
  background-color: #1f2937 !important;
}

/* 链接增强样式 */
.markdown-content a {
  color: #3b82f6 !important;
  text-decoration: none !important;
  border-bottom: 2px solid transparent !important;
  transition: all 0.3s ease !important;
  position: relative !important;
}

.markdown-content a:hover {
  color: #1d4ed8 !important;
  border-bottom-color: #3b82f6 !important;
}

.dark .markdown-content a {
  color: #60a5fa !important;
}

.dark .markdown-content a:hover {
  color: #93c5fd !important;
  border-bottom-color: #60a5fa !important;
}

/* 图片增强样式 */
.markdown-content img {
  border-radius: 12px !important;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease !important;
  cursor: pointer !important;
}

.markdown-content img:hover {
  transform: scale(1.02) !important;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.15),
    0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
}

/* 列表增强样式 */
.markdown-content ul li {
  position: relative !important;
  padding-left: 1.5rem !important;
}

.markdown-content ul li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #3b82f6;
  font-weight: bold;
  font-size: 1.2em;
}

.markdown-content ol li {
  padding-left: 0.5rem !important;
}

/* 打印样式 */
@media print {
  .fixed {
    display: none !important;
  }

  .markdown-content {
    font-size: 12pt !important;
    line-height: 1.5 !important;
    color: black !important;
  }

  .markdown-content h1,
  .markdown-content h2,
  .markdown-content h3,
  .markdown-content h4,
  .markdown-content h5,
  .markdown-content h6 {
    color: black !important;
    page-break-after: avoid !important;
  }

  .markdown-content pre,
  .markdown-content blockquote {
    page-break-inside: avoid !important;
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
  }

  .markdown-content img {
    max-width: 100% !important;
    page-break-inside: avoid !important;
  }

  .bg-gradient-to-br {
    background: white !important;
  }
}

/* 选择文本样式 */
.markdown-content ::selection {
  background-color: rgba(59, 130, 246, 0.2);
  color: inherit;
}

.dark .markdown-content ::selection {
  background-color: rgba(96, 165, 250, 0.3);
}

/* 平滑滚动增强 */
.overflow-y-auto {
  scroll-behavior: smooth;
}

/* 阅读进度条动画 */
@keyframes progress-glow {
  0%,
  100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
  }
}

.fixed.top-0 .bg-gradient-to-r {
  animation: progress-glow 2s ease-in-out infinite;
}

/* 悬浮按钮组增强动画 */
.fixed.bottom-6.right-6 button {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.fixed.bottom-6.right-6 button:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

/* 工具提示动画 */
.group:hover .absolute {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
