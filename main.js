document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-ZA', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

const params = new URLSearchParams(window.location.search);
const categoryFilter = params.get('category');
if (categoryFilter) {
  document.getElementById('list-heading').textContent = categoryFilter;
}

function initials(name) {
  return (name || '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderHero(article) {
  if (!article) return;
  const hero = document.getElementById('hero-section');
  hero.style.display = '';
  document.getElementById('hero-category').textContent = article.category;
  document.getElementById('hero-title').textContent = article.title;
  document.getElementById('hero-excerpt').textContent = article.excerpt;
  document.getElementById('hero-author').textContent = article.author;
  document.getElementById('hero-meta').textContent = `${article.authorRole || ''} · ${formatDate(article.date)}`;
  document.getElementById('hero-avatar').textContent = initials(article.author);
  document.getElementById('hero-link').href = `/article.html?id=${encodeURIComponent(article.id)}`;
}

function cardHtml(article) {
  return `
    <div class="col-md-6 col-lg-4">
      <div class="article-card">
        <span class="cat-tag">${article.category}</span>
        <h3><a href="/article.html?id=${encodeURIComponent(article.id)}">${article.title}</a></h3>
        <p>${article.excerpt || ''}</p>
        <div class="meta">${article.author} · ${formatDate(article.date)}</div>
      </div>
    </div>`;
}

let allArticles = [];

function renderGrid(articles) {
  const grid = document.getElementById('article-grid');
  const empty = document.getElementById('empty-state');
  if (!articles.length) {
    grid.innerHTML = '';
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = articles.map(cardHtml).join('');
}

async function loadArticles() {
  const url = categoryFilter
    ? `/api/articles?category=${encodeURIComponent(categoryFilter)}`
    : '/api/articles';
  const res = await fetch(url);
  const articles = await res.json();
  allArticles = articles;

  if (!categoryFilter) {
    const featured = articles.find((a) => a.featured) || articles[0];
    renderHero(featured);
    renderGrid(articles.filter((a) => !featured || a.id !== featured.id));
  } else {
    renderGrid(articles);
  }
}

document.getElementById('search-input').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    renderGrid(categoryFilter ? allArticles : allArticles.slice(1));
    return;
  }
  const filtered = allArticles.filter(
    (a) => a.title.toLowerCase().includes(q) || (a.excerpt || '').toLowerCase().includes(q)
  );
  renderGrid(filtered);
});

loadArticles();
