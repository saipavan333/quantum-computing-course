# Polar form & Euler's formula

If this course had to keep only one equation, it would be $e^{i\theta} = \cos\theta + i\sin\theta$. Euler's formula turns complex numbers from coordinate pairs into **rotations**, makes multiplication geometric, and gives quantum computing its single most used word: *phase*. Every gate you'll ever apply, every interference pattern you'll ever engineer, is bookkeeping with $e^{i\theta}$.

## Start here — the intuition

Last lesson a complex number was an arrow with a length and an angle. Euler's formula gives the angle its own name and power: $e^{i\theta}$ is simply **the point on the unit circle at angle $\theta$**. That's it. And it hands you the one move that runs all of quantum computing: **multiplying by $e^{i\theta}$ rotates by $\theta$** — no stretching, just turning. Moduli multiply, **phases add**.

Two phrases to burn in. "Phase" just means *angle*. And a phase of $\pi$ is a factor of $-1$ (half a turn points the arrow backward) — so "apply a $\pi$ phase" and "flip the sign" are the same sentence, one you'll use weekly from Module 6 on. Quantum gates preserve total probability (lengths) while rearranging amplitudes — i.e., they *rotate* — which is exactly the algebra of unit‑length complex factors.

## Polar form and Euler's formula

Locate $z$ by its length $r = |z|$ and angle $\theta$ (the **phase**, in radians, via `atan2`): $z = r(\cos\theta + i\sin\theta) = r\,e^{i\theta}$. Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ makes $e^{i\theta}$ walk the unit circle:

@@diagram:euler-circle|e^{iθ} walks the unit circle: angle θ in the exponent, position cos θ + i sin θ on the circle. Special stops: e^{iπ/2} = i, e^{iπ} = −1, e^{2πi} = 1.

@@widget

The special stops: $e^{i0} = 1$, $e^{i\pi/2} = i$, $e^{i\pi} = -1$, $e^{i3\pi/2} = -i$, $e^{i2\pi} = 1$. The $\theta=\pi$ entry rearranges into $e^{i\pi} + 1 = 0$ (Euler's identity) — and for you it means *phase $\pi$ = sign flip*. Multiplication is now geometry: $(r_1 e^{i\theta_1})(r_2 e^{i\theta_2}) = r_1 r_2\, e^{i(\theta_1+\theta_2)}$ — moduli multiply, phases add. This instantly explains the $i, -1, -i, 1$ cycle (multiplying by $i = e^{i\pi/2}$ rotates 90°), squaring ($(1+i)^2 = 2i$: double the angle), and conjugation ($z^* = re^{-i\theta}$: negate the phase).

## Predict, then run — the circle, cancellation, and interference

The live cell shows Euler's special values, the roots of unity summing to zero (the QFT's engine), and the two‑path interference formula.

**Predict first.** The five 5th‑roots of unity are evenly spaced arrows around the circle. What should they sum to? And for two paths $1 + e^{i\varphi}$, what happens to the success probability at $\varphi = \pi$? Guess, then Run.

```run
# Live cell — e^{i*theta} walks the unit circle; roots cancel; two paths interfere.
import numpy as np

for label, th in [("0", 0), ("pi/2", np.pi/2), ("pi", np.pi), ("3pi/2", 3*np.pi/2)]:
    print(f"  e^(i*{label:5}) = {np.exp(1j*th):+.3f}")

roots = [np.exp(2j*np.pi*k/5) for k in range(5)]        # the 5th roots of unity
s = sum(roots)
print(f"\nsum of 5th roots of unity = {s.real:+.6f} {s.imag:+.6f}i  (evenly spaced arrows cancel)")

print("\ntwo-path interference  |1 + e^(i*phi)|^2 / 4 = cos^2(phi/2):")
for phi in [0, np.pi/2, np.pi]:
    p = abs(1 + np.exp(1j*phi))**2 / 4
    print(f"  phi={phi:.2f}: success = {p:.3f}  (cos^2 = {np.cos(phi/2)**2:.3f})")
```

The roots sum to zero — perfectly balanced arrows cancel, which is *exactly* how the quantum Fourier transform (Module 8) makes wrong frequencies vanish and the right one survive. And the interference formula dials an outcome from certain ($\varphi=0$) through a coin flip ($\varphi=\pi/2$) to never ($\varphi=\pi$) using phase alone — the double‑slit result, and the mechanism Grover exploits.

```quiz
{"q":"States |ψ⟩ and e^{iπ/7}|ψ⟩ (every amplitude times the same factor) are measured in every possible way. What differences appear?","options":["Outcome probabilities shift by 1/7","Only interference experiments can distinguish them","None — a global phase is physically undetectable by any experiment","The second state is not normalized"],"answer":2,"why":"|e^{iπ/7}|=1 leaves every probability untouched, now and after any later gate (the factor rides through linear evolution). Global phase is bookkeeping, not physics — unlike RELATIVE phase."}
```

## Phase in quantum mechanics — global vs relative

Multiply the *whole* state by $e^{i\varphi}$: every probability is $|e^{i\varphi}\alpha|^2 = |\alpha|^2$, unchanged forever — a **global phase** is physically invisible, and states differing only by one are the *same* state. Multiply only the *second* amplitude, $(\tfrac{1}{\sqrt2}, \tfrac{e^{i\varphi}}{\sqrt2})$: immediate statistics still 50/50, but this **relative phase** is real physics that interference detects completely. The reflex to install: *phase differences matter; overall phase never does.* Half of quantum algorithm design is writing information into relative phases and arranging interference to read it back.

## Level up — gotchas the pros watch for

- **Degrees in the exponent.** $e^{i\cdot90}$ is 90 *radians* (~14 turns), not 90°. Phases are radians, always.
- **Plain `atan(b/a)`.** Loses the quadrant and divides by zero at $a=0$; use `atan2(b, a)`.
- **Angle ambiguity.** $\theta$ and $\theta + 2\pi$ are the same point; `cmath.phase` returns the representative in $(-\pi, \pi]$ (so $3\pi/2$ prints as $-\pi/2$).
- **Treating global phase as meaningful.** Reporting "the states differ!" over an overall $e^{i\varphi}$ is a rite‑of‑passage error.
- **$e^{i\pi} = -1$ ≠ negative probability.** The *amplitude* flips sign; $|-z|^2 = |z|^2$ is unchanged until interference reveals the flip.

## Level up — the interference budget meeting

An algorithm's success should be ~1 but measures 0.25. On the whiteboard the good outcome's amplitude is a sum of two paths $\tfrac12(1 + e^{i\varphi})$, so success $= \tfrac14|1+e^{i\varphi}|^2 = \tfrac14(2 + 2\cos\varphi) = \cos^2(\varphi/2)$. Measured 0.25 ⇒ $\varphi = 2\pi/3$: a stray 120° phase, traced to an $R_z$ that got $2\pi/3$ instead of 0 from a degree/radian mixup. Fix, re‑run, 0.98. *Sum two phases, square the modulus, read the interference* — the most reused calculation in quantum computing.

## Key points

- Polar form $z = re^{i\theta}$: modulus $r$, phase $\theta$ (radians, via `atan2`).
- Euler: $e^{i\theta} = \cos\theta + i\sin\theta$ — the unit circle walked by an exponential; $e^{i\pi} = -1$ means "phase $\pi$ = sign flip."
- Multiplication: moduli multiply, phases add; multiplying by $e^{i\varphi}$ is pure rotation — the algebra gates are made of.
- Global phase (whole state) is invisible; relative phase (between components) is real, interference‑detectable information.
- The $N$ roots of unity $e^{2\pi ik/N}$ space evenly and **sum to zero** — the QFT's cancellation engine.
- $|1 + e^{i\varphi}|^2 = 2 + 2\cos\varphi$: the two‑path interference formula — memorize it.

## Check yourself

```quiz
{"q":"What is e^{iπ/2} · e^{iπ}, in rectangular form?","options":["-i — phases add to 3π/2, which points straight down","i — phases multiply","-1 — the moduli cancel","1 — the rotations undo each other"],"answer":0,"why":"Multiplying unit-circle numbers adds phases: π/2 + π = 3π/2, and e^{i3π/2} = -i. Moduli (both 1) multiply to 1."}
```

## Exercises

**Exercise 1 — conversion fluency.** In the live cell, convert and verify with `cmath`: (a) $-1+i$ to polar; (b) $3e^{i\pi/6}$ to rectangular. Why does `cmath.phase(-1-1j)` return a negative number?

````solution
```python
import cmath
print(abs(-1+1j), cmath.phase(-1+1j))    # sqrt(2), 3*pi/4
```
$-1+i = \sqrt2\,e^{i3\pi/4}$; $3e^{i\pi/6} = \tfrac{3\sqrt3}{2} + \tfrac{3i}{2}$. `phase` returns the canonical angle in $(-\pi,\pi]$, so $-1-i$ (direction $5\pi/4$) prints as $-3\pi/4$ — same arrow.
````

**Exercise 2 — the interferometer by hand.** Show $\big|\tfrac12(1+e^{i\varphi})\big|^2 = \cos^2(\varphi/2)$, and evaluate at $\varphi = 0, \pi/2, \pi$. What physical story do those three numbers tell?

````solution
$\tfrac14(1+e^{i\varphi})(1+e^{-i\varphi}) = \tfrac14(2 + 2\cos\varphi) = \cos^2(\varphi/2)$ (using $e^{i\varphi}+e^{-i\varphi} = 2\cos\varphi$). Values: $1, \tfrac12, 0$. Two paths in step reinforce to certainty; a quarter‑turn of disagreement gives a coin flip; opposite paths annihilate — interference dials any outcome using phase alone.
````

## Practice questions

1. Express $i$ and $-1$ as $e^{i\theta}$, compute $i\cdot(-1)$ by adding phases, confirm rectangularly.
2. Give the 3rd roots of unity in both forms and verify they sum to zero.
3. $(2e^{i\pi/3})^3 = ?$ — modulus and phase, then rectangular.
4. Why does `cmath.phase(-1-1j)` return ~$-2.356$ rather than $5\pi/4$?
5. Two states have amplitude lists $(0.6, 0.8i)$ and $(-0.6, -0.8i)$. Same or different?
6. What stray phase $\varphi$ cuts a perfect success probability to exactly 75%?
7. **Design question:** design a "phase ruler" that estimates an unknown $e^{i\varphi}$ applied to the second amplitude, from statistics alone (you may prepare $\ket+$ inputs, interfere, and insert a known extra phase).

````solution
1. $i = e^{i\pi/2}$, $-1 = e^{i\pi}$; product $e^{i3\pi/2} = -i$ ✓.
2. $1,\ -\tfrac12 + \tfrac{\sqrt3}{2}i,\ -\tfrac12 - \tfrac{\sqrt3}{2}i$; sum $= 0$.
3. Modulus $8$, phase $\pi$: $8e^{i\pi} = -8$.
4. `phase` returns the representative in $(-\pi,\pi]$; $5\pi/4$ and $-3\pi/4$ are the same direction.
5. Same state: $(-0.6,-0.8i) = e^{i\pi}(0.6, 0.8i)$ — a global phase; indistinguishable.
6. $\tfrac14(2+2\cos\varphi) = 0.75 \Rightarrow \cos\varphi = \tfrac12 \Rightarrow \varphi = \pm\pi/3$.
7. Feed $\ket+$ through the box, interfere (a Hadamard): $p(0) = \cos^2(\varphi/2)$ pins $|\varphi|$ but not its sign (cos is even). Insert a known $+\pi/2$ and re‑measure: $p'(0) = \cos^2(\tfrac{\varphi+\pi/2}{2})$ rises or falls with sign($\varphi$). Two settings, unknown recovered — baby phase estimation (Module 8's QPE grows it up).
````

## Mastery checklist — you are ready to move on when you can

- ☐ State Euler's formula and place $e^{i\theta}$ on the unit circle for the special angles.
- ☐ Multiply complex numbers in polar form (moduli multiply, phases add).
- ☐ Explain "phase $\pi$ = sign flip" and global vs relative phase.
- ☐ Run the live cell and explain why the roots of unity sum to zero.
- ☐ Derive and use $|1+e^{i\varphi}|^2 = 2 + 2\cos\varphi$ and $\cos^2(\varphi/2)$.
- ☐ Recover an unknown phase from two interference measurements.
