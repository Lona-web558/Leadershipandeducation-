const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'leadership-admin-2026';
const DATA_FILE = path.join(__dirname, 'articles.json');

app.use(express.json());
app.use(express.static(path.join(__dirname,)));

// ---------- helpers ----------
function readArticles() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeArticles(articles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), 'utf-8');
}

function requireAdmin(req, res, next) {
  const key = req.header('x-admin-key');
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized: invalid admin key' });
  }
  next();
}

function slugId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- public API ----------

// List all articles (optionally filter by category or tag, and search)
app.get('/api/articles', (req, res) => {
  let articles = readArticles();
  const { category, tag, q } = req.query;

  if (category) {
    articles = articles.filter(
      (a) => a.category && a.category.toLowerCase() === category.toLowerCase()
    );
  }
  if (tag) {
    articles = articles.filter(
      (a) => Array.isArray(a.tags) && a.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }
  if (q) {
    const needle = q.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        (a.excerpt && a.excerpt.toLowerCase().includes(needle)) ||
        (Array.isArray(a.body) && a.body.join(' ').toLowerCase().includes(needle))
    );
  }

  articles = articles.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(articles);
});

// Get a single article
app.get('/api/articles/:id', (req, res) => {
  const articles = readArticles();
  const article = articles.find((a) => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

// ---------- admin API (requires x-admin-key header) ----------

// Create
app.post('/api/articles', requireAdmin, (req, res) => {
  const articles = readArticles();
  const {
    title, category, tags, author, authorRole, date, excerpt, body, featured,
  } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }

  const newArticle = {
    id: slugId(),
    title,
    category: category || 'General',
    tags: Array.isArray(tags) ? tags : [],
    author: author || 'Staff Writer',
    authorRole: authorRole || '',
    date: date || new Date().toISOString().slice(0, 10),
    excerpt: excerpt || (Array.isArray(body) ? body[0] : String(body).slice(0, 180)),
    body: Array.isArray(body) ? body : [String(body)],
    featured: !!featured,
  };

  articles.push(newArticle);
  writeArticles(articles);
  res.status(201).json(newArticle);
});

// Update
app.put('/api/articles/:id', requireAdmin, (req, res) => {
  const articles = readArticles();
  const idx = articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Article not found' });

  articles[idx] = { ...articles[idx], ...req.body, id: articles[idx].id };
  writeArticles(articles);
  res.json(articles[idx]);
});

// Delete
app.delete('/api/articles/:id', requireAdmin, (req, res) => {
  const articles = readArticles();
  const idx = articles.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Article not found' });

  const [removed] = articles.splice(idx, 1);
  writeArticles(articles);
  res.json({ removed });
});

// Verify admin key (used by the admin panel login screen)
app.post('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ ok: true });
});

// Fallback to index for any non-API route (simple SPA-friendly routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Leadership & Education Hub running on http://localhost:${PORT}`);
});
