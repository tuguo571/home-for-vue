import type { BlogPost } from '../types/blog'

// 博客文章的元数据接口
interface BlogMetadata {
  title: string
  date: string
  category: string
  description: string
}

// 解析markdown文件的前置元数据
function parseFrontMatter(content: string): { metadata: BlogMetadata; content: string } {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontMatterRegex)

  if (!match) {
    throw new Error('Invalid markdown format: missing front matter')
  }

  const [, frontMatter, markdownContent] = match
  const metadata: any = {}

  // 解析YAML格式的前置元数据
  frontMatter.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '')
      metadata[key.trim()] = value
    }
  })

  return {
    metadata: metadata as BlogMetadata,
    content: markdownContent.trim()
  }
}

// 模拟博客数据（简化版本，避免动态导入问题）
const mockBlogPosts: BlogPost[] = [
  {
    title: "TypeScript 实用指南",
    link: "#/blog/typescript-guide",
    date: new Date("2024-01-25"),
    description: "TypeScript的基础知识和实用技巧，帮助你更好地使用类型系统",
    category: "编程语言",
    content: `
      <h1>TypeScript 实用指南</h1>
      <p>TypeScript 为 JavaScript 添加了静态类型检查，让我们能够在开发阶段就发现潜在的错误。</p>
      <h2>基础类型</h2>
      <pre><code>// 基本类型
let name: string = "张三"
let age: number = 25
let isStudent: boolean = true</code></pre>
      <p>TypeScript 的类型系统虽然有学习成本，但它能够提前发现错误、提供更好的IDE支持、让代码更加自文档化。</p>
    `
  },
  {
    title: "Vue 3 开发技巧分享",
    link: "#/blog/vue3-tips",
    date: new Date("2024-01-20"),
    description: "分享一些Vue 3开发中的实用技巧和最佳实践",
    category: "前端开发",
    content: `
      <h1>Vue 3 开发技巧分享</h1>
      <p>Vue 3 带来了许多新特性和改进，今天分享一些我在实际开发中总结的技巧。</p>
      <h2>Composition API 的优势</h2>
      <p>Composition API 是 Vue 3 的核心特性之一，它提供了更好的逻辑复用和类型推导。</p>
      <pre><code>&lt;script setup lang="ts"&gt;
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubleCount = computed(() => count.value * 2)
&lt;/script&gt;</code></pre>
      <p>希望这些技巧对你的Vue 3开发有所帮助！</p>
    `
  },
  {
    title: "欢迎来到我的博客",
    link: "#/blog/welcome",
    date: new Date("2024-01-15"),
    description: "这是我的第一篇博客文章，欢迎大家来到我的个人网站！",
    category: "随笔",
    content: `
      <h1>欢迎来到我的博客</h1>
      <p>大家好！欢迎来到我的个人博客。这是我在这个网站上发布的第一篇文章。</p>
      <h2>关于这个博客</h2>
      <p>这个博客将会分享我在技术学习和项目开发过程中的心得体会，包括但不限于：</p>
      <ul>
        <li><strong>前端开发</strong> - Vue.js、React、TypeScript等</li>
        <li><strong>后端技术</strong> - Node.js、Python、数据库等</li>
        <li><strong>工具分享</strong> - 开发工具、效率工具推荐</li>
      </ul>
      <p>感谢你的阅读，希望我的分享对你有所帮助！</p>
    `
  }
]

// 获取所有博客文章
export const fetchLocalBlogPosts = async (): Promise<BlogPost[]> => {
  // 模拟异步加载
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockBlogPosts)
    }, 500)
  })
}

// 根据文件名获取单篇博客文章
export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const posts = await fetchLocalBlogPosts()
  return posts.find(post => post.link.includes(slug)) || null
}
