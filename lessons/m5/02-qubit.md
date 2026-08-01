# The qubit: state vectors & the Born rule

Time to make Rule 1 and Rule 3 fully precise for the object you'll spend your career manipulating. By the end of this lesson you will take any single-qubit state, compute its complete measurement statistics in any basis by hand and in code, and normalize, compare, and prepare states on demand. This is where six weeks of mathematics cashes out.

## Start here — the intuition

A qubit is described by just **two numbers** — the amplitudes $\alpha$ and $\beta$ in $\alpha\ket0 + \beta\ket1$. Think of them as the coordinates of an arrow. The **Born rule** is the one bridge from that arrow to what you actually see when you look: the probability of reading "0" is $|\alpha|^2$ and "1" is $|\beta|^2$ — the *squared length* of the arrow's shadow on each axis. Square the amplitude, get the probability.

Two things trip up every beginner, and both are worth front-loading. First, amplitudes are **complex** — but you always take the *magnitude* before squaring, so a phase like $i$ vanishes from the probability ($|i/2|^2 = 1/4$). Second, the plain "0 vs 1" measurement is **blind to phase** — two very different states can give identical 0/1 statistics, and you only tell them apart by *rotating first, then measuring*. Both facts you'll see live in a moment.

## The state, precisely

A **qubit** is any system with two distinguishable configurations. Physics packages them identically:

$$\ket\psi = \alpha\ket0 + \beta\ket1 = \begin{pmatrix}\alpha\\\beta\end{pmatrix}, \qquad \alpha, \beta \in \mathbb{C}, \qquad |\alpha|^2 + |\beta|^2 = 1$$

$\alpha, \beta$ are **amplitudes**; $\{\ket0, \ket1\}$ is the **computational basis**; normalization is Rule 3's bookkeeping (probabilities sum to 1). States differing by a **global phase** $e^{i\gamma}$ are physically identical, so counting real parameters: 4 (two complex) − 1 (normalization) − 1 (global phase) = **2 real parameters** per qubit. Hold that number; next lesson it becomes two angles on a sphere.

## The Born rule, precisely

Measuring $\ket\psi$ in the computational basis: $p(0) = |\braket{0}{\psi}|^2 = |\alpha|^2$, $p(1) = |\beta|^2$, and the state collapses to what you saw. In *any* orthonormal basis $\{\ket{b_0}, \ket{b_1}\}$: $p(b_k) = |\braket{b_k}{\psi}|^2$ — the overlap-squared machine from the Dirac lesson, now wearing its physics badge. Conjugate the bra, expand by linearity, collapse $\braket{i}{j}$, modulus-square *last* (never earlier).

@@diagram:qubit-born|The qubit pipeline: complex amplitudes → |·|² → probabilities → sampled outcome + collapse. Phases survive the arithmetic until the squaring — that's where quantum information hides.

@@widget

The three bases you must own — Z (computational) asks "how much 0 vs 1?" and is blind to all relative phase; X ($\ket\pm = \tfrac{\ket0 \pm \ket1}{\sqrt2}$) sees the real part of the phase relationship; Y ($\ket{\pm i} = \tfrac{\ket0 \pm i\ket1}{\sqrt2}$) sees the imaginary part. No single basis sees everything; the three together determine the state completely (**state tomography**).

## Predict, then run — the Born rule, and Z's blind spot

The live cell prepares a biased qubit, reads its Born-rule probabilities, samples shots, then shows two states that are **identical in Z** but opposite in the X basis — proof that measurement is basis-relative.

**Predict first.** The last part prepares $\ket{+}$ ($\varphi=0$) and $\ket{-}$ ($\varphi=\pi$). Both are 50/50 in Z. When you rotate into the X basis (an $H$ before measuring), what will each read? Guess, then Run.

```run
# Live cell — the Born rule and why Z-measurement can't see phase.
import numpy as np

# A biased qubit: ry(theta) sets p(1) = sin^2(theta/2)
p1 = 0.3
qc = QuantumCircuit(1); qc.ry(2*np.arcsin(np.sqrt(p1)), 0)
print("exact probabilities (Born rule):", {k: round(v,3) for k,v in qc.probabilities().items()})
print("1000 measured shots            :", qc.sample(1000, seed=1))

# Two states, SAME Z stats, DIFFERENT phase — distinguished only in the X basis:
print("\nphi   Z(|0>)   X-basis(|0>)")
for phi in [0.0, np.pi]:
    qc = QuantumCircuit(1); qc.h(0); qc.rz(phi, 0)   # |+> for phi=0, |-> for phi=pi
    z = qc.probabilities().get("0", 0.0)
    qc.h(0)                                           # rotate: measure in the X basis
    x = qc.probabilities().get("0", 0.0)
    print(f"{phi:4.2f}   {z:5.2f}    {x:5.2f}")
```

Both states are a coin flip in Z, yet in the X basis one is certain "0" and the other certain "1." The phase Z threw away was there all along — you just had to rotate to see it. "Same histogram" never means "same state."

```quiz
{"q":"Two preparation routines both produce perfect 50/50 Z-basis histograms. What can you conclude about the states they prepare?","options":["They prepare the same state |+⟩","They prepare states with |α|² = |β|² = 1/2 — but possibly different relative phases, hence possibly different states","They prepare |0⟩ and |1⟩ alternately","Nothing at all can be concluded"],"answer":1,"why":"Z statistics pin only the amplitude magnitudes. |+⟩, |−⟩, |+i⟩, and infinitely many phase-siblings all give 50/50 in Z. X- and Y-basis data would be needed to identify the states."}
```

## Preparing states — from statistics to amplitudes

Every real qubit is born as $\ket0$ (hardware resets to ground state); preparation = rotate from there. Target $p(1) = p$: use $\theta = 2\arcsin\sqrt{p}$ as the `ry(theta)` angle. Target a phase too: append it, $\ket\psi = \sqrt{1-p}\,\ket0 + e^{i\varphi}\sqrt{p}\,\ket1$ — two targets ($p, \varphi$), two dials ($\theta, \varphi$). Non-uniqueness to internalize: infinitely many amplitude pairs give the same Z statistics (any $\varphi$); a state is pinned only by statistics in *multiple* bases.

## Level up — certifying a state-preparation routine

Firmware claims to prepare $\tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1$. QA hands you Z data (7,481 / 2,519 in 10,000 shots) and Y data (8,995 / 1,005). Predictions: Z $p(0)=\tfrac34$; Y $p(+i) = \tfrac{(\sqrt3+1)^2}{8} \approx 0.933$. With error bars (Module 3): Z $\hat p(0) = 0.7481 \pm 0.0087$ — target inside ✓; Y $\hat p(+i) = 0.8995 \pm 0.0060$ — target $0.933$ is **5.6σ away** ✗. Verdict: the *magnitude* of $\beta$ is right but its **phase is off** — "phase miscalibration in the second rotation" goes in the ticket. **Z-basis QA alone certifies nothing about phase** — a lesson entire teams have re-learned expensively.

## Level up — the 3 a.m. hardware pager

A pipeline pages: "qubit 7 state-prep fidelity degraded" — prepare-$\ket+$-measure-X dropped from 98.9% to 93.1%. Junior instinct: "the qubit is dying, escalate to fab." Your move: check companions. Prepare-$\ket0$-measure-Z still 99.2% (reset/readout fine); prepare-$\ket+$-measure-Z still 50/50 (amplitude magnitudes fine). Only X-basis coherence dropped ⇒ the relative phase is wandering ⇒ classic **dephasing increase**, probably a noisy control line, not a dying qubit. Re-run the phase calibration; fidelity returns. "Which basis' statistics moved?" is Born-rule literacy converting directly into uptime.

## Key points

- Qubit state: $\alpha\ket0 + \beta\ket1$, complex amplitudes, $|\alpha|^2 + |\beta|^2 = 1$; global phase unphysical ⇒ 2 real parameters.
- Born rule in any basis: $p(b) = |\braket{b}{\psi}|^2$, then collapse; compute via conjugate-expand-collapse-square (square *last*).
- Z sees populations; X and Y see the two parts of relative phase; three bases = complete information, one basis = almost nothing.
- Prepare by rotation from $\ket0$: $\theta = 2\arcsin\sqrt{p}$ sets probability, $\varphi$ sets phase.
- Identical Z histograms do NOT imply identical states; certification needs multiple bases and error bars.
- Basis-resolved statistics are a diagnostic instrument: which basis moved tells you what physical parameter drifted.

## Check yourself

```quiz
{"q":"|ψ⟩ = (3/5)|0⟩ + (4i/5)|1⟩. What are p(0) and p(1), and is the state normalized?","options":["p(0)=0.36, p(1)=0.64, normalized","p(0)=0.6, p(1)=0.8i — not normalized","p(0)=0.36, p(1)=−0.64 — invalid state","p(0)=0.36, p(1)=0.64 but normalization can't hold with complex amplitudes"],"answer":0,"why":"|3/5|² = 0.36, |4i/5|² = 16/25 = 0.64 (the i vanishes under modulus); 0.36+0.64 = 1. Complex amplitudes normalize exactly like real ones — via modulus-squares."}
```

## Exercises

**Exercise 1 — the tomography drill.** For $\ket\psi = \tfrac{1}{2}\ket0 + \tfrac{\sqrt3}{2}e^{i\pi/3}\ket1$: verify normalization; compute Z, X, Y probabilities by hand; verify in code; then reconstruct $\theta, \varphi$ from the three histograms.

````solution
```python
import numpy as np
psi = np.array([0.5, (np.sqrt(3)/2)*np.exp(1j*np.pi/3)])
for name, b in [("Z0",[1,0]), ("X+",[1/np.sqrt(2),1/np.sqrt(2)]), ("Y+i",[1/np.sqrt(2),1j/np.sqrt(2)])]:
    print(name, round(abs(np.vdot(np.array(b), psi))**2, 4))
# Z0 0.25   X+ 0.7165   Y+i 0.875
```
Reconstruction: $\theta = 2\arccos\sqrt{p(0)} = \tfrac{2\pi}{3}$; then from $p(+) = \tfrac12(1+\sin\theta\cos\varphi)$ and $p(+i) = \tfrac12(1+\sin\theta\sin\varphi)$, $\cos\varphi = 0.5$ and $\sin\varphi = 0.866 \Rightarrow \varphi = \pi/3$. Three histograms in, two angles out — you have performed single-qubit state tomography by hand.
````

**Exercise 2 — the preparation spec.** Write `prep(p1, phi)` returning $\sqrt{1-p_1}\ket0 + e^{i\varphi}\sqrt{p_1}\ket1$ and `predict(psi)` giving all six basis probabilities. Sweep $\varphi$ for fixed $p_1 = 0.5$ and find which phase maximizes $p(+)$; explain why it had to be $\varphi = 0$.

````solution
```python
# p(+) = |0.5(1 + e^{i*phi})|^2 = cos^2(phi/2), maximized at phi = 0, where the
# state IS |+>. The sweep-and-maximize pattern is, one module early, the beating
# heart of variational algorithms (Module 9 just adds a molecule).
```
At $p_1 = \tfrac12$ the state is $\tfrac{1}{\sqrt2}(\ket0 + e^{i\varphi}\ket1)$, and $p(+) = \cos^2(\varphi/2)$ — maximized when the two amplitudes are in phase.
````

## Practice questions

1. Legal or not: $(\tfrac35, \tfrac45 i)$; $(\tfrac12, \tfrac12)$; $(\tfrac{1+i}{2}, \tfrac{1-i}{2})$? Fix any illegal one.
2. For $\tfrac{1}{\sqrt2}(\ket0 - \ket1)$, give exact statistics in all three bases (name the state first).
3. Show $\ket\psi$ and $e^{i\gamma}\ket\psi$ give identical probabilities in every basis (one line).
4. A state gives Z 80/20 and X 50/50. What is $|\beta|$, and what does X say about $\varphi$?
5. Why does hardware prepare all qubits as $\ket0$ and rotate, rather than preparing arbitrary states directly?
6. After measuring "1" on $\sqrt{0.99}\ket0 + 0.1\ket1$, a colleague says "remeasure to be sure." What will remeasurement show, and why is the suggestion confused?
7. **Design question:** design the acceptance-test suite for `prepare(theta, phi)` — which $(\theta,\varphi)$ points, which bases, shot counts for ±1% at 95%, and pass thresholds — so any single-parameter miscalibration is caught.

````solution
1. Legal ($0.36+0.64=1$); illegal ($\tfrac12$ — normalize to $(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2})$); legal ($\tfrac12+\tfrac12=1$).
2. It's $\ket-$: Z → 50/50; X → "−" with certainty; Y → 50/50.
3. $|\braket{b}{e^{i\gamma}\psi}|^2 = |e^{i\gamma}|^2|\braket{b}{\psi}|^2 = |\braket{b}{\psi}|^2$.
4. $|\beta| = \sqrt{0.2} \approx 0.447$; X at 50/50 with $\sin\theta \neq 0$ ⇒ $\cos\varphi = 0$ ⇒ $\varphi = \pm\pi/2$ (Y breaks the tie).
5. Reset-to-ground is a reliable physical process; arbitrary states have no direct handle, but calibrated unitaries do — "known start + rotation" is sufficient and engineerable.
6. Remeasurement gives "1" with certainty — collapse made $\ket1$ the state; it confirms the record, not the preparation. Statistics need fresh copies.
7. Poles $\theta \in \{0,\pi\}$ in Z (amplitude-scale errors); equator $\theta=\tfrac\pi2$ with $\varphi \in \{0,\tfrac\pi2,\pi,\tfrac{3\pi}2\}$ in X and Y (phase errors show maximally at the equator); one generic interior point in all three bases (conspiracies). ~$10^4$ shots per histogram for ±1%; threshold $|{\rm measured} - {\rm predicted}| < \max(0.01, 2{\rm SE})$. Cover each parameter where its derivative is largest.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Write a qubit state and compute $p(0), p(1)$ with the Born rule (magnitude, *then* square).
- ☐ Explain why global phase is unphysical and count the 2 real parameters.
- ☐ Compute measurement probabilities in the X and Y bases, not just Z.
- ☐ Run the live cell and explain why $\ket+$ and $\ket-$ look identical in Z but opposite in X.
- ☐ Prepare a target state from $\ket0$ by choosing $\theta$ and $\varphi$.
- ☐ Explain why identical Z histograms don't certify identical states.
