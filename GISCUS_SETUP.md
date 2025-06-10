# Giscus 评论系统集成指南

## 📋 概述

本项目已成功集成 Giscus 评论系统，基于 GitHub Discussions 提供现代化的评论功能。用户可以在 Twikoo 和 Giscus 评论系统之间自由切换。

## 🚀 功能特性

- ✅ **Giscus 评论系统**：基于 GitHub Discussions 的评论系统
- ✅ **Twikoo 评论系统**：支持 Markdown、表情、回复等功能
- ✅ **智能切换**：支持在两个评论系统之间切换
- ✅ **响应式设计**：完美适配移动端和桌面端
- ✅ **深色模式支持**：自动适配系统主题
- ✅ **加载状态**：优雅的加载和错误处理
- ✅ **用户偏好记忆**：自动记住用户选择的评论系统

## ⚙️ Giscus 配置说明

### 1. 准备工作

在配置 Giscus 之前，您需要：

1. **GitHub 仓库**：确保您有一个公开的 GitHub 仓库
2. **启用 Discussions**：在仓库设置中启用 Discussions 功能
3. **安装 Giscus App**：访问 [Giscus App](https://github.com/apps/giscus) 并安装到您的仓库

### 2. 获取配置信息

访问 [Giscus 配置页面](https://giscus.app/zh-CN) 并按照以下步骤操作：

1. **输入仓库信息**：
   - 仓库格式：`username/repository-name`
   - 确保仓库是公开的且已启用 Discussions

2. **选择页面 ↔️ discussion 映射关系**：
   - 推荐选择 `pathname`（根据页面路径映射）
   - 也可以选择其他映射方式如 `url`、`title` 等

3. **选择 Discussion 分类**：
   - 推荐选择 `Announcements` 分类
   - 确保该分类存在于您的仓库中

4. **获取配置代码**：
   - 复制生成的配置信息
   - 记录 `data-repo-id` 和 `data-category-id`

### 3. 环境变量配置

在项目根目录创建 `.env` 文件，添加以下配置：

```bash
# Giscus 评论系统配置
VITE_GISCUS_REPO=your-username/your-repo
VITE_GISCUS_REPO_ID=R_kgDOxxxxxxx
VITE_GISCUS_CATEGORY=Announcements
VITE_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxx
VITE_GISCUS_MAPPING=pathname
VITE_GISCUS_STRICT=0
VITE_GISCUS_REACTIONS_ENABLED=1
VITE_GISCUS_EMIT_METADATA=0
VITE_GISCUS_INPUT_POSITION=bottom
VITE_GISCUS_THEME=preferred_color_scheme
VITE_GISCUS_LANG=zh-CN
VITE_GISCUS_LOADING=lazy
```

### 4. 配置参数说明

| 参数 | 说明 | 可选值 |
|------|------|--------|
| `VITE_GISCUS_REPO` | GitHub 仓库 | `username/repo` |
| `VITE_GISCUS_REPO_ID` | 仓库 ID | 从 Giscus 配置页面获取 |
| `VITE_GISCUS_CATEGORY` | Discussion 分类 | `Announcements`、`General` 等 |
| `VITE_GISCUS_CATEGORY_ID` | 分类 ID | 从 Giscus 配置页面获取 |
| `VITE_GISCUS_MAPPING` | 映射方式 | `pathname`、`url`、`title`、`og:title`、`specific`、`number` |
| `VITE_GISCUS_STRICT` | 严格匹配 | `0`（关闭）、`1`（开启） |
| `VITE_GISCUS_REACTIONS_ENABLED` | 启用反应 | `0`（关闭）、`1`（开启） |
| `VITE_GISCUS_EMIT_METADATA` | 发送元数据 | `0`（关闭）、`1`（开启） |
| `VITE_GISCUS_INPUT_POSITION` | 输入框位置 | `top`、`bottom` |
| `VITE_GISCUS_THEME` | 主题 | `preferred_color_scheme`、`light`、`dark` 等 |
| `VITE_GISCUS_LANG` | 语言 | `zh-CN`、`en`、`ja` 等 |
| `VITE_GISCUS_LOADING` | 加载方式 | `lazy`、`eager` |

## 🎨 界面说明

### 博客文章评论

1. **评论系统选择器**：在文章详情页面底部显示
2. **两个切换按钮**：
   - 💬 Twikoo（蓝色）
   - 🔗 Giscus（紫色）
3. **评论区域**：根据选择显示对应的评论系统

### Giscus 评论特性

- **GitHub 集成**：与 GitHub Discussions 完全集成
- **Markdown 支持**：支持完整的 Markdown 语法
- **反应功能**：支持 GitHub 风格的 emoji 反应
- **回复功能**：支持嵌套回复
- **主题适配**：自动适配浅色/深色主题

## 🔧 技术实现

### 组件结构

```
src/
├── components/ui/
│   ├── GiscusComment.vue     # Giscus 评论组件
│   ├── TwikooComment.vue     # Twikoo 评论组件
│   └── CommentSystem.vue     # 评论系统选择器
├── config/
│   ├── giscus.ts            # Giscus 配置文件
│   └── twikoo.ts            # Twikoo 配置文件
└── views/
    └── BlogView.vue         # 博客页面（集成评论系统）
```

### 核心功能

1. **动态脚本加载**：按需加载 Giscus 脚本
2. **配置验证**：确保配置正确性
3. **主题同步**：自动同步系统主题到 Giscus
4. **错误处理**：优雅的错误提示和重试机制
5. **用户偏好**：记住用户选择的评论系统

## 🎯 使用方法

### 用户操作流程

1. 访问博客文章详情页面
2. 滚动到文章底部查看评论区域
3. 选择喜欢的评论系统（Twikoo 或 Giscus）
4. 等待评论系统加载完成
5. 开始评论和互动

### 管理员操作

1. **Giscus 管理**：
   - 在 GitHub 仓库的 Discussions 中管理评论
   - 可以锁定、删除或编辑讨论
   - 设置分类和标签

2. **Twikoo 管理**：
   - 访问 Twikoo 管理面板
   - 配置站点信息和通知设置

## 🔍 故障排除

### 常见问题

1. **Giscus 加载失败**
   - 检查仓库是否公开
   - 确认 Discussions 功能已启用
   - 验证 Giscus App 已安装
   - 检查环境变量配置

2. **评论无法显示**
   - 确认仓库 ID 和分类 ID 正确
   - 检查网络连接
   - 查看浏览器控制台错误

3. **主题不匹配**
   - 检查主题配置
   - 确认主题切换功能正常

### 调试方法

```javascript
// 在浏览器控制台查看 Giscus 配置
console.log("Giscus Config:", {
  repo: "your-username/your-repo",
  repoId: "your-repo-id",
  category: "Announcements",
  categoryId: "your-category-id"
});

// 检查 Giscus iframe
const giscusFrame = document.querySelector('iframe[src*="giscus.app"]');
console.log("Giscus Frame:", giscusFrame);
```

## 📚 相关链接

- [Giscus 官网](https://giscus.app/zh-CN)
- [Giscus GitHub 仓库](https://github.com/giscus/giscus)
- [GitHub Discussions 文档](https://docs.github.com/en/discussions)
- [Twikoo 官网](https://twikoo.js.org/)

## 🎉 总结

通过集成 Giscus 评论系统，您的博客现在支持：

- 双评论系统选择（Twikoo + Giscus）
- 现代化的评论体验
- 与 GitHub 生态系统的深度集成
- 优秀的用户体验和管理便利性

如果您在配置过程中遇到问题，请参考故障排除部分或查看相关文档。
