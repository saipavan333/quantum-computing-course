# The quantum Fourier transform

The QFT is the engine block of quantum computing's most famous results: phase estimation runs on it, Shor's algorithm is essentially one giant QFT sandwich, and quantum arithmetic borrows it constantly. It performs the same mathematical transform as the classical FFT — converting between "values" and "frequencies" — but on $2^n$ amplitudes using only $O(n^2)$ gates, an exponential circuit-size advantage with one enormous asterisk you must be able to explain: the output lives in amplitudes you cannot simply read.

## 1. What it is — the definition, decoded

The QFT on $n$ qubits ($N = 2^n$) maps each basis state to a superposition with frequency-patterned phases:

$$\text{QFT}\ket{j} = \frac{1}{\sqrt N}\sum_{k=0}^{N-1} e^{2\pi i\,jk/N}\,\ket{k}$$

Meet the cast: $e^{2\pi i jk/N} = \omega_N^{jk}$ — the **roots of unity** from the Euler lesson, keeping their long-promised appointment. Reading the map: input $\ket j$ (a number) becomes a state whose $k$-th amplitude *rotates* through the complex plane at frequency $j$ — larger $j$, faster phase-winding across the register. The QFT is a **change of basis**: from the computational basis to the "Fourier basis" of evenly-winding phase patterns.

Two sanity anchors (compute both once by hand for $n = 1, 2$):

- $\text{QFT}\ket{0} = \tfrac{1}{\sqrt N}\sum_k \ket k$ — zero frequency = flat superposition (and for $n=1$, QFT **is** the Hadamard — H was the 1-qubit Fourier transform all along).
- Linearity does the real work: feed a *superposition* with periodic structure, and the QFT concentrates amplitude at the corresponding frequencies — exactly like classical Fourier analysis of a signal, and exactly what Shor needs.

**The inverse** (used more often than the forward in algorithms!): same formula with $e^{-2\pi i jk/N}$; circuit = dagger the gates, reverse the order. "Apply QFT†, then measure" is the standard "read the phases out" idiom — you'll write it in QPE next lesson.

## 2. The product form — why the circuit is small

The magic fact making the QFT cheap: its output *factors* into single-qubit states (no entanglement in the output of a basis-state input!). Writing $j$'s binary as $j_{n-1}\ldots j_0$ and binary fractions $0.j_a j_b\ldots = \tfrac{j_a}{2} + \tfrac{j_b}{4} + \cdots$:

$$\text{QFT}\ket{j} = \bigotimes_{\ell = n-1}^{0} \frac{\ket0 + e^{2\pi i\, (0.j_\ell j_{\ell-1}\ldots j_0)}\ket1}{\sqrt2}$$

Each output qubit carries a phase built from a *suffix* of $j$'s bits: the top qubit sees only $0.j_0$ (coarsest — half-turns), the next sees $0.j_1j_0$ (quarter-turns), and so on, each qubit one binary digit deeper into the phase. This staircase-of-precision structure IS the circuit:

@@diagram:qft-circuit|The QFT circuit: each qubit gets an H (its own bit, a half-turn) then controlled-phase gates CP(π/2ᵏ) adding finer contributions from lower bits — a precision staircase. Final SWAPs fix the reversed output order.

**Circuit recipe** (top qubit to bottom): H on qubit $\ell$, then controlled-$P(\pi/2), P(\pi/4), \ldots$ from each lower qubit (each lower bit contributes its finer fraction), repeat down the register; final layer of SWAPs (the product form emerges bit-reversed — or skip the SWAPs and relabel classically, a standard optimization).

**Gate count**: $n$ H's + $\tfrac{n(n-1)}{2}$ controlled-phases + $\lfloor n/2\rfloor$ SWAPs $= O(n^2)$ — for a transform on $2^n$ amplitudes. The classical FFT costs $O(N\log N) = O(2^n \cdot n)$. Exponential separation in *operation count*… on data you can't freely load or read (Section 4 collects this debt).

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, Operator

def qft(n: int, swaps: bool = True) -> QuantumCircuit:
    qc = QuantumCircuit(n, name=f"QFT{n}")
    for target in reversed(range(n)):            # top of the staircase first
        qc.h(target)
        for source in reversed(range(target)):   # finer contributions from lower bits
            qc.cp(np.pi / 2**(target - source), source, target)
    if swaps:
        for k in range(n // 2):
            qc.swap(k, n - 1 - k)
    return qc

# certify against the definition matrix:
N = 8
F = np.array([[np.exp(2j*np.pi*j*k/N)/np.sqrt(N) for k in range(N)] for j in range(N)]).T
print(np.allclose(Operator(qft(3)).data, F))     # True — circuit == definition ✓
# (Qiskit ships QFT in qiskit.circuit.library — build your own once, then use theirs.)
```

## 3. Watching it work — periodicity in, frequency out

The demonstration that explains Shor one lesson early. Prepare a state with **period 4** on 3 qubits (amplitude on $\ket0$ and $\ket4$), transform, inspect:

```python
psi = np.zeros(8, dtype=complex); psi[0] = psi[4] = 1/np.sqrt(2)   # period r=4
out = Statevector(psi).evolve(qft(3))
print({k: round(v, 3) for k, v in out.probabilities_dict().items() if v > 1e-9})
# {'000': 0.25, '010': 0.25, '100': 0.25, '110': 0.25}
```

Input period $r = 4$ → output support on multiples of $N/r = 2$: frequencies $\{0, 2, 4, 6\}$. Every off-frequency amplitude summed *roots of unity around a full circle* — zero, by the Euler lesson's balance identity. The frequencies survive; the phase-junk cancels; **periodicity became measurable**. Shor's algorithm is: engineer a state whose period encodes the factoring problem, run exactly this, sample frequencies, do classical arithmetic. You've now seen its quantum heart beat.

## 4. The asterisk — what "exponentially faster" doesn't mean

The QFT does NOT give an exponential speedup for classical Fourier analysis of classical data. The three-part honesty, interview-calibrated:

1. **Input debt**: loading an arbitrary $N$-point signal into amplitudes costs $O(N)$ (or needs QRAM that doesn't practically exist) — the Grover database fallacy's twin.
2. **Output debt**: the transformed data sits in amplitudes; reading all $N$ Fourier coefficients requires ~$N$ tomography-grade repetitions. You may only *sample* — one frequency per shot, weighted by $|amplitude|^2$.
3. **The legitimate use**: as a *subroutine* on states that quantum circuits produced cheaply (periodic states from modular arithmetic) where you only need *samples from* the frequency support (enough to extract a period classically). Both debts void; advantage real.

This "cheap transform, expensive I/O" pattern governs half of quantum algorithms (HHL, QML kernels…) — internalize it here and you'll auto-audit every quantum-speedup claim you ever hear, which is a professional skill with a market rate.

## Worked example — approximate QFT: engineering meets mathematics

*The smallest rotation in an n-qubit QFT is $\pi/2^{n-1}$. For n = 20: $\pi/524288 \approx 6\times10^{-6}$ rad — far below hardware gate precision (~10⁻³). Is the QFT doomed on real devices?*

No — and the fix is beautiful: **drop the small rotations**. The approximate QFT (AQFT) keeps only controlled-phases down to $\pi/2^m$ for a cutoff $m \approx \log_2 n + 2$:

- Gate count: $O(n^2) \to O(n\log n)$ — *cheaper than the exact circuit*.
- Error: each dropped $CP(\varepsilon)$ perturbs the unitary by $\lesssim\varepsilon$; total dropped angle sums geometrically to $O(n\cdot 2^{-m})$ — with the recommended cutoff, total error $O(1/n)$: *shrinking* with size.
- On noisy hardware, AQFT beats exact QFT twice over: fewer gates = less noise, AND the dropped gates were doing less than the noise floor anyway.

Verify the claim in twenty lines: build `qft_approx(n, m)` (skip CPs with `target - source >= m`), compare `Operator` distance to exact for n = 6, m = 2..6:

```python
def qft_approx(n, m):
    qc = QuantumCircuit(n)
    for t in reversed(range(n)):
        qc.h(t)
        for s in reversed(range(max(0, t - m + 1), t)):
            qc.cp(np.pi / 2**(t - s), s, t)
    for k in range(n // 2): qc.swap(k, n - 1 - k)
    return qc

exact = Operator(qft(6)).data
for m in range(2, 7):
    approx = Operator(qft_approx(6, m)).data
    # phase-align then measure worst-case deviation:
    err = np.abs(approx - exact).max()
    gates = 6 + sum(min(m - 1, t) for t in range(6))
    print(f"m={m}: max entry error {err:.4f}, CP count {gates - 6}")
# m=3 already lands ~1e-1 → m=5 ~1e-2 territory with ~⅓ fewer CPs
```

The design lesson outranks the numbers: **mathematical exactness and engineering optimality diverge on noisy hardware, and the discipline is quantifying the trade** — precisely what "quantum software engineer" means on the days it pays best.

## Gotchas

- **The bit-reversal ambush.** The product form emerges reversed; implementations either SWAP (gates) or relabel (free, but downstream code must know). Qiskit's library QFT has `do_swaps=False` available — mismatching conventions between your QFT and your QPE readout scrambles results into anagram soup. Decide, document, test with a known input.
- **Little-endian, squared.** QFT phase conventions + Qiskit bit-ordering interact; the reliable oracle is a single test vector (`QFT|1⟩` should show phase winding $e^{2\pi ik/N}$ — check the statevector, not your memory).
- **Expecting to read coefficients.** One shot = one frequency sample. Algorithms are designed around *sampling* the frequency distribution — if your plan says "then we read the spectrum," it isn't a quantum algorithm yet.
- **QFT ≠ Hadamard layer.** $H^{\otimes n}$ equals the QFT only over the group $(\mathbb{Z}_2)^n$ (bitwise phases; DJ/BV's transform); the QFT here is over $\mathbb{Z}_{2^n}$ (arithmetic phases; periods and arithmetic). Confusing the two transforms breaks exactly the algorithms that need the difference (Simon vs Shor!).
- **Controlled-phase convention drift.** $CP(\theta)$ vs $CR_z(\theta)$ differ by that relative-phase fine print (Module 5's warning, third appearance) — inside QFT-as-subroutine-of-QPE, the difference is *not* global and *does* corrupt estimates. Use `cp`.
- **Forgetting the inverse's order reversal.** QFT† = reversed gate order with negated angles — `qc.inverse()` handles it; hand-built inverses with un-reversed order are a classic silent corruption.

## Scenario — the code review on a "quantum FFT accelerator" pitch

A well-funded internal team proposes: "offload our signal-processing FFTs (10⁶-point, 10 kHz batches) to the quantum coprocessor — O(n²) beats O(N log N)!" Your review memo, three paragraphs of this lesson: (1) Input: loading 10⁶ arbitrary samples costs ≥10⁶ operations per batch (no QRAM) — parity with classical FFT before the first quantum gate; (2) Output: they need all coefficients (it feeds a filter) — tomography-grade readout, ~10⁶+ shots per batch, catastrophically worse; (3) The niche that *would* work: if the pipeline only needed the dominant frequency of a state their *other* quantum module already produces, QFT-sampling is exponential gold. Verdict: reject as scoped; redirect to the periodicity-detection subproblem. Attach the two-debts diagram. This memo — recognizing which transform costs live where — is a real genre of document at every company with a quantum team, and being its author is a promotion vector.

## Key points

- $\text{QFT}\ket j = \tfrac{1}{\sqrt N}\sum_k \omega_N^{jk}\ket k$: basis change to phase-winding frequency states; H is its 1-qubit case; inverse = conjugated phases, reversed circuit.
- The product form (each output qubit = one binary-fraction phase) yields the $O(n^2)$ staircase circuit: H + controlled-phases + final SWAPs (or relabeling).
- Periodic input (period r) → output concentrated on multiples of N/r; off-frequencies cancel by roots-of-unity balance — the mechanism Shor rides.
- The two I/O debts (state loading in, amplitude reading out) void naive "exponentially faster FFT" claims; the legitimate role is transforming quantum-native states and *sampling* frequencies.
- AQFT drops sub-noise-floor rotations: $O(n\log n)$ gates, error $O(1/n)$ — exactness and engineering diverge on hardware, quantifiably.
- Convention traps (bit-reversal, endianness, CP-vs-CRz) corrupt silently; certify any QFT implementation against the definition matrix and one winding test vector.

## Check yourself

```quiz
{"q":"A 4-qubit register holds equal amplitude on |0⟩ and |8⟩ (period 8, N=16). After QFT, measurement outcomes concentrate on:","options":["|0⟩ and |8⟩ — QFT preserves them","Multiples of N/r = 2: the even frequencies {0,2,4,...,14}","Only |8⟩","A uniform distribution"],"answer":1,"why":"Period r in ⇒ support on multiples of N/r out (off-frequencies cancel as balanced root-of-unity sums). r=8, N=16 ⇒ spacing 2. Sampling a few such outcomes pins the period — Shor's readout in miniature."}
```

```quiz
{"q":"Why doesn't the QFT's O(n²) circuit make classical spectrum analysis of recorded audio exponentially faster?","options":["It does, once QRAM ships","Loading N classical samples into amplitudes costs O(N), and reading all N output coefficients costs ~N repetitions — both debts erase the gate-count advantage; only quantum-native states with sampling readout benefit","Audio is too noisy for qubits","The QFT only works on periodic signals"],"answer":1,"why":"Cheap transform, expensive I/O. The advantage is real precisely when a quantum process created the state AND the answer needs only frequency samples — the pattern audit that separates real quantum applications from pitch decks."}
```

## Exercises

**Exercise 1 — certify a QFT from scratch.** Build `qft(n)` yourself (no library), then run the three-stage certification: (a) `Operator` equality to the definition matrix for n = 2, 3; (b) the winding test: `QFT|1⟩` for n = 3 — verify the statevector's phases advance by $2\pi/8$ per index (extract with `np.angle`); (c) the period test from Section 3 with r = 2 (amplitudes on 0 and 2... careful: period 2 means support every 2 — use |0⟩+|2⟩+|4⟩+|6⟩) — predict then confirm the output support.

````solution
```python
import numpy as np
from qiskit.quantum_info import Statevector, Operator
# (qft from Section 2)

# (a) matrix certification — done in Section 2 for n=3; repeat for n=2.

# (b) winding test
out = Statevector.from_int(1, 8).evolve(qft(3))
angles = np.angle(out.data)
steps = np.diff(np.unwrap(angles))
print(np.round(steps / (2*np.pi/8), 3))    # [1. 1. 1. 1. 1. 1. 1.] — one unit of 2π/8 per index ✓

# (c) period-2 comb: support {0,2,4,6}
psi = np.zeros(8, dtype=complex); psi[[0,2,4,6]] = 0.5
out = Statevector(psi).evolve(qft(3))
print({k: round(v,3) for k,v in out.probabilities_dict().items() if v > 1e-9})
# {'000': 0.5, '100': 0.5} → frequencies {0, 4} = multiples of N/r = 4 ✓
```

Prediction check for (c): r = 2 ⇒ N/r = 4 ⇒ support on {0, 4} — confirmed, with probability ½ each. Notice the inversion between (b) and (c): a *single* position becomes *all* frequencies with winding phases; a *comb* of positions becomes *few* frequencies. Position-spread ↔ frequency-concentration: the uncertainty-principle seesaw, demonstrated by your own code. Three certifications — matrix, winding, comb — form the permanent test suite for any Fourier-ish circuit you ever write; commit them to your qbench repo.
````

**Exercise 2 — the AQFT trade-off study, hardware-grade.** Complete the Worked example: for n = 8, sweep cutoff m = 2..8, and produce ONE plot with two curves — (i) unitary error vs exact QFT (max entry deviation after phase alignment) and (ii) total CP-gate count — plus a third dashed horizontal line at a "hardware noise floor" of 0.01 per gate × count (a crude noise proxy: gates × 0.01). Identify the m where approximation error dips below accumulated-noise proxy: the engineering optimum. Report it and defend the crossover logic.

````solution
```python
import numpy as np, matplotlib.pyplot as plt
from qiskit.quantum_info import Operator
# (qft, qft_approx from the lesson)

n = 8
exact = Operator(qft(n)).data
ms, errs, counts = [], [], []
for m in range(2, n + 1):
    A = Operator(qft_approx(n, m)).data
    # align global phase before comparing:
    phase = np.vdot(A.ravel(), exact.ravel()); A = A * (phase/abs(phase)).conjugate()
    ms.append(m)
    errs.append(np.abs(A - exact).max())
    counts.append(sum(min(m - 1, t) for t in range(n)))

noise_proxy = [0.01 * c for c in counts]
fig, ax1 = plt.subplots()
ax1.semilogy(ms, errs, "o-", label="approximation error")
ax1.semilogy(ms, noise_proxy, "s--", label="noise proxy (0.01 × CP count)")
ax1.set_xlabel("cutoff m"); ax1.set_ylabel("error (log)"); ax1.legend(); ax1.grid(alpha=0.3)
ax2 = ax1.twinx(); ax2.plot(ms, counts, "^:", color="gray"); ax2.set_ylabel("CP gates")
plt.title("AQFT: approximation vs noise — the engineering optimum")
plt.show()
for m, e, c in zip(ms, errs, counts):
    print(f"m={m}: err={e:.4f}, CPs={c}, noise≈{0.01*c:.2f}")
```

Typical crossover: approximation error plunges ~4× per unit m (each kept level halves the largest dropped angle... roughly geometric), while the noise proxy *rises* linearly with gate count — they cross around **m ≈ 4–5 for n = 8**: beyond it, every added CP gate contributes more noise than it removes approximation error. Defense of the logic: total infidelity ≈ approximation² + accumulated gate noise; minimizing the sum means stopping where marginal contributions equalize — the universal engineering-optimum argument (it will reappear verbatim in Module 9's zero-noise extrapolation and Module 10's code-distance choices). The plot itself — two curves crossing, optimum annotated — is a portfolio-grade figure: it demonstrates the exact judgment (quantified approximation under a noise budget) that distinguishes quantum engineers from quantum enthusiasts.
````

## Practice questions

1. Write out the QFT matrix for n = 1 and confirm it's H; for N = 4, give the matrix entries as powers of i.
2. Why does the QFT of a basis state contain no entanglement, and why doesn't that make the QFT "classically easy" in general?
3. Count exactly: gates in an exact QFT for n = 10 (H's, CPs, SWAPs).
4. Explain the bit-reversal: where in the derivation does the order flip, and what are the two standard remedies?
5. Your QPE (next lesson) gives garbage; the QFT† subcircuit was hand-written. Name the three convention checks, in the order you'd run them.
6. State the two I/O debts and give one algorithm that legitimately avoids both.
7. **Design question:** design a "QFT certification harness" for your qbench repo: the three test classes from Exercise 1 plus an AQFT parametrized test, tolerances for each, and which tests run per-commit vs nightly (CI budget logic from Module 7).

````solution
1. n=1: $\tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ = H ✓. N=4: entries $\tfrac12 i^{jk}$ — rows of powers of i cycling with period 4.
2. The product form factors it into single-qubit states — but the *transform as an operator* still mixes all $2^n$ amplitudes of superposed inputs; entanglement-free outputs on basis inputs ≠ cheap action on arbitrary states (where input states themselves may be entangled and the interference is global).
3. 10 H + 45 CP + 5 SWAP = 60 gates (and 45 + 15×3-if-decomposed… quote logical counts: 60).
4. The product form's derivation peels bits from least-significant upward, emitting output qubits most-significant-first — order inverted relative to input labeling. Remedies: n/2 SWAPs in-circuit, or classical relabeling (free) with documented convention.
5. (i) `Operator` vs definition matrix (catches everything at small n); (ii) CP-vs-CRz audit (relative-phase corruption under control); (iii) swap/bit-order convention vs the consuming code's expectation (winding test vector end-to-end).
6. Debts: amplitude loading of classical data; full-spectrum readout. Avoider: Shor — the periodic state is *computed* (modular exponentiation, cheap), and only frequency *samples* are needed (period extraction classical). QPE likewise.
7. Model: per-commit — matrix equality n ≤ 4 (atol 1e-10; milliseconds), winding test n = 3 (phase steps within 1e-9), comb test r ∈ {2,4} (support exact, probs atol 1e-9); nightly — matrix n = 6–8 (seconds-to-minutes), AQFT sweep asserting error(m) monotone-decreasing and error(m=log₂n+2) < 2/n (the theory bound with slack), plus an inverse-composition test QFT·QFT† ≡ I at n = 8. Tolerances split by mathematical (1e-9/1e-10 — float dust only) vs theory-bound (2/n — model with slack) — mirroring exact-vs-statistical test tiers from the SWE lesson. Per-commit stays under a second; nightly owns the big-n matrix builds: the same budget logic as every serious CI, now applied to a transform you built from Euler's formula upward.
````
