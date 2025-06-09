---
title: "Markdown渲染测试"
date: "2024-01-31"
category: "测试"
description: "测试各种markdown语法的渲染效果"
---

# Markdown渲染测试

这是一个测试文章，用来验证markdown语法的渲染效果。

## 文本格式

这是普通文本。

**这是粗体文本**

*这是斜体文本*

`这是行内代码`

## 代码块

```javascript
function hello() {
  console.log('Hello, World!')
  return 'success'
}
```

```python
def greet(name):
    print(f"Hello, {name}!")
    return True
```

## 列表

### 无序列表

- 第一项
- 第二项
- 第三项

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 链接

这是一个[链接示例](https://www.example.com)。

## 引用

> 这是一个引用块
> 可以包含多行内容

## 分割线

---

## 混合内容测试

这里有一个包含**粗体**和*斜体*以及`行内代码`的段落。

还有一个[链接到Vue官网](https://vuejs.org)的示例。

### 嵌套列表

- 主要项目1
  - 子项目1.1
  - 子项目1.2
- 主要项目2
  - 子项目2.1

### 代码和文本混合

在JavaScript中，你可以这样定义函数：

```javascript
const greet = (name) => {
  return `Hello, ${name}!`
}
```

然后调用它：`greet('World')`

## 总结

如果你能看到上面的内容都正确渲染了，说明markdown解析器工作正常！

**测试项目清单：**

1. ✅ 标题渲染
2. ✅ 文本格式（粗体、斜体）
3. ✅ 代码块和行内代码
4. ✅ 列表（有序和无序）
5. ✅ 链接
6. ✅ 引用块
7. ✅ 分割线
8. ✅ 混合内容
