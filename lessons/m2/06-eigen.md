# Eigenvalues, Hermitian & unitary matrices

This is the capstone of the math tower. Two families of matrices run all of quantum mechanics: **unitary** matrices (they *are* the gates — evolution, circuits, algorithms) and **Hermitian** matrices (they *are* the measurements and energies). The concept binding both families is the eigenvector: the directions a matrix refuses to bend. Finish this lesson and you possess every mathematical object the rest of the course uses — from here on it's physics and programming.

## 1. Eigenvectors — the directions a matrix keeps

Most vectors, hit by a matrix, change direction. A few special ones don't — the matrix merely *scales* them:

$$M\vec v = \lambda\vec v \qquad (\vec v \neq \vec 0)$$

Such a $\vec v$ is an **eigenvector** of $M$; the scaling factor $\lambda$ is its **eigenvalue** ("eigen" = German for "own": the matrix's own directions).

@@diagram:eigen-action|Generic vectors get rotated and stretched; eigenvectors keep their direction and only scale by λ. They are the matrix's skeleton.

Example by inspection: $Z = \begin{pmatrix}1&0\\0&-1\end{pmatrix}$ sends $\binom10 \to \binom10$ (eigenvector, $\lambda = 1$) and $\binom01 \to -\binom01$ (eigenvector, $\lambda = -1$). But $Z\binom11 = \binom1{-1}$ — direction changed, not an eigenvector.

**Finding them systematically**: rewrite $M\vec v = \lambda\vec v$ as $(M - \lambda I)\vec v = 0$. A nonzero solution exists only when $M - \lambda I$ squashes space flat — i.e. when

$$\det(M - \lambda I) = 0$$

For 2×2 this **characteristic equation** is a quadratic in $\lambda$: two roots, two eigenvalues (counting multiplicity). Then solve for each $\vec v$.

**Worked mechanics** — the gate $X = \begin{pmatrix}0&1\\1&0\end{pmatrix}$:

$$\det\begin{pmatrix}-\lambda & 1\\ 1 & -\lambda\end{pmatrix} = \lambda^2 - 1 = 0 \;\Rightarrow\; \lambda = \pm1$$

For $\lambda = 1$: $(X - I)\vec v = 0$ gives $-v_1 + v_2 = 0$, so $\vec v \propto \binom11$ — normalized, that's $\ket+$. For $\lambda = -1$: $\vec v \propto \binom1{-1} = \ket-$.

Pause on what you just found: **the eigenvectors of the X gate are the ± basis.** The bases you've been juggling since Lesson 9 weren't arbitrary — each famous basis is the eigenbasis of a famous matrix. Z owns $\{\ket0,\ket1\}$, X owns $\{\ket+,\ket-\}$, Y owns $\{\ket{+i},\ket{-i}\}$. This is the pattern: **measurements are questions, and a measurement's possible answers are the eigenvectors of its matrix.**

## 2. Hermitian matrices — the observables

A matrix is **Hermitian** if it equals its own dagger: $A^\dagger = A$ (transpose + conjugate returns the same matrix; diagonal entries must be real, and cross-diagonal entries are conjugates of each other). X, Y, Z are all Hermitian — verify Y $= \begin{pmatrix}0&-i\\i&0\end{pmatrix}$ yourself in one line.

Two theorems make Hermitian matrices the language of measurement (both worth knowing as *facts with reasons*, proofs one line each):

- **Real eigenvalues.** If $A\ket v = \lambda\ket v$, sandwich: $\bra v A\ket v = \lambda\braket{v}{v}$. Dagger the whole equation; Hermiticity gives the same left side, but $\lambda \to \lambda^*$. So $\lambda = \lambda^*$: real. *Physical meaning: measurement readouts are real numbers.*
- **Orthogonal eigenvectors** (for distinct eigenvalues). $\bra{v_2}A\ket{v_1}$ computed two ways gives $\lambda_1\braket{v_2}{v_1} = \lambda_2\braket{v_2}{v_1}$; distinct $\lambda$s force $\braket{v_2}{v_1} = 0$. *Physical meaning: distinct measurement outcomes are perfectly distinguishable — they form a measurement basis.*

So a Hermitian matrix packages a complete measurement: eigenvectors = the basis you project onto; eigenvalues = the numerical readouts you report. "Measure Z" means: project onto $\ket0$ or $\ket1$, report $+1$ or $-1$. In Module 9 you'll build molecule energies as sums of Hermitian matrices (Hamiltonians) and estimate their eigenvalues on hardware — that's VQE, a leading real-world application, and it is *this section at industrial scale*.

## 3. Unitary matrices — the evolutions

A matrix is **unitary** if its dagger is its inverse:

$$U^\dagger U = U U^\dagger = I$$

Equivalent characterizations, each useful in a different situation:

| Test | Statement | When you use it |
|---|---|---|
| Algebraic | $U^\dagger U = I$ | quick verification by multiplication |
| Geometric | $\lVert U\ket\psi\rVert = \lVert\ket\psi\rVert$ for all states | *why physics wants it*: probability stays 1 |
| Column test | columns form an orthonormal basis | reading a gate at a glance |
| Spectral | eigenvalues all satisfy $|\lambda| = 1$, i.e. $\lambda = e^{i\theta}$ | phase estimation (Module 8) |

The geometric line is the physics: states must stay normalized (total probability 1) through every operation, and unitaries are exactly the norm-preserving linear maps. **Every quantum gate is unitary; every unitary is a legal gate.** Consequences you'll invoke weekly:

- Gates are **invertible** ($U^{-1} = U^\dagger$, always available): quantum computation is reversible. There is no `if`-that-erases, no overwrite — circuits un-compute instead of deleting (Module 8's oracles do this constantly).
- Composition of gates is a gate: products of unitaries are unitary.
- A unitary's eigenvalues are pure phases $e^{i\theta}$ — rotations wearing matrix clothes. (Euler's formula, running the show again.)

X, Y, Z, H are unitary *and* Hermitian — a lucky double membership (it happens exactly when eigenvalues are ±1) that makes them both gates and measurements. The S gate from last lesson is unitary but *not* Hermitian (eigenvalues 1 and $i$: unit modulus ✓, not real ✗) — a pure evolver.

```python
import numpy as np
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
Y = np.array([[0, -1j], [1j, 0]])
S = np.array([[1, 0], [0, 1j]])

def is_unitary(M):   return np.allclose(M.conj().T @ M, np.eye(len(M)))
def is_hermitian(M): return np.allclose(M.conj().T, M)

for name, M in [("H", H), ("Y", Y), ("S", S)]:
    print(name, "unitary:", is_unitary(M), "| hermitian:", is_hermitian(M))
# H unitary: True | hermitian: True
# Y unitary: True | hermitian: True
# S unitary: True | hermitian: False

vals, vecs = np.linalg.eigh(Y)     # eigh: for Hermitian matrices (sorted, stable)
print(vals)                         # [-1.  1.]        real, as the theorem promised
print(vecs[:, 1])                   # eigenvector for +1 — the |+i⟩ state (up to phase)
```

(`np.linalg.eigh` for Hermitian, `np.linalg.eig` for general matrices. `np.allclose` is the float-tolerant `==` you were promised in Module 1.)

## Worked example — full eigen-analysis of the Hadamard

*Find H's eigenvalues and eigenvectors, and interpret.*

**Eigenvalues.** $\det(H - \lambda I) = \left(\tfrac{1}{\sqrt2} - \lambda\right)\left(-\tfrac{1}{\sqrt2} - \lambda\right) - \tfrac12 = \lambda^2 - \tfrac12 - \tfrac12 = \lambda^2 - 1 = 0 \Rightarrow \lambda = \pm 1$. (Real — H is Hermitian; unit modulus — H is unitary. Both boxes ticked at once.)

**Eigenvector for $\lambda = +1$**: solve $(H - I)\vec v = 0$, first row: $\left(\tfrac{1}{\sqrt2} - 1\right)v_1 + \tfrac{1}{\sqrt2}v_2 = 0 \Rightarrow v_2 = (\sqrt2 - 1)v_1$. Normalized: $\ket{h_+} \approx \binom{0.9239}{0.3827}$ — and those decimals are $\cos 22.5°, \sin 22.5°$. The +1 eigenvector sits at **22.5°, exactly halfway between $\ket0$ (0°) and $\ket+$ (45°)**.

**Interpretation.** H swaps the Z-basis and X-basis ($H\ket0 = \ket+$, $H\ket+ = \ket0$); a transformation that exchanges two directions leaves their *bisector* untouched — hence the halfway eigenvector, unmoved ($\lambda = 1$), while the perpendicular bisector at 112.5° takes the sign flip ($\lambda = -1$). Geometry, algebra, and physics telling one story: eigenvectors are the axis of H's reflection.

## Gotchas

- **"Eigenvalue" without "of which matrix".** States don't have eigenvalues; matrices do. The question is always "eigenvector of *what*" — and in quantum practice, "measured in *which* observable's eigenbasis."
- **Scaling sloppiness.** If $\vec v$ is an eigenvector, so is $3\vec v$ (and $e^{i\theta}\vec v$). Eigen*directions*, not eigen-arrows. Quantum convention: report them normalized; global phase remains free.
- **Expecting real eigenvalues from every matrix.** Only guaranteed for Hermitian (also symmetric-real) matrices. Rotation $R(\theta)$ has eigenvalues $e^{\pm i\theta}$ — complex, and rightly: no real direction survives a generic rotation.
- **`eig` vs `eigh`.** `eigh` assumes Hermitian input (faster, sorted, real eigenvalues); feed it a non-Hermitian matrix and it silently uses only one triangle — wrong answers, no error. Check Hermiticity first or use `eig`.
- **Confusing the two families' roles.** Hermitian = *what you measure* (real readouts, orthogonal outcomes). Unitary = *how states move* (norm-preserving, reversible). Overlap (H, X, Y, Z) is a coincidence of ±1 spectra, not a rule — S and T are gates with no measurement role; a molecule's Hamiltonian is a measurement/energy object, not a gate.
- **Forgetting normalization ≠ unitarity for rectangular/defective cases.** Column-orthonormality is the full test: each column unit norm AND mutually orthogonal. A matrix can have unit-norm columns that aren't orthogonal — not unitary.

## Scenario — why your simulator says a gate is "illegal"

You hand-derive a custom 2×2 "gate" for a project: $G = \begin{pmatrix}1 & 1\\ 0 & 1\end{pmatrix}$ (a shear — looked harmless on paper). Qiskit's `UnitaryGate(G)` raises: *input matrix is not unitary*. Diagnosis with today's tools: columns $(1,0)$ and $(1,1)$ — second column has norm $\sqrt2 \ne 1$, and the columns aren't orthogonal ($\braket{c_1}{c_2} = 1$). Physically: $G$ stretches some states ($\lVert G\ket+\rVert^2 = \tfrac{(1+1)^2 + 1}{2} = 2.5$), which would create probability from nothing. The professional fixes, in order of preference: (1) find the unitary closest to your intent (often: what rotation were you actually trying to do?); (2) embed the non-unitary action in a *larger* unitary with an extra qubit (ancilla + post-selection — how "measurement-like" operations are built, Module 10); (3) accept it's a measurement, not a gate. The error message was never bureaucracy — it was conservation of probability, enforced by a column check you can now run in your head.

## Key points

- $M\vec v = \lambda\vec v$: eigenvectors are the directions a matrix only scales; find eigenvalues via $\det(M-\lambda I) = 0$, then solve for directions.
- The famous bases are eigenbases: Z ↔ $\{\ket0,\ket1\}$, X ↔ $\{\ket\pm\}$, Y ↔ $\{\ket{\pm i}\}$ — "measure A" = "project onto A's eigenvectors, report eigenvalues."
- Hermitian ($A^\dagger = A$): real eigenvalues, orthogonal eigenvectors — the mathematics of observables and energies.
- Unitary ($U^\dagger U = I$): norm-preserving, invertible-by-dagger, eigenvalues $e^{i\theta}$ — the mathematics of gates; columns form an orthonormal basis (fast eyeball test).
- Gates are reversible because unitarity hands you $U^{-1} = U^\dagger$ for free; probability conservation is *why* physics restricts to unitaries.
- Code: `eigh` for Hermitian, `eig` otherwise; `np.allclose(U.conj().T @ U, I)` is the unitarity unit test you'll write in every quantum project.

## Check yourself

```quiz
{"q":"A Hermitian matrix has eigenvalues 3 and −1 with eigenvectors v₃ and v₋₁. Which statement must be true?","options":["v₃ and v₋₁ are orthogonal, and both eigenvalues being real is guaranteed by Hermiticity","The matrix is also unitary","v₃ = v₋₁ is possible","The eigenvalues could have been complex"],"answer":0,"why":"Distinct eigenvalues of a Hermitian matrix force orthogonal eigenvectors, and Hermiticity forces real eigenvalues. It is NOT unitary: unitary needs |λ|=1, but |3| ≠ 1."}
```

```quiz
{"q":"Why must every quantum gate be unitary?","options":["To keep matrix entries real","Because unitaries are exactly the linear maps that preserve state norm — total probability stays 1 through the evolution","Because unitary matrices are easier to multiply","To guarantee the gate is Hermitian"],"answer":1,"why":"Norm preservation = probability conservation. Reversibility (U⁻¹ = U†) comes as a bonus. Hermiticity is a separate property about measurements, not required of gates."}
```

## Exercises

**Exercise 1 — full analysis of a phase gate.** For $S = \begin{pmatrix}1&0\\0&i\end{pmatrix}$: (a) find eigenvalues and eigenvectors by inspection; (b) confirm $|\lambda| = 1$ for each and connect to unitarity; (c) show S is not Hermitian and say which theorem-guarantee is therefore lost; (d) compute $S^4$ and interpret.

````solution
(a) Diagonal matrix → eigen-everything by inspection: $\lambda_1 = 1$ with $\ket0$; $\lambda_2 = i$ with $\ket1$.

(b) $|1| = 1$, $|i| = 1$ ✓ — both pure phases ($e^{0}$ and $e^{i\pi/2}$), as unitarity demands. (Unitary check directly: $S^\dagger S = \mathrm{diag}(1\cdot1, (-i)(i)) = I$ ✓.)

(c) $S^\dagger = \mathrm{diag}(1, -i) \ne S$. Lost guarantee: real eigenvalues — indeed $i$ is not real. S can't serve as an "observable"; there's no such thing as "measuring S" with readout $i$.

(d) $S^4 = \mathrm{diag}(1, i^4) = I$. Four quarter-turns of relative phase = full turn = identity. S is a "fourth root of identity"; likewise the T gate (Module 6, $\mathrm{diag}(1, e^{i\pi/4})$) is an eighth root, and $T^2 = S$, $S^2 = Z$ — the phase-gate family is one staircase of half-angles. Knowing this collapses a dozen circuit identities into one picture.
````

**Exercise 2 — build the measurement from the matrix.** The observable $A = \begin{pmatrix}0 & 1-i\\ 1+i & 1\end{pmatrix}$… first verify it's Hermitian. Then find its eigenvalues (characteristic equation; they're not pretty integers — keep surds), and state what numbers a measurement of A can output. Verify with `np.linalg.eigh` and check the eigenvectors are orthogonal.

````solution
Hermitian check: diagonal real ✓; $A_{12} = 1-i$ and $A_{21} = 1+i$ are conjugates ✓.

Characteristic equation: $\det\begin{pmatrix}-\lambda & 1-i\\ 1+i & 1-\lambda\end{pmatrix} = -\lambda(1-\lambda) - (1-i)(1+i) = \lambda^2 - \lambda - 2 = 0$

(used $(1-i)(1+i) = 1 - i^2 = 2$). Roots: $\lambda = \tfrac{1 \pm \sqrt{1+8}}{2} = \tfrac{1\pm3}{2} = 2$ and $-1$. (Pleasant surprise — integers after all, via $zz^*$ arithmetic.) A measurement of A outputs **2 or −1**, nothing else, ever.

```python
import numpy as np
A = np.array([[0, 1-1j], [1+1j, 1]])
vals, vecs = np.linalg.eigh(A)
print(vals)                                   # [-1.  2.]
print(np.vdot(vecs[:,0], vecs[:,1]))          # ~0j  → orthogonal ✓ (vdot: lesson learned)
```

The workflow you just executed — Hermitian check, spectrum, orthogonality confirmation — is verbatim what you'll do to molecular Hamiltonians in Module 9, where the eigenvalue you hunt ($\lambda_{\min}$) is a molecule's ground-state energy and the hunt is called VQE.
````

## Practice questions

1. By inspection (no computation): eigenvalues and eigenvectors of $\mathrm{diag}(5, -2)$, and is it Hermitian? Unitary?
2. Show that if $U$ is unitary, $\lVert U\ket\psi\rVert = \lVert\ket\psi\rVert$ (start from $\lVert U\psi\rVert^2 = \bra\psi U^\dagger U\ket\psi$).
3. Rotation $R(\theta)$ has eigenvalues $e^{\pm i\theta}$. Why does a real matrix end up with complex eigenvalues, and why doesn't that contradict the Hermitian theorem?
4. The eigenvectors of X are $\ket\pm$ with eigenvalues ±1. What does "measure X on state $\ket0$" output, with what probabilities? (Decompose $\ket0$ in X's eigenbasis.)
5. Is the product of two Hermitian matrices Hermitian in general? Test with X and Z, and state the condition under which it works.
6. Your unit test `is_unitary(M)` passes but `is_hermitian(M)` fails for a proposed *observable*. What do you tell the author?
7. **Design question:** design a 2×2 observable whose measurement outputs $+5$ on $\ket+$ and $-5$ on $\ket-$ (write it as $5\ket+\bra+ - 5\ket-\bra-$, expand to a matrix), then sanity-check its action on $\ket0$: what outcomes/probabilities, and what's the average readout?

````solution
1. Eigenvalues 5, −2 with $\ket0,\ket1$; Hermitian ✓ (real diagonal); NOT unitary ($|5|\ne1$).
2. $\lVert U\psi\rVert^2 = \bra\psi U^\dagger U\ket\psi = \bra\psi I\ket\psi = \braket{\psi}{\psi} = \lVert\psi\rVert^2$; take square roots.
3. Real matrices can be non-Hermitian-symmetric in effect ($R^T \ne R$ unless θ ∈ {0, π}); the Hermitian theorem doesn't apply — no real vector survives a rotation, so eigen-directions live in complex space with pure-phase eigenvalues (unitarity's promise instead).
4. $\ket0 = \tfrac{1}{\sqrt2}(\ket+ + \ket-)$: outputs $+1$ or $-1$, 50% each.
5. Generally not: $(XZ)^\dagger = Z X \ne XZ$ (they anticommute!). Product of Hermitians is Hermitian iff the two commute.
6. "It's a fine *gate* but not an observable: without Hermiticity there's no real-eigenvalue guarantee, so 'measuring it' has no defined readout. Either you meant it as evolution, or we should find the Hermitian object you intended (perhaps $M + M^\dagger$ or the intended spectral decomposition)."
7. $5\ket+\bra+ - 5\ket-\bra- = \tfrac52\begin{pmatrix}1&1\\1&1\end{pmatrix} - \tfrac52\begin{pmatrix}1&-1\\-1&1\end{pmatrix} = \begin{pmatrix}0&5\\5&0\end{pmatrix} = 5X$. On $\ket0$: outcomes ±5 at 50/50; average readout $0$ — which is precisely $\bra0 (5X)\ket0 = 5\bra0 X\ket0 = 5\braket{0}{1}\cdot$(…)$ = 0$. You've just computed your first *expectation value* $\bra\psi A\ket\psi$ — the exact quantity a quantum computer estimates thousands of times per second in every VQE run. The design freedom (scale/shift any observable) is why "measure in a basis, then relabel numbers" covers all single-qubit measurements.
````
