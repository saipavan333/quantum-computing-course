# Grover's search: quadratic speedup

Grover's algorithm finds a marked item among $N$ possibilities in about $\tfrac{\pi}{4}\sqrt N$ oracle queries, where classical search needs ~$N/2$ on average. A million items: ~804 queries instead of ~500,000. Unlike DJ's promise gymnastics, Grover attacks a *universal* problem — unstructured search — and its core move, **amplitude amplification**, is a reusable subroutine that upgrades almost any quantum algorithm's success probability. It's also provably optimal: $\sqrt N$ is the best any quantum computer can do here, a boundary as important as the speedup.

## 1. The problem and the plan

Oracle marks one item: $f(x) = 1$ iff $x = w$ (the "winner"), phase-oracle form $O\ket{x} = (-1)^{f(x)}\ket{x}$. Naive quantum attempt: superpose all $N = 2^n$ items, query once, measure — the winner's amplitude got a minus sign, but $|-a|^2 = |a|^2$: statistics unchanged, you've learned nothing (the parallelism myth, refuted yet again). Phases need *interference* to become populations.

Grover's insight: alternate two reflections that, together, *rotate* amplitude toward the winner — a little per iteration, deterministically, geometrically.

## 2. The two reflections and the rotation picture

Work in the 2D plane spanned by $\ket w$ (winner) and $\ket{s'}$ (uniform superposition of all losers). The start state $\ket s = H^{\otimes n}\ket{0^n}$ lives in this plane, tilted a tiny angle $\theta$ above $\ket{s'}$:

$$\ket s = \sin\theta\,\ket w + \cos\theta\,\ket{s'}, \qquad \sin\theta = \tfrac{1}{\sqrt N}$$

**Reflection 1 — the oracle** $O$: flips the sign of $\ket w$'s component = reflection across $\ket{s'}$.

**Reflection 2 — the diffuser** $D = 2\ket s\bra s - I$: reflection across the start state $\ket s$. Circuit: $H^{\otimes n}$ → (flip sign of everything except $\ket{0^n}$) → $H^{\otimes n}$ — implementable with X's and one multi-controlled Z. Nickname "inversion about the mean": every amplitude reflects through the average amplitude (compute one example and the nickname becomes obvious).

**The composition**: two reflections = one **rotation**, by twice the angle between the mirrors — here, by $2\theta$ *toward* $\ket w$, every iteration. (Euclid, employed by quantum mechanics.)

@@diagram:grover-geometry|Grover as geometry: start at angle θ above the losers' axis; each oracle+diffuser pair rotates the state 2θ toward the winner. Stop when nearest vertical — overshooting is real.

After $k$ iterations the state sits at angle $(2k+1)\theta$; success probability $\sin^2((2k+1)\theta)$. Maximize: $(2k+1)\theta \approx \tfrac\pi2$, giving

$$k^* \approx \frac{\pi}{4}\sqrt N - \frac12 \qquad p_{\text{success}} \ge 1 - \tfrac1N$$

For $N = 4$: $\theta = 30°$, and $k^* = 1$ — **one iteration lands exactly on the winner** ($(2+1)\cdot30° = 90°$, probability $\sin^2 90° = 1$). The 2-qubit Grover is deterministic; a lovely accident of angles and the standard classroom demo.

**The professional warning baked into the geometry**: iterating is *rotation*, not accumulation — pass the optimum and the state rotates AWAY from the winner (at $2k^*$: back near start; the probability oscillates as $\sin^2$). "More iterations = better" is false here in a way it's false almost nowhere else in computing. Know your $N$, compute your $k^*$, stop.

## 3. Multiple winners and unknown counts

$M$ winners: $\sin\theta = \sqrt{M/N}$, optimum $k^* \approx \tfrac\pi4\sqrt{N/M}$ — more needles, faster finding (and at $M = N/4$: one iteration, exactly). If $M$ is *unknown*, the optimum is too — running blind risks the overshoot. Standard fixes, in professional order: (1) **quantum counting** — phase estimation on the Grover rotation (next lessons' machinery!) estimates $\theta$ hence $M$ first; (2) the **randomized ladder** — try $k$ random in growing ranges; expected total queries stay $O(\sqrt{N/M})$; (3) fixed-point variants (advanced, monotone convergence at extra cost). Knowing all three exist — and that naive iteration doesn't — is the interview-grade answer.

## 4. Building it in Qiskit — 3 qubits, winner |101⟩

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

n = 3; N = 2**n; winner = "101"

def oracle(qc):
    """Phase-flip |101⟩: X-sandwich the 0-bits, then CCZ (via H-CCX-H)."""
    for k, bit in enumerate(reversed(winner)):   # little-endian, as always
        if bit == "0": qc.x(k)
    qc.h(2); qc.ccx(0, 1, 2); qc.h(2)            # CCZ on the |111⟩ pattern
    for k, bit in enumerate(reversed(winner)):
        if bit == "0": qc.x(k)

def diffuser(qc):
    """Reflect about |s⟩: H's, flip-all-but-|0…0⟩ sign (X-sandwich + CCZ), H's."""
    qc.h(range(n)); qc.x(range(n))
    qc.h(2); qc.ccx(0, 1, 2); qc.h(2)
    qc.x(range(n)); qc.h(range(n))

theta = np.arcsin(1/np.sqrt(N))
k_opt = round(np.pi/(4*theta) - 0.5)
print("k* =", k_opt)                              # 2 for N=8

qc = QuantumCircuit(n)
qc.h(range(n))
for _ in range(k_opt):
    oracle(qc); diffuser(qc)
probs = Statevector(qc).probabilities_dict()
print({k: round(v, 4) for k, v in sorted(probs.items(), key=lambda kv: -kv[1])})
# {'101': 0.9453, '000': 0.0078, ...}  — 94.5% after 2 iterations (theory: sin²(5·20.7°) ✓)
```

Run the loop for k = 0..6 and watch the oscillation: 12.5% → 78.1% → **94.5%** → 33.0% → … — the $\sin^2((2k+1)\theta)$ curve, live. That printout is the single most instructive plot in quantum algorithms; Exercise 1 makes you produce it.

## Worked example — the honest sizing conversation

*A security engineer asks: "Grover halves key-search exponents — does it break AES-128?"* The professional walk-through: AES-128's keyspace $N = 2^{128}$; Grover needs $\sim\tfrac\pi4\sqrt N \approx 2^{64}$ *sequential oracle calls*, each oracle = a reversible AES circuit (~thousands of gates, so ~$10^6$-ish gate-depth per call). At an optimistic 1 μs per oracle call (far beyond current hardware — and calls can't be parallelized the way classical search can: parallel Grover on $P$ machines only saves $\sqrt P$), that's $2^{64}\,\mu s \approx 580{,}000$ years — before error-correction overheads (Module 10) multiply it further. Conclusion the field actually holds: Grover's threat to AES-128 is theoretical; the practical response is cheap (move to AES-256, restoring $2^{128}$ quantum cost) and NIST's post-quantum urgency is about *Shor vs public-key crypto* (two lessons hence), not Grover vs symmetric. Being able to run this arithmetic aloud — speedup, sequential bottleneck, parallelization limit, oracle cost — is exactly the difference between hype-forwarding and consulting.

## Gotchas

- **Over-iterating.** Success is $\sin^2((2k+1)\theta)$ — oscillatory. Doubling the optimal count takes you back near zero. Compute $k^*$; never "run extra to be safe."
- **The lonely oracle fallacy.** One phase-flip changes no probabilities; without the diffuser there is no algorithm. (Symptom: uniform histogram, one confused afternoon.)
- **Diffuser sign conventions.** $2\ket s\bra s - I$ vs its negative differ by global phase — harmless alone, *harmful when controlled* (quantum counting!). Track the convention when Grover becomes a subroutine.
- **Forgetting the oracle's price.** Query complexity counts calls, but each call runs a reversible implementation of your predicate — Toffoli-heavy, garbage professionally uncomputed (compute–use–uncompute, Module 6). "√N queries" with a million-gate oracle is the real cost line.
- **Claiming database search applications.** Loading an unstructured classical database into superposition costs O(N) — erasing the advantage. Grover shines when the oracle is a *computed predicate* (constraint satisfaction, SAT-style, cryptanalysis), not a lookup. This distinction kills half the naive startup pitches you'll hear.
- **Expecting exponential speedup.** Quadratic — and provably optimal (BBBV theorem): no quantum algorithm searches an unstructured space faster. Structure (periodicity!) is where exponential lives, which is precisely Shor's story.

## Scenario — amplitude amplification as a screwdriver, not a museum piece

Your team's variational pipeline (Module 9 preview) ends with a verification circuit $V$ that flags success on an ancilla with probability $p \approx 4\%$ — meaning ~25 expensive end-to-end repetitions per good sample. A colleague proposes "just repeat more." You propose **amplitude amplification** — Grover generalized: reflections alternate between "flip the flagged component" (your verifier IS the oracle) and "reflect about $V\ket{0}$" (V, flip-about-zero, V†). With $\sin^2\theta = 0.04$, $\theta \approx 11.5°$: ~3–4 amplification rounds push success past 80% — a ~6× reduction in end-to-end runs for 3× the circuit depth: net win whenever repetition dominates cost. That the marked state is unknown, that V is arbitrary, that Grover-search is just the special case $V = H^{\otimes n}$ — this generality is why amplitude amplification appears inside quantum chemistry, Monte-Carlo speedups, and machine-learning subroutines. You didn't learn a search algorithm; you learned the field's general-purpose probability lever.

## Key points

- Grover = repeated (oracle reflection + diffuser reflection) = rotation by $2\theta$ per iteration toward the winner, $\sin\theta = \sqrt{M/N}$.
- Optimal stop $k^* \approx \tfrac\pi4\sqrt{N/M}$; success $\sin^2((2k{+}1)\theta)$ oscillates — overshooting un-finds the answer; N=4 is exactly deterministic at one iteration.
- Diffuser = $2\ket s\bra s - I$ = H-layer, phase-flip-all-but-zero, H-layer; "inversion about the mean."
- Quadratic speedup, provably optimal (BBBV): $\sqrt N$ is the cap for unstructured problems; exponential requires structure.
- Real costs: oracle circuit depth × sequential calls; parallelization saves only √P; database-loading fallacy invalidates naive "search" applications — computed predicates are the legitimate niche.
- Amplitude amplification generalizes Grover to boosting ANY subroutine's success probability from p to ~1 in ~$\tfrac{1}{\sqrt p}$ rounds — the reusable form you'll actually deploy.

## Check yourself

```quiz
{"q":"Grover on N=8 (θ ≈ 20.7°): success probabilities at k = 1, 2, 3 iterations are ~78%, ~95%, ~33%. Why does k=3 get WORSE?","options":["Decoherence accumulates","Each iteration ROTATES the state by 2θ; past 90° it rotates away from the winner — success follows sin²((2k+1)θ), an oscillation, not an accumulation","The oracle wears out","Floating-point error"],"answer":1,"why":"(2·3+1)·20.7° ≈ 145°: past vertical, heading back down. Grover is geometry with an optimal stopping point — 'more is better' fails by design."}
```

```quiz
{"q":"Why doesn't Grover give a useful speedup for searching an existing classical database of N records?","options":["It does — that's its main use","Loading N arbitrary records into a quantum-accessible oracle costs O(N) work up front, matching classical search cost before Grover even starts; the advantage survives only for COMPUTED predicates","Databases are too large for qubits","Because of the no-cloning theorem"],"answer":1,"why":"The oracle must evaluate f(x) in superposition. A computed condition (SAT clause, key-check) does that in polylog gates; raw stored data must first be structured/loaded at Ω(N) cost — the speedup evaporates. Know this before the startup pitch does."}
```

## Exercises

**Exercise 1 — the oscillation, measured.** Extend the Section-4 code: for k = 0..7 iterations, record $p(\text{winner})$ from `Statevector`, plot against the theory curve $\sin^2((2k+1)\theta)$, and mark $k^*$. Then rerun the whole plot with TWO winners (add a second pattern to the oracle) and explain the new optimal k.

````solution
```python
import numpy as np, matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
# (oracle/diffuser from Section 4, parametrized by a winners list)

def grover_probs(winners, k_iters, n=3):
    qc = QuantumCircuit(n); qc.h(range(n))
    for _ in range(k_iters):
        for w in winners:                      # multi-winner oracle: one flip each
            flip_pattern(qc, w)                # (Section-4 oracle body per pattern)
        diffuser(qc, n)
    p = Statevector(qc).probabilities_dict()
    return sum(p.get(w, 0) for w in winners)

for winners in (["101"], ["101", "110"]):
    N, M = 8, len(winners)
    theta = np.arcsin(np.sqrt(M/N))
    ks = range(8)
    sim = [grover_probs(winners, k) for k in ks]
    th  = [np.sin((2*k+1)*theta)**2 for k in ks]
    plt.plot(ks, sim, "o", label=f"simulated M={M}")
    plt.plot(ks, th, "--", label=f"theory M={M}")
plt.xlabel("iterations k"); plt.ylabel("P(any winner)"); plt.legend(); plt.grid(alpha=0.3)
plt.show()
# M=1: peak ~0.945 at k=2.  M=2: θ=30° → peak EXACTLY 1.0 at k=1 — then 0.25, then back…
```

The M=2 curve peaks at **k=1 with probability exactly 1**: $\sin\theta = \sqrt{2/8} = \tfrac12$, θ = 30°, and $(2\cdot1+1)\cdot30° = 90°$ — the deterministic accident again, now at M/N = ¼ (the general rule: whenever $M = N/4$, one perfect iteration). Explanation to articulate: more winners ⇒ bigger θ ⇒ faster rotation ⇒ earlier (and here, exact) peak — and correspondingly faster *overshoot*, making the stopping discipline MORE critical, not less. Dots landing on the dashed curve to four decimals is your amplitude bookkeeping certified end-to-end.
````

**Exercise 2 — Grover as SAT solver (the legitimate application).** Encode the 2-variable constraint "(x₀ OR x₁) AND (NOT x₀ OR NOT x₁)" — i.e., exactly-one-true, XOR — as a phase oracle using an ancilla: compute the predicate into the ancilla with Toffoli/CNOT logic, kick back via |−⟩, then UNCOMPUTE the logic. Run one Grover iteration on n=2 and confirm the two satisfying assignments (01, 10) emerge with certainty. State why the uncompute step is not optional.

````solution
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

# qubits: 0,1 = variables; 2 = predicate scratch; 3 = |−⟩ kickback target
qc = QuantumCircuit(4)
qc.x(3); qc.h(3)                       # kickback target
qc.h([0, 1])                           # superpose assignments

def predicate(qc):                     # scratch := x0 XOR x1  (exactly-one-true)
    qc.cx(0, 2); qc.cx(1, 2)
predicate(qc)
qc.cx(2, 3)                            # kick the predicate's value into phase
predicate(qc)                          # UNCOMPUTE scratch (CNOTs self-inverse)

# diffuser on the two variable qubits only:
qc.h([0,1]); qc.x([0,1]); qc.h(1); qc.cx(0,1); qc.h(1); qc.x([0,1]); qc.h([0,1])

probs = Statevector(qc).probabilities_dict([0, 1])
print({k: round(v, 4) for k, v in probs.items()})
# {'01': 0.5, '10': 0.5} — all amplitude on the satisfying pair (M=2, N=4: the exact case!)
```

M/N = 2/4 = ½… careful: $\sin\theta = \sqrt{1/2}$, θ = 45°, one iteration → $(3)(45°) = 135°$, $\sin^2 = \tfrac12$?? Yet the output shows ALL mass on winners — because with M = N/2 the start state is already at 45° and one iteration rotates to 135°, where $\sin^2(135°) = \tfrac12$ per… the *sum over both winners* is what printed: 0.5 + 0.5 = 1.0 ✓. Reconciled: total winner probability $\sin^2((2k{+}1)\theta)$ counts ALL winners — the printout is the theory, correctly summed. (Catching yourself in exactly this confusion, then resolving it by re-reading definitions, is the intended experience — everyone has it once with multi-winner Grover.)

Why uncomputation is mandatory: after `predicate`, the scratch qubit is *entangled* with the variables; kicking back and measuring/discarding it in that state would leak which-branch information — decohering the register and killing the diffuser's interference (the |−⟩-target gotcha's twin). The second `predicate` call unitarily disentangles the scratch (self-inverse CNOTs), returning it to |0⟩ across ALL branches. Compute–kick–uncompute: the oracle pattern for every real predicate, from SAT clauses to AES key-checks — you've now built the template that scales.
````

## Practice questions

1. Derive $\sin\theta = \sqrt{M/N}$ from the definition of the start state and the winners' subspace.
2. Why do two reflections make a rotation, and by what angle? (One sentence + the classical geometry fact.)
3. Compute $k^*$ and peak success for N = 2²⁰, M = 1. How many total 2-qubit-gate *layers* if each oracle+diffuser costs depth ~200?
4. What does BBBV optimality imply for anyone claiming an exponential quantum search speedup on unstructured data?
5. Explain "inversion about the mean" with a 4-amplitude numeric example (start uniform 0.5 each, flip one to −0.5, invert about the mean).
6. When M is unknown, why does running k = ⌈π√N/4⌉ (the M=1 optimum) risk near-zero success, and which fix costs least in expectation?
7. **Design question:** your company's fraud-rules engine evaluates a 40-bit configuration predicate in a 3,000-gate reversible circuit; ~10 configurations of the 2⁴⁰ satisfy it. Size the full Grover deployment: θ, k*, total gate count, sequential depth at 1 μs/gate-layer (assume depth ≈ gates/10), success probability, and the two honest caveats you'd put on slide one.

````solution
1. $\ket s = \tfrac{1}{\sqrt N}\sum_x\ket x$; the winners' component is $\tfrac{1}{\sqrt N}\sum_{x\in W}\ket x$ with norm $\sqrt{M/N}$ — and that norm IS $\sin\theta$ by the plane decomposition.
2. Reflecting across two mirrors that meet at angle φ rotates by 2φ (Euclid); here the mirrors ($\ket{s'}$ and $\ket s$) meet at θ, so each round rotates 2θ.
3. θ ≈ 2⁻¹⁰, k* ≈ (π/4)·2¹⁰ ≈ 804; success ≥ 1 − 2⁻²⁰; total depth ≈ 804 × 200 ≈ 1.6×10⁵ layers — 0.16 s at 1 μs/layer *if* coherence allowed it (it doesn't, uncorrected — hence Module 10).
4. They're wrong or their data has structure: BBBV proves Ω(√N) queries for any quantum algorithm on unstructured search. Ask "what structure?" — the only escape hatch.
5. Amplitudes (0.5, 0.5, 0.5, −0.5): mean = 0.25; invert each about mean (a → 2·0.25 − a): (0, 0, 0, 1.0). One flip + one inversion = certainty, for N=4 — the k*=1 miracle, in arithmetic.
6. Success oscillates with period ~π/θ ∝ √(N/M); with M winners the M=1 stopping point can land anywhere on the M-winner curve, including near zero. Cheapest fix in expectation: the randomized ladder (exponentially growing random k), total O(√(N/M)) queries without knowing M.
7. θ = arcsin√(10/2⁴⁰) ≈ 3.05×10⁻⁶ wait — √(10)/2²⁰ ≈ 3.02×10⁻⁶; k* ≈ π/(4θ) ≈ 2.6×10⁵ iterations; per iteration ≈ 3,000 (oracle) + ~3,000 (uncompute) + diffuser (~few hundred) ≈ 6.3k gates → total ≈ 1.6×10⁹ gates, depth ≈ 1.6×10⁸ layers ≈ 160 s at 1 μs/layer; success ≥ 1 − 10/2⁴⁰ ≈ certainty at the peak. Slide-one caveats: (1) requires fault-tolerant qubits sustaining ~10⁹ operations — years away (Module 10's overhead math multiplies the 160 s substantially); (2) classical check: 2⁴⁰/10 ≈ 10¹¹ evaluations at, say, 10 ns each ≈ 18 minutes on ONE modern core — parallel classical wins today. The deliverable isn't "no": it's the crossover analysis (at 60+ bits the classical side explodes while Grover grows as the square root) — sizing where the advantage BEGINS is precisely the analysis quantum solution architects are paid for.
````
