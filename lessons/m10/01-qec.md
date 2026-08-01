# From repetition codes to stabilizers

Everything in Modules 8–9 hit the same wall: real circuits decohere before finishing anything useful. Quantum error correction (QEC) is the escape — the technology that turns noisy physical qubits into near‑perfect *logical* qubits, enabling the deep algorithms (Shor, precise QPE) that NISQ can't run. This lesson builds QEC from the ground up: why quantum errors seem impossible to correct, the trick that makes it possible, the 3‑qubit codes, and the stabilizer language every real code speaks. This is the physics under every "fault‑tolerant quantum computing" roadmap — and understanding it is what QEC‑scientist roles pay for.

## Start here — the intuition

Quantum errors look impossible to fix for three reasons, and one idea dissolves all three. You can't copy a qubit (no‑cloning), you can't look at it to check (measurement destroys superposition), and its errors are *continuous* (a tiny unwanted rotation, not a clean flip). The escape: **don't copy — spread** one logical qubit across several physical ones via entanglement ($\alpha\ket0+\beta\ket1 \to \alpha\ket{000}+\beta\ket{111}$, which is *not* three copies); **don't measure the data — measure the parity between qubits** through ancillas, which reveals *whether an error happened* without revealing $\alpha$ or $\beta$; and that same parity measurement **digitizes** the continuous error, snapping a tiny rotation into either "no error" or "a full, exactly‑correctable flip."

Hold that middle idea above all — **you check for errors without ever reading the data** — because it is the move that makes the entire field possible, and it's just Module 6's ancilla‑parity trick wearing a cape.

## The escape, concretely: the 3-qubit bit-flip code

Encode $\ket{0_L}=\ket{000}, \ket{1_L}=\ket{111}$ (two CNOTs from the data qubit — entangling, not cloning, since we copy *basis states*). To detect an X (bit‑flip) error, measure two parities with ancillas: $Z_1Z_2$ ("do qubits 1 and 2 agree?") and $Z_2Z_3$. The pair of parity results is the **syndrome**, and it names the flipped qubit — $(-1,+1)\to$ qubit 1, $(-1,-1)\to$ qubit 2, $(+1,-1)\to$ qubit 3, $(+1,+1)\to$ no error — *without ever learning $\alpha,\beta$*, because those parities are identical for $\ket{000}$, $\ket{111}$, and every superposition.

@@diagram:qec-concept|QEC's escape: encode one logical qubit across many physical ones (not copies — entanglement), measure PARITY via ancillas (error without data), and the measurement discretizes continuous errors into correctable discrete ones.

@@widget

## Predict, then run — the syndrome IS Pauli anticommutation

Here is the scalable version of that table. A stabilizer (like $Z_1Z_2$, the Pauli string `ZZI`) is *flipped* by an error exactly when the two **anticommute** — and on a single qubit, two Paulis anticommute iff both are non‑identity and different (Module 6). So the whole syndrome is computable with one tiny function, no simulator needed. The cell also prints the coding payoff: logical error $\approx3p^2-2p^3$ vs. physical $p$.

**Predict first.** A `Z` error (phase flip) on qubit 0 — will the *bit‑flip* code's Z‑parity checks see it, or is it invisible (syndrome `[0,0]`)? And two X errors on qubits 0 and 1 — will their syndrome look like a *different single* error? Guess, then Run.

```run
# Live cell — the syndrome is Pauli anticommutation; coding buys quadratic error suppression.
def anticommute(a, b):               # single-qubit Paulis: anticommute iff both non-I and different
    return a != 'I' and b != 'I' and a != b

def syndrome(error):                 # error like 'XII'; stabilizers Z0Z1, Z1Z2 = "ZZI","IZZ"
    return [sum(anticommute(s[i], error[i]) for i in range(3)) % 2 for s in ("ZZI", "IZZ")]

for name, err in [("no error","III"), ("X q0","XII"), ("X q1","IXI"),
                  ("X q2","IIX"), ("Z q0","ZII"), ("XX q0,q1","XXI")]:
    print(f"{name:9} {err} -> syndrome {syndrome(err)}")

print("\nphysical p -> logical (3p^2 - 2p^3):  coding helps when logical < p")
for p in (0.5, 0.1, 0.01):
    print(f"  p={p:<5} logical={3*p*p - 2*p**3:.4f}")
```

The three single‑X errors give three *distinct* syndromes (`[1,0]`, `[1,1]`, `[0,1]`) — each uniquely correctable. But `Z q0` gives `[0,0]`: **invisible**, because Z commutes with the Z‑parity stabilizers — the bit‑flip code is phase‑blind. And `XX q0,q1` gives `[0,1]`, *identical to a single X on q2* — so a naive decoder "fixes" q2, adding a third error: the distance‑3 code corrects one error but is fooled by two. The suppression numbers show the point of it all: at $p=0.1$, logical error $\approx0.028$ (2.8× better); at $p=0.01$, $\approx0.0003$ (30× better) — coding turns $p$ into $\sim3p^2$, and that quadratic gap only opens up *below* a threshold.

```quiz
{"q":"How does QEC check for an error WITHOUT destroying the encoded superposition?","options":["By copying the qubit and comparing","By measuring the data qubits directly and voting","By measuring PARITY between qubits (stabilizers) via ancillas — the parity is identical for |000⟩, |111⟩, and their superpositions, so it reveals the error pattern while α and β are never disturbed","By invoking the no-cloning theorem"],"answer":2,"why":"Stabilizer (parity) measurements commute with the logical information: Z₁Z₂ returns the same value for any logical state, so it detects errors without collapsing the superposition. Measuring the data qubits directly WOULD destroy it — the exact mistake QEC is built to avoid."}
```

## Level up — the discretization miracle

Apply a tiny *continuous* over‑rotation $R_x(\epsilon)$ to one encoded qubit — a realistic coherent error. The state becomes a superposition of "no error" (amplitude $\cos(\epsilon/2)$) and "full bit‑flip" (amplitude $\sin(\epsilon/2)$). Now measure the syndrome: it **projects** that superposition onto one branch — "no error" with probability $\cos^2(\epsilon/2)$ (the tiny rotation is collapsed *away*, gone, not merely detected) or "full flip" with probability $\sin^2(\epsilon/2)$ (which you undo with a full X). Either way, after correction the state is *exactly* right with no residual $\epsilon$. You never have to correct a "20% rotation" — measurement converts continuous errors into discrete, exactly‑correctable Paulis. This is the single fact that makes fault tolerance possible.

## Level up — phase errors, the Shor code, and stabilizers

The bit‑flip code is blind to Z, but Module 6 gives the fix free: $HZH=X$, so the **phase‑flip code** is the same code conjugated by Hadamards (encode $\ket{+++}/\ket{---}$, check X‑parities). To catch *both* — and hence *any* single‑qubit error, since $\{I,X,Y,Z\}$ span them — concatenate into the **9‑qubit Shor code** (a phase code wrapped around three bit‑flip codes). Its existence *proved* QEC is possible (Shor, 1995). The compact language for all of this is the **stabilizer formalism**: a code is a set of commuting Pauli operators whose $+1$ eigenspace *is* the logical space; an error flips the eigenvalue of exactly the stabilizers it anticommutes with, and that $\pm1$ pattern is the syndrome. Every real code — surface, color, qLDPC — is specified this way, which is why the whole field thinks in Paulis.

## Level up — gotchas the pros watch for

- **"The code copies the qubit."** No — measuring any single physical qubit of $\alpha\ket{000}+\beta\ket{111}$ gives 50/50 and reveals nothing; the information lives in the correlations. No‑cloning is respected.
- **Measuring data instead of parity.** The entire trick is measuring stabilizers via ancillas; touching a data qubit collapses the logical state.
- **Forgetting phase errors.** A bit‑flip‑only demo protects against half the error types; real protection needs both bases.
- **Stale ancillas.** Syndrome ancillas must be reset each round or they carry old information into the next.
- **Exceeding the code distance.** The 3‑qubit code corrects one flip; two are mis‑diagnosed. Distance bounds what's correctable.
- **Syndrome ≠ a lookup for big codes.** For real codes, decoding syndrome→correction is a nontrivial algorithm (next lesson), not a table.

## Level up — the demo that taught the whole team

Asked to prove "does QEC actually work?" to skeptics: encode a known state, inject a *controlled* single‑qubit X, extract the syndrome, correct, and show fidelity 1.0 while the uncorrected copy is corrupted. Then sweep the physical error rate and plot logical vs physical — the curves cross at the **break‑even threshold**. Below it, correction wins; above it, the extra qubits and syndrome overhead make things *worse*. That single picture teaches the strategic fact of the field: QEC isn't magic, it's a trade that pays only once physical fidelity is below threshold — which is exactly why "below threshold" (Google Willow, Module 0) was landmark news and why the whole industry races gate fidelity.

## Key points

- QEC escapes no‑cloning (spread via entanglement), measurement‑destruction (measure parity/stabilizers, not data), and continuous errors (measurement digitizes them into Paulis).
- 3‑qubit bit‑flip code: encode $\ket{000}/\ket{111}$, measure $Z_1Z_2, Z_2Z_3$ → syndrome names the flipped qubit without revealing the data.
- Phase errors: the same code Hadamard‑conjugated ($HZH=X$); full single‑error protection needs both (9‑qubit Shor); correcting $\{I,X,Y,Z\}$ corrects *all* single‑qubit errors.
- Stabilizer formalism: a code = commuting Pauli stabilizers whose $+1$ eigenspace is the logical space; errors flip stabilizers they anticommute with, and the $\pm1$ pattern is the syndrome.
- Syndrome measurement digitizes continuous errors — a tiny rotation projects to "no error" or "full Pauli," both exactly correctable. The linchpin of fault tolerance.
- QEC pays off only below a physical‑error threshold — the strategic fact driving the fidelity race.

## Check yourself

```quiz
{"q":"A continuous coherent error rotates a qubit by a small angle ε. After syndrome measurement, what happens?","options":["The error stays a tiny ε-rotation needing ε-precision to fix","The measurement projects it into 'no error' (prob ~cos²(ε/2)) or a 'full Pauli error' (prob ~sin²(ε/2)) — both EXACTLY correctable; the continuous error is digitized","The error doubles","Nothing — continuous errors can't be corrected"],"answer":1,"why":"Syndrome measurement discretizes: the superposition of 'no error' and 'full flip' collapses to one branch. You never correct a partial rotation — measurement converts it to a discrete, exactly-correctable Pauli. This digitization is why QEC is possible at all."}
```

## Exercises

**Exercise 1 — extend the syndrome function.** Using the live cell's `anticommute`/`syndrome` pattern, add the phase‑flip code's stabilizers (`XXI`, `IXX`) and confirm it now *sees* a `Z` error and is blind to a lone `X`. What does that tell you about needing both codes?

````solution
```python
def anticommute(a, b): return a != 'I' and b != 'I' and a != b
def synd(error, stabs): return [sum(anticommute(s[i], error[i]) for i in range(3)) % 2 for s in stabs]
for err in ("ZII", "XII"):
    print(err, "bit-flip:", synd(err, ("ZZI","IZZ")), " phase-flip:", synd(err, ("XXI","IXX")))
# ZII bit-flip [0,0] (blind)  phase-flip [1,0] (caught)
# XII bit-flip [1,0] (caught) phase-flip [0,0] (blind)
```
Each code is blind to exactly the error type the other catches — perfectly complementary. Protecting against *both* is why you concatenate them into the 9‑qubit Shor code; catching $\{X,Z\}$ (and thus $Y=iXZ$) covers every single‑qubit error.
````

**Exercise 2 — the threshold curve.** Monte‑Carlo the 3‑qubit code: for $p$ from 0 to 0.5, estimate the logical error rate (majority‑vote fails when ≥2 of 3 flip) and compare to the analytic $3p^2-2p^3$; find where the code stops helping.

````solution
```python
import numpy as np
def analytic(p): return 3*p**2*(1-p) + p**3        # = 3p^2 - 2p^3
def mc(p, trials=20000, rng=np.random.default_rng(0)):
    return np.mean((rng.random((trials,3)) < p).sum(1) >= 2)
for p in (0.1, 0.3, 0.5):
    print(f"p={p}  analytic={analytic(p):.3f}  MC={mc(p):.3f}  helps={analytic(p) < p}")
```
Break‑even at $p=0.5$ for this toy code: below it logical $\approx3p^2$ is quadratically smaller than $p$ (at $p=0.1$, 0.028 vs 0.1 — helps); above it, encoding hurts. Real codes (surface, next lesson) have thresholds ~1%, and the whole hardware industry races to get physical error below that line — literally what "below threshold" means.
````

## Practice questions

1. Why doesn't encoding $\alpha\ket0+\beta\ket1\to\alpha\ket{000}+\beta\ket{111}$ violate no‑cloning?
2. What is a syndrome, and why does measuring it not destroy the logical superposition?
3. How does measurement "discretize" a continuous error, and why is that essential?
4. Why is the 3‑qubit bit‑flip code insufficient, and what's the minimal fix for full single‑error protection?
5. Define a stabilizer code in terms of Pauli operators and eigenspaces.
6. What is a code's threshold, and why does it drive hardware priorities?
7. **Design question:** for syndrome extraction that must run thousands of rounds, address ancilla management, what happens if a syndrome measurement itself errs, why one measurement is insufficient, and what makes the procedure *fault‑tolerant* rather than merely error‑correcting.

````solution
1. It's not three copies — any single physical qubit reads 50/50 with no info about $\alpha,\beta$; the information lives in the correlations, which no‑cloning permits.
2. The syndrome is the pattern of stabilizer outcomes; stabilizers commute with logical operators and return identical values for all logical states, so they reveal errors without collapse.
3. A continuous error (superposition of "no error"/"full error") is projected by the syndrome onto one branch — collapsing to an exactly‑correctable Pauli. Essential because arbitrary rotations aren't directly correctable but discrete Paulis are.
4. It catches only X (Z is invisible); minimal full fix is the 9‑qubit Shor code, correcting any single‑qubit error since $\{I,X,Y,Z\}$ span them.
5. A set of commuting Paulis (stabilizers) whose simultaneous $+1$ eigenspace is the logical space; errors are detected by which stabilizers they anticommute with.
6. The physical error rate below which correction *reduces* logical error; below‑threshold fidelity is the gating milestone for fault tolerance, so hardware chases it.
7. (a) Fresh‑reset ancillas each round; (b) a single faulty syndrome round gives wrong corrections, so you measure over many rounds and decode the space‑time history, rejecting isolated blips; (c) one measurement can't separate real data errors from measurement errors — repetition can; (d) *fault‑tolerant* means the entire procedure, including the correction circuitry, is built so a single physical fault anywhere (data, ancilla, gate, or measurement) can't cause a logical error — protecting the protection itself.
````

## Mastery checklist — you are ready to move on when you can

- ☐ State the three obstacles to QEC and the one idea that dissolves all three.
- ☐ Encode the 3‑qubit code and read a syndrome to the flipped qubit.
- ☐ Run the live cell and explain why a Z error is invisible and XX collides with a single X.
- ☐ Explain the discretization miracle: continuous error → correctable Pauli.
- ☐ Define a stabilizer code and connect syndromes to Pauli anticommutation.
- ☐ Explain the threshold and why it drives the hardware fidelity race.
