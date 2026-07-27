# The qubit: state vectors & the Born rule

Time to make Rule 1 and Rule 3 fully precise for the object you'll spend your career manipulating. By the end of this lesson you will take any single-qubit state, compute its complete measurement statistics in any basis by hand and in NumPy, and normalize, compare, and prepare states on demand. This is the lesson where six weeks of mathematics cashes out — expect déjà vu in every paragraph, because you've secretly done all of it.

## 1. The state, precisely

A **qubit** is any quantum system with two perfectly distinguishable configurations — a superconducting circuit's two lowest energy levels, an ion's two electronic states, a photon's two polarizations. Physics packages them identically:

$$\ket\psi = \alpha\ket0 + \beta\ket1 = \begin{pmatrix}\alpha\\\beta\end{pmatrix}, \qquad \alpha, \beta \in \mathbb{C}, \qquad |\alpha|^2 + |\beta|^2 = 1$$

Vocabulary, now official: $\alpha, \beta$ are **amplitudes**; $\{\ket0, \ket1\}$ is the **computational basis**; the normalization condition is Rule 3's bookkeeping (probabilities will sum to 1). One more freedom you've already met: states differing by a **global phase** $e^{i\gamma}$ are physically identical — so the state space is slightly smaller than "all unit vectors in $\mathbb{C}^2$." Counting real parameters: 4 (two complex) − 1 (normalization) − 1 (global phase) = **2 real parameters** per qubit state. Hold that number; next lesson it becomes two literal angles on a sphere.

## 2. The Born rule, precisely

Measuring $\ket\psi$ in the computational basis:

$$p(0) = |\braket{0}{\psi}|^2 = |\alpha|^2 \qquad p(1) = |\braket{1}{\psi}|^2 = |\beta|^2$$

and the state collapses to the observed basis vector. Measuring in *any* orthonormal basis $\{\ket{b_0}, \ket{b_1}\}$:

$$p(b_k) = |\braket{b_k}{\psi}|^2$$

— the overlap-squared machine from the Dirac lesson, now wearing its physics badge. All the hand skills transfer verbatim: conjugate the bra, expand by linearity, collapse $\braket{i}{j}$, modulus-square at the end (never earlier).

@@diagram:qubit-born|The qubit pipeline: complex amplitudes → |·|² → probabilities → sampled outcome + collapse. Phases survive the arithmetic until the squaring — that's where quantum information hides.

**The three bases you must own** (X, Y, Z eigenbases — the eigen lesson's trio, now with measurement meaning):

| Basis | Vectors | What it "asks" | Blind to |
|---|---|---|---|
| Z (computational) | $\ket0, \ket1$ | population: how much 0 vs 1? | all relative phase |
| X (Hadamard) | $\ket\pm = \tfrac{\ket0 \pm \ket1}{\sqrt2}$ | real part of the phase relationship | ±i phases |
| Y | $\ket{\pm i} = \tfrac{\ket0 \pm i\ket1}{\sqrt2}$ | imaginary part of the phase relationship | ± phases |

No single basis sees everything; the three together determine the state completely (that's **state tomography**, and you'll do a baby version in the exercises).

## 3. Worked fluency — one state, interrogated three ways

Take $\ket\psi = \tfrac{1}{\sqrt2}\ket0 + \tfrac{1-i}{2}\ket1$. First, *is it legal?* $|\alpha|^2 = \tfrac12$; $|\beta|^2 = \tfrac{|1-i|^2}{4} = \tfrac{2}{4} = \tfrac12$. Sum 1 ✓.

**Z basis**: $p(0) = p(1) = \tfrac12$. (A coin — but which coin? Z can't say more.)

**X basis**: $\braket{+}{\psi} = \tfrac{1}{\sqrt2}\left(\tfrac{1}{\sqrt2} + \tfrac{1-i}{2}\right) = \tfrac12 + \tfrac{1-i}{2\sqrt2}$. Compute the modulus-squared (patiently — real part $\tfrac12 + \tfrac{1}{2\sqrt2} \approx 0.854$, imaginary $-\tfrac{1}{2\sqrt2} \approx -0.354$): $p(+) \approx 0.854^2\cdot$… let's do it exactly:

$$p(+) = \left|\tfrac12 + \tfrac{1}{2\sqrt2} - \tfrac{i}{2\sqrt2}\right|^2 = \left(\tfrac12 + \tfrac{1}{2\sqrt2}\right)^2 + \tfrac{1}{8} = \tfrac14 + \tfrac{1}{2\sqrt2} + \tfrac18 + \tfrac18 = \tfrac12 + \tfrac{1}{2\sqrt2} \approx 0.8536$$

**Y basis**: $\braket{+i}{\psi} = \tfrac{1}{\sqrt2}\left(\tfrac{1}{\sqrt2} + (-i)\tfrac{1-i}{2}\right) = \tfrac12 + \tfrac{-i-1}{2\sqrt2}$, giving $p(+i) = \left(\tfrac12 - \tfrac{1}{2\sqrt2}\right)^2 + \tfrac18 = \tfrac12 - \tfrac{1}{2\sqrt2} \approx 0.1464$.

```python
import numpy as np
psi = np.array([1/np.sqrt(2), (1-1j)/2])
plus  = np.array([1, 1])/np.sqrt(2)
plusi = np.array([1, 1j])/np.sqrt(2)
print(abs(np.vdot(psi, psi)))              # 1.0 — normalized
print(abs(np.vdot(plus,  psi))**2)         # 0.8535533905932737
print(abs(np.vdot(plusi, psi))**2)         # 0.14644660940672627
```

Three bases, three different answers from one state — and the NumPy referee confirms every hand computation. This *interrogate-in-three-bases* drill is the single-qubit professional's basic kata; the numbers $\left(\tfrac12 \pm \tfrac{1}{2\sqrt2}\right)$ you'll recognize on sight within a month.

## 4. Preparing states — from statistics to amplitudes and back

The inverse skill: given target statistics, construct the state. Every real qubit is born as $\ket0$ (hardware resets to ground state); preparation = rotate from there.

- Target $p(1) = p$: use $\ket\psi = \sqrt{1-p}\,\ket0 + \sqrt{p}\,\ket1$ — or with the Bloch parametrization, $\theta = 2\arcsin\sqrt{p}$ (trig lesson's formula, about to become a literal gate argument `ry(theta)`).
- Target *phases* too: append the relative phase explicitly, $\ket\psi = \sqrt{1-p}\,\ket0 + e^{i\varphi}\sqrt{p}\,\ket1$. Two targets ($p, \varphi$), two parameters ($\theta, \varphi$) — the counting from Section 1 closing its loop.

Non-uniqueness worth internalizing: infinitely many amplitude pairs give the same Z statistics (any $\varphi$); the state is only pinned by statistics in *multiple* bases. "Same histogram" never means "same state" — say it before your first debugging session, not after.

## Worked example — certifying a state-preparation routine

*Your team's firmware claims to prepare $\ket{\psi_{\text{target}}} = \tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1$. QA hands you Z-basis data: 7,481 zeros / 2,519 ones in 10,000 shots; and Y-basis data: 9,988 "+i" / 12 "−i" outcomes wait — 8,995 / 1,005. Verify or reject.*

**Predictions.** Z: $p(0) = \tfrac34$, $p(1) = \tfrac14$. Y: $\braket{+i}{\psi} = \tfrac{1}{\sqrt2}\left(\tfrac{\sqrt3}{2} + (-i)\cdot\tfrac{i}{2}\right) = \tfrac{1}{\sqrt2}\cdot\tfrac{\sqrt3 + 1}{2}$, so $p(+i) = \tfrac{(\sqrt3+1)^2}{8} = \tfrac{4 + 2\sqrt3}{8} \approx 0.933$.

**Compare with error bars** (Module 3, always). Z: $\hat p(0) = 0.7481 \pm 2\sqrt{\tfrac{0.75\cdot0.25}{10^4}} = 0.7481 \pm 0.0087$ — target 0.75 inside ✓. Y: $\hat p(+i) = 0.8995 \pm 0.0060$ — target 0.933 is **5.6σ away** ✗.

**Verdict**: reject — Z statistics fine, Y statistics wrong ⇒ the *magnitude* of $\beta$ is right but its **phase is off** (the state prepared is consistent with $\varphi \approx 68°$ rather than 90° — solve $\tfrac12 + \tfrac{\sqrt3}{4}\cos(\varphi-90°)\ldots$ or numerically). Diagnosis "phase miscalibration in the second rotation" goes in the ticket. Moral: **Z-basis QA alone certifies nothing about phase** — a lesson entire teams have re-learned expensively, and you now get for free.

## Gotchas

- **Probabilities from amplitudes without modulus.** $\beta = \tfrac{1-i}{2}$ gives $p(1) = \tfrac12$, not $\beta^2 = \tfrac{-i}{2}$. The `abs()**2` reflex must be unconditional.
- **Normalizing with $\alpha^2 + \beta^2$.** That's the real-only shortcut; complex states need $|\alpha|^2 + |\beta|^2$. (The shortcut failing silently on real test data and exploding on complex production data is a classic.)
- **"Same histogram ⇒ same state."** One basis pins one basis. States are certified by multi-basis statistics (or trusted preparation + unitaries).
- **Global vs relative phase, applied.** $e^{i\gamma}\ket\psi$ = same state (unmeasurable, drop it); $\alpha\ket0 + e^{i\varphi}\beta\ket1$ vs $\alpha\ket0 + \beta\ket1$ = different states (X/Y bases see it). Confusing the two directions wastes debugging days in both.
- **Forgetting collapse in multi-measurement reasoning.** Statistics formulas apply to *fresh copies*. Measuring the same qubit twice in a row gives correlated results (second is deterministic), not two independent samples.
- **Amplitude sign errors when preparing.** $\sqrt{p}$ choices: any phase works for matching Z statistics, but downstream interference cares. Prepare deliberately (fix $\varphi$), don't let sign conventions happen to you.

## Scenario — the 3 a.m. hardware pager (statistics as diagnosis)

An automated calibration pipeline pages: "qubit 7 state-prep fidelity degraded." The logs show prepare-$\ket+$-measure-X experiments: last week 98.9% "+", tonight 93.1%. A junior response: "the qubit is dying, escalate to fab." Your response, using this lesson: check the companion datasets. Prepare-$\ket0$-measure-Z: still 99.2% (so reset and readout are fine). Prepare-$\ket+$-measure-Z: still 50.1/49.9 (so amplitude magnitudes are fine). Only the X-basis coherence dropped ⇒ the relative phase is wandering between preparation and measurement ⇒ classic **dephasing increase** — probably a noisy control line or a drifted calibration delay, not a dying qubit. You re-run the phase calibration; fidelity returns to 98.8%; fab keeps sleeping. The entire diagnosis was "which basis' statistics moved?" — Born-rule literacy converting directly into uptime.

### ▶ Run it live

Prepare a biased qubit and measure it, using this course's built-in `QuantumCircuit` simulator (no install needed):

```run
# expect: '0'
qc = QuantumCircuit(1)
qc.ry(2 * 0.6435, 0)          # aim for p(1) ~ 0.36
print("exact probabilities:", qc.probabilities())
print("1000 shots:", qc.sample(1000, seed=1))
```

## Key points

- Qubit state: $\alpha\ket0 + \beta\ket1$, complex amplitudes, $|\alpha|^2 + |\beta|^2 = 1$; global phase unphysical ⇒ 2 real parameters.
- Born rule in any orthonormal basis: $p(b) = |\braket{b}{\psi}|^2$, then collapse to $\ket b$; compute via conjugate-expand-collapse-square.
- Z sees populations; X and Y see the two components of relative phase; three bases = complete information (tomography), one basis = almost nothing.
- Prepare by rotation from $\ket0$: $\theta = 2\arcsin\sqrt{p}$ sets probability, $\varphi$ sets phase — two dials, two parameters.
- Identical Z histograms do NOT imply identical states; certification requires multiple bases and error bars.
- Basis-resolved statistics are a *diagnostic instrument*: which basis moved tells you what physical parameter drifted.

## Check yourself

```quiz
{"q":"|ψ⟩ = (3/5)|0⟩ + (4i/5)|1⟩. What are p(0) and p(1), and is the state normalized?","options":["p(0)=0.36, p(1)=0.64, normalized","p(0)=0.6, p(1)=0.8i — not normalized","p(0)=0.36, p(1)=−0.64 — invalid state","p(0)=0.36, p(1)=0.64 but normalization can't hold with complex amplitudes"],"answer":0,"why":"|3/5|² = 0.36, |4i/5|² = 16/25 = 0.64 (the i vanishes under modulus); 0.36+0.64 = 1. Complex amplitudes normalize exactly like real ones — via modulus-squares."}
```

```quiz
{"q":"Two preparation routines both produce perfect 50/50 Z-basis histograms. What can you conclude about the states they prepare?","options":["They prepare the same state |+⟩","They prepare states with |α|² = |β|² = 1/2 — but possibly different relative phases, hence possibly different states","They prepare |0⟩ and |1⟩ alternately","Nothing at all can be concluded"],"answer":1,"why":"Z statistics pin only the amplitude magnitudes. |+⟩, |−⟩, |+i⟩, and infinitely many phase-siblings all give 50/50 in Z. X- and Y-basis data would be needed to identify the states."}
```

## Exercises

**Exercise 1 — the tomography drill.** For the state $\ket\psi = \tfrac{1}{2}\ket0 + \tfrac{\sqrt3}{2}e^{i\pi/3}\ket1$: (a) verify normalization; (b) compute Z, X, and Y basis probabilities by hand (expand carefully — the $e^{i\pi/3} = \tfrac12 + \tfrac{\sqrt3}{2}i$ substitution helps); (c) verify all three pairs in NumPy; (d) confirm the three pairs suffice to reconstruct $\theta, \varphi$ and do so.

````solution
(a) $\tfrac14 + \tfrac34 = 1$ ✓ (phase modulus 1).

(b) **Z**: $p(0) = \tfrac14$, $p(1) = \tfrac34$.
**X**: $\braket{+}{\psi} = \tfrac{1}{\sqrt2}\left(\tfrac12 + \tfrac{\sqrt3}{2}(\tfrac12 + \tfrac{\sqrt3}{2}i)\right) = \tfrac{1}{\sqrt2}\left(\tfrac12 + \tfrac{\sqrt3}{4} + \tfrac{3}{4}i\right)$. Modulus²: $\tfrac12\left[\left(\tfrac12+\tfrac{\sqrt3}{4}\right)^2 + \tfrac{9}{16}\right] = \tfrac12\left[\tfrac14 + \tfrac{\sqrt3}{4} + \tfrac{3}{16} + \tfrac{9}{16}\right] = \tfrac12 + \tfrac{\sqrt3}{8} \approx 0.7165$. So $p(+) \approx 0.7165$, $p(-) \approx 0.2835$.
**Y**: $\braket{+i}{\psi} = \tfrac{1}{\sqrt2}\left(\tfrac12 - i\cdot\tfrac{\sqrt3}{2}e^{i\pi/3}\right) = \tfrac{1}{\sqrt2}\left(\tfrac12 + \tfrac{\sqrt3}{2}(\tfrac{\sqrt3}{2} - \tfrac{i}{2})\right)$ (using $-ie^{i\pi/3} = e^{-i\pi/6}$) $= \tfrac{1}{\sqrt2}\left(\tfrac12 + \tfrac34 - \tfrac{\sqrt3}{4}i\right)$: modulus² $= \tfrac12\left[\tfrac{25}{16} + \tfrac{3}{16}\right] = \tfrac{28}{32} = \tfrac{7}{8} = 0.875$. So $p(+i) = 0.875$, $p(-i) = 0.125$.

(c)
```python
import numpy as np
psi = np.array([0.5, (np.sqrt(3)/2)*np.exp(1j*np.pi/3)])
for name, b in [("Z0",[1,0]), ("X+",[1/np.sqrt(2),1/np.sqrt(2)]), ("Y+i",[1/np.sqrt(2),1j/np.sqrt(2)])]:
    print(name, round(abs(np.vdot(np.array(b), psi))**2, 4))
# Z0 0.25   X+ 0.7165   Y+i 0.875
```

(d) Reconstruction: $\theta = 2\arccos\sqrt{p(0)} = 2\arccos(0.5) = \tfrac{2\pi}{3}$ ✓ (matches $|\beta| = \sin\tfrac\theta2 = \tfrac{\sqrt3}{2}$). Phase from X and Y: $p(+) = \tfrac12(1 + \sin\theta\cos\varphi)$ and $p(+i) = \tfrac12(1 + \sin\theta\sin\varphi)$ (derivable, or trust and verify): $\cos\varphi = \tfrac{2(0.7165)-1}{\sin(2\pi/3)} = 0.5$, $\sin\varphi = \tfrac{2(0.875)-1}{0.866} = 0.866$ → $\varphi = \pi/3$ ✓✓. Three histograms in, two angles out, state identified: you have performed single-qubit state tomography with your bare hands.
````

**Exercise 2 — the preparation spec.** Write a function `prep_amplitudes(p1, phi)` returning the state array $\sqrt{1-p_1}\ket0 + e^{i\varphi}\sqrt{p_1}\ket1$, plus `predict(psi)` returning the dict of all six basis probabilities (Z/X/Y). Then: find (numerically, by sweeping φ) which phase makes $p(+)$ maximal for fixed $p_1 = 0.5$, and explain why the answer had to be φ = 0.

````solution
```python
import numpy as np

def prep_amplitudes(p1, phi):
    return np.array([np.sqrt(1-p1), np.exp(1j*phi)*np.sqrt(p1)])

BASES = {
    "0": [1,0], "1": [0,1],
    "+": [1/np.sqrt(2), 1/np.sqrt(2)], "-": [1/np.sqrt(2), -1/np.sqrt(2)],
    "+i": [1/np.sqrt(2), 1j/np.sqrt(2)], "-i": [1/np.sqrt(2), -1j/np.sqrt(2)],
}
def predict(psi):
    return {k: round(abs(np.vdot(np.array(v), psi))**2, 4) for k, v in BASES.items()}

phis = np.linspace(0, 2*np.pi, 721)
pplus = [predict(prep_amplitudes(0.5, f))["+"] for f in phis]
best = phis[int(np.argmax(pplus))]
print(best, max(pplus))          # ~0.0 (or 2π), 1.0
```

Why it had to be φ = 0: with $p_1 = \tfrac12$ the state is $\tfrac{1}{\sqrt2}(\ket0 + e^{i\varphi}\ket1)$, and $p(+) = |\tfrac12(1 + e^{i\varphi})|^2 = \cos^2(\varphi/2)$ — the interference formula (Euler lesson), maximized exactly when the two amplitudes are *in phase*. At φ = 0 the state IS $\ket+$, overlap 1. The sweep-and-argmax pattern you just used — vary a preparation parameter, maximize a measured probability — is, one module early, the beating heart of variational algorithms (Module 9 just adds a molecule).
````

## Practice questions

1. Legal or not: $(\tfrac35, \tfrac45 i)$; $(\tfrac12, \tfrac12)$; $(\tfrac{1+i}{2}, \tfrac{1-i}{2})$? Fix any illegal one by normalizing.
2. For $\ket\psi = \tfrac{1}{\sqrt2}(\ket0 - \ket1)$, give the exact outcome statistics in all three bases (recognize the state first).
3. Show that $\ket\psi$ and $e^{i\gamma}\ket\psi$ give identical Born-rule probabilities in every basis (one line).
4. A state gives Z-statistics 80/20 and X-statistics 50/50. What is $|\beta|$, and what does the X result say about φ? (Careful: use $p(+) = \tfrac12(1+\sin\theta\cos\varphi)$.)
5. Why does hardware prepare all qubits as $\ket0$ and rotate, rather than preparing arbitrary states directly?
6. After measuring "1" on $\ket\psi = \sqrt{0.99}\ket0 + 0.1\ket1$, a colleague says "we got the unlikely branch — remeasure to be sure." What will remeasurement show, and why is the suggestion confused?
7. **Design question:** design the acceptance test suite for a state-preparation API `prepare(theta, phi)` — which (θ, φ) points you'd test, which bases you'd measure each in, shot counts per test (Module 3 sizing for ±1% at 95%), and the pass thresholds — such that any single-parameter miscalibration is caught. Justify the corner cases.

````solution
1. Legal ($0.36+0.64=1$); illegal ($\tfrac14+\tfrac14 = \tfrac12$ — normalize by $\sqrt{1/2}$: $(\tfrac{1}{\sqrt2},\tfrac{1}{\sqrt2})$); legal ($\tfrac12 + \tfrac12 = 1$).
2. It's $\ket-$: Z → 50/50; X → "−" with certainty; Y → 50/50 ($|\braket{+i}{-}|^2 = \tfrac12$).
3. $|\braket{b}{e^{i\gamma}\psi}|^2 = |e^{i\gamma}|^2|\braket{b}{\psi}|^2 = |\braket{b}{\psi}|^2$.
4. $|\beta| = \sqrt{0.2} \approx 0.447$ ($\theta \approx 0.927$); X at 50/50 means $\sin\theta\cos\varphi = 0$, and $\sin\theta \neq 0$ here ⇒ $\cos\varphi = 0$ ⇒ $\varphi = \pm\pi/2$ (Y-basis measurement would break the tie).
5. Reset-to-ground is a physical process hardware does reliably (relaxation/active reset); arbitrary states have no direct physical handle — but unitaries (calibrated pulses) are exactly the controllable operations, so "known start + rotation" is both sufficient and engineerable.
6. Remeasurement gives "1" with certainty — collapse made $\ket1$ the state; it confirms the *record*, not the preparation. To test preparation statistics you need fresh copies. The confusion is treating one collapsed sample as re-sampleable evidence.
7. Model suite: poles $\theta \in \{0, \pi\}$ (any φ) measured in Z — catches amplitude-scale errors where phase is undefined; equator $\theta = \tfrac\pi2$ with $\varphi \in \{0, \tfrac\pi2, \pi, \tfrac{3\pi}{2}\}$ measured in X AND Y — the four cardinal phases catch sign errors, axis swaps, and phase offsets (an error of Δφ shows maximally at the equator, invisibly at poles); one generic interior point $(\theta, \varphi) = (2\pi/5, 1.1)$ in all three bases — catches nonlinear miscalibrations that conspire to pass the cardinal points. Shots: ±1% needs $\approx 10^4$ per basis per point (worst-case sizing) — 4 poles-tests ×1 basis + 4 equator ×2 + 1 generic ×3 = 15 histograms ≈ 150k shots; thresholds: |measured − predicted| < max(0.01, 2SE). The justification pattern (poles for amplitude, equator cardinals for phase, one generic for conspiracies) is real test-engineering: cover each parameter where its derivative is largest.
````
