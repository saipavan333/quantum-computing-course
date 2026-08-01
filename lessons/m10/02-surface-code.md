# The surface code & logical qubits

The surface code is the error‑correcting code the entire industry is betting on — IBM, Google, and most superconducting roadmaps build toward it. It's the reason "millions of physical qubits" appears in Shor resource estimates (Module 8), the code Google's Willow chip demonstrated below‑threshold (Module 0), and the practical realization of last lesson's stabilizer theory. Understanding its structure — the qubit lattice, code distance, threshold, and the physical‑to‑logical overhead arithmetic — lets you read hardware roadmaps critically and speak credibly about the timeline to fault tolerance. This is core knowledge for QEC and hardware‑adjacent roles.

## Start here — the intuition

Three ideas carry this lesson. **The surface code won on engineering, not elegance:** it needs only nearest‑neighbor gates on a 2D grid, has the most forgiving known threshold (~1%), and every parity check is local (four neighbors) — so it's *buildable* on real superconducting chips, and buildable beats efficient. **Code distance $d$ is a dial you turn:** make the lattice bigger and, *below threshold*, the logical error rate falls *exponentially* in $d$ — you buy as much reliability as you need with more qubits. **The cost is quadratic and explodes near threshold:** each logical qubit costs about $2d^2$ physical ones, and $d$ blows up as your physical error approaches the ~1% threshold — which is exactly why the whole industry is really running a *fidelity* race.

Carry one translation above all: **physical qubits ÷ (hundreds to thousands) = logical qubits.** Every "1000‑qubit" headline must be divided down to the logical number that actually matters, and being the person who does that division is a genuinely paid skill.

## Why it won, and how it's built

The 9‑qubit Shor code works but needs awkward long‑range operations. The surface code instead lays physical qubits on a 2D checkerboard in two roles: **data qubits** hold the encoded information, and **measure/ancilla qubits** each read a 4‑qubit stabilizer of their neighbors. Two check types alternate — **Z‑checks** ($Z_1Z_2Z_3Z_4$, catch X errors) and **X‑checks** ($X_1X_2X_3X_4$, catch Z errors) — so together they catch everything (last lesson's "correct X and Z ⇒ correct all"). Every stabilizer is weight‑4 and local, so syndrome extraction is one small circuit tiled across the chip and repeated every cycle. A single error lights up a *pair* of syndrome defects, an error *chain* lights up defects only at its endpoints, and the decoder's job is to infer the chain from the lit endpoints.

@@diagram:surface-code|The surface code lattice: data qubits (dots) and measure qubits (X-checks and Z-checks) in a checkerboard. Every stabilizer is a local 4-qubit parity. An error creates a pair of syndrome 'defects'; the decoder pairs them up.

@@widget

## Predict, then run — the overhead that explodes at threshold

Below threshold, a simple model for the logical error rate is $p_L \approx 0.1\,(p/p_{th})^{(d+1)/2}$ with $p_{th}\approx1\%$. Invert it for the distance $d$ that hits a target reliability, then count qubits as $2d^2$ per logical. The cell tabulates the overhead and sizes a Shor machine.

**Predict first.** As physical error climbs from 0.1% toward the ~1% threshold, does the qubit cost per logical qubit rise *gently* or *explode*? And roughly how many physical qubits does breaking RSA‑2048 (4,000 logical qubits) take — thousands, millions, or billions? Guess, then Run.

```run
# Live cell — surface-code overhead: distance d dials logical error down, but cost is ~2d^2 and blows up near threshold.
import math
p_th = 0.01
def distance_for(p, target):                 # simple model: p_L ~ 0.1*(p/p_th)^((d+1)/2)
    if p >= p_th: return None                 # at/above threshold, no finite code works
    d = 2*(math.log10(target) + 1)/math.log10(p/p_th) - 1
    d = math.ceil(d);  d += (d % 2 == 0)      # round up to the nearest odd distance
    return max(d, 3)

print(f"{'phys err':>9}{'distance d':>12}{'phys/logical ~2d^2':>20}")
for p in (0.001, 0.003, 0.005, 0.008):
    d = distance_for(p, 1e-12)
    print(f"{p:>9.3f}{d:>12}{2*d*d:>20}")

d = distance_for(0.001, 1e-15)               # Shor on RSA-2048: 4000 logical qubits
print(f"\nShor RSA-2048: d={d}, physical = 4000 * 2d^2 = {4000*2*d*d:,} (+ ~2x for distillation)")
```

The overhead per logical qubit rockets from ~880 at 0.1% error to ~100,000 near the threshold — a hundred‑fold explosion for less than a ten‑fold change in physical error, because $d$ diverges as $p\to p_{th}$. And Shor sizes to ~5.8 million physical qubits (before magic‑state distillation roughly doubles it) — *that's* where "millions" comes from, and it's just $4000\times2d^2$, every term of which you now understand. The strategic punchline is in the levers: halving physical error shrinks $d$, and since qubits go as $2d^2$, the machine shrinks *quadratically*. The roadmap is a fidelity roadmap.

```quiz
{"q":"A chip has 2000 physical qubits at 0.5% two-qubit error (below the surface-code threshold). Roughly how many useful logical qubits?","options":["2000 — each physical qubit is a logical qubit","A small handful (~2-4) — at ~2d² physical qubits per logical qubit for a useful distance, 2000 physical qubits yields only a few logical ones","1000 — half are ancillas","Zero — surface codes need millions"],"answer":1,"why":"Physical ÷ (~2d²) = logical. At a useful distance (hundreds of physical per logical), 2000 qubits is only a few logical qubits. This physical-to-logical translation is THE number that matters and the one headlines omit."}
```

## Level up — distance is the protection dial

The **code distance** $d$ is the length of the shortest error chain that causes a *logical* error — one spanning the lattice between opposite boundaries, undetectable because it commutes with every stabilizer yet flips the logical qubit. A distance‑$d$ code corrects up to $\lfloor(d-1)/2\rfloor$ errors, costs ~$2d^2$ physical qubits per logical, and below threshold suppresses logical error exponentially, $p_L\sim(p/p_{th})^{d/2}$. That exponential is the whole game: if $p<p_{th}$, every increase in $d$ buys exponentially more reliability, so you dial in whatever the algorithm needs (Shor wants $p_L\sim10^{-15}$). Above threshold, growing $d$ makes things *worse* — the threshold curve from last lesson, now with a tunable knob.

## Level up — decoding is a real-time classical problem

Turning lit defects into a correction is the **decoding** problem, and it runs live alongside the quantum computer. The standard baseline is **minimum‑weight perfect matching** (pair defects along shortest paths — the likeliest local error); Union‑Find, neural‑network, and tensor‑network decoders trade accuracy for speed. The catch: the decoder must finish *faster than the ~1 μs syndrome cycle*, a brutal real‑time constraint and an active field ("quantum decoding engineer" is a real job). This is a genuine on‑ramp for software engineers — graph algorithms and ML entering quantum directly. The industry stack to name in interviews: **Stim** (fast stabilizer simulation) and **PyMatching** (MWPM decoding).

## Level up — reading roadmaps and sizing Shor

Now the headlines decode themselves. "1000 physical qubits" ÷ hundreds‑to‑thousands per logical ≈ a *handful* of logical qubits at best. "Below threshold" (Willow) means growing $d$ finally *reduces* logical error — the precondition for scaling, achieved, still far from scale. "Fault‑tolerant by 2029" (IBM Starling) targets ~200 logical qubits and needs the overhead arithmetic to become manufacturable. The Shor sizing from the live cell — $4000\times2(27)^2\approx5.8$M physical, doubled by distillation to ~10M — matches Module 8's sober table, and its levers are explicit: better fidelity → smaller $d$ → quadratically fewer qubits. Converting "physical qubit" headlines into "logical qubit" reality *is* the literacy that makes you useful in strategy and investment conversations.

## Level up — gotchas the pros watch for

- **Confusing physical and logical qubits.** A "156‑qubit" chip has *zero* fully error‑corrected logical qubits today; logical = physical ÷ (hundreds–thousands).
- **Assuming more qubits always help.** Growing $d$ suppresses errors only *below threshold*; above it, a bigger code is worse.
- **Ignoring the time dimension.** Syndromes are re‑measured every ~1 μs and decoded in real time — a continuous process, not a static encoding.
- **Forgetting distillation overhead.** The $2d^2$ figure is memory only; fault‑tolerant T gates need magic‑state factories that often double the count.
- **Treating decoding as solved.** Real‑time decoding at scale is an open engineering problem, not a lookup table.
- **Threshold as one universal number.** "~1%" depends on the noise model, gate set, and decoder — a regime, not a magic constant.

## Key points

- The surface code won on engineering: nearest‑neighbor 2D gates, high ~1% threshold, local weight‑4 stabilizers — buildable beats efficient.
- Structure: data + measure qubits in a checkerboard; alternating Z‑checks (catch X) and X‑checks (catch Z), each a local 4‑qubit parity re‑measured every cycle.
- Code distance $d$ is the protection dial: corrects $\lfloor(d-1)/2\rfloor$ errors, costs ~$2d^2$ physical/logical, and below threshold suppresses logical error exponentially in $d$.
- Decoding (defects → correction) via MWPM/Union‑Find/ML must beat the ~1 μs syndrome cycle — an active field and a software on‑ramp (Stim + PyMatching).
- Physical ÷ (hundreds–thousands) = logical; below‑threshold (Willow) enables scaling, but the *scale* to useful machines is ~2029–2035+.
- Resource arithmetic: physical ≈ logical × $2d^2$ × distillation; every fidelity gain shrinks the machine quadratically.

## Check yourself

```quiz
{"q":"Why does halving a device's physical error rate dramatically reduce the physical qubits needed per logical qubit?","options":["It doesn't — qubit count is fixed by the algorithm","Lower physical error puts you further below threshold, so a SMALLER distance d hits the target logical error rate — and since qubits scale as ~2d², reducing d cuts the count quadratically","It halves the number of gates","Because fewer ancillas are needed"],"answer":1,"why":"Below threshold, logical error ~ (p/p_th)^(d/2), so lower p reaches the target at smaller d; with qubits ~2d², a smaller d saves quadratically. This is why the roadmap is fundamentally a fidelity race."}
```

## Exercises

**Exercise 1 — the overhead calculator.** Extend the live cell into `surface_code_qubits(logical, p, target)` returning `(d, total_physical)`, and tabulate a 100‑logical‑qubit machine at physical error 0.1%, 0.3%, 0.5%, 0.8% targeting $p_L=10^{-12}$. Explain the shape.

````solution
```python
import math
def distance_for(p, target, p_th=0.01):
    if p >= p_th: return None
    d = 2*(math.log10(target)+1)/math.log10(p/p_th) - 1
    d = math.ceil(d); d += (d % 2 == 0); return max(d, 3)
def surface_code_qubits(logical, p, target=1e-12):
    d = distance_for(p, target); return (d, logical*2*d*d) if d else (None, None)
for p in (0.001, 0.003, 0.005, 0.008):
    d, tot = surface_code_qubits(100, p); print(f"p={p}  d={d}  total={tot:,}")
```
The count is modest far below threshold (~88k for 100 logical at 0.1%) and **diverges toward infinity as $p\to1\%$** — because required $d\propto1/\log(p_{th}/p)$, which blows up at the threshold, and qubits go as $2d^2$. This is why "how far below threshold" matters as much as "below threshold," and why you can tell a room "if they hit 0.3% error this is a 100k‑qubit machine, not a 5‑million one."
````

**Exercise 2 — simulate a distance‑3 surface code (real tools).** Install `stim` and `pymatching`, build a rotated‑memory experiment at distances 3 and 5 across physical error rates, decode, and find where the two curves cross (the threshold).

````solution
```python
# pip install stim pymatching --break-system-packages
import stim, pymatching, numpy as np
def logical_error_rate(distance, p, shots=20000):
    c = stim.Circuit.generated("surface_code:rotated_memory_z", distance=distance, rounds=distance,
        after_clifford_depolarization=p, before_measure_flip_probability=p, after_reset_flip_probability=p)
    det, obs = c.compile_detector_sampler().sample(shots, separate_observables=True)
    m = pymatching.Matching.from_detector_error_model(c.detector_error_model(decompose_errors=True))
    return np.mean(m.decode_batch(det)[:,0] != obs[:,0])
for d in (3, 5):
    print(d, [round(logical_error_rate(d, p), 4) for p in (0.001, 0.005, 0.02)])
```
Below the crossing, $d=5$ beats $d=3$ (bigger code = better — exponential suppression active); above it, $d=5$ is worse. That crossing *is* the threshold (~0.5–1% for this noise model), measured from your own simulation — the same methodology behind Willow's result, and a portfolio centerpiece (Module 11's QEC capstone).
````

## Practice questions

1. Name three engineering properties that made the surface code the industry favorite over the 9‑qubit Shor code.
2. What is code distance $d$, how many errors does it correct, and how does logical error scale with $d$ below threshold?
3. Why does the $\sim2d^2$ overhead explode as physical error approaches threshold?
4. What is the decoding problem, why must it run in real time, and name the standard tool/algorithm.
5. A press release says "500 qubits." What must you know to estimate the *logical* count?
6. Why does "below threshold" (Willow) matter strategically even though the machine is small?
7. **Design question:** advise a startup choosing between technology A (0.3% error, slow 10 μs gates) and B (0.8% error, fast 0.1 μs gates) for a fault‑tolerant machine — analyze qubit overhead, decoder timing, and which you'd bet on, plus the extra data you'd demand.

````solution
1. Nearest‑neighbor 2D gates, high ~1% threshold, and local weight‑4 stabilizers (fixed repeatable syndrome circuit).
2. Shortest logical error‑chain length; corrects $\lfloor(d-1)/2\rfloor$ errors; below threshold $p_L\sim(p/p_{th})^{d/2}$ (exponential in $d$).
3. Required $d\propto1/\log(p_{th}/p)$ diverges as $p\to p_{th}$; with qubits $\sim2d^2$, overhead blows up near threshold and no finite code works at or above it.
4. Inferring the likeliest error from syndrome defects; must beat the ~1 μs syndrome cycle; standard = minimum‑weight perfect matching (PyMatching), with Union‑Find/ML for speed.
5. The two‑qubit fidelity (below threshold?), whether logical error drops with distance, and the target $d$ — then logical ≈ 500/(2d²), usually a small handful or zero.
6. It means growing $d$ now *reduces* logical error — the precondition for scaling; without it, more qubits don't help. It turns "more qubits" into "better qubits."
7. A (0.3%, slow) sits well below threshold → small $d$ (~11) → ~240 physical/logical and a relaxed 10 μs decoder deadline, but a slow logical clock. B (0.8%, fast) is near threshold → large $d$ → thousands per logical and a sub‑0.1 μs decoder deadline (brutal). Bet **A**: near‑threshold operation risks being un‑buildable at scale (overhead diverges) and imposes an unsolved decoder‑latency problem; solidly below threshold beats gate speed when the goal is *reaching* fault tolerance. Demand: B's true threshold under real noise, both technologies' *scaling* fidelity, achievable decoder latency, and connectivity/yield at scale.
````

## Mastery checklist — you are ready to move on when you can

- ☐ List three engineering reasons the surface code won.
- ☐ Describe the data/measure checkerboard and the two stabilizer types.
- ☐ Run the live cell and explain why overhead explodes toward the threshold.
- ☐ Translate a physical‑qubit headline into a logical‑qubit estimate.
- ☐ Explain decoding and why it's a hard real‑time problem (name Stim/PyMatching).
- ☐ Size a fault‑tolerant machine with physical ≈ logical × $2d^2$ × distillation.
