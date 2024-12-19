<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import ThemeToggle from "@/components/ThemeToggle.vue";

const route = useRoute();
const isMenuOpen = ref(false);

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeMenu();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".mobile-menu") && !target.closest(".menu-button")) {
    closeMenu();
  }
};

// 在组件挂载时添加事件监听
onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  window.addEventListener("keydown", handleKeydown);
});

// 在组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("keydown", handleKeydown);
});

const navItems = [
  { name: "首页", path: "/" },
  {
    name: "项目",
    path: "/projects",
    children: [
      { name: "实用工具", path: "/projects#tools" },
      { name: "个人导航", path: "/projects#bookmarks" },
      { name: "个人站点", path: "/projects#sites" },
    ],
  },
  { name: "技能", path: "/skills" },
  { name: "博客", path: "/blog" },
  { name: "联系", path: "/contact" },
];

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <header
    class="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
  >
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <router-link to="/" class="text-2xl font-bold"> Handsome </router-link>

        <!-- 桌面端导航 -->
        <div class="hidden md:flex items-center space-x-6">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ 'text-primary': route.path === item.path }"
          >
            {{ item.name }}
          </router-link>
          <ThemeToggle />
        </div>

        <!-- 移动端菜单按钮 -->
        <div class="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            class="menu-button p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            @click.stop="toggleMenu"
            aria-label="Toggle menu"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-show="isMenuOpen" class="mobile-menu md:hidden">
          <div class="pt-2 pb-3 space-y-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="block px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{
                'bg-primary/10 text-primary': route.path === item.path,
              }"
              @click="closeMenu"
            >
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </transition>
    </nav>
  </header>
</template>

<style scoped>
.nav-link {
  @apply text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors;
}

.mobile-menu {
  @apply absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
    border-t border-gray-200 dark:border-gray-700 shadow-lg;
}

/* 移动端导航链接悬停效果 */
@media (hover: hover) {
  .mobile-menu .router-link-active {
    @apply bg-primary-10 text-primary;
  }
}
</style>
