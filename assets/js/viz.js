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

  /* =====================================================================
     M6 two-qubit gates — step a 2-qubit circuit gate by gate (real 4-amplitude simulation)
     basis order |q0 q1>: index = 2*q0 + q1
     ===================================================================== */
  V["bell-stepper"] = function (host) {
    var CIRCS = {
      bell: { name: "Bell pair: H on q0, then CNOT", gates: [["H", 0], ["CX", 0, 1]] },
      psi: { name: "X on q1 first, then H, CNOT", gates: [["X", 1], ["H", 0], ["CX", 0, 1]] },
      undo: { name: "Make a Bell pair, then undo it", gates: [["H", 0], ["CX", 0, 1], ["CX", 0, 1], ["H", 0]] },
      kick: { name: "Phase kickback: X, H on q1; H on q0; CNOT; H on q0", gates: [["X", 1], ["H", 1], ["H", 0], ["CX", 0, 1], ["H", 0]] }
    };
    var F = frame(host, "Step through a two-qubit circuit and watch all four amplitudes", 480, 300,
      [{ type: "button", id: "next", label: "Next gate ▶" }, { type: "button", id: "back", label: "◀ Back" },
       { type: "select", id: "c", label: "Circuit", value: "bell", options: Object.keys(CIRCS).map(function (k) { return [k, CIRCS[k].name]; }) }],
      "Circuit diagram with the current step highlighted and bars for the four amplitudes");
    var step = 0, s2 = Math.SQRT1_2;
    function apply(st, g) {
      var o = st.slice();
      if (g[0] === "CX") { o = st.slice(); var c = g[1]; for (var i = 0; i < 4; i++) { var cb = c === 0 ? (i >> 1) & 1 : i & 1; if (cb) { var j = i ^ (g[2] === 1 ? 1 : 2); o[j] = st[i]; } } return o; }
      var q = g[1], m = q === 0 ? 2 : 1;
      for (var k = 0; k < 4; k++) {
        if (k & m) continue; var a = st[k], b = st[k | m];
        if (g[0] === "H") { o[k] = s2 * (a + b); o[k | m] = s2 * (a - b); }
        else if (g[0] === "X") { o[k] = b; o[k | m] = a; }
        else if (g[0] === "Z") { o[k] = a; o[k | m] = -b; }
      }
      return o;
    }
    function state(circ, n) { var st = [1, 0, 0, 0]; for (var i = 0; i < n; i++) st = apply(st, circ.gates[i]); return st; }
    function draw() {
      var circ = CIRCS[F.val("c")], G = circ.gates; if (step > G.length) step = G.length;
      var st = state(circ, step), labels = ["|00⟩", "|01⟩", "|10⟩", "|11⟩"];
      var o = T(16, 26, "q0", { s: 13, a: "start", c: "var(--dim)" }) + T(16, 76, "q1", { s: 13, a: "start", c: "var(--dim)" });
      var x0 = 44, dx = Math.min(80, 400 / G.length);
      o += L(x0, 22, 464, 22, "var(--faint)", 1.4) + L(x0, 72, 464, 72, "var(--faint)", 1.4);
      G.forEach(function (g, i) {
        var x = x0 + 30 + i * dx, done = i < step, col = done ? "var(--acc2)" : "var(--faint)";
        if (g[0] === "CX") {
          var yc = g[1] === 0 ? 22 : 72, yt = g[2] === 1 ? 72 : 22;
          o += L(x, yc, x, yt, col, 2) + C(x, yc, 5, col, "none") + C(x, yt, 11, "var(--code-bg)", col, 2) + L(x - 11, yt, x + 11, yt, col, 2) + L(x, yt - 11, x, yt + 11, col, 2);
        } else {
          var y = g[1] === 0 ? 22 : 72;
          o += R(x - 15, y - 15, 30, 30, "var(--code-bg)", col, 5) + T(x, y + 5, g[0], { s: 14, b: true, c: col });
        }
      });
      var cur = x0 + 30 + (step - 0.5) * dx; if (step > 0) o += L(cur, 6, cur, 92, "var(--warn)", 2, "4 3");
      o += T(240, 112, step === 0 ? "start: both qubits in |0⟩" : "after gate " + step + " of " + G.length + ": " + G[step - 1][0] + (G[step - 1][0] === "CX" ? " (control q" + G[step - 1][1] + ")" : " on q" + G[step - 1][1]), { s: 13, c: "var(--warn)" });
      var mid = 205, sc = 70;
      o += L(30, mid, 450, mid, "var(--border)", 1.2);
      st.forEach(function (a, i) {
        var x = 60 + i * 100, h = Math.abs(a) * sc;
        o += R(x, a >= 0 ? mid - h : mid, 60, h, a >= 0 ? "var(--acc2)" : "var(--bad)", "none", 3);
        o += T(x + 30, 290, labels[i], { s: 13, c: "var(--text)" }) + T(x + 30, a >= 0 ? mid - h - 6 : mid + h + 15, (Math.abs(a) < 1e-9 ? "0" : f(a, 3)), { s: 12, c: "var(--dim)" });
      });
      F.draw(o);
      var probs = st.map(function (a) { return a * a; });
      var ent = Math.abs(st[0] * st[3] - st[1] * st[2]) > 1e-9;
      F.read.innerHTML = "Chances now: " + labels.map(function (l, i) { return l + " <b>" + pct(probs[i], 0) + "</b>"; }).join(", ") + ". " +
        (ent ? "This state is <b>entangled</b>: the amplitude grid can't be split into one factor per qubit (a₀₀·a₁₁ ≠ a₀₁·a₁₀)." : "This state is a plain product of one state per qubit (a₀₀·a₁₁ = a₀₁·a₁₀).") +
        " Red bars are negative amplitudes.";
    }
    F.click("next", function () { var G = CIRCS[F.val("c")].gates; if (step < G.length) step++; else step = 0; draw(); });
    F.click("back", function () { if (step > 0) step--; draw(); });
    host.querySelector('[data-id="c"]').addEventListener("change", function () { step = 0; draw(); });
    draw();
  };

  /* =====================================================================
     M6 entanglement — CHSH value for |Φ+> with measurements in the x–z plane:
     E(a,b) = cos(a − b) (Bloch angles). S = E(a,b) − E(a,b') + E(a',b) + E(a',b')
     ===================================================================== */
  V["chsh-angle"] = function (host) {
    var F = frame(host, "Bell test: choose four measurement angles and compute the CHSH value S", 480, 290,
      [{ type: "range", id: "a", label: "Alice a =", min: 0, max: 180, step: 5, value: 0 },
       { type: "range", id: "a2", label: "Alice a′ =", min: 0, max: 180, step: 5, value: 90 },
       { type: "range", id: "b", label: "Bob b =", min: 0, max: 180, step: 5, value: 45 },
       { type: "range", id: "b2", label: "Bob b′ =", min: 0, max: 180, step: 5, value: 135 }],
      "Measurement directions for Alice and Bob, the four correlations, and the CHSH value compared with 2 and 2 root 2");
    function draw() {
      var a = F.val("a"), a2 = F.val("a2"), b = F.val("b"), b2 = F.val("b2");
      F.out("a", a + "°"); F.out("a2", a2 + "°"); F.out("b", b + "°"); F.out("b2", b2 + "°");
      var E = function (x, y) { return Math.cos((x - y) * Math.PI / 180); };
      var e = [E(a, b), -E(a, b2), E(a2, b), E(a2, b2)], S = e[0] + e[1] + e[2] + e[3];
      var cx = 100, cy = 130, Rr = 80;
      var o = C(cx, cy, Rr, "none", "var(--border)", 1.2) + T(cx, cy - Rr - 8, "z", { s: 11, c: "var(--faint)" }) + T(cx + Rr + 8, cy + 4, "x", { s: 11, c: "var(--faint)", a: "start" });
      [[a, "a", "var(--acc2)"], [a2, "a′", "var(--acc2)"], [b, "b", "var(--warn)"], [b2, "b′", "var(--warn)"]].forEach(function (d) {
        var r = d[0] * Math.PI / 180, x = cx + Rr * Math.sin(r), y = cy - Rr * Math.cos(r);
        o += A(cx, cy, x, y, d[2], 2.2) + T(cx + (Rr + 14) * Math.sin(r), cy - (Rr + 14) * Math.cos(r) + 4, d[1], { s: 13, b: true, c: d[2] });
      });
      o += T(cx, 250, "cyan: Alice, gold: Bob", { s: 12, c: "var(--dim)" });
      var names = ["E(a,b)", "−E(a,b′)", "E(a′,b)", "E(a′,b′)"], bx = 210, mid = 80, sc = 40;
      o += L(bx - 6, mid, 470, mid, "var(--border)", 1.2);
      e.forEach(function (v, i) {
        var x = bx + i * 66, h = Math.abs(v) * sc;
        o += R(x, v >= 0 ? mid - h : mid, 44, h, v >= 0 ? "var(--good)" : "var(--bad)", "none", 3);
        o += T(x + 22, 138, names[i], { s: 11, c: "var(--dim)" }) + T(x + 22, 154, (v >= 0 ? "+" : "−") + f(Math.abs(v), 3), { s: 12, c: "var(--text)" });
      });
      var X = function (v) { return bx + (v / 3) * 250; }, y = 222;
      o += L(X(0), y, X(3), y, "var(--faint)", 1.2) + R(X(0), y - 12, X(Math.min(3, Math.abs(S))) - X(0), 24, Math.abs(S) > 2 + 1e-9 ? "var(--acc2)" : "var(--panel2)", "var(--border)", 3);
      o += L(X(2), y - 22, X(2), y + 22, "var(--warn)", 2) + T(X(2), y + 38, "2: any plan", { s: 11, c: "var(--warn)" });
      o += L(X(2 * Math.SQRT2), y - 22, X(2 * Math.SQRT2), y + 22, "var(--good)", 2, "4 3") + T(X(2 * Math.SQRT2), y - 28, "2√2 ≈ 2.83", { s: 11, c: "var(--good)" });
      o += T(X(0), y - 28, "|S| = " + f(Math.abs(S), 3), { s: 14, b: true, a: "start", c: "var(--acc2)" });
      F.draw(o);
      var win = 0.5 + Math.abs(S) / 8;
      F.read.innerHTML = "For the Bell pair (|00⟩ + |11⟩)/√2 measured along angles in the x–z plane, the correlation is E = cos(angle difference). " +
        "Here S = " + e.map(function (v) { return (v >= 0 ? "+" : "−") + f(Math.abs(v), 3); }).join(" ") + " = <b>" + f(S, 3) + "</b>. " +
        (Math.abs(S) > 2 + 1e-9 ? "That breaks the limit of 2 that any pre-agreed plan obeys." : "That is inside the limit of 2, so a pre-agreed plan could fake it.") +
        " The matching CHSH game win rate is 1/2 + |S|/8 = <b>" + pct(win) + "</b> (plans top out at 75%, quantum at 85.4%). Bob's own results stay 50/50 for every setting, so nothing is signaled.";
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M7 real hardware — rough success budget: (1−e2)^G2 · (1−e1)^G1 · (1−er)^n
     ===================================================================== */
  V["fidelity-budget"] = function (host) {
    var F = frame(host, "Error budget: how deep can a circuit go before the answer drowns?", 480, 270,
      [{ type: "range", id: "e2", label: "Two-qubit gate error =", min: 0.0005, max: 0.02, step: 0.0005, value: 0.002 },
       { type: "range", id: "g2", label: "Two-qubit gates G =", min: 0, max: 3000, step: 10, value: 300 },
       { type: "range", id: "er", label: "Readout error per qubit =", min: 0, max: 0.05, step: 0.0025, value: 0.01 },
       { type: "range", id: "n", label: "Qubits measured n =", min: 1, max: 100, step: 1, value: 20 }],
      "Curve of estimated circuit success against number of two-qubit gates, with the current point marked");
    function draw() {
      var e2 = F.val("e2"), g2 = F.val("g2"), er = F.val("er"), n = F.val("n");
      F.out("e2", f(100 * e2, 2) + "%"); F.out("g2", g2.toLocaleString("en-US")); F.out("er", f(100 * er, 2) + "%"); F.out("n", n);
      var ro = Math.pow(1 - er, n), succ = function (g) { return Math.pow(1 - e2, g) * ro; }, s = succ(g2);
      var x0 = 50, x1 = 460, y0 = 30, y1 = 220, X = function (g) { return x0 + g / 3000 * (x1 - x0); }, Y = function (p) { return y1 - p * (y1 - y0); };
      var o = L(x0, y1, x1, y1, "var(--faint)", 1.2) + L(x0, y0, x0, y1, "var(--faint)", 1.2);
      [0, 0.25, 0.5, 0.75, 1].forEach(function (p) { o += T(x0 - 6, Y(p) + 4, Math.round(100 * p) + "%", { s: 11, c: "var(--faint)", a: "end" }); o += L(x0, Y(p), x1, Y(p), "var(--border)", 0.8); });
      [0, 1000, 2000, 3000].forEach(function (g) { o += T(X(g), y1 + 16, g.toLocaleString("en-US"), { s: 11, c: "var(--faint)" }); });
      o += T((x0 + x1) / 2, 256, "two-qubit gates in the circuit", { s: 12, c: "var(--dim)" });
      var pts = []; for (var g = 0; g <= 3000; g += 30) pts.push([X(g), Y(succ(g))]);
      o += P(pts, "var(--acc2)", 2.4);
      var g50 = Math.log(0.5 / ro) / Math.log(1 - e2);
      if (g50 > 0 && g50 <= 3000) o += L(X(g50), Y(0.5), X(g50), y1, "var(--warn)", 1.2, "4 3") + T(X(g50) + 4, y1 - 8, "50% at " + Math.round(g50).toLocaleString("en-US"), { s: 11, c: "var(--warn)", a: X(g50) > 360 ? "end" : "start" });
      o += C(X(g2), Y(s), 6, "var(--good)", "#0b0e14", 2) + T(Math.min(X(g2) + 10, 400), Math.max(Y(s) - 10, 44), pct(s, 1), { s: 14, b: true, c: "var(--good)", a: "start" });
      F.draw(o);
      F.read.innerHTML = "Estimated chance the whole run is error-free: (1 − " + f(e2, 4) + ")<sup>" + g2 + "</sup> × (1 − " + f(er, 4) + ")<sup>" + n + "</sup> = <b>" + pct(s, 1) + "</b>. " +
        "This is a rough model: it ignores single-qubit gates, idle time and crosstalk, and errors are not always fatal to the answer. Mitigation can stretch it a little; error correction (Module 10) is the real fix.";
    }
    F.on(draw); draw();
  };

  var P2 = P;  // polyline helper alias (P is shadowed inside some builders)
  /* =====================================================================
     M8 Grover — success chance after k iterations: sin²((2k+1)θ), θ = asin(1/√N)
     ===================================================================== */
  V["grover-curve"] = function (host) {
    var F = frame(host, "Grover's search: chance of finding the one marked item after k rounds", 480, 270,
      [{ type: "range", id: "nq", label: "Search space N = 2^n, n =", min: 2, max: 20, step: 1, value: 3 },
       { type: "range", id: "k", label: "Grover rounds k =", min: 0, max: 100, step: 1, value: 2 }],
      "Curve of success probability against number of Grover iterations, with the optimal round and the current round marked");
    function draw() {
      var n = F.val("nq"), N = Math.pow(2, n), th = Math.asin(1 / Math.sqrt(N)), kopt = Math.floor(Math.PI / (4 * th));
      var kmax = Math.max(3, Math.ceil(2.6 * kopt) + 1), kin = host.querySelector('[data-id="k"]');
      kin.max = kmax; var k = Math.min(F.val("k"), kmax);
      F.out("nq", n + " (N = " + N.toLocaleString("en-US") + ")"); F.out("k", k);
      var P = function (kk) { var s = Math.sin((2 * kk + 1) * th); return s * s; };
      var x0 = 46, x1 = 460, y0 = 30, y1 = 220, X = function (kk) { return x0 + kk / kmax * (x1 - x0); }, Y = function (p) { return y1 - p * (y1 - y0); };
      var o = L(x0, y1, x1, y1, "var(--faint)", 1.2) + L(x0, y0, x0, y1, "var(--faint)", 1.2);
      [0, 0.5, 1].forEach(function (p) { o += T(x0 - 6, Y(p) + 4, Math.round(100 * p) + "%", { s: 11, c: "var(--faint)", a: "end" }); o += L(x0, Y(p), x1, Y(p), "var(--border)", 0.8); });
      var pts = [], steps = Math.min(400, kmax * 8);
      for (var i = 0; i <= steps; i++) { var kk = i / steps * kmax; pts.push([X(kk), Y(P(kk))]); }
      o += P2(pts, "rgba(34,211,238,.35)", 1.4);
      for (var j = 0; j <= kmax && kmax <= 120; j++) o += C(X(j), Y(P(j)), kmax > 60 ? 1.6 : 3, "var(--acc2)", "none");
      o += L(X(kopt), y0, X(kopt), y1, "var(--good)", 1.4, "4 3") + T(X(kopt), y1 + 16, "best k = " + kopt, { s: 12, c: "var(--good)" });
      o += C(X(k), Y(P(k)), 6, "var(--warn)", "#0b0e14", 2) + T(Math.min(X(k) + 10, 410), Math.max(Y(P(k)) - 10, 44), pct(P(k), 1), { s: 14, b: true, c: "var(--warn)", a: "start" });
      o += T((x0 + x1) / 2, 258, "Grover rounds k (dots are whole rounds)", { s: 12, c: "var(--dim)" });
      F.draw(o);
      F.read.innerHTML = "θ = asin(1/√N) = " + f(th, 4) + " rad, and after k rounds P = sin²((2k + 1)θ) = <b>" + pct(P(k), 1) + "</b>. The best round is k = " + kopt +
        " ≈ (π/4)√N, with P = " + pct(P(kopt), 2) + ". Checking one item at a time would need about N/2 = " + (N / 2).toLocaleString("en-US") + " tries on average. Go past the best round and the chance falls again: Grover overshoots.";
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M8 Hamiltonian simulation — the lesson's 3-qubit Ising chain:
     H = J(Z0Z1 + Z1Z2) + h(X0 + X1 + X2), J = 1, h = 0.8, from |000>.
     Exact e^{-iHt} via Jacobi eigen-decomposition (H is real symmetric),
     Trotter circuits built from Rx(2h dt) and exp(-i J dt ZZ), error = ||psi_trot - psi_exact||.
     ===================================================================== */
  /* @@HAM-CORE-START */
  var HAM = (function () {
    var n = 3, D = 8, J = 1.0, h = 0.8;
    function bit(i, q) { return (i >> (n - 1 - q)) & 1; }
    function buildH() {
      var Hm = []; for (var i = 0; i < D; i++) { Hm.push(new Array(D).fill(0)); }
      for (var i2 = 0; i2 < D; i2++) {
        for (var q = 0; q < n - 1; q++) Hm[i2][i2] += J * (bit(i2, q) === bit(i2, q + 1) ? 1 : -1);
        for (var q2 = 0; q2 < n; q2++) Hm[i2][i2 ^ (1 << (n - 1 - q2))] += h;
      }
      return Hm;
    }
    function jacobi(A0) {
      var A = A0.map(function (r) { return r.slice(); }), V = [];
      for (var i = 0; i < D; i++) { V.push(new Array(D).fill(0)); V[i][i] = 1; }
      for (var sweep = 0; sweep < 100; sweep++) {
        var off = 0; for (var p = 0; p < D; p++) for (var q = p + 1; q < D; q++) off += A[p][q] * A[p][q];
        if (off < 1e-26) break;
        for (var p2 = 0; p2 < D; p2++) for (var q3 = p2 + 1; q3 < D; q3++) {
          if (Math.abs(A[p2][q3]) < 1e-300) continue;
          var th = (A[q3][q3] - A[p2][p2]) / (2 * A[p2][q3]);
          var tt = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(tt * tt + 1), s = tt * c;
          for (var k = 0; k < D; k++) { var akp = A[k][p2], akq = A[k][q3]; A[k][p2] = c * akp - s * akq; A[k][q3] = s * akp + c * akq; }
          for (var k2 = 0; k2 < D; k2++) { var apk = A[p2][k2], aqk = A[q3][k2]; A[p2][k2] = c * apk - s * aqk; A[q3][k2] = s * apk + c * aqk; }
          for (var k3 = 0; k3 < D; k3++) { var vkp = V[k3][p2], vkq = V[k3][q3]; V[k3][p2] = c * vkp - s * vkq; V[k3][q3] = s * vkp + c * vkq; }
        }
      }
      return { E: A.map(function (r, i) { return r[i]; }), V: V };
    }
    var EIG = jacobi(buildH());
    function exact(t) {  // V diag(e^{-iEt}) V^T |000>
      var re = new Array(D).fill(0), im = new Array(D).fill(0);
      for (var m = 0; m < D; m++) {
        var c0 = EIG.V[0][m], ph = -EIG.E[m] * t, cr = Math.cos(ph) * c0, ci = Math.sin(ph) * c0;
        for (var i = 0; i < D; i++) { re[i] += EIG.V[i][m] * cr; im[i] += EIG.V[i][m] * ci; }
      }
      return [re, im];
    }
    function rx(st, q, theta) {
      var c = Math.cos(theta / 2), s = Math.sin(theta / 2), m = 1 << (n - 1 - q), re = st[0], im = st[1];
      for (var i = 0; i < D; i++) {
        if (i & m) continue; var j = i | m;
        var ar = re[i], ai = im[i], br = re[j], bi = im[j];
        re[i] = c * ar + s * bi; im[i] = c * ai - s * br;   // c·a − i s·b
        re[j] = c * br + s * ai; im[j] = c * bi - s * ar;   // −i s·a + c·b
      }
    }
    function zz(st, a, b, theta) {  // exp(-i theta Z_a Z_b)
      for (var i = 0; i < D; i++) {
        var z = bit(i, a) === bit(i, b) ? 1 : -1, ph = -theta * z, c = Math.cos(ph), s = Math.sin(ph), r = st[0][i], m = st[1][i];
        st[0][i] = c * r - s * m; st[1][i] = c * m + s * r;
      }
    }
    function trotter(r, order, t) {
      var st = [new Array(D).fill(0), new Array(D).fill(0)], dt = t / r; st[0][0] = 1;
      for (var step = 0; step < r; step++) {
        var q;
        if (order === 1) { for (q = 0; q < n; q++) rx(st, q, 2 * h * dt); for (q = 0; q < n - 1; q++) zz(st, q, q + 1, J * dt); }
        else { for (q = 0; q < n; q++) rx(st, q, h * dt); for (q = 0; q < n - 1; q++) zz(st, q, q + 1, J * dt); for (q = 0; q < n; q++) rx(st, q, h * dt); }
      }
      return st;
    }
    function err(r, order, t) {
      var a = trotter(r, order, t), e = exact(t), s = 0;
      for (var i = 0; i < D; i++) { var dr = a[0][i] - e[0][i], di = a[1][i] - e[1][i]; s += dr * dr + di * di; }
      return Math.sqrt(s);
    }
    return { err: err, cnots: function (r) { return 2 * (n - 1) * r; } };
  })();
  /* @@HAM-CORE-END */
  V["trotter-error"] = function (host) {
    var F = frame(host, "Trotter steps: more steps, smaller error, more gates", 480, 280,
      [{ type: "range", id: "r", label: "Trotter steps r =", min: 1, max: 64, step: 1, value: 4 },
       { type: "range", id: "t", label: "Evolution time t =", min: 0.25, max: 3, step: 0.25, value: 1 }],
      "Log-log plot of first- and second-order Trotter error against the number of steps for the lesson's 3-qubit Ising chain");
    function draw() {
      var r = F.val("r"), t = F.val("t"); F.out("r", r); F.out("t", f(t, 2));
      var x0 = 56, x1 = 460, y0 = 24, y1 = 220, lmin = -7, lmax = 1;
      var X = function (rr) { return x0 + Math.log2(rr) / 6 * (x1 - x0); }, Y = function (e) { var l = Math.log10(Math.max(e, 1e-7)); return y1 - (l - lmin) / (lmax - lmin) * (y1 - y0); };
      var o = L(x0, y1, x1, y1, "var(--faint)", 1.2) + L(x0, y0, x0, y1, "var(--faint)", 1.2);
      for (var l = lmin; l <= lmax; l += 2) { o += L(x0, Y(Math.pow(10, l)), x1, Y(Math.pow(10, l)), "var(--border)", 0.8); o += T(x0 - 6, Y(Math.pow(10, l)) + 4, "10" + sup(l), { s: 11, c: "var(--faint)", a: "end" }); }
      [1, 2, 4, 8, 16, 32, 64].forEach(function (rr) { o += T(X(rr), y1 + 16, String(rr), { s: 11, c: "var(--faint)" }); });
      var p1 = [], p2 = [];
      for (var rr = 1; rr <= 64; rr++) { p1.push([X(rr), Y(HAM.err(rr, 1, t))]); p2.push([X(rr), Y(HAM.err(rr, 2, t))]); }
      o += P2(p1, "var(--warn)", 2.2) + P2(p2, "var(--acc2)", 2.2);
      var e1 = HAM.err(r, 1, t), e2 = HAM.err(r, 2, t);
      o += L(X(r), y0, X(r), y1, "var(--good)", 1.2, "4 3") + C(X(r), Y(e1), 5, "var(--warn)", "#0b0e14", 1.5) + C(X(r), Y(e2), 5, "var(--acc2)", "#0b0e14", 1.5);
      o += T(x1, 40, "1st order", { s: 12, c: "var(--warn)", a: "end" }) + T(x1, 58, "2nd order", { s: 12, c: "var(--acc2)", a: "end" });
      o += T((x0 + x1) / 2, 254, "Trotter steps r (log scale)   ·   CNOTs = 4r = " + HAM.cnots(r), { s: 12, c: "var(--dim)" });
      F.draw(o);
      var d1 = r <= 32 ? HAM.err(r, 1, t) / HAM.err(2 * r, 1, t) : null, d2 = r <= 32 ? HAM.err(r, 2, t) / HAM.err(2 * r, 2, t) : null;
      F.read.innerHTML = "Exact answer vs Trotter circuit for H = Z0Z1 + Z1Z2 + 0.8(X0 + X1 + X2) from |000⟩. At r = " + r + ": 1st-order error <b>" + e1.toExponential(2) +
        "</b>, 2nd-order error <b>" + e2.toExponential(2) + "</b>, using " + HAM.cnots(r) + " CNOTs." +
        (d1 ? " Doubling r shrinks them ×" + f(d1, 2) + " and ×" + f(d2, 2) + " (the 1/r and 1/r² laws)." : "") +
        " On real hardware every extra CNOT adds noise, so the best r is a trade-off.";
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M9 noise — T1/T2 shrink the Bloch vector (x–z slice):
     x(t) = x0·e^(−t/T2),  z(t) = 1 − (1 − z0)·e^(−t/T1),  T2 ≤ 2·T1
     ===================================================================== */
  V["bloch-shrink"] = function (host) {
    var F = frame(host, "Leave a qubit alone and watch T1 and T2 shrink its Bloch arrow", 480, 280,
      [{ type: "range", id: "th", label: "Start angle θ from |0⟩ =", min: 0, max: 180, step: 5, value: 90 },
       { type: "range", id: "t1", label: "T1 (µs) =", min: 10, max: 400, step: 10, value: 150 },
       { type: "range", id: "t2", label: "T2 (µs) =", min: 10, max: 400, step: 10, value: 100 },
       { type: "range", id: "t", label: "Waiting time t (µs) =", min: 0, max: 400, step: 5, value: 60 }],
      "A slice of the Bloch sphere with the starting arrow, the decayed arrow and the path between them");
    function draw() {
      var th = F.val("th") * Math.PI / 180, T1 = F.val("t1"), T2raw = F.val("t2"), T2 = Math.min(T2raw, 2 * T1), t = F.val("t");
      F.out("th", F.val("th") + "°"); F.out("t1", T1); F.out("t2", T2raw + (T2raw > 2 * T1 ? " → " + T2 : "")); F.out("t", t);
      var x0 = Math.sin(th), z0 = Math.cos(th);
      var at = function (tt) { return [x0 * Math.exp(-tt / T2), 1 - (1 - z0) * Math.exp(-tt / T1)]; };
      var cx = 140, cy = 140, Rr = 110, v = at(t);
      var o = C(cx, cy, Rr, "none", "var(--faint)", 1.3) + L(cx - Rr - 8, cy, cx + Rr + 8, cy, "var(--border)", 1) + L(cx, cy - Rr - 8, cx, cy + Rr + 8, "var(--border)", 1);
      o += T(cx, cy - Rr - 12, "|0⟩", { s: 12, c: "var(--good)" }) + T(cx, cy + Rr + 22, "|1⟩", { s: 12, c: "var(--warn)" }) + T(cx + Rr + 6, cy - 6, "x", { s: 11, c: "var(--faint)", a: "start" });
      var pts = []; for (var k = 0; k <= 80; k++) { var p = at(k / 80 * t); pts.push([cx + Rr * p[0], cy - Rr * p[1]]); }
      o += P(pts, "var(--warn)", 1.6);
      o += A(cx, cy, cx + Rr * x0, cy - Rr * z0, "var(--faint)", 2);
      o += A(cx, cy, cx + Rr * v[0], cy - Rr * v[1], "var(--acc2)", 3);
      var len = Math.hypot(v[0], v[1]), p0 = (1 + v[1]) / 2;
      var bx = 300;
      o += T(bx, 40, "arrow length: " + f(len, 3), { s: 14, b: true, a: "start", c: "var(--acc2)" });
      o += T(bx, 66, "coherence |x| = " + f(Math.abs(v[0]), 3), { s: 13, a: "start" });
      o += T(bx, 88, "height z = " + f(v[1], 3), { s: 13, a: "start" });
      o += T(bx, 110, "P(0) = (1 + z)/2 = " + f(p0, 3), { s: 13, a: "start", c: "var(--good)" });
      var gates = Math.floor(t / 0.05);
      o += T(bx, 150, "≈ " + gates.toLocaleString("en-US") + " gates of 50 ns (assumed)", { s: 12, a: "start", c: "var(--dim)" });
      o += T(bx, 168, "fit inside this wait", { s: 12, a: "start", c: "var(--dim)" });
      o += T(bx, 190, "T1 = " + T1 + " µs, T2 = " + T2 + " µs", { s: 12, a: "start", c: "var(--text)" });
      o += T(bx, 210, "gray: start", { s: 12, a: "start", c: "var(--faint)" }) + T(bx, 228, "cyan: after t µs", { s: 12, a: "start", c: "var(--acc2)" }) + T(bx, 246, "gold: the path", { s: 12, a: "start", c: "var(--warn)" });
      F.draw(o);
      F.read.innerHTML = "x(t) = x₀·e^(−t/T2) and z(t) = 1 − (1 − z₀)·e^(−t/T1). The arrow shrinks toward the inside of the sphere (a mixed state) and drifts to |0⟩, the ground state. " +
        (T2raw > 2 * T1 ? "T2 was clamped to 2·T1 = " + 2 * T1 + " µs: physics never allows more. " : "") +
        "Start at |0⟩ (θ = 0) and nothing happens, because the qubit is already at rest. Start at |1⟩ and only T1 acts.";
    }
    F.on(draw); draw();
  };

  /* =====================================================================
     M10 QEC — repetition code with majority vote: P_L = Σ_{k > d/2} C(d,k) p^k (1−p)^(d−k)
     ===================================================================== */
  V["rep-code"] = function (host) {
    var F = frame(host, "Repetition code: when does copying a bit and voting actually help?", 480, 280,
      [{ type: "range", id: "p", label: "Physical flip chance p =", min: 0.001, max: 0.6, step: 0.001, value: 0.05 },
       { type: "select", id: "d", label: "Copies d", value: "3", options: [["1", "1 (no code)"], ["3", "3"], ["5", "5"], ["7", "7"], ["9", "9"]] }],
      "Log-scale curves of logical error against physical error for repetition codes of 1, 3, 5, 7 and 9 copies");
    function binom(n, k) { var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
    function PL(p, d) { var s = 0; for (var k = Math.floor(d / 2) + 1; k <= d; k++) s += binom(d, k) * Math.pow(p, k) * Math.pow(1 - p, d - k); return s; }
    function draw() {
      var p = F.val("p"), d = +F.val("d"); F.out("p", f(p, 3));
      var x0 = 56, x1 = 460, y0 = 24, y1 = 220, lmin = -8, X = function (q) { return x0 + (Math.log10(q) + 3) / Math.log10(600) * (x1 - x0); };
      var Y = function (v) { var l = Math.log10(Math.max(v, 1e-8)); return y1 - (l - lmin) / (0 - lmin) * (y1 - y0); };
      var o = L(x0, y1, x1, y1, "var(--faint)", 1.2) + L(x0, y0, x0, y1, "var(--faint)", 1.2);
      for (var l = lmin; l <= 0; l += 2) { o += L(x0, Y(Math.pow(10, l)), x1, Y(Math.pow(10, l)), "var(--border)", 0.8); o += T(x0 - 6, Y(Math.pow(10, l)) + 4, "10" + sup(l), { s: 11, c: "var(--faint)", a: "end" }); }
      [0.001, 0.01, 0.1, 0.5].forEach(function (q) { o += T(X(q), y1 + 16, String(q), { s: 11, c: "var(--faint)" }); });
      o += L(X(0.5), y0, X(0.5), y1, "var(--warn)", 1.2, "4 3") + T(X(0.5) - 4, y0 + 12, "p = 0.5", { s: 11, c: "var(--warn)", a: "end" });
      var cols = { 1: "var(--faint)", 3: "var(--acc2)", 5: "#b9a9ff", 7: "var(--good)", 9: "#fcd77a" };
      [1, 3, 5, 7, 9].forEach(function (dd) {
        var pts = []; for (var i = 0; i <= 120; i++) { var q = Math.pow(10, -3 + i / 120 * Math.log10(600)); pts.push([X(q), Y(PL(q, dd))]); }
        o += P(pts, cols[dd], dd === d ? 3 : 1.2);
      });
      var v = PL(p, d), v1 = p;
      o += C(X(p), Y(v), 6, cols[d], "#0b0e14", 2) + C(X(p), Y(v1), 4, "var(--faint)", "none");
      o += T((x0 + x1) / 2, 254, "physical flip chance p (log scale); bold curve = " + d + " copies", { s: 12, c: "var(--dim)" });
      F.draw(o);
      var better = v < p;
      F.read.innerHTML = "With " + d + " copies and majority vote, the stored bit is wrong only if more than half flip: P = <b>" + v.toExponential(2) + "</b> vs " + p.toExponential(2) + " with no code. " +
        (d === 3 ? "(That is 3p² − 2p³.) " : "") + (d === 1 ? "One copy is just the bare bit." : better ? "Coding <b>helps</b> here, and more copies help more." : "Coding <b>hurts</b> here: above p = 0.5 voting picks the wrong answer more often.") +
        " This only fixes bit flips; real codes like the surface code also catch phase flips, and their break-even point (threshold) is about 1%.";
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
