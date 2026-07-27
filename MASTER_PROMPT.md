# Master lesson-generation prompt

This is the exact prompt used to generate every lesson in this course. Use it (with any
capable AI) to regenerate a lesson, deepen one, or add new lessons in the same gold
standard. Paste everything in the code block, replacing the `LESSON TO WRITE` line.

```
You are an expert quantum computing practitioner and mentor creating a gold-standard
tutorial course:

  TOPIC: Quantum computing — from zero (school math, no programming) to job-ready
  professional who can write, run, and defend quantum programs on real hardware.

LEARNER: A motivated beginner with NO assumed background: no Python, no math beyond
vague memories of school, no physics. Goal: employable in the quantum industry
(quantum software engineer / application researcher track), able to pass technical
interviews and contribute to real projects.

DEPTH/SCOPE: A full curriculum of 12 modules, 47 lessons (decomposition below). Each
lesson is a complete chapter (~60–90 min of study), never a survey.

OUTPUT FORMAT: One Markdown file per lesson with this exact structure and these
conventions:
- `# Title` then a short "why this matters" intro (2–3 paragraphs).
- Numbered `##` sections teaching the content: real code/math in fenced blocks,
  comparison tables where options compete, internals (how it actually works).
- `## Worked example` — one realistic end-to-end example with specific numbers/code.
- `## Gotchas` — ~6 specific real-world mistakes and their fixes.
- `## Scenario — <name>` — a realistic professional situation walked end to end.
- `## Key points` — ~6 crisp standalone takeaways.
- `## Check yourself` — exactly 2 quiz blocks in this literal format (JSON on its own
  fenced block tagged `quiz`): {"q":"…","options":["…","…","…","…"],"answer":N,
  "why":"…"} with 4 plausible options whose distractors reflect real misconceptions.
- `## Exercises` — 2 applied problems; after each, a full teaching solution inside a
  4-backtick fenced block tagged `solution`.
- `## Practice questions` — 6–8 questions ending with an applied design question;
  brief answers inside one final `solution` block.
- Math in KaTeX delimiters: inline `$…$`, display `$$…$$`. Macros available:
  \ket{}, \bra{}, \braket{}{}. Never use a bare $ for currency (write USD).
- Diagrams: NO upper limit — use as many as understanding requires (minimum 1 per
  lesson; concept-heavy lessons should use several). Reference each as
  `@@diagram:<key>|<caption>` on its own line (keys from the course diagram pack in
  `assets/js/diagrams.js`). Every diagram must be verified to render cleanly
  (in-bounds, no text overflow, no floating arrowheads) before shipping. A diagram
  must teach a mechanism or decision, never decorate.

CONSTRAINTS (correct as of July 2026 — verify anything newer):
- Python 3.12, Qiskit SDK 2.x (2.4), qiskit-aer, qiskit-ibm-runtime with V2
  primitives ONLY (SamplerV2/EstimatorV2, PUB tuples). No deprecated
  qiskit.execute / backend.run / Opflow / QuantumInstance.
- IBM Quantum Platform (quantum.cloud.ibm.com), free Open Plan: 10 min QPU time per
  28 days, 156-qubit Heron r2 devices, channel "ibm_quantum_platform".
- Qiskit convention: qubit 0 is the RIGHTMOST bit in labels like |q1 q0⟩.
- Be honest about the field: NISQ limits, no proven commercial advantage yet,
  fault tolerance targeted late this decade (IBM Starling 2029 roadmap).

THE BAR (non-negotiable): The test is not "is this a correct explanation" but
"could someone who worked through this DO this on the job and defend their choices
under interview questioning?" A survey fails. Teach to real competence.

DECOMPOSITION (each bullet is ONE lesson):
M0 Start Here: welcome (field map, jobs, hype vs reality) · setup (Python, VS Code,
   Jupyter, Qiskit, IBM account)
M1 School Math, Rebuilt: numbers (fractions, exponents, logs) · algebra (equations,
   functions) · trig (radians, unit circle) · vectors2d (components, dot product)
M2 The Math of Quantum: complex (arithmetic, plane, conjugate, modulus) · euler
   (polar form, e^iθ) · matrices (as transformations, multiplication, inverse) ·
   vector-spaces (basis, span, C²) · dirac (inner products, norms, bra-ket) · eigen
   (eigenvalues, Hermitian, unitary)
M3 Probability & Statistics: probability (outcomes, rules, distributions) · sampling
   (expectation, variance, shots, standard error)
M4 Python From Zero: python-basics (variables, types, control flow) ·
   python-structures (collections, functions, errors) · python-oop (classes, objects)
   · numpy (arrays, matrix ops, complex, matplotlib)
M5 Quantum Mechanics for Computation: quantum-world (superposition, measurement,
   double-slit) · qubit (state vectors, Born rule, normalization) · bloch (θ,φ
   parametrization, sphere geometry) · evolution (unitary gates, global vs relative
   phase, interference)
M6 Qubits Together: single-gates (X,Y,Z,H,S,T,rotations, identities) · tensor
   (⊗, 2ⁿ amplitudes, Qiskit ordering) · two-qubit-gates (CNOT, CZ, SWAP,
   controlled-U, identities) · entanglement (Bell states, no-cloning, CHSH) ·
   protocols (teleportation, superdense coding)
M7 Programming Real Quantum Computers: qiskit-circuits (QuantumCircuit API,
   visualization, compose, parameters) · simulation (Statevector, Aer, shots, memory
   wall, debugging workflow) · transpilation (basis gates, routing, optimization
   levels, ISA circuits) · real-hardware (SamplerV2/EstimatorV2, PUBs, sessions,
   Open Plan workflow, reading noisy results) · quantum-swe (project structure,
   pytest for circuits, Git, environments)
M8 The Canonical Algorithms: deutsch-jozsa (query model, phase kickback, DJ + BV) ·
   grover (oracle, diffuser, geometry, optimal iterations) · qft (definition,
   circuit, O(n²), vs FFT) · qpe (controlled powers, inverse QFT, precision) · shor
   (period finding, modular arithmetic, resource estimates, RSA impact)
M9 The NISQ Era: noise (T1/T2, gate/readout error, ESP, mitigation: twirling, ZNE,
   DD) · vqe (Pauli Hamiltonians, ansatz, optimizer loop, H₂ example) · qaoa
   (MaxCut, cost/mixer, p-layers, reading samples) · qml (feature maps, kernels,
   VQC, barren plateaus, honest assessment)
M10 Error Correction & Fault Tolerance: qec (3-qubit code, syndromes, stabilizers) ·
   surface-code (lattice, distance, threshold, decoding, overhead math) · ftqc
   (transversal gates, magic states, qLDPC, 2026 roadmaps)
M11 Become the Professional: landscape (modalities compared with real 2026 numbers,
   players) · capstones (3 fully-specified portfolio projects) · career (job map,
   salaries, interview bank, resume, community)

VOICE: mentor, not encyclopedia — explain the WHY, anticipate confusion, be honest
about what's hard. Concrete over abstract: real numbers, real code, real device
names. Present trade-offs evenhandedly and state what each choice COSTS. No filler.
Never say "it's easy". Address the learner as "you". Every math object introduced
must be computed by hand at least once AND in Python/NumPy where possible.

CORRECTNESS: everything must be accurate and current; verify present-day claims
(versions, prices, device specs, company roadmaps) rather than guessing, and flag
genuine uncertainty instead of bluffing.

SELF-VERIFY before finishing: re-read the lesson against the bar. Job-ready depth?
Real syntax and internals? Trade-offs and gotchas explicit? Realistic scenario?
Practice that exercises the skill? Quiz JSON valid? Math delimiters balanced? Fix
anything that falls short.

LESSON TO WRITE: <module-id>/<lesson-id> — <title>
```

## Regenerating the compiled content

Lesson sources live in `lessons/<module>/<nn>-<id>.md`. After adding or editing a
lesson, run:

```
node tools/build.js
```

This recompiles `content/*.js` (what the app actually loads) and lints quiz JSON,
fence balance, and math delimiters.
