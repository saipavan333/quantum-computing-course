# Capstone portfolio: three projects that get interviews

Knowledge gets you past a resume screen; a portfolio gets you the job. In a field where most applicants have watched the same lectures, *demonstrated ability* — real code, real results, honest analysis — is the differentiator. This lesson specifies three portfolio projects, each exercising a different competency band, each producing a public artifact (GitHub repo + README + plots) that concretely proves you can do the work. Build these to the standard described and you'll have more to show than most bootcamp graduates and many degree holders. They also double as the answer to the inevitable interview question: "tell me about a quantum project you built."

## The portfolio principles (before the projects)

Every project must satisfy the standards you've built all course:

- **Public and reproducible**: GitHub repo, pinned dependencies, seeds, `pytest` tests, a README a stranger can follow (Module 7's SWE lesson — this is where it pays off).
- **Honest results with error bars**: every measured quantity gets ±2SE (Module 3); every claim gets its limitation stated. Honesty is more impressive than inflated results.
- **A README that tells a story**: problem → approach → results (with plots) → what you learned → limitations. Written for a hiring manager skimming in 90 seconds.
- **Runs on free resources**: simulators + the free Open Plan (Module 7). No project should require paid hardware.

The meta-point: these projects demonstrate not just quantum knowledge but *engineering judgment and communication* — the traits that separate hireable from knowledgeable. A modest project executed to professional standards beats an ambitious one that's a messy notebook.

## Project 1 — Hardware benchmarking suite (systems/software track)

**What**: a tool that characterizes real quantum hardware — runs a battery of experiments (Bell/GHZ fidelity vs size, T1/T2 estimation, gate error via simple randomized benchmarking, readout error) on IBM's free devices, produces a report with plots, and tracks results over time.

**Why it impresses**: it demonstrates the full professional workflow (Modules 7, 9) — transpilation, primitives, statistics, mitigation, metadata logging — on *real hardware*, and produces genuinely useful characterization data. It's exactly what quantum software engineers do.

**Milestones**:
1. Bell + GHZ fidelity vs qubit count (Module 7's ladder), with ±2SE, on a fake backend then real hardware.
2. Add T1/T2 estimation (prepare, wait varying times, measure decay — Module 9's physics) and a decoherence plot.
3. Add readout-error characterization and mitigation comparison (raw vs mitigated).
4. Package as a CLI/library with tests, a metadata record per run, and a report generator.
5. *Stretch*: track a device over days, plotting calibration drift (the "Monday regression" scenario made into a tool).

**The README's money shot**: a multi-panel figure — fidelity-vs-size, decoherence curves, mitigation before/after — with the honest caption "characterized ibm_kingston over one week; two-qubit fidelity varied X%, GHZ signature dropped below 50% at N≈Y qubits." That plot says "I can operate real quantum hardware professionally" more convincingly than any bullet list.

## Project 2 — VQE chemistry study (applications/research track)

**What**: compute a small molecule's ground-state energy and dissociation curve with VQE, comparing ansätze and optimizers, on simulator and (final points) real hardware with mitigation, benchmarked against the exact classical answer.

**Why it impresses**: it demonstrates the NISQ-era's flagship algorithm (Module 9), connects quantum computing to a real scientific quantity (chemistry), and — crucially — shows honest benchmarking against classical methods. Applications-research roles want exactly this.

**Milestones**:
1. H₂ ground energy via VQE on a noiseless simulator, converging to chemical accuracy (Module 9's exercise), vs the exact diagonalization.
2. The full dissociation curve E(r), showing the equilibrium bond length and well depth — the canonical VQE plot.
3. Ansatz comparison (hardware-efficient vs UCCSD-like) and optimizer comparison (COBYLA vs SPSA), quantifying the trade-offs.
4. Final curve points on real hardware with the full mitigation stack (Module 9), showing raw vs mitigated vs exact.
5. *Stretch*: a slightly larger molecule (H₃⁺, LiH with active-space reduction) using a chemistry package (PySCF) for the Hamiltonian.

**The README's money shot**: the dissociation curve with three overlaid traces (exact, noiseless-VQE, mitigated-hardware-VQE) and error bars, captioned honestly: "VQE reproduces H₂'s equilibrium geometry; hardware results reach within Z% of exact after mitigation. Note: H₂ is classically trivial — this demonstrates method fluency, not quantum advantage." That last sentence — volunteering the honest limitation — is what makes a reviewer trust you.

## Project 3 — QEC simulator & threshold study (theory/QEC track)

**What**: simulate the surface code (or the 3-qubit → 9-qubit progression building up to it) under noise, decode with matching, and empirically measure the error threshold — reproducing the methodology behind real below-threshold results.

**Why it impresses**: it demonstrates the deepest, most future-critical topic (Module 10), uses the industry-standard research tools (Stim, PyMatching), and produces a genuine scientific result (a measured threshold). QEC-scientist and research roles prize this.

**Milestones**:
1. The 3-qubit code pipeline: encode, inject errors, syndrome extraction, correction, verify (Module 10's exercise) — establishing the concepts.
2. The threshold curve for a simple code: logical vs physical error rate, Monte-Carlo, finding break-even (Module 10's exercise).
3. Distance-3 and distance-5 surface code via Stim + PyMatching, measuring where the curves cross (the threshold — Module 10's exercise).
4. A clean analysis: extracted threshold value, the noise model stated, distance-scaling plots.
5. *Stretch*: compare decoders (MWPM vs Union-Find) on speed/accuracy, or explore a code-distance vs overhead trade study.

**The README's money shot**: the threshold plot — logical error rate vs physical error rate for multiple code distances, curves crossing at the threshold — captioned "measured surface-code threshold ≈ X% under depolarizing noise using Stim + PyMatching; below threshold, increasing distance from 3 to 5 reduces logical error as predicted." That plot reproduces Nature-paper methodology and unmistakably signals research-grade capability.

## Choosing and sequencing

You don't need all three immediately. Pick by your target role: benchmarking for software/systems roles, VQE for applications/chemistry, QEC for research/theory. But building at least two — one demonstrating hardware fluency, one demonstrating an algorithm or theory depth — gives a rounded portfolio. Sequence: start with the one matching your strongest interest (motivation sustains completion), do it *thoroughly* (a polished single project beats three half-finished ones), then add breadth. And integrate them into the `qbench` repo you've been building since Module 7 — a single, coherent, growing portfolio repo tells a better story than scattered fragments.

## Worked example — what "professional standard" looks like on Project 1

*Two submissions of the same benchmarking project, so you can see the bar:*

**Submission A** (the common version): a Jupyter notebook titled `Untitled3.ipynb`, cells run out of order, one Bell-state histogram, no error bars, no README, hardcoded results, "it works!" as the only commentary. Demonstrates: ran some Qiskit once.

**Submission B** (the hireable version): a repo `qhw-bench/` with `src/` (pure characterization functions + tests), a CLI (`python -m qhwbench --backend ibm_kingston --experiments bell,ghz,t1t2`), a README opening with a results figure and a 3-sentence summary, pinned deps, seeds, a `results/` folder with dated JSON manifests + committed plots, and a "Limitations" section noting shot budgets and calibration variability. The README's first paragraph: *"qhw-bench characterizes IBM quantum hardware. Below: GHZ fidelity vs size on ibm_kingston (Jan 2026), showing the signature dropping below 50% at 14 qubits — with ±2σ error bars and full transpilation metadata logged per run. Reproducible via `pip install -e . && python -m qhwbench`."* Demonstrates: can operate hardware, engineer software, analyze honestly, and communicate — i.e., can do the job.

The gap between A and B is *not* quantum knowledge — it's the professional standards from Module 7, applied. That gap is exactly what this course has been building toward, and it's what turns "knows quantum computing" into "hire this person." The technical content of both submissions might be identical; the *presentation and rigor* is the entire difference in outcome. Internalize that the polish IS the skill, not decoration on it.

## Gotchas

- **Ambition over completion.** A finished, polished small project beats an abandoned ambitious one. Reviewers see completion as a proxy for reliability. Scope down, finish, then extend.
- **Notebooks as the deliverable.** Explore in notebooks; ship a repo with `src/`, tests, and a README (Module 7). A raw notebook signals "student," a clean repo signals "engineer."
- **Missing the honest-limitations section.** Every project has limits (shot budgets, small molecules, toy codes); stating them builds trust and demonstrates judgment. Hiding them reads as either naivety or dishonesty.
- **No classical baseline.** VQE without the exact energy, QAOA without a classical solver, QML without a classical model — the baseline is what makes results interpretable (Modules 8–9). Its absence is a red flag.
- **Results without error bars.** Every measured quantity needs ±2SE (Module 3). Bare point estimates on quantum results signal statistical illiteracy — an instant credibility hit.
- **Unreproducible.** No seeds, no pinned versions, no run instructions = a reviewer can't verify it = it doesn't count. Reproducibility is non-negotiable (Module 7).

## Scenario — the portfolio that turned a screening into an offer

A career-changer (biology degree, self-taught via this course) applies to a quantum software role against candidates with physics PhDs. Their edge: a GitHub profile with two polished projects — the benchmarking suite (with a clean README, real ibm_kingston data, tests passing) and the VQE study (dissociation curve, honest "not advantage" caption). In the interview, when asked "tell me about your quantum experience," they don't recite coursework — they screen-share the benchmarking repo, walk through a design decision (why they seeded the transpiler, how they handled the register-naming trap), show the honest limitations section, and discuss what surprised them (calibration drift over a week). The interviewer, who has seen fifty candidates describe the same online courses, is talking to someone who *demonstrably did the work* to a professional standard. The PhD candidates knew more physics; this candidate proved they could ship. They got the offer. The lesson the whole course has been building to: **in an oversubscribed field, demonstrated professional-standard work beats credentials** — and building it is entirely within reach of someone who started, twelve modules ago, knowing no math, no Python, and no quantum computing. That person is you.

## Key points

- A portfolio of demonstrated work beats knowledge/credentials in an oversubscribed field; build public, reproducible projects to professional standards (Module 7's SWE discipline).
- Three tracks: hardware benchmarking (systems/software), VQE chemistry (applications), QEC threshold study (theory/research) — pick by target role, build at least two for breadth.
- Every project: public repo + tests + pinned deps + seeds, honest results with ±2SE, a story-telling README with a "money shot" figure, a stated-limitations section, runs on free resources.
- The gap between an unhireable notebook and a hireable repo is professional standards (presentation, rigor, communication) — NOT quantum knowledge; the polish IS the skill.
- Volunteering honest limitations ("H₂ is classically trivial — this shows method fluency, not advantage") builds the trust that gets offers.
- Integrate projects into one growing `qbench` portfolio repo; finish one thoroughly before adding breadth.

## Check yourself

```quiz
{"q":"Two candidates submit the same VQE project. One is a notebook with a converged energy; the other is a repo with tests, a dissociation curve with error bars, a classical-baseline comparison, and a caption noting 'H₂ is classically trivial — this demonstrates method fluency, not quantum advantage.' Why does the second win?","options":["It uses more qubits","It demonstrates engineering rigor, honest analysis, and communication (the professional standards) — and the honest-limitations note builds trust; the technical content may be identical but the presentation proves job-readiness","The first has bugs","VQE requires a repo by law"],"answer":1,"why":"The differentiator isn't quantum knowledge — it's professional standards (reproducibility, error bars, baseline, honest limitations, communication). Volunteering the 'not advantage' caveat signals trustworthy judgment, which is what hiring managers actually screen for."}
```

```quiz
{"q":"You have limited time. What's the best portfolio strategy?","options":["Start all three projects to show breadth","Build one project THOROUGHLY to professional standard (tests, README, honest results, reproducible), then add a second for breadth — a polished finished project beats several half-finished ones","Focus only on the most ambitious project regardless of completion","Skip projects and list courses completed"],"answer":1,"why":"Completion signals reliability; polish signals professionalism. One thorough project demonstrates you can finish to standard — more valuable than scattered fragments. Reviewers read unfinished ambition as a risk, finished modest work as a competence proxy."}
```

## Exercises

**Exercise 1 — scope and start your primary capstone.** Choose one of the three projects matching your target role. Write its project plan: the milestones (adapt the lesson's list), the specific deliverables per milestone, the free resources you'll use, the "money shot" figure you're aiming for, and a realistic timeline. Then complete Milestone 1 to professional standard (repo, one test, a README stub with the goal). Deliverable: a public repo with Milestone 1 done and the plan in the README.

````solution
A strong Milestone-1 submission demonstrates the standards, not scope. For Project 1 (benchmarking), Milestone 1 = Bell/GHZ fidelity vs size on a fake backend:

```
qhw-bench/
├── README.md          # goal, plan (all milestones), how-to-run, Milestone-1 result
├── pyproject.toml     # pinned qiskit, qiskit-aer, etc.
├── src/qhwbench/
│   ├── experiments.py # ghz_fidelity(n, backend, shots) → (value, se) — pure-ish
│   └── report.py      # plot generation
├── tests/test_experiments.py   # Statevector-exact check that ghz(n) is correct
└── results/ghz_fidelity_fake.png + .json manifest
```

README opens with: the goal (1 sentence), the milestone plan (the adapted list), the Milestone-1 figure (GHZ fidelity vs n on a fake backend, ±2SE), and `pip install -e . && pytest && python -m qhwbench --demo`. The test asserts the GHZ circuit's statevector is correct (phase-aware — Module 7's lesson). One dated JSON manifest logs the run (backend, shots, seeds, transpile metadata).

Grading yourself against the bar: Is the core logic in `src/` (not a notebook)? Does a test exist and pass? Can a stranger run it from the README? Is the result plotted with error bars? Is there a dated manifest? If all yes, Milestone 1 is at professional standard — and you've established the SCAFFOLD that makes Milestones 2-5 additions rather than rewrites. Starting at this standard (vs a notebook you'll later "clean up" — you won't) is the single highest-leverage habit. The plan-in-README also means that even at Milestone 1, a reviewer sees where it's going — a partial project with a clear plan reads as "in progress and competent," not "abandoned."
````

**Exercise 2 — write the money-shot README section.** For your chosen project (even before it's complete), draft the README's opening: the 3-sentence summary, the target figure's caption (written as if the figure exists — this clarifies what you're building toward), the "how to reproduce" block, and the "limitations" section. Writing this FIRST (README-driven development) forces you to design for the reviewer and clarifies the deliverable. Deliverable: the README opening, reviewed against "would this make a hiring manager keep reading?"

````solution
README-driven development (writing the README before the code) is a real professional technique — it forces you to design the deliverable from the reader's view. A strong draft for Project 2 (VQE):

---
*# vqe-h2: Ground-state chemistry on quantum hardware*

*This project computes the H₂ molecule's dissociation curve using the Variational Quantum Eigensolver, comparing ansätze and optimizers across noiseless simulation and real IBM hardware with error mitigation. It reproduces the equilibrium bond length (0.735 Å) and benchmarks every result against exact classical diagonalization. Built with Qiskit 2.x; runs on free simulators and the IBM Open Plan.*

*![dissociation curve](results/dissociation.png)*
*Figure: H₂ ground-state energy vs bond length — exact (line), noiseless VQE (circles), mitigated hardware VQE (squares, ±2σ). Hardware reaches within 1.5% of exact after readout + ZNE mitigation. Note: H₂ is classically trivial; this demonstrates method fluency, not quantum advantage.*

*## Reproduce*
*```
pip install -e . && pytest
python -m vqeh2 --molecule H2 --backend simulator   # or an IBM backend
```*

*## Limitations*
*Minimal basis (STO-3G), 2-qubit active space; hardware points use N shots per evaluation within the free-tier budget; results vary ±X% across device calibrations. Larger molecules require active-space reduction (planned, Milestone 5).*

---

Reviewed against "would a hiring manager keep reading?": the first sentence states what and how; the figure + honest caption is scannable in 5 seconds and shows real results with error bars and the crucial "not advantage" honesty; the reproduce block proves it's runnable; limitations demonstrate judgment. A hiring manager skimming this in 90 seconds learns: this person builds real hardware VQE, benchmarks honestly, communicates clearly, and knows the limits of their work. That's a "schedule the interview" README. Writing it *before* the code also means every coding decision now serves this deliverable — which is why README-driven development produces more focused, better-communicated projects. The habit of designing for the reader first is, fittingly, the same mentor-mindset this entire course was written with.
````

## Practice questions

1. Why does a demonstrated portfolio beat credentials in the quantum job market?
2. What are the non-negotiable professional standards every capstone must meet?
3. What distinguishes an unhireable notebook from a hireable repo — and is it primarily quantum knowledge?
4. Why does volunteering a project's limitations strengthen rather than weaken it?
5. Which project suits which target role, and why build at least two?
6. What is a "money shot" figure and why does the README lead with it?
7. **Design question:** design your complete 6-month portfolio plan from where you are now: which projects in which order, how they integrate into one repo, the public artifacts (repos, blog posts, the claims-dashboard from the landscape lesson), and how you'd use them in networking and applications. What's the minimum viable portfolio that would make you a credible candidate?

````solution
1. The field is oversubscribed with people who've watched the same lectures; demonstrated professional-standard work proves you can actually do the job (engineer, analyze, communicate) — which credentials alone don't, and which is what hiring managers struggle to verify.
2. Public + reproducible (repo, pinned deps, seeds, tests, run instructions), honest results with ±2SE, a story-telling README with a money-shot figure and a limitations section, and runs on free resources.
3. The gap is professional standards — structure (src/ + tests vs cells), reproducibility, error bars, honest analysis, and communication — NOT quantum knowledge; identical technical content presented at the two standards produces opposite hiring outcomes.
4. It demonstrates judgment (you understand your work's boundaries) and builds trust (you're not overselling) — both are exactly what employers screen for in a hype-prone field; hidden limitations read as naivety or dishonesty when discovered.
5. Benchmarking → software/systems roles (demonstrates hardware + engineering workflow); VQE → applications/chemistry (demonstrates the flagship algorithm + honest benchmarking); QEC → research/theory (demonstrates the deepest topic + research tools). Build two for breadth — one hardware-fluency, one algorithm-or-theory-depth — to cover more role types and show range.
6. The single figure that best proves the project's value (fidelity-vs-size, dissociation curve, threshold plot); the README leads with it because a hiring manager skims in ~90 seconds and one honest, error-barred, well-captioned figure communicates capability faster than paragraphs.
7. Model 6-month plan: Months 1-2 — primary capstone matching your strongest interest, built thoroughly to standard (this sustains motivation and produces one polished artifact). Months 3-4 — second capstone for breadth (different competency band), reusing the repo scaffold. Month 5 — the claims-dashboard/blog (landscape lesson) + write up both capstones as blog posts (communication practice + SEO for your name). Month 6 — polish, cross-link everything from a personal site/GitHub profile README, and begin applications/networking. Integration: one `qbench` mono-repo growing since Module 7, plus a personal site linking repos + blog + dashboard. Networking use: the dashboard/blog are conversation-starters (comment on companies' announcements with your assessments), the repos are proof when reaching out, and in applications you lead with the money-shot figures. MINIMUM VIABLE PORTFOLIO: ONE thoroughly-polished capstone (repo + README + honest results) + a short "quantum claims, assessed" post demonstrating judgment — that pair alone (one DO artifact, one JUDGMENT artifact) makes you credible, because together they prove you can both build quantum software and tell the truth about the field, the two rarest and most valued traits. Everything beyond that is amplification. The plan's realism matters more than its ambition: a completed minimum-viable portfolio beats an elaborate one still "in progress" when the application deadline arrives — the same finish-over-scope principle, applied to your career.
````
