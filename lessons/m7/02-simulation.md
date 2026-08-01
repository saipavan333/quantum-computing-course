# Simulation: Statevector, Aer & debugging

Simulators are where quantum programs are *developed* — free, instant, noiseless (or noisy on demand), and equipped with a superpower no real QPU has: you can inspect the full quantum state mid-circuit. Professionals do 95% of their work here and spend QPU budget only on validated circuits. This lesson: the two simulation modes (exact vs sampled), the memory wall that defines their limits, and the systematic debugging workflow that separates engineers from guess-and-check hobbyists.

## Start here — the intuition

Three ideas run this lesson. **There are two simulation modes for two jobs:** `Statevector` is a *glass box* — it hands you the exact amplitudes (phases and all), perfect for verifying logic — while `AerSimulator` is a *flight simulator* that returns shot‑based counts like a real QPU and can even add realistic noise. **The wall is memory, not time:** a statevector is $2^n$ complex numbers at 16 bytes each, so every added qubit *doubles* the RAM — laptops die near 30 qubits, and no patience saves a state that doesn't fit. **Histograms can't see phase:** the two Bell states $\Phi^+$ and $\Phi^-$ give *identical* counts, so a counts‑only test passes a circuit with a sign bug — only amplitude‑level checks certify a state.

Carry one workflow: **debug on the free simulator, spend QPU only on validated circuits** — exact logic first, then ideal sampling, then a noisy fake‑backend rehearsal, and only then real hardware.

## 1. Exact simulation — `Statevector`, the glass-box mode

`Statevector` computes the *complete amplitude vector* — the full $2^n$ complex entries — by multiplying your gates into the state exactly (the kron-and-matmul machinery you built by hand, industrialized):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

qc = QuantumCircuit(2)
qc.h(0); qc.cx(0, 1)

sv = Statevector(qc)                       # from |00⟩ through the circuit
print(sv.data)                             # [0.707+0j, 0, 0, 0.707+0j] — raw amplitudes
print(sv.probabilities_dict())             # {'00': 0.5, '11': 0.5}
print(sv.probabilities_dict([0]))          # marginal of qubit 0: {'0': .5, '1': .5}

# glass-box superpowers:
print(sv.inner(Statevector.from_label("00")))   # ⟨00|ψ⟩ = amplitude, directly
mid = Statevector(QuantumCircuit(2))            # start |00⟩ …
mid = mid.evolve(qc)                            # …evolve through circuits step-wise
print(sv.equiv(mid))                            # equality up to global phase
```

What you get: amplitudes (phases included!), exact probabilities, marginals, overlaps, expectation values (`sv.expectation_value(op)`) — with **zero shot noise**. What you pay: memory. No measurement statistics wobble exists here; if two `Statevector` results differ, your *circuits* differ. That certainty is the debugging superpower.

Sibling worth knowing: `Operator(qc)` (the circuit's full unitary — for verifying identities) and `DensityMatrix` (mixed states — Module 9's tool, already cameo'd in teleportation).

## 2. The memory wall — why ~30 qubits is the edge of the world

Each amplitude is a complex128 = 16 bytes. The bill:

| Qubits | Amplitudes | Statevector RAM |
|---|---|---|
| 20 | ~10⁶ | 17 MB |
| 24 | ~1.7×10⁷ | 268 MB |
| 28 | ~2.7×10⁸ | 4.3 GB |
| 30 | ~10⁹ | **17 GB** — laptop's edge |
| 34 | ~1.7×10¹⁰ | 275 GB — big server |
| 40 | ~10¹² | 17 TB — supercomputer territory |
| 50 | ~10¹⁵ | 18 PB — no |

@@diagram:sim-memory-wall|The 16-bytes-per-amplitude bill doubles per qubit: laptops die at ~30, clusters at ~45. The wall is arithmetic, not engineering — and it's why quantum hardware exists.

Every added qubit doubles the bill (tensor-product arithmetic — you derived this). Special-structure escapes exist — Clifford-only circuits simulate in polynomial time (Gottesman–Knill, the single-gates lesson), tensor-network methods exploit low entanglement, and Aer implements several (`method="stabilizer"`, `"matrix_product_state"`) — but for *generic* circuits, the wall stands. This table is simultaneously: why your simulator dies at 30 qubits, why 50+ qubit hardware can't be classically faked, and the honest foundation of every "quantum advantage" conversation. Know three rows by heart (20 → MB, 30 → ~17 GB, 50 → PB).

## 3. Sampled simulation — Aer, the flight simulator

`AerSimulator` mimics what a real QPU *returns*: shot-based counts, no state peeking — plus optional noise. This is your dress rehearsal for hardware:

```python
from qiskit_aer import AerSimulator
from qiskit import QuantumCircuit, transpile

qc = QuantumCircuit(2, 2)
qc.h(0); qc.cx(0, 1)
qc.measure([0, 1], [0, 1])                 # sampled mode NEEDS measurements!

sim = AerSimulator(seed_simulator=42)      # seed = reproducible science
job = sim.run(transpile(qc, sim), shots=4000)
counts = job.result().get_counts()
print(counts)                              # {'00': 2012, '11': 1988} — shot noise is real here
```

The differences from `Statevector`, tabulated — because choosing wrongly wastes afternoons:

| | `Statevector` | `AerSimulator` |
|---|---|---|
| Output | exact amplitudes/probabilities | sampled counts (dict) |
| Measurements in circuit | not needed (ignores them) | **required** (else empty counts) |
| Shot noise | none | yes — Module 3 statistics apply |
| Noise models | no | yes (`from_backend`, custom) |
| Memory | full statevector | full statevector internally (same wall) |
| Role | debug logic, verify math | rehearse the hardware experience |

**Noisy rehearsal** — one import away, and the single best predictor of hardware results:

```python
from qiskit_ibm_runtime.fake_provider import FakeManilaV2   # snapshot of a real device
noisy = AerSimulator.from_backend(FakeManilaV2())
job = noisy.run(transpile(qc, noisy), shots=4000)
print(job.result().get_counts())           # {'00': 1902, '11': 1846, '01': 133, '10': 119}
```

Those `01`/`10` counts — forbidden by the math, delivered by the noise — are your first honest preview of Module 9. Fake backends (calibration snapshots of real IBM devices) make "will this survive hardware?" answerable for free, *before* spending QPU minutes.

@@widget

## Predict, then run — why sampling can't see a phase bug

Real Qiskit above; the in‑browser cell uses the course's lightweight simulator (`.sample(shots)` for counts, `.statevector()` for the glass box). We build $\Phi^+$ and a version with a stray Z ($\Phi^-$), sample both, then peek at the amplitudes.

**Predict first.** $\Phi^+ = (\ket{00}+\ket{11})/\sqrt2$ and $\Phi^- = (\ket{00}-\ket{11})/\sqrt2$ differ only by a sign. Will their 2,000‑shot histograms look the same or different? And will their statevectors? Guess, then Run.

```run
# Live cell — sampling shows only magnitudes; a phase bug hides in an identical histogram.
import numpy as np
good = QuantumCircuit(2); good.h(0); good.cx(0, 1)             # Phi+ = (|00>+|11>)/sqrt2
bug  = QuantumCircuit(2); bug.h(0);  bug.cx(0, 1);  bug.z(0)   # Phi- = (|00>-|11>)/sqrt2  (a stray Z)
print("Phi+ 2000 shots:", good.sample(2000, seed=1))
print("Phi- 2000 shots:", bug.sample(2000, seed=1))           # IDENTICAL histogram
print("Phi+ statevector:", np.round(good.statevector(), 3))
print("Phi- statevector:", np.round(bug.statevector(), 3))    # only the glass box sees the sign
```

The two histograms are *identical* — both ~50/50 on `00` and `11` — so every counts‑based test passes the buggy circuit. The statevectors differ only in the sign of the `11` amplitude, and that sign is exactly what a downstream X‑basis measurement or a teleportation using this pair would get wrong. The rule this burns in: **counts certify magnitudes; only amplitude‑level (or multi‑basis) tests certify states** — every state‑preparation function deserves one `Statevector.equiv` test against an explicit target.

```quiz
{"q":"Your circuit produces Φ⁻ instead of Φ⁺ (a stray Z). Which test catches it?","options":["Counts test: {'00': ~2000, '11': ~2000} at 4000 shots","Any histogram in the computational basis","Statevector(qc).equiv(target) — or an X-basis correlation check","Checking qc.depth()"],"answer":2,"why":"Both Bell states give identical Z-basis histograms — the sign lives in phase. Amplitude-level equality (or a second-basis measurement) is required. Counts tests are necessary, never sufficient."}
```

## 4. The debugging workflow — bisection with a glass box

When a circuit's output is wrong, amateurs re-read code; professionals **bisect state**. The protocol:

1. **Freeze randomness**: seeds on (`seed_simulator=`), shots high or Statevector mode.
2. **Write the expected state at each stage** (hand math or independent NumPy — the referee).
3. **Snapshot mid-circuit**: build partial circuits (or `Statevector.evolve` gate-by-gate) and compare each stage against expectation with `equiv`/`allclose`.
4. **Bisect**: first stage that disagrees contains the bug. Inspect *amplitudes*, not just probabilities — phase bugs hide from histograms (the entire moral of Modules 5–6).
5. **Fix, re-run the FULL comparison suite** (bugs travel in pairs).

```python
def snapshot_debug(build_steps, expected):
    """build_steps: list of (label, fn) mutating a circuit; expected: label → Statevector."""
    from qiskit import QuantumCircuit
    qc = QuantumCircuit(2)
    for label, step in build_steps:
        step(qc)
        actual = Statevector(qc)
        ok = actual.equiv(expected[label]) if label in expected else None
        print(f"{label:>12}: {'✓' if ok else '✗ MISMATCH' if ok is False else '(no ref)'}")
        if ok is False:
            print("   actual:", np.round(actual.data, 4))
            print("   expect:", np.round(expected[label].data, 4))
            return
```

## Worked example — the phase bug that histograms can't see

*Bug report: "my Bell circuit passes all tests but downstream interference is wrong." The circuit: `qc.cx(0,1); qc.h(0)` — someone reversed the H and CNOT.*

**Histogram check** (what their tests did): reversed circuit on $\ket{00}$: CNOT does nothing (control $\ket0$), H makes $\tfrac{1}{\sqrt2}(\ket{00} + \ket{01})$ — counts `{'00': ~.5, '01': ~.5}`… different from Bell's `{'00','11'}`! So actually their *test data* should have caught it — unless (the real story) their test only checked "two outcomes, 50/50" without checking *which* outcomes. Sharpen the example: suppose the bug is `qc.h(0); qc.cz(0,1)` instead of `cx` — output state $\tfrac{1}{\sqrt2}(\ket{00} + \ket{01})$… CZ on $\ket{+}\ket0$ does nothing (target $\ket0$)! Counts: 50/50 on `00`/`01` — again distinguishable. The genuinely invisible case: `qc.h(0); qc.cx(0,1); qc.z(0)` — a stray Z. Output: $\tfrac{1}{\sqrt2}(\ket{00} - \ket{11})$ = $\Phi^-$, not $\Phi^+$. **Histogram: identical** `{'00': .5, '11': .5}`. Every counts-based test passes. Downstream interference (an X-basis check, or teleportation using this pair): silently wrong.

**The glass box catches it in one line:**

```python
good = QuantumCircuit(2); good.h(0); good.cx(0, 1)
bugged = QuantumCircuit(2); bugged.h(0); bugged.cx(0, 1); bugged.z(0)
print(Statevector(bugged).equiv(Statevector(good)))          # False — busted
print(np.round(Statevector(bugged).data, 3))                 # [0.707, 0, 0, -0.707] ← the sign
# and the histogram-level alibi:
print(Statevector(bugged).probabilities_dict())              # {'00': 0.5, '11': 0.5} — "innocent"
```

The professional rule this example burns in: **counts-level tests certify magnitudes; only amplitude-level (or multi-basis) tests certify states.** Every state-preparation function in your library gets one `Statevector.equiv` test against an explicit target — histogram tests are necessary, never sufficient.

## Gotchas

- **Empty counts from Aer.** `AerSimulator` samples *measurements* — a circuit without them returns `{}` (or errors). `Statevector` conversely *ignores* measurements. Match tool to mode.
- **Comparing statevectors with `==` or plain `allclose`.** Global phase makes physically-identical states numerically different. Use `Statevector.equiv` (or compare probabilities AND cross-check one overlap).
- **Forgetting the wall applies to Aer too.** Sampled output doesn't mean cheap simulation — Aer holds the full statevector internally (default method). 32 qubits kills it identically. (Specialized methods — `stabilizer`, `matrix_product_state` — escape for special circuits only.)
- **Unseeded "flaky tests".** Shot noise makes counts wobble (Module 3!); assertions like `counts['00'] == 2000` fail randomly. Seed the simulator AND assert with statistical tolerance (±3·SE), or use exact mode for logic tests.
- **Trusting the noiseless rehearsal.** A circuit scoring 100% on ideal Aer can score 55% on hardware. The fake-backend run is the honest rehearsal; make it a standard pre-hardware gate in your workflow.
- **Debugging by staring at 1024 amplitudes.** Beyond ~5 qubits, raw `sv.data` is noise to human eyes. Use `probabilities_dict()` (sparse, labeled), `sv.inner(target)` (one number), and marginals — query the state, don't read it.

## Scenario — the pre-flight checklist that saved the demo (again)

Friday demo on real hardware; Thursday you run the professional pre-flight: (1) Statevector: logic exact against hand-math ✓; (2) ideal Aer, seeded, 4000 shots: histogram matches Born predictions within 2SE ✓; (3) fake-backend Aer (`from_backend(FakeSherbrooke())`): success metric drops from 0.98 → 0.71 ✗ — below the 0.8 demo threshold. Diagnosis on the free simulator, not the metered QPU: `count_ops` shows 14 CNOTs post-transpile (routing inflated 6 logical CNOTs — next lesson's subject); the fake backend's two-qubit error ~1% × 14 gates ≈ 13% loss, plus readout. Fix options triaged Thursday night: re-map the circuit to a better-connected qubit line (transpilation lesson), or cut one entangling stage (algorithm redesign). You re-map, fake-backend score returns to 0.84, Friday's real run lands 0.82. The QPU bill for debugging: zero. That three-stage pre-flight — exact → ideal-sampled → noisy-sampled — is the industry-standard ladder, and it's now yours.

## Key points

- `Statevector` = glass box: exact amplitudes, overlaps, marginals, `equiv` — no shot noise, full phase visibility; `AerSimulator` = flight simulator: measured counts, seeds, shots, optional realistic noise via `from_backend(FakeX)`.
- The memory wall: 16 bytes × 2ⁿ — MB at 20 qubits, ~17 GB at 30, PB at 50. It bounds both simulators and classical spoofing of quantum hardware.
- Sampled mode needs measurements; exact mode ignores them; both share the wall (default method).
- Debug by state bisection: seed, expected-state per stage, snapshot & `equiv`, first mismatch = bug's home; inspect amplitudes because **histograms can't see phase bugs** (Φ⁺ vs Φ⁻).
- Counts tests certify magnitudes only — every preparer deserves one amplitude-level `equiv` test against an explicit target.
- The pre-hardware ladder: exact → ideal sampled → fake-backend noisy → (only then) QPU. Debugging on the QPU is burning money to read print statements.

## Check yourself

```quiz
{"q":"A teammate plans to 'simulate the 45-qubit version overnight on the lab server (256 GB RAM)'. Your assessment:","options":["Fine — overnight is plenty of time","Impossible as planned: 2⁴⁵ × 16 bytes ≈ 560 TB; time isn't the constraint, memory is — by ~3 orders of magnitude","Possible with more shots","Only possible on Windows"],"answer":1,"why":"The wall is exponential memory: 2⁴⁵ amplitudes ≈ 3.5×10¹³ × 16 B ≈ 0.56 PB. No amount of patience helps a statevector that doesn't fit. Options: shrink the circuit, exploit structure (Clifford/MPS), or use real hardware."}
```

## Exercises

**Exercise 1 — build the pre-flight harness.** Write `preflight(qc_logical, target_sv, backend_fake, success_fn, threshold)` implementing the three-stage ladder: (1) assert `Statevector(qc_logical).equiv(target_sv)`; (2) ideal Aer, seeded, 4000 shots — assert `success_fn(counts)` within 3SE of the exact value; (3) fake-backend run — print the noisy score and PASS/FAIL vs threshold. Demo it on the Bell circuit with `success_fn = P(00) + P(11)` and threshold 0.85.

````solution
```python
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Statevector
from qiskit_aer import AerSimulator

def preflight(qc_logical, target_sv, backend_fake, success_fn, threshold, shots=4000):
    # stage 1 — exact logic
    sv = Statevector(qc_logical)
    assert sv.equiv(target_sv), "logic differs from target state"
    exact = success_fn(sv.probabilities_dict(), exact=True)
    print(f"1) exact logic ✓  (ideal score = {exact:.4f})")

    # stage 2 — ideal sampling
    qc = qc_logical.copy(); qc.measure_all()
    sim = AerSimulator(seed_simulator=7)
    counts = sim.run(transpile(qc, sim), shots=shots).result().get_counts()
    est = success_fn(counts); se = np.sqrt(est*(1-est)/shots)
    assert abs(est - exact) < 3*se + 1e-9, f"ideal sampling off: {est} vs {exact}"
    print(f"2) ideal sampled ✓ ({est:.4f} ± {2*se:.4f})")

    # stage 3 — noisy rehearsal
    noisy = AerSimulator.from_backend(backend_fake)
    ncounts = noisy.run(transpile(qc, noisy), shots=shots).result().get_counts()
    nscore = success_fn(ncounts)
    verdict = "PASS" if nscore >= threshold else "FAIL"
    print(f"3) noisy rehearsal: {nscore:.4f} vs threshold {threshold} → {verdict}")
    return nscore

def bell_success(counts_or_probs, exact=False):
    total = 1.0 if exact else sum(counts_or_probs.values())
    get = lambda k: counts_or_probs.get(k, 0) / total
    return get("00") + get("11")

bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1)
target = Statevector.from_label("00").evolve(bell)

from qiskit_ibm_runtime.fake_provider import FakeManilaV2
preflight(bell, target, FakeManilaV2(), bell_success, 0.85)
# 1) exact logic ✓ (ideal score = 1.0000)
# 2) ideal sampled ✓ (0.9989 ± 0.0010)   [seeded]
# 3) noisy rehearsal: ~0.93–0.96 → PASS   [device-snapshot dependent]
```

Notes that mark professional grade: the success function works on both probability dicts and counts (one definition, two stages); stage-2's assertion uses the *statistical* tolerance (3SE) not a magic number; measurement is added on a COPY (the logical circuit stays Statevector-clean — lesson 1's library policy). Wire this harness into your utils; every hardware run in the rest of the course goes through it.
````

**Exercise 2 — measure the wall, empirically.** Time `Statevector(ghz(n))` for n = 10, 14, 18, 22, 24 (use `time.perf_counter`; reuse `ghz` from last lesson). Plot time vs n on a log scale, fit the doubling visually, and extrapolate: at this machine's rate, what n would take an hour? What n exhausts your RAM first? Which limit binds?

````solution
```python
import time, numpy as np, matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def ghz(n):
    qc = QuantumCircuit(n); qc.h(0)
    for k in range(n-1): qc.cx(k, k+1)
    return qc

ns, ts = [], []
for n in [10, 14, 18, 22, 24]:
    t0 = time.perf_counter()
    Statevector(ghz(n))
    dt = time.perf_counter() - t0
    ns.append(n); ts.append(dt)
    print(f"n={n:>2}  {dt:.4f} s   (~{16*2**n/1e6:.1f} MB state)")

plt.semilogy(ns, ts, "o-"); plt.xlabel("qubits"); plt.ylabel("seconds (log)")
plt.title("Statevector cost doubles per qubit"); plt.grid(alpha=0.3); plt.show()
```

Typical laptop results: ~ms at n=10 rising roughly 2× per qubit through ~1–5 s at n=24 (constants vary; the doubling doesn't). Extrapolation from, say, 2 s @ 24: one hour ≈ 2×2^(n−24) s → n ≈ 24 + log₂(1800) ≈ **35 for an hour**. RAM: 16 GB machine dies at **n ≈ 30** (17 GB state) — RAM binds ~5 qubits before patience does; the crash arrives before the boredom. (GHZ is secretly a Clifford circuit — `method="stabilizer"` would simulate n = 1000 instantly; running that as a bonus and explaining WHY via Gottesman–Knill earns the full professional flourish.) The habit installed: when someone proposes "just simulate it," you now answer with two numbers — GB and hours — computed on a napkin before anyone wastes a weekend.
````

## Practice questions

1. Which tool answers each, cheapest: (a) "is my state exactly $\Phi^+$?" (b) "what histogram will 1000 shots give?" (c) "what will the real ibm_kingston probably return?"
2. Why does `Statevector` ignore measure instructions rather than error on them?
3. Your Aer test asserts `counts['11'] == 500` at 1000 shots and fails randomly. Rewrite the assertion properly (Module 3 arithmetic).
4. Two circuits' statevectors differ by overall −1. `equiv` says True; `np.allclose(sv1.data, sv2.data)` says False. Which do you trust for physics, and when would you nonetheless care about the −1?
5. Estimate: statevector RAM for 33 qubits, and the largest n a 512 GB server handles.
6. Name the two circuit families that escape the wall and the Aer method names that exploit them.
7. **Design question:** your CI budget allows 90 seconds of simulation per commit. Design the test pyramid for a 10-preparer circuit library: which tests run in exact mode vs sampled vs noisy, at what sizes/shots, and what gets pushed to a nightly job. Justify with the wall and shot-noise arithmetic.

````solution
1. (a) `Statevector.equiv` (exact, instant); (b) ideal `AerSimulator` with shots (or exact probabilities + your own binomial reasoning); (c) `AerSimulator.from_backend(FakeKingston-class snapshot)`.
2. Exact mode computes the pre-measurement state — measurement is sampling, a *different mathematical object* (a channel, not a unitary); ignoring lets one circuit serve both modes. (Mid-circuit measurement needs different tools — density matrices/trajectories.)
3. `p̂ = counts['11']/1000; assert abs(p̂ - 0.5) < 3*np.sqrt(0.25/1000)` — i.e. within ±0.047, seeded or not.
4. `equiv` (global phase is unphysical). You care about the −1 only when this circuit becomes a CONTROLLED subroutine — then the phase goes relative (the recurring fine print, now permanent reflex).
5. 2³³ × 16 B = 137 GB; 512 GB handles n = 34 (275 GB) but not 35 (550 GB).
6. Clifford circuits → `method="stabilizer"`; low-entanglement circuits → `method="matrix_product_state"`.
7. Model pyramid: **per-commit (90 s)**: all 10 preparers × `Statevector.equiv` at their smallest meaningful n (≤ 12 qubits — milliseconds each); 3 critical preparers × ideal-sampled smoke test (1000 shots, seeded, 3SE assertions — ~seconds); 1 end-to-end fake-backend run of the flagship circuit at reduced shots (500) with a loose threshold — the canary. **Nightly**: full noisy matrix (all preparers × 2 fake backends × 4000 shots), the n-scaling timing sweep (watching for perf regressions against the wall), and any n > 20 exact checks (GB-scale RAM, minutes each). Justification: exact tests are cheap and catch phase bugs (highest value/second); sampled tests need shots enough that 3SE < the tolerance you assert (1000 shots → ±4.7% — fine for smoke, not for certification, hence nightly's 4000); noisy runs are the slowest and flakiest so they get the fewest per-commit slots but full nightly coverage. Budget arithmetic on display is the point — CI design IS Module 3 + the wall, applied.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Choose `Statevector` (exact logic) vs `AerSimulator` (sampled counts, noise) for the job at hand.
- ☐ Compute statevector RAM as $16\times2^n$ bytes and name where the wall bites (~30 qubits).
- ☐ Run the live cell and explain why $\Phi^+$ and $\Phi^-$ share a histogram but not a statevector.
- ☐ Debug by state bisection: seed, expected state per stage, first mismatch is the bug.
- ☐ Add a noisy fake‑backend rehearsal before spending any QPU time.
- ☐ Name the two circuit families (Clifford, low‑entanglement) that escape the wall.
