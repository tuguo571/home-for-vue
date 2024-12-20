# 个人主页项目

一个使用 Vue 3 + TypeScript + Vite 构建的现代化个人主页，具有博客文章展示、项目展示、联系表单等功能。

## 主要特性

- 🎨 现代化的 UI 设计

  - 响应式布局，完美适配移动端和桌面端
  - 暗色/亮色主题切换
  - 流畅的动画和过渡效果

- 📝 博客文章展示

  - RSS 订阅源集成
  - 文章分类和时间线展示
  - 自动获取和更新文章

- 🎯 项目展示

  - 可配置的项目卡片
  - 技术栈标签展示
  - 项目链接和描述

- 📬 联系功能

  - EmailJS 集成的联系表单
  - 表单验证和错误处理
  - 实时反馈状态

- 🛠 技术栈
  - Vue 3 + TypeScript
  - Vite 构建工具
  - TailwindCSS 样式框架
  - Vue Router 路由管理
  - EmailJS 邮件服务

## 项目结构

```
tree
src/
├── components/ # 可复用组件
├── config/ # 配置文件
├── types/ # TypeScript 类型定义
├── utils/ # 工具函数
├── views/ # 页面组件
└── App.vue # 根组件
```

## 环境变量

项目使用以下环境变量：

```
EmailJS 配置
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
其他配置
VITE_GUESTBOOK_URL=your_guestbook_url
```

## 开发和构建

安装依赖
`npm install`
开发环境运行
`npm run dev`
构建生产版本
`npm run build`
预览生产构建
`npm run preview`

## 部署

项目可以部署到任何静态网站托管服务。需要注意：

1. 配置正确的环境变量
2. 设置适当的 Nginx/Apache 重定向规则
3. 启用 HTTPS 以确保安全性
   nginx 配置参考

```
server {
    listen 80 ;
    listen 443 ssl http2 ;
    server_name home.mmm.sd;
    index index.php index.html index.htm default.php default.htm default.html;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $server_name;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    access_log /www/sites/log/access.log main;
    error_log /www/sites/log/error.log;
    location ^~ /.well-known/acme-challenge {
        allow all;
        root /usr/share/nginx/html;
    }
    root /www/sites/index;
    # 添加这个 location 块来处理前端路由
    location / {
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # RSS 代理配置
    location /rss.xml {
        proxy_pass https://www.mmm.sd/rss.xml;
        proxy_set_header Host www.mmm.sd;
        proxy_set_header Accept "application/xml, text/xml, */*";
        proxy_set_header User-Agent "Mozilla/5.0";
    }

    error_page 404 /404.html;
    if ($scheme = http) {
        return 301 https://$host$request_uri;
    }
    ssl_certificate /www/sites/ssl/fullchain.pem;
    ssl_certificate_key /www/sites/ssl/privkey.pem;
    ssl_protocols TLSv1.3 TLSv1.2 TLSv1.1 TLSv1;
    ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:!aNULL:!eNULL:!EXPORT:!DSS:!DES:!RC4:!3DES:!MD5:!PSK:!KRB5:!SRP:!CAMELLIA:!SEED;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    error_page 497 https://$host$request_uri;
    proxy_set_header X-Forwarded-Proto https;
    add_header Strict-Transport-Security "max-age=31536000";
}
```

## 功能特点

- 模块化的配置系统
- 优雅的错误处理
- 完整的类型支持
- 高性能的构建输出
- SEO 友好
- 可访问性支持

## 许可证

MIT License

## 作者

[Handsome](https://www.mmm.sd/)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 推荐服务商

[Rainyun](https://app.rainyun.com/) 提供 CDN 加速 / 云存储服务
