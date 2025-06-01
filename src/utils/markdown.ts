import { marked } from 'marked'
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

// 简单的markdown转HTML函数（基础版本）
function simpleMarkdownToHtml(markdown: string): string {
  return markdown
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // 粗体
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // 代码块
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    // 行内代码
    .replace(/`([^`]*)`/gim, '<code>$1</code>')
    // 链接
    .replace(/\[([^\]]*)\]\(([^\)]*)\)/gim, '<a href="$2">$1</a>')
    // 无序列表
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // 段落
    .replace(/\n\n/gim, '</p><p>')
    .replace(/^(?!<[h|u|p|l])(.*)$/gim, '<p>$1</p>')
    // 清理多余的p标签
    .replace(/<p><\/p>/gim, '')
    .replace(/<p>(<h[1-6]>)/gim, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/gim, '$1')
    .replace(/<p>(<ul>)/gim, '$1')
    .replace(/(<\/ul>)<\/p>/gim, '$1')
    .replace(/<p>(<pre>)/gim, '$1')
    .replace(/(<\/pre>)<\/p>/gim, '$1')
}

// 获取所有博客文章
export const fetchLocalBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts: BlogPost[] = []

    // 导入所有markdown文件
    const modules = import.meta.glob('../assets/blogs/*.md', { as: 'raw' })

    for (const path in modules) {
      try {
        const content = await modules[path]()
        const filename = path.split('/').pop() || ''

        // 解析前置元数据和内容
        const { metadata, content: markdownContent } = parseFrontMatter(content)

        // 将markdown转换为HTML
        const htmlContent = typeof marked === 'function' ? await marked(markdownContent) : simpleMarkdownToHtml(markdownContent)

        // 创建博客文章对象
        const post: BlogPost = {
          title: metadata.title,
          link: `#/blog/${filename.replace('.md', '')}`,
          date: new Date(metadata.date),
          description: metadata.description,
          category: metadata.category,
          content: htmlContent
        }

        posts.push(post)
      } catch (error) {
        console.warn(`Failed to load blog post from ${path}:`, error)
      }
    }

    // 按日期倒序排列
    return posts.sort((a, b) => b.date.getTime() - a.date.getTime())
  } catch (error) {
    console.error('Failed to fetch local blog posts:', error)
    return []
  }
}

// 根据文件名获取单篇博客文章
export const fetchBlogPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const posts = await fetchLocalBlogPosts()
  return posts.find(post => post.link.includes(slug)) || null
}
