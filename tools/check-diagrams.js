/* node tools/check-diagrams.js  -> validates every diagram + reports missing keys.
   Checks: bounds (in 0..640 × 0..H), text overflow, floating arrowheads. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

global.window = {};
require(path.join(ROOT, "assets", "js", "diagrams.js"));
const D = window.DIAGRAMS || {};

// collect keys referenced by lessons
const lessonsDir = path.join(ROOT, "lessons");
const referenced = new Set();
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".md")) {
      const md = fs.readFileSync(p, "utf8");
      let m; const re = /@@diagram:([\w-]+)/g;
      while ((m = re.exec(md))) referenced.add(m[1]);
    }
  }
}
walk(lessonsDir);

let problems = 0;
const missing = [...referenced].filter(k => !D[k]).sort();
if (missing.length) { console.log("MISSING diagrams (" + missing.length + "):", missing.join(", ")); problems += missing.length; }
const unused = Object.keys(D).filter(k => !referenced.has(k)).sort();
if (unused.length) console.log("(unused, harmless):", unused.join(", "));

for (const [k, svg] of Object.entries(D)) {
  const H = +(svg.match(/viewBox="0 0 640 (\d+)"/) || [])[1] || 0;
  let m;
  const re = /<rect x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)"/g;
  while ((m = re.exec(svg))) {
    const [x, y, w, h] = m.slice(1).map(Number);
    if (x < -0.5 || y < -0.5 || x + w > 640.5 || y + h > H + 0.5) { console.log(`OOB rect ${k}: x=${x} y=${y} w=${w} h=${h} (H=${H})`); problems++; }
  }
  const ce = /<circle cx="(-?[\d.]+)" cy="(-?[\d.]+)" r="([\d.]+)"/g;
  while ((m = ce.exec(svg))) {
    const [x, y, r] = m.slice(1).map(Number);
    if (x - r < -0.5 || y - r < -0.5 || x + r > 640.5 || y + r > H + 0.5) { console.log(`OOB circle ${k}: cx=${x} cy=${y} r=${r}`); problems++; }
  }
  const te = /<text x="(-?[\d.]+)" y="(-?[\d.]+)" text-anchor="(\w+)" style="[^"]*font-size:([\d.]+)px;[^"]*">([^<]*)<\/text>/g;
  while ((m = te.exec(svg))) {
    const x = +m[1], y = +m[2], a = m[3], fs2 = +m[4], s = m[5];
    const w = s.length * fs2 * 0.55;
    const l = a === "middle" ? x - w / 2 : a === "end" ? x - w : x;
    const r = a === "middle" ? x + w / 2 : a === "end" ? x : x + w;
    if (l < -1 || r > 641) { console.log(`TEXT overflow ${k}: "${s.slice(0, 28)}" x=${x} anchor=${a} estW=${w.toFixed(0)}`); problems++; }
    if (y < 4 || y > H + 0.5) { console.log(`TEXT y-oob ${k}: "${s.slice(0, 20)}" y=${y}`); problems++; }
  }
  // floating arrowheads: each polygon vertex-set should have a line endpoint near one vertex
  const polys = [], ends = [];
  let pe = /<polygon points="([^"]+)"/g;
  while ((m = pe.exec(svg))) polys.push(m[1].trim().split(/\s+/).map(p => p.split(",").map(Number)));
  let le = /<line x1="(-?[\d.]+)" y1="(-?[\d.]+)" x2="(-?[\d.]+)" y2="(-?[\d.]+)"/g;
  while ((m = le.exec(svg))) { ends.push([+m[1], +m[2]]); ends.push([+m[3], +m[4]]); }
  for (const pts of polys) {
    let near = false;
    for (const v of pts) for (const e of ends) if (Math.hypot(e[0] - v[0], e[1] - v[1]) < 12) near = true;
    if (!near) { console.log(`floating arrowhead ${k}`); problems++; }
  }
}
console.log(problems ? `\n${problems} problem(s) across ${Object.keys(D).length} diagrams` : `\nALL CLEAN — ${Object.keys(D).length} diagrams, ${referenced.size} referenced`);
process.exit(problems ? 1 : 0);
