# ☁️ Cloudflare 部署指南

本文档介绍如何将信用卡分期利率计算器部署到 Cloudflare 平台。

## 🎯 推荐方案：Cloudflare Pages

对于静态网站项目，**Cloudflare Pages** 是最佳选择，提供：
- ✅ 免费部署
- ✅ 自动构建
- ✅ 全球CDN加速
- ✅ 自定义域名
- ✅ HTTPS自动配置

### 🚀 使用 Cloudflare Pages 部署

#### 方法一：Git 集成部署（推荐）

1. **登录 Cloudflare**
   - 访问 [dash.cloudflare.com](https://dash.cloudflare.com)
   - 登录你的 Cloudflare 账户

2. **创建 Pages 项目**
   - 进入 "Pages" 面板
   - 点击 "Create a project"
   - 选择 "Connect to Git"

3. **连接 GitHub 仓库**
   - 授权 Cloudflare 访问 GitHub
   - 选择 `EAR` 仓库
   - 点击 "Begin setup"

4. **配置构建设置**
   ```
   Project name: ear-calculator
   Production branch: main
   Build command: (留空)
   Build output directory: /
   Root directory: /
   ```

5. **部署项目**
   - 点击 "Save and Deploy"
   - 等待部署完成（通常1-2分钟）

6. **访问网站**
   - 部署完成后获得类似 `https://ear-calculator.pages.dev` 的URL
   - 可以设置自定义域名

#### 方法二：拖拽上传部署

1. **准备文件**
   ```bash
   # 创建部署包
   mkdir deploy-package
   cp index.html deploy-package/
   cp -r docs deploy-package/
   ```

2. **上传部署**
   - 在 Cloudflare Pages 中选择 "Upload assets"
   - 将 `deploy-package` 文件夹拖拽上传
   - 等待部署完成

### 📄 Pages 配置文件（可选）

创建 `_redirects` 文件用于路由配置：

```
# SPA fallback
/*    /index.html   200

# 安全头配置
/index.html
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

## 🔧 进阶方案：Cloudflare Workers

如果你需要更多服务器端功能，可以使用 Workers：

### 🛠️ Workers 部署步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **登录 Wrangler**
   ```bash
   npx wrangler login
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **部署到 Workers**
   ```bash
   npm run deploy
   ```

### ⚙️ Workers 配置说明

项目已包含以下配置文件：

- `wrangler.toml` - Wrangler 配置
- `src/index.js` - Worker 脚本
- `package.json` - 依赖管理

### 📦 自定义配置

修改 `wrangler.toml` 中的项目名称：

```toml
name = "your-custom-name"  # 修改为你的项目名
```

## 🌐 自定义域名配置

### Cloudflare Pages 域名设置

1. **添加域名**
   - 在 Pages 项目设置中点击 "Custom domains"
   - 添加你的域名

2. **配置 DNS**
   ```
   类型: CNAME
   名称: www (或其他子域名)
   目标: your-project.pages.dev
   ```

### Cloudflare Workers 域名设置

1. **添加路由**
   - 在 Workers 设置中添加 "Routes"
   - 设置如：`example.com/*`

2. **配置 DNS**
   ```
   类型: A
   名称: @ (或子域名)
   IPv4: 192.0.2.1 (Cloudflare 代理)
   ```

## 🚀 CI/CD 自动部署

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [ main ]

jobs:
  deploy-pages:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Cloudflare Pages
      uses: cloudflare/pages-action@v1
      with:
        apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
        projectName: ear-calculator
        directory: ./
        gitHubToken: ${{ secrets.GITHUB_TOKEN }}

  deploy-workers:
    runs-on: ubuntu-latest
    if: false  # 默认禁用，如需要可改为 true
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Deploy to Cloudflare Workers
      run: npx wrangler deploy
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### 设置 GitHub Secrets

在 GitHub 仓库设置中添加：

```
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

## 📊 性能优化

### 缓存策略

```javascript
// 在 Workers 中设置缓存
const cache = caches.default
const cacheKey = new Request(url.toString(), request)
const response = await cache.match(cacheKey)

if (response) {
  return response
}

// 设置缓存时间
response.headers.set('Cache-Control', 'public, max-age=86400')
await cache.put(cacheKey, response.clone())
```

### 压缩优化

```toml
# wrangler.toml 中启用压缩
[site]
bucket = "./dist"
entry-point = "workers-site"

[build]
command = "npm run build"
cwd = "./"
```

## 🔒 安全配置

### 内容安全策略

在 Workers 中添加安全头：

```javascript
response.headers.set('Content-Security-Policy', 
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com;"
)
```

### HTTPS 重定向

```javascript
if (url.protocol !== 'https:') {
  return Response.redirect(`https://${url.hostname}${url.pathname}${url.search}`, 301)
}
```

## 📈 监控和分析

### Cloudflare Analytics

- 访问 Cloudflare 控制台查看流量统计
- 设置告警和监控规则
- 查看性能指标

### 自定义分析

```javascript
// 在 Workers 中添加访问统计
const analytics = {
  timestamp: Date.now(),
  url: request.url,
  userAgent: request.headers.get('User-Agent'),
  country: request.cf.country
}

// 发送到分析服务或存储到 KV
```

## ❓ 常见问题

### Q: Pages 和 Workers 有什么区别？
**A**: 
- Pages：专为静态网站设计，自动化程度高
- Workers：更灵活，支持服务器端逻辑

### Q: 如何设置环境变量？
**A**: 
- Pages：在项目设置中添加环境变量
- Workers：在 `wrangler.toml` 中配置 `[vars]`

### Q: 如何查看部署日志？
**A**: 
- Pages：在项目部署历史中查看
- Workers：使用 `wrangler tail` 命令

## 🎉 部署清单

### Cloudflare Pages 部署：
- [ ] 连接 GitHub 仓库
- [ ] 配置构建设置
- [ ] 等待首次部署完成
- [ ] 测试网站功能
- [ ] 设置自定义域名（可选）

### Cloudflare Workers 部署：
- [ ] 安装 Wrangler CLI
- [ ] 配置 wrangler.toml
- [ ] 运行 `npm install`
- [ ] 执行 `npm run deploy`
- [ ] 测试 Worker 功能

---

**推荐使用 Cloudflare Pages 进行部署，简单快捷且功能完善！**

*更新时间：2025-01-07* 