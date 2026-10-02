# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page AI-engineering progress tracker deployed on GitHub Pages. No build step, no dependencies, no tests, no linter. Progress lives in the visitor's browser `localStorage` (key `ai_tracker_v3`), never in the repo.

## Run locally

```bash
python3 -m http.server 8000   # or just: open index.html
```

## Architecture

- `index.html` holds the static Guide (resource cards, hand-edited HTML) and the Tracker view, switched by the top-right Guide/Tracker buttons (`#tracker` hash deep-links). `assets/js/guide.js` handles the switch, search and type filter.
- `assets/js/data.js` sets `window.TRACKER_SECTIONS`, the array of sections (`{id, c, part?, isNew?, icon?, t, d, items}`). Each item is `[id, label, note, optionalLink]`. This is where all content edits happen.
- `assets/js/app.js` is a minified-style vanilla-JS renderer: it builds the cards from `TRACKER_SECTIONS`, handles checkbox ticks, per-section and overall stats, the level/readiness message thresholds (array `L` in `stats()`), and JSON export/import/reset. Handlers are inline `onclick`/`onchange` attributes, so the functions must stay global. `index.html` elements are referenced by bare id globals (`sTotal`, `oBar`, `irLevel`, ...), so renaming an element id in `index.html` breaks `stats()`.
- `assets/css/style.css` supports light and dark mode. `c1`, `c2`, ... in each section's `c` field are colour classes defined here.
- `404.html` redirects to the tracker; `.nojekyll` makes Pages serve files as-is.

## Gotchas

- **Never rename or reuse an existing item `id`** in `data.js`: saved progress in users' browsers is keyed on it.
- A tracker section's "To read" list is pulled from the Guide element with the same `id` (e.g. `ch1`, `courses`, `adv-eng`). Give a new section a matching `id` in `index.html` to get one.
- Bump the `KEY` in `app.js` only if you intend to discard everyone's saved progress.
- Section headers (`part`) render only when they differ from the previous section's `part`, so keep sections of the same part adjacent.
- Item text is passed through `esc()` (escapes `&` and `<` only), but the optional link (4th element) is inserted unescaped into an `href`.

## Public repo: never commit secrets or PII

This repo is published on GitHub Pages, so everything committed is world-readable and stays in git history even after deletion.

- Never commit passwords, API keys, tokens, `.env` files, private keys, or personal data (emails, phone numbers, addresses, IDs). Check `git diff --staged` before every commit.
- Exported progress files (`tracker-progress-*.json`) are gitignored; keep them out of the repo. Don't add sample exports or `localStorage` dumps either.
- `data.js` content and links must be public material only: no private URLs, internal docs, or links with tokens or query-string credentials.
- The git author email is public in commit history; use a GitHub noreply address if the real one shouldn't be exposed.
- If a secret is ever pushed: rotate it first, then scrub history. Deleting the file in a new commit is not enough.
- `.gitignore` already covers `.env*`, `*.pem`, `*.key`; extend it before adding any other file type that could hold credentials.
