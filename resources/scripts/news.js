document.addEventListener('DOMContentLoaded', () => {
  const status = document.getElementById('status');
  const list = document.getElementById('news-list');

    // Paste your TheNewsAPI API token here (from https://www.thenewsapi.com/account/dashboard).
    // Example token variable name: API_KEY
    const API_KEY = '0EN8qctLqdAHTWbtBzuObVXziQLEN9NsEiHMwnsh';

    async function load() {
      status.textContent = 'Loading headlines...';
      try {
        if (!API_KEY || API_KEY === 'PASTE_YOUR_THENEWSAPI_TOKEN_HERE') {
          status.textContent = 'Please paste your TheNewsAPI token into resources/scripts/news.js';
          return;
        }

        // TheNewsAPI top headlines endpoint
        const url = `https://api.thenewsapi.com/v1/news/top?api_token=${encodeURIComponent(API_KEY)}&locale=us&limit=10`;
        const resp = await fetch(url);
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body.message || `HTTP ${resp.status}`);
        }
        const data = await resp.json();

        // TheNewsAPI returns articles often under `data`; NewsAPI uses `articles`.
        const articles = data.data || data.articles || [];
        renderArticles(articles);
      } catch (err) {
        status.textContent = 'Error loading headlines: ' + err.message;
      }
    }

  function renderArticles(articles) {
    status.style.display = 'none';
    // Remove previous articles except status
    list.querySelectorAll('.article').forEach(n => n.remove());

    if (!articles.length) {
      status.style.display = '';
      status.textContent = 'No headlines available.';
      return;
    }

    for (const a of articles) {
      const el = document.createElement('article');
      el.className = 'article';

      const img = document.createElement('img');
      img.src = a.urlToImage || 'https://via.placeholder.com/120x80?text=No+Image';
      img.alt = a.title || 'Article image';

      const meta = document.createElement('div');
      meta.className = 'meta';
      const h3 = document.createElement('h3');
      h3.textContent = a.title || 'Untitled';
      const p = document.createElement('p');
      p.textContent = a.description || '';
      const link = document.createElement('a');
      link.className = 'read';
      link.href = a.url || '#';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Read more';

      meta.appendChild(h3);
      meta.appendChild(p);
      meta.appendChild(link);

      el.appendChild(img);
      el.appendChild(meta);
      list.appendChild(el);
    }
  }

  load();
});
