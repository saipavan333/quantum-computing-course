# The quantum Fourier transform

The QFT is the engine block of quantum computing's most famous results: phase estimation runs on it, Shor's algorithm is essentially one giant QFT sandwich, and quantum arithmetic borrows it constantly. It performs the same transform as the classical FFT — converting between "values" and "frequencies" — but on $2^n$ amplitudes using only $O(n^2)$ gates. That's an exponential circuit-size advantage with one enormous asterisk you must be able to explain: the output lives in amplitudes you cannot simply read.

## Start here — the intuition

A prism takes white light and splits it into its colors — its frequencies. A Fourier transform does the same to any signal: it tells you *which repeating patterns* are hiding inside it. Play a chord and a Fourier transform names the notes.

The quantum Fourier transform does this to a quantum state's amplitudes. Its single most important job in this course: if a state secretly *repeats with some period* $r$, the QFT turns that hidden rhythm into a **sharp, measurable spike** at the matching frequency. That is the whole trick behind Shor's algorithm — hide the factoring problem inside a period, then let the QFT expose it. Everything below builds the transform and shows that rhythm‑to‑spike conversion happening in a live cell.

## What it is — the definition, decoded

The QFT on $n$ qubits ($N = 2^n$) maps each basis state to a superposition with frequency‑patterned phases:

$$\text{QFT}\ket{j} = \frac{1}{\sqrt N}\sum_{k=0}^{N-1} e^{2\pi i\,jk/N}\,\ket{k}$$

Meet the cast: $e^{2\pi i jk/N} = \omega_N^{jk}$ — the **roots of unity** from the Euler lesson, keeping their long‑promised appointment. Reading the map: input $\ket j$ becomes a state whose $k$‑th amplitude *rotates* through the complex plane at frequency $j$ — larger $j$, faster phase‑winding across the register. The QFT is a **change of basis**: from the computational basis to the "Fourier basis" of evenly‑winding phase patterns.

Two anchors to hold: $\text{QFT}\ket{0} = \tfrac{1}{\sqrt N}\sum_k \ket k$ (zero frequency = flat superposition — and for $n=1$, the QFT *is* the Hadamard); and by linearity, a *superposition* with periodic structure gets its amplitude concentrated at the matching frequencies. **The inverse** (used more often than the forward!): same formula with $e^{-2\pi i jk/N}$; circuit = dagger the gates, reverse the order. "Apply QFT†, then measure" is the standard "read the phases out" idiom you'll write in QPE next lesson.

## The one picture: a precision staircase

The fact that makes the QFT cheap: its output *factors* into single‑qubit states (a basis‑state input produces no entanglement). With $j = j_{n-1}\ldots j_0$ and binary fractions $0.j_a j_b\ldots = \tfrac{j_a}{2} + \tfrac{j_b}{4} + \cdots$:

$$\text{QFT}\ket{j} = \bigotimes_{\ell = n-1}^{0} \frac{\ket0 + e^{2\pi i\, (0.j_\ell j_{\ell-1}\ldots j_0)}\ket1}{\sqrt2}$$

Each output qubit carries a phase built from a *suffix* of $j$'s bits: the top qubit sees only $0.j_0$ (coarsest — half‑turns), the next sees $0.j_1j_0$ (quarter‑turns), each qubit one binary digit deeper. This staircase‑of‑precision *is* the circuit: H on a qubit (its own bit), then controlled‑phase gates $CP(\pi/2^k)$ adding finer contributions from lower bits, repeated down the register, with final SWAPs to fix the reversed order.

@@diagram:qft-circuit|The QFT circuit: each qubit gets an H (its own bit, a half-turn) then controlled-phase gates CP(π/2ᵏ) adding finer contributions from lower bits — a precision staircase. Final SWAPs fix the reversed output order.

@@widget

**Gate count:** $n$ H's + $\tfrac{n(n-1)}{2}$ controlled‑phases + $\lfloor n/2\rfloor$ SWAPs $= O(n^2)$ — for a transform on $2^n$ amplitudes. The classical FFT costs $O(N\log N) = O(2^n \cdot n)$. Exponential separation in *operation count* — on data you can't freely load or read (the asterisk section collects this debt).

## Predict, then run — periodicity in, frequency out

This is the demonstration that explains Shor a lesson early, and it's live below. We prepare a state with **period 4** on 3 qubits (equal amplitude on $\ket0$ and $\ket4$ — an H on qubit 2 makes exactly that), run the QFT, and read the probabilities.

**Predict first.** Period $r = 4$ in a register of size $N = 8$. The QFT concentrates amplitude on multiples of $N/r$. What spacing, and how many peaks? Write it down, then Run.

```run
# Live cell — edit and Run. The QFT is H + controlled-phase (cp) + swap.
import numpy as np

def qft(qc, n):
    for t in reversed(range(n)):
        qc.h(t)                               # this qubit's own bit (a half-turn)
        for s in reversed(range(t)):
            qc.cp(np.pi / 2**(t - s), s, t)   # finer phase from each lower bit
    for k in range(n // 2):
        qc.swap(k, n - 1 - k)                 # undo the bit-reversal

qc = QuantumCircuit(3)
qc.h(2)                                       # prepare (|0> + |4>)/sqrt2  -> period r = 4
qft(qc, 3)
for state, p in sorted(qc.probabilities().items()):
    if p > 1e-9:
        print(state, round(p, 3))
# period r=4 in -> peaks at multiples of N/r = 2: 000, 010, 100, 110 (0.25 each)
```

Four equal peaks, spaced by $N/r = 2$. Every *off*‑frequency amplitude summed roots of unity around a full circle — zero, by the Euler lesson's balance identity. The frequencies survive; the phase‑junk cancels; **periodicity became measurable.** Shor's algorithm is exactly this: engineer a state whose period encodes the factoring problem, run this, sample the frequencies, finish with classical arithmetic. You've now seen its quantum heart beat.

A second quick check — the winding test. `QFT|1⟩` should make each amplitude's phase advance by one step of $2\pi/8$ per index:

```run
import numpy as np
def qft(qc, n):
    for t in reversed(range(n)):
        qc.h(t)
        for s in reversed(range(t)): qc.cp(np.pi / 2**(t - s), s, t)
    for k in range(n // 2): qc.swap(k, n - 1 - k)

qc = QuantumCircuit(3); qc.x(0); qft(qc, 3)   # prepare |1>, then QFT
steps = np.round(np.diff(np.unwrap(np.angle(qc.statevector()))) / (2*np.pi/8), 3)
print("phase step per index (units of 2pi/8):", steps)   # all 1.0 -> clean winding
```

## The asterisk — what "exponentially faster" doesn't mean

The QFT does NOT give an exponential speedup for classical Fourier analysis of classical data. The three‑part honesty, interview‑calibrated:

1. **Input debt:** loading an arbitrary $N$‑point signal into amplitudes costs $O(N)$ (or needs QRAM that doesn't practically exist) — the Grover database fallacy's twin.
2. **Output debt:** the transformed data sits in amplitudes; reading all $N$ Fourier coefficients requires ~$N$ tomography‑grade repetitions. You may only *sample* — one frequency per shot, weighted by $|\text{amplitude}|^2$.
3. **The legitimate use:** as a *subroutine* on states that quantum circuits produced cheaply (periodic states from modular arithmetic) where you only need *samples from* the frequency support. Both debts void; advantage real.

This "cheap transform, expensive I/O" pattern governs half of quantum algorithms (HHL, QML kernels…) — internalize it here and you'll auto‑audit every quantum‑speedup claim you ever hear.

## Level up — approximate QFT: engineering meets mathematics

*The smallest rotation in an $n$‑qubit QFT is $\pi/2^{n-1}$. For $n = 20$: $\pi/524288 \approx 6\times10^{-6}$ rad — far below hardware gate precision (~$10^{-3}$). Is the QFT doomed on real devices?*

No — and the fix is beautiful: **drop the small rotations.** The approximate QFT (AQFT) keeps only controlled‑phases down to $\pi/2^m$ for a cutoff $m \approx \log_2 n + 2$:

- Gate count: $O(n^2) \to O(n\log n)$ — *cheaper than the exact circuit.*
- Error: each dropped $CP(\varepsilon)$ perturbs the unitary by $\lesssim\varepsilon$; total dropped angle sums geometrically to $O(n\cdot 2^{-m})$ — with the recommended cutoff, total error $O(1/n)$: *shrinking* with size.
- On noisy hardware, AQFT beats exact QFT twice: fewer gates = less noise, AND the dropped gates were doing less than the noise floor anyway.

```python
def qft_approx(n, m):
    qc = QuantumCircuit(n)
    for t in reversed(range(n)):
        qc.h(t)
        for s in reversed(range(max(0, t - m + 1), t)):
            qc.cp(np.pi / 2**(t - s), s, t)
    for k in range(n // 2): qc.swap(k, n - 1 - k)
    return qc
```

The design lesson outranks the numbers: **mathematical exactness and engineering optimality diverge on noisy hardware, and the discipline is quantifying the trade** — precisely what "quantum software engineer" means on the days it pays best.

## Level up — gotchas the pros watch for

- **The bit‑reversal ambush.** The product form emerges reversed; implementations either SWAP (gates) or relabel (free, but downstream code must know). Mismatching conventions between your QFT and your QPE readout scrambles results into anagram soup. Decide, document, test with a known input.
- **Little‑endian, squared.** QFT phase conventions and qubit‑ordering interact; the reliable oracle is a single test vector (the winding test above), not your memory.
- **Expecting to read coefficients.** One shot = one frequency sample. If your plan says "then we read the spectrum," it isn't a quantum algorithm yet.
- **QFT ≠ Hadamard layer.** $H^{\otimes n}$ equals the QFT only over $(\mathbb{Z}_2)^n$ (bitwise phases; DJ/BV's transform); the QFT here is over $\mathbb{Z}_{2^n}$ (arithmetic phases; periods). Confusing the two breaks exactly the algorithms that need the difference (Simon vs Shor).
- **Controlled‑phase convention drift.** $CP(\theta)$ vs $CR_z(\theta)$ differ by a relative phase; inside QFT‑as‑subroutine‑of‑QPE that difference is *not* global and *does* corrupt estimates. Use `cp`.
- **Forgetting the inverse's order reversal.** QFT† = reversed gate order with negated angles; hand‑built inverses with un‑reversed order are a classic silent corruption.

## Level up — the code review on a "quantum FFT accelerator" pitch

A well‑funded team proposes: "offload our signal‑processing FFTs ($10^6$‑point, 10 kHz batches) to the quantum coprocessor — $O(n^2)$ beats $O(N\log N)$!" Your review memo, three paragraphs of this lesson: (1) Input — loading $10^6$ arbitrary samples costs $\ge 10^6$ operations per batch (no QRAM): parity with classical FFT before the first quantum gate; (2) Output — they need all coefficients (it feeds a filter): tomography‑grade readout, catastrophically worse; (3) The niche that *would* work — if the pipeline only needed the dominant frequency of a state their *other* quantum module already produces, QFT‑sampling is exponential gold. Verdict: reject as scoped; redirect to the periodicity‑detection subproblem. Recognizing which transform costs live where is a real genre of document at every company with a quantum team.

## Key points

- $\text{QFT}\ket j = \tfrac{1}{\sqrt N}\sum_k \omega_N^{jk}\ket k$: basis change to phase‑winding frequency states; H is its 1‑qubit case; inverse = conjugated phases, reversed circuit.
- The product form (each output qubit = one binary‑fraction phase) yields the $O(n^2)$ staircase circuit: H + controlled‑phases + final SWAPs (or relabeling).
- Periodic input (period $r$) → output concentrated on multiples of $N/r$; off‑frequencies cancel by roots‑of‑unity balance — the mechanism Shor rides.
- The two I/O debts (state loading in, amplitude reading out) void naive "exponentially faster FFT" claims; the legitimate role is transforming quantum‑native states and *sampling* frequencies.
- AQFT drops sub‑noise‑floor rotations: $O(n\log n)$ gates, error $O(1/n)$ — exactness and engineering diverge on hardware, quantifiably.
- Convention traps (bit‑reversal, endianness, CP‑vs‑CRz) corrupt silently; certify any QFT against the definition matrix and one winding test vector.

## Check yourself

```quiz
{"q":"A 4-qubit register holds equal amplitude on |0⟩ and |8⟩ (period 8, N=16). After QFT, measurement outcomes concentrate on:","options":["|0⟩ and |8⟩ — QFT preserves them","Multiples of N/r = 2: the even frequencies {0,2,4,...,14}","Only |8⟩","A uniform distribution"],"answer":1,"why":"Period r in ⇒ support on multiples of N/r out (off-frequencies cancel as balanced root-of-unity sums). r=8, N=16 ⇒ spacing 2. Sampling a few such outcomes pins the period — Shor's readout in miniature."}
```

```quiz
{"q":"Why doesn't the QFT's O(n²) circuit make classical spectrum analysis of recorded audio exponentially faster?","options":["It does, once QRAM ships","Loading N classical samples into amplitudes costs O(N), and reading all N output coefficients costs ~N repetitions — both debts erase the gate-count advantage; only quantum-native states with sampling readout benefit","Audio is too noisy for qubits","The QFT only works on periodic signals"],"answer":1,"why":"Cheap transform, expensive I/O. The advantage is real precisely when a quantum process created the state AND the answer needs only frequency samples — the pattern audit that separates real quantum applications from pitch decks."}
```

## Exercises

**Exercise 1 — certify a QFT from scratch.** Using the live cell's `qft`, run three certifications: (a) the winding test for $n=3$ (phases advance by $2\pi/8$ per index — the second live cell already shows this); (b) `QFT|0⟩` is the flat superposition (probability $1/8$ each); (c) the period test with a period‑2 comb (support on $\{0,2,4,6\}$) — predict the output frequencies, then confirm.

````solution
```python
# (c) period-2 comb on 3 qubits: amplitudes on 0,2,4,6.
# In the in-browser sim, prepare it and QFT:
import numpy as np
qc = QuantumCircuit(3)
qc.h(1)          # (|0>+|2>)/sqrt2 ... but a full comb {0,2,4,6} = H on qubits 1 and 2:
qc.h(2)          # now equal amplitude on {0,2,4,6} (qubit 0 stays |0>)
def qft(qc, n):
    for t in reversed(range(n)):
        qc.h(t)
        for s in reversed(range(t)): qc.cp(np.pi/2**(t-s), s, t)
    for k in range(n//2): qc.swap(k, n-1-k)
qft(qc, 3)
print({k: round(v,3) for k,v in qc.probabilities().items() if v>1e-9})
# period r=2 (comb spacing 2) -> N/r = 4 -> support {000, 100} = frequencies {0,4}, 0.5 each
```

Prediction for (c): comb spacing $2$ means period $r = 2$, so $N/r = 4$ ⇒ support on $\{0, 4\}$, probability $\tfrac12$ each. Notice the seesaw between the winding test and this one: a *single* position becomes *all* frequencies with winding phases; a *comb* of positions becomes *few* frequencies. Position‑spread ↔ frequency‑concentration — the uncertainty principle, demonstrated by your own code.
````

**Exercise 2 — the AQFT trade‑off study.** Using `qft_approx(n, m)` from the level‑up section, sweep the cutoff $m = 2\ldots n$ for $n = 8$ and reason about the engineering optimum: approximation error falls as you keep more rotations, but each extra controlled‑phase adds hardware noise. Where do they cross?

````solution
```python
import numpy as np
# Conceptually (verified with Qiskit's Operator off-device):
# approximation error drops ~geometrically per kept level, while a noise proxy
# (0.01 x CP-count) rises linearly -> they cross around m ≈ 4-5 for n = 8.
# Beyond that, each added CP contributes more noise than approximation error it removes.
```

Total infidelity ≈ approximation² + accumulated gate noise; minimizing the sum means stopping where marginal contributions equalize — the universal engineering‑optimum argument that reappears in Module 9's zero‑noise extrapolation and Module 10's code‑distance choices. Being able to *quantify* an approximation under a noise budget is what distinguishes quantum engineers from quantum enthusiasts.
````

## Practice questions

1. Write out the QFT matrix for $n = 1$ and confirm it's H; for $N = 4$, give the entries as powers of $i$.
2. Why does the QFT of a basis state contain no entanglement, and why doesn't that make the QFT "classically easy" in general?
3. Count exactly: gates in an exact QFT for $n = 10$ (H's, CPs, SWAPs).
4. Explain the bit‑reversal: where in the derivation does the order flip, and what are the two standard remedies?
5. Your QPE (next lesson) gives garbage; the QFT† subcircuit was hand‑written. Name the three convention checks, in the order you'd run them.
6. State the two I/O debts and give one algorithm that legitimately avoids both.
7. **Design question:** design a "QFT certification harness" for your qbench repo: the three test classes above plus an AQFT parametrized test, tolerances for each, and which tests run per‑commit vs nightly.

````solution
1. $n=1$: $\tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ = H. $N=4$: entries $\tfrac12 i^{jk}$ — rows of powers of $i$ cycling with period 4.
2. The product form factors it into single‑qubit states on *basis* inputs — but as an operator it still mixes all $2^n$ amplitudes of superposed inputs; entanglement‑free outputs on basis inputs $\neq$ cheap action on arbitrary (possibly entangled) states.
3. $10$ H $+ 45$ CP $+ 5$ SWAP $= 60$ logical gates.
4. The product form peels bits least‑significant upward, emitting output qubits most‑significant‑first — order inverted. Remedies: $n/2$ SWAPs in‑circuit, or classical relabeling (free) with documented convention.
5. (i) matrix vs definition (catches everything at small $n$); (ii) CP‑vs‑CRz audit (relative‑phase corruption under control); (iii) swap/bit‑order convention vs the consuming code (end‑to‑end winding vector).
6. Debts: amplitude loading of classical data; full‑spectrum readout. Avoider: Shor — the periodic state is *computed* cheaply and only frequency *samples* are needed; QPE likewise.
7. Per‑commit: matrix equality $n \le 4$ (atol $10^{-10}$), winding test $n=3$ (steps within $10^{-9}$), comb test $r \in \{2,4\}$ (support exact). Nightly: matrix $n = 6$–$8$, AQFT sweep asserting error monotone‑decreasing and error at $m = \log_2 n + 2$ below $2/n$, plus an inverse‑composition test $\text{QFT}\cdot\text{QFT}^\dagger \equiv I$ at $n = 8$. Split tolerances by mathematical ($10^{-9}$, float dust) vs theory‑bound ($2/n$, model with slack) — the exact‑vs‑statistical test tiers from the SWE lesson.
````

## Mastery checklist — you are ready to move on when you can

- ☐ State the QFT definition and explain "frequency" as phase‑winding speed across the register.
- ☐ Build the QFT from H + controlled‑phase + swap, and say what each piece contributes.
- ☐ Predict the output frequencies for any periodic input (multiples of $N/r$) and confirm it in the live cell.
- ☐ Explain the two I/O debts, and judge whether a proposed "quantum FFT" application is real or a pitch.
- ☐ Say why AQFT can beat the exact QFT on real hardware, in one sentence about the noise floor.
- ☐ Name the three convention traps (bit‑reversal, endianness, CP‑vs‑CRz) and the test that catches each.
