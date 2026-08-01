# CNOT, CZ, SWAP & controlled operations

Single-qubit gates rotate islands; two-qubit gates build bridges. They are the only way to create entanglement (last lesson proved tensor-product gates can't), the hardest thing hardware does (10–50× the error of single-qubit gates), and the currency in which circuit cost is really measured. Master CNOT and its family — and the phase-kickback trick — and every algorithm in Module 8 becomes readable.

## Start here — the intuition

A two-qubit gate lets one qubit's fate **depend on** another — a "quantum if‑statement." The star is **CNOT**: *flip the target qubit if the control is $\ket1$; leave it alone if the control is $\ket0$.* On plain 0/1 inputs that's just a conditional NOT. But two things make it magic.

First, feed CNOT a **control in superposition** and it doesn't pick a branch — it does both at once and **manufactures entanglement**: $H$ then CNOT turns two independent qubits into a Bell pair that always agree. Second, and deeper: point a controlled gate at a target that happens to be an **eigenstate**, and the effect bounces *backward* onto the control as a phase — **phase kickback**, where the "if" edits the *asker*, not the asked. That backward trick is the engine of nearly every quantum algorithm.

## CNOT — the conditional flip

$$\text{CNOT} = \ket0\bra0\otimes I + \ket1\bra1\otimes X: \quad \ket{00}\to\ket{00},\ \ket{01}\to\ket{01},\ \ket{10}\to\ket{11},\ \ket{11}\to\ket{10}$$

That projector‑sum is the master template: **controlled‑$U$ = $\ket0\bra0\otimes I + \ket1\bra1\otimes U$** — a unitary if‑statement where the "if" happens *in superposition*, both branches at once, no branch "taken" until measurement. Act on a superposed control and linearity manufactures a Bell state:

$$\text{CNOT}\left(\tfrac{\ket0+\ket1}{\sqrt2}\otimes\ket0\right) = \tfrac{\ket{00}+\ket{11}}{\sqrt2}$$

## The family: CZ, SWAP, controlled‑anything

**CZ** ($-1$ on $\ket{11}$ only) is *symmetric* — no control/target arrow, "both qubits 1 ⇒ minus sign" — and hardware‑native on many platforms; note $\text{CNOT} = (I\otimes H)\,\text{CZ}\,(I\otimes H)$. **SWAP** exchanges two qubits and costs **three CNOTs**, which is why moving quantum data across a chip is expensive (Module 7's routing overhead). **Toffoli (CCX)** flips the target iff *both* controls are 1 — the reversible AND, star of oracle construction. And **CP(γ)** puts $e^{i\gamma}$ on $\ket{11}$ — the QFT's workhorse.

## Phase kickback — the trick behind half of quantum computing

Apply CNOT with the *target* in the X‑eigenstate $\ket-$. The control‑$\ket0$ branch leaves $\ket-$ alone; the control‑$\ket1$ branch applies $X$, and $X\ket- = -\ket-$ — a mere eigenvalue. The target is unchanged in both branches; the $-1$ attaches to the *control's* $\ket1$:

$$\text{CNOT}\left(\tfrac{\ket0+\ket1}{\sqrt2}\right)\ket- = \left(\tfrac{\ket0-\ket1}{\sqrt2}\right)\ket-$$

**The control changed; the target didn't.** General law: controlled‑$U$ with the target in eigenstate $\ket u$ ($U\ket u = e^{i\phi}\ket u$) writes phase $e^{i\phi}$ onto the control's $\ket1$ and leaves the target untouched. This converts "query a function" into "write phases" — the middle beat of the algorithm template — and Deutsch–Jozsa, Bernstein–Vazirani, Grover's oracle, and phase estimation are all kickback in costume.

@@diagram:phase-kickback|Phase kickback: with the target in an eigenstate, controlled-U writes the eigenvalue's phase onto the CONTROL. The 'if' statement edits the asker, not the asked.

@@widget

## Predict, then run — flip, entangle, kick back

The live cell shows all three: the CNOT truth table, entanglement from a superposed control, and kickback used as Deutsch's one‑query algorithm.

**Predict first.** In the last part, the target sits in $\ket-$ and the "oracle" is either nothing ($U=I$) or a CNOT ($U=X$). Kickback puts the eigenvalue's phase on the control, which the final $H$ reads. What single bit should the control show for each? Guess, then Run.

```run
# Live cell — CNOT as conditional flip, entangler, and kickback.
import numpy as np

print("CNOT truth table (control q1, target q0):")
for c in [0,1]:
    for t in [0,1]:
        qc = QuantumCircuit(2)
        if c: qc.x(1)
        if t: qc.x(0)
        qc.cx(1, 0)
        print(f"  |{c}{t}> -> |{max(qc.probabilities(), key=qc.probabilities().get)}>")

qc = QuantumCircuit(2); qc.h(1); qc.cx(1, 0)   # superposed control -> ENTANGLEMENT
print("\nH then CNOT (Bell):", {k: round(v,3) for k,v in qc.probabilities().items()})

def deutsch(apply_u):                          # one query tells U = I from U = X
    qc = QuantumCircuit(2)
    qc.x(0); qc.h(0)      # target q0 -> |->  (eigenstate)
    qc.h(1)              # control q1 -> |+>
    apply_u(qc)          # the "oracle"
    qc.h(1)              # read the kicked-back phase off the control
    p = {}
    for k, v in qc.probabilities().items(): p[k[0]] = p.get(k[0], 0.0) + v   # marginalize to control
    return {kk: round(vv, 3) for kk, vv in p.items()}

print("\nDeutsch  U=I :", deutsch(lambda qc: None))
print("Deutsch  U=X :", deutsch(lambda qc: qc.cx(1, 0)))
```

The truth table shows the conditional flip; the superposed control produces a Bell pair (correlation, not a copy); and Deutsch's control bit reads **0 for $U=I$, 1 for $U=X$** — a global property of the oracle extracted with one query, *without ever measuring the target*. That's phase kickback earning its fame, and it's Module 8's opener in miniature.

```quiz
{"q":"CNOT acts on (α|0⟩ + β|1⟩) ⊗ |0⟩ (control left). The output is:","options":["(α|0⟩ + β|1⟩) ⊗ (α|0⟩ + β|1⟩) — a copy","α|00⟩ + β|11⟩ — an entangled state","α|00⟩ + β|10⟩ — nothing changes","|11⟩ — both flip"],"answer":1,"why":"Linearity: the |0⟩-branch stays |00⟩, the |1⟩-branch flips the target to |11⟩. Superpositions entangle rather than copy — no-cloning in action."}
```

## Circuit identities you'll actually use

$\text{CX}\cdot\text{CX} = I$ (self‑inverse); $(H\otimes H)\,\text{CX}_{01}\,(H\otimes H) = \text{CX}_{10}$ (H's on both qubits *reverse the arrow* — direction is basis‑relative); $\text{CZ} = (I\otimes H)\text{CX}(I\otimes H)$; and the error‑propagation pair $\text{CX}(X\otimes I)\text{CX} = X\otimes X$ (an X error on the control spreads to the target) and $\text{CX}(I\otimes Z)\text{CX} = Z\otimes Z$ (a Z error on the target spreads back to the control). Those last two are why errors have *plumbing* through entangling gates — Module 10's nightmare and its design tool. And CNOT "copies" *basis* states only ($\ket x\ket0 \to \ket x\ket x$ for $x\in\{0,1\}$) — on superpositions it entangles, which is the closest legal thing to cloning.

## Level up — parity measurement, the workhorse

Determine whether two qubits *agree* (even parity) or *disagree*, without learning their individual values: CNOT each data qubit into a fresh ancilla, then measure only the ancilla — it accumulates $q_0\oplus q_1$ and nothing else. Feed the entangled $\tfrac{1}{\sqrt2}(\ket{00}+\ket{11})$ (both branches even parity): the ancilla reads 0 with certainty **and the superposition survives** — measuring parity collapsed nothing, because both branches shared it. *Measurements collapse exactly the distinction they read — no more.* That surgical precision is why error correction can ask "did an error happen?" without measuring, and destroying, the data.

## Level up — gotchas the pros watch for

- **Control/target order in code.** `qc.cx(0, 1)` = control 0, target 1; reversed arguments = different physics (unless H‑sandwiched).
- **"Control must be 0 or 1 to fire."** The gate acts on amplitudes linearly — superposed controls process both branches; only measurement decides.
- **Thinking CNOT copies.** It copies basis states only; on superpositions it entangles ($\ket+\ket0 \to$ Bell, not $\ket+\ket+$).
- **Treating SWAP as free.** Three CNOTs each, and CNOTs are the error budget — algorithms are redesigned to avoid SWAPs.
- **CZ direction pedantry.** CZ is symmetric — draw it as a dumbbell (dot–dot), not an arrow.

## Key points

- Controlled‑U = $\ket0\bra0\otimes I + \ket1\bra1\otimes U$: a unitary if‑statement over both branches; CNOT (U=X) is the canonical entangler (H + CNOT ⇒ Bell).
- CZ is symmetric and hardware‑friendly; CNOT = H‑sandwiched CZ; SWAP = 3 CNOTs; Toffoli = reversible AND.
- Phase kickback: eigenstate targets send their eigenvalue‑phase to the CONTROL — the mechanism of DJ, BV, Grover, QPE.
- Identities: self‑inverse; H⊗H reverses the arrow; CX spreads X (control→target) and Z (target→control) — errors have plumbing.
- CNOT copies only basis states; on superpositions it entangles — cloning is impossible, this is the closest legal thing.
- Parity extraction reads a joint property without touching individual values — the primitive of error correction.

## Check yourself

```quiz
{"q":"A controlled-U acts with its target in U's eigenstate |u⟩, eigenvalue e^{iφ}. What changes?","options":["The target rotates by φ","Nothing — eigenstates are inert","The CONTROL acquires relative phase e^{iφ} on its |1⟩ component; the target is unchanged (phase kickback)","Both qubits become maximally entangled"],"answer":2,"why":"The |1⟩-branch's target picks up e^{iφ}|u⟩ — same state, phase attached to the branch, so it becomes a property of the control's superposition. This trick powers DJ, BV, Grover, and QPE."}
```

## Exercises

**Exercise 1 — reverse the arrow.** In the live cell, confirm that $H$ on both qubits reverses a CNOT: build `h(0); h(1); cx(0,1); h(0); h(1)` and check it acts like `cx(1,0)` (e.g. both send $\ket{01}$‑style inputs the same way). Which principle does this illustrate?

````solution
In the Hadamard basis, control and target exchange roles — so "which qubit controls" is a *basis‑relative* statement, not an absolute one. On hardware with a fixed native CNOT direction, the transpiler adds four H's to flip arrows — visible in every transpiled circuit.
````

**Exercise 2 — the kickback interferometer.** Extend the Deutsch cell with a third oracle, `U = Z` on the target's computational basis... actually try $U$ = "controlled‑Z from control to target": does the control still flip? Explain using which eigenstate the target sits in.

````solution
The target is in $\ket-$, an eigenstate of $X$ (eigenvalue $-1$) but *not* of $Z$. A controlled‑Z with the target in $\ket-$ does not cleanly kick a global phase onto the control — it entangles instead. Kickback needs the target in an eigenstate of the *controlled operation*; that's why DJ/BV oracles are built so the target ($\ket-$) is an eigenstate of the applied $X$'s.
````

## Practice questions

1. Write CZ's action on the four basis states and explain why "which qubit is the control" is meaningless for it.
2. Decompose SWAP into CNOTs and trace $\ket{10}$ through to confirm it becomes $\ket{01}$.
3. Toffoli is the reversible AND. Why does its existence prove quantum circuits can compute any classical function?
4. Feed $\ket-$ into a CNOT's *control* (target $\ket0$). Is the control still $\ket-$ afterward?
5. Why does a CNOT between non‑adjacent qubits cost ~7 two‑qubit gates with one intermediate qubit?
6. A Z error on a target appears on the control after a CNOT. Which identity predicted this, and is it a bug?
7. **Design question:** compute the AND of $q_0, q_1$ into a fresh $q_2$, use it, then *uncompute* it back to $\ket0$. Why is uncomputation — not measurement or reset — the right tool when $q_0, q_1$ are in superposition?

````solution
1. $\ket{00},\ket{01},\ket{10}$ unchanged; $\ket{11}\to-\ket{11}$. The rule "minus iff both are 1" treats the qubits identically — no asymmetry to hang a direction on.
2. CX(0,1), CX(1,0), CX(0,1) exchanges the states; tracing $\ket{10}$ gives $\ket{01}$.
3. Reversible AND plus NOT (X) is universal for Boolean logic, so any classical circuit compiles into Toffolis + X's — quantum ⊇ classical, constructively.
4. Expand $\ket-\ket0 = \tfrac{1}{\sqrt2}(\ket{00}-\ket{10}) \to \tfrac{1}{\sqrt2}(\ket{00}-\ket{11})$ — entangled; the control is no longer in any single‑qubit state. Kickback needs an eigenstate *target*.
5. Route in (SWAP = 3 CX), interact (1 CX), route back (3 CX) — 7 total; why coupling maps matter (Module 7).
6. $\text{CX}(I\otimes Z)\text{CX} = Z\otimes Z$: Z spreads target→control. Not a bug — unitary bookkeeping — but it's why phase errors travel backward through parity checks.
7. CCX(0,1→2) computes AND; use it; CCX(0,1→2) again (self‑inverse) restores $q_2 = \ket0$. With $q_0q_1$ superposed, $q_2$ is *entangled* with them after the AND; measuring or resetting it would collapse the data. Uncomputation unitarily disentangles the scratch while preserving all data phases — the compute–use–uncompute pattern behind every serious algorithm.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Write the controlled‑U template and the CNOT truth table from memory.
- ☐ Explain why a superposed control produces entanglement, not a copy.
- ☐ Derive phase kickback and name three algorithms that run on it.
- ☐ Run the live cell and read Deutsch's one‑query answer off the control.
- ☐ State that SWAP = 3 CNOTs and why routing is expensive.
- ☐ Explain error propagation ($X$ control→target, $Z$ target→control) and why codes care.
