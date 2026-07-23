document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-ZA', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
}

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function loadArticle() {
  if (!id) {
    document.getElementById('art-title').textContent = 'Article not found';
    return;
  }
  const res = await fetch(`/api/articles/${encodeURIComponent(id)}`);
  if (!res.ok) {
    document.getElementById('art-title').textContent = 'Article not found';
    document.getElementById('art-body').innerHTML = '<p>This story may have been moved or removed.</p>';
    return;
  }
  const article = await res.json();

  document.title = `${article.title} — Leadership & Education Excellence`;
  document.getElementById('art-category').textContent = article.category;
  document.getElementById('art-title').textContent = article.title;
  document.getElementById('art-author').textContent = `By ${article.author}${article.authorRole ? ' · ' + article.authorRole : ''}`;
  document.getElementById('art-date').textContent = formatDate(article.date);
  document.getElementById('art-tags').textContent = (article.tags || []).join(' · ');

  const body = Array.isArray(article.body) ? article.body : [String(article.body)];
  document.getElementById('art-body').innerHTML = body.map((p) => `<p>${p}</p>`).join('');
}

loadArticle();
