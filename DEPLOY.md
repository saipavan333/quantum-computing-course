# Deploying the course as a website

The course is a static site — no server, no build step. Any static host works. Here are three options, easiest first.

## Option A — GitHub Pages (free, ~5 minutes, recommended)

This gives you a public URL like `https://yourname.github.io/quantum-course/` that works from any device, anywhere.

1. **Create a GitHub account** (github.com) if you don't have one — free.

2. **Create a new repository**: click **+ → New repository**, name it e.g. `quantum-course`, set it **Public**, click *Create repository*.

3. **Upload the files.** Easiest path (no git needed):
   - On the new repo page, click **uploading an existing file**.
   - Drag the **entire contents** of the `quantum-computing-course` folder (index.html, assets/, content/, icons/, sw.js, manifest.webmanifest — everything) into the upload box.
   - Scroll down, click **Commit changes**.
   - *(If you prefer git: `git init && git add -A && git commit -m "course" && git remote add origin <url> && git push -u origin main`.)*

4. **Turn on Pages**: in the repo, go to **Settings → Pages**. Under *Build and deployment → Source*, choose **Deploy from a branch**; set branch to **main** and folder to **/ (root)**; click **Save**.

5. **Wait ~1 minute**, then refresh the Pages settings — your live URL appears at the top. Open it. Done.

Now anyone with the link can use the course, on any device. Because it's served over HTTPS, the **offline app install** and **service-worker caching** both activate (see below).

## Option B — Netlify / Cloudflare Pages / Vercel (free, drag-and-drop)

1. Sign up at netlify.com (or Cloudflare Pages / Vercel).
2. Find the "deploy manually / drag-and-drop" option.
3. Drag the `quantum-computing-course` folder onto it.
4. You get an instant HTTPS URL. That's it — even simpler than GitHub for a one-off deploy.

## Option C — Your own web server

Copy the folder into any web root (Apache, nginx, `python -m http.server`, etc.) and serve it. No special configuration — it's plain static files. For the service worker and PWA install to work, serve over **HTTPS** (or `localhost`).

---

## Installing it as a desktop/mobile app (after hosting)

Once the course is live on an HTTPS URL (Options A or B):

- **Desktop (Chrome/Edge)**: open the URL → click the **install icon** in the address bar (or menu → *Apps → Install this site as an app* / *Cast, save, and share → Install page as app*). It gets its own window, an icon, and works **offline** thereafter (the service worker caches everything on first visit).
- **Android (Chrome)**: menu → *Add to Home screen → Install*.
- **iOS (Safari)**: Share → *Add to Home Screen*.

Progress (completed lessons) is saved per browser/device.

## Updating a deployed site

Edited some lessons? Re-run `node tools/build.js` locally, then re-upload the changed files (or `git push`). If you host over HTTPS and the service worker has cached the old version, bump the `VERSION` string at the top of `sw.js` (e.g. `qcc-v1.0.1`) so returning visitors fetch the fresh content.

## Troubleshooting

- **Blank page / lessons don't load**: make sure you uploaded the folder *contents* at the root, not the folder itself (so `index.html` is at the top level of what's served). The Pages URL should load `index.html` directly.
- **Math/diagrams missing**: confirm the `assets/` and `content/` folders uploaded completely (the `assets/vendor/katex/fonts/` folder especially — math fonts live there).
- **Offline install option doesn't appear**: it requires HTTPS. GitHub Pages and Netlify provide this automatically; a plain `file://` open or `http://` won't offer install (though `file://` still works fully offline via the `.bat` launcher).
