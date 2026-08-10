const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from repository root (so index.html, js, css, data are available)
app.use(express.static(path.join(__dirname, '..')));

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

function normalizeArticle(item, idx){
  const title = item.title || item.headline || '';
  const excerpt = item.description || item.summary || item.content || '';
  const publishedAt = item.publishedAt || item.pubDate || new Date().toISOString();
  const image = item.urlToImage || (item.image && item.image.url) || item.thumbnail || '';
  const source = (item.source && (item.source.name || item.source)) || item.provider || 'Live';
  const category = item.category || mapCategoryFromText(title + ' ' + excerpt);
  const id = item.url || item.id || `${source.toLowerCase()}-${idx}`;
  return { id: String(id), title, excerpt, category, publishedAt, source, image };
}

app.get('/api/news', async (req, res) => {
  // Proxy endpoint that keeps the API key on server-side
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const NEWS_API_URL = process.env.NEWS_API_URL || 'https://newsapi.org/v2/top-headlines?country=za&pageSize=20';
  if(!NEWS_API_KEY){
    return res.status(503).json({ error: 'news-api-key-not-configured' });
  }

  try{
    // allow optional query params from client (q)
    const q = req.query.q; // e.g., search query
    const url = new URL(NEWS_API_URL);
    if(q) url.searchParams.set('q', q);
    url.searchParams.set('apiKey', NEWS_API_KEY);

    const r = await fetch(url.toString(), { method: 'GET' });
    if(!r.ok){
      const text = await r.text();
      console.error('News provider error', r.status, text);
      return res.status(502).json({ error: 'news-provider-error', status: r.status });
    }
    const body = await r.json();
    const items = Array.isArray(body.articles) ? body.articles : (Array.isArray(body) ? body : []);
    const normalized = items.map((it,i)=> normalizeArticle(it,i));
    return res.json({ articles: normalized });
  }catch(err){
    console.error('Proxy error', err && err.message);
    return res.status(500).json({ error: 'proxy-failed' });
  }
});

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});
