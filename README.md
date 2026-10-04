# AI Engineering Roadmap

A roadmap for experienced engineers who want to lead in AI engineering. Eight learning flows take you from fast foundations to shaping where the field goes. Every topic has a checklist, a Senior lens (the trade-off to call, how it fails in production, the question to ask in a design review) and a reading list. A skill graph shows how the topics connect.

Every flow, step, topic, heading and checklist item has its own link, so you can share exactly what you mean.

No build step and no dependencies. Progress is saved in your browser's `localStorage`.

## Structure

```
index.html              app shell: top bar, sidebar, main area
system-design.html      standalone interactive guide: the LLM serving stack
assets/css/style.css    styles (light and dark)
assets/js/data.js       checklists per topic (edit to change items)
assets/js/resources.js  reading lists per topic
assets/js/content.js    topics, levels, flows, Senior lens, change log
assets/js/icons.js      Lucide icons used by the site (ISC licence)
assets/js/app.js        router, pages, skill graph, search, progress
404.html                redirects to the home page
.nojekyll               tells GitHub Pages to serve files as-is
```

## Run locally

```zsh
open index.html
# or
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy to GitHub Pages

```zsh
gh repo create ai-eng-roadmap --public --source=. --push
gh api -X POST repos/{owner}/ai-eng-roadmap/pages -f "source[branch]=main" -f "source[path]=/"
```

Or in the browser: **Settings → Pages → Deploy from a branch → `main` / root**.
The site appears at `https://<username>.github.io/ai-eng-roadmap/`.

## Editing content

Add checklist items in `assets/js/data.js`. Each item is `[id, label, note, optionalLink]`.
Never rename an existing `id`, because saved progress is keyed on it. Topics, flows and the Senior lens live in `assets/js/content.js`.

## Progress and privacy

Checkmarks live only in the browser you tick them in. They are not in the repo and not shared with visitors.
On the Progress page, use **Export progress** to download a JSON backup and **Import progress** to restore it on another browser or device.
