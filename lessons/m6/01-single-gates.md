# The single-qubit gate set: X, Y, Z, H, S, T & rotations

Professionals don't look gates up — they *know* them: matrix, Bloch action, eigenbasis, and the algebra connecting them. This lesson is the complete single-qubit vocabulary plus the identities that make circuits simplifiable by hand. It's also your first lesson where every concept comes with its Qiskit spelling, because from here the course walks on two legs: math and code.

## 1. The Pauli gates — X, Y, Z

The three 180° rotations about the coordinate axes (Hermitian AND unitary — both gate and observable):

$$X = \begin{pmatrix}0&1\\1&0\end{pmatrix} \qquad Y = \begin{pmatrix}0&-i\\i&0\end{pmatrix} \qquad Z = \begin{pmatrix}1&0\\0&-1\end{pmatrix}$$

| Gate | Action on $\alpha\ket0 + \beta\ket1$ | Bloch | Eigenbasis | Nickname |
|---|---|---|---|---|
| X | $\beta\ket0 + \alpha\ket1$ | 180° about x | $\ket\pm$ | bit flip (quantum NOT) |
| Y | $-i\beta\ket0 + i\alpha\ket1$ | 180° about y | $\ket{\pm i}$ | bit *and* phase flip |
| Z | $\alpha\ket0 - \beta\ket1$ | 180° about z | $\ket0,\ket1$ | phase flip |
| I | unchanged | none | everything | identity |

The algebra that runs error correction and much else (verify any by 2×2 multiplication — you have; the eigen lesson computed $XZ = -ZX$):

$$X^2 = Y^2 = Z^2 = I \qquad XY = iZ \;(\text{cyclically: } YZ = iX,\; ZX = iY) \qquad \text{any two distinct Paulis anticommute}$$

Why Paulis dominate the field's discourse: they're a *basis for all 2×2 matrices* (any single-qubit operator $= aI + bX + cY + dZ$), errors are modeled as random Paulis (Module 9), observables are decomposed into Paulis (VQE measures Pauli sums), and stabilizer codes speak pure Pauli (Module 10). Learn them like multiplication tables.

## 2. Hadamard — the superposition engine

$$H = \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix} \qquad H\ket0 = \ket+,\; H\ket1 = \ket-,\; H\ket\pm = \ket{0/1}, \qquad H^2 = I$$

Bloch: 180° about the diagonal $(x{+}z)/\sqrt2$ axis — the x↔z axis exchanger, hence THE basis-change gate: Z-basis measurements become X-basis measurements when preceded by H. The conjugation identities you'll use weekly (all provable by "H swaps the x and z axes, reverses y"):

$$HZH = X \qquad HXH = Z \qquad HYH = -Y$$

## 3. Phase gates — S, T, and the continuous family

Diagonal gates writing relative phase (unitary, NOT Hermitian — pure evolvers):

$$S = \begin{pmatrix}1&0\\0&i\end{pmatrix} \quad T = \begin{pmatrix}1&0\\0&e^{i\pi/4}\end{pmatrix} \quad P(\gamma) = \begin{pmatrix}1&0\\0&e^{i\gamma}\end{pmatrix}$$

The staircase: $T^2 = S$, $S^2 = Z$, $Z^2 = I$ — eighth-turn, quarter-turn, half-turn about z. Daggers ($S^\dagger$ = `sdg`, $T^\dagger$ = `tdg`) turn the other way.

**Why T is famous beyond its size**: fault-tolerant hardware (Module 10) implements Clifford gates (H, S, CNOT, Paulis) cheaply but T *expensively* (magic-state distillation) — so "T-count" is the standard cost metric for fault-tolerant algorithms, and compilers fight to minimize it. A gate's importance ≠ its matrix's complexity.

**Clifford vs non-Clifford — the line that matters twice**: Cliffords (H, S, CNOT + Paulis) map Pauli operators to Pauli operators under conjugation. Consequence (Gottesman–Knill theorem): **Clifford-only circuits are efficiently simulable classically** — no quantum advantage without non-Clifford gates (T being the standard choice). T is simultaneously the expensive gate AND the magic ingredient. Remember this pairing; interviewers love it and Module 10 depends on it.

## 4. Rotation gates — the continuous dials

Arbitrary-angle rotations about each axis ($e^{-i\gamma P/2}$ with Pauli generator $P$ — Schrödinger's bridge, concretely):

$$R_x(\gamma) = \begin{pmatrix}\cos\tfrac\gamma2 & -i\sin\tfrac\gamma2\\ -i\sin\tfrac\gamma2 & \cos\tfrac\gamma2\end{pmatrix} \quad R_y(\gamma) = \begin{pmatrix}\cos\tfrac\gamma2 & -\sin\tfrac\gamma2\\ \sin\tfrac\gamma2 & \cos\tfrac\gamma2\end{pmatrix} \quad R_z(\gamma) = \begin{pmatrix}e^{-i\gamma/2}&0\\0&e^{i\gamma/2}\end{pmatrix}$$

Half-angles throughout (Bloch's angle-doubling, from the other side). Special cases: $R_y(\pi) \sim Y$, $R_z(\pi) \sim Z$, etc. — "~" meaning up-to-global-phase, with the controlled-gate fine print from last lesson.

@@diagram:gate-rotations|The gate zoo on the sphere: Paulis are 180° axis flips, H is the diagonal-axis flip that swaps x↔z, S/T are z-turns, R-gates dial any angle. Every unitary is some rotation.

**Universality fact**: any single-qubit unitary decomposes as $R_z(\alpha)R_y(\beta)R_z(\gamma)$ (three Euler angles, up to global phase) — Qiskit's generic `U(θ, φ, λ)` gate is essentially this. Hardware typically implements only $R_z$ (free! — done in software by reframing) plus one calibrated pulse (e.g. $\sqrt X = R_x(\pi/2)$); the transpiler (Module 7) rewrites your fancy gates into exactly those. When you see `['rz', 'sx', 'x']` as a device's basis gates, you now know the whole story.

## 5. The Qiskit spellings

```python
from qiskit import QuantumCircuit
import numpy as np

qc = QuantumCircuit(1)
qc.x(0); qc.y(0); qc.z(0)          # Paulis
qc.h(0)                            # Hadamard
qc.s(0); qc.sdg(0)                 # S, S†
qc.t(0); qc.tdg(0)                 # T, T†
qc.p(np.pi/5, 0)                   # P(γ) phase gate
qc.rx(np.pi/2, 0); qc.ry(1.2, 0); qc.rz(0.7, 0)   # rotations (angle first!)
print(qc.draw())

from qiskit.quantum_info import Operator
print(np.round(Operator(qc).data, 3))   # the whole sequence as ONE matrix
```

`Operator(qc)` composes the circuit into its single unitary — your NumPy referee, built into the framework. Verify one identity right now and forever trust the tool:

```python
qc1 = QuantumCircuit(1); qc1.h(0); qc1.z(0); qc1.h(0)
qc2 = QuantumCircuit(1); qc2.x(0)
print(Operator(qc1).equiv(Operator(qc2)))     # True — HZH = X, framework-certified
```

(`equiv` compares up to global phase — the physically right comparison, and now you know why it must.)

## Worked example — compiling by hand (what transpilers do)

*Target: the sequence H·T·H·T·H (right-to-left on $\ket0$) appears in a teammate's circuit. Simplify it, predict the output statistics, verify.*

**Simplify with identities.** Group as $H\,T\,(H\,T\,H)$. The inner $HTH$: T is $P(\pi/4)$; conjugating a z-rotation by H gives the *x-rotation* of the same angle ($H R_z H = R_x$ — axis swap!): $HTH \sim R_x(\pi/4)$. So the sequence $\sim H\,T\,R_x(\pi/4)$… no further free collapse — fine, that's realistic: not everything simplifies. Pivot to the professional's second tool: just *compute* the composite.

**Compute.** $U = H T H T H$. Working right-to-left on $\ket0$: $H\ket0 = \ket+$; $T\ket+ = \tfrac{1}{\sqrt2}(\ket0 + e^{i\pi/4}\ket1)$; apply master formula for the next H: amplitudes $\tfrac12(1 + e^{i\pi/4})$ and $\tfrac12(1 - e^{i\pi/4})$; then T writes another $e^{i\pi/4}$ on the $\ket1$ part; final H interferes again. Rather than heroics, the referee:

```python
from qiskit.quantum_info import Statevector
qc = QuantumCircuit(1)
qc.h(0); qc.t(0); qc.h(0); qc.t(0); qc.h(0)
sv = Statevector.from_label("0").evolve(qc)
print(sv.probabilities())        # [0.85355339 0.14644661]
```

$p(0) = 0.8536 = \tfrac12 + \tfrac{1}{2\sqrt2} = \cos^2(\pi/8)$ — the 22.5° number from the Hadamard eigen-analysis, resurfacing (H·T·H·T·H is a rotation by π/4 about a tilted axis; its angles live in eighth-turns). **The workflow to keep: identities first for cheap wins, referee for the rest, recognize the recurring constants.** This H-T alternation isn't artificial: H and T together generate a dense cover of ALL single-qubit unitaries (Solovay–Kitaev theorem) — these two gates are, in principle, your entire single-qubit instruction set.

## Gotchas

- **Angle-first argument order.** Qiskit rotations: `qc.rx(angle, qubit)`. Swapping them (`qc.rx(0, np.pi)`) errors or silently targets the wrong qubit index. (Yes, everyone does it once.)
- **Y's phases.** $Y\ket0 = i\ket1$, not $\ket1$. The i's matter the moment anything is controlled or interfered. When in doubt, write the matrix, don't recall the slogan.
- **S vs S† direction.** A quarter-turn the wrong way puts you at $\ket{-i}$ instead of $\ket{+i}$ — Y-statistics flip. If a Bloch trace turns the wrong way around the equator, suspect a missing `dg`.
- **P(γ) vs Rz(γ), again.** Same solo physics, different global phase, DIFFERENT controlled behavior (and Qiskit's `cp` vs `crz` are genuinely different gates). Choose by what the *controlled* version must do.
- **"~" sloppiness in identities.** $HZH = X$ is exact; $R_y(\pi) = Y$ is false as written ($R_y(\pi) = -iY$). Writing exact equalities with hidden global phases breaks controlled-circuit derivations. Track the "up to phase" qualifier like a units annotation.
- **Assuming every gate is its own inverse.** True for H and Paulis ($U^2 = I$), false for S, T, rotations. Undoing a circuit means daggering each gate AND reversing order — `qc.inverse()` exists precisely because humans botch this.

## Scenario — the basis-gate budget review

Your team targets a device whose basis gates are `['rz', 'sx', 'x']` (a real IBM Heron signature). A colleague's algorithm uses 40 T gates, 20 H's, 15 S's, and asks "which will hurt?" Your analysis, pure this-lesson: $R_z$-family gates (T, S, Z, and $R_z$ itself) are **free** — implemented as software frame changes, zero error, zero time. H is not native: it transpiles to $R_z\cdot\sqrt X\cdot R_z$ (one physical pulse each) — 20 H's ≈ 20 pulses. So the "40 T gates" that sounded expensive cost *nothing* on this hardware today, and the innocuous H's dominate the error budget. Plot twist you also supply: **on a fault-tolerant machine the table flips** — Cliffords (H, S) become cheap, T becomes the costly one. Same circuit, opposite bottlenecks, two eras of hardware. Knowing which regime you're optimizing for — that's the difference between a gate user and a quantum engineer.

## Key points

- Paulis: bit flip (X), phase flip (Z), both (Y); $P^2 = I$; distinct Paulis anticommute; they form the basis of operators, errors, observables, and codes.
- H exchanges x↔z: creates/uncreates superposition, converts basis for measurement, and conjugates Z↔X ($HZH = X$).
- Phase staircase $T \to S \to Z$ (eighth/quarter/half z-turns); Cliffords (H, S, CNOT) are classically simulable — T is both the fault-tolerance cost metric and the ingredient of quantum advantage.
- Rotations $R_{x,y,z}(\gamma)$ with half-angle matrices; any unitary = three Euler rotations; hardware natively speaks `rz` (free, software) + `sx` + `x`, and transpilers rewrite everything into it.
- Qiskit: gates are lowercase methods, angles first; `Operator(qc)` composes to one matrix; `.equiv()` compares up to global phase.
- Workflow: simplify by identity where cheap, verify by referee always, and recognize the constants ($\cos^2\tfrac\pi8$, $\tfrac{1}{\sqrt2}$) that keep resurfacing.

## Check yourself

```quiz
{"q":"Which sequence equals X (up to nothing — exactly)?","options":["S S","H Z H","T T T T","Z H Z"],"answer":1,"why":"HZH = X exactly (conjugation by the x↔z swapper). SS = Z, TTTT = S² = Z — z-family gates can't make a bit flip alone."}
```

```quiz
{"q":"A device lists basis gates ['rz','sx','x']. Which statement is right about your circuit's 25 T gates and 10 H gates?","options":["The T gates dominate the error budget — they're non-Clifford","T gates compile to rz (software, error-free); the 10 H's each need a physical sx pulse and dominate the hardware error today","Both cost the same","Neither can run on such a limited device"],"answer":1,"why":"On today's superconducting hardware, z-rotations are virtual (frame updates). The fault-tolerant era flips this: T becomes expensive (magic states), Cliffords cheap. Know your regime."}
```

## Exercises

**Exercise 1 — the identity workout.** Prove by explicit 2×2 multiplication (hand first, `Operator` second): (a) $S^\dagger\,X\,S = Y$; (b) $T\,X\,T^\dagger \ne X$ but $T\,Z\,T^\dagger = Z$; (c) explain (b) geometrically in one sentence each.

````solution
(a) $S^\dagger X S = \begin{pmatrix}1&0\\0&-i\end{pmatrix}\begin{pmatrix}0&1\\1&0\end{pmatrix}\begin{pmatrix}1&0\\0&i\end{pmatrix} = \begin{pmatrix}1&0\\0&-i\end{pmatrix}\begin{pmatrix}0&i\\1&0\end{pmatrix} = \begin{pmatrix}0&i\\-i&0\end{pmatrix}$… that's $-Y$. Check conventions: $Y = \begin{pmatrix}0&-i\\i&0\end{pmatrix}$, so we got $-Y$ — and here's the intended lesson upgraded: conjugation by S (a +90° z-turn) rotates the x-axis to the y-axis, but the ± sign depends on rotation direction: $S X S^\dagger = Y$ while $S^\dagger X S = -Y$. Directions matter; the exercise's claim as stated was the trap. (Verify both orientations with `Operator`.)

(b) T is a z-rotation: it *commutes* with Z (both diagonal): $TZT^\dagger = Z$ ✓. It does not commute with X: $TXT^\dagger$ = x-axis rotated 45° toward y $= \tfrac{X + Y}{\sqrt2}$ (compute: entries $e^{\pm i\pi/4}$ off-diagonal).

(c) Geometry: conjugating an axis-flip by a rotation *rotates the flip's axis* — z-turns leave the z-axis (hence Z) fixed and swing x toward y by the turn angle. One picture, all conjugation identities: $UPU^\dagger$ = "P's axis, moved by U." That sentence is half of Module 10's stabilizer formalism, four modules early.

```python
from qiskit.quantum_info import Operator
from qiskit import QuantumCircuit
import numpy as np
def U(build):
    qc = QuantumCircuit(1); build(qc); return Operator(qc).data
SXSdg = U(lambda q: (q.sdg(0), q.x(0), q.s(0)))
print(np.round(SXSdg, 3))    # [[0,+i],[-i,0]] = -Y  (with this application order)
```
````

**Exercise 2 — build the universal gate.** (a) Using the $R_z(\alpha)R_y(\beta)R_z(\gamma)$ decomposition, find angles implementing H (up to global phase) — verify with matrices. (b) Now express the same H in the device basis `['rz','sx','x']` given $\sqrt X = R_x(\pi/2)$ up to phase, using the identity $R_y(\beta) \sim R_z(-\tfrac\pi2)\,R_x(\beta)\,R_z(\tfrac\pi2)$. Count physical pulses. (c) What did you just re-derive?

````solution
(a) H maps z→x, x→z, y→−y. Euler guess: $R_z(\pi)R_y(\pi/2)$: check on Bloch — $R_y(\pi/2)$ takes z→x ✓ and x→−z; then $R_z(\pi)$ fixes z-ish components… verify by matrix:
```python
import numpy as np
Rz = lambda g: np.diag([np.exp(-1j*g/2), np.exp(1j*g/2)])
Ry = lambda g: np.array([[np.cos(g/2), -np.sin(g/2)],[np.sin(g/2), np.cos(g/2)]])
H = np.array([[1,1],[1,-1]])/np.sqrt(2)
cand = Rz(np.pi) @ Ry(np.pi/2)
print(np.round(cand / cand[0,0] * H[0,0], 6))   # equals H up to global phase ✓
```
So $H \sim R_z(\pi)R_y(\pi/2)$ (γ = 0 — two Euler angles suffice for this one).

(b) Substitute: $H \sim R_z(\pi)\,R_z(-\tfrac\pi2)\,R_x(\tfrac\pi2)\,R_z(\tfrac\pi2) = R_z(\tfrac\pi2)\,\sqrt X\,R_z(\tfrac\pi2)$ (merging adjacent z-rotations: π − π/2 = π/2). Physical pulse count: **one** ($\sqrt X$); the two $R_z$'s are free frame updates.

(c) You re-derived exactly what `transpile(qc, basis_gates=['rz','sx','x'])` emits for H — the scenario's claim, now proven by your own algebra: H costs one pulse on modern superconducting hardware. When Module 7's transpiler output shows `rz(π/2), sx, rz(π/2)` where your H was, you'll nod instead of blink.
````

## Practice questions

1. From memory: matrices for X, Z, H, S, T. (Paper. Check. Repeat tomorrow.)
2. What is $HSH$? Work it out via "H swaps x and z axes" before multiplying anything.
3. Why are Clifford-only circuits classically simulable a *problem* for someone claiming quantum advantage with an H+S+CNOT circuit?
4. Give the Bloch description of $R_x(\pi/2)$ acting on $\ket0$, and the resulting state's Y-statistics.
5. `qc.p(np.pi, 0)` vs `qc.z(0)`: identical, or distinguishable — in what circumstance?
6. Your Bloch flight-recorder shows a trace orbiting the equator the wrong way after an intended S. Diagnose and give the one-character fix.
7. **Design question:** design a 5-gate calibration sequence (gates from this lesson only) whose final Z-measurement statistics are maximally sensitive to a small over-rotation ε in the device's $\sqrt X$ pulse (i.e., it implements $R_x(\tfrac\pi2 + \varepsilon)$). Explain why your sequence amplifies ε and estimate the sensitivity gain over a single pulse.

````solution
1. (Self-check against Section 1–3 tables.)
2. S is a z-turn by 90°; conjugation by H moves it to an x-turn: $HSH \sim R_x(\pi/2)$ — the √X gate up to phase. (Multiply to confirm if desired.)
3. Gottesman–Knill: such a circuit's outputs are efficiently computable classically, so whatever it does, a laptop does too — no advantage claim survives. Non-Clifford content (T's, arbitrary rotations) is a *necessary* (not sufficient) ingredient.
4. Quarter-turn about x from the north pole lands on **−y** ($\ket{-i}$): Y-measurement gives "−i" with certainty; Z gives 50/50.
5. Identical alone (differ by global phase $e^{i\pi/2}$… actually $P(\pi) = Z$ exactly — check: diag(1, e^{iπ}) = diag(1,−1) = Z: EXACTLY equal, no caveat). So: truly identical, always — the trap inverted; P(γ) vs Rz(γ) differ, but at γ = π, P *is* Z. Reading conventions precisely beats pattern-matching slogans.
6. Wrong-direction equator orbit = wrong z-turn sign: an S where S† belonged. Fix: `qc.s(0)` → `qc.sdg(0)`.
7. Model: repeat the pulse: $(\sqrt X)^4$ ideally $= R_x(2\pi) \sim I$ (up to phase), so five gates: $\sqrt X,\sqrt X,\sqrt X,\sqrt X$, then measure (4 gates + 1 spare — or use $(\sqrt X)^4 X$ to land on a pole deterministically). With error: $R_x(4(\tfrac\pi2+\varepsilon)) = R_x(2\pi + 4\varepsilon)$ → $p(1) = \sin^2(2\varepsilon) \approx 4\varepsilon^2$ vs single-pulse sensitivity $\sin^2(\varepsilon/2) \approx \varepsilon^2/4$: a **16× amplification** (N repetitions amplify N²× in probability — coherent error accumulation). This is a real technique ("pulse-train amplification" / the heart of randomized benchmarking's cousins), and you designed it from the observation that unitary errors add *coherently* before squaring — Module 1's cross-term, now a calibration instrument.
````
