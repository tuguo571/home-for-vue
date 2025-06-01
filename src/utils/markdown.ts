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

// 改进的markdown转HTML函数
function markdownToHtml(markdown: string): string {
  // 预处理：标准化换行符
  let content = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // 分割成行进行处理
  const lines = content.split('\n')
  const processedLines: string[] = []
  let inCodeBlock = false
  let codeBlockLanguage = ''
  let codeBlockContent: string[] = []
  let inList = false
  let listItems: string[] = []
  let inBlockquote = false
  let blockquoteLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // 处理代码块
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // 结束代码块
        processedLines.push(`<pre><code class="language-${codeBlockLanguage}">${escapeHtml(codeBlockContent.join('\n'))}</code></pre>`)
        inCodeBlock = false
        codeBlockLanguage = ''
        codeBlockContent = []
      } else {
        // 开始代码块
        codeBlockLanguage = trimmedLine.substring(3).trim() || 'text'
        inCodeBlock = true
        codeBlockContent = []
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent.push(line)
      continue
    }

    // 处理引用块
    if (trimmedLine.startsWith('>')) {
      if (!inBlockquote) {
        inBlockquote = true
        blockquoteLines = []
      }
      blockquoteLines.push(trimmedLine.substring(1).trim())
      continue
    } else if (inBlockquote) {
      // 结束引用块
      processedLines.push(`<blockquote><p>${blockquoteLines.join('<br>')}</p></blockquote>`)
      inBlockquote = false
      blockquoteLines = []
      // 继续处理当前行
    }

    // 处理分割线
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      processedLines.push('<hr>')
      continue
    }

    // 处理标题
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const title = processInlineFormatting(headerMatch[2])
      processedLines.push(`<h${level}>${title}</h${level}>`)
      continue
    }

    // 处理列表
    const unorderedListMatch = trimmedLine.match(/^[-*+]\s+(.+)$/)
    const orderedListMatch = trimmedLine.match(/^\d+\.\s+(.+)$/)

    if (unorderedListMatch || orderedListMatch) {
      const listContent = unorderedListMatch ? unorderedListMatch[1] : orderedListMatch![1]
      const isOrdered = !!orderedListMatch

      if (!inList) {
        inList = true
        listItems = []
        // 记录列表类型
        listItems.push(isOrdered ? 'ol' : 'ul')
      }
      listItems.push(`<li>${processInlineFormatting(listContent)}</li>`)
      continue
    } else if (inList) {
      // 结束列表
      const listType = listItems[0] // 第一个元素是列表类型
      const items = listItems.slice(1) // 其余是列表项
      processedLines.push(`<${listType}>${items.join('')}</${listType}>`)
      inList = false
      listItems = []
    }

    // 处理空行
    if (trimmedLine === '') {
      processedLines.push('')
      continue
    }

    // 处理普通段落
    processedLines.push(`<p>${processInlineFormatting(trimmedLine)}</p>`)
  }

  // 处理未结束的块
  if (inList && listItems.length > 1) {
    const listType = listItems[0] // 第一个元素是列表类型
    const items = listItems.slice(1) // 其余是列表项
    processedLines.push(`<${listType}>${items.join('')}</${listType}>`)
  }

  if (inBlockquote && blockquoteLines.length > 0) {
    processedLines.push(`<blockquote><p>${blockquoteLines.join('<br>')}</p></blockquote>`)
  }

  return processedLines.join('\n')
}

// 处理行内格式
function processInlineFormatting(text: string): string {
  // 处理行内代码（优先级最高）
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 处理链接
  text = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // 处理粗体
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // 处理斜体
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')

  return text
}

// HTML转义函数
function escapeHtml(text: string): string {
  const htmlEscapes: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return text.replace(/[&<>"']/g, (match) => htmlEscapes[match])
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
