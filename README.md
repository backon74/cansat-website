# Team Altair — CanSat Bahrain 2026 website

Static site, no build step needed to host it. GitHub Pages (or Cloudflare Pages) serves the repo root.

```
index.html        the page (generated — edit src/index.src.html instead)
app.js            3D scenes, scroll story, language switch, carousel
assets/           3D scene data, team photos, logos, font
src/              page template + build script
```

## Editing

1. Edit `src/index.src.html` (markup + CSS) or `app.js` (behaviour).
2. Run `python3 src/build.py` from the repo root to regenerate `index.html`.
3. Commit and push. Pages redeploys automatically.

Preview locally with `python3 -m http.server` and open http://localhost:8000
(opening the file directly won't load the 3D data).

three.js 0.160 loads from the jsDelivr CDN via the import map in `index.html`.

## Hosting

Settings → Pages → Source: *Deploy from a branch* → `main` / root.
For a custom domain, add it under Settings → Pages → Custom domain
(GitHub creates the `CNAME` file) and tick *Enforce HTTPS* once the certificate is issued.
