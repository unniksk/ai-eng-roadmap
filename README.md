# 🎯 AI Engineering Progress Tracker

A static, single-page learning tracker for AI engineering interview prep. It covers the handbook chapters (Ch 1–20), role gaps for principal AI platform roles, an O'Reilly reading list, hands-on labs from [AI Engineering from Scratch](https://aiengineeringfromscratch.com), a capstone, courses, YouTube and papers.

No build step and no dependencies. Progress is saved in your browser's `localStorage`.

## Structure

```
index.html            sidebar, Guide view and Tracker view (switch top right)
system-design.html    standalone interactive guide: the LLM serving stack
assets/css/style.css  guide + tracker styles (dark mode via prefers-color-scheme)
assets/js/data.js     all sections and items (edit this to update content)
assets/js/guide.js    guide search/filter, Guide/Tracker switch
assets/js/app.js      tracker rendering, progress, export/import
404.html              redirects to the tracker
.nojekyll             tells GitHub Pages to serve files as-is
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

Add items in `assets/js/data.js`. Each item is `[id, label, note, optionalLink]`.
Never rename an existing `id`, because saved progress is keyed on it.

## Progress and privacy

Checkmarks live only in the browser you tick them in. They are not in the repo and not shared with visitors.
Use **Export progress** to download a JSON backup and **Import progress** to restore it on another browser or device.
