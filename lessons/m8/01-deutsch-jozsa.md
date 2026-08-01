# Oracles, Deutsch–Jozsa & Bernstein–Vazirani

This is where quantum computing first *proved*, mathematically, that it can beat classical computing at something. The something is admittedly artificial — but the mechanism (superposition query → phase kickback → interference readout) is the exact skeleton of Grover, Shor, and phase estimation. Learn Deutsch–Jozsa and Bernstein–Vazirani properly and the rest of Module 8 becomes variations on a theme you already play.

## Start here — the intuition

Picture a very long row of coins, each showing heads or tails, and a promise: the row is **either all the same face, or exactly half heads and half tails**. Your job is to say which — "constant" or "balanced" — but you may only ask about the coins through a sealed machine, one question at a time.

Classically you are stuck checking coins one by one. Even after looking at nearly half of them all showing heads, the very next one could be tails: to be *certain*, worst case, you must check more than half. With $n$ bits of input that is up to $2^{n-1}+1$ questions.

The quantum trick is not to look faster. It is to ask **one cleverly-phrased question of all the coins at once**, arranged so their answers *interfere* — reinforcing into a single unmistakable "all the same" signal, or cancelling out completely to say "half and half." One question, certain answer. The whole lesson is how that question is built, and the one move — **phase kickback** — that makes it work.

## The one move you'll reuse everywhere: phase kickback

First, what an "oracle" is: a black-box function $f: \{0,1\}^n \to \{0,1\}$ that you may *call* but not open. We count cost as the number of calls (queries). Counting queries is what makes speedups *provable* — no compiler tricks, no hardware quibbles — which is why the first quantum-advantage theorems live here.

A quantum function call must be reversible (unitary). Two standard forms:

- **XOR oracle:** $U_f\ket{x}\ket{y} = \ket{x}\ket{y \oplus f(x)}$ — writes the answer into a target register (apply twice = identity, so it is reversible).
- **Phase oracle:** $O_f\ket{x} = (-1)^{f(x)}\ket{x}$ — marks answers with a sign. No output register: the answer becomes *phase*.

The bridge between them is the move you'll use in every algorithm this module. Set the XOR oracle's target to $\ket{-}$. Since $X\ket{-} = -\ket{-}$, flipping the target when $f(x)=1$ just multiplies by $-1$ — the answer jumps onto the *data* register as a phase, and the target exits unchanged:

$$U_f\ket{x}\ket{-} = (-1)^{f(x)}\ket{x}\ket{-}$$

That is **phase kickback**. When in doubt, re-derive it — two lines with Module 6 tools. Everything below is this identity, wrapped in Hadamards.

## Deutsch–Jozsa — one query where classical needs many

**The promise:** $f$ is guaranteed either **constant** (same output on all $2^n$ inputs) or **balanced** (outputs $1$ on exactly half). Decide which. Classical deterministic cost: worst case $2^{n-1}+1$ queries. Quantum cost: **one**.

**The circuit:** $n$ data qubits plus the $\ket{-}$ kickback target.

$$\ket{0}^{\otimes n} \xrightarrow{H^{\otimes n}} \frac{1}{\sqrt{2^n}}\sum_x \ket{x} \xrightarrow{O_f} \frac{1}{\sqrt{2^n}}\sum_x (-1)^{f(x)}\ket{x} \xrightarrow{H^{\otimes n}} \text{measure}$$

@@diagram:dj-circuit|Deutsch–Jozsa: fan out with H's, one phase-oracle query stamps f onto the phases, H's interfere everything into the all-zeros amplitude. Read: all-0s = constant, anything else = balanced.

@@widget

**Why it works** — compute the amplitude of $\ket{0\cdots0}$ after the final Hadamards. The $n$-qubit Hadamard identity (worth memorizing — it recurs):

$$H^{\otimes n}\ket{x} = \frac{1}{\sqrt{2^n}}\sum_z (-1)^{x\cdot z}\ket{z} \qquad (x\cdot z = \textstyle\sum_k x_k z_k \bmod 2)$$

The $\ket{0\cdots0}$ amplitude collects $\tfrac{1}{2^n}\sum_x (-1)^{f(x)}$:

- $f$ constant: all $2^n$ terms share one sign → amplitude $\pm 1$ → measure **all-zeros with certainty**.
- $f$ balanced: signs split evenly → terms cancel *exactly* → amplitude $0$ → **anything but** all-zeros.

One query, deterministic answer, and the mechanism laid bare: the oracle wrote $f$'s global structure into $2^n$ phases simultaneously; interference computed their *sum* — a global property no single classical query can see.

## Worked example — DJ for n = 2, every amplitude tracked

*Balanced oracle $f(x_1x_0) = x_0$ (output = low bit; two $0$s, two $1$s). Trace all four amplitudes.*

**Fan-out:** $\tfrac12(\ket{00} + \ket{01} + \ket{10} + \ket{11})$.

**Phase oracle** ($(-1)^{x_0}$ — a single $Z$ on qubit $0$ once you unwrap the kickback):

$$\tfrac12(\ket{00} - \ket{01} + \ket{10} - \ket{11})$$

**Final $H \otimes H$** — factor smartly: the state is $\tfrac{1}{\sqrt2}(\ket0 + \ket1)\otimes\tfrac{1}{\sqrt2}(\ket0 - \ket1) = \ket{+}\ket{-}$, and $H\ket{+} = \ket0$, $H\ket{-} = \ket1$:

$$\to \ket{0}\ket{1} = \ket{01}$$

Measured: $01 \neq$ all-zeros → **balanced**, with certainty, one query. Bonus the factoring reveals: the outcome $\ket{01}$ is exactly the string $s$ for $f(x) = x_0 = (01)\cdot x$. DJ on a linear function *is* Bernstein–Vazirani — one algorithm answering two questions.

## Predict, then run — a DJ classifier you can edit

The cell below is **live: edit it and press Run.** It builds each oracle, runs Deutsch–Jozsa on the course's in-browser simulator (Qiskit-like API), reads the data register, and prints its verdict.

**Predict first.** Before running: `constant-1` is an $X$ on the target only. Will DJ call it constant or balanced? (Trap: an $X$ on the *target* is a global sign — it changes nothing on the data register.) Write your guess, then Run.

```run
# Live cell — edit and Run. QuantumCircuit is already available; API mirrors Qiskit.
# Try adding your own oracle to the dict, e.g. "balanced f=x0": lambda qc, n: qc.cx(0, n)

def dj(oracle, n):
    qc = QuantumCircuit(n + 1)
    qc.x(n); qc.h(n)                     # kickback target -> |->
    for q in range(n): qc.h(q)           # fan out
    oracle(qc, n)                        # your oracle writes U_f (target = qubit n)
    for q in range(n): qc.h(q)           # interfere
    data = {}                            # marginalize the target qubit
    for key, p in qc.probabilities().items():
        data[key[-n:]] = round(data.get(key[-n:], 0.0) + p, 6)
    verdict = "constant" if data.get("0" * n, 0) > 0.999 else "balanced"
    return verdict, data

oracles = {
    "constant-0":        lambda qc, n: None,
    "constant-1":        lambda qc, n: qc.x(n),
    "balanced f=x2":     lambda qc, n: qc.cx(2, n),
    "balanced f=x0^x1":  lambda qc, n: (qc.cx(0, n), qc.cx(1, n)),
}
for name, orc in oracles.items():
    verdict, _ = dj(orc, 3)
    print(f"{name:>18}  ->  {verdict}")
```

One query per oracle, and every verdict is certain. Now break the promise on purpose: add `"f=x0 AND x1": lambda qc, n: qc.ccx(0, 1, n)` — AND is neither constant nor balanced, and the classifier's *distribution* (return `data` and print it) becomes a bias meter. Understanding an algorithm means knowing what it does off its contract, too.

```quiz
{"q":"In the kickback construction, why must the oracle's target qubit be |−⟩ rather than |0⟩?","options":["|−⟩ is easier to prepare","With |0⟩ the oracle ENTANGLES data with target (a which-path leak — interference dies); with |−⟩ the flip becomes a pure phase (−1)^f(x) on the data register, target unchanged","|0⟩ would make the oracle non-unitary","It doesn't matter — both work"],"answer":1,"why":"X|−⟩ = −|−⟩: an eigenstate, so f's value exits as phase (kickback). X|0⟩ = |1⟩: a different state, so f's value exits as entanglement — recorded which-path information that kills the final interference."}
```

## Bernstein–Vazirani — reading n bits with one question

**Problem:** the oracle computes $f(x) = s\cdot x \bmod 2$ for a hidden string $s \in \{0,1\}^n$. Find $s$. Classical: $n$ queries (probe one bit at a time), provably no fewer. Quantum: **one**, with the *same circuit* as DJ.

**Why:** after the oracle the state is $\tfrac{1}{\sqrt{2^n}}\sum_x (-1)^{s\cdot x}\ket{x}$ — which, by the Hadamard identity read in reverse, is exactly $H^{\otimes n}\ket{s}$. The final Hadamards undo themselves, $H^{\otimes n}\big(H^{\otimes n}\ket{s}\big) = \ket{s}$, and you measure the hidden string in the plain, every time. BV is the cleanest proof in all of quantum computing that **the Hadamard basis is a genuine data channel**.

```run
# Live cell — change s and Run. The oracle is one CNOT per 1-bit of s.
def bv(s):
    n = len(s)
    qc = QuantumCircuit(n + 1)
    qc.x(n); qc.h(n)                     # target -> |->
    for q in range(n): qc.h(q)           # fan out
    for k, bit in enumerate(reversed(s)):
        if bit == "1": qc.cx(k, n)       # oracle: CNOT per 1-bit of s (little-endian)
    for q in range(n): qc.h(q)           # interfere
    data = {}                            # marginalize the target qubit
    for key, p in qc.probabilities().items():
        data[key[-n:]] = round(data.get(key[-n:], 0.0) + p, 6)
    return data

print(bv("10110"))     # -> {'10110': 1.0}, the hidden string, first try
```

The oracle is just parity plumbing — one CNOT per $1$-bit of $s$. Building oracles yourself demystifies them permanently: they are circuits, not magic envelopes.

## Level up: gotchas the pros watch for

- **Forgetting the $\ket{-}$ preparation.** With the target in $\ket0$, the XOR oracle *entangles* instead of kicking back phases — the data register decoheres and the interference dies. Symptom: uniform random outputs. The X-then-H on the target is load-bearing.
- **Measuring the target register.** It exits in $\ket{-}$, carrying nothing; reading it as "the answer" is a classic misparse. The answer lives in the *data* register.
- **Breaking the promise.** Feed DJ an $f$ that is neither constant nor balanced and the output is a probabilistic shrug, not an error. Promise problems only certify answers when the promise holds — say this in interviews before anyone asks.
- **Little-endian oracle wiring.** BV's $s$ maps to CNOTs per bit with qubit $0$ = rightmost bit of the string (the `reversed(s)` in the code). Mis-wiring returns $s$ reversed.
- **Claiming exponential advantage over all classical.** DJ's exponential gap is vs *deterministic exact* classical; a randomized classical algorithm gets exponentially confident in a handful of queries. BV's gap ($1$ vs $n$) is honest but polynomial. The asterisk-free exponential separations come with Simon's problem (practice Q7), then Shor.

## Level up: the interview whiteboard

The most common quantum-algorithms screen, nearly verbatim: *"Walk me through Deutsch–Jozsa. Now: where exactly does the speedup come from — superposition, entanglement, or interference?"* The trap is answering "superposition" alone (the parallelism myth from Module 5). The answer that lands: superposition lets one query imprint $f$'s values across all $2^n$ phase slots — but phases are unreadable directly (measurement would give one random $x$). The speedup is *completed* by **interference**: the final Hadamards compute a global sum of those phases, concentrating amplitude on all-zeros iff the phases agree. Entanglement plays a supporting role (data↔target during the query, undone by kickback). Then volunteer the classical-randomized caveat and the BV extension — calibrated honesty is what separates "watched videos" from "worked the amplitudes."

## Key points

- Oracles are reversible circuit implementations of functions: XOR form $\ket{x}\ket{y\oplus f(x)}$; phase form $(-1)^{f(x)}\ket{x}$; a $\ket{-}$ target converts one to the other via phase kickback — the module's master move.
- DJ: H-fanout → one phase query → H-interference → the all-zeros amplitude equals $\tfrac{1}{2^n}\sum_x(-1)^{f(x)}$: a certainty-grade constant/balanced decision in one query (vs $2^{n-1}+1$ deterministic classical).
- The identity $H^{\otimes n}\ket{x} = \tfrac{1}{\sqrt{2^n}}\sum_z (-1)^{x\cdot z}\ket z$ powers everything; memorize it.
- BV: for $f = s\cdot x$, the post-oracle state *is* $H^{\otimes n}\ket s$, so the final H's reveal $s$ exactly — $n$ bits per query, same circuit as DJ.
- Speedup anatomy: superposition writes globally, interference reads globally; measurement alone reads nothing — the parallelism myth dies here, with math.
- Honest advantage accounting: DJ exponential only vs deterministic classical; BV $n$-vs-$1$; the unconditional exponential separations arrive with Simon and Shor.

## Check yourself

```quiz
{"q":"BV's oracle hides s = 1101 (4 bits). After the algorithm's single query and final Hadamards, measurement yields:","options":["A random 4-bit string, repeated runs needed","'1101' with certainty — the post-oracle state is exactly H⊗⁴|1101⟩, and the final H's unwrap it","'1101' with probability 1/16","The parity of s only"],"answer":1,"why":"Phases (−1)^{s·x} across the uniform superposition ARE the Hadamard transform of |s⟩. One query, one basis change, n bits read — the cleanest 'phases carry data' demonstration in the field."}
```

## Exercises

**Exercise 1 — the promise-breaker as a bias meter.** Extend the live DJ cell: make `dj` return the full `data` distribution, then run it on a promise-breaking oracle $f = x_0 \wedge x_1$ (`qc.ccx(0, 1, n)`) at $n=3$. Predict the probability on $\ket{000}$ before running, then explain the number you get.

````solution
```python
# f = x0 AND x1 outputs 1 on exactly 2 of the 8 inputs (x0=x1=1, any x2).
# All-zeros amplitude = (1/2^n) * sum_x (-1)^f(x) = (8 - 2*2)/8 = 4/8 = 1/2.
# So p(000) = (1/2)^2 = 0.25 — the cell prints {'000': 0.25, '001': 0.25, ...}.
```

AND is neither constant nor balanced, so DJ's binary verdict ("balanced", since $p(000) < 0.999$) is technically triggered — but the *distribution* tells the truth: partial cancellation, with $p(000) = \left(\tfrac{\#0\text{s} - \#1\text{s}}{2^n}\right)^2$. DJ's output distribution is really a bias meter for $f$; the promise just makes its two ends deterministic.
````

**Exercise 2 — BV on rehearsal hardware, with the classical race.** On real hardware you would transpile `bv("1011001")` (n = 7) to a fake backend, take 4096 shots, and report the success probability of reading exactly `1011001` with ±2 SE. Then reason about the classical probe strategy: at what oracle-call latency does the quantum one-query advantage matter in wall-clock terms?

````solution
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
from qiskit_aer.primitives import SamplerV2 as AerSampler
# (bv_circuit as in Section BV, plus qc.measure_all())

s = "1011001"; n = len(s)
qc = bv_circuit(s); qc.measure_all()
backend = FakeSherbrooke()
isa = generate_preset_pass_manager(3, backend=backend, seed_transpiler=7).run(qc)
counts = AerSampler.from_backend(backend).run([(isa,)], shots=4096).result()[0].data.meas.get_counts()
tot = sum(counts.values())
hit = sum(v for k, v in counts.items() if k[-n:] == s) / tot   # data = low n bits
se = np.sqrt(hit * (1 - hit) / tot)
print(f"P(read s exactly) = {hit:.3f} ± {2*se:.3f}")           # typical 0.75–0.90 at n=7
```

Honest ledger: classical needs exactly $7$ oracle calls and gets $s$ with certainty; noisy quantum needs $1$ call but, at $p \approx 0.8$, a few repetitions for confidence (majority vote converges in ~3 runs). So ~3 noisy quantum queries vs $7$ clean classical ones — advantage only if each oracle call is expensive (seconds of remote/physical latency). At $n = 100$ the ledger becomes ~3–5 vs $100$ and the conversation changes. The gradeable skills: the ±2 SE report, the little-endian bit-slicing (`k[-n:]`), and the "advantage is asymptotic and latency-dependent" framing you'll need for every NISQ-era claim.
````

## Practice questions

1. Show $U_f$ (XOR form) is its own inverse, and why that matters for uncomputation.
2. Where exactly does DJ's certainty come from — which amplitudes cancel, and what property of balanced $f$ guarantees *exact* cancellation?
3. Why does measuring the data register right after the oracle (skipping the final H's) destroy the algorithm? What would you observe?
4. Derive BV's classical lower bound: why can't any classical algorithm (even randomized) learn all $n$ bits of $s$ in fewer than $n$ queries? (Information counting.)
5. Implement (describe) the phase oracle for $f(x) = x_1 \oplus x_2$ directly with $Z$-type gates — no target qubit at all.
6. Your DJ run on hardware returns $000$ with probability $0.86$ for a constant oracle. State the verdict rule you'd use at $n = 3$ and its error probability, given balanced oracles put $\le 0.05$ on $000$ at this noise level.
7. **Design question:** Simon's problem hides a string $s$ with $f(x) = f(x\oplus s)$ (two-to-one), and its quantum algorithm returns random strings $z$ satisfying $z\cdot s = 0$, needing ~$n$ runs plus classical linear algebra — the first *unconditional* exponential separation. Design the full pipeline: quantum subroutine per run, the classical post-processing, the stopping rule, and where the exponential classical hardness comes from.

````solution
1. $U_f U_f\ket x\ket y = \ket x\ket{y\oplus f(x)\oplus f(x)} = \ket x\ket y$. Self-inverse ⇒ querying twice uncomputes — scratch registers clean themselves, enabling oracle reuse inside larger circuits (Grover does exactly this).
2. The $\ket{0^n}$ amplitude sums ALL phases $\tfrac{1}{2^n}\sum(-1)^{f(x)}$; balanced means exactly $2^{n-1}$ terms of each sign — cancellation is exact by count, not approximation.
3. You'd sample one uniformly random $x$ (each probability $2^{-n}$) — phases invisible, information about $f$ limited to one classical evaluation. Interference is the readout; skip it and quantum collapses to classical.
4. Each query returns $1$ bit; $s$ contains $n$ independent bits; $k$ queries yield $\le k$ bits of mutual information — so $k \ge n$. Randomization reorders queries; it does not create information.
5. $(-1)^{x_1\oplus x_2} = (-1)^{x_1}(-1)^{x_2}$: apply $Z$ to qubit $1$ and $Z$ to qubit $2$. Linear phase functions are products of single-qubit $Z$'s — why BV oracles are so cheap.
6. Rule: declare constant iff $\hat p(000) > 0.5$ (midpoint of the $0.86$ vs $0.05$ operating points). The two binomial tails at any reasonable shot count are astronomically small (gap $\approx 25+$ SE) — quote "error $< 10^{-9}$." Thresholding is hypothesis testing (Module 3).
7. Per run: $H^{\otimes n}$, query $U_f$ in XOR form with an $n$-bit output register (NO $\ket{-}$ trick — measuring the output collapses data onto a coset pair), $H^{\otimes n}$ on data, measure → a uniformly random $z$ with $z\cdot s = 0$. Classical layer: collect $z$'s as rows of a GF(2) matrix; stop when rank hits $n-1$ (expected after ~$n + O(1)$ runs), solve the null space for the unique nonzero $s$, verify with $f(0), f(s)$. Exponential hardness: classically, learning anything about $s$ requires finding a collision $f(x)=f(x')$ among $2^n$ values — birthday-bound $\Omega(2^{n/2})$ even randomized; the quantum version manufactures collision information in the phases every run. This classical-postprocessing-completes-the-quantum-core pattern is Shor's exact architecture.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Derive phase kickback ($U_f\ket{x}\ket{-} = (-1)^{f(x)}\ket{x}\ket{-}$) from scratch in two lines.
- ☐ Explain why DJ needs the final Hadamards — what interference does that superposition alone cannot.
- ☐ Compute the all-zeros amplitude $\tfrac{1}{2^n}\sum_x(-1)^{f(x)}$ and read off constant vs balanced.
- ☐ Build and run a DJ or BV oracle in the live cell, and recover $s$ for a hidden string you pick.
- ☐ State honestly where DJ's advantage holds (deterministic classical) and where it does not (randomized).
- ☐ Name the shared skeleton — superpose, query into phase, interfere to read — that Grover, QPE, and Shor all reuse.
