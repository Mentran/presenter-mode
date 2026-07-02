---
name: add-presenter-mode
description: Add presenter view to HTML slides — dual-screen setup with speaker notes, timer, and navigation. Use when the user asks to add presenter mode, speaker view, 演讲者视图, or 投屏模式 to an HTML deck. Not for creating slides or native PowerPoint/Keynote automation.
---

# Add Presenter Mode

## Goal

Install a zero-build presenter tool that gives HTML slide decks a dual-window presentation mode: audience sees clean slides on the projector, presenter sees current/next previews + speaker notes + timer on their laptop.

## When to Use

- User has an existing HTML slide deck and wants presenter/speaker view
- User asks to add "演讲者视图", "投屏模式", "presenter mode", or "speaker notes"

## When NOT to Use

- Creating slides from scratch (use other tools first)
- Native PowerPoint/Keynote/WPS automation (no API access)
- Framework-based decks that require build step (build first, then adapt output)

## Workflow

### 1. Locate target deck

**Ask user for project directory** if not clear from context.

**Find the slide deck:**
- Prefer explicit `--slides` path if user provides one
- Otherwise search: `slides.html` → `index.html`
- If multiple HTML files exist, list them and ask user to choose

### 2. Locate or generate speaker notes

**Find notes file:**
- Prefer explicit `--notes` path if user provides one
- Otherwise search: `notes.md` → `speaker-notes.md`
- If neither exists, the install script will auto-generate an empty `notes.md` template

### 3. Check deck compatibility

**Read the deck HTML and check for navigation API:**

Look for these patterns:
- `window.deck` object with `.show(index)` method
- Hash navigation: `hashchange` listener, `location.hash`
- Slide structure: `.slide` class, `transform: translateX`, or similar

**Determine compatibility:**
- ✅ **Compatible**: Deck exposes `window.deck.show(n)` or responds to `#N` hash
- ⚠️ **Adaptable**: Has navigation but no external API (see Adaptation Patterns below)
- ❌ **Incompatible**: Framework-based requiring build, or no slide structure

### 4. Adapt deck if needed

**Only proceed after explicit user confirmation.**

If deck is adaptable but lacks the API:
1. Identify the internal navigation pattern (see Patterns section)
2. Add minimal wrapper to expose `window.deck.show(index)`
3. Test in browser console: `deckWindow.deck.show(2)` should jump to slide 3
4. Commit changes before running install

If deck cannot be adapted, explain limitation and suggest building static HTML first.

### 5. Run installation

```bash
node /path/to/skill/add-presenter-mode/scripts/install-presenter-mode.mjs \
  --slides slides.html \
  --notes notes.md
```

**The script:**
- Copies `assets/presenter-mode/` into target project
- Generates `notes.md` if missing (empty template with slide titles)
- Starts HTTP server on port 4311+
- Prints presenter URL with pre-filled query params

### 6. Verify

**Run automated check:**
```bash
node /path/to/skill/add-presenter-mode/scripts/verify-installation.mjs --slides slides.html
```

**Ask user to verify manually:**
1. Open the printed presenter URL
2. Check current preview shows slide 1, next shows slide 2
3. Click "Next" (→) button
4. Verify all four elements update: current preview, next preview, page label, speaker notes
5. Click "Open audience" button
6. Verify audience popup opens and follows navigation

**If verification fails:**
- Blank previews → check `--slides` path or CORS issues
- No sync → deck needs API adaptation (step 4)
- No notes → check `--notes` path and format (`## 01`, `## 02`, etc.)

### 7. Explain usage

```
✅ Presenter Mode ready

Setup:
1. Open presenter URL on your laptop
2. Click "Open audience" → drag to projector
3. Press F11 on audience window for fullscreen
4. Navigate from presenter window

Shortcuts:
← / → : Navigate
Space : Next slide
B : Blackout toggle
R : Reset timer
+ / - : Adjust notes font
```

## Script Options

```bash
node install-presenter-mode.mjs [options]

--target <dir>   Install into different project (default: cwd)
--slides <path>  Deck path relative to target (default: auto-detect)
--notes <path>   Notes path relative to target (default: auto-detect/generate)
--lang <code>    UI language: en | zh (default: auto from $LANG)
--port <number>  Start port search from here (default: 4311)
--force          Overwrite existing presenter-mode/ directory
--no-server      Copy files only, don't start HTTP server
```

**Examples:**
```bash
# Auto-detect everything
node install-presenter-mode.mjs

# Explicit paths
node install-presenter-mode.mjs --slides deck/index.html --notes talk/script.md

# Different project
node install-presenter-mode.mjs --target ~/projects/my-talk

# Force reinstall
node install-presenter-mode.mjs --force
```

## Deck Adaptation Patterns

Presenter tool controls slides via:
1. `iframe.contentWindow.deck.show(index)` (primary)
2. `iframe.contentWindow.location.hash = #N` (fallback)

If deck has internal navigation but no external API, add one of these wrappers:

### Pattern A: Class-Based Presentation

**When:** Deck has a class like `SlidePresentation` with `showSlide(index)` method.

**Add after presentation object creation:**
```js
// External control API
window.deck = {
  show(index) {
    presentation.showSlide(index);
    window.location.hash = `#${presentation.currentSlide + 1}`;
  },
  next() { this.show(presentation.currentSlide + 1); },
  prev() { this.show(presentation.currentSlide - 1); },
  get current() { return presentation.currentSlide; },
  get total() { return presentation.slides.length; }
};

// Hash navigation
function showSlideFromHash() {
  const page = Number(window.location.hash.replace('#', ''));
  if (Number.isFinite(page) && page > 0) presentation.showSlide(page - 1);
}
showSlideFromHash();
window.addEventListener('hashchange', showSlideFromHash);
```

### Pattern B: Horizontal Transform Deck

**When:** Deck uses `transform: translateX(...)` with a `go(n)` function and state vars like `idx`, `total`.

**Add hash-compatible wrapper:**
```js
// External control API
function goFromExternal(n) {
  lock = false;  // Reset lock for iframe sync
  go(n);
}

window.deck = window.deck || {};
window.deck.show = (index) => {
  goFromExternal(index);
  window.location.hash = '#' + (idx + 1);
};
window.deck.next = () => window.deck.show(idx + 1);
window.deck.prev = () => window.deck.show(idx - 1);
Object.defineProperty(window.deck, 'current', { get() { return idx; } });
Object.defineProperty(window.deck, 'total', { get() { return total; } });

// Hash navigation
function showSlideFromHash() {
  const page = Number(window.location.hash.replace('#', ''));
  if (Number.isFinite(page) && page > 0) goFromExternal(page - 1);
}
showSlideFromHash();
window.addEventListener('hashchange', showSlideFromHash);
```

**Note:** If deck HTML has `id="deck"`, attach methods to that element instead of creating `window.deck`.

### Pattern C: Framework Decks

**Problem:** React/Vue deck requires `npm run build`.

**Solution:**
1. Run build → get static HTML in `dist/` or `build/`
2. Adapt built HTML using Pattern A or B
3. Install presenter-mode: `--slides dist/index.html`

## Notes Format

Speaker notes use Markdown with numbered headings:

```markdown
## 01 First Slide Title

Speaker notes for slide 1 go here.

Key points:
- Introduce topic
- Set expectations

## 02 The Problem

Explain pain point...
```

**Rules:**
- Headings: `## NN` where NN is slide number (1-based)
- Everything between `## N` and `## N+1` is notes for slide N
- Markdown supported: `**bold**`, `*italic*`, `` `code` ``, lists
- Missing section → shows "No speaker notes for this slide"

**Auto-generated template:**
If `notes.md` doesn't exist, script extracts slide titles from deck HTML (`data-title` or first heading) and creates empty template.

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| Blank previews | Wrong `--slides` path or CORS | Verify path; serve via HTTP not `file://` |
| No sync | Deck lacks API | Adapt using Pattern A/B |
| No notes | Wrong path or format | Check `notes.md` uses `## 01`, `## 02` |
| Popup blocked | Browser security | Allow popups for localhost |
| Port busy | 4311 in use | Script tries 4311-4410; or use `--port` |

## Maintenance

`presenter.html` is a single self-contained file (CSS + JS inlined). Sync the latest copy into skill assets before publishing:
```bash
npm run sync
```
