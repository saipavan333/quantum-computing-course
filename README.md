# Quantum Computing: Zero to Professional

A complete, self-contained course that takes you from **no math, no Python, no physics** all the way to **writing and defending quantum programs on real hardware** — built to a "would this make someone job-ready?" bar.

- **12 modules · 47 deep lessons · ~85 hours of guided study**
- **94 interactive quizzes · 141 worked-solution exercises · 55 verified diagrams**
- Full study platform: **glossary + hover definitions, flashcards, a spaced-repetition review hub, per-module cheat sheets, an interview question bank, a job-readiness exam, an interactive concept map, read-aloud, in-browser runnable code, live interactive widgets, and a free AI study assistant.**
- Runs as a **website** (deploy anywhere) *and* an **offline desktop app** — same files, no build step, no internet required once opened.
- Verified against the **July 2026** ecosystem: Qiskit 2.x, IBM Quantum Platform Open Plan, current hardware.
- Built to the Tutorial Hub **Course Build Playbook** standard — accessibility (skip link, ARIA, keyboard, `prefers-reduced-motion`), one American-English locale, no math/currency collisions, single-source chrome, and a QA regression suite that must pass before every push.

*Built by U E Sai Pavan Vamshi Krishna.*

## Two ways to use it

### 1. As a desktop app (offline, on your computer)
Double-click **`QuantumCourse.bat`** (Windows). It opens the course in its own app window (Microsoft Edge app-mode) and works fully offline. On macOS/Linux, just open `index.html` in any browser.

### 2. As a website (access from anywhere)
Host the folder on any static host — **GitHub Pages is free and takes ~5 minutes**. See **`DEPLOY.md`** for step-by-step instructions. Once hosted, you can also **install it as an app** from Chrome/Edge (menu → *Apps → Install this site as an app*) for an offline, icon-on-your-desktop experience with progress saved.

## What's inside

| Module | Topic |
|---|---|
| 0 | Start Here — the field, the jobs, and setting up your lab |
| 1 | School Math, Rebuilt — numbers, algebra, trig, vectors |
| 2 | The Math of Quantum — complex numbers, matrices, Dirac notation, eigenvalues |
| 3 | Probability & Statistics — the language of measurement outcomes |
| 4 | Python From Zero — through NumPy, from your first line of code |
| 5 | Quantum Mechanics for Computation — superposition, the qubit, the Bloch sphere |
| 6 | Qubits Together — gates, entanglement, teleportation |
| 7 | Programming Real Quantum Computers — Qiskit 2.x on real hardware |
| 8 | The Canonical Algorithms — Deutsch–Jozsa, Grover, QFT, phase estimation, Shor |
| 9 | The NISQ Era — noise, error mitigation, VQE, QAOA, QML |
| 10 | Error Correction & Fault Tolerance — stabilizers, the surface code, the road ahead |
| 11 | Become the Professional — the industry, a capstone portfolio, and getting hired |

Every lesson follows the same gold-standard shape: intro → deep numbered sections with real code/math → a worked example → gotchas → a realistic scenario → key points → quizzes → exercises with full solutions → practice questions. Every math object is computed by hand **and** verified in NumPy; every claim about the field is honest about its limitations.

## Study tools (reachable from the home page and the sidebar)

- **Glossary** — every term defined in plain English, plus **inline hover/tap definitions**: key terms are underlined inside lessons and show a definition popover.
- **Flashcards** — auto-generated from each lesson's key points; flip, and grade yourself.
- **Review hub** — a Leitner-box **spaced-repetition** system spanning every lesson; correct recalls promote a card, misses reset it, and it surfaces the low boxes first.
- **Cheat sheets** — condensed key points per module for fast revision.
- **Interview question bank** — real questions classified **easy / medium / hard** with model answers and lesson links.
- **Job-readiness exam** — 15 questions sampled across the whole course, graded, with a pass bar and your best score.
- **Concept map** — the whole curriculum in dependency order; click a module to jump in.
- **Read-aloud** — every lesson can be read aloud (Web Speech).
- **Runnable code** — ▶ Run buttons execute real Python **in your browser** via Pyodide, including a built-in `QuantumCircuit` simulator so you run genuine quantum code with no install and no Qiskit. (Needs an internet connection the first time to download the runtime; offline it shows the code with a friendly note.)
- **Live widgets** — an interactive Bloch sphere and a two-path interference explorer, embedded in the relevant lessons.
- **AI study assistant** — the 🤖 button (bottom-right, every page): a free, private, offline assistant that answers from the course's own lessons and glossary and **cites** where to read more. See `ASSISTANT-SETUP.md` to add an optional generative upgrade.

## Progress tracking
Completion, review-deck state, and exam scores are saved in your browser (localStorage) — they persist across restarts on the same browser/machine (not across devices). The home page offers **Resume where you left off**.

## Selling it / access control
The course ships **free and open**. To sell it with time-limited access, see **`ACCESS-CONTROL.md`** — it presents the host/billing options and the honest caveat that a static site can't strongly gate paid content.

## For developers — build & QA

- Lesson sources are plain Markdown in `lessons/<module>/<nn>-<id>.md`.
- `node tools/build.js` recompiles `content/*.js` from the lesson sources (and lints quiz JSON, fences, math delimiters, diagram references).
- `node tools/check-diagrams.js` verifies every SVG diagram renders cleanly (bounds / text-overflow / floating-arrowhead checks).
- **`node tools/qa.js`** runs the full **regression suite** — JS syntax, build lint, diagram bounds, per-text-node math-collision scan, locale/British-spelling scan, and reference resolution. **Run it before every push; the standard for "done" is 0 issues.**
- **`MASTER_PROMPT.md`** contains the exact lesson-generation prompt — hand it to any capable AI to add new lessons in the same standard.

Feature code is single-source and modular: `assets/js/app.js` (core + the `window.QCC` API), `site.js` (byline + accessibility + effects), `features.js` (study tools), `runner.js` (Pyodide + quantum simulator), `widgets.js` (interactive widgets), `assistant.js` (AI assistant), and `content/glossary.js` + `content/interview.js` (data). New feature modules register routes/tiles via `QCC_FEATURES`; a global change is one edit, not N.

## Tech notes
No framework and no build tooling required to *run* it — plain HTML/CSS/JS with vendored KaTeX (math), Marked (markdown), and highlight.js (code), all bundled locally so it works on `file://` and offline. Pyodide (for runnable code) is the only feature that loads from a CDN, lazily, on first Run, and degrades gracefully when unavailable. A service worker (`sw.js`) caches everything else for offline use over https. PWA-installable via `manifest.webmanifest`.

---

*Built as a mentor-guided path: the goal was never "a correct explanation" but "could someone who worked through this do the job and defend their choices under interview questioning?" Start at Module 0 and go in order — every lesson stands on the ones before it.*
