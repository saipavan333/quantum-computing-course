# Inner products, norms & Dirac notation

Every quantum paper, textbook, and library docstring is written in one notation: Dirac's bras and kets. People who "know the concepts" but stumble on $\braket{\phi}{\psi}$ read the literature at half speed forever. This lesson finishes the inner product properly (the complex version has one crucial twist), then installs Dirac notation as muscle memory. After today you read $\bra{0}H\ket{+}$ the way you read arithmetic.

## 1. The complex inner product — dot product with a twist

For real vectors, Lesson 4's dot product measured overlap. Naively copying it to complex vectors breaks: $\binom{i}{0}\cdot\binom{i}{0} = i^2 = -1$, a *negative* "squared length." Unacceptable — lengths must be real and non-negative.

The fix: **conjugate the first vector's entries**. For $\vec u, \vec v \in \mathbb{C}^2$:

$$\langle u, v\rangle = u_1^*\,v_1 + u_2^*\,v_2$$

Now self-overlap works: $\langle u, u\rangle = |u_1|^2 + |u_2|^2 \ge 0$, real, and zero only for the zero vector. The norm is $\lVert u\rVert = \sqrt{\langle u,u\rangle}$ — sum of modulus-squares, square-rooted, exactly the normalization quantity you've computed since Module 1.

Properties (the twist propagates):

| Property | Statement | Watch out |
|---|---|---|
| Conjugate symmetry | $\langle u, v\rangle = \langle v, u\rangle^*$ | swapping order conjugates the answer |
| Linear in the **second** slot | $\langle u, av + bw\rangle = a\langle u,v\rangle + b\langle u,w\rangle$ | scalars pull out clean |
| **Anti**linear in the first | $\langle au, v\rangle = a^*\langle u, v\rangle$ | scalars pull out **conjugated** |
| Norm link | $\langle u,u\rangle = \lVert u\rVert^2$ | real, ≥ 0 |

(Physics convention: second slot linear. Math books often flip it. Qiskit, and this course, use the physics convention.)

## 2. Kets, bras, and the bracket

Dirac's notation makes the inner product's bookkeeping automatic.

**Ket** $\ket\psi$: a column vector — the state, as you know it.

$$\ket\psi = \begin{pmatrix}\alpha\\\beta\end{pmatrix}$$

**Bra** $\bra\psi$: the ket's **conjugate transpose** — a *row* vector with conjugated entries:

$$\bra\psi = \begin{pmatrix}\alpha^* & \beta^*\end{pmatrix} = \ket\psi^\dagger$$

**Bra(c)ket** $\braket{\phi}{\psi}$: bra times ket — a row times a column — which is a 1×1 result, i.e. a **number**: exactly the inner product, conjugation included for free:

$$\braket{\phi}{\psi} = \begin{pmatrix}\phi_1^* & \phi_2^*\end{pmatrix}\begin{pmatrix}\psi_1\\\psi_2\end{pmatrix} = \phi_1^*\psi_1 + \phi_2^*\psi_2$$

@@diagram:braket-anatomy|The anatomy: bra ⟨φ| is a conjugated row, ket |ψ⟩ is a column; their meeting ⟨φ|ψ⟩ is a single complex number — the overlap.

The names are a physicist's joke — "bra" + "ket" = "bracket" — and the notation earns it: **whenever a bra meets a ket, they collapse into a number.** Conjugate symmetry becomes typographical: $\braket{\phi}{\psi} = \braket{\psi}{\phi}^*$.

The dagger rules you need (all inherited from Lesson 7's $(AB)^\dagger = B^\dagger A^\dagger$):

$$(\ket\psi)^\dagger = \bra\psi \qquad (a\ket\psi)^\dagger = a^*\bra\psi \qquad (M\ket\psi)^\dagger = \bra\psi M^\dagger$$

## 3. The vocabulary in action — reading the standard sentences

**Normalization** is one symbol shorter now: $\braket{\psi}{\psi} = 1$.

**Orthonormal basis**, Dirac-style: $\braket{0}{0} = \braket{1}{1} = 1$, $\braket{0}{1} = 0$. Compact form: $\braket{i}{j} = \delta_{ij}$ (the Kronecker delta: 1 if $i=j$, else 0).

**Amplitudes are overlaps with basis states** — the adult form of "components are dot products":

$$\ket\psi = \alpha\ket0 + \beta\ket1 \quad\Longrightarrow\quad \alpha = \braket{0}{\psi}, \quad \beta = \braket{1}{\psi}$$

Proof in one line: $\braket{0}{\psi} = \alpha\braket{0}{0} + \beta\braket{0}{1} = \alpha$. (Linearity in the ket slot + orthonormality. Every Dirac computation is this move repeated.)

**The Born rule** (Module 5's headline, notation-ready today): the probability that state $\ket\psi$, measured in an orthonormal basis containing $\ket\phi$, yields outcome $\phi$ is

$$p(\phi) = |\braket{\phi}{\psi}|^2$$

Overlap, modulus-squared. You have now seen the central formula of quantum mechanics, and every piece of it is arithmetic you've done for weeks.

**Sandwiches**: $\bra\phi M \ket\psi$ (bra, matrix, ket) is a number — compute $M\ket\psi$ first, then bracket with $\bra\phi$. Read it as "the $\phi$-component of $M$ applied to $\psi$." Expressions like $\bra\psi M\ket\psi$ ("expectation values," Module 9's bread and butter) are this sandwich with the same state on both sides.

## 4. Outer products — ket times bra (preview that pays rent)

Reverse the order — column times row — and instead of a number you get a **matrix**:

$$\ket0\!\bra0 = \begin{pmatrix}1\\0\end{pmatrix}\begin{pmatrix}1 & 0\end{pmatrix} = \begin{pmatrix}1&0\\0&0\end{pmatrix}$$

$\ket\phi\bra\phi$ is the **projector** onto $\ket\phi$ — feed it any state and it returns the $\phi$-component: $(\ket\phi\bra\phi)\ket\psi = \ket\phi\braket{\phi}{\psi}$ (watch the bra-ket in the middle collapse to a number!). Two facts to pocket:

- **Completeness**: $\ket0\bra0 + \ket1\bra1 = I$ — projecting onto every basis direction and summing reassembles the whole vector. Inserting $I$ in this disguised form is *the* trick of quantum algebra.
- Matrices can be *written* in Dirac: $X = \ket0\bra1 + \ket1\bra0$ (check: it sends $\ket1 \to \ket0$ and $\ket0 \to \ket1$ — read each term as "output ket × input detector").

```python
import numpy as np
ket0 = np.array([[1], [0]], dtype=complex)   # column vectors (2x1)
ket1 = np.array([[0], [1]], dtype=complex)
psi  = (np.sqrt(3)/2)*ket0 + (1j/2)*ket1     # α=√3/2, β=i/2

bra0 = ket0.conj().T                          # bra = dagger of ket
alpha = (bra0 @ psi)[0, 0]                    # ⟨0|ψ⟩ → 1x1 matrix → scalar
print(alpha)                                  # (0.8660254037844386+0j)
print(abs((ket1.conj().T @ psi)[0,0])**2)     # p(1) = |⟨1|ψ⟩|² = 0.25

P0 = ket0 @ bra0                              # outer product: projector |0⟩⟨0|
print(P0)                                     # [[1.+0.j 0.+0.j] [0.+0.j 0.+0.j]]
print(P0 + ket1 @ ket1.conj().T)              # completeness → identity
```

## Worked example — a full Dirac computation, narrated

*Compute $p(+)$ — the probability that $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1$ measured in the ± basis yields "+".*

**Set up the overlap.** $\ket+ = \tfrac{1}{\sqrt2}(\ket0 + \ket1)$, so $\bra+ = \tfrac{1}{\sqrt2}(\bra0 + \bra1)$ — real coefficients survive conjugation untouched.

**Expand by linearity, collapse brackets:**

$$\braket{+}{\psi} = \tfrac{1}{\sqrt2}\left(\bra0 + \bra1\right)\left(\tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1\right) = \tfrac{1}{\sqrt2}\left(\tfrac{\sqrt3}{2}\underbrace{\braket{0}{0}}_{1} + \tfrac{i}{2}\underbrace{\braket{0}{1}}_{0} + \tfrac{\sqrt3}{2}\underbrace{\braket{1}{0}}_{0} + \tfrac{i}{2}\underbrace{\braket{1}{1}}_{1}\right)$$

$$= \tfrac{1}{\sqrt2}\left(\tfrac{\sqrt3}{2} + \tfrac{i}{2}\right) = \tfrac{\sqrt3 + i}{2\sqrt2}$$

**Modulus-squared** (conjugate multiply — never naive squaring, Lesson 5's law):

$$p(+) = \left|\tfrac{\sqrt3 + i}{2\sqrt2}\right|^2 = \frac{|\sqrt3 + i|^2}{8} = \frac{3 + 1}{8} = \frac12$$

A tidy 50%. Notice the $i$ *mattered*: with $\beta = \tfrac12$ instead of $\tfrac{i}{2}$, you'd get $p(+) = \tfrac{(\sqrt3+1)^2}{8} \approx 93.3\%$ (last lesson's exercise!). **Relative phase changed the ±-basis statistics while leaving standard-basis statistics untouched** — the promised concrete demonstration that phase is physical, delivered entirely by notation you now own.

## Gotchas

- **Dropping the conjugate in bras.** $\ket\psi = \binom{i}{0}$ has $\bra\psi = (-i \;\; 0)$, not $(i \;\; 0)$. Symptom of forgetting: "probabilities" that come out complex or negative. The conjugate is not decoration.
- **$\braket{\phi}{\psi}$ vs $\braket{\psi}{\phi}$.** They're conjugates of each other — same modulus (so probabilities forgive the swap) but different phases (so amplitudes do not). Keep order straight in multi-step derivations.
- **Treating $\ket\psi\bra\phi$ as a number.** Ket-bra is a matrix (outer); bra-ket is a number (inner). The order of the funny brackets tells you which — read before you compute.
- **Normalizing with naive squares.** $\braket{\psi}{\psi} = |\alpha|^2 + |\beta|^2$ — modulus-squares. For $\alpha = \tfrac{1+i}{2}$: contribution $\tfrac12$, not $\tfrac{(1+i)^2}{4} = \tfrac{i}{2}$.
- **1×1 matrix ≠ scalar in NumPy.** `bra @ ket` on 2D arrays returns `[[z]]`; index `[0,0]` (or use 1-D arrays with `np.vdot(u, v)` — which conjugates its FIRST argument, matching physics convention; plain `np.dot` does not conjugate and silently betrays you on complex inputs).
- **Reading $\bra\phi M\ket\psi$ right-to-left as a chore.** Parse it as a pipeline: state $\ket\psi$, transformed by $M$, probed against $\phi$. Fluency is reading meaning, not just symbols.

## Scenario — the code review that caught a physics bug

A pull request implements state overlap for a fidelity metric: `overlap = np.dot(psi1, psi2)`. Tests pass — because every test state has real amplitudes. The reviewer (you, after this lesson) spots it: `np.dot` doesn't conjugate, so for complex states this computes $\sum \psi_{1,k}\psi_{2,k}$, not $\braket{\psi_1}{\psi_2}$. Proof-of-bug in one line: `psi = np.array([1j, 0])`, where `np.dot(psi, psi)` returns $-1$ — a "fidelity" of −1 for a state with itself, which should be exactly 1. Fix: `np.vdot(psi1, psi2)` (conjugates the first argument) or `psi1.conj() @ psi2`. One character of review, one class of silent wrong-answers prevented — and precisely the kind of bug that ships when a team knows NumPy better than it knows bras.

## Key points

- Complex inner product conjugates the first vector: $\langle u,v\rangle = \sum u_k^* v_k$; self-overlap is then real ≥ 0 and equals $\lVert u\rVert^2$.
- Bra = dagger of ket (conjugated row); bra·ket = number (overlap); ket·bra = matrix (projector/building block).
- Amplitudes are overlaps: $\alpha = \braket{0}{\psi}$; Born rule: $p(\phi) = |\braket{\phi}{\psi}|^2$.
- Orthonormal basis in one line: $\braket{i}{j} = \delta_{ij}$; completeness: $\sum_i \ket i\bra i = I$.
- Every Dirac derivation is the same two moves: expand by linearity, collapse $\braket{i}{j}$ to 0 or 1.
- NumPy: `np.vdot` conjugates (physics-correct); `np.dot` doesn't — complex states demand the former.

## Check yourself

```quiz
{"q":"For |ψ⟩ with amplitudes (i/√2, 1/√2), what is ⟨ψ| as a row?","options":["(i/√2, 1/√2)","(−i/√2, 1/√2) — conjugate every entry, write as a row","(1/√2, i/√2)","(−i/√2, −1/√2)"],"answer":1,"why":"Bra = conjugate transpose. The i conjugates to −i; the real entry is fixed. Forgetting this conjugation is the #1 Dirac error."}
```

```quiz
{"q":"⟨φ|ψ⟩ = 0.6i. What is |⟨ψ|φ⟩|², the probability in the reversed direction?","options":["−0.36","0.36 — reversing conjugates the amplitude, and modulus-squared is unchanged","0.6","Cannot be determined"],"answer":1,"why":"⟨ψ|φ⟩ = (0.6i)* = −0.6i, and |−0.6i|² = 0.36 = |0.6i|². Overlap direction matters for the phase, never for the probability."}
```

## Exercises

**Exercise 1 — bracket gymnastics.** With $\ket\psi = \tfrac{1}{\sqrt2}\binom{1}{i}$ and $\ket\phi = \tfrac{1}{\sqrt2}\binom{1}{-i}$: compute (a) $\braket{\psi}{\psi}$, (b) $\braket{\phi}{\psi}$, (c) $p(\phi)$ if $\ket\psi$ is measured in a basis containing $\ket\phi$. Then (d) verify (b) with `np.vdot` and with the wrong `np.dot`, and explain the discrepancy.

````solution
(a) $\braket{\psi}{\psi} = \tfrac12\left(1^*\cdot1 + i^*\cdot i\right) = \tfrac12(1 + (-i)(i)) = \tfrac12(1+1) = 1$ ✓ normalized.

(b) $\braket{\phi}{\psi} = \tfrac12\left(1\cdot 1 + (-i)^*\cdot i\right) = \tfrac12(1 + i\cdot i) = \tfrac12(1 - 1) = 0$.

(c) $p(\phi) = |0|^2 = 0$ — these states are orthogonal: measured in the $\{\ket\phi, \ket\psi\}$ basis, $\ket\psi$ *never* comes out as $\phi$. (You've met them: the $\ket{\pm i}$ pair, the Y-basis.)

(d)
```python
import numpy as np
psi = np.array([1, 1j])/np.sqrt(2)
phi = np.array([1, -1j])/np.sqrt(2)
print(np.vdot(phi, psi))   # 0j            — correct: conjugates first arg
print(np.dot(phi, psi))    # (1+0j)        — WRONG: no conjugation
```
`np.dot` computed $\tfrac12(1\cdot1 + (-i)(i)) = 1$ — it treated the $-i$ as-is instead of conjugating it to $+i$… wait, check the arithmetic: without conjugation the second term is $(-i)(i) = -i^2 = +1$, total 1. With conjugation it's $(+i)(i) = -1$, total 0. One conjugate: the difference between "orthogonal" and "identical." Let the shock of that gap install the habit: **complex overlaps get `vdot`, always.**
````

**Exercise 2 — write a gate in Dirac, then use it.** The gate $S = \ket0\bra0 + i\ket1\bra1$. (a) Write $S$ as a 2×2 matrix. (b) Compute $S\ket+$ using pure Dirac algebra (no matrices), simplifying to a recognizable state. (c) What did $S$ do, in phase language?

````solution
(a) $\ket0\bra0 = \begin{pmatrix}1&0\\0&0\end{pmatrix}$, $\ket1\bra1 = \begin{pmatrix}0&0\\0&1\end{pmatrix}$, so $S = \begin{pmatrix}1&0\\0&i\end{pmatrix}$.

(b) Dirac all the way:
$$S\ket+ = \left(\ket0\bra0 + i\ket1\bra1\right)\tfrac{1}{\sqrt2}(\ket0 + \ket1) = \tfrac{1}{\sqrt2}\left(\ket0\underbrace{\braket{0}{0}}_{1} + \ket0\underbrace{\braket{0}{1}}_{0} + i\ket1\underbrace{\braket{1}{0}}_{0} + i\ket1\underbrace{\braket{1}{1}}_{1}\right) = \tfrac{1}{\sqrt2}\left(\ket0 + i\ket1\right)$$

That's the $\ket{+i}$ state from Exercise 1 — S turned the X-basis state into the Y-basis state.

(c) S applied a **relative phase of $i = e^{i\pi/2}$** (a quarter turn) to the $\ket1$ component only. Standard-basis probabilities: untouched (50/50 before and after). ±-basis statistics: transformed completely (from "certainly +" to 50/50 — check via $|\braket{+}{+i}|^2 = \tfrac12$ if you want the drill). Phase gates edit the invisible ink; interference-basis measurements read it. That's quantum computing's whole gimmick, computed by hand.
````

## Practice questions

1. Compute $\braket{1}{\psi}$ for $\ket\psi = 0.8\ket0 + 0.6i\ket1$, and the associated probability.
2. Show, in two lines of Dirac algebra, that $(\ket0\bra0 + \ket1\bra1)\ket\psi = \ket\psi$ for any state.
3. What object is $\ket+\bra-$ — number or matrix? Write it out explicitly.
4. Why is $\braket{\psi}{\psi}$ guaranteed real even though the amplitudes are complex?
5. Evaluate the sandwich $\bra0 X\ket1$ where $X = \ket0\bra1 + \ket1\bra0$.
6. A colleague's fidelity function returns 1.3 for two normalized states. Name the two most likely bugs, this lesson's edition.
7. **Design question:** define the "phase detector" measurement basis $\{\ket{+i}, \ket{-i}\}$ (from Exercise 1). Compute the outcome statistics for the three states $\ket0$, $\ket+$, and $\tfrac{1}{\sqrt2}(\ket0 + i\ket1)$, and explain what this basis "detects" that the other two famous bases miss.

````solution
1. $\braket{1}{\psi} = 0.6i$; $p(1) = |0.6i|^2 = 0.36$.
2. $\ket0\braket{0}{\psi} + \ket1\braket{1}{\psi} = \alpha\ket0 + \beta\ket1 = \ket\psi$ — completeness reassembles the state from its projections.
3. Matrix (ket·bra): $\tfrac12\begin{pmatrix}1\\1\end{pmatrix}(1\;-1) = \tfrac12\begin{pmatrix}1&-1\\1&-1\end{pmatrix}$.
4. It's $\sum|\text{amplitude}|^2$ — a sum of modulus-squares, each real ≥ 0 by the $zz^*$ identity.
5. $X\ket1 = \ket0$, so $\bra0 X\ket1 = \braket{0}{0} = 1$.
6. Missing conjugation (`dot` instead of `vdot`) and/or unnormalized inputs (forgot to divide by norms). Both inflate overlaps past legal bounds.
7. Overlaps with $\ket{+i} = \tfrac{1}{\sqrt2}(\ket0 + i\ket1)$: for $\ket0$: $|\tfrac{1}{\sqrt2}|^2 = \tfrac12$ (50/50 — blind). For $\ket+$: $\braket{+i}{+} = \tfrac12(1 + (-i)) = \tfrac{1-i}{2}$, modulus² $= \tfrac12$ (50/50 — blind again). For $\tfrac{1}{\sqrt2}(\ket0+i\ket1) = \ket{+i}$ itself: probability 1 (certain). The Y-basis detects the **±i relative phase** — the quarter-turn phases that both the computational basis (which sees only moduli) and the ± basis (which sees only the real part of the phase) are blind to. Three bases, three complementary "questions": full state identification requires all three — which is precisely quantum state tomography, an actual daily task in hardware labs.
````
