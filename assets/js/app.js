/* Quantum Computing: Zero to Professional — app runtime (core)
   Renders markdown lessons (window.CONTENT) with KaTeX math, highlighted code,
   interactive quizzes, collapsible solutions, SVG diagrams, progress tracking,
   search, and hash routing. Works on file:// and https.

   Exposes a small window.QCC API so feature modules (glossary, flashcards,
   review hub, interview bank, exam, concept map, read-aloud, runnable code,
   assistant, and the shared site chrome) plug in from a single source:
     QCC.registerRoute(fn)     fn(hash) -> true if it handled the route
     QCC.onRender(fn)          fn(contentEl, ctx) after every view renders
     QCC.setContent(html,title[,ctx])  render + fire hooks (single entry point)
     QCC.renderMarkdown, QCC.escapeHtml, QCC.tex, QCC.renderRich
     QCC.COURSE, QCC.CONTENT, QCC.DIAGRAMS, QCC.FLAT, QCC.store,
     QCC.progress, QCC.isDone, QCC.setDone, QCC.findIdx, QCC.go, QCC.back */
(function () {
  "use strict";

  var COURSE = window.COURSE;
  var CONTENT = window.CONTENT || {};
  var DIAGRAMS = window.DIAGRAMS || {};

  var QCC = window.QCC = window.QCC || {};
  var routeHandlers = [];
  var renderHooks = [];
  QCC.registerRoute = function (fn) { routeHandlers.push(fn); };
  QCC.onRender = function (fn) { renderHooks.push(fn); };

  /* ---------------- progress store ---------------- */
  var store = {
    read: function (k, fb) {
      try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }
      catch (e) { return fb; }
    },
    write: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ }
    }
  };
  function progress() { return store.read("qcc-progress", {}); }
  function setDone(id, done) {
    var p = progress();
    if (done) p[id] = true; else delete p[id];
    store.write("qcc-progress", p);
    refreshNav();
  }
  function isDone(id) { return !!progress()[id]; }

  /* ---------------- lesson index ---------------- */
  var FLAT = [];
  COURSE.modules.forEach(function (m) {
    m.lessons.forEach(function (l) { FLAT.push({ module: m, lesson: l }); });
  });
  function findIdx(id) {
    for (var i = 0; i < FLAT.length; i++) if (FLAT[i].lesson.id === id) return i;
    return -1;
  }

  /* ---------------- KaTeX ---------------- */
  var MACROS = {
    "\\ket": "\\left|#1\\right\\rangle",
    "\\bra": "\\left\\langle #1\\right|",
    "\\braket": "\\left\\langle #1\\middle|#2\\right\\rangle",
    "\\norm": "\\left\\lVert #1\\right\\rVert"
  };
  function tex(src, display) {
    try {
      return katex.renderToString(src, {
        displayMode: !!display, throwOnError: false, strict: false, macros: MACROS
      });
    } catch (e) { return '<code>' + escapeHtml(src) + '</code>'; }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function renderRich(s) {
    var parts = [];
    var txt = String(s);
    txt = txt.replace(/\$([^$]+)\$/g, function (_, m) {
      parts.push(tex(m, false)); return "" + (parts.length - 1) + "";
    });
    txt = txt.replace(/`([^`]+)`/g, function (_, m) {
      parts.push("<code>" + escapeHtml(m) + "</code>"); return "" + (parts.length - 1) + "";
    });
    txt = escapeHtml(txt).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    return txt.replace(/(\d+)/g, function (_, i) { return parts[+i]; });
  }

  /* ---------------- markdown pipeline ---------------- */
  var blockStore, blockId;
  function stash(html, isBlock) {
    var key = "QQB" + (blockId++) + "QQ";
    blockStore[key] = { html: html, block: isBlock };
    return isBlock ? "\n\n" + key + "\n\n" : key;
  }
  function renderMarkdown(md) {
    blockStore = {}; blockId = 0;
    var src = String(md).replace(/\r\n/g, "\n");
    /* solution blocks (4 backticks) */
    src = src.replace(/^````solution[ \t]*\n([\s\S]*?)\n````[ \t]*$/gm, function (_, body) {
      return stash('<details class="solution"><summary>Show solution</summary><div class="sol-body">' +
        renderMarkdownInner(body) + "</div></details>", true);
    });
    /* runnable python blocks (```run) — enhanced by runner.js if present */
    src = src.replace(/^```run(?:-([\w-]+))?[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm, function (_, kind, code) {
      var enc = encodeURIComponent(code);
      return stash('<div class="run-block" data-kind="' + (kind || "py") + '" data-code="' + enc + '">' +
        '<pre><code class="hljs language-python">' + highlightPy(code) + "</code></pre>" +
        '<div class="run-bar"><button class="run-btn" type="button">▶ Run</button>' +
        '<span class="run-hint">in-browser Python</span></div>' +
        '<div class="run-out" hidden></div></div>', true);
    });
    /* quiz blocks */
    src = src.replace(/^```quiz[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm, function (_, body) {
      var q;
      try { q = JSON.parse(body); }
      catch (e) { return stash('<div class="quiz"><b>⚠ quiz block failed to parse</b></div>', true); }
      var opts = q.options.map(function (o, i) {
        return '<button class="opt" data-i="' + i + '" type="button">' + renderRich(o) + "</button>";
      }).join("");
      return stash('<div class="quiz" role="group" aria-label="Quiz question" data-answer="' + q.answer +
        '"><div class="q">' + renderRich(q.q) + "</div>" + opts +
        '<div class="why">' + renderRich(q.why) + "</div></div>", true);
    });
    return renderMarkdownInner(src);
  }
  function highlightPy(code) {
    if (window.hljs && hljs.getLanguage("python")) {
      try { return hljs.highlight(code, { language: "python" }).value; } catch (e) {}
    }
    return escapeHtml(code);
  }
  function renderMarkdownInner(src) {
    src = src.replace(/^@@diagram:([\w-]+)(?:\|(.*))?$/gm, function (_, key, cap) {
      var svg = DIAGRAMS[key];
      var body = svg ? svg : '<div class="warn-box">diagram "' + escapeHtml(key) + '" missing</div>';
      var capId = "cap-" + key + "-" + (blockId);
      var caption = cap ? '<figcaption class="diagram-cap" id="' + capId + '">' + escapeHtml(cap) + "</figcaption>" : "";
      return stash('<figure class="diagram-wrap" data-cap="' + capId + '">' + body + caption + "</figure>", true);
    });
    src = src.replace(/^```([\w+-]*)[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm, function (_, lang, code) {
      var html;
      if (lang && window.hljs && hljs.getLanguage(lang)) {
        try { html = hljs.highlight(code, { language: lang }).value; }
        catch (e) { html = escapeHtml(code); }
      } else html = escapeHtml(code);
      return stash("<pre><code class=\"hljs\">" + html + "</code></pre>", true);
    });
    src = src.replace(/`([^`\n]+)`/g, function (_, code) {
      return stash("<code>" + escapeHtml(code) + "</code>", false);
    });
    src = src.replace(/\$\$([\s\S]+?)\$\$/g, function (_, m) { return stash(tex(m, true), true); });
    src = src.replace(/\$([^$\n]+?)\$/g, function (_, m) { return stash(tex(m, false), false); });
    var html = marked.parse(src);
    html = html.replace(/<p>(QQB\d+QQ)<\/p>/g, function (_, key) { return blockStore[key] ? blockStore[key].html : key; });
    html = html.replace(/QQB\d+QQ/g, function (key) { return blockStore[key] ? blockStore[key].html : key; });
    return html;
  }

  /* ---------------- content entry point + render hooks ---------------- */
  var content = document.getElementById("content");
  function setContent(html, title, ctx) {
    content.innerHTML = html;
    if (title) document.title = title + " — " + COURSE.title;
    ctx = ctx || {};
    renderHooks.forEach(function (fn) { try { fn(content, ctx); } catch (e) { console.warn("render hook", e); } });
    window.scrollTo(0, 0);
    content.focus({ preventScroll: true });
  }
  QCC.setContent = setContent;

  /* ---------------- views ---------------- */
  function totalMins() { var t = 0; FLAT.forEach(function (x) { t += x.lesson.mins || 0; }); return t; }

  function viewHome() {
    var p = progress();
    var doneCount = FLAT.filter(function (x) { return p[x.lesson.id]; }).length;
    var next = FLAT.find(function (x) { return !p[x.lesson.id]; }) || FLAT[0];
    var last = store.read("qcc-last", null);
    var cont = (last && !isDone(last)) ? last : next.lesson.id;
    var resume = (last && findIdx(last) >= 0)
      ? '<a class="cta ghost" href="#/l/' + last + '">↩ Resume: ' + escapeHtml(lessonById(last).title) + "</a>" : "";

    var html =
      '<div class="page"><div class="hero reveal">' +
      "<h1>" + COURSE.title + "</h1>" +
      '<p class="tag">' + COURSE.tagline + "</p>" +
      '<div class="hero-cta"><a class="cta" href="#/l/' + cont + '">' +
      (doneCount ? "Continue learning →" : "Start from zero →") + "</a>" + resume + "</div>" +
      '<div class="stats">' +
      "<div class='stat'><b>" + COURSE.modules.length + "</b><span>modules</span></div>" +
      "<div class='stat'><b>" + FLAT.length + "</b><span>deep lessons</span></div>" +
      "<div class='stat'><b>~" + Math.round(totalMins() / 60) + "h</b><span>guided study</span></div>" +
      "<div class='stat'><b>" + doneCount + "/" + FLAT.length + "</b><span>completed</span></div>" +
      "</div></div>";

    /* study-tools launcher (features register their tiles here) */
    html += '<div class="tool-grid reveal">' + toolTiles() + "</div>";

    COURSE.modules.forEach(function (m) {
      var done = m.lessons.filter(function (l) { return p[l.id]; }).length;
      var pct = m.lessons.length ? Math.round(100 * done / m.lessons.length) : 0;
      html += '<div class="module-card reveal"><h3><span class="m-ic" aria-hidden="true">' + m.icon + "</span>" + m.title +
        '<span class="m-frac">' + done + "/" + m.lessons.length + "</span></h3>" +
        '<div class="blurb">' + m.blurb + "</div>" +
        '<div class="mc-bar"><div class="mc-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="mc-lessons">' +
        m.lessons.map(function (l) {
          return '<a class="mc-lesson' + (p[l.id] ? " done" : "") + '" href="#/l/' + l.id + '">' +
            '<span class="tick" aria-hidden="true">' + (p[l.id] ? "✓" : "○") + "</span><span>" + l.title +
            '</span><span class="mins">' + l.mins + "m</span></a>";
        }).join("") + "</div></div>";
    });
    html += "</div>";
    setContent(html, null, { view: "home" });
    document.title = COURSE.title;
  }

  /* feature modules push {href,label,icon,desc} here before boot */
  QCC.tools = QCC.tools || [];
  function toolTiles() {
    return QCC.tools.map(function (t) {
      return '<a class="tool-tile" href="' + t.href + '"><span class="tool-ic" aria-hidden="true">' +
        t.icon + '</span><span class="tool-tx"><b>' + escapeHtml(t.label) + "</b><span>" +
        escapeHtml(t.desc) + "</span></span></a>";
    }).join("");
  }
  function lessonById(id) { var i = findIdx(id); return i >= 0 ? FLAT[i].lesson : { title: id }; }

  function viewLesson(id) {
    var idx = findIdx(id);
    if (idx < 0) { viewHome(); return; }
    var m = FLAT[idx].module, l = FLAT[idx].lesson;
    var md = CONTENT[id];
    store.write("qcc-last", id);
    if (md) md = md.replace(/^#\s+.*(\r?\n)+/, "");
    var body = md ? renderMarkdown(md) :
      "<p>⚠ This lesson's content file has not been compiled yet. Run <code>node tools/build.js</code>.</p>";
    var prev = idx > 0 ? FLAT[idx - 1] : null;
    var next = idx < FLAT.length - 1 ? FLAT[idx + 1] : null;
    var prereq = l.prereq ? '<div class="prereq"><b>Prerequisite:</b> ' + escapeHtml(l.prereq) + "</div>" : "";

    var html =
      '<article class="page">' +
      '<div class="crumb"><a href="#/">Course</a> · <span>' + m.icon + " " + escapeHtml(m.title) + "</span></div>" +
      '<div class="lesson-head reveal"><h1>' + escapeHtml(l.title) + "</h1>" +
      '<div class="lesson-meta"><span>⏱ ~' + l.mins + " min</span>" +
      '<button class="btn readaloud-btn" type="button" data-readaloud aria-label="Read this lesson aloud">🔊 Read aloud</button>' +
      '<button class="btn mark-btn' + (isDone(id) ? " done" : "") + '" type="button" data-id="' + id + '">' +
      (isDone(id) ? "✓ Completed" : "Mark complete") + "</button></div>" + prereq + "</div>" +
      '<div class="lesson-body">' + body + "</div>" +
      '<div class="done-row"><button class="btn primary big-done" type="button" data-id="' + id + '">' +
      (next ? "Mark complete & continue →" : "Mark complete 🎉") + "</button>" +
      '<a class="btn" href="#/flashcards/' + id + '">🃏 Flashcards for this lesson</a></div>' +
      '<nav class="pager" aria-label="Lesson navigation">' +
      (prev ? '<a href="#/l/' + prev.lesson.id + '"><span class="dir">← Previous</span>' + escapeHtml(prev.lesson.title) + "</a>" : "<span class='pager-empty'></span>") +
      (next ? '<a class="next" href="#/l/' + next.lesson.id + '"><span class="dir">Next →</span>' + escapeHtml(next.lesson.title) + "</a>" : "<span class='pager-empty'></span>") +
      "</nav></article>";

    setContent(html, l.title, { view: "lesson", id: id, lesson: l, module: m });
    refreshNav();
  }

  var ABOUT_MD = [
    "# About this course",
    "",
    "**Quantum Computing: Zero to Professional** is a complete, self-contained curriculum: " +
    "school math → linear algebra → Python → quantum mechanics → Qiskit on real hardware → " +
    "algorithms → error correction → getting hired. Content was verified against the July 2026 " +
    "ecosystem (Qiskit 2.x, IBM Quantum Platform Open Plan).",
    "",
    "## How to study",
    "1. Go **in order** — every lesson builds on the previous ones.",
    "2. Type every code example yourself; better yet, run it in-browser with the ▶ Run buttons.",
    "3. Do the exercises **before** opening the solutions; wrestle first.",
    "4. Use the flashcards and the spaced-repetition **Review hub** to retain what you learn.",
    "5. One lesson a day beats seven on Sunday. Consistency compounds.",
    "",
    "## Study tools",
    "This course ships a **glossary** with hover definitions, **flashcards**, a **spaced-repetition " +
    "review hub**, per-module **cheat sheets**, an **interview question bank**, a **job-readiness exam**, " +
    "an **interactive concept map**, **read-aloud**, in-browser **runnable code**, and a free **AI study " +
    "assistant** — all reachable from the home page and the sidebar.",
    "",
    "## Your progress",
    "Progress, review decks, and exam results are stored in your browser (localStorage). They survive " +
    "restarts on the same browser/machine, but do not sync across devices.",
    "",
    "## Use it as a desktop app / on the web",
    "Double-click `QuantumCourse.bat` (Windows) to open it offline, or host it free on GitHub Pages — see " +
    "`DEPLOY.md`. Hosted over https it installs as an app and caches for offline use.",
    "",
    "## Extend the course",
    "`MASTER_PROMPT.md` holds the exact lesson-generation prompt. Lesson sources are Markdown in `lessons/`; " +
    "run `node tools/build.js` after editing, then `node tools/qa.js` to re-check the whole site."
  ].join("\n");
  function viewAbout() { setContent('<div class="page about lesson-body reveal">' + renderMarkdown(ABOUT_MD) + "</div>", "About", { view: "about" }); }

  function viewSearch(q) {
    var res = QCC.search ? QCC.search(q) : basicSearch(q);
    var html = '<div class="page"><h1>Search: “' + escapeHtml(q) + '”</h1>' +
      '<p class="muted">' + res.length + " result(s)</p>";
    if (!res.length) html += '<p class="muted">No matches. Try the <a href="#/glossary">glossary</a> or the <a href="#/assistant">AI assistant</a>.</p>';
    res.forEach(function (x) {
      html += '<a class="search-hit" href="' + x.href + '"><b>' + escapeHtml(x.title) + "</b><span>" +
        escapeHtml(x.sub) + "</span></a>";
    });
    html += "</div>";
    setContent(html, "Search", { view: "search" });
  }
  function basicSearch(q) {
    var n = q.toLowerCase();
    return FLAT.filter(function (x) {
      return (x.lesson.title + " " + x.lesson.summary + " " + x.module.title).toLowerCase().indexOf(n) >= 0;
    }).map(function (x) {
      return { href: "#/l/" + x.lesson.id, title: x.lesson.title, sub: x.module.icon + " " + x.module.title + " — " + x.lesson.summary };
    });
  }

  /* ---------------- sidebar ---------------- */
  var navBox = document.getElementById("nav-modules");
  function buildNav() {
    var html = '<a class="nav-tool" href="#/">🏠 <span>Home</span></a>';
    COURSE.modules.forEach(function (m) {
      html += '<div class="nav-module" id="nav-' + m.id + '">' +
        '<button class="nav-module-head" type="button" data-m="' + m.id + '" aria-expanded="false"><span class="m-icon" aria-hidden="true">' + m.icon +
        "</span><span>" + m.title + '</span><span class="m-count" id="cnt-' + m.id + '"></span></button>' +
        '<div class="nav-lessons">' +
        m.lessons.map(function (l) {
          return '<a class="nav-lesson" id="navl-' + l.id + '" href="#/l/' + l.id + '">' +
            '<span class="tick" aria-hidden="true">○</span><span>' + l.title + "</span></a>";
        }).join("") + "</div></div>";
    });
    navBox.innerHTML = html;
  }
  function refreshNav() {
    var p = progress(), doneTotal = 0;
    COURSE.modules.forEach(function (m) {
      var done = 0;
      m.lessons.forEach(function (l) {
        var el = document.getElementById("navl-" + l.id);
        var d = !!p[l.id]; if (d) { done++; doneTotal++; }
        if (el) { el.classList.toggle("done", d); el.querySelector(".tick").textContent = d ? "✓" : "○"; }
      });
      var cnt = document.getElementById("cnt-" + m.id);
      if (cnt) { cnt.textContent = done + "/" + m.lessons.length; cnt.classList.toggle("done", done === m.lessons.length); }
    });
    var pct = FLAT.length ? Math.round(100 * doneTotal / FLAT.length) : 0;
    var f = document.getElementById("overall-fill"), lab = document.getElementById("overall-label");
    if (f) f.style.width = pct + "%"; if (lab) lab.textContent = pct + "%";
    document.querySelectorAll(".nav-lesson.active").forEach(function (e) { e.classList.remove("active"); });
    var mtc = (location.hash || "").match(/^#\/l\/([\w-]+)/);
    if (mtc) {
      var act = document.getElementById("navl-" + mtc[1]);
      if (act) { act.classList.add("active"); var mod = act.closest(".nav-module"); if (mod) { mod.classList.add("open"); var hd = mod.querySelector(".nav-module-head"); if (hd) hd.setAttribute("aria-expanded", "true"); } }
    }
  }

  /* ---------------- events ---------------- */
  document.addEventListener("click", function (ev) {
    var t = ev.target;
    var head = t.closest ? t.closest(".nav-module-head") : null;
    if (head) { var open = head.parentElement.classList.toggle("open"); head.setAttribute("aria-expanded", open ? "true" : "false"); return; }

    var opt = t.closest ? t.closest(".quiz .opt") : null;
    if (opt && !opt.disabled) {
      var quiz = opt.closest(".quiz");
      var ans = +quiz.getAttribute("data-answer"), picked = +opt.getAttribute("data-i");
      quiz.querySelectorAll(".opt").forEach(function (b, i) { b.disabled = true; if (i === ans) b.classList.add("correct"); });
      if (picked !== ans) opt.classList.add("wrong");
      var why = quiz.querySelector(".why");
      why.innerHTML = (picked === ans ? "<b>Correct.</b> " : "<b>Not quite.</b> ") + why.innerHTML;
      why.classList.add("show");
      return;
    }
    var mark = t.closest ? t.closest(".mark-btn") : null;
    if (mark) {
      var id = mark.getAttribute("data-id"), now = !isDone(id);
      setDone(id, now); mark.classList.toggle("done", now);
      mark.textContent = now ? "✓ Completed" : "Mark complete"; return;
    }
    var big = t.closest ? t.closest(".big-done") : null;
    if (big) {
      var bid = big.getAttribute("data-id"); setDone(bid, true);
      var i = findIdx(bid);
      if (i >= 0 && i < FLAT.length - 1) location.hash = "#/l/" + FLAT[i + 1].lesson.id; else viewLesson(bid);
      return;
    }
    if (t.id === "scrim") document.body.classList.remove("nav-open");
    var navl = t.closest ? t.closest(".nav-lesson, .nav-tool") : null;
    if (navl && window.innerWidth <= 960) document.body.classList.remove("nav-open");
  });

  var menuToggle = document.getElementById("menu-toggle");
  if (menuToggle) menuToggle.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  var searchBox = document.getElementById("search");
  var searchTimer = null;
  if (searchBox) searchBox.addEventListener("input", function () {
    clearTimeout(searchTimer);
    var q = searchBox.value.trim();
    searchTimer = setTimeout(function () { if (q.length >= 2) location.hash = "#/search/" + encodeURIComponent(q); else if ((location.hash || "").indexOf("#/search") === 0) location.hash = "#/"; }, 220);
  });

  /* ---------------- navigation trail (reliable Back) ---------------- */
  var trail = [];
  QCC.go = function (hash) { location.hash = hash; };
  QCC.back = function () {
    if (trail.length > 1) { trail.pop(); var prev = trail[trail.length - 1]; history.length > 1 ? history.back() : (location.hash = prev); }
    else location.hash = "#/";
  };

  /* ---------------- router ---------------- */
  function route() {
    var h = location.hash || "#/";
    if (trail[trail.length - 1] !== h) trail.push(h);
    if (trail.length > 50) trail.shift();
    /* feature routes first */
    for (var i = 0; i < routeHandlers.length; i++) { if (routeHandlers[i](h)) { refreshNav(); return; } }
    var m = h.match(/^#\/l\/([\w-]+)/);
    if (m) { viewLesson(m[1]); return; }
    if (h.indexOf("#/search/") === 0) { viewSearch(decodeURIComponent(h.slice(9))); refreshNav(); return; }
    if (h === "#/about") { viewAbout(); refreshNav(); return; }
    viewHome(); refreshNav();
  }
  window.addEventListener("hashchange", route);

  /* ---------------- service worker (hosted only) ---------------- */
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost"))
    navigator.serviceWorker.register("sw.js").catch(function () {});

  /* ---------------- expose API ---------------- */
  QCC.COURSE = COURSE; QCC.CONTENT = CONTENT; QCC.DIAGRAMS = DIAGRAMS; QCC.FLAT = FLAT;
  QCC.store = store; QCC.progress = progress; QCC.isDone = isDone; QCC.setDone = setDone;
  QCC.findIdx = findIdx; QCC.lessonById = lessonById;
  QCC.renderMarkdown = renderMarkdown; QCC.renderMarkdownInner = renderMarkdownInner;
  QCC.escapeHtml = escapeHtml; QCC.tex = tex; QCC.renderRich = renderRich; QCC.refreshNav = refreshNav;
  QCC.route = route;

  /* ---------------- boot ---------------- */
  buildNav();
  /* let feature modules register routes/tools synchronously before first route */
  (window.QCC_FEATURES || []).forEach(function (init) { try { init(QCC); } catch (e) { console.warn("feature init", e); } });
  route();
})();
