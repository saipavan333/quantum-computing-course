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
    return svg(284, b, "Bloch sphere with poles and equator");
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

  // ---- M8: trotter-step (Hamiltonian simulation) ----
  D["trotter-step"] = (() => {
    let b = t(320, 22, "One first-order Trotter step for H = J·ΣZZ + h·ΣX", { bold: true, size: 13 });
    const ys = [64, 112, 160];
    ys.forEach((y, q) => { b += t(40, y + 4, "q" + q, { size: 11, a: "start", fill: C.dim }); b += wire(y, 70, 560); });
    ys.forEach(y => b += gateBox(120, y, "Rx", C.acc));
    b += t(120, 196, "exp(−i·h·dt·X)", { size: 10, fill: C.accT });
    b += box(200, ys[0] - 18, 110, ys[1] - ys[0] + 36, { stroke: C.cyan, fill: C.cyanFill });
    b += t(255, (ys[0] + ys[1]) / 2 - 2, "ZZ(J·dt)", { size: 12, fill: C.cyanT });
    b += t(255, (ys[0] + ys[1]) / 2 + 14, "CX · Rz · CX", { size: 10, fill: C.cyanT });
    b += box(330, ys[1] - 18, 110, ys[2] - ys[1] + 36, { stroke: C.cyan, fill: C.cyanFill });
    b += t(385, (ys[1] + ys[2]) / 2 - 2, "ZZ(J·dt)", { size: 12, fill: C.cyanT });
    b += t(385, (ys[1] + ys[2]) / 2 + 14, "CX · Rz · CX", { size: 10, fill: C.cyanT });
    b += box(460, 40, 150, 144, { stroke: C.warn, fill: C.warnFill });
    b += t(535, 100, "repeat r times", { size: 12, fill: C.warnT });
    b += t(535, 120, "dt = t / r", { size: 11, fill: C.warnT });
    b += t(535, 140, "error ~ t²/r · ‖[A,B]‖", { size: 10, fill: C.warnT });
    b += t(320, 218, "Smaller steps track exp(−iHt) better, but every step costs 2(n−1) CNOTs.", { fill: C.faint, size: 11 });
    return svg(232, b, "one Trotter step: X rotations then ZZ interactions, repeated r times");
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
  // =====================================================================
  // PASS 2 (Nov 2026): one "how it works" picture per lesson, shown in the
  // lesson's simple opening. Keys are p2-<lesson id>.
  // =====================================================================
  // any-angle arrow: the head's tip sits exactly on (x2,y2)
  const arr = (x1, y1, x2, y2, o = {}) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 9, s = 0.45, k = v => Math.round(v * 10) / 10;
    const bx = x2 - 7 * Math.cos(a), by = y2 - 7 * Math.sin(a);
    return ln(k(x1), k(y1), k(bx), k(by), o) +
      `<polygon points="${k(x2)},${k(y2)} ${k(x2 - h * Math.cos(a - s))},${k(y2 - h * Math.sin(a - s))} ${k(x2 - h * Math.cos(a + s))},${k(y2 - h * Math.sin(a + s))}" style="fill:${o.stroke || C.line}"/>`;
  };
  const lines = (x, y, arrTxt, o = {}) => arrTxt.map((s, i) => s ? t(x, y + i * (o.lh || 15), s, o) : "").join("");

  // ---- P2 M0: welcome — one quantum run, end to end ----
  D["p2-welcome"] = (() => {
    let b = t(320, 24, "One quantum program, start to finish", { bold: true, size: 15 });
    const steps = [
      ["You write", "a circuit on a", "normal laptop", C.acc, C.accT],
      ["Qubits start", "at 0, kept near", "absolute zero", C.cyan, C.cyanT],
      ["Gates steer", "the amplitudes", "(interference)", C.cyan, C.cyanT],
      ["Measure:", "each qubit", "gives 0 or 1", C.warn, C.warnT],
      ["Repeat it", "1,000s of times", "and count", C.good, C.goodT]
    ];
    const w = 108, g = 18, y = 44, h = 72;
    steps.forEach((s, i) => {
      const x = 14 + i * (w + g);
      b += box(x, y, w, h, { stroke: s[3] }) + t(x + w / 2, y + 23, s[0], { size: 14, bold: true, fill: s[4] });
      b += t(x + w / 2, y + 43, s[1], { size: 12, fill: C.dim }) + t(x + w / 2, y + 60, s[2], { size: 12, fill: C.dim });
      if (i < 4) b += arrR(x + w + 2, y + h / 2, x + w + g - 2, { stroke: C.faint });
    });
    const hx = 360, hy = 150, bars = [["00", 0.06], ["01", 0.05], ["10", 0.07], ["11", 0.82]];
    b += arrD(572, y + h + 2, hy - 4, { stroke: C.good });
    b += box(hx - 16, hy, 280, 132, { stroke: C.boxS, fill: C.card });
    bars.forEach((bb, i) => {
      const bh = bb[1] * 90, x = hx + 10 + i * 62;
      b += box(x, hy + 104 - bh, 36, bh, { r: 3, fill: i === 3 ? C.goodFill : C.box, stroke: i === 3 ? C.good : C.boxS });
      b += t(x + 18, hy + 124, bb[0], { size: 13, fill: i === 3 ? C.goodT : C.dim });
    });
    b += t(hx + 150, hy + 22, "the answer →", { size: 13, fill: C.goodT, a: "end" });
    b += lines(24, 176, ["Wrong answers cancel out,", "the right one piles up.", "", "The result is this histogram", "of many shots, never one", "magic readout of every answer."], { size: 14, a: "start", fill: C.dim, lh: 19 });
    return svg(300, b, "five steps of a quantum run ending in a histogram of shots where the correct bitstring is the tallest bar");
  })();

  // ---- P2 M0: setup — which Python is running? ----
  D["p2-setup"] = (() => {
    let b = t(320, 24, "The #1 setup bug: two Pythons, one library", { bold: true, size: 15 });
    b += box(20, 52, 200, 62, { stroke: C.acc }) + t(120, 77, "Terminal shows (.venv)", { size: 14, bold: true, fill: C.accT }) + t(120, 97, "pip install qiskit …", { size: 13, fill: C.dim });
    b += box(20, 178, 200, 62, { stroke: C.acc }) + t(120, 203, "VS Code / Jupyter", { size: 14, bold: true, fill: C.accT }) + t(120, 223, "kernel you selected", { size: 13, fill: C.dim });
    b += box(410, 44, 210, 90, { stroke: C.good, fill: C.goodFill }) + t(515, 70, ".venv Python", { size: 14, bold: true, fill: C.goodT });
    b += t(515, 90, "qiskit 2.x, qiskit-aer,", { size: 13, fill: C.dim }) + t(515, 106, "numpy, matplotlib", { size: 13, fill: C.dim });
    b += box(410, 178, 210, 62, { stroke: C.bad }) + t(515, 203, "System Python", { size: 14, bold: true, fill: C.badT }) + t(515, 223, "no qiskit inside", { size: 13, fill: C.dim });
    b += arr(222, 83, 406, 83, { stroke: C.good }) + t(314, 74, "pip installs land here", { size: 12, fill: C.goodT });
    b += arr(222, 192, 406, 130, { stroke: C.good }) + t(314, 128, "right pick: import works", { size: 12, fill: C.goodT });
    b += arr(222, 214, 406, 214, { stroke: C.bad, dash: "5 4" }) + t(314, 232, "wrong pick: import fails", { size: 12, fill: C.badT });
    b += t(320, 266, "ModuleNotFoundError: qiskit almost always means \"wrong Python\", not \"broken install\".", { size: 12, fill: C.warnT });
    return svg(284, b, "terminal installs into the venv Python; the editor kernel must point at the same venv or imports fail");
  })();

  // ---- P2 M1: numbers — square to get chance; each qubit doubles the count ----
  D["p2-numbers"] = (() => {
    let b = t(320, 24, "Two number habits quantum uses all the time", { bold: true, size: 15 });
    b += t(24, 50, "Amplitude → chance: square it", { size: 13, bold: true, fill: C.cyanT, a: "start" });
    [["+0.707", 64], ["−0.707", 118]].forEach(([v, y]) => {
      b += box(24, y, 96, 38, { stroke: C.cyan }) + t(72, y + 25, v, { size: 15, bold: true, fill: C.cyanT });
      b += arrR(122, y + 19, 176, { stroke: C.line }) + t(149, y + 12, "square", { size: 11, fill: C.dim });
      b += box(178, y, 120, 38, { stroke: C.good, fill: C.goodFill }) + t(238, y + 25, "0.50 = 50%", { size: 14, bold: true, fill: C.goodT });
    });
    b += lines(24, 186, ["Different signs, same chance.", "The sign is kept for later:", "it is what lets answers cancel."], { size: 12, fill: C.dim, a: "start", lh: 18 });
    b += t(340, 50, "Each extra qubit doubles the count", { size: 13, bold: true, fill: C.warnT, a: "start" });
    const vals = [2, 4, 8, 16, 32], base = 214;
    vals.forEach((v, i) => {
      const h = v / 32 * 130, x = 352 + i * 54;
      b += box(x, base - h, 34, h, { r: 3, fill: C.warnFill, stroke: C.warn });
      b += t(x + 17, base - h - 6, String(v), { size: 12, fill: C.warnT }) + t(x + 17, base + 18, "n=" + (i + 1), { size: 12, fill: C.dim });
    });
    b += t(480, 258, "30 qubits: 2³⁰ = 1,073,741,824 numbers", { size: 12, fill: C.dim });
    return svg(272, b, "squaring plus or minus 0.707 both give 0.5; bars doubling from 2 to 32 as qubits go from 1 to 5");
  })();

  // ---- P2 M1: algebra — function machines, order matters; normalization ----
  D["p2-algebra"] = (() => {
    let b = t(320, 24, "Functions are machines, and the order matters", { bold: true, size: 15 });
    const row = (y, m1, m2, out, formula) => {
      let s = box(20, y, 90, 40, { stroke: C.acc }) + t(65, y + 26, "x = 1", { size: 14, bold: true, fill: C.accT });
      s += arrR(112, y + 20, 138) + box(140, y, 130, 40, { stroke: C.cyan }) + t(205, y + 26, m1, { size: 14, fill: C.cyanT });
      s += arrR(272, y + 20, 298) + box(300, y, 130, 40, { stroke: C.cyan }) + t(365, y + 26, m2, { size: 14, fill: C.cyanT });
      s += arrR(432, y + 20, 458) + box(460, y, 80, 40, { stroke: C.good, fill: C.goodFill }) + t(500, y + 26, out, { size: 15, bold: true, fill: C.goodT });
      return s + t(552, y + 26, formula, { size: 13, fill: C.dim, a: "start" });
    };
    b += row(48, "f: double", "g: add 3", "5", "2x + 3");
    b += row(104, "g: add 3", "f: double", "8", "2x + 6");
    b += t(24, 176, "Normalization: if α² = 0.3, then β² = 1 − 0.3 = 0.7", { size: 13, bold: true, fill: C.warnT, a: "start" });
    b += box(24, 190, 178, 30, { r: 4, fill: C.accFill, stroke: C.acc }) + t(113, 210, "α² = 0.3", { size: 13, fill: C.accT });
    b += box(202, 190, 414, 30, { r: 4, fill: C.goodFill, stroke: C.good }) + t(409, 210, "β² = 0.7", { size: 13, fill: C.goodT });
    b += t(320, 244, "A qubit's chances are slices of one whole: they always add to 1.", { size: 12, fill: C.dim });
    return svg(262, b, "two function machines applied in different orders give 5 and 8; a bar split 0.3 and 0.7 showing normalization");
  })();

  // ---- P2 M1: trig — the point on the unit circle ----
  D["p2-trig"] = (() => {
    const cx = 150, cy = 156, R = 100, th = Math.PI / 3, px = cx + R * Math.cos(th), py = cy - R * Math.sin(th);
    let b = t(320, 24, "cos and sin are just the x and y of a point on a circle", { bold: true, size: 15 });
    b += ln(36, cy, 264, cy, { stroke: C.boxS }) + ln(cx, 44, cx, 268, { stroke: C.boxS });
    b += circ(cx, cy, R, { fill: "none", stroke: C.faint, sw: 1.4 });
    b += ln(cx, cy, px, cy, { stroke: C.cyan, sw: 4 }) + ln(cx, cy, cx, py, { stroke: C.warn, sw: 4 });
    b += ln(px, py, px, cy, { stroke: C.cyan, dash: "4 3" }) + ln(px, py, cx, py, { stroke: C.warn, dash: "4 3" });
    b += arr(cx, cy, px, py, { stroke: C.accT, sw: 2.4 }) + circ(px, py, 5, { fill: C.acc, stroke: C.accT });
    b += t(176, 146, "θ", { size: 14, fill: C.accT });
    b += t(175, cy + 20, "cos θ", { size: 13, fill: C.cyanT }) + t(cx - 8, 116, "sin θ", { size: 13, fill: C.warnT, a: "end" });
    b += t(cx + R + 4, cy - 6, "1", { size: 12, fill: C.dim, a: "start" });
    b += lines(300, 70, ["At θ = 60°:", "x = cos θ = 0.500", "y = sin θ = 0.866", "x² + y² = 0.250 + 0.750 = 1"], { size: 14, fill: C.tx, a: "start", lh: 22 });
    b += lines(300, 178, ["A qubit uses the same rule:", "amplitudes cos(θ/2) and sin(θ/2),", "chances cos²(θ/2) + sin²(θ/2) = 1."], { size: 13, fill: C.goodT, a: "start", lh: 20 });
    return svg(284, b, "unit circle with a point at 60 degrees; its x is cos theta 0.5 and its y is sin theta 0.866; squares add to 1");
  })();

  // ---- P2 M1: vectors2d — tip-to-tail addition and the dot product ----
  D["p2-vectors2d"] = (() => {
    const ox = 60, oy = 244, s = 40, P = (x, y) => [ox + x * s, oy - y * s];
    let b = t(320, 24, "Adding arrows, and asking how much they agree", { bold: true, size: 15 });
    for (let i = 0; i <= 6; i++) b += ln(ox + i * s, 84, ox + i * s, oy, { stroke: C.cardEdge, sw: 1 });
    for (let j = 0; j <= 4; j++) b += ln(ox, oy - j * s, ox + 6 * s, oy - j * s, { stroke: C.cardEdge, sw: 1 });
    const [ux, uy] = P(3, 1), [sx, sy] = P(4, 3), [vx, vy] = P(1, 2);
    b += ln(ox, oy, vx, vy, { stroke: C.faint, dash: "4 3" });
    b += arr(ox, oy, ux, uy, { stroke: C.cyan, sw: 2.6 }) + t(ux - 30, uy + 26, "u = (3, 1)", { size: 13, fill: C.cyanT });
    b += arr(ux, uy, sx, sy, { stroke: C.warn, sw: 2.6 }) + t(sx + 8, sy + 44, "v = (1, 2)", { size: 13, fill: C.warnT, a: "start" });
    b += arr(ox, oy, sx, sy, { stroke: C.good, sw: 2.6 }) + t(sx - 40, sy - 8, "u + v = (4, 3)", { size: 13, fill: C.goodT });
    b += lines(340, 70, ["Add: walk u, then walk v.", "(3, 1) + (1, 2) = (4, 3)"], { size: 14, fill: C.tx, a: "start", lh: 22 });
    b += lines(340, 140, ["Dot product u·v:", "3×1 + 1×2 = 5", "= |u|·|v|·cos(angle)", "= √10 · √5 · cos 45° = 5"], { size: 13, fill: C.accT, a: "start", lh: 20 });
    b += lines(340, 236, ["Arrows at 90° give 0:", "they share nothing."], { size: 13, fill: C.dim, a: "start", lh: 19 });
    return svg(270, b, "grid with vector u (3,1), vector v (1,2) placed tip to tail, and their sum (4,3); dot product worked as 5");
  })();

  // ---- P2 M2: complex — multiplying by i is a quarter turn ----
  D["p2-complex"] = (() => {
    const ox = 170, oy = 170, s = 36;
    let b = t(320, 24, "A complex number is an arrow; multiplying by i turns it 90°", { bold: true, size: 15 });
    b += ln(30, oy, 320, oy, { stroke: C.boxS }) + ln(ox, 44, ox, 270, { stroke: C.boxS });
    b += t(312, oy + 18, "real", { size: 12, fill: C.dim, a: "end" }) + t(ox + 8, 54, "imaginary", { size: 12, fill: C.dim, a: "start" });
    b += arr(ox, oy, ox + 3 * s, oy - 1 * s, { stroke: C.cyan, sw: 2.6 }) + t(ox + 3 * s - 4, oy - s - 14, "z = 3 + 1i", { size: 13, fill: C.cyanT });
    b += arr(ox, oy, ox - 1 * s, oy - 3 * s, { stroke: C.good, sw: 2.6 }) + t(ox - s - 6, oy - 3 * s, "i·z = −1 + 3i", { size: 13, fill: C.goodT, a: "end" });
    b += `<path d="M217.4,154.2 A50,50 0 0,0 154.2,122.6" style="fill:none;stroke:${C.warn};stroke-width:1.6;stroke-dasharray:4 3"/>`;
    b += t(206, 124, "90°", { size: 12, fill: C.warnT });
    b += lines(350, 70, ["z = 3 + 1i: 3 right, 1 up", "i·z = −1 + 3i", "", "Same length: √10 ≈ 3.16", "Angle grew by 90°", "", "i × i = −1:", "two quarter turns = a half turn"], { size: 14, fill: C.tx, a: "start", lh: 22 });
    return svg(284, b, "complex plane with z = 3 + 1i and i times z = -1 + 3i, the same length rotated by 90 degrees");
  })();

  // ---- P2 M2: euler — multiplying adds the angles ----
  D["p2-euler"] = (() => {
    const cx = 160, cy = 152, R = 100, P = d => [cx + R * Math.cos(d * Math.PI / 180), cy - R * Math.sin(d * Math.PI / 180)];
    let b = t(320, 24, "e^(iθ) is the point at angle θ, and multiplying adds the angles", { bold: true, size: 15 });
    b += ln(40, cy, 280, cy, { stroke: C.boxS }) + ln(cx, 40, cx, 268, { stroke: C.boxS }) + circ(cx, cy, R, { fill: "none", stroke: C.faint, sw: 1.4 });
    const [ax, ay] = P(30), [bx, by] = P(45), [px, py] = P(75);
    b += arr(cx, cy, ax, ay, { stroke: C.cyan, sw: 2.4 }) + t(ax + 8, ay + 6, "e^(i·30°)", { size: 13, fill: C.cyanT, a: "start" });
    b += arr(cx, cy, bx, by, { stroke: C.warn, sw: 2, dash: "5 4" }) + t(bx + 8, by - 4, "e^(i·45°)", { size: 13, fill: C.warnT, a: "start" });
    b += arr(cx, cy, px, py, { stroke: C.good, sw: 2.8 }) + t(px - 6, py - 10, "e^(i·75°)", { size: 13, fill: C.goodT, a: "end" });
    b += t(cx - R - 6, cy - 6, "−1", { size: 12, fill: C.dim, a: "end" }) + t(cx + R + 6, cy - 6, "1", { size: 12, fill: C.dim, a: "start" });
    b += lines(330, 76, ["e^(i·30°) × e^(i·45°) = e^(i·75°)", "Lengths: 1 × 1 = 1, still on the circle", "", "e^(i·75°) = cos 75° + i·sin 75°", "         = 0.259 + 0.966i", "", "e^(iπ) = −1: a half turn"], { size: 13, fill: C.tx, a: "start", lh: 22 });
    return svg(284, b, "unit circle with arrows at 30, 45 and 75 degrees; multiplying the first two gives the third");
  })();

  // ---- P2 M2: matrices — rows dotted with the input ----
  D["p2-matrices"] = (() => {
    let b = t(320, 24, "Matrix × vector: each output is one row dotted with the input", { bold: true, size: 15 });
    b += box(40, 56, 150, 88, { stroke: C.boxS }) + box(46, 64, 138, 28, { r: 6, fill: C.cyanFill, stroke: C.cyan }) + box(46, 106, 138, 28, { r: 6, fill: C.warnFill, stroke: C.warn });
    b += t(85, 83, "0", { size: 15, fill: C.cyanT }) + t(145, 83, "1", { size: 15, fill: C.cyanT }) + t(85, 125, "1", { size: 15, fill: C.warnT }) + t(145, 125, "0", { size: 15, fill: C.warnT });
    b += box(220, 56, 70, 88, { stroke: C.acc }) + t(255, 88, "0.8", { size: 15, fill: C.accT }) + t(255, 124, "0.6", { size: 15, fill: C.accT });
    b += t(315, 106, "=", { size: 20, bold: true });
    b += box(340, 56, 70, 88, { stroke: C.good, fill: C.goodFill }) + t(375, 88, "0.6", { size: 15, bold: true, fill: C.cyanT }) + t(375, 124, "0.8", { size: 15, bold: true, fill: C.warnT });
    b += arrR(412, 83, 440, { stroke: C.cyan }) + t(446, 88, "0×0.8 + 1×0.6 = 0.6", { size: 13, fill: C.cyanT, a: "start" });
    b += arrR(412, 120, 440, { stroke: C.warn }) + t(446, 125, "1×0.8 + 0×0.6 = 0.8", { size: 13, fill: C.warnT, a: "start" });
    b += t(115, 166, "matrix (the gate)", { size: 12, fill: C.dim }) + t(255, 166, "input", { size: 12, fill: C.dim }) + t(375, 166, "output", { size: 12, fill: C.dim });
    b += t(320, 206, "This matrix is the quantum NOT gate, X: it swaps the two amplitudes.", { size: 13, fill: C.tx });
    b += t(320, 230, "Chances before: 0.64 and 0.36. After: 0.36 and 0.64.", { size: 12, fill: C.dim });
    return svg(250, b, "the X matrix multiplied by the vector 0.8, 0.6 gives 0.6, 0.8, with each output computed as a row dot product");
  })();

  // ---- P2 M2: vector spaces — one arrow, two rulers ----
  D["p2-vector-spaces"] = (() => {
    const ox = 170, oy = 150, L0 = 150, d = Math.PI / 4;
    let b = t(320, 24, "One state, measured with two different rulers", { bold: true, size: 15 });
    b += arr(ox - 150, oy, ox + L0, oy, { stroke: C.boxS }) + t(ox + L0 - 2, oy + 18, "|0⟩", { size: 13, fill: C.dim, a: "end" });
    b += arr(ox, oy + 120, ox, oy - 112, { stroke: C.boxS }) + t(ox - 8, oy - 100, "|1⟩", { size: 13, fill: C.dim, a: "end" });
    const pp = [ox + 140 * Math.cos(d), oy - 140 * Math.sin(d)], pm = [ox + 140 * Math.cos(d), oy + 140 * Math.sin(d)];
    b += arr(ox, oy, pp[0], pp[1], { stroke: C.acc, dash: "6 4" }) + t(pp[0] + 6, pp[1] + 4, "|+⟩", { size: 13, fill: C.accT, a: "start" });
    b += arr(ox, oy, pm[0], pm[1], { stroke: C.acc, dash: "6 4" }) + t(pm[0] + 6, pm[1] + 4, "|−⟩", { size: 13, fill: C.accT, a: "start" });
    const a = Math.PI / 6, Lp = 140, tip = [ox + Lp * Math.cos(a), oy - Lp * Math.sin(a)];
    const fp = 0.9659 * Lp, fm = 0.2588 * Lp;
    b += ln(tip[0], tip[1], ox + fp * Math.cos(d), oy - fp * Math.sin(d), { stroke: C.good, dash: "3 3" });
    b += ln(tip[0], tip[1], ox + fm * Math.cos(d), oy + fm * Math.sin(d), { stroke: C.warn, dash: "3 3" });
    b += arr(ox, oy, tip[0], tip[1], { stroke: C.cyan, sw: 2.8 }) + t(tip[0] + 8, tip[1] + 14, "ψ", { size: 15, bold: true, fill: C.cyanT, a: "start" });
    b += lines(360, 62, ["Standard ruler |0⟩, |1⟩:", "ψ = (0.866, 0.500)", "chances 0.75 and 0.25"], { size: 13, fill: C.tx, a: "start", lh: 20 });
    b += lines(360, 140, ["Tilted ruler |+⟩, |−⟩:", "ψ = (0.966, 0.259)", "chances 0.933 and 0.067"], { size: 13, fill: C.accT, a: "start", lh: 20 });
    b += lines(360, 218, ["The arrow never moved.", "Only the ruler changed."], { size: 13, fill: C.goodT, a: "start", lh: 20 });
    return svg(286, b, "a state arrow at 30 degrees with coordinates in the 0/1 basis and in the plus/minus basis");
  })();

  // ---- P2 M2: dirac — bra meets ket, out comes one number ----
  D["p2-dirac"] = (() => {
    let b = t(320, 24, "Bra + ket = bracket: one number that measures overlap", { bold: true, size: 15 });
    b += box(24, 70, 150, 40, { stroke: C.acc }) + t(99, 96, "0.707   0.707", { size: 15, fill: C.accT });
    b += box(200, 50, 50, 80, { stroke: C.cyan }) + t(225, 82, "1", { size: 15, fill: C.cyanT }) + t(225, 114, "0", { size: 15, fill: C.cyanT });
    b += t(99, 134, "bra ⟨+| (a row)", { size: 12, fill: C.dim }) + t(225, 150, "ket |0⟩", { size: 12, fill: C.dim });
    b += arrR(256, 90, 290) + box(292, 70, 150, 40, { stroke: C.boxS }) + t(367, 95, "0.707·1 + 0.707·0", { size: 13 });
    b += arrR(444, 90, 470) + box(472, 70, 80, 40, { stroke: C.good, fill: C.goodFill }) + t(512, 96, "0.707", { size: 15, bold: true, fill: C.goodT });
    b += t(512, 128, "overlap ⟨+|0⟩", { size: 12, fill: C.dim });
    b += arrD(512, 136, 162, { stroke: C.warn }) + box(452, 164, 120, 36, { stroke: C.warn, fill: C.warnFill }) + t(512, 187, "square: 0.50", { size: 13, bold: true, fill: C.warnT });
    b += lines(24, 180, ["The squared overlap is the chance that a", "qubit in |0⟩ is found as |+⟩ when you", "measure in the plus/minus basis."], { size: 13, fill: C.tx, a: "start", lh: 19 });
    b += t(320, 248, "A state overlaps itself completely: ⟨ψ|ψ⟩ = 1. Opposite states overlap 0.", { size: 12, fill: C.dim });
    return svg(264, b, "row vector bra plus meets column vector ket zero; the products add to 0.707, which squares to a 0.5 chance");
  })();

  // ---- P2 M2: eigen — the X gate's own directions ----
  D["p2-eigen"] = (() => {
    let b = t(320, 24, "Eigenvectors keep their line; the eigenvalue is the stretch", { bold: true, size: 15 });
    const panels = [
      ["|0⟩ → X → |1⟩", [1, 0], [0, 1], "direction changed:", "not an eigenvector", C.bad, C.badT],
      ["|+⟩ → X → |+⟩", [0.707, 0.707], [0.707, 0.707], "same arrow:", "eigenvalue λ = +1", C.good, C.goodT],
      ["|−⟩ → X → −|−⟩", [0.707, -0.707], [-0.707, 0.707], "flipped on its line:", "eigenvalue λ = −1", C.warn, C.warnT]
    ];
    panels.forEach((p, i) => {
      const cx = 110 + i * 210, cy = 136, s = 66;
      b += t(cx, 52, p[0], { size: 13, bold: true, fill: p[6] });
      b += ln(cx - 76, cy, cx + 76, cy, { stroke: C.cardEdge }) + ln(cx, cy - 66, cx, cy + 66, { stroke: C.cardEdge });
      if (i === 2) b += ln(cx - 80 * 0.707, cy - 80 * 0.707, cx + 80 * 0.707, cy + 80 * 0.707, { stroke: C.boxS, dash: "3 4" });
      b += arr(cx, cy, cx + s * p[1][0], cy - s * p[1][1], { stroke: C.faint, sw: 4 });
      b += arr(cx, cy, cx + s * p[2][0], cy - s * p[2][1], { stroke: p[5], sw: 2.4 });
      b += t(cx, 226, p[3], { size: 12, fill: C.dim }) + t(cx, 243, p[4], { size: 12, fill: p[6] });
    });
    b += t(320, 266, "Gray arrow: before. Colored arrow: after the X gate. For any gate, |λ| = 1.", { size: 12, fill: C.dim });
    return svg(280, b, "three panels: X turns |0> into |1>, leaves |+> unchanged with eigenvalue +1, and flips |-> with eigenvalue -1");
  })();

  // ---- P2 M3: probability — a tree: multiply along, add across ----
  D["p2-probability"] = (() => {
    let b = t(320, 24, "Two measurements: multiply along a path, add the leaves you want", { bold: true, size: 15 });
    const node = (x, y, s, col, colT) => circ(x, y, 17, { fill: C.box, stroke: col }) + t(x, y + 5, s, { size: 14, bold: true, fill: colT });
    b += node(60, 150, "start", C.boxS, C.dim).replace('font-size:14px', 'font-size:10px');
    b += arr(76, 143, 211, 92, { stroke: C.cyan }) + t(130, 104, "0.7", { size: 13, fill: C.cyanT });
    b += arr(76, 157, 211, 208, { stroke: C.warn }) + t(130, 206, "0.3", { size: 13, fill: C.warnT });
    b += node(230, 85, "0", C.cyan, C.cyanT) + node(230, 215, "1", C.warn, C.warnT);
    const leaves = [[55, "00", "0.7 × 0.5 = 0.35", 85], [115, "01", "0.7 × 0.5 = 0.35", 85], [185, "10", "0.3 × 0.5 = 0.15", 215], [245, "11", "0.3 × 0.5 = 0.15", 215]];
    leaves.forEach(([y, s, v, py], i) => {
      b += arr(247, py + (y < py ? -6 : 6), 383, y, { stroke: C.line }) + t(320, (py + y) / 2 + (y < py ? -6 : 14), "0.5", { size: 12, fill: C.dim });
      b += node(400, y, s, i % 2 ? C.good : C.boxS, i % 2 ? C.goodT : C.tx) + t(426, y + 5, v, { size: 13, fill: i % 2 ? C.goodT : C.dim, a: "start" });
    });
    b += t(320, 282, "P(second qubit = 1) = 0.35 + 0.15 = 0.50 (the green leaves)", { size: 13, fill: C.goodT });
    return svg(296, b, "probability tree: first outcome 0 with 0.7 or 1 with 0.3, then 0 or 1 with 0.5 each; leaf probabilities 0.35, 0.35, 0.15, 0.15");
  })();

  // ---- P2 M3: sampling — four times the shots, half the error bar ----
  D["p2-sampling"] = (() => {
    const X = v => 140 + (v - 0.38) / 0.24 * 460;
    let b = t(320, 24, "Estimating a 50% chance from shots: 4× the shots, half the error", { bold: true, size: 15 });
    b += ln(X(0.5), 44, X(0.5), 226, { stroke: C.good, dash: "4 4" }) + t(X(0.5), 244, "true value 0.50", { size: 12, fill: C.goodT });
    [0.4, 0.45, 0.55, 0.6].forEach(v => { b += ln(X(v), 222, X(v), 230, { stroke: C.faint }) + t(X(v), 244, v.toFixed(2), { size: 11, fill: C.faint }); });
    [[100, 60], [400, 104], [1600, 148], [6400, 192]].forEach(([n, y]) => {
      const h = 1.96 * Math.sqrt(0.25 / n);
      b += t(24, y + 5, "n = " + n.toLocaleString("en-US"), { size: 13, fill: C.tx, a: "start" });
      b += ln(X(0.5 - h), y, X(0.5 + h), y, { stroke: C.cyan, sw: 4 }) + ln(X(0.5 - h), y - 8, X(0.5 - h), y + 8, { stroke: C.cyan }) + ln(X(0.5 + h), y - 8, X(0.5 + h), y + 8, { stroke: C.cyan });
      b += t(X(0.5 + h) + 10, y + 5, "± " + h.toFixed(3), { size: 12, fill: C.cyanT, a: "start" });
    });
    b += t(320, 270, "Bars show ±1.96 × √(p(1−p)/n), the usual 95% range, for p = 0.5.", { size: 12, fill: C.dim });
    return svg(284, b, "error bars around 0.5 shrinking from plus or minus 0.098 at 100 shots to 0.012 at 6400 shots");
  })();

  // ---- P2 M4: python basics — a loop traced step by step ----
  D["p2-python-basics"] = (() => {
    let b = t(320, 24, "A loop, traced one step at a time", { bold: true, size: 15 });
    b += box(20, 44, 290, 150, { stroke: C.acc, fill: C.card });
    const code = [["total = 0", 40], ["for k in range(1, 5):", 40], ["total = total + k", 72], ["print(total)", 40]];
    code.forEach(([s, x], i) => { b += t(x + 24, 78 + i * 30, s, { size: 14, fill: i === 2 ? C.warnT : C.accT, a: "start" }); });
    b += t(36, 78 + 0 * 30, "1", { size: 11, fill: C.faint }) + t(36, 108, "2", { size: 11, fill: C.faint }) + t(36, 138, "3", { size: 11, fill: C.faint }) + t(36, 168, "4", { size: 11, fill: C.faint });
    b += ln(52, 134, 52, 112, { stroke: C.warn }) + triU(52, 104, { stroke: C.warn }) + ln(52, 134, 60, 134, { stroke: C.warn });
    b += t(165, 214, "lines 2–3 repeat while k = 1, 2, 3, 4", { size: 12, fill: C.warnT });
    b += box(340, 44, 280, 186, { stroke: C.boxS, fill: C.card });
    b += t(390, 70, "pass", { size: 13, bold: true, fill: C.dim }) + t(480, 70, "k", { size: 13, bold: true, fill: C.dim }) + t(570, 70, "total", { size: 13, bold: true, fill: C.dim });
    b += ln(352, 80, 608, 80, { stroke: C.boxS });
    [[1, 1, 1], [2, 2, 3], [3, 3, 6], [4, 4, 10]].forEach(([p, k, tt], i) => {
      const y = 104 + i * 28;
      b += t(390, y, String(p), { size: 14, fill: C.tx }) + t(480, y, String(k), { size: 14, fill: C.cyanT }) + t(570, y, String(tt), { size: 14, bold: true, fill: C.warnT });
    });
    b += t(480, 220, "print shows 10", { size: 13, bold: true, fill: C.goodT });
    b += t(320, 254, "A variable is a name for a value; each pass of the loop rebinds total to a new value.", { size: 12, fill: C.dim });
    return svg(270, b, "four-line Python loop on the left and a trace table on the right where total goes 1, 3, 6, 10");
  })();

  // ---- P2 M4: python structures — shots list to counts dict to probabilities ----
  D["p2-python-structures"] = (() => {
    let b = t(320, 24, "From raw shots to a counts dict to probabilities", { bold: true, size: 15 });
    b += box(14, 52, 182, 54, { stroke: C.acc }) + t(105, 74, "list: shots", { size: 12, fill: C.dim }) + t(105, 95, "['0','1','1','0','1']", { size: 13, fill: C.accT });
    b += arrR(198, 79, 240, { stroke: C.line }) + t(219, 70, "loop", { size: 11, fill: C.dim });
    b += box(242, 52, 170, 54, { stroke: C.cyan }) + t(327, 74, "dict: counts", { size: 12, fill: C.dim }) + t(327, 95, "{'0': 2, '1': 3}", { size: 14, fill: C.cyanT });
    b += arrR(414, 79, 452, { stroke: C.line }) + t(433, 70, "÷ 5", { size: 11, fill: C.dim });
    b += box(454, 52, 172, 54, { stroke: C.good, fill: C.goodFill }) + t(540, 74, "dict: probs", { size: 12, fill: C.dim }) + t(540, 95, "{'0': 0.4, '1': 0.6}", { size: 14, fill: C.goodT });
    b += t(320, 140, "Asking a dict for a key it doesn't have:", { size: 13, bold: true, fill: C.tx });
    b += box(40, 156, 260, 50, { stroke: C.bad }) + t(170, 178, "counts['11']", { size: 14, fill: C.badT }) + t(170, 197, "KeyError: '11' (program stops)", { size: 12, fill: C.dim });
    b += box(340, 156, 260, 50, { stroke: C.good }) + t(470, 178, "counts.get('11', 0)", { size: 14, fill: C.goodT }) + t(470, 197, "0 (safe default)", { size: 12, fill: C.dim });
    b += t(320, 236, "Qiskit returns results as exactly this kind of counts dict.", { size: 12, fill: C.dim });
    return svg(252, b, "a list of shots becomes a counts dictionary and then a probabilities dictionary; missing keys raise KeyError unless you use get");
  })();

  // ---- P2 M4: python OOP — one blueprint, separate objects ----
  D["p2-python-oop"] = (() => {
    let b = t(320, 24, "One class (blueprint), many objects, each with its own data", { bold: true, size: 15 });
    b += box(200, 42, 240, 72, { stroke: C.acc, fill: C.accFill }) + t(320, 64, "class Qubit", { size: 14, bold: true, fill: C.accT });
    b += t(320, 84, "attribute: state = '0'", { size: 12, fill: C.dim }) + t(320, 102, "method: apply_x() flips state", { size: 12, fill: C.dim });
    b += arr(270, 116, 150, 156, { stroke: C.acc }) + arr(370, 116, 490, 156, { stroke: C.acc });
    b += t(170, 132, "q1 = Qubit()", { size: 12, fill: C.accT, a: "end" }) + t(470, 132, "q2 = Qubit()", { size: 12, fill: C.accT, a: "start" });
    b += box(60, 158, 180, 62, { stroke: C.warn }) + t(150, 182, "q1", { size: 14, bold: true, fill: C.warnT }) + t(150, 204, "state: '0' → '1'", { size: 13, fill: C.warnT });
    b += box(400, 158, 180, 62, { stroke: C.cyan }) + t(490, 182, "q2", { size: 14, bold: true, fill: C.cyanT }) + t(490, 204, "state: '0' (unchanged)", { size: 13, fill: C.cyanT });
    b += t(150, 242, "after q1.apply_x()", { size: 12, fill: C.warnT });
    b += t(320, 266, "Inside apply_x, self is q1, so only q1's state changes.", { size: 12, fill: C.dim });
    return svg(280, b, "a Qubit class creates two objects; calling apply_x on q1 changes only q1's state");
  })();

  // ---- P2 M4: numpy — one call over the whole array; a gate as matrix @ vector ----
  D["p2-numpy"] = (() => {
    let b = t(320, 24, "Why NumPy is fast, and what a gate looks like in it", { bold: true, size: 15 });
    b += t(160, 52, "Plain Python loop", { size: 13, bold: true, fill: C.badT });
    for (let i = 0; i < 4; i++) {
      const x = 30 + i * 66;
      b += box(x, 64, 50, 34, { stroke: C.bad }) + t(x + 25, 86, "x" + i, { size: 13, fill: C.badT });
      if (i < 3) b += arrR(x + 52, 81, x + 64, { stroke: C.faint });
    }
    b += t(160, 120, "each item: look up types, then add", { size: 12, fill: C.dim });
    b += t(480, 52, "NumPy array", { size: 13, bold: true, fill: C.goodT });
    b += box(340, 64, 280, 34, { stroke: C.good, fill: C.goodFill }) + t(480, 86, "x0  x1  x2  x3  …  (one block)", { size: 13, fill: C.goodT });
    b += t(480, 120, "one call; the loop runs in compiled C", { size: 12, fill: C.dim });
    b += ln(20, 140, 620, 140, { stroke: C.cardEdge });
    b += t(320, 166, "A gate on a state: X @ psi", { size: 13, bold: true, fill: C.tx });
    b += box(140, 180, 90, 56, { stroke: C.acc }) + t(185, 203, "0    1", { size: 14, fill: C.accT }) + t(185, 225, "1    0", { size: 14, fill: C.accT });
    b += t(250, 214, "@", { size: 16, bold: true }) + box(270, 180, 50, 56, { stroke: C.cyan }) + t(295, 203, "1", { size: 14, fill: C.cyanT }) + t(295, 225, "0", { size: 14, fill: C.cyanT });
    b += t(340, 214, "=", { size: 16, bold: true }) + box(360, 180, 50, 56, { stroke: C.good }) + t(385, 203, "0", { size: 14, fill: C.goodT }) + t(385, 225, "1", { size: 14, fill: C.goodT });
    b += t(185, 254, "shape (2, 2)", { size: 12, fill: C.dim }) + t(295, 254, "(2,)", { size: 12, fill: C.dim }) + t(385, 254, "(2,)", { size: 12, fill: C.dim });
    b += t(510, 214, "|0⟩ becomes |1⟩", { size: 13, fill: C.goodT });
    return svg(268, b, "a Python loop handles items one by one while NumPy processes the whole array in one call; the X matrix times [1, 0] gives [0, 1]");
  })();

  // ---- P2 M5: quantum world — random single results, a steady pattern, and collapse ----
  D["p2-quantum-world"] = (() => {
    let b = t(320, 24, "Same preparation, random single results, a steady pattern", { bold: true, size: 15 });
    b += box(14, 50, 150, 52, { stroke: C.cyan }) + t(89, 72, "prepare the", { size: 12, fill: C.dim }) + t(89, 91, "same state", { size: 14, bold: true, fill: C.cyanT });
    b += arrR(166, 76, 196) + box(198, 50, 96, 52, { stroke: C.warn }) + t(246, 81, "measure", { size: 14, bold: true, fill: C.warnT });
    b += arrR(296, 76, 326);
    const shots = "0 1 1 0 1 0 0 1 1 0".split(" ");
    shots.forEach((s, i) => { b += box(330 + i * 29, 60, 24, 32, { r: 5, stroke: s === "1" ? C.acc : C.boxS }) + t(342 + i * 29, 82, s, { size: 14, bold: true, fill: s === "1" ? C.accT : C.tx }); });
    b += t(474, 116, "each shot: one plain 0 or 1, unpredictable", { size: 12, fill: C.dim });
    b += box(330, 128, 290, 46, { stroke: C.good, fill: C.goodFill }) + t(475, 157, "many shots: about 50% 0s, 50% 1s", { size: 13, bold: true, fill: C.goodT });
    b += ln(20, 192, 620, 192, { stroke: C.cardEdge });
    b += t(24, 218, "Measure again straight away:", { size: 13, bold: true, fill: C.tx, a: "start" });
    b += box(24, 230, 120, 36, { stroke: C.acc }) + t(84, 253, "got 1", { size: 14, fill: C.accT });
    b += arrR(146, 248, 186) + box(188, 230, 140, 36, { stroke: C.acc }) + t(258, 253, "again: 1, 1, 1 …", { size: 14, fill: C.accT });
    b += t(350, 244, "The state has collapsed to |1⟩.", { size: 13, fill: C.warnT, a: "start" }) + t(350, 263, "The 50/50 superposition is gone.", { size: 13, fill: C.dim, a: "start" });
    return svg(284, b, "a superposition measured repeatedly gives random 0s and 1s that average to 50/50; measuring again after a result repeats it");
  })();

  // ---- P2 M5: qubit — amplitudes, squaring, sampling, collapse ----
  D["p2-qubit"] = (() => {
    let b = t(320, 24, "The Born rule: from amplitudes to a result", { bold: true, size: 15 });
    const st = [["amplitudes", "α = 0.6", "β = 0.8", C.cyan, C.cyanT], ["square sizes", "|α|² = 0.36", "|β|² = 0.64", C.acc, C.accT], ["random pick", "0 w.p. 36%", "1 w.p. 64%", C.warn, C.warnT], ["after: state", "say we got 1", "now |1⟩", C.good, C.goodT]];
    st.forEach((s, i) => {
      const x = 14 + i * 157;
      b += box(x, 48, 140, 92, { stroke: s[3] }) + t(x + 70, 70, s[0], { size: 12, fill: C.dim });
      b += t(x + 70, 98, s[1], { size: 14, bold: true, fill: s[4] }) + t(x + 70, 124, s[2], { size: 14, bold: true, fill: s[4] });
      if (i < 3) b += arrR(x + 142, 94, x + 155, { stroke: C.line });
    });
    b += t(320, 166, "0.36 + 0.64 = 1, so these two amplitudes make a valid state.", { size: 13, fill: C.tx });
    b += ln(20, 184, 620, 184, { stroke: C.cardEdge });
    b += t(320, 210, "Now flip the sign: α = 0.6, β = −0.8", { size: 13, bold: true, fill: C.warnT });
    b += t(320, 234, "Same chances, 36% and 64%. Measuring in this basis can't tell the two apart,", { size: 12, fill: C.dim });
    b += t(320, 254, "but a gate before the measurement can make them interfere differently.", { size: 12, fill: C.dim });
    return svg(272, b, "amplitudes 0.6 and 0.8 square to chances 0.36 and 0.64, a random result is drawn and the state collapses; flipping a sign keeps the chances");
  })();

  // ---- P2 M5: bloch — the tip's height sets the chances ----
  D["p2-bloch"] = (() => {
    const cx = 170, cy = 150, R = 105, th = Math.PI / 3, ph = Math.PI / 2;
    const P = (x, y, z) => [cx + R * (0.92 * y - 0.42 * x), cy - R * (0.92 * z - 0.28 * x)];
    let b = t(320, 24, "Bloch sphere: the arrow's height decides the chances", { bold: true, size: 15 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.faint, sw: 1.4 });
    let eq = []; for (let k = 0; k <= 48; k++) { const a = k / 48 * 2 * Math.PI; eq.push(P(Math.cos(a), Math.sin(a), 0).map(v => v.toFixed(1)).join(",")); }
    b += `<polyline points="${eq.join(" ")}" style="fill:none;stroke:${C.boxS};stroke-width:1.2;stroke-dasharray:4 3"/>`;
    const [zx, zy] = P(0, 0, 1.18), [nx, ny] = P(0, 0, -1.18);
    b += ln(nx, ny, zx, zy, { stroke: C.boxS }) + t(zx + 12, zy + 8, "|0⟩", { size: 13, fill: C.goodT, a: "start" }) + t(nx + 12, ny + 4, "|1⟩", { size: 13, fill: C.warnT, a: "start" });
    const [xx, xy] = P(1.25, 0, 0), [yx, yy] = P(0, 1.22, 0);
    b += ln(cx, cy, xx, xy, { stroke: C.boxS, dash: "3 3" }) + t(xx - 6, xy + 14, "|+⟩", { size: 12, fill: C.dim, a: "end" });
    b += ln(cx, cy, yx, yy, { stroke: C.boxS, dash: "3 3" }) + t(yx + 4, yy - 6, "|+i⟩", { size: 12, fill: C.dim, a: "start" });
    const v = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)], [vx, vy] = P(v[0], v[1], v[2]), [hx, hy] = P(0, 0, v[2]);
    b += ln(vx, vy, hx, hy, { stroke: C.good, dash: "4 3" }) + circ(hx, hy, 4, { fill: C.good, stroke: C.good });
    b += arr(cx, cy, vx, vy, { stroke: C.cyan, sw: 2.8 }) + t(vx + 8, vy - 4, "ψ", { size: 15, bold: true, fill: C.cyanT, a: "start" });
    b += lines(330, 66, ["θ = 60° down from |0⟩, φ = 90° around", "height of the tip: z = cos θ = 0.50"], { size: 13, fill: C.tx, a: "start", lh: 20 });
    b += lines(330, 124, ["P(0) = (1 + z) / 2 = cos²(θ/2) = 0.75", "P(1) = (1 − z) / 2 = sin²(θ/2) = 0.25"], { size: 13, fill: C.goodT, a: "start", lh: 20 });
    b += lines(330, 182, ["φ does not change these chances.", "It shows up when a gate turns the", "sphere, or if you measure along x or y."], { size: 13, fill: C.dim, a: "start", lh: 20 });
    return svg(284, b, "Bloch sphere with a state at theta 60 degrees; the height of its tip, z = 0.5, gives P(0) = 0.75");
  })();

  // ---- P2 M5: evolution — relative phase changes the outcome, global phase doesn't ----
  D["p2-evolution"] = (() => {
    let b = t(320, 24, "Which phase matters? Run each state through H and measure", { bold: true, size: 15 });
    b += t(110, 52, "state before H", { size: 12, fill: C.dim }) + t(300, 52, "chances before", { size: 12, fill: C.dim }) + t(530, 52, "after H: chances", { size: 12, fill: C.dim });
    const rows = [["(|0⟩ + |1⟩)/√2", "|0⟩ for sure", C.good, C.goodT, "start"], ["(|0⟩ − |1⟩)/√2", "|1⟩ for sure", C.warn, C.warnT, "relative phase −1"], ["−(|0⟩ + |1⟩)/√2", "|0⟩ for sure", C.good, C.goodT, "global phase −1"]];
    rows.forEach((r, i) => {
      const y = 64 + i * 62;
      b += box(20, y, 180, 44, { stroke: C.cyan }) + t(110, y + 27, r[0], { size: 14, fill: C.cyanT });
      b += box(230, y, 140, 44, { stroke: C.boxS }) + t(300, y + 27, "50% / 50%", { size: 14, fill: C.tx });
      b += arrR(372, y + 22, 418, { stroke: C.line }) + t(395, y + 14, "H", { size: 13, bold: true, fill: C.accT });
      b += box(420, y, 200, 44, { stroke: r[2], fill: C.box }) + t(520, y + 27, r[1], { size: 14, bold: true, fill: r[3] });
      if (i) b += t(110, y + 56, r[4], { size: 11, fill: r[3] });
    });
    b += t(320, 266, "Rows 1 and 2 match before H but end opposite. Rows 1 and 3 are the same physical state.", { size: 12, fill: C.dim });
    return svg(282, b, "three states with equal chances; after a Hadamard the relative-phase state ends in 1 while the global-phase state behaves like the first");
  })();

  // ---- P2 M6: single gates — X, H, Z as half-turns of the Bloch arrow (x–z slice) ----
  D["p2-single-gates"] = (() => {
    let b = t(320, 24, "Gates turn the Bloch arrow: X, H and Z are half-turns about different axes", { bold: true, size: 15 });
    const P = [["X: |0⟩ → |1⟩", 0, 180, "axis x", 0], ["H: |0⟩ → |+⟩", 0, 90, "axis between x and z", 45], ["Z: |+⟩ → |−⟩", 90, 270, "axis z (out of page)", null]];
    P.forEach((p, i) => {
      const cx = 110 + i * 210, cy = 140, R = 64;
      const pt = d => [cx + R * Math.sin(d * Math.PI / 180), cy - R * Math.cos(d * Math.PI / 180)];
      b += t(cx, 56, p[0], { size: 14, bold: true, fill: C.accT });
      b += circ(cx, cy, R, { fill: "none", stroke: C.faint, sw: 1.3 });
      b += t(cx, cy - R - 6, "|0⟩", { size: 11, fill: C.dim }) + t(cx, cy + R + 15, "|1⟩", { size: 11, fill: C.dim });
      b += t(cx + R + 4, cy + 4, "|+⟩", { size: 11, fill: C.dim, a: "start" }) + t(cx - R - 4, cy + 4, "|−⟩", { size: 11, fill: C.dim, a: "end" });
      if (p[4] === null) b += circ(cx, cy, 6, { fill: "none", stroke: C.warn, sw: 1.6 }) + circ(cx, cy, 1.8, { fill: C.warn, stroke: C.warn });
      else { const a = p[4] * Math.PI / 180, dx = (R + 10) * Math.cos(a), dy = (R + 10) * Math.sin(a); b += ln(cx - dx, cy + dy, cx + dx, cy - dy, { stroke: C.warn, dash: "5 4" }); }
      const [bx0, by0] = pt(p[1]), [bx1, by1] = pt(p[2]);
      b += arr(cx, cy, bx0, by0, { stroke: C.faint, sw: 3.5 }) + arr(cx, cy, bx1, by1, { stroke: C.cyan, sw: 2.6 });
      b += t(cx, 238, p[3], { size: 12, fill: C.warnT });
    });
    b += t(320, 266, "Gray: before. Cyan: after. Dashed or dotted: the axis the gate turns 180° around.", { size: 12, fill: C.dim });
    return svg(280, b, "three slices of the Bloch sphere: X flips |0> to |1>, H turns |0> to |+>, Z turns |+> to |->");
  })();

  // ---- P2 M6: tensor — every amplitude times every amplitude ----
  D["p2-tensor"] = (() => {
    let b = t(320, 24, "Two separate qubits combine by multiplying every pair of amplitudes", { bold: true, size: 15 });
    b += t(60, 70, "qubit A", { size: 12, fill: C.dim }) + t(60, 96, "0.6 |0⟩", { size: 14, fill: C.cyanT }) + t(60, 150, "0.8 |1⟩", { size: 14, fill: C.cyanT });
    b += t(240, 56, "qubit B:  0.707 |0⟩", { size: 13, fill: C.warnT }) + t(400, 56, "0.707 |1⟩", { size: 13, fill: C.warnT });
    const cells = [["|00⟩", "0.424", "18%", 0, 0], ["|01⟩", "0.424", "18%", 1, 0], ["|10⟩", "0.566", "32%", 0, 1], ["|11⟩", "0.566", "32%", 1, 1]];
    cells.forEach(([k, a, p, c, r]) => {
      const x = 180 + c * 160, y = 70 + r * 54;
      b += box(x, y, 150, 46, { stroke: C.acc, fill: C.accFill }) + t(x + 40, y + 28, k, { size: 14, bold: true, fill: C.accT }) + t(x + 110, y + 22, a, { size: 13, fill: C.tx }) + t(x + 110, y + 39, p, { size: 12, fill: C.dim });
    });
    b += t(500, 100, "0.6 × 0.707", { size: 12, fill: C.dim, a: "start" }) + t(500, 154, "0.8 × 0.707", { size: 12, fill: C.dim, a: "start" });
    b += t(320, 200, "4 amplitudes; their squares add to 1 (0.18 + 0.18 + 0.32 + 0.32).", { size: 13, fill: C.goodT });
    b += t(320, 230, "An entangled state such as (|00⟩ + |11⟩)/√2 cannot be made this way:", { size: 12, fill: C.warnT });
    b += t(320, 248, "it would need A0·B1 = 0 while A0·B0 and A1·B1 are both non-zero.", { size: 12, fill: C.dim });
    return svg(264, b, "a 2 by 2 grid of products of qubit A amplitudes 0.6 and 0.8 with qubit B amplitudes 0.707, giving four two-qubit amplitudes");
  })();

  // ---- P2 M6: two-qubit gates — what CNOT, CZ and SWAP do to basis states ----
  D["p2-two-qubit-gates"] = (() => {
    let b = t(320, 24, "Two-qubit gates on the four basis states (control written first)", { bold: true, size: 15 });
    const tabs = [["CNOT", ["00 → 00", "01 → 01", "10 → 11", "11 → 10"], "flips the 2nd bit if the 1st is 1", C.cyan, C.cyanT],
      ["CZ", ["00 → 00", "01 → 01", "10 → 10", "11 → −11"], "minus sign only on 11", C.warn, C.warnT],
      ["SWAP", ["00 → 00", "01 → 10", "10 → 01", "11 → 11"], "trades the two qubits", C.good, C.goodT]];
    tabs.forEach((tb, i) => {
      const x = 20 + i * 210, w = 190;
      b += box(x, 44, w, 190, { stroke: tb[3] }) + t(x + w / 2, 68, tb[0], { size: 15, bold: true, fill: tb[4] });
      tb[1].forEach((r, j) => { const hot = r.split(" → ")[0] !== r.split(" → ")[1]; b += t(x + w / 2, 100 + j * 28, "|" + r.replace(" → ", "⟩ → |").replace("−", "−|").replace("|−|", "−|") + "⟩", { size: 15, fill: hot ? tb[4] : C.dim, bold: hot }); });
      b += t(x + w / 2, 222, tb[2], { size: 12, fill: C.dim });
    });
    b += t(320, 262, "On a superposition these act on every part at once, which is how CNOT creates entanglement.", { size: 12, fill: C.tx });
    return svg(278, b, "truth tables: CNOT flips the second bit when the first is 1, CZ adds a minus sign to 11, SWAP exchanges 01 and 10");
  })();

  // ---- P2 M6: entanglement — perfect match, random alone, beats any plan, no signal ----
  D["p2-entanglement"] = (() => {
    let b = t(320, 24, "A Bell pair: random on each side, matched together, no message sent", { bold: true, size: 15 });
    b += t(30, 60, "|0⟩", { size: 13, fill: C.dim }) + t(30, 110, "|0⟩", { size: 13, fill: C.dim });
    b += ln(46, 56, 300, 56, { stroke: C.line }) + ln(46, 106, 300, 106, { stroke: C.line });
    b += box(80, 40, 40, 32, { stroke: C.acc, fill: C.accFill }) + t(100, 61, "H", { size: 14, bold: true, fill: C.accT });
    b += circ(170, 56, 5, { fill: C.cyan, stroke: C.cyan }) + ln(170, 56, 170, 106, { stroke: C.cyan }) + circ(170, 106, 11, { fill: "none", stroke: C.cyan }) + ln(159, 106, 181, 106, { stroke: C.cyan }) + ln(170, 95, 170, 117, { stroke: C.cyan });
    b += t(240, 86, "(|00⟩ + |11⟩)/√2", { size: 14, bold: true, fill: C.cyanT });
    b += box(320, 40, 300, 30, { stroke: C.boxS }) + t(470, 60, "Alice alone: 0 or 1, 50/50", { size: 13, fill: C.tx });
    b += box(320, 76, 300, 30, { stroke: C.boxS }) + t(470, 96, "Bob alone: 0 or 1, 50/50", { size: 13, fill: C.tx });
    b += box(320, 112, 300, 30, { stroke: C.good, fill: C.goodFill }) + t(470, 132, "compared later: always the same", { size: 13, bold: true, fill: C.goodT });
    b += t(320, 170, "Random questions, CHSH game win rate:", { size: 13, bold: true, fill: C.tx });
    const X = v => 150 + v * 420;
    b += ln(X(0), 188, X(1), 188, { stroke: C.faint }) + t(X(0), 184, "0%", { size: 10, fill: C.faint }) + t(X(1), 184, "100%", { size: 10, fill: C.faint });
    b += box(X(0), 196, X(0.75) - X(0), 22, { r: 3, fill: C.box, stroke: C.boxS }) + t(142, 212, "best plan", { size: 12, fill: C.dim, a: "end" }) + t(X(0.75) + 6, 212, "75% (S ≤ 2)", { size: 12, fill: C.dim, a: "start" });
    b += box(X(0), 224, X(0.8536) - X(0), 22, { r: 3, fill: C.cyanFill, stroke: C.cyan }) + t(142, 240, "Bell pair", { size: 12, fill: C.cyanT, a: "end" }) + t(X(0.8536) + 6, 240, "85.4% (S = 2√2)", { size: 12, fill: C.cyanT, a: "start" });
    b += t(320, 270, "Whatever Alice does, Bob's own results stay 50/50, so no message travels.", { size: 12, fill: C.warnT });
    return svg(284, b, "H and CNOT make a Bell pair; each side alone is random, together they match; the pair wins the CHSH game 85.4 percent against 75 percent for any plan");
  })();

  // ---- P2 M6: protocols — teleportation timeline ----
  D["p2-protocols"] = (() => {
    let b = t(320, 24, "Teleportation: a qubit's state moves, using a shared pair and 2 ordinary bits", { bold: true, size: 15 });
    b += box(14, 48, 180, 70, { stroke: C.acc }) + t(104, 72, "Alice holds", { size: 12, fill: C.dim }) + t(104, 94, "ψ + her half", { size: 14, bold: true, fill: C.accT }) + t(104, 110, "of a Bell pair", { size: 12, fill: C.dim });
    b += arrR(196, 83, 226) + box(228, 48, 170, 70, { stroke: C.warn }) + t(313, 72, "Bell measurement", { size: 13, bold: true, fill: C.warnT }) + t(313, 92, "gives 2 random bits", { size: 12, fill: C.dim }) + t(313, 108, "ψ is gone from Alice", { size: 12, fill: C.badT });
    b += arrR(400, 83, 430) + box(432, 48, 194, 70, { stroke: C.boxS }) + t(529, 72, "phone call", { size: 12, fill: C.dim }) + t(529, 94, "2 bits, e.g. 1 0", { size: 14, bold: true }) + t(529, 110, "no faster than light", { size: 12, fill: C.dim });
    b += arrD(529, 120, 156, { stroke: C.line });
    b += box(432, 158, 194, 70, { stroke: C.cyan }) + t(529, 182, "Bob fixes his half:", { size: 12, fill: C.dim }) + t(529, 204, "X and/or Z, chosen", { size: 14, bold: true, fill: C.cyanT }) + t(529, 220, "by the 2 bits", { size: 12, fill: C.dim });
    b += arrL(430, 193, 360, { stroke: C.good }) + box(214, 166, 144, 54, { stroke: C.good, fill: C.goodFill }) + t(286, 199, "Bob now has ψ", { size: 14, bold: true, fill: C.goodT });
    b += lines(20, 158, ["Before the call, Bob's half", "is random noise to him.", "One state in, one state out:", "nothing was copied."], { size: 12, fill: C.dim, a: "start", lh: 17 });
    b += t(320, 260, "Superdense coding runs it the other way: 1 qubit + a shared pair carries 2 bits.", { size: 12, fill: C.tx });
    return svg(276, b, "teleportation steps: Bell measurement on Alice's side gives two bits, sent by phone, and Bob's correction recreates the state");
  })();

  // ---- P2 M7: qiskit circuits — four lines of code become a circuit and a counts dict ----
  D["p2-qiskit-circuits"] = (() => {
    let b = t(320, 24, "Four lines of Qiskit, the circuit they build, and what comes back", { bold: true, size: 15 });
    b += box(14, 44, 236, 140, { stroke: C.acc, fill: C.card });
    ["qc = QuantumCircuit(2)", "qc.h(0)", "qc.cx(0, 1)", "qc.measure_all()"].forEach((s, i) => { b += t(28, 74 + i * 30, s, { size: 14, fill: C.accT, a: "start" }); });
    b += arrR(252, 114, 282, { stroke: C.line });
    b += t(300, 74, "q0", { size: 13, fill: C.dim }) + t(300, 134, "q1", { size: 13, fill: C.dim });
    b += ln(316, 70, 560, 70, { stroke: C.line }) + ln(316, 130, 560, 130, { stroke: C.line });
    b += box(340, 54, 34, 32, { stroke: C.acc, fill: C.accFill }) + t(357, 75, "H", { size: 14, bold: true, fill: C.accT });
    b += circ(410, 70, 5, { fill: C.cyan, stroke: C.cyan }) + ln(410, 70, 410, 130, { stroke: C.cyan }) + circ(410, 130, 11, { fill: "none", stroke: C.cyan }) + ln(399, 130, 421, 130, { stroke: C.cyan }) + ln(410, 119, 410, 141, { stroke: C.cyan });
    [70, 130].forEach(y => { b += box(470, y - 16, 40, 32, { stroke: C.warn }) + `<path d="M478,${y + 6} A12,12 0 0,1 502,${y + 6}" style="fill:none;stroke:${C.warn};stroke-width:1.6"/>` + ln(490, y + 6, 500, y - 8, { stroke: C.warn }); });
    b += t(357, 164, "superpose", { size: 11, fill: C.dim }) + t(410, 164, "entangle", { size: 11, fill: C.dim }) + t(490, 164, "measure", { size: 11, fill: C.dim });
    b += ln(20, 200, 620, 200, { stroke: C.cardEdge });
    b += t(24, 228, "Run 1,024 shots and you get a counts dict, roughly:", { size: 13, fill: C.tx, a: "start" });
    b += box(380, 210, 240, 30, { stroke: C.good, fill: C.goodFill }) + t(500, 230, "{'00': ~512, '11': ~512}", { size: 14, bold: true, fill: C.goodT });
    b += t(320, 264, "Never '01' or '10' on an ideal simulator. Qiskit reads bit strings right to left (q0 last).", { size: 11, fill: C.dim });
    return svg(278, b, "Qiskit code for a Bell circuit, the drawn circuit with H, CNOT and two measurements, and a counts dictionary of about 512 00s and 512 11s");
  })();

  // ---- P2 M7: simulation — exact statevector vs sampled shots, and the memory bill ----
  D["p2-simulation"] = (() => {
    let b = t(320, 24, "Two ways to simulate the same Bell circuit", { bold: true, size: 15 });
    const vals = [0.707, 0, 0, 0.707], lab = ["00", "01", "10", "11"];
    b += box(14, 44, 296, 168, { stroke: C.cyan, fill: C.card }) + t(162, 66, "Statevector: exact amplitudes", { size: 13, bold: true, fill: C.cyanT });
    vals.forEach((v, i) => { const h = v * 100, x = 40 + i * 66; b += box(x, 180 - h, 40, h, { r: 3, fill: C.cyanFill, stroke: C.cyan }); b += t(x + 20, 198, lab[i], { size: 12, fill: C.dim }) + t(x + 20, 172 - h, v ? "0.707" : "0", { size: 11, fill: C.tx }); });
    b += box(330, 44, 296, 168, { stroke: C.warn, fill: C.card }) + t(478, 66, "Sampler: 1,024 shots, counts", { size: 13, bold: true, fill: C.warnT });
    [0.49, 0, 0, 0.51].forEach((v, i) => { const h = v * 180, x = 356 + i * 66; b += box(x, 180 - h, 40, h, { r: 3, fill: C.warnFill, stroke: C.warn }); b += t(x + 20, 198, lab[i], { size: 12, fill: C.dim }); });
    b += t(478, 86, "close to 50/50, but never exactly", { size: 11, fill: C.dim });
    b += t(162, 86, "squares give exactly 0.5 and 0.5", { size: 11, fill: C.dim });
    b += t(320, 240, "Statevector memory: 2ⁿ amplitudes × 16 bytes. 30 qubits ≈ 17.2 GB; 40 qubits ≈ 17.6 TB.", { size: 12, fill: C.tx });
    b += t(320, 262, "Use statevector to debug small circuits; use shots to see what hardware will show you.", { size: 12, fill: C.dim });
    return svg(276, b, "statevector simulation shows exact amplitudes 0.707 on 00 and 11; sampling shows counts near half and half");
  })();

  // ---- P2 M7: transpilation — route a gate between unconnected qubits ----
  D["p2-transpilation"] = (() => {
    let b = t(320, 24, "Transpiling: rewrite your circuit for the real chip's wiring and gates", { bold: true, size: 15 });
    b += t(24, 56, "Chip wiring (a line):", { size: 13, bold: true, fill: C.tx, a: "start" });
    [0, 1, 2].forEach(i => { const x = 220 + i * 110; b += circ(x, 52, 16, { fill: C.box, stroke: C.cyan }) + t(x, 57, "Q" + i, { size: 12, bold: true, fill: C.cyanT }); if (i < 2) b += ln(x + 16, 52, x + 94, 52, { stroke: C.cyan, sw: 2.5 }); });
    b += t(540, 57, "no Q0–Q2 link", { size: 12, fill: C.badT, a: "start" });
    const steps = [["1. You wrote", "CX(Q0, Q2)", "but Q0 and Q2 aren't wired", C.acc, C.accT],
      ["2. Routing", "SWAP(Q1, Q2), CX(Q0, Q1)", "a SWAP costs 3 two-qubit gates", C.warn, C.warnT],
      ["3. Translation", "H → RZ · SX · RZ", "only native gates: rz, sx, x, ecr or cz", C.cyan, C.cyanT],
      ["4. Optimization", "merge and cancel gates", "fewer gates = less error", C.good, C.goodT]];
    steps.forEach((s, i) => {
      const y = 82 + i * 44;
      b += box(20, y, 600, 38, { stroke: s[3] }) + t(34, y + 24, s[0], { size: 13, bold: true, fill: s[4], a: "start" });
      b += t(170, y + 24, s[1], { size: 13, fill: C.tx, a: "start" }) + t(606, y + 24, s[2], { size: 12, fill: C.dim, a: "end" });
      if (i < 3) b += arrD(320, y + 39, y + 43, { stroke: C.faint });
    });
    b += t(320, 274, "Layout and routing usually decide most of the final error budget.", { size: 12, fill: C.dim });
    return svg(286, b, "a chip with qubits in a line; a CX between unconnected qubits is routed with a SWAP, translated to native gates and optimized");
  })();

  // ---- P2 M7: real hardware — every gate takes a small bite out of success ----
  D["p2-real-hardware"] = (() => {
    let b = t(320, 24, "On real chips, every two-qubit gate takes a bite out of your result", { bold: true, size: 15 });
    b += t(320, 50, "If each two-qubit gate fails 0.2% of the time (error 2×10⁻³), success ≈ 0.998^G", { size: 13, fill: C.tx });
    const rows = [[10, 0.998 ** 10], [100, 0.998 ** 100], [500, 0.998 ** 500], [1000, 0.998 ** 1000], [3000, 0.998 ** 3000]];
    rows.forEach(([g, p], i) => {
      const y = 72 + i * 36, w = p * 400;
      b += t(120, y + 19, "G = " + g.toLocaleString("en-US") + " gates", { size: 13, fill: C.tx, a: "end" });
      b += box(134, y, 400, 26, { r: 4, fill: C.box, stroke: C.boxS }) + box(134, y, Math.max(2, w), 26, { r: 4, fill: p > 0.5 ? C.goodFill : p > 0.1 ? C.warnFill : C.badFill, stroke: p > 0.5 ? C.good : p > 0.1 ? C.warn : C.bad });
      b += t(544, y + 19, (100 * p).toFixed(1) + "%", { size: 13, bold: true, fill: p > 0.5 ? C.goodT : p > 0.1 ? C.warnT : C.badT, a: "start" });
    });
    b += t(320, 264, "A rough rule (ignores 1-qubit gates, readout and idle time), but it shows why depth matters.", { size: 11, fill: C.dim });
    return svg(278, b, "bars showing estimated success of 98 percent at 10 gates down to 0.2 percent at 3000 gates for 0.2 percent error per gate");
  })();

  // ---- P2 M7: quantum SWE — three kinds of tests ----
  D["p2-quantum-swe"] = (() => {
    let b = t(320, 24, "Testing quantum code: exact, statistical, and on hardware", { bold: true, size: 15 });
    const lv = [["Unit tests on statevectors", "exact: assert amplitudes match, to 1e-9", "many, fast, every commit", C.good, C.goodT, 560],
      ["Statistical tests on shots", "assert |p̂ − 0.5| < 3σ, σ = √(0.25/4000) ≈ 0.008", "some, seconds, every commit", C.warn, C.warnT, 460],
      ["Hardware smoke tests", "one small circuit, loose tolerance", "few, minutes to hours of queue, weekly", C.bad, C.badT, 360]];
    lv.forEach((l, i) => {
      const w = l[5], x = 320 - w / 2, y = 48 + i * 66;
      b += box(x, y, w, 56, { stroke: l[3] }) + t(320, y + 20, l[0], { size: 14, bold: true, fill: l[4] });
      b += t(320, y + 37, l[1], { size: 12, fill: C.tx }) + t(320, y + 51, l[2], { size: 11, fill: C.dim });
    });
    b += t(320, 260, "Seed simulators so tests repeat, keep circuits in Git, and run the cheap layers in CI.", { size: 12, fill: C.dim });
    return svg(276, b, "three layers of tests: exact statevector unit tests, statistical shot tests with a 3 sigma tolerance, and rare hardware smoke tests");
  })();

  // ---- P2 M8: Deutsch–Jozsa — signs stamped by the oracle, averaged by H ----
  D["p2-deutsch-jozsa"] = (() => {
    let b = t(320, 24, "One oracle call: stamp signs, then let H average them", { bold: true, size: 15 });
    const rows = [["constant f (all 0)", [1, 1, 1, 1], "average = +1", "reads 00: constant", C.good, C.goodT], ["balanced f (f = first bit)", [1, 1, -1, -1], "average = 0", "not 00: balanced", C.warn, C.warnT]];
    rows.forEach((r, i) => {
      const y = 60 + i * 104, mid = y + 38;
      b += t(24, y, r[0], { size: 13, bold: true, fill: r[5], a: "start" });
      b += ln(24, mid, 300, mid, { stroke: C.boxS });
      r[1].forEach((s, j) => { const x = 40 + j * 64, h = 30; b += box(x, s > 0 ? mid - h : mid, 40, h, { r: 3, fill: s > 0 ? C.cyanFill : C.badFill, stroke: s > 0 ? C.cyan : C.bad }); b += t(x + 20, mid + (s > 0 ? 18 : -36), ["00", "01", "10", "11"][j], { size: 11, fill: C.dim }); });
      b += arrR(310, mid, 360, { stroke: C.line }) + t(335, mid - 8, "H⊗H", { size: 12, fill: C.accT });
      b += box(366, mid - 22, 120, 44, { stroke: r[4] }) + t(426, mid - 2, r[2], { size: 13, bold: true, fill: r[5] }) + t(426, mid + 15, "= amp. of 00", { size: 11, fill: C.dim });
      b += arrR(488, mid, 506, { stroke: C.line }) + t(512, mid + 5, r[3], { size: 12, fill: r[5], a: "start" });
    });
    b += t(320, 272, "Bars are amplitudes of the 4 inputs after the oracle: + for f(x) = 0, − for f(x) = 1.", { size: 12, fill: C.dim });
    return svg(286, b, "constant function leaves all four signs positive so the average is 1; a balanced one makes two negative so the average is 0");
  })();

  // ---- P2 M8: Grover — one round: oracle flips, diffuser reflects about the mean ----
  D["p2-grover"] = (() => {
    let b = t(320, 24, "One Grover round on 8 items (marked item: 3)", { bold: true, size: 15 });
    const s8 = 1 / Math.sqrt(8), panels = [["start: all equal", Array(8).fill(s8), "each 0.354, P = 12.5%"],
      ["oracle flips the marked sign", [s8, s8, s8, -s8, s8, s8, s8, s8], "mean = 0.265"],
      ["reflect about the mean", [0.177, 0.177, 0.177, 0.884, 0.177, 0.177, 0.177, 0.177], "marked 0.884, P = 78.1%"]];
    panels.forEach((p, i) => {
      const x0 = 18 + i * 208, mid = 150, sc = 100;
      b += t(x0 + 96, 52, p[0], { size: 12, bold: true, fill: i === 2 ? C.goodT : C.tx });
      b += ln(x0, mid, x0 + 192, mid, { stroke: C.boxS });
      p[1].forEach((a, j) => { const h = Math.abs(a) * sc, x = x0 + 4 + j * 23.5; b += box(x, a >= 0 ? mid - h : mid, 17, h, { r: 2, fill: j === 3 ? C.warnFill : C.cyanFill, stroke: j === 3 ? C.warn : C.cyan }); });
      if (i === 1) b += ln(x0, mid - 0.265 * sc, x0 + 192, mid - 0.265 * sc, { stroke: C.good, dash: "4 3" });
      b += t(x0 + 96, 214, p[2], { size: 12, fill: i === 2 ? C.goodT : C.dim });
      if (i < 2) b += arrR(x0 + 194, 100, x0 + 206, { stroke: C.faint });
    });
    b += t(320, 248, "Repeat about (π/4)√N times: 2 rounds give 94.5%, a 3rd overshoots to 33.0%.", { size: 13, fill: C.tx });
    b += t(320, 270, "For a million items that is about 785 rounds instead of about 500,000 checks.", { size: 12, fill: C.dim });
    return svg(284, b, "three bar charts: equal amplitudes, the marked one flipped negative, then reflection about the mean makes the marked amplitude 0.884");
  })();

  // ---- P2 M8: QFT — a repeating pattern in, sharp peaks out ----
  D["p2-qft"] = (() => {
    let b = t(320, 24, "The QFT turns a repeating pattern into sharp peaks", { bold: true, size: 15 });
    const inp = [1, 0, 1, 0, 1, 0, 1, 0].map(v => v * 0.5), out = [0.707, 0, 0, 0, 0.707, 0, 0, 0];
    const row = (vals, y, col, colF, lab, sc) => {
      let s = t(24, y - 46, lab, { size: 13, bold: true, fill: C.tx, a: "start" }) + ln(60, y, 600, y, { stroke: C.boxS });
      vals.forEach((v, j) => { const x = 74 + j * 66, h = v * sc; if (h > 0) s += box(x, y - h, 36, h, { r: 3, fill: colF, stroke: col }); s += t(x + 18, y + 16, String(j), { size: 12, fill: C.dim }); });
      return s;
    };
    b += row(inp, 112, C.acc, C.accFill, "Input: amplitude on 0, 2, 4, 6 (period r = 2, N = 8)", 80);
    b += arrD(320, 136, 160, { stroke: C.line }) + t(334, 153, "QFT", { size: 13, bold: true, fill: C.accT, a: "start" });
    b += row(out, 232, C.good, C.goodFill, "Output: peaks at 0 and 4, the multiples of N/r = 4", 80);
    b += t(320, 270, "Measure, read the peak spacing, and the period r falls out. Shor relies on this.", { size: 12, fill: C.dim });
    return svg(284, b, "input amplitudes on every second position become two output peaks at 0 and 4 after the quantum Fourier transform");
  })();

  // ---- P2 M8: QPE — phase kickback winds each counting qubit; QFT† reads the binary ----
  D["p2-qpe"] = (() => {
    let b = t(320, 24, "Phase estimation: each counting qubit picks up the phase × 1, 2, 4 …", { bold: true, size: 15 });
    b += t(320, 48, "Hidden phase φ = 0.625 of a full turn (binary 0.101)", { size: 13, fill: C.warnT });
    const q = [["U¹", 0.625, "0.625 turn"], ["U²", 0.25, "1.25 → 0.25 turn"], ["U⁴", 0.5, "2.5 → 0.5 turn"]];
    q.forEach((d, i) => {
      const cx = 100 + i * 150, cy = 130, R = 40, a = 2 * Math.PI * d[1];
      b += circ(cx, cy, R, { fill: "none", stroke: C.boxS });
      b += arr(cx, cy, cx + R * Math.cos(a), cy - R * Math.sin(a), { stroke: C.cyan, sw: 2.4 });
      b += t(cx, 78, "qubit " + (i + 1) + ": " + d[0], { size: 12, bold: true, fill: C.accT }) + t(cx, 192, d[2], { size: 12, fill: C.dim });
    });
    b += arrR(468, 130, 500, { stroke: C.line }) + box(502, 104, 120, 52, { stroke: C.good, fill: C.goodFill }) + t(562, 126, "QFT† reads", { size: 12, fill: C.dim }) + t(562, 146, "101 → 5/8", { size: 14, bold: true, fill: C.goodT });
    b += t(320, 228, "Each doubling of U shifts the binary point one place, so qubit k holds one bit of φ.", { size: 12, fill: C.tx });
    b += t(320, 250, "If φ needs more bits, you get one of the two nearest 3-bit values at least 81% of the time.", { size: 11, fill: C.dim });
    return svg(266, b, "three dials showing phases 0.625, 0.25 and 0.5 turns for U, U squared and U to the fourth; the inverse QFT reads 101 meaning 5/8");
  })();

  // ---- P2 M8: Shor — period finding for 15, then the 2025 scale ----
  D["p2-shor"] = (() => {
    let b = t(320, 24, "Shor's algorithm on N = 15: the quantum part finds one period", { bold: true, size: 15 });
    const seq = [1, 7, 4, 13, 1, 7, 4, 13];
    b += t(24, 58, "7ˣ mod 15 for x = 0 … 7:", { size: 13, fill: C.tx, a: "start" });
    seq.forEach((v, i) => { const x = 210 + i * 50; b += box(x, 40, 42, 30, { r: 5, stroke: i < 4 ? C.cyan : C.boxS, fill: i < 4 ? C.cyanFill : C.box }) + t(x + 21, 60, String(v), { size: 14, bold: true, fill: i < 4 ? C.cyanT : C.dim }); });
    b += t(373, 88, "repeats every 4: period r = 4 (found by QPE + QFT)", { size: 12, fill: C.cyanT });
    const st = [["7^(r/2) = 7² = 49", C.acc, C.accT], ["gcd(49 − 1, 15) = 3", C.good, C.goodT], ["gcd(49 + 1, 15) = 5", C.good, C.goodT]];
    st.forEach((s, i) => { const x = 20 + i * 205; b += box(x, 104, 190, 38, { stroke: s[1] }) + t(x + 95, 128, s[0], { size: 13, bold: true, fill: s[2] }); if (i < 2) b += arrR(x + 192, 123, x + 203, { stroke: C.faint }); });
    b += t(320, 166, "15 = 3 × 5. Only the period-finding step needs a quantum computer.", { size: 13, fill: C.tx });
    b += ln(20, 182, 620, 182, { stroke: C.cardEdge });
    b += t(320, 206, "RSA-2048, best published estimate (Gidney 2025):", { size: 13, bold: true, fill: C.warnT });
    b += t(320, 228, "about 1,500 error-corrected (logical) qubits, under 1 million physical qubits, under a week", { size: 12, fill: C.tx });
    b += t(320, 250, "Today's largest machines have hundreds to a few thousand noisy qubits: about a 1,000× gap.", { size: 12, fill: C.dim });
    return svg(266, b, "the sequence 7 to the x mod 15 repeats with period 4; gcd steps give factors 3 and 5; RSA-2048 needs about 1500 logical and under a million physical qubits");
  })();

  // ---- P2 M8: hamsim — slice the evolution into alternating steps ----
  D["p2-hamsim"] = (() => {
    let b = t(320, 24, "Trotterization: approximate e^(−iHt) with many thin alternating slices", { bold: true, size: 15 });
    b += t(24, 56, "H = A + B   (A: the X terms, B: the ZZ terms; they don't commute)", { size: 13, fill: C.tx, a: "start" });
    b += box(24, 70, 592, 34, { stroke: C.good, fill: C.goodFill }) + t(320, 92, "exact: e^(−iHt), one smooth evolution (hard to build as gates)", { size: 13, fill: C.goodT });
    const rr = [[1, 82], [4, 130], [8, 178]];
    rr.forEach(([r, y]) => {
      const w = 592 / (2 * r);
      b += t(24, y + 42, "r = " + r, { size: 12, fill: C.dim, a: "start" });
      for (let k = 0; k < 2 * r; k++) b += box(70 + k * (546 / (2 * r)), y + 30, 546 / (2 * r) - 2, 24, { r: 3, fill: k % 2 ? C.warnFill : C.cyanFill, stroke: k % 2 ? C.warn : C.cyan });
    });
    b += t(110, 252, "cyan: e^(−iA·dt)", { size: 12, fill: C.cyanT }) + t(260, 252, "gold: e^(−iB·dt)", { size: 12, fill: C.warnT }) + t(470, 252, "dt = t / r", { size: 12, fill: C.dim });
    b += t(320, 274, "Double r: 1st-order error halves, 2nd-order error quarters, CNOT count doubles.", { size: 12, fill: C.tx });
    return svg(286, b, "the exact evolution bar compared with 1, 4 and 8 rounds of alternating A and B slices");
  })();

  // ---- P2 M9: noise — T1 and T2 pull the Bloch arrow inward ----
  D["p2-noise"] = (() => {
    const cx = 150, cy = 150, R = 110, T1 = 100, T2 = 80;
    let b = t(320, 24, "Noise shrinks the Bloch arrow: |+⟩ left alone for t microseconds", { bold: true, size: 15 });
    b += circ(cx, cy, R, { fill: "none", stroke: C.faint, sw: 1.3 }) + ln(cx - R - 8, cy, cx + R + 8, cy, { stroke: C.boxS }) + ln(cx, cy - R - 8, cx, cy + R + 8, { stroke: C.boxS });
    b += t(cx - 10, cy - R + 4, "|0⟩ (ground)", { size: 12, fill: C.goodT, a: "end" }) + t(cx + R + 4, cy + 18, "|+⟩", { size: 12, fill: C.dim, a: "start" });
    let pts = [];
    for (let k = 0; k <= 60; k++) { const tt = k * 5, x = Math.exp(-tt / T2), z = 1 - Math.exp(-tt / T1); pts.push((cx + R * x).toFixed(1) + "," + (cy - R * z).toFixed(1)); }
    b += `<polyline points="${pts.join(" ")}" style="fill:none;stroke:${C.warn};stroke-width:1.6;stroke-dasharray:4 3"/>`;
    [0, 25, 50, 100, 200].forEach(tt => {
      const x = Math.exp(-tt / T2), z = 1 - Math.exp(-tt / T1), px = cx + R * x, py = cy - R * z;
      b += circ(px, py, 4, { fill: C.warn, stroke: C.warn }) + t(px + 8, py + (tt ? 4 : -8), "t=" + tt, { size: 11, fill: C.warnT, a: "start" });
    });
    b += arr(cx, cy, cx + R * Math.exp(-50 / T2), cy - R * (1 - Math.exp(-50 / T1)), { stroke: C.cyan, sw: 2.4 });
    b += lines(320, 66, ["T1 = 100 µs: energy leaks, the arrow", "sags toward |0⟩:  z = 1 − e^(−t/T1)", "", "T2 = 80 µs: the phase blurs, the arrow", "shrinks sideways:  x = e^(−t/T2)", "", "At t = 50 µs: x = 0.54, z = 0.39,", "so a gate that needed |+⟩ now sees", "a weaker, tilted arrow."], { size: 13, fill: C.tx, a: "start", lh: 19 });
    b += t(470, 264, "T2 can never be more than 2 × T1.", { size: 12, fill: C.dim });
    return svg(280, b, "x-z slice of the Bloch sphere; a state starting at |+> follows a curve inward and up toward |0> as T1 and T2 act");
  })();

  // ---- P2 M9: VQE — quantum energy, classical optimizer, repeat ----
  D["p2-vqe"] = (() => {
    let b = t(320, 24, "VQE: a quantum chip measures energy, a classical optimizer tunes the knobs", { bold: true, size: 15 });
    b += box(20, 48, 190, 70, { stroke: C.cyan }) + t(115, 72, "quantum circuit", { size: 12, fill: C.dim }) + t(115, 94, "prepare |ψ(θ)⟩", { size: 14, bold: true, fill: C.cyanT }) + t(115, 110, "shallow, a few knobs θ", { size: 11, fill: C.dim });
    b += arrR(212, 83, 246) + box(248, 48, 150, 70, { stroke: C.warn }) + t(323, 72, "measure", { size: 12, fill: C.dim }) + t(323, 96, "energy E(θ)", { size: 14, bold: true, fill: C.warnT });
    b += arrR(400, 83, 434) + box(436, 48, 184, 70, { stroke: C.acc }) + t(528, 72, "classical optimizer", { size: 12, fill: C.dim }) + t(528, 96, "suggest better θ", { size: 14, bold: true, fill: C.accT });
    b += ln(528, 120, 528, 136, { stroke: C.acc }) + ln(528, 136, 115, 136, { stroke: C.acc }) + arrU(115, 136, 120, { stroke: C.acc }) + t(320, 150, "repeat until the energy stops dropping", { size: 12, fill: C.accT });
    const x0 = 60, x1 = 580, Y = th => 190 + 60 * (1 - Math.cos(th)) / 2, X = th => x0 + th / (2 * Math.PI) * (x1 - x0);
    let pts = []; for (let k = 0; k <= 60; k++) { const th = k / 60 * 2 * Math.PI; pts.push(X(th).toFixed(1) + "," + Y(th).toFixed(1)); }
    b += `<polyline points="${pts.join(" ")}" style="fill:none;stroke:${C.cyan};stroke-width:2"/>`;
    [0.6, 1.4, 2.2, 2.8, Math.PI].forEach((th, i) => { b += circ(X(th), Y(th), 4.5, { fill: i === 4 ? C.good : C.warn, stroke: "none" }); });
    b += t(X(Math.PI), 262, "lowest energy = best answer", { size: 12, fill: C.goodT });
    b += t(36, 184, "E", { size: 12, fill: C.dim }) + t(320, 182, "energy vs one knob θ: each step slides downhill", { size: 11, fill: C.dim });
    return svg(276, b, "VQE loop between a quantum circuit, an energy measurement and a classical optimizer, and an energy curve with steps descending to the minimum");
  })();

  // ---- P2 M9: QAOA — Max-Cut on a 4-node ring ----
  D["p2-qaoa"] = (() => {
    let b = t(320, 24, "QAOA on Max-Cut: split the nodes so as many edges as possible cross", { bold: true, size: 15 });
    const N = [[90, 70], [210, 70], [210, 190], [90, 190]], col = [C.cyan, C.warn, C.cyan, C.warn];
    [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(([a, c]) => { b += ln(N[a][0], N[a][1], N[c][0], N[c][1], { stroke: C.good, sw: 3 }); });
    N.forEach((p, i) => { b += circ(p[0], p[1], 18, { fill: C.box, stroke: col[i], sw: 2.4 }) + t(p[0], p[1] + 5, String(i), { size: 14, bold: true, fill: col[i] === C.cyan ? C.cyanT : C.warnT }); });
    b += t(150, 236, "cyan set vs gold set: all 4 edges cut (best)", { size: 12, fill: C.goodT });
    b += t(150, 254, "bit string 0101 or 1010", { size: 12, fill: C.dim });
    const lay = [["start: H on every qubit", "all splits equally likely", C.boxS, C.tx], ["cost layer, angle γ", "phases each split by its cut size", C.warn, C.warnT], ["mixer layer, angle β", "lets amplitude flow between splits", C.cyan, C.cyanT], ["repeat p times, then measure", "optimizer tunes all γ and β", C.acc, C.accT]];
    lay.forEach((l, i) => { const y = 48 + i * 50; b += box(300, y, 320, 42, { stroke: l[2] }) + t(314, y + 18, l[0], { size: 13, bold: true, fill: l[3], a: "start" }) + t(314, y + 34, l[1], { size: 11, fill: C.dim, a: "start" }); if (i < 3) b += arrD(460, y + 43, y + 49, { stroke: C.faint }); });
    b += t(460, 264, "More rounds p: better splits, but deeper circuits.", { size: 11, fill: C.dim });
    return svg(276, b, "a four-node ring split into two colors so all four edges are cut, beside the QAOA layer sequence");
  })();

  // ---- P2 M9: QML — the pipeline and the reality check ----
  D["p2-qml"] = (() => {
    let b = t(320, 24, "Quantum machine learning: where the quantum part sits", { bold: true, size: 15 });
    const st = [["data x", "a row of numbers", C.boxS, C.tx], ["feature map", "x sets gate angles", C.cyan, C.cyanT], ["quantum part", "kernel overlaps or a trained circuit", C.acc, C.accT], ["classical model", "e.g. an SVM decides", C.warn, C.warnT], ["label", "cat / dog", C.good, C.goodT]];
    st.forEach((s, i) => { const x = 12 + i * 126, w = 112; b += box(x, 48, w, 62, { stroke: s[2] }) + t(x + w / 2, 72, s[0], { size: 13, bold: true, fill: s[3] }); b += t(x + w / 2, 92, s[1].length > 18 ? s[1].slice(0, 15) : s[1], { size: 10, fill: C.dim }); if (s[1].length > 18) b += t(x + w / 2, 104, s[1].slice(16), { size: 10, fill: C.dim }); if (i < 4) b += arrR(x + w + 1, 79, x + 125, { stroke: C.faint }); });
    b += ln(20, 130, 620, 130, { stroke: C.cardEdge });
    b += t(320, 156, "What the evidence says (2026):", { size: 13, bold: true, fill: C.tx });
    b += lines(40, 182, ["• 160 datasets, 12 models: classical models generally won (Bowles, Ahmed, Schuld 2024).", "• Training can stall on flat landscapes (barren plateaus, McClean 2018).", "• Proven speedups exist, but for contrived or quantum-native data (Liu 2021; Huang 2022)."], { size: 12, fill: C.dim, a: "start", lh: 22 });
    b += t(320, 262, "Treat 'quantum AI' claims as hypotheses to test against a strong classical baseline.", { size: 12, fill: C.warnT });
    return svg(276, b, "pipeline from data through a feature map and quantum part to a classical model and label, with a summary of the evidence");
  })();

  // @@P2-INSERT
  window.DIAGRAMS = Object.assign(window.DIAGRAMS || {}, D);
})();
