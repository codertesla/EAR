# 🚀 部署指南 (Deployment Guide)

本文档介绍了将信用卡分期利率计算器部署到各种平台的详细步骤。

## 📋 目录

- [GitHub Pages 部署](#github-pages-部署)
- [Vercel 部署](#vercel-部署)
- [Netlify 部署](#netlify-部署)
- [本地开发服务器](#本地开发服务器)
- [Docker 部署](#docker-部署)
- [CDN 部署](#cdn-部署)

## 🌐 GitHub Pages 部署

### 方法一：通过 GitHub 网页界面

1. **Fork 或克隆项目到你的 GitHub 账户**

2. **启用 GitHub Pages**:
   - 进入你的仓库页面
   - 点击 `Settings` 选项卡
   - 在左侧菜单中找到 `Pages`
   - 在 `Source` 部分选择 `Deploy from a branch`
   - 选择 `main` 分支和 `/ (root)` 文件夹
   - 点击 `Save`

3. **访问你的网站**:
   - GitHub Pages 会在几分钟内构建完成
   - 访问 `https://your-username.github.io/EAR`

### 方法二：通过 GitHub Actions

创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## 🔷 Vercel 部署

### 通过 Vercel CLI

1. **安装 Vercel CLI**:
```bash
npm i -g vercel
```

2. **登录 Vercel**:
```bash
vercel login
```

3. **部署项目**:
```bash
cd your-project-directory
vercel
```

### 通过 Vercel 网页界面

1. 访问 [vercel.com](https://vercel.com)
2. 登录并点击 "New Project"
3. 连接你的 GitHub 仓库
4. 选择项目并点击 "Deploy"
5. Vercel 会自动检测并部署

### Vercel 配置文件

创建 `vercel.json` 文件（可选）：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🟢 Netlify 部署

### 方法一：拖拽部署

1. 访问 [netlify.com](https://netlify.com)
2. 登录或注册账户
3. 将项目文件夹直接拖拽到部署区域
4. 等待部署完成

### 方法二：Git 连接部署

1. 在 Netlify 控制台点击 "New site from Git"
2. 选择 GitHub 并授权
3. 选择你的仓库
4. 配置构建设置（通常为默认）
5. 点击 "Deploy site"

### Netlify 配置文件

创建 `netlify.toml` 文件（可选）：

```toml
[build]
  publish = "./"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 💻 本地开发服务器

### 使用 Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

访问: `http://localhost:8000`

### 使用 Node.js

```bash
# 安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

### 使用 VS Code Live Server

1. 安装 Live Server 扩展
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

### 使用 PHP

```bash
php -S localhost:8000
```

## 🐳 Docker 部署

### 创建 Dockerfile

```dockerfile
FROM nginx:alpine

# 复制项目文件到 nginx 默认目录
COPY . /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 构建和运行

```bash
# 构建镜像
docker build -t ear-calculator .

# 运行容器
docker run -d -p 8080:80 ear-calculator
```

访问: `http://localhost:8080`

### Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8080:80"
    volumes:
      - .:/usr/share/nginx/html
    restart: unless-stopped
```

运行：
```bash
docker-compose up -d
```

## 🌍 CDN 部署

### 使用 jsDelivr

你可以直接通过 CDN 访问 GitHub 上的文件：

```
https://cdn.jsdelivr.net/gh/your-username/EAR@main/index.html
```

### 自定义域名

如果你有自己的域名，可以：

1. **GitHub Pages 自定义域名**:
   - 在仓库设置中添加自定义域名
   - 配置 DNS CNAME 记录指向 `your-username.github.io`

2. **Vercel 自定义域名**:
   - 在项目设置中添加域名
   - 按照提示配置 DNS 记录

3. **Netlify 自定义域名**:
   - 在站点设置中添加自定义域名
   - 配置 DNS 记录或使用 Netlify DNS

## 🔧 高级配置

### 性能优化

1. **启用 Gzip 压缩**（服务器配置）
2. **设置缓存头**
3. **使用 CDN 加速静态资源**

### 安全配置

创建 `_headers` 文件（Netlify）或配置服务器：

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;
```

## 🐛 常见问题

### 1. GitHub Pages 404 错误
- 确保 `index.html` 在根目录
- 检查分支是否正确设置为 main

### 2. 字体或样式加载失败
- 检查 CDN 链接是否正确
- 确保没有被内容安全策略阻止

### 3. 本地服务器跨域问题
- 使用 HTTP 服务器而不是直接打开文件
- 检查 Chrome 的 CORS 策略

### 4. 移动端显示问题
- 确保 viewport meta 标签正确
- 测试响应式布局

## 📞 获取帮助

如果遇到部署问题：

1. 查看项目的 [Issues](https://github.com/your-username/EAR/issues)
2. 查阅各平台的官方文档
3. 提交新的 Issue 描述问题

---

*最后更新: 2024-12-29* 