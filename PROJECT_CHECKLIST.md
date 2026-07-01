# 项目整理清单

## ✅ 已完成的改进

### 1. 文档完善
- ✅ **README.md** 重写：增加功能列表、截图、详细使用说明、表格化参数和快捷键
- ✅ **CONTRIBUTING.md** 新增：开发指南、代码风格、提交流程
- ✅ **docs/screenshot-presenter.png** 生成：演讲者视图截图 (1440×900 @2x)
- ✅ **docs/screenshot-audience.png** 生成：观众视图截图 (1920×1080 @2x)

### 2. 配置优化
- ✅ **.gitignore** 更新：排除 `测试/`、`.DS_Store`、IDE 配置
- ✅ **package.json** 增强：添加 repository、bugs、homepage、author 字段

### 3. Skill 文档重写
- ✅ **skill/add-presenter-mode/SKILL.md** 简化：270行→240行，流程导向

## 📋 需要手动处理的项目

### 发布前必做

1. **更新 package.json 个人信息**
   ```json
   "author": "Your Name <your.email@example.com>",
   "repository": {
     "url": "https://github.com/yourusername/presenter-mode.git"
   }
   ```
   将 `yourusername` 和作者信息替换为真实值。

2. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 创建空仓库后
   git remote add origin https://github.com/yourusername/presenter-mode.git
   git push -u origin main
   ```

3. **检查截图质量**
   - 打开 `docs/screenshot-presenter.png` 和 `docs/screenshot-audience.png`
   - 如果不满意，手动截图替换（建议 @2x retina 分辨率）

### 可选改进

4. **添加 GitHub Actions CI**
   创建 `.github/workflows/test.yml`：
   ```yaml
   name: Test
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm test
   ```

5. **添加 GitHub issue/PR 模板**
   - `.github/ISSUE_TEMPLATE/bug_report.md`
   - `.github/PULL_REQUEST_TEMPLATE.md`

6. **添加徽章到 README**
   ```markdown
   ![License](https://img.shields.io/badge/license-MIT-blue.svg)
   ![Test](https://github.com/yourusername/presenter-mode/workflows/Test/badge.svg)
   ```

## 🗑️ 建议删除/不提交的文件

### 已在 .gitignore 中排除
- ✅ `测试/` — 临时测试文件，不应提交
- ✅ `.DS_Store` — macOS 系统文件
- ✅ IDE 配置文件 (`.vscode/`, `.idea/`, `*.swp`)

### 可选择性保留的文档
- `投屏演讲模式方案.md` — 早期设计文档（中文），可以：
  - **保留**：作为设计历史记录
  - **删除**：README 已包含所有必要信息
  - **移动**：移到 `docs/design-notes.md`

- `Presenter-Mode-使用说明.md` — 中文使用说明，可以：
  - **保留**：如果目标用户有中文需求
  - **删除**：README 已有完整说明
  - **重命名**：改为 `README.zh-CN.md` 作为国际化版本

## 📊 当前项目结构

```
presenter-mode/
├── .git/
├── .gitignore                        ← 已更新
├── LICENSE                           ← MIT (已存在)
├── README.md                         ← 已重写
├── CONTRIBUTING.md                   ← 新增
├── package.json                      ← 已增强
├── presenter.html                    ← 核心文件
├── slides.html                       ← 示例幻灯片
├── notes.md                          ← 示例讲稿
├── src/
│   ├── presenter.css                 ← 样式
│   └── presenter.js                  ← 逻辑
├── scripts/
│   └── smoke-test.mjs                ← 测试脚本
├── docs/
│   ├── README.md                     ← 文档说明
│   ├── screenshot-presenter.png      ← 演讲者视图截图
│   └── screenshot-audience.png       ← 观众视图截图
├── skill/
│   └── add-presenter-mode/
│       ├── SKILL.md                  ← Claude skill 定义
│       ├── README.md                 ← Skill 说明
│       ├── scripts/                  ← 安装脚本
│       └── assets/                   ← 打包的工具
├── 投屏演讲模式方案.md                ← 待处理：设计文档
└── Presenter-Mode-使用说明.md        ← 待处理：中文说明
```

## 🚀 提交到 GitHub 的步骤

### 1. 决定可选文件的去留

```bash
# 选项 A: 删除早期文档
rm 投屏演讲模式方案.md Presenter-Mode-使用说明.md

# 选项 B: 移到 docs/
mv 投屏演讲模式方案.md docs/design-notes.md
mv Presenter-Mode-使用说明.md README.zh-CN.md

# 选项 C: 保持原样（会一起提交）
```

### 2. 更新 package.json

用真实的 GitHub 用户名和邮箱替换占位符。

### 3. 提交所有改动

```bash
git add -A
git status  # 检查待提交文件
git commit -m "Prepare for GitHub: docs, screenshots, contributing guide"
```

### 4. 创建 GitHub 仓库并推送

```bash
# 在 GitHub 创建仓库后
git remote add origin https://github.com/yourusername/presenter-mode.git
git push -u origin main
```

### 5. 发布后检查

- ✅ README 截图正常显示
- ✅ 链接可点击（LICENSE, CONTRIBUTING.md, skill/等）
- ✅ npm test 通过
- ✅ 在线演示链接（可用 GitHub Pages 托管 `presenter.html`）

## 📝 GitHub Pages 配置（可选）

如果想要在线演示：

1. 仓库设置 → Pages → Source: `main` branch, `/` root
2. 访问 `https://yourusername.github.io/presenter-mode/presenter.html`
3. 在 README 顶部添加演示链接：
   ```markdown
   [📺 Live Demo](https://yourusername.github.io/presenter-mode/presenter.html)
   ```

## 总结

✅ **已准备就绪的内容：**
- 核心功能代码（presenter.html, src/）
- 完整文档（README, CONTRIBUTING）
- 截图素材（docs/）
- Skill 定义（skill/）
- 示例文件（slides.html, notes.md）
- 配置文件（package.json, .gitignore, LICENSE）

⚠️ **发布前需要做：**
- 更新 package.json 中的个人信息和仓库 URL
- 决定中文文档的去留
- 创建 GitHub 仓库并推送

🎯 **项目已具备开源发布的所有要素！**
