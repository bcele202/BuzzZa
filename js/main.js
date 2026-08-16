// Small, dependency-free JS for BuzzZA (integrates NewsData)
const DATA_URL = 'data/articles.json';

function formatDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){return iso}
}

// Safer element builder that correctly sets attributes (including aria-*, data-*, href)
function el(tag, attrs={}, children=[]) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if (k === 'class') {
      node.className = v;
    } else if (k === 'dataset' && typeof v === 'object') {
      Object.entries(v).forEach(([dk,dv])=> node.dataset[dk]=dv);
    } else if (k === 'href') {
      node.setAttribute('href', v);
    } else if (k.includes('-') || typeof node[k] === 'undefined') {
      // hyphenated attributes (aria-label, data-*, etc.) and unknown props -> setAttribute
      node.setAttribute(k, v);
    } else {
      node[k] = v;
    }
  });
  children.forEach(c => node.append(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}
function createThumb(article){
  const thumb = el('div',{class:'thumb'});

  if(article && article.image){
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title || 'BuzzZA news image';
    img.loading = 'lazy';

    img.onerror = function(){
      img.remove();
      thumb.textContent = article.category ? article.category.slice(0,2) : 'BZ';
    };

    thumb.appendChild(img);
  } else {
    thumb.textContent = article && article.category
      ? article.category.slice(0,2)
      : 'BZ';
  }

  return thumb;
}

function renderFeatured(article){
  const f = document.getElementById('featured');
  if(!f) return;
  f.innerHTML='';
  if(!article) return;
  const link = el('a',{class:'featured-link',href:`article.html?id=${encodeURIComponent(article.id)}`,role:'link','aria-label':article.title});
  const thumb = createThumb(article);
  const body = el('div',{class:'f-body'});
  const cat = el('div',{class:'category-pill'},[article.category]);
  const h = el('h3',{},[article.title]);
  const p = el('p',{},[article.excerpt]);
  const meta = el('div',{class:'meta'},[`${article.source || 'BuzzZA'} • ${formatDate(article.publishedAt)}`]);
  body.append(cat,h,p,meta);
  link.append(thumb,body);
  // Visible demo note removed per request — keep featured layout unchanged
  f.append(link);
}

function renderGrid(articles){
  const grid = document.getElementById('grid');
  if(!grid) return;
  grid.innerHTML='';
  articles.forEach(a=>{
    const card = el('a',{class:'card',href:`article.html?id=${encodeURIComponent(a.id)}`,tabIndex:0,'aria-label':a.title});
    const thumb = createThumb(a);
    const body = el('div',{class:'c-body'});
    const cat = el('div',{class:'category-pill'},[a.category]);
    const h = el('h3',{},[a.title]);
    const p = el('p',{},[a.excerpt]);
    const meta = el('div',{class:'meta'},[`${a.source || 'BuzzZA'} • ${formatDate(a.publishedAt)}`]);
    body.append(cat,h,p,meta);
    card.append(thumb,body);
    grid.append(card);
  });
}

function setupTicker(articles){
  const ticker = document.getElementById('ticker');
  if(!ticker) return;
  if(!articles.length){ ticker.textContent = 'No demo headlines available.'; return; }
  ticker.innerHTML = '';
  const track = document.createElement('div');
  track.className = 'ticker-track';
  articles.slice(0,8).forEach(a=>{
    const s = document.createElement('span');
    s.className = 'ticker-item';
    // Remove any leading "DEMO:" (case-insensitive) from titles while preserving original title otherwise
    s.textContent = (a.title || '').replace(/^DEMO:\s*/i, '');
    track.appendChild(s);
  });
  ticker.appendChild(track);
  const clone = track.cloneNode(true);
  ticker.appendChild(clone);
}

function setupSearch(allArticles){
  const input = document.getElementById('search');
  const resultsCount = document.getElementById('resultsCount');
  const shownCategory = document.getElementById('shownCategory');
  if(!input) return;
  input.addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = allArticles.filter(a=>
      (a.title||'').toLowerCase().includes(q) || (a.excerpt||'').toLowerCase().includes(q) || (a.category||'').toLowerCase().includes(q)
    );
    if(shownCategory) shownCategory.textContent = q ? `Search: "${q}"` : 'All';
    if(resultsCount) resultsCount.textContent = `${filtered.length} results`;
    renderGrid(filtered);
    renderFeatured(filtered[0] || allArticles[0]);
  });
}

function setupNav(allArticles){
  const navLinks = document.querySelectorAll('.primary-nav a');
  if(!navLinks) return;
  navLinks.forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const cat = a.dataset.cat;
      let filtered;
      if(cat === 'all') filtered = allArticles;
      else if(cat === 'breaking') filtered = allArticles.slice(0,8);
      else filtered = allArticles.filter(x=>x.category === cat);
      const rc = document.getElementById('resultsCount');
      const sc = document.getElementById('shownCategory');
      if(sc) sc.textContent = cat === 'all' ? 'All' : cat;
      if(rc) rc.textContent = `${filtered.length} results`;
      renderGrid(filtered);
      renderFeatured(filtered[0] || allArticles[0]);
      const nav = document.getElementById('primary-navigation');
      if(nav) nav.classList.remove('open');
      const mt = document.getElementById('menuToggle');
      if(mt) mt.setAttribute('aria-expanded','false');
      if(nav) trapFocus(nav, false);
      if(mt) mt.focus();
      document.body.classList.remove('nav-open');
    });
  });
}

function trapFocus(container, trap){
  if(!container) return;
  const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(container.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
  if(!trap){
    if(container.__trapHandler){
      document.removeEventListener('keydown', container.__trapHandler);
      container.__trapHandler = null;
    }
    return;
  }
  let first = focusable[0];
  let last = focusable[focusable.length - 1];
  const handler = function(e){
    if(e.key !== 'Tab') return;
    if(e.shiftKey){
      if(document.activeElement === first){
        e.preventDefault();
        last.focus();
      }
    } else {
      if(document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    }
  };
  container.__trapHandler = handler;
  document.addEventListener('keydown', handler);
}

function setupMenuToggle(){
  const btn = document.getElementById('menuToggle');
  const nav = document.getElementById('primary-navigation');
  if(!btn || !nav) return;
  btn.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
    if(open){
      trapFocus(nav, true);
      const first = nav.querySelector('a, button');
      if(first) first.focus();
    } else {
      trapFocus(nav, false);
      btn.focus();
    }
  });
}

// Init
(async function(){
  const articles = await (window.NewsData ? window.NewsData.loadArticles() : []);
  // sort by publishedAt desc
  articles.sort((a,b)=> new Date(b.publishedAt) - new Date(a.publishedAt));
  const resultsEl = document.getElementById('resultsCount');
  if(resultsEl) resultsEl.textContent = `${articles.length} results`;
  const shownEl = document.getElementById('shownCategory');
  if(shownEl) shownEl.textContent = 'All';
  setupTicker(articles);
  renderGrid(articles);
  renderFeatured(articles[0]);
  setupSearch(articles);
  setupNav(articles);
  setupMenuToggle();
})();
