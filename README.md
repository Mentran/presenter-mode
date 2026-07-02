# Presenter Mode（演讲者模式）

[English](#english) | [中文](#中文)

---

## 中文

为 HTML 幻灯片提供零构建的演讲者视图。

双屏演示：观众看到干净的幻灯片投影，演讲者在自己的屏幕上看到讲稿、计时器、当前/下一页预览、幻灯片列表和控制面板。

![演讲者视图](docs/screenshot-presenter.png)
![观众视图](docs/screenshot-audience.png)

### 核心特性

- 🎯 **双窗口设置**：观众看干净的幻灯片，演讲者看讲稿+预览
- 📝 **演讲者备注**：Markdown 格式，逐页显示讲稿
- ⏱️ **计时器**：追踪演讲时间，可重置
- 👀 **预览**：当前页和下一页并排显示
- 📋 **幻灯片列表**：缩略图快速导航
- 🎨 **响应式**：适配笔记本、平板、手机屏幕
- 🌓 **主题**：浅色（Sun）和深色（Moon）模式
- 🌍 **中英双语**：界面支持中文和英文
- 🔧 **零构建**：无需 npm install，无需打包工具，浏览器直接打开

### 快速开始

```bash
# 启动本地服务器
python3 -m http.server 4311

# 浏览器打开演讲者视图
open http://127.0.0.1:4311/presenter.html
```

默认加载：
- `slides.html`（幻灯片）
- `notes.md`（讲稿）

### 自定义路径

```text
presenter.html?slides=你的幻灯片.html&notes=你的讲稿.md&lang=zh
```

### URL 参数

| 参数 | 可选值 | 默认值 | 说明 |
|------|--------|--------|------|
| `slides` | 路径 | `slides.html` | 幻灯片 HTML 文件路径 |
| `notes` | 路径 | `notes.md` | 讲稿 Markdown 文件路径 |
| `lang` | `zh`, `en` | 自动 | 界面语言 |
| `theme` | `sun`, `moon` | `sun` | 配色主题 |
| `layout` | `default`, `notes`, `balanced`, `preview` | `default` | 初始布局 |

### 幻灯片要求

你的 HTML 幻灯片需要满足：
- 每一页是一个 `.slide` 元素
- 讲稿使用 `## 01 标题`、`## 02 标题` 格式的 Markdown

推荐提供导航 API：

```js
window.deck = {
  show(index) { /* 跳转到指定页（index 从 0 开始） */ },
  next() { this.show(this.current + 1); },
  prev() { this.show(this.current - 1); },
  get current() { return 当前页索引; },
  get total() { return 总页数; }
};
```

详细的幻灯片适配方案见 [skill/add-presenter-mode/SKILL.md](skill/add-presenter-mode/SKILL.md)（英文）。

### 讲稿格式

```markdown
## 01 第一页的标题

这是第一页的演讲者备注。

要点：
- 介绍主题
- 设定预期

## 02 问题所在

解释痛点...
```

### 快捷键

| 按键 | 功能 |
|------|------|
| `→` / `Space` / `PageDown` | 下一页 |
| `←` / `PageUp` | 上一页 |
| `Home` / `End` | 第一页或最后一页 |
| `B` | 黑屏观众窗口 |
| `R` | 重置计时器 |
| `+` / `-` / `0` | 调整或重置讲稿字号 |

### 演讲流程

1. 在笔记本上打开演讲者 URL
2. 点击"打开观众"按钮
3. 把观众窗口拖到投影屏幕
4. 在观众窗口按 F11 进入全屏
5. 在演讲者窗口控制翻页，观众窗口自动同步

### 开发与测试

```bash
# 测试
npm test

# 开发
python3 -m http.server 4311
open http://127.0.0.1:4311/presenter.html
```

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### 许可证

MIT — 见 [LICENSE](LICENSE)

---

## English

A zero-build presenter view for HTML slide decks.

Dual-window setup: audience sees clean slides on the projector, presenter sees notes + timer + current/next previews + slide list on their laptop screen.

![Presenter View](docs/screenshot-presenter.png)
![Audience View](docs/screenshot-audience.png)

### Features

- 🎯 **Dual-window setup**: Audience sees clean slides, presenter sees notes + previews
- 📝 **Speaker notes**: Markdown format with per-slide notes
- ⏱️ **Timer**: Track presentation time with reset
- 👀 **Preview**: Current and next slide side-by-side
- 📋 **Slide list**: Quick navigation with thumbnails
- 🎨 **Responsive**: Adapts to laptop, tablet, mobile screens
- 🌓 **Themes**: Light (Sun) and dark (Moon) modes
- 🌍 **i18n**: English and Chinese UI
- 🔧 **Zero-build**: No npm install, no bundler, just open in browser

### Quick Start

```bash
# Start local server
python3 -m http.server 4311

# Open presenter view
open http://127.0.0.1:4311/presenter.html
```

Loads by default:
- `slides.html` (slide deck)
- `notes.md` (speaker notes)

### Custom Paths

```text
presenter.html?slides=path/to/slides.html&notes=path/to/notes.md&lang=en
```

### URL Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `slides` | path | `slides.html` | Path to HTML deck |
| `notes` | path | `notes.md` | Path to Markdown notes |
| `lang` | `en`, `zh` | auto | UI language |
| `theme` | `sun`, `moon` | `sun` | Color theme |
| `layout` | `default`, `notes`, `balanced`, `preview` | `default` | Initial layout |

### Slide Deck Requirements

Your HTML deck must have:
- Each slide in a `.slide` element
- Speaker notes use `## 01 Title`, `## 02 Title` format in Markdown

Recommended navigation API:

```js
window.deck = {
  show(index) { /* Jump to slide at zero-based index */ },
  next() { this.show(this.current + 1); },
  prev() { this.show(this.current - 1); },
  get current() { return currentSlideIndex; },
  get total() { return totalSlides; }
};
```

See [skill/add-presenter-mode/SKILL.md](skill/add-presenter-mode/SKILL.md) for detailed deck adaptation patterns.

### Notes Format

```markdown
## 01 First Slide Title

Speaker notes for slide 1 go here.

Key points:
- Introduce topic
- Set expectations

## 02 The Problem

Explain pain point...
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `Space` / `PageDown` | Next slide |
| `←` / `PageUp` | Previous slide |
| `Home` / `End` | First or last slide |
| `B` | Blackout audience window |
| `R` | Reset timer |
| `+` / `-` / `0` | Adjust or reset notes font size |

### Presentation Workflow

1. Open presenter URL on your laptop
2. Click "Open audience" button
3. Drag audience window to projector screen
4. Press F11 on audience window for fullscreen
5. Control slides from presenter window; audience follows automatically

### Development & Testing

```bash
# Test
npm test

# Develop
python3 -m http.server 4311
open http://127.0.0.1:4311/presenter.html
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### License

MIT — see [LICENSE](LICENSE)
