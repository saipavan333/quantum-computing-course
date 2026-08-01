# Transpilation: from ideal circuits to ISA circuits

Your circuit says `h(0); cx(0, 7)`. The chip has no H gate, and qubits 0 and 7 aren't connected. **Transpilation** is the compiler pass that bridges that gap — rewriting your ideal circuit into an equivalent one the hardware can physically execute: its native gates, its wiring diagram, hopefully with fewer errors than a naive translation. Since Qiskit 2.x you *must* transpile before running on IBM hardware (primitives accept only "ISA circuits" — Instruction Set Architecture-conformant). Understanding what the transpiler does — and reading what it did — separates people who run circuits from people who can explain their results.

## Start here — the intuition

The compiler faces two hard walls, and everything follows. **The chip speaks only a few native gates** — typically `rz` (free), `sx`, `x`, and one two‑qubit gate (`ecr` or `cz`) — so every H, T, and Toffoli you wrote must be *translated* into those. **The chip's qubits are sparsely wired** (heavy‑hex: 2–3 neighbors each), so a gate between unconnected qubits must be *routed* by SWAP chains — and since a SWAP is 3 two‑qubit gates, distance literally costs fidelity. The transpiler's **layout** (which physical qubits to use) and **routing** (how to connect them) therefore set most of your error budget, and higher optimization levels can *halve* the two‑qubit gate count of the exact same circuit.

Carry one number: **the post‑transpile two‑qubit gate count is your circuit's true price tag.** Log it, compare optimization levels, and seed the transpiler — because on hardware your circuit isn't what you wrote, it's what the transpiler emitted.

## 1. The target: what a real device offers

Interrogate any backend and two constraints define your world:

```python
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke   # 127-qubit snapshot
backend = FakeSherbrooke()
print(backend.operation_names)      # ['ecr', 'id', 'rz', 'sx', 'x', ...] — the BASIS GATES
print(backend.coupling_map)         # [[0,1],[1,2],[2,3],...] — the WIRING
print(backend.num_qubits)           # 127
```

**Basis gates**: this device speaks only `rz` (free — software frame update, the single-gates lesson), `sx` ($\sqrt X$, one physical pulse), `x`, and `ecr` (echoed cross-resonance — its native two-qubit gate; Heron-class chips use `cz` instead). Every H, T, Toffoli, and rotation you wrote must become these — and *only* these.

**Coupling map**: which qubit pairs can host a two-qubit gate. IBM's chips use a **heavy-hex lattice** — most qubits touch only 2–3 neighbors (a deliberate crosstalk-vs-connectivity trade-off). A CNOT between unconnected qubits must be *routed*: SWAP chains moving states adjacent (3 CNOT-equivalents per hop — the cost you predicted in Module 6).

@@diagram:coupling-map|A heavy-hex fragment: qubits are dots, two-qubit gates live only on edges. cx(0,7) with no edge means SWAP chains — each hop costs ~3 native two-qubit gates. Layout choice is error budget.

@@widget

## Predict, then run — routing rests on one identity: SWAP = 3 CNOTs

Real Qiskit above; the in‑browser cell uses the course's lightweight simulator. Routing moves a state between distant qubits using SWAP gates, and each SWAP is *three* CNOTs — that's the whole reason distance costs fidelity. Here we move a state from qubit 0 to qubit 2 with a manual 3‑CNOT SWAP and check it matches preparing it directly on qubit 2.

**Predict first.** After ry(1.1) on qubit 0, then a 3‑CNOT SWAP of qubits 0 and 2, will the resulting distribution match preparing ry(1.1) directly on qubit 2? And how many two‑qubit gates did that one move cost? Guess, then Run.

```run
# Live cell — a SWAP is 3 CNOTs; that is why moving a state across the chip costs gates.
a = QuantumCircuit(3); a.ry(1.1, 0)              # a nontrivial state on qubit 0
a.cx(0, 2); a.cx(2, 0); a.cx(0, 2)               # SWAP q0 <-> q2, built from 3 CNOTs
b = QuantumCircuit(3); b.ry(1.1, 2)              # reference: same state prepared on q2
print("manual SWAP result:", a.probabilities())
print("direct on q2:      ", b.probabilities())  # identical -> the SWAP relocated the state
```

The two distributions match exactly — the 3‑CNOT SWAP genuinely relocated the state from qubit 0 to qubit 2 — and it cost *three* two‑qubit gates to move it one "distance." Now scale that up: a CNOT between qubits several hops apart pays ~3 gates to route in and ~3 to route back, so sparse connectivity is a fidelity tax and choosing a good layout (short routes) is the single biggest lever the transpiler pulls.

```quiz
{"q":"Routing a CNOT between two qubits that are 2 hops apart on the coupling map costs roughly how many native 2-qubit gates, all-in?","options":["1 — distance doesn't matter","~7 — route in (3) + the gate (1) + route back (3), since each SWAP is 3 two-qubit gates","Exactly 2","0 — the transpiler removes it"],"answer":1,"why":"Each SWAP is 3 two-qubit gates. Moving a state 2 hops in, applying the gate, and routing back is ~3+1+3 = 7 — which is why sparse connectivity is a fidelity tax and layout is the biggest lever."}
```

## 2. The pipeline — six stages, two that dominate your results

```python
from qiskit.transpiler import generate_preset_pass_manager

pm = generate_preset_pass_manager(optimization_level=3, backend=backend, seed_transpiler=11)
isa_circuit = pm.run(qc)             # the modern (2.x) idiom — or transpile(qc, backend, ...)
```

@@diagram:transpile-flow|The transpiler pipeline: layout picks physical qubits, routing inserts SWAPs, translation rewrites into basis gates, optimization shrinks the result. Layout + routing decide most of your error budget.

| Stage | Job | Why you care |
|---|---|---|
| **Layout** | map logical qubits → physical qubits | picking well-connected, low-error qubits is the single biggest fidelity lever |
| **Routing** | insert SWAPs for non-adjacent gates | every SWAP ≈ 3 native 2q gates ≈ 3× the errors; stochastic (seed it!) |
| Translation | rewrite into basis gates | your H becomes `rz-sx-rz` (you derived this!) |
| Optimization | cancel/merge/resynthesize | adjacent CX pairs vanish, 1q runs merge; level-dependent aggressiveness |
| Scheduling | (optional) timing, dynamical decoupling | Module 9's mitigation hooks live here |

**Optimization levels** — the dial and its price:

| Level | Effort | Use |
|---|---|---|
| 0 | none — literal translation | debugging the transpiler itself; teaching |
| 1 | light (default) | quick iterations |
| 2 | medium + better layout | good default for real runs |
| 3 | heavy resynthesis | production/hardware runs — earn the extra seconds |

Levels change *results*, not just speed: on real chips, level 3 vs level 0 routinely halves two-qubit-gate counts. Always compare `count_ops()` before/after — the transpiler is a collaborator whose work you review, not an oracle:

```python
qc3 = QuantumCircuit(3)
qc3.h(0); qc3.ccx(0, 1, 2); qc3.h(2)          # one Toffoli, innocently
isa = generate_preset_pass_manager(3, backend=backend).run(qc3)
print("logical:", qc3.count_ops())             # {'h': 2, 'ccx': 1}
print("physical:", isa.count_ops())            # {'rz': ~10+, 'sx': ~8, 'ecr': 6+, ...}
print("2q gates:", sum(v for k, v in isa.count_ops().items() if k in ("ecr", "cz", "cx")))
```

One Toffoli → **6+ native two-qubit gates** (its known minimal decomposition) — plus routing overhead if the three qubits aren't mutually adjacent (on heavy-hex, they never all are). This is why algorithm papers count "CNOT depth" instead of "gates": the two-qubit budget IS the feasibility analysis.

## 3. Reading the output — physical qubits, layout, and your histogram

Transpiled circuits run on *physical* qubits. The layout tells you where your logical qubits went:

```python
print(isa.layout.initial_index_layout())   # e.g. [56, 57, 58, ...] — logical k → physical
```

Two professional consequences: (1) **counts are automatically mapped back** to your logical bit order by the primitives (you read results as if untranspiled — the layout bookkeeping is handled); (2) when *comparing calibration data* (which physical qubit has what error rate) you must speak physical indices. Forcing a layout by hand — `initial_layout=[56, 57, 58]` — is how you pin an experiment to a known-good qubit line, a standard trick when the automatic choice disappoints (and Exercise 2's subject).

Also visible post-transpile: barriers you placed (respected — optimization won't cross them), measurement wiring, and (drawn with `idle_wires=False` to hide the other 120 qubits) the actual pulse-level story your circuit became.

## Worked example — the same circuit, four transpilations

*The experiment every professional runs once and remembers forever: one Bell-pair-plus-flourish circuit, transpiled four ways; count what matters.*

```python
from qiskit import QuantumCircuit
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke

backend = FakeSherbrooke()
qc = QuantumCircuit(4)
qc.h(0)
for k in range(3):
    qc.cx(k, k+1)              # GHZ-4 chain
qc.cx(0, 3)                    # deliberately awkward: 0 and 3 likely not adjacent

rows = []
for lvl in range(4):
    pm = generate_preset_pass_manager(lvl, backend=backend, seed_transpiler=7)
    isa = pm.run(qc)
    two_q = sum(v for k, v in isa.count_ops().items() if k == "ecr")
    rows.append((lvl, isa.depth(), two_q, isa.size()))
print(" lvl  depth  2q  total")
for r in rows:
    print(f"{r[0]:>4} {r[1]:>6} {r[2]:>4} {r[3]:>6}")
#  lvl  depth  2q  total      (typical shape — exact numbers vary by seed/device)
#    0     ~40  ~12   ~60
#    1     ~30   ~9   ~45
#    2     ~24   ~7   ~38
#    3     ~20   ~6   ~32
```

Read the story in the two-qubit column: the naive translation pays ~12 native 2q gates (4 logical CNOTs + routing for the awkward `cx(0,3)`); level 3 finds a layout where the chain sits on adjacent qubits and resynthesis absorbs the flourish — halving the count. At ~1% error per 2q gate, that's the difference between ~88% and ~94% circuit success *before you change a single gate of your algorithm*. The habit: **transpile early, count always, and treat the 2q count as your circuit's true price tag.**

## Gotchas

- **Submitting untranspiled circuits to IBM Runtime.** V2 primitives reject non-ISA circuits outright (`IBMInputValueError`). The `generate_preset_pass_manager(...).run(qc)` step is mandatory plumbing, not optional optimization.
- **Transpiling against the wrong target.** ISA circuits are device-specific: a circuit transpiled for `ibm_torino` (cz-based) won't run on an ecr-based device. Re-transpile per backend; never cache across targets.
- **Unseeded routing = non-reproducible experiments.** Routing is stochastic; two runs of `transpile` can differ by several SWAPs. `seed_transpiler=` in every script that feeds a paper, benchmark, or CI assertion.
- **Comparing logical depth to physical depth.** Your `depth()=5` circuit becoming depth 40 post-transpile is *normal* (basis translation + routing), not a bug. Compare physical-to-physical across options; quote physical numbers in error budgets.
- **Barriers freezing optimization.** That barrier you added "for readability" between two CX gates prevents their cancellation. Audit barriers before blaming the optimizer.
- **Hand-forcing layouts without checking calibration.** `initial_layout` pins qubits — including, if you're careless, yesterday's good qubits that recalibrated badly overnight. Pin by *today's* calibration data (next lesson pulls it), or let level 2–3 choose.

## Scenario — the mysterious Monday regression

Your team's benchmark (fixed circuit, fixed backend, fixed shots) drops from 0.91 to 0.84 fidelity over the weekend. Nothing in the repo changed. The junior instinct: "the device got worse — file a ticket with IBM." Your checklist instead: (1) pull both runs' *transpiled* circuits from the job metadata — Friday's had 9 ecr gates, Monday's has 15; (2) diff the layouts: Friday landed on physical qubits 56–59 (a well-connected line), Monday on 33–36 with one routing detour; (3) root cause: no `seed_transpiler`, plus Monday's calibration shifted the layout scorer's choice. The device is fine; the *compilation lottery* changed. Fixes, in order of professionalism: seed the transpiler for benchmark reproducibility; better — re-transpile each run against fresh calibration but *record* the 2q-count and layout as metadata, normalizing scores by circuit cost; best — pin a calibration-checked layout and alert when its qubits degrade. The meta-lesson: **on real hardware, your circuit is not what you wrote — it's what the transpiler emitted, and results are unexplainable without its metadata.**

## Key points

- Devices offer few basis gates (`rz`—free, `sx`, `x`, + one 2q: `ecr`/`cz`) on a sparse coupling map (heavy-hex: 2–3 neighbors); everything else is compilation.
- Pipeline: layout → routing → translation → optimization (→ scheduling); layout+routing set most of the error budget; SWAP ≈ 3 native 2q gates.
- `generate_preset_pass_manager(level, backend=...)` is the 2.x idiom; ISA circuits are mandatory for IBM Runtime; optimization level 3 for anything that costs money or minutes.
- The two-qubit gate count post-transpile is your circuit's true price; compare levels, seed the transpiler, and log `count_ops()` + layout as experiment metadata.
- One Toffoli ≈ 6+ native 2q gates; logical-vs-physical depth comparisons are category errors.
- Layout is a fidelity lever: automatic at level ≥ 2, hand-pinned (`initial_layout`) when calibration data says you know better.

## Check yourself

```quiz
{"q":"Your logical circuit has 4 CNOTs; the transpiled version has 13 ecr gates. The most likely explanation is:","options":["The transpiler has a bug","Routing: some CNOT pairs weren't adjacent on the coupling map, so SWAP chains (~3 ecr each) were inserted — plus decomposition overhead","ecr gates are one-qubit gates so more are needed","The optimization level was too high"],"answer":1,"why":"Sparse connectivity forces SWAPs at ~3 two-qubit gates per hop. 4 logical CNOTs + ~3 hops of routing ≈ 13. Higher optimization REDUCES the count; the coupling map is what inflates it."}
```

```quiz
{"q":"Why must you re-transpile a circuit when switching from an ecr-based device to a cz-based one?","options":["You don't — ISA circuits are portable","Basis gates differ: an ISA circuit is compiled INTO one device's instruction set and wiring; the other device can't execute foreign instructions or absent couplings","Only the shots parameter changes","cz devices don't support transpilation"],"answer":1,"why":"ISA = that device's Instruction Set Architecture. Different native 2q gate, different coupling map → different compilation. Cache transpiled circuits per-backend, never across."}
```

## Exercises

**Exercise 1 — the routing tax, measured.** Build a 2-qubit Bell circuit and transpile it (level 3, seeded) onto FakeSherbrooke twice: once with `initial_layout=[0, 1]` (adjacent on the map — verify via `backend.coupling_map`) and once with `initial_layout=[0, 6]` (verify non-adjacent). Compare 2q-gate counts and depths, and compute the estimated fidelity ratio at 1% error per 2q gate.

````solution
```python
from qiskit import QuantumCircuit
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke

backend = FakeSherbrooke()
cmap = set(map(tuple, backend.coupling_map))
print((0,1) in cmap or (1,0) in cmap)     # True — adjacent
print((0,6) in cmap or (6,0) in cmap)     # False — routing required

bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1)

for layout in ([0, 1], [0, 6]):
    pm = generate_preset_pass_manager(3, backend=backend,
                                      initial_layout=layout, seed_transpiler=7)
    isa = pm.run(bell)
    twoq = sum(v for k, v in isa.count_ops().items() if k == "ecr")
    print(layout, "→ 2q gates:", twoq, "depth:", isa.depth())
# [0, 1] → 2q gates: 1–2, depth ~8
# [0, 6] → 2q gates: ~7–13 (path-dependent), depth ~30+
```

Fidelity estimate at 1%/2q-gate (Module 1's compounding): adjacent ≈ $0.99^2 \approx 0.98$; routed ≈ $0.99^{10} \approx 0.90$ — the identical *logical* circuit pays an ~8-point fidelity tax for sitting on the wrong qubits. Now you know, quantitatively, why "layout is the biggest lever," and why the transpiler's automatic layout (which would never choose [0,6]) earns its keep. Sanity habit demonstrated: verifying adjacency against the coupling map *before* interpreting the counts.
````

**Exercise 2 — optimization-level shootout on your own algorithm.** Take your `ghz_log(8)` from lesson 1. Transpile at levels 0–3 (seeded) against FakeSherbrooke; tabulate depth, 2q count, total size, and transpile wall-time (`time.perf_counter`). Then answer: which level would you use for (a) a CI logic test on ideal Aer, (b) a real hardware run, (c) debugging a suspected transpiler-induced error — and why?

````solution
```python
import time
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
# (ghz_log from the qiskit-circuits lesson)

backend = FakeSherbrooke()
print("lvl  depth  2q  size   t(s)")
for lvl in range(4):
    t0 = time.perf_counter()
    pm = generate_preset_pass_manager(lvl, backend=backend, seed_transpiler=7)
    isa = pm.run(ghz_log(8))
    dt = time.perf_counter() - t0
    twoq = sum(v for k, v in isa.count_ops().items() if k == "ecr")
    print(f"{lvl:>3} {isa.depth():>6} {twoq:>4} {isa.size():>5}  {dt:>5.2f}")
# typical: lvl0 pays heavy routing (the tree's long-range CNOTs!), lvl3 ~30–50% cheaper
```

Answers with reasoning: (a) **level 0 or 1** — CI on ideal Aer doesn't care about gate counts (no noise), only logic; fastest transpile wins, and lower levels have less machinery to change behavior between Qiskit versions (CI stability). (b) **Level 3, seeded** — every saved ecr is real fidelity; the extra seconds are free next to queue time. (c) **Level 0** — it's the closest to a literal translation; if the bug persists at level 0 the error is yours, if it appears only at level ≥ 2 you've localized a resynthesis/routing interaction (and have a minimal reproducer for a Qiskit issue — which is how actual transpiler bugs get reported, occasionally by people three months into learning, and there is no better line on a junior resume). Bonus observation from the table: the *tree* GHZ — depth-optimal logically — pays MORE routing than the chain on heavy-hex (long-range CNOTs), reversing lesson 1's conclusion on real topology. "It depends on the coupling map" is now a sentence you can prove.
````

## Practice questions

1. Why is `rz` listed in the basis gates yet described as "free"? What implements it?
2. A SWAP costs 3 CNOTs. On an ecr-device, roughly how many ecr gates does a CNOT between qubits two hops apart cost, all-in?
3. What does `isa.layout.initial_index_layout()` tell you, and name one decision it should feed.
4. Your benchmark's results vary run-to-run with identical code and backend. Two transpiler-related causes?
5. Level 3 turned your 12 logical CNOTs into 9 ecr. Explain how *fewer* physical 2q gates than logical is even possible.
6. When would you force `initial_layout`, and what data must you check first?
7. **Design question:** define the "transpilation metadata record" your team attaches to every hardware job: list the fields (≥ 6), which failure investigations each field serves, and where the record is generated in the pre-flight pipeline from the simulation lesson.

````solution
1. It's implemented as a software frame rotation (redefining the phase reference of subsequent pulses) — zero duration, zero error; listed because circuits still must be *expressed* in it.
2. Route in (3) + interact (1) + often route back (3) ≈ 7 — matching Module 6's estimate, now with device vocabulary.
3. The logical→physical qubit mapping; feeds calibration lookups (which physical error rates apply) and cross-run comparisons (same qubits?).
4. Unseeded stochastic routing choosing different SWAP patterns; and calibration-dependent layout scoring shifting the qubit choice between days.
5. Optimization resynthesizes: adjacent CX pairs cancel (self-inverse!), CX+rotations+CX blocks collapse into shorter equivalent sequences (KAK/2q resynthesis), and a good layout eliminates routing that a literal translation would have paid.
6. When you have fresh calibration data identifying a specific high-fidelity qubit line (or need run-to-run comparability on fixed qubits); check TODAY's per-qubit/per-gate error rates and readout errors first — yesterday's heroes recalibrate into villains.
7. Model record: {backend name + calibration timestamp; qiskit + runtime versions; optimization level + seed_transpiler; initial and final layout; count_ops + 2q-gate total + depth (physical); basis gate set; barriers present y/n; transpile wall-time}. Investigations served: score regressions (2q count & layout diff — the Monday scenario), device-vs-compilation attribution (calibration timestamp), reproducibility (seeds/versions), cost drift in CI (counts over time), and support tickets (versions + minimal reproducer). Generated at pre-flight stage 3 (the fake-backend rehearsal) and re-generated at submission — two records, so a rehearsal-vs-reality diff is always available. One dataclass, six investigations, zero "we can't explain Monday" meetings.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Name a device's basis gates and read its coupling map as the wiring constraint.
- ☐ Explain layout and routing and why they set most of the error budget.
- ☐ Run the live cell and explain why a SWAP costs three two‑qubit gates.
- ☐ Pick an optimization level for CI, hardware, and transpiler‑bug hunting.
- ☐ Read `count_ops()` post‑transpile and treat the 2q count as the price tag.
- ☐ Seed the transpiler and log layout/counts as experiment metadata.
