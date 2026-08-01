# Tensor products: how qubits combine

Rule 4, finally: systems combine by **tensor product**. This one operation explains why $n$ qubits need $2^n$ amplitudes, how single-qubit gates act inside big registers, and what it even *means* for qubits to be independent — setting up next lesson's punchline (states that *refuse* to factor: entanglement). It also contains the single most bug-generating convention in practical quantum computing — Qiskit's qubit ordering — which you'll conquer today, once, permanently.

## Start here — the intuition

Combining qubits means **multiplying their descriptions together**. One qubit needs 2 numbers; two qubits need $2\times2 = 4$; three need 8; $n$ need $2^n$. Every qubit you add *doubles* the amplitude count — and that is the entire source of quantum computing's exponential state space (and why a laptop dies simulating ~30–40 qubits).

Most combined states are "boring" in a good way: they **factor** into "this qubit is doing X and that qubit is doing Y" — a **product state**, where the qubits are independent. But — and this is the whole point of Module 6 — *some* states refuse to factor. The pair has a perfectly definite joint state while *neither qubit alone has a state of its own*. Those are **entangled** states, and the tensor‑product arithmetic is what tells product from entangled. (Plus one convention that causes every beginner's first "wrong" histogram: Qiskit numbers qubit 0 as the **rightmost** bit.)

## The tensor product

Qubit A in $\ket{\psi_A}$, qubit B in $\ket{\psi_B}$: the pair is $\ket{\psi_A}\otimes\ket{\psi_B}$, where $\otimes$ multiplies *every amplitude of the first by every amplitude of the second*:

$$\begin{pmatrix}a_0\\a_1\end{pmatrix} \otimes \begin{pmatrix}b_0\\b_1\end{pmatrix} = \begin{pmatrix}a_0 b_0\\ a_0 b_1\\ a_1 b_0\\ a_1 b_1\end{pmatrix}, \qquad \ket0\otimes\ket1 = \ket{01}$$

@@diagram:tensor-grid|Tensor product: every amplitude of A multiplies every amplitude of B — a 2×2 grid of products flattened into 4 amplitudes. Three qubits: a 2×2×2 cube, 8 amplitudes.

@@widget

Dimensions multiply, so $n$ Hadamards make the uniform superposition over all $2^n$ bit‑strings — the "fan out" beat of the algorithm template, exact. And operators combine the same way: $A$ on one qubit and $B$ on another is $A\otimes B$ (with $X\otimes I$ = "X on the left qubit, nothing on the right"). A crucial census: **a product of single‑qubit gates $A\otimes B$ can never create entanglement** — it acts on each factor separately, so a product state stays product. Making an entangled state *requires* a genuinely two‑qubit gate (next lesson's CNOT), which is why the two‑qubit gate is every hardware platform's hardest engineering problem.

## Predict, then run — product vs entangled, and the ordering trap

The live cell builds a product state and an entangled one, so you can see the difference and Qiskit's little‑endian labels.

**Predict first.** The first circuit sets qubit 0 to $\ket+$ and qubit 1 to $\ket1$. Since qubit 0 is the *rightmost* label bit, which two labels will light up? Guess, then Run.

```run
# Live cell — combining qubits. Little-endian: qubit 0 is the RIGHTMOST label bit.
import numpy as np

# Product state: q0 = |+>, q1 = |1>  -> only labels with q1 = 1 appear
qc = QuantumCircuit(2)
qc.h(0)        # q0 -> |+>
qc.x(1)        # q1 -> |1>
print("product |1>|+> :", {k: round(v,3) for k,v in qc.probabilities().items()})

# Entangled state: H then CNOT -> a Bell pair, which cannot be factored
qc = QuantumCircuit(2); qc.h(1); qc.cx(1, 0)
print("Bell (H, CNOT) :", {k: round(v,3) for k,v in qc.probabilities().items()})
```

The product state lights `'10'` and `'11'` (qubit 1 pinned to 1, qubit 0 a coin). The Bell state lights only `'00'` and `'11'` — the two qubits *always agree*, perfectly correlated, yet neither has a state of its own. That refusal to factor is entanglement, and the 10‑second test is: **write the four amplitudes as a $2\times2$ grid — it factors iff that grid has rank 1** (i.e. $a_{00}a_{11} = a_{01}a_{10}$). The Bell grid $\tfrac{1}{\sqrt2}\begin{pmatrix}1&0\\0&1\end{pmatrix}$ has determinant $\tfrac12 \neq 0$ — entangled.

```quiz
{"q":"In Qiskit, a fresh 2-qubit circuit gets qc.x(0). The resulting probabilities dict is:","options":["{'10': 1.0} — qubit 0 is the left bit","{'01': 1.0} — qubit 0 is the RIGHTMOST bit (little-endian)","{'11': 1.0}","{'00': 1.0} — x(0) is a phase gate"],"answer":1,"why":"Little-endian labels: |q1 q0⟩. Flipping qubit 0 lights the right bit. Most textbooks mirror this — probe once per tool, then translate deliberately."}
```

## Qiskit's ordering — burn it in

**Qiskit numbers qubits 0, 1, 2, … and puts qubit 0 as the RIGHTMOST bit** (little‑endian): the label is $\ket{q_{n-1}\cdots q_1 q_0}$, and the statevector is $\ket{q_{n-1}}\otimes\cdots\otimes\ket{q_0}$ — *qubit 0 is the LAST kron factor*. So a NumPy referee must write `np.kron(state_q1, state_q0)` to match. Most textbooks are the mirror image (their leftmost = qubit 0) — neither is wrong, but mixing them generates wrong histograms.

@@diagram:qiskit-ordering|Qiskit is little-endian: qubit 0 is the RIGHTMOST label bit and the LAST tensor factor. Textbooks are usually the mirror image. Neither is wrong; mixing them is.

The professional protocol: (1) decide the convention per artifact and write it down; (2) verify with a one‑flip probe (`x(0)` — see which bit moved); (3) translate at boundaries with `bitstring[::-1]`.

## Level up — gotchas the pros watch for

- **kron argument order.** `np.kron(A, B)` puts A as the left (slow) factor; matching Qiskit means qubit 0 goes *last*. Backwards → mirrored histograms.
- **⊗ is not commutative.** $\ket0\otimes\ket1 \neq \ket1\otimes\ket0$ (different slots). Reordering factors = relabeling qubits.
- **Double normalization.** If both factors are normalized, the product already is ($\lVert u\otimes v\rVert = \lVert u\rVert\lVert v\rVert$) — re‑dividing breaks it.
- **"What's qubit 1's state?" for an entangled pair.** It has no answer — the question is malformed (next lesson gives the proper tool, reduced states).
- **$A\otimes B$ vs "A then B."** Simultaneous different‑qubit gates: tensor. Sequential same‑qubit gates: matrix product. $H\otimes H$ (two qubits) $\neq HH = I$ (one qubit twice).

## Level up — the mirrored-histogram postmortem

A student implements the textbook circuit for $\tfrac{1}{\sqrt2}(\ket{00}+\ket{10})$ (paper: left bit = qubit 0), runs it in Qiskit, gets `{'00':0.5, '01':0.5}`, files a bug against their own correct code, loses an evening. The postmortem: the paper's $\ket{10}$ (qubit 0 = 1) *is* Qiskit's `'01'` — the results were right; only the reading was mirrored. Prevention: probe with `x(0)`, annotate "Qiskit little‑endian: rightmost = q0", and convert external strings once with `[::-1]`. The candidate who says in an interview "first, let me fix the endianness convention…" signals battle scars in the best way.

## Key points

- $\otimes$ multiplies every amplitude by every amplitude: dimensions multiply, $n$ qubits ⇒ $2^n$ amplitudes; labels concatenate.
- $H^{\otimes n}\ket{0\cdots0}$ = uniform superposition over all $2^n$ bit‑strings — the fan‑out stage.
- Product states factor and are independent; some states (e.g. $\tfrac{1}{\sqrt2}(\ket{00}+\ket{11})$) provably don't — entanglement, by arithmetic (the rank‑1 grid test).
- Operators: $A\otimes B$ acts factor‑wise and can never entangle — a real two‑qubit gate is required.
- Qiskit is little‑endian: qubit 0 = rightmost bit = last kron factor; probe, document, `[::-1]` at boundaries.

## Check yourself

```quiz
{"q":"How many complex amplitudes describe a general 10-qubit state, and why?","options":["10 — one per qubit","20 — two per qubit","1024 — dimensions multiply: 2¹⁰","100 — ten squared"],"answer":2,"why":"Each added qubit tensor-multiplies the space by 2: 2^10 = 1024 amplitudes. Exponential description size is tensor arithmetic, not mystique."}
```

## Exercises

**Exercise 1 — factor or entangled?** Use the rank‑1 grid test ($a_{00}a_{11} = a_{01}a_{10}$?) on: (a) $\tfrac12(\ket{00}+\ket{01}+\ket{10}+\ket{11})$; (b) $\tfrac{1}{\sqrt2}(\ket{01}+\ket{10})$; (c) $\tfrac12(\ket{00}+\ket{01}+\ket{10}-\ket{11})$.

````solution
(a) Grid $\tfrac12\begin{pmatrix}1&1\\1&1\end{pmatrix}$, det 0 → **product** ($\ket+\otimes\ket+$). (b) Grid $\tfrac{1}{\sqrt2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$, det $\neq 0$ → **entangled**. (c) Grid $\tfrac12\begin{pmatrix}1&1\\1&-1\end{pmatrix}$, det $= -\tfrac12 \neq 0$ → **entangled** — despite all amplitudes equal in magnitude! The *sign* makes factorization impossible; the phase pattern IS the entanglement (this is what CZ does to $\ket{++}$).
````

**Exercise 2 — the ordering audit.** In the live cell, build $q_0 = \ket-$ (`h` then `z`), $q_1 = \ket1$ (`x`), and print probabilities. Predict the labels first (little‑endian!), then confirm. Which labels light, and why don't the $\ket-$ phase and the flip change the *magnitudes*?

````solution
$q_1$ pinned to 1, $q_0$ equatorial → labels `'10'` and `'11'`, each $0.5$. The $-$ sign of $\ket-$ is a phase; it moves the state on the Bloch sphere but leaves $|\alpha|^2, |\beta|^2$ untouched, so Z‑basis magnitudes are unchanged — the phase only shows up under interference or an X/Y‑basis measurement.
````

## Practice questions

1. Compute $\ket1\otimes\ket-$ as a 4‑vector (state the convention).
2. Why is $\lVert u\otimes v\rVert = \lVert u\rVert\lVert v\rVert$?
3. Give $I\otimes Z$ and describe its action.
4. Show $(H\otimes H)(\ket0\otimes\ket0) = \ket+\otimes\ket+$ with the factor‑wise rule, no matrices.
5. Why can no sequence of single‑qubit gates entangle two qubits?
6. A counts dict says `{'100': 512, '000': 512}`. Which qubit is in superposition?
7. **Design question:** simulating $n$ qubits in NumPy with 16 GB RAM (16 bytes/amplitude): max $n$ for (a) one statevector, (b) statevector + a dense $2^n\times2^n$ gate. Then explain how real simulators apply $X\otimes I\otimes\cdots$ without building the big matrix.

````solution
1. Qiskit order ($q_1\otimes q_0$): $\tfrac{1}{\sqrt2}(0,0,1,-1)$.
2. $\sum_{jk}|a_jb_k|^2 = (\sum_j|a_j|^2)(\sum_k|b_k|^2)$ — the double sum factors.
3. $\mathrm{diag}(1,-1,1,-1)$ = Z on qubit 0 (the last kron factor): flips the phase of components with $q_0 = 1$.
4. $(H\otimes H)(\ket0\otimes\ket0) = H\ket0\otimes H\ket0 = \ket+\otimes\ket+$.
5. They compose to $A\otimes B$ form, which maps product states to product states — entanglement needs an interaction coupling the factors.
6. Leftmost bit varies → qubit 2 is the coin; qubits 1, 0 pinned to 0.
7. (a) $16\cdot2^n \le 16\times10^9 \Rightarrow n \approx 29$–$30$. (b) The gate needs $16\cdot4^n$ bytes → $n \approx 14$–$15$. The trick: a single‑qubit gate on qubit $k$ only mixes amplitude *pairs* differing in bit $k$; loop over $2^{n-1}$ pairs applying the $2\times2$ matrix — $O(2^n)$ work, no big matrix. That's every statevector simulator's inner loop, so they live at the ~30‑qubit (a) limit, not the (b) limit.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Compute a tensor product of two qubit states and say why $n$ qubits need $2^n$ amplitudes.
- ☐ Tell a product state from an entangled one with the rank‑1 grid test.
- ☐ Explain why single‑qubit gates ($A\otimes B$) can never entangle.
- ☐ Run the live cell and read little‑endian labels correctly.
- ☐ State Qiskit's ordering and the three‑step protocol (probe, document, `[::-1]`).
- ☐ Explain why "what is qubit 1's state?" is malformed for an entangled pair.
