# The single-qubit gate set: X, Y, Z, H, S, T & rotations

Professionals don't look gates up — they *know* them: matrix, Bloch action, eigenbasis, and the algebra connecting them. This lesson is the complete single-qubit vocabulary plus the identities that make circuits simplifiable by hand.

## Start here — the intuition

There are really only a handful of single-qubit gates worth memorizing, and every one is just a **rotation of the Bloch globe**. Three of them are half-turns about the three axes: **X** (bit flip — swaps $\ket0 \leftrightarrow \ket1$), **Z** (phase flip — a half-turn about the vertical), and **Y** (both). One makes and unmakes superposition: **H**, the gate that turns the north pole into the equator. Two write phase in smaller steps: **S** (quarter turn) and **T** (eighth turn). And the **rotation gates** $R_x, R_y, R_z$ are continuous dials for any angle.

One professional fact worth front-loading, because it flips between eras: on *today's* hardware, z-rotations (Z, S, T) are essentially **free** (done in software), while H costs a physical pulse. In the *fault-tolerant future* it reverses — H and S become cheap, and **T becomes the expensive one**. Knowing which regime you're optimizing for is the difference between a gate user and a quantum engineer.

## The Pauli gates — X, Y, Z

The three 180° rotations about the coordinate axes (both gate and observable):

$$X = \begin{pmatrix}0&1\\1&0\end{pmatrix} \quad Y = \begin{pmatrix}0&-i\\i&0\end{pmatrix} \quad Z = \begin{pmatrix}1&0\\0&-1\end{pmatrix}$$

X is the bit flip ($\alpha\ket0+\beta\ket1 \to \beta\ket0+\alpha\ket1$, eigenbasis $\ket\pm$); Z is the phase flip ($\beta \to -\beta$, eigenbasis $\ket0,\ket1$); Y does both ($Y\ket0 = i\ket1$ — the $i$ matters). The algebra that runs error correction: $X^2=Y^2=Z^2=I$, and any two distinct Paulis **anticommute** ($XZ=-ZX$). Paulis dominate the field's discourse because they're a *basis for all 2×2 operators*, errors are modeled as random Paulis (Module 9), observables decompose into Pauli sums (VQE), and codes speak pure Pauli (Module 10).

## Hadamard, phase gates, and rotations

**H** $= \tfrac{1}{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}$ is a 180° turn about the diagonal $(x{+}z)$ axis — it swaps the x and z axes, so it's THE basis-change gate ($H\ket0=\ket+$, and $HZH=X$, $HXH=Z$). **Phase gates** are diagonal: $S = \mathrm{diag}(1,i)$, $T = \mathrm{diag}(1,e^{i\pi/4})$, staircasing as $T^2=S$, $S^2=Z$, $Z^2=I$ (eighth/quarter/half turns about z). **Rotation gates** $R_x, R_y, R_z(\gamma) = e^{-i\gamma P/2}$ are continuous dials (half-angles throughout).

@@diagram:gate-rotations|The gate zoo on the sphere: Paulis are 180° axis flips, H is the diagonal-axis flip that swaps x↔z, S/T are z-turns, R-gates dial any angle. Every unitary is some rotation.

@@widget

**Two facts pros carry.** *Universality:* any single-qubit unitary $= R_z(\alpha)R_y(\beta)R_z(\gamma)$ (three Euler angles); hardware natively does $R_z$ (free) plus one calibrated pulse ($\sqrt X$), and the transpiler rewrites everything into `['rz','sx','x']`. *Clifford vs non-Clifford:* Cliffords (H, S, CNOT + Paulis) map Paulis to Paulis, and by the Gottesman–Knill theorem **Clifford-only circuits are classically simulable** — no quantum advantage without a non-Clifford gate (T is the standard choice). So T is simultaneously the expensive gate *and* the magic ingredient.

## Predict, then run — every gate is a rotation

The live cell applies gates and prints the Bloch vector $(\langle X\rangle,\langle Y\rangle,\langle Z\rangle)$, then verifies an identity by running it.

**Predict first.** From $\ket0$ (the north pole, $(0,0,1)$): where does $X$ send the arrow? Where does $H$? Guess, then Run.

```run
# Live cell — each gate is a rotation of the Bloch vector.
import numpy as np
X=np.array([[0,1],[1,0]],complex); Y=np.array([[0,-1j],[1j,0]]); Z=np.array([[1,0],[0,-1]],complex)
def bloch(qc):
    psi = qc.statevector()
    return tuple(round(float(np.real(psi.conj() @ P @ psi)), 3) for P in (X, Y, Z))

print("starting from |0> = (0, 0, 1):")
for name, ops in [("X", ["x"]), ("H", ["h"]), ("H then S", ["h","s_gate"]), ("H then T", ["h","t"])]:
    qc = QuantumCircuit(1)
    for op in ops: getattr(qc, op)(0)
    print(f"  {name:10} -> {bloch(qc)}")

# Verify the identity H Z H = X by running it (both send |0> to |1>):
qc = QuantumCircuit(1); qc.h(0); qc.z(0); qc.h(0)
print("\nH Z H |0> ->", {k: round(v,3) for k,v in qc.probabilities().items()}, " (= X|0> = |1>)")
```

$X$ flips $\ket0$ to the south pole; $H$ lands it on the $+x$ equator ($\ket+$); $S$ then swings it to $+y$; $T$ swings it only an eighth-turn. And $HZH$ really does act like $X$ — conjugating $Z$ by the axis-swapper $H$ turns a phase flip into a bit flip.

```quiz
{"q":"A device lists basis gates ['rz','sx','x']. Which statement is right about your circuit's 25 T gates and 10 H gates?","options":["The T gates dominate the error budget — they're non-Clifford","T gates compile to rz (software, error-free); the 10 H's each need a physical sx pulse and dominate the hardware error today","Both cost the same","Neither can run on such a limited device"],"answer":1,"why":"On today's superconducting hardware, z-rotations are virtual (frame updates). The fault-tolerant era flips this: T becomes expensive (magic states), Cliffords cheap. Know your regime."}
```

## Level up — gotchas the pros watch for

- **Angle-first argument order.** Qiskit rotations are `qc.rx(angle, qubit)`; swapping them targets the wrong qubit.
- **Y's phases.** $Y\ket0 = i\ket1$, not $\ket1$; the $i$ matters once anything is controlled or interfered.
- **S vs S†.** A quarter-turn the wrong way puts you at $\ket{-i}$ instead of $\ket{+i}$ — if a Bloch trace turns the wrong way, suspect a missing `dg`.
- **"~" sloppiness.** $HZH = X$ is exact; $R_y(\pi) = Y$ is false ($R_y(\pi) = -iY$). Track the "up to global phase" qualifier like a units annotation — it becomes physical when the gate is controlled.
- **Not every gate is its own inverse.** True for H and Paulis; false for S, T, rotations. Undo = dagger each gate *and* reverse order (`qc.inverse()`).

## Level up — the basis-gate budget review

A device's basis gates are `['rz','sx','x']`. A colleague's algorithm uses 40 T's, 20 H's, 15 S's and asks "which will hurt?" Your analysis: $R_z$-family gates (T, S, Z, $R_z$) are **free** — software frame changes, zero error. H is not native — it transpiles to $R_z\cdot\sqrt X\cdot R_z$, one physical pulse each — so the 20 H's dominate the error budget while the "expensive-sounding" 40 T's cost nothing *today*. On a fault-tolerant machine the table flips: Cliffords cheap, T costly. Same circuit, opposite bottlenecks, two eras of hardware.

## Key points

- Paulis: bit flip (X), phase flip (Z), both (Y); $P^2=I$; distinct Paulis anticommute; they're the basis of operators, errors, observables, and codes.
- H swaps x↔z: makes/unmakes superposition, changes measurement basis, conjugates $Z \leftrightarrow X$.
- Phase staircase $T \to S \to Z$; Cliffords (H, S, CNOT) are classically simulable — T is both the fault-tolerance cost metric and the ingredient of advantage.
- Rotations $R_{x,y,z}(\gamma)$ are half-angle dials; any unitary = three Euler rotations; hardware speaks `rz` (free) + `sx` + `x`.
- On today's hardware z-rotations are free and H costs a pulse; fault tolerance flips it.

## Check yourself

```quiz
{"q":"Which sequence equals X exactly?","options":["S S","H Z H","T T T T","Z H Z"],"answer":1,"why":"HZH = X exactly (conjugation by the x↔z swapper). SS = Z, TTTT = S² = Z — z-family gates can't make a bit flip alone."}
```

## Exercises

**Exercise 1 — the identity workout.** In the live cell, verify $HXH = Z$ by running `qc.h(0); qc.x(0); qc.h(0)` and checking it sends $\ket+$ to... (predict first). Then confirm $S^2 = Z$ and $T^2 = S$ by comparing Bloch vectors after each.

````solution
```python
# HXH = Z: it fixes |0>,|1> (Z's eigenstates) and flips the sign of |+> <-> |->.
# S^2 sends |+>=(1,0,0) to (-1,0,0)=|-> (a half-turn about z) = Z's action on the equator.
# T applied twice equals S: eighth-turn + eighth-turn = quarter-turn about z.
```
Conjugating an axis-flip by a rotation *rotates the flip's axis*: $U P U^\dagger$ = "P's axis, moved by U" — one picture behind every conjugation identity, and half of Module 10's stabilizer formalism.
````

**Exercise 2 — compile H to the device basis.** On hardware with $\sqrt X = R_x(\pi/2)$ and free $R_z$'s, H decomposes as $R_z(\tfrac\pi2)\,\sqrt X\,R_z(\tfrac\pi2)$. How many *physical pulses* is that? (Only $\sqrt X$ counts; $R_z$'s are free frame updates.)

````solution
One pulse. This is exactly what `transpile(qc, basis_gates=['rz','sx','x'])` emits for H — so H costs a single pulse on modern superconducting hardware, which is why the "free 40 T's, costly 20 H's" analysis holds.
````

## Practice questions

1. From memory: matrices for X, Z, H, S, T.
2. What is $HSH$? Reason via "H swaps x and z axes" before multiplying.
3. Why is a Clifford-only (H+S+CNOT) circuit a *problem* for someone claiming quantum advantage?
4. Bloch description of $R_x(\pi/2)$ on $\ket0$, and the resulting Y-statistics.
5. `qc.p(np.pi, 0)` vs `qc.z(0)`: identical or distinguishable?
6. A Bloch trace orbits the equator the wrong way after an intended S. Diagnose and give the one-character fix.
7. **Design question:** design a 5-gate calibration sequence whose Z-statistics are maximally sensitive to a small over-rotation $\varepsilon$ in the $\sqrt X$ pulse. Why does it amplify $\varepsilon$?

````solution
1. (Self-check against the tables above.)
2. S is a 90° z-turn; conjugation by H moves it to an x-turn: $HSH \sim R_x(\pi/2) = \sqrt X$.
3. Gottesman–Knill: such circuits are efficiently classically simulable, so a laptop reproduces them — no advantage. Non-Clifford content (T) is necessary (not sufficient).
4. Quarter-turn about x from the north pole lands on $-y$ ($\ket{-i}$): Y gives "−i" with certainty, Z gives 50/50.
5. Identical: $P(\pi) = \mathrm{diag}(1,e^{i\pi}) = \mathrm{diag}(1,-1) = Z$ exactly. ($P(\gamma)$ and $R_z(\gamma)$ differ in general, but at $\gamma=\pi$, $P$ *is* $Z$.)
6. Wrong-direction equator orbit = wrong z-turn sign: an S where S† belonged — fix `qc.s(0)` → `qc.sdg(0)`.
7. Repeat the pulse four times: ideal $(\sqrt X)^4 = R_x(2\pi) \sim I$, but with error $R_x(4(\tfrac\pi2+\varepsilon)) = R_x(2\pi+4\varepsilon) \Rightarrow p(1) = \sin^2(2\varepsilon) \approx 4\varepsilon^2$, vs a single pulse's $\sim \varepsilon^2/4$ — a 16× amplification. $N$ repetitions amplify $N^2\times$ because coherent (unitary) errors add *before* squaring. This is real ("pulse-train amplification"), designed from Module 1's cross-term.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Write the X, Z, H, S, T matrices and state each one's Bloch action from memory.
- ☐ Use the conjugation rule $UPU^\dagger$ = "P's axis, moved by U" ($HZH=X$, $HSH=\sqrt X$).
- ☐ Explain Clifford vs non-Clifford and why advantage needs a T (or other non-Clifford).
- ☐ Run the live cell and predict where each gate sends the Bloch vector.
- ☐ Explain which gates are free vs costly on today's hardware, and how fault tolerance flips it.
- ☐ Decompose any single-qubit unitary as three Euler rotations, and H to one $\sqrt X$ pulse.
