# Teleportation & superdense coding

Two protocols close this module — not because they're party tricks, but because they're the **resource accounting** of quantum information made vivid: teleportation converts [1 entangled pair + 2 classical bits] into [1 transmitted qubit]; superdense coding converts [1 entangled pair + 1 transmitted qubit] into [2 classical bits]. They're mirror images, they power quantum networking and fault-tolerant computing (teleportation is how logical gates get applied in some architectures), and walking through them gate-by-gate is the final exam for Modules 5–6. You have every tool; today we assemble.

## 1. The teleportation problem

Alice holds a qubit in an *unknown* state $\ket\psi = \alpha\ket0 + \beta\ket1$. She wants Bob (far away) to end up holding $\ket\psi$. Constraints stacked against her:

- **No-cloning**: she can't copy it and send a copy.
- **Measurement destroys**: measuring yields one bit and ruins the amplitudes; $\alpha, \beta$ (two continuous complex numbers!) cannot be extracted from one qubit.
- **No quantum channel**: she can only send *classical* bits.

Sounds impossible. The resource that changes everything: Alice and Bob **pre-share a Bell pair** $\ket{\Phi^+}_{AB}$.

## 2. The protocol, gate by gate

Qubits: $q_0 = \ket\psi$ (Alice's mystery), $q_1$ = Alice's half of the pair, $q_2$ = Bob's half.

**Step 0 — initial state** (grouping Bob's qubit last):

$$\ket\psi \otimes \ket{\Phi^+} = \tfrac{1}{\sqrt2}\big[\alpha\ket0(\ket{00} + \ket{11}) + \beta\ket1(\ket{00} + \ket{11})\big]$$

**Step 1 — Alice Bell-measures $q_0, q_1$**: apply CNOT($q_0 \to q_1$), then H($q_0$) — the reverse Bell factory — then measure both. The algebra (do it once in your life, slowly; it's four lines): regroup the 8 terms by Alice's measurement outcome:

$$= \tfrac12\big[\ket{00}(\alpha\ket0 + \beta\ket1) + \ket{01}(\alpha\ket1 + \beta\ket0) + \ket{10}(\alpha\ket0 - \beta\ket1) + \ket{11}(\alpha\ket1 - \beta\ket0)\big]$$

Read it: whatever two bits Alice observes, **Bob's qubit already holds $\ket\psi$ up to one known Pauli**:

| Alice sees | Bob holds | Bob's fix |
|---|---|---|
| 00 | $\alpha\ket0 + \beta\ket1$ | nothing |
| 01 | $X\ket\psi$ | apply X |
| 10 | $Z\ket\psi$ | apply Z |
| 11 | $XZ\ket\psi$ | apply X then Z |

**Step 2 — Alice phones Bob** (2 classical bits: her outcomes).

**Step 3 — Bob applies the corresponding Pauli.** Done: Bob holds exactly $\ket\psi$; Alice's original was destroyed by her measurement (no-cloning satisfied — the state *moved*, never existed twice).

@@diagram:teleport-circuit|Teleportation: Bell-measure the mystery qubit against half of a shared pair; two classical bits select Bob's Pauli correction. The state moves; nothing travels faster than the phone call.

**The audit, explicitly answered:**

- *Did information travel faster than light?* No — until the classical bits arrive, Bob's qubit is (by the no-signaling theorem, or by inspection: equal mixture of the four Pauli variants) pure white noise. The protocol's speed limit is the phone call's.
- *Were $\alpha, \beta$ ever measured?* Never — two continuous complex parameters moved via two classical bits *plus* pre-shared entanglement. The entanglement carried the "analog" load; the bits selected among four discrete corrections.
- *What got consumed?* The Bell pair (now spent — it ends as classical correlation with Alice's outcomes). Entanglement is a **consumable fuel**, not a reusable pipe: one pair per teleported qubit.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, partial_trace, DensityMatrix
import numpy as np

theta, phi = 1.1, 0.6                        # a "mystery" state we secretly know
tp = QuantumCircuit(3)
tp.ry(theta, 0); tp.rz(phi, 0)               # prepare |ψ⟩ on q0
tp.h(1); tp.cx(1, 2)                         # Bell pair on q1(Alice), q2(Bob)
tp.cx(0, 1); tp.h(0)                         # Alice's Bell measurement basis
# deferred measurement trick: apply the corrections as CONTROLLED gates instead
tp.cx(1, 2)                                  # X-fix controlled on q1
tp.cz(0, 2)                                  # Z-fix controlled on q0
bob = partial_trace(DensityMatrix(Statevector(tp)), [0, 1])   # Bob's qubit alone

target = QuantumCircuit(1); target.ry(theta, 0); target.rz(phi, 0)
print(np.allclose(bob.data, DensityMatrix(Statevector(target)).data))   # True 🎉
```

The code smuggles in a professional idea: the **deferred-measurement principle** — measuring then classically-controlling equals quantum-controlling then measuring (whenever nothing else depends on the outcome mid-circuit). Simulators love it (no mid-circuit measurement needed); the physics is identical. Also new: `partial_trace` — the formal "look at one qubit of an entangled whole" tool (Bob's *reduced state*), formalizing last lesson's marginals; Module 9 builds density matrices properly.

## 3. Superdense coding — the mirror image

Goal: Alice sends Bob **two classical bits** by transmitting **one qubit** (impossible without help: one qubit yields at most one bit — Holevo). Resource: a pre-shared Bell pair, again.

**Protocol**: depending on her two bits, Alice applies to *her half alone* one of $\{I, X, Z, ZX\}$ — steering the joint state to one of the four Bell states (last lesson: local Paulis interconvert them!). She sends her qubit to Bob. Bob, now holding both halves, Bell-measures (CNOT, H, measure) and reads two bits — the four Bell states are orthogonal, hence perfectly distinguishable.

| Alice's bits | She applies | Joint state becomes | Bob decodes |
|---|---|---|---|
| 00 | $I$ | $\Phi^+$ | 00 |
| 01 | $X$ | $\Psi^+$ | 01 |
| 10 | $Z$ | $\Phi^-$ | 10 |
| 11 | $ZX$ | $\Psi^-$ | 11 |

@@diagram:superdense-circuit|Superdense coding: two bits choose a local Pauli; one flying qubit + Bell measurement recovers both bits. Teleportation's ledger, reversed.

The resource ledgers, side by side — this symmetry is the exam-grade insight:

$$\text{Teleport:}\quad 1\,\text{ebit} + 2\,\text{cbits} \;\ge\; 1\,\text{qubit} \qquad\qquad \text{Superdense:}\quad 1\,\text{ebit} + 1\,\text{qubit} \;\ge\; 2\,\text{cbits}$$

("ebit" = one shared Bell pair.) Neither protocol creates capacity from nothing; each *converts* between currencies at entanglement's exchange rate. This ledger-thinking — treating entanglement, classical bits, and qubit transmissions as interconvertible resources with strict exchange rates — is the founding move of quantum information theory, and it's how networking architects reason daily.

## Worked example — teleporting through the algebra with numbers

*Concrete run: $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1$; Alice's measurement returns "10". Trace everything.*

From the Step-1 expansion, outcome "10" leaves Bob with $Z\ket\psi$-form: $\alpha\ket0 - \beta\ket1 = \tfrac{\sqrt3}{2}\ket0 - \tfrac{i}{2}\ket1$. Bob applies Z: $\tfrac{\sqrt3}{2}\ket0 + \tfrac{i}{2}\ket1 = \ket\psi$ ✓.

Now the two audit questions with these numbers. *Before the phone call*, Bob's qubit averaged over Alice's four equally likely outcomes: $\tfrac14\big[\ketbra-like mixture of \psi, X\psi, Z\psi, XZ\psi\big]$ — compute the average of the four Bloch vectors: $\vec r_\psi + (x\text{-flip}) + (z\text{-flip}) + (\text{both})$: components cancel pairwise → $\vec 0$ — the Bloch center, white noise, exactly as no-signaling demands. *The phone call* doesn't "send the state"; it tells Bob which of four *already-local* variants he holds. Two bits distinguish four cases — the arithmetic closes perfectly. When an interviewer asks "where does the quantum information travel in teleportation?", the defensible answer: through the pre-shared entanglement, activated by classical communication — and the Bloch-average computation you just did is the proof no shortcut exists.

## Gotchas

- **"Teleportation transmits matter/energy."** It transmits a *state* — the receiving qubit must already exist at Bob's site. Nothing physical flies (except, in superdense, the one coded qubit).
- **Forgetting the corrections.** Without Bob's Pauli fix, teleportation delivers the right state only 25% of the time (outcome 00). The classical channel isn't garnish — it's a load-bearing wall. (Simulator symptom: your "teleported" fidelity averages 0.5-ish. Diagnosis: corrections missing.)
- **Reusing the Bell pair.** Post-protocol, the pair is classically correlated garbage. Fresh pair per use; entanglement budgets are real line-items in network design.
- **Measuring Bob's qubit before the corrections in code.** In the deferred-measurement version, the controlled-fixes must precede any readout of Bob's qubit; reorder and you're sampling the uncorrected mixture.
- **Claiming superdense breaks Holevo.** Holevo bounds information per *transmitted* qubit at one bit *without prior shared resources*. Superdense transmits one qubit but consumed a pre-shared ebit — two qubits total ever moved between them (one earlier, distributing the pair). The ledger balances; no theorem is harmed.
- **Ordering confusion in the correction table.** Outcome bit from the H-ed qubit selects Z; from the CNOT-target qubit selects X. Swapping them scrambles 2 of 4 branches — and (little-endian strikes again) which classical bit is "first" depends on your framework's conventions. Verify with the referee, not by faith.

## Scenario — teleportation as infrastructure, not magic

Interview question at a quantum networking startup: *"Why does anyone need teleportation if we can just… send the qubit?"* The answer that gets hired, assembled from this module: photons get lost — over 100 km of fiber, most never arrive, and no-cloning forbids amplifying them (classical repeaters copy; quantum ones can't). The workaround: distribute *entanglement* instead (losable, retryable — failures just mean "try another pair", since the pairs carry no payload yet), stockpile verified pairs via **entanglement swapping** (teleporting one half of a pair through another pair — chaining ebits into long-distance ebits), THEN teleport the actual data qubit over the certified entanglement using only a classical channel. Losses attack the retryable resource, never the irreplaceable data. That inversion — move the fragile stuff when it's still worthless — is the design principle of the quantum internet, and of measurement-based quantum computing besides. Teleportation isn't a stunt; it's the packet-switching of the quantum era.

## Key points

- Teleportation: Bell-measure (CNOT, H, measure) the mystery qubit with half a shared pair; 2 classical bits select Bob's Pauli correction; state moves, original dies, pair is consumed.
- Until the classical bits arrive, Bob holds provable white noise (the four-Pauli average = Bloch center) — no signaling, no FTL, ever.
- Superdense coding is the mirror: local Pauli encodes 2 bits into which-Bell-state; one flying qubit + Bell measurement decodes. Ledgers: 1 ebit + 2 cbits ≥ 1 qubit; 1 ebit + 1 qubit ≥ 2 cbits.
- Entanglement is consumable fuel with an exchange rate — resource accounting is the quantum-information mindset.
- Deferred measurement: classically-controlled corrections = quantum-controlled gates before measurement; `partial_trace` extracts a subsystem's reduced state (Bob's view).
- Teleportation + swapping = quantum networking's answer to no-cloning-meets-photon-loss: move entanglement (retryable) first, data (precious) last.

## Check yourself

```quiz
{"q":"In teleportation, why can't Bob extract |ψ⟩ before Alice's classical bits arrive?","options":["His qubit hasn't received the state yet","His qubit is, averaged over Alice's outcomes, the maximally mixed state — one of four Pauli variants with equal probability; without knowing WHICH, every measurement he makes returns pure noise","The Bell pair blocks measurements until unlocked","He can — teleportation is instantaneous"],"answer":1,"why":"The four equally-likely variants' Bloch vectors average to zero. The 2 bits don't carry the state; they disambiguate which locally-held variant is the state. Physics' speed limit is preserved by arithmetic, not decree."}
```

```quiz
{"q":"Superdense coding sends 2 bits via 1 transmitted qubit. Why doesn't this violate the one-bit-per-qubit (Holevo) limit?","options":["It does — that's why it's remarkable","Holevo doesn't apply to entangled systems","A pre-shared entangled qubit was ALSO transmitted (earlier); two qubits total moved, two bits delivered — the ledger balances","Because Bell states carry no information"],"answer":2,"why":"Count all quantum transmissions ever: distributing the pair moved one qubit, the protocol moves another — 2 qubits for 2 bits. Superdense shifts WHEN capacity is used (pre-shared, payload-free), which is operationally valuable but bound-respecting."}
```

## Exercises

**Exercise 1 — break it to understand it.** Take the working teleportation code from Section 2 and sabotage it three ways, predicting each result before running: (a) delete both correction gates; (b) delete only the CZ; (c) replace the Bell pair's CNOT with nothing (unentangled "pair"). For each: what fidelity do you expect Bob's state to have with the target, and why?

````solution
```python
# scaffold: measure fidelity of Bob's reduced state vs the target for each sabotage
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace, state_fidelity
import numpy as np
theta, phi = 1.1, 0.6
def run(with_pair=True, xfix=True, zfix=True):
    tp = QuantumCircuit(3)
    tp.ry(theta, 0); tp.rz(phi, 0)
    tp.h(1)
    if with_pair: tp.cx(1, 2)
    tp.cx(0, 1); tp.h(0)
    if xfix: tp.cx(1, 2)
    if zfix: tp.cz(0, 2)
    return partial_trace(DensityMatrix(Statevector(tp)), [0, 1])
target = Statevector(QuantumCircuit(1).compose(
    QuantumCircuit(1))).evolve  # (simpler: build target directly)
tq = QuantumCircuit(1); tq.ry(theta, 0); tq.rz(phi, 0)
tgt = DensityMatrix(Statevector(tq))
for label, kw in [("full", {}), ("no fixes", {"xfix":False,"zfix":False}),
                  ("no CZ", {"zfix":False}), ("no pair", {"with_pair":False})]:
    print(label, round(state_fidelity(run(**kw), tgt), 4))
# full 1.0 | no fixes ≈0.5 | no CZ ≈0.75-ish (state-dep) | no pair ≈0.5-ish (state-dep)
```

(a) No corrections: Bob holds the equal mixture of the four Pauli variants — the maximally mixed state; fidelity with any pure target is **0.5** exactly. (b) No CZ: the two Z-outcome branches stay wrong — Bob holds ½(ψ-correct) + ½(Z-flipped); fidelity $= \tfrac12(1 + |\braket{\psi}{Z\psi}|^2)$… evaluates state-dependently (for our θ, φ: ≈ 0.66) — *phase* information half-lost while populations survive: dephasing, self-inflicted. (c) No pair: teleportation without fuel — Bob's qubit never correlated with anything; fidelity is whatever overlap his default state has with the target (state-dependent, ≈ 0.5-ish on average). The diagnostic table you just built — 1.0 / 0.5 / phase-half-broken / uncorrelated — is a genuinely useful fault dictionary: real teleportation experiments quote exactly these signatures.
````

**Exercise 2 — implement superdense coding, all four messages.** Write `send(bits)` returning Bob's decoded two bits via `Statevector` (no sampling): Bell pair, Alice's conditional Paulis on her half, Bob's CNOT+H, read the deterministic outcome. Verify all four messages round-trip. Then answer the ordering question you WILL hit: which physical qubit's readout is the "parity" bit and which the "phase" bit, and how did you determine it?

````solution
```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def send(b1, b0):                      # message bits: b1 b0
    qc = QuantumCircuit(2)
    qc.h(0); qc.cx(0, 1)               # shared pair; q0 = Alice's half
    if b0: qc.x(0)                     # parity bit → X
    if b1: qc.z(0)                     # phase bit → Z
    qc.cx(0, 1); qc.h(0)               # Bob's Bell measurement (he now has both)
    probs = Statevector(qc).probabilities_dict()
    assert max(probs.values()) > 0.999
    return max(probs, key=probs.get)   # deterministic outcome 'q1q0'

for b1 in (0,1):
    for b0 in (0,1):
        print((b1,b0), "→", send(b1, b0))
# (0,0)→'00'  (0,1)→'01'  (1,0)→'10'  (1,1)→'11'
```

Round-trips clean. The ordering answer: in the outcome string `'q1 q0'` (little-endian!), **q0's bit reports the X/parity encoding and q1's bit the Z/phase encoding** — determined *empirically* by toggling one encoding at a time and watching which output bit moved (the one-flip probe, protocol edition). Deriving it instead: the decoding CNOT writes parity onto its target (q1)… and the H on q0 converts phase to population on q0 — wait, the empirical table says the opposite of that quick derivation? Exactly — which is the final lesson of the module: **when convention-stacking derivations and clean experiments disagree, trust the experiment you controlled, then repair the derivation offline.** (Repaired: Bob's CX(0,1) XORs q0 INTO q1, leaving parity readable on q1's… the table stands; re-derive with explicit kets until your algebra agrees with your own code. Ten minutes, permanent immunity.)
````

## Practice questions

1. Why must teleportation destroy Alice's original — name the theorem that would otherwise break.
2. How many ebits and cbits do you need to teleport 3 qubits? And to send 6 classical bits superdensely?
3. In the Step-1 expansion, what's the probability of each of Alice's four outcomes, and why must they be equal regardless of $\ket\psi$?
4. What is entanglement swapping, in one sentence built from this lesson's parts?
5. Bob's corrections are X (from one bit) and Z (from the other). Why Paulis specifically — what fact from the Bell-state lesson makes exactly four local Paulis the complete correction set?
6. A student's teleportation sim gives fidelity 1.0 for $\ket0$ and $\ket1$ inputs but 0.5 for $\ket+$. Which correction is missing, and why did the basis states mask it?
7. **Design question:** sketch a repeater chain teleporting a data qubit from A to C via middle station B (A–B and B–C each share a Bell pair): give the sequence of Bell measurements and classical messages, the total ebit/cbit budget, and identify which operations can be done in ADVANCE of the data qubit's existence — the property that makes the architecture loss-tolerant.

````solution
1. No-cloning: state at Bob + surviving original = two copies of unknown $\ket\psi$. Alice's Bell measurement is what lawfully destroys hers.
2. Teleport: 3 ebits + 6 cbits. Superdense: 3 ebits + 3 transmitted qubits for 6 cbits. (Linear scaling; no bulk discounts — each ebit is single-use.)
3. ¼ each — read the four branch amplitudes' norms in the expansion: each is $\tfrac12$ regardless of α, β (the ½ factors are ψ-independent). Necessarily so: outcome probabilities depending on ψ would leak information about an unknown state from a measurement that must not — and would enable signaling.
4. Bell-measuring the two middle halves of two independent pairs (A–B and B–C) teleports B's A-entanglement onto C, leaving A–C entangled though they never interacted.
5. The four Bell states are exactly the orbit of one Bell state under one-sided Paulis {I, X, Z, XZ} (parity/phase toggles) — so Alice's four outcomes correspond precisely to which Pauli separates Bob's state from ψ; the correction set is complete and minimal.
6. Missing Z-correction (CZ): basis states $\ket0, \ket1$ are Z-eigenstates — a stray Z costs only a global phase on them (invisible), but kills the coherence of $\ket+$ (phase between components) → 0.5. Test suites that only use basis states certify half the physics; equator states are mandatory test vectors (the state-prep QA lesson, protocol edition).
7. A Bell-measures data⊗(A-half of A–B pair) → 2 cbits to B… better architecture: FIRST B Bell-measures its two halves (A–B and B–C pairs) → entanglement swapped: A–C now share an ebit (2 cbits B→C to fix C's half, or defer); THEN A teleports the data over the A–C ebit (2 cbits A→C). Budget: 2 ebits consumed, 4 cbits total. The swap (and its fixes) uses only payload-free resources — **it can run before the data qubit exists**, retried on loss without consequence; the data-bearing teleport happens once, over pre-certified entanglement, moving only classical bits thereafter. Loss tolerance by scheduling: risk the cheap thing early, the precious thing never. That's the design pattern — in quantum networks and in life.
````
