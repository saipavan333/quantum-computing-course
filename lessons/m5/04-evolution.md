# Gates as unitary evolution & the phase that matters

Rule 2 says unobserved quantum states evolve unitarily. This lesson makes that rule *yours*: why unitarity is forced (not chosen), what it permits and forbids, and the definitive treatment of the distinction that runs every algorithm — global phase (meaningless) versus relative phase (everything). By the end you'll compute interference through gate sequences as fluently as arithmetic, which is the exact skill Modules 6–8 assume.

## 1. Why evolution must be unitary

Three requirements, physics-motivated, mathematically decisive:

1. **Linearity.** Evolution acts on superpositions component-wise (experimentally verified to absurd precision; also required for probability bookkeeping to compose). So evolution is a matrix $U$: $\ket\psi \to U\ket\psi$.
2. **Normalization preservation.** Probabilities must total 1 before *and after*: $\lVert U\ket\psi\rVert = 1$ whenever $\lVert\ket\psi\rVert = 1$.
3. That norm-preservation for all states forces $U^\dagger U = I$ — the eigen lesson's characterization. **Unitary is not a design choice; it's conservation of probability wearing matrix clothes.**

(Where does $U$ come from physically? The Schrödinger equation: a system with energy operator — Hamiltonian — $\hat H$ evolves as $U = e^{-i\hat H t/\hbar}$: Hermitian generator in the exponent, unitary evolution out, Euler's formula scaled up to matrices. This one line is the bridge between "physics" and "gates": hardware engineers *shape* $\hat H(t)$ with microwave pulses so that the resulting $U$ equals the gate you asked for. You'll never need to solve Schrödinger in this course, but knowing gates are sculpted Hamiltonians demystifies the whole stack — and explains why gates take nanoseconds and have error rates: they're analog physics, digitally abstracted.)

Consequences you now own permanently:

- **Reversibility**: $U^{-1} = U^\dagger$ always exists — any gate sequence can be exactly undone by the daggered gates in reverse order ($(UVW)^\dagger = W^\dagger V^\dagger U^\dagger$: socks and shoes). "Uncomputation" is a *standard subroutine* in quantum algorithms (Module 8 uses it to clean up scratch qubits).
- **No information destruction mid-circuit**: two distinct states stay distinct (unitaries preserve overlaps: $\braket{U\phi}{U\psi} = \braket{\phi}{\psi}$). There is no unitary "set qubit to 0" — reset requires measurement or fresh qubits. This shapes real circuit design: scratch space must be uncomputed, not overwritten.
- **Composition closes**: circuits (products of unitaries) are unitaries. An entire algorithm is one big $U$ — a perspective that powers analysis (and transpilers).

## 2. Global vs relative phase — the final word

Both involve multiplying by $e^{i\gamma}$; everything depends on *what* gets multiplied.

**Global phase: $\ket\psi \to e^{i\gamma}\ket\psi$ (everything).** Born rule: $|e^{i\gamma}\braket{b}{\psi}|^2 = |\braket{b}{\psi}|^2$ — every probability, in every basis, after any further unitary (linearity carries the factor along), forever unchanged. Global phase is **descriptive residue, not physics**. Corollary that saves real confusion: gates differing by global phase are *the same gate* ($Z$ and $-Z$ act identically on physics; Qiskit may print either).

**Relative phase: $\alpha\ket0 + \beta\ket1 \to \alpha\ket0 + e^{i\gamma}\beta\ket1$ (one component).** Z-basis statistics: unchanged ($|e^{i\gamma}\beta|^2 = |\beta|^2$). But the state moved on the Bloch sphere (rotated about z by γ), and any *interference-producing* gate converts the phase into populations. The canonical converter is H — watch it happen in general:

$$H\left(\tfrac{\ket0 + e^{i\gamma}\ket1}{\sqrt2}\right) = \tfrac{(1 + e^{i\gamma})\ket0 + (1 - e^{i\gamma})\ket1}{2} \implies p(0) = \cos^2\tfrac\gamma2, \quad p(1) = \sin^2\tfrac\gamma2$$

@@diagram:global-vs-relative|Global phase rotates the whole state — no experiment sees it. Relative phase rotates components against each other — interference converts it into measurable populations.

That boxed-in-your-memory formula IS the Mach–Zehnder result, the NumPy exercise, and the "phase ruler" design question — one identity, four appearances, zero coincidences. **The H-sandwich (H, phase, H) is the universal phase-reading instrument.**

## 3. Interference as the computational engine

Assemble the full picture of how quantum algorithms compute, in three beats:

**Beat 1 — fan out.** Hadamards create superposition over all $2^n$ basis states (one H per qubit — Module 6's tensor products make this precise): the computation now "touches" every input.

**Beat 2 — phase writing.** The problem's structure is encoded as *relative phases* between components — e.g., an oracle flips the sign of the answer state(s). Crucially, phase-writing is invisible to immediate measurement (Z-statistics unchanged!) — the information is real but hidden, exactly like $\ket+$ vs $\ket-$.

**Beat 3 — interfere to reveal.** A final interference stage (more Hadamards, or a QFT) converts phase patterns into population patterns: wrong answers' amplitudes cancel, right answers' reinforce. THEN measure.

@@diagram:interference-paths|The algorithmic template: spread amplitude (H), write the problem into phases (oracle), interfere so wrong paths cancel (H/QFT), measure what survives.

Every algorithm in Module 8 — Deutsch–Jozsa, Grover, Shor — is this template with different phase-writing and different interference stages. Superposition is the canvas; **phases are the paint; interference is the reveal.** (And decoherence — Module 9 — is the environment reading phases early, bleaching the paint. The whole field in one metaphor; you're welcome at parties.)

## Worked example — computing an interference circuit *symbolically*

*Compute the output of the sequence $\ket0 \to H \to R_z(\gamma) \to H$ for arbitrary γ, tracking phases like a professional (factor early, factor often).*

With $R_z(\gamma) = \mathrm{diag}(e^{-i\gamma/2}, e^{i\gamma/2})$ (Qiskit's convention — note the half-angles and the symmetric split):

**Step 1**: $H\ket0 = \tfrac{1}{\sqrt2}(\ket0 + \ket1)$.

**Step 2**: $R_z$ writes phases: $\tfrac{1}{\sqrt2}(e^{-i\gamma/2}\ket0 + e^{i\gamma/2}\ket1) = \tfrac{e^{-i\gamma/2}}{\sqrt2}(\ket0 + e^{i\gamma}\ket1)$ — **factored the global phase out immediately**; the physics is the relative $e^{i\gamma}$, and the prefactor $e^{-i\gamma/2}$ is dead weight we now ignore.

**Step 3**: the master formula: $p(0) = \cos^2\tfrac\gamma2$, $p(1) = \sin^2\tfrac\gamma2$.

Sanity checks (always bracket a symbolic result with extremes): γ = 0 → H·H = I → certainly 0 ✓; γ = π → $R_z(\pi) \sim Z$, and HZH = X → certainly 1 ✓; γ = π/2 → 50/50 ✓ (the S-gate detour of the Dirac lesson). One derivation now *contains* half a dozen previous computations as special cases — the sign you're climbing the abstraction ladder rather than re-deriving facts forever.

```python
import numpy as np
H = np.array([[1,1],[1,-1]])/np.sqrt(2)
Rz = lambda g: np.diag([np.exp(-1j*g/2), np.exp(1j*g/2)])
for g in [0, np.pi/2, np.pi, 2.2]:
    out = H @ Rz(g) @ H @ np.array([1,0], dtype=complex)
    print(round(g, 3), np.round(np.abs(out)**2, 4), round(np.cos(g/2)**2, 4))
# each row: simulated p(0) == cos²(γ/2) ✓
```

## Gotchas

- **Chasing global phases through derivations.** Factor them out the moment they appear (Step 2's move) and *say* you did. Pages of $e^{-i\gamma/2}$ bookkeeping that cancels at the Born rule is the #1 self-inflicted algebra wound.
- **…but discarding phases that are only LOCALLY global.** In multi-qubit circuits, a phase "global" to one qubit can be relative to another once they entangle (controlled gates make this precise — Module 6's phase-kickback!). Safe rule: drop a phase only when it multiplies the *entire* state of the *entire* system.
- **Expecting phase gates to change histograms directly.** $R_z$/S/T alone never change Z-statistics; if your "phase experiment" shows flat histograms, you forgot the interference stage (the closing H). No H-sandwich, no phase readout.
- **Building non-unitary intentions.** "Copy this qubit," "reset mid-circuit unitarily," "if amplitude > x then…" — all non-unitary, all impossible as gates. The unitary-or-measurement dichotomy is a *design constraint*: plan circuits within it rather than fighting the compiler.
- **Misreading $R_z$ conventions.** $\mathrm{diag}(1, e^{i\gamma})$ (the "phase gate" $P(\gamma)$) and $\mathrm{diag}(e^{-i\gamma/2}, e^{i\gamma/2})$ ($R_z$) differ by a global phase — same physics alone, DIFFERENT results when controlled (see gotcha 2!). Qiskit has both `p()` and `rz()`; choose knowingly.
- **Forgetting that identical circuits give identical states.** All quantum randomness enters at measurement. If two noiseless-simulator statevectors differ, you changed the circuit (or the convention), not the dice.

## Scenario — the interview whiteboard, phase edition

Common quantum-software interview arc, verbatim from the field: *"Here's a circuit: H, then T, then H, on $\ket0$. (a) Output probabilities? (b) Now swap the T for an $R_z(\pi/4)$ — do the probabilities change? (c) Now make each version controlled by another qubit — same question."* You, calmly: (a) T writes relative phase $e^{i\pi/4}$; master formula: $p(0) = \cos^2\tfrac\pi8 \approx 0.854$. (b) No change — T and $R_z(\pi/4)$ differ by a global phase $e^{i\pi/8}$, invisible… (c) …*until controlled*: controlling promotes that global phase to a relative phase on the control qubit (kickback), so the two controlled versions ARE physically different circuits. Offer extended. The question is popular precisely because it laddered all three rungs of today's lesson — and (c) filters out everyone who memorized "global phase doesn't matter" without the multi-qubit fine print.

## Key points

- Unitarity = linear + norm-preserving = conservation of probability; it is forced, and it gifts reversibility ($U^{-1} = U^\dagger$) and overlap preservation (no mid-circuit information loss).
- Gates are exponentiated Hamiltonians ($U = e^{-i\hat Ht/\hbar}$): analog physics under digital abstraction — the origin of gate times, errors, and calibration.
- Global phase (whole state) is physically void — factor it out early; gates differing by it are the same gate. Relative phase (between components) is the information carrier.
- The master identity: $\ket0 \to H \to \text{phase }\gamma \to H$ gives $p(0) = \cos^2\tfrac\gamma2$ — the universal phase-reading sandwich; no interference stage, no phase readout.
- Algorithms = fan out (H's) → write phases (oracle) → interfere (H/QFT) → measure: superposition is canvas, phase is paint, interference is reveal.
- Multi-qubit warning planted: phases global to a subsystem become relative under control — the fine print that makes Module 6's kickback, and interviews, work.

## Check yourself

```quiz
{"q":"Circuits U and e^{iπ/3}·U (same gate up to global phase) are compared on every input and every measurement basis. What differs?","options":["Outcome probabilities shift by 1/3","Nothing measurable — but if each is made CONTROLLED by another qubit, the two controlled circuits differ physically","The second violates unitarity","The second runs slower on hardware"],"answer":1,"why":"Global phase is invisible on the full state — but controlling a gate promotes its global phase to a relative phase entangled with the control, which interference can then read. Both halves of this fact are interview staples."}
```

```quiz
{"q":"Why can't any quantum gate implement 'reset this qubit to |0⟩ regardless of its state'?","options":["It would be too slow","It maps distinct states |0⟩ and |1⟩ to the same output — losing information — which unitaries (invertible, overlap-preserving) cannot do","Resetting requires negative amplitudes","It can — the X gate does this"],"answer":1,"why":"Unitaries are invertible: outputs determine inputs. Many-to-one maps like reset destroy information and require non-unitary means — measurement or fresh ancilla qubits. This constraint actively shapes circuit design."}
```

## Exercises

**Exercise 1 — the uncomputation drill.** Let $U = H\,S\,H$ (applied right-to-left to $\ket0$). (a) Compute $\ket{\psi_{\text{out}}} = U\ket0$ (reuse the master formula with γ = π/2). (b) Write down $U^\dagger$ as an explicit gate sequence and verify — by matrix multiplication in NumPy — that $U^\dagger U = I$ and that $U^\dagger\ket{\psi_{\text{out}}} = \ket0$. (c) One sentence: why is the dagger-sequence order reversed?

````solution
(a) γ = π/2 (S's relative phase is $i = e^{i\pi/2}$): $p(0) = \cos^2\tfrac\pi4 = \tfrac12$, $p(1) = \tfrac12$; the state (from the Bloch walkthrough last lesson) is $\ket{-i}$-equivalent: $\tfrac{1}{\sqrt2}(\ket0 - i\ket1)$ up to global phase.

(b) $U^\dagger = (HSH)^\dagger = H^\dagger S^\dagger H^\dagger = H\,S^\dagger\,H$ (H is Hermitian: its own dagger; $S^\dagger = \mathrm{diag}(1, -i)$, the "S-dagger" gate — a real gate name you'll type in Qiskit as `sdg`).

```python
import numpy as np
H = np.array([[1,1],[1,-1]])/np.sqrt(2); S = np.diag([1,1j]); Sdg = np.diag([1,-1j])
U = H @ S @ H
Udg = H @ Sdg @ H
print(np.allclose(Udg @ U, np.eye(2)))          # True
out = U @ np.array([1,0], dtype=complex)
print(np.round(Udg @ out, 10))                  # [1.+0.j 0.+0.j] → back to |0⟩ ✓
```

(c) Undoing must peel the outermost (last-applied) operation first — $(ABC)^\dagger = C^\dagger B^\dagger A^\dagger$ — the socks-and-shoes law, now executed rather than recited. Uncomputation in Module 8 is precisely this: run the scratch-computation's dagger-sequence to return ancillas to $\ket0$ without measuring them.
````

**Exercise 2 — design a phase-writer you can read.** Using only gates from this module (H, S, T, Z, $R_z(\gamma)$), design and verify a circuit that outputs $p(1) = 0.85$ from input $\ket0$. Constraints: exactly two H gates; the tunable knob must be a single $R_z$. Give the required γ (numerically), the circuit order, and NumPy verification. Then answer: what OTHER γ in $[0, 2\pi)$ meets the spec, and how would downstream Y-basis statistics distinguish your two designs?

````solution
Circuit: $\ket0 \to H \to R_z(\gamma) \to H \to$ measure. Master formula gives $p(1) = \sin^2(\gamma/2) = 0.85$, so $\gamma = 2\arcsin\sqrt{0.85} \approx 2.3462$ rad.

```python
import numpy as np
H = np.array([[1,1],[1,-1]])/np.sqrt(2)
Rz = lambda g: np.diag([np.exp(-1j*g/2), np.exp(1j*g/2)])
g = 2*np.arcsin(np.sqrt(0.85))
out = H @ Rz(g) @ H @ np.array([1,0], dtype=complex)
print(np.abs(out)**2)          # [0.15 0.85] ✓
```

Second solution: $\gamma' = 2\pi - 2.3462 \approx 3.937$ — since $\sin^2$ is symmetric about π (the trig-lesson mirror-pair, third appearance). The two designs produce identical Z-statistics after the final H, but their *pre-final-H* states differ by phase sign ($e^{i\gamma}$ vs $e^{-i\gamma}$): replace the final H with the Y-basis readout (i.e., apply $S^\dagger$ then H, then measure) and the two designs give $p$-values $\tfrac12(1 \pm \sin\gamma)$ — measurably different (≈0.86 vs ≈0.14). Design lesson, twice-learned now with gates: **specs stated in one basis under-determine the circuit; the ambiguity is real, physical, and resolvable by asking a second basis.** Interviewers adore this exact follow-up.
````

## Practice questions

1. Why does norm preservation for ALL states force $U^\dagger U = I$ rather than something weaker? (Hint: overlaps via the polarization idea — or just cite the eigen lesson's characterization.)
2. Compute the output probabilities of $\ket0 \to H \to Z \to H$ without touching a matrix.
3. Which of these are valid gates: $\mathrm{diag}(1, e^{i0.3})$; $\mathrm{diag}(1, 0.9)$; $\tfrac{1}{\sqrt2}\begin{pmatrix}1 & i\\ i & 1\end{pmatrix}$? Justify each in one clause.
4. State the difference between $P(\gamma) = \mathrm{diag}(1, e^{i\gamma})$ and $R_z(\gamma)$, and the single situation where the difference becomes physical.
5. A teammate's derivation carries $e^{-i\gamma/2}$ prefactors through five pages. What's your one-sentence code-review comment?
6. In the three-beat algorithm template, why must phase-writing happen BETWEEN the two interference stages rather than after the second?
7. **Design question:** using the unitary-only toolbox (no measurement), design a "phase flag": a sequence that leaves the qubit's Z-statistics untouched for arbitrary input states, yet composes with a later fixed readout stage (of your design) to reveal whether the flag was applied. Specify both stages, prove the Z-invariance, and identify what property of unitaries your scheme exploits.

````solution
1. Norm preservation on all states implies inner-product preservation (expand $\lVert U(\ket\phi + \ket\psi)\rVert^2$ and compare — the cross-terms force $\braket{U\phi}{U\psi} = \braket{\phi}{\psi}$), and preserving all inner products against all bases forces $U^\dagger U = I$.
2. HZH = X, so the output is $X\ket0 = \ket1$: p(1) = 1. (Or: γ = π in the master formula.)
3. Valid ($P(0.3)$: unitary, phases on the diagonal); invalid (0.9 shrinks $\ket1$'s norm — probability leaks); valid (check columns orthonormal: it's $e^{i\pi/4}R_x(\pi/2)$-like — unitary ✓).
4. They differ by global phase $e^{-i\gamma/2}$: identical solo, different when controlled (the control qubit acquires the phase difference as relative phase — kickback). Controlled-P vs controlled-Rz are different circuits.
5. "Factor the global phase at step 1 and drop it with a note — Born rule kills it; five pages of bookkeeping is five pages of bug surface." (Plus the caveat: keep it if this block will later be *controlled*.)
6. The second interference stage is what converts phases into populations; phases written after it are never read — like developing film before exposing it.
7. Model design: flag stage = $R_z(\pi)$ (≅ Z up to global phase); readout stage = H then measure. Z-invariance proof: $R_z$ is diagonal ⇒ $|\alpha|^2, |\beta|^2$ untouched for any input ✓. Composition: on inputs prepared as $\ket+$ (part of the readout protocol: prepare $\ket+$, maybe-flag, H, measure), no-flag gives certainly 0, flag gives certainly 1 (HZH = X). Exploited property: unitaries preserve information without exposing it — the flag is *stored* in phase, *invisible* to Z (diagonality), and *retrievable* by the interference stage (H-sandwich). This tiny design is the skeleton of quantum watermarking, error-syndrome extraction, AND the DJ oracle — you have now designed, in one exercise, the pattern Module 8 industrializes.
````
