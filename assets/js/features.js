/* features.js — study & assessment tools, single source (playbook §2, §3).
   Registers routes + render hooks + home tiles via the QCC API:
   glossary + inline tooltips, flashcards, spaced-repetition review (Leitner),
   per-module cheat sheets, interview bank, job-readiness exam, concept map,
   read-aloud, and enhanced (lessons + glossary) search. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var esc = QCC.escapeHtml, COURSE = QCC.COURSE, CONTENT = QCC.CONTENT, FLAT = QCC.FLAT, store = QCC.store;
  var GLOSSARY = (window.GLOSSARY || []).slice();
  var INTERVIEW = window.INTERVIEW || [];

  /* ============ helpers ============ */
  function stripMd(s) {
    return String(s)
      .replace(/\$\$([\s\S]*?)\$\$/g, "$1").replace(/\$([^$\n]+?)\$/g, "$1")
      .replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\\(t?frac|sqrt|ket|bra|cos|sin|pi|theta|varphi|alpha|beta|psi|phi|tfrac)/g, "")
      .replace(/[{}\\]/g, "").replace(/\s+/g, " ").trim();
  }
  function lessonTitle(id) { var i = QCC.findIdx(id); return i >= 0 ? FLAT[i].lesson.title : id; }
  function shuffle(a, seed) { a = a.slice(); var r = seed || 1; for (var i = a.length - 1; i > 0; i--) { r = (r * 1103515245 + 12345) & 0x7fffffff; var j = r % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function md2html(s) { return QCC.renderMarkdownInner ? QCC.renderMarkdownInner(String(s)) : esc(s); }

  /* ============ card decks from lesson "Key points" ============ */
  var DECKS = {}; // lessonId -> [{front, back}]
  var ALL_CARDS = [];
  FLAT.forEach(function (x) {
    var md = CONTENT[x.lesson.id]; if (!md) return;
    var m = md.match(/^##+\s+Key points\s*\n([\s\S]*?)(?=\n##\s|\n#\s|$)/m);
    if (!m) return;
    var cards = [];
    (m[1].match(/^[-*]\s+(.+)$/gm) || []).forEach(function (line, i) {
      var text = stripMd(line.replace(/^[-*]\s+/, ""));
      if (text.length < 12) return;
      var split = text.split(/\s[—–-]\s|:\s/);
      var front = split.length > 1 && split[0].length < 90 ? split[0] : "Recall — key point from “" + x.lesson.title + "”";
      cards.push({ id: x.lesson.id + "#" + i, front: front, back: text, lesson: x.lesson.id });
    });
    if (cards.length) { DECKS[x.lesson.id] = cards; ALL_CARDS = ALL_CARDS.concat(cards); }
  });

  /* ============ tool tiles (home) + sidebar links ============ */
  var TOOLS = [
    { href: "#/glossary", icon: "📖", label: "Glossary", desc: "Every term, defined" },
    { href: "#/flashcards", icon: "🃏", label: "Flashcards", desc: "Recall the key points" },
    { href: "#/review", icon: "🔁", label: "Review hub", desc: "Spaced repetition" },
    { href: "#/cheatsheets", icon: "📝", label: "Cheat sheets", desc: "Per-module summaries" },
    { href: "#/interview", icon: "💼", label: "Interview bank", desc: "Easy · medium · hard" },
    { href: "#/exam", icon: "🎓", label: "Readiness exam", desc: "Test yourself" },
    { href: "#/map", icon: "🗺️", label: "Concept map", desc: "The whole curriculum" },
    { href: "#/assistant", icon: "🤖", label: "AI assistant", desc: "Ask the course" }
  ];
  QCC.tools = TOOLS;
  (function sidebarTools() {
    var nav = document.getElementById("nav-modules"); if (!nav) return;
    var wrap = document.createElement("div"); wrap.className = "nav-tools";
    wrap.innerHTML = TOOLS.map(function (t) { return '<a class="nav-tool" href="' + t.href + '">' + t.icon + ' <span>' + esc(t.label) + "</span></a>"; }).join("");
    nav.insertBefore(wrap, nav.firstChild.nextSibling);
  })();

  function head(title, sub) { return '<div class="feature-head reveal"><h1>' + esc(title) + "</h1><p>" + esc(sub) + "</p></div>"; }
  function page(inner) { return '<div class="page">' + inner + "</div>"; }

  /* ============ enhanced search (lessons + glossary) ============ */
  QCC.search = function (q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    function score(hay) { var h = hay.toLowerCase(), s = 0; terms.forEach(function (t) { if (h.indexOf(t) >= 0) s += 2; }); if (h.indexOf(q.toLowerCase()) >= 0) s += 3; return s; }
    var out = [];
    FLAT.forEach(function (x) { var s = score(x.lesson.title + " " + x.lesson.summary + " " + x.module.title); if (s) out.push({ href: "#/l/" + x.lesson.id, title: x.lesson.title, sub: x.module.icon + " " + x.module.title + " — " + x.lesson.summary, s: s }); });
    GLOSSARY.forEach(function (g) { var s = score(g.term + " " + (g.aliases || []).join(" ") + " " + g.def); if (s) out.push({ href: "#/glossary?t=" + encodeURIComponent(g.term), title: "📖 " + g.term, sub: g.def.slice(0, 90) + "…", s: s + 1 }); });
    return out.sort(function (a, b) { return b.s - a.s; }).slice(0, 30);
  };

  /* ============ glossary view + inline tooltips ============ */
  var termIndex = [];
  GLOSSARY.forEach(function (g) { [g.term].concat(g.aliases || []).forEach(function (t) { termIndex.push({ t: t, def: g, len: t.length }); }); });
  termIndex.sort(function (a, b) { return b.len - a.len; }); // longest first

  function viewGlossary(sel) {
    var items = GLOSSARY.slice().sort(function (a, b) { return a.term.localeCompare(b.term); });
    var html = head("Glossary", "Every term in the course, defined in plain English. Terms are also underlined inside lessons — hover or tap for a definition.");
    html += '<input id="gloss-filter" class="run-hint" type="search" placeholder="Filter terms…" style="width:100%;max-width:420px;padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--panel2);color:var(--text);margin:0 0 14px" autocomplete="off">';
    html += '<div class="gloss-list">' + items.map(function (g) {
      var see = g.see && QCC.findIdx(g.see) >= 0 ? '<div class="gloss-see"><a href="#/l/' + g.see + '">→ ' + esc(lessonTitle(g.see)) + "</a></div>" : "";
      return '<div class="gloss-item" id="g-' + g.term.replace(/\W+/g, "-") + '" data-term="' + esc(g.term.toLowerCase()) + '"><h3>' + esc(g.term) + "</h3><p>" + esc(g.def) + "</p>" + see + "</div>";
    }).join("") + "</div>";
    QCC.setContent(page(html), "Glossary", { view: "glossary" });
    var filter = document.getElementById("gloss-filter");
    if (filter) filter.addEventListener("input", function () {
      var q = filter.value.toLowerCase();
      document.querySelectorAll(".gloss-item").forEach(function (el) { el.style.display = el.dataset.term.indexOf(q) >= 0 || el.textContent.toLowerCase().indexOf(q) >= 0 ? "" : "none"; });
    });
    if (sel) { var t = document.getElementById("g-" + sel.replace(/\W+/g, "-")); if (t) { t.scrollIntoView({ block: "center" }); t.style.borderColor = "var(--acc)"; } }
  }

  /* tooltip runtime: mark first occurrence of each term in a rendered lesson */
  function markTerms(root) {
    var body = root.querySelector(".lesson-body"); if (!body) return;
    var used = {};
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        if (!p || p.closest("code,pre,a,.katex,h1,h2,h3,figcaption,.term")) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.trim().length > 3 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = []; var nn; while ((nn = walker.nextNode())) nodes.push(nn);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      for (var i = 0; i < termIndex.length; i++) {
        var ti = termIndex[i]; if (used[ti.def.term]) continue;
        var re = new RegExp("\\b(" + ti.t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b");
        var m = re.exec(text);
        if (m) {
          used[ti.def.term] = true;
          var span = document.createElement("span");
          span.className = "term"; span.setAttribute("tabindex", "0"); span.setAttribute("role", "button");
          span.setAttribute("aria-label", ti.def.term + ": " + ti.def.def);
          span.dataset.def = ti.def.def; span.dataset.term = ti.def.term; span.dataset.see = ti.def.see || "";
          span.textContent = m[1];
          var after = node.splitText(m.index); after.nodeValue = after.nodeValue.slice(m[1].length);
          node.parentNode.insertBefore(span, after);
          return; // one term per text node keeps it light
        }
      }
    });
  }
  var pop;
  function showPop(el) {
    hidePop();
    pop = document.createElement("div"); pop.className = "gloss-pop";
    var see = el.dataset.see && QCC.findIdx(el.dataset.see) >= 0 ? ' <a href="#/l/' + el.dataset.see + '">more →</a>' : "";
    pop.innerHTML = "<b>" + esc(el.dataset.term) + ".</b> " + esc(el.dataset.def) + see;
    document.body.appendChild(pop);
    var r = el.getBoundingClientRect();
    var top = r.bottom + window.scrollY + 6, left = Math.min(r.left + window.scrollX, window.innerWidth - 320);
    pop.style.top = top + "px"; pop.style.left = Math.max(8, left) + "px";
  }
  function hidePop() { if (pop) { pop.remove(); pop = null; } }
  document.addEventListener("mouseover", function (e) { var t = e.target.closest && e.target.closest(".term"); if (t) showPop(t); });
  document.addEventListener("mouseout", function (e) { if (e.target.closest && e.target.closest(".term") && !(pop && pop.matches(":hover"))) setTimeout(function () { if (!(pop && pop.matches(":hover"))) hidePop(); }, 120); });
  document.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest(".term"); if (t && !e.target.closest("a")) { e.preventDefault(); showPop(t); } else if (!e.target.closest(".gloss-pop")) hidePop(); });
  document.addEventListener("focusin", function (e) { var t = e.target.closest && e.target.closest(".term"); if (t) showPop(t); });
  window.addEventListener("scroll", hidePop, { passive: true });

  /* ============ flashcards ============ */
  function viewFlashcards(lessonId) {
    var deck = lessonId ? (DECKS[lessonId] || []) : ALL_CARDS;
    if (!deck.length) { QCC.setContent(page(head("Flashcards", "No cards for this lesson.") + '<a class="btn" href="#/flashcards">All flashcards</a>'), "Flashcards", {}); return; }
    var order = shuffle(deck, deck.length), idx = 0;
    var sub = lessonId ? "Cards from “" + lessonTitle(lessonId) + "”. Click the card to flip; grade yourself to feed the review hub." : "Every key point in the course as a flashcard. Click to flip.";
    QCC.setContent(page(head("Flashcards", sub) + '<div class="fc-stage" id="fc-stage"></div>'), "Flashcards", { view: "flashcards" });
    render();
    function render() {
      var c = order[idx];
      var stage = document.getElementById("fc-stage");
      stage.innerHTML =
        '<div class="flashcard" id="the-card" tabindex="0" role="button" aria-label="Flashcard, click to flip"><div class="fc-inner">' +
        '<div class="fc-face fc-front">' + md2html(c.front) + "</div>" +
        '<div class="fc-face fc-back">' + md2html(c.back) + "</div></div></div>" +
        '<div class="fc-controls"><button class="btn" id="fc-again" type="button">↺ Missed</button>' +
        '<button class="btn" id="fc-flip" type="button">Flip</button>' +
        '<button class="btn primary" id="fc-got" type="button">Got it ✓ →</button></div>' +
        '<div class="fc-progress">Card ' + (idx + 1) + " / " + order.length + ' · <a href="#/l/' + c.lesson + '">open lesson</a></div>';
      var card = document.getElementById("the-card");
      var flip = function () { card.classList.toggle("flipped"); };
      card.onclick = flip; document.getElementById("fc-flip").onclick = flip;
      card.onkeydown = function (e) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } };
      document.getElementById("fc-got").onclick = function () { grade(c, true); next(); };
      document.getElementById("fc-again").onclick = function () { grade(c, false); next(); };
    }
    function next() { idx = (idx + 1) % order.length; if (idx === 0) order = shuffle(deck, Date.now() & 0xffff); render(); }
  }

  /* ============ spaced repetition (Leitner, 3 boxes) ============ */
  function leitner() { return store.read("qcc-leitner", {}); }
  function grade(card, correct) {
    var L = leitner(); var cur = L[card.id] || { box: 1, seen: 0 };
    cur.box = correct ? Math.min(3, cur.box + 1) : 1; cur.seen = (cur.seen || 0) + 1; cur.last = Date.now();
    L[card.id] = cur; store.write("qcc-leitner", L);
  }
  function viewReview() {
    var L = leitner(); var boxes = [0, 0, 0];
    ALL_CARDS.forEach(function (c) { var b = (L[c.id] && L[c.id].box) || 1; boxes[b - 1]++; });
    var due = boxes[0] + boxes[1]; // boxes 1 & 2 are "due" more often than 3
    var html = head("Spaced-repetition review", "Cards you recall correctly move up a box; misses reset to box 1. Review the low boxes first — that is where forgetting lives.");
    html += '<div class="leitner">' +
      '<div class="box due"><b>' + boxes[0] + '</b><span>Box 1 · learning</span></div>' +
      '<div class="box"><b>' + boxes[1] + '</b><span>Box 2 · familiar</span></div>' +
      '<div class="box"><b>' + boxes[2] + '</b><span>Box 3 · mastered</span></div></div>';
    html += '<div class="fc-controls"><button class="btn primary" id="rv-start" type="button">▶ Review ' + Math.max(1, due) + ' due card' + (due === 1 ? "" : "s") + "</button>" +
      '<button class="btn" id="rv-reset" type="button">Reset progress</button></div>';
    QCC.setContent(page(html), "Review", { view: "review" });
    document.getElementById("rv-start").onclick = startReview;
    document.getElementById("rv-reset").onclick = function () { if (confirm("Reset all review progress?")) { store.write("qcc-leitner", {}); viewReview(); } };
  }
  function startReview() {
    var L = leitner();
    var queue = ALL_CARDS.map(function (c) { return { c: c, box: (L[c.id] && L[c.id].box) || 1 }; })
      .sort(function (a, b) { return a.box - b.box; }).slice(0, 20).map(function (x) { return x.c; });
    if (!queue.length) queue = ALL_CARDS.slice(0, 20);
    var idx = 0;
    QCC.setContent(page(head("Review session", "Recall the answer, flip, then grade honestly.") + '<div class="fc-stage" id="fc-stage"></div>'), "Review", {});
    render();
    function render() {
      if (idx >= queue.length) {
        document.getElementById("fc-stage").innerHTML = '<div class="box" style="text-align:center;padding:30px"><b>✓</b><span>Session complete — ' + queue.length + ' cards reviewed.</span><div style="margin-top:14px"><a class="btn primary" href="#/review">Back to review hub</a></div></div>';
        return;
      }
      var c = queue[idx], stage = document.getElementById("fc-stage");
      stage.innerHTML = '<div class="flashcard" id="the-card" tabindex="0" role="button"><div class="fc-inner">' +
        '<div class="fc-face fc-front">' + md2html(c.front) + "</div><div class=\"fc-face fc-back\">" + md2html(c.back) + "</div></div></div>" +
        '<div class="fc-controls"><button class="btn" id="rv-miss" type="button">↺ Missed</button><button class="btn" id="rv-flip" type="button">Flip</button><button class="btn primary" id="rv-got" type="button">Got it ✓</button></div>' +
        '<div class="fc-progress">' + (idx + 1) + " / " + queue.length + "</div>";
      var card = document.getElementById("the-card"), flip = function () { card.classList.toggle("flipped"); };
      card.onclick = flip; document.getElementById("rv-flip").onclick = flip;
      document.getElementById("rv-got").onclick = function () { grade(c, true); idx++; render(); };
      document.getElementById("rv-miss").onclick = function () { grade(c, false); idx++; render(); };
    }
  }

  /* ============ cheat sheets (per module) ============ */
  function viewCheat(modId) {
    if (!modId) {
      var html = head("Cheat sheets", "Condensed key points for each module — perfect for a last-minute review.");
      html += '<div class="tool-grid">' + COURSE.modules.map(function (m) { return '<a class="tool-tile" href="#/cheatsheets/' + m.id + '"><span class="tool-ic">' + m.icon + '</span><span class="tool-tx"><b>' + esc(m.title) + "</b><span>" + m.lessons.length + " lessons</span></span></a>"; }).join("") + "</div>";
      QCC.setContent(page(html), "Cheat sheets", { view: "cheat" }); return;
    }
    var mod = COURSE.modules.find(function (m) { return m.id === modId; }); if (!mod) { viewCheat(); return; }
    var html = head(mod.icon + " " + mod.title + " — cheat sheet", "The essential takeaways from every lesson in this module.");
    mod.lessons.forEach(function (l) {
      var deck = DECKS[l.id] || [];
      html += '<div class="cheat"><h3><a href="#/l/' + l.id + '">' + esc(l.title) + "</a></h3><ul>" +
        deck.map(function (c) { return "<li>" + md2html(c.back) + "</li>"; }).join("") + "</ul></div>";
    });
    QCC.setContent(page(html), mod.title + " cheat sheet", { view: "cheat" });
  }

  /* ============ interview bank ============ */
  function viewInterview(filter) {
    var diffs = ["all", "easy", "medium", "hard"];
    var html = head("Interview question bank", "Real quantum-computing interview questions with model answers, sorted by difficulty. Click a question to reveal the answer.");
    html += '<div class="chip-row">' + diffs.map(function (d) { return '<button class="chip' + ((filter || "all") === d ? " active" : "") + '" data-d="' + d + '" type="button">' + d[0].toUpperCase() + d.slice(1) + "</button>"; }).join("") + "</div>";
    var list = INTERVIEW.filter(function (q) { return !filter || filter === "all" || q.d === filter; });
    html += list.map(function (q, i) {
      var see = q.see && QCC.findIdx(q.see) >= 0 ? ' · <a href="#/l/' + q.see + '">lesson →</a>' : "";
      return '<div class="iv-item"><div class="iv-q" tabindex="0" role="button" aria-expanded="false"><span class="iv-diff ' + q.d + '">' + q.d + '</span><span>' + esc(q.q) + '</span></div><div class="iv-a" hidden>' + md2html(q.a) + see + "</div></div>";
    }).join("");
    QCC.setContent(page(html), "Interview bank", { view: "interview" });
    document.querySelectorAll(".chip").forEach(function (c) { c.onclick = function () { location.hash = "#/interview/" + c.dataset.d; }; });
    document.querySelectorAll(".iv-q").forEach(function (q) {
      var toggle = function () { var a = q.nextElementSibling, open = a.hidden; a.hidden = !open; q.setAttribute("aria-expanded", open ? "true" : "false"); };
      q.onclick = toggle; q.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } };
    });
  }

  /* ============ job-readiness exam (sampled from lesson quizzes) ============ */
  var QUIZ_POOL = [];
  Object.keys(CONTENT).forEach(function (id) {
    var re = /```quiz[ \t]*\n([\s\S]*?)\n```/g, m;
    while ((m = re.exec(CONTENT[id]))) { try { var q = JSON.parse(m[1]); q.lesson = id; QUIZ_POOL.push(q); } catch (e) {} }
  });
  function viewExam() {
    var N = 15, pool = shuffle(QUIZ_POOL, (Date.now() / 60000) | 0).slice(0, N);
    var answered = {}, submitted = false;
    var html = head("Job-readiness exam", N + " questions sampled across the whole course. Answer all, then submit for your score. A pass is 80%+.");
    html += pool.map(function (q, i) {
      return '<div class="exam-q" data-i="' + i + '"><div class="q">' + (i + 1) + ". " + QCC.renderRich(q.q) + "</div>" +
        q.options.map(function (o, j) { return '<button class="exam-opt" data-i="' + i + '" data-j="' + j + '" type="button">' + QCC.renderRich(o) + "</button>"; }).join("") + "</div>";
    }).join("");
    html += '<div class="fc-controls"><button class="btn primary" id="exam-submit" type="button">Submit exam</button></div><div id="exam-result"></div>';
    QCC.setContent(page(html), "Readiness exam", { view: "exam" });
    document.querySelectorAll(".exam-opt").forEach(function (b) {
      b.onclick = function () { if (submitted) return; var qi = b.dataset.i; document.querySelectorAll('.exam-opt[data-i="' + qi + '"]').forEach(function (x) { x.classList.remove("sel"); }); b.classList.add("sel"); answered[qi] = +b.dataset.j; };
    });
    document.getElementById("exam-submit").onclick = function () {
      submitted = true; var correct = 0;
      pool.forEach(function (q, i) {
        document.querySelectorAll('.exam-opt[data-i="' + i + '"]').forEach(function (x) {
          var j = +x.dataset.j; if (j === q.answer) x.classList.add("correct"); else if (answered[i] === j) x.classList.add("wrong"); x.disabled = true;
        });
        if (answered[i] === q.answer) correct++;
      });
      var pct = Math.round(100 * correct / pool.length);
      var best = Math.max(pct, store.read("qcc-exam-best", 0)); store.write("qcc-exam-best", best);
      document.getElementById("exam-result").innerHTML = '<div class="exam-score"><b>' + pct + '%</b>' + correct + " / " + pool.length + (pct >= 80 ? " — pass ✓ You're interview-ready on these." : " — keep studying; aim for 80%+.") + '<div class="muted" style="font-size:.9rem;margin-top:6px">Best: ' + best + "%</div></div>";
      document.getElementById("exam-result").scrollIntoView({ behavior: "smooth", block: "center" });
    };
  }

  /* ============ concept map (SVG) ============ */
  function viewMap() {
    var W = 900, rowH = 92, pad = 40, n = COURSE.modules.length, H = pad * 2 + (n - 1) * rowH + 40;
    var cx = W / 2, svg = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Concept map of the course modules in dependency order" xmlns="http://www.w3.org/2000/svg">';
    svg += '<defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c5cff"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs>';
    // connecting spine
    svg += '<line x1="' + cx + '" y1="' + pad + '" x2="' + cx + '" y2="' + (pad + (n - 1) * rowH) + '" stroke="#2b3448" stroke-width="3"/>';
    COURSE.modules.forEach(function (m, i) {
      var y = pad + i * rowH, w = 520, x = cx - w / 2;
      svg += '<circle cx="' + cx + '" cy="' + y + '" r="7" fill="url(#mg)"/>';
      svg += '<rect x="' + x + '" y="' + (y + 12) + '" width="' + w + '" height="56" rx="10" fill="#161b28" stroke="#2b3448"/>';
      svg += '<text x="' + (x + 16) + '" y="' + (y + 36) + '" font-family="Segoe UI,system-ui,sans-serif" font-size="15" font-weight="700" fill="#e6eaf2">' + esc(m.icon + " " + m.title) + "</text>";
      svg += '<text x="' + (x + 16) + '" y="' + (y + 56) + '" font-family="Segoe UI,system-ui,sans-serif" font-size="11" fill="#9aa5b8">' + esc(m.lessons.length + " lessons — " + m.blurb.slice(0, 70)) + "</text>";
      svg += '<a href="#/l/' + m.lessons[0].id + '"><rect x="' + x + '" y="' + (y + 12) + '" width="' + w + '" height="56" fill="transparent"/></a>';
    });
    svg += "</svg>";
    var html = head("Concept map", "The whole curriculum in dependency order — each module builds on the ones above. Click a module to jump in.");
    html += '<div class="map-wrap">' + svg + "</div>";
    QCC.setContent(page(html), "Concept map", { view: "map" });
  }

  /* ============ read-aloud ============ */
  var speaking = false;
  function readAloud(btn) {
    if (!("speechSynthesis" in window)) { btn.textContent = "🔇 not supported"; return; }
    if (speaking) { window.speechSynthesis.cancel(); speaking = false; btn.classList.remove("on"); btn.textContent = "🔊 Read aloud"; return; }
    var body = document.querySelector(".lesson-body"); if (!body) return;
    var text = "";
    body.querySelectorAll("p,h2,h3,li").forEach(function (el) { if (!el.closest("pre,code,.solution")) text += el.textContent + ". "; });
    text = text.replace(/\s+/g, " ").slice(0, 8000);
    var u = new SpeechSynthesisUtterance(text); u.rate = 1.0; u.pitch = 1.0;
    u.onend = function () { speaking = false; btn.classList.remove("on"); btn.textContent = "🔊 Read aloud"; };
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    speaking = true; btn.classList.add("on"); btn.textContent = "⏸ Stop reading";
  }
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-readaloud]"); if (b) { e.preventDefault(); readAloud(b); } });
  window.addEventListener("hashchange", function () { if (speaking && "speechSynthesis" in window) { window.speechSynthesis.cancel(); speaking = false; } });

  /* ============ render hook: mark glossary terms in lessons ============ */
  QCC.onRender(function (root, ctx) { if (ctx && ctx.view === "lesson") markTerms(root); });

  /* ============ routes ============ */
  QCC.registerRoute(function (h) {
    var m;
    if ((m = h.match(/^#\/glossary(?:\?t=(.+))?$/))) { viewGlossary(m[1] ? decodeURIComponent(m[1]) : null); return true; }
    if ((m = h.match(/^#\/flashcards\/([\w-]+)$/))) { viewFlashcards(m[1]); return true; }
    if (h === "#/flashcards") { viewFlashcards(null); return true; }
    if (h === "#/review") { viewReview(); return true; }
    if ((m = h.match(/^#\/cheatsheets\/([\w-]+)$/))) { viewCheat(m[1]); return true; }
    if (h === "#/cheatsheets") { viewCheat(null); return true; }
    if ((m = h.match(/^#\/interview\/(\w+)$/))) { viewInterview(m[1]); return true; }
    if (h === "#/interview") { viewInterview(null); return true; }
    if (h === "#/exam") { viewExam(); return true; }
    if (h === "#/map") { viewMap(); return true; }
    return false;
  });
});
