/* legible.js — phone legibility for lesson diagrams (pass-2 review, Nov 2026).
 * The course draws its diagrams 560-760 units wide. On a 390 px phone they shrink to about
 * 0.55x and labels fall to 5-6 px. For each SVG in the page: if any label would render under
 * FLOOR px, first try raising the small labels to FLOOR in place, but only when that moves no
 * label out of its box, onto another label or out of the picture. If it would, keep the
 * drawing as drawn and let it scroll sideways (a .qc-scroll swipe box) at the width where its
 * smallest label is FLOOR px. Re-runs when a page renders, when an interactive redraws its
 * picture and when the window resizes. Desktop widths are untouched (nothing there is under
 * the floor). tools/qa-browser.js fails any label under FLOOR px at 390 px.
 */
(function () {
  "use strict";
  var FLOOR = 9;
  function restore(t) {
    if (t.dataset.fs0 == null) return;
    t.style.fontSize = t.dataset.fs0;
    delete t.dataset.fs0;
  }
  function legible(svg) {
    var vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width || !svg.isConnected) return;
    var texts = Array.prototype.filter.call(svg.querySelectorAll("text"), function (t) { return t.textContent.trim(); });
    texts.forEach(restore);
    var wrap = svg.parentNode && svg.parentNode.classList && svg.parentNode.classList.contains("qc-scroll") ? svg.parentNode : null;
    if (wrap) { svg.style.minWidth = ""; wrap.classList.remove("qc-scrolling"); }
    var R = svg.getBoundingClientRect();
    if (!R.width || !texts.length) return;
    var scale = Math.min(R.width / vb.width, R.height / vb.height);
    var need = FLOOR / scale;
    var fs = function (t) { return parseFloat(getComputedStyle(t).fontSize); };
    var small = texts.filter(function (t) { return fs(t) < need - 0.01; });
    if (!small.length) return;
    var rects = Array.prototype.map.call(svg.querySelectorAll("rect"), function (r) { try { return r.getBBox(); } catch (e) { return null; } })
      .filter(function (b) { return b && b.width > 4 && b.height > 4 && b.width < vb.width * 0.95; });
    var inside = function (a, r) { return a.x >= r.x + 1.5 && a.y >= r.y - 0.5 && a.x + a.width <= r.x + r.width - 1.5 && a.y + a.height <= r.y + r.height + 0.5; };
    var hit = function (a, b) { return Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > 1 && Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > 1; };
    var outOf = function (b) { return b.x < vb.x - 0.5 || b.x + b.width > vb.x + vb.width + 0.5 || b.y < vb.y - 0.5 || b.y + b.height > vb.y + vb.height + 0.5; };
    var bb = function (t) { try { return t.getBBox(); } catch (e) { return { x: 0, y: 0, width: 0, height: 0 }; } };
    var b0 = texts.map(bb);
    small.forEach(function (t) { t.dataset.fs0 = t.style.fontSize || ""; t.style.fontSize = need.toFixed(2) + "px"; });
    var b1 = texts.map(bb);
    var bad = false;
    for (var i = 0; i < texts.length && !bad; i++) {
      if (outOf(b1[i]) && !outOf(b0[i])) bad = true;
      for (var k = 0; k < rects.length && !bad; k++) if (inside(b0[i], rects[k]) && !inside(b1[i], rects[k])) bad = true;
      for (var j = i + 1; j < texts.length && !bad; j++) if (hit(b1[i], b1[j]) && !hit(b0[i], b0[j])) bad = true;
    }
    if (!bad) return;
    // bigger labels would collide: undo, and let the drawing scroll sideways instead
    small.forEach(restore);
    var minFs = Math.min.apply(null, texts.map(fs));
    var box = wrap;
    if (!box) {
      box = document.createElement("div");
      box.className = "qc-scroll";
      svg.parentNode.insertBefore(box, svg);
      box.appendChild(svg);
    }
    box.classList.add("qc-scrolling");
    // width at which the smallest label is FLOOR px (height follows the viewBox ratio)
    var wNeed = Math.ceil((FLOOR / minFs) * vb.width);
    svg.style.minWidth = wNeed + "px";
  }
  var busy = false;
  function all(root) {
    busy = true;
    Array.prototype.forEach.call((root || document.getElementById("content") || document.body).querySelectorAll("svg[viewBox]"), legible);
    busy = false;
  }
  function narrow() { return window.innerWidth < 768; }
  var started = false;
  function start() {
    if (started) return; started = true;
    var root = document.getElementById("content");
    if (!root || !window.MutationObserver) return;
    var pending = new Set(), queued = false, full = false;
    new MutationObserver(function (ms) {
      if (busy) return;
      ms.forEach(function (m) {
        var n = m.target.nodeType === 1 ? m.target : m.target.parentNode;
        if (!n) return;
        var s = n.tagName && n.tagName.toLowerCase() === "svg" ? n : n.closest && n.closest("svg");
        if (s) pending.add(s); else full = true;
      });
      if (queued || (!pending.size && !full)) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        if (!narrow() && !document.querySelector(".qc-scroll")) { pending.clear(); full = false; return; }
        if (full) { full = false; pending.clear(); all(root); return; }
        busy = true; pending.forEach(legible); pending.clear(); busy = false;
      });
    }).observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["viewBox", "font-size"] });
    if (narrow()) all(root);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
  window.addEventListener("load", function () { start(); if (narrow()) all(); });
  var timer = 0;
  window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(function () { all(); }, 150); });
})();
