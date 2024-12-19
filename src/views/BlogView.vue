<script setup lang="ts">
import { ref, onMounted } from "vue";
import { fetchBlogPosts, type BlogPost } from "@/services/rss";

const posts = ref<BlogPost[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    posts.value = await fetchBlogPosts(import.meta.env.VITE_RSS_URL);
  } catch (err) {
    error.value = "获取博客文章失败";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <!-- 页面标题 -->
    <div class="text-center mb-16">
      <h1 class="text-4xl font-bold mb-4">博客文章</h1>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        分享技术见解、开发经验和个人思考
      </p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"
      ></div>
      <p class="text-gray-600 dark:text-gray-400">正在加载文章...</p>
    </div>

    <!-- 错误提示 -->
    <div
      v-else-if="error"
      class="text-center py-12 px-4 bg-red-50 dark:bg-red-900/50 rounded-xl"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 mx-auto text-red-500 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p class="text-red-600 dark:text-red-400 text-lg font-medium">
        {{ error }}
      </p>
      <button
        @click="() => window.location.reload()"
        class="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
      >
        重试
      </button>
    </div>

    <!-- 文章列表 -->
    <div v-else class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="post in posts"
        :key="post.link"
        class="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
      >
        <a
          :href="post.link"
          target="_blank"
          rel="noopener noreferrer"
          class="block h-full"
        >
          <div class="p-6">
            <!-- 文章标题 -->
            <h2
              class="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors"
            >
              {{ post.title }}
            </h2>

            <!-- 文章元信息 -->
            <div
              class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4"
            >
              <span class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {{ new Date(post.pubDate).toLocaleDateString() }}
              </span>
              <span v-if="post.creator" class="mx-2">·</span>
              <span v-if="post.creator" class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {{ post.creator }}
              </span>
            </div>

            <!-- 文章描述 -->
            <div
              class="text-gray-600 dark:text-gray-300 line-clamp-3 prose dark:prose-invert max-w-none"
              v-html="post.description"
            ></div>

            <!-- 文章分类 -->
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="category in post.categories"
                :key="category"
                class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full transition-colors group-hover:bg-primary/10 group-hover:text-primary"
              >
                {{ category }}
              </span>
            </div>

            <!-- 阅读更多 -->
            <div
              class="mt-6 flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform"
            >
              <span>阅读更多</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 ml-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </a>
      </article>
    </div>
  </div>
</template>
