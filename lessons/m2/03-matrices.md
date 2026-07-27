# Matrices: the machines of linear algebra

Here is the second half of quantum computing's core equation. Lesson 4 said *states are vectors*. This lesson: **operations on states are matrices.** Every quantum gate — X, Hadamard, CNOT, all of them — is literally a small matrix of complex numbers, and "apply the gate" means "multiply the vector by the matrix." Master 2×2 matrix mechanics now and Modules 5–8 become computation instead of ceremony.

## 1. What a matrix is — and what it's *for*

A **matrix** is a rectangular grid of numbers; a 2×2 example:

$$M = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}$$

Rows run horizontally (row 1 is $1, 2$), columns vertically (column 1 is $1, 3$). Entry $M_{ij}$ sits at row $i$, column $j$ — row first, always.

But the grid is just storage. A matrix's *job* is to be a **function that eats vectors and returns vectors** — a machine, in Lesson 2's sense, whose rule is fixed by its entries:

$$M\vec v = \begin{pmatrix} 1 & 2 \\ 3 & 4 \end{pmatrix}\begin{pmatrix} 5 \\ 6 \end{pmatrix} = \begin{pmatrix} 1\cdot5 + 2\cdot6 \\ 3\cdot5 + 4\cdot6 \end{pmatrix} = \begin{pmatrix} 17 \\ 39 \end{pmatrix}$$

**Mechanics**: each output entry is a *dot product of a row with the input vector* — row 1 dotted with $\vec v$ gives output entry 1, and so on. Say it while computing ("row times column… row times column") until your hands do it alone.

@@diagram:matmul-mechanics|Matrix × vector: each output slot is one row dotted with the input column. Two rows, two dot products, done.

## 2. The two secrets that make matrices tame

**Secret 1 — columns are where the basis vectors go.** Feed in $\hat e_1 = \binom10$: out comes exactly **column 1** of $M$ (try it: $\binom{1}{3}$). Feed $\hat e_2 = \binom01$: column 2. So you can *read* any matrix instantly: its columns are the destinations of the basis vectors. Conversely, to *build* the matrix for any transformation you want, ask "where should $\binom10$ go? where should $\binom01$ go?" and write those as columns. You will construct every quantum gate this way.

**Secret 2 — linearity.** Matrices respect linear combinations:

$$M(a\vec u + b\vec v) = a\,M\vec u + b\,M\vec v$$

Consequence with maximal quantum payoff: to know what $M$ does to *any* superposition, it's enough to know what it does to the basis states. When Module 5 applies a gate to $\alpha\ket0 + \beta\ket1$, the answer is just $\alpha(M\ket0) + \beta(M\ket1)$ — the gate acts on each basis piece and the amplitudes tag along. Linearity is why quantum mechanics is *computable* by hand at all.

**Example — build a rotation.** Rotating the plane by angle $\theta$ counterclockwise sends $\binom10 \to \binom{\cos\theta}{\sin\theta}$ and $\binom01 \to \binom{-\sin\theta}{\cos\theta}$ (rotate each and read coordinates off the unit circle). Columns in place:

$$R(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}$$

@@diagram:matrix-transform|A matrix transforms the whole plane at once: the basis arrows land on the matrix's columns, and every other vector follows by linearity.

## 3. Matrix × matrix — composition, and why order matters

Applying $A$ then $B$ to every vector is itself a linear machine: the **product** $BA$ (rightmost acts first — it sits next to the vector in $BA\vec v$). Mechanically, entry $(i,j)$ of $BA$ is row $i$ of $B$ dotted with column $j$ of $A$:

$$\underbrace{\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}}_{B}\underbrace{\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}}_{A} = \begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix} \qquad AB = \begin{pmatrix} 0 & 1 \\ -1 & 0 \end{pmatrix}$$

$AB \ne BA$. **Matrix multiplication is not commutative**, because doing-then-undoing life isn't: rotate-then-reflect differs from reflect-then-rotate. (Those two matrices are, incidentally, the quantum gates Z and X — and the fact that $XZ = -ZX$ will do real work in Module 6.)

Two sanity anchors: multiplication *is* associative, $(AB)C = A(BC)$ — grouping is free, order is not. And dimensions must chain: (2×2)(2×2)→2×2; (2×2)(2×1 vector)→2×1.

## 4. Identity, inverse, transpose, dagger

**Identity** $I = \begin{pmatrix}1&0\\0&1\end{pmatrix}$: the do-nothing machine, $I\vec v = \vec v$, $IM = MI = M$. (Columns: basis vectors stay put — read it off!)

**Inverse** $M^{-1}$: the undo machine, $M^{-1}M = I$. For 2×2 there's a closed form worth knowing:

$$\begin{pmatrix} a & b \\ c & d \end{pmatrix}^{-1} = \frac{1}{ad - bc}\begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$$

The number $\det M = ad - bc$ (**determinant**) measures how the matrix scales area; if it's 0 the machine flattens the plane into a line, information is destroyed, and no inverse exists — the matrix analogue of $x^2$'s sign-loss from Lesson 2. Quantum foreshadow: gates must be invertible, and their determinants always have modulus 1.

**Transpose** $M^T$: flip across the main diagonal (rows become columns). **Conjugate transpose** ("dagger") $M^\dagger = (M^T)^*$: transpose *and* conjugate every entry — the complex-world's proper transpose, and the single most-typed symbol in quantum mechanics:

$$M = \begin{pmatrix} 1 & i \\ 0 & 2 \end{pmatrix} \quad\Rightarrow\quad M^\dagger = \begin{pmatrix} 1 & 0 \\ -i & 2 \end{pmatrix}$$

Rules: $(AB)^T = B^T A^T$ and $(AB)^\dagger = B^\dagger A^\dagger$ — **order reverses** (like undoing socks and shoes). Next lessons define quantum's two royal families with it: Hermitian ($M^\dagger = M$) and unitary ($M^\dagger = M^{-1}$).

```python
import numpy as np
A = np.array([[1, 0], [0, -1]])          # Z
B = np.array([[0, 1], [1, 0]])           # X
v = np.array([5, 6])
print(A @ v)                  # [ 5 -6]        @ is matrix multiply
print(B @ A)                  # [[ 0 -1] [ 1  0]]
print(A @ B)                  # [[ 0  1] [-1  0]]   ← different! order matters
M = np.array([[1, 1j], [0, 2]])
print(M.conj().T)             # dagger: [[1.-0.j 0.-0.j] [0.-1.j 2.-0.j]]
print(np.linalg.inv(np.array([[1., 2.], [3., 4.]])))   # [[-2.   1. ] [ 1.5 -0.5]]
```

(`@` is Python's matrix-multiply operator; `*` would multiply entry-by-entry — a different, usually wrong, thing. Tattoo this distinction somewhere.)

## Worked example — your first quantum gate computation (smuggled in early)

The **Hadamard matrix** — you'll meet it officially in Module 6, but you already own every tool it needs:

$$H = \frac{1}{\sqrt2}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$

**(a) What does it do to the basis?** Read the columns: $\binom10 \mapsto \tfrac{1}{\sqrt2}\binom11$ and $\binom01 \mapsto \tfrac{1}{\sqrt2}\binom{1}{-1}$. In quantum words: it turns definite states into equal superpositions (with a sign twist on the second — a relative phase of $\pi$!).

**(b) Apply it to the superposition $\tfrac{1}{\sqrt2}\binom11$:**

$$H\cdot\tfrac{1}{\sqrt2}\begin{pmatrix}1\\1\end{pmatrix} = \tfrac{1}{2}\begin{pmatrix}1+1\\1-1\end{pmatrix} = \begin{pmatrix}1\\0\end{pmatrix}$$

The superposition collapses back to a *definite* state — not by measurement, but by interference: the bottom entry computed $1 - 1 = 0$. **You just watched destructive interference happen inside a matrix multiplication.** That minus sign in $H$'s corner is where the cancellation came from.

**(c) $H$ is its own inverse:** $H\cdot H = \tfrac12\begin{pmatrix}1+1 & 1-1\\ 1-1 & 1+1\end{pmatrix} = I$. Apply twice, get identity — consistent with (a)+(b): create superposition, then uncreate it.

```python
import numpy as np
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
print(H @ np.array([1, 0]))        # [0.7071 0.7071]
print(H @ (H @ np.array([1, 0])))  # [1. 0.]  — twice = identity
print(np.round(H @ H, 10))         # [[1. 0.] [0. 1.]]
```

## Gotchas

- **`*` vs `@` in NumPy.** `A * B` multiplies element-wise; `A @ B` is true matrix multiplication. Element-wise "gates" produce silently wrong states — the classic NumPy quantum bug.
- **Row-column discipline.** Output entry $i$ = row $i$ · input. Mixing this up transposes your answer; if results look "mirrored," check here first.
- **Assuming commutativity.** $AB \ne BA$ in general. Before swapping any two matrices in a derivation, prove they commute (compute both, or know a theorem).
- **Dagger without the conjugate.** For complex matrices, transpose alone ($M^T$) is a half-measure with no nice properties; quantum mechanics wants $M^\dagger$. NumPy: `M.conj().T` (there is no built-in single call — everyone writes this pair).
- **Dividing by matrices.** There is no matrix division; multiply by the inverse — *on the correct side*: solving $AX = B$ gives $X = A^{-1}B$, not $BA^{-1}$ (different in general!).
- **Inverting the non-invertible.** $\det = 0$ means no inverse; NumPy raises `LinAlgError: Singular matrix`. Check the determinant when an inverse is even slightly in doubt.

## Scenario — the graphics interview that was secretly a gates interview

A friend interviews for a game-studio tools role. Task: "our sprite renderer applies matrix $S$ (scale ×2) then $R$ (rotate 90°); artists complain sprites look wrong when the pipeline reversed the order last patch. Explain, and give the fix as one matrix." Friend computes $RS$ vs $SR$ for a test vector, shows they differ when scaling is non-uniform, then hands over the single combined matrix $C = RS$ ("bake the composition — one multiply per vertex instead of two"). Offer received. Now the punchline for you: replace "scale, rotate" with "Hadamard, phase gate" and this is *exactly* the reasoning of every quantum circuit: gates compose by matrix product, order is physics, and compilers (Module 7's transpiler) bake long gate sequences into fewer combined matrices for speed. Same math, same interview, different industry.

## Key points

- A matrix is a linear machine on vectors: output entry $i$ = (row $i$)·(input); columns tell you where basis vectors land — read gates this way forever.
- Linearity $M(a\vec u + b\vec v) = aM\vec u + bM\vec v$ means knowing a gate's action on $\ket0,\ket1$ determines its action on every superposition.
- Products compose machines, rightmost first; $AB \ne BA$ in general — gate order is physical.
- Identity does nothing; inverse undoes ($\det \ne 0$ required); the 2×2 inverse formula and $\det = ad - bc$ are worth memorizing.
- Dagger $M^\dagger = (M^T)^*$ is the complex transpose; $(AB)^\dagger = B^\dagger A^\dagger$ (order flips). Quantum's royal matrix families are defined with it.
- $H$ demonstrated the whole plot in 2×2: superposition creation, interference-by-minus-sign, self-inverse evolution. NumPy: `@`, `conj().T`, `np.linalg.inv`.

## Check yourself

```quiz
{"q":"Reading columns: the matrix M sends (1,0) to (0,1) and (0,1) to (-1,0). What is M?","options":["Columns (0,1) and (-1,0) — the 90° rotation matrix","Rows (0,1) and (-1,0)","The identity — nothing moved","Columns (1,0) and (0,-1)"],"answer":0,"why":"Where the basis vectors land IS the matrix, written as columns: first column (0,1), second (-1,0). That's R(π/2) — check against the rotation formula with cos 90° = 0, sin 90° = 1."}
```

```quiz
{"q":"For the Hadamard H, computing H·H gives the identity. What is the correct professional takeaway?","options":["H is not a valid quantum operation","H is its own inverse — applying it twice undoes it, so superposition-making is reversible","H commutes with every matrix","H has determinant zero"],"answer":1,"why":"H² = I means H⁻¹ = H (self-inverse). Creating a superposition is fully reversible evolution — no information is lost until a measurement happens. (Its determinant is −1, and it certainly doesn't commute with everything.)"}
```

## Exercises

**Exercise 1 — build, compose, verify.** Let $X = \begin{pmatrix}0&1\\1&0\end{pmatrix}$ and $Z = \begin{pmatrix}1&0\\0&-1\end{pmatrix}$. By hand: (a) compute $X\binom{\alpha}{\beta}$ and describe the action in words; (b) compute $XZ$ and $ZX$; (c) show $XZ = -ZX$. Verify (b) in NumPy.

````solution
(a) $X\binom{\alpha}{\beta} = \binom{\beta}{\alpha}$ — it swaps the components. (Quantum reading: exchanges the amplitudes of $\ket0$ and $\ket1$; a bit-flip, the quantum NOT.)

(b) $XZ = \begin{pmatrix}0&1\\1&0\end{pmatrix}\begin{pmatrix}1&0\\0&-1\end{pmatrix} = \begin{pmatrix}0&-1\\1&0\end{pmatrix}$; $\;ZX = \begin{pmatrix}0&1\\-1&0\end{pmatrix}$.

(c) Multiply $ZX$ by $-1$: $\begin{pmatrix}0&-1\\1&0\end{pmatrix} = XZ$ ✓. They *anticommute*: $XZ + ZX = 0$.

```python
import numpy as np
X = np.array([[0,1],[1,0]]); Z = np.array([[1,0],[0,-1]])
print(X @ Z)   # [[ 0 -1] [ 1  0]]
print(Z @ X)   # [[ 0  1] [-1  0]]
```

That innocent-looking minus sign is load-bearing: anticommutation of X and Z underlies error-correction syndrome extraction (Module 10) and the uncertainty trade-off between bit and phase information. You computed a famous fact today.
````

**Exercise 2 — the inverse in anger.** For $M = \begin{pmatrix}2&1\\1&1\end{pmatrix}$: (a) compute $\det M$ and $M^{-1}$ by the formula; (b) verify $M^{-1}M = I$ by hand; (c) solve $M\vec x = \binom{5}{3}$ using the inverse; (d) confirm with `np.linalg.solve` and explain why `solve` is preferred over computing the inverse in production code.

````solution
(a) $\det M = 2\cdot1 - 1\cdot1 = 1$; $M^{-1} = \tfrac{1}{1}\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$.

(b) $\begin{pmatrix}1&-1\\-1&2\end{pmatrix}\begin{pmatrix}2&1\\1&1\end{pmatrix} = \begin{pmatrix}2-1 & 1-1\\ -2+2 & -1+2\end{pmatrix} = I$ ✓.

(c) $\vec x = M^{-1}\binom53 = \begin{pmatrix}5-3\\-5+6\end{pmatrix} = \binom{2}{1}$. Check forward: $M\binom21 = \binom{5}{3}$ ✓.

```python
import numpy as np
M = np.array([[2.,1.],[1.,1.]])
print(np.linalg.solve(M, np.array([5.,3.])))   # [2. 1.]
```

(d) `solve` factors the system directly — roughly half the floating-point work of forming $M^{-1}$ and multiplying, and numerically more stable when the matrix is nearly singular (tiny determinant → the explicit inverse amplifies rounding error savagely). Rule of professional numerics: **you almost never need the inverse itself, only its action** — the same philosophy with which quantum computers apply gates without ever "writing down" exponentially large matrices.
````

## Practice questions

1. Compute $\begin{pmatrix}1&2\\0&1\end{pmatrix}\begin{pmatrix}3\\-1\end{pmatrix}$, and state which columns tell you where the basis vectors go.
2. Build the matrix that reflects the plane across the x-axis (where must each basis vector land?). You've met this matrix under another name today — which?
3. Show that $R(\alpha)R(\beta) = R(\alpha + \beta)$ makes intuitive sense without computing (one sentence), then name which trig identities the entry-wise computation would produce for free.
4. Compute $\det H$ for the Hadamard and reconcile "determinant −1" with "H preserves lengths."
5. Give $M^\dagger$ for $M = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$ and observe something special. (This matrix is the gate Y.)
6. Why does $(AB)^\dagger = B^\dagger A^\dagger$ reverse order? Answer with the socks-and-shoes principle in matrix language.
7. **Design question:** using only the two facts "columns = images of basis vectors" and "linearity," design the 2×2 matrix that implements *"swap the components, then flip the sign of the (new) second component"* as ONE matrix, and verify it on $\binom{\alpha}{\beta}$.

````solution
1. $\binom{3\cdot1 + 2\cdot(-1)}{0 + (-1)} = \binom{1}{-1}$; columns 1 and 2 of the matrix are the images of $\hat e_1, \hat e_2$.
2. $\binom10\mapsto\binom10$, $\binom01\mapsto\binom0{-1}$: matrix $\begin{pmatrix}1&0\\0&-1\end{pmatrix}$ — this is Z, the phase-flip gate. Reflection = phase flip: hold that thought for the Bloch sphere.
3. Rotating by β then by α is one rotation by α+β — composition of turns adds angles; multiplying out the entries yields the angle-addition formulas $\cos(\alpha{+}\beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta$ etc. as byproducts.
4. $\det H = \tfrac12(-1 -1) = -1$: determinant's *sign* records orientation-flip (H is a reflection in disguise), while its *modulus* 1 records area/length preservation. Both facts are true simultaneously.
5. $M^T = \begin{pmatrix}0&i\\-i&0\end{pmatrix}$, conjugating gives back $\begin{pmatrix}0&-i\\i&0\end{pmatrix} = M$. So $Y^\dagger = Y$: it equals its own dagger — your first Hermitian matrix, one lesson early.
6. In $(AB)\vec v$, $B$ acts first; undoing/daggering must peel the *outermost* layer first: dagger of the composite applies $B^\dagger$ after $A^\dagger$ — i.e. $B^\dagger A^\dagger$. Shoes went on last, so they come off first.
7. Step actions: swap = $X$; then flip second sign = $Z$. "Then" means multiply on the LEFT: $M = ZX = \begin{pmatrix}0&1\\-1&0\end{pmatrix}$. Verify: $\binom{\alpha}{\beta} \xrightarrow{X} \binom{\beta}{\alpha} \xrightarrow{Z} \binom{\beta}{-\alpha}$, and directly $ZX\binom\alpha\beta = \binom{\beta}{-\alpha}$ ✓. (Bonus recognition: $ZX = -iY$ — compositions of the famous gates are famous gates, up to phase.)
````
