# Vector spaces, basis & linear combinations

"The state of a qubit is a unit vector in $\mathbb{C}^2$." After this lesson, that sentence — which opens every quantum textbook — will read as plainly as "the temperature is a number." You'll learn what a vector space is, what a basis does, why the *same* state has different coordinates in different bases, and why that last fact is not pedantry: measuring in different bases is a physical act, and quantum cryptography, algorithms, and error correction all live in the gap between bases.

## Start here — the intuition

A **vector space** is just any collection of things you can add together and scale by numbers. A qubit lives in one called $\mathbb{C}^2$ — pairs of complex numbers. And a **superposition is nothing but a linear combination** of basis vectors: $\ket\psi = \alpha\ket0 + \beta\ket1$. No mysticism — a weighted mix, with complex weights.

Here's the plot twist that runs the whole field: **nothing makes the standard basis special.** The same physical state has *different coordinates in different bases*, and — remarkably — "definitely 0" is an *equal superposition* when written in another basis. So superposition isn't a property of a state; it's a *relationship between a state and a basis you chose*. Measurement devices come with a basis attached: measure $\ket0$ in the standard basis and you always get 0; measure that exact same $\ket0$ in the "±" basis and it's a coin flip. That gap between bases is what quantum cryptography weaponizes.

## The arena, and the one sentence it can say

A qubit lives in $\mathbb{C}^2$; two qubits in $\mathbb{C}^4$; $n$ qubits in $\mathbb{C}^{2^n}$ (adding a qubit *doubles* the dimension). The only sentence a vector space can say is the **linear combination** $a\vec u + b\vec v$ — and that's the sentence quantum mechanics never stops saying. A **basis** is a set of vectors that is linearly independent (no freeloaders — none is a combination of the others) and spans the space; then every vector has *unique* coordinates in that basis. The **standard (computational) basis** of $\mathbb{C}^2$ is $\ket0 = \binom10$, $\ket1 = \binom01$, and a qubit's coordinates in it are its amplitudes.

## Other bases — the plot twist

The **Hadamard basis** $\ket\pm = \tfrac{1}{\sqrt2}(\ket0 \pm \ket1)$ is equally legal. So any state has *two* coordinate descriptions:

@@diagram:basis-change|One state, two descriptions. The SAME arrow has coordinates (1, 0) in the standard basis and (1/√2, 1/√2) in the +/− basis. Nothing about the arrow changed — only the reference frame.

@@widget

Solve $\ket0 = a\ket+ + b\ket-$: since $\ket+ + \ket- = \sqrt2\ket0$, we get $\ket0 = \tfrac{1}{\sqrt2}\ket+ + \tfrac{1}{\sqrt2}\ket-$. Sit with it: **"definitely 0" is an equal superposition in the ± basis.** The mechanic that made it easy — *for an orthonormal basis, a coordinate is just the dot product with that basis vector* — is the workhorse of the whole subject.

## Predict, then run — same state, different questions

The live cell writes $\ket0$ in both bases and measures it both ways.

**Predict first.** $\ket0$ measured in the standard basis is certainly "0." Measured in the ± basis, what are the odds? Guess, then Run.

```run
# Live cell — the SAME state has different coordinates AND different measurement odds per basis.
import numpy as np
ket0 = np.array([1,0]); ket1 = np.array([0,1])
plus  = (ket0 + ket1)/np.sqrt(2)
minus = (ket0 - ket1)/np.sqrt(2)

a_plus, a_minus = plus @ ket0, minus @ ket0            # coordinates = dot products (orthonormal basis)
print("|0> in +/- basis :", round(a_plus,3), "|+>  +", round(a_minus,3), "|->")
print("reconstruct      :", np.round(a_plus*plus + a_minus*minus, 3), "(= |0>)")

print("\nmeasure |0> in standard basis: p(0) =", round((ket0 @ ket0)**2, 3))
print("measure |0> in +/-  basis    : p(+) =", round(a_plus**2,3), " p(-) =", round(a_minus**2,3))
```

Same state, two addresses — $(1,0)$ in the standard basis, $(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$ in the ± basis — and the measurement statistics flip from certain to 50/50 depending on *which basis you ask in*. BB84 quantum cryptography is exactly this: encode in randomly chosen bases; an eavesdropper who guesses the basis wrong scrambles the state detectably.

```quiz
{"q":"Which pair fails to be a valid measurement basis for one qubit?","options":["|0⟩ and |1⟩","|+⟩ and |−⟩","|0⟩ and |+⟩","(1/√5)(1,2) and (1/√5)(2,−1)"],"answer":2,"why":"|0⟩ and |+⟩ overlap by 1/√2 — not orthogonal, so no measurement distinguishes them perfectly and they can't form a measurement basis. The other pairs are orthonormal."}
```

## Level up — gotchas the pros watch for

- **"Superposition" treated as absolute.** Every state is a superposition in some basis and a basis state in another; meaningful claims name the basis ("superposition *in the computational basis*").
- **Non‑normalized basis vectors.** Quantum coordinates‑as‑probabilities need *unit* vectors; forgetting the $\tfrac{1}{\sqrt2}$ inflates probabilities.
- **Dimension vs entries.** Two qubits: dimension 4, not 2+2 — dimensions *multiply* (Module 6).
- **Coordinates confused with the state.** $(1,0)$ is the state's *address in a chosen basis*, not the state; change basis, address changes, state doesn't.
- **Any two states as a measurement.** A measurement basis needs *orthonormal* vectors; $\ket0$ and $\ket+$ aren't orthogonal (overlap $\tfrac{1}{\sqrt2}$), so "measure in the $\{0,+\}$ basis" isn't a thing.

## Level up — the eavesdropper who failed linear algebra

In BB84, Alice encodes each bit in a random basis (standard or Hadamard). Eve intercepts but measures *everything* in the standard basis. When Alice used the ± basis (half the time), Eve's device asks the wrong question — it sees $\ket+ = \tfrac{1}{\sqrt2}\ket0 + \tfrac{1}{\sqrt2}\ket1$, answers 0/1 at random, and re‑prepares that. Bob, measuring in the correct ± basis, then gets a bit Alice never sent 25% of the time overall ($\tfrac12$ wrong‑basis × $\tfrac12$ coin flip). Alice and Bob compare a public sample, see ~25% errors where hardware gives ~1%, and abort — Eve caught by *coordinates in the wrong basis*. Every quantum‑security interview has some version of "why does Eve get caught," and the answer is this lesson plus a dot product.

## Key points

- A vector space is anything closed under adding and scaling; a qubit lives in $\mathbb{C}^2$, $n$ qubits in $\mathbb{C}^{2^n}$.
- Superposition = linear combination: $\ket\psi = \alpha\ket0 + \beta\ket1$, unique amplitudes once a basis is fixed.
- Basis = independent + spanning; coordinates in a basis are unique; orthonormal bases make a coordinate a dot product.
- The same state has different coordinates in different bases; $\ket0$ is an equal superposition in the ± basis — superposition is basis‑relative.
- Measurements come with a basis attached; the statistics depend on the basis you ask in.
- $\{\ket+,\ket-\}$ is the Hadamard basis; basis mismatch = randomness + disturbance, the engine of BB84.

## Check yourself

```quiz
{"q":"|−⟩ = (1/√2)(|0⟩ − |1⟩) is measured in the standard basis, and an identical copy in the {|+⟩,|−⟩} basis. The statistics are:","options":["50/50 in both cases","50/50 for standard basis; certainly '−' in the ± basis","Certainly '1' in standard; 50/50 in ±","Certainly '−' in both cases"],"answer":1,"why":"Standard basis: amplitudes ±1/√2 → 1/2 each. In its OWN basis, |−⟩ is a basis state → deterministic. Statistics depend on the basis you ask in."}
```

## Exercises

**Exercise 1 — basis or not?** Decide for each (real plane): (a) $\binom12, \binom24$; (b) $\binom11, \binom01$; (c) $\binom10, \binom01, \binom11$; (d) $\tfrac{1}{\sqrt2}\binom11, \tfrac{1}{\sqrt2}\binom{1}{-1}$. For the bases, say whether orthonormal.

````solution
(a) Not a basis — dependent ($\binom24 = 2\binom12$). (b) Basis, not orthonormal (dot $=1$, norm $\sqrt2$). (c) Not a basis — three vectors in 2D can't be independent. (d) Orthonormal basis — it's $\{\ket+,\ket-\}$. Quantum work lives in category (d).
````

**Exercise 2 — translate a state.** In the live cell, express $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac12\ket1$ in the ± basis and compare which basis gives more predictable outcomes.

````solution
```python
import numpy as np
psi = np.array([np.sqrt(3)/2, 1/2]); plus=np.array([1,1])/np.sqrt(2); minus=np.array([1,-1])/np.sqrt(2)
print((plus@psi)**2, (minus@psi)**2)   # 0.933, 0.067
```
Standard basis: 75/25. ± basis: 93.3/6.7 — *more* predictable. Those numbers are $\cos^2 15°$, $\sin^2 15°$: the state sits 30° from $\ket+$ on the circle, half‑angle rule in action.
````

## Practice questions

1. Why must basis vectors be independent for coordinates to be unique?
2. Dimension of a 3‑qubit space, and how many amplitudes describe a general state?
3. Coordinates of $\ket1$ in the ± basis.
4. True/false: "a state giving 50/50 outcomes is necessarily $\ket+$ or $\ket-$."
5. Are $\tfrac{1}{\sqrt2}\binom{1}{i}$ and $\tfrac{1}{\sqrt2}\binom{1}{-i}$ orthogonal? (Use $\sum u_k^* v_k$.)
6. In BB84, why exactly 25% errors from Eve?
7. **Design question:** invent an orthonormal basis of the real plane that's neither standard nor ±, prove orthonormality, and give the statistics of measuring $\ket0$ in it.

````solution
1. A dependency lets you trade coefficients between basis vectors, so a vector gets many addresses and "the coordinates" stop meaning anything.
2. $2^3 = 8$ dimensions; 8 complex amplitudes.
3. $\ket1 = \tfrac{1}{\sqrt2}\ket+ - \tfrac{1}{\sqrt2}\ket-$.
4. False — e.g. $\tfrac{1}{\sqrt2}\binom{1}{i}$ also gives 50/50 in the standard basis; the whole equator does.
5. $\sum u_k^* v_k = \tfrac12(1 + (-i)(-i)) = \tfrac12(1-1) = 0$ — orthogonal (these are $\ket{\pm i}$).
6. Eve picks the wrong basis half the time; when wrong, Bob's correct‑basis measurement errs half the time: $\tfrac12\times\tfrac12 = 25\%$.
7. E.g. $\ket u = (\cos30°, \sin30°)$, $\ket v = (-\sin30°, \cos30°)$: norms 1, dot 0. Measuring $\ket0$: $p(u) = \cos^2 30° = \tfrac34$, $p(v) = \tfrac14$. Every angle yields a legal basis — "which question to ask" is a dial, not a switch.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Define a vector space and say what space $n$ qubits live in.
- ☐ Explain "superposition = linear combination" and why it's basis‑relative.
- ☐ Tell whether a set of vectors is a basis, and whether it's orthonormal.
- ☐ Find a state's coordinates in the ± basis by dot products, and reconstruct it.
- ☐ Run the live cell and explain why $\ket0$ measures differently in the two bases.
- ☐ Explain how basis mismatch catches an eavesdropper in BB84.
