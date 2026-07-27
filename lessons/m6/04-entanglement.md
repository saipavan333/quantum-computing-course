# Entanglement, Bell states & no-cloning

Schrödinger called entanglement "*the* characteristic trait of quantum mechanics." Einstein called it "spooky action at a distance" and spent years trying to kill it. Experiment sided with Schrödinger — the 2022 Nobel Prize went to the people who proved it. Today you get the working professional's version: the four Bell states, how to create and verify them, what entanglement can and cannot do (no faster-than-light anything — you'll prove it), why quantum data can't be copied, and what a Bell test actually shows.

## 1. The four Bell states — the alphabet of entanglement

The maximally entangled two-qubit states, mutually orthonormal (they form a basis of $\mathbb{C}^4$ — the **Bell basis**):

$$\ket{\Phi^+} = \tfrac{\ket{00} + \ket{11}}{\sqrt2} \qquad \ket{\Phi^-} = \tfrac{\ket{00} - \ket{11}}{\sqrt2} \qquad \ket{\Psi^+} = \tfrac{\ket{01} + \ket{10}}{\sqrt2} \qquad \ket{\Psi^-} = \tfrac{\ket{01} - \ket{10}}{\sqrt2}$$

Organize them by two classical-looking bits: **parity** (Φ = agree, Ψ = disagree) and **phase** (± sign). One Pauli on one qubit converts any Bell state to any other ($X$ toggles parity, $Z$ toggles phase) — a fact that powers superdense coding next lesson and error correction in Module 10.

**Creation** (the standard two-liner, now fully explicable): H on one qubit, CNOT to the other:

$$\ket{00} \xrightarrow{H\otimes I} \tfrac{(\ket0 + \ket1)\ket0}{\sqrt2} \xrightarrow{\text{CNOT}} \tfrac{\ket{00} + \ket{11}}{\sqrt2} = \ket{\Phi^+}$$

@@diagram:bell-circuit|The Bell factory: H fans out, CNOT correlates. Reading it backwards (CNOT, then H, then measure) is a Bell-basis MEASUREMENT — the same circuit, run in reverse, distinguishes all four Bell states.

**Verification** (run it backward!): since the creation circuit is unitary, its inverse (CNOT then H — self-inverse gates, reversed order) maps each Bell state to a distinct basis state: $\Phi^+\to\ket{00}$, $\Phi^-\to\ket{10}$, $\Psi^+\to\ket{01}$, $\Psi^-\to\ket{11}$. Append measurement: a **Bell measurement** — the primitive at the heart of teleportation.

## 2. What entanglement means operationally

Take $\ket{\Phi^+}$ and interrogate it with everything you own:

**Each qubit alone is a perfect coin.** Marginal statistics: $p(0) = p(1) = \tfrac12$ for either qubit, in the Z basis — and (compute it — exercise 1) in *every* basis. A single qubit of a Bell pair is indistinguishable from white noise. Formally its "reduced state" is the maximally mixed state — the Bloch sphere's *center*, the sphere picture's confessed blind spot.

**Jointly, they're perfectly correlated — in multiple bases at once.** Z⊗Z: outcomes always agree (only $\ket{00}, \ket{11}$ appear). And rewrite $\ket{\Phi^+}$ in the X basis (expand and cancel — do it once by hand):

$$\ket{\Phi^+} = \tfrac{\ket{++} + \ket{--}}{\sqrt2}$$

X-measurements agree too! Classical correlated coins can agree in ONE basis (paint both heads); agreeing in two incompatible bases simultaneously has no classical analogue — that dual correlation *is* the quantum surplus, and it's exactly what Bell tests quantify.

**No signaling — prove it and own it forever.** Alice (qubit A) and Bob (qubit B) share $\ket{\Phi^+}$ across a galaxy. Whatever Alice does — measure in any basis, apply any gate, or nothing — Bob's *local* statistics remain 50/50 white noise: Alice's actions change the *joint* distribution (visible only when they later compare notes over a classical channel), never Bob's marginal. One-line proof sketch: Bob's statistics come from his reduced state, and local operations on A provably cannot alter the reduced state of B (operations on A commute with tracing out A). **Entanglement correlates; it does not communicate.** Any "quantum telegraph" startup pitch dies on this theorem.

## 3. No-cloning — why quantum data is un-copyable

**Theorem**: no unitary $U$ satisfies $U\ket\psi\ket0 = \ket\psi\ket\psi$ for all states $\ket\psi$.

**Proof** (two lines, inner products — Dirac lesson pays off): suppose it works for two states $\psi, \phi$. Unitaries preserve inner products, so $\braket{\psi}{\phi} = \braket{\psi}{\phi}^2$ (left side before, right side after — the overlap of the doubled states is the square). A number equal to its own square is 0 or 1: the "copier" works only on identical or orthogonal states — i.e., on *classical* data. General superpositions: impossible. ∎

Consequences, each load-bearing:

- **CNOT's "copy" is the legal maximum**: basis states copy; superpositions entangle instead (last lesson's observation, now upgraded to theorem).
- **Quantum cryptography works**: an eavesdropper cannot copy-and-forward the qubit; she must measure (disturb) or pass untouched — detectability is physics, not implementation.
- **Error correction can't just back up the data** (Module 10's whole difficulty and triumph: protect without copying, via entanglement itself).
- **Measurement statistics need fresh states**: "re-run the preparation" not "photocopy the qubit" — the Module 3/5 workflow was forced, not chosen.

## 4. Bell's theorem — the death certificate for hidden variables

The skeptic's last stand (from the quantum-world lesson): "fine, the qubits agreed in advance — a shared hidden plan, set at creation." Bell (1964): any such local-hidden-plan theory obeys an arithmetic bound on correlations across measurement settings; quantum mechanics violates it.

**The CHSH game version** (the one to remember): Alice and Bob each receive a random bit ($x, y$), each outputs a bit ($a, b$); they win iff $a \oplus b = x\wedge y$. Sharing classical strategy (any hidden plan): max win rate **75%** (try to beat it — you can't). Sharing a Bell pair and measuring in cleverly tilted bases (angles 0, π/4 for Alice; π/8, −π/8 for Bob): win rate $\cos^2(\pi/8) \approx$ **85.4%**. Experiments (loophole-free since 2015) confirm the quantum value. Conclusion: the correlations were NOT pre-agreed — nature genuinely produces stronger-than-classical correlation, with no local classical mechanism underneath. (And yet: still no signaling — the outputs are locally random; only the *correlation pattern* is superclassical.)

For your career: CHSH is the standard *certification* tool — "is this pair of qubits actually entangled?" is answered by playing this game against your own hardware (device benchmarking, entanglement witnesses, quantum network commissioning). It's also a beloved interview topic because it separates "heard about spookiness" from "can compute the 85%."

## Worked example — Bell-pair QA on your own simulator

*Certify $\ket{\Phi^+}$ production three ways: statistics, dual-basis correlation, and disentangling.*

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

# create
bell = QuantumCircuit(2); bell.h(0); bell.cx(0, 1)
sv = Statevector(bell)

# 1) joint Z statistics: agreement
print(sv.probabilities_dict())                # {'00': 0.5, '11': 0.5} ✓ parity even

# 2) X-basis correlation: append H to BOTH, re-check
xbasis = bell.copy(); xbasis.h(0); xbasis.h(1)
print(Statevector(xbasis).probabilities_dict())   # {'00': 0.5, '11': 0.5} ✓ agree in X too!

# 3) run the factory backwards: should land exactly on |00⟩
undo = bell.copy(); undo.cx(0, 1); undo.h(0)
print(Statevector(undo).probabilities_dict())     # {'00': 1.0} ✓ Bell-measured as Φ+

# and the marginal: each qubit alone is a coin
print(sv.probabilities_dict([0]), sv.probabilities_dict([1]))   # {'0': .5, '1': .5} × 2
```

Four checks, four passes: agreement in Z, agreement in X (the classically impossible pair), perfect reverse-circuit identification, and white-noise marginals. This *is* the acceptance test suite for entangled-pair sources — on real hardware (Module 7) the same four numbers come back as 0.94-ish instead of 1.0, and the gap becomes your noise-diagnosis material (Module 9).

## Gotchas

- **"Measuring Alice's qubit changes Bob's qubit."** Operationally false as stated: Bob's local statistics never change (no-signaling). What "changes" is the conditional description *given Alice's result* — which requires her classical phone call to exploit. Say it carefully in interviews; sloppy phrasing here is a red flag to physicists.
- **"Entangled = correlated."** Classical correlation exists (two envelopes, same letter). Entanglement = correlation in *incompatible bases simultaneously* + Bell-inequality violation. The X-basis check is what separates the cases — always run it.
- **Confusing the Bell states.** They differ by one sign or one bit-position — and by ONE local Pauli. Keep the 2-bit taxonomy (parity, phase); convert deliberately, not by memory.
- **Reading the reduced coin as "we just don't know".** A Bell-pair qubit's 50/50 is NOT ignorance of a definite local state — no local state exists (that's the factorization proof). Mixed-from-entanglement vs mixed-from-ignorance are operationally identical *locally* — the distinction lives in the joint state. (This subtlety becomes density matrices in Module 9.)
- **Expecting entanglement to survive anything.** One qubit decohering degrades the *pair's* correlations; entanglement is a shared resource with a shared failure domain — and it cannot be "topped up" locally (LOCC can't increase entanglement — another theorem worth quoting).
- **Cloning by cleverness.** Amplifiers, repeated weak measurements, "just measure in the right basis" — all fail; the theorem has no loopholes for effort. Quantum repeaters work around it (entanglement swapping), never through it.

## Scenario — the quantum network commissioning call

You're the applications engineer on a metro quantum-network pilot (banks want QKD). The link vendor claims "entangled photon pairs delivered between sites A and B, fidelity 0.92." Your acceptance protocol, straight from this lesson: (1) Z-basis coincidence rate — measured agreement 95.1% (spec ≥ 94%) ✓; (2) X-basis agreement — 93.8% ✓ (classical sources cap at ~50% here without conspiracies — this number alone rules out "it's just correlated laser noise"); (3) CHSH: S-value 2.71 ± 0.03 against the classical bound of 2 (quantum max ≈ 2.83) — 23σ violation ✓; (4) marginals at each site: 50/50 ± SE, no signaling artifacts ✓. You sign off, attaching the four plots. Sixty days later a contractor "optimizes" a fiber path; X-agreement drops to 71% while Z stays 95% — you diagnose *phase* decoherence in transit (Z-correlations survive dephasing; X-correlations are exactly what dephasing kills — the Bloch-spiral lesson at network scale), and the fix (polarization compensation) follows from the diagnosis. Entanglement literacy = network debugging literacy.

### ▶ Run it live

Build a Bell state and sample it — the two qubits always agree, the signature of entanglement:

```run
# expect: {'00'
qc = QuantumCircuit(2); qc.h(0); qc.cx(0, 1)
print("Bell probabilities:", qc.probabilities())
print("2000 shots:", qc.sample(2000, seed=7))
```

## Key points

- Four Bell states, indexed by parity (Φ/Ψ) and phase (±); local Paulis interconvert them; H+CNOT creates, reversed circuit measures in the Bell basis.
- Entangled pairs: individually pure noise (reduced state = Bloch center), jointly correlated in incompatible bases at once ($\Phi^+$ agrees in both Z and X) — the classically impossible signature.
- No-signaling: local operations on one side never move the other side's statistics — entanglement correlates but cannot communicate; exploiting correlations requires classical messages.
- No-cloning (two-line inner-product proof): only orthogonal/classical data copies; hence QKD's security, error correction's difficulty, and fresh-state statistics.
- CHSH: classical strategies ≤ 75% (S ≤ 2); quantum reaches 85.4% (S = 2√2) — experimentally confirmed, hidden variables dead, and the standard entanglement certification tool.
- The four-check QA suite (Z-agreement, X-agreement, reverse-circuit, marginals) is a real acceptance test you can run today on a simulator and next module on hardware.

## Check yourself

```quiz
{"q":"Alice measures her half of a Φ+ pair and gets '1'. What can Bob (no phone call yet) observe locally?","options":["His qubit now reads '1' with certainty — he learns Alice measured","Nothing changed for him: his local statistics are 50/50 before and after; the correlation is only visible when results are compared classically","His qubit collapsed to |−⟩","His measurements now weakly drift toward '1'"],"answer":1,"why":"No-signaling: Bob's marginal is unchanged by anything Alice does. Given Alice's result (learned by classical channel), his outcome is determined — but 'given' is doing all the work."}
```

```quiz
{"q":"Why does the no-cloning proof conclude copying works only for orthogonal states?","options":["Because unitaries preserve inner products, forcing ⟨ψ|φ⟩ = ⟨ψ|φ⟩², whose only solutions are 0 and 1","Because measurement destroys superposition","Because orthogonal states are classical and classical data is copyable by definition","Because the CNOT gate only has two inputs"],"answer":0,"why":"Overlap before = overlap after (unitarity); cloning squares the overlap; x = x² ⇒ x ∈ {0,1}: identical or orthogonal states only. Two lines, no loopholes."}
```

## Exercises

**Exercise 1 — the dual-basis identity, by hand.** Show algebraically that $\ket{\Phi^+} = \tfrac{1}{\sqrt2}(\ket{++} + \ket{--})$, and that $\ket{\Phi^-} = \tfrac{1}{\sqrt2}(\ket{+-} + \ket{-+})$. Then answer: in the X basis, do $\Phi^-$'s qubits agree or disagree — and what does that tell you about using basis choice to distinguish Bell states?

````solution
Expand $\ket{\pm} = \tfrac{\ket0\pm\ket1}{\sqrt2}$:

$$\tfrac{1}{\sqrt2}(\ket{++} + \ket{--}) = \tfrac{1}{2\sqrt2}\big[(\ket0+\ket1)(\ket0+\ket1) + (\ket0-\ket1)(\ket0-\ket1)\big]$$

Cross terms ($\ket{01}, \ket{10}$) cancel between the two products; diagonal terms double: $= \tfrac{1}{2\sqrt2}\cdot 2(\ket{00} + \ket{11}) = \ket{\Phi^+}$ ✓.

Similarly $\tfrac{1}{\sqrt2}(\ket{+-} + \ket{-+})$: now the diagonal terms cancel and cross terms… expand: $(\ket0{+}\ket1)(\ket0{-}\ket1) + (\ket0{-}\ket1)(\ket0{+}\ket1) = 2(\ket{00} - \ket{11})$, giving $\ket{\Phi^-}$ ✓.

So in the X basis: $\Phi^+$ agrees, $\Phi^-$ **disagrees** — while in Z both Φ states agree! The measurement-basis table:

| State | Z-basis | X-basis |
|---|---|---|
| $\Phi^+$ | agree | agree |
| $\Phi^-$ | agree | disagree |
| $\Psi^+$ | disagree | agree |
| $\Psi^-$ | disagree | disagree |

Two binary questions (Z-parity, X-parity), four states fully distinguished — by *local* measurements plus classical comparison. This table is quietly profound: it's how superdense coding decodes (next lesson) and how stabilizer codes label errors (Module 10). Two bases, four answers: the quantum surplus, tabulated.
````

**Exercise 2 — play CHSH against your simulator.** Implement the CHSH game: prepare $\ket{\Phi^+}$; Alice measures in basis Z ($x{=}0$) or X ($x{=}1$); Bob measures in bases rotated by $\pm\pi/8$ ($R_y(\mp\pi/4)$ before Z-measurement for $y = 0, 1$). Estimate the win rate over all four $(x,y)$ settings with `Statevector` probabilities (exact, no sampling needed), and compare with 75% classical / 85.36% quantum.

````solution
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def win_prob(x, y):
    qc = QuantumCircuit(2)
    qc.h(0); qc.cx(0, 1)                       # Φ+  (Alice = q0, Bob = q1)
    if x == 1: qc.h(0)                         # Alice X-basis via H then Z-measure
    qc.ry(-np.pi/4 if y == 0 else np.pi/4, 1)  # Bob's tilted bases (±π/8 on the sphere → ry by ∓π/4)
    probs = Statevector(qc).probabilities_dict()
    # win iff a XOR b == x AND y
    target = x & y
    return sum(p for bits, p in probs.items()
               if (int(bits[0]) ^ int(bits[1])) == target)   # bits = 'q1 q0'

rates = [win_prob(x, y) for x in (0,1) for y in (0,1)]
print([round(r, 4) for r in rates])      # [0.8536, 0.8536, 0.8536, 0.8536]
print("overall:", round(sum(rates)/4, 4))  # 0.8536  = cos²(π/8) ✓
```

All four settings win at $\cos^2(\pi/8) \approx 0.8536$ — beating every classical strategy's 0.75 ceiling by construction, not luck. Notes for full ownership: (1) the XOR reads bits from the little-endian string — the ordering lesson, still collecting rent; (2) Bob's ±π/8 measurement bases become $R_y(\mp\pi/4)$ *rotations* because rotating the state by −θ equals rotating the measurement by +θ, and Bloch angles double — three old lessons in one line; (3) on real hardware this same script (with sampling + error bars, Module 3 style) yields S ≈ 2.6–2.75: your first publishable-grade experiment, and Module 7 will run it.
````

## Practice questions

1. Which local Pauli on which qubit converts $\ket{\Phi^+}$ to $\ket{\Psi^-}$? (Two operations — or one qubit's Y.)
2. Why does the X-basis agreement of $\Phi^+$ rule out "two envelopes with the same letter" explanations?
3. State the no-cloning theorem precisely, including the quantifier that makes it non-trivial.
4. A vendor claims their "quantum amplifier" copies qubit states with 100% fidelity for the BB84 states specifically. Possible? (Careful: which BB84 states are mutually orthogonal?)
5. Alice applies Z to her half of $\Phi^+$. What state results, and when (if ever) can Bob detect that anything happened?
6. Your hardware Bell test gives Z-agreement 0.96 but X-agreement 0.62. Which noise process is indicated, and which single-qubit lesson plot does this echo?
7. **Design question:** design the acceptance test for a claimed "3-qubit GHZ source" ($\tfrac{1}{\sqrt2}(\ket{000} + \ket{111})$): give the creation circuit, the reverse-circuit check, the two(+) basis-correlation checks you'd run with expected outcomes, and one failure signature with its diagnosis.

````solution
1. $Y$ on either qubit: Y = iXZ toggles both parity (X) and phase (Z). (Equivalently X then Z on one side, global phase aside.)
2. Envelopes fix answers to ONE question. Agreement under the X-question too would require the envelopes to have pre-agreed answers to *both* questions — and CHSH shows no such double-ledger can reproduce the full correlation pattern (75% ceiling vs observed 85%).
3. No single unitary $U$ with $U(\ket\psi\otimes\ket0) = \ket\psi\otimes\ket\psi$ **for all** $\ket\psi$. (For any *fixed known* state, preparing a second copy is trivial — the "all" is the theorem.)
4. BB84 uses $\{\ket0,\ket1,\ket+,\ket-\}$: pairs within a basis are orthogonal (copyable), but the set contains non-orthogonal pairs ($\ket0,\ket+$: overlap $\tfrac{1}{\sqrt2}$) — a device cloning ALL four perfectly violates the theorem. Impossible; and the impossibility IS the security.
5. $\ket{\Phi^-}$. Bob alone: never (his marginal is unchanged — no-signaling). Jointly: detectable as soon as results are compared — X-basis agreement flips to disagreement (the exercise's table, row 2).
6. Dephasing (phase decoherence): Z-correlations (populations) survive; X-correlations (coherences) decay — the two-qubit echo of the Bloch spiral-to-center plot from the Bloch lesson.
7. Model answer: creation = H(q0), CX(0,1), CX(0,2) (or CX(1,2) — chain). Reverse check: run CX(0,2), CX(0,1), H(0) → expect $\ket{000}$ with probability 1. Correlations: (i) Z-basis: only '000' and '111', 50/50 — all-agree parity; (ii) X-basis (H on all three): expect only outcomes with an EVEN number of minus results… concretely $\ket{GHZ} = \tfrac12(\ket{+++} + \ket{+--} + \ket{-+-} + \ket{--+})$: even number of −'s, each ¼ — check that odd-minus outcomes are absent; (iii) bonus: any SINGLE qubit's marginal = 50/50, and any PAIR's reduced state shows *classical* correlation only (GHZ pairs are not Bell-entangled — a famous subtlety: full credit for flagging it). Failure signature: '000'/'111' at 50/50 but X-check uniform over all 8 outcomes ⇒ the source produces the classical mixture ("both-envelopes") not the superposition — i.e., coherence lost; diagnose dephasing or premature which-path leakage in the source. The suite mirrors the two-qubit QA but with the GHZ-specific parity fingerprints — designing it from scratch means you understand *why* each check exists.
````
