# AI course assistant — how it works and how it's wired

The course ships a **two-layer AI study assistant** (the 🤖 button, bottom-right on
every page, and the `#/assistant` page).

## Layer 1 — offline retrieval (always on, no setup)

`assets/js/assistant.js` builds a compact index from the lessons (titles, summaries,
module names, section headings) and the glossary, then answers by ranking lessons with
**keyword hits + a bigram bonus + IDF down-weighting** and **singular/plural stemming**,
composing: the **glossary definition** → a short **lesson summary** → **cited lesson links**.

It runs entirely in the browser. **No API key, no server, no network — it works offline**
and nothing leaves the device. Repeat questions are cached in `localStorage`. This is the
free-forever fallback and needs zero configuration.

## Layer 2 — generative answers (LIVE)

For written, conversational answers grounded in the course, the browser does the retrieval
(Layer 1), then POSTs `{ question, context, history }` to a small serverless proxy that holds
the Gemini key **server-side**. The proxy calls the model and returns a grounded answer.
**No student ever needs a key**, and on any failure the assistant silently falls back to Layer 1.

**This is already set up and shared across all of these courses:**

- **Proxy (one shared Cloudflare Worker):** `https://gd-assistant-proxy.uekpavanharish.workers.dev`
  Source of truth: `worker/assistant-proxy.js` (mirrored in this repo). It holds the key as the
  Worker secret `GEMINI_API_KEY`, uses model env var `GEMINI_MODEL=gemini-flash-latest` (a
  `-latest` alias, so model retirements are a dashboard change, not a code edit), and its CORS
  `ALLOWED_ORIGINS` is the **origin** `https://saipavan333.github.io` — which covers every course
  hosted on that GitHub Pages account, this one included.
- **Client config (this course):** `assets/assistant-config.js` sets
  `window.GD_ASSIST_PROXY` to that Worker URL. It is loaded in `index.html` **before**
  `assistant.js`, cached by `sw.js`, and — because the URL is public, not secret — **committed**
  (see `.gitignore`).

Because the Worker is origin-locked to `https://saipavan333.github.io`, the generative answers
turn on automatically once this course is deployed to that Pages site. Locally (over `file://`
or a different origin) the client silently uses Layer 1.

### Security (in place)

The key lives **only** inside the Worker, never in client code. Retrieved lesson text is fenced
and the model is instructed to treat it as untrusted reference data (prompt-injection guard).
The Worker's CORS is restricted to the course origin, so other sites can't use your quota.
`temperature`/`top_p`/`top_k` are intentionally omitted — Google deprecated them (ignored today,
HTTP 400 on future models); brevity is enforced via the system prompt, and `maxOutputTokens` is
set generously (8192) so a Flash model's internal "thinking" tokens don't crowd out the answer.

### Cost

Effectively **$0** — Cloudflare's Worker free tier plus Gemini's free tier, with no card attached,
so there's no surprise bill (worst case the daily quota pauses). One Worker + one key serves every
course on the same origin.

## To point a NEW course at the same proxy

Copy `assets/assistant-config.js` (with the same `window.GD_ASSIST_PROXY` URL) into the new
course and load it before its assistant script. No Worker change is needed — the origin allowlist
already covers every course on `https://saipavan333.github.io`.

## Gating to paying students later

Once access control exists (see `ACCESS-CONTROL.md`), have the Worker require a valid
login/subscription token before answering, so the generative assistant is a paid perk while the
retrieval fallback stays free.
