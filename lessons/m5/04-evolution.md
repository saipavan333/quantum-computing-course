# Gates as unitary evolution & the phase that matters

Rule 2 says unobserved quantum states evolve unitarily. This lesson makes that rule *yours*: why unitarity is forced (not chosen), what it permits and forbids, and the definitive treatment of the distinction that runs every algorithm — global phase (meaningless) versus relative phase (everything). By the end you'll compute interference through gate sequences as fluently as arithmetic.

## Start here — the intuition

While no one is looking, the only moves a quantum state is allowed are **reversible rotations** — that's what "unitary" means, and it's forced on us by a single fact: probabilities must always add to 1, before and after. Nothing can leak. So every gate can be exactly undone, and no gate can "erase" a qubit to $\ket0$ (that would throw information away).

The one subtlety that runs every algorithm is about **phase**, and it splits in two. A phase applied to the *whole* state — **global phase** — is completely invisible; no experiment can ever detect it. But a phase applied to *part* of the state — **relative phase** — is like invisible ink: a plain 0/1 measurement can't see it, yet an interference step (an $H$) *develops* it into a visible difference. Quantum algorithms live in that gap: spread amplitude out, write the answer in invisible phase‑ink, then interfere to make it appear. This lesson makes that precise.

## Why evolution must be unitary

Evolution is **linear** (it acts on superpositions component‑wise), so it's a matrix $U$: $\ket\psi \to U\ket\psi$. It must **preserve normalization** (probabilities stay summed to 1 for every state), and that single requirement forces $U^\dagger U = I$. **Unitary is not a design choice; it's conservation of probability wearing matrix clothes.** (Physically, $U = e^{-i\hat H t/\hbar}$ — a Hamiltonian shaped by microwave pulses; that's why gates take nanoseconds and have error rates: analog physics, digitally abstracted.)

Consequences you now own: **reversibility** — $U^{-1} = U^\dagger$ always exists, so any gate sequence is undone by the daggered gates in reverse order (uncomputation, a standard Module 8 subroutine); **no mid‑circuit information loss** — distinct states stay distinct, so there is no unitary "set qubit to 0" (reset needs measurement or fresh qubits); and **composition closes** — an entire algorithm is one big $U$.

## Global vs relative phase — the final word

**Global phase** $\ket\psi \to e^{i\gamma}\ket\psi$: by the Born rule $|e^{i\gamma}\braket{b}{\psi}|^2 = |\braket{b}{\psi}|^2$ — every probability, every basis, forever unchanged. Descriptive residue, not physics; gates differing by global phase are the *same* gate ($Z$ and $-Z$ act identically). **Relative phase** $\alpha\ket0 + \beta\ket1 \to \alpha\ket0 + e^{i\gamma}\beta\ket1$: Z‑statistics unchanged ($|e^{i\gamma}\beta|^2 = |\beta|^2$), but the state moved, and an interference gate converts the phase into populations. The canonical converter is $H$:

$$H\left(\tfrac{\ket0 + e^{i\gamma}\ket1}{\sqrt2}\right) \implies p(0) = \cos^2\tfrac\gamma2, \quad p(1) = \sin^2\tfrac\gamma2$$

@@diagram:global-vs-relative|Global phase rotates the whole state — no experiment sees it. Relative phase rotates components against each other — interference converts it into measurable populations.

@@widget

That formula is the Mach‑Zehnder result and the master identity: **the H‑sandwich (H, phase, H) is the universal phase‑reading instrument.**

## Predict, then run — invisible vs readable phase

The live cell shows both halves: a phase on the whole state does nothing, but the same kind of phase written *between* two $H$'s becomes fully measurable.

**Predict first.** $R_z$ applied to $\ket0$ (which is one of its eigenstates) only multiplies it by a phase. So will `Rz(1.3)` on $\ket0$ change the measured probabilities at all? Then: in the H‑sandwich, what should $p(0)$ equal? Guess both, then Run.

```run
# Live cell — global phase is invisible; relative phase is revealed by interference.
import numpy as np

# Rz on |0> only multiplies it by a phase (|0> is an eigenstate) -> nothing measurable changes:
qc = QuantumCircuit(1); qc.rz(1.3, 0)
print("Rz(1.3)|0>:", {k: round(v,3) for k,v in qc.probabilities().items()}, "  <- global phase, invisible")

# But Rz BETWEEN two H's writes a RELATIVE phase that interference reveals:
#   H . Rz(gamma) . H |0>  ->  p(0) = cos^2(gamma/2)
print("\ngamma   p(0)    cos^2(gamma/2)")
for gamma in [0.0, np.pi/2, np.pi, 2.2]:
    qc = QuantumCircuit(1); qc.h(0); qc.rz(gamma, 0); qc.h(0)
    p0 = qc.probabilities().get("0", 0.0)
    print(f"{gamma:5.2f}   {p0:.3f}   {np.cos(gamma/2)**2:.3f}")
```

`Rz(1.3)|0>` stays 100% "0" — the phase was global, invisible. But sandwiched between two $H$'s, that same $R_z(\gamma)$ tunes $p(0)$ smoothly through $\cos^2(\gamma/2)$: the phase was written as *relative*, hidden from a direct look, then developed by interference. No H‑sandwich, no phase readout.

```quiz
{"q":"Circuits U and e^{iπ/3}·U (same gate up to global phase) are compared on every input and every basis. What differs?","options":["Outcome probabilities shift by 1/3","Nothing measurable — but if each is made CONTROLLED by another qubit, the two controlled circuits differ physically","The second violates unitarity","The second runs slower on hardware"],"answer":1,"why":"Global phase is invisible on the full state — but controlling a gate promotes its global phase to a relative phase entangled with the control, which interference can then read. Both halves are interview staples."}
```

## Interference as the computational engine

Every Module 8 algorithm is three beats. **Fan out:** Hadamards create superposition over all $2^n$ inputs. **Write phases:** the problem's structure is encoded as *relative phases* (e.g. an oracle flips the sign of the answer) — invisible to an immediate measurement, exactly like $\ket+$ vs $\ket-$. **Interfere to reveal:** a final stage (more Hadamards, or a QFT) converts phase patterns into populations, so wrong answers cancel and right answers reinforce. Then measure. Superposition is the canvas, **phases are the paint, interference is the reveal** — and decoherence (Module 9) is the environment reading the phases early, bleaching the paint.

## Level up — gotchas the pros watch for

- **Chasing global phases through derivations.** Factor them out the moment they appear and say you did; pages of $e^{-i\gamma/2}$ bookkeeping that cancels at the Born rule is a self‑inflicted wound.
- **…but discarding phases that are only *locally* global.** In multi‑qubit circuits a phase global to one qubit can be relative to another once they entangle (controlled gates — Module 6's kickback). Drop a phase only when it multiplies the *entire* state of the *entire* system.
- **Expecting phase gates to change histograms directly.** $R_z$/S/T alone never change Z‑statistics; if your "phase experiment" shows flat histograms, you forgot the closing $H$.
- **Building non‑unitary intentions.** "Copy this qubit," "reset mid‑circuit unitarily," "if amplitude > x then…" — all impossible as gates. Plan circuits within the unitary‑or‑measurement dichotomy.
- **Misreading conventions.** $P(\gamma) = \mathrm{diag}(1, e^{i\gamma})$ and $R_z(\gamma) = \mathrm{diag}(e^{-i\gamma/2}, e^{i\gamma/2})$ differ by a global phase — same alone, *different when controlled*.

## Level up — the interview whiteboard, phase edition

*"Circuit: H, then T, then H, on $\ket0$. (a) Output probabilities? (b) Swap T for $R_z(\pi/4)$ — do they change? (c) Make each controlled — same question."* Answer: (a) T writes phase $e^{i\pi/4}$; master formula $p(0) = \cos^2\tfrac\pi8 \approx 0.854$. (b) No change — T and $R_z(\pi/4)$ differ by a global phase, invisible… (c) …*until controlled*: controlling promotes that global phase to a relative phase on the control (kickback), so the two controlled versions ARE physically different. Part (c) filters out everyone who memorized "global phase doesn't matter" without the multi‑qubit fine print.

## Key points

- Unitarity = linear + norm‑preserving = conservation of probability; it is forced, and gifts reversibility ($U^{-1} = U^\dagger$) and no mid‑circuit information loss.
- Gates are exponentiated Hamiltonians — analog physics under digital abstraction (origin of gate times, errors, calibration).
- Global phase (whole state) is void — factor it out; relative phase (between components) is the information carrier.
- The master identity: $\ket0 \to H \to \text{phase }\gamma \to H$ gives $p(0) = \cos^2\tfrac\gamma2$ — no interference stage, no phase readout.
- Algorithms = fan out (H's) → write phases (oracle) → interfere (H/QFT) → measure.
- Multi‑qubit warning: phases global to a subsystem become relative under control — the fine print behind Module 6's kickback.

## Check yourself

```quiz
{"q":"Why can't any quantum gate implement 'reset this qubit to |0⟩ regardless of its state'?","options":["It would be too slow","It maps distinct states |0⟩ and |1⟩ to the same output — losing information — which unitaries (invertible, overlap-preserving) cannot do","Resetting requires negative amplitudes","It can — the X gate does this"],"answer":1,"why":"Unitaries are invertible: outputs determine inputs. Many-to-one maps like reset destroy information and require non-unitary means — measurement or fresh ancilla qubits."}
```

## Exercises

**Exercise 1 — the uncomputation drill.** Let $U = H\,S\,H$ (applied to $\ket0$). Compute $U\ket0$ (use the master formula with $\gamma = \pi/2$). Write $U^\dagger$ as an explicit gate sequence and verify (in code) that $U^\dagger U = I$ and $U^\dagger(U\ket0) = \ket0$. Why is the dagger‑sequence order reversed?

````solution
```python
import numpy as np
H=np.array([[1,1],[1,-1]])/np.sqrt(2); S=np.diag([1,1j]); Sdg=np.diag([1,-1j])
U=H@S@H; Udg=H@Sdg@H
print(np.allclose(Udg@U, np.eye(2)))                 # True
print(np.round(Udg @ (U @ np.array([1,0],complex)), 10))   # [1 0] -> back to |0>
```
$U^\dagger = (HSH)^\dagger = H S^\dagger H$ (H is its own dagger; $S^\dagger$ = `sdg`). Undoing peels the last‑applied operation first — $(ABC)^\dagger = C^\dagger B^\dagger A^\dagger$, socks‑and‑shoes. Module 8's uncomputation is exactly this: run a scratch computation's dagger‑sequence to return ancillas to $\ket0$ without measuring.
````

**Exercise 2 — a phase‑writer you can read.** In the live cell, find the $\gamma$ that makes the H‑sandwich output $p(1) = 0.85$ (solve $\sin^2(\gamma/2) = 0.85$). Then note the *other* $\gamma$ in $[0, 2\pi)$ that also gives $p(1)=0.85$, and explain how a Y‑basis readout would tell your two designs apart.

````solution
$\gamma = 2\arcsin\sqrt{0.85} \approx 2.346$; the mirror solution is $2\pi - 2.346 \approx 3.937$. Both give identical Z‑statistics after the final H, but their pre‑final‑H states differ by phase sign; a Y‑basis readout gives $\tfrac12(1 \pm \sin\gamma)$ — measurably different. Specs stated in one basis under‑determine the circuit; a second basis resolves the ambiguity.
````

## Practice questions

1. Why does norm preservation for ALL states force $U^\dagger U = I$?
2. Compute the output of $\ket0 \to H \to Z \to H$ without a matrix.
3. Which are valid gates: $\mathrm{diag}(1, e^{i0.3})$; $\mathrm{diag}(1, 0.9)$; $\tfrac{1}{\sqrt2}\begin{pmatrix}1 & i\\ i & 1\end{pmatrix}$?
4. State the difference between $P(\gamma)$ and $R_z(\gamma)$, and the one situation where it becomes physical.
5. A teammate carries $e^{-i\gamma/2}$ prefactors through five pages. Your one‑sentence review comment?
6. In the three‑beat template, why must phase‑writing happen *between* the interference stages?
7. **Design question:** using unitaries only (no measurement), design a "phase flag" — a sequence leaving Z‑statistics untouched for arbitrary inputs, yet composing with a fixed readout stage to reveal whether the flag was applied. Specify both stages, prove the Z‑invariance, and name the property exploited.

````solution
1. Norm preservation on all states implies inner‑product preservation (expand $\lVert U(\ket\phi+\ket\psi)\rVert^2$; the cross‑terms force $\braket{U\phi}{U\psi} = \braket{\phi}{\psi}$), and preserving all inner products forces $U^\dagger U = I$.
2. $HZH = X$, so output $X\ket0 = \ket1$: $p(1)=1$ ($\gamma=\pi$ in the master formula).
3. Valid ($P(0.3)$, unitary); invalid ($0.9$ shrinks $\ket1$'s norm — probability leaks); valid (columns orthonormal — unitary).
4. They differ by global phase $e^{-i\gamma/2}$: identical solo, different when controlled (the control acquires the phase difference — kickback).
5. "Factor the global phase at step 1 and drop it with a note — the Born rule kills it; five pages of bookkeeping is five pages of bug surface" (keep it only if the block will later be controlled).
6. The second interference stage converts phases into populations; phases written after it are never read — like developing film before exposing it.
7. Flag = $R_z(\pi)$ (≅ Z up to global phase); readout = prepare $\ket+$, maybe‑flag, $H$, measure. Z‑invariance: $R_z$ is diagonal ⇒ $|\alpha|^2, |\beta|^2$ untouched for any input. Composition: no‑flag → certainly 0, flag → certainly 1 ($HZH=X$). Exploited property: unitaries store information without exposing it — hidden in phase (invisible to Z), retrievable by the H‑sandwich. This is the skeleton of the DJ oracle and syndrome extraction.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Explain why evolution must be unitary (conservation of probability) and what that gifts (reversibility, no info loss).
- ☐ Distinguish global phase (invisible) from relative phase (the information carrier).
- ☐ Derive and use the master identity $p(0) = \cos^2(\gamma/2)$ for the H‑sandwich.
- ☐ Run the live cell and explain why $R_z$ on $\ket0$ does nothing but $R_z$ between two $H$'s does everything.
- ☐ Say why no gate can reset or copy a qubit.
- ☐ Describe the three‑beat algorithm template (fan out, write phases, interfere) in one breath.
