# Deploying to Render

This guide ensures the app and **image paths** work correctly on Render.

---

## 1. Build command (required)

Use exactly:

```bash
npm ci && npm run build
```

- **Do not** run `ensure-placeholder-images.mjs` in the build. The `build` script already runs `copy-images-to-public.mjs`, which copies real images from `src/image/` to `public/image/` before Vite builds.
- **Publish directory:** `dist`

---

## 2. Image paths on Render

- **How it works:** All images are imported from `src/image/` in code. Vite bundles them and emits hashed files under `dist/assets/` (e.g. `dist/assets/laptop-abc123.jpg`). The app requests them as `/assets/...`, which Render serves from `dist` when the site is at the root URL.
- **Base URL:** The app is built with `base: '/'` in `vite.config.ts`, so asset URLs are root-relative. No extra config is needed for a root deploy (e.g. `https://your-app.onrender.com/`).

**You must:**

1. **Commit all image files** under `src/image/` (e.g. `laptop.jpg`, `cbrilliance.png`, `Afr-Logo.jpg`). If they are not in the repo, the build on Render will fail or images will be missing.
2. Keep the build command as above so the copy script runs and `public/image/` is filled before `vite build`.

---

## 3. Environment variables

Set in the Render dashboard (or in `render.yaml`):

| Variable             | Required | Description |
|----------------------|----------|-------------|
| `VITE_API_BASE_URL`  | Optional | Backend API base URL (no trailing slash), e.g. `https://recruitment-back.onrender.com`. If unset, the app uses mock data. |

Vite inlines `VITE_*` at **build time**, so set this before the build runs.

---

## 4. SPA routing

So client-side routes (e.g. `/browse-jobs`, `/admin`) work when opened or refreshed:

- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** Rewrite

(This is already defined in `render.yaml` via `routes` if you use the Blueprint.)

---

## 5. Deploying at a subpath (optional)

If the site is served under a subpath (e.g. `https://example.com/recruitment/`):

1. In `vite.config.ts`, set `base: '/recruitment/'` (match your subpath, with leading and trailing slashes).
2. Rebuild and redeploy. Asset paths will then be `/recruitment/assets/...` and will resolve correctly.

---

## 6. Quick checklist

- [ ] Build command: `npm ci && npm run build`
- [ ] Publish directory: `dist`
- [ ] `src/image/` committed with real image files
- [ ] `VITE_API_BASE_URL` set in Render if using the backend
- [ ] SPA rewrite `/*` → `/index.html` configured

After deploy, images should load at `/assets/...` and the app should work at the root URL.
