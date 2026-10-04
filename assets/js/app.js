const KEY='ai_tracker_v3';
const SECTIONS=window.TRACKER_SECTIONS;
let st={},today=0,todayKey=new Date().toDateString();
function load(){try{const r=localStorage.getItem(KEY);if(r){const s=JSON.parse(r);st=s.checks||{};today=s.todayKey===todayKey?(s.today||0):0}}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify({checks:st,todayKey,today}))}catch(e){}}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function reads(id){const g=document.getElementById(id);if(!g)return'';
const r=[...g.querySelectorAll('.resource-card,.channel-card')].map(c=>{const a=c.querySelector('a'),t=c.querySelector('.tag'),n=c.querySelector('.resource-note,.channel-note');
return a?`<div class="rd"><a href="${a.href}" target="_blank" rel="noopener">${esc(a.textContent)}</a>${t?` <span class="${t.className}">${esc(t.textContent)}</span>`:''}${n?`<div class="note">${esc(n.textContent)}</div>`:''}</div>`:''}).join('');
return r?`<div class="rh">To read · ${g.querySelectorAll('.resource-card,.channel-card').length}</div>${r}`:''}
function render(){load();const g=document.getElementById('grid');g.innerHTML='';let last=null;
SECTIONS.forEach(s=>{if(s.part&&s.part!==last){const p=document.createElement('div');p.className='part';p.innerHTML=esc(s.part)+(s.isNew?' <span class="new">New</span>':'');g.appendChild(p);last=s.part}
const tot=s.items.length,d=s.items.filter(i=>st[i[0]]).length,pct=Math.round(d/tot*100);
const n=s.icon||s.id.replace('ch','');
const card=document.createElement('div');card.className='card';card.id='sec-'+s.id;
card.innerHTML=`<button class="head" aria-expanded="false" onclick="toggle('${s.id}')"><div class="num ${s.c}">${n}</div><div class="title"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div><div class="sstats"><span class="cnt">${d}/${tot}</span><small class="pct">${pct}%</small><div class="mini"><div style="width:${pct}%"></div></div></div><span class="chev">▶</span></button><div class="body" id="body-${s.id}">${s.items.map(i=>`<label class="item"><input type="checkbox" ${st[i[0]]?'checked':''} onchange="tick('${i[0]}',this.checked,this)"><div><div class="lbl ${st[i[0]]?'done':''}">${esc(i[1])}</div><div class="note">${esc(i[2])}${i[3]?` <a href="${i[3]}" target="_blank" rel="noopener">Open lesson</a>`:''}</div></div></label>`).join('')}${reads(s.id)}</div>`;
g.appendChild(card)});stats()}
function toggle(id,force){const b=document.getElementById('body-'+id),h=b.previousElementSibling,open=force===undefined?!b.classList.contains('open'):force;b.classList.toggle('open',open);h.setAttribute('aria-expanded',open);h.querySelector('.chev').style.transform=open?'rotate(90deg)':''}
function setAll(v){SECTIONS.forEach(s=>toggle(s.id,v))}
function showIncomplete(){SECTIONS.forEach(s=>toggle(s.id,s.items.some(i=>!st[i[0]])))}
function tick(id,v,el){st[id]=v;if(v)today++;else if(today>0)today--;save();el.parentElement.querySelector('.lbl').classList.toggle('done',v);stats();toast(v?'Marked complete':'Unmarked')}
function stats(){let t=0,d=0,sec=0;SECTIONS.forEach(s=>{const k=s.items.filter(i=>st[i[0]]).length;t+=s.items.length;d+=k;if(k)sec++;const nv=document.querySelector('a[href="#'+s.id+'"] i');if(nv)nv.textContent=k+'/'+s.items.length;const c=document.getElementById('sec-'+s.id);if(c){const p=Math.round(k/s.items.length*100);c.querySelector('.cnt').textContent=k+'/'+s.items.length;c.querySelector('.pct').textContent=p+'%';c.querySelector('.mini div').style.width=p+'%'}});
const p=t?Math.round(d/t*100):0;sTotal.textContent=t;sDone.textContent=d;sSec.textContent=sec;sToday.textContent=today;oPct.textContent=p+'%';oBar.style.width=p+'%';irScore.textContent=p+'%';
const L=[[15,'🌱 Getting started','Start with Ch 1 vocabulary: know every term cold.'],[30,'📖 Building foundation','Next: Parts 1-2 and Tier 1 O\'Reilly books.'],[50,'⚡ Building momentum','Deep-dive Part 3 (Evals) and the eval lab route.'],[70,'🔥 Strong progress','Finish Part 4 and the role-gap items; start the capstone.'],[85,'💪 Interview ready','Practice system design out loud with the capstone as your example.'],[101,'🏆 Expert level','Ready for senior AI engineering interviews. Keep building and sharing.']];
const l=L.find(x=>p<x[0]);irLevel.textContent=l[1];irDesc.textContent=l[2]}
function exportProgress(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({checks:st},null,2)],{type:'application/json'}));a.download='tracker-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();toast('Progress exported')}
function importProgress(inp){const f=inp.files[0];if(!f)return;f.text().then(t=>{try{const j=JSON.parse(t);st=Object.assign(st,j.checks||j);save();render();toast('Progress imported')}catch(e){toast('Import failed: not a valid progress file')}});inp.value=''}
function resetAll(){if(confirm('Reset all progress? This cannot be undone.')){st={};today=0;save();render();toast('Progress reset')}}
let tt;function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),1800)}

document.addEventListener('DOMContentLoaded',render);
// Map view: metro line (A) and iceberg depth layers (B), both from live progress
const STOPS=[['Landscape','ch1 ch2 ch3'],['Design','ch4 ch5'],['Evals','ch6 ch7 ch8 ch9'],['Agents','ch10 ch11 ch12 ch13 ch14 ch15'],['Production','ch16 ch17 ch18'],['Next steps','ch19 ch20'],['Knowledge','knowledge'],['Engineering','adv-eng'],['Deep learning','adv-dl']];
const ICE=[['Foundation','Surface','ch1 ch2 ch3 ch4 ch5'],['Build reliably','Intermediate','ch6 ch7 ch8 ch9'],['Knowledge systems','Intermediate','ch13 knowledge'],['Production applications','Intermediate','ch16 ch17 ch18 capstone'],['Agentic systems','Advanced · engineering','ch10 ch11 ch12 ch14 ch15 adv-eng'],['Models and infrastructure','Advanced · deep learning','adv-dl']];
const sec=id=>SECTIONS.find(s=>s.id===id);
function prog(ids){let k=0,t=0;ids.split(' ').forEach(id=>{const s=sec(id);t+=s.items.length;k+=s.items.filter(i=>st[i[0]]).length});return Math.round(k/t*100)}
function first(ids){const a=ids.split(' ');return a.find(id=>sec(id).items.some(i=>!st[i[0]]))||a[0]}
function drawMap(){
  const nx=STOPS.findIndex(s=>prog(s[1])<100);let g='<path class="ln" d="M40 95H580"/><path class="ln eng" d="M580 95C640 95 630 40 690 40"/><path class="ln dl" d="M580 95C640 95 630 150 690 150"/>';
  STOPS.forEach(([n,ids],i)=>{const x=i<7?40+i*90:690,y=i<7?95:i==7?40:150,ty=i==7?y-30:y+30,p=prog(ids);
    g+='<g class="stn'+(i==7?' eng':i==8?' dl':'')+(p==100?' done':p?' wip':'')+'" onclick="go(\''+first(ids)+'\')"><title>'+n+': '+p+'% done</title>'+(i==nx?'<circle class="halo" cx="'+x+'" cy="'+y+'" r="16"/>':'')+'<circle cx="'+x+'" cy="'+y+'" r="9"/><text x="'+x+'" y="'+ty+'">'+n+'</text><text class="p" x="'+x+'" y="'+(ty+14)+'">'+p+'%</text></g>'});
  metro.innerHTML=g;
  const nid=nx<0?'':first(STOPS[nx][1]);
  nextUp.innerHTML=nid?'Next up: <a href="javascript:go(\''+nid+'\')">'+esc(sec(nid).t)+' →</a>':'Every stage done.';
  ice.innerHTML=ICE.map(([n,lv,ids],i)=>{const p=prog(ids);return (i==1?'<div class="water">waterline · deeper layers below</div>':'')+'<details class="layer" style="width:'+(100-i*5)+'%;--d:'+(8+i*6)+'%"><summary><b>'+n+'</b><em>'+lv+'</em><span class="lbar"><span style="width:'+p+'%"></span></span>'+p+'%</summary><div>'+ids.split(' ').map(id=>'<button onclick="go(\''+id+'\')">'+esc(sec(id).t)+'</button>').join('')+'</div></details>'}).join('');
}
function go(id){setView('tracker');toggle(id,true);document.getElementById('sec-'+id).scrollIntoView({behavior:'smooth'})}
