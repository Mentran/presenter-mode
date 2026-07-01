---
name: add-presenter-mode
description: Add a zero-build presenter view to an existing HTML slide deck by copying a bundled presenter-mode tool into the target project, wiring it to the deck and speaker notes, generating an empty notes template when needed, and starting a local static server. Use when the user asks to add presenter mode, presenter view, speaker view, speaker notes, 投屏演讲模式, 演讲者视图, or a private presenter screen to an HTML PPT / HTML slides project. Do not use for general PowerPoint creation, slide writing, or native Keynote/WPS/PowerPoint automation.
---

# Add Presenter Mode

## Overview

Install the bundled `presenter-mode/` browser tool into a target HTML slide project. This creates a dual-window setup: the audience sees clean slides on the projector, while the presenter sees current/next previews, speaker notes, timer, and navigation controls on their own screen.

The presenter tool is **read-only by default**: it does not modify the target deck unless the deck lacks the required navigation API and the user explicitly requests adaptation.

## Workflow

### 1. Locate the target project and slide deck

- Ask the user for the project directory if not obvious from context
- Prefer an explicit `--slides` path if the user provides one
- Otherwise search for: `slides.html` → `index.html`
- If multiple `.html` files exist and the target is ambiguous, list them and ask the user to clarify

### 2. Locate or generate speaker notes

- Prefer an explicit `--notes` path if the user provides one
- Otherwise search for: `notes.md` → `speaker-notes.md`
- If neither exists, the install script will generate an empty `notes.md` template with one section per slide

### 3. Check deck navigation compatibility

Before installing, verify whether the deck exposes a control API:

1. Read the deck HTML file
2. Search for these patterns:
   - `window.deck` object definition
   - Functions: `show`, `showSlide`, `go(`, `goTo`, `setSlide`
   - Classes: `.slide`, `.active`, `.visible`, `.current`
   - Hash navigation: `hashchange`, `location.hash`
   - Slide containers: `id="deck"`, `class="deck"`, `transform: translateX`

3. Determine compatibility:
   - ✅ **Compatible**: deck exposes `window.deck.show(index)` or responds to `location.hash = #N`
   - ⚠️ **Needs adaptation**: deck has internal navigation but no external control API
   - ❌ **Incompatible**: deck uses a framework that requires build tools or has no recognizable slide structure

### 4. Adapt the deck if needed

**Only proceed if the user explicitly requests deck modification or confirms the adaptation.**

If the deck is incompatible but adaptable:

1. Identify the deck's internal navigation pattern (see "Deck Adaptation Patterns" below)
2. Add the minimal control API wrapper to the deck's `<script>` section
3. Verify the adaptation:
   - Open the deck directly with `#2` in the URL → should show slide 2
   - Run `deckWindow.deck.show(0)` in console → should jump to slide 1
4. Commit the deck changes before running the install script

**If the deck cannot be adapted** (e.g., React-based, requires build, or no slide structure), explain the limitation and suggest alternatives (convert to static HTML first, or use a compatible deck generator).

### 5. Run the installation script

```bash
node /path/to/skill/add-presenter-mode/scripts/install-presenter-mode.mjs \
  --slides slides.html \
  --notes notes.md
```

The script will:
- Copy `assets/presenter-mode/` into `<target>/presenter-mode/`
- Generate `notes.md` if it doesn't exist (empty template with slide titles extracted from the deck)
- Start an HTTP server on port 4311 (or the next available port)
- Print the presenter URL with query params pre-filled: `?slides=...&notes=...`

### 6. Verify the installation

**Option A: Automated verification (recommended)**

Run the verification script to check deck compatibility:

```bash
node /path/to/skill/add-presenter-mode/scripts/verify-installation.mjs --slides slides.html
```

This script checks:
- ✓ Slides file exists and is readable
- ✓ Deck has recognizable slide structure (`.slide` class)
- ✓ Deck exposes `window.deck` API or hash navigation
- ✓ `presenter-mode/` directory is installed

If warnings appear, follow the guidance to adapt the deck before proceeding to user verification.

**Option B: Manual user verification**

**Ask the user to verify** (AI cannot test iframe synchronization directly):

1. Open the printed presenter URL in a browser
2. Check that the current preview shows slide 1 and the next preview shows slide 2
3. Click the "Next" (→) button or press the right arrow key
4. Verify that all four elements update together:
   - Current preview advances to slide 2
   - Next preview advances to slide 3
   - Page label updates (e.g., "02 / 06")
   - Speaker notes change to the slide 2 content
5. Click "Open audience" button
6. Verify the audience popup opens and shows the same slide as current preview
7. Navigate in the presenter view → audience window should follow

**If verification fails:**
- Blank previews → check `--slides` path is correct, or the deck HTML has CORS issues
- Navigation doesn't sync → the deck lacks the control API; go back to step 4
- Notes don't appear → check `--notes` path, or notes.md format (must use `## 01`, `## 02`, etc.)

### 7. Explain usage to the user

Once verified, provide this guidance:

```
✅ Presenter Mode is ready!

Setup for a presentation:
1. Open the presenter URL on your laptop
2. Click "Open audience" to launch the audience window
3. Drag the audience window to the projector screen
4. Press F11 (or Fn+F11) on the audience window to enter fullscreen
5. Use the presenter window on your laptop to control slides, see notes, and track time

Keyboard shortcuts (presenter window):
- ← / → : Navigate slides
- Space / Page Down : Next slide
- B : Blackout audience screen (toggle)
- R : Reset timer
- + / - : Increase/decrease notes font size
- 0 : Reset notes font to default

The "配置" (Setup) button in the topbar toggles the file path row if you need to reload different slides or notes.
```

## Script Reference

### Usage

```bash
node install-presenter-mode.mjs [options]
```

### Options

- `--target <dir>`: Install into a project other than the current working directory
- `--slides <path>`: Slide deck path, relative to target root (default: auto-detect `slides.html` or `index.html`)
- `--notes <path>`: Notes path, relative to target root (default: auto-detect or generate `notes.md`)
- `--lang <code>`: Language for presenter UI: `en` or `zh` (default: auto-detect from `LANG` environment variable)
- `--port <number>`: Start port search from this port (default: `4311`)
- `--force`: Replace existing `presenter-mode/` directory without prompting
- `--no-server`: Copy files only; do not start the HTTP server

### Examples

```bash
# Install in current directory, auto-detect slides and notes
node install-presenter-mode.mjs

# Install with explicit paths
node install-presenter-mode.mjs --slides deck/index.html --notes talk/script.md

# Install into a different project
node install-presenter-mode.mjs --target ~/projects/my-talk

# Replace existing installation
node install-presenter-mode.mjs --force

# Copy files without starting server (for CI or pre-deployment)
node install-presenter-mode.mjs --no-server
```

### Default Behavior

- Refuses to overwrite existing `presenter-mode/` unless `--force` is provided
- Starts HTTP server on port `4311`; if busy, tries the next 99 ports
- Server runs in the foreground; `Ctrl+C` stops it
- Generated notes are empty templates; AI does not invent speaker content

## Deck Adaptation Patterns

The presenter tool controls slides via:

1. **Primary**: `iframe.contentWindow.deck.show(index)` — when available
2. **Fallback**: `iframe.contentWindow.location.hash = #page` — must be supported by the deck

If the deck has internal navigation but no external control, adapt it using one of these patterns.

### Pattern A: Fixed-Stage Decks with a Presentation Object

**Use when:** The deck has a class like `SlidePresentation`, methods like `presentation.showSlide(index)`, and active slide classes (`.active`, `.visible`, `.current`).

**Example deck structure:**
```js
class SlidePresentation {
  constructor() {
    this.slides = document.querySelectorAll('.slide');
    this.currentSlide = 0;
  }
  showSlide(index) {
    this.slides.forEach((s, i) => s.classList.toggle('active', i === index));
    this.currentSlide = index;
  }
}
const presentation = new SlidePresentation();
```

**Add this after the presentation object is created:**

```js
// External control API for presenter-mode
window.deck = {
  show(index) {
    presentation.showSlide(index);
    window.location.hash = `#${presentation.currentSlide + 1}`;
  },
  next() {
    this.show(presentation.currentSlide + 1);
  },
  prev() {
    this.show(presentation.currentSlide - 1);
  },
  get current() {
    return presentation.currentSlide;
  },
  get total() {
    return presentation.slides.length;
  }
};

// Hash navigation support
function showSlideFromHash() {
  const page = Number(window.location.hash.replace('#', ''));
  if (Number.isFinite(page) && page > 0) {
    presentation.showSlide(page - 1);
  }
}

showSlideFromHash();
window.addEventListener('hashchange', showSlideFromHash);
```

### Pattern B: Horizontal Decks Using `translateX`

**Use when:** The deck has a container moved with `transform: translateX(...)`, a navigation function like `go(n)`, and state variables like `idx`, `total`, or `lock`.

**Example deck structure:**
```js
let idx = 0;
let total = 6;
let lock = false;
const deck = document.getElementById('deck');

function go(n) {
  if (lock) return;
  idx = Math.max(0, Math.min(n, total - 1));
  lock = true;
  deck.style.transform = `translateX(-${idx * 100}vw)`;
  setTimeout(() => { lock = false; }, 600);
}
go(0);
```

**Add a hash-compatible external control wrapper:**

```js
// External control API for presenter-mode
function goFromExternal(n) {
  lock = false;  // Reset lock to allow rapid iframe sync
  go(n);
}

window.deck = window.deck || {};
window.deck.show = (index) => {
  goFromExternal(index);
  window.location.hash = '#' + (idx + 1);
};
window.deck.next = () => window.deck.show(idx + 1);
window.deck.prev = () => window.deck.show(idx - 1);
Object.defineProperty(window.deck, 'current', { configurable: true, get() { return idx; } });
Object.defineProperty(window.deck, 'total', { configurable: true, get() { return total; } });

// Hash navigation support
function showSlideFromHash() {
  const page = Number(window.location.hash.replace('#', ''));
  if (Number.isFinite(page) && page > 0) goFromExternal(page - 1);
}

showSlideFromHash();
window.addEventListener('hashchange', showSlideFromHash);
```

**Note:** If the deck HTML already has `id="deck"`, browsers expose that element as `window.deck`. In that case, attach `show`, `next`, and `prev` to the existing deck element instead of creating a new `window.deck` object.

### Pattern C: Framework-Based Decks (React, Vue, etc.)

**Problem:** The deck is built with a framework and requires `npm run build` to generate the final HTML.

**Solution:**
1. Run the build process first to generate static HTML
2. Locate the output HTML file (usually in `dist/` or `build/`)
3. Adapt the built HTML using Pattern A or B
4. Install presenter-mode pointing to the built file: `--slides dist/index.html`

**Alternatively:** Modify the framework source to export `window.deck.show()` and rebuild.

## Notes Format

The presenter tool parses speaker notes from Markdown using this convention:

```markdown
## 01 First Slide Title

This is what you should say on the first slide.

Key points:
- Introduce the topic
- Set expectations

Transition: "Now let's look at the problem..."

## 02 The Problem

Explain the pain point here.

...
```

**Format rules:**
- Headings start with `##` followed by a number (01, 02, 1, 2, etc.)
- The number maps to the slide index (1-based)
- Everything between `## N` and `## N+1` is the speaker notes for slide N
- Markdown formatting is supported: `**bold**`, `*italic*`, `` `code` ``, lists, etc.
- If a slide has no notes section, the presenter shows "No speaker notes for this slide."

**Auto-generated template:**
When notes.md doesn't exist, the install script generates an empty template by extracting slide titles from the deck HTML:
- Searches for `data-title` attributes on `.slide` elements
- Falls back to the first `<h1>`, `<h2>`, or `<h3>` inside each slide
- Pads slide numbers to match the total count (e.g., `## 01` for a 12-slide deck)

## Boundaries and Limitations

### In Scope
- HTML slide decks with recognizable slide structure (`.slide` class or similar)
- Decks with JavaScript-based navigation (manual adaptation may be required)
- Static HTML decks served via HTTP (no build step)
- Speaker notes in Markdown format

### Out of Scope
- Native desktop apps: Keynote, PowerPoint, WPS, LibreOffice (no API access)
- Slide generation or content creation (use other tools/skills for that)
- Complex framework-based decks that require build tools (adapt after building)
- CORS-restricted decks (must be served from the same origin)
- Animation synchronization (animations play independently in presenter/audience views)

### Known Limitations
- The presenter tool cannot inspect iframe content if CORS blocks access
- Some custom slide libraries may need unique adaptation (file an issue if encountered)
- Mobile browsers may not support the audience popup window feature
- Timer does not persist across page reloads (manual tracking only)

## Troubleshooting

### Blank Previews
- **Cause:** Incorrect `--slides` path, or CORS blocking iframe access
- **Fix:** Verify the slides path is relative to the target root, and the deck is served via HTTP (not `file://`)

### Navigation Doesn't Sync
- **Cause:** The deck lacks `window.deck.show()` or hash navigation support
- **Fix:** Adapt the deck using Pattern A or B above

### Notes Don't Appear
- **Cause:** Incorrect `--notes` path, or notes format doesn't match `## NN` convention
- **Fix:** Check notes.md exists, and headings start with `## 01`, `## 02`, etc.

### Audience Window Doesn't Open
- **Cause:** Browser blocked the popup
- **Fix:** Allow popups for `localhost` or `127.0.0.1` in browser settings

### Port Already in Use
- **Cause:** Another process is using port 4311
- **Fix:** The script automatically tries ports 4311-4410; if all are busy, stop conflicting processes or use `--port 8000`

## Maintenance

Before publishing or distributing this skill, sync the latest presenter tool files:

```bash
# From the project root
cp presenter.html skill/add-presenter-mode/assets/presenter-mode/
cp -r src skill/add-presenter-mode/assets/presenter-mode/
```

This ensures the bundled assets match the current implementation.
