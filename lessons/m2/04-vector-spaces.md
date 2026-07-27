# Vector spaces, basis & linear combinations

"The state of a qubit is a unit vector in $\mathbb{C}^2$." After this lesson, that sentence — which opens every quantum textbook — will read as plainly as "the temperature is a number." You'll learn what a vector space is, what a basis does, why the *same* state has different coordinates in different bases, and why that last fact is not pedantry: measuring in different bases is a physical act, and quantum cryptography, algorithms, and error correction all live in the gap between bases.

## 1. Vector spaces — the arena

A **vector space** is any collection of objects that you can add together and scale by numbers, with the results staying in the collection and the usual algebra rules holding (order of addition irrelevant, distribution works, a zero vector exists, etc.). The two operations from Lesson 4 — that's the whole entry fee.

The spaces this course cares about:

| Space | Objects | Scalars | Quantum role |
|---|---|---|---|
| $\mathbb{R}^2$ | pairs of reals | real numbers | warm-up geometry (done!) |
| $\mathbb{C}^2$ | pairs of complex numbers | complex numbers | **one qubit** |
| $\mathbb{C}^4$ | quadruples of complex | complex | two qubits (Module 6) |
| $\mathbb{C}^{2^n}$ | $2^n$-tuples | complex | $n$ qubits |

$\mathbb{C}^2$ means: vectors like $\binom{1+i}{2}$, scaled by complex numbers, added componentwise. Everything from Lessons 4–7 transfers; only the number type upgraded.

## 2. Linear combinations and span

Given vectors $\vec u, \vec v$, the expression $a\vec u + b\vec v$ (any scalars $a,b$) is a **linear combination** — the only sentence vector spaces can say, and the sentence quantum mechanics never stops saying:

$$\ket\psi = \alpha\ket0 + \beta\ket1$$

*A superposition is a linear combination. That's the entire definition.* No mysticism: the state is a weighted mix of basis vectors with complex weights.

The **span** of a set of vectors is everything reachable by linear combinations. Span of $\binom10$ alone: the whole horizontal axis. Span of $\binom10$ and $\binom01$: all of the plane. Span of $\binom10$ and $\binom20$: still just the horizontal axis — the second vector brought nothing new. Which motivates:

## 3. Linear independence — no freeloaders

Vectors are **linearly independent** if none of them is a linear combination of the others — each genuinely adds a new direction. Practical 2-vector test: independent unless one is a scalar multiple of the other. ($\binom10, \binom20$: dependent. $\binom11, \binom1{-1}$: independent — no scalar turns one into the other.)

Why you care: dependent "basis" vectors create states with non-unique descriptions, and the math dissolves into ambiguity. Independence is what makes coordinates *mean* something.

## 4. Basis and dimension — the coordinate system

A **basis** of a space is a set of vectors that is (a) linearly independent and (b) spans the space. Consequences, both provable and worth believing:

- Every vector in the space is expressible as a linear combination of basis vectors in **exactly one way**. Those unique coefficients are the vector's **coordinates in that basis**.
- Every basis of a given space has the same size — the space's **dimension**. $\mathbb{C}^2$ has dimension 2 (hence "two amplitudes describe a qubit").

The **standard basis** of $\mathbb{C}^2$ gets quantum names and its own typography:

$$\ket0 = \begin{pmatrix}1\\0\end{pmatrix} \qquad \ket1 = \begin{pmatrix}0\\1\end{pmatrix}$$

(The funny brackets are Dirac notation, formalized next lesson; today they're just names.) These are the **computational basis** states — "definitely 0" and "definitely 1." A general qubit state is their combination with the coordinates called amplitudes:

$$\ket\psi = \alpha\ket0 + \beta\ket1 = \begin{pmatrix}\alpha\\\beta\end{pmatrix}, \qquad |\alpha|^2 + |\beta|^2 = 1$$

## 5. Other bases — the plot twist that runs the field

Nothing crowns the standard basis king. The pair

$$\ket{+} = \tfrac{1}{\sqrt2}\begin{pmatrix}1\\1\end{pmatrix} = \tfrac{1}{\sqrt2}(\ket0 + \ket1) \qquad \ket{-} = \tfrac{1}{\sqrt2}\begin{pmatrix}1\\-1\end{pmatrix} = \tfrac{1}{\sqrt2}(\ket0 - \ket1)$$

is independent and spans $\mathbb{C}^2$: a perfectly legal basis (the **Hadamard basis** — H maps one basis to the other, as its columns confessed last lesson). Any state now has *two* coordinate descriptions:

@@diagram:basis-change|One state, two descriptions. The SAME arrow has coordinates (1, 0) in the standard basis and (1/√2, 1/√2) in the +/− basis. Nothing about the arrow changed — only the reference frame.

**Same state, translated.** Take $\ket0$ itself. In the standard basis: coordinates $(1, 0)$. In the $\{\ket+,\ket-\}$ basis? Solve $\ket0 = a\ket+ + b\ket-$: adding the definitions gives $\ket+ + \ket- = \tfrac{2}{\sqrt2}\ket0 = \sqrt2\ket0$, so

$$\ket0 = \tfrac{1}{\sqrt2}\ket+ + \tfrac{1}{\sqrt2}\ket-$$

Sit with this: **"definitely 0" is an equal superposition — in another basis.** Superposition is not a property of a state; it's a *relationship between a state and a basis*. The physical punchline (Module 5 makes it precise): measurement devices come with a basis attached. Measure $\ket0$ in the standard basis → always "0". Measure the same $\ket0$ in the $\pm$ basis → 50/50 coin flip ($|\tfrac{1}{\sqrt2}|^2$ each way). Same state, different questions, different statistics. BB84 quantum cryptography is *literally* this paragraph weaponized: encode in randomly chosen bases; an eavesdropper who guesses the basis wrong scrambles the state detectably.

```python
import numpy as np
ket0 = np.array([1, 0]); ket1 = np.array([0, 1])
plus  = (ket0 + ket1) / np.sqrt(2)
minus = (ket0 - ket1) / np.sqrt(2)
# coordinates of ket0 in the ± basis = dot products (works because ± is orthonormal):
print(plus @ ket0, minus @ ket0)        # 0.7071067811865475 0.7071067811865475
# reconstruct: a|+> + b|->
print((plus @ ket0) * plus + (minus @ ket0) * minus)   # [1. 0.]  = ket0 ✓
```

The code smuggled in the key mechanic: **for an orthonormal basis, coordinates are dot products with basis vectors** (Lesson 4's "components are dot products," now in its adult form — full complex version next lesson).

## Worked example — certify a basis, then use it

*Claim: $\ket{u} = \tfrac{1}{\sqrt5}\binom{1}{2}$ and $\ket{v} = \tfrac{1}{\sqrt5}\binom{2}{-1}$ form an orthonormal basis of real 2-space. Certify, then find the coordinates of $\vec w = \binom{3}{1}$ in this basis.*

**Certify.** Norms: $\tfrac{1}{5}(1+4) = 1$ ✓ and $\tfrac15(4+1) = 1$ ✓. Orthogonality: $\ket u \cdot \ket v = \tfrac15(1\cdot2 + 2\cdot(-1)) = 0$ ✓. Two orthonormal vectors in a 2-dimensional space automatically span it (independence is free: orthogonal nonzero vectors can't be multiples). Basis certified.

**Coordinates by dot product.** $a = \vec w\cdot\ket u = \tfrac{1}{\sqrt5}(3 + 2) = \tfrac{5}{\sqrt5} = \sqrt5$; $\;b = \vec w\cdot\ket v = \tfrac{1}{\sqrt5}(6 - 1) = \sqrt5$.

**Verify by reconstruction** (always close the loop): $\sqrt5\,\ket u + \sqrt5\,\ket v = \binom{1}{2} + \binom{2}{-1} = \binom{3}{1} = \vec w$ ✓.

Note what made it easy: orthonormality turned "solve a system of equations" into "take two dot products." This convenience is why quantum mechanics *insists* on orthonormal bases — with $2^n$ dimensions, solving systems is agony; dotting is mechanical.

## Gotchas

- **"Superposition" treated as absolute.** Every state is a superposition in some basis and a basis state in another (any unit vector can be *chosen* as a basis element). Meaningful claims always name the basis: "superposition *in the computational basis*."
- **Non-normalized "basis" vectors in quantum contexts.** $\binom11$ spans fine mathematically, but quantum coordinates-as-probabilities require unit vectors; forgetting the $\tfrac{1}{\sqrt2}$ inflates probabilities by 2. Normalize basis vectors on sight.
- **Dimension vs number of entries confusion later.** One qubit: dimension 2. Two qubits: dimension 4, not 2+2 (Module 6's tensor product — dimensions *multiply*). Plant the flag now: adding a qubit *doubles* dimension.
- **Coordinates confused with the vector.** $(1, 0)$ is not "the state" — it's the state's *address in a chosen basis*. Change basis, address changes, state doesn't. (Programmers: value vs encoding.)
- **Testing independence by "they look different."** $\binom{2}{4}$ and $\binom{3}{6}$ look different and are dependent. Test: is one a scalar multiple of the other? (n vectors: determinant/rank — NumPy `np.linalg.matrix_rank`.)
- **Assuming any two states make a measurement.** A measurement basis needs *orthonormal* vectors; $\ket0$ and $\ket+$ are both legal states but are NOT orthogonal (overlap $\tfrac{1}{\sqrt2}$), so "measure in the $\{0,+\}$ basis" is not a thing.

## Scenario — the eavesdropper who failed linear algebra

Alice sends qubits to Bob for a BB84 key exchange, encoding each bit randomly in either the standard basis ($\ket0,\ket1$) or the Hadamard basis ($\ket+,\ket-$). Eve intercepts, but measures *everything in the standard basis*. When Alice happened to use the ± basis — half the time — Eve's measurement asks the wrong question: her device sees, say, $\ket+ = \tfrac{1}{\sqrt2}\ket0 + \tfrac{1}{\sqrt2}\ket1$ and returns 0 or 1 at coin-flip random, *and re-prepares the qubit in whatever it answered*. The state Bob receives is now $\ket0$ or $\ket1$, not $\ket+$; when Bob measures in the (correct) ± basis, he gets $\ket-$ — a bit Alice never sent — 25% of the time overall. Alice and Bob publicly compare a sample, see a ~25% error rate where hardware should give ~1%, and abort: Eve is caught by *coordinates in the wrong basis*. Every quantum-security job interview contains some version of "walk me through why Eve gets caught," and the complete answer is this lesson plus a dot product.

## Key points

- A vector space is anything closed under adding and scaling; a qubit lives in $\mathbb{C}^2$, $n$ qubits in $\mathbb{C}^{2^n}$.
- Superposition = linear combination: $\ket\psi = \alpha\ket0 + \beta\ket1$, with unique amplitudes once a basis is fixed.
- Basis = independent + spanning; dimension = basis size; coordinates in a basis are unique.
- Orthonormal bases make coordinates cheap: coordinate = dot product with the basis vector; reconstruction verifies.
- The same state has different coordinates in different bases; $\ket0$ is an equal superposition in the ± basis. Superposition is basis-relative, and measurements come with a basis attached.
- $\{\ket+,\ket-\}$ is the Hadamard basis; basis mismatch = randomness + disturbance, the engine of BB84's security.

## Check yourself

```quiz
{"q":"The state |−⟩ = (1/√2)(|0⟩ − |1⟩) is measured in the standard basis, and separately an identical copy is measured in the {|+⟩, |−⟩} basis. The outcome statistics are:","options":["50/50 in both cases","50/50 for standard basis; certainly '−' in the ± basis","Certainly '1' in standard; 50/50 in ±","Certainly '−' in both cases"],"answer":1,"why":"In the standard basis the amplitudes are ±1/√2 → probabilities 1/2 each. In its OWN basis, |−⟩ is a basis state → deterministic outcome. Statistics depend on the basis you ask in."}
```

```quiz
{"q":"Which pair fails to be a valid measurement basis for one qubit?","options":["|0⟩ and |1⟩","|+⟩ and |−⟩","|0⟩ and |+⟩","(1/√5)(1,2) and (1/√5)(2,−1)"],"answer":2,"why":"|0⟩ and |+⟩ overlap by 1/√2 — not orthogonal, so no measurement distinguishes them perfectly and they can't form a measurement basis. The other pairs are orthonormal."}
```

## Exercises

**Exercise 1 — basis or not?** For each set, decide: basis of the (real) plane or not, and why. (a) $\binom12, \binom24$; (b) $\binom11, \binom01$; (c) $\binom10, \binom01, \binom11$; (d) $\tfrac{1}{\sqrt2}\binom11, \tfrac{1}{\sqrt2}\binom{1}{-1}$. For the sets that are bases, state whether they're orthonormal.

````solution
(a) **Not a basis**: $\binom24 = 2\binom12$ — dependent; they span only a line.

(b) **Basis**: independent (neither is a multiple of the other) and two independent vectors in 2D always span. **Not orthonormal**: $\binom11\cdot\binom01 = 1 \ne 0$ and $\lVert(1,1)\rVert = \sqrt2 \ne 1$. Legal for math, inconvenient for quantum (coordinates stop being dot products).

(c) **Not a basis**: three vectors in a 2-dimensional space are never independent ($\binom11 = \binom10 + \binom01$). Spans, yes; basis, no — uniqueness of coordinates dies.

(d) **Basis, orthonormal**: it's exactly $\{\ket+, \ket-\}$ — norms 1, dot product $\tfrac12(1-1) = 0$.

The four cases are the complete taxonomy: dependent, independent-but-skewed, too many, and the gold standard. Quantum work lives in category (d).
````

**Exercise 2 — translate a state between bases.** Express $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac12\ket1$ in the $\{\ket+,\ket-\}$ basis, then answer: which basis' measurement gives more predictable outcomes for this state? Verify probabilities in NumPy.

````solution
Coordinates via dot products with $\ket\pm$:

$a_+ = \tfrac{1}{\sqrt2}\left(\tfrac{\sqrt3}{2} + \tfrac12\right) = \tfrac{\sqrt3 + 1}{2\sqrt2} \approx 0.9659$, $\quad a_- = \tfrac{1}{\sqrt2}\left(\tfrac{\sqrt3}{2} - \tfrac12\right) = \tfrac{\sqrt3 - 1}{2\sqrt2} \approx 0.2588$.

So $\ket\psi \approx 0.9659\ket+ + 0.2588\ket-$. Probabilities: standard basis $\;75\% / 25\%$; ± basis $\;0.9659^2 \approx 93.3\%$ vs $6.7\%$.

**The ± basis is more predictable for this state** (93/7 beats 75/25). Geometric reason: $\ket\psi$ points *closer to* $\ket+$ (30° away) than to $\ket0$ (it's 30° from $\ket0$ too on the circle, but the half-angle probability rule differs — compute, don't eyeball; the numbers above are the arbiter).

```python
import numpy as np
psi = np.array([np.sqrt(3)/2, 1/2])
plus = np.array([1,1])/np.sqrt(2); minus = np.array([1,-1])/np.sqrt(2)
print((plus@psi)**2, (minus@psi)**2)   # 0.9330127018922194 0.0669872981077806
```

(Those numbers — 0.933, 0.067 — are $\cos^2 15°$ and $\sin^2 15°$: the state sits 30° from $\ket+$ on the circle, half-angle rule in action. Everything connects.)
````

## Practice questions

1. Why must basis vectors be linearly independent for coordinates to be unique? (Consider what a dependency would let you rewrite.)
2. What is the dimension of the state space of 3 qubits, and how many complex amplitudes describe a general state there?
3. Give the coordinates of $\ket1$ in the $\{\ket+, \ket-\}$ basis, by dot product or by solving.
4. True or false, with one sentence: "a state that gives 50/50 outcomes is necessarily $\ket+$ or $\ket-$."
5. Check whether $\tfrac{1}{\sqrt2}\binom{1}{i}$ and $\tfrac{1}{\sqrt2}\binom{1}{-i}$ are orthogonal — carefully: the dot product for complex vectors needs a conjugate (next lesson's subject; use $\sum u_k^* v_k$).
6. In the BB84 scenario, why exactly 25% errors from Eve (not 50%)? Trace the two coin flips.
7. **Design question:** invent your own orthonormal basis of real 2-space that is neither the standard nor the ± basis, prove orthonormality, and compute the outcome statistics of measuring $\ket0$ in your basis.

````solution
1. A dependency (one basis vector a combination of others) lets you trade coefficients between them: the same vector gets many addresses, and "the coordinates of v" stops denoting anything.
2. $2^3 = 8$ dimensions; 8 complex amplitudes (constrained by normalization and global phase — but 8 entries in the vector).
3. $\ket1 = \tfrac{1}{\sqrt2}\ket+ - \tfrac{1}{\sqrt2}\ket-$ (dot products: $\tfrac{1}{\sqrt2}$ and $-\tfrac{1}{\sqrt2}$).
4. **False** — e.g. $\tfrac{1}{\sqrt2}\binom{1}{i}$ also gives 50/50 in the standard basis; infinitely many states on the "equator" do (they differ by relative phase, invisible to this basis).
5. $\sum u_k^* v_k = \tfrac12\left(1\cdot1 + (-i)(-i)\right) = \tfrac12(1 + i^2\cdot 1)$… careful: $(-i)\cdot(-i) = i^2 = -1$, giving $\tfrac12(1 - 1) = 0$ ✓ orthogonal. (These are the $\ket{\pm i}$ states — the third famous basis, completing X, Y, Z's trio.)
6. Eve picks the wrong basis half the time (flip 1); when wrong, Bob's correct-basis measurement of Eve's re-prepared state errs half the time (flip 2): $\tfrac12 \times \tfrac12 = 25\%$.
7. Any rotation of the standard basis works, e.g. $\ket{u} = (\cos 30°, \sin 30°) = (\tfrac{\sqrt3}{2}, \tfrac12)$, $\ket{v} = (-\tfrac12, \tfrac{\sqrt3}{2})$. Orthonormal: norms 1 (Pythagorean identity), dot $= -\tfrac{\sqrt3}{4} + \tfrac{\sqrt3}{4} = 0$. Measuring $\ket0$: $p(u) = (\ket u\cdot\ket0)^2 = \tfrac34$, $p(v) = \tfrac14$. Design lesson: *every* angle θ yields a legal basis with statistics $\cos^2\theta / \sin^2\theta$ — bases form a continuum, and "which question to ask the qubit" is a dial, not a switch.
````
