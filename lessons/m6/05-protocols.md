# Teleportation & superdense coding

Two protocols close this module — not because they're party tricks, but because they're the **resource accounting** of quantum information made vivid: teleportation converts [1 entangled pair + 2 classical bits] into [1 transmitted qubit]; superdense coding converts [1 entangled pair + 1 transmitted qubit] into [2 classical bits]. They're mirror images, they power quantum networking and fault-tolerant computing, and walking through them gate-by-gate is the final exam for Modules 5–6.

## Start here — the intuition

Think of entanglement as a kind of **currency** you can spend to move information around, at fixed exchange rates. Two headline trades:

**Teleportation** moves an *unknown* qubit's state from Alice to Bob without sending the qubit itself — she can't (no‑cloning forbids copying, and measuring would destroy the two continuous numbers $\alpha, \beta$). The trick: Alice and Bob **pre‑share a Bell pair**. Alice does a joint measurement on her mystery qubit and her half of the pair, phones Bob **2 classical bits**, and Bob applies a simple fix — and now *he* holds the exact state. Nothing traveled faster than the phone call; the entanglement carried the "analog" load, the two bits just said which of four fixes to apply.

**Superdense coding** is the mirror: using a shared Bell pair, Alice packs **2 classical bits** into **1 qubit** she sends to Bob. Neither protocol makes capacity from nothing — each *converts* between qubits, classical bits, and entanglement at strict exchange rates. That ledger‑thinking is the founding move of quantum information.

## Teleportation, gate by gate

Qubits: $q_0 = \ket\psi$ (Alice's mystery), $q_1$ = Alice's half of the pair, $q_2$ = Bob's half. Alice **Bell‑measures** $q_0, q_1$ (CNOT then H — the reverse Bell factory — then measure). Regrouping the terms by her outcome shows Bob's qubit already holds $\ket\psi$ *up to one known Pauli*:

| Alice sees | Bob holds | Bob's fix |
|---|---|---|
| 00 | $\ket\psi$ | nothing |
| 01 | $X\ket\psi$ | apply X |
| 10 | $Z\ket\psi$ | apply Z |
| 11 | $XZ\ket\psi$ | apply X then Z |

Alice phones the 2 bits; Bob applies the Pauli; done. The state *moved* (Alice's original died in her measurement — no‑cloning satisfied). Until the bits arrive, Bob's qubit is the equal average of the four Pauli variants = the Bloch center = **white noise** — so no signaling, no faster‑than‑light, ever.

@@diagram:teleport-circuit|Teleportation: Bell-measure the mystery qubit against half of a shared pair; two classical bits select Bob's Pauli correction. The state moves; nothing travels faster than the phone call.

@@widget

## Predict, then run — teleport an unknown state

The live cell teleports a state from $q_0$ to $q_2$ using the **deferred‑measurement principle** (replace measure‑then‑classically‑control with quantum‑controlled gates — the physics is identical, and simulators love it). It then reads $q_2$'s Bloch vector to confirm it matches the input.

**Predict first.** If teleportation works, what should $q_2$'s Bloch vector equal? Guess, then Run.

```run
# Live cell — teleport an unknown state from q0 to q2 (deferred-measurement version).
import numpy as np
X=np.array([[0,1],[1,0]],complex); Y=np.array([[0,-1j],[1j,0]]); Z=np.array([[1,0],[0,-1]],complex)

theta = 1.2                              # the "unknown" state = ry(theta)|0>
qc = QuantumCircuit(3)
qc.ry(theta, 0)                          # state to teleport, on q0
qc.h(1); qc.cx(1, 2)                     # Alice & Bob share a Bell pair (q1, q2)
qc.cx(0, 1); qc.h(0)                     # Alice's Bell-basis rotation
qc.cx(1, 2); qc.cz(0, 2)                 # Bob's corrections (deferred = quantum-controlled)

sv = qc.statevector().reshape(2, 2, 2)   # axes [q2, q1, q0]
rho2 = np.einsum('abc,dbc->ad', sv, sv.conj())      # trace out q0, q1 -> Bob's qubit
q2  = [round(float(np.real(np.trace(rho2 @ M))), 3) for M in (X, Y, Z)]
inp = [round(np.sin(theta), 3), 0.0, round(np.cos(theta), 3)]
print("teleported qubit 2 Bloch:", q2)
print("original input     Bloch:", inp)
print("match (fidelity 1)      :", np.allclose(q2, inp, atol=1e-6))
```

Bob's qubit ends up holding *exactly* the input state — fidelity 1. Two continuous complex numbers moved across the circuit via one shared Bell pair plus (in the real protocol) two classical bits, and $\alpha, \beta$ were never measured. That's the whole magic: entanglement carries the analog load; the classical bits just pick the correction.

```quiz
{"q":"In teleportation, why can't Bob extract |ψ⟩ before Alice's classical bits arrive?","options":["His qubit hasn't received the state yet","His qubit is, averaged over Alice's outcomes, the maximally mixed state — one of four Pauli variants with equal probability; without knowing WHICH, every measurement he makes returns pure noise","The Bell pair blocks measurements until unlocked","He can — teleportation is instantaneous"],"answer":1,"why":"The four equally-likely variants' Bloch vectors average to zero. The 2 bits don't carry the state; they disambiguate which locally-held variant is the state. Physics' speed limit is preserved by arithmetic, not decree."}
```

## Superdense coding — the mirror image

Goal: send **two classical bits** by transmitting **one qubit** (impossible without help — one qubit yields at most one bit, by Holevo). Using a shared Bell pair, Alice applies one of $\{I, X, Z, ZX\}$ to *her half alone*, steering the joint state to one of the four Bell states (local Paulis interconvert them). She sends her qubit; Bob, now holding both halves, Bell‑measures and reads two bits — the four Bell states are orthogonal, hence perfectly distinguishable.

```run
# Live cell — superdense coding: 2 classical bits through 1 transmitted qubit.
def send(b1, b0):                        # message bits b1 b0
    qc = QuantumCircuit(2)
    qc.h(1); qc.cx(1, 0)                 # shared Bell pair; q1 = Alice's half
    if b1: qc.z(1)                       # phase bit  -> Z
    if b0: qc.x(1)                       # parity bit -> X
    qc.cx(1, 0); qc.h(1)                 # Bob's Bell measurement (he now has both)
    return max(qc.probabilities(), key=qc.probabilities().get)

for b1 in (0, 1):
    for b0 in (0, 1):
        print(f"  Alice sends {b1}{b0} -> Bob decodes {send(b1, b0)}")
```

All four messages round‑trip perfectly. The two resource ledgers, side by side, are the exam‑grade insight:

$$\text{Teleport:}\ \ 1\,\text{ebit} + 2\,\text{cbits} \ge 1\,\text{qubit} \qquad \text{Superdense:}\ \ 1\,\text{ebit} + 1\,\text{qubit} \ge 2\,\text{cbits}$$

("ebit" = one shared Bell pair.) Each *converts* between currencies at entanglement's exchange rate; neither creates capacity from nothing. And entanglement is **consumable fuel** — one pair per use, spent afterward.

```quiz
{"q":"Superdense coding sends 2 bits via 1 transmitted qubit. Why doesn't this violate the one-bit-per-qubit (Holevo) limit?","options":["It does — that's why it's remarkable","Holevo doesn't apply to entangled systems","A pre-shared entangled qubit was ALSO transmitted (earlier); two qubits total moved, two bits delivered — the ledger balances","Because Bell states carry no information"],"answer":2,"why":"Count all quantum transmissions ever: distributing the pair moved one qubit, the protocol moves another — 2 qubits for 2 bits. Superdense shifts WHEN capacity is used (pre-shared, payload-free), which is operationally valuable but bound-respecting."}
```

## Level up — gotchas the pros watch for

- **"Teleportation transmits matter/energy."** It transmits a *state*; the receiving qubit must already exist at Bob's site. Nothing physical flies (except superdense's one coded qubit).
- **Forgetting the corrections.** Without Bob's Pauli fix, teleportation delivers the right state only 25% of the time — the classical channel is a load‑bearing wall (symptom: fidelity averages ~0.5).
- **Reusing the Bell pair.** Post‑protocol it's classically correlated garbage; fresh pair per use.
- **Correcting after reading Bob's qubit.** In the deferred version, the controlled fixes must precede any readout of Bob's qubit.
- **Claiming superdense breaks Holevo.** It doesn't — two qubits total ever moved (one distributing the pair, one in the protocol); the ledger balances.

## Level up — teleportation as infrastructure

Startup interview: *"Why need teleportation if we can just send the qubit?"* Photons get lost over 100 km of fiber, and no‑cloning forbids amplifying them (classical repeaters copy; quantum ones can't). The workaround: distribute *entanglement* instead (losable, retryable — a lost pair carries no payload), stockpile verified pairs via **entanglement swapping** (teleporting one half of a pair through another pair to chain short ebits into long‑distance ebits), THEN teleport the actual data qubit over the certified entanglement using only a classical channel. Losses attack the retryable resource, never the irreplaceable data. Move the fragile stuff while it's still worthless — that inversion is the design principle of the quantum internet.

## Key points

- Teleportation: Bell‑measure the mystery qubit with half a shared pair; 2 classical bits select Bob's Pauli correction; state moves, original dies, pair is consumed.
- Until the bits arrive, Bob holds provable white noise (the four‑Pauli average = Bloch center) — no signaling, no FTL.
- Superdense is the mirror: a local Pauli encodes 2 bits into which‑Bell‑state; one flying qubit + Bell measurement decodes.
- Ledgers: 1 ebit + 2 cbits ≥ 1 qubit; 1 ebit + 1 qubit ≥ 2 cbits — entanglement is consumable fuel with an exchange rate.
- Deferred measurement: classically‑controlled corrections = quantum‑controlled gates before measurement (what the live cell uses).
- Teleportation + swapping = quantum networking's answer to no‑cloning‑meets‑photon‑loss: move entanglement first, data last.

## Check yourself

```quiz
{"q":"Bob's teleportation corrections are X (from one bit) and Z (from the other). Why exactly these four local Paulis {I, X, Z, XZ}?","options":["They're the cheapest gates","They are exactly the operations that map one Bell state to the other three (parity/phase toggles), so they form the complete, minimal set of possible corrections","Because Bob only has two qubits","Any four gates would work"],"answer":1,"why":"The four Bell states are the orbit of one Bell state under {I,X,Z,XZ} on one side. Alice's four outcomes correspond to which of these separates Bob's state from |ψ⟩ — so the correction set is complete and minimal."}
```

## Exercises

**Exercise 1 — break it to understand it.** In the teleportation cell, sabotage it three ways and predict the fidelity each time: (a) delete both correction lines (`cx(1,2)` and `cz(0,2)`); (b) delete only the `cz(0,2)`; (c) delete the Bell pair's `cx(1,2)`. What Bloch vector / fidelity do you expect for each, and why?

````solution
(a) No corrections: Bob holds the equal mixture of the four Pauli variants — the maximally mixed state (Bloch center), fidelity **0.5**. (b) No Z‑fix: the phase between components is half‑wrong — populations survive but coherence is half‑lost (dephasing, self‑inflicted; fidelity state‑dependent, ~0.66 here). (c) No pair: no shared fuel, so Bob's qubit never correlated with the input — fidelity ~0.5 on average. This 1.0 / 0.5 / phase‑broken / uncorrelated table is a real teleportation fault dictionary.
````

**Exercise 2 — the ordering probe.** In the superdense cell, toggle *one* encoding at a time (`z` only, then `x` only) and watch which output bit moves. Which physical qubit's readout carries the phase (Z) bit and which the parity (X) bit? Determine it empirically, then reconcile with the decoding circuit.

````solution
Toggling `z(1)` flips the left output bit (q1); toggling `x(1)` flips the right output bit (q0) — so in `'q1 q0'`, q1 reports the phase/Z encoding and q0 the parity/X encoding. When a convention‑stacked derivation and a clean experiment disagree, trust the experiment you controlled and repair the derivation offline with explicit kets — ten minutes, permanent immunity.
````

## Practice questions

1. Why must teleportation destroy Alice's original — which theorem would otherwise break?
2. How many ebits and cbits to teleport 3 qubits? To send 6 classical bits superdensely?
3. In the teleportation expansion, what is the probability of each of Alice's four outcomes, and why must they be equal regardless of $\ket\psi$?
4. What is entanglement swapping, in one sentence?
5. A teleportation sim gives fidelity 1.0 for $\ket0, \ket1$ but 0.5 for $\ket+$. Which correction is missing, and why did the basis states mask it?
6. Why is entanglement called a "consumable" resource rather than a reusable channel?
7. **Design question:** sketch a repeater chain teleporting a data qubit from A to C via middle station B (A–B and B–C each share a Bell pair): the sequence of Bell measurements and classical messages, the ebit/cbit budget, and which operations can run *before* the data qubit exists.

````solution
1. No‑cloning: Bob's copy plus a surviving original = two copies of an unknown state. Alice's Bell measurement lawfully destroys hers.
2. Teleport: 3 ebits + 6 cbits. Superdense: 3 ebits + 3 transmitted qubits for 6 cbits. No bulk discounts — each ebit is single‑use.
3. ¼ each — the four branch amplitudes each have norm $\tfrac12$ independent of $\alpha, \beta$. Necessarily so: outcome probabilities depending on $\ket\psi$ would leak information about an unknown state and enable signaling.
4. Bell‑measuring the two middle halves of two independent pairs (A–B and B–C) teleports B's entanglement onto C, leaving A–C entangled though they never interacted.
5. Missing Z‑correction: $\ket0, \ket1$ are Z‑eigenstates, so a stray Z is only an invisible global phase on them, but it kills $\ket+$'s coherence → 0.5. Equator states are mandatory test vectors.
6. Each protocol run leaves the Bell pair as ordinary classical correlation (spent); it cannot be reused or "topped up" locally, so networks budget ebits as line items.
7. Better architecture: B first Bell‑measures its two halves (A–B and B–C) → **entanglement swap**, leaving A–C sharing an ebit; then A teleports the data over the A–C ebit (2 cbits A→C). Budget: 2 ebits, ~4 cbits. The swap uses only payload‑free resources, so it can run *before* the data qubit exists and be retried freely on loss; the data‑bearing teleport happens once, over pre‑certified entanglement. Risk the cheap thing early, the precious thing never.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Walk through teleportation gate by gate and state Bob's four possible corrections.
- ☐ Run the live cell and confirm the teleported qubit matches the input (fidelity 1).
- ☐ Explain why Bob sees white noise until the classical bits arrive (no‑signaling).
- ☐ Describe superdense coding and run the cell to send all four messages.
- ☐ State both resource ledgers and why neither breaks Holevo or enables FTL.
- ☐ Explain entanglement swapping and why "move entanglement first, data last" is loss‑tolerant.
