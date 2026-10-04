// AI Engineering Roadmap: hash router, page renderers and progress tracking.
// Content lives in data.js (checklists), resources.js (reading lists) and content.js (topics, flows, change log).
// Progress is stored in localStorage under KEY; bump KEY only to discard everyone's saved progress.
const KEY='ai_tracker_v3';
const SECTIONS=window.TRACKER_SECTIONS, RES=window.RESOURCES||{};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const slugify=s=>s.toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

// ---------- Model ----------
const LV=Object.fromEntries(LEVELS.map((l,i)=>[l[0],i]));
const T={}, BY_SLUG={};
TOPIC_META.forEach(([id,slug,title,level,hours,pre,lens])=>{
  const s=SECTIONS.find(x=>x.id===id)||{};
  T[id]={id,slug,title,full:(s.t||title).replace(/^(Ch \d+|Intermediate|Advanced|Role Gaps|Frontier) · /,''),chapter:(s.t||'').match(/^Ch (\d+)/)?.[1],
    desc:s.d||EXTRA_DESC[id]||'',level,hours,pre,lens,items:s.items||[],res:RES[id]||[],group:''};
  BY_SLUG[slug]=T[id];
});
GROUPS.forEach(([g,ids])=>ids.forEach(id=>T[id].group=g));
Object.values(T).forEach(t=>t.next=[]);
Object.values(T).forEach(t=>t.pre.forEach(p=>T[p].next.push(t.id)));
const FL=FLOWS.map(([slug,title,ic,level,desc,steps,build])=>({slug,title,ic,level,desc,steps,build}));
const FL_BY=Object.fromEntries(FL.map(f=>[f.slug,f]));
const ORDER=GROUPS.flatMap(g=>g[1]);

let st={},today=0;const todayKey=new Date().toDateString();
function load(){try{const r=localStorage.getItem(KEY);if(r){const s=JSON.parse(r);st=s.checks||{};today=s.todayKey===todayKey?(s.today||0):0}}catch(e){}
  // Each check stores a depth: 1 read, 2 can explain, 3 built. Older saves stored true, which counts as read.
  Object.keys(st).forEach(k=>{if(st[k]===true)st[k]=1;else if(!st[k])delete st[k]});
  NOTES=jget(NOTES_KEY);CS=jget(CARDS_KEY)}
const NOTES_KEY='ai_roadmap_notes',CARDS_KEY='ai_roadmap_cards';let NOTES={},CS={};
function jget(k){try{return JSON.parse(localStorage.getItem(k))||{}}catch(e){return{}}}
function jset(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const DEPTH=[null,'Read','Can explain','Built'];
function save(){try{localStorage.setItem(KEY,JSON.stringify({checks:st,todayKey,today}))}catch(e){}}
function pref(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}}

function tp(id){const t=T[id],n=t.items.length,k=t.items.filter(i=>st[i[0]]).length;return{k,n,p:n?Math.round(k/n*100):0}}
function fp(f){let k=0,n=0;f.steps.forEach(id=>{const x=tp(id);k+=x.k;n+=x.n});return{k,n,p:n?Math.round(k/n*100):0}}
function hours(ids){return ids.reduce((a,id)=>a+T[id].hours,0)}
function stepState(f,i){const x=tp(f.steps[i]);const ni=f.steps.findIndex(id=>tp(id).p<100);return x.n&&x.p===100?'done':i===ni?'next':x.k?'part':''}
function bar(p,cls){return `<div class="bar${p===100?' done':''}${cls?' '+cls:''}"><i style="width:${p}%"></i></div>`}
function pbar(x){return `<div class="pbar">${bar(x.p)}<span>${x.k}/${x.n}</span></div>`}

// ---------- Routing ----------
// Routes: #flows, #graph[/slug], #flow/slug[/n][/anchor], #topics, #topic/slug[/anchor], #progress, #new.
// Empty hash shows flows or the graph depending on screen size. Old hashes (#tracker, #map, #ch13) redirect.
let cur={key:null};
function parse(){
  let h=decodeURIComponent(location.hash.replace(/^#\/?/,''));
  if(LEGACY[h])return redirect(LEGACY[h]);
  if(T[h])return redirect('topic/'+T[h].slug);
  if(h.startsWith('sec-')&&T[h.slice(4)])return redirect('topic/'+T[h.slice(4)].slug);
  const p=h.split('/').filter(Boolean);
  if(!p.length){const wide=matchMedia('(min-width:1024px)').matches,v=pref('ai_roadmap_home')||(wide?'graph':'flows');return{page:v==='graph'&&wide?'graph':'flows',key:'home'}}
  const [a,b,c,d]=p;
  if(a==='flows')return{page:'flows',key:'flows',anchor:b};
  if(a==='graph')return{page:'graph',key:'graph',sel:b&&BY_SLUG[b]?BY_SLUG[b].id:null};
  if(a==='topics')return{page:'topics',key:'topics',anchor:b};
  if(a==='progress')return{page:'progress',key:'progress',anchor:b};
  if(a==='new')return{page:'new',key:'new',anchor:b};
  if(a==='visuals')return{page:'visuals',key:'visuals',anchor:b};
  if(a==='radar')return{page:'radar',key:'radar',anchor:b};
  if(a==='review')return{page:'review',key:'review/'+(b||''),id:b&&BY_SLUG[b]?BY_SLUG[b].id:null};
  if(a==='import'&&b)return{page:'importLink',key:'import',payload:b};
  if(a==='topic'&&BY_SLUG[b])return{page:'topic',key:'topic/'+b,id:BY_SLUG[b].id,anchor:c};
  if(a==='flow'&&FL_BY[b]){const f=FL_BY[b];
    if(/^\d+$/.test(c)&&f.steps[c-1])return{page:'topic',key:'flow/'+b+'/'+c,id:f.steps[c-1],flow:f,step:+c,anchor:d};
    return{page:'flow',key:'flow/'+b,flow:f,anchor:c}}
  return{page:'missing',key:'missing'};
}
function redirect(h){history.replaceState(null,'','#'+h);return parse()}
function base(r){return r.key==='home'?'flows':r.key}

function route(){
  const r=parse(),same=r.key===cur.key&&r.page!=='graph',again=r.page==='graph'&&cur.page==='graph';cur=r;
  document.body.classList.toggle('drawer-open',r.page==='graph'&&!!r.sel);
  document.body.classList.toggle('canvas',r.page==='graph');
  if(again){$('#drawer').innerHTML=drawer(r.sel);$('#drawer').hidden=!r.sel;regraph(r.sel)}
  else if(!same){const m=$('#main');m.innerHTML=(PAGES[r.page]||PAGES.missing)(r);if(r.page==='graph')regraph(r.sel);if(r.page==='review')renderReview();decorate(m);document.title=pageTitle(r)}
  else if(r.page==='topic')updateRail();
  if(r.page==='graph'&&r.sel){const n=document.querySelector(`.node[data-node="${r.sel}"]`);if(n)n.scrollIntoView({block:'nearest',inline:'nearest'})}
  sidebar(r);topnav(r);closeMenu();
  if(r.anchor){const el=document.querySelector(`[data-anchor="${CSS.escape(r.anchor)}"]`);if(el){el.scrollIntoView({block:'start'});if(el.classList.contains('item')){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)}}}
  else if(!same&&!again)scrollTo(0,0);
}
function pageTitle(r){const n='AI Engineering Roadmap';
  if(r.page==='topic')return T[r.id].title+' · '+n;
  if(r.page==='flow')return r.flow.title+' · '+n;
  const m={flows:'Flows',graph:'Skill graph',topics:'Topics',progress:'Progress',new:"What's new",visuals:'Visuals',radar:'Technology radar',review:'Card review',importLink:'Import progress'};return m[r.page]?m[r.page]+' · '+n:n}

// Heading with a copyable link. anchor is the last part of the URL; base is the page's route.
function H(tag,text,anchor,r,cls){return `<${tag} class="hd${cls?' '+cls:''}" data-anchor="${anchor}">${text}<a class="hl" href="#${base(r)}/${anchor}" aria-label="Copy link to ${esc(text.replace(/<[^>]+>/g,''))}">${icon('link')}</a></${tag}>`}

// ---------- Pages ----------
const PAGES={
flows(r){
  return `<div class="page wide"><div class="home-head"><div><div class="eyebrow">Learning flows</div><h1 class="title">Where do you want to go next?</h1></div>${viewSwitch('flows')}</div>
  <p class="lede">Eight paths through the roadmap, from fast foundations to shaping where the field goes. Each step opens a topic page with a checklist, a Senior lens and a reading list. Ticks count in every flow that shares the topic.</p>
  <div class="ladder" aria-label="Levels">${LEVELS.map(l=>`<div style="--c:var(--lv-${l[0]})"><b>${l[1]}</b><span>${l[2]}</span></div>`).join('')}</div>
  <div class="flows">${FL.map(f=>{const x=fp(f);return `<div class="flow" data-anchor="${f.slug}">${icon(f.ic)}
    <div><h2><a href="#flow/${f.slug}">${esc(f.title)}</a></h2><p>${esc(f.level)} · ${f.steps.length} steps · about ${hours(f.steps)} h</p></div>
    <div class="dots" aria-label="Steps">${f.steps.map((id,i)=>`${i?`<span class="link${stepState(f,i-1)==='done'?' done':''}"></span>`:''}<a class="dot ${stepState(f,i)}" href="#flow/${f.slug}/${i+1}" title="${i+1}. ${esc(T[id].title)} (${tp(id).p}%)">${stepState(f,i)==='done'?icon('check'):i+1}</a>`).join('')}</div>
    <div class="pct" data-fp="${f.slug}">${x.p}%</div></div>`}).join('')}</div></div>`},

graph(r){
  return `<div class="page full"><div class="home-head"><div><div class="eyebrow">Skill graph</div><h1 class="title">How the topics connect</h1></div>${viewSwitch('graph')}</div>
  <p class="lede">Columns run from Know to Shape. Lines point from a topic to the topics that build on it. Select a topic to see its checklist and what it unlocks.</p>
  <div class="graph-wrap"><div class="graph"></div></div>
  <div class="legend">${LEVELS.map(l=>`<span style="--c:var(--lv-${l[0]})"><i class="lv"></i>${l[1]}</span>`).join('')}<span><i class="d"></i>Done</span><span>Reading lists such as books and courses are under <a href="#topics/library">Topics</a>.</span></div></div>
  <aside class="drawer" id="drawer" aria-label="Topic details" ${r.sel?'':'hidden'}>${drawer(r.sel)}</aside>`},

flow(r){const f=r.flow,x=fp(f);
  return `<div class="page"><div class="eyebrow"><a href="#flows">Flows</a><span>${esc(f.level)}</span></div>
  <h1 class="title">${esc(f.title)}</h1><p class="lede">${esc(f.desc)}</p>
  <div class="meta"><span>${icon('route')}${f.steps.length} steps</span><span>${icon('clock')}about ${hours(f.steps)} h</span><span style="flex:1;min-width:180px" data-fpbar="${f.slug}">${pbar(x)}</span></div>
  ${H('h2','Steps','steps',r)}
  <ol class="steps">${f.steps.map((id,i)=>{const t=T[id],s=stepState(f,i);return `<li class="step ${s}" data-anchor="${i+1}"><a class="dot ${s}" href="#flow/${f.slug}/${i+1}" aria-label="Step ${i+1}">${s==='done'?icon('check'):i+1}</a>
    <div><h3><a href="#flow/${f.slug}/${i+1}">${esc(t.title)}</a></h3><p>${esc(t.desc)}</p><div class="pbar">${bar(tp(id).p)}<span data-tpk="${id}">${tp(id).k}/${tp(id).n}</span><span>· ${t.hours} h</span></div></div></li>`}).join('')}</ol>
  ${H('h2','Build this','build-this',r)}
  <div class="callout"><div class="lbl">${icon('hammer')}Exercise</div><p>${esc(f.build)}</p></div>
  <div class="btns" style="margin-top:28px"><a class="btn primary" href="#flow/${f.slug}/${Math.max(1,f.steps.findIndex(id=>tp(id).p<100)+1)}">${x.k?'Continue':'Start'} ${icon('arrow-right')}</a><button class="btn" data-copy="#flow/${f.slug}">${icon('link')}Copy link</button></div></div>`},

topic(r){const t=T[r.id],x=tp(t.id),f=r.flow;
  const inFlows=FL.filter(fl=>fl.steps.includes(t.id));
  const g=GROUPS.find(g=>g[1].includes(t.id))[1],gi=g.indexOf(t.id);
  const prev=f?(r.step>1?[`#flow/${f.slug}/${r.step-1}`,T[f.steps[r.step-2]].title]:null):(gi>0?['#topic/'+T[g[gi-1]].slug,T[g[gi-1]].title]:null);
  const next=f?(r.step<f.steps.length?[`#flow/${f.slug}/${r.step+1}`,T[f.steps[r.step]].title]:[`#flow/${f.slug}/build-this`,'Build this']):(gi<g.length-1?['#topic/'+T[g[gi+1]].slug,T[g[gi+1]].title]:null);
  const secs=[];
  let body='';
  if(TOPIC_LINKS[t.id]){const[l,ti,no]=TOPIC_LINKS[t.id];body+=`<a class="callout" href="${l}" style="display:block;margin-top:28px;color:inherit;text-decoration:none"><div class="lbl">${icon('book-open')}Companion guide</div><p><span style="color:var(--accent);font-family:var(--f-ui);font-weight:600">${esc(ti)} ${icon('arrow-right')}</span><br><span class="muted" style="font-size:15.5px">${esc(no)}</span></p></a>`}
  if(t.lens){secs.push(['senior-lens','Senior lens']);body+=H('h2','Senior lens','senior-lens',r)+`<div class="lens"><div><b>Trade-off to call</b><p>${esc(t.lens[0])}</p></div><div><b>How it fails in production</b><p>${esc(t.lens[1])}</p></div><div><b>Ask in design review</b><p>${esc(t.lens[2])}</p></div></div>`}
  if(t.items.length){secs.push(['checklist','Checklist']);body+=H('h2',`Checklist <span class="chip" data-tpk="${t.id}">${x.k}/${x.n}</span>`,'checklist',r)+`<div class="items">${t.items.map(i=>itemRow(i,r)).join('')}</div>`}
  const figs=FIGURES.filter(f=>f[5].includes(t.id));
  if(figs.length){secs.push(['visual-summary','Visual summary']);body+=H('h2',figs.length>1?'Visual summaries':'Visual summary','visual-summary',r)+figs.map(f=>figure(f)).join('')}
  const cards=cardsFor(t.id);
  if(cards.length){secs.push(['anki-cards','Anki cards']);const dn=cards.filter(isDue).length;body+=H('h2',`Anki cards <span class="chip">${cards.length}</span>`,'anki-cards',r)+`<p class="muted" style="margin:-4px 0 12px">Select a card to see the answer. Review them on a schedule here, or download them into Anki.</p><div class="cards">${cards.map(c=>cardRow(c,r)).join('')}</div><div class="btns" style="margin-top:14px"><a class="btn primary" href="#review/${t.slug}">${icon('brain')}Review ${dn?dn+' due':'these cards'}</a><button class="btn" data-anki="${t.id}">${icon('download')}Download for Anki</button></div>`}
  secs.push(['my-notes','My notes']);body+=H('h2','My notes','my-notes',r)+`<textarea class="notes" data-note="${t.id}" rows="5" placeholder="Your takeaways, open questions and opinions. Saved in this browser; export them from the Progress page.">${esc(NOTES[t.id]||'')}</textarea>`;
  if(t.res.length){secs.push(['reading-list','Reading list']);body+=H('h2',`Reading list <span class="chip">${t.res.length}</span>`,'reading-list',r)+`<div class="reads">${t.res.map(readRow).join('')}</div>`}
  if(inFlows.length){secs.push(['in-flows','In flows']);body+=H('h2','In flows','in-flows',r)+`<div class="reads">${inFlows.map(fl=>{const i=fl.steps.indexOf(t.id);return `<div class="read">${icon(fl.ic)}<div><a href="#flow/${fl.slug}/${i+1}">${esc(fl.title)}</a><div class="note">Step ${i+1} of ${fl.steps.length} · ${esc(fl.level)}</div></div></div>`}).join('')}</div>`}
  const rel=[...t.pre.map(p=>['Builds on',p]),...t.next.map(n=>['Leads to',n])];
  if(rel.length){secs.push(['related','Related']);body+=H('h2','Related','related',r)+`<div class="reads">${rel.map(([k,id])=>`<div class="read">${icon(k==='Leads to'?'arrow-right':'arrow-left')}<div><a href="#topic/${T[id].slug}">${esc(T[id].title)}</a><div class="note">${k} · ${esc(T[id].group)}</div></div></div>`).join('')}</div>`}
  const head=`${f?`<div class="flowbar"><span class="where">${icon(f.ic)}<span>Step ${r.step} of ${f.steps.length} in <a href="#flow/${f.slug}">${esc(f.title)}</a></span></span><span class="dots" style="flex:0 1 260px">${f.steps.map((id,i)=>`${i?`<span class="link${stepState(f,i-1)==='done'?' done':''}"></span>`:''}<a class="dot ${stepState(f,i)}" href="#flow/${f.slug}/${i+1}" title="${esc(T[id].title)}" ${i+1===r.step?'aria-current="step" style="outline:2px solid var(--ink);outline-offset:2px"':''}>${i+1}</a>`).join('')}</span></div>`:''}
  <div class="eyebrow"><a href="#topics/${slugify(t.group)}">${esc(t.group)}</a>${t.chapter?`<span>Chapter ${t.chapter}</span>`:''}<span>${esc(LEVELS[LV[t.level]][1])}</span></div>
  <h1 class="title">${esc(t.full)}</h1>${t.desc?`<p class="lede">${esc(t.desc)}</p>`:''}${radarLine(t.id)}
  <div class="meta">${t.items.length?`<span>${icon('circle-check')}${t.items.length} checks</span>`:''}${t.res.length?`<span>${icon('library')}${t.res.length} readings</span>`:''}${t.hours?`<span>${icon('clock')}about ${t.hours} h</span>`:''}<button class="btn" data-copy="#${base(r)}" style="padding:4px 10px;font-size:13px">${icon('link')}Copy link</button>${t.items.length?`<span style="flex:1;min-width:180px" data-tpbar="${t.id}">${pbar(x)}</span>`:''}</div>`;
  const pager=`<nav class="pager" aria-label="Previous and next">${prev?`<a href="${prev[0]}"><small>Previous</small>${esc(prev[1])}</a>`:''}${next?`<a class="nx" href="${next[0]}"><small>Next</small>${esc(next[1])}</a>`:''}</nav>`;
  const rail=secs.length>1?`<aside class="rail" aria-label="On this page"><div class="lbl">On this page</div>${secs.map(([a,l])=>`<a href="#${base(r)}/${a}" data-rail="${a}">${l}</a>`).join('')}</aside>`:'';
  return `<div class="with-rail"><div class="page" style="margin:0">${head}${body}${pager}</div>${rail}</div>`},

topics(r){
  return `<div class="page"><div class="eyebrow">Topics</div><h1 class="title">Every topic in the roadmap</h1>
  <p class="lede">${Object.keys(T).length} topics in ${GROUPS.length} groups. Each has a checklist, a reading list and, for most, a Senior lens.</p>
  ${GROUPS.map(([g,ids])=>`<section class="group">${H('h2',esc(g),slugify(g),r)}${ids.map(id=>{const t=T[id],x=tp(id);return `<a class="trow" href="#topic/${t.slug}"><span><b>${esc(t.title)}</b><small>${esc(t.desc)}</small></span><span class="chip lv" style="--c:var(--lv-${t.level})">${esc(LEVELS[LV[t.level]][1])}</span>${t.items.length?`<span data-tpbar="${id}">${pbar(x)}</span>`:`<span class="mono muted">${t.res.length} readings</span>`}</a>`}).join('')}</section>`).join('')}</div>`},

progress(r){const all=Object.values(T);let k=0,n=0,started=0;all.forEach(t=>{const x=tp(t.id);k+=x.k;n+=x.n;if(x.k)started++});const p=n?Math.round(k/n*100):0;
  const L=[[10,'Know','Start with Fast foundations. Know every term in chapter 1 cold.'],[30,'Build','Work through Production RAG and Agentic systems, and build as you go.'],[55,'Ship','Make evals, guardrails and observability habits. Finish the capstone.'],[80,'Lead','Take on serving, platform and model trade-offs. Practise system design out loud.'],[101,'Shape','Write and publish your point of view. Run design reviews for others.']];
  const l=L.find(x=>p<x[0]);
  return `<div class="page"><div class="eyebrow">Progress</div><h1 class="title">Your progress</h1>
  <p class="lede">Saved in this browser only. Export a backup before clearing your browser data or switching devices.</p>
  <div class="big"><b data-overall>${p}%</b><div><div class="lvl">Level: ${l[1]}</div><p>${l[2]}</p></div></div>
  <div class="stats"><div><b>${n}</b><span>Checks in total</span></div><div><b data-done>${k}</b><span>Completed</span></div><div><b>${started}</b><span>Topics started</span></div><div><b>${today}</b><span>Done today</span></div></div>
  ${H('h2','Flows','flows',r)}${FL.map(f=>`<a class="prow" href="#flow/${f.slug}"><span>${esc(f.title)}</span><span data-fpbar="${f.slug}">${pbar(fp(f))}</span></a>`).join('')}
  ${H('h2','Topic groups','groups',r)}${GROUPS.filter(g=>g[1].some(id=>T[id].items.length)).map(([g,ids])=>{let a=0,b=0;ids.forEach(id=>{const x=tp(id);a+=x.k;b+=x.n});return `<a class="prow" href="#topics/${slugify(g)}"><span>${esc(g)}</span>${pbar({k:a,n:b,p:b?Math.round(a/b*100):0})}</a>`}).join('')}
  ${H('h2','Not finished','not-finished',r)}${all.filter(t=>t.items.length&&tp(t.id).p<100&&tp(t.id).k>0).map(t=>`<a class="prow" href="#topic/${t.slug}"><span>${esc(t.title)}</span>${pbar(tp(t.id))}</a>`).join('')||'<p class="muted">Nothing in progress. Start a flow and topics you begin will show here.</p>'}
  ${H('h2','Depth','depth',r)}${depthStats()}
  ${H('h2','Backup and move','backup',r)}<p class="muted" style="margin-top:-4px">A progress link carries your ticks to another browser or device. The file export also includes your notes and card reviews.</p><div class="btns"><button class="btn primary" data-act="link">${icon('share-2')}Copy progress link</button><button class="btn" data-act="export">${icon('download')}Export progress</button><button class="btn" data-act="notes">${icon('notebook-pen')}Export notes as Markdown</button><button class="btn" data-act="import">${icon('upload')}Import progress</button><input type="file" id="imp" class="btn-file" accept="application/json"><button class="btn danger" data-act="reset">${icon('rotate-ccw')}Reset all</button></div></div>`},

new(r){return `<div class="page"><div class="eyebrow">Change log</div><h1 class="title">What's new</h1><p class="lede">Changes to the roadmap, newest first.</p>
  <ul class="news">${NEWS.map(([d,t,x])=>`<li data-anchor="${slugify(t)}"><time datetime="${d}">${new Date(d+'T12:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}</time><div>${H('h2',esc(t),slugify(t),r,'').replace('class="hd"','class="hd" style="margin:0 0 4px;font-size:17px"')}<p>${esc(x)}</p></div></li>`).join('')}</ul></div>`},

visuals(r){return `<div class="page"><div class="eyebrow">Visuals</div><h1 class="title">Visual summaries</h1><p class="lede">One-page infographics that sum up a topic. Each also appears on the topic pages it covers. Select an image to open it full size.</p>
  ${FIGURES.map(f=>`<section data-anchor="${f[0]}">${H('h2',esc(f[2]),f[0],r)}${figure(f,true)}<p class="muted" style="font-size:14.5px">Appears on: ${f[5].map(id=>`<a href="#topic/${T[id].slug}/visual-summary">${esc(T[id].title)}</a>`).join(', ')}</p></section>`).join('')}</div>`},

radar(r){
  const byRing=k=>RADAR.filter(x=>x[2]===k);
  return `<div class="page wide"><div class="eyebrow">Technology radar · ${esc(RADAR_AS_OF)}</div><h1 class="title">What to adopt, trial, assess or hold</h1>
  <p class="lede">An opinionated view of techniques, practices, tools and model capabilities for AI engineering, reviewed every quarter. Each entry links to the topic that explains it.</p>
  <div class="rings">${RADAR_RINGS.map(([k,n,d])=>`<div class="ring-${k}"><b>${n}</b><span>${d}</span></div>`).join('')}</div>
  <div class="radar-wrap"><table class="radar"><thead><tr><th></th>${RADAR_RINGS.map(([k,n])=>`<th class="ring-${k}">${n}</th>`).join('')}</tr></thead><tbody>${RADAR_QUADRANTS.map(q=>`<tr><th scope="row">${esc(q)}</th>${RADAR_RINGS.map(([k])=>`<td>${RADAR.filter(x=>x[1]===q&&x[2]===k).map(x=>`<a class="blip ring-${k}" href="#radar/${slugify(x[0])}">${esc(x[0])}</a>`).join('')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  ${RADAR_RINGS.map(([k,n])=>`${H('h2',n,k,r)}<div class="reads">${byRing(k).map(x=>`<div class="read" data-anchor="${slugify(x[0])}"><span class="dotring ring-${k}"></span><div><b>${esc(x[0])}</b><span class="type">${esc(x[1])}</span><div class="note">${esc(x[3])} <a href="#topic/${T[x[4]].slug}">${esc(T[x[4]].title)} ${icon('arrow-right')}</a></div></div></div>`).join('')}</div>`).join('')}
  </div>`},

review(r){
  REV={topic:r.id,queue:dueCards(r.id).map(c=>c[0]),shown:false,done:0};
  const scope=r.id?T[r.id].title:'All started topics';
  return `<div class="page"><div class="eyebrow">Card review${r.id?` · <a href="#topic/${T[r.id].slug}/anki-cards">${esc(T[r.id].title)}</a>`:''}</div><h1 class="title">Review cards</h1>
  <p class="lede">${esc(scope)}. Recall the answer before revealing it, then grade yourself honestly. Cards you know well come back less often.</p>
  <div id="rev" class="rev"></div>
  <p class="muted" style="font-size:14px;margin-top:16px">Keys: Space shows the answer; 1 Again, 2 Hard, 3 Good, 4 Easy. ${r.id?'':'New cards appear for topics where you have ticked at least one check.'}</p>
  <div class="btns" style="margin-top:8px"><button class="btn" data-anki="${r.id||'all'}">${icon('download')}Download ${r.id?'these':'all'} cards for Anki</button></div></div>`},

importLink(r){setTimeout(()=>previewLink(r.payload));return `<div class="page"><div class="eyebrow">Progress link</div><h1 class="title">Import progress</h1><div id="imp-preview"><p class="lede">Reading the link…</p></div></div>`},

missing(){return `<div class="page"><h1 class="title">Page not found</h1><p class="lede">This link doesn't match a page in the roadmap. It may have been renamed.</p><a class="btn" href="#flows">Go to flows</a></div>`}
};

function viewSwitch(v){return `<div class="seg hide-narrow" role="group" aria-label="View"><a href="#flows" data-view="flows" ${v==='flows'?'aria-current="page"':''}>${icon('list')}List</a><a href="#graph" data-view="graph" ${v==='graph'?'aria-current="page"':''}>${icon('network')}Graph</a></div>`}
function figure([slug,file,title,credit,summary,,source],full){const src='assets/img/'+file;return `<figure class="fig"><a href="${src}" target="_blank" rel="noopener" aria-label="Open ${esc(title)} full size"><img src="${src}" alt="${esc(title)}: ${esc(summary)}" loading="lazy" width="1240" height="1550"></a><figcaption><b>${esc(title)}</b>${full?'':` · <a href="#visuals/${slug}">All visuals</a>`}<br>${esc(summary)}<span class="credit">Infographic by ${esc(credit)}.${source?` <a href="${esc(source)}" target="_blank" rel="noopener">Original</a>`:''}</span></figcaption></figure>`}
function depthSel(id){const v=st[id]||0;return `<span class="depth" data-depth-for="${id}" role="group" aria-label="How well you know this" ${v?'':'hidden'}>${[1,2,3].map(n=>`<button type="button" data-depth="${n}" data-id-d="${id}" aria-pressed="${v===n}">${DEPTH[n]}</button>`).join('')}</span>`}
function itemRow(i,r){const d=!!st[i[0]];return `<label class="item${d?' done':''}" data-anchor="${i[0]}"><input type="checkbox" data-id="${i[0]}" ${d?'checked':''} aria-label="${esc(i[1])}"><span><span class="lbl">${esc(i[1])}</span><div class="note">${esc(i[2])}${i[3]?` <a href="${esc(i[3])}" target="_blank" rel="noopener">Open lesson ${icon('external-link')}</a>`:''}</div>${depthSel(i[0])}</span>${r?`<a class="hl" href="#${base(r)}/${i[0]}" aria-label="Copy link to ${esc(i[1])}">${icon('link')}</a>`:''}</label>`}
const TYPE_IC={paper:'file-text',docs:'book-open',course:'graduation-cap',tool:'wrench',repo:'git-branch',blog:'newspaper',video:'circle-play',report:'chart-column'};
function readRow([type,title,url,note]){const star=/★/.test(title);title=title.replace(/\s*★+.*$/,'');return `<div class="read${star?' start':''}">${icon(TYPE_IC[type]||'link')}<div><a href="${esc(url)}" ${/^https?:/.test(url)?'target="_blank" rel="noopener"':''}>${esc(title)}${icon('external-link')}</a>${star?'<span class="chip start">Start here</span>':''}<span class="type">${esc(type)}</span>${note?`<div class="note">${esc(note)}</div>`:''}</div></div>`}

// ---------- Radar, cards and progress links ----------
const RING_NAME=Object.fromEntries(RADAR_RINGS.map(x=>[x[0],x[1]]));
function radarLine(id){const xs=RADAR.filter(x=>x[4]===id);return xs.length?`<p class="radar-line">${icon('radar')}On the radar: ${xs.map(x=>`<a href="#radar/${slugify(x[0])}">${esc(x[0])}</a> <span class="chip ring ring-${x[2]}">${RING_NAME[x[2]]}</span>`).join(', ')}</p>`:''}
const DAY=864e5,dnow=()=>Math.floor(Date.now()/DAY);
function cardsFor(id){return (window.CARDS||{})[id]||[]}
function isDue(c){const s=CS[c[0]];return !s||s.due<=dnow()}
// Due cards: one topic's, or across topics you have started plus any card already reviewed.
function dueCards(id){return id?cardsFor(id).filter(isDue):Object.entries(window.CARDS||{}).flatMap(([t,cs])=>cs.filter(c=>(CS[c[0]]||tp(t).k>0)&&isDue(c)))}
function cardRow(c,r){const s=CS[c[0]];return `<details class="fcard" data-anchor="${c[0]}"><summary>${esc(c[1])}<a class="hl" href="#${base(r)}/${c[0]}" aria-label="Copy link to this card">${icon('link')}</a></summary><p>${esc(c[2])}</p>${s?`<small>Next review in ${Math.max(0,s.due-dnow())} days</small>`:''}</details>`}
let REV=null;const CARD_BY={};Object.values(window.CARDS||{}).flat().forEach(c=>CARD_BY[c[0]]=c);
// A small SM-2 style scheduler: Again repeats today, otherwise the interval grows with ease.
function grade(id,q){const s=CS[id]||{ivl:0,ease:2.5,reps:0};
  if(q===1){s.reps=0;s.ivl=0;s.ease=Math.max(1.3,s.ease-0.2);s.due=dnow()}
  else{s.reps++;s.ivl=s.reps===1?(q===4?4:1):s.reps===2?(q===2?3:6):Math.max(s.ivl+1,Math.round(s.ivl*(q===2?1.2:q===4?s.ease*1.3:s.ease)));s.ease=Math.max(1.3,s.ease+(q===2?-0.15:q===4?0.15:0));s.due=dnow()+s.ivl}
  CS[id]=s;jset(CARDS_KEY,CS);return s}
function nextIvl(id,q){const keep=CS[id]?{...CS[id]}:undefined,s=grade(id,q);if(keep)CS[id]=keep;else delete CS[id];jset(CARDS_KEY,CS);return q===1?'today':s.ivl+(s.ivl===1?' day':' days')}
function renderReview(){const el=$('#rev');if(!el||!REV)return;
  if(!REV.queue.length){el.innerHTML=`<div class="rev-card done"><h2>${REV.done?'All done for now':'Nothing due'}</h2><p class="muted">${REV.done?`You reviewed ${REV.done} card${REV.done>1?'s':''}.`:'No cards are due. Tick a few checks on a topic to bring its cards in, or come back tomorrow.'}</p><a class="btn" href="#flows">Back to flows</a></div>`;return}
  const c=CARD_BY[REV.queue[0]],tid=Object.keys(window.CARDS).find(k=>window.CARDS[k].includes(c));
  el.innerHTML=`<div class="rev-meta"><span>${REV.queue.length} left</span><a href="#topic/${T[tid].slug}/anki-cards">${esc(T[tid].title)}</a></div><div class="rev-card"><p class="front">${esc(c[1])}</p>${REV.shown?`<p class="back">${esc(c[2])}</p><div class="grades">${[[1,'Again'],[2,'Hard'],[3,'Good'],[4,'Easy']].map(([q,n])=>`<button class="btn${q===3?' primary':''}" data-grade="${q}">${n}<small>${nextIvl(c[0],q)}</small></button>`).join('')}</div>`:`<button class="btn primary" data-show>Show answer</button>`}</div>`}
function doGrade(q){if(!REV||!REV.shown||!REV.queue.length)return;const id=REV.queue.shift();grade(id,q);if(q===1)REV.queue.push(id);else REV.done++;REV.shown=false;renderReview();sidebar(cur)}
function ankiExport(which){const tids=which==='all'?Object.keys(window.CARDS):[which];const clean=s=>String(s).replace(/[\t\n\r]+/g,' ');
  const rows=['#separator:tab','#html:false','#tags column:3','#deck:AI Engineering Roadmap'];
  tids.forEach(t=>cardsFor(t).forEach(c=>rows.push([clean(c[1]),clean(c[2]),'ai-roadmap '+T[t].slug+' '+slugify(T[t].group)].join('\t'))));
  download('ai-roadmap-anki-'+(which==='all'?'all':T[which].slug)+'.txt',rows.join('\n'),'text/plain');toast('Saved. In Anki choose File, Import, and pick this file.')}
function depthStats(){const c=[0,0,0,0];Object.values(st).forEach(v=>c[v]=(c[v]||0)+1);const n=c[1]+c[2]+c[3];
  return n?`<div class="stats" style="grid-template-columns:repeat(3,minmax(0,1fr))">${[1,2,3].map(i=>`<div><b>${c[i]}</b><span>${DEPTH[i]}</span></div>`).join('')}</div><p class="muted" style="font-size:14px">Mark a ticked check as Can explain or Built from its topic page. Built is the one that counts in a design review.</p>`:'<p class="muted">Tick checks on a topic page, then mark each as Read, Can explain or Built.</p>'}
async function packProgress(){let bytes=new TextEncoder().encode(JSON.stringify(st)),p='p';
  if(window.CompressionStream){try{bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());p='z'}catch(e){}}
  let b='';bytes.forEach(x=>b+=String.fromCharCode(x));return p+btoa(b).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function unpackProgress(s){let bytes=Uint8Array.from(atob(s.slice(1).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
  if(s[0]==='z')bytes=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
  return JSON.parse(new TextDecoder().decode(bytes))}
async function copyProgressLink(){if(!Object.keys(st).length){toast('Tick something first; the link carries your ticks.');return}copyLink('#import/'+await packProgress(),'Progress link copied. Open it on the other device.')}
let PENDING=null;
async function previewLink(payload){const el=$('#imp-preview');try{PENDING=await unpackProgress(payload);const ks=Object.keys(PENDING).filter(k=>PENDING[k]),known=ks.filter(k=>Object.values(T).some(t=>t.items.some(i=>i[0]===k))),fresh=known.filter(k=>!st[k]);
  el.innerHTML=`<p class="lede">This link carries <b>${known.length}</b> completed checks. <b>${fresh.length}</b> are not ticked in this browser yet.</p><p class="muted">Importing adds them to your progress here and keeps anything you have already done.</p><div class="btns"><button class="btn primary" data-act="merge">${icon('upload')}Add to my progress</button><a class="btn" href="#progress">Cancel</a></div>`}
  catch(e){el.innerHTML='<p class="lede">This progress link is incomplete or damaged. Copy it again from the Progress page on the other device.</p>'}}
function mergeLink(){if(!PENDING)return;mergeChecks(PENDING);PENDING=null;history.replaceState(null,'','#progress');cur.key=null;route();toast('Progress added')}

// ---------- Skill graph ----------
// Columns stretch to fill the width of the page; each level has its own colour (--lv-<level> in style.css).
const GH=48,RY=64,TOPY=56,PAD=22,GAP=30;
function graphDims(){const m=$('#main'),cs=getComputedStyle(m),avail=m.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight)-10;
  const w=Math.max(LEVELS.length*176,avail),cx=(w-2*PAD+GAP)/LEVELS.length;return{w,cx,gw:cx-GAP}}
function graphLayout(cx){const cols=LEVELS.map(()=>[]);ORDER.forEach(id=>{if(T[id].group!=='Library')cols[LV[T[id].level]].push(id)});
  // Order each column by the average row of its prerequisites to cut down crossing lines.
  const pos={};cols.forEach((c,ci)=>{if(ci){const k=id=>{const ps=T[id].pre.filter(p=>pos[p]);return ps.length?ps.reduce((a,p)=>a+pos[p].y,0)/ps.length:c.indexOf(id)*RY};c.sort((a,b)=>k(a)-k(b))}
    c.forEach((id,ri)=>pos[id]={x:PAD+ci*cx,y:TOPY+ri*RY})});return{cols,pos}}
function graphSvg(sel){const{w,cx,gw}=graphDims(),{cols,pos}=graphLayout(cx),h=TOPY+Math.max(...cols.map(c=>c.length))*RY+8;
  const lv=id=>`var(--lv-${T[id].level})`,max=d=>Math.max(8,Math.floor((gw-(d?46:30))/6.9));
  const rel=sel?new Set([sel,...T[sel].pre,...T[sel].next]):null;
  let bands='',defs='',e='',nodes='';
  LEVELS.forEach((l,i)=>{const x=PAD+i*cx;bands+=`<g style="--c:var(--lv-${l[0]})"><rect class="band" x="${x-10}" y="8" width="${gw+20}" height="${h-12}" rx="12"/><circle class="gdot" cx="${x+5}" cy="31" r="4"/><text class="gcol" x="${x+16}" y="35">${l[1]}</text><text class="gsub" x="${x+16+l[1].length*8.5+8}" y="35">${cols[i].length}</text></g>`});
  Object.keys(pos).forEach(id=>T[id].pre.forEach(p=>{if(!pos[p])return;const a=pos[p],b=pos[id],x1=a.x+gw,y1=a.y+GH/2,x2=b.x,y2=b.y+GH/2,m=(x1+x2)/2,gid='eg-'+p+'-'+id;
    defs+=`<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" style="stop-color:${lv(p)}"/><stop offset="1" style="stop-color:${lv(id)}"/></linearGradient>`;
    e+=`<path class="edge${sel&&(sel===id||sel===p)?' hot':''}" data-e="${p} ${id}" stroke="url(#${gid})" d="M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}"/>`}));
  Object.entries(pos).forEach(([id,{x,y}])=>{const t=T[id],q=tp(id),done=q.n&&q.p===100,tw=gw-34;
    nodes+=`<g class="node${done?' done':''}${sel===id?' sel':''}${rel&&rel.has(id)?' rel':''}" style="--c:${lv(id)}" data-node="${id}" tabindex="0" role="link" aria-label="${esc(t.title)}, ${q.p}% done"><rect class="box" x="${x}" y="${y}" width="${gw}" height="${GH}" rx="9"/><rect class="bar" x="${x+8}" y="${y+10}" width="3" height="${GH-20}" rx="1.5"/><text x="${x+20}" y="${y+22}">${esc(t.title.length>max(done)?t.title.slice(0,max(done)-1)+'…':t.title)}</text>${q.n?`<rect class="track" x="${x+20}" y="${y+32}" width="${tw}" height="4" rx="2"/><rect class="fill" data-w="${tw}" x="${x+20}" y="${y+32}" width="${tw*q.p/100}" height="4" rx="2"/>`:''}<path class="tick" d="M${x+gw-24} ${y+20}l3.5 3.5 7-7"/><title>${esc(t.title)}: ${q.k}/${q.n} done</title></g>`});
  return `<svg class="${sel?'has-sel':''}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="group" aria-label="Skill graph"><defs>${defs}</defs>${bands}${e}${nodes}</svg>`}
function regraph(sel){const g=$('#main .graph');if(g)g.innerHTML=graphSvg(sel)}
function drawer(id){if(!id)return '';
  const t=T[id],x=tp(id);
  return `<a class="iconbtn close" href="#graph" aria-label="Close details">${icon('x')}</a><div class="eyebrow"><span>${esc(LEVELS[LV[t.level]][1])}</span><span>${esc(t.group)}</span></div><h2>${esc(t.full)}</h2><p>${esc(t.desc)}</p>
  ${x.n?`<div data-tpbar="${id}">${pbar(x)}</div>`:''}
  ${t.lens?`<p style="margin-top:12px"><b style="color:var(--ink);font-weight:500">Trade-off:</b> ${esc(t.lens[0])}</p>`:''}
  ${t.pre.length?`<div class="rel">Builds on: ${t.pre.map(p=>`<a href="#graph/${T[p].slug}">${esc(T[p].title)}</a>`).join('')}</div>`:''}
  ${t.next.length?`<div class="rel">Leads to: ${t.next.map(p=>`<a href="#graph/${T[p].slug}">${esc(T[p].title)}</a>`).join('')}</div>`:''}
  ${t.items.length?`<div class="items">${t.items.slice(0,6).map(i=>itemRow(i)).join('')}</div>${t.items.length>6?`<p class="muted" style="margin-top:8px">And ${t.items.length-6} more on the topic page.</p>`:''}`:''}
  <div class="btns" style="margin-top:16px"><a class="btn primary" href="#topic/${t.slug}">Open topic ${icon('arrow-right')}</a><button class="btn" data-copy="#graph/${t.slug}">${icon('link')}Copy link</button></div>`}

// ---------- Sidebar and navigation ----------
function sidebar(r){
  const on=(h)=>location.hash==='#'+h||(r.page==='topic'&&!r.flow&&h==='topic/'+T[r.id].slug)||(r.flow&&h==='flow/'+r.flow.slug);
  const a=(h,ic,label,n)=>`<a class="sb" href="#${h}" ${on(h)?'aria-current="page"':''}>${icon(ic)}<span class="t">${esc(label)}</span>${n?`<span class="n${n.full?' full':''}">${n.t}</span>`:''}</a>`;
  let s=`<div class="sb-h">Flows</div>${FL.map(f=>{const x=fp(f);return a('flow/'+f.slug,f.ic,f.title,{t:x.p+'%',full:x.p===100})}).join('')}`;
  s+=GROUPS.map(([g,ids])=>`<div class="sb-h"><span>${esc(g)}</span></div>${ids.map(id=>{const t=T[id],x=tp(id);return a('topic/'+t.slug,'circle'+(x.n&&x.p===100?'-check':x.k?'-dot':''),t.title,x.n?{t:x.k+'/'+x.n,full:x.p===100}:null)}).join('')}`).join('');
  s+=`<div class="sb-foot">${a('graph','network','Skill graph')}${a('progress','chart-column','Progress')}${a('review','brain','Review cards',{t:dueCards().length?dueCards().length+' due':''})}${a('radar','radar','Technology radar')}${a('visuals','layers','Visuals')}${a('new','history',"What's new")}<a class="sb" href="system-design.html">${icon('server')}<span class="t">LLM serving guide</span></a></div>`;
  const sb=$('#sidebar'),top=sb.scrollTop;sb.innerHTML=s;sb.scrollTop=top;
  if(r.key!==sidebar.last){sidebar.last=r.key;const c=sb.querySelector('[aria-current="page"]');if(c){const b=c.getBoundingClientRect(),sbb=sb.getBoundingClientRect();if(b.top<sbb.top||b.bottom>sbb.bottom)c.scrollIntoView({block:'center'})}}
}
function topnav(r){const k=r.page==='topic'?(r.flow?'flows':'topics'):r.page==='flow'||r.page==='graph'?'flows':r.page;$$('.topnav a').forEach(a=>{if(a.dataset.nav===k)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})}
function updateRail(){const links=$$('.rail a');if(!links.length)return;let curA=links[0].dataset.rail;
  links.forEach(l=>{const el=document.querySelector(`[data-anchor="${l.dataset.rail}"]`);if(el&&el.getBoundingClientRect().top<160)curA=l.dataset.rail});
  links.forEach(l=>l.classList.toggle('on',l.dataset.rail===curA))}
function decorate(m){updateRail()}

// ---------- Progress updates ----------
function tick(id,v){if(v)st[id]=st[id]||1;else delete st[id];if(v)today++;else if(today>0)today--;save();
  $$(`input[data-id="${id}"]`).forEach(i=>{i.checked=v;i.closest('.item').classList.toggle('done',v)});
  $$(`[data-depth-for="${id}"]`).forEach(e=>{e.outerHTML=depthSel(id)});
  const tid=Object.keys(T).find(k=>T[k].items.some(i=>i[0]===id));
  $$(`[data-tpbar="${tid}"]`).forEach(e=>e.innerHTML=pbar(tp(tid)));
  $$(`[data-tpk="${tid}"]`).forEach(e=>e.textContent=tp(tid).k+'/'+tp(tid).n);
  FL.forEach(f=>{$$(`[data-fpbar="${f.slug}"]`).forEach(e=>e.innerHTML=pbar(fp(f)));$$(`[data-fp="${f.slug}"]`).forEach(e=>e.textContent=fp(f).p+'%')});
  const g=document.querySelector(`.node[data-node="${tid}"]`);if(g){const q=tp(tid);g.classList.toggle('done',q.p===100);const f=g.querySelector('rect.fill');f.setAttribute('width',f.dataset.w*q.p/100)}
  sidebar(cur);toast(v?'Marked done':'Marked not done');
  if(v&&tp(tid).p===100)toast('Topic complete: '+T[tid].title);
}
function setDepth(id,n){if(!st[id])return;st[id]=n;save();$$(`[data-depth-for="${id}"] button`).forEach(b=>b.setAttribute('aria-pressed',+b.dataset.depth===n));toast(DEPTH[n])}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
function exportProgress(){download('tracker-progress-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({checks:st,notes:NOTES,cards:CS},null,2),'application/json');toast('Progress exported')}
function exportNotes(){const md=['# My notes · AI Engineering Roadmap',''];ORDER.forEach(id=>{if(NOTES[id]&&NOTES[id].trim())md.push('## '+T[id].full,'',NOTES[id].trim(),'')});
  if(md.length<3){toast('No notes yet. Add them under My notes on any topic.');return}download('roadmap-notes-'+new Date().toISOString().slice(0,10)+'.md',md.join('\n'),'text/markdown');toast('Notes exported')}
function mergeChecks(c){Object.entries(c||{}).forEach(([k,v])=>{v=v===true?1:+v||0;if(v)st[k]=Math.max(st[k]||0,v)});save()}
function importProgress(inp){const f=inp.files[0];if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);mergeChecks(j.checks||j);if(j.notes){Object.entries(j.notes).forEach(([k,v])=>{if(v&&!NOTES[k])NOTES[k]=v});jset(NOTES_KEY,NOTES)}if(j.cards){Object.entries(j.cards).forEach(([k,v])=>{if(!CS[k]||CS[k].due<v.due)CS[k]=v});jset(CARDS_KEY,CS)}cur.key=null;route();toast('Progress imported')}catch(e){toast('Import failed: that file is not a progress export')}});inp.value=''}
function resetAll(){if(confirm('Reset all progress? This cannot be undone. Export a backup first if you might want it back.')){st={};today=0;save();cur.key=null;route();toast('Progress reset')}}

let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1800)}
function copyLink(h,msg){const u=location.origin+location.pathname+h;
  const done=()=>toast(msg||'Link copied');
  try{navigator.clipboard.writeText(u).then(done,()=>toast('Copy the address bar to share this link'))}catch(e){toast('Copy the address bar to share this link')}}

// ---------- Search ----------
let IDX=null,sel=-1;
function index(){if(IDX)return IDX;IDX=[];
  FL.forEach(f=>IDX.push({ic:f.ic,t:f.title,s:'Flow · '+f.desc,h:'#flow/'+f.slug}));
  FIGURES.forEach(f=>IDX.push({ic:'layers',t:f[2],s:'Visual · '+f[4],h:'#visuals/'+f[0]}));
  RADAR.forEach(x=>IDX.push({ic:'radar',t:x[0],s:'Radar · '+RING_NAME[x[2]]+' · '+x[3],h:'#radar/'+slugify(x[0])}));
  Object.entries(window.CARDS||{}).forEach(([t,cs])=>cs.forEach(c=>IDX.push({ic:'brain',t:c[1],s:'Card · '+T[t].title,h:'#topic/'+T[t].slug+'/'+c[0]})));
  Object.values(T).forEach(t=>{IDX.push({ic:'book-open',t:t.full,s:'Topic · '+t.desc,h:'#topic/'+t.slug});
    t.items.forEach(i=>IDX.push({ic:'circle-check',t:i[1],s:t.title+' · '+i[2],h:'#topic/'+t.slug+'/'+i[0]}));
    t.res.forEach(x=>IDX.push({ic:TYPE_IC[x[0]]||'link',t:x[1],s:t.title+' · '+x[3],h:x[2],ext:1}))});
  return IDX}
function search(q){const box=$('#results'),inp=$('#q');q=q.trim().toLowerCase();sel=-1;
  if(!q){box.hidden=true;inp.setAttribute('aria-expanded','false');return}
  const words=q.split(/\s+/);const hits=index().map(x=>{const a=x.t.toLowerCase(),b=x.s.toLowerCase();if(!words.every(w=>a.includes(w)||b.includes(w)))return null;return[x,(a.startsWith(q)?0:a.includes(q)?1:2)+(x.ext?0.5:0)]}).filter(Boolean).sort((a,b)=>a[1]-b[1]).slice(0,12);
  box.innerHTML=hits.length?hits.map(([x],i)=>`<a href="${esc(x.h)}" role="option" id="r${i}" ${x.ext?'target="_blank" rel="noopener"':''}>${icon(x.ic)}<span>${esc(x.t)}${x.ext?' '+icon('external-link'):''}<small>${esc(x.s)}</small></span></a>`).join(''):`<div class="none">No matches for "${esc(q)}".</div>`;
  box.hidden=false;inp.setAttribute('aria-expanded','true')}
function closeSearch(){$('#results').hidden=true;$('#q').setAttribute('aria-expanded','false')}

// ---------- Menu, theme ----------
function closeMenu(){$('#sidebar').classList.remove('open');$('#scrim').hidden=true;$('#menuBtn').setAttribute('aria-expanded','false')}
function themeIcon(){const dark=document.documentElement.dataset.theme?document.documentElement.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;$('#themeBtn').innerHTML=icon(dark?'sun':'moon')}

// ---------- Events ----------
document.addEventListener('change',e=>{const i=e.target;if(i.matches('input[data-id]'))tick(i.dataset.id,i.checked);if(i.id==='imp')importProgress(i)});
let nt;document.addEventListener('input',e=>{const t=e.target;if(t.matches('textarea[data-note]')){NOTES[t.dataset.note]=t.value;if(!t.value)delete NOTES[t.dataset.note];clearTimeout(nt);nt=setTimeout(()=>{jset(NOTES_KEY,NOTES);toast('Notes saved')},700)}});
document.addEventListener('click',e=>{
  const hl=e.target.closest('.hl');if(hl){e.stopPropagation();copyLink(hl.getAttribute('href'));if(hl.closest('label')){e.preventDefault();history.pushState(null,'',hl.getAttribute('href'));route()}return}
  const c=e.target.closest('[data-copy]');if(c){copyLink(c.dataset.copy);return}
  const dp=e.target.closest('[data-depth]');if(dp){e.preventDefault();setDepth(dp.dataset.idD,+dp.dataset.depth);return}
  const ak=e.target.closest('[data-anki]');if(ak){ankiExport(ak.dataset.anki);return}
  if(e.target.closest('[data-show]')){REV.shown=true;renderReview();return}
  const gr=e.target.closest('[data-grade]');if(gr){doGrade(+gr.dataset.grade);return}
  const v=e.target.closest('[data-view]');if(v)pref('ai_roadmap_home',v.dataset.view);
  const n=e.target.closest('[data-node]');if(n){location.hash='graph/'+T[n.dataset.node].slug;return}
  const act=e.target.closest('[data-act]');if(act){const k=act.dataset.act;if(k==='export')exportProgress();if(k==='notes')exportNotes();if(k==='link')copyProgressLink();if(k==='merge')mergeLink();if(k==='import')$('#imp').click();if(k==='reset')resetAll();return}
  if(!e.target.closest('.search'))closeSearch();
  if(e.target.closest('#results a'))closeSearch();
});
document.addEventListener('keydown',e=>{
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
  if(e.key==='Escape'){closeSearch();closeMenu();if(typing)document.activeElement.blur();return}
  const n=e.target.closest&&e.target.closest('[data-node]');if(n&&(e.key==='Enter'||e.key===' ')){e.preventDefault();location.hash='graph/'+T[n.dataset.node].slug;return}
  if(typing){if(e.target.id==='q'){const opts=$$('#results a');if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();sel=(sel+(e.key==='ArrowDown'?1:-1)+opts.length)%opts.length;opts.forEach((o,i)=>o.setAttribute('aria-selected',i===sel));opts[sel]?.scrollIntoView({block:'nearest'})}
    if(e.key==='Enter'){const o=opts[sel<0?0:sel];if(o){e.preventDefault();o.click();closeSearch();e.target.blur()}}}return}
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(e.key==='/'){e.preventDefault();$('#q').focus();return}
  if(cur.page==='review'&&REV&&REV.queue.length){if((e.key===' '||e.key==='Enter')&&!REV.shown){e.preventDefault();REV.shown=true;renderReview();return}if(REV.shown&&'1234'.includes(e.key)){doGrade(+e.key);return}}
  if(e.key==='j'||e.key==='k'){const a=$(e.key==='j'?'.pager .nx':'.pager a:not(.nx)');if(a)location.hash=a.getAttribute('href').slice(1)}
});
$('#q').addEventListener('input',e=>search(e.target.value));
$('#q').addEventListener('focus',e=>{if(e.target.value)search(e.target.value)});
$('#menuBtn').innerHTML=icon('menu');
$('#menuBtn').addEventListener('click',()=>{const o=!$('#sidebar').classList.contains('open');$('#sidebar').classList.toggle('open',o);$('#scrim').hidden=!o;$('#menuBtn').setAttribute('aria-expanded',o)});
$('#scrim').addEventListener('click',closeMenu);
$('#themeBtn').addEventListener('click',()=>{const d=document.documentElement,dark=d.dataset.theme?d.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;d.dataset.theme=dark?'light':'dark';pref('ai_roadmap_theme',d.dataset.theme);themeIcon()});
$('[data-skip]').addEventListener('click',e=>{e.preventDefault();$('#main').focus()});
addEventListener('hashchange',route);
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(cur.page==='graph')regraph(cur.sel)},120)});
addEventListener('scroll',()=>{if(cur.page==='topic')updateRail()},{passive:true});
load();themeIcon();route();
