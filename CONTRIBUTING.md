# Contributing

## Development

This is a zero-build project. Edit HTML/CSS/JS directly:

```bash
# Start dev server
python3 -m http.server 4311

# Open presenter mode
open http://127.0.0.1:4311/presenter.html
```

## Testing

```bash
npm test
```

The smoke test verifies:
- Presenter HTML loads
- Required DOM elements exist
- Default slides/notes paths resolve

## Project Structure

```
.
├── presenter.html          # Main presenter view
├── src/
│   ├── presenter.css      # Styles
│   └── presenter.js       # Logic
├── slides.html            # Example deck
├── notes.md               # Example speaker notes
└── skill/
    └── add-presenter-mode/
        ├── SKILL.md       # Claude skill definition
        ├── scripts/       # Installation scripts
        └── assets/        # Bundled presenter tool
```

## Making Changes

1. **Edit core files**: `presenter.html`, `src/presenter.css`, `src/presenter.js`
2. **Test locally**: verify in browser at multiple breakpoints
3. **Sync to skill**: `cp presenter.html src/* skill/add-presenter-mode/assets/presenter-mode/`
4. **Run tests**: `npm test`
5. **Commit with clear message**

## Skill Asset Sync

Before publishing skill updates:

```bash
cp presenter.html skill/add-presenter-mode/assets/presenter-mode/
cp -r src skill/add-presenter-mode/assets/presenter-mode/
```

The skill bundles a copy of the presenter tool for installation into user projects.

## Compatibility

Target modern browsers (last 2 versions of Chrome/Firefox/Safari/Edge). Features used:
- CSS Grid, Flexbox, Container Queries
- ES6 modules (inline, not external)
- `window.open()`, `BroadcastChannel`, `localStorage`
- Iframe sandboxing

## Code Style

- **HTML**: semantic tags, `data-*` attributes for JS hooks
- **CSS**: utility-first where clear, component classes otherwise; CSS variables for theming
- **JS**: vanilla ES6+, no build step, inline in HTML
- **Comments**: explain *why*, not *what*
- **i18n**: all UI strings in `copy` object with `en`/`zh` keys

## Submitting Changes

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear message following existing style
6. Push and open a PR with description of changes and testing done
