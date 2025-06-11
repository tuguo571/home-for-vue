// 简单测试markdown-it的行内代码处理
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
})

const testText = '这是一个包含 `printf()` 函数的测试文本。'
const result = md.render(testText)

console.log('输入:', testText)
console.log('输出:', result)
console.log('HTML:', result.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
