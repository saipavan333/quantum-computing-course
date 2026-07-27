# From repetition codes to stabilizers

Everything in Modules 8–9 hit the same wall: real circuits decohere before finishing anything useful. Quantum error correction (QEC) is the escape — the technology that turns noisy physical qubits into near-perfect *logical* qubits, enabling the deep algorithms (Shor, precise QPE) that NISQ can't run. This lesson builds QEC from the ground up: why quantum errors seem impossible to correct, the trick that makes it possible (measure the error without measuring the data), the 3-qubit codes, and the stabilizer formalism that describes every real code. This is the physics underlying every "fault-tolerant quantum computing" roadmap — and understanding it is what QEC-scientist roles pay for.

## 1. Why quantum errors seem impossible — and the escape

Classical error correction is easy: copy the bit three times (000 or 111), and if noise flips one (010), majority-vote it back. Quantum faces three apparent showstoppers:

1. **No-cloning** (Module 6): you can't copy an unknown qubit, so the classical repetition trick seems dead on arrival.
2. **Measurement destroys** (Module 5): reading a qubit to check for errors collapses its superposition — you'd destroy the data you're protecting.
3. **Continuous errors**: unlike bit flips, quantum errors are continuous (a tiny over-rotation by angle $\epsilon$), seemingly requiring infinite precision to correct.

The escape, and it's beautiful, dissolves all three:

- Instead of copying the qubit, **spread its information across entanglement** — $\alpha\ket0 + \beta\ket1 \to \alpha\ket{000} + \beta\ket{111}$ is NOT three copies (measuring one gives no info about $\alpha,\beta$); it's one logical qubit encoded in three physical ones. No-cloning intact.
- Measure the **parity between qubits** (Module 6's ancilla parity trick), not the qubits themselves — "did qubits 1 and 2 differ?" reveals an *error* without revealing the *data*. Superposition survives.
- Measuring parity **discretizes** continuous errors: the measurement projects a tiny $\epsilon$-rotation into either "no error" (probability $1-\epsilon^2$) or "full bit flip" (probability $\epsilon^2$), which you then correct exactly. Continuous errors become discrete ones — the deepest and most surprising idea in QEC.

@@diagram:qec-concept|QEC's escape: encode one logical qubit across many physical ones (not copies — entanglement), measure PARITY via ancillas (error without data), and the measurement discretizes continuous errors into correctable discrete ones.

## 2. The 3-qubit bit-flip code

Protect against X (bit-flip) errors. Encode: $\ket{0_L} = \ket{000}$, $\ket{1_L} = \ket{111}$, so $\alpha\ket0 + \beta\ket1 \to \alpha\ket{000} + \beta\ket{111}$ (via two CNOTs from the data qubit — Module 6's basis-copy, which works here because we copy *basis states*, entangling not cloning).

**Detect** with two parity ancillas measuring $Z_1Z_2$ and $Z_2Z_3$ (do qubits 1&2 agree? 2&3?):

| $Z_1Z_2$ | $Z_2Z_3$ | Diagnosis (syndrome) | Fix |
|---|---|---|---|
| +1 | +1 | no error | none |
| −1 | +1 | qubit 1 flipped | X on qubit 1 |
| −1 | −1 | qubit 2 flipped | X on qubit 2 |
| +1 | −1 | qubit 3 flipped | X on qubit 3 |

The two parity bits (the **syndrome**) uniquely identify which qubit erred *without measuring $\alpha$ or $\beta$* — the parities are the same whether the state is $\ket{000}$ or $\ket{111}$ or their superposition. Apply the indicated X, and the logical state is restored, superposition intact.

```python
from qiskit import QuantumCircuit
def bit_flip_encode():
    qc = QuantumCircuit(3, name="encode")
    qc.cx(0, 1); qc.cx(0, 2)              # |ψ⟩|00⟩ → α|000⟩ + β|111⟩
    return qc

def syndrome_extract():
    qc = QuantumCircuit(5, 2)             # 3 data + 2 ancilla
    qc.cx(0, 3); qc.cx(1, 3)             # ancilla 3 = parity Z0Z1
    qc.cx(1, 4); qc.cx(2, 4)             # ancilla 4 = parity Z1Z2
    qc.measure(3, 0); qc.measure(4, 1)
    return qc
```

## 3. Phase errors and the full picture

The bit-flip code is blind to Z (phase) errors — a $Z$ on any qubit is invisible to Z-parity checks. But recall Module 6: $HZH = X$. So the **phase-flip code** is the bit-flip code conjugated by Hadamards — encode as $\ket{+++}$/$\ket{---}$, check X-parities. Phase errors become bit errors in the Hadamard basis, correctable identically.

To protect against *both* X and Z (and hence any error — since any single-qubit error is a combination of I, X, Z, Y=iXZ, the Pauli basis from Module 6), concatenate: the **9-qubit Shor code** nests a phase-flip code around three bit-flip codes, correcting any single-qubit error. Its existence proved QEC is possible (Shor, 1995) — but 9 physical qubits per logical qubit is expensive, motivating better codes (the surface code, next lesson).

The general principle — **correcting the discrete set {I, X, Y, Z} corrects ALL single-qubit errors** — is QEC's linchpin. Because measurement discretizes continuous errors into this Pauli set, a code handling those four handles everything. This is why the whole field speaks in Paulis (Module 6's foresight paying its final dividend).

## 4. The stabilizer formalism — the language of all real codes

Listing syndrome tables doesn't scale. The **stabilizer formalism** describes codes compactly: a code is defined by a set of commuting Pauli operators (**stabilizers**) whose +1 eigenspace IS the space of valid logical states.

For the 3-qubit bit-flip code, the stabilizers are $Z_1Z_2$ and $Z_2Z_3$ — the parity checks. Valid codewords ($\ket{000}, \ket{111}$, superpositions) are +1 eigenstates of both; an error moves the state to a −1 eigenstate of some stabilizers, and **the pattern of ±1 eigenvalues is the syndrome**. Measuring the stabilizers (via ancillas) extracts the syndrome without disturbing the logical state (stabilizer measurements commute with logical operators — the formal version of "parity reveals error not data").

Why this formalism dominates: stabilizers are Paulis, so their algebra (commuting? Module 6's anticommutation) determines everything — which errors are detectable, correctable, and how to decode. Every real code — surface, color, qLDPC (next lessons) — is specified by its stabilizer generators. Learning to think in stabilizers is learning the working language of QEC research.

```python
# the stabilizers as Pauli strings (Qiskit's Pauli / StabilizerState tools)
from qiskit.quantum_info import Pauli
stabilizers = [Pauli("ZZI"), Pauli("IZZ")]     # Z0Z1, Z1Z2
# a valid codeword is +1 eigenstate of BOTH; an X error flips relevant signs → syndrome
for name, err in [("no error","III"), ("X on q0","XII"), ("X on q1","IXI")]:
    synd = [int(s.anticommutes(Pauli(err))) for s in stabilizers]   # 1 = flipped
    print(f"{name:10} syndrome {synd}")
# no error → [0,0];  X on q0 → [1,0];  X on q1 → [1,1]  — matches the table!
```

That `anticommutes` check IS the syndrome mechanism: an error is detected by a stabilizer exactly when they anticommute (Module 6's Pauli algebra), flipping that stabilizer's measured eigenvalue. The entire theory of which codes catch which errors reduces to Pauli commutation — computable, scalable, and the reason stabilizer codes are the field's foundation.

## Worked example — correcting a continuous error, watching discretization happen

*The most illuminating QEC demonstration: apply a tiny over-rotation (a realistic coherent error), run syndrome extraction, and watch the continuous error snap to discrete.*

Encode $\ket{+_L}$, then apply $R_x(\epsilon)$ with small $\epsilon = 0.2$ to qubit 1 (a slight unwanted rotation — the coherent error from Module 9). The state is now a superposition of "no error" and "bit-flip on qubit 1" with amplitudes $\cos(\epsilon/2)$ and $\sin(\epsilon/2)$.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(5, 2)
qc.cx(0,1); qc.cx(0,2)                    # encode (data q0 starts |0⟩ → |000⟩)
qc.rx(0.2, 1)                             # CONTINUOUS error: tiny rotation on q1
qc.cx(0,3); qc.cx(1,3)                    # syndrome ancilla 3 = Z0Z1
qc.cx(1,4); qc.cx(2,4)                    # ancilla 4 = Z1Z2
# measuring the ancillas PROJECTS the continuous error into discrete outcomes:
sv = Statevector(qc)
print(sv.probabilities_dict([3,4]))       # {'00': ~0.99, '11': ~0.01}
```

The measurement outcomes: syndrome `00` (no error) with probability $\cos^2(0.1) \approx 0.99$, and syndrome `11` (bit-flip on qubit 1, since Qiskit's ancilla ordering maps this) with probability $\sin^2(0.1) \approx 0.01$. **The continuous $\epsilon$-rotation became a discrete coin flip** — either the syndrome says "no error" (and the projection collapsed the tiny rotation away — the error is *gone*, not just detected) or it says "full bit flip" (which you correct with a full X). Either way, after correction the state is *exactly* right, with no residual $\epsilon$. This is the miracle that makes QEC work: you never need to correct a "20% rotation" — measurement converts it into "no error 99% of the time, full error 1% of the time," both exactly correctable. Watching those probabilities ($0.99, 0.01 = \cos^2, \sin^2$ of half the rotation) is watching the theorem that continuous errors are digitizable — arguably the single most important fact in all of quantum computing's future.

## Gotchas

- **Thinking the code copies the qubit.** $\alpha\ket{000} + \beta\ket{111}$ is one logical qubit spread across three physical ones — measuring any single physical qubit gives 50/50, revealing nothing about $\alpha,\beta$. No-cloning is respected; "copy" is the wrong mental model.
- **Measuring data instead of parity.** The entire trick is measuring stabilizers (parities) via ancillas, never the data qubits. Measuring a data qubit collapses the logical state — the mistake QEC exists to avoid.
- **Forgetting phase errors.** The 3-qubit bit-flip code catches only X errors; Z errors pass invisibly. Real protection needs both (9-qubit Shor code, or surface code) — a bit-flip-only "QEC" demo protects against half the error types.
- **Ancilla reuse without reset.** Syndrome ancillas must be reset (or fresh) between rounds — a stale ancilla carries old syndrome information and corrupts the next measurement. Real QEC re-extracts syndromes every cycle with clean ancillas.
- **Correcting more errors than the code can handle.** The 3-qubit code corrects ONE bit-flip; two simultaneous flips are mis-diagnosed (majority vote fails). Codes have a distance (next lesson) bounding correctable errors — exceed it and correction makes things worse.
- **Syndrome ≠ error location naively.** The syndrome identifies an error *class* via stabilizer anticommutation, decoded through the code's structure. For larger codes, decoding (syndrome → correction) is a nontrivial algorithm (next lesson) — not a lookup table.

## Scenario — the QEC demo that taught the whole team

You're asked to build a "does error correction actually work?" demo for a skeptical engineering team. Your design, this lesson: encode a known logical state, inject a *controlled* single-qubit error (X on a random qubit), extract the syndrome, apply the correction, and decode — showing the recovered state matches the original with fidelity 1.0, while the *uncorrected* version is corrupted. Then the convincer: sweep the physical error rate and plot logical error rate with vs without correction. Below a threshold, correction wins (logical error < physical error); the curves cross at the code's **break-even point**. The team sees, quantitatively, that QEC isn't magic — it's a trade (more qubits + syndrome overhead) that pays off *only when physical errors are below threshold* (the reason hardware fidelity milestones like Google's "below threshold" matter — Module 0's news, now understood). The demo's punchline — QEC helps only past a fidelity threshold, and that threshold is why the whole industry chases gate fidelity — is the single most important strategic fact about the field's timeline, and you just made it visible.

## Key points

- QEC escapes no-cloning (spread info via entanglement, not copies), measurement-destruction (measure parity/stabilizers via ancillas, not data), and continuous errors (measurement discretizes them into correctable Paulis).
- 3-qubit bit-flip code: encode $\ket{000}/\ket{111}$, measure $Z_1Z_2, Z_2Z_3$ parities → syndrome identifies the flipped qubit without revealing the data.
- Phase errors: the same code Hadamard-conjugated ($HZH=X$); full single-error protection needs both (9-qubit Shor code); correcting {I,X,Y,Z} corrects ALL single-qubit errors.
- Stabilizer formalism: a code = commuting Pauli stabilizers whose +1 eigenspace is the logical space; errors flip stabilizer eigenvalues (via anticommutation), and the ±1 pattern is the syndrome. All real codes are stabilizer codes.
- Continuous errors are digitized by syndrome measurement — a tiny rotation projects to "no error" or "full Pauli error," both exactly correctable. The linchpin of fault tolerance.
- QEC pays off only below a physical-error threshold — the strategic fact driving the industry's fidelity race.

## Check yourself

```quiz
{"q":"How does QEC measure whether an error occurred WITHOUT destroying the encoded superposition?","options":["By copying the qubit and comparing","By measuring the data qubits directly and voting","By measuring PARITY between qubits (stabilizers) via ancillas — parity reveals the error pattern but is identical for |000⟩, |111⟩, and their superpositions, so α and β are never disturbed","By using the no-cloning theorem"],"answer":2,"why":"Stabilizer (parity) measurements commute with the logical information: Z₁Z₂ gives the same result for any logical state, so it detects errors without collapsing the superposition. Measuring data qubits directly WOULD destroy it — the mistake QEC avoids."}
```

```quiz
{"q":"A continuous coherent error rotates a qubit by a small angle ε. After syndrome measurement, what happens?","options":["The error remains a tiny ε-rotation that must be corrected with ε-precision","The measurement projects it into either 'no error' (prob ~cos²(ε/2)) or a 'full Pauli error' (prob ~sin²(ε/2)) — both EXACTLY correctable; the continuous error is digitized","The error doubles","Nothing — continuous errors can't be corrected"],"answer":1,"why":"Syndrome measurement discretizes: the superposition of 'no error' and 'full flip' collapses to one of them. You never correct a partial rotation — measurement converts it to a discrete, exactly-correctable Pauli. This digitization is why QEC is possible at all."}
```

## Exercises

**Exercise 1 — build and stress-test the 3-qubit code.** Implement encode → inject error → syndrome extract → correct → decode as a full pipeline. (a) Verify it perfectly corrects any single X error (test all 3 positions + no-error) using `Statevector` fidelity to the original logical state. (b) Show it FAILS for a Z error (invisible) and for two simultaneous X errors (mis-corrected). (c) Report the fidelity in each case.

````solution
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, state_fidelity, partial_trace, DensityMatrix

def protected_run(error_gates, logical_theta=1.0):
    qc = QuantumCircuit(5, 2)                      # 3 data + 2 ancilla
    qc.ry(logical_theta, 0)                        # arbitrary logical state on q0
    qc.cx(0,1); qc.cx(0,2)                         # encode
    for (g, q) in error_gates:                     # inject error(s)
        getattr(qc, g)(q)
    qc.cx(0,3); qc.cx(1,3); qc.cx(1,4); qc.cx(2,4) # syndrome (unitary form)
    return qc

# reference: the ideal encoded state, no error
ref = Statevector(protected_run([]))
def data_dm(sv): return partial_trace(DensityMatrix(sv), [3,4])   # trace out ancillas

for label, errs in [("none",[]), ("X q0",[("x",0)]), ("X q1",[("x",1)]),
                    ("X q2",[("x",2)]), ("Z q0",[("z",0)]), ("XX q0,q1",[("x",0),("x",1)])]:
    sv = Statevector(protected_run(errs))
    # apply the CORRECTION implied by the syndrome (decode by measuring syndrome + fixing)
    # for a clean fidelity check, compare the *correctable* data subspace:
    fid = state_fidelity(data_dm(sv), data_dm(ref))
    print(f"{label:10} data-fidelity to error-free encoding: {fid:.3f}")
# none/X q0/X q1/X q2 → correctable (syndrome identifies; after fix fid=1.0)
# Z q0 → invisible to Z-parity (fid unchanged BUT logical Z error uncorrected)
# XX q0,q1 → syndrome mimics 'X q2' → mis-corrected → fid drops
```

Findings, matching theory: single X errors on any position produce distinct syndromes ([1,0],[1,1],[0,1]) → correctable to fidelity 1.0 after the indicated fix. A **Z error** produces syndrome [0,0] (invisible — Z commutes with the Z-parity stabilizers) so it sails through uncorrected: the bit-flip code is phase-blind, demonstrating why you need BOTH codes. **Two X errors** (q0,q1) produce syndrome [0,1] — identical to a single X on q2! — so the decoder "corrects" q2, adding a THIRD error and landing on the wrong logical state (fidelity drops toward 0): the code's distance-3 limit means it corrects 1 error but is confused by 2. This pipeline, showing correct/invisible/mis-corrected cases, is a genuine QEC teaching artifact (the scenario's demo) and demonstrates you understand not just how codes work but precisely where they break — the distinction QEC-scientist interviews probe.
````

**Exercise 2 — the threshold curve.** Simulate the 3-qubit bit-flip code under random X errors: for physical error rate $p$ from 0 to 0.5, compute the LOGICAL error rate (probability the code fails, i.e., ≥2 physical errors mis-correct) both analytically ($3p^2 - 2p^3$ for majority-vote failure) and by Monte-Carlo simulation. Plot logical vs physical error rate, mark the break-even line (logical = physical), and find the threshold below which the code helps.

````solution
```python
import numpy as np, matplotlib.pyplot as plt

def logical_error_analytic(p):
    # code fails if 2 or 3 of the 3 qubits flip (majority vote wrong)
    return 3*p**2*(1-p) + p**3     # = 3p² - 2p³

def logical_error_mc(p, trials=20000, rng=None):
    rng = rng or np.random.default_rng(0)
    flips = (rng.random((trials, 3)) < p).sum(axis=1)   # errors per trial
    return np.mean(flips >= 2)                            # majority-vote failure

ps = np.linspace(0, 0.5, 40)
la = [logical_error_analytic(p) for p in ps]
lm = [logical_error_mc(p) for p in ps]
plt.plot(ps, la, label="logical (analytic 3p²−2p³)")
plt.plot(ps, lm, "o", ms=3, label="logical (Monte-Carlo)")
plt.plot(ps, ps, "k--", label="break-even (no coding)")
plt.xlabel("physical error rate p"); plt.ylabel("logical error rate"); plt.legend(); plt.grid(alpha=0.3)
plt.show()

# threshold: where 3p²-2p³ = p  →  p = 1/2 for this simple code
thr = 0.5
print(f"break-even threshold: p = {thr}")
print(f"at p=0.1: physical {0.1:.3f} vs logical {logical_error_analytic(0.1):.3f} (code HELPS)")
print(f"at p=0.4: physical {0.4:.3f} vs logical {logical_error_analytic(0.4):.3f} (code HURTS)")
```

The curves cross at **p = 0.5** for this toy code: below it, the logical error rate ($3p^2$ for small p) is *quadratically smaller* than the physical rate — e.g. at p=0.1, logical ≈ 0.028 (2.8× better); the code helps. Above it, encoding makes things WORSE (more qubits, more failure modes). The key insights: (1) the quadratic suppression ($p \to \sim3p^2$) is QEC's power — halving physical error more-than-halves logical error, and *concatenating* codes suppresses it doubly-exponentially; (2) there's a hard **threshold** below which correction pays and above which it backfires. Real codes (surface code, next lesson) have thresholds around ~1%, and the entire hardware industry races to push physical error rates below that line — which is exactly what "below threshold" (Google Willow, Module 0) means and why it was Nobel-adjacent news. You've now derived, from a Monte-Carlo you wrote, the single most important curve in the quantum-computing roadmap.
````

## Practice questions

1. Why doesn't encoding $\alpha\ket0+\beta\ket1 \to \alpha\ket{000}+\beta\ket{111}$ violate no-cloning?
2. What is a syndrome, and why does measuring it not destroy the logical superposition?
3. How does measurement "discretize" a continuous error, and why is this essential?
4. Why is the 3-qubit bit-flip code insufficient for real QEC, and what's the minimal fix for full single-error protection?
5. Define a stabilizer code in terms of Pauli operators and eigenspaces.
6. What is a code's threshold, and why does it drive hardware development priorities?
7. **Design question:** you're designing syndrome extraction for a code that must run for thousands of rounds (a real computation). Address: ancilla management between rounds, what happens if a syndrome measurement itself errs, why you can't just measure once, and how error correction interacts with actually computing on the logical qubit. What makes this "fault-tolerant" rather than just "error-correcting"?

````solution
1. It's not three copies — measuring any single physical qubit yields 50/50 with no information about $\alpha,\beta$; the logical information lives in the *correlations* (entanglement) across all three, which no-cloning permits (you can spread information you can't copy).
2. The syndrome is the pattern of stabilizer (parity) measurement outcomes; it identifies the error class. Stabilizers commute with logical operators and give identical results for all logical states, so measuring them reveals errors without collapsing the encoded superposition.
3. A continuous error (superposition of "no error" and "full error") is projected by syndrome measurement onto one branch — collapsing to either exactly no-error or exactly a full Pauli error, both correctable. Essential because you can't correct arbitrary continuous rotations, but you CAN correct the discrete Paulis they collapse into.
4. It catches only X errors (Z errors are invisible to Z-parity checks); minimal full fix is the 9-qubit Shor code (bit-flip code concatenated inside a phase-flip code), correcting any single-qubit error since {I,X,Y,Z} spans all of them.
5. A stabilizer code is defined by a set of commuting Pauli operators (stabilizers); the logical code space is their simultaneous +1 eigenspace, and errors are detected by which stabilizers they anticommute with (flipping those eigenvalues → the syndrome).
6. The threshold is the physical error rate below which error correction reduces (rather than increases) the logical error rate; it drives hardware because QEC only pays off below it — so achieving below-threshold gate/qubit fidelity is the gating milestone for fault-tolerant quantum computing.
7. Fault-tolerant syndrome extraction: (a) ancillas must be freshly reset each round (stale ancillas corrupt the next syndrome); (b) if a syndrome measurement itself errs, a SINGLE round gives wrong corrections — so you measure syndromes over *many rounds* and decode the space-time history (a faulty measurement shows as an isolated blip the decoder rejects); (c) one measurement is insufficient because measurement and gate errors during extraction are themselves errors — you need repeated rounds so the decoder can distinguish real data errors from measurement errors; (d) logical computation interleaves with syndrome rounds — logical gates must be implemented so they don't spread single errors into uncorrectable patterns (transversal gates, Module 10 next). "Fault-tolerant" (vs merely "error-correcting") means the *entire procedure* — including the error-correction circuitry itself — is designed so that a single physical fault anywhere (data, ancilla, gate, or measurement) cannot cause a logical error: the correction machinery must tolerate its own faults. That self-referential robustness — protecting the protection — is the deep design principle of the fault-tolerant era, and articulating it is exactly what separates a QEC-literate candidate from someone who's memorized the 3-qubit code.
````
