# Presenter Mode（演讲者模式）

为 HTML 幻灯片提供零构建的演讲者视图。

双屏演示：观众看到干净的幻灯片投影，演讲者在自己的屏幕上看到讲稿、计时器、当前/下一页预览、幻灯片列表和控制面板。

![演讲者视图](docs/screenshot-presenter.png)
![观众视图](docs/screenshot-audience.png)

## 核心特性

- 🎯 **双窗口设置**：观众看干净的幻灯片，演讲者看讲稿+预览
- 📝 **演讲者备注**：Markdown 格式，逐页显示讲稿
- ⏱️ **计时器**：追踪演讲时间，可重置
- 👀 **预览**：当前页和下一页并排显示
- 📋 **幻灯片列表**：缩略图快速导航
- 🎨 **响应式**：适配笔记本、平板、手机屏幕
- 🌓 **主题**：浅色（Sun）和深色（Moon）模式
- 🌍 **中英双语**：界面支持中文和英文
- 🔧 **零构建**：无需 npm install，无需打包工具，浏览器直接打开

## 快速开始

### 方式 1：直接使用

```bash
# 启动本地服务器
python3 -m http.server 4311

# 浏览器打开演讲者视图
open http://127.0.0.1:4311/presenter.html
```

默认加载：
- `slides.html`（幻灯片）
- `notes.md`（讲稿）

### 方式 2：自定义路径

```text
presenter.html?slides=你的幻灯片.html&notes=你的讲稿.md
```

### 方式 3：安装到现有项目

使用打包的安装脚本（需要 Claude Code）：

```bash
node skill/add-presenter-mode/scripts/install-presenter-mode.mjs \
  --slides slides.html \
  --notes notes.md
```

脚本会自动复制工具到项目并启动服务器。

## URL 参数

| 参数 | 可选值 | 默认值 | 说明 |
|------|--------|--------|------|
| `slides` | 路径 | `slides.html` | 幻灯片 HTML 文件路径 |
| `notes` | 路径 | `notes.md` | 讲稿 Markdown 文件路径 |
| `lang` | `zh`, `en` | 自动 | 界面语言 |
| `theme` | `sun`, `moon` | `sun` | 配色主题 |
| `layout` | `default`, `notes`, `balanced`, `preview` | `default` | 初始布局 |

**示例：**

```text
# 中文界面 + 深色主题
presenter.html?lang=zh&theme=moon

# 自定义文件路径
presenter.html?slides=deck/index.html&notes=talk/script.md
```

## 幻灯片要求

### 最低要求

你的 HTML 幻灯片需要满足：
- 每一页是一个 `.slide` 元素
- 讲稿使用 `## 01 标题`、`## 02 标题` 格式的 Markdown

### 推荐的 API

提供导航 API 以获得完整控制：

```js
window.deck = {
  show(index) {
    // 跳转到指定页（index 从 0 开始）
  },
  next() { this.show(this.current + 1); },
  prev() { this.show(this.current - 1); },
  get current() { return 当前页索引; },
  get total() { return 总页数; }
};
```

演讲者模式优先调用 `window.deck.show(index)`。如果 API 不存在，会回退到 hash 导航（`#1`、`#2` 等）。

详细的幻灯片适配方案见 [skill/add-presenter-mode/SKILL.md](skill/add-presenter-mode/SKILL.md)。

## 讲稿格式

使用带编号的 Markdown 二级标题：

```markdown
## 01 第一页的标题

这是第一页的演讲者备注。

要点：
- 介绍主题
- 设定预期

## 02 问题所在

解释痛点...
```

**格式规则：**
- 标题：`## NN 标题`，NN 是幻灯片编号（从 1 开始）
- `## N` 和 `## N+1` 之间的所有内容是第 N 页的讲稿
- 支持 Markdown：`**粗体**`、`*斜体*`、`` `代码` ``、列表

## 快捷键

| 按键 | 功能 |
|------|------|
| `→`、`Space`、`PageDown` | 下一页 |
| `←`、`PageUp` | 上一页 |
| `Home`、`End` | 第一页或最后一页 |
| `B` | 黑屏观众窗口 |
| `R` | 重置计时器 |
| `+`、`-`、`0` | 调整或重置讲稿字号 |

## 演讲流程

1. **准备**：在笔记本上打开演讲者 URL
2. **启动观众窗口**：点击"打开观众"按钮
3. **投屏定位**：把观众窗口拖到投影屏幕
4. **全屏**：在观众窗口按 F11 进入全屏
5. **开始演讲**：在演讲者窗口控制翻页，观众窗口自动同步

## 浏览器兼容性

测试通过：
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

需要现代 CSS（Grid、Flexbox、Container Queries）和 ES6+ JavaScript。

## 适用范围

演讲者模式控制**浏览器中运行的 HTML 幻灯片**。它不直接控制 WPS 演示、Microsoft PowerPoint 或 Keynote 等原生桌面应用。

原生应用控制需要系统自动化层或特定插件，超出了本项目的零构建浏览器范畴。

## 开发与贡献

详见 [CONTRIBUTING.md](CONTRIBUTING.md)（英文）。

核心思路：
- 直接编辑 `presenter.html`、`src/presenter.css`、`src/presenter.js`
- 在浏览器中测试（多断点）
- 运行 `npm test` 验证
- 同步到 skill 资源：`cp presenter.html src/* skill/add-presenter-mode/assets/presenter-mode/`

## 测试

```bash
npm test
```

运行烟雾测试验证核心功能，无需构建步骤。

## 许可证

MIT — 见 [LICENSE](LICENSE)

---

## English

**Presenter Mode** is a zero-build presenter view for HTML slide decks. It provides a dual-window setup: audience sees clean slides, presenter sees notes + previews.

**Quick Start:**
```bash
python3 -m http.server 4311
open http://127.0.0.1:4311/presenter.html
```

**Documentation:** See [skill/add-presenter-mode/SKILL.md](skill/add-presenter-mode/SKILL.md) for detailed usage, deck adaptation patterns, and installation guide.
