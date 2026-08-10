<p>This branch contains a redesigned, mobile-first BuzzZA website built as a demonstration using mock/demo data.</p>

<h2>What's included</h2>

<ul>
<li>index.html — redesigned home page, accessible and SEO-friendly</li>
<li>css/styles.css — mobile-first responsive stylesheet</li>
<li>js/main.js — small dependency-free JS to load demo data, render articles, search and ticker</li>
<li>data/articles.json — 20 demo/mock articles across categories (clearly labelled as demo)</li>
<li>assets/logo-buzzza.svg — simple placeholder logo</li>
</ul>

<h2>How to test locally</h2>

<p>Run a basic static server (recommended) to avoid CORS issues with fetch(). For example with Python 3:</p>

<pre><code>python -m http.server 8000
</code></pre>

<p>Then open <code>http://localhost:8000/</code> in your browser.</p>

<h2>Connecting a real news API</h2>

<p>The client-side loader in <code>js/main.js</code> points to <code>data/articles.json</code>. Replace that fetch with your API endpoint and adapt the mapping of fields (title, excerpt, category, publishedAt, image).</p>

<p>Please do not claim news is live unless you wire a real-time/news API.</p>
