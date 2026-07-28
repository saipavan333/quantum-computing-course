/* effects.js — site-wide page effects (playbook §5.6), all reduced-motion aware:
   1) a slow animated aurora gradient behind the whole app that drifts on scroll,
   2) a top scroll-progress bar,
   3) staggered entrance for .reveal sections,
   4) magnetic / glowing hover on module & tool cards,
   5) animated count-up on the home-page stats.
   Registered as a QCC feature so its render hook runs after every view. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. aurora background (injected once) ---------- */
  (function aurora() {
    if (document.getElementById("fx-aurora")) return;
    var el = document.createElement("div");
    el.id = "fx-aurora"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<span class="fx-blob b1"></span><span class="fx-blob b2"></span><span class="fx-blob b3"></span>';
    if (document.body.firstChild) document.body.insertBefore(el, document.body.firstChild);
    else document.body.appendChild(el);
  })();

  /* ---------- 2. scroll-progress bar (injected once) ---------- */
  var bar = document.getElementById("fx-progress");
  if (!bar) { bar = document.createElement("div"); bar.id = "fx-progress"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar); }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      var f = Math.min(1, Math.max(0, (window.scrollY || doc.scrollTop) / max));
      bar.style.width = (f * 100).toFixed(2) + "%";
      if (!reduce) document.body.style.setProperty("--fx-scroll", f.toFixed(3));
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 4. magnetic / glow hover on cards (delegated, once) ---------- */
  var CARD_SEL = ".module-card, .tool-tile";
  document.addEventListener("pointermove", function (e) {
    var card = e.target.closest && e.target.closest(CARD_SEL);
    if (!card) return;
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    if (!reduce) {
      card.style.setProperty("--tx", ((px - 0.5) * 6).toFixed(2) + "px");
      card.style.setProperty("--ty", ((py - 0.5) * 6).toFixed(2) + "px");
    }
    card.classList.add("fx-glow");
  }, { passive: true });
  document.addEventListener("pointerout", function (e) {
    var card = e.target.closest && e.target.closest(CARD_SEL);
    if (card && !card.contains(e.relatedTarget)) { card.classList.remove("fx-glow"); card.style.removeProperty("--tx"); card.style.removeProperty("--ty"); }
  }, { passive: true });

  /* ---------- 5. animated stat count-up ---------- */
  function animateNumber(el) {
    if (el.dataset.fxCounted) return;
    el.dataset.fxCounted = "1";
    var full = el.textContent;
    // split into runs of digits vs. everything else, so "~72h" and "0/47" both work
    var parts = full.match(/(\d+|\D+)/g) || [full];
    var nums = parts.map(function (p) { return /^\d+$/.test(p) ? parseInt(p, 10) : null; });
    if (!nums.some(function (n) { return n !== null && n > 0; })) return; // nothing to animate
    if (reduce) return; // leave final text in place
    var dur = 900, t0 = performance.now();
    function tick(now) {
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); // easeOutCubic
      el.textContent = parts.map(function (p, i) { return nums[i] === null ? p : String(Math.round(nums[i] * e)); }).join("");
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 3 + 5. per-render: stagger reveals, wire counters ---------- */
  QCC.onRender(function (root, ctx) {
    // stagger: give each .reveal a small incremental delay so sections cascade in
    if (!reduce) {
      var revs = root.querySelectorAll(".reveal");
      for (var i = 0; i < revs.length; i++) {
        if (!revs[i].style.transitionDelay) revs[i].style.transitionDelay = Math.min(i * 55, 400) + "ms";
      }
    }
    // count up the home stats
    if (ctx && ctx.view === "home") {
      var stats = root.querySelectorAll(".stat b");
      if (stats.length) {
        if ("IntersectionObserver" in window) {
          var io = new IntersectionObserver(function (en) {
            en.forEach(function (x) { if (x.isIntersecting) { animateNumber(x.target); io.unobserve(x.target); } });
          }, { threshold: 0.4 });
          stats.forEach(function (s) { io.observe(s); });
        } else { stats.forEach(animateNumber); }
      }
    }
    onScroll(); // recompute progress after content height changes
  });
});
