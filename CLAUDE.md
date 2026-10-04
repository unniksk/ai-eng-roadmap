# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, single-page AI engineering roadmap for senior engineers, deployed on GitHub Pages: learning flows, a page per topic, a skill graph and a progress tracker. No build step, no dependencies, no tests, no linter. Progress lives in the visitor's browser `localStorage` (key `ai_tracker_v3`), never in the repo.

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Architecture

- `index.html` is a shell: top bar, sidebar and an empty `<main>`. Everything is rendered by `assets/js/app.js` from the hash route.
- Routes (all shareable): `#flows`, `#graph[/topic-slug]`, `#flow/<slug>`, `#flow/<slug>/<step>` (a topic page in flow context), `#topics`, `#topic/<slug>`, `#progress`, `#visuals`, `#new`. Any route can take one more segment that scrolls to a heading or checklist item, e.g. `#topic/graphrag/reading-list` or `#topic/graphrag/gr-3`. An empty hash shows the graph on screens 1024px and wider, flows otherwise (the List/Graph switch remembers a choice). Old links redirect: `#tracker`, `#map`, `#guide` via `LEGACY`, and bare section ids like `#ch13`.
- `assets/js/data.js` sets `window.TRACKER_SECTIONS` (`{id, c, part?, isNew?, icon?, t, d, items}`); each item is `[id, label, note, optionalLink]`. Checklist content lives here.
- `assets/js/resources.js` sets `window.RESOURCES`: the reading list per section id, `[type, title, url, note]`. Types: paper, docs, course, tool, repo, blog, video, report.
- `assets/js/content.js` holds page structure: `LEVELS`, `TOPIC_META` (slug, short title, level, hours, prerequisites, Senior lens), `GROUPS` (topic index and sidebar order), `FLOWS`, `LEGACY`, `NEWS` (the What's new page), `EXTRA_DESC`, `TOPIC_LINKS` (companion pages such as `system-design.html`) and `FIGURES` (infographics in `assets/img/`, shown as a Visual summary on each listed topic and on `#visuals`).
- `assets/js/icons.js` has the Lucide icons the site uses (ISC licence); `icon(name)` returns inline SVG. Copy any new icon's inner SVG from lucide-static.
- `assets/js/app.js` is the router, page renderers, skill graph layout, search (`/` to focus), progress updates and export/import/reset. Events are delegated from `document`; there are no inline handlers.
- `assets/css/style.css`: neutral palette with one accent, light and dark (system setting plus a toggle stored in `ai_roadmap_theme`). Fonts are Geist, Source Serif 4 and Geist Mono from Google Fonts, with system fallbacks.
- `system-design.html` is a standalone interactive guide to LLM serving, linked from the `sysdesign` topic. Its sections and headings have their own anchors.
- `404.html` redirects to the home page; `.nojekyll` makes Pages serve files as-is.

## Adding content

- New topic: add a section to `data.js`, a `TOPIC_META` row and a `GROUPS` entry in `content.js`, and optionally a `RESOURCES` entry. Put it in a flow's step list to make it part of that flow.
- The skill graph places topics by `level` and draws lines from `prerequisites`; a prerequisite must be in an earlier level column. Topics in the Library group are left off the graph. Columns stretch to the page width (recomputed on resize), each level has a colour token `--lv-<level>` in `style.css`, and the sidebar turns into a slide-out menu on the graph page (`body.canvas`).
- New infographic: crop it to the graphic itself (no phone status bars), save it as a JPEG in `assets/img/`, and add a `FIGURES` row with the creator's name for the credit line and the topic ids it belongs on.
- Add a `NEWS` row for anything readers would notice.

## Gotchas

- **Never rename or reuse an existing item `id`** in `data.js`: saved progress in users' browsers is keyed on it.
- **Never change a published topic or flow slug**: shared links use them. Add a redirect instead.
- Bump the `KEY` in `app.js` only if you intend to discard everyone's saved progress.
- All text and links pass through `esc()` before being inserted into HTML.

## Public repo: never commit secrets or PII

This repo is published on GitHub Pages, so everything committed is world-readable and stays in git history even after deletion.

- Never commit passwords, API keys, tokens, `.env` files, private keys, or personal data (emails, phone numbers, addresses, IDs). Check `git diff --staged` before every commit.
- Exported progress files (`tracker-progress-*.json`) are gitignored; keep them out of the repo. Don't add sample exports or `localStorage` dumps either.
- `data.js` content and links must be public material only: no private URLs, internal docs, or links with tokens or query-string credentials.
- The git author email is public in commit history; use a GitHub noreply address if the real one shouldn't be exposed.
- If a secret is ever pushed: rotate it first, then scrub history. Deleting the file in a new commit is not enough.
- `.gitignore` already covers `.env*`, `*.pem`, `*.key`; extend it before adding any other file type that could hold credentials.
