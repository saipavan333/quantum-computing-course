/* assistant.js — AI course assistant (playbook §10).

   LAYER 1 (always on, free, private, offline): builds a compact index from the
   lessons + glossary, ranks by keyword + bigram bonus + IDF down-weighting +
   singular/plural stemming, and answers with a glossary definition, a lesson
   summary, and CITED lesson links. No key, no network, nothing leaves the device.

   LAYER 2 (generative, on when a proxy is configured): if the owner has set
   window.GD_ASSIST_PROXY (see assets/assistant-config.js) to the shared Cloudflare
   Worker, the browser POSTs {question, context, history} to it; the Worker holds
   the Gemini key server-side and returns a written, grounded answer. The student
   never needs a key. On ANY failure (offline, quota, error) it silently falls back
   to Layer 1, so students never see a raw error. Same cited lessons are shown. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var COURSE = QCC.COURSE, CONTENT = QCC.CONTENT, FLAT = QCC.FLAT, esc = QCC.escapeHtml, store = QCC.store;
  var GLOSSARY = window.GLOSSARY || [];

  function stem(w) { w = w.toLowerCase().replace(/[^a-z0-9]/g, ""); return w.length > 4 && /s$/.test(w) ? w.slice(0, -1) : w; }
  function toks(s) { return String(s).toLowerCase().match(/[a-z0-9]+/g) || []; }

  /* ---- build index: lesson docs + df for IDF ---- */
  var docs = [], df = {};
  FLAT.forEach(function (x) {
    var md = CONTENT[x.lesson.id] || "";
    var heads = (md.match(/^##+\s+(.+)$/gm) || []).join(" ");
    var text = x.lesson.title + " " + x.lesson.summary + " " + x.module.title + " " + heads;
    var t = toks(text).map(stem);
    var tf = {}; t.forEach(function (w) { tf[w] = (tf[w] || 0) + 1; });
    Object.keys(tf).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
    docs.push({ id: x.lesson.id, title: x.lesson.title, module: x.module, summary: x.lesson.summary, tf: tf, tokens: t });
  });
  var N = docs.length;
  function idf(w) { return Math.log((N + 1) / ((df[w] || 0) + 1)) + 1; }

  function rank(q) {
    var qt = toks(q).map(stem).filter(function (w) { return w.length > 1; });
    var bigrams = []; for (var i = 0; i < qt.length - 1; i++) bigrams.push(qt[i] + " " + qt[i + 1]);
    return docs.map(function (d) {
      var s = 0;
      qt.forEach(function (w) { if (d.tf[w]) s += d.tf[w] * idf(w); });
      var joined = d.tokens.join(" ");
      bigrams.forEach(function (b) { if (joined.indexOf(b) >= 0) s += 3; });
      // de-prioritize how-to/career pages for the summary
      if (/career|capstone|setup|welcome/.test(d.id)) s *= 0.85;
      return { d: d, s: s };
    }).filter(function (r) { return r.s > 0; }).sort(function (a, b) { return b.s - a.s; });
  }
  function glossHit(q) {
    var qt = toks(q).map(stem);
    var best = null, bestScore = 0;
    GLOSSARY.forEach(function (g) {
      var names = [g.term].concat(g.aliases || []);
      names.forEach(function (nm) {
        var nt = toks(nm).map(stem), hit = nt.every(function (w) { return qt.indexOf(w) >= 0; });
        if (hit && nt.length > bestScore) { bestScore = nt.length; best = g; }
      });
    });
    return best;
  }

  /* ---- cited-lesson helpers (shared by both layers) ---- */
  function citesFor(g, ranked) {
    var cites = [];
    if (g && g.see && QCC.findIdx(g.see) >= 0) cites.push(g.see);
    ranked.slice(0, 3).forEach(function (r) { if (cites.indexOf(r.d.id) < 0) cites.push(r.d.id); });
    return cites;
  }
  function citeBlock(cites) {
    if (!cites || !cites.length) return "";
    var links = cites.map(function (id) {
      var i = QCC.findIdx(id); if (i < 0) return ""; var L = FLAT[i];
      return "<a href='#/l/" + id + "'>→ " + esc(L.module.icon + " " + L.lesson.title) + "</a>";
    }).join("");
    return links ? '<div class="cites">Sources:' + links + "</div>" : "";
  }

  /* ---- Layer 1: offline retrieval answer (also the fallback for Layer 2) ---- */
  function answer(q) {
    var cache = store.read("qcc-assistant-cache", {});
    var key = q.toLowerCase().trim();
    if (cache[key]) return cache[key];
    var g = glossHit(q), ranked = rank(q);
    if (!g && !ranked.length) {
      return { html: "I couldn't find that in the course. Try rephrasing, or browse the <a href='#/glossary'>glossary</a> and <a href='#/map'>concept map</a>. This assistant only answers from this course's own content.", cites: [] };
    }
    var html = "", cites = citesFor(g, ranked);
    if (g) html += "<b>" + esc(g.term) + ".</b> " + esc(g.def) + " ";
    if (ranked.length && !g) html += esc(ranked[0].d.summary) + " ";
    var res = { html: html + citeBlock(cites), cites: cites };
    cache[key] = res; store.write("qcc-assistant-cache", cache);
    return res;
  }

  /* ---- Layer 2: build grounding context from the top lessons for the Worker ---- */
  function cleanMd(md) {
    return String(md)
      .replace(/<!--[\s\S]*?-->/g, "")            // html comments
      .replace(/^@@diagram:.*$/gm, "")            // diagram directives
      .replace(/^```(?:run|quiz)[\s\S]*?```$/gm, "") // runnable/quiz blocks (noise)
      .replace(/```[\s\S]*?```/g, function (b) { return b.length > 500 ? b.slice(0, 500) + "\n…" : b; })
      .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function buildContext(q) {
    var g = glossHit(q), ranked = rank(q);
    var cites = citesFor(g, ranked), parts = [];
    if (g) parts.push("GLOSSARY — " + g.term + ": " + g.def);
    ranked.slice(0, 3).forEach(function (r) {
      var md = cleanMd(CONTENT[r.d.id] || "");
      if (md) parts.push("LESSON: " + r.d.title + "\n" + md.slice(0, 2600));
    });
    return { ctx: parts.join("\n\n---\n\n").slice(0, 14000), cites: cites };
  }
  function proxyUrl() {
    var u = (window.GD_ASSIST_PROXY || "").trim();
    if (!u || /your-?worker|yourname|example\.com|REPLACE|PASTE/i.test(u)) return "";
    return u.replace(/\/+$/, "");
  }
  function renderAnswer(text) {
    try { return QCC.renderMarkdown(text); }
    catch (e) { return "<p>" + esc(text).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + "</p>"; }
  }
  /* Returns a Promise for the best available answer. Never rejects. */
  function answerAsync(q, history) {
    var local = answer(q);                       // always compute Layer 1 (fallback + cache)
    var url = proxyUrl();
    if (!url) return Promise.resolve(local);
    var built = buildContext(q);
    if (!built.ctx) return Promise.resolve(local); // nothing to ground on — don't spend quota
    return fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        question: q,
        context: built.ctx,
        history: (history || []).slice(-6),
        course: (COURSE && COURSE.title) || "this course"  // ignored by current Worker; used if it becomes course-aware
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || j.error || !j.answer) throw new Error((j && j.error) || "empty");
        var text = String(j.answer).trim();
        return { html: renderAnswer(text) + citeBlock(built.cites), text: text, generative: true };
      })
      .catch(function () { return local; });       // silent fallback to Layer 1
  }

  /* ---- UI: docked FAB + panel ---- */
  var fab = document.createElement("button");
  fab.id = "assistant-fab"; fab.type = "button"; fab.setAttribute("aria-label", "Open the AI study assistant"); fab.textContent = "🤖";
  var panel = document.createElement("div");
  panel.id = "assistant-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "AI study assistant");
  panel.innerHTML =
    '<div class="as-head"><span>🤖 Study assistant</span><button class="as-close" type="button" aria-label="Close assistant">✕</button></div>' +
    '<div class="as-log" id="as-log"><div class="as-msg bot">Ask me anything about this course — I answer from the lessons and glossary, and cite where to read more.</div></div>' +
    '<form class="as-form" id="as-form"><input id="as-input" type="text" placeholder="e.g. what is phase kickback?" aria-label="Ask a question" autocomplete="off"><button type="submit" aria-label="Send">➤</button></form>';
  document.body.appendChild(fab); document.body.appendChild(panel);
  var log = panel.querySelector("#as-log"), input = panel.querySelector("#as-input");
  function toggle(open) { panel.classList.toggle("open", open); if (open) setTimeout(function () { try { input.focus(); } catch (e) {} }, 50); }
  fab.onclick = function () { toggle(!panel.classList.contains("open")); };
  panel.querySelector(".as-close").onclick = function () { toggle(false); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) toggle(false); });

  var history = [], busy = false;
  panel.querySelector("#as-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy) return;
    var q = input.value.trim(); if (!q) return;
    log.insertAdjacentHTML("beforeend", '<div class="as-msg you">' + esc(q) + "</div>");
    input.value = "";
    var thinking = document.createElement("div");
    thinking.className = "as-msg bot as-typing";
    thinking.innerHTML = '<span class="as-dot"></span><span class="as-dot"></span><span class="as-dot"></span>';
    log.appendChild(thinking);
    log.scrollTop = log.scrollHeight;
    busy = true;
    answerAsync(q, history).then(function (a) {
      thinking.classList.remove("as-typing");
      thinking.innerHTML = a.html;
      if (a.generative && a.text) {
        history.push({ role: "user", text: q }, { role: "model", text: a.text });
        if (history.length > 12) history = history.slice(-12);
      }
    }).catch(function () {
      thinking.classList.remove("as-typing");
      thinking.innerHTML = "Something went wrong. Try the <a href='#/glossary'>glossary</a>.";
    }).then(function () {
      busy = false; log.scrollTop = log.scrollHeight; try { input.focus(); } catch (e) {}
    });
  });

  /* dedicated route so the home tile / sidebar link work */
  QCC.registerRoute(function (h) {
    if (h === "#/assistant") {
      var live = !!proxyUrl();
      var blurb = live
        ? "A study assistant that answers your questions in plain language, grounded in this course’s own lessons, and cites where to read more. If it is ever offline, it falls back to an instant on-device search of the lessons and glossary — so you always get an answer."
        : "A free, private assistant that answers from this course’s own lessons and glossary and cites where to read more. It runs entirely in your browser — no account, no key, works offline.";
      QCC.setContent('<div class="page"><div class="feature-head reveal"><h1>AI study assistant</h1>' +
        '<p>' + blurb + '</p></div>' +
        '<button class="btn primary" id="open-as" type="button">🤖 Open the assistant</button>' +
        '<p class="muted" style="margin-top:16px">Tip: it is also available from the floating button in the bottom-right corner on every page.' +
        (live ? '' : ' A more conversational answer can be enabled via a free serverless upgrade — see <code>ASSISTANT-SETUP.md</code>.') +
        '</p></div>', "AI assistant", { view: "assistant" });
      var b = document.getElementById("open-as"); if (b) b.onclick = function () { toggle(true); };
      return true;
    }
    return false;
  });
});
