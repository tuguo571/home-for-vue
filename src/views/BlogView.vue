<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { Ref } from "vue";
import { fetchLocalBlogPosts } from "../utils/markdown";
import type { BlogPost } from "../types/blog";
import PageTransition from "../components/PageTransition.vue";

const posts: Ref<BlogPost[]> = ref([]);
const loading = ref(true);
const error = ref<string | null>(null);
const currentPage = ref(1);
const postsPerPage = 6;

// 文章详情模态框
const showModal = ref(false);
const selectedPost = ref<BlogPost | null>(null);

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
  document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModal() {
  showModal.value = false;
  selectedPost.value = null;
  // 恢复背景滚动
  document.body.style.overflow = 'auto';
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
        <div class="text-center mb-12">
          <h1
            class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient"
          >
            博客文章
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            分享技术见解和学习心得，记录编程之路的点点滴滴
          </p>
        </div>
      </PageTransition>

      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div
          class="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"
        ></div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-500 text-lg mb-4">{{ error }}</p>
        <button
          @click="loadBlogPosts"
          class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all transform hover:scale-105"
        >
          重试
        </button>
      </div>

      <!-- 博客列表 -->
      <div v-else>
        <!-- 文章统计 -->
        <div class="text-center mb-8 text-gray-600 dark:text-gray-400">
          共 {{ posts.length }} 篇文章
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <PageTransition
            v-for="post in currentPosts"
            :key="post.link"
            name="fade"
            class="h-full"
          >
            <article
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
            >
              <div class="p-6 flex-1">
                <div class="flex items-center mb-4 space-x-2">
                  <span
                    class="px-3 py-1 text-sm rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-500 dark:text-blue-300"
                  >
                    {{ post.category }}
                  </span>
                  <time
                    :datetime="post.date.toISOString()"
                    class="text-sm text-tertiary"
                  >
                    {{ formatDate(post.date) }}
                  </time>
                </div>
                <h2
                  class="text-xl font-bold mb-3 hover:text-primary transition-colors line-clamp-2"
                >
                  <button
                    @click="showPostContent(post)"
                    class="text-left w-full hover:text-primary transition-colors"
                  >
                    {{ post.title }}
                  </button>
                </h2>
                <p
                  class="text-secondary line-clamp-3 mb-4 text-sm leading-relaxed"
                  v-html="post.description"
                ></p>
              </div>
              <div class="px-6 py-4 bg-secondary border-t border-light">
                <button
                  @click="showPostContent(post)"
                  class="inline-flex items-center text-primary hover:text-primary-dark transition-colors group"
                >
                  阅读全文
                  <svg
                    class="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>
            </article>
          </PageTransition>
        </div>

        <!-- 分页控件优化 -->
        <div
          v-if="totalPages > 1"
          class="flex justify-center items-center space-x-3 mt-12"
        >
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <span class="flex items-center">
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
            </span>
          </button>
          <div class="flex space-x-2">
            <button
              v-for="page in pageNumbers"
              :key="page"
              @click="changePage(page)"
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-primary/50',
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary',
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <span class="flex items-center">
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
            </span>
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!loading && !error && posts.length === 0"
        class="text-center py-20"
      >
        <svg
          class="w-20 h-20 mx-auto text-gray-400 mb-4"
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
        <p class="text-gray-500 dark:text-gray-400 text-lg">暂无博客文章</p>
      </div>
    </div>

    <!-- 文章详情模态框 -->
    <div
      v-if="showModal && selectedPost"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click="closeModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        @click.stop
      >
        <!-- 模态框头部 -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ selectedPost.title }}
            </h1>
            <div class="flex items-center mt-2 space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                {{ selectedPost.category }}
              </span>
              <time>{{ formatDate(selectedPost.date) }}</time>
            </div>
          </div>
          <button
            @click="closeModal"
            class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 模态框内容 -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div
            class="markdown-content"
            v-html="selectedPost.content"
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

.bg-primary-10 {
  background-color: rgba(59, 130, 246, 0.1);
}

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

/* Markdown 内容样式 */
.markdown-content {
  line-height: 1.7;
  color: var(--color-text-primary);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.markdown-content h1 {
  font-size: 2rem;
  border-bottom: 2px solid var(--color-border-light);
  padding-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid var(--color-border-light);
  padding-bottom: 0.3rem;
}

.markdown-content h3 {
  font-size: 1.25rem;
}

.markdown-content p {
  margin-bottom: 1rem;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content li {
  margin-bottom: 0.5rem;
}

.markdown-content strong {
  font-weight: 600;
  color: var(--color-text-primary);
}

.markdown-content code {
  background-color: var(--color-bg-secondary);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'Courier New', monospace;
}

.markdown-content pre {
  background-color: var(--color-bg-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 4px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: var(--color-text-secondary);
}

.markdown-content a {
  color: var(--color-primary);
  text-decoration: underline;
}

.markdown-content a:hover {
  color: var(--color-primary-dark);
}

.markdown-content hr {
  border: none;
  border-top: 1px solid var(--color-border-light);
  margin: 2rem 0;
}
</style>
