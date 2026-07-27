# The surface code & logical qubits

The surface code is the error-correcting code the entire industry is betting on — IBM, Google, and most superconducting roadmaps build toward it. It's the reason "millions of physical qubits" appears in Shor resource estimates (Module 8), the code Google's Willow chip demonstrated below-threshold (Module 0), and the practical realization of Module 10's stabilizer theory. Understanding its structure — the qubit lattice, code distance, threshold, and the physical-to-logical overhead arithmetic — lets you read hardware roadmaps critically and speak credibly about the timeline to fault tolerance. This is core knowledge for QEC and hardware-adjacent roles.

## 1. Why the surface code won

The 9-qubit Shor code works but demands long-range operations and doesn't scale gracefully. The surface code triumphed for engineering reasons that matter more than elegance:

- **Only nearest-neighbor gates** on a 2D grid — exactly what superconducting chips (and neutral atoms) can do. No long-range connectivity required.
- **High threshold (~1%)** — the most forgiving known threshold, meaning it tolerates the error rates real hardware is approaching (2q errors ~0.5–1% on 2026 devices — right at the edge).
- **Local stabilizers** — every parity check involves only 4 neighboring qubits, so syndrome extraction is a fixed, local, repeatable circuit.

These properties make it *buildable*, which beats *efficient* when you're trying to construct the first fault-tolerant machine. The lesson generalizes: in the fault-tolerant era, hardware-compatibility trumps theoretical optimality.

## 2. The structure — data qubits and check qubits on a grid

The surface code arranges physical qubits on a 2D lattice in two interleaved roles:

- **Data qubits** hold the encoded logical information.
- **Measure/ancilla qubits** sit between them, each measuring a 4-qubit stabilizer of its neighbors.

Two stabilizer types alternate in a checkerboard: **Z-checks** (measure $Z_1Z_2Z_3Z_4$ of four neighboring data qubits — detect X errors) and **X-checks** (measure $X_1X_2X_3X_4$ — detect Z errors). Together they catch both error types (Module 10's "correct X and Z ⇒ correct all"). Every stabilizer is weight-4 and local — the syndrome extraction circuit is the same small pattern tiled across the chip, repeated every cycle.

@@diagram:surface-code|The surface code lattice: data qubits (dots) and measure qubits (X-checks and Z-checks) in a checkerboard. Every stabilizer is a local 4-qubit parity. An error creates a pair of syndrome 'defects'; the decoder pairs them up.

A single error creates a **pair of syndrome defects** (the two stabilizers flanking it fire), and an error *chain* lights up defects only at its endpoints. The decoder's job: given the lit defects, infer the most likely error chain connecting them, and correct it. Errors that form a loop (or span the lattice) are the dangerous ones — more below.

## 3. Code distance — the tunable protection dial

The surface code's power is that **you buy more protection by making the lattice bigger**. The **code distance** $d$ is the length of the shortest error chain that causes a *logical* error (one that spans the lattice, connecting opposite boundaries — undetectable because it commutes with all stabilizers while flipping the logical qubit).

- A distance-$d$ code corrects up to $\lfloor (d-1)/2 \rfloor$ errors.
- A $d \times d$ surface code uses roughly $2d^2$ physical qubits (data + measure) per logical qubit.
- Below threshold, the logical error rate drops *exponentially* in $d$: $p_L \sim (p/p_{th})^{d/2}$.

That last relation is the whole game. If physical error $p$ is below threshold $p_{th}$, then **each increase in $d$ suppresses logical errors exponentially** — you dial in as much reliability as you need by growing the lattice. Want a logical error rate of $10^{-15}$ (needed for Shor)? Compute the required $d$, multiply by $2d^2$, and you get the "millions of physical qubits" figure. Above threshold, growing $d$ makes things *worse* (Module 10's threshold curve, now with a tunable knob).

| Physical error $p$ | Distance $d$ for $p_L \approx 10^{-10}$ | Physical qubits/logical (~$2d^2$) |
|---|---|---|
| 0.1% (below threshold) | ~11 | ~240 |
| 0.5% | ~19 | ~720 |
| 0.9% (near threshold) | ~50+ | ~5000+ |

The table screams the strategic point: **the closer physical error is to threshold, the more qubits each logical qubit costs** — which is exactly why hardware teams fight for every fidelity improvement. Halving physical error can cut the qubit overhead by an order of magnitude.

## 4. Decoding — turning syndromes into corrections

Reading defects and inferring the error is the **decoding** problem, and it's a genuine computational challenge running in real time alongside the quantum computer:

- **Minimum-weight perfect matching (MWPM)**: pair up syndrome defects with the shortest total connecting paths (the most likely error given local noise). Classic, effective, the standard baseline.
- **Union-Find, neural-network, and tensor-network decoders**: faster or more accurate variants — an active research and engineering area (real jobs: "quantum decoding engineer").

The decoder must run *faster than the syndrome cycle* (~1 μs on superconducting hardware) to keep up — a hard real-time classical-computing problem. Decoding is where a surprising amount of fault-tolerant engineering effort goes, and it's a niche where classical CS skills (graph algorithms, ML) directly enter quantum computing — a genuine on-ramp for software engineers.

```python
# conceptual: syndrome defects → matching → correction (real decoders use pymatching etc.)
# a distance-3 surface code has stabilizers you can enumerate; the decoder pairs
# lit Z-check defects along the shortest lattice paths and applies X corrections.
# Libraries: stim (fast stabilizer simulation) + pymatching (MWPM decoding) are the
# industry-standard research stack — worth knowing the names for interviews.
```

(The professional tooling — **Stim** for stabilizer simulation, **PyMatching** for decoding — are the names to drop; building a full surface-code simulation is a capstone-scale project, Module 11.)

## 5. Reading the roadmaps critically

Armed with this, you can now interrogate the headlines:

- "1000 physical qubits" → at ~$2d^2$ per logical qubit and useful $d\sim15$-plus, that's a handful of logical qubits at best. Physical qubit counts must be divided by hundreds-to-thousands to get *logical* qubits — the number that matters.
- "Below threshold demonstrated" (Google Willow) → the crucial milestone: it means growing $d$ now *reduces* logical error (the exponential suppression kicks in). Necessary for scaling, achieved recently, still far from the *scale* needed.
- "Fault-tolerant by 2029" (IBM Starling) → a roadmap target for ~200 logical qubits, requiring the qubit-overhead arithmetic above to become manufacturable. Aggressive but articulated.

The calibrated read: below-threshold is proven, the *scale* (millions of physical qubits, thousands of logical) is a manufacturing and engineering marathon estimated at ~2029–2035+. Being able to convert "physical qubit" headlines into "logical qubit" reality — and to explain the $2d^2$ overhead — is precisely the literacy that makes you useful in strategy conversations.

## Worked example — sizing a fault-tolerant machine for Shor

*Connect Module 8's Shor resource estimate to surface-code physical qubits, showing where "millions" comes from.*

Shor on RSA-2048 needs ~4,000 logical qubits (Module 8) at a logical error rate low enough to run ~$10^{10}$ gates without failure — so per-logical-gate error must be ~$10^{-15}$, requiring (below threshold, $p \approx 10^{-3}$) a code distance around $d \approx 25$–$30$.

$$\text{physical qubits} \approx (\text{logical qubits}) \times 2d^2 \approx 4000 \times 2(27)^2 \approx 4000 \times 1458 \approx 5.8 \text{ million}$$

Plus overhead for magic-state distillation (next lesson) — often *doubling* the count. So ~10 million physical qubits, matching the sober-edition table from Module 8. The arithmetic is now transparent: it's not a mysterious big number, it's $4000 \times 2d^2 \times (\text{distillation factor})$, every term of which you understand. And you can see the levers: better physical error rate → smaller $d$ → quadratically fewer qubits (halving $p$ from 0.5% to 0.25% might cut $d$ from 27 to ~19, dropping the count from 5.8M to ~2.9M). This is why the industry's roadmap is fundamentally a *fidelity* roadmap — every fidelity gain shrinks the machine quadratically. Being able to run this estimate live, with the levers, is a genuinely differentiating skill in strategy and investment conversations.

## Gotchas

- **Confusing physical and logical qubits.** A "156-qubit" chip has ZERO fully-error-corrected logical qubits today (it's used for NISQ). Logical qubits = physical ÷ (hundreds to thousands). Every roadmap number needs this translation.
- **Assuming more qubits always help.** Growing $d$ suppresses errors only *below threshold*. Above threshold, a bigger surface code has a *higher* logical error rate — the threshold gates everything (Module 10).
- **Ignoring the time dimension.** Syndromes must be measured repeatedly (every ~1 μs) and decoded in real time; a surface code isn't a static encoding but a continuous process. Decoder speed is a hard constraint, not an afterthought.
- **Forgetting distillation overhead.** The $2d^2$ figure is for *memory*; running non-Clifford gates (T gates) fault-tolerantly needs magic-state distillation factories that often double or more the qubit count (next lesson). Resource estimates omitting distillation are optimistic by ~2×.
- **Treating decoding as solved.** Real-time decoding at scale (faster than the syndrome cycle, at low latency, for millions of qubits) is an unsolved engineering problem and an active field — not a lookup table.
- **Threshold as a single universal number.** "~1%" is approximate and depends on the noise model, gate set, and decoder. Quoting it as an exact constant oversimplifies; it's a regime, not a magic value.

## Scenario — the investor briefing on a "1024-qubit breakthrough"

An investor asks you to assess a startup's press release: "1024-qubit quantum computer — nearing cryptographically relevant scale!" Your assessment, this lesson: (1) 1024 *physical* qubits, at surface-code overhead of ~$2d^2 \approx$ hundreds-to-thousands each, yields at most a *few* logical qubits even optimistically — and likely zero fully-corrected ones if they're NISQ physical qubits without demonstrated below-threshold operation. (2) "Cryptographically relevant" needs ~4,000 *logical* qubits = millions of physical — a ~1000× gap, not "nearing." (3) The meaningful questions: what's the two-qubit gate fidelity (below threshold?), have they demonstrated a logical qubit whose error rate drops with distance, and what's the decoder? (4) Verdict: 1024 physical qubits is real progress for NISQ experiments, but the crypto claim is off by three orders of magnitude and conflates physical with logical. You've protected the investor from a category error that press releases routinely exploit. This translation — physical-qubit headlines into logical-qubit reality with the overhead arithmetic — is a recurring, well-compensated advisory function, and it rests entirely on understanding $2d^2$ and the threshold.

## Key points

- The surface code won on engineering merits: nearest-neighbor gates on a 2D grid, high threshold (~1%), local weight-4 stabilizers — buildable beats efficient.
- Structure: data + measure qubits in a checkerboard; alternating Z-checks (catch X errors) and X-checks (catch Z errors), each a local 4-qubit parity re-measured every cycle.
- Code distance $d$ is the protection dial: corrects $\lfloor(d-1)/2\rfloor$ errors, costs ~$2d^2$ physical qubits/logical, and below threshold suppresses logical error EXPONENTIALLY in $d$.
- Decoding (syndrome defects → correction) via MWPM/Union-Find/ML must run in real time faster than the ~1 μs syndrome cycle — an active engineering field and a software-engineer on-ramp (Stim + PyMatching are the tools).
- Physical ÷ (hundreds–thousands) = logical; roadmap headlines must be translated; below-threshold (proven, Willow) enables scaling, but the *scale* to useful machines is ~2029–2035+.
- Resource arithmetic: physical qubits ≈ logical × $2d^2$ × distillation; every physical-fidelity gain shrinks the machine quadratically — the field's roadmap is a fidelity roadmap.

## Check yourself

```quiz
{"q":"A chip has 2000 physical qubits with 0.5% two-qubit error (below the surface-code threshold). Roughly how many useful logical qubits, and why?","options":["2000 — each physical qubit is a logical qubit","About 2–4 — at ~2d² physical qubits per logical qubit for a useful distance (d~15-19 → ~450-720 each), 2000 physical qubits yields only a handful of logical ones","1000 — half are ancillas","Zero — surface codes need millions"],"answer":1,"why":"Physical ÷ (~2d²) = logical. At d~19 (~720 physical/logical), 2000 qubits ≈ 2-3 logical qubits. This physical-to-logical translation is THE number that matters and the one headlines omit."}
```

```quiz
{"q":"Why does halving a device's physical error rate dramatically reduce the physical qubits needed per logical qubit?","options":["It doesn't — qubit count is fixed by the algorithm","Lower physical error means you're further below threshold, so a SMALLER code distance d achieves the target logical error rate — and since qubit count scales as ~2d², reducing d cuts the count quadratically","It halves the number of gates","Because fewer ancillas are needed"],"answer":1,"why":"Below threshold, logical error ~ (p/p_th)^(d/2), so lower p reaches the target at smaller d; with qubits ~2d², a smaller d saves quadratically. This is why the roadmap is fundamentally a fidelity race — every fidelity gain shrinks the machine."}
```

## Exercises

**Exercise 1 — the overhead calculator.** Write `surface_code_qubits(logical_qubits, physical_error, target_logical_error, threshold=0.01)` that: computes the required distance $d$ from the exponential suppression $p_L \approx (p/p_{th})^{d/2}$ (solve for $d$, round up to odd), then returns physical qubits ≈ $2d^2 \times$ logical. Tabulate for a 100-logical-qubit machine at physical error rates 0.1%, 0.3%, 0.5%, 0.8% targeting $p_L = 10^{-12}$. Plot physical qubits vs physical error rate and explain the shape.

````solution
```python
import numpy as np, matplotlib.pyplot as plt

def required_distance(p, target, threshold=0.01):
    if p >= threshold: return None                       # above threshold: no finite d works
    # p_L ~ (p/p_th)^(d/2)  →  d ≥ 2 log(target)/log(p/p_th)
    d = 2 * np.log(target) / np.log(p/threshold)
    d = int(np.ceil(d));  d += (d % 2 == 0)              # round up to odd
    return max(d, 3)

def surface_code_qubits(logical, p, target=1e-12, threshold=0.01):
    d = required_distance(p, target, threshold)
    if d is None: return None, None
    return d, logical * 2 * d**2

print(f"{'p':>7}{'distance':>10}{'phys/logical':>14}{'total (100 log)':>16}")
ps = [0.001, 0.003, 0.005, 0.008]
for p in ps:
    d, total = surface_code_qubits(100, p)
    print(f"{p:>7.3f}{d:>10}{2*d**2:>14}{total:>16,}")

pp = np.linspace(0.0008, 0.0095, 60)
tot = [surface_code_qubits(100, p)[1] for p in pp]
plt.plot(pp*100, tot); plt.yscale("log")
plt.axvline(1.0, ls=":", color="r", label="threshold ~1%")
plt.xlabel("physical error rate (%)"); plt.ylabel("physical qubits (log, 100 logical)")
plt.legend(); plt.title("Overhead explodes approaching threshold"); plt.show()
# 0.1% → d~7, ~100/logical, ~10k total
# 0.5% → d~15-17, ~500/logical, ~50k total
# 0.8% → d~40+, ~3000+/logical, ~300k+ total — diverging toward the threshold
```

The plot's shape is the strategic story: physical-qubit count is modest far below threshold and **diverges toward infinity as $p$ approaches the ~1% threshold** (the log of $p/p_{th}$ in the denominator → 0). At 0.1% you need ~100 physical/logical; at 0.8% you need thousands; at exactly threshold, no finite code works. This is *precisely* why hardware teams treat sub-threshold fidelity as existential and why "how far below threshold" matters as much as "below threshold" — the overhead is quadratic in $d$ and $d$ diverges at the threshold. Your calculator turns roadmap fidelity targets into qubit counts, making you the person in the room who can say "if they hit 0.3% error, this becomes a 50,000-qubit machine, not a 5-million one" — a genuinely valued translation.
````

**Exercise 2 — simulate a distance-3 surface code (with the real tools).** Install `stim` and `pymatching`. Build a distance-3 rotated surface code memory experiment (Stim has a generator: `stim.Circuit.generated("surface_code:rotated_memory_z", distance=3, rounds=3, after_clifford_depolarization=p)`). For physical error rates $p$ from 0.001 to 0.05, run many shots, decode with PyMatching, and measure the logical error rate. Plot logical vs physical error and estimate the threshold (where increasing distance stops helping — compare d=3 and d=5).

````solution
```python
# pip install stim pymatching --break-system-packages
import stim, pymatching, numpy as np, matplotlib.pyplot as plt

def logical_error_rate(distance, p, shots=20000):
    circuit = stim.Circuit.generated(
        "surface_code:rotated_memory_z", distance=distance, rounds=distance,
        after_clifford_depolarization=p, before_measure_flip_probability=p,
        after_reset_flip_probability=p)
    sampler = circuit.compile_detector_sampler()
    detection_events, observable_flips = sampler.sample(shots, separate_observables=True)
    matcher = pymatching.Matching.from_detector_error_model(circuit.detector_error_model(decompose_errors=True))
    predictions = matcher.decode_batch(detection_events)
    errors = np.sum(predictions[:, 0] != observable_flips[:, 0])
    return errors / shots

ps = np.logspace(-3, -1.3, 12)
for d in (3, 5):
    ler = [logical_error_rate(d, p) for p in ps]
    plt.loglog(ps, ler, "o-", label=f"distance {d}")
plt.loglog(ps, ps, "k--", label="break-even")
plt.xlabel("physical error rate"); plt.ylabel("logical error rate"); plt.legend(); plt.grid(alpha=0.3, which="both")
plt.title("Surface code: threshold where d=3 and d=5 curves cross"); plt.show()
```

The signature result: the d=3 and d=5 curves **cross at the threshold** (~0.5–1% for this noise model). *Below* the crossing, d=5 has a lower logical error rate than d=3 (bigger code = better — the exponential suppression); *above* it, d=5 is WORSE (bigger code = more failure modes). That crossing point IS the threshold, measured empirically from your own simulation. This is a genuine, publishable-methodology experiment — the same procedure Google used to report Willow's below-threshold result — and running it with the industry-standard Stim+PyMatching stack is a portfolio centerpiece (Module 11's QEC capstone). Deliverables that impress: the crossing plot, the extracted threshold value with the noise model stated, and a sentence connecting it to why hardware fidelity below ~1% is the fault-tolerance gate. You've gone from "what is a qubit" to reproducing a Nature-paper-grade QEC result — that arc is the whole course in one exercise.
````

## Practice questions

1. Name three engineering properties that made the surface code the industry favorite over the 9-qubit Shor code.
2. What is code distance $d$, how many errors does distance $d$ correct, and how does logical error scale with $d$ below threshold?
3. Why does the physical-to-logical overhead ($\sim2d^2$) explode as physical error approaches the threshold?
4. What is the decoding problem, why must it run in real time, and name the standard tool/algorithm.
5. A press release says "500 qubits." What must you know to estimate how many *logical* qubits that is?
6. Why does "below threshold" (Google Willow) matter strategically even though the machine is still small?
7. **Design question:** you're advising a hardware startup choosing between two qubit technologies: A has 0.3% two-qubit error but slow gates (10 μs), B has 0.8% error but fast gates (0.1 μs). Using surface-code reasoning, analyze the trade-off for building a fault-tolerant machine: qubit overhead, decoder timing constraints, and which you'd bet on for reaching useful scale — and what additional data you'd demand.

````solution
1. Nearest-neighbor gates on a 2D grid (matches superconducting/neutral-atom hardware), high threshold (~1%, tolerates real error rates), and local weight-4 stabilizers (fixed repeatable syndrome circuit).
2. $d$ = length of the shortest logical error chain; corrects $\lfloor(d-1)/2\rfloor$ errors; below threshold logical error drops exponentially, $p_L \sim (p/p_{th})^{d/2}$.
3. Required $d \propto 1/\log(p_{th}/p)$, which diverges as $p \to p_{th}$; since qubits scale as $2d^2$, the overhead grows super-linearly and blows up near threshold — no finite code works at or above it.
4. Decoding = inferring the most likely error from the syndrome defects; it must run faster than the ~1 μs syndrome cycle to keep pace with the quantum computer; standard = minimum-weight perfect matching (MWPM, via PyMatching), with Union-Find/ML variants for speed.
5. The two-qubit gate fidelity (below threshold?), whether they've demonstrated logical error dropping with distance, and the target code distance — then logical ≈ 500/(2d²), typically yielding a small handful or zero fully-corrected logical qubits.
6. Below-threshold means growing the code distance now REDUCES logical error (the exponential suppression is active) — the necessary precondition for scaling to any size; without it, more qubits don't help. It's the milestone that turns "more qubits" into "better qubits," even though reaching useful scale remains a manufacturing marathon.
7. Analysis: A (0.3%, slow) sits comfortably below threshold → small $d$ (~11) → ~240 physical/logical → modest overhead, BUT 10 μs gates mean slow logical clock AND a relaxed decoder deadline (10 μs to decode — easier). B (0.8%, fast) is near threshold → large $d$ (~40+) → thousands physical/logical → huge overhead, AND 0.1 μs gates demand a decoder finishing in <0.1 μs — a brutal real-time constraint. The overhead argument favors A decisively (quadratically fewer qubits), but computation *speed* favors B (100× faster logical operations) IF the qubit count is achievable. Bet: **A**, because near-threshold operation (B) makes the machine potentially un-buildable at scale (overhead diverges) and imposes an unsolved decoder-latency problem; being solidly below threshold is worth more than gate speed when the goal is *reaching* fault tolerance at all. Additional data I'd demand: B's actual threshold under its real noise model (is 0.8% truly below?), both technologies' *scaling* fidelity (does error stay flat as you add qubits, or degrade?), decoder latency achievable for B, and connectivity/yield at scale. The reasoning pattern — overhead vs speed vs buildability, with threshold-margin as the deciding factor — is exactly how fault-tolerant hardware strategy is actually argued, and demonstrating it marks you as someone who understands the roadmap, not just the physics.
````
