# AI course assistant — how it works and how to upgrade it

The course ships a **free, private, offline AI study assistant** (the 🤖 button, bottom-right on
every page, and the `#/assistant` page). This document explains it and the optional upgrade to
conversational, generated answers.

## What ships now (Layer 1 — retrieval, no setup)

`assets/js/assistant.js` builds a compact index from the lessons (titles, summaries, module
names, section headings) and the glossary, then answers a question by:

- ranking lessons with **keyword hits + a bigram bonus + IDF down-weighting** (so common words
  like "qubit" don't drown distinctive ones) and **singular/plural stemming**;
- composing an answer as: the **glossary definition** of the term(s) asked about → a short
  **summary** from the most relevant lesson → **cited lesson links**.

It runs entirely in the browser. **No API key, no server, no network — it works offline** and
nothing leaves the device. Repeat questions are cached in `localStorage`. This is the free-forever
fallback and needs zero configuration.

## Optional upgrade (Layer 2 — generative, still free)

To get written, conversational answers grounded in the course, add a tiny serverless proxy that
holds *your* free-tier LLM key server-side. The browser does the retrieval (Layer 1), POSTs
`{question, context}` to the proxy, and the proxy calls the model and returns a grounded answer.
**No student ever needs a key**, and on any failure the assistant silently falls back to Layer 1.

**Recommended stack (all free tiers):**

1. **Cloudflare Worker** holds the key as an environment variable and calls **Google Gemini**
   (free tier). Create a Worker, set an env var named exactly `GEMINI_API_KEY` (the *value* is the
   raw key; the label in the console is irrelevant), and set the model as another env var using a
   `-latest` alias (e.g. `gemini-flash-latest`) so a model retirement is a dashboard change, not a
   code edit.
2. In the Worker's CORS allowlist put your site's **origin** (scheme + host only, e.g.
   `https://<user>.github.io`) — *not* the full path. All GitHub Pages project sites under one
   username share that one origin, so one entry covers every course you host there.
3. Put the proxy URL in a small, separate, non-generated file `assets/assistant-config.js`
   (e.g. `window.QCC_ASSISTANT_PROXY = "https://your-worker.workers.dev";`) so asset rebuilds never
   overwrite it, and load it before `assistant.js`. Then extend `answer()` in `assistant.js` to
   POST `{question, context}` to that URL and render the returned text, falling back to Layer 1 on
   any error.

**Security (required):** the key lives *only* server-side in the Worker — never in client code.
Treat retrieved lesson text as untrusted and instruct the model to ignore any instructions inside
it (prompt-injection guard). Restrict the Worker to your course's own origin(s).

**Cost:** effectively **$0** — the serverless free tier (~100k requests/day) plus Gemini's free
tier, with no card attached, so there is no surprise bill (worst case the daily quota pauses). One
Worker + one key can serve many courses on the same origin.

## Gating to paying students later

Once access control exists (see `ACCESS-CONTROL.md`), have the Worker require a valid
login/subscription token before answering, so the generative assistant is a paid perk while the
retrieval fallback stays free.
