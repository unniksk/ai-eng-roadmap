// Generates share/*.html: one small page per topic and flow (plus the radar) with its own title,
// description and Open Graph tags, so links pasted into Slack, LinkedIn or email show a proper preview.
// Each page redirects to the real hash route and keeps any #anchor, e.g. share/topic-rag.html#reading-list.
// Run after changing topics, flows or their descriptions:  node tools/build-share-pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const BASE = 'https://unniksk.github.io/ai-eng-roadmap/';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['data', 'content']) {
  // Top-level const declarations stay private to a script, so expose them for this build only.
  const src = fs.readFileSync(path.join(root, 'assets/js', f + '.js'), 'utf8').replace(/^const /gm, 'var ');
  vm.runInContext(src, ctx);
}
const sections = Object.fromEntries(ctx.window.TRACKER_SECTIONS.map(s => [s.id, s]));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pages = [];
for (const [id, slug, title] of ctx.TOPIC_META) {
  const s = sections[id] || {};
  pages.push({ file: `topic-${slug}.html`, route: `topic/${slug}`, title, desc: s.d || ctx.EXTRA_DESC[id] || '' });
}
for (const [slug, title, , , desc] of ctx.FLOWS) pages.push({ file: `flow-${slug}.html`, route: `flow/${slug}`, title: title + ' (learning flow)', desc });
pages.push({ file: 'radar.html', route: 'radar', title: 'Technology radar', desc: 'What to adopt, trial, assess or hold in AI engineering, reviewed every quarter.' });

const page = p => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(p.title)} · AI Engineering Roadmap</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${BASE}share/${p.file}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="AI Engineering Roadmap">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${BASE}share/${p.file}">
<meta property="og:image" content="${BASE}assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=../index.html#${p.route}">
<script>location.replace('../index.html#${p.route}'+(location.hash.length>1?'/'+location.hash.slice(1):''))</script>
</head>
<body><p><a href="../index.html#${p.route}">${esc(p.title)}</a></p></body>
</html>
`;

const out = path.join(root, 'share');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const p of pages) fs.writeFileSync(path.join(out, p.file), page(p));
console.log(`Wrote ${pages.length} share pages to share/`);
