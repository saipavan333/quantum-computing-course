# Eigenvalues, Hermitian & unitary matrices

This is the capstone of the math tower. Two families of matrices run all of quantum mechanics: **unitary** matrices (they *are* the gates — evolution, circuits, algorithms) and **Hermitian** matrices (they *are* the measurements and energies). The concept binding both is the eigenvector: the directions a matrix refuses to bend. Finish this lesson and you possess every mathematical object the rest of the course uses.

## Start here — the intuition

Hit most vectors with a matrix and they change direction. A few special ones don't — the matrix only *stretches* them, $M\vec v = \lambda\vec v$. Those are the **eigenvectors**, and the stretch factor $\lambda$ is the **eigenvalue** ("eigen" = "own": the matrix's own directions). They're the matrix's skeleton.

Two families of matrices, defined by how they relate to their **dagger** (conjugate transpose), run everything:

- **Hermitian** ($A^\dagger = A$) are the **measurements**. Their eigenvalues are always *real* (the numbers your instrument reads out) and their eigenvectors are *orthogonal* (a measurement basis). "Measure X" literally means "project onto X's eigenvectors, report the eigenvalues."
- **Unitary** ($U^\dagger U = I$) are the **gates**. They preserve length (so total probability stays 1), they're reversible ($U^{-1} = U^\dagger$), and their eigenvalues are pure phases $e^{i\theta}$ — rotations wearing matrix clothes.

The famous bases you've juggled are eigenbases in disguise: Z owns $\{\ket0,\ket1\}$, X owns $\{\ket\pm\}$, Y owns $\{\ket{\pm i}\}$.

## Eigenvectors, and finding them

Rewrite $M\vec v = \lambda\vec v$ as $(M-\lambda I)\vec v = 0$; a nonzero solution needs $\det(M-\lambda I) = 0$ (the **characteristic equation**, a quadratic for 2×2). For $X = \binom{0\ 1}{1\ 0}$: $\lambda^2 - 1 = 0 \Rightarrow \lambda = \pm1$, with eigenvectors $\ket+$ ($\lambda=1$) and $\ket-$ ($\lambda=-1$). So **the eigenvectors of the X gate are the ± basis** — measurements are questions, and a measurement's possible answers are the eigenvectors of its matrix.

@@diagram:eigen-action|Generic vectors get rotated and stretched; eigenvectors keep their direction and only scale by λ. They are the matrix's skeleton.

@@widget

**Hermitian, two theorems** (each one line): *real eigenvalues* — sandwich $\bra v A\ket v = \lambda\braket{v}{v}$, dagger it, Hermiticity forces $\lambda = \lambda^*$; *orthogonal eigenvectors* — for distinct $\lambda$'s, $\lambda_1\braket{v_2}{v_1} = \lambda_2\braket{v_2}{v_1}$ forces the overlap to 0. So a Hermitian matrix packages a complete measurement: eigenvectors = the basis, eigenvalues = the readouts. **Unitary, four equivalent tests**: $U^\dagger U = I$; norm‑preserving $\lVert U\ket\psi\rVert = \lVert\ket\psi\rVert$ (the physics — probability stays 1); columns orthonormal; eigenvalues $|\lambda| = 1$. X, Y, Z, H are unitary *and* Hermitian (eigenvalues $\pm1$) — both gates and measurements; S is unitary but not Hermitian (eigenvalues $1, i$) — a pure evolver.

## Predict, then run — the two families

**Predict first.** $Y$ is Hermitian — so what must be true of its eigenvalues? $S$ is unitary but not Hermitian — where do its eigenvalues live? Guess, then Run.

```run
# Live cell — Hermitian (measurements) & unitary (gates), by their eigenvalues.
import numpy as np
H = np.array([[1,1],[1,-1]])/np.sqrt(2)
Y = np.array([[0,-1j],[1j,0]])
S = np.array([[1,0],[0,1j]])
def is_unitary(M):   return np.allclose(M.conj().T @ M, np.eye(len(M)))
def is_hermitian(M): return np.allclose(M.conj().T, M)

for name, M in [("H", H), ("Y", Y), ("S", S)]:
    print(f"  {name}: unitary={is_unitary(M)}  hermitian={is_hermitian(M)}")

vals, vecs = np.linalg.eigh(Y)                 # eigh: for Hermitian matrices
print("\nY eigenvalues (REAL, since Hermitian):", np.round(vals, 3))

vals = np.linalg.eigvals(S)                    # unitary: eigenvalues on the unit circle
print("S eigenvalues (|lambda|=1, since unitary):", np.round(vals, 3),
      " |.| =", np.round(np.abs(vals), 3))
```

$H$ and $Y$ are both unitary *and* Hermitian; $S$ is unitary but not Hermitian. $Y$'s eigenvalues come out real ($-1, +1$) exactly as the Hermitian theorem promises — those are the readouts of a Y‑measurement, and its eigenvectors are the $\ket{\pm i}$ states. $S$'s eigenvalues sit on the unit circle ($1$ and $i$) as unitarity demands — pure phases, no real "readout," which is why S is a gate and not an observable.

```quiz
{"q":"Why must every quantum gate be unitary?","options":["To keep matrix entries real","Because unitaries are exactly the linear maps that preserve state norm — total probability stays 1 through the evolution","Because unitary matrices are easier to multiply","To guarantee the gate is Hermitian"],"answer":1,"why":"Norm preservation = probability conservation. Reversibility (U⁻¹ = U†) comes as a bonus. Hermiticity is a separate property about measurements, not required of gates."}
```

## Level up — gotchas the pros watch for

- **"Eigenvalue" without "of which matrix."** States don't have eigenvalues; matrices do. In practice it's "measured in which observable's eigenbasis."
- **Scaling sloppiness.** If $\vec v$ is an eigenvector so is $e^{i\theta}\vec v$ — eigen*directions*, reported normalized with free global phase.
- **Expecting real eigenvalues from every matrix.** Only Hermitian guarantees it; a rotation $R(\theta)$ has complex eigenvalues $e^{\pm i\theta}$.
- **`eig` vs `eigh`.** `eigh` assumes Hermitian input (faster, sorted, real); feed it a non‑Hermitian matrix and it silently reads one triangle — wrong answers, no error.
- **Confusing the two roles.** Hermitian = *what you measure*; unitary = *how states move*. The X/Y/Z/H overlap is a $\pm1$‑spectrum coincidence, not a rule.

## Level up — why your simulator says a gate is "illegal"

You hand‑derive $G = \binom{1\ 1}{0\ 1}$ (a shear) and Qiskit's `UnitaryGate(G)` raises *"not unitary."* Diagnosis: its columns $(1,0)$ and $(1,1)$ aren't orthonormal (second has norm $\sqrt2$; overlap 1). Physically, $G$ stretches some states ($\lVert G\ket+\rVert^2 = 2.5$), creating probability from nothing. Fixes in order: find the unitary closest to your intent (what rotation did you mean?); embed the non‑unitary action in a larger unitary with an ancilla (how measurement‑like operations are built); or accept it's a measurement, not a gate. The error was conservation of probability, enforced by a column check you can now run in your head.

## Key points

- $M\vec v = \lambda\vec v$: eigenvectors are the directions a matrix only scales; find $\lambda$ via $\det(M-\lambda I) = 0$.
- The famous bases are eigenbases: Z↔$\{\ket0,\ket1\}$, X↔$\{\ket\pm\}$, Y↔$\{\ket{\pm i}\}$ — "measure A" = project onto A's eigenvectors, report eigenvalues.
- Hermitian ($A^\dagger = A$): real eigenvalues, orthogonal eigenvectors — the math of observables and energies.
- Unitary ($U^\dagger U = I$): norm‑preserving, invertible‑by‑dagger, eigenvalues $e^{i\theta}$, columns orthonormal — the math of gates.
- Gates are reversible because unitarity gives $U^{-1} = U^\dagger$; probability conservation is *why* physics restricts to unitaries.
- Code: `eigh` for Hermitian, `eig`/`eigvals` otherwise; `np.allclose(U.conj().T @ U, I)` is the unitarity unit test.

## Check yourself

```quiz
{"q":"A Hermitian matrix has eigenvalues 3 and −1. Which statement must be true?","options":["Its eigenvectors (for distinct eigenvalues) are orthogonal, and both eigenvalues being real is guaranteed by Hermiticity","The matrix is also unitary","The two eigenvectors could be equal","The eigenvalues could have been complex"],"answer":0,"why":"Distinct eigenvalues of a Hermitian matrix force orthogonal eigenvectors, and Hermiticity forces real eigenvalues. It is NOT unitary: unitary needs |λ|=1, but |3| ≠ 1."}
```

## Exercises

**Exercise 1 — analyze a phase gate.** In the live cell, confirm $S = \mathrm{diag}(1, i)$ is unitary but not Hermitian, read its eigenvalues (by inspection: $1, i$ with $\ket0, \ket1$), and compute $S^4$. What does $S^4 = I$ mean?

````solution
$|1| = |i| = 1$ (unitary), but $S^\dagger = \mathrm{diag}(1,-i) \neq S$ (not Hermitian — so no real‑eigenvalue "readout"). $S^4 = \mathrm{diag}(1, i^4) = I$: four quarter‑turns of relative phase = a full turn = identity. S is a fourth root of $I$; likewise $T^2 = S$, $S^2 = Z$ — the phase‑gate family is one staircase of half‑angles.
````

**Exercise 2 — build a measurement from a matrix.** For $A = \begin{pmatrix}0 & 1-i\\ 1+i & 1\end{pmatrix}$: verify it's Hermitian, find its eigenvalues (they turn out to be integers), and state what a measurement of $A$ can output. Confirm with `np.linalg.eigh` and check the eigenvectors are orthogonal.

````solution
```python
import numpy as np
A = np.array([[0, 1-1j],[1+1j, 1]])
vals, vecs = np.linalg.eigh(A)
print(vals, np.round(np.vdot(vecs[:,0], vecs[:,1]), 6))   # [-1. 2.]  0j (orthogonal)
```
Hermitian (real diagonal; $A_{12} = 1-i$, $A_{21} = 1+i$ conjugate). Characteristic equation $\lambda^2 - \lambda - 2 = 0$ (using $(1-i)(1+i) = 2$) → $\lambda = 2, -1$. A measurement of $A$ outputs 2 or −1, nothing else. This exact workflow — Hermitian check, spectrum, orthogonality — is what you'll do to molecular Hamiltonians in Module 9, where $\lambda_{\min}$ is a ground‑state energy and the hunt is VQE.
````

## Practice questions

1. By inspection: eigenvalues/eigenvectors of $\mathrm{diag}(5,-2)$; Hermitian? unitary?
2. Show $\lVert U\ket\psi\rVert = \lVert\ket\psi\rVert$ for unitary $U$ (start from $\bra\psi U^\dagger U\ket\psi$).
3. $R(\theta)$ has eigenvalues $e^{\pm i\theta}$. Why complex, and why no contradiction with the Hermitian theorem?
4. "Measure X on $\ket0$" — outputs and probabilities? (Decompose $\ket0$ in X's eigenbasis.)
5. Is the product of two Hermitian matrices Hermitian? Test X and Z; state the condition.
6. `is_unitary(M)` passes but `is_hermitian(M)` fails for a proposed *observable*. What do you tell the author?
7. **Design question:** build an observable that outputs $+5$ on $\ket+$ and $-5$ on $\ket-$ (as $5\ket+\bra+ - 5\ket-\bra-$), then measure $\ket0$: outcomes, probabilities, and the average readout.

````solution
1. Eigenvalues $5, -2$ with $\ket0, \ket1$; Hermitian ✓; not unitary ($|5| \neq 1$).
2. $\bra\psi U^\dagger U\ket\psi = \bra\psi I\ket\psi = \braket{\psi}{\psi}$; take square roots.
3. $R^T \neq R$ (unless $\theta \in \{0,\pi\}$), so the Hermitian theorem doesn't apply; no real vector survives a rotation, so eigen‑directions are complex with pure‑phase eigenvalues (unitarity's promise).
4. $\ket0 = \tfrac{1}{\sqrt2}(\ket+ + \ket-)$ → outputs $+1$ or $-1$, 50/50.
5. Not in general: $(XZ)^\dagger = ZX \neq XZ$ (they anticommute). Product of Hermitians is Hermitian iff they commute.
6. "It's a valid gate but not an observable — without Hermiticity there's no real‑eigenvalue readout, so 'measuring it' is undefined. Either it's evolution, or we want the Hermitian object you intended (e.g. $M + M^\dagger$)."
7. $5\ket+\bra+ - 5\ket-\bra- = 5X = \binom{0\ 5}{5\ 0}$. On $\ket0$: outcomes $\pm5$ at 50/50; average $\bra0 (5X)\ket0 = 0$ — your first *expectation value*, the quantity a quantum computer estimates thousands of times per second in VQE.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Define eigenvector/eigenvalue and find them for a 2×2 via the characteristic equation.
- ☐ State that the famous bases are eigenbases (Z, X, Y) and what "measure A" means.
- ☐ Define Hermitian and give its two guarantees (real eigenvalues, orthogonal eigenvectors).
- ☐ Define unitary four ways and explain why gates must be unitary.
- ☐ Run the live cell and read off the Hermitian (real) vs unitary (unit‑circle) eigenvalue signatures.
- ☐ Compute an expectation value $\bra\psi A\ket\psi$ and connect it to VQE.
