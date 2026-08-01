# The Bloch sphere: every qubit state on a globe

Two real parameters describe a qubit state (last lesson's counting). Two parameters also describe a point on a sphere — latitude and longitude. This is not a coincidence: **every single-qubit state is a point on a unit sphere**, every gate is a rotation of that sphere, and every measurement is a projection onto one of its axes. The Bloch sphere is the visualization professionals think in — hardware calibration plots, paper figures, debugging conversations all speak it.

## Start here — the intuition

Picture a globe. The **north pole is $\ket0$**, the **south pole is $\ket1$**, and every point in between is a superposition. Ride down to the **equator** and you're at a 50/50 state; which point on the equator you're at (the longitude) is the **phase**. That's the whole map: latitude tells you the odds of measuring 0 vs 1, longitude tells you the phase.

Three facts make the globe powerful. **Gates are rotations** of it — the X gate spins it half a turn about the x‑axis, and so on. **Measurement is a projection** onto an axis — a Z‑measurement asks "which hemisphere?" And the arrow's three coordinates are literally the three things you can measure: $\vec r = (\langle X\rangle, \langle Y\rangle, \langle Z\rangle)$. Learn to navigate this globe and you can predict what a gate does *faster than you can multiply the matrices*.

## The parametrization

Spend the global phase to make $\alpha$ real and non‑negative, and write the two remaining parameters as angles:

$$\ket\psi = \cos\tfrac{\theta}{2}\,\ket0 + e^{i\varphi}\sin\tfrac{\theta}{2}\,\ket1, \qquad \vec r = (\sin\theta\cos\varphi,\; \sin\theta\sin\varphi,\; \cos\theta)$$

with $\theta$ the polar angle from $+z$ and $\varphi$ the azimuth from $+x$.

@@diagram:bloch-sphere|The Bloch sphere: |0⟩ at the north pole, |1⟩ at the south, superpositions on the equator with φ selecting the longitude. Orthogonal states sit at ANTIPODES, not at right angles.

@@widget

The six cardinal points are the three measurement bases: north/south $= \ket0,\ket1$ (Z); $\pm x = \ket\pm$ (X); $\pm y = \ket{\pm i}$ (Y). Every antipodal pair is an orthonormal basis.

## Why θ/2 — orthogonal means antipodal

The formula uses $\theta/2$ while the sphere uses $\theta$, which performs the field's favorite trick: **orthogonal states land at antipodes (180° apart), not at 90°.** $\ket0$ and $\ket1$ are orthogonal ($\braket{0}{1}=0$) yet diametrically opposite on the globe. The reason: the sphere plots *measurement physics*, not the raw vector — the overlap between states $\Theta$ apart on the sphere is $|\braket{\psi_1}{\psi_2}|^2 = \cos^2\tfrac{\Theta}{2}$. Antipodes → overlap 0 (perfectly distinguishable); 90° apart (e.g. $\ket0$ vs $\ket+$) → overlap $\tfrac12$ (maximally ambiguous). The half‑angle makes distinguishability geometric.

## Gates are rotations — the payoff picture

Every one‑qubit gate (up to global phase) is a rotation of the sphere: X/Y/Z are 180° turns about their axes; **H is 180° about the diagonal $(x{+}z)$ axis** — it swaps the x and z axes, which is why it converts Z‑basis ↔ X‑basis; **S is 90° about z** ($\ket+ \to \ket{+i}$). Algebraic facts become *visible*: $H^2 = I$ (two half‑turns), $S^2 = Z$, $HZH = X$ (conjugating by an axis‑swapper relabels the axis), and gates don't commute because rotations about different axes don't (rotate a book 90° about two axes in both orders). Preparation becomes navigation: $R_y(\theta)$ sails you south along the $\varphi=0$ meridian, then $R_z(\varphi)$ slides you along the latitude — any state in two rotations.

## Predict, then run — the Bloch vector is the state

The Cartesian coordinates of the arrow are exactly the Pauli expectation values, $\vec r = (\langle X\rangle, \langle Y\rangle, \langle Z\rangle)$. The live cell computes them as gates act.

**Predict first.** Start at $\ket0$ (north, $(0,0,1)$). Apply $H$, then $S$, then $H$. Trace it on the globe: north → $+x$ → $+y$ → ? Guess the final point, then Run.

```run
# Live cell — the Bloch vector (<X>,<Y>,<Z>) IS the state. Watch gates rotate it.
import numpy as np
X=np.array([[0,1],[1,0]],complex); Y=np.array([[0,-1j],[1j,0]]); Z=np.array([[1,0],[0,-1]],complex)
def bloch(qc):
    psi = qc.statevector()
    return tuple(round(float(np.real(psi.conj() @ P @ psi)), 3) for P in (X, Y, Z))

for label, gates in [("start |0>", []), ("H", ["h"]), ("H, S", ["h","s_gate"]), ("H, S, H", ["h","s_gate","h"])]:
    qc = QuantumCircuit(1)
    for g in gates: getattr(qc, g)(0)
    print(f"{label:10} (X, Y, Z) = {bloch(qc)}")
# |0>=(0,0,1) north; H -> (1,0,0)=|+>; +S -> (0,1,0)=|+i>; +H -> (0,-1,0)=|-i>
```

Each gate is a rigid rotation of the arrow. The final point $(0,-1,0)$ is $\ket{-i}$ — sitting on the equator, so a Z‑measurement of it is 50/50, while a Y‑measurement reads "−i" with certainty. Also note: **purity is the radius.** Pure states sit on the sphere ($|\vec r| = 1$); noisy, decohered states fall *inside*, and the fully scrambled state is the center — decoherence is the arrow sagging toward the origin (Module 9 plots exactly this).

```quiz
{"q":"States A and B sit 90° apart on the Bloch sphere. Their overlap (how confusable they are) is:","options":["0 — perpendicular on the sphere means orthogonal","cos²(45°) = 1/2 — sphere angles are HALVED in the overlap formula","cos²(90°) = 0","1 — all sphere points overlap fully"],"answer":1,"why":"Overlap = cos²(Θ/2) with Θ the sphere angle: cos²(45°) = 1/2. Only antipodal (180°) pairs are orthogonal/perfectly distinguishable."}
```

## Level up — gotchas the pros watch for

- **Reading Bloch angles as vector angles.** The sphere doubles angles: orthogonal = antipodal (180°), not perpendicular. $\ket0$ and $\ket+$ (90° apart) are *not* orthogonal — overlap $\tfrac12$.
- **Putting $\ket1$ on the equator.** $\ket1$ is the *south pole*; the equator is all equal‑magnitude superpositions, distinguished by phase.
- **Global phase hunting on the sphere.** The sphere *can't represent* global phase (two parameters only) — if a matrix result differs from the sphere's by an overall $e^{i\gamma}$, both are right. Report states as Bloch points to sidestep the ambiguity.
- **Assuming multi‑qubit Bloch spheres exist.** Two qubits ≠ two spheres: entangled states have no per‑qubit sphere point (each arrow shrinks inside — Module 6). The sphere is a *single‑qubit* instrument.

## Level up — the calibration dashboard

A hardware team's dashboard shows, per qubit, a Bloch arrow: prepared $\ket+$, wait $t$, then tomography. Qubit 3's arrow starts at $+x$ and, over 40 μs, spirals around the z‑axis while sagging toward the center. You read it instantly: the spiral around z = a residual $R_z$ = **detuning** (frequency calibration off; the spiral rate measures it, ~12 kHz); the sag toward center = **$T_2$ decoherence** (the decay envelope reads ~28 μs); a drift toward north = **$T_1$ relaxation** to ground. You file three physical diagnoses from one animated arrow — the Bloch sphere is the team's shared debugging language.

## Key points

- $\ket\psi = \cos\tfrac\theta2\ket0 + e^{i\varphi}\sin\tfrac\theta2\ket1$ maps to $(\sin\theta\cos\varphi, \sin\theta\sin\varphi, \cos\theta)$; poles = Z, equator = equal superpositions, ±x/±y = X/Y bases.
- Half‑angles make distinguishability geometric: overlap $= \cos^2(\Theta_{\text{sphere}}/2)$; orthogonal states are antipodal.
- Every 1‑qubit gate is a sphere rotation: X/Y/Z = 180° about their axes, H = 180° about $(x{+}z)$, S = 90° about z; preparation = $R_y$ then $R_z$.
- $\vec r = (\langle X\rangle, \langle Y\rangle, \langle Z\rangle)$: coordinates are expectation values; tomography measures them; purity is the radius, decoherence is sagging inward.
- The sphere ignores global phase and has NO multi‑qubit generalization — it's the single‑qubit instrument.
- Geometry for speed, matrices for verification: predict on the globe, confirm with the matrix.

## Check yourself

```quiz
{"q":"Where is the state (|0⟩ − i|1⟩)/√2 on the Bloch sphere?","options":["North pole","−y axis: equator, φ = 3π/2 (the −i longitude)","+y axis","South pole"],"answer":1,"why":"Equal magnitudes → equator (θ = π/2); the relative phase −i = e^{−iπ/2} sets φ = −π/2 ≡ 3π/2: the −y cardinal point, |−i⟩."}
```

## Exercises

**Exercise 1 — globe navigation drill.** In the live cell, replace the gate list with your own sequence: from $\ket0$, apply $R_y(\pi/2)$ (use `qc.ry(np.pi/2, 0)`), then S, then Z, then H, printing the Bloch vector after each. Predict each point on the sphere first, then confirm.

````solution
```python
# |0>=(0,0,1); Ry(pi/2) -> (1,0,0)=|+>; +S -> (0,1,0)=|+i>; +Z -> (0,-1,0)=|-i>; +H -> (0,1,0)=|+i>
# When the amplitude printout looks unfamiliar, compute the three sandwiches (X,Y,Z) --
# the globe never lies about physics, even when a global phase disguises the amplitudes.
```
````

**Exercise 2 — the decoherence arrow.** A dephasing qubit's Bloch vector is $\vec r(t) = (e^{-t/T_2}\cos\omega t,\; e^{-t/T_2}\sin\omega t,\; 0)$ with $T_2 = 30\,\mu s$, $\omega = 2\pi\times 50$ kHz. What state is it at $t=0$? Why can a Z‑measurement *never* notice this process? What is $|\vec r|$ at $t = T_2$?

````solution
At $t=0$ it's $(1,0,0) = \ket+$. A Z‑measurement reads only $r_z$, which stays $0$ for all time — the whole process (rotation about z + shrinkage in the xy‑plane) leaves populations untouched and only kills phase coherence, which is exactly why dephasing is invisible in Z and needs X‑basis data to see (last lesson's 3 a.m. scenario). At $t = T_2$, $|\vec r| = e^{-1} \approx 0.368$ — 37% length, mostly scrambled. The trajectory is a spiral from the unit circle into the origin: the single most important picture in Module 9.
````

## Practice questions

1. Give Bloch coordinates for $\ket-$ and for $\tfrac{1}{\sqrt2}(\ket0 + e^{i\pi/4}\ket1)$.
2. Which gate maps $+y \to +y$ and swaps the poles?
3. Why can't the Bloch sphere represent global phase, dimensionally?
4. Compute $\langle Z\rangle$ for $\theta = \tfrac{2\pi}{3}$ and interpret the sign.
5. Two tomography runs return $\vec r_1 = (0.71, 0, 0.70)$ and $\vec r_2 = (0.5, 0, 0.5)$. One is suspicious — which, and why?
6. What sequence of at most two rotations prepares $(\theta, \varphi) = (\tfrac{3\pi}{4}, \pi)$ from $\ket0$?
7. **Design question:** design a "Bloch flight recorder" — given a list of gate matrices, produce the Bloch vector after each. Specify the signature, the plot, and the two automatic warnings it should raise.

````solution
1. $\ket-$: $(-1, 0, 0)$. Second: equator at $\varphi = \pi/4$: $(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}, 0)$.
2. Y — a 180° rotation about y fixes the y‑axis and swaps the poles.
3. The state has 2 real parameters (after normalization and global phase); the sphere's surface has exactly 2 — no coordinate left to encode $\gamma$.
4. $\langle Z\rangle = \cos\tfrac{2\pi}{3} = -\tfrac12$: negative = southern hemisphere = "1" more likely ($p(1) = \tfrac34$).
5. $|\vec r_1| \approx 0.997$ ✓ plausible pure; $|\vec r_2| \approx 0.707 < 1$ — decohered or (suspicious in a state‑prep test) under‑sampled tomography; radius is the first sanity check (radius > 1 is impossible — flag).
6. $R_y(\tfrac{3\pi}{4})$ then $R_z(\pi)$.
7. `flight_record(gates, psi0=|0>) -> list of (X,Y,Z)`: fold gates left‑to‑right, compute the three sandwiches after each. Plot three 2D projections (xy, xz, yz) with steps numbered, plus a radius‑vs‑step line. Warnings: (1) radius deviates from 1 → a non‑unitary "gate" or numerical drift; (2) the vector moves under a gate that should fix it, or rotates about an unexpected axis. The warnings are what turn a visualization into a debugger.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Place any single‑qubit state on the globe from its $(\theta, \varphi)$, and name the six cardinal points.
- ☐ Explain why orthogonal states are antipodal (the half‑angle and the overlap formula).
- ☐ Predict a gate sequence's effect by rotating the sphere, then confirm with the live cell.
- ☐ State that $\vec r = (\langle X\rangle,\langle Y\rangle,\langle Z\rangle)$ and that purity is the radius.
- ☐ Read a decoherence arrow: spiral = detuning, sag inward = $T_2$, drift to a pole = $T_1$.
- ☐ Explain why the Bloch sphere is single‑qubit only and ignores global phase.
