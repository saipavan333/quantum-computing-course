# CNOT, CZ, SWAP & controlled operations

Single-qubit gates rotate islands; two-qubit gates build bridges. They are the only way to create entanglement (last lesson proved tensor-product gates can't), the hardest thing hardware does (10–50× the error of single-qubit gates), and the currency in which circuit cost is really measured. Master CNOT and its family — matrices, circuit behavior, identities, and the phase-kickback trick — and every algorithm in Module 8 becomes readable.

## 1. CNOT — the conditional flip

The **controlled-NOT**: flip the **target** qubit if the **control** qubit is $\ket1$; do nothing if it's $\ket0$.

$$\text{CNOT}\,\ket{c\,t}: \quad \ket{00}\to\ket{00} \quad \ket{01}\to\ket{01}\quad \ket{10}\to\ket{11} \quad \ket{11}\to\ket{10} \qquad (\text{left bit} = \text{control here})$$

$$\text{CNOT} = \begin{pmatrix}1&0&0&0\\0&1&0&0\\0&0&0&1\\0&0&1&0\end{pmatrix} = \underbrace{\ket0\bra0\otimes I}_{\text{control 0: do nothing}} + \underbrace{\ket1\bra1\otimes X}_{\text{control 1: flip}}$$

That second form — a projector-sum — is the master template: **controlled-$U$ = $\ket0\bra0\otimes I + \ket1\bra1\otimes U$** for any unitary $U$. Read it as a quantum `if`-statement… with the crucial difference that it's unitary: the "if" happens *in superposition*, both branches at once, no branch ever "taken" until measurement.

Watch it act on a superposed control (THE calculation of this module):

$$\text{CNOT}\left(\tfrac{\ket0 + \ket1}{\sqrt2}\otimes\ket0\right) = \tfrac{1}{\sqrt2}\big(\text{CNOT}\ket{00} + \text{CNOT}\ket{10}\big) = \tfrac{\ket{00} + \ket{11}}{\sqrt2}$$

Linearity did everything: each branch followed its own rule, and the output is the unfactorable $\ket\Phi$ from last lesson — **entanglement, manufactured**. H-then-CNOT is the standard two-gate recipe for it (next lesson's opening move).

In Qiskit — control first, target second, and remember little-endian labels:

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
qc = QuantumCircuit(2)
qc.h(0)          # superpose qubit 0
qc.cx(0, 1)      # control=q0, target=q1
print(Statevector(qc).probabilities_dict())   # {'00': 0.5, '11': 0.5} — Bell!
```

## 2. The family: CZ, SWAP, controlled-anything

**CZ (controlled-Z)** — apply Z to the target if control is $\ket1$: $\mathrm{diag}(1, 1, 1, -1)$. Only $\ket{11}$ takes a sign. Two facts with consequences:

- **CZ is symmetric**: it doesn't care which qubit you call control — "both qubits 1 ⇒ minus sign." No arrow, no direction. Hardware loves it (many platforms implement CZ natively).
- **CNOT = (I⊗H)·CZ·(I⊗H)** — an H sandwich on the target converts phase-flip into bit-flip (HZH = X, promoted to controlled form). Transpilers use this constantly; so will you.

**SWAP** — exchange the two qubits' states: $\ket{ab}\to\ket{ba}$. Decomposes as **three CNOTs** (directions alternating: CX(0,1)·CX(1,0)·CX(0,1) — the xor-swap trick from classical programming, quantum edition). Cost intuition: on hardware where qubits aren't adjacent, moving quantum data = SWAP chains = 3 CNOTs per hop — the origin of Module 7's routing overhead.

**Controlled-U for any U**: `qc.cp(γ, c, t)` (controlled-phase), `qc.crz`, `qc.cry`… and **Toffoli (CCX)** — flip target iff BOTH controls are 1 — the reversible AND gate, star of oracle construction (Module 8), decomposable into ~6 CNOTs + single-qubit gates.

| Gate | Matrix essence | Symmetric? | Typical use |
|---|---|---|---|
| CNOT/CX | X on target if control 1 | no | entangling, parity, copy-in-basis |
| CZ | −1 on $\ket{11}$ | **yes** | native hardware gate, graph states |
| SWAP | exchange states | yes | routing (3 CNOTs — expensive!) |
| CP(γ) | $e^{i\gamma}$ on $\ket{11}$ | yes | QFT (Module 8's workhorse) |
| CCX | X if both controls 1 | in controls | oracles, arithmetic |

## 3. Phase kickback — the trick behind half of quantum computing

Apply CNOT when the **target** is in an X-eigenstate $\ket-$:

$$\text{CNOT}\,\ket{+}\ket{-} \;=\; ?$$

Branch it: control-$\ket0$ branch leaves $\ket-$ alone; control-$\ket1$ branch applies X to $\ket-$, and $X\ket- = -\ket-$ — an **eigenvalue**, a mere phase! The target state is unchanged in both branches; the −1 attaches to the *control's* $\ket1$ component:

$$\text{CNOT}\left(\tfrac{\ket0+\ket1}{\sqrt2}\right)\ket- = \left(\tfrac{\ket0-\ket1}{\sqrt2}\right)\ket- = \ket-\,\ket-$$

**The control changed; the target didn't.** The "conditional" gate acted backwards — the eigenvalue of the target *kicked back* onto the control as a relative phase. General law: controlled-$U$ with target in eigenstate $\ket u$ ($U\ket u = e^{i\phi}\ket u$) writes phase $e^{i\phi}$ onto the control's $\ket1$ component and leaves the target untouched.

@@diagram:phase-kickback|Phase kickback: with the target in an eigenstate, controlled-U writes the eigenvalue's phase onto the CONTROL. The 'if' statement edits the asker, not the asked.

Why this is the field's favorite trick: it converts "query a function" into "write phases" — the middle beat of the algorithm template. Deutsch–Jozsa, Bernstein–Vazirani, Grover's oracle, and phase estimation are ALL phase kickback in different costumes (Module 8 will say "kickback" about once per page). It's also last lesson-but-one's fine print made real: the global-phase-when-alone became relative-phase-when-controlled — you were promised this would earn its keep.

## 4. Circuit identities you'll actually use

Each one saves real gates or real confusion (verify any with `Operator.equiv` — two are exercises):

| Identity | Words |
|---|---|
| $\mathrm{CX}_{01}\cdot\mathrm{CX}_{01} = I$ | CNOT self-inverse (undo = repeat) |
| $(H\otimes H)\,\mathrm{CX}_{01}\,(H\otimes H) = \mathrm{CX}_{10}$ | H's on both qubits REVERSE the arrow — control and target swap! |
| $\mathrm{CZ} = (I\otimes H)\mathrm{CX}(I\otimes H)$ | phase-flip ↔ bit-flip conversion |
| $\mathrm{CX}\,(X\otimes I)\,\mathrm{CX} = X\otimes X$ | X on control propagates through: errors SPREAD via CNOT (Module 10's nightmare & tool) |
| $\mathrm{CX}\,(I\otimes Z)\,\mathrm{CX} = Z\otimes Z$ | Z on target propagates back onto control |
| CNOT "copies" basis states | $\ket{x}\ket0 \to \ket x\ket x$ for $x\in\{0,1\}$ — basis copy ONLY (no-cloning survives: superpositions entangle instead of copying — next lesson) |

The arrow-reversal identity deserves a pause: whether a CNOT points "up" or "down" is a *basis-relative statement*, not an absolute one. On hardware with a fixed native direction, the transpiler adds four H's to flip arrows — visible in every transpiled circuit you'll ever read.

## Worked example — parity measurement, the workhorse circuit

*Task: determine whether two qubits agree (even parity) or disagree (odd), WITHOUT learning their individual values — the primitive underlying error correction (Module 10) and half of hardware diagnostics.*

**Circuit**: fresh ancilla $\ket0$; CNOT from each data qubit into the ancilla; measure only the ancilla.

$$\ket{q_1 q_0}\ket{0}_{\text{anc}} \xrightarrow{\text{CX}(q_0,\text{anc})} \xrightarrow{\text{CX}(q_1,\text{anc})} \ket{q_1 q_0}\ket{q_0 \oplus q_1}$$

The ancilla accumulates XOR — flips once per data-1 — landing on parity. Measuring it reads $q_0\oplus q_1$ and *nothing else*.

**The quantum magic**: feed in the entangled $\tfrac{1}{\sqrt2}(\ket{00} + \ket{11})$ (parity 0 in both branches): ancilla reads 0 with certainty, **and the superposition survives** — both branches shared the same parity, so measuring parity collapsed nothing. Feed $\tfrac{1}{\sqrt2}(\ket{00} + \ket{01})$: branches disagree in parity; the ancilla measurement collapses the state to the matching branch. *Measurements collapse exactly the distinction they read — no more.* That surgical precision is why error correction can measure "did an error happen?" without measuring — and destroying — the data itself.

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
qc = QuantumCircuit(3)                 # q0, q1 data; q2 ancilla
qc.h(0); qc.cx(0, 1)                   # entangled pair, even parity
qc.cx(0, 2); qc.cx(1, 2)               # parity into ancilla
sv = Statevector(qc)
print(sv.probabilities_dict([2]))      # {'0': 1.0} — ancilla certain, data untouched
print(sv.probabilities_dict([0, 1]))   # {'00': 0.5, '11': 0.5} — superposition alive ✓
```

(`probabilities_dict([2])` marginalizes to qubit 2 — Module 3's marginalization, as a method argument.)

## Gotchas

- **Control/target order in code.** `qc.cx(0, 1)` = control 0, target 1. Reversed arguments = reversed circuit = different physics (unless H-sandwiched!). When histograms look transposed, check every `cx`'s argument order first.
- **"Control must be 0 or 1 for the gate to fire."** The gate acts on *amplitudes, linearly* — superposed controls process both branches simultaneously. There is no moment when the circuit "decides"; only measurement decides.
- **Thinking CNOT copies qubits.** It copies *basis* states only. On superpositions it entangles: $\ket+\ket0 \to$ Bell state, NOT $\ket+\ket+$. (Next lesson proves no gate can do better — no-cloning.)
- **Forgetting kickback in "the target can't change the control".** With eigenstate targets, ONLY the control changes. If a control qubit's phase looks haunted, look for a controlled gate downstream whose target sat in an eigenstate.
- **Treating SWAP as free.** Three CNOTs each, and CNOTs are the error budget. Algorithms are redesigned around avoiding SWAPs; "just swap them" is a sentence that costs 3× the two-qubit error rate.
- **CZ direction pedantry — inverted.** Writing "control" and "target" on a CZ is meaningless (symmetric); insisting on a direction in documentation confuses readers. Draw it as a dumbbell (dot–dot), not an arrow.

## Scenario — the error that walked across the chip

A hardware team sees a puzzling correlation: whenever qubit 3 suffers a bit-flip error early in a circuit, qubit 7 — never touching qubit 3 directly — shows errors too. The circuit between them: a CNOT chain 3→5→7 implementing a parity computation. Your diagnosis, straight from the identity table: $\mathrm{CX}\,(X\otimes I)\,\mathrm{CX} = X\otimes X$ — **CNOTs propagate X errors from control to target**. Qubit 3's early flip rode the chain: after CX(3,5) it lives on both 3 and 5; after CX(5,7), on 7 as well. One physical error became three correlated errors — exactly what naive independent-error models miss, and exactly why error-correction codes are *designed around* propagation rules (fault-tolerant circuits order their CNOTs so single errors can't multiply catastrophically — Module 10). The fix here: reorder the parity extraction. The skill: reading error flow through entangling gates like plumbing.

## Key points

- Controlled-U = $\ket0\bra0\otimes I + \ket1\bra1\otimes U$: a unitary if-statement processing both branches in superposition; CNOT (U = X) is the canonical entangler: H + CNOT ⇒ Bell state.
- CZ is symmetric ($-1$ on $\ket{11}$ only) and hardware-friendly; CNOT = H-sandwiched CZ; SWAP = 3 CNOTs (routing is expensive); Toffoli = reversible AND (oracle fuel).
- Phase kickback: eigenstate targets send their eigenvalue-phase to the CONTROL — the mechanism of DJ, BV, Grover, and QPE. Target unchanged, control edited.
- Key identities: CNOT self-inverse; H⊗H reverses the arrow; CX propagates X from control→target and Z from target→control (errors spread — and codes exploit it).
- CNOT copies ONLY basis states; on superpositions it entangles — cloning is impossible and this is the closest legal thing.
- Parity extraction via ancilla: measure a joint property without touching individual values — the primitive of error correction and the model of surgical quantum measurement.

## Check yourself

```quiz
{"q":"CNOT acts on (α|0⟩ + β|1⟩) ⊗ |0⟩ (control left). The output is:","options":["(α|0⟩ + β|1⟩) ⊗ (α|0⟩ + β|1⟩) — a copy","α|00⟩ + β|11⟩ — an entangled state","α|00⟩ + β|10⟩ — nothing changes","|11⟩ — both flip"],"answer":1,"why":"Linearity: the |0⟩-branch stays |00⟩, the |1⟩-branch flips the target: |11⟩. Superpositions entangle rather than copy — no-cloning in action."}
```

```quiz
{"q":"A controlled-U acts with its target in U's eigenstate |u⟩, eigenvalue e^{iφ}. What changes?","options":["The target rotates by φ","Nothing — eigenstates are inert","The CONTROL acquires relative phase e^{iφ} on its |1⟩ component; the target is unchanged (phase kickback)","Both qubits become maximally entangled"],"answer":2,"why":"The |1⟩-branch's target picks up e^{iφ}|u⟩ — same state, phase attached to the branch. The phase is thus a property of the control's superposition. This trick powers DJ, BV, Grover, and QPE."}
```

## Exercises

**Exercise 1 — verify the two load-bearing identities.** Using `Operator.equiv`: (a) confirm $(H\otimes H)\,\mathrm{CX}_{01}\,(H\otimes H) = \mathrm{CX}_{10}$ (arrow reversal); (b) confirm CX·(X⊗I)·CX = X⊗X (error propagation) — mind Qiskit's qubit ordering when placing the X. Then answer: which of the two explains why "CNOT direction" is basis-relative, and which underlies fault-tolerant circuit-design constraints?

````solution
```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Operator

# (a) arrow reversal
lhs = QuantumCircuit(2)
lhs.h(0); lhs.h(1); lhs.cx(0, 1); lhs.h(0); lhs.h(1)
rhs = QuantumCircuit(2)
rhs.cx(1, 0)
print(Operator(lhs).equiv(Operator(rhs)))       # True

# (b) propagation: CX (X on control) CX  ==  X on both
lhs2 = QuantumCircuit(2)
lhs2.cx(0, 1); lhs2.x(0); lhs2.cx(0, 1)         # control is q0
rhs2 = QuantumCircuit(2)
rhs2.x(0); rhs2.x(1)
print(Operator(lhs2).equiv(Operator(rhs2)))     # True
```

(a) explains basis-relativity of direction: in the Hadamard basis, control and target exchange roles — "which qubit controls" depends on which basis you describe the physics in. (b) is the fault-tolerance constraint: a single X error before a CNOT exits as a *two-qubit* correlated error; FT circuit design (Module 10) orders operations so no single fault can propagate into an uncorrectable pattern. Two identities, two pillars: one epistemic (direction is perspective), one engineering (errors have plumbing).
````

**Exercise 2 — build the kickback interferometer (Deutsch's algorithm, unnamed).** Construct: $q_0$: H — [controlled-U with $q_0$ as control, $q_1$ as target, target prepared in $\ket-$ via X then H] — H — measure $q_0$. Run twice: with U = I (`nothing`) and U = X (`cx`). Predict, then verify: what does the single measured bit of $q_0$ tell you about U? Why is this remarkable?

````solution
Prediction via kickback + master formula: target $\ket-$ is an eigenstate of both I (eigenvalue +1) and X (eigenvalue −1). The control's $\ket1$ branch acquires that eigenvalue: phase 0 or π. H-sandwich reads it: $p(0) = \cos^2(0/2) = 1$ for U = I; $p(0) = \cos^2(\pi/2) = 0$ for U = X. **The measured bit IS the eigenvalue sign.**

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def deutsch(apply_u):
    qc = QuantumCircuit(2)
    qc.x(1); qc.h(1)          # target → |−⟩
    qc.h(0)                   # control → |+⟩
    apply_u(qc)               # the "oracle"
    qc.h(0)                   # read the phase
    return Statevector(qc).probabilities_dict([0])

print(deutsch(lambda qc: None))            # {'0': 1.0}  → U = I
print(deutsch(lambda qc: qc.cx(0, 1)))     # {'1': 1.0}  → U = X
```

Why remarkable: classically, distinguishing "identity" from "flip" requires observing the target's response to a known input — you must LOOK at the output. Here the target was never measured, never changed, and one control-qubit measurement extracted a *global property* of U (its eigenvalue on $\ket-$) with certainty. Scale this idea — one query revealing a joint property of a function's whole behavior — and you have Deutsch–Jozsa (Module 8's opener), which you have now, in fact, already built for the 1-bit case. Save this notebook; Module 8 extends it by three lines.
````

## Practice questions

1. Write CZ's action on each of the four basis states, and explain in one sentence why "which qubit is the control" is meaningless for it.
2. Decompose SWAP into CNOTs and trace $\ket{10}$ through all three to confirm it emerges as $\ket{01}$.
3. Toffoli flips its target iff both controls are 1. What classical gate is this, and why does its existence prove quantum circuits can compute any classical function?
4. Feed $\ket-$ into a CNOT's CONTROL (target $\ket0$). Compute the output — is the control still $\ket-$? (Careful: target isn't an eigenstate of anything relevant; expand in the computational basis.)
5. Why does a CNOT between non-adjacent qubits on hardware cost ~7 two-qubit gates on a linear chip with one intermediate qubit?
6. Your circuit's Z error on a target qubit mysteriously appears on the control after a CNOT. Which identity predicted this, and is it a bug?
7. **Design question:** design a 3-qubit circuit that computes the AND of $q_0, q_1$ into a fresh $q_2$, uses it (conceptually) for something, then UNCOMPUTES it so $q_2$ returns to $\ket0$ — and explain why uncomputation (not measurement, not reset) is the right tool when $q_0, q_1$ are in superposition.

````solution
1. $\ket{00},\ket{01},\ket{10}$ unchanged; $\ket{11}\to-\ket{11}$. The rule "minus iff both are 1" treats the qubits identically — no asymmetry to hang a direction on.
2. CX(0,1): $\ket{10}\to\ket{11}$ (control q0=… careful with convention; using left-bit control notation: control=left: $\ket{10}\to\ket{11}$); CX(1,0): $\ket{11}\to\ket{01}$; CX(0,1): $\ket{01}\to\ket{01}$. Net $\ket{10}\to\ket{01}$ ✓ exchanged.
3. Reversible AND. AND + NOT (X) is universal for Boolean logic, so any classical circuit compiles into Toffolis + X's: quantum ⊇ classical computation, constructively.
4. Expand: $\ket-\ket0 = \tfrac{1}{\sqrt2}(\ket{00} - \ket{10}) \to \tfrac{1}{\sqrt2}(\ket{00} - \ket{11})$ — an *entangled* state; the control is no longer in any single-qubit state at all (let alone $\ket-$). Kickback needs an eigenstate TARGET; superposed controls with non-eigenstate targets entangle instead.
5. Route in (SWAP = 3 CX), interact (1 CX), route back (3 CX) — 7 total; real transpilers amortize smarter but the order-of-magnitude stands, which is why coupling maps matter (Module 7).
6. $\mathrm{CX}(I\otimes Z)\mathrm{CX} = Z\otimes Z$: Z propagates target→control. Not a bug — unitary bookkeeping; but it IS the reason phase errors spread backwards through parity-check circuits, constraining their design.
7. Model: CCX(0,1→2) computes AND into $q_2$; [use it — e.g., CZ from $q_2$ to a phase register, or in DJ-style: a controlled-phase]; then CCX(0,1→2) again (Toffoli self-inverse) restores $q_2 = \ket0$. Why uncompute: with $q_0q_1$ superposed, $q_2$ is *entangled* with them after the AND; measuring or resetting it would collapse/decohere the data register (the parity-measurement lesson in reverse — reading it reads them). Uncomputation unitarily disentangles the scratch qubit, returning it clean while preserving all data-register phases. This compute–use–uncompute sandwich is *the* standard pattern for scratch space in every serious quantum algorithm (and the reason "quantum garbage collection" means daggered circuits, not free()).
````
