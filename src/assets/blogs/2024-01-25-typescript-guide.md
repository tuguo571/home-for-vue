---
title: "TypeScript 实用指南"
date: "2024-01-25"
category: "编程语言"
description: "TypeScript的基础知识和实用技巧，帮助你更好地使用类型系统"
---

# TypeScript 实用指南

TypeScript 为 JavaScript 添加了静态类型检查，让我们能够在开发阶段就发现潜在的错误。

## 基础类型

```typescript
// 基本类型
let name: string = "张三"
let age: number = 25
let isStudent: boolean = true

// 数组类型
let numbers: number[] = [1, 2, 3]
let names: Array<string> = ["Alice", "Bob"]

// 对象类型
interface Person {
  name: string
  age: number
  email?: string // 可选属性
}

const person: Person = {
  name: "李四",
  age: 30
}
```

## 高级类型

### 联合类型

```typescript
type Status = "loading" | "success" | "error"

function handleStatus(status: Status) {
  switch (status) {
    case "loading":
      console.log("加载中...")
      break
    case "success":
      console.log("成功！")
      break
    case "error":
      console.log("出错了")
      break
  }
}
```

### 泛型

```typescript
function identity<T>(arg: T): T {
  return arg
}

// 使用泛型
const result = identity<string>("hello")
const number = identity(42) // 类型推导
```

### 工具类型

```typescript
interface User {
  id: number
  name: string
  email: string
  password: string
}

// Partial - 所有属性变为可选
type PartialUser = Partial<User>

// Pick - 选择特定属性
type PublicUser = Pick<User, "id" | "name" | "email">

// Omit - 排除特定属性
type UserWithoutPassword = Omit<User, "password">
```

## 实用技巧

### 1. 类型守卫

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string"
}

function processValue(value: unknown) {
  if (isString(value)) {
    // 这里 value 的类型被缩窄为 string
    console.log(value.toUpperCase())
  }
}
```

### 2. 映射类型

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type ReadonlyUser = Readonly<User>
```

### 3. 条件类型

```typescript
type NonNullable<T> = T extends null | undefined ? never : T

type Result = NonNullable<string | null> // string
```

## 在 Vue 3 中使用 TypeScript

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
}

const todos = ref<Todo[]>([])

const completedTodos = computed(() => 
  todos.value.filter(todo => todo.completed)
)

function addTodo(text: string) {
  todos.value.push({
    id: Date.now(),
    text,
    completed: false
  })
}
</script>
```

## 总结

TypeScript 的类型系统虽然有学习成本，但它能够：

- 提前发现错误
- 提供更好的IDE支持
- 让代码更加自文档化
- 提高重构的安全性

掌握这些基础知识和技巧，你就能在项目中有效地使用 TypeScript 了！
