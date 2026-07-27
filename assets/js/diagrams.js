/* Quantum Computing course — diagram pack.
   One IIFE registering SVG strings onto window.DIAGRAMS by key.
   Canvas is 640 wide; all geometry kept within 0..640 x 0..H.
   Verified by tools/check-diagrams.js (bounds / overflow / arrowheads) + visual render. */
(function () {
  const C = {
    card: "#11151f", cardEdge: "#232a3a", tx: "#e6eaf2", dim: "#9aa5b8", faint: "#6b7688",
    box: "#161b28", boxS: "#2b3448",
    acc: "#7c5cff", accS: "#7c5cff", accT: "#b9a9ff", accFill: "#1d1836",
    cyan: "#22d3ee", cyanT: "#8ce9f6", cyanFill: "#0d2b31",
    good: "#34d399", goodT: "#8ff0c8", goodFill: "#123528",
    warn: "#fbbf24", warnT: "#fcd77a", warnFill: "#332810",
    bad: "#f87171", badT: "#fbb0b0", badFill: "#3a1c1c",
    line: "#8a97aa"
  };
  const F = "font-family:Segoe UI,Inter,system-ui,sans-serif";
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const box = (x, y, w, h, o = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 9}" style="fill:${o.fill || C.box};stroke:${o.stroke || C.boxS};stroke-width:${o.sw || 1.6}"/>`;
  const circ = (x, y, r, o = {}) =>
    `<circle cx="${x}" cy="${y}" r="${r}" style="fill:${o.fill || C.box};stroke:${o.stroke || C.boxS};stroke-width:${o.sw || 1.6}"/>`;
  const t = (x, y, s, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.a || "middle"}" style="fill:${o.fill || C.tx};font-size:${o.size || 13}px;font-weight:${o.bold ? 700 : 400};${F}">${esc(s)}</text>`;
  const ln = (x1, y1, x2, y2, o = {}) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${o.stroke || C.line};stroke-width:${o.sw || 1.8};${o.dash ? `stroke-dasharray:${o.dash}` : ""}"/>`;
  // arrowheads: tip sits exactly on (x2,y2); base near the line
  const triR = (x, y, o = {}) => `<polygon points="${x - 8},${y - 5} ${x},${y} ${x - 8},${y + 5}" style="fill:${o.stroke || C.line}"/>`;
  const triL = (x, y, o = {}) => `<polygon points="${x + 8},${y - 5} ${x},${y} ${x + 8},${y + 5}" style="fill:${o.stroke || C.line}"/>`;
  const triD = (x, y, o = {}) => `<polygon points="${x - 5},${y - 8} ${x},${y} ${x + 5},${y - 8}" style="fill:${o.stroke || C.line}"/>`;
  const triU = (x, y, o = {}) => `<polygon points="${x - 5},${y + 8} ${x},${y} ${x + 5},${y + 8}" style="fill:${o.stroke || C.line}"/>`;
  const arrR = (x1, y, x2, o = {}) => ln(x1, y, x2, y, o) + triR(x2, y, o);
  const arrL = (x1, y, x2, o = {}) => ln(x1, y, x2, y, o) + triL(x2, y, o);
  const arrD = (x, y1, y2, o = {}) => ln(x, y1, x, y2, o) + triD(x, y2, o);
  const arrU = (x, y1, y2, o = {}) => ln(x, y1, x, y2, o) + triU(x, y2, o);
  const svg = (h, body, label) =>
    `<svg viewBox="0 0 640 ${h}" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="640" height="${h}" rx="12" style="fill:${C.card};stroke:${C.cardEdge};stroke-width:1"/>${body}</svg>`;
  const D = {};

  // ---- M0: course-map ----
  D["course-map"] = (() => {
    let b = t(320, 26, "Your path — each stage stands on the previous", { bold: true, size: 15 });
    const items = [
      ["Math", C.acc, C.accT], ["Python", C.acc, C.accT], ["Quantum", C.cyan, C.cyanT],
      ["Qiskit", C.cyan, C.cyanT], ["Algorithms", C.good, C.goodT], ["Career", C.good, C.goodT]
    ];
    let x = 24;
    const w = 88, gap = 10, y = 60, h = 46;
    items.forEach((it, i) => {
      b += box(x, y, w, h, { fill: C.box, stroke: it[1] }) + t(x + w / 2, y + 28, it[0], { fill: it[2], size: 13, bold: true });
      if (i < items.length - 1) b += arrR(x + w + 1, y + h / 2, x + w + gap - 1, { stroke: C.faint });
      x += w + gap;
    });
    b += t(320, 130, "Skipping ahead is how people stay confused for years.", { fill: C.dim, size: 12 });
    return svg(150, b, "course roadmap of six stages");
  })();

  // ---- M0: bit-vs-qubit ----
  D["bit-vs-qubit"] = (() => {
    let b = t(160, 26, "Classical bit", { bold: true, fill: C.accT });
    b += t(480, 26, "Qubit", { bold: true, fill: C.cyanT });
    b += ln(320, 40, 320, 210, { stroke: C.cardEdge, dash: "4 4" });
    // bit: a switch 0/1
    b += box(90, 60, 140, 44, { stroke: C.acc }) + t(160, 88, "0  or  1", { size: 15, bold: true });
    b += t(160, 140, "one of two", { fill: C.dim, size: 12 });
    b += t(160, 160, "definite values", { fill: C.dim, size: 12 });
    // qubit: sphere with a direction
    b += circ(480, 120, 62, { fill: "none", stroke: C.cyan, sw: 1.6 });
    b += ln(480, 120, 520, 78, { stroke: C.cyanT, sw: 2.4 }) + triR(520, 78, { stroke: C.cyanT });
    b += t(480, 56, "|0>", { fill: C.dim, size: 11 });
    b += t(480, 196, "|1>", { fill: C.dim, size: 11 });
    b += t(480, 220, "any direction on a sphere", { fill: C.dim, size: 12 });
    return svg(238, b, "a bit is a switch, a qubit is a direction");
  })();

  // ---- M0: double-slit ----
  D["double-slit"] = (() => {
    let b = t(320, 24, "Double-slit: single particles, interference stripes", { bold: true, size: 14 });
    b += circ(60, 110, 12, { fill: C.accFill, stroke: C.acc });
    b += arrR(74, 110, 150, { stroke: C.faint });
    // barrier with two slits
    b += box(150, 50, 14, 46, { fill: C.boxS, stroke: C.boxS });
    b += box(150, 106, 14, 22, { fill: C.boxS, stroke: C.boxS });
    b += box(150, 138, 14, 46, { fill: C.boxS, stroke: C.boxS });
    b += t(157, 205, "two slits", { fill: C.dim, size: 11 });
    // paths
    b += ln(164, 100, 470, 70, { stroke: C.cyan, dash: "3 3", sw: 1.4 });
    b += ln(164, 134, 470, 164, { stroke: C.cyan, dash: "3 3", sw: 1.4 });
    // screen with fringes
    b += box(470, 46, 16, 148, { fill: C.box, stroke: C.boxS });
    for (let i = 0; i < 7; i++) {
      const yy = 56 + i * 20, on = i % 2 === 0;
      b += `<rect x="472" y="${yy}" width="12" height="10" rx="2" style="fill:${on ? C.cyan : "#1b2130"}"/>`;
    }
    b += t(540, 96, "bright", { fill: C.cyanT, size: 11, a: "start" });
    b += t(540, 150, "dark", { fill: C.faint, size: 11, a: "start" });
    b += t(320, 220, "Watch which slit -> stripes vanish.", { fill: C.dim, size: 12 });
    return svg(236, b, "double slit experiment with interference fringes");
  })();

  // ---- M0: setup-flow ----
  D["setup-flow"] = (() => {
    let b = t(320, 24, "Lab setup — pass each checkpoint before the next", { bold: true, size: 14 });
    const steps = ["Python 3.12", "VS Code", "venv + pip", "Qiskit 2.x", "IBM account"];
    let x = 20; const w = 108, gap = 12, y = 56, h = 44;
    steps.forEach((s, i) => {
      const last = i === steps.length - 1;
      b += box(x, y, w, h, { stroke: last ? C.good : C.boxS, fill: last ? C.goodFill : C.box });
      b += t(x + w / 2, y + 27, s, { size: 12, fill: last ? C.goodT : C.tx });
      if (i < steps.length - 1) b += arrR(x + w + 1, y + h / 2, x + w + gap - 1, { stroke: C.faint });
      x += w + gap;
    });
    b += t(320, 132, "Green = checkpoint: verify it works before moving on.", { fill: C.dim, size: 12 });
    return svg(150, b, "setup checkpoints in order");
  })();

  // ---- M1: number-line ----
  D["number-line"] = (() => {
    let b = t(320, 26, "The number line", { bold: true });
    const y = 90, x0 = 40, x1 = 600, mid = 320, step = (x1 - x0) / 8;
    b += ln(x0, y, x1, y, { stroke: C.line, sw: 2 }) + triR(x1, y) + triL(x0, y);
    for (let i = 0; i <= 8; i++) {
      const x = x0 + i * step, val = i - 4;
      b += ln(x, y - 6, x, y + 6, { stroke: C.faint, sw: 1.4 });
      b += t(x, y + 26, String(val), { fill: val === 0 ? C.accT : C.dim, size: 12, bold: val === 0 });
    }
    b += t(mid, y - 18, "0", { fill: C.accT, size: 11 });
    b += t(160, 138, "negatives", { fill: C.dim, size: 12 });
    b += t(480, 138, "positives", { fill: C.dim, size: 12 });
    b += t(320, 160, "distance from 0 = absolute value", { fill: C.faint, size: 11 });
    return svg(176, b, "number line with negatives and positives");
  })();

  // ---- M1: unit-circle ----
  D["unit-circle"] = (() => {
    const cx = 200, cy = 150, R = 96;
    let b = t(320, 24, "The unit circle: cos = x, sin = y", { bold: true, size: 14 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.cyan, sw: 1.6 });
    b += ln(cx - R - 16, cy, cx + R + 16, cy, { stroke: C.boxS }) + ln(cx, cy - R - 16, cx, cy + R + 16, { stroke: C.boxS });
    const ang = -37 * Math.PI / 180, px = cx + R * Math.cos(ang), py = cy + R * Math.sin(ang);
    b += ln(cx, cy, px, py, { stroke: C.cyanT, sw: 2.4 });
    b += circ(px, py, 5, { fill: C.cyan, stroke: C.cyanT });
    b += ln(px, py, px, cy, { stroke: C.good, dash: "3 3", sw: 1.5 });
    b += ln(cx, cy, px, cy, { stroke: C.acc, dash: "3 3", sw: 1.5 });
    b += t((cx + px) / 2, cy + 18, "cos θ", { fill: C.accT, size: 12 });
    b += t(px + 30, (cy + py) / 2, "sin θ", { fill: C.goodT, size: 12 });
    b += t(cx + 34, cy - 10, "θ", { fill: C.cyanT, size: 13 });
    // right panel
    b += t(470, 80, "point at angle θ", { fill: C.dim, size: 12, a: "start" });
    b += t(430, 110, "= (cos θ, sin θ)", { fill: C.tx, size: 13, a: "start" });
    b += t(430, 150, "cos²θ + sin²θ = 1", { fill: C.cyanT, size: 13, a: "start" });
    b += t(430, 176, "(always — Pythagoras)", { fill: C.faint, size: 11, a: "start" });
    b += t(430, 214, "= free normalization", { fill: C.goodT, size: 12, a: "start" });
    b += t(430, 236, "for qubit amplitudes", { fill: C.faint, size: 11, a: "start" });
    return svg(268, b, "unit circle defining sine and cosine as coordinates");
  })();

  // ---- M1: radian-def ----
  D["radian-def"] = (() => {
    const cx = 200, cy = 145, R = 96;
    let b = t(320, 24, "One radian = arc length equal to the radius", { bold: true, size: 14 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.boxS, sw: 1.4 });
    b += ln(cx, cy, cx + R, cy, { stroke: C.accT, sw: 2.2 });
    const a = 1; // 1 rad
    b += ln(cx, cy, cx + R * Math.cos(a), cy - R * Math.sin(a), { stroke: C.accT, sw: 2.2 });
    // arc
    b += `<path d="M ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx + R * Math.cos(a)} ${cy - R * Math.sin(a)}" style="fill:none;stroke:${C.cyan};stroke-width:3"/>`;
    b += t(cx + 70, cy - 44, "arc = r", { fill: C.cyanT, size: 12 });
    b += t(cx + 50, cy + 20, "r", { fill: C.accT, size: 12 });
    b += t(cx + 20, cy - 28, "1 rad", { fill: C.tx, size: 11 });
    b += t(470, 110, "full circle", { fill: C.dim, size: 12, a: "start" });
    b += t(470, 138, "= 2π radians", { fill: C.cyanT, size: 14, a: "start" });
    b += t(470, 168, "≈ 6.283", { fill: C.faint, size: 12, a: "start" });
    b += t(470, 206, "code uses radians", { fill: C.warnT, size: 11, a: "start" });
    b += t(470, 226, "always", { fill: C.warnT, size: 11, a: "start" });
    return svg(258, b, "definition of a radian");
  })();

  // ---- M1: vector-components ----
  D["vector-components"] = (() => {
    const ox = 90, oy = 210;
    let b = t(320, 24, "One vector, two languages", { bold: true, size: 14 });
    b += ln(ox, oy, ox + 260, oy, { stroke: C.boxS }) + triR(ox + 260, oy, { stroke: C.boxS });
    b += ln(ox, oy, ox, oy - 180, { stroke: C.boxS }) + triU(ox, oy - 180, { stroke: C.boxS });
    const vx = 180, vy = 120;
    b += ln(ox, oy, ox + vx, oy - vy, { stroke: C.cyanT, sw: 2.6 }) + triR(ox + vx, oy - vy, { stroke: C.cyanT });
    b += ln(ox, oy - vy, ox + vx, oy - vy, { stroke: C.acc, dash: "3 3" });
    b += ln(ox + vx, oy, ox + vx, oy - vy, { stroke: C.good, dash: "3 3" });
    b += t(ox + vx / 2, oy + 20, "3 right", { fill: C.accT, size: 12 });
    b += t(ox + vx + 40, oy - vy / 2, "2 up", { fill: C.goodT, size: 12 });
    b += t(ox + vx - 6, oy - vy - 12, "v", { fill: C.cyanT, size: 14, bold: true });
    b += box(430, 90, 150, 80, { stroke: C.cyan });
    b += t(505, 122, "arrow  =  (3, 2)", { size: 13 });
    b += t(505, 148, "geometry = algebra", { fill: C.dim, size: 11 });
    return svg(248, b, "vector as arrow and as components");
  })();

  // ---- M1: dot-projection ----
  D["dot-projection"] = (() => {
    const ox = 110, oy = 200;
    let b = t(320, 24, "Dot product = overlap (projection)", { bold: true, size: 14 });
    b += ln(ox, oy, ox + 240, oy, { stroke: C.accT, sw: 2.4 }) + triR(ox + 240, oy, { stroke: C.accT });
    b += t(ox + 250, oy + 4, "u", { fill: C.accT, size: 14, a: "start", bold: true });
    const a = -40 * Math.PI / 180, L = 150;
    const vx = ox + L * Math.cos(a), vy = oy + L * Math.sin(a);
    b += ln(ox, oy, vx, vy, { stroke: C.cyanT, sw: 2.4 }) + triR(vx, vy, { stroke: C.cyanT });
    b += t(vx + 12, vy - 4, "v", { fill: C.cyanT, size: 14, a: "start", bold: true });
    // projection of v onto u (horizontal)
    const proj = L * Math.cos(a);
    b += ln(vx, vy, ox + proj, oy, { stroke: C.good, dash: "3 3" });
    b += ln(ox, oy - 3, ox + proj, oy - 3, { stroke: C.good, sw: 3 });
    b += t(ox + proj / 2, oy - 12, "shadow of v on u", { fill: C.goodT, size: 11 });
    b += t(ox + 34, oy - 14, "θ", { fill: C.dim, size: 12 });
    b += t(470, 150, "u·v = |u||v|cos θ", { fill: C.tx, size: 13, a: "start" });
    b += t(470, 180, "θ = 90° → 0", { fill: C.warnT, size: 12, a: "start" });
    b += t(470, 202, "(orthogonal)", { fill: C.faint, size: 11, a: "start" });
    return svg(240, b, "dot product as projection of one vector on another");
  })();

  // ---- M2: complex-plane ----
  D["complex-plane"] = (() => {
    const cx = 210, cy = 150;
    let b = t(320, 24, "The complex plane: z = a + bi", { bold: true, size: 14 });
    b += ln(cx - 150, cy, cx + 150, cy, { stroke: C.boxS }) + triR(cx + 150, cy, { stroke: C.boxS });
    b += ln(cx, cy + 110, cx, cy - 110, { stroke: C.boxS }) + triU(cx, cy - 110, { stroke: C.boxS });
    b += t(cx + 158, cy + 4, "Re", { fill: C.dim, size: 11, a: "start" });
    b += t(cx + 8, cy - 108, "Im", { fill: C.dim, size: 11, a: "start" });
    const px = cx + 110, py = cy - 78;
    b += ln(cx, cy, px, py, { stroke: C.cyanT, sw: 2.4 }) + triR(px, py, { stroke: C.cyanT });
    b += circ(px, py, 5, { fill: C.cyan, stroke: C.cyanT });
    b += ln(px, cy, px, py, { stroke: C.good, dash: "3 3" });
    b += t(px + 16, py - 6, "z", { fill: C.cyanT, size: 14, bold: true });
    b += t((cx + px) / 2, cy + 18, "a", { fill: C.accT, size: 12 });
    b += t(px + 14, (cy + py) / 2, "b", { fill: C.goodT, size: 12 });
    b += t(cx + 40, cy - 12, "|z|", { fill: C.cyanT, size: 12 });
    b += t(470, 120, "|z| = √(a²+b²)", { fill: C.tx, size: 13, a: "start" });
    b += t(470, 150, "z* = a − bi", { fill: C.dim, size: 12, a: "start" });
    b += t(470, 182, "z·z* = |z|²", { fill: C.goodT, size: 13, a: "start" });
    b += t(470, 204, "→ the Born rule", { fill: C.faint, size: 11, a: "start" });
    return svg(250, b, "complex plane with modulus and conjugate");
  })();

  // ---- M2: euler-circle ----
  D["euler-circle"] = (() => {
    const cx = 200, cy = 150, R = 96;
    let b = t(320, 24, "e^{iθ} walks the unit circle", { bold: true, size: 14 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.cyan, sw: 1.6 });
    b += ln(cx - R - 14, cy, cx + R + 14, cy, { stroke: C.boxS }) + ln(cx, cy + R + 14, cx, cy - R - 14, { stroke: C.boxS });
    const a = 52 * Math.PI / 180, px = cx + R * Math.cos(a), py = cy - R * Math.sin(a);
    b += ln(cx, cy, px, py, { stroke: C.cyanT, sw: 2.4 });
    b += circ(px, py, 5, { fill: C.cyan, stroke: C.cyanT });
    b += t(cx + 30, cy - 12, "θ", { fill: C.cyanT, size: 13 });
    b += circ(cx + R, cy, 4, { fill: C.good }); b += t(cx + R + 6, cy + 16, "1", { fill: C.goodT, size: 11, a: "start" });
    b += circ(cx, cy - R, 4, { fill: C.good }); b += t(cx + 8, cy - R - 4, "i", { fill: C.goodT, size: 11, a: "start" });
    b += circ(cx - R, cy, 4, { fill: C.warn }); b += t(cx - R - 6, cy - 8, "-1", { fill: C.warnT, size: 11, a: "end" });
    b += t(470, 120, "= cos θ + i sin θ", { fill: C.tx, size: 13, a: "start" });
    b += t(470, 152, "e^{iπ} = −1", { fill: C.warnT, size: 13, a: "start" });
    b += t(470, 182, "phase π = sign flip", { fill: C.faint, size: 11, a: "start" });
    return svg(250, b, "Euler formula on the unit circle");
  })();

  // ---- M2: complex-mult ----
  D["complex-mult"] = (() => {
    const cx = 200, cy = 150, R = 92;
    let b = t(320, 24, "Multiply by e^{iφ} = rotate by φ", { bold: true, size: 14 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.boxS, sw: 1.4 });
    b += ln(cx - R - 14, cy, cx + R + 14, cy, { stroke: C.boxS }) + ln(cx, cy + R + 14, cx, cy - R - 14, { stroke: C.boxS });
    const a1 = 20 * Math.PI / 180, a2 = 75 * Math.PI / 180;
    const p1x = cx + R * Math.cos(a1), p1y = cy - R * Math.sin(a1);
    const p2x = cx + R * Math.cos(a2), p2y = cy - R * Math.sin(a2);
    b += ln(cx, cy, p1x, p1y, { stroke: C.accT, sw: 2.2 }) + circ(p1x, p1y, 4, { fill: C.acc });
    b += ln(cx, cy, p2x, p2y, { stroke: C.cyanT, sw: 2.2 }) + circ(p2x, p2y, 4, { fill: C.cyan });
    b += `<path d="M ${p1x} ${p1y} A ${R} ${R} 0 0 0 ${p2x} ${p2y}" style="fill:none;stroke:${C.good};stroke-width:2.4"/>`;
    b += t(p1x + 14, p1y + 4, "z", { fill: C.accT, size: 12, a: "start" });
    b += t(p2x - 12, p2y - 6, "z·e^{iφ}", { fill: C.cyanT, size: 11, a: "end" });
    b += t(470, 130, "moduli multiply", { fill: C.dim, size: 12, a: "start" });
    b += t(470, 156, "phases ADD", { fill: C.goodT, size: 13, a: "start" });
    b += t(470, 188, "= the algebra of", { fill: C.faint, size: 11, a: "start" });
    b += t(470, 208, "quantum gates", { fill: C.accT, size: 12, a: "start" });
    return svg(250, b, "complex multiplication as rotation");
  })();

  // ---- M2: matmul-mechanics ----
  D["matmul-mechanics"] = (() => {
    let b = t(320, 26, "Matrix × vector: each output = one row · input", { bold: true, size: 14 });
    b += box(60, 70, 120, 90, { stroke: C.acc, fill: C.accFill });
    b += t(90, 108, "1  2", { size: 14 }); b += t(90, 138, "3  4", { size: 14 });
    b += t(120, 60, "M", { fill: C.accT, size: 12 });
    b += t(210, 118, "×", { size: 18, fill: C.dim });
    b += box(240, 70, 60, 90, { stroke: C.cyan, fill: C.cyanFill });
    b += t(270, 108, "5", { size: 14 }); b += t(270, 138, "6", { size: 14 });
    b += t(330, 118, "=", { size: 18, fill: C.dim });
    b += box(360, 70, 130, 90, { stroke: C.good, fill: C.goodFill });
    b += t(425, 106, "1·5+2·6", { size: 12, fill: C.goodT }); b += t(425, 136, "3·5+4·6", { size: 12, fill: C.goodT });
    b += box(510, 70, 84, 90, { stroke: C.good });
    b += t(552, 108, "17", { size: 15, bold: true }); b += t(552, 138, "39", { size: 15, bold: true });
    b += t(320, 190, "Row 1 dotted with the column → output entry 1, and so on.", { fill: C.dim, size: 12 });
    return svg(208, b, "matrix times vector mechanics");
  })();

  // ---- M2: matrix-transform ----
  D["matrix-transform"] = (() => {
    const ox = 120, oy = 200;
    let b = t(320, 24, "A matrix moves the basis vectors to its columns", { bold: true, size: 14 });
    b += ln(ox, oy, ox + 150, oy, { stroke: C.boxS }); b += ln(ox, oy, ox, oy - 150, { stroke: C.boxS });
    b += ln(ox, oy, ox + 90, oy, { stroke: C.acc, sw: 2.4 }) + triR(ox + 90, oy, { stroke: C.acc });
    b += ln(ox, oy, ox, oy - 90, { stroke: C.good, sw: 2.4 }) + triU(ox, oy - 90, { stroke: C.good });
    b += t(ox + 96, oy + 16, "e₁", { fill: C.accT, size: 12, a: "start" });
    b += t(ox - 10, oy - 96, "e₂", { fill: C.goodT, size: 12, a: "end" });
    // arrow to transformed
    b += arrR(300, 110, 360, { stroke: C.faint });
    b += t(330, 100, "M", { fill: C.dim, size: 12 });
    const px = 470, py = 200;
    b += ln(px, py, px + 150, py, { stroke: C.boxS }); b += ln(px, py, px, py - 150, { stroke: C.boxS });
    b += ln(px, py, px + 84, py - 40, { stroke: C.acc, sw: 2.4 }) + triR(px + 84, py - 40, { stroke: C.acc });
    b += ln(px, py, px + 36, py - 96, { stroke: C.good, sw: 2.4 }) + triU(px + 36, py - 96, { stroke: C.good });
    b += t(px + 92, py - 42, "col 1", { fill: C.accT, size: 11, a: "start" });
    b += t(px + 42, py - 100, "col 2", { fill: C.goodT, size: 11, a: "start" });
    return svg(238, b, "matrix transforms the plane via basis vectors");
  })();

  // ---- M2: eigen-action ----
  D["eigen-action"] = (() => {
    const ox = 150, oy = 175;
    let b = t(320, 24, "Eigenvectors keep their direction (only scale)", { bold: true, size: 14 });
    // generic vector rotated
    b += ln(ox, oy, ox + 70, oy - 70, { stroke: C.dim, sw: 2 }) + triR(ox + 70, oy - 70, { stroke: C.dim });
    b += ln(ox, oy, ox + 100, oy - 40, { stroke: C.warn, dash: "4 3", sw: 1.8 }) + triR(ox + 100, oy - 40, { stroke: C.warn });
    b += t(ox + 12, oy - 78, "v", { fill: C.dim, size: 12 });
    b += t(ox + 110, oy - 36, "Mv (turned)", { fill: C.warnT, size: 11, a: "start" });
    b += t(ox, oy + 30, "generic vector", { fill: C.dim, size: 11 });
    // eigenvector scaled only
    const ex = 440, ey = 175;
    b += ln(ex, ey, ex + 60, ey, { stroke: C.good, sw: 2.2 });
    b += ln(ex, ey, ex + 120, ey, { stroke: C.goodT, sw: 2.6 }) + triR(ex + 120, ey, { stroke: C.goodT });
    b += t(ex + 40, ey - 12, "v", { fill: C.good, size: 12 });
    b += t(ex + 96, ey - 12, "λv", { fill: C.goodT, size: 12 });
    b += t(ex + 30, ey + 30, "eigenvector: same line", { fill: C.goodT, size: 11, a: "start" });
    return svg(220, b, "eigenvector keeps direction while generic vectors rotate");
  })();

  // ---- M2: braket-anatomy ----
  D["braket-anatomy"] = (() => {
    let b = t(320, 26, "Bra × ket = a number (the overlap)", { bold: true, size: 14 });
    b += box(70, 70, 130, 70, { stroke: C.acc, fill: C.accFill });
    b += t(135, 104, "⟨φ|", { size: 20, bold: true, fill: C.accT }); b += t(135, 126, "row, conjugated", { size: 10, fill: C.faint });
    b += t(220, 108, "·", { size: 22, fill: C.dim });
    b += box(240, 70, 130, 70, { stroke: C.cyan, fill: C.cyanFill });
    b += t(305, 104, "|ψ⟩", { size: 20, bold: true, fill: C.cyanT }); b += t(305, 126, "column", { size: 10, fill: C.faint });
    b += arrR(378, 105, 420, { stroke: C.faint });
    b += box(430, 74, 150, 62, { stroke: C.good, fill: C.goodFill });
    b += t(505, 100, "⟨φ|ψ⟩", { size: 18, bold: true, fill: C.goodT });
    b += t(505, 122, "one complex number", { size: 10, fill: C.faint });
    b += t(320, 176, "Amplitude = ⟨basis|ψ⟩;  probability = |⟨φ|ψ⟩|².", { fill: C.dim, size: 12 });
    return svg(196, b, "bra ket inner product anatomy");
  })();

  // ---- M3: prob-tree ----
  D["prob-tree"] = (() => {
    let b = t(320, 24, "Probability tree: × along branches, + across leaves", { bold: true, size: 13 });
    b += circ(90, 130, 16, { fill: C.box, stroke: C.acc }) + t(90, 135, "start", { size: 9, fill: C.dim });
    // to two nodes
    b += ln(106, 122, 250, 70, { stroke: C.line }) + triR(250, 70, {});
    b += ln(106, 138, 250, 190, { stroke: C.line }) + triR(250, 190, {});
    b += t(170, 84, "p", { fill: C.accT, size: 11 }); b += t(170, 178, "1−p", { fill: C.accT, size: 11 });
    b += circ(270, 70, 15, { fill: C.box, stroke: C.cyan }) + t(270, 74, "A", { size: 11 });
    b += circ(270, 190, 15, { fill: C.box, stroke: C.cyan }) + t(270, 194, "B", { size: 11 });
    // leaves
    b += ln(286, 66, 400, 44, { stroke: C.line }) + triR(400, 44, {});
    b += ln(286, 76, 400, 100, { stroke: C.line }) + triR(400, 100, {});
    b += ln(286, 186, 400, 160, { stroke: C.line }) + triR(400, 160, {});
    b += ln(286, 196, 400, 214, { stroke: C.line }) + triR(400, 214, {});
    ["AA", "AB", "BA", "BB"].forEach((s, i) => {
      const yy = [44, 100, 160, 214][i];
      b += box(408, yy - 14, 60, 26, { stroke: C.boxS }) + t(438, yy + 3, s, { size: 11 });
    });
    b += t(540, 110, "P(A and B)", { fill: C.dim, size: 11, a: "start" });
    b += t(540, 134, "= P(A)P(B)", { fill: C.cyanT, size: 11, a: "start" });
    b += t(540, 166, "if independent", { fill: C.faint, size: 10, a: "start" });
    return svg(240, b, "probability tree multiply and add");
  })();

  // ---- M3: shots-convergence ----
  D["shots-convergence"] = (() => {
    let b = t(320, 24, "Standard error shrinks as 1/√n", { bold: true, size: 14 });
    const ox = 70, oy = 210, w = 500, h = 150;
    b += ln(ox, oy, ox + w, oy, { stroke: C.boxS }) + triR(ox + w, oy, { stroke: C.boxS });
    b += ln(ox, oy, ox, oy - h, { stroke: C.boxS }) + triU(ox, oy - h, { stroke: C.boxS });
    b += t(ox + w, oy + 18, "shots n", { fill: C.dim, size: 11, a: "end" });
    b += t(ox - 8, oy - h, "error", { fill: C.dim, size: 11, a: "end" });
    // 1/sqrt(n) curve
    let path = "";
    for (let i = 0; i <= 60; i++) {
      const nn = 20 + i * 30;
      const x = ox + (i / 60) * w;
      const yy = oy - (h * 0.9) * (1 / Math.sqrt(nn)) * Math.sqrt(50);
      path += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + Math.max(oy - h, yy).toFixed(1) + " ";
    }
    b += `<path d="${path}" style="fill:none;stroke:${C.cyanT};stroke-width:2.6"/>`;
    b += t(400, 120, "4× shots → ½ the error", { fill: C.warnT, size: 12, a: "start" });
    b += t(400, 146, "precision is a", { fill: C.faint, size: 11, a: "start" });
    b += t(400, 164, "√ discount", { fill: C.faint, size: 11, a: "start" });
    return svg(240, b, "one over root n convergence curve");
  })();

  // ---- M4: py-flow ----
  D["py-flow"] = (() => {
    let b = t(320, 24, "Control flow: branch and loop", { bold: true, size: 14 });
    b += box(250, 44, 140, 34, { stroke: C.boxS }) + t(320, 66, "statements", { size: 12 });
    b += arrD(320, 79, 96, {});
    b += `<polygon points="320,100 400,132 320,164 240,132" style="fill:${C.accFill};stroke:${C.acc};stroke-width:1.6"/>`;
    b += t(320, 137, "condition?", { size: 12, fill: C.accT });
    b += arrR(401, 132, 470, {}); b += t(500, 128, "if / elif", { fill: C.dim, size: 11 });
    b += box(470, 116, 120, 32, { stroke: C.cyan }) + t(530, 137, "branch body", { size: 11, fill: C.cyanT });
    b += arrD(320, 165, 200, {}); b += t(300, 186, "else / after", { fill: C.dim, size: 11, a: "end" });
    b += box(250, 202, 140, 34, { stroke: C.good }) + t(320, 224, "loop body", { size: 12, fill: C.goodT });
    // loop-back arrow
    b += ln(390, 219, 430, 219, { stroke: C.good }); b += ln(430, 219, 430, 132, { stroke: C.good });
    b += ln(430, 132, 401, 132, { stroke: C.good }); b += triL(401, 132, { stroke: C.good });
    b += t(452, 180, "repeat", { fill: C.goodT, size: 10, a: "start" });
    return svg(252, b, "python control flow branch and loop");
  })();

  // ---- M4: list-slicing ----
  D["list-slicing"] = (() => {
    let b = t(320, 24, "Slicing [start:stop] — indices label the fences", { bold: true, size: 13 });
    const vals = [10, 11, 12, 13, 14, 15], x0 = 90, cw = 74;
    vals.forEach((v, i) => {
      const x = x0 + i * cw;
      const hl = i >= 1 && i <= 3;
      b += box(x, 80, cw - 8, 50, { stroke: hl ? C.cyan : C.boxS, fill: hl ? C.cyanFill : C.box });
      b += t(x + (cw - 8) / 2, 111, String(v), { size: 15, bold: true });
      b += t(x, 150, String(i), { fill: C.faint, size: 11 });          // fence index left
      b += t(x, 68, String(i - vals.length), { fill: C.faint, size: 10 }); // negative
    });
    b += t(x0 + vals.length * cw, 150, String(vals.length), { fill: C.faint, size: 11 });
    b += t(320, 184, "data[1:3] = [11, 12]   (stop is exclusive)", { fill: C.cyanT, size: 12 });
    b += t(320, 206, "data[::-1] reverses — a quantum-bitstring staple", { fill: C.dim, size: 11 });
    return svg(224, b, "python list slicing fences");
  })();

  // ---- M4: ndarray-shape ----
  D["ndarray-shape"] = (() => {
    let b = t(320, 24, "Array shapes: check .shape before your math", { bold: true, size: 14 });
    // vector (2,)
    b += box(60, 70, 46, 96, { stroke: C.acc });
    b += t(83, 108, "a", { size: 13 }); b += t(83, 138, "b", { size: 13 });
    b += t(83, 186, "(2,)", { fill: C.accT, size: 12 }); b += t(83, 204, "vector", { fill: C.faint, size: 10 });
    // matrix (2,2)
    b += box(200, 70, 96, 96, { stroke: C.cyan });
    b += t(224, 108, "a  b", { size: 13 }); b += t(224, 138, "c  d", { size: 13 });
    b += t(248, 186, "(2,2)", { fill: C.cyanT, size: 12 }); b += t(248, 204, "matrix", { fill: C.faint, size: 10 });
    // column (2,1)
    b += box(380, 70, 50, 96, { stroke: C.good });
    b += t(405, 108, "a", { size: 13 }); b += t(405, 138, "b", { size: 13 });
    b += t(405, 186, "(2,1)", { fill: C.goodT, size: 12 }); b += t(405, 204, "column", { fill: C.faint, size: 10 });
    b += t(540, 110, "@ = matmul", { fill: C.warnT, size: 12, a: "start" });
    b += t(540, 134, "* = elementwise", { fill: C.badT, size: 12, a: "start" });
    b += t(540, 158, "(classic bug)", { fill: C.faint, size: 10, a: "start" });
    return svg(224, b, "numpy array shapes vector matrix column");
  })();

  // ---- M4: function-machine ----
  D["function-machine"] = (() => {
    let b = t(320, 26, "A function is a machine: input → rule → output", { bold: true, size: 14 });
    b += arrR(50, 110, 150, { stroke: C.cyanT }); b += t(96, 96, "x", { fill: C.cyanT, size: 13 });
    b += box(150, 76, 140, 68, { stroke: C.acc, fill: C.accFill }) + t(220, 116, "f(x) = x²", { size: 15, fill: C.accT });
    b += arrR(292, 110, 392, { stroke: C.goodT }); b += t(342, 96, "x²", { fill: C.goodT, size: 13 });
    b += box(400, 76, 190, 68, { stroke: C.boxS });
    b += t(495, 106, "compose: f(g(x))", { size: 12, fill: C.tx });
    b += t(495, 128, "order matters!", { size: 11, fill: C.warnT });
    return svg(176, b, "function as a machine with composition");
  })();

  // ---- M5: qubit-born ----
  D["qubit-born"] = (() => {
    let b = t(320, 24, "The qubit pipeline: amplitudes → |·|² → outcome", { bold: true, size: 13 });
    b += box(40, 66, 150, 60, { stroke: C.cyan, fill: C.cyanFill });
    b += t(115, 92, "α|0⟩ + β|1⟩", { size: 14, fill: C.cyanT }); b += t(115, 114, "complex amplitudes", { size: 10, fill: C.faint });
    b += arrR(192, 96, 240, {}); b += t(216, 84, "|·|²", { fill: C.dim, size: 11 });
    b += box(250, 66, 150, 60, { stroke: C.acc, fill: C.accFill });
    b += t(325, 92, "|α|², |β|²", { size: 14, fill: C.accT }); b += t(325, 114, "probabilities", { size: 10, fill: C.faint });
    b += arrR(402, 96, 450, {}); b += t(426, 84, "sample", { fill: C.dim, size: 10 });
    b += box(460, 66, 140, 60, { stroke: C.good, fill: C.goodFill });
    b += t(530, 92, "0 or 1", { size: 15, fill: C.goodT, bold: true }); b += t(530, 114, "+ collapse", { size: 10, fill: C.faint });
    b += t(320, 158, "Phases survive the arithmetic until the squaring —", { fill: C.dim, size: 12 });
    b += t(320, 178, "that is where quantum information hides.", { fill: C.dim, size: 12 });
    return svg(198, b, "qubit measurement pipeline born rule");
  })();

  // ---- M5: bloch-sphere ----
  D["bloch-sphere"] = (() => {
    const cx = 210, cy = 150, R = 100;
    let b = t(320, 22, "The Bloch sphere", { bold: true, size: 15 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.boxS, sw: 1.4 });
    b += `<ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="30" style="fill:none;stroke:${C.boxS};stroke-width:1;stroke-dasharray:3 3"/>`;
    b += ln(cx, cy + R + 12, cx, cy - R - 12, { stroke: C.boxS });
    b += ln(cx - R - 12, cy, cx + R + 12, cy, { stroke: C.boxS });
    // state vector
    const a = 52 * Math.PI / 180, ph = 0.5;
    const px = cx + R * Math.sin(a) * Math.cos(ph), py = cy - R * Math.cos(a);
    b += ln(cx, cy, px, py, { stroke: C.cyanT, sw: 2.6 }) + circ(px, py, 5, { fill: C.cyan, stroke: C.cyanT });
    b += t(cx + 22, cy - 20, "θ", { fill: C.cyanT, size: 13 });
    b += circ(cx, cy - R, 4, { fill: C.good }); b += t(cx, cy - R - 10, "|0⟩", { fill: C.goodT, size: 12 });
    b += circ(cx, cy + R, 4, { fill: C.warn }); b += t(cx, cy + R + 22, "|1⟩", { fill: C.warnT, size: 12 });
    b += t(cx + R + 4, cy - 6, "|+⟩", { fill: C.dim, size: 11, a: "start" });
    b += t(cx - R - 4, cy - 6, "|−⟩", { fill: C.dim, size: 11, a: "end" });
    b += t(470, 110, "θ = latitude", { fill: C.dim, size: 12, a: "start" });
    b += t(470, 136, "φ = longitude", { fill: C.dim, size: 12, a: "start" });
    b += t(470, 170, "orthogonal =", { fill: C.warnT, size: 12, a: "start" });
    b += t(470, 190, "ANTIPODES", { fill: C.warnT, size: 12, a: "start" });
    b += t(470, 210, "(180°, not 90°)", { fill: C.faint, size: 10, a: "start" });
    return svg(272, b, "Bloch sphere with poles and equator");
  })();

  // ---- M5: global-vs-relative ----
  D["global-vs-relative"] = (() => {
    let b = t(320, 24, "Global phase: invisible. Relative phase: everything.", { bold: true, size: 13 });
    // global
    b += t(160, 58, "global", { fill: C.faint, size: 12 });
    b += box(60, 70, 200, 70, { stroke: C.boxS });
    b += t(160, 100, "e^{iγ}(α|0⟩ + β|1⟩)", { size: 13 });
    b += t(160, 124, "no experiment sees it", { size: 10, fill: C.faint });
    b += t(160, 162, "same state ✓", { fill: C.good, size: 12 });
    // relative
    b += t(480, 58, "relative", { fill: C.accT, size: 12 });
    b += box(380, 70, 200, 70, { stroke: C.acc });
    b += t(480, 100, "α|0⟩ + e^{iγ}β|1⟩", { size: 13, fill: C.accT });
    b += t(480, 124, "interference reveals it", { size: 10, fill: C.faint });
    b += t(480, 162, "different physics ✗", { fill: C.warnT, size: 12 });
    b += ln(320, 60, 320, 175, { stroke: C.cardEdge, dash: "4 4" });
    return svg(190, b, "global versus relative phase");
  })();

  // ---- M6: gate-rotations ----
  D["gate-rotations"] = (() => {
    const cx = 180, cy = 150, R = 96;
    let b = t(320, 22, "Gates are rotations of the sphere", { bold: true, size: 14 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.boxS, sw: 1.4 });
    b += ln(cx, cy + R + 10, cx, cy - R - 10, { stroke: C.boxS });
    b += ln(cx - R - 10, cy, cx + R + 10, cy, { stroke: C.boxS });
    b += t(cx, cy - R - 14, "z |0⟩", { fill: C.dim, size: 10 });
    b += t(cx + R + 14, cy + 4, "x", { fill: C.dim, size: 10, a: "start" });
    // X flip arc
    b += `<path d="M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx} ${cy + R}" style="fill:none;stroke:${C.acc};stroke-width:2.4"/>`;
    b += triD(cx + 2, cy + R, { stroke: C.acc });
    b += t(cx + R - 20, cy, "X: 180° x", { fill: C.accT, size: 10, a: "start" });
    const tbl = [["X, Y, Z", "180° about x, y, z"], ["H", "180° about x+z (swap)"], ["S", "90° about z"], ["Rx,Ry,Rz(θ)", "any angle, any axis"]];
    let yy = 90;
    tbl.forEach(r => {
      b += t(360, yy, r[0], { fill: C.cyanT, size: 12, a: "start" });
      b += t(470, yy, r[1], { fill: C.dim, size: 11, a: "start" });
      yy += 30;
    });
    return svg(260, b, "single qubit gates as Bloch rotations");
  })();

  // ---- M6: tensor-grid ----
  D["tensor-grid"] = (() => {
    let b = t(320, 24, "Tensor product: every amplitude × every amplitude", { bold: true, size: 13 });
    b += box(50, 70, 46, 90, { stroke: C.acc });
    b += t(73, 104, "a₀", { size: 13 }); b += t(73, 138, "a₁", { size: 13 });
    b += t(115, 118, "⊗", { size: 20, fill: C.dim });
    b += box(140, 70, 46, 90, { stroke: C.cyan });
    b += t(163, 104, "b₀", { size: 13 }); b += t(163, 138, "b₁", { size: 13 });
    b += arrR(196, 115, 244, {});
    b += box(250, 60, 70, 170, { stroke: C.good });
    ["a₀b₀", "a₀b₁", "a₁b₀", "a₁b₁"].forEach((s, i) => b += t(285, 90 + i * 40, s, { size: 12, fill: C.goodT }));
    b += t(285, 250, "4 amplitudes", { fill: C.faint, size: 11 });
    b += t(470, 110, "dims MULTIPLY", { fill: C.warnT, size: 13, a: "start" });
    b += t(470, 138, "n qubits → 2ⁿ", { fill: C.tx, size: 13, a: "start" });
    b += t(470, 168, "add one qubit,", { fill: C.faint, size: 11, a: "start" });
    b += t(470, 186, "double the state", { fill: C.faint, size: 11, a: "start" });
    return svg(268, b, "tensor product grid of amplitudes");
  })();

  // ---- M6: qiskit-ordering ----
  D["qiskit-ordering"] = (() => {
    let b = t(320, 26, "Qiskit is little-endian: qubit 0 is the RIGHT bit", { bold: true, size: 13 });
    const labels = ["q₂", "q₁", "q₀"], x0 = 210, cw = 76;
    labels.forEach((lb, i) => {
      const x = x0 + i * cw, q0 = i === 2;
      b += box(x, 70, cw - 10, 54, { stroke: q0 ? C.cyan : C.boxS, fill: q0 ? C.cyanFill : C.box });
      b += t(x + (cw - 10) / 2, 103, lb, { size: 15, bold: true, fill: q0 ? C.cyanT : C.tx });
    });
    b += t(x0 + 2 * cw + (cw - 10) / 2, 148, "qubit 0", { fill: C.cyanT, size: 11 });
    b += t(x0 + 2 * cw + (cw - 10) / 2, 166, "(rightmost)", { fill: C.faint, size: 10 });
    b += t(320, 200, "state = |q₂⟩ ⊗ |q₁⟩ ⊗ |q₀⟩ — q0 is the LAST kron factor", { fill: C.dim, size: 12 });
    b += t(320, 222, "Probe once with x(0); translate external strings with [::-1].", { fill: C.faint, size: 11 });
    return svg(240, b, "qiskit little endian qubit ordering");
  })();

  // ---- M6: two-qubit gate circuits share a helper ----
  const wire = (y, x0, x1) => ln(x0, y, x1, y, { stroke: C.line, sw: 1.6 });
  const gateBox = (x, y, label, col) => box(x - 18, y - 18, 36, 36, { stroke: col || C.acc, fill: C.box }) + t(x, y + 5, label, { size: 14, bold: true, fill: col ? col : C.accT });
  const ctrlDot = (x, y) => circ(x, y, 6, { fill: C.cyanT, stroke: C.cyanT });
  const targX = (x, y) => circ(x, y, 12, { fill: "none", stroke: C.cyanT, sw: 2 }) + ln(x - 12, y, x + 12, y, { stroke: C.cyanT, sw: 2 }) + ln(x, y - 12, x, y + 12, { stroke: C.cyanT, sw: 2 });

  // ---- M6: bell-circuit ----
  D["bell-circuit"] = (() => {
    let b = t(320, 26, "Bell factory: H fans out, CNOT correlates", { bold: true, size: 14 });
    const y0 = 80, y1 = 140;
    b += t(50, y0 + 5, "q₀ |0⟩", { size: 12, a: "start", fill: C.dim });
    b += t(50, y1 + 5, "q₁ |0⟩", { size: 12, a: "start", fill: C.dim });
    b += wire(y0, 110, 520); b += wire(y1, 110, 520);
    b += gateBox(170, y0, "H", C.acc);
    b += ctrlDot(280, y0); b += ln(280, y0, 280, y1, { stroke: C.cyanT, sw: 1.8 }); b += targX(280, y1);
    b += box(360, y0 - 18, 30, 36, { stroke: C.good }) + t(375, y0 + 5, "M", { size: 13, fill: C.goodT });
    b += box(360, y1 - 18, 30, 36, { stroke: C.good }) + t(375, y1 + 5, "M", { size: 13, fill: C.goodT });
    b += t(470, y0 + 5, "→ Φ⁺", { size: 13, fill: C.cyanT, a: "start" });
    b += t(320, 200, "Reverse it (CNOT, H, measure) = a Bell-basis measurement.", { fill: C.dim, size: 12 });
    return svg(220, b, "Bell state preparation circuit");
  })();

  // ---- M6: phase-kickback ----
  D["phase-kickback"] = (() => {
    let b = t(320, 24, "Phase kickback: the eigenvalue lands on the CONTROL", { bold: true, size: 13 });
    const y0 = 80, y1 = 150;
    b += t(46, y0 + 5, "control |+⟩", { size: 11, a: "start", fill: C.dim });
    b += t(46, y1 + 5, "target |−⟩", { size: 11, a: "start", fill: C.dim });
    b += wire(y0, 140, 520); b += wire(y1, 140, 520);
    b += ctrlDot(300, y0); b += ln(300, y0, 300, y1, { stroke: C.cyanT, sw: 1.8 }); b += targX(300, y1);
    b += t(300, 44, "controlled-U", { fill: C.faint, size: 10 });
    b += t(470, y0 - 4, "picks up (−1)", { size: 11, fill: C.warnT, a: "start" });
    b += t(470, y1 + 6, "unchanged", { size: 11, fill: C.good, a: "start" });
    b += t(320, 196, "The 'if' statement edits the asker, not the asked —", { fill: C.dim, size: 12 });
    b += t(320, 216, "the engine of DJ, BV, Grover, and QPE.", { fill: C.faint, size: 11 });
    return svg(234, b, "phase kickback onto control qubit");
  })();

  // ---- M6: teleport-circuit ----
  D["teleport-circuit"] = (() => {
    let b = t(320, 22, "Teleportation: Bell-measure, phone, correct", { bold: true, size: 13 });
    const y = [70, 110, 150];
    ["ψ (q₀)", "q₁", "Bob q₂"].forEach((lb, i) => b += t(46, y[i] + 4, lb, { size: 11, a: "start", fill: C.dim }));
    y.forEach(yy => b += wire(yy, 130, 540));
    // shared pair H+cx on q1,q2
    b += gateBox(175, y[1], "H", C.acc);
    b += ctrlDot(215, y[1]); b += ln(215, y[1], 215, y[2], { stroke: C.cyanT, sw: 1.6 }); b += targX(215, y[2]);
    // Alice bell measure q0,q1
    b += ctrlDot(300, y[0]); b += ln(300, y[0], 300, y[1], { stroke: C.cyanT, sw: 1.6 }); b += targX(300, y[1]);
    b += gateBox(345, y[0], "H", C.acc);
    b += box(385, y[0] - 16, 28, 32, { stroke: C.good }) + t(399, y[0] + 5, "M", { size: 12, fill: C.goodT });
    b += box(385, y[1] - 16, 28, 32, { stroke: C.good }) + t(399, y[1] + 5, "M", { size: 12, fill: C.goodT });
    // classical to correction
    b += ln(413, y[0], 470, y[0], { stroke: C.faint, dash: "3 3" });
    b += ln(413, y[1], 470, y[1], { stroke: C.faint, dash: "3 3" });
    b += gateBox(490, y[2], "XZ", C.warn);
    b += ln(470, y[0], 490, y[0], { stroke: C.faint, dash: "3 3" }); b += ln(490, y[0], 490, y[2] - 18, { stroke: C.faint, dash: "3 3" });
    b += t(520, y[2] + 4, "= ψ", { size: 12, fill: C.cyanT, a: "start" });
    b += t(320, 196, "2 classical bits select Bob's Pauli. Nothing beats the phone call.", { fill: C.faint, size: 11 });
    return svg(214, b, "quantum teleportation circuit");
  })();

  // ---- M6: superdense-circuit ----
  D["superdense-circuit"] = (() => {
    let b = t(320, 22, "Superdense coding: 2 bits via 1 qubit + 1 ebit", { bold: true, size: 13 });
    const y0 = 78, y1 = 140;
    b += t(44, y0 + 4, "Alice q₀", { size: 11, a: "start", fill: C.dim });
    b += t(44, y1 + 4, "Bob q₁", { size: 11, a: "start", fill: C.dim });
    b += wire(y0, 120, 540); b += wire(y1, 120, 540);
    // pre-shared pair
    b += gateBox(160, y0, "H", C.acc);
    b += ctrlDot(200, y0); b += ln(200, y0, 200, y1, { stroke: C.cyanT, sw: 1.6 }); b += targX(200, y1);
    b += t(200, 44, "shared pair", { fill: C.faint, size: 10 });
    // Alice encodes
    b += gateBox(280, y0, "ZX", C.warn); b += t(280, 178, "encode 2 bits", { fill: C.warnT, size: 10 });
    // send + Bob decode
    b += ctrlDot(370, y0); b += ln(370, y0, 370, y1, { stroke: C.cyanT, sw: 1.6 }); b += targX(370, y1);
    b += gateBox(415, y0, "H", C.acc);
    b += box(455, y0 - 16, 28, 32, { stroke: C.good }) + t(469, y0 + 5, "M", { size: 12, fill: C.goodT });
    b += box(455, y1 - 16, 28, 32, { stroke: C.good }) + t(469, y1 + 5, "M", { size: 12, fill: C.goodT });
    b += t(510, 110, "2 bits", { fill: C.cyanT, size: 12, a: "start" });
    return svg(200, b, "superdense coding circuit");
  })();

  // ---- M7: qiskit-stack ----
  D["qiskit-stack"] = (() => {
    let b = t(320, 24, "The execution stack", { bold: true, size: 15 });
    const rows = [["Your circuit (Qiskit SDK)", C.acc], ["Transpiler → ISA circuit", C.cyan], ["Primitive: Sampler / Estimator", C.cyan], ["Simulator  or  real QPU", C.good]];
    let yy = 56;
    rows.forEach((r, i) => {
      b += box(160, yy, 320, 40, { stroke: r[1], fill: C.box });
      b += t(320, yy + 25, r[0], { size: 13, fill: C.tx });
      if (i < rows.length - 1) b += arrD(320, yy + 41, yy + 55, { stroke: C.faint });
      yy += 56;
    });
    b += t(320, yy + 6, "counts / expectations flow back up", { fill: C.faint, size: 11 });
    return svg(yy + 24, b, "qiskit execution stack layers");
  })();

  // ---- M7: sim-memory-wall ----
  D["sim-memory-wall"] = (() => {
    let b = t(320, 24, "The memory wall: 16 bytes × 2ⁿ", { bold: true, size: 14 });
    const rows = [["20 qubits", "17 MB", 0.1, C.good], ["30 qubits", "17 GB", 0.4, C.warn], ["40 qubits", "17 TB", 0.7, C.bad], ["50 qubits", "18 PB", 1.0, C.bad]];
    let yy = 60; const x0 = 150, wmax = 380;
    rows.forEach(r => {
      b += t(x0 - 12, yy + 14, r[0], { size: 12, a: "end", fill: C.dim });
      b += box(x0, yy, wmax, 22, { fill: C.box, stroke: C.boxS, r: 4 });
      b += `<rect x="${x0}" y="${yy}" width="${(wmax * r[2]).toFixed(0)}" height="22" rx="4" style="fill:${r[3]}"/>`;
      b += t(x0 + wmax + 10, yy + 15, r[1], { size: 12, a: "start", fill: r[3] });
      yy += 34;
    });
    b += t(320, yy + 6, "Laptops die ~30 qubits. The wall is why hardware exists.", { fill: C.faint, size: 11 });
    return svg(yy + 24, b, "simulation memory wall doubling per qubit");
  })();

  // ---- M7: coupling-map ----
  D["coupling-map"] = (() => {
    let b = t(320, 24, "Coupling map: 2-qubit gates only on edges", { bold: true, size: 14 });
    const pos = { 0: [140, 90], 1: [230, 90], 2: [320, 90], 3: [230, 160], 4: [140, 230], 5: [320, 230], 6: [410, 160], 7: [410, 90] };
    const edges = [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5], [2, 6], [6, 7]];
    edges.forEach(e => b += ln(pos[e[0]][0], pos[e[0]][1], pos[e[1]][0], pos[e[1]][1], { stroke: C.boxS, sw: 3 }));
    // the impossible cx(0,7)
    b += ln(pos[0][0], pos[0][1], pos[7][0], pos[7][1], { stroke: C.bad, sw: 1.6, dash: "5 4" });
    Object.entries(pos).forEach(([k, p]) => {
      b += circ(p[0], p[1], 16, { fill: C.box, stroke: C.cyan });
      b += t(p[0], p[1] + 5, k, { size: 12, fill: C.cyanT });
    });
    b += t(275, 68, "cx(0,7): no edge → SWAP chain", { fill: C.badT, size: 11 });
    b += t(320, 268, "Each hop ≈ 3 native 2-qubit gates. Layout is error budget.", { fill: C.faint, size: 11 });
    return svg(288, b, "heavy hex coupling map fragment");
  })();

  // ---- M7: transpile-flow ----
  D["transpile-flow"] = (() => {
    let b = t(320, 24, "Transpiler pipeline", { bold: true, size: 15 });
    const st = [["Layout", "pick physical qubits", C.acc], ["Routing", "insert SWAPs", C.warn], ["Translate", "→ basis gates", C.cyan], ["Optimize", "cancel / merge", C.good]];
    let x = 24; const w = 138, gap = 10, y = 60;
    st.forEach((s, i) => {
      b += box(x, y, w, 56, { stroke: s[2], fill: C.box });
      b += t(x + w / 2, y + 26, s[0], { size: 13, bold: true, fill: s[2] });
      b += t(x + w / 2, y + 46, s[1], { size: 10, fill: C.faint });
      if (i < st.length - 1) b += arrR(x + w + 1, y + 28, x + w + gap - 1, { stroke: C.faint });
      x += w + gap;
    });
    b += t(320, 146, "Layout + routing decide most of your error budget.", { fill: C.dim, size: 12 });
    return svg(164, b, "transpiler pipeline stages");
  })();

  // ---- M7: primitives-pub ----
  D["primitives-pub"] = (() => {
    let b = t(320, 24, "A PUB bundles a circuit with its data", { bold: true, size: 14 });
    b += box(90, 60, 460, 70, { stroke: C.acc, fill: C.accFill, r: 10 });
    b += t(120, 100, "(", { size: 26, fill: C.dim, a: "start" });
    b += box(140, 74, 110, 42, { stroke: C.cyan }) + t(195, 100, "circuit", { size: 12, fill: C.cyanT });
    b += t(258, 100, ",", { size: 20, fill: C.dim });
    b += box(272, 74, 130, 42, { stroke: C.good }) + t(337, 100, "params[]", { size: 12, fill: C.goodT });
    b += t(410, 100, ",", { size: 20, fill: C.dim });
    b += box(424, 74, 110, 42, { stroke: C.warn }) + t(479, 100, "shots/obs", { size: 11, fill: C.warnT });
    b += t(544, 100, ")", { size: 26, fill: C.dim, a: "end" });
    b += t(320, 158, "A job takes a LIST of PUBs; parameter arrays broadcast —", { fill: C.dim, size: 12 });
    b += t(320, 178, "one transpiled circuit, many bindings, one queue wait.", { fill: C.faint, size: 11 });
    return svg(198, b, "primitive unified bloc structure");
  })();

  // ---- M7: job-lifecycle ----
  D["job-lifecycle"] = (() => {
    let b = t(320, 24, "A hardware job's life — design for retrieval", { bold: true, size: 14 });
    const st = [["transpile", C.acc], ["submit", C.cyan], ["queue", C.warn], ["execute", C.good], ["results persist", C.cyan]];
    let x = 20; const w = 116, gap = 6, y = 58;
    st.forEach((s, i) => {
      b += box(x, y, w, 42, { stroke: s[1], fill: C.box });
      b += t(x + w / 2, y + 26, s[0], { size: 12, fill: s[1] });
      if (i < st.length - 1) b += arrR(x + w + 1, y + 21, x + w + gap - 1, { stroke: C.faint });
      x += w + gap;
    });
    b += t(160, 130, "local, free", { fill: C.faint, size: 10 });
    b += t(370, 130, "minutes–hours", { fill: C.warnT, size: 10 });
    b += t(555, 130, "seconds", { fill: C.faint, size: 10 });
    b += t(320, 156, "Never babysit the spinner — retrieve by job ID later.", { fill: C.dim, size: 11 });
    return svg(174, b, "hardware job lifecycle");
  })();

  // ---- M8: dj-circuit ----
  D["dj-circuit"] = (() => {
    let b = t(320, 24, "Deutsch–Jozsa: fan out, query once, interfere", { bold: true, size: 13 });
    const yA = 74, yB = 108, yT = 156;
    b += t(40, yA + 4, "data", { size: 11, a: "start", fill: C.dim });
    b += t(40, yT + 4, "|−⟩", { size: 11, a: "start", fill: C.dim });
    [yA, yB].forEach(y => b += wire(y, 90, 540));
    b += wire(yT, 90, 540);
    b += gateBox(140, yA, "H", C.acc); b += gateBox(140, yB, "H", C.acc);
    b += box(215, 60, 90, 112, { stroke: C.warn, fill: C.warnFill }) + t(260, 120, "Oᶠ", { size: 16, fill: C.warnT });
    b += gateBox(360, yA, "H", C.acc); b += gateBox(360, yB, "H", C.acc);
    b += box(410, yA - 16, 28, 32, { stroke: C.good }) + t(424, yA + 5, "M", { size: 12, fill: C.goodT });
    b += box(410, yB - 16, 28, 32, { stroke: C.good }) + t(424, yB + 5, "M", { size: 12, fill: C.goodT });
    b += t(475, yA + 4, "all-0 →", { size: 11, fill: C.cyanT, a: "start" });
    b += t(475, yB + 4, "constant", { size: 11, fill: C.faint, a: "start" });
    b += t(320, 196, "One query; classical needs up to 2ⁿ⁻¹+1.", { fill: C.faint, size: 11 });
    return svg(216, b, "Deutsch Jozsa circuit");
  })();

  // ---- M8: grover-geometry ----
  D["grover-geometry"] = (() => {
    const ox = 200, oy = 220;
    let b = t(320, 24, "Grover = rotation toward the winner", { bold: true, size: 14 });
    // axes: |s'> horizontal, |w> vertical
    b += ln(ox, oy, ox + 170, oy, { stroke: C.boxS }) + triR(ox + 170, oy, { stroke: C.boxS });
    b += ln(ox, oy, ox, oy - 170, { stroke: C.boxS }) + triU(ox, oy - 170, { stroke: C.boxS });
    b += t(ox + 176, oy + 4, "|s'⟩ losers", { fill: C.dim, size: 10, a: "start" });
    b += t(ox + 6, oy - 172, "|w⟩ winner", { fill: C.dim, size: 10, a: "start" });
    const L = 150;
    // start state
    const a0 = 18 * Math.PI / 180;
    b += ln(ox, oy, ox + L * Math.cos(a0), oy - L * Math.sin(a0), { stroke: C.dim, sw: 2 }) + triR(ox + L * Math.cos(a0), oy - L * Math.sin(a0), { stroke: C.dim });
    b += t(ox + L * Math.cos(a0) + 6, oy - L * Math.sin(a0), "|s⟩", { fill: C.dim, size: 11, a: "start" });
    // after 1 iter
    const a1 = 54 * Math.PI / 180;
    b += ln(ox, oy, ox + L * Math.cos(a1), oy - L * Math.sin(a1), { stroke: C.cyanT, sw: 2.4 }) + triR(ox + L * Math.cos(a1), oy - L * Math.sin(a1), { stroke: C.cyanT });
    b += `<path d="M ${ox + 70 * Math.cos(a0)} ${oy - 70 * Math.sin(a0)} A 70 70 0 0 0 ${ox + 70 * Math.cos(a1)} ${oy - 70 * Math.sin(a1)}" style="fill:none;stroke:${C.good};stroke-width:2"/>`;
    b += t(ox + 96, oy - 60, "+2θ / iter", { fill: C.goodT, size: 11, a: "start" });
    b += t(430, 130, "stop near vertical:", { fill: C.dim, size: 12, a: "start" });
    b += t(430, 154, "k* ≈ (π/4)√N", { fill: C.cyanT, size: 13, a: "start" });
    b += t(430, 184, "overshooting", { fill: C.warnT, size: 11, a: "start" });
    b += t(430, 202, "un-finds it!", { fill: C.warnT, size: 11, a: "start" });
    return svg(252, b, "Grover algorithm rotation geometry");
  })();

  // ---- M8: qft-circuit ----
  D["qft-circuit"] = (() => {
    let b = t(320, 24, "QFT: a precision staircase of phases", { bold: true, size: 14 });
    const ys = [72, 108, 144];
    ys.forEach((y, i) => { b += t(44, y + 4, "q" + (2 - i), { size: 11, a: "start", fill: C.dim }); b += wire(y, 80, 520); });
    b += gateBox(120, ys[0], "H", C.acc);
    b += ctrlDot(180, ys[1]); b += ln(180, ys[0], 180, ys[1], { stroke: C.cyanT, sw: 1.6 }); b += box(180 - 20, ys[0] - 16, 40, 32, { stroke: C.cyan }) + t(180, ys[0] + 5, "π/2", { size: 11, fill: C.cyanT });
    b += ctrlDot(240, ys[2]); b += ln(240, ys[0], 240, ys[2], { stroke: C.cyanT, sw: 1.6 }); b += box(240 - 20, ys[0] - 16, 40, 32, { stroke: C.cyan }) + t(240, ys[0] + 5, "π/4", { size: 11, fill: C.cyanT });
    b += gateBox(310, ys[1], "H", C.acc);
    b += ctrlDot(370, ys[2]); b += ln(370, ys[1], 370, ys[2], { stroke: C.cyanT, sw: 1.6 }); b += box(370 - 20, ys[1] - 16, 40, 32, { stroke: C.cyan }) + t(370, ys[1] + 5, "π/2", { size: 11, fill: C.cyanT });
    b += gateBox(440, ys[2], "H", C.acc);
    b += t(490, ys[0] + 4, "swaps", { size: 10, fill: C.faint, a: "start" });
    b += t(320, 186, "n H's + n(n−1)/2 controlled-phases = O(n²).", { fill: C.faint, size: 11 });
    return svg(206, b, "quantum Fourier transform circuit");
  })();

  // ---- M8: qpe-circuit ----
  D["qpe-circuit"] = (() => {
    let b = t(320, 22, "QPE: kickback writes, QFT† reads", { bold: true, size: 14 });
    const yc = [66, 98], ys = 152;
    b += t(40, 82, "counting", { size: 11, a: "start", fill: C.dim });
    b += t(40, ys + 4, "|u⟩", { size: 11, a: "start", fill: C.dim });
    yc.forEach(y => b += wire(y, 100, 540)); b += wire(ys, 100, 540);
    b += gateBox(140, yc[0], "H", C.acc); b += gateBox(140, yc[1], "H", C.acc);
    b += ctrlDot(215, yc[0]); b += ln(215, yc[0], 215, ys, { stroke: C.cyanT, sw: 1.6 });
    b += ctrlDot(275, yc[1]); b += ln(275, yc[1], 275, ys, { stroke: C.cyanT, sw: 1.6 });
    b += box(200, ys - 18, 90, 36, { stroke: C.warn, fill: C.warnFill }) + t(245, ys + 5, "U^{2ᵏ}", { size: 12, fill: C.warnT });
    b += box(340, 50, 70, 64, { stroke: C.good, fill: C.goodFill }) + t(375, 86, "QFT†", { size: 13, fill: C.goodT });
    b += box(430, yc[0] - 16, 28, 32, { stroke: C.good }) + t(444, yc[0] + 5, "M", { size: 12, fill: C.goodT });
    b += box(430, yc[1] - 16, 28, 32, { stroke: C.good }) + t(444, yc[1] + 5, "M", { size: 12, fill: C.goodT });
    b += t(480, 82, "= φ bits", { size: 12, fill: C.cyanT, a: "start" });
    b += t(320, 194, "Controlled powers sculpt a Fourier state of frequency 2ᵗφ.", { fill: C.faint, size: 11 });
    return svg(214, b, "quantum phase estimation circuit");
  })();

  // ---- M8: shor-pipeline ----
  D["shor-pipeline"] = (() => {
    let b = t(320, 24, "Shor: one quantum job inside a classical wrapper", { bold: true, size: 13 });
    const st = [["factor →\nperiod", C.dim, "classical"], ["QPE on\naˣ mod N", C.cyan, "QUANTUM"], ["phase\ns/r", C.cyan, ""], ["continued\nfractions", C.dim, "classical"], ["gcd →\nfactors", C.good, "classical"]];
    let x = 20; const w = 116, gap = 6, y = 62;
    st.forEach((s, i) => {
      const q = s[2] === "QUANTUM";
      b += box(x, y, w, 56, { stroke: q ? C.cyan : C.boxS, fill: q ? C.cyanFill : C.box });
      const parts = s[0].split("\n");
      b += t(x + w / 2, y + 24, parts[0], { size: 11, fill: q ? C.cyanT : C.tx });
      b += t(x + w / 2, y + 42, parts[1], { size: 11, fill: q ? C.cyanT : C.tx });
      if (s[2]) b += t(x + w / 2, y - 8, s[2], { size: 9, fill: q ? C.cyanT : C.faint });
      if (i < st.length - 1) b += arrR(x + w + 1, y + 28, x + w + gap - 1, { stroke: C.faint });
      x += w + gap;
    });
    b += t(320, 150, "Quantum does ONE job: period-finding. The rest is arithmetic.", { fill: C.faint, size: 11 });
    return svg(168, b, "Shor algorithm pipeline");
  })();

  // ---- shared circuit-ish diagrams referenced but simple ----
  // ---- M2: basis-change ----
  D["basis-change"] = (() => {
    const cx = 200, cy = 150, R = 90;
    let b = t(320, 24, "Same state, different coordinates per basis", { bold: true, size: 13 });
    b += ln(cx - R - 14, cy, cx + R + 14, cy, { stroke: C.boxS }); b += ln(cx, cy + R + 14, cx, cy - R - 14, { stroke: C.boxS });
    b += t(cx + R + 18, cy + 4, "|0⟩", { fill: C.dim, size: 10, a: "start" });
    b += t(cx + 6, cy - R - 14, "|1⟩", { fill: C.dim, size: 10, a: "start" });
    // + / - basis at 45
    b += ln(cx - R, cy - R, cx + R, cy + R, { stroke: C.acc, dash: "4 3", sw: 1.2 });
    b += ln(cx - R, cy + R, cx + R, cy - R, { stroke: C.acc, dash: "4 3", sw: 1.2 });
    b += t(cx + R - 4, cy + R + 4, "|+⟩", { fill: C.accT, size: 10, a: "start" });
    // the state along |0>
    b += ln(cx, cy, cx + R, cy, { stroke: C.cyanT, sw: 2.6 }) + triR(cx + R, cy, { stroke: C.cyanT });
    b += circ(cx + R, cy, 4, { fill: C.cyan });
    b += t(430, 110, "standard: (1, 0)", { fill: C.cyanT, size: 12, a: "start" });
    b += t(430, 138, "±  basis: (1,1)/√2", { fill: C.accT, size: 12, a: "start" });
    b += t(430, 172, "arrow unchanged —", { fill: C.faint, size: 11, a: "start" });
    b += t(430, 190, "only the frame moved", { fill: C.faint, size: 11, a: "start" });
    return svg(252, b, "basis change same state different coordinates");
  })();

  // ---- M2: vector-spaces has no diagram key needed; ensure remaining keys exist ----
  // ---- M4: class-object ----
  D["class-object"] = (() => {
    let b = t(320, 24, "One class (blueprint) → many objects", { bold: true, size: 14 });
    b += box(60, 60, 160, 120, { stroke: C.acc, fill: C.accFill });
    b += t(140, 84, "class RunResult", { size: 13, fill: C.accT });
    b += t(140, 112, "attributes: counts", { size: 11, fill: C.dim });
    b += t(140, 134, "methods: prob()", { size: 11, fill: C.dim });
    b += t(140, 156, "self = the object", { size: 11, fill: C.faint });
    b += arrR(226, 120, 300, { stroke: C.faint });
    [66, 138].forEach((yy, i) => {
      b += box(320, yy, 250, 52, { stroke: C.cyan });
      b += t(445, yy + 22, "run" + (i + 1) + ": own counts, backend", { size: 11, fill: C.cyanT });
      b += t(445, yy + 40, ".prob('11') → a number", { size: 10, fill: C.faint });
    });
    return svg(206, b, "class blueprint and objects");
  })();

  // ---- M5: interference-paths ----
  D["interference-paths"] = (() => {
    let b = t(320, 24, "The algorithm template: spread, phase, interfere, read", { bold: true, size: 13 });
    const st = [["fan out", "H's spread inputs", C.acc], ["write phases", "oracle marks", C.warn], ["interfere", "wrong paths cancel", C.cyan], ["measure", "answer survives", C.good]];
    let x = 22; const w = 140, gap = 8, y = 58;
    st.forEach((s, i) => {
      b += box(x, y, w, 58, { stroke: s[2], fill: C.box });
      b += t(x + w / 2, y + 26, s[0], { size: 13, bold: true, fill: s[2] });
      b += t(x + w / 2, y + 46, s[1], { size: 10, fill: C.faint });
      if (i < st.length - 1) b += arrR(x + w + 1, y + 29, x + w + gap - 1, { stroke: C.faint });
      x += w + gap;
    });
    b += t(320, 148, "Superposition is the canvas, phase the paint, interference the reveal.", { fill: C.dim, size: 12 });
    return svg(168, b, "quantum algorithm interference template");
  })();


  // ---- M9: noise-sources ----
  D["noise-sources"] = (() => {
    let b = t(320, 24, "The four enemies of a qubit", { bold: true, size: 15 });
    const items = [
      ["T1 relaxation", "|1> decays to |0>", C.acc, C.accT],
      ["T2 dephasing", "phase randomizes", C.cyan, C.cyanT],
      ["gate errors", "2-qubit ~1% (dominant)", C.warn, C.warnT],
      ["readout errors", "~1-2% misread", C.bad, C.badT]
    ];
    let x = 20; const w = 148, gap = 8, y = 58;
    items.forEach(it => {
      b += box(x, y, w, 66, { stroke: it[2], fill: C.box });
      b += t(x + w / 2, y + 28, it[0], { size: 13, bold: true, fill: it[3] });
      b += t(x + w / 2, y + 50, it[1], { size: 10, fill: C.faint });
      x += w + gap;
    });
    b += t(320, 150, "Two-qubit gates dominate the error budget — count them.", { fill: C.dim, size: 12 });
    return svg(170, b, "four quantum noise sources");
  })();

  // ---- M9: mitigation-ladder ----
  D["mitigation-ladder"] = (() => {
    let b = t(320, 24, "The mitigation ladder (statistical, cheap, NISQ)", { bold: true, size: 13 });
    const rows = [
      ["readout mitigation", "fixes measurement error", "~2x shots", C.good],
      ["dynamical decoupling", "fights T2, near-free", "~free", C.cyan],
      ["Pauli twirling", "coherent -> stochastic", "shots", C.acc],
      ["zero-noise extrapolation", "project to zero noise", "3-5x shots", C.warn]
    ];
    let y = 52; const x0 = 40, w = 340;
    rows.forEach(r => {
      b += box(x0, y, w, 34, { stroke: r[3], fill: C.box });
      b += t(x0 + 12, y + 22, r[0], { size: 12, a: "start", fill: r[3] });
      b += t(x0 + w + 12, y + 15, r[1], { size: 10, a: "start", fill: C.dim });
      b += t(x0 + w + 12, y + 30, r[2], { size: 10, a: "start", fill: C.faint });
      y += 42;
    });
    b += t(320, 232, "Correction (Module 10) is a different, structural regime.", { fill: C.faint, size: 11 });
    return svg(248, b, "error mitigation ladder");
  })();

  // ---- M9: vqe-loop ----
  D["vqe-loop"] = (() => {
    let b = t(320, 24, "VQE: a hybrid quantum-classical loop", { bold: true, size: 14 });
    b += box(70, 70, 200, 74, { stroke: C.cyan, fill: C.cyanFill });
    b += t(170, 98, "QUANTUM", { size: 12, bold: true, fill: C.cyanT });
    b += t(170, 120, "prepare |ψ(θ)⟩,", { size: 11, fill: C.dim });
    b += t(170, 136, "measure ⟨H⟩", { size: 11, fill: C.dim });
    b += box(370, 70, 200, 74, { stroke: C.acc, fill: C.accFill });
    b += t(470, 98, "CLASSICAL", { size: 12, bold: true, fill: C.accT });
    b += t(470, 120, "optimizer proposes", { size: 11, fill: C.dim });
    b += t(470, 136, "better θ", { size: 11, fill: C.dim });
    b += arrR(272, 96, 368, { stroke: C.faint }); b += t(320, 88, "energy", { size: 10, fill: C.faint });
    b += ln(470, 146, 470, 172, { stroke: C.faint }); b += ln(470, 172, 170, 172, { stroke: C.faint });
    b += ln(170, 172, 170, 146, { stroke: C.faint }); b += triU(170, 146, { stroke: C.faint });
    b += t(320, 168, "new θ", { size: 10, fill: C.faint });
    b += t(320, 200, "Shallow circuits (NISQ-friendly); repeat until energy stops dropping.", { fill: C.dim, size: 11 });
    return svg(216, b, "VQE hybrid loop");
  })();

  // ---- M9: qaoa-circuit ----
  D["qaoa-circuit"] = (() => {
    let b = t(320, 24, "QAOA: alternate cost and mixer for p rounds", { bold: true, size: 13 });
    const ys = [70, 104, 138];
    ys.forEach((y, i) => { b += t(44, y + 4, "q" + i, { size: 11, a: "start", fill: C.dim }); b += ln(80, y, 560, y, { stroke: C.line, sw: 1.5 }); });
    ys.forEach(y => b += box(90 - 16, y - 15, 32, 30, { stroke: C.acc }) + t(90, y + 5, "H", { size: 12, fill: C.accT, bold: true }));
    b += box(150, 58, 130, 92, { stroke: C.warn, fill: C.warnFill }) + t(215, 100, "cost", { size: 13, fill: C.warnT }) + t(215, 120, "e^{-iγH_C}", { size: 11, fill: C.faint });
    b += box(300, 58, 130, 92, { stroke: C.cyan, fill: C.cyanFill }) + t(365, 100, "mixer", { size: 13, fill: C.cyanT }) + t(365, 120, "e^{-iβH_M}", { size: 11, fill: C.faint });
    b += t(490, 96, "×p, then", { size: 11, fill: C.dim, a: "start" });
    b += t(490, 116, "sample", { size: 11, fill: C.goodT, a: "start" });
    b += t(320, 186, "Optimize 2p angles; deeper p = better approx, more noise.", { fill: C.faint, size: 11 });
    return svg(206, b, "QAOA alternating operator circuit");
  })();

  // ---- M9: qml-pipeline ----
  D["qml-pipeline"] = (() => {
    let b = t(320, 24, "QML pipeline (the quantum part often just encodes)", { bold: true, size: 13 });
    b += box(40, 66, 120, 54, { stroke: C.dim }) + t(100, 90, "classical", { size: 12 }) + t(100, 108, "data", { size: 11, fill: C.faint });
    b += arrR(162, 93, 200, { stroke: C.faint });
    b += box(206, 66, 130, 54, { stroke: C.acc, fill: C.accFill }) + t(271, 90, "feature map", { size: 12, fill: C.accT }) + t(271, 108, "→ quantum state", { size: 10, fill: C.faint });
    b += arrR(338, 93, 376, { stroke: C.faint });
    b += box(382, 56, 150, 34, { stroke: C.cyan }) + t(457, 78, "quantum kernel", { size: 11, fill: C.cyanT });
    b += box(382, 98, 150, 34, { stroke: C.cyan }) + t(457, 120, "variational ansatz", { size: 11, fill: C.cyanT });
    b += arrR(534, 93, 570, { stroke: C.faint }); b += t(556, 78, "label", { size: 10, fill: C.goodT, a: "end" });
    b += t(320, 168, "Classical ML often does the learning; obstacles: data-loading, plateaus.", { fill: C.faint, size: 11 });
    return svg(188, b, "quantum machine learning pipeline");
  })();

  // ---- M10: qec-concept ----
  D["qec-concept"] = (() => {
    let b = t(320, 24, "QEC's escape from three impossibilities", { bold: true, size: 14 });
    const items = [
      ["no-cloning", "spread info via", "entanglement", C.acc, C.accT],
      ["measurement", "measure PARITY", "not the data", C.cyan, C.cyanT],
      ["continuous errors", "measurement", "discretizes them", C.good, C.goodT]
    ];
    let x = 34; const w = 186, gap = 10, y = 58;
    items.forEach(it => {
      b += box(x, y, w, 82, { stroke: it[3], fill: C.box });
      b += t(x + w / 2, y + 26, it[0], { size: 12, bold: true, fill: it[4] });
      b += t(x + w / 2, y + 50, it[1], { size: 11, fill: C.dim });
      b += t(x + w / 2, y + 68, it[2], { size: 11, fill: C.dim });
      x += w + gap;
    });
    b += t(320, 166, "One logical qubit spread across many physical ones — not copies.", { fill: C.faint, size: 11 });
    return svg(184, b, "quantum error correction concept");
  })();

  // ---- M10: surface-code ----
  D["surface-code"] = (() => {
    let b = t(320, 22, "The surface code: local 4-qubit parity checks", { bold: true, size: 13 });
    const ox = 90, oy = 60, s = 46;
    // 4x4 data lattice with alternating checks
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const x = ox + c * s, y = oy + r * s;
      b += circ(x, y, 7, { fill: C.box, stroke: C.dim });   // data qubit
    }
    // check plaquettes (centers)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = ox + c * s + s / 2, y = oy + r * s + s / 2;
      const isZ = (r + c) % 2 === 0;
      b += circ(x, y, 6, { fill: isZ ? C.accFill : C.cyanFill, stroke: isZ ? C.acc : C.cyan });
    }
    b += circ(400, 80, 6, { fill: C.accFill, stroke: C.acc }); b += t(414, 84, "Z-check (X errors)", { size: 11, a: "start", fill: C.accT });
    b += circ(400, 108, 6, { fill: C.cyanFill, stroke: C.cyan }); b += t(414, 112, "X-check (Z errors)", { size: 11, a: "start", fill: C.cyanT });
    b += circ(400, 136, 7, { fill: C.box, stroke: C.dim }); b += t(414, 140, "data qubit", { size: 11, a: "start", fill: C.dim });
    b += t(400, 176, "distance d: ~2d² qubits/logical;", { size: 11, a: "start", fill: C.faint });
    b += t(400, 194, "logical error ~exp small in d", { size: 11, a: "start", fill: C.faint });
    b += t(200, 264, "An error lights a pair of defects; the decoder pairs them.", { fill: C.faint, size: 11 });
    return svg(282, b, "surface code lattice");
  })();

  // ---- M10: ftqc-stack ----
  D["ftqc-stack"] = (() => {
    let b = t(320, 24, "The fault-tolerant stack", { bold: true, size: 15 });
    const rows = [
      ["fault-tolerant algorithm", C.good],
      ["Clifford gates (cheap, transversal)  +  T gates (magic-state distilled, EXPENSIVE)", C.warn],
      ["surface-code logical qubits", C.cyan],
      ["physical qubits", C.acc]
    ];
    let y = 54; 
    rows.forEach((r, i) => {
      const w = i === 1 ? 560 : 340, x = 320 - w / 2;
      b += box(x, y, w, 40, { stroke: r[1], fill: C.box });
      b += t(320, y + 25, r[0], { size: i === 1 ? 11 : 13, fill: r[1] });
      if (i < rows.length - 1) b += arrU(320, y + 54, y + 42, { stroke: C.faint });
      y += 54;
    });
    b += t(320, y + 4, "The T gate is the bottleneck — hence T-count is the cost metric.", { fill: C.faint, size: 11 });
    return svg(y + 24, b, "fault tolerant computing stack");
  })();

  // ---- M11: modality-compare ----
  D["modality-compare"] = (() => {
    let b = t(320, 22, "Four qubit modalities — no clear winner", { bold: true, size: 14 });
    const items = [
      ["Superconducting", "fast gates, mature fab", "shorter coherence", "IBM, Google", C.acc, C.accT],
      ["Trapped ion", "best fidelity, all-to-all", "slow gates", "Quantinuum, IonQ", C.cyan, C.cyanT],
      ["Neutral atom", "1000+ qubits, rising", "improving fidelity", "QuEra, Pasqal", C.good, C.goodT],
      ["Photonic", "room-temp, networking", "lossy, probabilistic", "PsiQuantum", C.warn, C.warnT]
    ];
    let y = 48; const x0 = 30, w = 580;
    items.forEach(it => {
      b += box(x0, y, w, 44, { stroke: it[4], fill: C.box });
      b += t(x0 + 14, y + 27, it[0], { size: 13, a: "start", bold: true, fill: it[5] });
      b += t(x0 + 180, y + 19, it[1], { size: 10, a: "start", fill: C.dim });
      b += t(x0 + 180, y + 35, it[2], { size: 10, a: "start", fill: C.faint });
      b += t(x0 + w - 14, y + 27, it[3], { size: 10, a: "end", fill: C.dim });
      y += 52;
    });
    b += t(320, y + 4, "Best depends on metric, application, and fault-tolerance economics.", { fill: C.faint, size: 11 });
    return svg(y + 24, b, "quantum hardware modality comparison");
  })();
  window.DIAGRAMS = Object.assign(window.DIAGRAMS || {}, D);
})();
