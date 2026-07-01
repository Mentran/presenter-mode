# Presenter Mode

A zero-build presenter view for HTML slide decks.

It gives you a private speaker window with notes, timer, current/next previews, slide list, font controls, collapsible panels, and a separate audience window for projection.

## Quick Start

```bash
python3 -m http.server 4311
```

Open:

```text
http://127.0.0.1:4311/presenter.html
```

By default, Presenter Mode loads:

- `slides.html`
- `notes.md`

You can also pass paths explicitly:

```text
presenter.html?slides=path/to/slides.html&notes=path/to/notes.md
```

Chinese UI:

```text
presenter.html?lang=zh
```

Moon theme:

```text
presenter.html?theme=moon
```

## Slide Deck Contract

Minimum contract:

- each page is a `.slide` element
- speaker notes use level-2 headings like `## 01 Title`, `## 02 Title`

Recommended API:

```js
window.deck = {
  show(index) {
    // index starts from 0
  }
};
```

Presenter Mode calls `window.deck.show(index)` first. If the API is missing, it falls back to `#1`, `#2`, and so on.

## Scope

Presenter Mode controls HTML slide decks running in the browser. It does not directly control native desktop presentation apps such as WPS Presentation, Microsoft PowerPoint, or Keynote.

Native app control would require a separate system automation layer or app-specific plugin, which is outside the zero-build browser-only scope of this project.

## Keyboard

- `ArrowRight`, `Space`, `PageDown`: next slide
- `ArrowLeft`, `PageUp`: previous slide
- `Home`, `End`: first or last slide
- `B`: blackout audience window
- `R`: reset timer
- `+`, `-`, `0`: adjust or reset notes font size

## Test

```bash
npm test
```

No build step is required.
