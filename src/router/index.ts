import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw, RouteMeta } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    title: string;
    transition?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/HomeView.vue"),
    meta: {
      title: "首页",
      transition: "scale",
    },
  },
  {
    path: "/projects",
    name: "Projects",
    component: () => import("@/views/ProjectsView.vue"),
    meta: {
      title: "项目",
      transition: "slide-left",
    },
  },
  {
    path: "/tools",
    name: "Tools",
    component: () => import("@/views/ToolsView.vue"),
    meta: {
      title: "工具箱",
      transition: "fade",
    },
    children: [
      {
        path: "json",
        name: "JsonFormatter",
        component: () => import("@/views/tools/JsonFormatterView.vue"),
        meta: {
          title: "JSON 格式化",
          transition: "fade",
        },
      },
      {
        path: "bookmarks",
        name: "Bookmarks",
        component: () => import("@/views/tools/BookmarksView.vue"),
        meta: {
          title: "网址导航",
          transition: "fade",
        },
      },
      {
        path: "timestamp",
        name: "Timestamp",
        component: () => import("@/views/tools/TimestampView.vue"),
        meta: {
          title: "时间戳转换",
          transition: "fade",
        },
      },
    ],
  },
  {
    path: "/skills",
    name: "Skills",
    component: () => import("@/views/SkillsView.vue"),
    meta: {
      title: "技能",
      transition: "slide-right",
    },
  },
  {
    path: "/blog",
    name: "Blog",
    component: () => import("@/views/BlogView.vue"),
    meta: {
      title: "博客",
      transition: "slide-left",
    },
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("@/views/ContactView.vue"),
    meta: {
      title: "联系",
      transition: "scale",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Handsome`;
  next();
});

export default router;
