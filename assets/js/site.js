/* site.js — shared chrome injected from a SINGLE source (playbook §4, §5.6, §5.8):
   - the exact creator byline in the sidebar brand block AND the footer,
   - skip-to-content link behavior + one main landmark (in HTML),
   - page entrance + scroll-reveal, all honoring prefers-reduced-motion,
   - diagram accessibility (role=img + aria-label sourced from the figcaption).
   Registered as a QCC feature so its render hook catches the very first view. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var BYLINE = "Built by U E Sai Pavan Vamshi Krishna";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- byline: sidebar brand block + footer (single source) ---- */
  function bylineHTML(cls) {
    return '<span class="byline ' + cls + '">Built by <span class="byline-name">U E Sai Pavan Vamshi Krishna</span></span>';
  }
  function injectByline() {
    var slot = document.getElementById("brand-byline");
    if (slot && !slot.dataset.done) { slot.innerHTML = bylineHTML("byline-top"); slot.dataset.done = "1"; }
    var foot = document.getElementById("site-footer");
    if (foot && !foot.dataset.done) {
      foot.innerHTML = '<div class="footer-inner"><span class="footer-brand">Quantum Computing: Zero to Professional</span>' +
        bylineHTML("byline-foot") + "</div>";
      foot.dataset.done = "1";
    }
  }

  /* ---- scroll-reveal: reveal .reveal sections as they enter (motion only) ---- */
  var io = null;
  if (!reduce && "IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.02 });
  }
  function wireReveal(root) {
    var els = root.querySelectorAll(".reveal:not(.in)");
    if (reduce || !io) { els.forEach(function (el) { el.classList.add("in"); }); return; }
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- diagram a11y: label inline SVG from its caption ---- */
  function labelDiagrams(root) {
    root.querySelectorAll("figure.diagram-wrap").forEach(function (fig) {
      var svg = fig.querySelector("svg");
      var cap = fig.querySelector("figcaption");
      if (svg && !svg.getAttribute("data-a11y")) {
        svg.setAttribute("role", "img");
        if (cap) svg.setAttribute("aria-label", cap.textContent);
        svg.setAttribute("data-a11y", "1");
      }
    });
  }

  /* run after every view render */
  QCC.onRender(function (contentEl) {
    injectByline();          /* header may be (re)built by app JS; keep it filled */
    wireReveal(contentEl);
    labelDiagrams(contentEl);
  });

  /* fill byline immediately too (sidebar is static HTML, present at boot) */
  injectByline();

  /* page entrance: fade the app in once (opacity only, never shifts fixed els) */
  if (!reduce) {
    document.documentElement.classList.add("preload");
    window.addEventListener("load", function () {
      requestAnimationFrame(function () { document.documentElement.classList.remove("preload"); document.documentElement.classList.add("loaded"); });
    });
    /* safety: never leave the page stuck invisible if load already fired */
    setTimeout(function () { document.documentElement.classList.remove("preload"); document.documentElement.classList.add("loaded"); }, 1200);
  } else {
    document.documentElement.classList.add("loaded");
  }

  /* keyboard: Esc closes the mobile nav */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") document.body.classList.remove("nav-open");
  });
});
