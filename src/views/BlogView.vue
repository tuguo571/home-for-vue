<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import type { Ref } from "vue";
import {
  fetchLocalBlogPosts,
  addCopyButtonsToCodeBlocks,
} from "../utils/enhanced-markdown";
import type { BlogPost } from "../types/blog";
import PageTransition from "../components/PageTransition.vue";
import CommentSystem from "../components/ui/CommentSystem.vue";

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

  // 等待DOM更新后生成目录和添加复制按钮
  nextTick(() => {
    generateToc();
    setupScrollListener();
    addCopyButtonsToCodeBlocks();
  });
}

// 关闭模态框
function closeModal() {
  // 清理文本选择状态
  clearTextSelection();

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

// 清理文本选择
function clearTextSelection() {
  try {
    // 清除页面上的所有文本选择
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }

    // 清除 document.selection (IE 兼容)
    if ((document as any).selection) {
      (document as any).selection.empty();
    }
  } catch (error) {
    console.warn("清理文本选择时出错:", error);
  }
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

// 代码块复制功能现在由 enhanced-markdown.ts 处理

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
        <div class="w-full h-full flex">
          <!-- 左侧空白区域 10% -->
          <div class="w-[10%] bg-transparent"></div>

          <!-- 目录区域 20% -->
          <div
            v-if="showToc && tocItems.length > 0"
            :class="[
              'w-[20%] h-full flex flex-col justify-center p-4',
              showToc ? 'show' : '',
            ]"
          >
            <!-- 目录框框 -->
            <div
              class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden"
            >
              <!-- 目录内容容器 - 垂直居中 -->
              <div class="flex flex-col justify-center px-6 py-8">
                <!-- 目录标题 -->
                <div class="text-center mb-6">
                  <h3
                    class="text-base font-bold text-gray-900 dark:text-white flex items-center justify-center"
                  >
                    <div
                      class="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-2"
                    >
                      <svg
                        class="w-3 h-3 text-white"
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
                    </div>
                    目录
                  </h3>
                </div>

                <!-- 目录导航 -->
                <div class="max-h-[60vh] overflow-y-auto scrollbar-hide">
                  <nav class="space-y-1">
                    <button
                      v-for="item in tocItems"
                      :key="item.id"
                      @click="scrollToHeading(item.id)"
                      :class="[
                        'block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all duration-200 toc-item relative group',
                        `toc-level-${item.level}`,
                        activeHeadingId === item.id
                          ? 'bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 font-medium',
                      ]"
                    >
                      <span class="block truncate leading-snug">{{
                        item.text
                      }}</span>
                      <!-- 当前阅读位置指示器 -->
                      <div
                        v-if="activeHeadingId === item.id"
                        class="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full"
                      ></div>
                    </button>
                  </nav>
                </div>

                <!-- 底部信息 -->
                <div
                  class="mt-6 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                >
                  <div class="text-center">
                    <div
                      class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 font-medium mb-2"
                    >
                      <span>{{ tocItems.length }} 章节</span>
                      <span class="text-blue-600 dark:text-blue-400"
                        >{{ Math.round(readingProgress) }}%</span
                      >
                    </div>
                    <!-- 进度条 -->
                    <div
                      class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1"
                    >
                      <div
                        class="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-300 ease-out"
                        :style="{ width: `${readingProgress}%` }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- 关闭按钮 -->
                <div class="text-center mt-4">
                  <button
                    @click="toggleToc"
                    class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    title="隐藏目录"
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
              </div>
            </div>
          </div>

          <!-- 主要内容区域 60% -->
          <div
            :class="[
              'overflow-y-auto bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800',
              showToc && tocItems.length > 0 ? 'w-[60%]' : 'w-[80%]',
            ]"
            id="modal-content"
            ref="contentContainer"
            @scroll="handleScroll"
          >
            <!-- 阅读进度条 - 增强视觉效果 -->
            <div
              class="fixed top-0 left-0 right-0 z-30 h-1 bg-gray-200/80 dark:bg-gray-700/80 backdrop-blur-sm"
            >
              <div
                class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out shadow-sm"
                :style="{ width: `${readingProgress}%` }"
              ></div>
              <!-- 进度条光效 -->
              <div
                class="absolute top-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500 ease-out"
                :style="{
                  width: `${readingProgress}%`,
                  transform: `translateX(${readingProgress > 0 ? '0' : '-100%'})`,
                }"
              ></div>
            </div>

            <!-- 悬浮按钮组 - 优化移动端体验 -->
            <div
              class="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 floating-buttons"
            >
              <!-- 目录按钮 -->
              <button
                @click="toggleToc"
                :class="[
                  'p-3 md:p-3.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 backdrop-blur-sm',
                  showToc
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-purple-500/25'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50',
                ]"
                title="目录导航"
              >
                <svg
                  class="w-4 h-4 md:w-5 md:h-5"
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
                  'p-3 md:p-3.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 backdrop-blur-sm',
                  isFullWidth
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/25'
                    : 'bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 hover:text-green-600 dark:hover:text-green-400',
                ]"
                title="全屏宽度"
              >
                <svg
                  class="w-4 h-4 md:w-5 md:h-5"
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
                class="p-3 md:p-3.5 bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg hover:shadow-xl hover:text-blue-600 dark:hover:text-blue-400 transform hover:scale-105 transition-all duration-200 backdrop-blur-sm"
                title="返回顶部"
              >
                <svg
                  class="w-4 h-4 md:w-5 md:h-5"
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

            <!-- 文章内容容器 - 5%空白 + 90%内容 + 5%空白布局 -->
            <div class="w-full flex">
              <!-- 左侧5%空白 -->
              <div class="w-[5%] flex-shrink-0"></div>

              <!-- 90%文章内容区域 -->
              <div class="w-[90%] px-4 md:px-8 py-8 md:py-12">
                <!-- 文章头部信息 -->
                <header
                  class="mb-12 pb-8 text-center border-b border-gray-200/60 dark:border-gray-700/60"
                >
                  <!-- 分类标签 -->
                  <div class="mb-6">
                    <span
                      class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50"
                    >
                      {{ selectedPost.category }}
                    </span>
                  </div>

                  <!-- 标题区域 -->
                  <div class="mb-8">
                    <h1
                      class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight"
                    >
                      {{ selectedPost.title }}
                    </h1>

                    <!-- 文章描述 -->
                    <p
                      class="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto font-light"
                    >
                      {{ selectedPost.description }}
                    </p>
                  </div>

                  <!-- 元信息 -->
                  <div
                    class="flex items-center justify-center flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400"
                  >
                    <div class="flex items-center gap-2">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      <span>{{ formatDate(selectedPost.date) }}</span>
                    </div>
                    <div class="flex items-center gap-2">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span
                        >{{
                          calculateReadingTime(selectedPost.content || "")
                        }}
                        分钟阅读</span
                      >
                    </div>
                    <div class="flex items-center gap-2">
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
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        ></path>
                      </svg>
                      <span>{{ Math.round(readingProgress) }}% 已读</span>
                    </div>
                  </div>
                </header>

                <!-- 文章内容 -->
                <main
                  class="article-content"
                  :class="{ 'full-width': isFullWidth }"
                >
                  <div
                    class="prose prose-lg max-w-none dark:prose-invert markdown-content enhanced-content reading-content"
                    v-html="selectedPost.content"
                  ></div>
                </main>

                <!-- 评论系统 -->
                <div
                  class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
                >
                  <h3
                    class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
                  >
                    评论
                  </h3>
                  <CommentSystem
                    :default-system="'twikoo'"
                    :show-selector="true"
                    :theme="'auto'"
                    :term="selectedPost.title"
                    :enable-twikoo="true"
                    :enable-giscus="true"
                  />
                </div>
              </div>

              <!-- 右侧5%空白 -->
              <div class="w-[5%] flex-shrink-0"></div>
            </div>
          </div>

          <!-- 右侧空白区域 10% -->
          <div
            :class="[
              showToc && tocItems.length > 0 ? 'w-[10%]' : 'w-[10%]',
              'bg-transparent',
            ]"
          ></div>
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

/* 移除花哨动画 */

/* 文章内容容器 - 5%-90%-5%对称布局 */
.article-content {
  max-width: none; /* 移除最大宽度限制，使用父容器的90%宽度 */
  margin: 0 auto;
  padding: 0;
  position: relative;
  width: 100%;
}

/* 在90%容器内保持最佳阅读行长度 */
.article-content .prose {
  max-width: 75ch; /* 在90%容器内的最佳阅读宽度 */
  margin: 0 auto;
}

/* 文章内容区域渐入动画 */
.article-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  border-radius: 2px;
  margin-bottom: 2rem;
}

/* 提升阅读体验的额外样式 */
.markdown-content {
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
}

/* 选中文本样式 */
.markdown-content ::selection {
  background-color: #dbeafe !important;
  color: #1e40af !important;
}

.dark .markdown-content ::selection {
  background-color: #1e3a8a !important;
  color: #bfdbfe !important;
}

/* Markdown 内容基础样式 - 优化阅读体验 */
.markdown-content {
  line-height: 1.8 !important; /* 增加行高提升可读性 */
  color: #374151 !important;
  font-size: 1.125rem !important;
  font-weight: 400 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans SC", sans-serif !important;
  letter-spacing: 0.01em !important; /* 轻微字符间距 */
}

.dark .markdown-content {
  color: #e5e7eb !important;
}

/* 增强的内容样式 */
.enhanced-content {
  text-rendering: optimizeLegibility !important;
  -webkit-font-smoothing: antialiased !important;
  -moz-osx-font-smoothing: grayscale !important;
  hyphens: auto !important; /* 自动断词 */
}

/* 阅读内容特殊样式 */
.reading-content {
  text-align: justify !important; /* 两端对齐 */
  text-justify: inter-ideograph !important; /* 中文优化 */
}

/* 段落样式优化 - 提升阅读体验 */
.markdown-content p {
  margin-bottom: 1.25rem !important; /* 减小段落间距，让内容更紧凑 */
  line-height: 1.8 !important;
  color: #374151 !important;
  text-align: justify !important; /* 两端对齐 */
  text-justify: inter-ideograph !important;
  font-size: 1.125rem !important;
  font-weight: 400 !important;
}

.dark .markdown-content p {
  color: #e5e7eb !important;
}

.markdown-content p:last-child {
  margin-bottom: 0 !important;
}

/* 首段特殊样式 */
.markdown-content > p:first-of-type {
  font-size: 1.2rem !important;
  font-weight: 450 !important;
  color: #1f2937 !important;
  margin-bottom: 2rem !important;
}

.dark .markdown-content > p:first-of-type {
  color: #f3f4f6 !important;
}

/* 移除首字母装饰 */

/* 标题样式优化 - 改进视觉层次和间距 */
.markdown-content h1,
.enhanced-content h1,
.reading-content h1 {
  font-size: 2.25rem !important;
  font-weight: 800 !important;
  line-height: 1.2 !important;
  margin-top: 4rem !important;
  margin-bottom: 0.75rem !important; /* 进一步减小下方间距 */
  color: #111827 !important;
  border-bottom: 2px solid #e5e7eb !important;
  padding-bottom: 1rem !important;
  position: relative !important;
  letter-spacing: -0.025em !important;
}

.markdown-content h1:first-child,
.enhanced-content h1:first-child,
.reading-content h1:first-child {
  margin-top: 2rem !important;
}

.dark .markdown-content h1,
.dark .enhanced-content h1,
.dark .reading-content h1 {
  color: #f9fafb !important;
  border-bottom-color: #374151 !important;
}

/* H1 装饰线 */
.markdown-content h1::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 1px;
}

.markdown-content h2,
.enhanced-content h2,
.reading-content h2 {
  font-size: 1.75rem !important;
  font-weight: 700 !important;
  line-height: 1.3 !important;
  margin-top: 3rem !important;
  margin-bottom: 0.5rem !important; /* 进一步减小下方间距 */
  color: #1f2937 !important;
  border-left: 4px solid #3b82f6 !important;
  padding-left: 1rem !important;
  position: relative !important;
  letter-spacing: -0.015em !important;
}

.dark .markdown-content h2,
.dark .enhanced-content h2,
.dark .reading-content h2 {
  color: #f9fafb !important;
}

/* H2 背景装饰 */
.markdown-content h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

.markdown-content h3,
.enhanced-content h3,
.reading-content h3 {
  font-size: 1.375rem !important;
  font-weight: 650 !important;
  line-height: 1.4 !important;
  margin-top: 2.5rem !important;
  margin-bottom: 0.375rem !important; /* 进一步减小下方间距 */
  color: #374151 !important;
  position: relative !important;
  padding-left: 0.5rem !important;
}

.dark .markdown-content h3,
.dark .enhanced-content h3,
.dark .reading-content h3 {
  color: #e5e7eb !important;
}

/* H3 装饰点 */
.markdown-content h3::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
}

.markdown-content h4,
.enhanced-content h4,
.reading-content h4 {
  font-size: 1.25rem !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin-top: 2rem !important;
  margin-bottom: 0.25rem !important; /* 进一步减小下方间距 */
  color: #374151 !important;
}

.dark .markdown-content h4,
.dark .enhanced-content h4,
.dark .reading-content h4 {
  color: #e5e7eb !important;
}

.markdown-content h5,
.enhanced-content h5,
.reading-content h5 {
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin-top: 1.75rem !important;
  margin-bottom: 0.25rem !important; /* 进一步减小下方间距 */
  color: #374151 !important;
}

.dark .markdown-content h5,
.dark .enhanced-content h5,
.dark .reading-content h5 {
  color: #e5e7eb !important;
}

.markdown-content h6,
.enhanced-content h6,
.reading-content h6 {
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  line-height: 1.4 !important;
  margin-top: 1.5rem !important;
  margin-bottom: 0.125rem !important; /* 进一步减小下方间距 */
  color: #374151 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

.dark .markdown-content h6,
.dark .enhanced-content h6,
.dark .reading-content h6 {
  color: #e5e7eb !important;
}

/* 列表样式优化 */
.markdown-content ul,
.markdown-content ol {
  margin-bottom: 1.5rem !important;
  padding-left: 1.75rem !important;
}

.markdown-content ul {
  list-style-type: disc !important;
}

.markdown-content ol {
  list-style-type: decimal !important;
}

.markdown-content ul li,
.markdown-content ol li {
  margin-bottom: 0.5rem !important;
  line-height: 1.75 !important;
  color: #374151 !important;
}

.dark .markdown-content ul li,
.dark .markdown-content ol li {
  color: #e5e7eb !important;
}

/* 嵌套列表样式 */
.markdown-content ul ul,
.markdown-content ol ol,
.markdown-content ul ol,
.markdown-content ol ul {
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

/* 强调文本样式 */
.markdown-content strong {
  font-weight: 600 !important;
  color: #111827 !important;
}

.dark .markdown-content strong {
  color: #f9fafb !important;
}

/* 内联代码样式 - 确保正确显示，覆盖Tailwind Typography插件的默认样式 */
.prose code:not(pre code),
.prose-lg code:not(pre code),
.markdown-content code:not(pre code),
.enhanced-content code:not(pre code),
.reading-content code:not(pre code) {
  background-color: #f3f4f6 !important;
  color: #dc2626 !important;
  padding: 0.125rem 0.375rem !important;
  border-radius: 0.25rem !important;
  font-size: 0.875rem !important;
  font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Courier New",
    monospace !important;
  font-weight: 500 !important;
  border: 1px solid #e5e7eb !important;
  vertical-align: baseline !important;
  line-height: 1.4 !important;
}

/* 确保行内代码不显示反引号 - 覆盖任何可能添加反引号的样式 */
.prose code:not(pre code)::before,
.prose code:not(pre code)::after,
.prose-lg code:not(pre code)::before,
.prose-lg code:not(pre code)::after,
.markdown-content code:not(pre code)::before,
.markdown-content code:not(pre code)::after,
.enhanced-content code:not(pre code)::before,
.enhanced-content code:not(pre code)::after,
.reading-content code:not(pre code)::before,
.reading-content code:not(pre code)::after {
  content: "" !important;
  display: none !important;
}

.dark .prose code:not(pre code),
.dark .prose-lg code:not(pre code),
.dark .markdown-content code:not(pre code),
.dark .enhanced-content code:not(pre code),
.dark .reading-content code:not(pre code) {
  background-color: #374151 !important;
  color: #fca5a5 !important;
  border-color: #4b5563 !important;
}

/* 代码块样式 */
.markdown-content pre {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  padding: 1.25rem !important;
  border-radius: 0.5rem !important;
  overflow-x: auto !important;
  margin: 1.5rem 0 !important;
  position: relative !important;
}

.dark .markdown-content pre {
  background-color: #1e293b !important;
  border-color: #475569 !important;
}

/* 代码块内的代码样式 - 覆盖行内代码样式 */
.markdown-content pre code {
  background-color: transparent !important;
  color: #334155 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  font-size: 0.875rem !important;
  border: none !important;
  vertical-align: baseline !important;
  line-height: inherit !important;
}

.dark .markdown-content pre code {
  color: #e2e8f0 !important;
}

/* 引用块样式 - 增强视觉效果 */
.markdown-content blockquote {
  border-left: 4px solid #3b82f6 !important;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08) 0%,
    rgba(139, 92, 246, 0.08) 100%
  ) !important;
  padding: 1.75rem !important;
  margin: 1rem 0 !important; /* 进一步减小引用块间距，与代码块保持一致 */
  border-radius: 0 1rem 1rem 0 !important;
  font-style: italic !important;
  color: #374151 !important;
  position: relative !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.1) !important;
  border-left: 4px solid #3b82f6 !important;
  font-size: 1.0625rem !important;
  line-height: 1.75 !important;
}

.dark .markdown-content blockquote {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(139, 92, 246, 0.15) 100%
  ) !important;
  color: #e5e7eb !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
  border-color: rgba(59, 130, 246, 0.2) !important;
}

/* 引用块装饰 */
.markdown-content blockquote::before {
  content: '"';
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  font-size: 3rem;
  color: #3b82f6;
  opacity: 0.3;
  font-family: serif;
  line-height: 1;
}

/* 链接样式 */
.markdown-content a {
  color: #3b82f6 !important;
  text-decoration: underline !important;
  text-decoration-thickness: 1px !important;
  text-underline-offset: 2px !important;
  font-weight: 500 !important;
  transition: color 0.2s ease !important;
}

.markdown-content a:hover {
  color: #1d4ed8 !important;
}

.dark .markdown-content a {
  color: #60a5fa !important;
}

.dark .markdown-content a:hover {
  color: #93c5fd !important;
}

/* 分隔线样式 */
.markdown-content hr {
  border: none !important;
  border-top: 1px solid #e5e7eb !important;
  margin: 1rem 0 !important; /* 进一步减小表格间距，与代码块保持一致 */
}

.dark .markdown-content hr {
  border-top-color: #374151 !important;
}

/* 表格样式 */
.markdown-content table {
  width: 100% !important;
  border-collapse: separate !important;
  border-spacing: 0 !important;
  margin: 2.5rem 0 !important;
  border-radius: 0.75rem !important;
  overflow: hidden !important;
  border: 1px solid #e5e7eb !important;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 10px rgba(0, 0, 0, 0.05) !important;
}

.dark .markdown-content table {
  border-color: #374151 !important;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.3),
    0 4px 10px rgba(0, 0, 0, 0.2) !important;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #e5e7eb !important;
  padding: 1rem 1.25rem !important;
  text-align: left !important;
  line-height: 1.6 !important;
  transition: all 0.2s ease !important;
}

.dark .markdown-content th,
.dark .markdown-content td {
  border-color: #374151 !important;
}

.markdown-content th {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  font-weight: 600 !important;
  color: #374151 !important;
  font-size: 0.9375rem !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  border-bottom: 2px solid #e5e7eb !important;
}

.dark .markdown-content th {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  color: #e2e8f0 !important;
  border-bottom-color: #475569 !important;
}

.markdown-content td {
  color: #374151 !important;
}

.dark .markdown-content td {
  color: #e5e7eb !important;
}

/* 表格行悬停效果 */
.markdown-content tbody tr:hover td {
  background-color: rgba(59, 130, 246, 0.05) !important;
}

.dark .markdown-content tbody tr:hover td {
  background-color: rgba(59, 130, 246, 0.1) !important;
}

/* 表格最后一行 */
.markdown-content tbody tr:last-child td {
  border-bottom: none !important;
}

/* 图片样式 */
.markdown-content img {
  max-width: 100% !important;
  height: auto !important;
  border-radius: 0.5rem !important;
  margin: 2rem auto !important;
  display: block !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
}

.dark .markdown-content img {
  border-color: #374151 !important;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3) !important;
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
  max-width: 85ch !important; /* 全屏模式下更宽的阅读区域 */
}

/* 全屏模式下的标题间距优化 */
.prose.prose-lg h1:first-child {
  margin-top: 0 !important;
}

/* 全屏模式下的文章容器 */
.article-content.full-width .prose {
  max-width: 85ch !important; /* 全屏模式下更宽的阅读区域 */
}

/* 全屏模式下的段落优化 */
.full-width .markdown-content p {
  font-size: 1.1875rem !important;
  line-height: 1.8 !important;
  margin-bottom: 1.875rem !important;
}

/* 全屏模式下的标题优化 */
.full-width .markdown-content h1 {
  font-size: 2.5rem !important;
  margin-top: 4.5rem !important;
  margin-bottom: 1.5rem !important; /* 减小下方间距 */
}

.full-width .markdown-content h2 {
  font-size: 2rem !important;
  margin-top: 3.5rem !important;
  margin-bottom: 1.25rem !important; /* 减小下方间距 */
}

.full-width .markdown-content h3 {
  font-size: 1.5rem !important;
  margin-top: 3rem !important;
  margin-bottom: 1rem !important; /* 减小下方间距 */
}

/* 全屏模态框背景模糊效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* 目录样式优化 - 紧凑间距设计 */
.toc-item {
  position: relative;
  border-radius: 6px !important;
  line-height: 1.4 !important; /* 减小行高使目录更紧凑 */
}

.toc-level-1 {
  margin-left: 0;
  font-weight: 700;
  font-size: 0.95rem; /* 稍微减小字体 */
  margin-bottom: 0.125rem; /* 添加小间距区分层级 */
}

.toc-level-2 {
  margin-left: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.0625rem; /* 更小的间距 */
}

.toc-level-3 {
  margin-left: 1.5rem;
  font-weight: 500;
  font-size: 0.85rem;
  margin-bottom: 0.0625rem;
}

.toc-level-4 {
  margin-left: 2.25rem;
  font-weight: 500;
  font-size: 0.8rem;
  margin-bottom: 0.0625rem;
}

.toc-level-5 {
  margin-left: 3rem;
  font-weight: 400;
  font-size: 0.75rem;
  margin-bottom: 0.0625rem;
}

.toc-level-6 {
  margin-left: 3.75rem;
  font-weight: 400;
  font-size: 0.75rem;
  margin-bottom: 0.0625rem;
}

/* 布局动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.w-\[20\%\] {
  animation: slideIn 0.3s ease-out;
}

/* 隐藏滚动条 */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 布局动画 */
.w-\[20\%\] {
  animation: slideIn 0.3s ease-out;
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

/* 响应式优化 - 移动端阅读体验 */
@media (max-width: 768px) {
  /* 移动端调整为传统布局 */
  .w-full.flex {
    display: block !important;
  }

  .w-\[5\%\] {
    display: none !important;
  }

  .w-\[90\%\] {
    width: 100% !important;
    padding: 0 1rem !important;
  }

  /* 移动端文章容器 */
  .article-content {
    width: 100%;
    padding: 0;
  }

  .article-content .prose {
    max-width: 100% !important;
    margin: 0;
  }

  /* 移动端字体调整 */
  .markdown-content {
    font-size: 1.0625rem !important; /* 稍大的字体提升移动端可读性 */
    line-height: 1.75 !important;
    letter-spacing: 0.015em !important;
  }

  .markdown-content p {
    margin-bottom: 1rem !important; /* 移动端进一步减小段落间距 */
    line-height: 1.75 !important;
    text-align: left !important; /* 移动端左对齐更好 */
  }

  /* 移动端首段样式 */
  .markdown-content > p:first-of-type {
    font-size: 1.125rem !important;
    margin-bottom: 1.25rem !important; /* 减小首段下方间距 */
  }

  /* 移动端标题调整 - 优化层级和间距 */
  .markdown-content h1 {
    font-size: 1.875rem !important;
    margin-top: 2.5rem !important;
    margin-bottom: 1rem !important; /* 减小下方间距 */
    padding-bottom: 0.75rem !important;
  }

  .markdown-content h1:first-child {
    margin-top: 1.5rem !important;
  }

  .markdown-content h2 {
    font-size: 1.5rem !important;
    margin-top: 2.25rem !important;
    margin-bottom: 0.75rem !important; /* 减小下方间距 */
    padding-left: 0.75rem !important;
  }

  .markdown-content h3 {
    font-size: 1.25rem !important;
    margin-top: 2rem !important;
    margin-bottom: 0.5rem !important; /* 减小下方间距 */
  }

  .markdown-content h4 {
    font-size: 1.125rem !important;
    margin-top: 1.75rem !important;
    margin-bottom: 0.375rem !important; /* 减小下方间距 */
  }

  .markdown-content h5 {
    font-size: 1.0625rem !important;
    margin-top: 1.5rem !important;
    margin-bottom: 0.375rem !important; /* 减小下方间距 */
  }

  .markdown-content h6 {
    font-size: 0.9375rem !important;
    margin-top: 1.25rem !important;
    margin-bottom: 0.25rem !important; /* 减小下方间距 */
  }

  /* 移动端代码块优化 */
  .markdown-content pre {
    padding: 1rem !important;
    margin: 1rem 0 !important;
    border-radius: 0.375rem !important;
  }

  .markdown-content pre code {
    font-size: 0.8rem !important;
  }

  /* 移动端表格优化 */
  .markdown-content table {
    font-size: 0.875rem !important;
  }

  .markdown-content th,
  .markdown-content td {
    padding: 0.5rem !important;
  }

  /* 移动端头部优化 */
  .px-8 {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* 移动端悬浮目录优化 */
  .fixed.top-1\/2.left-8 {
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 85vw !important;
    max-width: 320px !important;
    max-height: 65vh !important;
    border-radius: 1rem !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    box-shadow:
      0 25px 50px rgba(0, 0, 0, 0.15),
      0 10px 20px rgba(0, 0, 0, 0.1) !important;
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

  /* 移动端内容优化 */
  .enhanced-content {
    font-size: 1rem !important;
    line-height: 1.7 !important;
  }

  .enhanced-content p {
    text-align: left !important;
    margin-bottom: 1.25rem !important;
  }

  /* 移动端标题优化 */
  .markdown-content h1 {
    font-size: 1.75rem !important;
    margin-top: 2rem !important;
    margin-bottom: 1rem !important;
  }

  .markdown-content h2 {
    font-size: 1.5rem !important;
    margin-top: 1.5rem !important;
    margin-bottom: 0.75rem !important;
  }

  .markdown-content h2::before {
    left: -0.5rem;
    width: 3px;
    height: 1.25rem;
  }

  .markdown-content h3 {
    font-size: 1.25rem !important;
    margin-top: 1.25rem !important;
    margin-bottom: 0.5rem !important;
  }

  /* 移动端代码块优化 */
  .markdown-content pre {
    margin: 1.5rem -1rem !important;
    border-radius: 0 !important;
    padding: 1rem !important;
  }

  .markdown-content pre .copy-button {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem;
  }

  /* 移动端文章正文优化 */
  .enhanced-content > p:first-child::first-letter {
    font-size: 2.5rem !important;
    line-height: 2rem !important;
    padding-right: 0.375rem !important;
  }

  /* 移动端头部信息优化 */
  .text-3xl.md\:text-4xl {
    font-size: 1.75rem !important;
  }

  /* 移动端元信息优化 */
  .flex.items-center.justify-center.flex-wrap.gap-4 {
    gap: 0.75rem !important;
    flex-direction: column !important;
  }

  .flex.items-center.gap-2 {
    justify-content: center !important;
  }

  /* 移动端内容区域优化 */
  .p-6.lg\:p-8 {
    padding: 1rem !important;
  }

  /* 移动端文章容器优化 */
  .px-20 {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }

  .max-w-5xl {
    max-width: 100% !important;
  }

  /* 移动端列表优化 */
  .markdown-content ul li,
  .markdown-content ol li {
    padding-left: 1.5rem !important;
  }

  .markdown-content ol li::before {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.625rem;
  }

  /* 移动端悬浮按钮优化 */
  .floating-buttons {
    bottom: 1.25rem !important;
    right: 1rem !important;
    gap: 0.75rem !important;
  }

  .floating-buttons button {
    width: 44px !important;
    height: 44px !important;
    padding: 0 !important;
    box-shadow:
      0 8px 25px rgba(0, 0, 0, 0.15),
      0 4px 10px rgba(0, 0, 0, 0.1) !important;
  }

  .floating-buttons svg {
    width: 1rem !important;
    height: 1rem !important;
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

  /* 移动端元信息卡片优化 */
  .inline-flex.items-center.justify-center.flex-wrap.gap-6 {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .inline-flex.items-center.justify-center.flex-wrap.gap-6 > div {
    width: 100%;
    justify-content: center;
  }

  /* 移动端主要内容区域边距重置 */
  #modal-content {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  /* 移动端新布局调整 */
  .w-full.h-full.flex {
    flex-direction: column !important;
  }

  .w-\[10\%\] {
    display: none !important;
  }

  .w-\[20\%\] {
    width: 100% !important;
    height: auto !important;
    max-height: 40vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 50 !important;
    transform: translateY(-100%) !important;
    transition: transform 0.3s ease !important;
  }

  .w-\[20\%\].show {
    transform: translateY(0) !important;
  }

  .w-\[60\%\] {
    width: 100% !important;
    height: 100% !important;
  }

  /* 移动端文章内容容器 */
  .w-full.px-8 {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}

/* 代码块增强样式 */
.markdown-content pre {
  position: relative !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 20px !important;
  padding: 1.75rem !important;
  margin: 2.5rem 0 !important;
  overflow-x: auto !important;
  box-shadow:
    0 10px 30px -5px rgba(0, 0, 0, 0.1),
    0 6px 8px -2px rgba(0, 0, 0, 0.05) !important;
  transition: all 0.3s ease !important;
}

.markdown-content pre:hover {
  box-shadow:
    0 15px 40px -5px rgba(0, 0, 0, 0.15),
    0 8px 12px -2px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-3px) !important;
}

.dark .markdown-content pre {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%) !important;
  border-color: #475569 !important;
  box-shadow:
    0 10px 30px -5px rgba(0, 0, 0, 0.3),
    0 6px 8px -2px rgba(0, 0, 0, 0.2) !important;
}

.dark .markdown-content pre:hover {
  box-shadow:
    0 15px 40px -5px rgba(0, 0, 0, 0.4),
    0 8px 12px -2px rgba(0, 0, 0, 0.3) !important;
}

.markdown-content pre code {
  background: transparent !important;
  color: #334155 !important;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", "Consolas",
    "Liberation Mono", "Menlo", monospace !important;
  font-size: 0.9rem !important;
  line-height: 1.7 !important;
  font-weight: 400 !important;
  letter-spacing: 0.025em !important;
}

.dark .markdown-content pre code {
  color: #e2e8f0 !important;
}

/* 复制按钮样式优化 */
.markdown-content pre .copy-button {
  position: absolute !important;
  top: 12px !important;
  right: 12px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 10px !important;
  padding: 8px !important;
  color: #6b7280 !important;
  transition: all 0.2s ease !important;
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.1) !important;
  opacity: 0 !important;
  transform: translateY(-2px) !important;
}

.dark .markdown-content pre .copy-button {
  background: rgba(31, 41, 55, 0.9) !important;
  border-color: rgba(75, 85, 99, 0.3) !important;
  color: #9ca3af !important;
}

.markdown-content pre:hover .copy-button {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

.markdown-content pre .copy-button:hover {
  background: rgba(255, 255, 255, 1) !important;
  color: #374151 !important;
  transform: scale(1.05) !important;
  box-shadow: 0 6px 16px -2px rgba(0, 0, 0, 0.15) !important;
}

.dark .markdown-content pre .copy-button:hover {
  background: rgba(31, 41, 55, 1) !important;
  color: #e5e7eb !important;
}

/* 桌面端布局优化 */
@media (min-width: 769px) {
  .w-full.h-full.flex {
    flex-direction: row !important;
  }

  .w-\[10\%\] {
    display: block !important;
  }

  .w-\[20\%\] {
    position: static !important;
    transform: none !important;
    width: 20% !important;
    height: 100% !important;
    max-height: none !important;
  }

  .w-\[60\%\] {
    width: 60% !important;
  }
}

.markdown-content pre .copy-button:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.15) !important;
}

.dark .markdown-content pre .copy-button {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* 代码块语言标签 */
.markdown-content pre::before {
  content: attr(data-language);
  position: absolute;
  top: 0.75rem;
  left: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.dark .markdown-content pre::before {
  color: #94a3b8;
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
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  }
  50% {
    box-shadow: 0 0 25px rgba(59, 130, 246, 0.9);
  }
}

.fixed.top-0 .bg-gradient-to-r {
  animation: progress-glow 3s ease-in-out infinite;
  background-size: 200% 100%;
  animation:
    progress-glow 3s ease-in-out infinite,
    gradient-move 8s ease-in-out infinite;
}

@keyframes gradient-move {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 内容区域滚动优化 */
.overflow-y-auto {
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

/* 内容区域动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 应用动画 */
.enhanced-content {
  animation: fadeInUp 0.6s ease-out;
}

/* 头部信息动画 */
.text-center.mb-8.pb-6.relative {
  animation: scaleIn 0.6s ease-out;
}

/* 内容区域动画 */
.bg-white.dark\:bg-gray-800.rounded-2xl.shadow-lg {
  animation: fadeInUp 0.5s ease-out 0.2s both;
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
