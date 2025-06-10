# 🚀 Giscus 快速配置指南

## 当前状态

✅ **Twikoo 评论系统** - 已配置完成，可以正常使用
⚠️ **Giscus 评论系统** - 需要配置 GitHub 仓库信息

## 快速配置 Giscus（5分钟完成）

### 第1步：准备 GitHub 仓库

1. **创建或使用现有的公开 GitHub 仓库**
2. **启用 Discussions 功能**：
   - 进入仓库 Settings
   - 滚动到 Features 部分
   - 勾选 "Discussions"

### 第2步：安装 Giscus App

1. 访问：https://github.com/apps/giscus
2. 点击 "Install" 安装到您的仓库

### 第3步：获取配置信息

1. 访问：https://giscus.app/zh-CN
2. 输入您的仓库信息：`username/repository-name`
3. 选择映射方式：推荐选择 "pathname"
4. 选择 Discussion 分类：推荐选择 "Announcements"
5. 复制生成的配置信息

### 第4步：配置环境变量

在项目根目录创建 `.env` 文件，添加以下内容：

```bash
# Twikoo 配置（已有）
VITE_TWIKOO_ENV_ID=https://twikoo.moinkhao.eu.org
VITE_TWIKOO_CDN_URL=https://cdn.staticfile.org/twikoo/1.6.31/twikoo.all.min.js

# Giscus 配置（需要填写）
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

### 第5步：重启开发服务器

```bash
npm run dev
```

## 配置示例

假设您的 GitHub 用户名是 `john`，仓库名是 `my-blog`：

```bash
VITE_GISCUS_REPO=john/my-blog
VITE_GISCUS_REPO_ID=R_kgDOH1234567  # 从 giscus.app 获取
VITE_GISCUS_CATEGORY=Announcements
VITE_GISCUS_CATEGORY_ID=DIC_kwDOH1234567  # 从 giscus.app 获取
```

## 临时解决方案

如果暂时不想配置 Giscus，可以：

1. **只使用 Twikoo**：评论系统默认显示 Twikoo，已经可以正常使用
2. **隐藏 Giscus 选项**：在 BlogView.vue 中设置 `:enable-giscus="false"`

## 验证配置

配置完成后，您应该能看到：

1. ✅ 文章底部显示评论系统选择器
2. ✅ Twikoo 按钮（蓝色）- 可以正常使用
3. ✅ Giscus 按钮（紫色）- 配置后可以使用
4. ✅ 点击切换按钮可以在两个系统之间切换

## 常见问题

### Q: Giscus 显示"配置无效"

**A:** 检查以下项目：

- 仓库是否为公开仓库
- 是否启用了 Discussions 功能
- 是否安装了 Giscus App
- 环境变量是否正确配置

### Q: 找不到 .env 文件

**A:** 在项目根目录（与 package.json 同级）创建 `.env` 文件

### Q: 配置后仍然显示错误

**A:** 重启开发服务器：`npm run dev`

## 获取帮助

如果遇到问题，可以：

1. 查看 `GISCUS_SETUP.md` 详细配置指南
2. 访问 [Giscus 官方文档](https://giscus.app/zh-CN)
3. 检查浏览器控制台错误信息

## 总结

- ✅ **Twikoo** 已经配置完成，可以立即使用
- ⚙️ **Giscus** 需要 5 分钟配置 GitHub 仓库
- 🎯 **双系统** 配置完成后用户可以自由选择

配置完成后，您的博客将拥有两个强大的评论系统！
