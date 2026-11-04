/* viz.js — pass-2 interactive visuals (Nov 2026).
   Lessons place a slot with a line "@@viz:<key>"; app.js turns it into
   <div class="viz-slot" data-viz="key"> and this file mounts the builder.
   Every number shown is computed from the formula named in the readout.
   SVG with a viewBox scales to any width; colors come from the course's CSS
   variables. Also wraps the "The simple version" section in a panel and tags
   the "Going deeper" and "In one line" headings for styling. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var V = {};
  var NS = "http://www.w3.org/2000/svg";

  /* ---------- tiny SVG string helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function T(x, y, s, o) {
    o = o || {};
    return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (o.a || "middle") + '" style="fill:' + (o.c || "var(--text)") +
      ";font-size:" + (o.s || 13) + "px;font-weight:" + (o.b ? 700 : 400) + '">' + esc(s) + "</text>";
  }
  function L(x1, y1, x2, y2, c, w, dash) {
    return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '" style="stroke:' + (c || "var(--dim)") +
      ";stroke-width:" + (w || 1.6) + (dash ? ";stroke-dasharray:" + dash : "") + '"/>';
  }
  function C(cx, cy, r, fill, stroke, w) {
    return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + ";stroke-width:" + (w || 1.5) + '"/>';
  }
  function R(x, y, w, h, fill, stroke, rx) {
    return '<rect x="' + r1(x) + '" y="' + r1(y) + '" width="' + r1(Math.max(0, w)) + '" height="' + r1(Math.max(0, h)) + '" rx="' + (rx == null ? 4 : rx) +
      '" style="fill:' + (fill || "none") + ";stroke:" + (stroke || "none") + ';stroke-width:1.4"/>';
  }
  function P(pts, c, w, fill) {
    return '<polyline points="' + pts.map(function (p) { return r1(p[0]) + "," + r1(p[1]); }).join(" ") + '" style="fill:' + (fill || "none") + ";stroke:" + c + ";stroke-width:" + (w || 2) + ';stroke-linejoin:round"/>';
  }
  /* arrow from (x1,y1) to (x2,y2) with a filled head at the tip */
  function A(x1, y1, x2, y2, c, w) {
    var ang = Math.atan2(y2 - y1, x2 - x1), h = 9, s = 0.45;
    var len = Math.hypot(x2 - x1, y2 - y1);
    var bx = len > h ? x2 - (h * 0.8) * Math.cos(ang) : x2, by = len > h ? y2 - (h * 0.8) * Math.sin(ang) : y2;
    var p1 = [x2 - h * Math.cos(ang - s), y2 - h * Math.sin(ang - s)], p2 = [x2 - h * Math.cos(ang + s), y2 - h * Math.sin(ang + s)];
    return L(x1, y1, bx, by, c, w || 2.2) + (len > 2 ? '<polygon points="' + r1(x2) + "," + r1(y2) + " " + r1(p1[0]) + "," + r1(p1[1]) + " " + r1(p2[0]) + "," + r1(p2[1]) + '" style="fill:' + c + '"/>' : "");
  }
  function r1(v) { return Math.round(v * 10) / 10; }
  function f(v, d) { return (+v).toFixed(d == null ? 3 : d); }
  function pct(v, d) { return (100 * v).toFixed(d == null ? 1 : d) + "%"; }

  /* frame: title, svg, controls, readout. controls = array of control specs */
  function frame(host, title, w, h, controls, aria) {
    var html = '<div class="widget viz"><div class="widget-title">' + esc(title) + "</div>" +
      '<svg class="vz" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(aria || title) + '"></svg>' +
      '<div class="widget-controls viz-controls">';
    (controls || []).forEach(function (c) {
      if (c.type === "range") {
        html += '<label class="viz-range"><span>' + esc(c.label) + ' <b data-out="' + c.id + '"></b></span>' +
          '<input type="range" data-id="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.value + '" aria-label="' + esc(c.label) + '"></label>';
      } else if (c.type === "button") {
        html += '<button class="wbtn" type="button" data-id="' + c.id + '">' + esc(c.label) + "</button>";
      } else if (c.type === "select") {
        html += '<label class="viz-range"><span>' + esc(c.label) + '</span><select data-id="' + c.id + '" aria-label="' + esc(c.label) + '">' +
          c.options.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (o[0] === c.value ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select></label>";
      }
    });
    html += '</div><div class="widget-read viz-read" aria-live="polite"></div></div>';
    host.innerHTML = html;
    var svg = host.querySelector("svg"), read = host.querySelector(".viz-read");
    return {
      svg: svg, read: read,
      val: function (id) { var e = host.querySelector('[data-id="' + id + '"]'); return e ? (e.tagName === "SELECT" ? e.value : +e.value) : null; },
      set: function (id, v) { var e = host.querySelector('[data-id="' + id + '"]'); if (e) e.value = v; },
      out: function (id, s) { var e = host.querySelector('[data-out="' + id + '"]'); if (e) e.textContent = s; },
      on: function (fn) {
        host.querySelectorAll("input,select").forEach(function (e) { e.addEventListener("input", fn); e.addEventListener("change", fn); });
      },
      click: function (id, fn) { var e = host.querySelector('[data-id="' + id + '"]'); if (e) e.addEventListener("click", fn); },
      draw: function (inner) { svg.innerHTML = inner; }
    };
  }
  function sup(n) { return String(n).split("").map(function (d) { return d === "-" ? "⁻" : "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]; }).join(""); }
  function fmtBytes(b) {
    var u = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], i = 0;
    while (b >= 1000 && i < u.length - 1) { b /= 1000; i++; }
    return (b >= 100 ? b.toFixed(0) : b >= 10 ? b.toFixed(1) : b.toFixed(2)) + " " + u[i];
  }

  /* =====================================================================
     M0 welcome — state-vector memory: 2^n amplitudes x 16 bytes each
     ===================================================================== */
  V["qubit-memory"] = function (host) {
    var F = frame(host, "How much memory does it take to write down n qubits?", 480, 250,
      [{ type: "range", id: "n", label: "Qubits n =", min: 1, max: 60, step: 1, value: 30 }],
      "Log-scale bar showing the bytes needed to store the state of n qubits");
    function draw() {
      var n = F.val("n"), amps = Math.pow(2, n), bytes = 16 * amps;
      F.out("n", n);
      var x0 = 24, x1 = 456, lmax = 20;  // axis: 10^0 .. 10^20 bytes
      var X = function (b) { return x0 + (Math.log10(b) / lmax) * (x1 - x0); };
      var s = T(240, 24, "Bytes needed (16 bytes per amplitude)", { s: 15, b: true });
      s += L(x0, 150, x1, 150, "var(--faint)", 1.4);
      for (var k = 0; k <= lmax; k += 5) { s += L(X(Math.pow(10, k)), 146, X(Math.pow(10, k)), 154, "var(--faint)", 1.2); s += T(X(Math.pow(10, k)), 170, "10" + sup(k) + " B", { s: 12, c: "var(--faint)" }); }
      var refs = [[16e9, "16 GB laptop", "var(--good)", "end"], [512e9, "512 GB server", "var(--warn)", "start"]];
      refs.forEach(function (r, i) {
        var x = X(r[0]); s += L(x, 70, x, 150, r[2], 1.6, "4 3"); s += T(x + (i ? 4 : -4), i ? 64 : 50, r[1], { s: 13, c: r[2], a: r[3] });
      });
      var xb = X(bytes), fits = bytes <= 16e9 ? "fits on a laptop" : bytes <= 512e9 ? "needs a big server" : "fits on no single computer";
      s += R(x0, 104, Math.min(xb, x1) - x0, 32, bytes <= 16e9 ? "var(--good)" : bytes <= 512e9 ? "var(--warn)" : "var(--bad)", "none", 4);
      s += T(x0 + 6, 125, n + (n > 3 ? " qubits" : ""), { s: 13, a: "start", c: "#0b0e14", b: true });
      s += T(240, 204, "2" + sup(n) + " = " + amps.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " amplitudes", { s: 14, c: "var(--acc2)" });
      s += T(240, 230, "× 16 B = " + fmtBytes(bytes) + ": " + fits, { s: 14, b: true });
      F.draw(s);
      F.read.innerHTML = "Each extra qubit <b>doubles</b> the list of numbers a normal computer must store. " +
        "29 qubits (" + fmtBytes(16 * Math.pow(2, 29)) + ") fit in 16 GB; 30 qubits need " + fmtBytes(16 * Math.pow(2, 30)) + ". " +
        "50 qubits need " + fmtBytes(16 * Math.pow(2, 50)) + ". A quantum chip holds that state physically instead of writing it down.";
    }
    F.on(draw); draw();
  };
  /* =====================================================================
     M1 trig — a unit arrow as a pair of amplitudes: (cos a, sin a) -> chances cos²a, sin²a
     ===================================================================== */
  V["born-circle"] = function (host) {
    var F = frame(host, "Turn the arrow: its x and y become a qubit's two amplitudes", 480, 260,
      [{ type: "range", id: "a", label: "Angle a =", min: 0, max: 360, step: 1, value: 60 }],
      "Unit circle with an arrow at angle a and bars for cos squared and sin squared");
    function draw() {
      var deg = F.val("a"), a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      F.out("a", deg + "°");
      var cx = 120, cy = 135, Rr = 95, px = cx + Rr * c, py = cy - Rr * s;
      var o = L(cx - 110, cy, cx + 110, cy, "var(--border)", 1.2) + L(cx, cy - 110, cx, cy + 110, "var(--border)", 1.2);
      o += C(cx, cy, Rr, "none", "var(--faint)", 1.4);
      o += L(cx, cy, px, cy, "var(--acc2)", 4) + L(cx, cy, cx, py, "var(--warn)", 4);
      o += L(px, py, px, cy, "var(--acc2)", 1.2, "4 3") + L(px, py, cx, py, "var(--warn)", 1.2, "4 3");
      o += A(cx, cy, px, py, "#b9a9ff", 2.6) + C(px, py, 5, "var(--acc)", "#b9a9ff");
      o += T(cx, 255, "x = cos a = " + f(c), { s: 13, c: "var(--acc2)" });
      // bars: chances
      var bx = 290, bw = 60, base = 200, H = 150;
      [[c * c, "cos²a", "var(--acc2)"], [s * s, "sin²a", "var(--warn)"]].forEach(function (q, i) {
        var x = bx + i * 90, h = q[0] * H;
        o += R(x, base - H, bw, H, "none", "var(--border)", 4) + R(x, base - h, bw, h, q[2], "none", 4);
        o += T(x + bw / 2, base + 20, q[1], { s: 13, c: q[2] }) + T(x + bw / 2, base - h - 8, f(q[0], 3), { s: 13, b: true });
      });
      o += T(365, 30, "cos²a + sin²a = " + f(c * c + s * s, 3), { s: 14, b: true, c: "var(--good)" });
      o += T(365, 246, "y = sin a = " + f(s), { s: 13, c: "var(--warn)" });
      F.draw(o);
      F.read.innerHTML = "Read the two coordinates as amplitudes. Squaring them gives two chances, <b>" + pct(c * c) + "</b> and <b>" + pct(s * s) +
        "</b>, and they always add to 100% because the point stays on a circle of radius 1. " +
        (c < 0 || s < 0 ? "Notice a negative coordinate still gives a positive chance; the minus sign only shows up later, when amplitudes add or cancel." : "Try an angle past 90°: a coordinate turns negative, but its chance stays positive.");
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M2 complex — multiply two complex numbers: lengths multiply, angles add
     ===================================================================== */
  V["complex-multiply"] = function (host) {
    var F = frame(host, "Multiply two complex numbers: lengths multiply, angles add", 480, 290,
      [{ type: "range", id: "r1", label: "|z| =", min: 0.5, max: 1.8, step: 0.1, value: 1.5 },
       { type: "range", id: "a1", label: "angle of z =", min: 0, max: 360, step: 5, value: 30 },
       { type: "range", id: "r2", label: "|w| =", min: 0.5, max: 1.8, step: 0.1, value: 1.2 },
       { type: "range", id: "a2", label: "angle of w =", min: 0, max: 360, step: 5, value: 60 }],
      "Complex plane showing z, w and their product");
    function draw() {
      var r1 = F.val("r1"), a1 = F.val("a1"), r2 = F.val("r2"), a2 = F.val("a2");
      F.out("r1", f(r1, 1)); F.out("a1", a1 + "°"); F.out("r2", f(r2, 1)); F.out("a2", a2 + "°");
      var z = [r1 * Math.cos(a1 * Math.PI / 180), r1 * Math.sin(a1 * Math.PI / 180)];
      var w = [r2 * Math.cos(a2 * Math.PI / 180), r2 * Math.sin(a2 * Math.PI / 180)];
      var p = [z[0] * w[0] - z[1] * w[1], z[0] * w[1] + z[1] * w[0]];  // (a+bi)(c+di)
      var pr = Math.hypot(p[0], p[1]), pa = ((Math.atan2(p[1], p[0]) * 180 / Math.PI) + 360) % 360;
      var ox = 140, oy = 145, s = 40;
      var o = L(10, oy, 270, oy, "var(--border)", 1.2) + L(ox, 10, ox, 280, "var(--border)", 1.2);
      o += C(ox, oy, s, "none", "var(--faint)", 1) + T(ox + s + 3, oy + 14, "1", { s: 11, c: "var(--faint)", a: "start" });
      o += A(ox, oy, ox + s * z[0], oy - s * z[1], "var(--acc2)", 2.6);
      o += A(ox, oy, ox + s * w[0], oy - s * w[1], "var(--warn)", 2.6);
      o += A(ox, oy, ox + s * p[0], oy - s * p[1], "var(--good)", 3);
      var y = 40;
      [["z", r1, a1, z, "var(--acc2)"], ["w", r2, a2, w, "var(--warn)"], ["z·w", pr, pa, p, "var(--good)"]].forEach(function (q) {
        o += T(290, y, q[0] + ": length " + f(q[1], 2) + ", angle " + Math.round(q[2]) + "°", { s: 13, c: q[4], a: "start", b: true });
        o += T(290, y + 20, "= " + f(q[3][0], 2) + (q[3][1] < 0 ? " − " : " + ") + f(Math.abs(q[3][1]), 2) + "i", { s: 13, c: "var(--dim)", a: "start" });
        y += 62;
      });
      o += T(290, 232, f(r1, 1) + " × " + f(r2, 1) + " = " + f(r1 * r2, 2), { s: 13, a: "start" });
      o += T(290, 254, a1 + "° + " + a2 + "° = " + ((a1 + a2) % 360) + "° (mod 360)", { s: 13, a: "start" });
      F.draw(o);
      F.read.innerHTML = "The green arrow is z·w, computed the long way as (a + bi)(c + di) = (ac − bd) + (ad + bc)i. Its length is <b>" + f(pr, 2) +
        "</b> = " + f(r1, 1) + " × " + f(r2, 1) + " and its angle is <b>" + Math.round(pa) + "°</b>. Set both lengths to 1 and multiplying only turns the arrow; that is what a phase does to an amplitude.";
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M2 vector spaces — same state, tilted measuring ruler: chances cos²(a−b), sin²(a−b)
     ===================================================================== */
  V["basis-measure"] = function (host) {
    var F = frame(host, "Same state, different ruler: tilt the basis and watch the chances change", 480, 280,
      [{ type: "range", id: "a", label: "State angle a =", min: 0, max: 180, step: 1, value: 30 },
       { type: "range", id: "b", label: "Ruler tilt b =", min: 0, max: 90, step: 1, value: 45 }],
      "A state arrow and a tilted pair of basis axes with bars for the two measurement chances");
    function draw() {
      var a = F.val("a"), bb = F.val("b"); F.out("a", a + "°"); F.out("b", bb + "°");
      var ar = a * Math.PI / 180, br = bb * Math.PI / 180, cx = 140, cy = 140, Rr = 110;
      var c0 = Math.cos(ar - br), c1 = Math.sin(ar - br);  // coordinates in the tilted basis
      var o = C(cx, cy, Rr, "none", "var(--border)", 1.2);
      var e0 = [Math.cos(br), Math.sin(br)], e1 = [-Math.sin(br), Math.cos(br)];
      o += L(cx - Rr * e0[0], cy + Rr * e0[1], cx + Rr * e0[0], cy - Rr * e0[1], "#b9a9ff", 1.4, "6 4");
      o += L(cx - Rr * e1[0], cy + Rr * e1[1], cx + Rr * e1[0], cy - Rr * e1[1], "#b9a9ff", 1.4, "6 4");
      o += T(cx + (Rr + 14) * e0[0], cy - (Rr + 14) * e0[1] + 5, "e₀", { s: 13, c: "#b9a9ff" });
      o += T(cx + (Rr + 14) * e1[0], cy - (Rr + 14) * e1[1] + 5, "e₁", { s: 13, c: "#b9a9ff" });
      var tip = [cx + Rr * Math.cos(ar), cy - Rr * Math.sin(ar)], foot = [cx + Rr * c0 * e0[0], cy - Rr * c0 * e0[1]];
      o += L(tip[0], tip[1], foot[0], foot[1], "var(--good)", 1.4, "3 3");
      o += L(cx, cy, foot[0], foot[1], "var(--good)", 4);
      o += A(cx, cy, tip[0], tip[1], "var(--acc2)", 2.8) + T(tip[0], tip[1] - 10, "ψ", { s: 15, b: true, c: "var(--acc2)" });
      var bx = 300, base = 220, H = 160;
      [[c0 * c0, "chance e₀", "var(--good)"], [c1 * c1, "chance e₁", "var(--warn)"]].forEach(function (q, i) {
        var x = bx + i * 90, h = q[0] * H;
        o += R(x, base - H, 60, H, "none", "var(--border)", 4) + R(x, base - h, 60, h, q[2], "none", 4);
        o += T(x + 30, base + 20, q[1], { s: 12, c: q[2] }) + T(x + 30, base - h - 8, f(q[0], 3), { s: 13, b: true });
      });
      o += T(375, 270, "ψ = " + f(c0, 3) + "·e₀ " + (c1 < 0 ? "− " : "+ ") + f(Math.abs(c1), 3) + "·e₁", { s: 12, c: "var(--dim)" });
      F.draw(o);
      F.read.innerHTML = "The state arrow ψ never changes when you move the ruler. Its coordinates along the tilted axes are cos(a − b) = <b>" + f(c0, 3) +
        "</b> and sin(a − b) = <b>" + f(c1, 3) + "</b>, and their squares are the chances for that measurement. Line the ruler up with ψ and one outcome becomes certain. " +
        "(Real amplitudes only. On the Bloch sphere in Module 5 these angles double.)";
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M3 sampling — 20 repeated experiments of n shots each; spread vs the ±1.96·SE band
     ===================================================================== */
  V["shots-error"] = function (host) {
    var F = frame(host, "Run 20 experiments of n shots each: how far do the estimates wander?", 480, 280,
      [{ type: "range", id: "e", label: "Shots per experiment n =", min: 1, max: 5, step: 0.25, value: 2 },
       { type: "range", id: "p", label: "True chance of '1' p =", min: 0.05, max: 0.95, step: 0.05, value: 0.5 }],
      "Dots for 20 simulated estimates around the true probability, with a shaded 95% band");
    function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
    function draw() {
      var n = Math.round(Math.pow(10, F.val("e"))), p = F.val("p");
      F.out("e", n.toLocaleString("en-US")); F.out("p", f(p, 2));
      var se = Math.sqrt(p * (1 - p) / n), lo = Math.max(0, p - 1.96 * se), hi = Math.min(1, p + 1.96 * se);
      var X = function (v) { return 30 + v * 420; };
      var o = L(30, 230, 450, 230, "var(--faint)", 1.2);
      for (var k = 0; k <= 10; k += 2) { o += L(X(k / 10), 226, X(k / 10), 234, "var(--faint)", 1); o += T(X(k / 10), 250, (k / 10).toFixed(1), { s: 12, c: "var(--faint)" }); }
      o += R(X(lo), 34, X(hi) - X(lo), 186, "rgba(34,211,238,.13)", "none", 2);
      o += L(X(p), 30, X(p), 226, "var(--good)", 2, "5 4") + T(X(p), 22, "true p = " + f(p, 2), { s: 13, c: "var(--good)", b: true });
      var r = rng(Math.round(n * 1000 + p * 100)), inside = 0, ests = [];
      for (var e = 0; e < 20; e++) {
        var ones = 0; for (var i = 0; i < n; i++) if (r() < p) ones++;
        var est = ones / n; ests.push(est); if (est >= lo && est <= hi) inside++;
        o += C(X(est), 44 + e * 9, 4, "var(--warn)", "none");
      }
      var mn = Math.min.apply(null, ests), mx = Math.max.apply(null, ests);
      o += T(240, 272, "95% band: " + f(lo, 3) + " to " + f(hi, 3) + "   (± " + f(1.96 * se, 3) + ")", { s: 13, c: "var(--acc2)" });
      F.draw(o);
      F.read.innerHTML = "Each gold dot is one experiment's estimate (count of 1s ÷ n). The shaded band is p ± 1.96·√(p(1−p)/n) = <b>± " + f(1.96 * se, 3) +
        "</b>; about 19 of 20 dots should land inside it, and here <b>" + inside + " of 20</b> did. This run's estimates spread from " + f(mn, 3) + " to " + f(mx, 3) +
        ". Multiply n by 4 and the band gets half as wide.";
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M5 Bloch — θ, φ sliders; amplitudes cos(θ/2), e^{iφ} sin(θ/2); P(0) = cos²(θ/2)
     ===================================================================== */
  V["bloch-angles"] = function (host) {
    var F = frame(host, "Steer a qubit with two angles and read its measurement chances", 480, 300,
      [{ type: "range", id: "th", label: "θ (down from |0⟩) =", min: 0, max: 180, step: 1, value: 60 },
       { type: "range", id: "ph", label: "φ (around the equator) =", min: 0, max: 360, step: 1, value: 90 }],
      "Bloch sphere with a state arrow set by two angles, plus bars for P(0) and P(1)");
    var cx = 130, cy = 150, Rr = 100;
    function P3(x, y, z) { return [cx + Rr * (0.92 * y - 0.42 * x), cy - Rr * (0.92 * z - 0.28 * x)]; }
    function draw() {
      var thd = F.val("th"), phd = F.val("ph"), th = thd * Math.PI / 180, ph = phd * Math.PI / 180;
      F.out("th", thd + "°"); F.out("ph", phd + "°");
      var x = Math.sin(th) * Math.cos(ph), y = Math.sin(th) * Math.sin(ph), z = Math.cos(th);
      var a = Math.cos(th / 2), bm = Math.sin(th / 2), p0 = a * a, p1 = bm * bm;
      var o = C(cx, cy, Rr, "none", "var(--faint)", 1.3), eq = [], mer = [];
      for (var k = 0; k <= 48; k++) { var t = k / 48 * 2 * Math.PI; eq.push(P3(Math.cos(t), Math.sin(t), 0)); mer.push(P3(Math.cos(ph) * Math.sin(t), Math.sin(ph) * Math.sin(t), Math.cos(t))); }
      o += P(eq, "var(--border)", 1.2) + P(mer, "rgba(124,92,255,.35)", 1);
      var zt = P3(0, 0, 1.16), zb = P3(0, 0, -1.16), xt = P3(1.3, 0, 0), yt = P3(0, 1.25, 0);
      o += L(zb[0], zb[1], zt[0], zt[1], "var(--border)", 1.2) + T(zt[0], zt[1] - 6, "|0⟩", { s: 13, c: "var(--good)" }) + T(zb[0], zb[1] + 16, "|1⟩", { s: 13, c: "var(--warn)" });
      o += L(cx, cy, xt[0], xt[1], "var(--border)", 1, "3 3") + T(xt[0] - 4, xt[1] + 12, "x |+⟩", { s: 11, c: "var(--faint)", a: "end" });
      o += L(cx, cy, yt[0], yt[1], "var(--border)", 1, "3 3") + T(yt[0] + 2, yt[1] - 6, "y", { s: 11, c: "var(--faint)", a: "start" });
      var tip = P3(x, y, z), h = P3(0, 0, z);
      o += L(tip[0], tip[1], h[0], h[1], "var(--good)", 1.3, "4 3") + C(h[0], h[1], 3.5, "var(--good)", "none");
      o += A(cx, cy, tip[0], tip[1], "var(--acc2)", 3) + C(tip[0], tip[1], 4, "var(--acc2)", "none");
      // right panel: amplitudes + chance bars
      var re = bm * Math.cos(ph), im = bm * Math.sin(ph);
      o += T(270, 36, "α = cos(θ/2) = " + f(a, 3), { s: 13, a: "start", c: "var(--text)" });
      o += T(270, 58, "β = e^(iφ)·sin(θ/2) = " + f(re, 2) + (im < 0 ? " − " : " + ") + f(Math.abs(im), 2) + "i", { s: 13, a: "start", c: "var(--text)" });
      var base = 240, H = 140;
      [[p0, "P(0)", "var(--good)"], [p1, "P(1)", "var(--warn)"]].forEach(function (q, i) {
        var bx = 290 + i * 90, hh = q[0] * H;
        o += R(bx, base - H, 56, H, "none", "var(--border)", 4) + R(bx, base - hh, 56, hh, q[2], "none", 4);
        o += T(bx + 28, base + 18, q[1], { s: 13, c: q[2] }) + T(bx + 28, base - hh - 7, f(q[0], 3), { s: 13, b: true });
      });
      o += T(375, 290, "Bloch (x, y, z) = (" + f(x, 2) + ", " + f(y, 2) + ", " + f(z, 2) + ")", { s: 12, c: "var(--dim)" });
      F.draw(o);
      F.read.innerHTML = "P(0) = cos²(θ/2) = (1 + z)/2 = <b>" + pct(p0) + "</b> and P(1) = <b>" + pct(p1) + "</b>. Move φ: the arrow swings around the vertical axis but the bars don't move, " +
        "because a 0/1 measurement only sees the height z. φ is the relative phase; it decides what happens after a gate, and what you'd see measuring along x (P(+) = (1 + x)/2 = " + pct((1 + x) / 2) + ").";
    }
    F.on(draw); draw();
  };

  /* @@VIZ-INSERT */

  /* ---------- mount + simple-section styling ---------- */
  QCC.onRender(function (root, ctx) {
    if (!ctx || ctx.view !== "lesson") return;
    var body = root.querySelector(".lesson-body"); if (!body) return;
    /* wrap "The simple version" section in a panel */
    var hs = body.querySelectorAll("h2");
    var simpleH = null, deeperH = null, lineH = null;
    hs.forEach(function (h) {
      var t = h.textContent.trim();
      if (/^The simple version/i.test(t)) simpleH = h;
      else if (/^Going deeper/i.test(t)) deeperH = h;
      else if (/^In one line/i.test(t)) lineH = h;
    });
    if (simpleH && deeperH && !body.querySelector(".simple-panel")) {
      var sec = document.createElement("section"); sec.className = "simple-panel";
      simpleH.parentNode.insertBefore(sec, simpleH);
      var n = simpleH;
      while (n && n !== deeperH) { var nx = n.nextSibling; sec.appendChild(n); n = nx; }
      deeperH.classList.add("deeper-h");
    }
    if (lineH) {
      lineH.classList.add("oneline-h");
      var p = lineH.nextElementSibling; if (p && p.tagName === "P") p.classList.add("oneline");
    }
    body.querySelectorAll(".viz-slot").forEach(function (slot) {
      var k = slot.getAttribute("data-viz");
      if (slot.firstChild || !V[k]) { if (!V[k]) slot.innerHTML = '<div class="warn-box">interactive "' + esc(k) + '" missing</div>'; return; }
      try { V[k](slot); } catch (e) { console.error("viz " + k, e); slot.innerHTML = '<div class="warn-box">interactive failed to load</div>'; }
    });
  });
  window.VIZ = V;
});
