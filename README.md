# Leadership & Education Excellence

A news/commentary hub covering leadership-driven education reform in South Africa, across Africa, and globally — built with HTML5, CSS3, Bootstrap 5, vanilla JS, Express, and a JSON file as the data store.

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:3000

## Structure

- `server.js` — Express server + REST API, reads/writes `data/articles.json`
- `data/articles.json` — article data store (seeded with the launch article)
- `public/index.html` — homepage (masthead, leadership ticker, hero, article grid, search)
- `public/article.html` — full article reading view
- `public/admin.html` — key-gated admin panel (create/edit/delete articles)
- `public/css/style.css` — design system (Ink Navy / Regalia Gold / Savannah Green palette; Fraunces + Public Sans + JetBrains Mono)
- `public/js/` — `main.js` (home), `article.js` (article page), `admin.js` (admin panel)

## API

| Method | Route                | Auth        | Description                    |
|--------|-----------------------|-------------|--------------------------------|
| GET    | `/api/articles`       | none        | List articles (`?category=`, `?tag=`, `?q=`) |
| GET    | `/api/articles/:id`   | none        | Get one article                |
| POST   | `/api/articles`       | admin key   | Create article                 |
| PUT    | `/api/articles/:id`   | admin key   | Update article                 |
| DELETE | `/api/articles/:id`   | admin key   | Delete article                 |

Admin requests need header `x-admin-key: <key>`.

## Admin panel

Go to `/admin.html`. Default key: `leadership-admin-2026`.

**Change this before deploying** — set an environment variable instead:

```bash
ADMIN_KEY=your-new-key npm start
```

On Render, add `ADMIN_KEY` as an environment variable in the service settings.

## Deploying

Works as a standard Node/Express app on Render, Railway, etc.:
- Build command: `npm install`
- Start command: `npm start`

Note: `data/articles.json` is written to at runtime. On platforms with an ephemeral filesystem (like Render's free tier), edits made via the admin panel won't persist across restarts/redeploys — for permanent storage, swap the JSON file for a small database or a persistent disk.
