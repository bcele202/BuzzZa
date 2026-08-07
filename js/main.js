// Small, dependency-free JS for BuzzZA
const DATA_URL = 'data/articles.json';

async function loadData(){
  try{
    const res = await fetch(DATA_URL);
    const data = await res.json();
    return data.articles;
  }catch(err){
    console.error('Failed to load demo articles', err);
    return [];
  }
}

function formatDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){return iso}
}

function el(tag, attrs={}, children=[]) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k === 'class') node.className = v;
    else if(k === 'dataset' && typeof v === 'object') {
      Object.entries(v).forEach(([dk,dv])=> node.dataset[dk]=dv);
    }
    else if(k === 'aria'){
      Object.entries(v).forEach(([ak,av])=> node.setAttribute('aria-'+ak,av));
    }
    else if(k.startsWith('data-')) node.setAttribute(k, v);
    else if(k === 'href') node.setAttribute('href', v);
    else node[k]=v;
  });
  children.forEach(c => node.append(typeof c === 'string' ? document.createTextNode(c) : c));
  return node;
}

function renderFeatured(article){
  const f = document.getElementById('featured');
  f.innerHTML='';
  if(!article) return;
  // Create a link so the featured story is clickable in the next phase
  const link = el('a',{class:'featured-link',href:`article.html?id=${encodeURIComponent(article.id)}`,role:'link','aria-label':article.title});
  const thumb = el('div',{class:'thumb'},[article.image || article.category.slice(0,2)]);
  const body = el('div',{class:'f-body'});
  const cat = el('div',{class:'category-pill'},[article.category]);
  const h = el('h3',{},[article.title]);
  const p = el('p',{},[article.excerpt]);
  const meta = el('div',{class:'meta'},[`${article.source || 'BuzzZA'} • ${formatDate(article.publishedAt)}`]);
  body.append(cat,h,p,meta);
  link.append(thumb,body);
  // demo label
  const note = el('div',{class:'meta'},['DEMO DATA — not live news']);
  f.append(link,note);
}

function renderGrid(articles){
  const grid = document.getElementById('grid');
  grid.innerHTML='';
  articles.forEach(a=>{
    // Use anchor so the card is clickable; href points to a placeholder detail page
    const card = el('a',{class:'card',href:`article.html?id=${encodeURIComponent(a.id)}`,tabIndex:0,'aria-label':a.title});
    const thumb = el('div',{class:'thumb'},[a.image || a.category.slice(0,2)]);
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
  if(!articles.length){ ticker.textContent = 'No demo headlines available.'; return; }
  // use first 8 titles
  ticker.innerHTML = '';
  articles.slice(0,8).forEach(a=>{
    const s = document.createElement('span');
    s.textContent = `DEMO: ${a.title}`;
    ticker.append(s);
  });
}

function setupSearch(allArticles){
  const input = document.getElementById('search');
  input.addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = allArticles.filter(a=>
      a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
    document.getElementById('shownCategory').textContent = q ? `Search: "${q}"` : 'All';
    document.getElementById('resultsCount').textContent = `${filtered.length} results`;
    renderGrid(filtered);
    renderFeatured(filtered[0] || allArticles[0]);
  });
}

function setupNav(allArticles){
  document.querySelectorAll('.primary-nav a').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const cat = a.dataset.cat;
      let filtered;
      if(cat === 'all') filtered = allArticles;
      else if(cat === 'breaking') filtered = allArticles.slice(0,8);
      else filtered = allArticles.filter(x=>x.category === cat);
      document.getElementById('shownCategory').textContent = cat === 'all' ? 'All' : cat;
      document.getElementById('resultsCount').textContent = `${filtered.length} results`;
      renderGrid(filtered);
      renderFeatured(filtered[0] || allArticles[0]);
      // close mobile menu if open
      const nav = document.getElementById('primary-navigation');
      nav.classList.remove('open');
      document.getElementById('menuToggle').setAttribute('aria-expanded','false');
    });
  });
}

function setupMenuToggle(){
  const btn = document.getElementById('menuToggle');
  const nav = document.getElementById('primary-navigation');
  btn.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// Init
(async function(){
  const articles = await loadData();
  // sort by publishedAt desc
  articles.sort((a,b)=> new Date(b.publishedAt) - new Date(a.publishedAt));
  setupTicker(articles);
  renderGrid(articles);
  renderFeatured(articles[0]);
  setupSearch(articles);
  setupNav(articles);
  setupMenuToggle();
})();
