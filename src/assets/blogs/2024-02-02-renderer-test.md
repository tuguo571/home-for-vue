---
title: "新渲染器测试"
date: "2024-02-02"
category: "测试"
description: "测试新的markdown渲染器功能"
---

# 新渲染器测试

这是一个测试新markdown渲染器的文章。

## 标题测试

### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 文本格式测试

这是普通文本。

**这是粗体文本**

*这是斜体文本*

`这是行内代码`

## 代码块测试

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`)
  return true
}

greet('World')
```

```python
def calculate(a, b):
    result = a + b
    print(f"Result: {result}")
    return result

calculate(5, 3)
```

## 列表测试

### 无序列表

- 第一项
- 第二项
- 第三项

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 链接测试

这是一个[链接示例](https://www.example.com)。

访问[Vue官网](https://vuejs.org)了解更多信息。

## 引用块测试

> 这是一个引用块
> 可以包含多行内容
> 非常有用

## 分割线测试

---

## 混合内容测试

这里有一个包含**粗体**和*斜体*以及`行内代码`的段落。

还有一个[链接到GitHub](https://github.com)的示例。

### 复杂代码示例

```typescript
interface User {
  id: number
  name: string
  email: string
}

class UserService {
  private users: User[] = []
  
  addUser(user: User): void {
    this.users.push(user)
  }
  
  getUser(id: number): User | undefined {
    return this.users.find(u => u.id === id)
  }
}
```

## 总结

如果你能看到上面的内容都正确渲染了，说明新的markdown渲染器工作正常！

**测试项目清单：**

1. ✅ 标题渲染（1-6级）
2. ✅ 文本格式（粗体、斜体、行内代码）
3. ✅ 代码块（带语言标识）
4. ✅ 列表（有序和无序）
5. ✅ 链接
6. ✅ 引用块
7. ✅ 分割线
8. ✅ 混合内容
