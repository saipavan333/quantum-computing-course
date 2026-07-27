# CONTEXT — paste/point me here at session start to skip re-discovery

**What:** "Quantum Computing: Zero to Professional" — a static single-page course app
(plain HTML/CSS/JS, no framework, no runtime build). Built by U E Sai Pavan Vamshi Krishna.
- **Folder:** `C:\Users\saipa\Personal\Projects\AI\Tutorials\quantum-computing-course`
  (bash mount: `/sessions/<name>/mnt/AI--Tutorials/quantum-computing-course`).
- **Governing spec:** `../COURSE_BUILD_PLAYBOOK.md` (Tutorial Hub standard).

**Status:** built to playbook standard; `node tools/qa.js` = 0 issues; every route verified
headlessly with 0 JS errors. 12 modules / 47 lessons.

**Architecture (single-source, modular):**
- `assets/js/app.js` = core + `window.QCC` API. Feature files push an init fn to
  `window.QCC_FEATURES`; inside use `QCC.registerRoute(fn)`, `QCC.onRender(fn)`,
  `QCC.setContent`, `QCC.renderMarkdown`, `QCC.COURSE/CONTENT/FLAT/store/escapeHtml`.
- `site.js` (byline+a11y+effects) · `features.js` (glossary, flashcards, review, cheatsheets,
  interview, exam, map, read-aloud, search) · `runner.js` (Pyodide + embedded pure-Python
  `QuantumCircuit` sim) · `widgets.js` (Bloch + interference) · `assistant.js` (free retrieval AI).
- Data: `lessons/<m>/<nn>-<id>.md` → compiled to `content/*.js` by `tools/build.js`;
  plus `content/glossary.js`, `content/interview.js`; diagrams in `assets/js/diagrams.js`.

**Workflow after ANY edit:** `node tools/build.js` → `node tools/qa.js` (must be 0 issues) →
bump `VERSION` in `sw.js`. Verify features in jsdom with `runScripts:"dangerously"`, injecting
each file as an inline `<script>` (bare `location`/`marked` need real execution, not `win.eval`).

**Gotchas:** after file-tool edits the mount may run stale bytecode — clear `__pycache__` or
rewrite via bash if a change "doesn't take." Never put a literal currency `$` in prose (it
collides with `$…$` math); write "USD".

**Open (documented, not built):** generative AI tier → `ASSISTANT-SETUP.md`; paid access →
`ACCESS-CONTROL.md`. Full detail → `HANDOFF.md`.

**To resume:** tell me "Read CONTEXT.md in the quantum course and continue."
