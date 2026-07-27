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
    grover: "grover", qft: "qft", noise: "decoherence"
  };

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

  var BUILDERS = {
    bloch: blochWidget, interference: interferenceWidget, entangle: entanglementWidget,
    twoqubit: twoQubitWidget, grover: groverWidget, qft: qftWidget, decoherence: decoherenceWidget
  };

  /* inject after the lesson body on relevant lessons */
  QCC.onRender(function (root, ctx) {
    if (!ctx || ctx.view !== "lesson") return;
    var kind = WIDGETS[ctx.id]; if (!kind || !BUILDERS[kind]) return;
    var body = root.querySelector(".lesson-body"); if (!body || body.querySelector(".widget")) return;
    var host = document.createElement("div"); host.className = "widget-host reveal";
    body.appendChild(host); BUILDERS[kind](host);
  });
});
