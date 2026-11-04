/* qa.js — living regression suite (playbook §7.1). Run before every push and
   after any global change:  node tools/qa.js
   Scans: JS syntax, quiz/fence lint, diagram bounds + key resolution, per-line
   math-collision ($ currency vs $…$), locale/British-spelling, broken references,
   and (tools/qa-browser.js) every lesson in headless Chrome at 1280/390 px, failing
   any diagram label under 9 px on a phone. --no-browser skips the Chrome step.
   Standard for "done": 0 issues across the board. Exits non-zero on any failure. */
"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = path.join(__dirname, "..");
const LESSONS = path.join(ROOT, "lessons");
let problems = 0;
const fail = (m) => { console.log("  ✗ " + m); problems++; };
const section = (t) => console.log("\n== " + t + " ==");

/* ---- 1. JS syntax check (node --check) ---- */
section("JS syntax");
const jsFiles = [];
function collectJs(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (!/node_modules|vendor/.test(p)) collectJs(p); }
    else if (f.endsWith(".js")) jsFiles.push(p);
  }
}
["assets/js", "content", "tools"].forEach((d) => collectJs(path.join(ROOT, d)));
let jsOk = 0;
for (const f of jsFiles) {
  try { cp.execSync("node --check " + JSON.stringify(f), { stdio: "pipe" }); jsOk++; }
  catch (e) { fail("syntax error in " + path.relative(ROOT, f)); }
}
console.log("  " + jsOk + "/" + jsFiles.length + " JS files parse");

/* ---- 2. build lint + diagram bounds (delegate to existing tools) ---- */
section("Build lint + diagram bounds");
for (const tool of ["tools/build.js", "tools/check-diagrams.js"]) {
  try {
    const out = cp.execSync("node " + tool, { cwd: ROOT, stdio: "pipe" }).toString();
    const bad = /problem|warning|OOB|overflow|floating|MISSING/i.test(out) && !/No problems|ALL CLEAN/i.test(out);
    if (bad) fail(tool + " reported issues:\n" + out.split("\n").slice(-6).join("\n"));
    else console.log("  ✓ " + tool + " clean");
  } catch (e) { fail(tool + " failed: " + String(e.message).slice(0, 120)); }
}

/* ---- load compiled content for content scans ---- */
global.window = {};
require(path.join(ROOT, "content", "manifest.js"));
for (let i = 0; i <= 11; i++) { try { require(path.join(ROOT, "content", "m" + i + ".js")); } catch (e) {} }
require(path.join(ROOT, "assets", "js", "diagrams.js"));
const COURSE = global.window.COURSE, CONTENT = global.window.CONTENT || {}, DIAGRAMS = global.window.DIAGRAMS || {};

/* ---- 3. per-line math-collision scan (§5.1) ---- */
section("Math-collision scan (currency $ vs $…$)");
let mathIssues = 0;
for (const [id, md] of Object.entries(CONTENT)) {
  // strip fenced code (``` and ````), display math $$…$$, and inline `code`
  let s = md.replace(/^````[\s\S]*?\n````[ \t]*$/gm, "")
             .replace(/^```[\s\S]*?\n```[ \t]*$/gm, "")
             .replace(/`[^`\n]*`/g, "")
             .replace(/\$\$[\s\S]*?\$\$/g, "");
  s.split("\n").forEach((line, i) => {
    const dollars = (line.match(/\$/g) || []).length;
    if (dollars % 2 === 1) { fail(`${id} line ${i + 1}: odd $ count (${dollars}) — currency/math collision risk: ${line.trim().slice(0, 60)}`); mathIssues++; }
  });
}
if (!mathIssues) console.log("  ✓ no math-collision risks (all $ balanced per line, no bare currency)");

/* ---- 4. locale / British-spelling scan (§5.4) ---- */
section("Locale scan (American English)");
const british = /\b(optimis(e|es|ed|ing|ation)|colour|behaviour|centre|labelled|labelling|minimis(e|ed|ing)|analyse|analysed|modelling|favour|licence|catalogue|defence|organis(e|ed|ing|ation)|recognis(e|ed|ing)|generalis(e|ed|ing))\b/i;
let localeIssues = 0;
const scanDirs = [LESSONS, path.join(ROOT, "content"), path.join(ROOT, "assets", "js")];
function scanLocale(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { if (!/vendor|node_modules/.test(p)) scanLocale(p); continue; }
    if (!/\.(md|js)$/.test(f)) continue;
    const txt = fs.readFileSync(p, "utf8");
    txt.split("\n").forEach((line, i) => {
      const m = line.match(british);
      if (m) { fail(`${path.relative(ROOT, p)} line ${i + 1}: British spelling "${m[0]}"`); localeIssues++; }
    });
  }
}
scanDirs.forEach(scanLocale);
if (!localeIssues) console.log("  ✓ one locale (American English) — no British spellings");

/* ---- 5. reference resolution: diagram keys + widget keys + manifest sync ---- */
section("Reference resolution");
let refIssues = 0;
for (const [id, md] of Object.entries(CONTENT)) {
  let m; const re = /@@diagram:([\w-]+)/g;
  while ((m = re.exec(md))) if (!DIAGRAMS[m[1]]) { fail(`${id}: @@diagram "${m[1]}" not in DIAGRAMS`); refIssues++; }
}
// pass-2 interactive slots: every @@viz:key must be registered as V["key"] in assets/js/viz.js
const vizSrc = fs.readFileSync(path.join(ROOT, "assets", "js", "viz.js"), "utf8");
const VIZ = new Set([...vizSrc.matchAll(/V\["([\w-]+)"\]\s*=/g)].map((x) => x[1]));
for (const [id, md] of Object.entries(CONTENT)) {
  let m; const re = /^@@viz:([\w-]+)\s*$/gm;
  while ((m = re.exec(md))) if (!VIZ.has(m[1])) { fail(`${id}: @@viz "${m[1]}" not registered in viz.js`); refIssues++; }
}
// every manifest lesson has compiled content
COURSE.modules.forEach((mod) => mod.lessons.forEach((l) => {
  if (!CONTENT[l.id]) { fail(`manifest lesson "${l.id}" has no compiled content`); refIssues++; }
}));
if (!refIssues) console.log("  ✓ all diagram keys resolve; manifest ↔ content in sync");

/* ---- 6. every lesson in headless Chrome, 1280 + 390 px (skip with --no-browser) ---- */
section("Browser: 48 lessons x 1280/390 px, console, overflow, interactives, labels >= 9 px on a phone");
if (process.argv.includes("--no-browser")) console.log("  - skipped (--no-browser)");
else {
  const r = cp.spawnSync(process.execPath, [path.join(__dirname, "qa-browser.js"), "all"], { cwd: ROOT, encoding: "utf8", timeout: 1800000 });
  const lines = (r.stdout || "").split(/\r?\n/);
  lines.filter((l) => /^FAIL|^     /.test(l)).slice(0, 40).forEach((l) => console.log("  ✗ " + l.trim()));
  const tot = lines.find((l) => /^TOTAL/.test(l)) || ("qa-browser.js did not finish: " + (r.stderr || "").slice(0, 300));
  if (/Chrome not found/.test(r.stdout || "")) console.log("  - Chrome not found, browser checks skipped");
  else if (r.status !== 0) fail("browser checks: " + tot.trim());
  else console.log("  ✓ " + tot.trim());
}

/* ---- summary ---- */
console.log("\n" + (problems ? "❌ " + problems + " issue(s) — fix before shipping." :
  "✅ ALL CLEAN — 0 broken references, 0 math collisions, 0 locale issues, all JS parses."));
process.exit(problems ? 1 : 0);
