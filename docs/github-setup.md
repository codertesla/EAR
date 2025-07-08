# 🚀 GitHub 发布指南

本指南将指导你将信用卡分期利率计算器项目发布到 GitHub，并设置开源项目的各项功能。

## 📋 前置准备

### 1. 确认环境
- ✅ Git 已安装并配置
- ✅ GitHub 账户已创建
- ✅ 项目文件已准备完毕

### 2. 验证本地仓库
```bash
# 检查Git状态
git status

# 查看提交历史
git log --oneline
```

## 🏗️ 创建 GitHub 仓库

### 方法一：通过 GitHub 网页创建

1. **登录 GitHub**
   - 访问 [github.com](https://github.com)
   - 使用你的账户登录

2. **创建新仓库**
   - 点击右上角的 "+" 按钮
   - 选择 "New repository"

3. **配置仓库信息**
   ```
   Repository name: EAR
   Description: 💳 信用卡分期真实年化利率(EAR)计算器 - 看清"免息"背后的真实成本
   
   设置选项:
   ☐ Public (推荐，开源项目)
   ☐ Add a README file (不勾选，我们已经有了)
   ☐ Add .gitignore (不勾选，我们已经有了)
   ☐ Choose a license (不勾选，我们已经有了)
   ```

4. **创建仓库**
   - 点击 "Create repository"

### 方法二：通过 GitHub CLI 创建

```bash
# 安装 GitHub CLI (如果尚未安装)
# macOS: brew install gh
# Windows: winget install GitHub.CLI

# 登录 GitHub
gh auth login

# 创建仓库
gh repo create EAR --public --description "💳 信用卡分期真实年化利率(EAR)计算器 - 看清\"免息\"背后的真实成本"
```

## 🔗 连接本地和远程仓库

### 添加远程仓库

```bash
# 添加远程仓库 (替换 codertesla 为你的 GitHub 用户名)
git remote add origin https://github.com/codertesla/EAR.git

# 验证远程仓库
git remote -v
```

### 推送代码到 GitHub

```bash
# 推送到主分支
git push -u origin main

# 如果遇到错误，可能需要先拉取远程更改
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## ⚙️ 配置仓库设置

### 1. 仓库基本设置

进入仓库的 `Settings` 页面：

**General 设置**
- ✅ 确认仓库名称和描述
- ✅ 设置默认分支为 `main`
- ✅ 允许 Issues 和 Projects

**Features 功能**
- ✅ Issues - 用于bug报告和功能请求
- ✅ Projects - 项目管理
- ✅ Wiki - 项目文档
- ✅ Discussions - 社区讨论

### 2. GitHub Pages 设置

1. **进入 Pages 设置**
   - Settings → Pages

2. **配置部署源**
   ```
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)
   ```

3. **等待部署完成**
   - 通常需要几分钟时间
   - 完成后可通过 `https://codertesla.github.io/EAR` 访问

### 3. 安全设置

**Branch protection rules**
```
Branch name pattern: main
Protect matching branches:
☑️ Require a pull request before merging
☑️ Require status checks to pass before merging
☑️ Require branches to be up to date before merging
☑️ Include administrators
```

## 🏷️ 创建 Releases

### 1. 创建第一个 Release

1. **进入 Releases 页面**
   - 点击仓库主页的 "Releases"
   - 点击 "Create a new release"

2. **配置 Release 信息**
   ```
   Tag version: v1.0.0
   Release title: 🎉 初始版本 v1.0.0
   Target: main branch
   
   Description:
   ## ✨ 功能特性
   - 🧮 基于IRR算法的精确利率计算
   - 🎨 现代化玻璃态UI设计
   - 📱 完全响应式布局
   - 📊 动态图表数据可视化
   - ⚡ 实时输入验证和反馈
   
   ## 🚀 技术栈
   - HTML5, CSS3, JavaScript (ES6+)
   - Tailwind CSS + Chart.js
   - 纯前端实现，易于部署
   
   ## 📦 部署方式
   - [GitHub Pages 演示](https://ear-calculator.pages.dev/)
   - 支持 Vercel、Netlify 等平台一键部署
   
   ## 🔗 相关链接
   - [项目文档](README.md)
   - [部署指南](docs/deployment.md)
   - [更新日志](CHANGELOG.md)
   ```

3. **发布 Release**
   - 点击 "Publish release"

### 2. 自动化 Release

创建 `.github/workflows/release.yml`：

```yaml
name: Create Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Create Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false
```

## 📄 完善项目信息

### 1. 添加主题标签 (Topics)

在仓库主页添加以下标签：
```
信用卡, 利率计算器, EAR, IRR, 金融工具, 
计算器, javascript, tailwindcss, chartjs, 
glassmorphism, 响应式设计, 纯前端
```

### 2. 设置 About 信息

```
💳 信用卡分期真实年化利率(EAR)计算器 - 看清"免息"背后的真实成本

🔗 Website: https://codertesla.github.io/EAR
🏷️ Topics: 信用卡, 利率计算器, 金融工具, javascript
```

### 3. 添加 README 徽章

更新 README.md 中的徽章链接：

```markdown
[![GitHub License](https://img.shields.io/github/license/codertesla/EAR)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/codertesla/EAR)](https://github.com/codertesla/EAR/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/codertesla/EAR)](https://github.com/codertesla/EAR/network)
[![GitHub Pages](https://img.shields.io/badge/demo-online-green.svg)](https://codertesla.github.io/EAR)
```

## 🎯 项目推广建议

### 1. 社交媒体分享
- 发布到技术社区 (掘金、CSDN、博客园等)
- 分享到开发者群组
- 撰写技术博客介绍项目

### 2. 开源社区
- 提交到 Awesome 列表
- 参与相关的开源项目讨论
- 在技术论坛分享经验

### 3. SEO 优化
- 优化仓库描述和标签
- 在 README 中使用关键词
- 创建详细的项目文档

## 🔧 持续维护

### 1. Issue 管理
- 及时回复用户问题
- 创建 Issue 模板
- 使用标签分类问题

### 2. 代码质量
- 定期更新依赖
- 修复发现的 Bug
- 添加新功能

### 3. 社区建设
- 欢迎贡献者
- 维护贡献指南
- 感谢支持者

## ❓ 常见问题

### Q: 推送时遇到权限问题
**A**: 检查以下几点：
- 确认 GitHub 用户名和仓库名正确
- 使用个人访问令牌 (PAT) 而非密码
- 配置正确的 Git 凭据

### Q: GitHub Pages 部署失败
**A**: 检查以下内容：
- 确保 `index.html` 在根目录
- 检查分支设置是否正确
- 查看 Actions 日志排查错误

### Q: 如何更新远程仓库
**A**: 使用以下命令：
```bash
git add .
git commit -m "更新描述"
git push origin main
```

## 🎉 完成清单

- [ ] 创建 GitHub 仓库
- [ ] 推送代码到远程
- [ ] 配置 GitHub Pages
- [ ] 创建第一个 Release
- [ ] 设置仓库信息和标签
- [ ] 测试在线演示功能
- [ ] 分享项目到社区

---

**恭喜！🎉 你的开源项目已成功发布到 GitHub！**

现在你可以：
- 📢 分享项目链接
- 🌟 邀请朋友给项目点星
- 🤝 欢迎社区贡献
- 📈 持续完善项目功能

*项目地址*: `https://github.com/codertesla/EAR`  
*在线演示*: `https://ear-calculator.pages.dev/` 