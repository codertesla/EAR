# 💳 信用卡分期真实利率计算器 (Credit Card Installment Rate Calculator)

[![GitHub License](https://img.shields.io/github/license/your-username/EAR)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/your-username/EAR)](https://github.com/your-username/EAR/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-username/EAR)](https://github.com/your-username/EAR/network)

一个现代化的信用卡分期真实年化利率(EAR)计算器，帮助用户了解信用卡分期背后的真实成本。

## ✨ 功能特性

- 🧮 **精确计算**: 基于IRR算法计算真实年化利率(EAR)
- 📊 **可视化分析**: 动态图表展示资金成本变化趋势
- 💰 **详细明细**: 完整的还款计划表格
- 🎨 **现代UI**: 采用玻璃态设计和渐变动画效果
- 📱 **响应式设计**: 完美适配移动端和桌面端
- ⚡ **实时验证**: 输入数据实时验证和反馈
- 🎭 **动画效果**: 丰富的交互动画和数据可视化

## 🚀 在线体验

访问 [GitHub Pages 演示](https://your-username.github.io/EAR) 体验完整功能。

## 📸 界面预览

![主界面](docs/screenshots/main-interface.png)

*现代化的玻璃态设计风格*

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Tailwind CSS
- **图表**: Chart.js
- **字体**: Google Fonts (Inter + Noto Sans SC)
- **设计**: 玻璃态 (Glassmorphism) + 渐变效果

## 📦 项目结构

```
EAR/
├── index.html              # 主页面文件
├── README.md              # 项目说明文档
├── LICENSE                # 开源许可证
├── CHANGELOG.md           # 版本更新日志
├── .gitignore            # Git忽略配置
└── docs/                 # 文档目录
    ├── screenshots/      # 界面截图
    └── deployment.md     # 部署指南
```

## 🎯 使用方法

### 基本使用

1. **输入分期信息**:
   - 分期总金额（如：12000元）
   - 分期期数（如：12期）
   - 每期手续费/利息（如：72元）

2. **查看计算结果**:
   - 名义年利率：银行常用的宣传利率
   - 真实年化利率(EAR)：资金的实际成本
   - 财务总览：本金、费用、总额对比

3. **分析详细数据**:
   - 还款明细表：每期的还款详情
   - 资金成本分析图：直观的成本趋势变化

### 计算原理

本计算器使用 **内部收益率(IRR)** 方法计算真实年化利率：

```javascript
// 现金流：[+本金, -月供, -月供, ..., -月供]
const cashFlows = [principal, ...Array(periods).fill(-monthlyPayment)];
const monthlyIRR = calculateIRR(cashFlows);
const EAR = Math.pow(1 + monthlyIRR, 12) - 1;
```

这种方法考虑了资金的时间价值，能够准确反映分期的真实成本。

## 🚀 快速开始

### 本地运行

1. **克隆项目**:
```bash
git clone https://github.com/your-username/EAR.git
cd EAR
```

2. **启动本地服务器**:
```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx http-server

# 或使用 Live Server (VS Code 扩展)
```

3. **访问应用**:
   打开浏览器访问 `http://localhost:8000`

### 部署到 GitHub Pages

1. **Fork 本项目**
2. **启用 GitHub Pages**:
   - 进入仓库设置
   - 找到 Pages 选项
   - 选择 `main` 分支作为源
3. **访问在线版本**: `https://your-username.github.io/EAR`

## 💡 使用场景

### 适用人群
- 💳 信用卡用户：了解分期真实成本
- 📊 金融从业者：客户教育和咨询工具  
- 🎓 学生群体：金融知识学习和实践
- 💰 理财爱好者：投资决策参考工具

### 实际案例

**场景**: 购买12000元商品，银行提供12期免息分期，每期手续费72元

**传统理解**: 
- 名义利率 = 72×12÷12000 = 7.2%

**真实成本**:
- 实际年化利率(EAR) = 13.84%
- 比名义利率高出近一倍！

## 🔧 自定义配置

### 修改样式主题

在 `index.html` 中找到 CSS 变量部分，可以自定义颜色主题：

```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --danger-gradient: linear-gradient(135deg, #ef4444, #dc2626);
  --success-gradient: linear-gradient(135deg, #10b981, #059669);
}
```

### 调整计算参数

在 JavaScript 部分可以修改计算精度和收敛条件：

```javascript
function calculateIRR(cashFlows, maxIterations = 1000, tolerance = 1e-7) {
  // 调整 maxIterations 和 tolerance 来改变计算精度
}
```

## 🤝 贡献指南

欢迎所有形式的贡献！无论是功能改进、Bug修复还是文档完善。

### 贡献步骤

1. **Fork 项目**
2. **创建功能分支**: `git checkout -b feature/AmazingFeature`
3. **提交更改**: `git commit -m 'Add some AmazingFeature'`
4. **推送分支**: `git push origin feature/AmazingFeature`
5. **提交 Pull Request**

### 代码规范

- 使用 ES6+ 语法
- 保持代码简洁和可读性
- 添加适当的注释
- 遵循现有的命名约定

### 问题反馈

发现 Bug 或有功能建议？请：
- 查看 [Issues](https://github.com/your-username/EAR/issues) 是否已存在相关问题
- 创建新的 Issue 并详细描述问题或建议
- 使用相应的标签标记 Issue 类型

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Tailwind CSS](https://tailwindcss.com/) - 现代化CSS框架
- [Chart.js](https://www.chartjs.org/) - 强大的图表库  
- [Google Fonts](https://fonts.google.com/) - 优美的网页字体
- 所有贡献者和用户的支持

## 📞 联系方式

- **作者**: [Your Name]
- **邮箱**: your.email@example.com
- **项目主页**: https://github.com/your-username/EAR
- **问题反馈**: https://github.com/your-username/EAR/issues

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！

Made with ❤️ by [Your Name] 