# CONTEXT — paste/point me here at session start to skip re-discovery

**What:** "Quantum Computing: Zero to Professional" — a static single-page course app
(plain HTML/CSS/JS, no framework, no runtime build). Built by U E Sai Pavan Vamshi Krishna.
- **Folder:** `C:\Users\saipa\Personal\Projects\AI\Tutorials\quantum-computing-course`
  (bash mount: `/sessions/<name>/mnt/AI--Tutorials/quantum-computing-course`).
- **Governing spec:** `../COURSE_BUILD_PLAYBOOK.md` (Tutorial Hub standard).

**Status:** built to playbook standard; `node tools/qa.js` = 0 issues; every route verified
headlessly with 0 JS errors. 12 modules / 47 lessons, 22 in-lesson widgets, a 6-lab section.
`sw.js` VERSION: `qcc-v2.2.0`.

**Architecture (single-source, modular):**
- `assets/js/app.js` = core + `window.QCC` API. Feature files push an init fn to
  `window.QCC_FEATURES`; inside use `QCC.registerRoute(fn)`, `QCC.onRender(fn)`,
  `QCC.setContent`, `QCC.renderMarkdown`, `QCC.COURSE/CONTENT/FLAT/store/escapeHtml`.
- `site.js` (byline+a11y+effects) · `features.js` (glossary, flashcards, review, cheatsheets,
  interview, exam, map, read-aloud, search) · `runner.js` (Pyodide + embedded pure-Python
  `QuantumCircuit` sim) · `assistant.js` (free retrieval AI).
- `widgets.js` — 22 in-lesson canvas widgets keyed by lesson id in the `WIDGETS`/`BUILDERS`
  maps (bloch, interference, entanglement, two-qubit-gates, grover, qft, noise, trig,
  vectors2d, complex, euler, eigen, probability, sampling, qubit, tensor, teleport,
  deutsch-jozsa, qpe, shor, vqe, qec) + a shared `drawBars` helper.
- `labs.js` — the "🧪 Interactive Labs" section: 6 flagship standalone sandboxes (Circuit
  Builder with a real ≤3-qubit complex-statevector simulator, Bloch Sphere Sandbox, Grover
  Playground, QFT/Period-Finding Lab, Error Correction Lab, VQE Optimization Lab), reachable
  via `#/labs` + `#/lab/:id`, a dedicated home-page section, and its own sidebar nav group.
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
