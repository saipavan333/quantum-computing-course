/* widgets.js — interactive, animated in-lesson widgets (playbook §3, §4, §5.2, §5.6).
   A live Bloch sphere (apply gates, watch the vector rotate) and a two-path
   interference explorer. Injected after the lesson body on the relevant lessons.
   Canvas-bounded (nothing draws off-canvas); honors prefers-reduced-motion. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WIDGETS = { bloch: "bloch", evolution: "interference", "single-gates": "bloch" };

  /* ---------- Bloch sphere ---------- */
  function blochWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Live Bloch sphere — apply gates and watch the state move</div>' +
      '<canvas class="widget-canvas" width="440" height="300" aria-label="Interactive Bloch sphere showing the current qubit state"></canvas>' +
      '<div class="widget-controls">' +
      ["H", "X", "Y", "Z", "S", "T"].map(function (g) { return '<button class="wbtn" data-g="' + g + '" type="button">' + g + "</button>"; }).join("") +
      '<button class="wbtn reset" data-g="R" type="button">Reset |0⟩</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var v = [0, 0, 1]; // Bloch vector, start |0>
    function apply(g) {
      var x = v[0], y = v[1], z = v[2], nv;
      if (g === "X") nv = [x, -y, -z];
      else if (g === "Y") nv = [-x, y, -z];
      else if (g === "Z") nv = [-x, -y, z];
      else if (g === "H") nv = [z, -y, x];
      else if (g === "S") nv = [-y, x, z];
      else if (g === "T") { var c = Math.cos(Math.PI / 4), s = Math.sin(Math.PI / 4); nv = [c * x - s * y, s * x + c * y, z]; }
      else nv = [0, 0, 1];
      animateTo(nv);
    }
    var anim = null;
    function animateTo(target) {
      if (anim) cancelAnimationFrame(anim);
      if (reduce) { v = norm(target); draw(); return; }
      var start = v.slice(), t0 = performance.now(), dur = 420;
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        v = norm([start[0] + (target[0] - start[0]) * e, start[1] + (target[1] - start[1]) * e, start[2] + (target[2] - start[2]) * e]);
        draw(); if (k < 1) anim = requestAnimationFrame(step);
      })(t0);
    }
    function norm(a) { var n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; }
    function proj(p) { var cx = 150, cy = 150, R = 110; return [cx + R * p[0] + R * 0.34 * p[1], cy - R * p[2] + R * 0.2 * p[1]]; }
    function draw() {
      ctx.clearRect(0, 0, 440, 300);
      var cx = 150, cy = 150, R = 110;
      // sphere
      ctx.strokeStyle = "#2b3448"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#232a3a"; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * 0.32, 0, 0, 7); ctx.stroke();
      // axes
      ctx.strokeStyle = "#232a3a"; ctx.beginPath();
      var zt = proj([0, 0, 1.15]), zb = proj([0, 0, -1.15]), xr = proj([1.15, 0, 0]), yr = proj([0, 1.15, 0]);
      ctx.moveTo(zt[0], zt[1]); ctx.lineTo(zb[0], zb[1]); ctx.moveTo(cx, cy); ctx.lineTo(xr[0], xr[1]); ctx.moveTo(cx, cy); ctx.lineTo(yr[0], yr[1]); ctx.stroke();
      ctx.fillStyle = "#6b7688"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("|0⟩", zt[0], zt[1] - 4); ctx.fillText("|1⟩", zb[0], zb[1] + 12);
      // vector
      var tip = proj(v);
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
      ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(tip[0], tip[1], 5, 0, 7); ctx.fill();
      var p0 = (1 + v[2]) / 2;
      read.innerHTML = "P(0) = <b>" + p0.toFixed(3) + "</b> &nbsp; P(1) = <b>" + (1 - p0).toFixed(3) + "</b> &nbsp;·&nbsp; Bloch (x,y,z) = (" + v.map(function (c) { return c.toFixed(2); }).join(", ") + ")";
    }
    host.querySelectorAll(".wbtn").forEach(function (b) { b.onclick = function () { apply(b.dataset.g); }; });
    draw();
  }

  /* ---------- interference explorer ---------- */
  function interferenceWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Two-path interference — drag the phase and watch probability</div>' +
      '<canvas class="widget-canvas" width="440" height="240" aria-label="Two phasors summing, with the resulting detection probability"></canvas>' +
      '<div class="widget-controls"><label for="phi-slide">relative phase φ</label>' +
      '<input id="phi-slide" type="range" min="0" max="628" value="0" style="flex:1"></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read"), slide = host.querySelector("#phi-slide");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    function draw() {
      var phi = slide.value / 100;
      ctx.clearRect(0, 0, 440, 240);
      var cx = 120, cy = 120, R = 80;
      // unit circle + two phasors (1 and e^{iφ}) and their sum
      ctx.strokeStyle = "#232a3a"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      function arrow(ang, col, scale) { var ex = cx + R * scale * Math.cos(ang), ey = cy - R * scale * Math.sin(ang); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, 7); ctx.fill(); return [ex, ey]; }
      arrow(0, "#7c5cff", 1);
      arrow(phi, "#fbbf24", 1);
      // sum = 1 + e^{iφ}
      var sx = 1 + Math.cos(phi), sy = Math.sin(phi), sang = Math.atan2(sy, sx), smag = Math.hypot(sx, sy) / 2;
      ctx.strokeStyle = "#34d399"; ctx.lineWidth = 3.4; var e = arrow(sang, "#34d399", smag);
      ctx.fillStyle = "#6b7688"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("1", cx + R + 4, cy + 4); ctx.fillText("sum", e[0] + 6, e[1]);
      // probability bar
      var p = Math.pow(Math.cos(phi / 2), 2);
      var bx = 280, by = 40, bw = 120, bh = 150;
      ctx.strokeStyle = "#2b3448"; ctx.strokeRect(bx, by, bw, bh);
      ctx.fillStyle = "#34d399"; ctx.fillRect(bx, by + bh * (1 - p), bw, bh * p);
      ctx.fillStyle = "#e6eaf2"; ctx.font = "13px Segoe UI, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("p(detect) = " + p.toFixed(3), bx + bw / 2, by - 8);
      read.innerHTML = "φ = <b>" + phi.toFixed(2) + "</b> rad · p(detect) = |½(1+e<sup>iφ</sup>)|² = cos²(φ/2) = <b>" + p.toFixed(3) + "</b>" + (p > 0.98 ? " (constructive)" : p < 0.02 ? " (destructive)" : "");
    }
    slide.addEventListener("input", draw); draw();
  }

  var BUILDERS = { bloch: blochWidget, interference: interferenceWidget };

  /* inject after the lesson body on relevant lessons */
  QCC.onRender(function (root, ctx) {
    if (!ctx || ctx.view !== "lesson") return;
    var kind = WIDGETS[ctx.id]; if (!kind || !BUILDERS[kind]) return;
    var body = root.querySelector(".lesson-body"); if (!body || body.querySelector(".widget")) return;
    var host = document.createElement("div"); host.className = "widget-host reveal";
    body.appendChild(host); BUILDERS[kind](host);
  });
});
