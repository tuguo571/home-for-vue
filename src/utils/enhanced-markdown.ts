import type { BlogPost } from '../types/blog'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'

// Import Prism.js core and common languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-shell-session'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-xml-doc'
import 'prismjs/components/prism-markup-templating'
import 'prismjs/components/prism-handlebars'

// 博客文章的元数据接口
interface BlogMetadata {
  title: string
  date: string
  category: string
  description: string
}

// 创建 markdown-it 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
})

// 自定义代码块渲染器，添加语言标签和复制按钮支持
md.renderer.rules.fence = function (tokens, idx, options, env, renderer) {
  const token = tokens[idx]
  const info = token.info ? token.info.trim() : ''
  const langName = info.split(/\s+/g)[0]
  const langClass = langName ? `language-${langName}` : 'language-text'

  // 使用 Prism.js 进行语法高亮
  let highlighted = token.content
  if (langName && Prism.languages[langName]) {
    try {
      highlighted = Prism.highlight(token.content, Prism.languages[langName], langName)
    } catch (err) {
      console.warn(`Failed to highlight code with language "${langName}":`, err)
      highlighted = md.utils.escapeHtml(token.content)
    }
  } else {
    highlighted = md.utils.escapeHtml(token.content)
  }

  const languageLabel = langName || 'text'

  return `<pre class="language-${langName}" data-language="${languageLabel}"><code class="${langClass}">${highlighted}</code></pre>`
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

// 使用 markdown-it 转换 markdown 为 HTML
function markdownToHtml(markdown: string): string {
  return md.render(markdown)
}

// 获取所有博客文章
export const fetchLocalBlogPosts = async (): Promise<BlogPost[]> => {
  try {
    const posts: BlogPost[] = []

    // 导入所有markdown文件
    const modules = (import.meta as any).glob('../assets/blogs/*.md', { as: 'raw' })

    for (const path in modules) {
      try {
        const content = await modules[path]()
        const filename = path.split('/').pop() || ''

        // 解析前置元数据和内容
        const { metadata, content: markdownContent } = parseFrontMatter(content)

        // 将markdown转换为HTML
        const htmlContent = markdownToHtml(markdownContent)

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

// 为代码块添加复制按钮的函数
export function addCopyButtonsToCodeBlocks() {
  // 等待下一个 tick 确保 DOM 已更新
  setTimeout(() => {
    const codeBlocks = document.querySelectorAll('.markdown-content pre')
    codeBlocks.forEach((block) => {
      // 检查是否已经添加了复制按钮
      if (block.querySelector('.copy-button')) return

      const codeElement = block.querySelector('code')
      if (!codeElement) return

      const copyButton = document.createElement('button')
      copyButton.className = 'copy-button'
      copyButton.innerHTML = `
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      `
      copyButton.title = '复制代码'

      copyButton.addEventListener('click', async () => {
        const code = codeElement.textContent || ''

        try {
          await navigator.clipboard.writeText(code)

          // 显示成功提示
          showCopyToast('代码已复制到剪贴板')

          // 临时改变按钮图标表示复制成功
          copyButton.innerHTML = `
            <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          `
          setTimeout(() => {
            copyButton.innerHTML = `
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            `
          }, 1500)
        } catch (err) {
          console.error('复制失败:', err)
          // 降级方案：选择文本
          const textArea = document.createElement('textarea')
          textArea.value = code
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          showCopyToast('代码已复制到剪贴板')
        }
      })

        // 为代码块添加group类以支持hover效果
        ; (block as HTMLElement).classList.add('group')
      block.appendChild(copyButton)
    })
  }, 0)
}

// 显示复制成功提示
function showCopyToast(message: string) {
  const toast = document.createElement('div')
  toast.textContent = message
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300'
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 300)
  }, 2000)
}
