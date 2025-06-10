# 🎯 tuguo571/home-for-vue 仓库 Giscus 配置指南

## 📋 仓库信息

- **仓库地址**：https://github.com/tuguo571/home-for-vue
- **仓库名称**：tuguo571/home-for-vue
- **状态**：需要配置 Discussions 和 Giscus

## 🚀 配置步骤

### 第1步：启用 GitHub Discussions

1. 访问：https://github.com/tuguo571/home-for-vue/settings
2. 滚动到 "Features" 部分
3. 勾选 ☑️ "Discussions"
4. 点击 "Set up discussions"

### 第2步：安装 Giscus App

1. 访问：https://github.com/apps/giscus
2. 点击 "Install"
3. 选择 "tuguo571/home-for-vue" 仓库
4. 点击 "Install"

### 第3步：获取配置信息

1. 访问：https://giscus.app/zh-CN
2. 在 "仓库" 输入框中输入：`tuguo571/home-for-vue`
3. 等待验证通过（绿色勾号）
4. 选择以下配置：
   - **页面 ↔️ discussion 映射关系**：选择 "pathname"
   - **Discussion 分类**：选择 "Announcements"
   - **特性**：保持默认设置
   - **主题**：选择 "preferred_color_scheme"

### 第4步：复制配置信息

从 giscus.app 生成的代码中复制以下信息：

```html
<script
  src="https://giscus.app/client.js"
  data-repo="tuguo571/home-for-vue"
  data-repo-id="R_kgDOxxxxxxx"
  ←
  复制这个
  data-category="Announcements"
  data-category-id="DIC_kwDOxxxxxxx"
  ←
  复制这个
  ...
></script>
```

### 第5步：配置环境变量

将 `.env.tuguo571` 文件重命名为 `.env`，然后更新以下配置：

```bash
# Giscus 评论系统配置
VITE_GISCUS_REPO=tuguo571/home-for-vue
VITE_GISCUS_REPO_ID=R_kgDOxxxxxxx  # 替换为实际的 repo-id
VITE_GISCUS_CATEGORY=Announcements
VITE_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxx  # 替换为实际的 category-id
```

### 第6步：重启开发服务器

```bash
npm run dev
```

## 📝 完整的 .env 配置示例

```bash
# 应用基本信息
VITE_APP_TITLE=我的博客
VITE_APP_DESCRIPTION=一个基于 Vue 3 的个人博客
VITE_APP_KEYWORDS=Vue3,博客,前端,技术分享
VITE_APP_AUTHOR=tuguo571
VITE_APP_URL=https://yourdomain.com
VITE_APP_LOGO=/logo.png
VITE_APP_GITHUB=https://github.com/tuguo571
VITE_APP_TWITTER=@tuguo571
VITE_APP_TWITTER_URL=https://twitter.com/tuguo571
VITE_APP_THEME_COLOR=#3b82f6
VITE_SITE_URL=https://yourdomain.com

# Twikoo 评论系统配置（已配置）
VITE_TWIKOO_ENV_ID=https://twikoo.moinkhao.eu.org
VITE_TWIKOO_CDN_URL=https://cdn.staticfile.org/twikoo/1.6.31/twikoo.all.min.js

# Giscus 评论系统配置
VITE_GISCUS_REPO=tuguo571/home-for-vue
VITE_GISCUS_REPO_ID=R_kgDOxxxxxxx  # 从 giscus.app 获取
VITE_GISCUS_CATEGORY=Announcements
VITE_GISCUS_CATEGORY_ID=DIC_kwDOxxxxxxx  # 从 giscus.app 获取
VITE_GISCUS_MAPPING=pathname
VITE_GISCUS_STRICT=0
VITE_GISCUS_REACTIONS_ENABLED=1
VITE_GISCUS_EMIT_METADATA=0
VITE_GISCUS_INPUT_POSITION=bottom
VITE_GISCUS_THEME=preferred_color_scheme
VITE_GISCUS_LANG=zh-CN
VITE_GISCUS_LOADING=lazy

# 外部留言板链接（可选）
VITE_GUESTBOOK_URL=https://your-external-guestbook.com
```

## ✅ 验证配置

配置完成后，您应该看到：

1. **文章详情页面底部**：显示评论系统选择器
2. **Twikoo 按钮**（蓝色）：可以正常使用
3. **Giscus 按钮**（紫色）：配置后可以正常使用
4. **切换功能**：可以在两个系统之间切换

## 🔍 故障排除

### 如果 Giscus 仍然显示"配置无效"：

1. **检查仓库状态**：

   - 确保 tuguo571/home-for-vue 是公开仓库
   - 确保已启用 Discussions 功能

2. **检查 Giscus App**：

   - 确保已安装到 tuguo571/home-for-vue 仓库

3. **检查配置信息**：

   - 确保 REPO_ID 和 CATEGORY_ID 正确
   - 重启开发服务器

4. **查看控制台**：
   - 打开浏览器开发者工具
   - 查看 Console 中的错误信息

## 🎯 快速测试

配置完成后，您可以：

1. 打开博客文章详情页面
2. 滚动到底部查看评论区域
3. 点击 "Giscus" 按钮
4. 应该看到 GitHub Discussions 评论界面

## 📞 获取帮助

如果遇到问题：

1. 检查 GitHub 仓库的 Discussions 是否已启用
2. 确认 Giscus App 已正确安装
3. 验证环境变量配置是否正确
4. 查看浏览器控制台错误信息

配置完成后，您的博客将拥有两个强大的评论系统！🎉
