# Quantum software engineering: projects, tests, Git

Here is an open secret about quantum hiring: candidates who know quantum mechanics are common; candidates who can *ship maintainable quantum software* are rare — and teams pay for the second kind. This lesson converts your accumulated habits (referee checks, preflight ladders, metadata logging) into the formal structure employers recognize: project layout, automated tests, version control, and reproducible environments. It's the least glamorous lesson in the course and possibly the highest-paying one.

## Start here — the intuition

Four habits separate a shippable repo from a pile of notebooks. **Pure core, dirty edges:** keep circuit‑building and analysis functions free of I/O and network so they're instantly testable, and quarantine everything slow, stateful, or networked in one `runners` module. **Tests are the referee, automated:** the NumPy cross‑checks you've done all course become a suite — many *exact* checks (statevector equivalence, phase‑aware), a few *statistical* ones (seeded, generous tolerances), one *contract* canary. **Git is the lab notebook that can't lie:** small commits with *why* messages, credentials never committed, result manifests over gigabyte dumps. **Reproducibility is six lines** — commit hash, versions, seeds, backend + calibration, shots — the difference between science and anecdote.

Carry one truth: **your GitHub repo is the portfolio artifact that outranks certificates.** A recruiter clicking your profile should find tests passing, honest error bars, and a clean history — build it as if they read it, because they do.

## 1. Project structure — the shape of a serious repo

The layout that scales from coursework to production (and that interviewers subconsciously scan for):

```text
quantum-bench/
├── README.md              ← what/why/how-to-run, results table, plots
├── pyproject.toml         ← dependencies, pinned (or requirements.txt)
├── .gitignore             ← venvs, caches, credentials, large outputs
├── src/
│   └── qbench/
│       ├── __init__.py
│       ├── circuits.py    ← preparers & blocks (pure, return circuits, no I/O)
│       ├── analysis.py    ← counts→probs, SE, comparisons (pure functions)
│       ├── runners.py     ← simulators, preflight, hardware gateway (all I/O here)
│       └── metadata.py    ← the transpilation/job record dataclass
├── tests/
│   ├── test_circuits.py   ← statevector equivalence, invariants
│   └── test_analysis.py   ← statistics helpers vs hand-computed cases
├── notebooks/             ← exploration ONLY — promoted to src/ when stable
└── results/               ← job manifests, counts JSON, figures (small ones committed)
```

The organizing principle: **pure core, dirty edges**. `circuits.py` and `analysis.py` do no I/O, touch no network, know nothing about IBM — so they're instantly testable. Everything slow, stateful, or networked lives in `runners.py`. Notebooks are for *finding out*, `src/` is for *keeping* — the promotion ritual (copy working notebook code into a module, add tests, delete from notebook) is a weekly professional rhythm.

## 2. Testing quantum code — what to assert when outputs are random

The apparent paradox — "how do I unit-test a random process?" — dissolves into a hierarchy you already own:

**Tier 1: exact tests (the bulk).** Statevector equivalence, unitarity, invariants — deterministic, milliseconds, phase-aware:

```python
# tests/test_circuits.py
import numpy as np
import pytest
from qiskit.quantum_info import Statevector, Operator
from qbench.circuits import bell, ghz, w3

def test_bell_state_exact():
    sv = Statevector(bell())
    target = Statevector(np.array([1, 0, 0, 1]) / np.sqrt(2))
    assert sv.equiv(target)                      # phase-aware — catches Φ⁻ imposters

@pytest.mark.parametrize("n", [2, 3, 5, 8])
def test_ghz_support_and_uniformity(n):
    probs = Statevector(ghz(n)).probabilities_dict()
    assert set(probs) == {"0"*n, "1"*n}
    assert all(abs(p - 0.5) < 1e-12 for p in probs.values())

def test_circuit_inverse_is_identity():
    qc = ghz(4)
    assert Operator(qc.compose(qc.inverse())).equiv(Operator(np.eye(16)))

def test_ghz_rejects_bad_input():
    with pytest.raises(ValueError):
        ghz(1)
```

**Tier 2: statistical tests (a few).** Sampled results asserted within tolerance — *always* seeded AND toleranced (Module 3: assert within ~4–5 SE so false-failure rates are negligible):

```python
def test_bell_sampling_statistics():
    from qiskit_aer import AerSimulator
    from qiskit import transpile
    qc = bell(); qc.measure_all()
    sim = AerSimulator(seed_simulator=1234)
    counts = sim.run(transpile(qc, sim), shots=10_000).result().get_counts()
    p = (counts.get("00", 0) + counts.get("11", 0)) / 10_000
    assert p > 0.999                             # ideal sim: only tolerance is float/edge
```

**Tier 3: contract tests (one or two).** The preflight harness against a fake backend with a *loose* threshold — the canary that catches "this Qiskit upgrade changed transpilation behavior."

Run it all with `pytest -q` — green in seconds, on every change. The psychological shift to internalize: tests aren't bureaucracy; they're the **referee, automated** — the same NumPy cross-checks you've done all course, now running themselves while you sleep.

## Predict, then run — the referee, automated

Real pytest above; the in‑browser cell uses the course's lightweight simulator. Here the assertions *are* the test suite: GHZ invariants (exact, phase‑aware), then a demonstration that a counts test would miss a phase imposter.

**Predict first.** A GHZ state should show only all‑0s and all‑1s at 50/50. And the $\Phi^-$ imposter (a stray Z) — will it have the *same* histogram as $\Phi^+$ but a *different* statevector? Guess, then Run.

```run
# Live cell — tests are the referee, automated: assert invariants, and catch a phase imposter.
import numpy as np

def ghz(n):
    qc = QuantumCircuit(n); qc.h(0)
    for k in range(n - 1): qc.cx(k, k + 1)
    return qc

probs = ghz(4).probabilities()                              # Tier-1 exact checks
assert set(probs) == {"0000", "1111"}, probs                # only all-0 / all-1
assert all(abs(p - 0.5) < 1e-9 for p in probs.values())     # 50/50
print("GHZ invariants: PASS")

good = QuantumCircuit(2); good.h(0); good.cx(0, 1)          # Phi+
bad  = QuantumCircuit(2); bad.h(0);  bad.cx(0, 1); bad.z(0)  # Phi- imposter (stray Z)
same_histogram = good.probabilities() == bad.probabilities()
differ_in_state = not np.allclose(good.statevector(), bad.statevector())
print("Phi+/Phi- same histogram:", same_histogram, "| statevector differs:", differ_in_state)
print("-> a counts-only test would PASS the buggy circuit. Assert on the statevector.")
```

The GHZ assertions pass silently (the reward for correct code is nothing happening), and the imposter check prints `True | True`: identical histograms, different states. That's the whole philosophy of testing quantum code — *many exact, phase‑aware checks* catch the bugs histograms can't see, and they run themselves on every commit. The suite is your Module‑5 referee, hired full‑time.

```quiz
{"q":"A statistical test asserts counts['00']/shots > 0.49 at 1000 shots, unseeded, and fails ~once a week. The professional fix is:","options":["Rerun until green","Delete the test","Seed the simulator AND widen the tolerance to ~4-5 standard errors (or convert to an exact Statevector test)","Increase to 1 million shots"],"answer":2,"why":"0.49 sits ~0.6 SE from the true 0.5 — a coin-flip failure rate by design. Seeds make it deterministic; SE-based tolerances make it meaningful; exact mode sidesteps sampling entirely for logic checks."}
```

## 3. Git — the lab notebook that can't lie

Version control is non-negotiable vocabulary. The daily loop is four commands:

```bash
git init                                # once per project
git add -A && git commit -m "msg"       # snapshot (many times daily)
git log --oneline                       # history
git diff                                # what changed since last snapshot
```

Commit-message craft (screened in hiring more than people admit): imperative mood, *why* over *what* — `"Pin qubit line 56-59 after Monday layout regression"` beats `"fixed stuff"`. Branch for experiments (`git checkout -b try-tree-ghz`), merge what works, delete what doesn't — branches make failed experiments free.

Quantum-specific Git rules:

- **Never commit credentials.** Your IBM token lives in the config `save_account` wrote, never in code. Add a pre-commit scan or at minimum grep before pushing. A leaked token = strangers spending your QPU minutes (and on paid plans, your money).
- **Commit result *manifests* (small JSON: job IDs, metadata, summary numbers), not gigabyte dumps.** Job IDs + code commit = full reproducibility; IBM stores the raw results.
- **Tag analysis-generating commits** (`git tag bell-paper-v1`): "which code produced this figure?" must always have an answer — that's what *reproducible* means, and reviewers (academic or corporate) will ask.

Push to GitHub: your repo IS your portfolio (Module 11 formalizes this). A recruiter clicking your profile should find: README with plots and honest error bars, tests passing badge, clean history. That artifact outweighs certificates.

## 4. Environments & reproducibility — the "works on my machine" vaccine

Pin what matters:

```toml
# pyproject.toml (excerpt)
[project]
dependencies = [
  "qiskit>=2.1,<3",
  "qiskit-aer>=0.15",
  "qiskit-ibm-runtime>=0.34",
  "numpy>=1.26", "matplotlib>=3.8",
]
```

The reproducibility checklist for any result you'd defend: code commit hash; package versions (`pip freeze > results/versions.txt` alongside each manifest); all seeds (simulator, transpiler); backend name + calibration timestamp; shots. Six lines of metadata; the difference between *science* and *anecdote*. Qiskit's ~2 releases/year with real API evolution (you've seen the V1→V2 rubble in old tutorials) makes version-pinning survival, not pedantry.

## Worked example — promoting a notebook discovery into the library, full ritual

*Monday's notebook found that the tree-GHZ beats chain-GHZ on the fake backend for n ≤ 8. Promote it.*

**1. Extract** — move `ghz_log` from notebook to `src/qbench/circuits.py`, add the docstring costs ("depth ⌈log₂n⌉+1; long-range CNOTs — may route poorly on heavy-hex").

**2. Test** — equivalence to chain version (`Statevector.equiv`, n = 2..8 parametrized), depth assertion (`ghz_log(8).depth() <= 4`), input validation.

**3. Benchmark honestly** — a script in `notebooks/` promoted to `src/qbench/benchmarks.py`: both variants × fake backend × seeded transpile level 3, reporting 2q counts and sampled fidelity proxy with ±2SE. Results land in `results/ghz_variants.json` + one committed PNG.

**4. Document** — README gains three lines and the plot: *"Tree-GHZ halves depth but routing on heavy-hex erases the advantage beyond n≈6 (see fig); default remains chain; revisit per-backend."* — an honest, qualified conclusion with evidence attached.

**5. Commit** — `git commit -m "Add ghz_log + benchmark: tree wins n<=6 on Sherbrooke-like maps"`, tag if the plot feeds a report.

Thirty minutes, and Monday's ephemeral insight is now: tested, versioned, benchmarked, documented, and *findable by future-you*. Multiply by fifty weeks and compare against a year of orphaned notebooks — that's the compounding that CVs can't fake and interviews detect in minutes.

## Gotchas

- **Testing only histograms.** The Φ⁻ imposter passes every counts test (simulation lesson). Every preparer gets one `Statevector.equiv` (phase-aware) test. Non-negotiable.
- **Unseeded statistical tests.** A test that fails one run in twenty poisons CI trust ("just rerun it") and then masks real failures. Seed, tolerance at 4–5 SE, or promote to exact mode.
- **Notebooks as production.** Notebooks hide execution-order bugs (cell 7 ran before cell 3), resist diffing, and rot. Explore in notebooks; ship in modules; the promotion ritual is the boundary.
- **Committing tokens/credentials.** Career-relevantly bad. `save_account` config + `.gitignore` + a paranoid grep before first push. If leaked: regenerate the token immediately (deleting the commit is not enough — Git history remembers).
- **Pinning nothing (or everything).** Nothing → next `pip install` breaks you silently. Everything exactly (`==` all transitive deps) → security updates never arrive and installs break across platforms. Pin direct deps with compatible ranges; freeze exact versions per-result in the manifest.
- **Results without provenance.** A figure whose generating commit/seeds/backend are unknown cannot be defended, extended, or debugged — only re-done. The six-line metadata habit costs seconds; its absence costs weeks.

## Scenario — the take-home that hires itself

Real quantum-industry take-home format: *"Implement X (some 2–3 circuit task), characterize it on a noisy simulator, submit within a week."* Two candidates implement identical physics. Candidate A ships one notebook: correct, plots inline, no tests, versions unknown. Candidate B ships a repo: `src/` with pure circuit + analysis modules, seven pytest tests (one catching the Φ⁻ class of bug — mentioned in the README), a seeded benchmark script, README with error-barred plots and an honest limitations paragraph ("results vary ±3% across fake-backend calibrations; real-hardware validation pending"), pinned deps, and eleven commits telling a coherent story. B's physics is *identical* — but B demonstrated they can be handed production access on day one. The hiring meeting takes four minutes. This is not hypothetical; it is the standard shape of the decision, and everything B did is this lesson executed once, calmly, in about ninety extra minutes.

## Key points

- Structure: pure core (`circuits`, `analysis` — no I/O), dirty edges (`runners`), tests beside them, notebooks as staging, results with manifests. The layout IS the maintainability.
- Test hierarchy: many exact (Statevector/Operator equiv — phase-aware!), few statistical (seeded, 4–5 SE tolerances), one contract canary (fake backend). `pytest -q` on every change.
- Git daily: small commits with *why*-messages; branches for experiments; tags for figure-generating commits; job manifests over data dumps; credentials never, anywhere, once.
- Reproducibility = commit + versions + seeds + backend/calibration + shots, attached to every result. Six lines; science vs anecdote.
- The promotion ritual (notebook → module + tests + benchmark + README line + commit) converts insights into compounding assets.
- Your GitHub repo is the portfolio artifact that outranks certificates — build it as if the recruiter reads it, because the recruiter reads it.

## Check yourself

```quiz
{"q":"Which test suite catches a preparer that emits Φ⁻ instead of Φ⁺?","options":["10,000-shot counts test asserting ~50/50 on '00'/'11'","Any test using measure_all()","A Statevector.equiv test against the explicit Φ⁺ target (or an X-basis correlation test)","A depth() regression test"],"answer":2,"why":"The two states share identical Z-histograms; only amplitude-level (phase-aware) comparison or a second-basis measurement separates them. Histogram tests are necessary, never sufficient — the recurring law, now in CI."}
```

## Exercises

**Exercise 1 — build the skeleton, for real.** Create the `quantum-bench` structure on your machine: the four `src/qbench` modules (move your accumulated helpers — `counts_to_probs`, `prob_se`, `preflight`, preparers — into their proper homes), a `tests/` with ≥ 6 tests spanning tiers 1–2, `pyproject.toml`/`requirements.txt`, `.gitignore`, `git init` + first commits. Deliverable: `pytest -q` output all-green, `git log --oneline` showing ≥ 3 meaningful commits.

````solution
Model checkpoints (structure over specifics):

```bash
mkdir -p quantum-bench/src/qbench quantum-bench/tests quantum-bench/{notebooks,results}
cd quantum-bench && git init
```

`src/qbench/circuits.py`: `bell()`, `ghz(n)`, `ghz_log(n)` — pure, validated, docstring'd costs. `analysis.py`: `counts_to_probs`, `prob_se`, `compare_outcome`, `marginal` — with the `.get(bits, 0)` zero-safety throughout. `runners.py`: `preflight(...)` from the simulation lesson + an Aer convenience wrapper (all imports of Aer/runtime isolated HERE). `metadata.py`: a `@dataclass TranspileRecord` with the seven fields from the transpilation lesson.

Six-test minimum: bell equiv (exact), ghz parametrized support (exact), inverse-is-identity (exact), ghz(1) raises (contract), analysis vs hand-computed case `{"00":75,"11":25}` (exact), one seeded 10k-shot statistical test with a 5-SE tolerance.

```bash
pip install pytest && pytest -q          # ......  6 passed
git add -A && git commit -m "Scaffold qbench: pure core + tests"
git commit -am "Move course helpers into analysis.py with zero-count safety"
git commit -am "Add preflight runner + transpile metadata record"
```

Self-grade on the invisible criteria: does any `src/` module import Aer outside `runners.py`? (Should be no — purity boundary.) Does any test depend on network? (No.) Could a stranger run `pip install -e . && pytest` from the README alone? (That sentence IS the README's job.) This repo is not an exercise artifact — it's the literal seed of your Module 11 capstone portfolio; everything from here on gets committed into it.
````

**Exercise 2 — write the failing test first.** Practice test-driven development on a real subtlety: write a test `test_measure_all_register_name` asserting that results from a `measure_all()` circuit are accessible under `.data.meas` — *before* writing the runner helper `get_counts_any(result_pub)` that returns counts regardless of register naming (meas / explicit / multiple). Then implement until green, and add the docstring documenting the three register cases.

````solution
```python
# tests/test_runners.py — written FIRST, watched fail
from qiskit import QuantumCircuit, ClassicalRegister, QuantumRegister
from qiskit_aer.primitives import SamplerV2
from qbench.runners import get_counts_any

def _run(qc):
    from qiskit import transpile
    from qiskit_aer import AerSimulator
    sampler = SamplerV2(seed=7)
    return sampler.run([(transpile(qc, AerSimulator()),)], shots=100).result()[0]

def test_counts_from_measure_all():
    qc = QuantumCircuit(1); qc.x(0); qc.measure_all()
    assert get_counts_any(_run(qc)) == {"1": 100}

def test_counts_from_named_register():
    qr, cr = QuantumRegister(1), ClassicalRegister(1, "syndrome")
    qc = QuantumCircuit(qr, cr); qc.x(0); qc.measure(0, 0)
    assert get_counts_any(_run(qc)) == {"1": 100}
```

```python
# src/qbench/runners.py — implemented SECOND, until green
def get_counts_any(pub_result):
    """Counts from a SamplerV2 PUB result regardless of register naming.

    Handles: (1) measure_all's auto-register 'meas'; (2) a single explicitly
    named register; (3) multiple registers — merged with space-joined keys,
    matching Qiskit's classic convention (documented so nobody 'fixes' it).
    """
    data = pub_result.data
    regs = [name for name in data.__dict__ if not name.startswith("_")]
    if len(regs) == 1:
        return getattr(data, regs[0]).get_counts()
    # multiple registers: merge per-shot strings, most-recently-added leftmost
    bits_lists = [getattr(data, r).get_bitstrings() for r in reversed(regs)]
    merged = {}
    for shot_parts in zip(*bits_lists):
        key = " ".join(shot_parts)
        merged[key] = merged.get(key, 0) + 1
    return merged
```

Why TDD specifically here: the register-naming trap is *remembered pain* (real-hardware lesson gotcha) — encoding it as a test means the pain can never recur silently, for you or any teammate. That's the deeper point of test-writing: tests are institutional memory. The failing-first step proves the test can fail (a test that never failed is a test you can't trust), and the docstring's "documented so nobody fixes it" line is battle-earned API-design communication. Commit both with the message: `"Add register-agnostic counts access; regression-locks the .meas naming trap"`.
````

## Practice questions

1. Why does `analysis.py` importing `qiskit_ibm_runtime` violate the architecture, and what breaks downstream?
2. Give the four-command daily Git loop and one quantum-specific `.gitignore` entry beyond the Python defaults.
3. Your statistical test tolerance: how many SE for a suite of 200 tests run 50×/day, if you want < 1 false failure/month? (Ballpark via the normal tail: 4σ ≈ 3×10⁻⁵.)
4. What belongs in a result manifest vs what stays server-side at IBM?
5. A collaborator can't reproduce your figure. List the five provenance items you check, in order of likelihood.
6. When is it correct for a notebook to stay a notebook forever?
7. **Design question:** write the CONTRIBUTING.md bullet list (≤ 10 bullets) for your repo that would keep a new teammate from committing each of this lesson's six gotchas.

````solution
1. It couples pure statistics to a networked, versioned, credentialed dependency: tests now need the package (and possibly auth) to run, CI slows/flakes, and the module can't be reused in non-IBM contexts. Purity boundary = testability boundary.
2. `add/commit/log/diff`; ignore entries: `.venv/`, `results/*.raw/`, and any `*token*`/credentials pattern (belt-and-suspenders beyond the config-file storage).
3. 200×50×30 = 300k assertions/month; need failure prob ≲ 3×10⁻⁶ per assertion → ~4.5–5σ. Hence the "4–5 SE" house rule — now derived, not asserted.
4. Manifest: job IDs, backend+calibration timestamp, shots, seeds, layout/2q metadata, summary statistics, code commit. Server-side: full raw results (retrievable by ID). Commit meaning, reference bulk.
5. Package versions → seeds (simulator AND transpiler) → code commit actually checked out → backend/calibration drift (if hardware) → data file provenance (which manifest fed the plot).
6. When it's genuinely exploratory narrative (a dated lab-diary entry) whose value is the *record of thinking*, not reusable machinery — and nothing downstream imports it.
7. Model bullets: (1) circuits/analysis stay I/O-free — runtime imports only in runners; (2) every preparer lands with a Statevector.equiv test; (3) statistical tests: seeded + ≥4 SE tolerance, else exact-mode; (4) no credentials anywhere — token via save_account only, grep before push; (5) notebooks don't get imported — promote via the ritual; (6) every hardware submission through `run_hardware` (which writes the manifest); (7) results PRs include commit-hash + versions in the manifest; (8) pin direct deps with ranges, freeze per-result; (9) commit messages say *why*, imperative mood; (10) figures reference their generating tag. Ten fences, six gotchas covered with margin — and notice the list is really this lesson compressed to policy, which is what senior engineers *do* with lessons.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Lay out a repo with a pure core (circuits, analysis) and dirty edges (runners).
- ☐ Write exact, statistical, and contract tests, and say why exact ones dominate.
- ☐ Run the live cell and explain why a counts test misses a phase imposter.
- ☐ Use the daily Git loop and never commit credentials.
- ☐ Attach six‑line provenance (commit, versions, seeds, backend, shots) to a result.
- ☐ Run the promotion ritual: notebook → module + tests + benchmark + README + commit.
