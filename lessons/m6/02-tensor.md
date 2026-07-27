# Tensor products: how qubits combine

Rule 4, finally: systems combine by **tensor product**. This one operation explains why $n$ qubits need $2^n$ amplitudes, how single-qubit gates act inside big registers, and what it even *means* for qubits to be independent — setting up next lesson's punchline (states that *refuse* to factor: entanglement). It also contains the single most bug-generating convention in practical quantum computing — Qiskit's qubit ordering — which you will conquer today, once, permanently.

## 1. The tensor product of states

Qubit A in $\ket{\psi_A}$, qubit B in $\ket{\psi_B}$: the pair's state is $\ket{\psi_A} \otimes \ket{\psi_B}$. Mechanically, ⊗ multiplies *every amplitude of the first* by *every amplitude of the second*:

$$\begin{pmatrix}a_0\\a_1\end{pmatrix} \otimes \begin{pmatrix}b_0\\b_1\end{pmatrix} = \begin{pmatrix}a_0 b_0\\ a_0 b_1\\ a_1 b_0\\ a_1 b_1\end{pmatrix} \qquad \text{(4 amplitudes: } \ket{00}, \ket{01}, \ket{10}, \ket{11}\text{)}$$

Basis shorthand: $\ket0 \otimes \ket1 = \ket{01}$ (just concatenate labels). The four two-qubit basis states are the four corners of a joint sample space (Module 3 saw them as outcomes; now they're axes).

@@diagram:tensor-grid|Tensor product: every amplitude of A multiplies every amplitude of B — a 2×2 grid of products flattened into 4 amplitudes. Three qubits: a 2×2×2 cube, 8 amplitudes.

**Dimensions multiply.** Two qubits: $2\times2 = 4$. Three: 8. $n$ qubits: $2^n$ — Module 1's violent table, now with a mechanism. Adding ONE qubit *doubles* the amplitude count; this is where quantum state space gets its exponential size, and where classical simulation dies at ~30–40 qubits (Module 7 computes the RAM bill).

**Example** — two qubits, each in $\ket+$:

$$\ket+ \otimes \ket+ = \tfrac12\begin{pmatrix}1\\1\\1\\1\end{pmatrix} = \tfrac12(\ket{00} + \ket{01} + \ket{10} + \ket{11})$$

Uniform superposition over all 4 outcomes — and in general, **n Hadamards make the uniform superposition over all $2^n$ bit-strings**: the "fan out" beat of the algorithm template, now exact.

**Born rule upgrades seamlessly**: $p(\text{bits}) = |\text{amplitude of } \ket{\text{bits}}|^2$; measuring only *some* qubits marginalizes (Module 3's move) and collapses only the measured part.

## 2. Product states, and the question that defines Module 6

A state that CAN be written $\ket{\psi_A}\otimes\ket{\psi_B}$ is a **product state**: each qubit has its own well-defined state; they're statistically independent (joint probabilities factor — Module 3's independence, exactly).

The question with a shocking answer: *can every 4-amplitude state be factored this way?* Test the candidate

$$\ket\Phi = \tfrac{1}{\sqrt2}(\ket{00} + \ket{11})$$

Factoring requires $a_0b_0 = \tfrac{1}{\sqrt2}$, $a_0b_1 = 0$, $a_1b_0 = 0$, $a_1b_1 = \tfrac{1}{\sqrt2}$. From $a_0b_1 = 0$: either $a_0 = 0$ (kills the first equation) or $b_1 = 0$ (kills the last). Contradiction — **no factorization exists**. States like $\ket\Phi$ are **entangled**: the pair has a definite state while neither qubit alone does. Next lesson lives here; today just registers the dichotomy: product = independent, non-product = entangled, and the tensor-product arithmetic decides which.

## 3. Operators combine the same way

Gate $A$ on qubit one and $B$ on qubit two, simultaneously: $A \otimes B$, with the matrix version of the same every-times-every rule (a 4×4 from two 2×2s). The identity fills unused slots — "X on the left qubit, nothing on the right" is $X \otimes I$:

$$X \otimes I = \begin{pmatrix}0&0&1&0\\0&0&0&1\\1&0&0&0\\0&1&0&0\end{pmatrix} \qquad (X\otimes I)\ket{00} = \ket{10} \checkmark$$

Rules that make circuit algebra work (all inherited from "multiply blockwise"):

$$(A\otimes B)(C\otimes D) = AC \otimes BD \qquad (A\otimes B)^\dagger = A^\dagger \otimes B^\dagger \qquad (A\otimes B)(\ket u \otimes\ket v) = A\ket u \otimes B\ket v$$

And the census that explains "why entangling gates": tensor products of unitaries are unitary, but **products $A\otimes B$ can never create entanglement** (they act on each factor separately — a product state stays product). Creating $\ket\Phi$ requires a gate that is NOT of the form $A\otimes B$ — a genuinely two-qubit gate. That's next lesson's CNOT, and it's why every hardware platform's hardest engineering problem is the two-qubit gate.

```python
import numpy as np
ket0 = np.array([1, 0], dtype=complex); ket1 = np.array([0, 1], dtype=complex)
X = np.array([[0,1],[1,0]]); I2 = np.eye(2)

psi = np.kron(ket0, ket1)                     # |01⟩ … or is it? (see Section 4!)
print(psi)                                     # [0 1 0 0] → the |01⟩ slot ✓
XI = np.kron(X, I2)                            # X on the FIRST kron factor
print(XI @ np.kron(ket0, ket0))                # [0 0 1 0] = |10⟩ ✓
plusplus = np.kron((ket0+ket1), (ket0+ket1)) / 2
print(plusplus)                                # [0.5 0.5 0.5 0.5] — uniform ✓
```

## 4. Qiskit's ordering — the convention you must burn in

Here it is, the great generator of wrong histograms. **Qiskit numbers qubits 0, 1, 2, … and puts qubit 0 as the RIGHTMOST bit in labels** (little-endian, like x86 bytes): the label $\ket{q_2 q_1 q_0}$. Consequences:

- The state after `qc.x(0)` on two fresh qubits is $\ket{01}$ — qubit 0 (right bit) flipped. Many textbooks would write the same physical situation as "$\ket{10}$" (their leftmost = qubit 0). **Same physics, mirrored labels.**
- In tensor products, Qiskit's statevector = $\ket{q_{n-1}} \otimes \cdots \otimes \ket{q_1} \otimes \ket{q_0}$ — *qubit 0 is the LAST kron factor*. Your NumPy referee must write `np.kron(state_q1, state_q0)` to match Qiskit for a 2-qubit system.
- Counts dictionaries' bit-strings read the same way: in `{"01": 512}`, the "1" is qubit 0.

@@diagram:qiskit-ordering|Qiskit is little-endian: qubit 0 is the RIGHTMOST label bit and the LAST tensor factor. Textbooks are usually the mirror image. Neither is wrong; mixing them is.

Why little-endian? So bit-string labels read as binary numbers with qubit $k$ carrying value $2^k$ — index 2 of the statevector is label "10" is the number 2. Internally consistent, arguably elegant, endlessly confusing when comparing against big-endian textbooks. The professional protocol: (1) decide the convention per artifact and *write it down*; (2) verify with a one-flip probe (`x(0)` — see which label bit moved); (3) translate at boundaries (`bitstring[::-1]` — the slicing idiom foretold in Module 4).

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
qc = QuantumCircuit(2)
qc.x(0)                                  # flip qubit 0
print(Statevector(qc).probabilities_dict())   # {'01': 1.0}  ← rightmost bit moved
```

## Worked example — a 3-qubit state, built and audited end to end

*Prepare (conceptually) qubit 0 in $\ket+$, qubit 1 in $\ket1$, qubit 2 in $\ket0$; predict everything; then verify against Qiskit.*

**The state** (Qiskit order: $q_2 \otimes q_1 \otimes q_0$):

$$\ket0 \otimes \ket1 \otimes \ket+ = \tfrac{1}{\sqrt2}\big(\ket{010} + \ket{011}\big)$$

**Predictions.** Only labels with $q_2 = 0, q_1 = 1$ get amplitude: outcomes "010" and "011", 50/50. Marginals: $q_2$ always 0; $q_1$ always 1; $q_0$ fair coin. Independence: trivially yes — built as a product.

**Verify:**

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(3)
qc.h(0)          # qubit 0 → |+⟩
qc.x(1)          # qubit 1 → |1⟩
                  # qubit 2 stays |0⟩
sv = Statevector(qc)
print(sv.probabilities_dict())    # {'010': 0.5, '011': 0.5} ✓

# NumPy referee, kron in QISKIT order (q2 ⊗ q1 ⊗ q0):
ket0 = np.array([1,0], dtype=complex); ket1 = np.array([0,1], dtype=complex)
plus = (ket0 + ket1)/np.sqrt(2)
ref = np.kron(ket0, np.kron(ket1, plus))
print(np.allclose(ref, sv.data))  # True — conventions aligned, referee agrees
```

The audit habit on display — predict by hand, build in framework, reconcile with kron-in-the-right-order — is exactly how you'll catch the ordering bugs that WILL otherwise appear the first time you port a textbook circuit into Qiskit.

## Gotchas

- **kron argument order.** `np.kron(A, B)` puts A as the "big-endian" (left/slow) factor. Matching Qiskit's labels means qubit 0 goes LAST. Symptom of getting it backwards: histograms mirrored (e.g., "01" and "10" swapped) — instantly diagnosable with the one-flip probe.
- **⊗ is not commutative.** $\ket0\otimes\ket1 \ne \ket1\otimes\ket0$ (different slots light up). Reordering factors = relabeling qubits — fine if done consistently, catastrophic if done accidentally.
- **Normalizing joint states twice.** If both factors are normalized, the product is automatically normalized ($\lVert u\otimes v\rVert = \lVert u\rVert\,\lVert v\rVert$). Re-dividing by √2 "to be safe" silently breaks the state.
- **Assuming every state factors.** Section 2's contradiction proof generalizes: almost all multi-qubit states are entangled. "What's qubit 1's state?" has NO answer for entangled states — the question itself is malformed (next lesson gives the proper tool: reduced states).
- **Building $A\otimes B$ when you meant "A then B".** Simultaneous different-qubit gates: tensor. Sequential same-qubit gates: matrix product. $H\otimes H$ (two qubits) vs $HH = I$ (one qubit, twice) — dimensionally different objects; confusing them errors loudly at best.
- **Trusting label strings across tools.** Qiskit little-endian, most papers big-endian, some libraries configurable. At every boundary: probe, document, `[::-1]` as needed.

## Scenario — the mirrored histogram postmortem

A student implements the textbook circuit for state $\tfrac{1}{\sqrt2}(\ket{00} + \ket{10})$ (paper convention: left bit = qubit 0), runs it in Qiskit, and gets `{'00': 0.5, '01': 0.5}` — "wrong," files a bug against their own code, loses an evening rewriting correct logic. The postmortem you'd write: the paper's $\ket{10}$ (qubit 0 = 1, qubit 1 = 0) IS Qiskit's `'01'` — the results were correct at first run; only the *reading* was mirrored. Prevention protocol (three lines, zero cost): before any comparison, run the probe `qc.x(0)` and note which side moved; annotate the notebook "Qiskit little-endian: rightmost = q0"; convert external bit-strings once at ingestion (`s[::-1]`), never ad-hoc downstream. Teams institutionalize exactly this; the student who does it in interviews ("first, let me fix the endianness convention…") signals battle scars in the best way.

## Key points

- $\otimes$ multiplies every amplitude by every amplitude: dimensions multiply, $n$ qubits ⇒ $2^n$ amplitudes; labels concatenate ($\ket0\otimes\ket1 = \ket{01}$).
- $H^{\otimes n}\ket{0\cdots0}$ = uniform superposition over all $2^n$ bit-strings — the fan-out stage, exactly.
- Product states factor and are independent; some states (e.g. $\tfrac{1}{\sqrt2}(\ket{00}+\ket{11})$) provably don't factor — entanglement exists, by arithmetic.
- Operators: $A\otimes B$ acts factor-wise; $(A\otimes B)(C\otimes D) = AC\otimes BD$; identity pads unused qubits ($X\otimes I$); tensor-of-unitaries can never entangle — real two-qubit gates required.
- Qiskit is little-endian: qubit 0 = rightmost label bit = LAST kron factor; probe with a single flip, document, translate with `[::-1]` at boundaries.
- The audit workflow: hand-predict → framework-build → kron-referee → reconcile. Ordering bugs die in step 4 instead of in production.

## Check yourself

```quiz
{"q":"How many complex amplitudes describe a general 10-qubit state, and why?","options":["10 — one per qubit","20 — two per qubit","1024 — dimensions multiply: 2¹⁰","100 — ten squared"],"answer":2,"why":"Each added qubit tensor-multiplies the space by 2: 2^10 = 1024 amplitudes. Exponential description size is tensor arithmetic, not mystique."}
```

```quiz
{"q":"In Qiskit, a fresh 2-qubit circuit gets qc.x(0). The resulting probabilities dict is:","options":["{'10': 1.0} — qubit 0 is the left bit","{'01': 1.0} — qubit 0 is the RIGHTMOST bit (little-endian)","{'11': 1.0}","{'00': 1.0} — x(0) is a phase gate"],"answer":1,"why":"Little-endian labels: |q1 q0⟩. Flipping qubit 0 lights the right bit. Most textbooks mirror this — probe once per tool, then translate deliberately."}
```

## Exercises

**Exercise 1 — factor or entangled?** For each state, either exhibit the factorization or prove none exists: (a) $\tfrac12(\ket{00} + \ket{01} + \ket{10} + \ket{11})$; (b) $\tfrac{1}{\sqrt2}(\ket{01} + \ket{10})$; (c) $\tfrac12(\ket{00} + \ket{01} + \ket{10} - \ket{11})$.

````solution
Write amplitudes as the grid $\begin{pmatrix}a_0b_0 & a_0b_1\\ a_1b_0 & a_1b_1\end{pmatrix}$ — a state factors iff this 2×2 amplitude matrix has **rank 1** (rows proportional). This determinant test ($a_{00}a_{11} - a_{01}a_{10} = 0$?) is the professional shortcut.

(a) Grid $\tfrac12\begin{pmatrix}1&1\\1&1\end{pmatrix}$: determinant $= \tfrac14(1-1) = 0$ → **product**: $\ket+\otimes\ket+$ (read a row for one factor, the row-ratios for the other).

(b) Grid $\tfrac{1}{\sqrt2}\begin{pmatrix}0&1\\1&0\end{pmatrix}$: determinant $= -\tfrac12 \ne 0$ → **entangled** (this is the famous singlet-cousin $\ket{\Psi^+}$, next lesson's cast member).

(c) Grid $\tfrac12\begin{pmatrix}1&1\\1&-1\end{pmatrix}$: determinant $= \tfrac14(-1-1) = -\tfrac12 \ne 0$ → **entangled** — despite ALL amplitudes equal in magnitude! Uniform-looking probabilities hide a sign that makes factorization impossible; the phase pattern IS the entanglement. (You may recognize $2\times$this grid as H's matrix — deep, and not a coincidence: this state is what CZ does to $\ket{++}$, next lesson.)

The rank-1/determinant criterion generalizes (Schmidt decomposition) and is your permanent 10-second entanglement test for two qubits.
````

**Exercise 2 — the ordering audit, self-inflicted.** Build in Qiskit: $q_0 \to \ket-$ (H then Z), $q_1 \to \ket1$, $q_2 \to \ket{+i}$ (H then S). (a) Predict the probabilities dict by hand — carefully, in little-endian. (b) Verify with `Statevector`. (c) Reconstruct the same statevector in NumPy via kron and `allclose` it. (d) State which single line of your NumPy code would break if you'd used textbook ordering, and what the symptom would be.

````solution
(a) Magnitudes: $q_2$ and $q_0$ are equatorial (half/half), $q_1$ pinned to 1. Nonzero labels need $q_1 = 1$: labels $x1y$ with $x, y \in\{0,1\}$: "010", "011", "110", "111", each $|\tfrac{1}{\sqrt2}\cdot 1\cdot\tfrac{1}{\sqrt2}|^2 = \tfrac14$. (Phases — the − of $\ket-$ and the i of $\ket{+i}$ — don't touch magnitudes.)

(b)(c)
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(3)
qc.h(0); qc.z(0)          # q0: |−⟩
qc.x(1)                   # q1: |1⟩
qc.h(2); qc.s(2)          # q2: |+i⟩
sv = Statevector(qc)
print({k: round(v,3) for k,v in sv.probabilities_dict().items()})
# {'010': 0.25, '011': 0.25, '110': 0.25, '111': 0.25} ✓

ket0 = np.array([1,0], dtype=complex); ket1 = np.array([0,1], dtype=complex)
minus  = (ket0 - ket1)/np.sqrt(2)
plusi  = (ket0 + 1j*ket1)/np.sqrt(2)
ref = np.kron(plusi, np.kron(ket1, minus))     # q2 ⊗ q1 ⊗ q0 — LITTLE-ENDIAN
print(np.allclose(ref, sv.data))               # True
```

(d) The kron line: textbook ordering would write `np.kron(minus, np.kron(ket1, plusi))`. Symptom: `allclose` False, and the probabilities dict *mirrored* — mass on "010"→ still 010? No: on labels read the other way ("010"↔"010" is a palindrome-ish case, but "011"↔"110" swap) — concretely, probabilities would appear on {'010','110','011','111'}… identical *set* here by symmetry, but the AMPLITUDES' phases would sit on the wrong components, and any subsequent interference computation would silently diverge from Qiskit. Which is the sharpest version of the lesson: **magnitude symmetries can mask ordering bugs; phases and follow-on gates expose them.** Hence: audit with `allclose` on the full complex statevector, not on histograms.
````

## Practice questions

1. Compute $\ket1 \otimes \ket-$ as a 4-vector (either convention — state which).
2. Why is $\lVert u \otimes v\rVert = \lVert u\rVert \lVert v\rVert$? (One line via the every-times-every rule.)
3. Give the 4×4 matrix $I \otimes Z$ and describe its action in words (mind the convention).
4. Show $(H\otimes H)(\ket0\otimes\ket0) = \ket{+}\otimes\ket{+}$ using the factor-wise action rule — no matrices.
5. Why can no sequence of single-qubit gates, however long, entangle two qubits?
6. A counts dict from Qiskit says `{'100': 512, '000': 512}`. Which qubit is in superposition?
7. **Design question:** you must simulate $n$ qubits in NumPy on a laptop with 16 GB RAM (complex128 = 16 bytes/amplitude). Derive the maximum $n$ for (a) storing one statevector, (b) storing statevector + one dense $2^n\times2^n$ gate matrix. Then explain the trick that lets real simulators apply an $X\otimes I\otimes\cdots$ without ever building the big matrix, and estimate its per-gate cost.

````solution
1. Qiskit order ($q_1\otimes q_0$ with $q_1 = \ket1$, $q_0 = \ket-$): $\tfrac{1}{\sqrt2}(0, 0, 1, -1)$ — mass on $\ket{10}, \ket{11}$ with a sign.
2. Norm² of the product = $\sum_{jk}|a_jb_k|^2 = (\sum_j |a_j|^2)(\sum_k |b_k|^2)$ — the double sum factors.
3. $\mathrm{diag}(1, -1, 1, -1)$: flips the phase of components where the RIGHT factor (qubit 0 in Qiskit reading of $I\otimes Z$… careful: in $I\otimes Z$ the Z is the second kron factor = qubit 0) is $\ket1$ — i.e., Z on qubit 0.
4. $(H\otimes H)(\ket0\otimes\ket0) = H\ket0 \otimes H\ket0 = \ket+\otimes\ket+$ — the factor-wise rule in one stroke.
5. Single-qubit gates compose to $A\otimes B$ form (each acts on its own factor); such operators map product states to product states — entanglement requires an interaction coupling the factors.
6. Bits differing across outcomes: leftmost = qubit 2. Qubits 1, 0 are pinned to 0; qubit 2 is the coin.
7. (a) $16\cdot2^n \le 16\times10^9$ → $2^n \le 10^9$ → **n ≈ 29–30** (2³⁰ ≈ 1.07e9 amplitudes ≈ 17 GB — so 29 comfortably, 30 at the edge). (b) The gate matrix needs $16\cdot4^n$ bytes — it dominates catastrophically: $4^n \le 10^9$ → **n ≈ 14–15**. The trick: never materialize $I\otimes\cdots\otimes X\otimes\cdots$; a single-qubit gate on qubit $k$ touches amplitude *pairs* differing only in bit $k$ — loop over $2^{n-1}$ pairs applying the 2×2 matrix to each (in NumPy: reshape the statevector to (…,2,…) and einsum/matmul on one axis). Cost: $O(2^n)$ work per gate and zero extra memory — which is why statevector simulators live at the (a) limit (~30 qubits), not the (b) limit. You've just described the core of every quantum simulator's inner loop, including Aer's.
````
