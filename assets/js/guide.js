
// Smooth scroll for sidebar links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    setView('guide');
    document.querySelector('.sidebar').classList.remove('open');
    const target = document.querySelector(a.getAttribute('href'));
    if(target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
});

// Search filter
function filterResources(q) {
  const query = q.toLowerCase().trim();
  document.querySelectorAll('.resource-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = (query === '' || text.includes(query)) ? '' : 'none';
  });
  document.querySelectorAll('.channel-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = (query === '' || text.includes(query)) ? '' : 'none';
  });
}

// Type filter
let activeType = 'all';
function filterByType(type, btn) {
  activeType = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.resource-card').forEach(card => {
    if(type === 'all' || card.dataset.type === type) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Active nav highlighting on scroll
const chapters = document.querySelectorAll('[id]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      document.querySelectorAll('.nav-chapter,.nav-extra').forEach(a => a.classList.remove('active'));
      const link = document.querySelector(`.nav-chapter[href="#${entry.target.id}"], .nav-extra[href="#${entry.target.id}"]`);
      if(link) link.classList.add('active');
    }
  });
}, {threshold: 0.1, rootMargin: '-10% 0px -80% 0px'});
chapters.forEach(ch => observer.observe(ch));

// Guide / Map / Tracker switch (#map and #tracker deep-link)
function setView(v){
  ['guide','map','tracker'].forEach(id=>document.getElementById(id).hidden=id!==v);
  document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  history.replaceState(null,'',v==='guide'?location.pathname:'#'+v);
  if(v==='map')drawMap();
}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{setView(b.dataset.view);scrollTo(0,0)});
addEventListener('DOMContentLoaded',()=>{if(location.hash==='#tracker'||location.hash==='#map')setView(location.hash.slice(1))});

// Per-chapter progress counts in the sidebar (filled by app.js stats())
document.querySelectorAll('.nav-chapter,.nav-extra').forEach(a=>a.insertAdjacentHTML('beforeend','<i></i>'));
