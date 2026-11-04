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
