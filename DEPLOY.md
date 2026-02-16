# Deploy to Render

## Quick deploy

1. Push this repo to GitHub/GitLab and connect it in [Render Dashboard](https://dashboard.render.com) → **New** → **Static Site**.
2. Use the repo’s **render.yaml** (build command and publish path are set there), or set manually:
   - **Build command:** `npm ci && npm run build`
   - **Publish directory:** `dist`
3. After the first deploy, add the **SPA rewrite** so client-side routes work (e.g. `/opportunities`, `/browse-jobs`):
   - In the static site → **Settings** → **Redirects/Rewrites**
   - Add: **Source** `/*` → **Destination** `/index.html` → **Action** Rewrite
4. **Custom domain:** In the static site → **Settings** → **Custom Domains**, add your domain and follow the DNS instructions. Render provides HTTPS automatically.

## Image and asset paths

Images in `public/image/` are served at `/image/...`. Paths use the app base URL, so the app works at the root (e.g. `https://yoursite.onrender.com` or `https://yourdomain.com`) and, if needed, under a subpath.

## Environment variables

- **VITE_API_BASE_URL** (optional): Backend API URL for production. Set in Render → **Environment** if you use a separate API.
