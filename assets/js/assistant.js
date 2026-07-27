/* assistant.js — AI course assistant, retrieval layer (playbook §10).
   Always-on, free, private, offline: builds a compact index from the lessons +
   glossary, ranks by keyword + bigram bonus + IDF down-weighting + singular/
   plural stemming, and answers with a glossary definition, a lesson summary, and
   CITED lesson links. No key, no network, nothing leaves the device. A generative
   Gemini/Worker upgrade can be layered on later (see ASSISTANT-SETUP.md); on any
   failure it falls back to this layer, so students never see a raw error. */
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

  function answer(q) {
    var cache = store.read("qcc-assistant-cache", {});
    var key = q.toLowerCase().trim();
    if (cache[key]) return cache[key];
    var g = glossHit(q), ranked = rank(q);
    var html = "", cites = [];
    if (!g && !ranked.length) {
      html = "I couldn't find that in the course. Try rephrasing, or browse the <a href='#/glossary'>glossary</a> and <a href='#/map'>concept map</a>. This assistant only answers from this course's own content.";
      return { html: html };
    }
    if (g) { html += "<b>" + esc(g.term) + ".</b> " + esc(g.def) + " "; if (g.see && QCC.findIdx(g.see) >= 0) cites.push(g.see); }
    if (ranked.length) {
      var top = ranked[0].d;
      if (!g) html += esc(top.summary) + " ";
      ranked.slice(0, 3).forEach(function (r) { if (cites.indexOf(r.d.id) < 0) cites.push(r.d.id); });
    }
    var citeHtml = cites.length ? '<div class="cites">Sources:' + cites.map(function (id) {
      var i = QCC.findIdx(id); if (i < 0) return ""; var L = FLAT[i];
      return "<a href='#/l/" + id + "'>→ " + esc(L.module.icon + " " + L.lesson.title) + "</a>";
    }).join("") + "</div>" : "";
    var res = { html: html + citeHtml };
    cache[key] = res; store.write("qcc-assistant-cache", cache);
    return res;
  }

  /* ---- UI: docked FAB + panel ---- */
  var fab = document.createElement("button");
  fab.id = "assistant-fab"; fab.type = "button"; fab.setAttribute("aria-label", "Open the AI study assistant"); fab.textContent = "🤖";
  var panel = document.createElement("div");
  panel.id = "assistant-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "AI study assistant");
  panel.innerHTML =
    '<div class="as-head"><span>🤖 Study assistant</span><button class="as-close" type="button" aria-label="Close assistant">✕</button></div>' +
    '<div class="as-log" id="as-log"><div class="as-msg bot">Ask me anything about this course — I answer from the lessons and glossary, and cite where to read more. (Free, private, works offline.)</div></div>' +
    '<form class="as-form" id="as-form"><input id="as-input" type="text" placeholder="e.g. what is phase kickback?" aria-label="Ask a question" autocomplete="off"><button type="submit" aria-label="Send">➤</button></form>';
  document.body.appendChild(fab); document.body.appendChild(panel);
  var log = panel.querySelector("#as-log"), input = panel.querySelector("#as-input");
  function toggle(open) { panel.classList.toggle("open", open); if (open) setTimeout(function () { input.focus(); }, 50); }
  fab.onclick = function () { toggle(!panel.classList.contains("open")); };
  panel.querySelector(".as-close").onclick = function () { toggle(false); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("open")) toggle(false); });
  panel.querySelector("#as-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim(); if (!q) return;
    log.insertAdjacentHTML("beforeend", '<div class="as-msg you">' + esc(q) + "</div>");
    input.value = "";
    var a;
    try { a = answer(q); } catch (err) { a = { html: "Something went wrong. Try the <a href='#/glossary'>glossary</a>." }; }
    log.insertAdjacentHTML("beforeend", '<div class="as-msg bot">' + a.html + "</div>");
    log.scrollTop = log.scrollHeight;
    /* close the mobile nav so answers aren't hidden */
  });

  /* dedicated route so the home tile / sidebar link work */
  QCC.registerRoute(function (h) {
    if (h === "#/assistant") {
      QCC.setContent('<div class="page"><div class="feature-head reveal"><h1>AI study assistant</h1>' +
        '<p>A free, private assistant that answers from this course\'s own lessons and glossary and cites where to read more. ' +
        'It runs entirely in your browser — no account, no key, works offline.</p></div>' +
        '<button class="btn primary" id="open-as" type="button">🤖 Open the assistant</button>' +
        '<p class="muted" style="margin-top:16px">Tip: it is also available from the floating button in the bottom-right corner on every page. ' +
        'A more conversational answer can be added later via a free serverless upgrade — see <code>ASSISTANT-SETUP.md</code>.</p></div>', "AI assistant", { view: "assistant" });
      var b = document.getElementById("open-as"); if (b) b.onclick = function () { toggle(true); };
      return true;
    }
    return false;
  });
});
