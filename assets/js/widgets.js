/* widgets.js — interactive, animated in-lesson widgets (playbook §3, §4, §5.2, §5.6).
   A live Bloch sphere (apply gates, watch the vector rotate), a two-path
   interference explorer, an entangled-pair correlation demo, a two-qubit gate
   circuit visualizer, a Grover amplitude-amplification bar chart, a QFT
   period-peak explorer, and a T1/T2 decoherence curve. Injected after the
   lesson body on the relevant lessons. Canvas-bounded (nothing draws
   off-canvas); honors prefers-reduced-motion. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WIDGETS = {
    bloch: "bloch", evolution: "interference", "single-gates": "bloch",
    entanglement: "entangle", "two-qubit-gates": "twoqubit",
    grover: "grover", qft: "qft", noise: "decoherence",
    trig: "trig", vectors2d: "vectors2d", complex: "complex", euler: "euler", eigen: "eigen",
    probability: "probability", sampling: "sampling", qubit: "qubit", tensor: "tensor",
    protocols: "teleport", "deutsch-jozsa": "dj", qpe: "qpe", shor: "shor", vqe: "vqe", qec: "qec"
  };

  /* ---------- shared bar-chart helper ---------- */
  function drawBars(ctx, x0, y0, w, h, values, opts) {
    opts = opts || {};
    var n = values.length, gap = opts.gap == null ? 6 : opts.gap, bw = (w - gap * (n - 1)) / n;
    var maxAbs = opts.max || Math.max.apply(null, values.map(function (v) { return Math.abs(v); })) || 1;
    for (var i = 0; i < n; i++) {
      var v = values[i], x = x0 + i * (bw + gap);
      var hh = Math.abs(v) / maxAbs * h;
      ctx.fillStyle = (typeof opts.color === "function") ? opts.color(i, v) : (opts.color || "#22d3ee");
      if (opts.negative) {
        var mid = y0 + h / 2;
        ctx.fillRect(x, v >= 0 ? mid - hh : mid, bw, hh);
      } else {
        ctx.fillRect(x, y0 + h - hh, bw, hh);
      }
      if (opts.labels) {
        ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(String(opts.labels[i]), x + bw / 2, y0 + h + 14);
      }
    }
  }

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

  /* ---------- entangled-pair correlation ---------- */
  function entanglementWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Entangled pair — measure both and watch the correlation</div>' +
      '<canvas class="widget-canvas" width="440" height="260" aria-label="Two entangled qubits and a running histogram of their joint measurement outcomes"></canvas>' +
      '<div class="widget-controls">' +
      ["Φ+", "Φ−", "Ψ+", "Ψ−"].map(function (s) { return '<button class="wbtn bstate" data-s="' + s + '" type="button">' + s + "</button>"; }).join("") +
      '<button class="wbtn" data-act="measure" type="button">Measure both</button>' +
      '<button class="wbtn reset" data-act="reset" type="button">Reset counts</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var state = "Φ+", counts = { "00": 0, "01": 0, "10": 0, "11": 0 }, lastA = null, lastB = null, measured = false;
    function setState(s) {
      state = s; measured = false; lastA = lastB = null;
      host.querySelectorAll(".bstate").forEach(function (b) { b.classList.toggle("active", b.dataset.s === s); });
      draw();
    }
    function measure() {
      var same = (state === "Φ+" || state === "Φ−");
      var a = Math.random() < 0.5 ? 0 : 1, b = same ? a : 1 - a;
      lastA = a; lastB = b; measured = true;
      var key = "" + a + b; counts[key] = (counts[key] || 0) + 1;
      draw();
    }
    function reset() { counts = { "00": 0, "01": 0, "10": 0, "11": 0 }; lastA = lastB = null; measured = false; draw(); }
    function qcircle(cx, cy, label, val) {
      ctx.strokeStyle = "#2b3448"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 38, 0, 7); ctx.stroke();
      ctx.fillStyle = val === null ? "#171c28" : (val === 0 ? "#22d3ee" : "#fbbf24");
      ctx.beginPath(); ctx.arc(cx, cy, 32, 0, 7); ctx.fill();
      ctx.fillStyle = "#0b0e16"; ctx.font = "bold 18px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(val === null ? "?" : String(val), cx, cy + 1);
      ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#9aa4bb"; ctx.font = "12px Segoe UI, sans-serif"; ctx.fillText(label, cx, cy + 56);
    }
    function draw() {
      ctx.clearRect(0, 0, 440, 260);
      qcircle(90, 60, "qubit A", measured ? lastA : null);
      qcircle(210, 60, "qubit B", measured ? lastB : null);
      ctx.strokeStyle = "#6b7688"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(128, 60); ctx.lineTo(172, 60); ctx.stroke(); ctx.setLineDash([]);
      var keys = ["00", "01", "10", "11"], total = keys.reduce(function (s, k) { return s + counts[k]; }, 0) || 1;
      var bx = 270, by = 16, bw = 150, bh = 170, gap = 8, bwid = (bw - gap * 3) / 4;
      ctx.strokeStyle = "#2b3448"; ctx.strokeRect(bx, by, bw, bh);
      keys.forEach(function (k, i) {
        var h = bh * (counts[k] / total), x = bx + i * (bwid + gap);
        ctx.fillStyle = (k === "00" || k === "11") ? "#34d399" : "#7c5cff";
        ctx.fillRect(x, by + bh - h, bwid, h);
        ctx.fillStyle = "#6b7688"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(k, x + bwid / 2, by + bh + 14);
        if (counts[k]) ctx.fillText(String(counts[k]), x + bwid / 2, by + bh - h - 4);
      });
      var corr = (state === "Φ+" || state === "Φ−") ? "always match — 00 or 11" : "always differ — 01 or 10";
      read.innerHTML = "State <b>|" + state + "⟩</b> — measured outcomes " + corr + ", never anything else, even though each qubit alone reads 50/50. Runs so far: <b>" + total + "</b>.";
    }
    host.querySelectorAll(".bstate").forEach(function (b) { b.onclick = function () { setState(b.dataset.s); }; });
    host.querySelector('[data-act="measure"]').onclick = measure;
    host.querySelector('[data-act="reset"]').onclick = reset;
    setState(state);
  }

  /* ---------- two-qubit gate circuit ---------- */
  function twoQubitWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Two-qubit gates — set the inputs and watch the wires</div>' +
      '<canvas class="widget-canvas" width="440" height="200" aria-label="A two-wire circuit diagram showing a controlled gate acting on the chosen inputs"></canvas>' +
      '<div class="widget-controls">' +
      ["CNOT", "CZ", "SWAP"].map(function (g) { return '<button class="wbtn gsel" data-g="' + g + '" type="button">' + g + "</button>"; }).join("") +
      '<label>control</label>' + [0, 1].map(function (v) { return '<button class="wbtn csel" data-c="' + v + '" type="button">' + v + "</button>"; }).join("") +
      '<label>target</label>' + [0, 1].map(function (v) { return '<button class="wbtn tsel" data-t="' + v + '" type="button">' + v + "</button>"; }).join("") +
      '</div><div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var gate = "CNOT", c = 0, t = 0;
    function compute() {
      var oc = c, ot = t;
      if (gate === "CNOT") ot = c === 1 ? (1 - t) : t;
      else if (gate === "SWAP") { oc = t; ot = c; }
      return [oc, ot];
    }
    function setActive() {
      host.querySelectorAll(".gsel").forEach(function (b) { b.classList.toggle("active", b.dataset.g === gate); });
      host.querySelectorAll(".csel").forEach(function (b) { b.classList.toggle("active", +b.dataset.c === c); });
      host.querySelectorAll(".tsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.t === t); });
    }
    function draw() {
      ctx.clearRect(0, 0, 440, 200);
      var x0 = 60, x1 = 340, yc = 70, yt = 140, gx = 200;
      ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(x0, yc); ctx.lineTo(x1, yc); ctx.moveTo(x0, yt); ctx.lineTo(x1, yt); ctx.stroke();
      ctx.fillStyle = "#9aa4bb"; ctx.font = "13px Segoe UI, sans-serif"; ctx.textAlign = "right";
      ctx.fillText("control |" + c + "⟩", x0 - 8, yc + 4);
      ctx.fillText("target |" + t + "⟩", x0 - 8, yt + 4);
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, yc); ctx.lineTo(gx, yt); ctx.stroke();
      ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(gx, yc, 7, 0, 7); ctx.fill();
      if (gate === "CNOT") {
        ctx.beginPath(); ctx.arc(gx, yt, 14, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(gx - 14, yt); ctx.lineTo(gx + 14, yt); ctx.moveTo(gx, yt - 14); ctx.lineTo(gx, yt + 14); ctx.stroke();
      } else if (gate === "CZ") {
        ctx.beginPath(); ctx.arc(gx, yt, 7, 0, 7); ctx.fill();
      } else if (gate === "SWAP") {
        ctx.lineWidth = 2.4;
        [yc, yt].forEach(function (cy) { ctx.beginPath(); ctx.moveTo(gx - 9, cy - 9); ctx.lineTo(gx + 9, cy + 9); ctx.moveTo(gx - 9, cy + 9); ctx.lineTo(gx + 9, cy - 9); ctx.stroke(); });
      }
      var out = compute();
      ctx.fillStyle = "#e6eaf2"; ctx.font = "bold 13px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("→ |" + out[0] + out[1] + "⟩", x1 + 10, (yc + yt) / 2 + 4);
      var note = gate === "CZ" ? " (bit values are unchanged; the relative phase flips only when both are |1⟩)" : "";
      read.innerHTML = gate + ": input |" + c + t + "⟩ → output <b>|" + out[0] + out[1] + "⟩</b>" + note + ".";
    }
    host.querySelectorAll(".gsel").forEach(function (b) { b.onclick = function () { gate = b.dataset.g; setActive(); draw(); }; });
    host.querySelectorAll(".csel").forEach(function (b) { b.onclick = function () { c = +b.dataset.c; setActive(); draw(); }; });
    host.querySelectorAll(".tsel").forEach(function (b) { b.onclick = function () { t = +b.dataset.t; setActive(); draw(); }; });
    setActive(); draw();
  }

  /* ---------- Grover amplitude amplification ---------- */
  function groverWidget(host) {
    var N = 8;
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Grover’s search — step the oracle + diffusion and watch amplitudes amplify</div>' +
      '<canvas class="widget-canvas" width="440" height="240" aria-label="Bar chart of amplitudes over eight basis states, with the marked target amplified by each Grover iteration"></canvas>' +
      '<div class="widget-controls"><label for="grover-target">marked item</label><select id="grover-target"></select>' +
      '<button class="wbtn" data-act="step" type="button">Apply oracle + diffusion</button>' +
      '<button class="wbtn reset" data-act="reset" type="button">Reset</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    function pad3(n) { var s = n.toString(2); while (s.length < 3) s = "0" + s; return s; }
    /* populate the <select> with 3-bit binary labels */
    var sel = host.querySelector("#grover-target");
    for (var oi = 0; oi < N; oi++) {
      var opt = document.createElement("option");
      opt.value = String(oi);
      opt.textContent = "|" + pad3(oi) + "⟩";
      sel.appendChild(opt);
    }
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var target = 3, amps, iter;
    function reset() { amps = new Array(N); for (var i = 0; i < N; i++) amps[i] = 1 / Math.sqrt(N); iter = 0; draw(); }
    function step() {
      amps[target] = -amps[target];
      var mean = 0; for (var i = 0; i < N; i++) mean += amps[i]; mean /= N;
      for (var j = 0; j < N; j++) amps[j] = 2 * mean - amps[j];
      iter++; draw();
    }
    function draw() {
      ctx.clearRect(0, 0, 440, 240);
      var bx = 40, bw = (440 - 80) / N, midY = 140, scale = 90;
      ctx.strokeStyle = "#2b3448"; ctx.beginPath(); ctx.moveTo(30, midY); ctx.lineTo(410, midY); ctx.stroke();
      for (var i = 0; i < N; i++) {
        var a = amps[i], h = Math.abs(a) * scale, x = bx + i * bw;
        ctx.fillStyle = i === target ? "#fbbf24" : "#22d3ee";
        ctx.fillRect(x + 3, a >= 0 ? midY - h : midY, bw - 6, h);
        ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(pad3(i), x + bw / 2, a >= 0 ? midY + h + 14 : midY - h - 6);
      }
      var p = amps[target] * amps[target];
      ctx.fillStyle = "#e6eaf2"; ctx.font = "13px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("iteration " + iter + " — P(marked) = " + p.toFixed(3), 30, 18);
      var optimal = Math.max(1, Math.round(Math.PI / 4 * Math.sqrt(N)));
      read.innerHTML = "Marked item <b>|" + pad3(target) + "⟩</b> — after <b>" + iter + "</b> iteration(s), P(marked) = <b>" + p.toFixed(3) + "</b>. Optimal for N=" + N + " is about <b>" + optimal + "</b> iteration(s) — keep clicking past that and watch it fall back down (over-rotation).";
    }
    sel.addEventListener("change", function () { target = +sel.value; reset(); });
    host.querySelector('[data-act="step"]').onclick = step;
    host.querySelector('[data-act="reset"]').onclick = reset;
    target = +sel.value; reset();
  }

  /* ---------- quantum Fourier transform period peaks ---------- */
  function qftWidget(host) {
    var N = 8;
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Quantum Fourier transform — change the period and watch the peaks move</div>' +
      '<canvas class="widget-canvas" width="440" height="280" aria-label="Bar charts of an input comb pattern and its QFT output magnitudes, with peaks at multiples of N over r"></canvas>' +
      '<div class="widget-controls"><label>period r</label>' +
      [1, 2, 4, 8].map(function (r) { return '<button class="wbtn rsel" data-r="' + r + '" type="button">' + r + "</button>"; }).join("") +
      '</div><div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var r = 2;
    function computeOutput() {
      var S = [], j; for (j = 0; j < N; j += r) S.push(j);
      var m = S.length, amp = 1 / Math.sqrt(m), out = new Array(N);
      for (var k = 0; k < N; k++) {
        var re = 0, im = 0;
        for (var si = 0; si < S.length; si++) {
          var ang = 2 * Math.PI * S[si] * k / N;
          re += amp * Math.cos(ang); im += amp * Math.sin(ang);
        }
        re /= Math.sqrt(N); im /= Math.sqrt(N);
        out[k] = Math.hypot(re, im);
      }
      return { S: S, out: out };
    }
    function setActive() { host.querySelectorAll(".rsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.r === r); }); }
    function draw() {
      var res = computeOutput(), S = res.S, out = res.out;
      ctx.clearRect(0, 0, 440, 280);
      var bw = (440 - 80) / N;
      ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("input |j⟩ (period " + r + ")", 30, 14);
      for (var j = 0; j < N; j++) {
        var on = S.indexOf(j) >= 0, x = 40 + j * bw, h = on ? 50 : 4;
        ctx.fillStyle = on ? "#7c5cff" : "#232a3a";
        ctx.fillRect(x + 3, 90 - h, bw - 6, h);
        ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(String(j), x + bw / 2, 104);
      }
      ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("QFT output |k⟩ amplitude magnitude", 30, 150);
      var maxOut = 0; for (var kk = 0; kk < N; kk++) if (out[kk] > maxOut) maxOut = out[kk];
      var peakThresh = maxOut * 0.9;
      for (var k = 0; k < N; k++) {
        var a = out[k], h2 = a * 90, x2 = 40 + k * bw, peak = a > peakThresh;
        ctx.fillStyle = peak ? "#34d399" : "#22d3ee";
        ctx.fillRect(x2 + 3, 260 - h2, bw - 6, h2);
        ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center";
        ctx.fillText(String(k), x2 + bw / 2, 274);
      }
      var m = N / r;
      var peaksList = []; for (var pk = 0; pk < N; pk += m) peaksList.push(pk);
      read.innerHTML = "Input repeats every <b>r=" + r + "</b> step(s) — QFT output peaks at <b>k = " + peaksList.join(", ") + "</b> (multiples of N/r = " + m + "). This is exactly the trick Shor's algorithm uses to read off the period.";
    }
    host.querySelectorAll(".rsel").forEach(function (b) { b.onclick = function () { r = +b.dataset.r; setActive(); draw(); }; });
    setActive(); draw();
  }

  /* ---------- T1/T2 decoherence curves ---------- */
  function decoherenceWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">T₁/T₂ decay — drag the sliders and watch a qubit forget</div>' +
      '<canvas class="widget-canvas" width="440" height="260" aria-label="Exponential decay curves for T1 energy relaxation and T2 dephasing"></canvas>' +
      '<div class="widget-controls"><label for="t1-slide">T₁ (µs)</label>' +
      '<input id="t1-slide" type="range" min="10" max="300" value="120" style="flex:1">' +
      '<label for="t2-slide">T₂ (µs)</label>' +
      '<input id="t2-slide" type="range" min="5" max="300" value="80" style="flex:1"></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    var t1s = host.querySelector("#t1-slide"), t2s = host.querySelector("#t2-slide");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    function draw() {
      var T1 = +t1s.value, T2raw = +t2s.value, T2 = Math.min(T2raw, 2 * T1);
      ctx.clearRect(0, 0, 440, 260);
      var x0 = 50, x1 = 420, y0 = 30, y1 = 220, tmax = 300;
      ctx.strokeStyle = "#2b3448"; ctx.lineWidth = 1.4; ctx.beginPath();
      ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center";
      for (var g = 0; g <= tmax; g += 50) ctx.fillText(String(g), x0 + (g / tmax) * (x1 - x0), y1 + 14);
      ctx.textAlign = "right"; ctx.fillText("1.0", x0 - 6, y0 + 4); ctx.fillText("0.0", x0 - 6, y1 + 4);
      function curve(fn, col) {
        ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath();
        for (var i = 0; i <= 200; i++) {
          var t = (i / 200) * tmax, v = fn(t), px = x0 + (t / tmax) * (x1 - x0), py = y1 - v * (y1 - y0);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      curve(function (t) { return Math.exp(-t / T1); }, "#fbbf24");
      curve(function (t) { return 0.5 * Math.exp(-t / T2); }, "#22d3ee");
      ctx.fillStyle = "#fbbf24"; ctx.textAlign = "left"; ctx.font = "11px Segoe UI, sans-serif"; ctx.fillText("T₁ population e^(−t/T₁)", 270, 44);
      ctx.fillStyle = "#22d3ee"; ctx.fillText("T₂ coherence ½e^(−t/T₂)", 270, 60);
      var gateTime = 0.05, gates = Math.round(T2 / gateTime);
      var clampNote = T2raw > 2 * T1 ? " (clamped from " + T2raw + " µs — T₂ can never exceed 2×T₁)" : "";
      read.innerHTML = "T₁ = <b>" + T1 + " µs</b>, T₂ = <b>" + T2.toFixed(0) + " µs</b>" + clampNote + " — with 50 ns single-qubit gates, about <b>" + gates.toLocaleString() + "</b> gates fit inside T₂ before phase information is lost.";
    }
    t1s.addEventListener("input", draw); t2s.addEventListener("input", draw); draw();
  }

  /* ---------- unit circle (trig) ---------- */
  function trigWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">The unit circle — drag the angle and watch sine &amp; cosine</div>' +
      '<canvas class="widget-canvas" width="440" height="280" aria-label="Unit circle with a point at the given angle and its sine and cosine projections"></canvas>' +
      '<div class="widget-controls"><label for="trig-slide">angle θ</label>' +
      '<input id="trig-slide" type="range" min="0" max="360" value="30" style="flex:1"></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read"), slide = host.querySelector("#trig-slide");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    function draw() {
      var deg = +slide.value, rad = deg * Math.PI / 180;
      var cx = 140, cy = 140, R = 100;
      ctx.clearRect(0, 0, 440, 280);
      ctx.strokeStyle = "#2b3448"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - R - 20, cy); ctx.lineTo(cx + R + 20, cy); ctx.moveTo(cx, cy - R - 20); ctx.lineTo(cx, cy + R + 20); ctx.stroke();
      var px = cx + R * Math.cos(rad), py = cy - R * Math.sin(rad);
      ctx.strokeStyle = "#fbbf24"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, cy); ctx.stroke();
      ctx.strokeStyle = "#34d399"; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(cx, py); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
      ctx.fillStyle = "#e6eaf2"; ctx.font = "12px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("cos θ = " + Math.cos(rad).toFixed(2), 20, 272);
      ctx.fillText("sin θ = " + Math.sin(rad).toFixed(2), 170, 272);
      ctx.fillText("tan θ = " + (Math.abs(Math.cos(rad)) < 0.001 ? "undefined" : Math.tan(rad).toFixed(2)), 320, 272);
      read.innerHTML = "θ = <b>" + deg + "°</b> (" + rad.toFixed(2) + " rad) — point on the unit circle: (<b>" + Math.cos(rad).toFixed(2) + "</b>, <b>" + Math.sin(rad).toFixed(2) + "</b>).";
    }
    slide.addEventListener("input", draw); draw();
  }

  /* ---------- 2D vectors ---------- */
  function vectors2dWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">2D vectors — add them and take the dot product</div>' +
      '<canvas class="widget-canvas" width="440" height="280" aria-label="Two 2D vectors, their sum, and their dot product on a grid"></canvas>' +
      '<div class="widget-controls"><label>u = (</label><input id="ux" type="range" min="-4" max="4" value="3" style="width:70px">' +
      '<input id="uy" type="range" min="-4" max="4" value="1" style="width:70px"><label>)</label>' +
      '<label>v = (</label><input id="vx" type="range" min="-4" max="4" value="-1" style="width:70px">' +
      '<input id="vy" type="range" min="-4" max="4" value="2" style="width:70px"><label>)</label></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var ux = host.querySelector("#ux"), uy = host.querySelector("#uy"), vx = host.querySelector("#vx"), vy = host.querySelector("#vy");
    function draw() {
      var u = [+ux.value, +uy.value], v = [+vx.value, +vy.value], s = [u[0] + v[0], u[1] + v[1]];
      ctx.clearRect(0, 0, 440, 280);
      var cx = 220, cy = 140, scale = 24;
      ctx.strokeStyle = "#1c2233"; ctx.lineWidth = 1;
      for (var g = -8; g <= 8; g++) {
        ctx.beginPath(); ctx.moveTo(cx + g * scale, 10); ctx.lineTo(cx + g * scale, 270); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(10, cy - g * scale); ctx.lineTo(430, cy - g * scale); ctx.stroke();
      }
      ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(10, cy); ctx.lineTo(430, cy); ctx.moveTo(cx, 10); ctx.lineTo(cx, 270); ctx.stroke();
      function arrow(vec, col) {
        var ex = cx + vec[0] * scale, ey = cy - vec[1] * scale;
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(ex, ey, 4, 0, 7); ctx.fill();
      }
      arrow(u, "#22d3ee"); arrow(v, "#fbbf24"); arrow(s, "#34d399");
      var dot = u[0] * v[0] + u[1] * v[1];
      read.innerHTML = "u = (" + u[0] + ", " + u[1] + "), v = (" + v[0] + ", " + v[1] + ") — u+v = (<b>" + s[0] + ", " + s[1] + "</b>) · u·v = <b>" + dot + "</b>" + (dot === 0 ? " (perpendicular!)" : "");
    }
    [ux, uy, vx, vy].forEach(function (el) { el.addEventListener("input", draw); });
    draw();
  }

  /* ---------- complex plane ---------- */
  function complexWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">The complex plane — drag a &amp; b and watch z = a + bi</div>' +
      '<canvas class="widget-canvas" width="440" height="280" aria-label="A point on the complex plane with its modulus and argument"></canvas>' +
      '<div class="widget-controls"><label for="cx-a">a (real)</label>' +
      '<input id="cx-a" type="range" min="-4" max="4" step="0.1" value="3" style="flex:1">' +
      '<label for="cx-b">b (imag)</label>' +
      '<input id="cx-b" type="range" min="-4" max="4" step="0.1" value="2" style="flex:1"></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var A = host.querySelector("#cx-a"), B = host.querySelector("#cx-b");
    function draw() {
      var a = +A.value, b = +B.value;
      ctx.clearRect(0, 0, 440, 280);
      var cx = 220, cy = 140, scale = 26;
      ctx.strokeStyle = "#1c2233";
      for (var g = -4; g <= 4; g++) {
        ctx.beginPath(); ctx.moveTo(cx + g * scale, 20); ctx.lineTo(cx + g * scale, 260); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20, cy - g * scale); ctx.lineTo(420, cy - g * scale); ctx.stroke();
      }
      ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(420, cy); ctx.moveTo(cx, 20); ctx.lineTo(cx, 260); ctx.stroke();
      ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif"; ctx.fillText("Re", 405, cy - 6); ctx.fillText("Im", cx + 6, 30);
      var px = cx + a * scale, py = cy - b * scale;
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
      var r = Math.hypot(a, b), theta = Math.atan2(b, a);
      read.innerHTML = "z = <b>" + a.toFixed(1) + " + " + b.toFixed(1) + "i</b> — |z| = <b>" + r.toFixed(2) + "</b>, arg(z) = <b>" + theta.toFixed(2) + "</b> rad";
    }
    A.addEventListener("input", draw); B.addEventListener("input", draw); draw();
  }

  /* ---------- Euler's formula phasor ---------- */
  function eulerWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Euler’s formula — e<sup>iθ</sup> = cos θ + i sin θ</div>' +
      '<canvas class="widget-canvas" width="440" height="260" aria-label="A rotating phasor on the unit circle illustrating Euler’s formula"></canvas>' +
      '<div class="widget-controls"><label for="euler-slide">θ (radians)</label>' +
      '<input id="euler-slide" type="range" min="0" max="628" value="0" style="flex:1"></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read"), slide = host.querySelector("#euler-slide");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    function draw() {
      var theta = slide.value / 100;
      ctx.clearRect(0, 0, 440, 260);
      var cx = 130, cy = 130, R = 95;
      ctx.strokeStyle = "#2b3448"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      var px = cx + R * Math.cos(theta), py = cy - R * Math.sin(theta);
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();
      ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(px, py, 5, 0, 7); ctx.fill();
      drawBars(ctx, 280, 30, 130, 170, [Math.cos(theta), Math.sin(theta)], { max: 1, negative: true, labels: ["cos θ", "sin θ"], color: function (i) { return i === 0 ? "#fbbf24" : "#34d399"; } });
      read.innerHTML = "e<sup>i" + theta.toFixed(2) + "</sup> = <b>" + Math.cos(theta).toFixed(2) + "</b> + <b>" + Math.sin(theta).toFixed(2) + "i</b> — always on the unit circle, since cos²θ + sin²θ = 1.";
    }
    slide.addEventListener("input", draw); draw();
  }

  /* ---------- eigenvectors ---------- */
  function eigenWidget(host) {
    var MATS = {
      "Scale": { m: [[2, 0], [0, 0.5]], note: "eigenvectors along the axes; eigenvalues 2 and 0.5" },
      "Shear": { m: [[1, 1], [0, 1]], note: "one real eigen-direction (the x-axis); this is a shear" },
      "Rotate 90°": { m: [[0, -1], [1, 0]], note: "no real eigenvectors — every vector rotates, none stay on their own line" }
    };
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Eigenvectors — which arrows don’t change direction?</div>' +
      '<canvas class="widget-canvas" width="440" height="260" aria-label="A ring of sample vectors before and after a matrix transformation, with eigenvector directions highlighted if real"></canvas>' +
      '<div class="widget-controls">' + Object.keys(MATS).map(function (k) { return '<button class="wbtn msel" data-k="' + k + '" type="button">' + k + "</button>"; }).join("") + '</div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var key = "Scale";
    function setActive() { host.querySelectorAll(".msel").forEach(function (b) { b.classList.toggle("active", b.dataset.k === key); }); }
    function eigen2x2(m) {
      var a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
      var tr = a + d, det = a * d - b * c, disc = tr * tr - 4 * det;
      if (disc < 0) return [];
      var s = Math.sqrt(disc), l1 = (tr + s) / 2, l2 = (tr - s) / 2, out = [];
      [l1, l2].forEach(function (lam) {
        var vx, vy;
        if (Math.abs(b) > 1e-9) { vx = b; vy = lam - a; }
        else if (Math.abs(c) > 1e-9) { vx = lam - d; vy = c; }
        else { vx = 1; vy = 0; }
        var n = Math.hypot(vx, vy) || 1;
        out.push({ lam: lam, v: [vx / n, vy / n] });
      });
      return out;
    }
    function draw() {
      var m = MATS[key].m, R0 = 45;
      ctx.clearRect(0, 0, 440, 260);
      var cx = 220, cy = 130;
      ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(10, cy); ctx.lineTo(430, cy); ctx.moveTo(cx, 10); ctx.lineTo(cx, 250); ctx.stroke();
      for (var ang = 0; ang < 360; ang += 30) {
        var v = [Math.cos(ang * Math.PI / 180), Math.sin(ang * Math.PI / 180)];
        var tv = [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] * v[0] + m[1][1] * v[1]];
        ctx.strokeStyle = "#3a435899"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + v[0] * R0, cy - v[1] * R0); ctx.stroke();
        ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + tv[0] * R0, cy - tv[1] * R0); ctx.stroke();
      }
      var eigs = eigen2x2(m);
      eigs.forEach(function (e) {
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx - e.v[0] * 90, cy + e.v[1] * 90); ctx.lineTo(cx + e.v[0] * 90, cy - e.v[1] * 90); ctx.stroke();
      });
      read.innerHTML = "Matrix: [[" + m[0][0] + ", " + m[0][1] + "], [" + m[1][0] + ", " + m[1][1] + "]] — " + MATS[key].note + (eigs.length ? " (eigenvector directions shown in gold)" : "");
    }
    host.querySelectorAll(".msel").forEach(function (b) { b.onclick = function () { key = b.dataset.k; setActive(); draw(); }; });
    setActive(); draw();
  }

  /* ---------- probability: dice histogram ---------- */
  function probabilityWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Rolling dice — empirical frequency vs. theoretical probability</div>' +
      '<canvas class="widget-canvas" width="440" height="260" aria-label="Histogram of die roll outcomes compared to the theoretical uniform distribution"></canvas>' +
      '<div class="widget-controls"><button class="wbtn" data-n="1" type="button">Roll ×1</button>' +
      '<button class="wbtn" data-n="50" type="button">Roll ×50</button>' +
      '<button class="wbtn reset" data-n="reset" type="button">Reset</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var counts = [0, 0, 0, 0, 0, 0], total = 0;
    function roll(n) {
      if (n === "reset") { counts = [0, 0, 0, 0, 0, 0]; total = 0; draw(); return; }
      for (var i = 0; i < n; i++) { counts[Math.floor(Math.random() * 6)]++; total++; }
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, 440, 260);
      var freqs = counts.map(function (c) { return total ? c / total : 0; });
      var mx = Math.max(0.3, Math.max.apply(null, freqs));
      drawBars(ctx, 30, 20, 380, 180, freqs, { max: mx, labels: [1, 2, 3, 4, 5, 6], color: "#22d3ee" });
      var theoY = 20 + 180 * (1 - (1 / 6) / mx);
      ctx.strokeStyle = "#fbbf24"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(30, theoY); ctx.lineTo(410, theoY); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#fbbf24"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "left"; ctx.fillText("theoretical 1/6 ≈ 0.167", 34, theoY - 6);
      read.innerHTML = total ? ("After <b>" + total + "</b> rolls: " + counts.map(function (c, i) { return (i + 1) + "→" + c; }).join(", ") + ". More rolls pull the bars toward the theoretical line.") : "Roll the die to build up a frequency histogram.";
    }
    host.querySelectorAll(".wbtn").forEach(function (b) { b.onclick = function () { roll(b.dataset.n === "reset" ? "reset" : +b.dataset.n); }; });
    draw();
  }

  /* ---------- sampling convergence ---------- */
  function samplingWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Sampling &amp; shots — why more measurements narrow the estimate</div>' +
      '<canvas class="widget-canvas" width="440" height="240" aria-label="Running average of a biased coin converging to its true probability as shots increase"></canvas>' +
      '<div class="widget-controls"><label for="p-slide">true P(heads)</label>' +
      '<input id="p-slide" type="range" min="0" max="100" value="70" style="flex:1">' +
      '<button class="wbtn" data-act="run" type="button">Flip 200 more</button>' +
      '<button class="wbtn reset" data-act="reset" type="button">Reset</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read"), slide = host.querySelector("#p-slide");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var history = [], heads = 0, n = 0;
    function flip(count) {
      var p = +slide.value / 100;
      for (var i = 0; i < count; i++) { n++; if (Math.random() < p) heads++; history.push(heads / n); }
      draw();
    }
    function reset() { history = []; heads = 0; n = 0; draw(); }
    function draw() {
      ctx.clearRect(0, 0, 440, 240);
      var x0 = 40, x1 = 420, y0 = 20, y1 = 190, p = +slide.value / 100;
      ctx.strokeStyle = "#2b3448"; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "right";
      ctx.fillText("1.0", x0 - 6, y0 + 4); ctx.fillText("0.0", x0 - 6, y1 + 4);
      var trueY = y1 - p * (y1 - y0);
      ctx.strokeStyle = "#fbbf24"; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x0, trueY); ctx.lineTo(x1, trueY); ctx.stroke(); ctx.setLineDash([]);
      if (history.length > 1) {
        ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2; ctx.beginPath();
        history.forEach(function (v, i) {
          var px = x0 + (i / (history.length - 1)) * (x1 - x0), py = y1 - v * (y1 - y0);
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
      read.innerHTML = n ? ("After <b>" + n + "</b> shots: running average = <b>" + (heads / n).toFixed(3) + "</b> (true value " + p.toFixed(2) + "). More shots → the estimate settles down.") : "Flip to see how the running average converges to the true probability.";
    }
    slide.addEventListener("input", draw);
    host.querySelector('[data-act="run"]').onclick = function () { flip(200); };
    host.querySelector('[data-act="reset"]').onclick = reset;
    draw();
  }

  /* ---------- qubit amplitude / Born rule ---------- */
  function qubitWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">The qubit state vector — amplitude vs. probability (Born rule)</div>' +
      '<canvas class="widget-canvas" width="440" height="220" aria-label="Bar chart of amplitude alpha and beta and the resulting probabilities via the Born rule"></canvas>' +
      '<div class="widget-controls"><label for="alpha-slide">amplitude α (of |0⟩)</label>' +
      '<input id="alpha-slide" type="range" min="0" max="100" value="70" style="flex:1"></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read"), slide = host.querySelector("#alpha-slide");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    function draw() {
      var alpha = +slide.value / 100, beta = Math.sqrt(Math.max(0, 1 - alpha * alpha));
      ctx.clearRect(0, 0, 440, 220);
      ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("amplitudes", 30, 14);
      drawBars(ctx, 30, 24, 170, 90, [alpha, beta], { max: 1, labels: ["α", "β"], color: "#7c5cff" });
      ctx.fillText("probabilities  P = |amplitude|²", 250, 14);
      drawBars(ctx, 250, 24, 160, 90, [alpha * alpha, beta * beta], { max: 1, labels: ["P(0)", "P(1)"], color: "#34d399" });
      read.innerHTML = "|ψ⟩ = <b>" + alpha.toFixed(2) + "</b>|0⟩ + <b>" + beta.toFixed(2) + "</b>|1⟩ — P(0) = <b>" + (alpha * alpha).toFixed(2) + "</b>, P(1) = <b>" + (beta * beta).toFixed(2) + "</b> (they sum to 1, since α² + β² = 1).";
    }
    slide.addEventListener("input", draw); draw();
  }

  /* ---------- tensor product builder ---------- */
  function tensorWidget(host) {
    var STATES = { "|0⟩": [1, 0], "|1⟩": [0, 1], "|+⟩": [1 / Math.SQRT2, 1 / Math.SQRT2] };
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Tensor products — combine two qubits into one joint state</div>' +
      '<canvas class="widget-canvas" width="440" height="220" aria-label="Bar chart of the four amplitudes of the combined two-qubit state"></canvas>' +
      '<div class="widget-controls"><label>qubit A</label>' + Object.keys(STATES).map(function (k) { return '<button class="wbtn asel" data-k="' + k + '" type="button">' + k + "</button>"; }).join("") +
      '<label>qubit B</label>' + Object.keys(STATES).map(function (k) { return '<button class="wbtn bsel" data-k="' + k + '" type="button">' + k + "</button>"; }).join("") +
      '</div><div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var aKey = "|0⟩", bKey = "|+⟩";
    function setActive() {
      host.querySelectorAll(".asel").forEach(function (b) { b.classList.toggle("active", b.dataset.k === aKey); });
      host.querySelectorAll(".bsel").forEach(function (b) { b.classList.toggle("active", b.dataset.k === bKey); });
    }
    function draw() {
      var a = STATES[aKey], b = STATES[bKey];
      var joint = [a[0] * b[0], a[0] * b[1], a[1] * b[0], a[1] * b[1]];
      ctx.clearRect(0, 0, 440, 220);
      drawBars(ctx, 30, 20, 380, 140, joint, { max: 1, negative: true, labels: ["00", "01", "10", "11"], color: "#7c5cff" });
      read.innerHTML = aKey + " ⊗ " + bKey + " = <b>" + joint.map(function (x) { return x.toFixed(2); }).join(", ") + "</b> over |00⟩,|01⟩,|10⟩,|11⟩.";
    }
    host.querySelectorAll(".asel").forEach(function (b) { b.onclick = function () { aKey = b.dataset.k; setActive(); draw(); }; });
    host.querySelectorAll(".bsel").forEach(function (b) { b.onclick = function () { bKey = b.dataset.k; setActive(); draw(); }; });
    setActive(); draw();
  }

  /* ---------- teleportation step-through ---------- */
  function teleportWidget(host) {
    var STEPS = [
      "Alice and Bob share an entangled pair (qubits 2 &amp; 3) prepared in a Bell state.",
      "Alice has the unknown state to send on qubit 1. She entangles qubit 1 with her half of the pair (qubit 2).",
      "Alice measures qubits 1 &amp; 2, getting one of four random classical outcomes (00, 01, 10, 11).",
      "Alice sends those 2 classical bits to Bob over an ordinary channel — the only thing that travels.",
      "Bob applies a correction gate (chosen by the 2 bits) to qubit 3 — it now holds the original state exactly."
    ];
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Quantum teleportation — step through the protocol</div>' +
      '<canvas class="widget-canvas" width="440" height="200" aria-label="Three qubit wires showing the teleportation protocol at the current step"></canvas>' +
      '<div class="widget-controls"><button class="wbtn" data-act="prev" type="button">← Back</button>' +
      '<button class="wbtn" data-act="next" type="button">Next step →</button>' +
      '<button class="wbtn reset" data-act="reset" type="button">Restart</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var step = 0;
    function draw() {
      ctx.clearRect(0, 0, 440, 200);
      var wires = [50, 100, 150], labels = ["q1 (Alice)", "q2 (Alice)", "q3 (Bob)"];
      wires.forEach(function (y, i) {
        ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(100, y); ctx.lineTo(400, y); ctx.stroke();
        ctx.fillStyle = "#9aa4bb"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "right";
        ctx.fillText(labels[i], 96, y + 3);
      });
      if (step >= 1) { ctx.strokeStyle = "#22d3ee"; ctx.beginPath(); ctx.moveTo(150, 100); ctx.lineTo(150, 150); ctx.stroke(); ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(150, 100, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(150, 150, 5, 0, 7); ctx.fill(); }
      if (step >= 2) { ctx.strokeStyle = "#fbbf24"; ctx.beginPath(); ctx.moveTo(220, 50); ctx.lineTo(220, 100); ctx.stroke(); ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(220, 50, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(220, 100, 5, 0, 7); ctx.fill(); }
      if (step >= 3) { ctx.fillStyle = "#e6eaf2"; ctx.font = "bold 13px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("00/01/10/11 →", 300, 40); }
      if (step >= 4) { ctx.strokeStyle = "#34d399"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(350, 150, 12, 0, 7); ctx.stroke(); ctx.fillStyle = "#34d399"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ψ", 350, 154); }
      read.innerHTML = "<b>Step " + (step + 1) + " / " + STEPS.length + ":</b> " + STEPS[step];
    }
    host.querySelector('[data-act="next"]').onclick = function () { step = Math.min(STEPS.length - 1, step + 1); draw(); };
    host.querySelector('[data-act="prev"]').onclick = function () { step = Math.max(0, step - 1); draw(); };
    host.querySelector('[data-act="reset"]').onclick = function () { step = 0; draw(); };
    draw();
  }

  /* ---------- Deutsch-Jozsa oracle ---------- */
  function djWidget(host) {
    var TYPES = { "Constant-0": true, "Constant-1": true, "Balanced": false };
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Deutsch–Jozsa — one query, constant or balanced?</div>' +
      '<canvas class="widget-canvas" width="440" height="200" aria-label="Bar chart of the single-query measurement outcome for the chosen oracle type"></canvas>' +
      '<div class="widget-controls"><label>oracle</label>' + Object.keys(TYPES).map(function (k) { return '<button class="wbtn osel" data-k="' + k + '" type="button">' + k + "</button>"; }).join("") +
      '<button class="wbtn" data-act="query" type="button">Run 1 query</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var key = "Balanced", ran = false;
    function setActive() { host.querySelectorAll(".osel").forEach(function (b) { b.classList.toggle("active", b.dataset.k === key); }); }
    function draw() {
      ctx.clearRect(0, 0, 440, 200);
      var isConstant = key.indexOf("Constant") === 0;
      var result = ran ? (isConstant ? [1, 0] : [0, 1]) : [0.5, 0.5];
      drawBars(ctx, 60, 20, 320, 130, result, { max: 1, labels: ["all-zeros (constant)", "non-zero (balanced)"], color: function (i) { return i === 0 ? "#34d399" : "#fbbf24"; } });
      read.innerHTML = ran
        ? ("Oracle: <b>" + key + "</b> — one query is enough: " + (isConstant ? "all-zeros result ⇒ constant" : "non-zero result ⇒ balanced") + ". A classical computer would need up to 2ⁿ⁻¹+1 queries to be sure.")
        : "Pick an oracle type, then run the single query — the quantum algorithm decides constant vs. balanced with certainty in ONE shot.";
    }
    host.querySelectorAll(".osel").forEach(function (b) { b.onclick = function () { key = b.dataset.k; ran = false; setActive(); draw(); }; });
    host.querySelector('[data-act="query"]').onclick = function () { ran = true; draw(); };
    setActive(); draw();
  }

  /* ---------- quantum phase estimation precision ---------- */
  function qpeWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Quantum phase estimation — more counting qubits, finer precision</div>' +
      '<canvas class="widget-canvas" width="440" height="220" aria-label="A number line showing the true phase and the estimate window shrinking as counting qubits increase"></canvas>' +
      '<div class="widget-controls"><label for="qpe-true">true phase φ</label>' +
      '<input id="qpe-true" type="range" min="0" max="100" value="37" style="flex:1">' +
      '<label for="qpe-n">counting qubits n</label>' +
      '<input id="qpe-n" type="range" min="1" max="8" value="3" style="flex:1"></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var phiS = host.querySelector("#qpe-true"), nS = host.querySelector("#qpe-n");
    function draw() {
      var phi = +phiS.value / 100, n = +nS.value, levels = Math.pow(2, n);
      var est = Math.round(phi * levels) / levels;
      ctx.clearRect(0, 0, 440, 220);
      var x0 = 40, x1 = 400, y = 100;
      ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("0", x0, y + 18); ctx.fillText("1", x1, y + 18);
      var trueX = x0 + phi * (x1 - x0), estX = x0 + est * (x1 - x0), errPx = (1 / levels) * (x1 - x0) / 2;
      ctx.fillStyle = "#34d39955"; ctx.fillRect(estX - errPx, y - 20, errPx * 2, 40);
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(trueX, y - 30); ctx.lineTo(trueX, y + 30); ctx.stroke();
      ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(estX, y, 5, 0, 7); ctx.fill();
      read.innerHTML = "true φ = <b>" + phi.toFixed(3) + "</b>, n = <b>" + n + "</b> counting qubits ⇒ 2<sup>n</sup> = " + levels + " levels, estimate = <b>" + est.toFixed(3) + "</b>, error ≤ <b>" + (1 / (2 * levels)).toFixed(4) + "</b>. More qubits ⇒ a narrower green band.";
    }
    phiS.addEventListener("input", draw); nS.addEventListener("input", draw); draw();
  }

  /* ---------- Shor: period to factors ---------- */
  function shorWidget(host) {
    var PRESETS = [{ N: 15, a: 7 }, { N: 21, a: 2 }, { N: 35, a: 2 }];
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Shor’s algorithm — from period to factors</div>' +
      '<canvas class="widget-canvas" width="440" height="200" aria-label="Step-by-step reveal of Shor’s algorithm finding factors from the period"></canvas>' +
      '<div class="widget-controls">' + PRESETS.map(function (p) { return '<button class="wbtn nsel" data-n="' + p.N + '" type="button">N=' + p.N + "</button>"; }).join("") +
      '<button class="wbtn" data-act="next" type="button">Next step →</button>' +
      '<button class="wbtn reset" data-act="reset" type="button">Restart</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    function gcd(a, b) { while (b) { var t = b; b = a % b; a = t; } return a; }
    function modpow(base, exp, mod) { var r = 1; base = base % mod; while (exp > 0) { if (exp & 1) r = (r * base) % mod; exp = Math.floor(exp / 2); base = (base * base) % mod; } return r; }
    function findOrder(a, N) { var x = a % N, r = 1; while (x !== 1) { x = (x * a) % N; r++; if (r > 4 * N) return -1; } return r; }
    var N = 15, step = 0;
    function preset() { return PRESETS.filter(function (p) { return p.N === N; })[0]; }
    function compute() {
      var p = preset(), a = p.a, r = findOrder(a, N), out = { a: a, r: r };
      if (r % 2 === 0) {
        var x = modpow(a, r / 2, N);
        out.x = x; out.f1 = gcd(x - 1, N); out.f2 = gcd(x + 1, N);
      }
      return out;
    }
    function setActive() { host.querySelectorAll(".nsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.n === N); }); }
    function draw() {
      var c = compute();
      ctx.clearRect(0, 0, 440, 200);
      ctx.fillStyle = "#e6eaf2"; ctx.font = "13px Segoe UI, sans-serif"; ctx.textAlign = "left";
      var lines = [
        "N = " + N + ", pick a = " + c.a + " (coprime to N)",
        "QFT-based period finding gives r = " + c.r + (c.r % 2 ? " (odd — this a would need to be retried)" : " (even — proceed)"),
        c.f1 != null ? ("compute x = a^(r/2) mod N = " + c.x) : "",
        c.f1 != null ? ("factors: gcd(x−1, N) = " + c.f1 + ",  gcd(x+1, N) = " + c.f2) : ""
      ];
      for (var i = 0; i <= step && i < lines.length; i++) if (lines[i]) ctx.fillText(lines[i], 24, 30 + i * 34);
      read.innerHTML = (step >= 3 && c.f1 != null && c.f1 > 1 && c.f2 > 1)
        ? ("<b>" + N + " = " + c.f1 + " × " + c.f2 + "</b> — found using only the period r, never trial division.")
        : "Step through: pick N, then reveal how the period r (found by the QFT) turns into real factors.";
    }
    host.querySelectorAll(".nsel").forEach(function (b) { b.onclick = function () { N = +b.dataset.n; step = 0; setActive(); draw(); }; });
    host.querySelector('[data-act="next"]').onclick = function () { step = Math.min(3, step + 1); draw(); };
    host.querySelector('[data-act="reset"]').onclick = function () { step = 0; draw(); };
    setActive(); draw();
  }

  /* ---------- VQE energy landscape ---------- */
  function vqeWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">VQE — walking down the energy landscape</div>' +
      '<canvas class="widget-canvas" width="440" height="240" aria-label="Energy landscape E(theta) = cos(theta) with a marker that steps toward the minimum"></canvas>' +
      '<div class="widget-controls"><button class="wbtn" data-act="step" type="button">Gradient step</button>' +
      '<button class="wbtn reset" data-act="reset" type="button">Reset</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var theta = 0.3, iter = 0, lr = 0.3;
    function E(t) { return Math.cos(t); }
    function draw() {
      ctx.clearRect(0, 0, 440, 240);
      var x0 = 30, x1 = 410, y0 = 20, y1 = 190;
      ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 2; ctx.beginPath();
      for (var i = 0; i <= 200; i++) {
        var t = (i / 200) * 2 * Math.PI, e = E(t);
        var px = x0 + (t / (2 * Math.PI)) * (x1 - x0), py = y1 - ((e + 1) / 2) * (y1 - y0);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      var mx = x0 + (theta / (2 * Math.PI)) * (x1 - x0), my = y1 - ((E(theta) + 1) / 2) * (y1 - y0);
      ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(mx, my, 6, 0, 7); ctx.fill();
      read.innerHTML = "iteration <b>" + iter + "</b>: θ = <b>" + theta.toFixed(3) + "</b>, E(θ) = <b>" + E(theta).toFixed(3) + "</b> — the minimum is at θ = π, E = −1.";
    }
    host.querySelector('[data-act="step"]').onclick = function () { theta = theta + lr * Math.sin(theta); iter++; draw(); };
    host.querySelector('[data-act="reset"]').onclick = function () { theta = 0.3; iter = 0; draw(); };
    draw();
  }

  /* ---------- QEC: 3-qubit repetition code ---------- */
  function qecWidget(host) {
    host.innerHTML =
      '<div class="widget"><div class="widget-title">Repetition code — encode, inject an error, detect &amp; correct</div>' +
      '<canvas class="widget-canvas" width="440" height="200" aria-label="Three physical qubits encoding one logical qubit, with error injection and correction"></canvas>' +
      '<div class="widget-controls"><label>logical bit</label>' +
      '<button class="wbtn lsel" data-l="0" type="button">0</button><button class="wbtn lsel" data-l="1" type="button">1</button>' +
      '<label>flip qubit</label>' +
      '<button class="wbtn esel" data-e="-1" type="button">none</button>' +
      '<button class="wbtn esel" data-e="0" type="button">q1</button>' +
      '<button class="wbtn esel" data-e="1" type="button">q2</button>' +
      '<button class="wbtn esel" data-e="2" type="button">q3</button>' +
      '<button class="wbtn" data-act="correct" type="button">Detect &amp; correct</button></div>' +
      '<div class="widget-read" aria-live="polite"></div></div>';
    var cv = host.querySelector("canvas"), ctx = cv.getContext("2d"), read = host.querySelector(".widget-read");
    if (!ctx) { read.textContent = "(interactive canvas unavailable in this browser)"; return; }
    var logical = 0, errAt = -1, corrected = false;
    function setActive() {
      host.querySelectorAll(".lsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.l === logical); });
      host.querySelectorAll(".esel").forEach(function (b) { b.classList.toggle("active", +b.dataset.e === errAt); });
    }
    function physical() {
      var bits = [logical, logical, logical];
      if (errAt >= 0 && !corrected) bits[errAt] = 1 - bits[errAt];
      return bits;
    }
    function draw() {
      var bits = physical();
      ctx.clearRect(0, 0, 440, 200);
      var xs = [110, 220, 330];
      xs.forEach(function (x, i) {
        ctx.strokeStyle = bits[i] !== logical ? "#f87171" : "#2b3448"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, 90, 34, 0, 7); ctx.stroke();
        ctx.fillStyle = "#e6eaf2"; ctx.font = "bold 20px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(bits[i]), x, 91);
        ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif";
        ctx.fillText("q" + (i + 1), x, 140);
      });
      var syndrome = (errAt >= 0 && !corrected) ? ("mismatch found on q" + (errAt + 1)) : "no error detected";
      read.innerHTML = "Logical |" + logical + "⟩ encoded as |" + bits.join("") + "⟩ — syndrome: <b>" + syndrome + "</b>" + (corrected ? (" — corrected back to |" + logical + logical + logical + "⟩.") : ".");
    }
    host.querySelectorAll(".lsel").forEach(function (b) { b.onclick = function () { logical = +b.dataset.l; errAt = -1; corrected = false; setActive(); draw(); }; });
    host.querySelectorAll(".esel").forEach(function (b) { b.onclick = function () { errAt = +b.dataset.e; corrected = false; setActive(); draw(); }; });
    host.querySelector('[data-act="correct"]').onclick = function () { corrected = true; draw(); };
    setActive(); draw();
  }

  var BUILDERS = {
    bloch: blochWidget, interference: interferenceWidget, entangle: entanglementWidget,
    twoqubit: twoQubitWidget, grover: groverWidget, qft: qftWidget, decoherence: decoherenceWidget,
    trig: trigWidget, vectors2d: vectors2dWidget, complex: complexWidget, euler: eulerWidget,
    eigen: eigenWidget, probability: probabilityWidget, sampling: samplingWidget, qubit: qubitWidget,
    tensor: tensorWidget, teleport: teleportWidget, dj: djWidget, qpe: qpeWidget, shor: shorWidget,
    vqe: vqeWidget, qec: qecWidget
  };

  /* ---------- what/why/how/where/when, one entry per widget kind ---------- */
  var INFO = {
    bloch: {
      what: "A live Bloch sphere — click a gate button and watch the qubit's state vector rotate in real time.",
      why: "Every single-qubit gate has an exact geometric meaning as a rotation; seeing it move makes gates memorable instead of abstract.",
      how: "Click any gate (H, X, Y, Z, S, T) to apply it and watch the vector animate to its new position; Reset returns to |0⟩.",
      where: "Appears on the qubit/Bloch-sphere lesson and again on the single-qubit gate set lesson — both use the same live sphere.",
      when: "Use it any time a gate's effect isn't obvious from the matrix alone."
    },
    interference: {
      what: "A two-path interference explorer — drag the relative phase between two paths and watch the detection probability change.",
      why: "Interference is the mechanism behind every quantum speedup; without it, a quantum computer is just an expensive random-number generator.",
      how: "Drag the phase slider φ from 0 to 2π and watch the two phasors add up, and the detection-probability bar respond.",
      where: "Pairs with this lesson's discussion of gates as unitary evolution and the phase that matters.",
      when: "Revisit it whenever a later lesson says “this only works because of interference” and you want the intuition back."
    },
    entangle: {
      what: "An entangled-pair simulator — pick a Bell state, measure both qubits repeatedly, and watch the outcomes build a histogram.",
      why: "Entanglement's defining feature is correlation without communication — the histogram proves it experimentally, not just on paper.",
      how: "Pick Φ+/Φ−/Ψ+/Ψ−, click Measure repeatedly, and watch the 00/01/10/11 counts pile up — Φ states always match, Ψ states always differ.",
      where: "Directly illustrates this lesson's Bell states and no-cloning discussion.",
      when: "Use it to settle any doubt about what “entangled” actually means before moving on to teleportation."
    },
    twoqubit: {
      what: "A two-qubit circuit diagram — pick CNOT, CZ, or SWAP, set the input bits, and see the exact output.",
      why: "Two-qubit gates are how qubits actually interact; almost every useful algorithm needs at least one of these three.",
      how: "Choose a gate, set control and target bits with the toggle buttons, and read the output ket below the wires.",
      where: "Covers this lesson's CNOT, CZ, and SWAP definitions directly.",
      when: "Use it to double-check a truth table before writing it into real Qiskit code."
    },
    grover: {
      what: "A single-marked-item amplitude bar chart — step through Grover's oracle and diffusion operator one iteration at a time.",
      why: "Watching the marked amplitude grow (and shrink again if you over-rotate) is the fastest way to internalize why the optimal iteration count matters.",
      how: "Pick a marked item from the dropdown, then click “Apply oracle + diffusion” repeatedly and watch the bars change.",
      where: "Illustrates this lesson's quadratic-speedup claim directly — the Grover Playground lab generalizes this to any register size and any number of marked items.",
      when: "Use it for a first look before jumping to the Grover Playground lab for deeper exploration."
    },
    qft: {
      what: "An input-comb-to-output-peaks explorer — pick a period and watch exactly where the quantum Fourier transform's output lights up.",
      why: "This peak-at-multiples-of-N/r behavior is the entire reason Shor's algorithm can find periods efficiently.",
      how: "Click a period button (1, 2, 4, or 8) and compare the input pattern (top) to the QFT output magnitudes (bottom, peaks in green).",
      where: "Sets up this lesson's transform and feeds directly into the Shor's algorithm lesson right after it.",
      when: "Revisit right before Shor's algorithm if the “peaks reveal the period” idea feels shaky."
    },
    decoherence: {
      what: "A T1/T2 decay-curve plot — drag two sliders and watch a qubit's energy and coherence fade over time.",
      why: "Every real quantum computer is racing against these two clocks; understanding them explains why circuits must be short and fast.",
      how: "Drag the T1 and T2 sliders (T2 is physically capped at 2×T1) and read off how many gates fit before coherence is lost.",
      where: "Directly visualizes this lesson's T1, T2, and gate-error discussion.",
      when: "Use it when comparing real hardware specs — better T1/T2 numbers literally mean more usable gates per circuit."
    },
    trig: {
      what: "The unit circle — drag the angle and watch sine, cosine, and tangent update live.",
      why: "Quantum states are built from sines and cosines of angles; this is the geometric foundation everything later depends on.",
      how: "Drag the angle slider and read the projections (sine in green, cosine in gold) directly off the circle.",
      where: "Refreshes this lesson's trigonometry before it's needed for rotations and phases.",
      when: "Revisit any time a later formula has a cos or sin in it and the angle isn't obvious."
    },
    vectors2d: {
      what: "A 2D vector playground — set two vectors with sliders and see their sum and dot product live.",
      why: "Quantum states are vectors; dot products measure how “aligned” two states are, which is exactly what overlap and fidelity mean later.",
      how: "Adjust the four sliders for u and v, and watch the sum (green) and dot-product readout update.",
      where: "Builds the vector-algebra foundation this lesson introduces.",
      when: "Use it to build intuition for “perpendicular means dot product zero” before that shows up as “orthogonal states” later."
    },
    complex: {
      what: "The complex plane — drag the real and imaginary parts of z and watch its modulus and argument update.",
      why: "Quantum amplitudes are complex numbers; modulus-squared gives probability and argument gives the phase that drives interference.",
      how: "Drag the a and b sliders and read |z| and arg(z) off the live readout.",
      where: "Covers this lesson's complex-number geometry directly.",
      when: "Revisit whenever a probability calculation needs |amplitude|² and the modulus isn't obvious."
    },
    euler: {
      what: "A rotating phasor — drag θ and watch e^(iθ) trace the unit circle while its cosine and sine components update as bars.",
      why: "Euler's formula is the compact notation for every phase and rotation used from here to the end of the course.",
      how: "Drag the θ slider and watch the phasor rotate and the cos θ / sin θ bars respond in real time.",
      where: "Illustrates this lesson's e^(iθ) = cos θ + i sin θ identity directly.",
      when: "Keep this in mind whenever a gate matrix has an e^(iθ) term in it."
    },
    eigen: {
      what: "An eigenvector field — pick a matrix and see which sample vectors keep their direction after the transformation.",
      why: "Eigenvectors of Hermitian and unitary matrices are literally the measurement outcomes and gate axes used throughout quantum mechanics.",
      how: "Pick Scale, Shear, or Rotate 90°, and compare the faint grey (before) arrows to the blue (after) ones — gold lines mark real eigen-directions, when they exist.",
      where: "Directly demonstrates this lesson's eigenvalue and eigenvector definitions.",
      when: "Use it to build the “which vectors don't change direction” intuition before it's applied to Hermitian observables."
    },
    probability: {
      what: "A dice-rolling histogram — roll a die (once or fifty times) and watch the empirical frequency chase the theoretical 1/6 line.",
      why: "This is the law of large numbers in action, and it's exactly why running a quantum circuit multiple “shots” matters.",
      how: "Click Roll ×1 or Roll ×50 repeatedly and watch the bars settle toward the dashed theoretical line.",
      where: "Grounds this lesson's probability-distribution discussion in a hands-on demo.",
      when: "Revisit before the sampling lesson, which builds directly on this idea."
    },
    sampling: {
      what: "A running-average tracker — flip a biased coin many times and watch the estimate converge to the true probability.",
      why: "Quantum measurement outcomes are also probabilistic; more “shots” means a tighter estimate — never a guaranteed exact answer.",
      how: "Set the true P(heads) with the slider, click “Flip 200 more” repeatedly, and watch the blue line settle onto the gold true-value line.",
      where: "Directly demonstrates this lesson's “why shots matter” argument.",
      when: "Reference this any time you're deciding how many shots a real quantum job needs."
    },
    qubit: {
      what: "An amplitude-to-probability converter — set the amplitude α and watch both the raw amplitudes and the resulting Born-rule probabilities.",
      why: "The Born rule (probability = amplitude squared) is the single most-used formula in the entire course.",
      how: "Drag the α slider and compare the left bar chart (amplitudes) to the right one (probabilities, |amplitude|²).",
      where: "Directly visualizes this lesson's qubit state vector and Born rule.",
      when: "Use it any time a probability calculation from an amplitude needs double-checking."
    },
    tensor: {
      what: "A tensor-product builder — pick a state for each of two qubits and see the resulting four-amplitude joint state.",
      why: "Tensor products are how independent qubits combine into a joint system — the mechanical foundation for every multi-qubit circuit.",
      how: "Pick a state for qubit A and qubit B from the buttons, and read the four joint amplitudes off the bar chart.",
      where: "Directly demonstrates this lesson's tensor-product construction.",
      when: "Use it to check a tensor-product calculation by hand before trusting the arithmetic."
    },
    teleport: {
      what: "A step-through of the teleportation protocol — five clicks walk through entangling, measuring, sending classical bits, and correcting.",
      why: "Teleportation is the cleanest illustration of how classical and quantum information interact — and it never violates no-cloning or faster-than-light limits.",
      how: "Click “Next step” to advance through all five stages, or “Back” to review any step.",
      where: "Walks through this lesson's teleportation protocol one stage at a time.",
      when: "Use it whenever the full five-step sequence is hard to hold in your head at once."
    },
    dj: {
      what: "A single-query oracle test — pick constant or balanced, run one query, and see the algorithm decide with certainty.",
      why: "Deutsch–Jozsa is the first algorithm to prove a real quantum-vs-classical speedup, however impractical — it's the “hello world” of quantum advantage.",
      how: "Pick an oracle type, click “Run 1 query”, and see which outcome (all-zeros vs. non-zero) reveals the answer.",
      where: "Runs this lesson's oracle experiment directly.",
      when: "Use it to see why one query is provably enough — a fact classical computers can't match."
    },
    qpe: {
      what: "A precision dial — set a true phase and the number of counting qubits, and watch the estimate window shrink.",
      why: "Phase estimation is the subroutine hiding inside Shor's algorithm and most quantum chemistry algorithms — precision literally comes from adding more qubits.",
      how: "Set the true phase and the qubit count with the sliders, and watch the green precision band narrow as qubits increase.",
      where: "Directly visualizes this lesson's precision-vs-qubit-count tradeoff.",
      when: "Reference it whenever a later lesson says “n counting qubits gives 2⁻ⁿ precision” and you want to see why."
    },
    shor: {
      what: "A step-through of Shor's algorithm — pick N, reveal the period r, and watch it turn into real factors via gcd.",
      why: "This is the algorithm that threatens RSA encryption — seeing the period-to-factor arithmetic makes the threat concrete instead of abstract.",
      how: "Pick N (15, 21, or 35), then click “Next step” to reveal the period, the computed x, and finally the factors.",
      where: "Walks through this lesson's period-to-factor argument with real, checkable numbers.",
      when: "Use it right after the QFT & Period-Finding Lab, which supplies the period-finding step this widget assumes."
    },
    vqe: {
      what: "A 1-parameter energy landscape — click “Gradient step” and watch a marker walk downhill toward the minimum.",
      why: "VQE is the leading near-term quantum algorithm, and this is its classical half: an ordinary optimizer walking a landscape shaped by quantum measurements.",
      how: "Click “Gradient step” repeatedly and watch θ and E(θ) converge toward the minimum at θ = π.",
      where: "Directly demonstrates this lesson's variational optimization loop.",
      when: "Use it before the full 2-parameter VQE Optimization Lab, which generalizes this same idea."
    },
    qec: {
      what: "A repetition-code demo — encode a logical bit into three physical qubits, flip one, and correct it by majority vote.",
      why: "This is the simplest error-correcting code that actually works, and every more advanced code (including the surface code) builds on this same syndrome-and-correct idea.",
      how: "Pick a logical bit, choose which qubit to flip (or none), and click “Detect & correct” to watch the syndrome get found and fixed.",
      where: "Directly demonstrates this lesson's repetition-code construction.",
      when: "Use it before the Error Correction Lab, which adds phase-flip codes and random errors on top of this same mechanic."
    }
  };
  function renderInfoDL(info) {
    var order = [["What", info.what], ["Why", info.why], ["How", info.how], ["Where", info.where], ["When", info.when]];
    return '<dl class="info-panel">' + order.map(function (pair) { return "<dt>" + pair[0] + "</dt><dd>" + pair[1] + "</dd>"; }).join("") + "</dl>";
  }

  /* one-line visual decode shown directly under each widget (what every color,
     bar, and axis on the canvas means) — always visible, unlike the details panel */
  var CAPTIONS = {
    bloch: "The arrow is the qubit; north is |0⟩ and south is |1⟩. Each button rotates it, and the readout's P(0)/P(1) are your odds of measuring 0 or 1.",
    interference: "The two short arrows are the two path amplitudes and the green arrow is their sum; the bar is the detection probability. Drag the phase to make them reinforce (bright) or cancel (dark).",
    entangle: "Press Measure repeatedly and the histogram counts each joint outcome — green bars are matching results, purple are differing, and that pattern is the correlation.",
    twoqubit: "The top dot is the control and the bottom symbol is the target. Flip the input toggles and read the output state to see when the target changes and when it does not.",
    grover: "Each bar is one state's amplitude and the gold bar is your target; every step should grow it. Watch P(marked) in the readout climb, then fall if you over-step.",
    qft: "The purple top bars are the periodic input; the bottom bars are the transform's output, with green peaks at multiples of N/r. That peak spacing is the period readout.",
    decoherence: "The gold curve is the qubit's energy (T₁) decaying and the cyan curve is its phase coherence (T₂). The faster they fall, the fewer gates fit before the qubit forgets.",
    trig: "The blue arrow sits at angle θ on the unit circle; its shadow on the horizontal axis is cos θ and on the vertical axis is sin θ.",
    vectors2d: "The blue and gold arrows are your two vectors and the green arrow is their tip-to-tail sum; the dot product hits zero exactly when they are perpendicular.",
    complex: "The blue arrow is the number a + bi; its length is the modulus |z| and its angle from the horizontal axis is the argument.",
    euler: "The arrow is e^(iθ) and always rides the unit circle; the two bars are its cosine (horizontal) and sine (vertical) parts.",
    eigen: "Faint arrows are sample vectors and cyan arrows are those same vectors after the matrix acts; gold lines mark eigen-directions that keep their heading.",
    probability: "Each bar is how often a die face has come up and the gold dashed line is the ideal 1/6 — roll more and the bars settle toward it.",
    sampling: "The cyan line is the running average and the gold dashed line is the true probability; more flips pull the estimate onto the truth.",
    qubit: "The left bars are the amplitudes α and β and the right bars are the probabilities α² and β² (the Born rule), which always sum to 1.",
    tensor: "The four bars are the amplitudes of the combined two-qubit state over |00⟩, |01⟩, |10⟩, and |11⟩ — the tensor product worked out for you.",
    teleport: "The three lines are qubit wires and the readout narrates each stage; watch that only 2 classical bits ever travel, yet the exact state still arrives.",
    dj: "One query decides the oracle: an all-zeros bar (green) means constant and any non-zero bar (gold) means balanced — impossible classically in a single query.",
    qpe: "The blue line is the true phase, the gold dot is the estimate, and the green band is its error; add counting qubits and the band narrows.",
    shor: "Each step turns the period r (from the quantum part) into real factors of N by gcd, and the readout shows the factorization when it lands.",
    vqe: "The curve is the energy for each angle θ and the gold dot is you; every gradient step slides it downhill toward the minimum at θ = π.",
    qec: "The three circles are one logical bit stored three times; a red outline is an injected error, and Detect & correct majority-votes it away."
  };

  /* inject after the lesson body on relevant lessons */
  QCC.onRender(function (root, ctx) {
    if (!ctx || ctx.view !== "lesson") return;
    var kind = WIDGETS[ctx.id]; if (!kind || !BUILDERS[kind]) return;
    var body = root.querySelector(".lesson-body"); if (!body || body.querySelector(".widget")) return;
    var info = INFO[kind];
    if (info) {
      var infoHost = document.createElement("details"); infoHost.className = "info-toggle reveal"; infoHost.open = true;
      infoHost.innerHTML = "<summary>What is this widget? (what, why, how, where, when)</summary>" + renderInfoDL(info);
      body.appendChild(infoHost);
    }
    var host = document.createElement("div"); host.className = "widget-host reveal";
    body.appendChild(host); BUILDERS[kind](host);
    var cap = CAPTIONS[kind];
    if (cap) {
      var widgetBox = host.querySelector(".widget");
      if (widgetBox) {
        var capEl = document.createElement("div");
        capEl.className = "widget-caption";
        capEl.innerHTML = "<b>How to read this:</b> " + cap;
        widgetBox.appendChild(capEl);
      }
    }
  });
});
