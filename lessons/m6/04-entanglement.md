# Entanglement, Bell states & no-cloning

Schrödinger called entanglement "*the* characteristic trait of quantum mechanics." Einstein called it "spooky action at a distance" and spent years trying to kill it. Experiment sided with Schrödinger — the 2022 Nobel Prize went to the people who proved it. Today you get the working professional's version: the four Bell states, how to create and verify them, what entanglement can and cannot do (no faster-than-light anything — you'll prove it), why quantum data can't be copied, and what a Bell test actually shows.

## Start here — the intuition

Two entangled qubits share a **single joint state**, so tightly linked that they *agree no matter which way you measure them* — yet neither qubit has a state of its own. Each one alone looks like pure white noise (a fair coin in every basis); the information lives entirely in the *correlation between them*.

Three facts fence in what this does and doesn't buy you. You **can't copy** a quantum state (no‑cloning) — which is exactly why quantum cryptography is secure. You **can't signal** faster than light with entanglement (no‑signaling) — measuring your half never changes what your partner sees. But you **can** produce correlations too strong for *any* "they secretly agreed in advance" story — that's Bell's theorem, and you'll watch a Bell pair beat the classical limit in a live cell.

## The four Bell states

The maximally entangled two‑qubit states form the **Bell basis**:

$$\ket{\Phi^\pm} = \tfrac{\ket{00} \pm \ket{11}}{\sqrt2}, \qquad \ket{\Psi^\pm} = \tfrac{\ket{01} \pm \ket{10}}{\sqrt2}$$

Index them by two classical‑looking bits: **parity** (Φ = agree, Ψ = disagree) and **phase** (±). One local Pauli flips one bit ($X$ toggles parity, $Z$ toggles phase) — the fact behind superdense coding and error correction. **Creation** is the standard two‑liner: $H$ on one qubit, CNOT to the other, $\ket{00} \to \ket{\Phi^+}$.

@@diagram:bell-circuit|The Bell factory: H fans out, CNOT correlates. Reading it backwards (CNOT, then H, then measure) is a Bell-basis MEASUREMENT — the same circuit, run in reverse, distinguishes all four Bell states.

@@widget

Run the creation circuit *backward* (CNOT then H) and each Bell state maps to a distinct computational state — a **Bell measurement**, the primitive at the heart of teleportation.

## Predict, then run — agreement in two bases at once

A classical pair of coins can be made to always agree in one way of looking (paint both heads). A Bell pair agrees in **two incompatible bases simultaneously** — the signature with no classical analogue.

**Predict first.** $\ket{\Phi^+}$ obviously agrees in Z ($\ket{00}$ or $\ket{11}$). Now measure both qubits in the X basis (an $H$ on each first). Will they still agree, or scramble to random? Guess, then Run.

```run
# Live cell — a Bell pair agrees in TWO incompatible bases; each qubit alone is noise.
import numpy as np
def bell():
    qc = QuantumCircuit(2); qc.h(1); qc.cx(1, 0); return qc

print("Bell in Z basis:", {k: round(v,3) for k,v in bell().probabilities().items()})

qc = bell(); qc.h(0); qc.h(1)                        # rotate BOTH into the X basis
print("Bell in X basis:", {k: round(v,3) for k,v in qc.probabilities().items()})

probs = bell().probabilities()                        # each qubit alone = a fair coin
p_q0_zero = sum(v for k,v in probs.items() if k[1] == '0')   # q0 = right bit
print("qubit 0 alone : p(0) =", round(p_q0_zero, 3), "(white noise)")
```

They agree in X too — impossible for classical coins, which can only pre‑agree about *one* question. Yet each qubit's marginal is a perfect 50/50: **individually pure noise, jointly perfectly correlated in incompatible bases.** That dual correlation *is* the quantum surplus.

```quiz
{"q":"Alice measures her half of a Φ+ pair and gets '1'. What can Bob (no phone call yet) observe locally?","options":["His qubit now reads '1' with certainty — he learns Alice measured","Nothing changed for him: his local statistics are 50/50 before and after; the correlation is only visible when results are compared classically","His qubit collapsed to |−⟩","His measurements now weakly drift toward '1'"],"answer":1,"why":"No-signaling: Bob's marginal is unchanged by anything Alice does. Given Alice's result (learned by classical channel), his outcome is determined — but 'given' is doing all the work."}
```

## No-signaling and no-cloning

**No‑signaling:** whatever Alice does to her qubit — measure in any basis, apply any gate, or nothing — Bob's *local* statistics stay 50/50. Her actions change the *joint* distribution (visible only when they compare notes over a classical channel), never Bob's marginal. Entanglement correlates; it does not communicate — every "quantum telegraph" pitch dies here.

**No‑cloning:** no unitary satisfies $U\ket\psi\ket0 = \ket\psi\ket\psi$ for all $\ket\psi$. Two‑line proof: unitaries preserve inner products, so cloning would force $\braket{\psi}{\phi} = \braket{\psi}{\phi}^2$, and $x = x^2$ only for $x \in \{0,1\}$ — so a "copier" works only on identical or orthogonal (classical) states. Consequences: CNOT copies basis states but entangles superpositions; QKD is secure (an eavesdropper can't copy‑and‑forward); error correction can't just back up the data (Module 10's whole challenge); and measurement statistics need *fresh* states, not photocopies.

## Bell's theorem — the death certificate for hidden variables

The skeptic's last stand: "the qubits agreed in advance — a shared hidden plan." **CHSH game:** Alice and Bob each get a random bit ($x, y$), each output a bit ($a, b$); they win iff $a \oplus b = x \wedge y$. Any classical shared strategy wins **at most 75%** — try to beat it, you can't. Sharing a Bell pair and measuring in cleverly tilted bases wins $\cos^2(\pi/8) \approx$ **85.4%**. Loophole‑free experiments (since 2015) confirm the quantum value: the correlations were *not* pre‑agreed. For your career, CHSH is the standard *certification* tool — "is this pair actually entangled?" is answered by playing this game against your hardware.

```run
# CHSH game: a Bell pair beats every classical strategy (75%) -> ~85.4%.
import numpy as np
def win_prob(x, y):
    qc = QuantumCircuit(2); qc.h(0); qc.cx(0, 1)         # Phi+  (Alice=q0, Bob=q1)
    if x == 1: qc.h(0)                                   # Alice's X basis
    qc.ry(-np.pi/4 if y == 0 else np.pi/4, 1)            # Bob's tilted bases
    probs = qc.probabilities(); target = x & y
    return sum(p for b, p in probs.items() if (int(b[0]) ^ int(b[1])) == target)

rates = [win_prob(x, y) for x in (0,1) for y in (0,1)]
print("win rates:", [round(r,4) for r in rates])
print("overall  :", round(sum(rates)/4, 4), " (classical max 0.75; quantum cos^2(pi/8)=0.8536)")
```

Every setting wins at 85.4% — beating the classical 75% ceiling by construction, not luck. On real hardware the same script (with sampling + error bars) gives an S‑value around 2.6–2.75 against the classical bound of 2: your first publishable‑grade experiment.

## Level up — gotchas the pros watch for

- **"Measuring Alice's qubit changes Bob's qubit."** Operationally false — Bob's local statistics never change; what changes is the *conditional* description given Alice's result, which needs her classical phone call to exploit.
- **"Entangled = correlated."** Classical correlation exists (two identical envelopes); entanglement = correlation in *incompatible bases* + a Bell violation. Always run the X‑basis check.
- **Reading the reduced coin as ignorance.** A Bell‑pair qubit's 50/50 is not ignorance of a definite local state — *no local state exists*. (This becomes density matrices in Module 9.)
- **Expecting entanglement to survive anything.** One qubit decohering degrades the pair's correlations, and entanglement can't be topped up locally (LOCC can't increase it).
- **Cloning by cleverness.** Amplifiers, weak measurements, "just measure in the right basis" — all fail; the theorem has no loopholes.

## Level up — the quantum-network commissioning call

A vendor claims "entangled photon pairs, fidelity 0.92" between two bank sites. Your acceptance protocol: (1) Z‑basis agreement 95.1% ✓; (2) **X‑basis agreement 93.8%** ✓ — classical sources cap near 50% here, so this alone rules out "just correlated laser noise"; (3) CHSH S = 2.71 ± 0.03 against the classical bound of 2 (23σ) ✓; (4) marginals 50/50, no signaling ✓. Sixty days later a contractor reroutes a fiber; X‑agreement drops to 71% while Z stays 95% — you diagnose *phase* decoherence in transit (Z‑correlations survive dephasing; X‑correlations are what dephasing kills — the Bloch spiral at network scale), and the fix (polarization compensation) follows from the diagnosis. Entanglement literacy = network‑debugging literacy.

## Key points

- Four Bell states indexed by parity (Φ/Ψ) and phase (±); local Paulis interconvert them; H+CNOT creates, reversed circuit measures in the Bell basis.
- Entangled pairs: individually white noise (reduced state = Bloch center), jointly correlated in incompatible bases at once — the classically impossible signature.
- No‑signaling: local operations never move the other side's statistics — entanglement correlates but cannot communicate.
- No‑cloning (two‑line proof): only orthogonal/classical data copies — hence QKD security, error‑correction difficulty, and fresh‑state statistics.
- CHSH: classical ≤ 75% (S ≤ 2); quantum reaches 85.4% (S = 2√2) — experimentally confirmed, hidden variables dead, standard certification tool.
- The four‑check QA suite (Z‑agreement, X‑agreement, reverse‑circuit, marginals) is a real acceptance test.

## Check yourself

```quiz
{"q":"Why does the no-cloning proof conclude copying works only for orthogonal states?","options":["Because unitaries preserve inner products, forcing ⟨ψ|φ⟩ = ⟨ψ|φ⟩², whose only solutions are 0 and 1","Because measurement destroys superposition","Because orthogonal states are classical and classical data is copyable by definition","Because the CNOT gate only has two inputs"],"answer":0,"why":"Overlap before = overlap after (unitarity); cloning squares the overlap; x = x² ⇒ x ∈ {0,1}: identical or orthogonal states only. Two lines, no loopholes."}
```

## Exercises

**Exercise 1 — the dual-basis table.** Using the live cell, check that $\ket{\Phi^+}$ agrees in both Z and X, but $\ket{\Phi^-}$ (add a `z(1)` after making the pair) agrees in Z and *disagrees* in X. Build the 2×2 table (Z‑parity, X‑parity) for all four Bell states.

````solution
| State | Z-basis | X-basis |
|---|---|---|
| $\Phi^+$ | agree | agree |
| $\Phi^-$ | agree | disagree |
| $\Psi^+$ | disagree | agree |
| $\Psi^-$ | disagree | disagree |

Two binary questions (Z‑parity, X‑parity) fully distinguish four states by *local* measurements plus classical comparison — which is how superdense coding decodes (next lesson) and how stabilizer codes label errors (Module 10).
````

**Exercise 2 — read the CHSH cell.** In the CHSH cell, explain why Bob's $\pm\pi/8$ measurement bases appear as $R_y(\mp\pi/4)$ rotations, and why the XOR reads `int(b[0]) ^ int(b[1])`.

````solution
Rotating the *state* by $-\theta$ equals rotating the *measurement* by $+\theta$, and Bloch angles double — so a $\pm\pi/8$ measurement basis is an $R_y(\mp\pi/4)$ rotation before a Z‑measurement. The XOR uses `b[0]` and `b[1]` because the label is little‑endian ($b = q_1 q_0$) — the ordering lesson, still collecting rent. All four settings win at $\cos^2(\pi/8) \approx 0.8536$, above the classical 0.75.
````

## Practice questions

1. Which local Pauli converts $\ket{\Phi^+}$ to $\ket{\Psi^-}$?
2. Why does X‑basis agreement of $\Phi^+$ rule out "two envelopes with the same letter"?
3. State no‑cloning precisely, including the quantifier that makes it non‑trivial.
4. A vendor claims a "quantum amplifier" copies all four BB84 states perfectly. Possible?
5. Alice applies Z to her half of $\Phi^+$. What state results, and when can Bob detect it?
6. A Bell test gives Z‑agreement 0.96 but X‑agreement 0.62. Which noise process, and which single‑qubit plot does it echo?
7. **Design question:** design the acceptance test for a claimed 3‑qubit GHZ source ($\tfrac{1}{\sqrt2}(\ket{000}+\ket{111})$): creation circuit, reverse‑circuit check, the basis‑correlation checks with expected outcomes, and one failure signature with its diagnosis.

````solution
1. $Y$ on either qubit ($Y = iXZ$ toggles both parity and phase).
2. Envelopes fix answers to one question; agreeing under the X‑question too would need pre‑agreed answers to both, and CHSH shows no such double‑ledger reproduces the full correlation (75% ceiling vs observed 85%).
3. No single $U$ with $U(\ket\psi\otimes\ket0) = \ket\psi\otimes\ket\psi$ *for all* $\ket\psi$ (a fixed known state is trivially re‑preparable; the "all" is the theorem).
4. BB84 = $\{\ket0,\ket1,\ket+,\ket-\}$ contains non‑orthogonal pairs ($\ket0,\ket+$: overlap $\tfrac{1}{\sqrt2}$); cloning all four violates the theorem — impossible, and the impossibility is the security.
5. $\ket{\Phi^-}$; Bob alone never detects it (no‑signaling); jointly it shows as X‑agreement flipping to disagreement once results are compared.
6. Dephasing: Z‑correlations survive, X‑correlations decay — the two‑qubit echo of the Bloch spiral‑to‑center.
7. Creation: H(q0), CX(0,1), CX(0,2). Reverse check: CX(0,2), CX(0,1), H(0) → $\ket{000}$ with certainty. Correlations: Z‑basis only '000'/'111' at 50/50; X‑basis (H on all) shows only even‑minus outcomes. Failure signature: '000'/'111' at 50/50 but X‑check *uniform* over all 8 outcomes ⇒ the source made the classical mixture, not the superposition — coherence lost (dephasing or which‑path leakage). Bonus: GHZ *pairs* show only classical correlation — flag it.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Write the four Bell states and their parity/phase taxonomy, and create $\Phi^+$ with H+CNOT.
- ☐ Run the live cell and explain why agreement in *two* bases is classically impossible.
- ☐ State and prove no‑cloning in two lines, and no‑signaling in one.
- ☐ Explain the CHSH game and compute the 75% vs 85.4% numbers.
- ☐ Run the CHSH cell and read the win rate.
- ☐ Diagnose a Bell source from Z‑ vs X‑agreement (dephasing signature).
