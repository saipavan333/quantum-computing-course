# Handoff — Quantum Computing: Zero to Professional

The course has been rebuilt to the Tutorial Hub **Course Build Playbook** standard. This note
records what changed, the pre-ship audit status, how to run the checks, and the exact commands to
push it. You (the user) push to git; the commands are below.

## What this rebuild added

- **Creator byline** — "Built by U E Sai Pavan Vamshi Krishna" in the sidebar brand block *and*
  the footer, from a single source (`assets/js/site.js`), gradient-animated and reduced-motion-aware.
- **Accessibility** — skip-to-content link, one `main` landmark, ARIA on custom controls, visible
  focus states, image/diagram text alternatives (SVGs labeled from their captions), and full
  `prefers-reduced-motion` handling (page entrance, scroll-reveal, widget/byline animation all
  soften or stop).
- **Study tools** — glossary (65 terms) + inline hover/tap definitions, flashcards, a Leitner
  spaced-repetition **review hub**, per-module cheat sheets, an **interview bank** (easy/medium/hard),
  a **job-readiness exam**, an **interactive concept map**, **read-aloud**, and enhanced
  (lessons + glossary) search.
- **Runnable code** — ▶ Run buttons run real Python in-browser via Pyodide, with a built-in
  pure-Python `QuantumCircuit` simulator (verified correct: Bell, GHZ, little-endian), a light
  auto-grader (`# expect:`), and a graceful offline fallback.
- **Interactive widgets** — a live Bloch sphere and a two-path interference explorer, embedded in
  the relevant lessons.
- **AI study assistant** — free, private, offline retrieval assistant that cites lessons; docked
  🤖 button on every page + `#/assistant`. Generative upgrade documented in `ASSISTANT-SETUP.md`.
- **QA regression suite** — `tools/qa.js`: JS syntax, build lint, diagram bounds, per-text-node
  math-collision scan, locale scan, reference resolution. **Currently: 0 issues.**
- **Platform docs** — `ASSISTANT-SETUP.md` (generative upgrade) and `ACCESS-CONTROL.md` (how to
  sell it, with the honest static-site caveat). Service worker bumped to cache all new assets.

## Pre-ship audit (playbook §8) — status

| # | Check | Status |
|---|---|---|
| 1 | Structure — every lesson has all sections, no thin content | ✅ build lint clean |
| 2 | Content accuracy — facts checked, volatile facts date-stamped (July 2026) | ✅ (from original build) |
| 3 | Math — no literal-`$`/delimiter collisions; equations render | ✅ per-node scan clean; 3,229 KaTeX expr render |
| 4 | Visuals — no overflow/overlap; numbers correct; edge cases | ✅ 55 diagrams + 2 widgets bounds-checked |
| 5 | Navigation — logo→home, back paths, favicon, no dead-ends, path-aware | ✅ SPA hash routes resolve everywhere; resume + reliable Back |
| 6 | Accessibility — contrast, keyboard, focus, alternatives, reduced-motion | ✅ implemented + verified |
| 7 | Performance & mobile — budgets, responsive, touch | ✅ lazy Pyodide; responsive; no horizontal scroll |
| 8 | UX states — loading/empty/error/fallback | ✅ runner, assistant, quizzes |
| 9 | Locale — one spelling standard incl. generated files | ✅ American English, scan clean |
| 10 | Templates — global elements single-source | ✅ byline/nav/effects injected once |
| 11 | Integrity — regression suite green; scripts syntax-check | ✅ `node tools/qa.js` = 0 issues; 25/25 JS parse |
| 12 | Curriculum — dependency order correct | ✅ (from original build) |
| 13 | Handoff — consolidated push; exclude generated artifacts; open items | ✅ this file |

**Verification performed:** every route (all feature pages + a lesson from every module) was booted
in a headless DOM with **0 JavaScript errors and 0 empty views**; each feature was checked with a
dedicated harness (Pass A–E, all green); the quantum simulator was run in real Python against known
results; the design was rendered to images for visual review.

## Run the checks

```bash
node tools/build.js        # recompile content/*.js from lessons/*.md (+ lint)
node tools/check-diagrams.js
node tools/qa.js           # full regression suite — must be 0 issues
```

## Push it (you run these)

From the course folder:

```bash
git init                                   # first time only
git add -A
git commit -m "Rebuild to Course Build Playbook standard: byline, a11y, study tools, runnable code, AI assistant, QA suite"
# create an empty repo on GitHub first, then:
git branch -M main
git remote add origin https://github.com/<your-username>/quantum-computing-course.git
git push -u origin main
```

Then enable **Settings → Pages → Deploy from branch → main → / (root)**. See `DEPLOY.md` for the
full hosting walkthrough. After any later edit: `node tools/build.js && node tools/qa.js`, then
`git add -A && git commit -m "..." && git push`, and bump the `VERSION` string in `sw.js` so
returning visitors get the fresh assets.

Generated files: `content/*.js` are committed on purpose — they are the deployable runtime (the
static site loads them directly), regenerable from `lessons/*.md`. `.gitignore` excludes only
caches and the optional owner-only `assets/assistant-config.js`.

## Honest open items (nothing blocking)

- **Generative AI answers** and **paid access control** are *documented, not built* — both need your
  own accounts (Cloudflare/Gemini; a billing stack). The free retrieval assistant and the open
  course work fully today. See `ASSISTANT-SETUP.md` and `ACCESS-CONTROL.md`.
- **Runnable code needs the internet on first use** (Pyodide downloads once, then caches); offline
  or on `file://` it shows the code with a friendly note instead of running.
- **Interactive widgets** are on the most relevant lessons (Bloch, evolution, single-gates); more
  could be added over time using the same `widgets.js` pattern.
- **Content depth is unchanged** from the verified original build — this rebuild added the platform
  and standards layer around the existing 47 lessons; it did not re-verify the physics (already done).
