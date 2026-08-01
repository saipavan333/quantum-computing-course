# Complex numbers & the complex plane

Quantum amplitudes are not just positive or negative — they are **complex numbers**. This isn't optional decoration: interference patterns observed in real experiments cannot be reproduced with real‑valued amplitudes alone. The good news: complex numbers are a *simplification* once you see them geometrically — a complex number is just a 2D arrow that knows how to multiply.

## Start here — the intuition

Picture an arrow in a plane. It has a **length** and a **direction (angle)**. That's a complex number: the length is its *magnitude*, the angle is its *phase*. Quantum computing needs the angle — because interference depends on a continuous phase, not just "plus or minus." Real numbers only have two directions (right = positive, left = negative); complex numbers have a full circle of them, and that circle is where quantum information hides.

One rule does almost all the work: to turn an amplitude into a **probability**, you take its magnitude and square it, written $|z|^2 = z\,z^*$ (the number times its "mirror image," the conjugate). This is *always* a non‑negative real number — exactly what a probability must be. And the single most common bug in all of quantum code is writing $z^2$ (which stays complex and can go negative) when you meant $|z|^2$.

## The imaginary unit and the complex plane

Define $i^2 = -1$. That's the whole invention; powers of $i$ cycle $i, -1, -i, 1$ (a four‑step rotation). A **complex number** $z = a + bi$ is the point $(a, b)$ — real part horizontal, imaginary part vertical.

@@diagram:complex-plane|The complex plane: z = a + bi is the point (a, b). Its modulus |z| is the distance from the origin — Pythagoras again.

@@widget

Two quantities you'll compute daily: the **modulus** $|z| = \sqrt{a^2 + b^2}$ (the arrow's length; $|3+4i| = 5$) and the **conjugate** $z^* = a - bi$ (mirror across the real axis). They combine in the identity that *is* the Born rule's engine:

$$z\,z^* = (a+bi)(a-bi) = a^2 + b^2 = |z|^2$$

So when you see $|\alpha|^2$ from now on, your hands should think "$\alpha\,\alpha^*$ — a guaranteed non‑negative real number."

## Arithmetic — everything you'd guess, plus one rule

**Add** component‑wise. **Multiply** by distributing then applying $i^2 = -1$: $(3+2i)(1-5i) = 3 - 13i + 10 = 13 - 13i$. **Divide** by multiplying top and bottom by the denominator's conjugate (making the denominator real). Handy identities: $(zw)^* = z^*w^*$, $|zw| = |z||w|$, $z + z^* = 2\,\mathrm{Re}(z)$, and $z^{**} = z$.

## Predict, then run — amplitudes and the Born rule

The live cell shows the conjugate‑square that makes a probability, the `z**2` trap, and a valid qubit with a *complex* amplitude.

**Predict first.** For $z = 3 + 4i$: what is $|z|$? And is $z^2$ the same as $|z|^2$? Guess both, then Run.

```run
# Live cell — complex numbers ARE amplitudes; probability = z times its conjugate.
import numpy as np

z = 3 + 4j
print("z =", z, "  |z| =", abs(z), "  |z|^2 = z*conj(z) =", (z * z.conjugate()).real)

# The bug that ruins quantum code: z**2 is NOT the probability.
print("\nWRONG  z**2   =", z**2, "  (complex -- useless as a probability)")
print("RIGHT  |z|**2  =", abs(z)**2, "  (always real and non-negative)")

# A valid qubit with a COMPLEX amplitude: (1/sqrt2)|0> + (i/sqrt2)|1>
psi = np.array([1/np.sqrt(2), 1j/np.sqrt(2)])
print("\nprobabilities |psi|^2 =", np.round(np.abs(psi)**2, 3),
      " sum =", round(float(np.sum(np.abs(psi)**2)), 3))
```

$|z| = 5$, but $z^2 = -7 + 24i$ — nothing like the probability $|z|^2 = 25$. And the state with amplitude $i/\sqrt2$ is perfectly valid: $|i/\sqrt2|^2 = \tfrac12$, so it measures 50/50 — identical statistics to the all‑real $\ket+$, yet physically different (the $i$ is a 90° phase that later gates can detect). Amplitudes carry more than any single measurement reveals.

```quiz
{"q":"An amplitude is z = (1 - i)/2. What is the associated probability |z|²?","options":["0 — the parts cancel","0.5","(1-i)²/4 = -i/2","0.25"],"answer":1,"why":"zz* = (1-i)(1+i)/4 = (1 - i²)/4 = 2/4 = 1/2. Modulus-squared multiplies by the conjugate; naive squaring gives the nonsense third option."}
```

## Why quantum mechanics needs the $i$

With only real amplitudes you get *some* cancellation (+ vs −), but experiments show interference that shifts *continuously* with a phase parameter — a full circle of behaviors, not two. A complex amplitude carries exactly that: a magnitude *and* an angle. Structurally, quantum states evolve by rotations that conserve probability, and the bookkeeping only closes over the complex numbers. The practical consequence: **from now on, "number" means complex number** — amplitudes and matrix entries are complex; the only guaranteed‑real things are probabilities ($|z|^2$) and measurement outcomes.

## Level up — gotchas the pros watch for

- **Computing $|z|^2$ as $z^2$.** The #1 silent quantum‑code bug. In numpy: `np.abs(z)**2`, never `z**2`.
- **$\sqrt{-1}$ sloppiness.** Write $i$; the "identity" $\sqrt{-1}\sqrt{-1} = \sqrt{1} = 1$ is false ($i\cdot i = -1$).
- **Comparing complex numbers with < or >.** Meaningless — only moduli compare; Python raises `TypeError`.
- **`1j` syntax.** `j` alone is a variable; `1j` is the literal.
- **Assuming imaginary = ignorable.** States differing by an $i$ are physically different; truncating imaginary parts changes the physics.

## Level up — the impedance detour that pays your rent

Quantum‑hardware jobs often list RF/microwave engineering, because superconducting qubits are driven by microwave pulses through circuitry described by complex **impedance** $Z = R + iX$ (resistance + reactance). Matching a control line computes reflection coefficients $\Gamma = \tfrac{Z - Z_0}{Z + Z_0}$ with $Z_0 = 50\,\Omega$ — pure complex arithmetic, conjugates and moduli all day. Same numbers reappear in AC circuits, signal processing, and the Fourier transforms behind Module 8. Complex fluency is cross‑disciplinary infrastructure.

## Key points

- $i^2 = -1$; powers of $i$ cycle $i, -1, -i, 1$ — a four‑step rotation.
- $a+bi$ is the point/arrow $(a,b)$; modulus $|z| = \sqrt{a^2+b^2}$ is its length.
- The master identity $z z^* = |z|^2$ computes every quantum probability — always non‑negative and real.
- Multiply by distributing then $i^2 = -1$; divide via the denominator's conjugate.
- Complex amplitudes exist because interference needs a continuous phase; states differing by a phase share statistics *now* yet diverge under later gates.
- Code: `1j`, `z.conjugate()`, `abs(z)`, `np.abs(psi)**2` — never `z**2` for probability.

## Check yourself

```quiz
{"q":"Two qubit states have amplitude pairs (1/√2, 1/√2) and (1/√2, i/√2). Which statement is correct?","options":["They are the same state written differently","They give identical statistics if measured immediately, but are physically different states that later gates can distinguish","The second is invalid because amplitudes must be real","The second has probabilities summing to more than 1"],"answer":1,"why":"Both give 50/50 now (|i/√2|² = 1/2), but the relative phase i is real physical information — an interference experiment (Module 6) separates them cleanly."}
```

## Exercises

**Exercise 1 — arithmetic workout.** In the live cell, with $z = 2 + i$ and $w = 1 - 3i$, compute $z + w^*$, $zw$, $|zw|$ (directly and via $|z||w|$), and $z/w$; check each against a hand calculation.

````solution
```python
z, w = 2 + 1j, 1 - 3j
print(z + w.conjugate())              # (3+4j)
print(z * w)                          # (5-5j)
print(abs(z*w), abs(z)*abs(w))        # 7.0710678... twice (moduli multiply)
print(z / w)                          # (-0.1+0.7j)
```
By hand: $zw = (2+i)(1-3i) = 5 - 5i$; $|5-5i| = 5\sqrt2 \approx 7.071 = \sqrt5\cdot\sqrt{10}$; $z/w = \tfrac{(2+i)(1+3i)}{10} = -0.1 + 0.7i$.
````

**Exercise 2 — normalize a complex state.** The unnormalized pair $(1+i,\ 2)$ describes a qubit's direction. Compute the normalization factor, the probabilities, and confirm with `np.linalg.norm`. Which quantity did the phase of $1+i$ affect?

````solution
```python
import numpy as np
v = np.array([1 + 1j, 2])
psi = v / np.linalg.norm(v)
print(np.abs(psi)**2)                 # [0.333..., 0.666...]
```
Norm$^2 = |1+i|^2 + 4 = 6$; $p(0) = \tfrac26 = \tfrac13$, $p(1) = \tfrac23$. The phase of $1+i$ (its 45° angle) affected *nothing* about the probabilities — only its modulus entered. Phases hide from single‑basis measurement; moduli don't.
````

## Practice questions

1. Reduce $i^{2027}$ to one of $\{1, i, -1, -i\}$.
2. Compute $(1+i)^2$ and explain why $1+i$ has "45° of phase."
3. Show $z + z^*$ is always real; compute it for $z = 4 - 7i$.
4. Why is $|z|^2$ guaranteed non‑negative even though $z^2$ can be anything?
5. Find all complex $z$ with $|z| = 1$ and $\mathrm{Re}(z) = \tfrac12$.
6. A teammate writes `prob = psi[0]**2` for complex `psi`. Diagnose, fix, and name a state that produces an obviously impossible output.
7. **Design question:** invent a two‑amplitude state with 25/75 probabilities whose amplitudes are *both* non‑real; verify normalization and statistics.

````solution
1. $2027 = 4\cdot506 + 3 \Rightarrow i^{2027} = i^3 = -i$.
2. $(1+i)^2 = 2i$ — squaring landed on the 90° axis, so $1+i$ sits at half that, 45°. (Squaring doubles angles — next lesson.)
3. $(a+bi)+(a-bi) = 2a$; for $4-7i$: $8$.
4. $|z|^2 = a^2 + b^2$ is a sum of real squares — non‑negative by construction, unlike $z^2$.
5. $z = \tfrac12 \pm \tfrac{\sqrt3}{2}i$ — the unit‑circle points at $\pm60°$.
6. `**2` keeps phase and can go negative/complex; use `np.abs(psi[0])**2`. With $\psi_0 = i/\sqrt2$, `psi[0]**2 = -0.5` — a negative "probability."
7. E.g. $\alpha = \tfrac{i}{2}$ ($|\alpha|^2 = \tfrac14$), $\beta = \tfrac{\sqrt3}{2}\cdot\tfrac{1+i}{\sqrt2}$ ($|\beta|^2 = \tfrac34$): sum 1, statistics 25/75, both amplitudes non‑real.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Convert $a+bi$ to a point, and compute its modulus and conjugate.
- ☐ State and use $z z^* = |z|^2$ as the probability rule, and explain why it's always real.
- ☐ Multiply and divide complex numbers by hand.
- ☐ Run the live cell and explain why `z**2` is the wrong probability.
- ☐ Explain why quantum needs complex amplitudes (continuous phase) in one sentence.
- ☐ Normalize a complex state and say why the phase didn't change the probabilities.
