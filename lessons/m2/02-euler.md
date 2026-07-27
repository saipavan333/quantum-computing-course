# Polar form & Euler's formula

If this course had to keep only one equation, it would be $e^{i\theta} = \cos\theta + i\sin\theta$. Euler's formula turns complex numbers from coordinate pairs into **rotations**, makes multiplication geometric, and gives quantum computing its single most used word: *phase*. Every gate you'll ever apply, every interference pattern you'll ever engineer, is bookkeeping with $e^{i\theta}$. Today it becomes a tool you own, not a formula you fear.

## 1. Polar form — describe the arrow by length and angle

Last lesson located $z = a + bi$ by coordinates $(a, b)$. Equally valid: give its distance from origin $r = |z|$ and its angle $\theta$ from the positive real axis (measured counterclockwise — trig lesson rules apply). Reading off the unit-circle definitions:

$$a = r\cos\theta, \quad b = r\sin\theta \qquad\Longrightarrow\qquad z = r(\cos\theta + i\sin\theta)$$

Convert the other way: $r = \sqrt{a^2+b^2}$ and $\theta = \operatorname{atan2}(b, a)$ (the two-argument arctangent that gets the quadrant right — in code always `math.atan2(b, a)`, never plain arctan). The angle $\theta$ is called the **argument** or — the word your field uses — the **phase** of $z$.

Example: $z = 1 + i$ has $r = \sqrt2$ and $\theta = \pi/4$ (45°, northeast diagonal).

## 2. Euler's formula — the exponential that rotates

Here is the miracle, stated then justified:

$$e^{i\theta} = \cos\theta + i\sin\theta$$

So $e^{i\theta}$ is *the point on the unit circle at angle $\theta$*, and polar form compresses to

$$z = r\,e^{i\theta}$$

@@diagram:euler-circle|e^{iθ} walks the unit circle: angle θ in the exponent, position cos θ + i sin θ on the circle. Special stops: e^{iπ/2} = i, e^{iπ} = −1, e^{2πi} = 1.

**Why should an exponential involve sine waves?** Two honest justifications, pick your favorite:

- *The series argument (sketch):* $e^x$ has the infinite-sum definition $1 + x + \tfrac{x^2}{2!} + \tfrac{x^3}{3!} + \cdots$. Substitute $x = i\theta$, use the $i, -1, -i, 1$ cycle to sort terms into real and imaginary piles — the real pile is exactly the series for $\cos\theta$, the imaginary pile exactly $\sin\theta$. (You can verify the first four terms in five minutes; do it once in your life.)
- *The motion argument:* $e^{kt}$ is the thing whose rate of change is $k$ times itself. With $k = i$, "rate of change is $i\times$ position" means velocity is always at 90° to position (multiplying by $i$ rotates by 90°, Section 3) — and a point whose velocity is perpendicular to its position travels in a circle. Uniform circular motion *is* $e^{i\theta}$.

Special values to keep loaded (check each against the circle):

| $\theta$ | $0$ | $\pi/2$ | $\pi$ | $3\pi/2$ | $2\pi$ |
|---|---|---|---|---|---|
| $e^{i\theta}$ | $1$ | $i$ | $-1$ | $-i$ | $1$ |

The $\theta = \pi$ entry rearranges into $e^{i\pi} + 1 = 0$ — Euler's identity, regularly voted mathematics' most beautiful equation. For you it's practical: **a phase of $\pi$ is a factor of $-1$**, and "apply a $\pi$ phase" = "flip the sign" is a sentence you'll use weekly from Module 6 onward.

## 3. Multiplication becomes geometry

Multiply two numbers in polar form and exponent rules do all the work:

$$\left(r_1 e^{i\theta_1}\right)\left(r_2 e^{i\theta_2}\right) = r_1 r_2\, e^{i(\theta_1 + \theta_2)}$$

**Moduli multiply; phases add.** Multiplication by $e^{i\varphi}$ is a pure rotation by $\varphi$ — no stretch. Suddenly last lesson's mysteries are obvious:

- The $i, -1, -i, 1$ cycle: multiplying by $i = e^{i\pi/2}$ rotates 90°; four rotations = full turn.
- $(1+i)^2 = 2i$: square = double the angle (45°→90°), square the modulus ($\sqrt2 \to 2$).
- Conjugation $z^* = re^{-i\theta}$: reflection = negate the phase.
- Division: subtract phases, divide moduli.

@@diagram:complex-mult|Multiplying by e^{iφ} rotates every complex number by φ without changing its length — the geometric soul of quantum gates.

This is why complex numbers run quantum mechanics: **quantum evolution must preserve total probability (lengths) while rearranging amplitudes — i.e., it must rotate.** Multiplication by unit-modulus complex numbers is exactly the algebra of rotation. When Module 5 says "gates are unitary," the cash value is "gates are built from $e^{i\theta}$ factors."

```python
import cmath, math
z = 1 + 1j
r, theta = abs(z), cmath.phase(z)          # polar pieces
print(r, theta)                             # 1.4142135623730951 0.7853981633974483 (=π/4)
print(cmath.exp(1j * math.pi))              # (-1+1.2246467991473532e-16j) ≈ −1 ✓
w = z * cmath.exp(1j * math.pi/2)           # rotate z by 90°
print(w)                                    # (-1+1j)  — northeast arrow now points northwest
```

(`cmath` is `math`'s complex-savvy sibling; note the familiar $10^{-16}$ float dust standing in for zero.)

## 4. Phase in quantum mechanics — global vs relative (preview with teeth)

Take the state with amplitudes $(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$ and multiply *everything* by $e^{i\varphi}$: probabilities $|e^{i\varphi}\alpha|^2 = |e^{i\varphi}|^2|\alpha|^2 = |\alpha|^2$ — unchanged, always, no matter what comes later (later gates act linearly, so the factor rides along untouched). A **global phase** is physically invisible; states differing only by one are *the same state*.

Now multiply only the *second* amplitude: $(\tfrac{1}{\sqrt2}, \tfrac{e^{i\varphi}}{\sqrt2})$. Immediate statistics: still 50/50. But this **relative phase** between components is real physics — interference experiments detect $\varphi$ completely (Module 6 builds one). The professional reflex being installed: *phase differences matter; overall phase never does.* Half of all quantum algorithm design is writing information into relative phases and then arranging interference to read it back out.

## 5. Roots of unity — the QFT's alphabet (forward deposit)

The equation $z^N = 1$ has exactly $N$ complex solutions, equally spaced around the unit circle:

$$\omega_k = e^{2\pi i k/N}, \quad k = 0, 1, \dots, N-1$$

For $N=4$: $1, i, -1, -i$ (there's that cycle a third time). Key fact, provable in one line with the geometric series: the $N$ roots **sum to zero** — perfectly balanced arrows cancel. The quantum Fourier transform (Module 8) is nothing but a systematic packing of amplitudes with roots of unity so that wrong frequencies cancel by exactly this balance and the right one survives. When you get there, this paragraph is the whole trick.

## Worked example — three representations, one computation

*Compute $(1+i)^6$ — the kind of thing that's miserable in rectangular form and trivial in polar.*

**Polar first**: $1 + i = \sqrt2\, e^{i\pi/4}$. Then

$$(1+i)^6 = (\sqrt2)^6 e^{i\,6\pi/4} = 8\, e^{i\,3\pi/2} = 8\cdot(-i) = -8i$$

(Modulus: $(\sqrt2)^6 = 2^3 = 8$. Angle: $6\times45° = 270°$, pointing straight down.)

**Sanity-check the hard way** (partially): $(1+i)^2 = 2i$, so $(1+i)^6 = (2i)^3 = 8i^3 = -8i$ ✓ — two independent routes agree, the professional's favorite feeling.

```python
print((1 + 1j)**6)     # (-4.898587196589413e-16-8.000000000000002j) ≈ -8i ✓
```

The workflow to internalize: **multiplication-heavy problems → convert to polar, work with exponents, convert back.** This is also precisely how you'll multiply quantum phase factors — as exponent bookkeeping, never as rectangular slog.

## Gotchas

- **Degrees in the exponent.** $e^{i\cdot 90}$ is not "rotate 90°" — it's 90 *radians* (~14 turns). Phases are radians, everywhere, forever.
- **Plain `atan(b/a)` for the angle.** Loses the quadrant ($-1-i$ and $1+i$ give the same ratio); division by zero at $a=0$. Use `atan2(b, a)`.
- **Angle ambiguity.** $\theta$ and $\theta + 2\pi$ name the same point; `cmath.phase` returns the representative in $(-\pi, \pi]$. Don't be alarmed when your "$3\pi/2$" prints as $-\pi/2$ — same arrow.
- **Treating global phase as meaningful.** Chasing an overall $e^{i\varphi}$ through a calculation and reporting "the states differ!" is a rite-of-passage error. If two states differ only by a global factor of unit modulus, they are physically identical.
- **Sloppy exponent arithmetic**: $(e^{i\theta})^n = e^{in\theta}$, but $e^{i\theta} + e^{i\varphi}$ does NOT combine into a single clean exponential in general (factor out the average phase if you must: it becomes $2\cos(\tfrac{\theta-\varphi}{2})\,e^{i(\theta+\varphi)/2}$ — actually the interference formula, worth meeting).
- **Confusing $e^{i\pi} = -1$ (phase flip) with "probability becomes negative."** The *amplitude* flips sign; probability $|-z|^2 = |z|^2$ is serenely unchanged until interference with something else reveals the flip.

## Scenario — the interference budget meeting

Your team debugs an algorithm whose success probability should be near 1 but measures 0.25. On the whiteboard, the lead writes the final amplitude of the "good" outcome as a sum of two paths: $\tfrac12 + \tfrac12 e^{i\varphi}$ — two routes to the same answer, phases possibly disagreeing. Success probability: $\left|\tfrac12(1 + e^{i\varphi})\right|^2 = \tfrac14\,|1 + e^{i\varphi}|^2 = \tfrac14(2 + 2\cos\varphi) = \cos^2(\varphi/2)$. Measured 0.25 → $\cos^2(\varphi/2) = 0.25$ → $\varphi = 2\pi/3$: a stray 120° phase between paths. Someone checks the circuit: an Rz gate got $2\pi/3$ instead of $0$ from a degree/radian mixup upstream. Fix, re-run, 0.98. The entire diagnosis was this lesson: expand $|1 + e^{i\varphi}|^2$, recognize the cosine, invert it. That whiteboard move — *sum two phases, square the modulus, read the interference* — is the most reused calculation in quantum computing.

## Key points

- Polar form $z = re^{i\theta}$: modulus $r$ (length) and phase $\theta$ (angle, radians, via `atan2`).
- Euler: $e^{i\theta} = \cos\theta + i\sin\theta$ — the unit circle walked by an exponential; $e^{i\pi} = -1$ means "phase $\pi$ = sign flip."
- Multiplication: moduli multiply, **phases add**; multiplying by $e^{i\varphi}$ is a pure rotation — the algebra quantum gates are made of.
- Global phase (applied to the whole state) is physically invisible; relative phase (between components) is real, interference-detectable information.
- Powers/roots go polar: $z^n = r^n e^{in\theta}$; the $N$ roots of unity $e^{2\pi ik/N}$ space evenly and sum to zero (the QFT's cancellation engine).
- $|1 + e^{i\varphi}|^2 = 2 + 2\cos\varphi$: the two-path interference formula — memorize it now, use it for a career.

## Check yourself

```quiz
{"q":"What is e^{iπ/2} · e^{iπ}, in rectangular form?","options":["-i — phases add to 3π/2, which points straight down","i — phases multiply","-1 — the moduli cancel","1 — the rotations undo each other"],"answer":0,"why":"Multiplying unit-circle numbers adds phases: π/2 + π = 3π/2, and e^{i3π/2} = -i. Moduli (both 1) multiply to 1."}
```

```quiz
{"q":"States |ψ⟩ and e^{iπ/7}|ψ⟩ (every amplitude multiplied by the same factor) are measured in every possible way. What differences appear?","options":["Outcome probabilities shift by 1/7","Only interference experiments can distinguish them","None — a global phase is physically undetectable by any experiment","The second state is not normalized"],"answer":2,"why":"|e^{iπ/7}|=1 leaves every probability, and every future probability, untouched — the factor rides through all subsequent linear evolution. Global phase is bookkeeping, not physics (unlike RELATIVE phase)."}
```

## Exercises

**Exercise 1 — conversion fluency.** Convert to the other form (exact where possible): (a) $z = -2$, (b) $z = 3e^{i\pi/6}$, (c) $z = -1 + i$, (d) $z = 5e^{i\,3\pi/2}$. Then verify (c) with `cmath`.

````solution
(a) $-2 = 2e^{i\pi}$ (length 2, pointing left).

(b) $3(\cos\tfrac\pi6 + i\sin\tfrac\pi6) = 3\left(\tfrac{\sqrt3}{2} + \tfrac{i}{2}\right) = \tfrac{3\sqrt3}{2} + \tfrac{3i}{2} \approx 2.598 + 1.5i$.

(c) $r = \sqrt{1+1} = \sqrt2$; angle: second quadrant, $\theta = 3\pi/4$ (atan2 territory — naive arctan of $\tfrac{1}{-1}$ says $-\pi/4$: wrong quadrant). So $-1+i = \sqrt2\,e^{i3\pi/4}$.

(d) $5e^{i3\pi/2} = -5i$ (straight down, length 5).

```python
import cmath
z = -1 + 1j
print(abs(z), cmath.phase(z))   # 1.4142135623730951 2.356194490192345  (= 3π/4 ✓)
```
````

**Exercise 2 — the two-path interferometer, by hand.** An outcome's amplitude is $A = \tfrac{1}{\sqrt2}\left(1 + e^{i\varphi}\right)\cdot\tfrac{1}{\sqrt2}$. (a) Show the outcome probability is $\cos^2(\varphi/2)$. (b) Evaluate at $\varphi = 0, \pi/2, \pi$. (c) One sentence: what physical story do those three numbers tell?

````solution
(a) $|A|^2 = \tfrac14|1 + e^{i\varphi}|^2 = \tfrac14(1+e^{i\varphi})(1+e^{-i\varphi}) = \tfrac14(1 + e^{i\varphi} + e^{-i\varphi} + 1) = \tfrac14(2 + 2\cos\varphi)$, and the half-angle identity $2+2\cos\varphi = 4\cos^2(\varphi/2)$ gives $|A|^2 = \cos^2(\varphi/2)$. (Note the middle step used $e^{i\varphi}+e^{-i\varphi} = 2\cos\varphi$ — conjugate pairs summing to a real cosine, the single most-used micro-identity in the field.)

(b) $\varphi=0$: probability 1. $\varphi=\pi/2$: $\cos^2(\pi/4) = \tfrac12$. $\varphi=\pi$: 0.

(c) Two paths in step reinforce to certainty; a quarter-turn of disagreement gives a coin flip; perfectly out-of-step paths annihilate — interference dials an outcome anywhere between always and never using phase alone. (This *is* the double-slit result you'll meet in Module 5, and the mechanism Grover exploits in Module 8.)
````

## Practice questions

1. Express $i$ and $-1$ as $e^{i\theta}$, then compute $i \cdot (-1)$ by adding phases and confirm rectangularly.
2. What are the 3rd roots of unity, in both $e^{i\theta}$ and (exact) rectangular form? Verify they sum to zero.
3. $(2e^{i\pi/3})^3 = ?$ — modulus and phase separately, then rectangular.
4. Why does `cmath.phase(-1 - 1j)` return a *negative* number (~−2.356) rather than $5\pi/4 \approx 3.93$?
5. A teammate reports two states as different: their amplitude lists are $(0.6, 0.8i)$ and $(-0.6, -0.8i)$. Adjudicate.
6. Using $|1+e^{i\varphi}|^2 = 2 + 2\cos\varphi$: what stray phase $\varphi$ would cut a should-be-perfect success probability to exactly 75%?
7. **Design question:** design a "phase ruler": a procedure that, given a black box multiplying the second amplitude by an unknown $e^{i\varphi}$, estimates $\varphi$ from measured statistics alone (you may prepare $(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2})$ inputs and use the interference formula; assume you can also insert a known extra phase of your choosing).

````solution
1. $i = e^{i\pi/2}$, $-1 = e^{i\pi}$; product $e^{i3\pi/2} = -i$; rectangular check: $i\cdot(-1) = -i$ ✓.
2. $1,\; e^{2\pi i/3} = -\tfrac12 + \tfrac{\sqrt3}{2}i,\; e^{4\pi i/3} = -\tfrac12 - \tfrac{\sqrt3}{2}i$. Sum: $1 - \tfrac12 - \tfrac12 + (\tfrac{\sqrt3}{2}-\tfrac{\sqrt3}{2})i = 0$ ✓.
3. Modulus $2^3 = 8$; phase $3\cdot\tfrac\pi3 = \pi$; result $8e^{i\pi} = -8$.
4. `phase` returns the canonical representative in $(-\pi, \pi]$; $5\pi/4$ and $-3\pi/4 \approx -2.356$ are the same direction, and the library picks the latter.
5. Same state: $(-0.6, -0.8i) = e^{i\pi}(0.6, 0.8i)$ — a global phase of $\pi$. No experiment distinguishes them; close the ticket.
6. $\tfrac14(2+2\cos\varphi) = 0.75 \Rightarrow \cos\varphi = \tfrac12 \Rightarrow \varphi = \pm\pi/3$ (60° of stray phase).
7. Model design: feed the equal superposition through the box, then interfere the two amplitudes (Module 6's Hadamard does exactly this); measured $p(0) = \cos^2(\varphi/2)$ pins $|\varphi|$ but not its sign (cos is even). Break the tie by inserting a known $+\pi/2$ phase and re-measuring: $p'(0) = \cos^2\!\big(\tfrac{\varphi + \pi/2}{2}\big)$ increases or decreases depending on sign($\varphi$). Two measurement settings, unknown recovered — congratulations, you've independently invented phase estimation's baby version (Module 8 grows it up into QPE).
````
