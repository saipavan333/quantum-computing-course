# Inner products, norms & Dirac notation

Every quantum paper, textbook, and library docstring is written in one notation: Dirac's bras and kets. People who "know the concepts" but stumble on $\braket{\phi}{\psi}$ read the literature at half speed forever. This lesson finishes the inner product properly (the complex version has one crucial twist), then installs Dirac notation as muscle memory. After today you read $\bra{0}H\ket{+}$ the way you read arithmetic.

## Start here — the intuition

Dirac notation is just a very clean way to write "overlap." A **ket** $\ket\psi$ is a column vector — a state. A **bra** $\bra\psi$ is its mirror‑image row (conjugate every entry). And when a bra meets a ket, $\braket{\phi}{\psi}$, they **collapse into a single number** — the overlap between the two states, i.e. "how much of $\phi$ is in $\psi$." That's the whole notation: bra + ket = bracket = a number.

Why you care: the **Born rule**, the central formula of quantum mechanics, is just this overlap, magnitude‑squared — $p(\phi) = |\braket{\phi}{\psi}|^2$. Everything you measure is an overlap you square. There is one twist that trips up everyone once: for complex vectors the inner product **conjugates the first vector** (so that a state's overlap with itself is a real, non‑negative length). In code that means `np.vdot`, never `np.dot`.

## The complex inner product and the bracket

Naively, $\binom{i}{0}\cdot\binom{i}{0} = i^2 = -1$ — a negative "length," unacceptable. The fix: conjugate the first vector, $\langle u, v\rangle = \sum_k u_k^* v_k$. Then $\langle u,u\rangle = \sum |u_k|^2 \ge 0$ is the norm‑squared. Dirac makes this automatic: the **bra** $\bra\psi = \ket\psi^\dagger$ is the conjugated row, and $\braket{\phi}{\psi} = \sum_k \phi_k^* \psi_k$ is bra times ket — a number.

@@diagram:braket-anatomy|The anatomy: bra ⟨φ| is a conjugated row, ket |ψ⟩ is a column; their meeting ⟨φ|ψ⟩ is a single complex number — the overlap.

@@widget

The standard sentences become one‑liners: normalization $\braket{\psi}{\psi} = 1$; orthonormal basis $\braket{i}{j} = \delta_{ij}$; **amplitudes are overlaps** $\alpha = \braket{0}{\psi}$; and the **Born rule** $p(\phi) = |\braket{\phi}{\psi}|^2$. Every Dirac computation is the same two moves: expand by linearity, then collapse each $\braket{i}{j}$ to 0 or 1. Reverse the order — ket times bra — and you get a **matrix**: $\ket\phi\bra\phi$ is the **projector** onto $\ket\phi$, and completeness $\ket0\bra0 + \ket1\bra1 = I$ is the identity in disguise.

## Predict, then run — overlaps, the Born rule, and the `dot` trap

**Predict first.** For $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1$, what is the amplitude $\braket{0}{\psi}$, and the probability $|\braket{1}{\psi}|^2$? And what should $\braket{\psi}{\psi}$ equal? Guess, then Run.

```run
# Live cell — bra-ket = a number (overlap); amplitudes are overlaps; Born rule = |<b|psi>|^2.
import numpy as np
ket0 = np.array([1,0], complex); ket1 = np.array([0,1], complex)
psi = (np.sqrt(3)/2)*ket0 + (1j/2)*ket1          # sqrt3/2 |0> + i/2 |1>

# amplitude alpha = <0|psi>. Use vdot: it conjugates the FIRST argument (physics convention).
print("<0|psi> =", np.round(np.vdot(ket0, psi), 3), "  <1|psi> =", np.round(np.vdot(ket1, psi), 3))
print("normalized <psi|psi> =", round(np.vdot(psi, psi).real, 6))
print("Born rule  p(1) = |<1|psi>|^2 =", round(abs(np.vdot(ket1, psi))**2, 3))

# THE bug: np.dot does NOT conjugate -> wrong for complex states.
a = np.array([1j, 0])
print("\n<a|a>: vdot (correct) =", np.vdot(a, a), "   dot (WRONG) =", np.dot(a, a))
```

The amplitudes fall out as overlaps, the state is normalized, $p(1) = \tfrac14$, and — the punchline — `np.vdot(a,a)` gives the correct $1$ while `np.dot(a,a)` gives $-1$ (a "length" of $-1$!) because it skipped the conjugate. One character of difference between "orthogonal" and "identical"; use `vdot` for complex overlaps, always.

```quiz
{"q":"⟨φ|ψ⟩ = 0.6i. What is |⟨ψ|φ⟩|², the probability in the reversed direction?","options":["−0.36","0.36 — reversing conjugates the amplitude, and modulus-squared is unchanged","0.6","Cannot be determined"],"answer":1,"why":"⟨ψ|φ⟩ = (0.6i)* = −0.6i, and |−0.6i|² = 0.36 = |0.6i|². Overlap direction matters for the phase, never for the probability."}
```

## A full Dirac computation, narrated

Compute $p(+)$ for $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1$ in the ± basis. With $\bra+ = \tfrac{1}{\sqrt2}(\bra0 + \bra1)$, expand and collapse: $\braket{+}{\psi} = \tfrac{1}{\sqrt2}\big(\tfrac{\sqrt3}{2}\cdot1 + \tfrac{i}{2}\cdot1\big) = \tfrac{\sqrt3 + i}{2\sqrt2}$, so $p(+) = \tfrac{|\sqrt3+i|^2}{8} = \tfrac{3+1}{8} = \tfrac12$. Notice the $i$ *mattered*: with $\beta = \tfrac12$ instead you'd get $p(+) \approx 93\%$. **Relative phase changed the ±‑basis statistics while leaving standard‑basis statistics untouched** — phase is physical, delivered entirely by notation you now own.

## Level up — gotchas the pros watch for

- **Dropping the conjugate in bras.** $\ket\psi = \binom{i}{0}$ has $\bra\psi = (-i\ \ 0)$; forgetting it makes "probabilities" complex or negative.
- **$\braket{\phi}{\psi}$ vs $\braket{\psi}{\phi}$.** Conjugates of each other — same modulus (probabilities forgive) but different phase (amplitudes don't).
- **Ket‑bra vs bra‑ket.** Ket·bra is a matrix (projector); bra·ket is a number (overlap) — the order of brackets tells you which.
- **1×1 matrix ≠ scalar in numpy.** `bra @ ket` on 2D arrays returns `[[z]]`; prefer 1‑D arrays with `np.vdot` (conjugates the first arg).
- **`np.dot` on complex states.** It doesn't conjugate — silently wrong; use `np.vdot` or `a.conj() @ b`.

## Level up — the code review that caught a physics bug

A PR implements a fidelity metric as `overlap = np.dot(psi1, psi2)`. Tests pass — because every test state is real. You spot it: `np.dot` doesn't conjugate, so for complex states it computes the wrong thing. Proof in one line: `psi = np.array([1j, 0])` gives `np.dot(psi, psi) = -1` — a self‑fidelity of $-1$ that should be $1$. Fix: `np.vdot(psi1, psi2)`. One character of review, one class of silent wrong answers prevented — exactly the bug that ships when a team knows numpy better than it knows bras.

## Key points

- Complex inner product conjugates the first vector: $\langle u,v\rangle = \sum u_k^* v_k$; self‑overlap is real ≥ 0 and equals $\lVert u\rVert^2$.
- Bra = dagger of ket; bra·ket = number (overlap); ket·bra = matrix (projector).
- Amplitudes are overlaps ($\alpha = \braket{0}{\psi}$); Born rule $p(\phi) = |\braket{\phi}{\psi}|^2$.
- Orthonormal basis $\braket{i}{j} = \delta_{ij}$; completeness $\sum_i\ket i\bra i = I$.
- Every Dirac derivation = expand by linearity, collapse $\braket{i}{j}$ to 0 or 1.
- numpy: `np.vdot` conjugates (physics‑correct); `np.dot` doesn't.

## Check yourself

```quiz
{"q":"For |ψ⟩ with amplitudes (i/√2, 1/√2), what is ⟨ψ| as a row?","options":["(i/√2, 1/√2)","(−i/√2, 1/√2) — conjugate every entry, write as a row","(1/√2, i/√2)","(−i/√2, −1/√2)"],"answer":1,"why":"Bra = conjugate transpose. The i conjugates to −i; the real entry is fixed. Forgetting this conjugation is the #1 Dirac error."}
```

## Exercises

**Exercise 1 — bracket gymnastics.** In the live cell, with $\ket\psi = \tfrac{1}{\sqrt2}\binom{1}{i}$ and $\ket\phi = \tfrac{1}{\sqrt2}\binom{1}{-i}$: compute $\braket{\psi}{\psi}$, $\braket{\phi}{\psi}$, and $p(\phi)$. Then confirm with `np.vdot` and watch `np.dot` give the wrong answer.

````solution
```python
import numpy as np
psi = np.array([1, 1j])/np.sqrt(2); phi = np.array([1, -1j])/np.sqrt(2)
print(np.vdot(psi,psi), np.vdot(phi,psi))   # 1, 0  (orthogonal!)
print(np.dot(phi,psi))                       # 1 -- WRONG (no conjugate)
```
$\braket{\psi}{\psi} = 1$; $\braket{\phi}{\psi} = \tfrac12(1 + (-i)^*\cdot i) = \tfrac12(1 + i\cdot i) = 0$, so $p(\phi) = 0$ — they're orthogonal (the $\ket{\pm i}$ / Y‑basis pair). `np.dot` skipped the conjugate and returned 1: one conjugate is the difference between "orthogonal" and "identical."
````

**Exercise 2 — a gate in Dirac.** The gate $S = \ket0\bra0 + i\ket1\bra1$. Write it as a matrix, then compute $S\ket+$ with pure Dirac algebra. What did $S$ do in phase language?

````solution
$S = \begin{pmatrix}1&0\\0&i\end{pmatrix}$. $S\ket+ = \tfrac{1}{\sqrt2}(\ket0 + i\ket1) = \ket{+i}$. $S$ applied a relative phase of $i = e^{i\pi/2}$ to the $\ket1$ component: standard‑basis probabilities untouched, ±‑basis statistics transformed. Phase gates edit the invisible ink; interference‑basis measurements read it.
````

## Practice questions

1. Compute $\braket{1}{\psi}$ for $\ket\psi = 0.8\ket0 + 0.6i\ket1$ and its probability.
2. Show in two lines that $(\ket0\bra0 + \ket1\bra1)\ket\psi = \ket\psi$.
3. Is $\ket+\bra-$ a number or a matrix? Write it out.
4. Why is $\braket{\psi}{\psi}$ guaranteed real?
5. Evaluate $\bra0 X\ket1$ where $X = \ket0\bra1 + \ket1\bra0$.
6. A fidelity function returns 1.3 for two normalized states — name the two most likely bugs.
7. **Design question:** define the Y‑basis $\{\ket{+i}, \ket{-i}\}$ and give the outcome statistics for $\ket0$, $\ket+$, and $\ket{+i}$. What does this basis "detect" that the other two miss?

````solution
1. $\braket{1}{\psi} = 0.6i$; $p(1) = 0.36$.
2. $\ket0\braket{0}{\psi} + \ket1\braket{1}{\psi} = \alpha\ket0 + \beta\ket1 = \ket\psi$ — completeness reassembles the state.
3. Matrix: $\tfrac12\begin{pmatrix}1&-1\\1&-1\end{pmatrix}$.
4. It's $\sum|\text{amplitude}|^2$ — a sum of modulus‑squares.
5. $X\ket1 = \ket0$, so $\bra0 X\ket1 = 1$.
6. Missing conjugation (`dot` instead of `vdot`) and/or unnormalized inputs.
7. Overlaps with $\ket{+i}$: for $\ket0$ and $\ket+$, both give $\tfrac12$ (blind); for $\ket{+i}$ itself, probability 1. The Y‑basis detects the ±i relative phase that the computational basis (moduli only) and the ± basis (real part of phase only) miss — three complementary questions, whose combination is state tomography.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Write a bra as the conjugate‑transpose of a ket.
- ☐ Compute $\braket{\phi}{\psi}$ by expanding and collapsing $\braket{i}{j}$.
- ☐ State the Born rule as $|\braket{\phi}{\psi}|^2$ and use amplitudes‑are‑overlaps.
- ☐ Distinguish bra·ket (number) from ket·bra (projector matrix), and use completeness.
- ☐ Run the live cell and explain why `np.vdot` is right and `np.dot` is wrong.
- ☐ Show that a relative phase changes ±‑basis but not standard‑basis statistics.
