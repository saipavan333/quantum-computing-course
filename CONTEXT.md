# CONTEXT — paste/point me here at session start to skip re-discovery

**What:** "Quantum Computing: Zero to Professional" — a static single-page course app
(plain HTML/CSS/JS, no framework, no runtime build). Built by U E Sai Pavan Vamshi Krishna.
- **Folder:** `C:\Users\saipa\Personal\Projects\AI\Tutorials\quantum-computing-course`
  (bash mount: `/sessions/<name>/mnt/AI--Tutorials/quantum-computing-course`).
- **Governing spec:** `../COURSE_BUILD_PLAYBOOK.md` (Tutorial Hub standard).

**Status:** built to playbook standard; `node tools/qa.js` = 0 issues; every route verified
headlessly with 0 JS errors. 12 modules / 47 lessons, **37 in-lesson widgets, a 10-lab section**,
a WebGL landing hero, and site-wide page effects. `sw.js` VERSION: `qcc-v2.5.0`.

**Architecture (single-source, modular):**
- `assets/js/app.js` = core + `window.QCC` API. Feature files push an init fn to
  `window.QCC_FEATURES`; inside use `QCC.registerRoute(fn)`, `QCC.onRender(fn)`,
  `QCC.setContent`, `QCC.renderMarkdown`, `QCC.COURSE/CONTENT/FLAT/store/escapeHtml`.
- `site.js` (byline+a11y+reveal) · `features.js` (glossary, flashcards, review, cheatsheets,
  interview, exam, map, read-aloud, search) · `runner.js` (Pyodide + embedded pure-Python
  `QuantumCircuit` sim) · `assistant.js` (free retrieval AI).
- `hero.js` — WebGL landing hero, concept "The Double Slit": a single-pass GLSL field of
  living interference (sharp luminous fringes from coherent wave sources → |ψ|², oil-slick
  violet/cyan/teal driven by the interference amplitude, weighted right so the headline stays
  clean). Visitor is the engine: cursor is a third wave source; click fires a "measurement"
  that resolves the fringes into discrete detection specks then flows back. Tuned via a CPU
  port (`outputs/verify/render2.js`) whose PNG renders were visually critiqued — the earlier
  raymarched-orbital and wire-Bloch-globe versions were rejected as formless blobs. Three.js
  vendored at `assets/vendor/three.min.js` (r128, UMD global `THREE`), **lazy-loaded only on
  home**; CSS-aurora fallback if WebGL unavailable or `prefers-reduced-motion`. Mounts/disposes
  via an `onRender` hook (view==='home').
- `effects.js` — site-wide page effects: animated aurora background (`#fx-aurora`, drifts on
  scroll via `--fx-scroll`), scroll-progress bar (`#fx-progress`), staggered `.reveal`
  entrances, magnetic/glow hover on `.module-card`/`.tool-tile`, animated stat count-up. All
  reduced-motion aware.
- `widgets.js` — 36 distinct in-lesson canvas widgets across 37 lesson mounts, keyed by lesson
  id in `WIDGETS`→`BUILDERS`; each kind also has an `INFO` (what/why/how/where/when, shown as a
  `<details>` above the widget) and a `CAPTIONS` one-line "how to read this" (shown under it).
  Shared `drawBars` helper. (single-gates reuses the bloch widget.)
- `labs.js` — the "🧪 Interactive Labs" section: 10 flagship standalone sandboxes (Circuit
  Builder w/ real ≤3-qubit complex statevector sim, Bloch Sandbox, Grover, QFT/Period-Finding,
  Error Correction, VQE, Measurement & Basis, Teleportation w/ fidelity, QAOA/Max-Cut w/ real
  p=1 circuit + angle optimize, Entanglement Explorer Bell/GHZ/W). Each lab's `LAB_INFO` entry
  has what/why/how/where/when + a color `legend` (swatches) + `tryThis` experiments, rendered by
  `infoPanel()`. Routes `#/labs` + `#/lab/:id`, home-page section, own sidebar nav group.
  The Circuit lab renders its shell once and repaints only `#circuit-grid` on clicks.
- Data: `lessons/<m>/<nn>-<id>.md` → compiled to `content/*.js` by `tools/build.js`;
  plus `content/glossary.js`, `content/interview.js`; diagrams in `assets/js/diagrams.js`.

**Workflow after ANY edit:** `node tools/build.js` → `node tools/qa.js` (must be 0 issues) →
bump `VERSION` in `sw.js`. **Verification method (jsdom hangs in this sandbox — do not use
it):** install `linkedom` in a scratch dir, then Node's `vm.runInContext` to execute each
script in order against a linkedom `document`; patch `HTMLCanvasElement.prototype.getContext`
to return a `Proxy` fake 2D context, and patch `HTMLSelectElement.prototype.value` (linkedom
has no setter — only ever assign `true` to the wanted `<option>.selected`, never `false`, or
it wipes every option's selection).

**Gotchas:** after file-tool edits the mount may run stale bytecode — clear `__pycache__` or
rewrite via bash if a change "doesn't take." Never put a literal currency `$` in prose (it
collides with `$…$` math); write "USD". Git on this mount occasionally leaves a `.git/*.lock`
file that no process (including the one that made it) can `unlink()` — usually resolves
within ~30s; if not, delete it from Windows Explorer directly.

**Open (documented, not built):** generative AI tier → `ASSISTANT-SETUP.md`; paid access →
`ACCESS-CONTROL.md`. Full detail → `HANDOFF.md`.

**To resume:** tell me "Read CONTEXT.md in the quantum course and continue."
