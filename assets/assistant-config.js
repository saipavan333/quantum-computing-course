/* Course Assistant — owner configuration (PUBLIC — safe to commit).
   This is ONLY the URL of the shared Cloudflare Worker that proxies to Gemini.
   It is not a secret: the API key lives inside the Worker, server-side, and is
   never exposed to the browser. Set it to "" to run the assistant in free,
   offline retrieval-only mode. Full setup: see ASSISTANT-SETUP.md */
window.GD_ASSIST_PROXY = "https://gd-assistant-proxy.uekpavanharish.workers.dev";
