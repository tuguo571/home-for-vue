---
title: "新的 Markdown 解析器测试"
date: "2024-12-20"
category: "技术测试"
description: "测试新的 markdown-it + Prism.js 解析器的功能，包括语法高亮和复制按钮"
---

# 新的 Markdown 解析器测试

这篇文章用于测试新的 markdown-it + Prism.js 解析器的各种功能。

## 代码块测试

### JavaScript 代码

```javascript
// JavaScript 示例代码
function greetUser(name) {
  const message = `Hello, ${name}!`;
  console.log(message);
  return message;
}

// 使用箭头函数
const calculateSum = (a, b) => {
  return a + b;
};

// 异步函数
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

### TypeScript 代码

```typescript
// TypeScript 示例代码
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getActiveUsers(): User[] {
    return this.users.filter(user => user.isActive !== false);
  }
}

// 泛型函数
function createResponse<T>(data: T, success: boolean): ApiResponse<T> {
  return {
    data,
    success,
    timestamp: new Date().toISOString()
  };
}
```

### Vue.js 组件

```vue
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
    <button @click="toggleActive" :class="buttonClass">
      {{ user.isActive ? '停用' : '激活' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  updateUser: [user: User];
}>();

const buttonClass = computed(() => ({
  'btn-primary': props.user.isActive,
  'btn-secondary': !props.user.isActive
}));

function toggleActive() {
  const updatedUser = {
    ...props.user,
    isActive: !props.user.isActive
  };
  emit('updateUser', updatedUser);
}
</script>

<style scoped>
.user-card {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}
</style>
```

### Python 代码

```python
# Python 示例代码
import asyncio
import aiohttp
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    email: str
    is_active: bool = True

class UserRepository:
    def __init__(self):
        self.users: List[User] = []
    
    def add_user(self, user: User) -> None:
        self.users.append(user)
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        return next((user for user in self.users if user.id == user_id), None)
    
    def get_active_users(self) -> List[User]:
        return [user for user in self.users if user.is_active]

async def fetch_user_data(session: aiohttp.ClientSession, url: str) -> Dict:
    async with session.get(url) as response:
        if response.status == 200:
            return await response.json()
        else:
            raise Exception(f"HTTP {response.status}: {await response.text()}")

async def main():
    async with aiohttp.ClientSession() as session:
        try:
            data = await fetch_user_data(session, "https://api.example.com/users")
            print(f"Fetched {len(data)} users")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```

### CSS 样式

```css
/* CSS 示例代码 */
.markdown-content {
  line-height: 1.75;
  color: #374151;
  font-size: 1.125rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.code-block {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 1.75rem;
  margin: 2.5rem 0;
  overflow-x: auto;
  box-shadow: 
    0 10px 30px -5px rgba(0, 0, 0, 0.1),
    0 6px 8px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.code-block:hover {
  box-shadow: 
    0 15px 40px -5px rgba(0, 0, 0, 0.15),
    0 8px 12px -2px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .code-block {
    margin: 1.5rem -1rem;
    border-radius: 0;
    padding: 1rem;
  }
}
```

### JSON 数据

```json
{
  "name": "enhanced-markdown-parser",
  "version": "1.0.0",
  "description": "Enhanced markdown parser with syntax highlighting",
  "dependencies": {
    "markdown-it": "^13.0.2",
    "prismjs": "^1.29.0",
    "@types/markdown-it": "^13.0.7",
    "@types/prismjs": "^1.26.3"
  },
  "features": [
    "Syntax highlighting for multiple languages",
    "Copy button for code blocks",
    "Clean and practical design",
    "Dark mode support",
    "Responsive layout"
  ],
  "config": {
    "theme": "custom",
    "languages": [
      "javascript",
      "typescript",
      "vue",
      "python",
      "css",
      "json",
      "yaml",
      "bash"
    ]
  }
}
```

## 其他 Markdown 功能测试

### 列表

- **无序列表项 1**
- *无序列表项 2*
- 无序列表项 3
  - 嵌套列表项 1
  - 嵌套列表项 2

1. **有序列表项 1**
2. *有序列表项 2*
3. 有序列表项 3
   1. 嵌套有序列表项 1
   2. 嵌套有序列表项 2

### 引用块

> 这是一个引用块的示例。新的 markdown-it 解析器应该能够正确处理引用块，并应用适当的样式。
> 
> 引用块可以包含多个段落，也可以包含其他 markdown 元素。

### 链接和强调

这里有一个 [链接到 GitHub](https://github.com) 的示例。

文本可以是 **粗体**、*斜体* 或者 `行内代码`。

### 分隔线

---

### 表格

| 功能 | 旧解析器 | 新解析器 |
|------|----------|----------|
| 语法高亮 | 基础 | 完整支持 |
| 复制按钮 | 手动实现 | 内置支持 |
| 性能 | 一般 | 优秀 |
| 可维护性 | 低 | 高 |

## 总结

新的 markdown-it + Prism.js 解析器提供了以下改进：

1. **更好的语法高亮** - 支持更多编程语言
2. **内置复制按钮** - 每个代码块都有复制功能
3. **更好的性能** - 更快的解析和渲染
4. **更好的可维护性** - 使用成熟的库而不是自定义实现
5. **更好的用户体验** - 清洁实用的设计

测试完成！🎉
