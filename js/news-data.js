// News data layer for BuzzZA
// Exposes window.NewsData.loadArticles() which attempts to fetch live news per config/config/news.json
// and falls back to data/articles.json. Does NOT hard-code API keys.

(function(window){
  async function loadConfig(){
    try{
      const res = await fetch('config/news.json');
      if(!res.ok) return null;
      return await res.json();
    }catch(e){
      return null;
    }
  }

  function mapCategoryFromText(text){
    if(!text) return 'World';
    const t = text.toLowerCase();
    const mapping = {
      'South Africa':['south africa','south-africa','cape town','johannesburg','pretoria','durban'],
      'Sport':['sport','match','cup','tournament','football','rugby','cricket','score','goal','win','loss'],
      'Entertainment':['film','movie','music','festival','award','actor','actress','director','streaming'],
      'Business':['investment','startup','bank','finance','market','business','economy','trade','investors'],
      'Technology':['tech','ai','artificial intelligence','startup','coding','software','app','blockchain'],
      'Lifestyle':['recipe','garden','wellness','lifestyle','health','travel','food']
    };
    for(const [cat, keywords] of Object.entries(mapping)){
      for(const kw of keywords){
        if(t.includes(kw)) return cat;
      }
    }
    return 'World';
  }

  function normalizeArticle(item, idx, sourceLabel='Live'){
    // Convert various provider item shapes into our UI article shape
    const title = item.title || item.headline || '';
    const excerpt = item.description || item.excerpt || item.summary || item.content || '';
    const publishedAt = item.publishedAt || item.pubDate || item.published || new Date().toISOString();
    const image = item.urlToImage || item.image || item.thumbnail || '';
    const source = (item.source && (item.source.name || item.source)) || item.provider || sourceLabel;
    const category = item.category || mapCategoryFromText(title + ' ' + excerpt);
    const id = item.id || item.url || `${sourceLabel.toLowerCase()}-${idx}-${btoa(title).slice(0,8)}`;
    return {
      id: String(id),
      title: title,
      excerpt: excerpt,
      category: category,
      publishedAt: publishedAt,
      source: source,
      image: image
    };
  }

  async function fetchLiveArticles(cfg){
    if(!cfg || !cfg.liveApi || !cfg.liveApi.url) throw new Error('no-live-api');
    const api = cfg.liveApi;
    let url = api.url;
    // If the provider is 'newsapi' and no query specified, fetch top headlines if endpoint supports it
    // Caller-config controls specifics; we do a straight GET and try to interpret response.
    const headers = {};
    const params = new URLSearchParams();
    if(api.apiKey){
      if(api.apiKeyPlacement === 'header') headers['Authorization'] = api.apiKey;
      else params.set(api.apiKeyName || 'apiKey', api.apiKey);
    }
    if(api.query) params.set('q', api.query);

    if([...params].length) url += (url.includes('?') ? '&' : '?') + params.toString();

    const res = await fetch(url,{headers,cache:'no-cache'});
    if(!res.ok) throw new Error('live-fetch-failed');
    const body = await res.json();
    // Try common shapes
    let items = [];
    if(Array.isArray(body.articles)) items = body.articles;
    else if(Array.isArray(body.results)) items = body.results;
    else if(Array.isArray(body.items)) items = body.items;
    else if(Array.isArray(body)) items = body;
    else throw new Error('unrecognized-live-shape');

    const normalized = items.map((it,i)=> normalizeArticle(it,i, api.provider || 'Live'));
    return normalized;
  }

  async function loadArticles(){
    // Try config/live fetch, otherwise load demo data
    try{
      const cfg = await loadConfig();
      if(cfg && cfg.liveApi && cfg.liveApi.url){
        try{
          const live = await fetchLiveArticles(cfg);
          if(live && live.length) return live;
        }catch(e){
          // fall through to demo
          console.warn('Live fetch failed, falling back to demo data', e && e.message);
        }
      }
    }catch(e){
      // ignore
    }

    // fallback to demo data file
    try{
      const res = await fetch('data/articles.json');
      if(!res.ok) throw new Error('demo-not-found');
      const payload = await res.json();
      return payload.articles || [];
    }catch(err){
      console.error('Failed to load demo articles', err);
      return [];
    }
  }

  // expose
  window.NewsData = {
    loadArticles
  };

})(window);
