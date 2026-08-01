# AI-assistant proxy (Cloudflare Worker)

`assistant-proxy.js` is a **mirror** of the single, shared Cloudflare Worker that powers the
generative AI assistant across all of these courses. It is **already deployed and live** at:

    https://gd-assistant-proxy.uekpavanharish.workers.dev

The client points at it via `../assets/assistant-config.js` (`window.GD_ASSIST_PROXY`).

## You usually don't need to touch anything

The Worker is origin-locked to `https://saipavan333.github.io`, which covers this course. Once
this repo is deployed to that GitHub Pages site, the generative answers are on. Nothing else to do.

## If you ever need to redeploy the Worker

1. Cloudflare dashboard → **Workers & Pages** → open **gd-assistant-proxy** → **Edit code**.
2. Paste the contents of `assistant-proxy.js`, then **Deploy**.
3. Confirm the variables under **Settings → Variables and Secrets**:
   - `GEMINI_API_KEY` — **Secret** — your key from https://aistudio.google.com/apikey
   - `GEMINI_MODEL` — Variable — `gemini-flash-latest` (optional; this is the default)
   - `ALLOWED_ORIGINS` — Variable — `https://saipavan333.github.io` (optional; comma-separated)

`worker.js` and `wrangler.toml` in this folder are unused stubs (kept only because the build
sandbox can't delete files) — safe to remove from your file explorer.
