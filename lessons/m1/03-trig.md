# Trigonometry & the unit circle

Here is a spoiler worth the whole module: **every possible state of a qubit is described by two angles** — write them $\theta$ and $\varphi$ — and the probabilities of measuring 0 or 1 are $\cos^2(\theta/2)$ and $\sin^2(\theta/2)$. That's Module 5's Bloch sphere, and it is pure trigonometry. Learn sine and cosine as *coordinates on a circle* (not as triangle ratios to memorize) and quantum states will feel geometric instead of algebraic.

## Start here — the intuition

Forget triangles. Stand on a circle of radius 1 at angle $\theta$ (counterclockwise from the right). Then **$\cos\theta$ is simply your x‑coordinate and $\sin\theta$ your y‑coordinate.** That one picture gives every identity, sign, and range for free — coordinates on a unit circle can't exceed 1, a full turn ($2\pi$) brings you back, and so on.

The payoff for quantum: since your point sits *on* the unit circle, $\cos^2\theta + \sin^2\theta = 1$ always — which is **normalization in disguise**. So $(\cos\tfrac\theta2, \sin\tfrac\theta2)$ is automatically a valid qubit amplitude pair, and a single angle $\theta$ sweeps every real qubit state. Two more things to carry: everything in code is **radians** (a full turn is $2\pi$, not 360), and to *aim* a qubit at a target probability you invert this — $\theta = 2\arccos\sqrt{p(0)}$ becomes one line of Qiskit.

## The circle, the values, the identity

A full turn is $2\pi$ radians; convert with $\text{rad} = \text{deg}\times\tfrac{\pi}{180}$. The five values covering ~95% of usage — sine reads $\tfrac{\sqrt0}{2}, \tfrac{\sqrt1}{2}, \tfrac{\sqrt2}{2}, \tfrac{\sqrt3}{2}, \tfrac{\sqrt4}{2}$ across $0, \tfrac\pi6, \tfrac\pi4, \tfrac\pi3, \tfrac\pi2$, and cosine is that row reversed (our friend $\tfrac{1}{\sqrt2}$ sits at $45°$).

@@diagram:unit-circle|The unit circle: cos θ and sin θ are simply the x and y coordinates of the point at angle θ. Everything else in trig follows from this picture.

@@widget

The identity $\cos^2\theta + \sin^2\theta = 1$ (Pythagoras on the unit circle) is why qubit states are written $\alpha = \cos\tfrac\theta2, \beta = \sin\tfrac\theta2$ — normalization guaranteed. The double‑angle formulas ($\sin 2\theta = 2\sin\theta\cos\theta$) show up in Grover, where each iteration rotates by a fixed $2\theta$. And "**phase**" — a word quantum people say constantly — just means an angular shift of a wave; interference is what happens when phase‑shifted waves add (aligned crests reinforce, opposite crests cancel).

## Predict, then run — from the circle to a qubit

The live cell prints the key values, shows $\cos^2 + \sin^2 = 1$ giving a qubit's probabilities, and inverts a target probability into a gate angle.

**Predict first.** At $\theta = \pi/2$ (the Bloch equator), what are $p(0) = \cos^2(\theta/2)$ and $p(1)$? And to make a qubit that reads 0 with 85% probability, will the angle be small or near $\pi$? Guess, then Run.

```run
# Live cell — sin/cos are circle coordinates; cos^2+sin^2=1 gives qubit amplitudes for free.
import math

print("theta     cos       sin")
for name, t in [("0",0), ("pi/6",math.pi/6), ("pi/4",math.pi/4), ("pi/3",math.pi/3), ("pi/2",math.pi/2)]:
    print(f"  {name:5}  {math.cos(t):+.4f}  {math.sin(t):+.4f}")

print("\ntheta   p(0)=cos^2(t/2)   p(1)=sin^2(t/2)   sum")
for t in [0, math.pi/2, math.pi]:
    c, s = math.cos(t/2)**2, math.sin(t/2)**2
    print(f"  {t:.2f}       {c:.3f}            {s:.3f}         {c+s:.3f}")

p0 = 0.85                                   # invert: target probability -> gate angle
theta = 2 * math.acos(math.sqrt(p0))
print(f"\nfor p(0)={p0}: theta = {theta:.4f} rad  ->  qc.ry({theta:.4f}, 0)")
```

At $\theta = \pi/2$: $\cos^2(\pi/4) = (\tfrac{1}{\sqrt2})^2 = 0.5$ — the equal‑superposition equator. The sum is always exactly 1 (the Pythagorean identity doing normalization for you). And $p(0) = 0.85$ needs $\theta \approx 0.795$ rad — which in Module 7 is literally `qc.ry(0.7954, 0)`, "rotate qubit 0 by $\theta$ about Y." Preparing a qubit with chosen statistics is a one‑liner *because* you can do this.

```quiz
{"q":"A qubit's Bloch angle is θ = π/2. Using p(0) = cos²(θ/2), what is the probability of measuring 0?","options":["0 — the qubit is certainly 1","0.5 — cos²(π/4) = (1/√2)² = 1/2","0.85","1 — the qubit is certainly 0"],"answer":1,"why":"Half-angle first: θ/2 = π/4, and cos(π/4) = 1/√2, squared gives 1/2. θ = π/2 is the equator of the Bloch sphere — the equal-superposition zone."}
```

## Level up — gotchas the pros watch for

- **Degrees into radian APIs.** `math.sin(90)` is not 1 — it's $\sin(90\text{ rad})$. If a trig result looks random, check units first.
- **$\sin^2\theta$ means $(\sin\theta)^2$**, never $\sin(\theta^2)$; in code `math.sin(x)**2`.
- **Forgetting the $\theta/2$.** Qubit formulas use half‑angles — the most common wrong‑histogram cause in early Qiskit.
- **arccos returns one angle.** Many angles share a cosine; add the symmetric partners when solving "find all angles."
- **Float dust at special values.** `math.cos(math.pi/2)` prints `6.12e-17`, not 0 — treat sub‑$10^{-10}$ as zero.

## Level up — the calibration plot that made sense

A hardware intern gets a "Rabi calibration" plot: pulse duration on x, $p(1)$ on y, tracing $p(1) = \sin^2(\Omega t/2)$. Task: find the duration for a perfect flip. Reasoning: $p(1) = 1$ needs $\sin(\Omega t/2) = 1$, so $\Omega t/2 = \pi/2$, so $t = \pi/\Omega$. Reading $\Omega$ off the curve gives nanoseconds — the team calls that a "π‑pulse," literally *the pulse worth π radians of rotation*. That's why hardware papers are full of π‑pulses and π/2‑pulses. On hardware teams, trig *is* the job.

## Key points

- Radians are the only unit code understands: full turn $= 2\pi$; convert with $\text{deg}\times\pi/180$.
- Sine and cosine are the y‑ and x‑coordinates on the unit circle — all identities follow from that picture.
- $\cos^2\theta + \sin^2\theta = 1$ is normalization in disguise: $(\cos\tfrac\theta2, \sin\tfrac\theta2)$ parametrizes every real qubit amplitude pair for free.
- Know the five key values via the $\sqrt k/2$ pattern; $\tfrac{1}{\sqrt2}$ lives at $45°$.
- "Phase" means angular shift of a wave; interference is addition of phase‑shifted waves.
- Inverse problem: target probability → $\theta = 2\arccos\sqrt{p(0)}$ → a rotation gate's argument.

## Check yourself

```quiz
{"q":"Why does α = cos(θ/2), β = sin(θ/2) automatically satisfy normalization α² + β² = 1?","options":["Because θ/2 is always less than π","Because cos²x + sin²x = 1 for every x — the point (cos x, sin x) lies on the unit circle","Because amplitudes are always positive","It doesn't — normalization must be checked separately each time"],"answer":1,"why":"The Pythagorean identity holds for any angle, so any (cos, sin) pair of the same angle is automatically a unit-length amplitude pair. One angle = all normalized real states."}
```

## Exercises

**Exercise 1 — the five‑value drill, squared.** In the live cell, tabulate $p(0) = \cos^2(\theta/2)$ and $p(1) = \sin^2(\theta/2)$ for $\theta \in \{0, \tfrac\pi2, \pi\}$ and interpret each row.

````solution
$\theta = 0$: $p(0)=1$ (certainly 0, north pole). $\theta = \pi/2$: $\tfrac12/\tfrac12$ (equator, fair coin). $\theta = \pi$: $p(1)=1$ (certainly 1, south pole). The table *is* the Bloch sphere's vertical axis — you hold the sphere's skeleton two modules early.
````

**Exercise 2 — a biased coin.** In the live cell, find $\theta$ giving $p(1) = 0.30$. Does a second $\theta$ in $[0, 2\pi)$ give the same statistics? What does the circle say?

````solution
```python
import math
theta = 2*math.asin(math.sqrt(0.3)); print(theta, math.degrees(theta))   # 1.159 rad, 66.4 deg
```
$\theta \approx 1.159$ rad. A second solution $\theta' = 2\pi - 1.159$ gives the same squared sine, hence the same statistics — the two mirror points share $|y|$. Physically those states differ by the *other* angle $\varphi$ (the phase), which this basis's statistics can't see — the exact reason qubits need two angles, one hidden from direct measurement.
````

## Practice questions

1. Convert $120°$ to radians and $\tfrac{3\pi}{4}$ to degrees.
2. Sign of $\cos(2.5)$ from the circle (note $2.5 < \pi$)?
3. State the Pythagorean identity and why it's "free normalization."
4. Compute $\sin(2\theta)$ at $\theta = \pi/4$ two ways.
5. `math.sin(30)` returns −0.988 — the bug and the fix?
6. Rabi curve $p(1) = \sin^2(\Omega t/2)$ with $\Omega = 2\pi\times10^7$ — how long is a π‑pulse?
7. **Design question:** give the angles preparing $p(0) = 1, 0.75, 0.5, 0.25, 0$ and describe their pattern on the circle.

````solution
1. $120° = \tfrac{2\pi}{3}$; $\tfrac{3\pi}{4} = 135°$.
2. Second quadrant → x negative → $\cos(2.5) < 0$.
3. $\cos^2\theta + \sin^2\theta = 1$: any $(\cos\tfrac\theta2, \sin\tfrac\theta2)$ satisfies $\alpha^2 + \beta^2 = 1$ by construction.
4. Directly $\sin(\pi/2) = 1$; formula $2\cdot\tfrac{1}{\sqrt2}\cdot\tfrac{1}{\sqrt2} = 1$.
5. `math.sin` got 30 *radians*; fix `math.sin(math.radians(30))` → 0.5.
6. $t = \pi/\Omega = \pi/(2\pi\times10^7) = 5\times10^{-8}$ s $= 50$ ns.
7. $\theta = 2\arccos\sqrt{p(0)}$ gives $0, \tfrac{\pi}{3}, \tfrac{\pi}{2}, \tfrac{2\pi}{3}, \pi$ — evenly *probability*‑spaced but not angle‑spaced (cos² is nonlinear), so equal probability steps bunch angles near the equator.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Read $\cos\theta, \sin\theta$ as coordinates on the unit circle.
- ☐ Convert degrees↔radians and remember code is radians‑only.
- ☐ Recall the five key values via the $\sqrt k/2$ pattern.
- ☐ Explain why $\cos^2 + \sin^2 = 1$ makes $(\cos\tfrac\theta2, \sin\tfrac\theta2)$ a free qubit state.
- ☐ Run the live cell and invert a target probability into a gate angle.
- ☐ Define "phase" as an angular shift and connect it to interference.
