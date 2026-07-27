# Oracles, Deutsch–Jozsa & Bernstein–Vazirani

This is where quantum computing first proved, mathematically, that it can beat classical computing at *something*. The something is admittedly artificial — but the mechanism (superposition query → phase kickback → interference readout) is the exact skeleton of Grover, Shor, and phase estimation. Learn DJ and BV properly and Module 8's remaining algorithms become variations on a theme you already play. You built the 1-bit version yourself in Module 6's exercise; today it grows up.

## 1. The query model — how algorithm speedups are measured

The setting: a black-box function $f: \{0,1\}^n \to \{0,1\}$ (an **oracle**) that you may *call* but not inspect. Cost = number of calls (queries). This model makes speedups *provable* — you can count queries exactly, no compiler tricks or hardware quibbles — which is why the first quantum-advantage theorems live here.

The quantum version of a function call must be unitary (reversible!). Two standard constructions:

**XOR oracle**: $U_f\ket{x}\ket{y} = \ket{x}\ket{y \oplus f(x)}$ — writes the answer into a target register reversibly (apply twice = identity ✓).

**Phase oracle**: $O_f\ket{x} = (-1)^{f(x)}\ket{x}$ — marks answers with a sign flip. No output register at all: the answer becomes *phase*.

The bridge between them is a trick you've already performed: set the XOR oracle's target to $\ket-$. Then $\ket{y \oplus f(x)}$ flips $\ket-$ to $-\ket-$ exactly when $f(x) = 1$ — **phase kickback** converts the XOR oracle into a phase oracle, with the target register exiting unchanged and ignorable:

$$U_f\ket{x}\ket{-} = (-1)^{f(x)}\ket{x}\ket{-}$$

This one identity is used by every algorithm in this module. When in doubt, re-derive it: two lines, Module 6 tools.

## 2. Deutsch–Jozsa — one query where classical needs many

**Promise problem**: $f$ is guaranteed either **constant** (same output on all $2^n$ inputs) or **balanced** (outputs 1 on exactly half). Decide which.

Classical deterministic cost: worst case $2^{n-1} + 1$ queries (you might see the same answer $2^{n-1}$ times and still not know). Quantum cost: **one**.

**The circuit**: $n$ data qubits + the $\ket-$ kickback target.

$$\ket{0}^{\otimes n} \xrightarrow{H^{\otimes n}} \frac{1}{\sqrt{2^n}}\sum_x \ket{x} \xrightarrow{O_f} \frac{1}{\sqrt{2^n}}\sum_x (-1)^{f(x)}\ket{x} \xrightarrow{H^{\otimes n}} \text{measure}$$

@@diagram:dj-circuit|Deutsch–Jozsa: fan out with H's, one phase-oracle query stamps f onto the phases, H's interfere everything into the all-zeros amplitude. Read: all-0s = constant, anything else = balanced.

**Why it works** — compute the amplitude of $\ket{0\cdots0}$ after the final Hadamards. The n-qubit Hadamard identity (worth memorizing — it recurs):

$$H^{\otimes n}\ket{x} = \frac{1}{\sqrt{2^n}}\sum_z (-1)^{x\cdot z}\ket{z} \qquad (x\cdot z = \textstyle\sum_k x_k z_k \bmod 2)$$

The $\ket{0\cdots0}$ amplitude collects $\tfrac{1}{2^n}\sum_x (-1)^{f(x)}$:

- $f$ constant: all $2^n$ terms share one sign → amplitude $\pm1$ → measure **all-zeros with certainty**.
- $f$ balanced: signs split evenly → terms cancel *exactly* → amplitude 0 → **anything but** all-zeros.

One query, deterministic answer, and the mechanism laid bare: the oracle wrote $f$'s global structure into $2^n$ phases simultaneously; interference computed their *sum* — a global property no single classical query can see. (Honesty clause, for interviews: a classical *randomized* algorithm gets exponentially confident in a handful of queries — DJ's separation is only dramatic against deterministic classical. The algorithms later in this module don't have that asterisk.)

## 3. Bernstein–Vazirani — reading n bits with one question

**Problem**: the oracle computes $f(x) = s\cdot x \bmod 2$ for a hidden string $s \in \{0,1\}^n$. Find $s$. Classical: $n$ queries (probe one bit per query: $f(100\ldots), f(010\ldots), \ldots$) — and provably no fewer. Quantum: **one**, with the *same circuit* as DJ.

**Why**: after the oracle, the state is $\tfrac{1}{\sqrt{2^n}}\sum_x (-1)^{s\cdot x}\ket{x}$ — which, by the Hadamard identity read in reverse, is *exactly* $H^{\otimes n}\ket{s}$. The final Hadamards undo themselves:

$$H^{\otimes n}\big(H^{\otimes n}\ket{s}\big) = \ket{s}$$

Measure: the hidden string, in the plain, every time. BV is the cleanest demonstration in all of quantum computing that **the Hadamard basis is a genuine data channel**: the oracle whispered $s$ into phases; one basis change turned whispers into bits.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def bv_circuit(s: str) -> QuantumCircuit:
    n = len(s)
    qc = QuantumCircuit(n + 1)
    qc.x(n); qc.h(n)                      # kickback target → |−⟩
    qc.h(range(n))                        # fan out
    for k, bit in enumerate(reversed(s)): # oracle for f(x)=s·x: CNOT per 1-bit of s
        if bit == "1":
            qc.cx(k, n)                   # (little-endian: s's rightmost bit ↔ q0)
    qc.h(range(n))                        # interfere
    return qc

qc = bv_circuit("10110")
print(Statevector(qc).probabilities_dict([0,1,2,3,4]))   # {'10110': 1.0} 🎯
```

Note what the oracle *is*: one CNOT per 1-bit of $s$ — the "black box" is just parity plumbing (Module 6's parity circuit, reversed roles). Building oracles yourself demystifies them permanently: they're circuits, not magic envelopes.

## Worked example — DJ end to end for n = 2, every amplitude tracked

*Balanced oracle: $f(x_1x_0) = x_0$ (output = low bit; two 0s, two 1s ✓). Trace all four amplitudes.*

**Fan-out**: $\tfrac12(\ket{00} + \ket{01} + \ket{10} + \ket{11})$.

**Phase oracle** ($(-1)^{x_0}$ — implemented as a single Z on qubit 0, when you unwrap the kickback):

$$\tfrac12(\ket{00} - \ket{01} + \ket{10} - \ket{11})$$

**Final H⊗H** — use the identity per basis state and collect (or factor smartly: the state is $\tfrac{1}{\sqrt2}(\ket0 + \ket1)\otimes\tfrac{1}{\sqrt2}(\ket0 - \ket1) = \ket+\ket-$, and $H\ket+ = \ket0$, $H\ket- = \ket1$):

$$\to \ket{0}\ket{1} = \ket{01}$$

Measured: `01` ≠ all-zeros → **balanced** ✓ — with certainty, one query. And the bonus the factoring revealed: the outcome isn't just "not zero" — it's $\ket{01}$, which is precisely the string $s$ for $f(x) = x_0 = (01)\cdot x$. DJ on a linear function *is* BV. The two algorithms aren't siblings; they're one algorithm answering two questions.

```python
qc = QuantumCircuit(3)
qc.x(2); qc.h(2)
qc.h([0, 1])
qc.cx(0, 2)                    # XOR-oracle for f(x)=x0, kickback does the rest
qc.h([0, 1])
print(Statevector(qc).probabilities_dict([0, 1]))    # {'01': 1.0} ✓
```

## Gotchas

- **Forgetting the $\ket-$ preparation.** With the target in $\ket0$, the XOR oracle *entangles* instead of kicking back phases — the data register decoheres (which-path information leaked into the target!) and the interference dies. Symptom: uniform random outputs. The X-then-H on the target is load-bearing.
- **Measuring the target register.** It exits in $\ket-$, carrying nothing; measuring it is harmless but reading it as "the answer" is a classic novice misparse. The answer lives in the *data* register.
- **Breaking the promise.** Feed DJ an $f$ that's neither constant nor balanced and the output is a probabilistic shrug (some distribution over outcomes) — not an error message. Promise problems only certify answers when the promise holds; state this in interviews before anyone asks.
- **Little-endian oracle wiring.** BV's $s$ maps to CNOTs per bit — with Qiskit's qubit 0 = rightmost bit of the string (the `reversed(s)` in the code). Mis-wiring returns $s$ reversed: instantly recognizable, endlessly re-committed.
- **Claiming exponential quantum advantage over all classical.** DJ's exponential gap is vs *deterministic exact* classical; randomized classical does fine. BV's gap ($1$ vs $n$) is honest but polynomial. The asterisk-free exponential separations come later (Simon's problem — see practice Q7 — then Shor).
- **Building oracles that peek.** An oracle implementation that measures, resets, or branches classically isn't unitary and silently breaks superposed queries. Oracles must be pure circuits — Toffolis and CNOTs — exactly like your BV construction.

## Scenario — the interview whiteboard, algorithm edition

The most common quantum-algorithms screen, nearly verbatim: *"Walk me through Deutsch–Jozsa. Now: where exactly does the speedup come from — superposition, entanglement, or interference?"* The trap: answering "superposition" alone (the parallelism myth from Module 5). The answer that lands: superposition lets ONE query imprint $f$'s values across all $2^n$ phase slots — but phases are unreadable directly (measurement would give one random $x$, no better than classical). The speedup is completed by **interference**: the final Hadamards compute a global *sum* of those phases, concentrating amplitude on all-zeros iff the phases agree. Entanglement plays a supporting role (data↔target during the query, undone by kickback). Follow-up you should volunteer: the classical-randomized caveat, and that BV shows the same circuit extracting $n$ bits/query — evidence you know both the power and its precise boundaries. That calibrated honesty is what separates "watched videos" from "worked the amplitudes."

## Key points

- Oracles are reversible circuit implementations of functions: XOR form $\ket{x}\ket{y\oplus f(x)}$; phase form $(-1)^{f(x)}\ket{x}$; a $\ket-$ target converts one to the other via phase kickback — the module's master move.
- DJ: H-fanout → one phase query → H-interference → all-zeros amplitude $= \tfrac{1}{2^n}\sum_x(-1)^{f(x)}$: certainty-grade constant/balanced decision in one query (vs $2^{n-1}+1$ deterministic classical).
- The identity $H^{\otimes n}\ket{x} = \tfrac{1}{\sqrt{2^n}}\sum_z (-1)^{x\cdot z}\ket z$ powers everything; memorize it.
- BV: for $f = s\cdot x$, the post-oracle state IS $H^{\otimes n}\ket s$, so the final H's reveal $s$ exactly — n bits per query, same circuit as DJ.
- Speedup anatomy: superposition writes globally, interference reads globally; measurement alone reads nothing — the parallelism myth dies here, with math.
- Honest advantage accounting: DJ exponential only vs deterministic classical; BV n-vs-1; the unconditional exponential separations arrive with Simon/Shor.

## Check yourself

```quiz
{"q":"In the kickback construction, why must the oracle's target qubit be |−⟩ rather than |0⟩?","options":["|−⟩ is easier to prepare","With |0⟩ the oracle ENTANGLES data with target (which-path leak — interference dies); with |−⟩ the flip becomes a pure phase (−1)^f(x) on the data register, target unchanged","|0⟩ would make the oracle non-unitary","It doesn't matter — both work"],"answer":1,"why":"X|−⟩ = −|−⟩: an eigenstate, so f's value exits as phase (kickback). X|0⟩ = |1⟩: a different state, so f's value exits as entanglement — recorded which-path information that kills the final interference."}
```

```quiz
{"q":"BV's oracle hides s = 1101 (4 bits). After the algorithm's single query and final Hadamards, measurement yields:","options":["A random 4-bit string, repeated runs needed","'1101' with certainty — the post-oracle state is exactly H⊗⁴|1101⟩, and the final H's unwrap it","'1101' with probability 1/16","The parity of s only"],"answer":1,"why":"Phases (−1)^{s·x} across the uniform superposition ARE the Hadamard transform of |s⟩. One query, one basis change, n bits read — the cleanest 'phases carry data' demonstration in the field."}
```

## Exercises

**Exercise 1 — build the DJ test bench.** Write `dj(oracle: QuantumCircuit, n: int) -> str` running the algorithm and returning `"constant"` or `"balanced"` from a single Statevector evaluation. Construct four oracles for n = 3: constant-0 (empty), constant-1 (X on target), balanced $f = x_2$ (one CNOT), balanced $f = x_0 \oplus x_1$ (two CNOTs). Verify all four classifications, and — the real test — print the full output distribution for a *promise-breaking* oracle $f = x_0 \wedge x_1$ (Toffoli) and interpret it.

````solution
```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def dj(oracle_builder, n):
    qc = QuantumCircuit(n + 1)
    qc.x(n); qc.h(n)
    qc.h(range(n))
    oracle_builder(qc, n)                 # writes U_f using target=qubit n
    qc.h(range(n))
    probs = Statevector(qc).probabilities_dict(list(range(n)))
    return "constant" if probs.get("0"*n, 0) > 0.999 else "balanced", probs

oracles = {
    "const-0":  lambda qc, n: None,
    "const-1":  lambda qc, n: qc.x(n),
    "f=x2":     lambda qc, n: qc.cx(2, n),
    "f=x0^x1":  lambda qc, n: (qc.cx(0, n), qc.cx(1, n)),
    "f=x0&x1 (PROMISE-BREAKER)": lambda qc, n: qc.ccx(0, 1, n),
}
for name, ob in oracles.items():
    verdict, probs = dj(ob, 3)
    print(f"{name:>28}: {verdict}  {dict((k, round(v,3)) for k,v in probs.items() if v>1e-6)}")
# const-0/const-1 → constant {'000': 1.0}
# f=x2, f=x0^x1  → balanced (zero weight on '000')
# AND-oracle     → "balanced" verdict, but distribution {'000': 0.25, '001':.25, '010':.25, '011':.25}
```

Interpretation of the promise-breaker: AND outputs 1 on exactly ¼ of inputs — neither constant nor balanced. The all-zeros amplitude is $\tfrac{1}{8}\sum_x(-1)^{f(x)} = \tfrac{8-2\cdot2}{8}$ wait: 8 inputs, two give f=1 → sum $= 6 - 2 = 4$, amplitude $\tfrac{4}{8} = \tfrac12$ → $p(000) = \tfrac14$ — exactly what printed. The bench declared "balanced" (its binary vocabulary), but the distribution *shows* the truth: partial cancellation, matching $\left(\tfrac{\#0s - \#1s}{2^n}\right)^2$. Deliverable insight: DJ's output distribution is actually a *bias meter* for f — the promise just makes the meter's two ends deterministic. Understanding an algorithm means knowing what it does OFF its contract, too.
````

**Exercise 2 — BV on rehearsal hardware, with the classical race.** Run `bv_circuit("1011001")` (n = 7) on the fake-backend rehearsal (4096 shots): report the success probability of reading exactly `1011001` with ±2SE. Then implement the classical probe strategy (query unit vectors) and answer: at what oracle-call *latency* would the quantum one-query advantage matter in wall-clock terms, given your measured success rate requires ~k repetitions to confirm? (Make the comparison honest.)

````solution
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
from qiskit_aer.primitives import SamplerV2 as AerSampler
# (bv_circuit from Section 3, plus measure_all before running)

s = "1011001"; n = len(s)
qc = bv_circuit(s); qc.measure_all()
backend = FakeSherbrooke()
isa = generate_preset_pass_manager(3, backend=backend, seed_transpiler=7).run(qc)
counts = AerSampler.from_backend(backend).run([(isa,)], shots=4096).result()[0].data.meas.get_counts()
tot = sum(counts.values())
# data register = low n bits of the (n+1)-bit strings; target bit is leftmost:
hit = sum(v for k, v in counts.items() if k[-n:] == s) / tot
se = np.sqrt(hit*(1-hit)/tot)
print(f"P(read s exactly) = {hit:.3f} ± {2*se:.3f}")     # typical: 0.75–0.90 at n=7
```

Honest comparison: classical needs exactly 7 oracle calls and gets $s$ with certainty (noiseless classical hardware). Quantum needs 1 call but, at measured success $p \approx 0.8$, requires repetition for confidence: seeing the same string twice in ~2–3 runs suffices (the wrong outcomes scatter — majority vote converges fast: ~3 calls for >99%). So the real ledger at n = 7: ~3 noisy quantum queries vs 7 clean classical ones — advantage only if oracle calls dominate cost (e.g., each call = an expensive remote/physical process at seconds each: 3×latency vs 7×latency wins by ~2.3×). At n = 100 the ledger becomes ~3–5 vs 100 and the conversation changes. Deliverables graded: the ±2SE report, the bit-slicing (`k[-n:]` — little-endian discipline), and the honest "advantage is asymptotic and latency-dependent" framing — which is *exactly* how you'll be expected to discuss NISQ-era claims in Module 9 and in rooms with money at stake.
````

## Practice questions

1. Show $U_f$ (XOR form) is its own inverse, and why that matters for uncomputation.
2. Where exactly does DJ's certainty come from — which amplitudes cancel, and what property of balanced f guarantees *exact* cancellation?
3. Why does measuring the data register right after the oracle (skipping the final H's) destroy the algorithm? What would you observe?
4. Derive BV's classical lower bound: why can't any classical algorithm (even randomized) learn all n bits of s in fewer than n queries? (Information counting.)
5. Implement (describe) the phase oracle for $f(x) = x_1 \oplus x_2$ directly with Z-type gates — no target qubit at all.
6. Your DJ run on hardware returns '000' with probability 0.86 for a constant oracle. State the verdict rule you'd use at n = 3 and its error probability, given balanced oracles put ≤ 0.05 on '000' at this noise level.
7. **Design question:** Simon's problem hides a string s with $f(x) = f(x\oplus s)$ (two-to-one), and its quantum algorithm returns random strings z satisfying $z\cdot s = 0$, needing ~n runs plus classical linear algebra — the first *unconditional* exponential separation. Design the full pipeline: quantum subroutine per run, the classical post-processing, the stopping rule, and where the exponential classical hardness comes from.

````solution
1. $U_f U_f\ket x\ket y = \ket x\ket{y\oplus f(x)\oplus f(x)} = \ket x\ket y$. Self-inverse ⇒ querying twice uncomputes — scratch registers clean themselves, enabling oracle reuse inside larger circuits (Grover next lesson does exactly this).
2. The $\ket{0^n}$ amplitude sums ALL phases $\tfrac{1}{2^n}\sum(-1)^{f(x)}$; balanced means exactly $2^{n-1}$ terms of each sign — cancellation is exact by count, not approximation. (All other outcomes' amplitudes rearrange the same ±1s with extra signs — generally nonzero.)
3. You'd sample one uniformly random $x$ (each $|(-1)^{f(x)}/\sqrt{2^n}|^2 = 2^{-n}$) — phases invisible, information about f limited to one classical evaluation: exactly a classical query's worth. Interference is the readout; skipping it reduces quantum to classical.
4. Each query returns 1 bit; s contains n independent bits; k queries yield ≤ k bits of mutual information — k ≥ n. (Randomization doesn't create information, only reorders queries.)
5. $(-1)^{x_1\oplus x_2} = (-1)^{x_1}(-1)^{x_2}$: apply Z to qubit 1 and Z to qubit 2. Linear phase functions = products of single-qubit Z's; that's why BV oracles are so cheap.
6. Rule: declare constant iff $\hat p(000) > 0.5$ (midpoint of 0.86 vs 0.05 operating points). Error: essentially the tail probabilities of binomials at your shot count — at 1024 shots, both tails are astronomically small (gap ≈ 25+ SE); quote "error < 10⁻⁹" and move on. Thresholding IS hypothesis testing (Module 3).
7. Pipeline: per run — Hⁿ, query $U_f$ (XOR form, n-bit output register, NO |−⟩ trick here: measuring the output register collapses data onto a coset pair), Hⁿ on data, measure → a uniformly random z with z·s = 0 (mod 2). Classical layer: collect z's as rows of a GF(2) matrix; stopping rule — when rank reaches n−1 (expected after ~n + O(1) runs), solve the null space for the unique nonzero s; verify with two classical queries f(0), f(s). Exponential hardness source: classically, learning anything about s requires finding a COLLISION f(x) = f(x′) among $2^n$ values — birthday-bound $\Omega(2^{n/2})$ queries even randomized; the quantum version manufactures collision-information *in the phases* every single run. Design extras worth crediting: rank-check after each run (don't over-collect), degenerate-s=0 handling, and noting this classical-postprocessing-completes-the-quantum-core pattern is Shor's exact architecture (two lessons ahead). Simon is the dress rehearsal for the algorithm that ends RSA.
````
