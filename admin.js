let adminKey = sessionStorage.getItem('adminKey') || '';
let articles = [];

const loginGate = document.getElementById('login-gate');
const panel = document.getElementById('panel');
const listView = document.getElementById('list-view');
const formView = document.getElementById('form-view');

async function verifyKey(key) {
  const res = await fetch('/api/admin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
    body: '{}',
  });
  return res.ok;
}

async function tryUnlock(key) {
  const ok = await verifyKey(key);
  if (ok) {
    adminKey = key;
    sessionStorage.setItem('adminKey', key);
    loginGate.style.display = 'none';
    panel.style.display = '';
    loadArticles();
  } else {
    document.getElementById('login-error').style.display = '';
  }
}

document.getElementById('login-btn').addEventListener('click', () => {
  const key = document.getElementById('admin-key-input').value.trim();
  if (key) tryUnlock(key);
});

document.getElementById('admin-key-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

if (adminKey) tryUnlock(adminKey);

// ---------- list ----------

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function rowHtml(article) {
  return `
    <tr>
      <td>${article.title}</td>
      <td>${article.category}</td>
      <td>${formatDate(article.date)}</td>
      <td>${article.featured ? 'Yes' : '—'}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-parchment me-1" data-edit="${article.id}">Edit</button>
        <button class="btn btn-sm btn-outline-parchment" data-delete="${article.id}" style="border-color:#e46a6a; color:#e46a6a;">Delete</button>
      </td>
    </tr>`;
}

async function loadArticles() {
  const res = await fetch('/api/articles');
  articles = await res.json();
  document.getElementById('articles-tbody').innerHTML = articles.map(rowHtml).join('')
    || '<tr><td colspan="5" class="text-center py-4">No articles yet — create the first one.</td></tr>';
}

document.getElementById('articles-tbody').addEventListener('click', (e) => {
  const editId = e.target.getAttribute('data-edit');
  const deleteId = e.target.getAttribute('data-delete');
  if (editId) openForm(articles.find((a) => a.id === editId));
  if (deleteId) deleteArticle(deleteId);
});

async function deleteArticle(id) {
  if (!confirm('Delete this article? This cannot be undone.')) return;
  const res = await fetch(`/api/articles/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'x-admin-key': adminKey },
  });
  if (res.ok) loadArticles();
}

// ---------- form ----------

document.getElementById('new-article-btn').addEventListener('click', () => openForm(null));
document.getElementById('cancel-btn').addEventListener('click', closeForm);

function openForm(article) {
  listView.style.display = 'none';
  formView.style.display = '';
  document.getElementById('form-error').style.display = 'none';
  document.getElementById('form-heading').textContent = article ? 'Edit article' : 'New article';
  document.getElementById('edit-id').value = article ? article.id : '';
  document.getElementById('f-title').value = article ? article.title : '';
  document.getElementById('f-category').value = article ? article.category : 'Higher Education Reform';
  document.getElementById('f-tags').value = article && article.tags ? article.tags.join(', ') : '';
  document.getElementById('f-author').value = article ? article.author : 'Nomawethu Matshingana';
  document.getElementById('f-role').value = article ? article.authorRole : 'Educator | Writer';
  document.getElementById('f-date').value = article ? article.date : new Date().toISOString().slice(0, 10);
  document.getElementById('f-excerpt').value = article ? article.excerpt : '';
  document.getElementById('f-body').value = article && Array.isArray(article.body) ? article.body.join('\n') : '';
  document.getElementById('f-featured').checked = article ? !!article.featured : false;
}

function closeForm() {
  formView.style.display = 'none';
  listView.style.display = '';
}

document.getElementById('save-btn').addEventListener('click', async () => {
  const id = document.getElementById('edit-id').value;
  const payload = {
    title: document.getElementById('f-title').value.trim(),
    category: document.getElementById('f-category').value,
    tags: document.getElementById('f-tags').value.split(',').map((t) => t.trim()).filter(Boolean),
    author: document.getElementById('f-author').value.trim(),
    authorRole: document.getElementById('f-role').value.trim(),
    date: document.getElementById('f-date').value,
    excerpt: document.getElementById('f-excerpt').value.trim(),
    body: document.getElementById('f-body').value.split('\n').map((p) => p.trim()).filter(Boolean),
    featured: document.getElementById('f-featured').checked,
  };

  if (!payload.title || !payload.body.length) {
    const err = document.getElementById('form-error');
    err.textContent = 'Title and body are required.';
    err.style.display = '';
    return;
  }

  const url = id ? `/api/articles/${encodeURIComponent(id)}` : '/api/articles';
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    closeForm();
    loadArticles();
  } else {
    const err = document.getElementById('form-error');
    err.textContent = 'Something went wrong saving this article.';
    err.style.display = '';
  }
});
