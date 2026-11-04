/* qa-browser.js — every lesson in headless Chrome at 1280 px and 390 px (pass-2 review, Nov 2026).
   Serves the course itself on 127.0.0.1, drives Chrome over the DevTools protocol (Node's built-in
   WebSocket, no installs) and fails on: console errors, page sideways scroll, SVG wider than its
   box (unless inside a .qc-scroll swipe box), SVG text outside its viewBox, HTML inside SVG text,
   missing pass-2 parts, an interactive control that does not change its picture, and
   ANY SVG label that renders under 9 px on a 390 px phone (the phone-legibility floor).
   Usage:  node tools/qa-browser.js [all | id,id | mod:m6] [--shots <dir>] [--port 8851] [--cdp 9471]
   Chrome profile: a throwaway dir (QA_PROFILE env, default os.tmpdir()), deleted on exit.
   Exits non-zero on any failure. */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path"), http = require("http"), os = require("os");

const ROOT = path.join(__dirname, "..");
const FLOOR = 9;
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const idsArg = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--"))) || "all";
const SHOTS = opt("--shots", null);
const PORT = +opt("--port", 8851), CDP = +opt("--cdp", 9471);
const CHROME = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".md": "text/plain" };

async function main() {
  if (!CHROME) { console.log("qa-browser: Chrome not found, skipped"); process.exit(0); }
  const server = http.createServer((q, s) => {
    let p = decodeURIComponent(q.url.split("?")[0].split("#")[0]); if (p.endsWith("/")) p += "index.html";
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(s);
  }).listen(PORT, "127.0.0.1");
  const prof = fs.mkdtempSync(path.join(process.env.QA_PROFILE || os.tmpdir(), "qcc-chrome-"));
  const ch = spawn(CHROME, ["--headless=new", "--remote-debugging-port=" + CDP, "--user-data-dir=" + prof, "--no-first-run",
    "--disable-component-update", "--disable-features=OptimizationGuideModelDownloading,OptimizationHints",
    "--disable-gpu", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
  const cleanup = async () => {
    try { const v = await (await fetch("http://127.0.0.1:" + CDP + "/json/version")).json(); const b = new WebSocket(v.webSocketDebuggerUrl);
      await new Promise((r) => { b.onopen = r; b.onerror = r; }); b.send(JSON.stringify({ id: 1, method: "Browser.close" })); } catch (e) {}
    await sleep(1500); try { ch.kill(); } catch (e) {} server.close();
    for (let i = 0; i < 10; i++) { try { fs.rmSync(prof, { recursive: true, force: true }); if (!fs.existsSync(prof)) return; } catch (e) {} await sleep(1000); }
    console.log("profile cleanup failed: " + prof); };
  process.on("SIGINT", async () => { await cleanup(); process.exit(2); });
  try { await run(); } finally { await cleanup(); }
}

async function run() {
  let list;
  for (let i = 0; i < 80; i++) { try { list = await (await fetch("http://127.0.0.1:" + CDP + "/json/list")).json(); break; } catch (e) { await sleep(250); } }
  const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let mid = 0; const pend = {}; const errs = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; }
    if (m.method === "Runtime.exceptionThrown") errs.push("EXC " + ((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text));
    if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errs.push("error " + m.params.args.map((a) => a.value || a.description).join(" "));
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") errs.push("LOG " + m.params.entry.text + " " + (m.params.entry.url || ""));
  };
  const send = (method, params = {}) => new Promise((r) => { const id = ++mid; pend[id] = r; ws.send(JSON.stringify({ id, method, params })); });
  const ev = async (x) => { const r = await send("Runtime.evaluate", { expression: x, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result.result.value; };
  await send("Runtime.enable"); await send("Log.enable"); await send("Page.enable"); await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Network.setBlockedURLs", { urls: ["*fonts.googleapis.com*", "*fonts.gstatic.com*"] });
  await send("Page.navigate", { url: "http://127.0.0.1:" + PORT + "/#/" }); await sleep(2500);
  let ids = await ev("window.COURSE.modules.flatMap(m=>m.lessons.map(l=>m.id+':'+l.id))");
  if (idsArg.startsWith("mod:")) { const ms = idsArg.slice(4).split(","); ids = ids.filter((i) => ms.includes(i.split(":")[0])); }
  else if (idsArg !== "all") { const want = idsArg.split(","); ids = ids.filter((i) => want.includes(i.split(":")[1])); }
  ids = ids.map((i) => i.split(":")[1]);
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
  let fail = 0, total = 0, minAll = 99;
  for (const w of [1280, 390]) {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
    for (const id of ids) {
      errs.length = 0;
      await ev("location.hash='#/'"); await sleep(120);
      await ev("location.hash='#/l/" + id + "'"); await sleep(900);
      const r = await ev("(" + pageCheck.toString() + ")(" + JSON.stringify({ id, w, FLOOR }) + ")");
      await sleep(80);
      if (errs.length) r.issues.push("console: " + errs.join(" | ").slice(0, 400));
      total++; if (r.issues.length) fail++;
      if (w === 390 && r.minPx < minAll) minAll = r.minPx;
      console.log((r.issues.length ? "FAIL " : "ok   ") + w + " " + id + (w === 390 ? " minLabel=" + r.minPx.toFixed(1) + "px swipe=" + r.swipe : "") +
        (r.viz.length ? " viz:" + r.viz.join(",") : "") + (r.issues.length ? "\n     " + r.issues.join("\n     ") : ""));
      if (SHOTS) {
        const box = await ev("(()=>{const s=document.querySelector('.simple-panel');if(!s)return null;const r=s.getBoundingClientRect();return {y:r.top+scrollY-10,h:r.height+20}})()");
        if (box) {
          await send("Emulation.setDeviceMetricsOverride", { width: w, height: Math.min(Math.ceil(box.y + box.h), 7000), deviceScaleFactor: 1, mobile: w < 768 });
          await sleep(400);
          const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 60, clip: { x: 0, y: box.y, width: w, height: Math.min(box.h, 6500), scale: w > 800 ? 0.6 : 1 } });
          fs.writeFileSync(path.join(SHOTS, id + "-" + w + ".jpg"), Buffer.from(s.result.data, "base64"));
          await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
        }
      }
    }
  }
  console.log("TOTAL " + total + " FAIL " + fail + "  smallest label at 390 px: " + minAll.toFixed(1) + " px (floor " + FLOOR + ")");
  ws.close();
  process.exitCode = fail ? 1 : 0;
}

/* runs inside the page */
async function pageCheck(o) {
  const out = { id: o.id, w: o.w, issues: [], viz: [], minPx: 99, swipe: 0 };
  const body = document.querySelector(".lesson-body");
  if (!body) { out.issues.push("no lesson body"); return out; }
  const sp = body.querySelector(".simple-panel");
  if (!sp) out.issues.push("no simple panel");
  else {
    if (!sp.querySelector(".diagram-wrap svg")) out.issues.push("no diagram in simple panel");
    if (!sp.querySelector("table")) out.issues.push("no analogy map");
    if (!/Where the picture breaks/.test(sp.textContent)) out.issues.push("no 'where the picture breaks'");
  }
  if (!body.querySelector("h2.deeper-h")) out.issues.push("no going-deeper");
  if (!body.querySelector("p.oneline")) out.issues.push("no one-line recap");
  if (body.querySelectorAll("svg .term, svg span").length) out.issues.push("html inside svg text");
  if (document.documentElement.scrollWidth > innerWidth + 1) out.issues.push("page h-scroll " + document.documentElement.scrollWidth);
  for (const slot of body.querySelectorAll(".viz-slot")) {
    const k = slot.dataset.viz, svg = slot.querySelector("svg"); const res = { changed: 0, n: 0 };
    if (!svg) { out.issues.push("viz " + k + " has no svg"); continue; }
    const read = () => svg.innerHTML + ((slot.querySelector(".viz-read") || {}).textContent || "");
    const ctls = [...slot.querySelectorAll("input[type=range],select,button")];
    for (const c of ctls) {
      const before = read();
      if (c.tagName === "INPUT") { c.value = (+c.value === +c.max) ? c.min : c.max; c.dispatchEvent(new Event("input", { bubbles: true })); }
      else if (c.tagName === "SELECT") { c.selectedIndex = (c.selectedIndex + 1) % c.options.length; c.dispatchEvent(new Event("change", { bubbles: true })); }
      else c.click();
      await new Promise((r) => setTimeout(r, 60)); res.n++; if (read() !== before) res.changed++;
    }
    if (!ctls.length || res.changed < ctls.length) out.issues.push("viz " + k + ": " + res.changed + "/" + ctls.length + " controls changed the picture");
    out.viz.push(k + " " + res.changed + "/" + res.n);
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const small = [];
  body.querySelectorAll("svg").forEach((svg, si) => {
    const R = svg.getBoundingClientRect();
    if (!R.width) return;
    const sc = svg.closest(".qc-scroll");
    const P = (sc || svg.parentElement).getBoundingClientRect();
    if (!sc && (R.right > P.right + 1 || R.left < P.left - 1)) out.issues.push("svg" + si + " wider than its container");
    if (sc) out.swipe++;
    const vb = svg.viewBox && svg.viewBox.baseVal; if (!vb || !vb.width) return;
    const scale = Math.min(R.width / vb.width, R.height / vb.height);
    svg.querySelectorAll("text").forEach((t) => {
      if (!t.textContent.trim()) return;
      let b; try { b = t.getBBox(); } catch (e) { return; }
      if (!b.width) return;
      if (b.x < vb.x - 1 || b.x + b.width > vb.x + vb.width + 1 || b.y < vb.y - 1 || b.y + b.height > vb.y + vb.height + 1)
        out.issues.push("svg" + si + " text outside viewBox: " + t.textContent.slice(0, 40));
      const px = parseFloat(getComputedStyle(t).fontSize) * scale;
      if (px < out.minPx) out.minPx = px;
      if (o.w < 768 && px < o.FLOOR - 0.05) small.push(t.textContent.trim().slice(0, 24) + " " + px.toFixed(1) + "px");
    });
  });
  if (small.length) out.issues.push(small.length + " labels under " + o.FLOOR + " px, e.g. " + small.slice(0, 3).join("; "));
  return out;
}

main().catch((e) => { console.error(e); process.exit(1); });
