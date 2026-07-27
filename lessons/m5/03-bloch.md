# The Bloch sphere: every qubit state on a globe

Two real parameters describe a qubit state (last lesson's counting). Two parameters also describe a point on a sphere — latitude and longitude. This is not a coincidence: **every single-qubit state is a point on a unit sphere**, every gate is a rotation of that sphere, and every measurement is a projection onto one of its axes. The Bloch sphere is the visualization professionals think in — hardware calibration plots, paper figures, debugging conversations all speak it. Today you learn the globe.

## 1. The parametrization

Start from the general state, spend the global phase to make $\alpha$ real and non-negative, and write the two remaining parameters as angles:

$$\ket\psi = \cos\tfrac{\theta}{2}\,\ket0 + e^{i\varphi}\sin\tfrac{\theta}{2}\,\ket1 \qquad \theta \in [0, \pi], \; \varphi \in [0, 2\pi)$$

Interpret $(\theta, \varphi)$ as spherical coordinates: $\theta$ = polar angle from the +z axis (colatitude), $\varphi$ = azimuth around the equator from the +x axis. The state lives at the Cartesian point

$$\vec r = (\sin\theta\cos\varphi,\; \sin\theta\sin\varphi,\; \cos\theta)$$

@@diagram:bloch-sphere|The Bloch sphere: |0⟩ at the north pole, |1⟩ at the south, superpositions on the equator with φ selecting the longitude. Orthogonal states sit at ANTIPODES, not at right angles.

**The geography to memorize** (all six cardinal points — check each against the formula):

| Point | $(\theta, \varphi)$ | State | Basis family |
|---|---|---|---|
| North pole (+z) | $(0, -)$ | $\ket0$ | Z |
| South pole (−z) | $(\pi, -)$ | $\ket1$ | Z |
| +x | $(\tfrac\pi2, 0)$ | $\ket+$ | X |
| −x | $(\tfrac\pi2, \pi)$ | $\ket-$ | X |
| +y | $(\tfrac\pi2, \tfrac\pi2)$ | $\ket{+i}$ | Y |
| −y | $(\tfrac\pi2, \tfrac{3\pi}{2})$ | $\ket{-i}$ | Y |

The three famous bases are the three coordinate axes. Every axis is a legal measurement; every antipodal pair is an orthonormal basis.

## 2. Why θ/2 — the honest answer

The formula uses $\theta/2$ while the sphere uses $\theta$, which quietly performs the field's favorite magic trick: **orthogonal states land at antipodes (180° apart on the sphere), not at 90°**. Check: $\ket0$ (north) and $\ket1$ (south) are orthogonal as vectors — $\braket{0}{1} = 0$ — yet on the sphere they're diametrically opposite, 180° apart. In the state space $\mathbb{C}^2$ the angle between them is 90°; the sphere *doubles* angles.

Why build it that way? Because the sphere isn't plotting the complex vector — it's plotting *measurement physics*. The overlap between states at spherical angle $\Theta$ apart is

$$|\braket{\psi_1}{\psi_2}|^2 = \cos^2\tfrac{\Theta}{2}$$

— antipodes ($\Theta = \pi$) → overlap 0 (perfectly distinguishable); same point → overlap 1; sphere-perpendicular ($\Theta = \tfrac\pi2$, e.g. $\ket0$ vs $\ket+$) → overlap $\tfrac12$ (maximally ambiguous). The half-angle makes distinguishability geometric. (Deeper still: the map to physical rotations makes qubits "spin-½" objects — a 360° Bloch rotation returns the state with a −1 global phase, a real and measurable-with-help fact called spinor behavior. File under "the universe is stranger than the syllabus"; nothing this course computes needs more than the working rule above.)

## 3. Gates are rotations — the payoff picture

Every unitary on one qubit (up to global phase) is a **rotation of the Bloch sphere** about some axis by some angle. The dictionary (formalized next lesson, used forever):

| Gate | Bloch action |
|---|---|
| X | 180° rotation about the **x-axis** (swaps poles: bit flip; fixes $\ket\pm$ — its eigenvectors!) |
| Z | 180° about **z** (fixes poles — phase flip; swaps $\ket+ \leftrightarrow \ket-$) |
| Y | 180° about **y** (swaps poles *and* swaps $\pm$) |
| H | 180° about the **diagonal (x+z)/√2 axis** (exchanges x↔z axes: hence Z-basis ↔ X-basis converter) |
| S | 90° about z ($\ket+ \to \ket{+i}$: the quarter-turn you met as $i$) |
| $R_z(\varphi), R_y(\theta), R_x(\gamma)$ | arbitrary-angle rotations about each axis — the continuous dials |

Instantly, facts you proved algebraically become *visible*: $H^2 = I$ (two 180° turns), $S^2 = Z$ (two quarter-turns = half-turn), $HZH = X$ (conjugating by an axis-swapper relabels the axis — watch it on the globe!), gate non-commutativity (rotations about different axes famously don't commute — try rotating a book 90° about two axes in both orders).

And preparation becomes navigation: from the north pole, $R_y(\theta)$ sails you south along the $\varphi=0$ meridian, then $R_z(\varphi)$ slides you along the latitude line. *Any* state in two rotations — which is literally how `ry(θ); rz(φ)` prepares states on hardware.

## 4. Coordinates are expectation values — the professional's secret

The Bloch vector's Cartesian components are exactly the expectation values (eigen-lesson sandwiches!) of the three Pauli observables:

$$\vec r = \big(\langle X\rangle, \langle Y\rangle, \langle Z\rangle\big) = \big(\bra\psi X\ket\psi,\; \bra\psi Y\ket\psi,\; \bra\psi Z\ket\psi\big)$$

This upgrades the sphere from picture to *instrument*:

- **Tomography = measuring coordinates.** Estimate $\langle Z\rangle = p(0) - p(1)$ from Z-basis shots (similarly X, Y bases): three histograms → three coordinates → the state, located. Last lesson's tomography drill was secretly computing $\vec r$.
- **Purity = radius.** Ideal (pure) states sit ON the sphere, $|\vec r| = 1$. Noisy, decohered states fall *inside* ($|\vec r| < 1$); the fully scrambled state is the center (all expectations zero — coin flips in every basis). Decoherence, on the Bloch sphere, is the state sagging toward the origin — Module 9 will plot exactly this.

```python
import numpy as np
X = np.array([[0,1],[1,0]]); Y = np.array([[0,-1j],[1j,0]]); Z = np.diag([1,-1]).astype(complex)

def bloch(psi):
    return tuple(float(np.real(np.vdot(psi, P @ psi))) for P in (X, Y, Z))

theta, phi = 2*np.pi/3, np.pi/3
psi = np.array([np.cos(theta/2), np.exp(1j*phi)*np.sin(theta/2)])
print(np.round(bloch(psi), 4))                    # (0.4330, 0.75, -0.5)
print(np.sin(theta)*np.cos(phi), np.sin(theta)*np.sin(phi), np.cos(theta))
# 0.4330  0.75  -0.5  — formula confirmed ✓
```

(Qiskit will draw all this for you — `from qiskit.visualization import plot_bloch_vector` — but you now know what the arrow *is*: three sandwiches.)

## Worked example — a gate sequence, navigated then verified

*Trace $\ket0 \xrightarrow{H} \xrightarrow{S} \xrightarrow{H}$ on the globe, predict the final Z-statistics, then verify with matrices.*

**Navigate.** Start north pole. **H** (180° about x+z diagonal): north pole → +x, so state $= \ket+$. **S** (90° about z): +x rotates to +y, state $= \ket{+i}$. **H** again: the x+z-axis 180° swaps x↔z and *reverses* y: +y → −y, state $= \ket{-i}$.

**Predict.** $\ket{-i}$ sits on the equator ⇒ $\langle Z\rangle = 0$ ⇒ Z-measurement is 50/50. (Bonus prediction: a Y-basis measurement would give "−i" with certainty.)

**Verify** (NumPy referee, as always):

```python
H = np.array([[1,1],[1,-1]])/np.sqrt(2); S = np.diag([1,1j])
psi = H @ S @ H @ np.array([1,0], dtype=complex)
print(np.round(psi, 4))            # [0.5+0.5j  0.5-0.5j]
print(np.round(bloch(psi), 4))     # (0., -1., 0.)  → the −y point: |−i⟩ ✓
```

The state prints as $(0.5{+}0.5i, 0.5{-}0.5i)$ — which *is* $\ket{-i}$ times the global phase $e^{i\pi/4}$: the globe ignored the global phase automatically (points don't carry phases — feature, not bug). Geometry predicted physics faster than algebra computed it; that speed is why professionals think on the sphere and only drop to matrices for verification and for multi-qubit work (where, alas, the sphere has no big brother — Module 6's opening confession).

## Gotchas

- **Reading Bloch angles as vector angles.** The sphere doubles angles: orthogonal = antipodal (180°), not perpendicular (90°). $\ket0$ and $\ket+$ (90° apart on the sphere) are NOT orthogonal — overlap ½.
- **Putting $\ket1$ on the equator.** $\ket1$ is the SOUTH POLE ($\theta = \pi$). The equator is all *equal-magnitude* superpositions, distinguished by phase φ.
- **Forgetting φ is measured from +x.** $\varphi = 0$ meridian passes through $\ket+$; getting the reference wrong swaps X↔Y statistics predictions.
- **Global phase hunting on the sphere.** The sphere *cannot represent* global phase (two parameters only) — if your matrix result differs from the sphere's by an overall $e^{i\gamma}$, both are right. Report states as Bloch points to sidestep the ambiguity entirely.
- **Assuming multi-qubit Bloch spheres exist.** Two qubits ≠ two spheres: entangled states have no per-qubit sphere point (each qubit's arrow shrinks inside — Module 6 makes this precise and profound). The sphere is a *single-qubit* instrument.
- **Rotation direction sign errors.** Conventions (right-hand rule, $R_z(\varphi) = e^{-i\varphi Z/2}$) vary by textbook; Qiskit's are fixed and documented. When a phase comes out negated, check the convention before the physics.

## Scenario — the calibration dashboard

You join a hardware team; the morning dashboard shows, per qubit, a Bloch arrow animation: prepared $\ket+$, wait time $t$, then tomography. Qubit 3's arrow starts at +x and, over 40 μs, spirals around the z-axis while sagging toward the center. You read it instantly, because each feature is a lesson: the spiral around z = a residual $R_z$ rotation = detuning (the qubit's frequency calibration is off by $\Delta f$ — the spiral rate measures it: ~2π × 12 kHz); the sag toward the center = decoherence ($T_2$; the decay envelope timescale reads ~28 μs); the arrow's final resting point drifting slightly *below* the equator = energy relaxation toward $\ket0$… wait, $\ket0$ is *up*: sag toward north = $T_1$ relaxation to ground state. You file: "Q3: 12 kHz detune, retune LO; T2 ≈ 28 μs consistent with spec; T1 relaxation visible but nominal." Three physical diagnoses from one animated arrow — the Bloch sphere is the team's shared dashboard language, and you just demonstrated fluency.

### ▶ Run it live

Watch a phase gate act: |+> is 50/50, and a Z gate turns it into |-> (still 50/50 in Z, but the opposite state):

```run
qc = QuantumCircuit(1); qc.h(0)        # |+>
print("|+> probabilities:", qc.probabilities())
qc.z(0)                                # -> |->
print("after Z (now |->):", qc.probabilities())
```

## Key points

- $\ket\psi = \cos\tfrac\theta2\ket0 + e^{i\varphi}\sin\tfrac\theta2\ket1$ maps to the sphere point $(\sin\theta\cos\varphi, \sin\theta\sin\varphi, \cos\theta)$; poles = Z basis, equator = equal superpositions, ±x/±y = the X/Y bases.
- Half-angles make distinguishability geometric: overlap $= \cos^2(\Theta_{\text{sphere}}/2)$; orthogonal states are antipodal.
- Every 1-qubit gate is a sphere rotation: X/Y/Z = 180° about their axes, H = 180° about x+z (axis swapper), S = 90° about z; preparation = $R_y$ then $R_z$ navigation.
- $\vec r = (\langle X\rangle, \langle Y\rangle, \langle Z\rangle)$: coordinates are expectation values; tomography measures them; purity is the radius, decoherence is sagging inward.
- The sphere ignores global phase by construction and has NO multi-qubit generalization — it's the single-qubit instrument, wielded constantly.
- Geometry for speed, matrices for verification: predict on the globe, confirm with `@`.

## Check yourself

```quiz
{"q":"Where is the state (|0⟩ − i|1⟩)/√2 on the Bloch sphere?","options":["North pole","−y axis: equator, φ = 3π/2 (i.e., −i longitude)","+y axis","South pole"],"answer":1,"why":"Equal magnitudes → equator (θ = π/2); the relative phase −i = e^{−iπ/2} sets φ = −π/2 ≡ 3π/2: the −y cardinal point, |−i⟩."}
```

```quiz
{"q":"States A and B sit 90° apart on the Bloch sphere. The probability of mistaking one for the other in a single optimal measurement relates to their overlap, which is:","options":["0 — perpendicular on the sphere means orthogonal","cos²(45°) = 1/2 — sphere angles are HALVED in the overlap formula","cos²(90°) = 0","1 — all sphere points overlap fully"],"answer":1,"why":"Overlap = cos²(Θ/2) with Θ the sphere angle: cos²(45°) = 1/2. Only antipodal (180°) pairs are orthogonal/perfectly distinguishable."}
```

## Exercises

**Exercise 1 — globe navigation drill.** Starting from $\ket0$, give the state (name or amplitudes) after each cumulative step of: (a) $R_y(\pi/2)$, (b) then S, (c) then Z, (d) then H. Solve entirely on the sphere first, then verify the final state with matrices.

````solution
(a) $R_y(\pi/2)$ from north pole: sail 90° south along the φ=0 meridian → **+x: $\ket+$**.
(b) S (90° about z): +x → +y → **$\ket{+i}$**.
(c) Z (180° about z): +y → −y → **$\ket{-i}$**.
(d) H (180° about x+z; swaps x↔z, reverses y): −y → +y → **$\ket{+i}$**.

```python
import numpy as np
H = np.array([[1,1],[1,-1]])/np.sqrt(2); S = np.diag([1,1j]); Z = np.diag([1,-1])
Ry = lambda t: np.array([[np.cos(t/2), -np.sin(t/2)],[np.sin(t/2), np.cos(t/2)]])
psi = H @ Z @ S @ Ry(np.pi/2) @ np.array([1,0], dtype=complex)
print(np.round(psi, 4))     # [0.5+0.5j 0.5-0.5j] → wait, compute its Bloch point:
X = np.array([[0,1],[1,0]]); Yp = np.array([[0,-1j],[1j,0]])
r = [float(np.real(np.vdot(psi, P @ psi))) for P in (X, Yp, Z)]
print(np.round(r, 4))       # [0. 1. 0.] → +y: |+i⟩ ✓ (amplitudes carry a global phase)
```

Note the teaching moment inside the verification: the amplitude printout looks unlike the "textbook" $\tfrac{1}{\sqrt2}(1, i)$ — but the Bloch vector says +y regardless. When amplitudes confuse, compute the three sandwiches; the globe never lies about physics.
````

**Exercise 2 — the decoherence arrow.** A dephasing qubit's Bloch vector evolves as $\vec r(t) = (e^{-t/T_2}\cos\omega t,\; e^{-t/T_2}\sin\omega t,\; 0)$ with $T_2 = 30$ μs, $\omega = 2\pi \times 50$ kHz. (a) What state is it at $t=0$? (b) At what time is the state maximally ambiguous to an X-basis measurement AND why can't a Z measurement ever notice this process? (c) Compute $|\vec r|$ at t = 30 μs — what fraction of "quantumness" remains? (d) Sketch (or plot) the trajectory viewed from above.

````solution
(a) $\vec r(0) = (1, 0, 0)$: the +x point, $\ket+$.

(b) X-ambiguity means $\langle X\rangle = r_x = 0$: first at $\omega t = \tfrac\pi2$, i.e. $t = \tfrac{1}{4\cdot 50\text{kHz}} = 5$ μs (arrow points along +y). A Z-measurement reads only $r_z$, which stays 0 for all time — the entire process (rotation about z + shrinkage in the xy-plane) is invisible to Z: populations never change, only phase coherence. This is precisely why last lesson's 3 a.m. scenario needed X-basis data to see dephasing.

(c) $|\vec r(30\mu s)| = e^{-1} \approx 0.368$ — the arrow is at 37% length: still quantum-ish, mostly scrambled. (At $t = 3T_2$: 5% — effectively a classical coin for X/Y purposes.)

(d)
```python
import numpy as np, matplotlib.pyplot as plt
t = np.linspace(0, 100e-6, 800); T2, w = 30e-6, 2*np.pi*50e3
x, y = np.exp(-t/T2)*np.cos(w*t), np.exp(-t/T2)*np.sin(w*t)
plt.plot(x, y); plt.gca().set_aspect("equal")
plt.gca().add_patch(plt.Circle((0,0), 1, fill=False, linestyle=":"))
plt.xlabel("⟨X⟩"); plt.ylabel("⟨Y⟩"); plt.title("Dephasing: spiral to the center")
plt.show()
```
A spiral from the unit circle into the origin — the single most important picture in Module 9, drawn two modules early by you, from a formula you fully understand. When a paper says "the coherence decays with $T_2$," this is the arrow it means.
````

## Practice questions

1. Give Bloch coordinates for $\ket-$ and for $\tfrac{1}{\sqrt2}(\ket0 + e^{i\pi/4}\ket1)$.
2. Which gate maps +y → +y and swaps the poles? (Think: rotation about which axis fixes y?)
3. Why can't the Bloch sphere represent global phase, dimensionally?
4. Compute $\langle Z\rangle$ for $\theta = \tfrac{2\pi}{3}$ and interpret the sign.
5. Two tomography runs return $\vec r_1 = (0.71, 0, 0.70)$ and $\vec r_2 = (0.5, 0, 0.5)$. One is suspicious — which, and why? (Check radii.)
6. What sequence of at most two rotations prepares the state at $(\theta, \varphi) = (\tfrac{3\pi}{4}, \pi)$ from $\ket0$?
7. **Design question:** design a "Bloch flight recorder" for debugging: given a list of gate matrices, produce the sequence of Bloch vectors after each gate. Specify the function signature, the plot you'd draw (2D projections? annotated 3D?), and the two automatic warnings it should raise (hint: radius and unexpected axis).

````solution
1. $\ket-$: $(-1, 0, 0)$. The second: equator at $\varphi = \pi/4$: $(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}, 0)$.
2. Y — a 180° rotation about y fixes the y-axis and swaps north/south poles (and also swaps ±x).
3. The physical state space has 2 real parameters (after normalization and global phase); the sphere's surface has exactly 2 — no coordinate left over to encode γ.
4. $\langle Z\rangle = \cos\tfrac{2\pi}{3} = -\tfrac12$: negative = southern hemisphere = "1" more likely (p(1) = 3/4).
5. $|\vec r_1| = \sqrt{0.504 + 0.49} \approx 0.997$ ✓ plausible pure state; $|\vec r_2| \approx 0.707 < 1$ — either genuinely decohered or (suspicious in a *state-prep* test) under-sampled/miscalibrated tomography; radius is the first sanity check on any reported Bloch vector. A radius > 1 would be outright impossible — flag and re-measure.
6. $R_y(\tfrac{3\pi}{4})$ then $R_z(\pi)$.
7. Model: `def flight_record(gates, psi0=ket0) -> list[tuple]`: fold gates left-to-right, after each compute $(\langle X\rangle,\langle Y\rangle,\langle Z\rangle)$ via the three sandwiches; return the list. Plot: three 2D projections (xy, xz, yz) with arrows numbered by step (3D looks impressive, reads poorly in reports), plus a radius-vs-step line. Warnings: (1) radius deviates from 1 beyond 1e-6 → a non-unitary "gate" snuck in (or numerical rot); (2) a step moves the vector when the gate should fix it, or rotates about an unexpected axis — implement as "angle between actual displacement and displacement predicted by the gate's known axis exceeds tolerance." The deliverable mirrors real tooling: Qiskit's `plot_bloch_multivector` shows states, but the *warnings* are what convert visualization into a debugger — and designing warnings is designing understanding.
````
