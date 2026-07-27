# Trigonometry & the unit circle

Here is a spoiler worth the whole module: **every possible state of a qubit is described by two angles** — write them $\theta$ and $\varphi$ — and the probabilities of measuring 0 or 1 are $\cos^2(\theta/2)$ and $\sin^2(\theta/2)$. That's Module 5's Bloch sphere, and it is pure trigonometry. Learn sine and cosine as *coordinates on a circle* (not as triangle ratios to memorize) and quantum states will feel geometric instead of algebraic.

## 1. Angles and radians — the natural unit

Degrees split a circle into 360 parts for historical reasons (Babylonian astronomy). Mathematics — and every quantum library — uses **radians**: the angle whose arc length equals the radius.

@@diagram:radian-def|One radian: walk along the circle a distance equal to the radius. The full circle is 2π radians because circumference = 2πr.

Since a full circle's circumference is $2\pi r$, a full turn is $2\pi$ radians ($\approx 6.283$). The conversions that must become reflex:

| Degrees | 0° | 30° | 45° | 60° | 90° | 180° | 270° | 360° |
|---|---|---|---|---|---|---|---|---|
| Radians | $0$ | $\pi/6$ | $\pi/4$ | $\pi/3$ | $\pi/2$ | $\pi$ | $3\pi/2$ | $2\pi$ |

Rule: $\text{rad} = \text{deg} \times \tfrac{\pi}{180}$. In code, angles are *always* radians: `qc.rx(3.14159, 0)` rotates by $\pi$ ($=180°$), not by 3 degrees. Feeding degrees to a radian API is a classic silent bug — the code runs, the answers are garbage.

## 2. Sine and cosine — coordinates, not triangles

Take a circle of radius 1 centered at the origin (the **unit circle**). Stand at angle $\theta$, measured counterclockwise from the positive x-axis. Then, *by definition*:

$$\cos\theta = \text{the x-coordinate of your point} \qquad \sin\theta = \text{the y-coordinate}$$

@@diagram:unit-circle|The unit circle: cos θ and sin θ are simply the x and y coordinates of the point at angle θ. Everything else in trig follows from this picture.

Everything you were ever told about trig falls out of this one picture:

- **Ranges**: coordinates on a unit circle can't exceed 1 or drop below −1, so $-1 \le \sin\theta, \cos\theta \le 1$.
- **Signs by quadrant**: upper half ($0<\theta<\pi$) has $\sin\theta > 0$; right half has $\cos\theta>0$. No mnemonics needed — look at the picture.
- **Periodicity**: a full turn returns you to the same point: $\sin(\theta + 2\pi) = \sin\theta$.
- **Symmetries**: $\cos(-\theta) = \cos\theta$ (mirror across x-axis keeps x), $\sin(-\theta) = -\sin\theta$ (flips y).

**The values to know cold** (these five cover ~95% of textbook and interview usage):

| $\theta$ | $0$ | $\pi/6$ | $\pi/4$ | $\pi/3$ | $\pi/2$ |
|---|---|---|---|---|---|
| $\cos\theta$ | $1$ | $\tfrac{\sqrt3}{2}$ | $\tfrac{1}{\sqrt2}$ | $\tfrac12$ | $0$ |
| $\sin\theta$ | $0$ | $\tfrac12$ | $\tfrac{1}{\sqrt2}$ | $\tfrac{\sqrt3}{2}$ | $1$ |

Memory pattern: the sine row reads $\tfrac{\sqrt0}{2}, \tfrac{\sqrt1}{2}, \tfrac{\sqrt2}{2}, \tfrac{\sqrt3}{2}, \tfrac{\sqrt4}{2}$ — and cosine is the same row reversed. Notice our old friend $\tfrac{1}{\sqrt2}$ sitting at 45°.

## 3. The identity that runs quantum mechanics

The point $(\cos\theta, \sin\theta)$ lies on the unit circle, and distance-from-origin on a unit circle is 1. By the Pythagorean theorem ($x^2 + y^2 = r^2$):

$$\cos^2\theta + \sin^2\theta = 1 \quad\text{for every } \theta$$

Stop and connect: last lesson's normalization said amplitudes obey $\alpha^2 + \beta^2 = 1$. This identity says $(\cos\frac\theta2, \sin\frac\theta2)$ *automatically* satisfies it, for any angle. That's why qubit states get written

$$\alpha = \cos\tfrac{\theta}{2}, \qquad \beta = \sin\tfrac{\theta}{2}$$

— one angle $\theta$ smoothly parametrizes every real amplitude pair, normalization guaranteed for free. (Why $\theta/2$ and not $\theta$? A genuinely deep reason lands in Module 5; for now: it makes $\theta = \pi$ correspond to the state "definitely 1", which will match the sphere picture perfectly.)

Two more identities you'll actually use (both provable from the circle picture; take them on account for now):

$$\sin(2\theta) = 2\sin\theta\cos\theta \qquad \cos(2\theta) = \cos^2\theta - \sin^2\theta$$

The double-angle formulas appear in Grover's algorithm (Module 8), where each iteration rotates a state by a fixed $2\theta$ — the algebra of "how many iterations until we're near $\pi/2$" is exactly these formulas.

## 4. Waves, and reading them

Plot $\sin\theta$ as $\theta$ runs along the horizontal axis: an endless smooth wave, rising from 0 to 1 at $\pi/2$, back through 0 at $\pi$, down to $-1$ at $3\pi/2$, repeating every $2\pi$. Cosine is the identical wave shifted left by $\pi/2$: $\cos\theta = \sin(\theta + \tfrac\pi2)$.

Vocabulary that transfers to physics: **amplitude** (wave height), **period** ($2\pi$ here), **phase** (horizontal shift — cosine is "sine, phase-shifted"). When quantum people say *phase* — and they say it constantly — they mean exactly this kind of angular shift. Interference (Module 5) is what happens when waves with different phases add: aligned crests reinforce, opposite crests cancel.

## 5. Going backwards: arccos and arcsin

"Which angle has cosine 0.6?" is answered by the **inverse** functions: $\theta = \arccos(0.6) \approx 0.927$ rad ($\approx 53.1°$). Caution from the circle picture: many angles share a cosine (e.g. $\pm\theta$), so arccos returns the representative in $[0, \pi]$ — which happens to be exactly the range the Bloch angle $\theta$ uses. Convenient, and not a coincidence.

```python
import math
print(math.cos(math.pi / 3))        # 0.5000000000000001
print(math.acos(0.5))               # 1.0471975511965979  = π/3
print(math.degrees(math.acos(0.5))) # 60.00000000000001
print(math.radians(45))             # 0.7853981633974483  = π/4
```

`math.degrees`/`math.radians` convert; everything else in `math`, NumPy, and Qiskit speaks radians only.

## Worked example — from target probability to gate angle

*You need a qubit that measures 0 with probability 85%. What Bloch angle $\theta$ does that require?*

**Set up** with the parametrization from Section 3: $p(0) = \cos^2(\theta/2) = 0.85$.

**Solve**: $\cos(\theta/2) = \sqrt{0.85} \approx 0.9220$ (positive root — $\theta/2 \in [0, \pi/2]$ keeps cosine positive). Then $\theta/2 = \arccos(0.9220) \approx 0.3976$ rad, so $\theta \approx 0.7953$ rad $\approx 45.6°$.

**Verify** (always): $\cos^2(0.3976) \approx 0.9220^2 \approx 0.8501$ ✓, and $p(1) = \sin^2(\theta/2) \approx 0.15$ ✓ — sums to 1 by the Pythagorean identity, no arithmetic needed.

```python
import math
theta = 2 * math.acos(math.sqrt(0.85))
print(theta)                              # 0.7953988301841436
print(math.cos(theta/2)**2)               # 0.8500000000000001
```

In Module 7 this exact number becomes a line of Qiskit: `qc.ry(0.7954, 0)` — "rotate qubit 0 by $\theta$ around the Y axis." Preparing a qubit with chosen statistics is a one-liner *because* you can do this computation.

## Gotchas

- **Degrees into radian APIs.** `math.sin(90)` is not 1 — it's $\sin(90\text{ rad}) \approx 0.894$. If a trig result looks random, check units first.
- **$\sin^2\theta$ means $(\sin\theta)^2$**, never $\sin(\theta^2)$, and `math.sin(x)**2` in code. The notation is historical and unkind; the convention is universal.
- **Forgetting the $\theta/2$.** Qubit formulas use half-angles. Plugging $\theta$ where $\theta/2$ belongs silently doubles your rotation — the most common wrong-histogram cause in early Qiskit work.
- **arccos only tells half the story.** Multiple angles share a cosine; the inverse returns one canonical choice. When solving "find all angles", add the symmetric partners from the circle picture.
- **Thinking $\cos^2\theta + \sin^2\phi = 1$ for different angles.** The identity needs the *same* angle in both terms. With different angles, nothing special holds.
- **Float dust at special values**: `math.cos(math.pi/2)` prints `6.12e-17`, not `0`. It's the ~16th-digit rounding from Lesson 1 — treat anything below ~$10^{-10}$ as zero in this context.

## Scenario — the calibration plot that made sense

An intern at a quantum hardware startup is handed a "Rabi calibration" plot: the x-axis is microwave pulse duration, the y-axis is probability of measuring 1, and the data traces a perfect wave: $p(1) = \sin^2(\Omega t/2)$ for some rate $\Omega$. The task: "find the pulse duration for a perfect flip." With this lesson's tools the intern reasons: perfect flip means $p(1) = 1$, so $\sin(\Omega t/2) = \pm1$, so $\Omega t/2 = \pi/2$, so $t = \pi/\Omega$. Reading $\Omega$ off the fitted curve gives the answer in nanoseconds; the team calls that duration a "π-pulse" — literally *the pulse worth π radians of rotation* — and now the intern knows why every hardware paper is full of π-pulses and π/2-pulses. Trigonometry isn't preparation for the job; on hardware teams, it *is* the job.

## Key points

- Radians are the only unit code understands: full turn $= 2\pi$; convert with $\text{deg}\times\pi/180$; `math.radians()` exists for a reason.
- Sine and cosine are the y- and x-coordinates on the unit circle — all identities, signs, and ranges follow from that single picture.
- $\cos^2\theta + \sin^2\theta = 1$ is normalization in disguise: $(\cos\frac\theta2, \sin\frac\theta2)$ parametrizes every real qubit-amplitude pair for free.
- Know the five key values (0, π/6, π/4, π/3, π/2) via the $\sqrt{k}/2$ pattern; $\tfrac{1}{\sqrt2}$ lives at 45°.
- "Phase" means angular shift of a wave; interference is addition of phase-shifted waves — vocabulary that becomes physics in Module 5.
- Inverse problem: target probability → $\theta = 2\arccos\sqrt{p(0)}$ → a rotation gate's argument. You can now aim a qubit.

## Check yourself

```quiz
{"q":"A qubit's Bloch angle is θ = π/2. Using p(0) = cos²(θ/2), what is the probability of measuring 0?","options":["0 — the qubit is certainly 1","0.5 — cos²(π/4) = (1/√2)² = 1/2","0.85","1 — the qubit is certainly 0"],"answer":1,"why":"Half-angle first: θ/2 = π/4, and cos(π/4) = 1/√2, squared gives 1/2. θ = π/2 is the equator of the Bloch sphere — the equal-superposition zone."}
```

```quiz
{"q":"Why does the parametrization α = cos(θ/2), β = sin(θ/2) automatically satisfy normalization α² + β² = 1?","options":["Because θ/2 is always less than π","Because cos²x + sin²x = 1 for every x — the point (cos x, sin x) lies on the unit circle","Because amplitudes are always positive","It doesn't — normalization must be checked separately each time"],"answer":1,"why":"The Pythagorean identity holds for any angle, so any (cos, sin) pair of the same angle is automatically a unit-length amplitude pair. One angle = all normalized real states."}
```

## Exercises

**Exercise 1 — the five-value drill, squared.** Without a calculator, fill in $p(0) = \cos^2(\theta/2)$ and $p(1) = \sin^2(\theta/2)$ for $\theta \in \{0, \tfrac\pi2, \pi\}$. Interpret each row in words ("the qubit is …"). Then verify the middle row in Python.

````solution
| $\theta$ | $\theta/2$ | $p(0)=\cos^2(\theta/2)$ | $p(1)=\sin^2(\theta/2)$ | Meaning |
|---|---|---|---|---|
| $0$ | $0$ | $1$ | $0$ | certainly 0 (north pole) |
| $\pi/2$ | $\pi/4$ | $\tfrac12$ | $\tfrac12$ | perfect coin-flip superposition (equator) |
| $\pi$ | $\pi/2$ | $0$ | $1$ | certainly 1 (south pole) |

```python
import math
t = math.pi/2
print(math.cos(t/2)**2, math.sin(t/2)**2)  # 0.5000000000000001 0.4999999999999999
```

The table *is* the Bloch sphere's vertical axis: θ sweeps from "certainly 0" at the top, through fair superposition at the equator, to "certainly 1" at the bottom. You now hold the sphere's skeleton two modules early.
````

**Exercise 2 — design a biased coin.** Find the angle $\theta$ (radians and degrees) giving $p(1) = 0.30$, verify numerically, and answer: does a second, different $\theta$ in $[0, 2\pi)$ produce the same statistics? What does the circle picture say?

````solution
$\sin^2(\theta/2) = 0.3 \Rightarrow \sin(\theta/2) = \sqrt{0.3} \approx 0.5477$, so $\theta/2 = \arcsin(0.5477) \approx 0.5796$ rad and $\theta \approx 1.159$ rad $\approx 66.4°$.

```python
import math
theta = 2 * math.asin(math.sqrt(0.3))
print(theta, math.degrees(theta))     # 1.1592794807274085 66.42182152179817
print(math.sin(theta/2)**2)           # 0.3
```

Second solution: yes — $\theta' = 2\pi - 1.159 \approx 5.124$ rad gives $\sin(\theta'/2) = \sin(\pi - 0.5796) = \sin(0.5796)$, same squares, same statistics. On the circle: two mirror-image points share the same |y|. Physically (Module 5 preview): those two states differ by the *other* angle $\varphi$ — the phase — which measurement statistics in this basis can't see. You've just bumped into the exact reason qubits need TWO angles, one of which hides from direct measurement.
````

## Practice questions

1. Convert 120° to radians and $\tfrac{3\pi}{4}$ to degrees.
2. From the unit-circle picture alone, determine the sign of $\cos(2.5)$ (note $2.5$ rad is just under $\pi \approx 3.14$).
3. State the Pythagorean identity and explain in one sentence why it's "free normalization" for qubit amplitudes.
4. Compute $\sin(2\theta)$ at $\theta = \pi/4$ two ways: directly, and via the double-angle formula.
5. `math.sin(30)` returns −0.988. Explain the bug and write the fixed line.
6. A Rabi curve is $p(1) = \sin^2(\Omega t/2)$ with $\Omega = 2\pi \times 10^7$ rad/s. How long is a π-pulse (full flip)?
7. **Design question:** using only rotations of the form "choose $\theta$", specify angles to prepare qubits with $p(0) = 1, 0.75, 0.5, 0.25, 0$ — then describe the pattern of your five angles on the unit circle.

````solution
1. $120° = \tfrac{2\pi}{3} \approx 2.094$ rad; $\tfrac{3\pi}{4} = 135°$.
2. At 2.5 rad you're in the second quadrant (between $\pi/2\approx1.57$ and $\pi$): x-coordinate negative, so $\cos(2.5) < 0$.
3. $\cos^2\theta+\sin^2\theta=1$: any amplitude pair written as $(\cos\frac\theta2,\sin\frac\theta2)$ satisfies $\alpha^2+\beta^2=1$ automatically — the constraint is built into the parametrization.
4. Directly: $\sin(\pi/2) = 1$. Formula: $2\sin(\pi/4)\cos(\pi/4) = 2\cdot\tfrac{1}{\sqrt2}\cdot\tfrac{1}{\sqrt2} = 1$ ✓.
5. `math.sin` received 30 *radians* (≈4.77 turns). Fix: `math.sin(math.radians(30))` → 0.5.
6. $\Omega t/2 = \pi/2 \Rightarrow t = \pi/\Omega = \pi/(2\pi\times10^7) = 5\times10^{-8}$ s $= 50$ ns.
7. $p(0)=\cos^2(\theta/2)$ inverted: $\theta = 2\arccos\sqrt{p(0)}$ gives $\theta = 0,\; \tfrac{\pi}{3}\,(60°),\; \tfrac{\pi}{2}\,(90°),\; \tfrac{2\pi}{3}\,(120°),\; \pi$. Pattern: the five states sit at evenly *probability-spaced* but not angle-spaced points sliding down the circle from north pole to south pole — probability varies as cos², so equal probability steps bunch angles near the equator. Noticing that nonlinearity is the design insight (and it matters for hardware calibration sweeps).
````
