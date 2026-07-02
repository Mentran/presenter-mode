# Add Presenter Mode Skill

A Claude Code skill that installs a dual-window presenter view for HTML slide decks.

## What it does

Transforms any HTML slide deck into a professional presentation setup:
- **Presenter view**: Current/next previews, speaker notes, timer, navigation controls
- **Audience view**: Clean slides for the projector
- **Zero build**: Pure HTML/CSS/JS, works instantly

## Usage

In Claude Code, say:

```
Add presenter mode to my slides
```

Or be more specific:

```
Add 演讲者视图 to deck/index.html with notes in talk/script.md
```

The skill will:
1. Detect your slide deck (or ask for the path)
2. Check if your deck needs adaptation for sync
3. Install the presenter tool
4. Generate empty speaker notes if needed
5. Start a local server and give you the URL

## What you need

- HTML slide deck with a `.slide` class or similar structure
- Deck served via HTTP (not `file://` — the skill starts a server for you)
- Navigation code that exposes `window.deck.show(index)` or responds to hash changes

If your deck doesn't have external control, the skill can guide you to add it (2-10 lines of code).

## File structure after installation

```
your-project/
  slides.html                    # Your original deck (unchanged by default)
  notes.md                       # Speaker notes (auto-generated if missing)
  presenter-mode/
    presenter.html               # Presenter view (CSS + JS inlined, single file)
```

## Command reference

The skill calls this script under the hood:

```bash
node scripts/install-presenter-mode.mjs [options]
```

**Options:**
- `--slides <path>` — Path to your slide deck
- `--notes <path>` — Path to speaker notes
- `--lang en|zh` — UI language (auto-detected if not provided)
- `--target <dir>` — Install into a different directory
- `--port <number>` — Starting port (default 4311)
- `--force` — Overwrite existing installation
- `--no-server` — Copy files only, don't start server

**Verification:**
```bash
node scripts/verify-installation.mjs --slides slides.html
```

Checks deck compatibility and reports issues before you try presenting.

## Deck adaptation

If your deck doesn't expose `window.deck.show()` or hash navigation, you'll need to add a small control wrapper. See `SKILL.md` → "Deck Adaptation Patterns" for copy-paste templates covering:

- **Pattern A**: Decks with a presentation object (e.g., `presentation.showSlide()`)
- **Pattern B**: Horizontal decks using `translateX` and a `go()` function
- **Pattern C**: Framework-based decks (React, Vue, etc.) — adapt after building

## Speaker notes format

The tool reads Markdown notes like this:

```markdown
## 01 Introduction

Talk about the problem here.

Key points:
- Pain point A
- Pain point B

Transition: "Now let's look at the solution..."

## 02 The Solution

Explain your approach...
```

- Headings: `## 01`, `## 02`, etc. (numbers map to slide index)
- Markdown formatting: `**bold**`, `*italic*`, `` `code` ``, lists
- Missing notes → "No speaker notes for this slide."

## Troubleshooting

**Blank previews**
→ Wrong `--slides` path, or CORS blocking iframe

**Navigation doesn't sync**
→ Deck lacks control API; adapt it (see SKILL.md)

**Notes don't appear**
→ Check notes.md format uses `## 01`, `## 02`, etc.

**Audience window blocked**
→ Allow popups for localhost in browser settings

## More details

See `SKILL.md` for:
- Full workflow explanation
- Deck adaptation patterns with examples
- Notes format specification
- Troubleshooting guide
- Limitations and boundaries

## Maintenance

Before publishing, sync the latest presenter code:

```bash
cp presenter.html skill/add-presenter-mode/assets/presenter-mode/
cp -r src skill/add-presenter-mode/assets/presenter-mode/
```
