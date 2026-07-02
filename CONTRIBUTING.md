# 贡献指南

## 开发环境

这是一个零构建项目，直接编辑 HTML/CSS/JS 文件即可：

```bash
# 启动开发服务器
python3 -m http.server 4311

# 打开演讲者模式
open http://127.0.0.1:4311/presenter.html
```

## 测试

```bash
npm test
```

烟雾测试会验证：
- 演讲者 HTML 可加载
- 必需的 DOM 元素存在
- 默认的幻灯片/讲稿路径可解析

## 项目结构

```
.
├── presenter.html          # 演讲者视图主文件
├── src/
│   ├── presenter.css      # 样式
│   └── presenter.js       # 逻辑
├── slides.html            # 示例幻灯片
├── notes.md               # 示例讲稿
└── skill/
    └── add-presenter-mode/
        ├── SKILL.md       # Claude skill 定义
        ├── scripts/       # 安装脚本
        └── assets/        # 打包的演讲者工具
```

## 修改流程

1. **编辑核心文件**：`presenter.html`、`src/presenter.css`、`src/presenter.js`
2. **本地测试**：在浏览器中验证，测试多个断点（桌面、平板、手机）
3. **同步到 skill**：`cp presenter.html src/* skill/add-presenter-mode/assets/presenter-mode/`
4. **运行测试**：`npm test`
5. **提交**：清晰的 commit message

## Skill 资源同步

发布 skill 更新前：

```bash
cp presenter.html skill/add-presenter-mode/assets/presenter-mode/
cp -r src skill/add-presenter-mode/assets/presenter-mode/
```

skill 打包了演讲者工具的副本，用于安装到用户项目。

## 浏览器兼容性

目标：现代浏览器（Chrome/Firefox/Safari/Edge 最近 2 个版本）

使用的特性：
- CSS Grid、Flexbox、Container Queries
- ES6 模块（内联，非外部）
- `window.open()`、`BroadcastChannel`、`localStorage`
- iframe 沙箱

## 代码风格

- **HTML**：语义化标签，用 `data-*` 属性作为 JS 钩子
- **CSS**：实用优先（utility-first），组件类为辅；CSS 变量用于主题
- **JS**：原生 ES6+，无构建步骤，内联在 HTML 中
- **注释**：解释*为什么*，而非*是什么*
- **i18n**：所有 UI 字符串放在 `copy` 对象，带 `en`/`zh` 键

## 提交变更

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/你的功能`
3. 进行修改
4. 充分测试
5. 清晰的 commit message（参考现有风格）
6. Push 并打开 PR，附上变更说明和测试情况

---

## Contributing (English)

**Development:**
```bash
python3 -m http.server 4311
open http://127.0.0.1:4311/presenter.html
```

**Testing:** `npm test`

**Code Style:**
- Vanilla ES6+, no build step
- CSS variables for theming
- Semantic HTML with `data-*` hooks
- i18n: all strings in `copy` object with `en`/`zh` keys

**Workflow:**
1. Edit core files
2. Test locally at multiple breakpoints
3. Sync to skill: `cp presenter.html src/* skill/add-presenter-mode/assets/presenter-mode/`
4. Run `npm test`
5. Commit with clear message
6. Fork, branch, PR
