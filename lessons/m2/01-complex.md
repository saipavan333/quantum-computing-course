# Complex numbers & the complex plane

Quantum amplitudes are not just positive or negative — they are **complex numbers**. This isn't optional decoration: interference patterns observed in real experiments cannot be reproduced with real-valued amplitudes alone. The good news: complex numbers are a *simplification* once you see them geometrically — a complex number is just a 2D arrow that knows how to multiply. You built 2D arrows last lesson; today they learn their final trick.

## 1. The imaginary unit — a legal move, not a mystery

School says $x^2 = -1$ has no solution — no *real* solution, because real squares are non-negative. Mathematics responds the way it always does at a wall: define a new number and check the rules stay consistent. Let

$$i^2 = -1$$

That's the whole invention. Powers of $i$ cycle with period 4:

$$i^1 = i \qquad i^2 = -1 \qquad i^3 = i^2\cdot i = -i \qquad i^4 = 1 \qquad i^5 = i \;\dots$$

Memorize the cycle $i, -1, -i, 1$ — it *is* a rotation, as the plane picture will make obvious.

A **complex number** combines a real and an imaginary part: $z = a + bi$, e.g. $z = 3 + 2i$. Here $\mathrm{Re}(z) = 3$, $\mathrm{Im}(z) = 2$ (the imaginary part is the real coefficient $b$, not $bi$). Real numbers are complex numbers with $b = 0$ — nothing you know gets thrown away.

In Python, `j` plays the role of $i$ (an electrical-engineering convention):

```python
z = 3 + 2j
print(z.real, z.imag)      # 3.0 2.0
print((1j)**2)             # (-1+0j)   ← i² = −1, verified
```

## 2. The complex plane — numbers become points

Plot $a + bi$ as the point $(a, b)$: real part on the horizontal axis, imaginary part on the vertical. Every complex number is a 2D vector; every 2D vector is a complex number.

@@diagram:complex-plane|The complex plane: z = a + bi is the point (a, b). Its modulus |z| is the distance from the origin — Pythagoras again.

Two quantities you'll compute daily:

**Modulus** (= magnitude, absolute value) — the distance from the origin, exactly the vector norm:

$$|z| = |a + bi| = \sqrt{a^2 + b^2} \qquad |3 + 4i| = 5$$

**Conjugate** — flip the sign of the imaginary part (mirror across the real axis):

$$z^* = a - bi \qquad (3 + 4i)^* = 3 - 4i$$

The conjugate exists to make this beautiful identity work:

$$z\, z^* = (a+bi)(a-bi) = a^2 - (bi)^2 = a^2 + b^2 = |z|^2$$

**This formula is the Born rule's engine.** In quantum mechanics, probability $= |z|^2 = z z^*$ where $z$ is an amplitude. When you see $|\alpha|^2$ from now on, your hands should think "$\alpha\,\alpha^*$, a guaranteed-non-negative real number."

## 3. Arithmetic — everything you'd guess, plus one rule

**Add/subtract**: component-wise, exactly like vectors.

$$(3 + 2i) + (1 - 5i) = 4 - 3i$$

**Multiply**: distribute normally, then apply $i^2 = -1$:

$$(3 + 2i)(1 - 5i) = 3 - 15i + 2i - 10i^2 = 3 - 13i + 10 = 13 - 13i$$

**Divide**: multiply top and bottom by the conjugate of the denominator (this makes the denominator real — the trick to remember):

$$\frac{1}{3+4i} = \frac{3-4i}{(3+4i)(3-4i)} = \frac{3-4i}{25} = 0.12 - 0.16i$$

Properties worth knowing because you'll lean on them in proofs and debugging:

| Identity | In words |
|---|---|
| $(zw)^* = z^* w^*$ | conjugate of a product = product of conjugates |
| $(z + w)^* = z^* + w^*$ | conjugation distributes over addition |
| $|zw| = |z|\,|w|$ | moduli multiply |
| $z + z^* = 2\,\mathrm{Re}(z)$ | a number plus its conjugate is real |
| $z^{**} = z$ | conjugating twice does nothing |

```python
z, w = 3 + 2j, 1 - 5j
print(z * w)                    # (13-13j)
print(z.conjugate())            # (3-2j)
print(abs(z))                   # 3.605551275463989  = √13
print(z * z.conjugate())        # (13+0j)  = |z|², real as promised
```

## 4. Why quantum mechanics needs the $i$

A fair question deserving a real answer, in two parts.

**The shallow answer**: with only real amplitudes (positive and negative), you can already get some cancellation. But experiments show interference patterns that shift *continuously* — outcomes don't just reinforce or cancel, they do everything in between, in a way that depends on a continuous "phase" parameter. A complex amplitude $z$ carries exactly this: a magnitude (how much) *and* an angle (its phase — next lesson makes the angle explicit). Real numbers have only two phases (+ and −); complex numbers have a full circle of them.

**The structural answer**: quantum states evolve by rotations (Module 5), and you cannot smoothly rotate in a way that ever turns $\ket0$ into $\ket1$ and back while conserving probability using only real 2-component vectors and all the operations physics demands — the algebra closes only over complex numbers. (There's a theorem-shaped version of this; for now, "the bookkeeping only balances with complex numbers" is honest and sufficient.)

The practical consequence for you: **from now on, "number" means complex number.** Amplitudes: complex. Matrix entries: complex. The only things guaranteed real are probabilities ($|z|^2$) and measurement outcomes.

## Worked example — a legal quantum state with complex amplitudes

*Claim: $\ket\psi$ with amplitudes $\alpha = \tfrac{1}{\sqrt2}$ and $\beta = \tfrac{i}{\sqrt2}$ is a valid qubit state with 50/50 measurement statistics. Verify.*

**Normalization** needs $|\alpha|^2 + |\beta|^2 = 1$ (moduli, not naive squares!):

$$|\alpha|^2 = \alpha\alpha^* = \tfrac{1}{\sqrt2}\cdot\tfrac{1}{\sqrt2} = \tfrac12 \qquad |\beta|^2 = \beta\beta^* = \tfrac{i}{\sqrt2}\cdot\tfrac{-i}{\sqrt2} = \tfrac{-i^2}{2} = \tfrac12$$

Sum: 1 ✓. Probabilities: 50% each — identical statistics to the all-real state $(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$.

**So is it the same state?** No — and this is the profound part. The two states give identical results *if you measure immediately*, but behave differently once further gates act (the $i$ is a 90° phase that interference can detect; you'll build the distinguishing experiment yourself in Module 6 with an S gate and a Hadamard). Amplitudes carry more information than any single measurement reveals.

```python
import numpy as np
psi = np.array([1/np.sqrt(2), 1j/np.sqrt(2)])
probs = np.abs(psi)**2          # np.abs = modulus, element-wise
print(probs, probs.sum())       # [0.5 0.5] 1.0
```

## Gotchas

- **Computing $|z|^2$ as $z^2$.** $(3+4i)^2 = -7+24i$ — complex, useless as a probability. The correct $|z|^2 = zz^* = 25$. In NumPy: `np.abs(z)**2`, never `z**2`. This single confusion produces more silent quantum-code bugs than any other.
- **$\sqrt{-1}$ sloppiness.** Write $i$, don't push $\sqrt{\,}$ rules onto negatives: the "identity" $\sqrt{-1}\sqrt{-1} = \sqrt{(-1)(-1)} = 1$ is false ($i\cdot i = -1$). Root rules assume non-negative inputs.
- **Comparing complex numbers with < or >.** "Is $2+i$ bigger than $1+3i$?" is meaningless; only moduli compare. Python agrees: `(2+1j) < (1+3j)` raises `TypeError`.
- **Forgetting Python's `1j` syntax.** `j` alone is a variable name; `1j` is the literal. Also `i` is not special in Python at all.
- **Conjugating only half an expression.** $(zw)^*$ requires conjugating both factors. When you meet bras in Lesson 5 of this module, this rule becomes "conjugate every amplitude when flipping ket→bra".
- **Assuming imaginary = ignorable.** States differing only by an $i$ *are physically different* (see Worked example). Truncating imaginary parts "to simplify" changes the physics.

## Scenario — the impedance detour that pays your rent

Quantum hardware job postings often list a surprising skill: RF/microwave engineering. Reason: superconducting qubits are controlled by microwave pulses through circuitry whose behavior is captured by complex **impedance** $Z = R + iX$ — real part resistance, imaginary part reactance (energy sloshing in/out of capacitors and inductors, phase-shifted by 90°, hence the $i$). An engineer matching a control line to a qubit computes reflection coefficients like $\Gamma = \tfrac{Z - Z_0}{Z + Z_0}$ with $Z_0 = 50\,\Omega$ — pure complex arithmetic, conjugates and moduli all day. Same numbers, second application: AC circuit analysis, signal processing (Fourier transforms are complex-built, see Module 8), and control software all speak this language. Complex fluency isn't quantum trivia; it's cross-disciplinary infrastructure.

## Key points

- $i^2 = -1$; powers of $i$ cycle $i, -1, -i, 1$ — a four-step rotation.
- A complex number $a+bi$ is the point/vector $(a,b)$ in the complex plane; modulus $|z| = \sqrt{a^2+b^2}$ is its length.
- Conjugate flips the imaginary sign; the master identity is $zz^* = |z|^2$ — how every quantum probability is computed.
- Multiply by distributing then substituting $i^2 = -1$; divide by multiplying through by the denominator's conjugate.
- Complex amplitudes exist because interference needs a continuous phase, not just ±; states differing by a phase can share statistics *now* yet diverge under later gates.
- Code: `1j`, `z.conjugate()`, `abs(z)`, `np.abs(psi)**2` — and never `z**2` for probability.

## Check yourself

```quiz
{"q":"An amplitude is z = (1 - i)/2. What is the associated probability |z|²?","options":["0 — the parts cancel","0.5","(1-i)²/4 = -i/2","0.25"],"answer":1,"why":"zz* = (1-i)(1+i)/4 = (1 - i²)/4 = 2/4 = 1/2. Modulus-squared multiplies by the conjugate; naive squaring gives the nonsense third option."}
```

```quiz
{"q":"Two qubit states have amplitude pairs (1/√2, 1/√2) and (1/√2, i/√2). Which statement is correct?","options":["They are the same state written differently","They give identical statistics if measured immediately, but are physically different states that later gates can distinguish","The second is invalid because amplitudes must be real","The second has probabilities summing to more than 1"],"answer":1,"why":"Both give 50/50 now (|i/√2|² = 1/2), but the relative phase i is real physical information — an interference experiment (Module 6) separates them cleanly."}
```

## Exercises

**Exercise 1 — full arithmetic workout.** With $z = 2 + i$ and $w = 1 - 3i$, compute by hand: (a) $z + w^*$, (b) $zw$, (c) $|zw|$ two ways (directly, and via $|z||w|$), (d) $z/w$. Verify all in Python.

````solution
(a) $w^* = 1 + 3i$, so $z + w^* = 3 + 4i$.

(b) $zw = (2+i)(1-3i) = 2 - 6i + i - 3i^2 = 2 - 5i + 3 = 5 - 5i$.

(c) Directly: $|5-5i| = \sqrt{25+25} = \sqrt{50} = 5\sqrt2 \approx 7.071$. Via product rule: $|z| = \sqrt5$, $|w| = \sqrt{10}$, product $= \sqrt{50}$ ✓ — the moduli-multiply identity confirmed by hand.

(d) $\dfrac{z}{w} = \dfrac{(2+i)(1+3i)}{(1-3i)(1+3i)} = \dfrac{2 + 6i + i + 3i^2}{1 + 9} = \dfrac{-1 + 7i}{10} = -0.1 + 0.7i$.

```python
z, w = 2 + 1j, 1 - 3j
print(z + w.conjugate())   # (3+4j)
print(z * w)               # (5-5j)
print(abs(z * w), abs(z) * abs(w))   # 7.0710678118654755 7.071067811865476
print(z / w)               # (-0.1+0.7j)
```
````

**Exercise 2 — normalize a complex state.** The unnormalized amplitude pair $(1+i,\; 2)$ describes a qubit's direction. (a) Compute the normalization factor. (b) Write the normalized state. (c) Give both measurement probabilities. (d) In Python, confirm with `np.linalg.norm`.

````solution
(a) Norm² $= |1+i|^2 + |2|^2 = (1+1) + 4 = 6$, so the normalization factor is $\tfrac{1}{\sqrt6}$.

(b) $\ket\psi \sim \left(\tfrac{1+i}{\sqrt6},\; \tfrac{2}{\sqrt6}\right)$.

(c) $p(0) = \tfrac{|1+i|^2}{6} = \tfrac{2}{6} = \tfrac13 \approx 33.3\%$; $p(1) = \tfrac{4}{6} = \tfrac23 \approx 66.7\%$. Sum 1 ✓.

```python
import numpy as np
v = np.array([1 + 1j, 2])
psi = v / np.linalg.norm(v)          # norm handles complex correctly
print(np.abs(psi)**2)                # [0.33333333 0.66666667]
```

Note what did *not* matter: the phase of the first amplitude ($1+i$ points at 45°) had no effect on probabilities — only its modulus entered. Phases hide from single-basis measurement; moduli don't. Keeping that split vivid is half of quantum intuition.
````

## Practice questions

1. Reduce $i^{2027}$ to one of $\{1, i, -1, -i\}$ (hint: divide the exponent by 4).
2. Compute $(1+i)^2$ and use the result to explain why $1+i$ has "45° of phase".
3. Show algebraically that $z + z^*$ is always real, and compute it for $z = 4 - 7i$.
4. Why is $|z|^2$ guaranteed non-negative even though $z^2$ can be anything? One sentence.
5. Find all complex $z$ with $|z| = 1$ and $\mathrm{Re}(z) = \tfrac12$ (describe them; exact values).
6. In code, a teammate writes `prob = psi[0]**2` for a complex `psi`. Diagnose the bug, give the fix, and name a state where the bug produces an obviously impossible output.
7. **Design question:** invent a two-amplitude state whose probabilities are 25/75 but whose amplitudes are *both* non-real; verify normalization and the target statistics.

````solution
1. $2027 = 4\cdot506 + 3$, so $i^{2027} = i^3 = -i$.
2. $(1+i)^2 = 1 + 2i + i^2 = 2i$ — squaring landed on the positive imaginary axis (90°), so $1+i$ itself sits at half that angle: 45°. (Squaring doubles angles — next lesson makes this systematic.)
3. $(a+bi) + (a-bi) = 2a$, imaginary parts cancel; for $z = 4-7i$: $8$.
4. $|z|^2 = a^2 + b^2$, a sum of real squares — non-negative by construction, unlike $z^2$ which keeps direction information.
5. $z = \tfrac12 + bi$ with $\tfrac14 + b^2 = 1 \Rightarrow b = \pm\tfrac{\sqrt3}{2}$: the two unit-circle points at ±60°.
6. `**2` squares the complex number (keeps phase, can go negative/complex); probabilities need `np.abs(psi[0])**2` (= $zz^*$). Obvious failure: $\psi_0 = i/\sqrt2$ gives `psi[0]**2 = -0.5` — a negative "probability" that should set off alarms in any review.
7. One of many: $\alpha = \tfrac{i}{2}$ ($|\alpha|^2 = \tfrac14$), $\beta = \tfrac{\sqrt3}{2}\,\tfrac{(1+i)}{\sqrt2}$ ($|\beta|^2 = \tfrac34\cdot\tfrac{2}{2} = \tfrac34$). Check: $\tfrac14 + \tfrac34 = 1$ ✓, statistics 25/75 ✓, both amplitudes carry nonzero imaginary parts. The design freedom you just exercised — same statistics, wildly different phases — is exactly the freedom quantum algorithms manipulate while measurement isn't looking.
````
