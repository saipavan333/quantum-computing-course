# Matrices: the machines of linear algebra

Here is the second half of quantum computing's core equation. An earlier lesson said *states are vectors*. This lesson: **operations on states are matrices.** Every quantum gate — X, Hadamard, CNOT — is literally a small matrix of complex numbers, and "apply the gate" means "multiply the vector by the matrix." Master 2×2 mechanics now and Modules 5–8 become computation instead of ceremony.

## Start here — the intuition

A matrix is a **machine that eats a vector and returns a vector**. That's the whole idea, and every quantum gate is one of these little machines. Two secrets make them completely tame:

**The columns tell you where the basis vectors go.** Feed a matrix the vector $\binom10$ and out comes its first column; feed $\binom01$ and out comes the second. So you can *read* any gate at a glance ("where does $\ket0$ land? where does $\ket1$ land?"), and *build* any gate you want by writing those destinations as columns.

**Linearity carries you the rest of the way.** Because a matrix respects sums and scaling, knowing what a gate does to $\ket0$ and $\ket1$ tells you what it does to *every* superposition — the amplitudes just tag along. That's the entire reason quantum mechanics is computable by hand. Two more facts to hold: **order matters** ($AB \neq BA$ — gate order is physics), and the "dagger" $M^\dagger$ (transpose *and* conjugate) is quantum's proper transpose.

## What a matrix does

Each output entry is a **row dotted with the input**:

$$\begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}\begin{pmatrix} 5 \\ 6 \end{pmatrix} = \begin{pmatrix} 1\cdot5 + 2\cdot6 \\ 3\cdot5 + 4\cdot6 \end{pmatrix} = \begin{pmatrix} 17 \\ 39 \end{pmatrix}$$

@@diagram:matmul-mechanics|Matrix × vector: each output slot is one row dotted with the input column. Two rows, two dot products, done.

@@widget

**Composition** is matrix × matrix: applying $A$ then $B$ is the product $BA$ (rightmost acts first). It's associative but *not* commutative — $XZ \neq ZX$, because rotate‑then‑reflect differs from reflect‑then‑rotate. The **identity** $I$ does nothing; the **inverse** $M^{-1}$ undoes (exists iff $\det M = ad - bc \neq 0$); and the **dagger** $M^\dagger = (M^T)^*$ is the complex transpose, with $(AB)^\dagger = B^\dagger A^\dagger$ (order reverses — socks and shoes). Next lessons define quantum's royal families with it: Hermitian ($M^\dagger = M$) and unitary ($M^\dagger = M^{-1}$).

## Predict, then run — gates are matrices

The live cell treats gates as the matrices they are.

**Predict first.** $H$ turns $\ket0$ into a superposition. What is $H$ applied *twice* — does it pile up more superposition, or undo itself? And is $XZ$ the same as $ZX$? Guess, then Run.

```run
# Live cell — a matrix is a machine on vectors; quantum gates ARE matrices.
import numpy as np
H = np.array([[1,1],[1,-1]]) / np.sqrt(2)
X = np.array([[0,1],[1,0]]);  Z = np.array([[1,0],[0,-1]])

print("H|0> =", np.round(H @ np.array([1,0]), 3), " (a superposition)")
print("H@H  =", np.round(H @ H, 3).tolist(), " (identity -> H is its own inverse)")
print("XZ =", (X @ Z).tolist(), "  ZX =", (Z @ X).tolist(), "  equal?", np.array_equal(X@Z, Z@X))
print("H X H =", np.round(H @ X @ H, 3).tolist(), " (= Z, the phase flip)")
```

$H$ applied twice is the identity — creating a superposition is fully *reversible* (no information lost until measurement). $XZ \neq ZX$: gates don't commute, and that stubborn minus sign ($XZ = -ZX$) does real work in error correction. And $HXH = Z$ — conjugating $X$ by the basis‑swapper $H$ turns a bit flip into a phase flip, exactly the identity you'll lean on constantly.

```quiz
{"q":"Reading columns: a matrix M sends (1,0) to (0,1) and (0,1) to (-1,0). What is M?","options":["Columns (0,1) and (-1,0) — the 90° rotation matrix","Rows (0,1) and (-1,0)","The identity — nothing moved","Columns (1,0) and (0,-1)"],"answer":0,"why":"Where the basis vectors land IS the matrix, written as columns: first column (0,1), second (-1,0). That's a 90° rotation (cos 90° = 0, sin 90° = 1)."}
```

## The Hadamard, in one multiplication

$H = \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$. Its columns say $\ket0 \mapsto \tfrac{1}{\sqrt2}\binom11 = \ket+$ and $\ket1 \mapsto \tfrac{1}{\sqrt2}\binom{1}{-1} = \ket-$ (a relative phase of $\pi$ on the second). Apply it to $\tfrac{1}{\sqrt2}\binom11$: $\tfrac12\binom{1+1}{1-1} = \binom10$ — the superposition collapses back to a definite state *not by measurement but by interference*, the bottom entry computing $1 - 1 = 0$. You just watched destructive interference happen inside a matrix multiply, and that minus sign in $H$'s corner is where it came from.

## Level up — gotchas the pros watch for

- **`*` vs `@` in numpy.** `A * B` is element‑wise; `A @ B` is matrix multiplication. Element‑wise "gates" produce silently wrong states — the classic numpy quantum bug.
- **Row‑column discipline.** Output entry $i$ = row $i$ · input; mixing it up transposes your answer.
- **Assuming commutativity.** $AB \neq BA$ in general — prove commutation before swapping.
- **Dagger without the conjugate.** For complex matrices, transpose alone is a half‑measure; use `M.conj().T`.
- **Inverting the non‑invertible.** $\det = 0$ ⇒ no inverse (numpy raises `LinAlgError`).

## Level up — the graphics interview that was secretly a gates interview

A game‑studio task: "our renderer applies scale $S$ then rotate $R$; artists complain when a patch reversed the order — explain and give the fix as one matrix." The answer: $RS \neq SR$ for non‑uniform scaling; hand over the single baked matrix $C = RS$ ("one multiply per vertex instead of two"). Replace "scale, rotate" with "Hadamard, phase gate" and this is *exactly* every quantum circuit: gates compose by matrix product, order is physics, and the transpiler (Module 7) bakes long sequences into fewer combined matrices. Same math, different industry.

## Key points

- A matrix is a linear machine on vectors: output entry $i$ = (row $i$)·(input); columns are where the basis vectors land — read gates this way.
- Linearity means a gate's action on $\ket0, \ket1$ determines its action on every superposition.
- Products compose machines, rightmost first; $AB \neq BA$ in general — gate order is physical.
- Identity does nothing; inverse undoes ($\det \neq 0$); dagger $M^\dagger = (M^T)^*$ with $(AB)^\dagger = B^\dagger A^\dagger$.
- $H$ shows the whole plot in 2×2: superposition creation, interference‑by‑minus‑sign, self‑inverse evolution.
- numpy: `@` (not `*`), `M.conj().T`, `np.linalg.inv`, `np.linalg.solve`.

## Check yourself

```quiz
{"q":"For the Hadamard H, H·H gives the identity. The correct takeaway is:","options":["H is not a valid quantum operation","H is its own inverse — applying it twice undoes it, so superposition-making is reversible","H commutes with every matrix","H has determinant zero"],"answer":1,"why":"H² = I means H⁻¹ = H (self-inverse). Creating a superposition is fully reversible evolution — no information is lost until a measurement happens."}
```

## Exercises

**Exercise 1 — build, compose, verify.** In the live cell, with $X$ and $Z$: compute $X\binom{\alpha}{\beta}$ (describe it in words), then $XZ$ and $ZX$, and confirm $XZ = -ZX$.

````solution
```python
import numpy as np
X = np.array([[0,1],[1,0]]); Z = np.array([[1,0],[0,-1]])
print(X @ Z, Z @ X)                 # differ; and X@Z == -(Z@X)
print(np.array_equal(X@Z, -(Z@X)))  # True -- they ANTICOMMUTE
```
$X\binom{\alpha}{\beta} = \binom{\beta}{\alpha}$ swaps the amplitudes (a bit flip). $XZ = -ZX$: the anticommutation of X and Z underlies error‑correction syndrome extraction (Module 10) and the bit/phase uncertainty trade‑off.
````

**Exercise 2 — the inverse in anger.** For $M = \begin{pmatrix}2&1\\1&1\end{pmatrix}$: compute $\det M$ and $M^{-1}$ by the formula, then solve $M\vec x = \binom53$. Confirm with `np.linalg.solve`, and say why `solve` beats forming the inverse.

````solution
```python
import numpy as np
M = np.array([[2.,1.],[1.,1.]])
print(np.linalg.solve(M, np.array([5.,3.])))   # [2. 1.]
```
$\det M = 1$; $M^{-1} = \begin{pmatrix}1&-1\\-1&2\end{pmatrix}$; $\vec x = M^{-1}\binom53 = \binom21$. `solve` factors the system directly — about half the work of forming the inverse and more stable near‑singular. You almost never need the inverse itself, only its action — the same philosophy behind applying gates without writing exponentially large matrices.
````

## Practice questions

1. Compute $\begin{pmatrix}1&2\\0&1\end{pmatrix}\binom{3}{-1}$ and say which columns are the basis‑vector images.
2. Build the matrix reflecting across the x‑axis. What gate is it?
3. Why does $R(\alpha)R(\beta) = R(\alpha+\beta)$ make sense without computing, and which trig identities fall out?
4. Compute $\det H$ and reconcile "determinant −1" with "H preserves lengths."
5. Give $M^\dagger$ for $M = \begin{pmatrix}0&-i\\i&0\end{pmatrix}$ (the Y gate) and note something special.
6. Why does $(AB)^\dagger = B^\dagger A^\dagger$ reverse order?
7. **Design question:** using only "columns = images of basis vectors" and linearity, build the 2×2 matrix for "swap the components, then flip the sign of the new second component," and verify on $\binom{\alpha}{\beta}$.

````solution
1. $\binom{1}{-1}$; the matrix's columns are the images of $\hat e_1, \hat e_2$.
2. $\begin{pmatrix}1&0\\0&-1\end{pmatrix}$ = Z (reflection = phase flip).
3. Rotating by $\beta$ then $\alpha$ is one rotation by $\alpha+\beta$; multiplying the entries yields the angle‑addition formulas for free.
4. $\det H = -1$: the *sign* records an orientation flip (H is a reflection), the *modulus* 1 records length preservation — both true at once.
5. $M^\dagger = M$: $Y$ is its own dagger — your first Hermitian matrix.
6. In $(AB)\vec v$, $B$ acts first; daggering peels the outermost layer first, giving $B^\dagger A^\dagger$ — shoes on last come off first.
7. Swap = $X$; flip second sign = $Z$; "then" multiplies on the left: $M = ZX = \begin{pmatrix}0&1\\-1&0\end{pmatrix}$. Verify: $\binom{\alpha}{\beta} \to \binom{\beta}{-\alpha}$. (Bonus: $ZX = -iY$.)
````

## Mastery checklist — you are ready to move on when you can

- ☐ Multiply a matrix by a vector (rows dotted with the column).
- ☐ Read a gate off its columns, and build a gate from where the basis vectors go.
- ☐ Explain why linearity means acting on $\ket0, \ket1$ determines everything.
- ☐ Run the live cell and explain $H@H = I$, $XZ \neq ZX$, and $HXH = Z$.
- ☐ Compute a 2×2 inverse and dagger, and know `@` vs `*` in numpy.
- ☐ Explain why $H$'s minus sign is destructive interference inside a matrix multiply.
