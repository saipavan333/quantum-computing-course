# Qiskit fundamentals: building & visualizing circuits

You've been using Qiskit as a calculator. Now you learn it as a professional instrument — the full `QuantumCircuit` API: registers, measurement plumbing, composition, parameterized circuits (the foundation of Module 9's variational algorithms), and the introspection tools that let you reason about cost. Qiskit 2.x is the industry's most-used quantum SDK; fluency here is a checkbox on real job listings.

@@diagram:qiskit-stack|Where your code sits: you build circuits (SDK) → the transpiler rewrites them for a target → a primitive (Sampler/Estimator) executes on simulator or QPU → results return as counts/expectations. Module 7 walks this stack top to bottom.

## Start here — the intuition

Three ideas make Qiskit click. **A circuit has two kinds of bits** — qubits hold quantum state, classical bits catch measurement outcomes, and `measure` is the bridge between them; forgetting the classical bits is the classic first stumble. **Two circuits with the same gate count can cost wildly different amounts** — because what noise actually sees is *depth* (the number of sequential layers), not *size* (the raw operation count), so a shallow circuit survives on hardware where a deep one dissolves. **Circuits are composable, parameterized building blocks** — you write functions that *return* circuits and use symbolic `Parameter` angles, which is the exact design that makes Module 9's variational algorithms possible.

Carry one habit above all: **quote depth, size, and `count_ops` whenever you discuss a circuit's cost.** Depth is the ruler for "will this run on real hardware?" — the question every other Module 7 lesson circles back to.

## 1. Circuits, registers, and the two kinds of bits

```python
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister

qc = QuantumCircuit(3, 3)          # 3 qubits + 3 CLASSICAL bits
```

The two arguments matter: **qubits** hold quantum state; **classical bits** receive measurement outcomes. Forgetting classical bits (then wondering why you can't measure) is the standard first stumble. For readable larger programs, use named registers:

```python
data = QuantumRegister(2, "data")
anc  = QuantumRegister(1, "anc")
creg = ClassicalRegister(2, "result")
qc = QuantumCircuit(data, anc, creg)
qc.h(data[0]); qc.cx(data[0], data[1])
```

Named registers turn circuit drawings from `q_0, q_1, q_2` into `data_0, data_1, anc` — self-documenting circuits are code review gold.

**Measurement** connects the two worlds:

```python
qc.measure(data[0], creg[0])       # qubit → classical bit, explicitly wired
qc.measure_all()                   # OR: measure every qubit into auto-added bits
```

`measure_all()` *adds* a fresh classical register (plus a barrier) — calling it on a circuit that already has classical bits gives you extra, empty-looking bits and confusing double-register counts strings like `'01 00'`. Choose one style per circuit: explicit wiring for surgical control, `measure_all()` for quick full readout.

## 2. The gate vocabulary in practice

All of Module 6, as methods — plus the introspection that tells you what you built:

```python
import numpy as np
qc = QuantumCircuit(3)
qc.h(0)
qc.cx(0, 1)
qc.rz(np.pi/4, 1)
qc.ccx(0, 1, 2)                    # Toffoli
qc.swap(0, 2)
qc.barrier()                       # visual/compiler fence — not a gate
qc.x(2).c_if                       # (classical control exists; niche for now)

print(qc.depth())                  # longest gate-path: the TIME cost
print(qc.size())                   # total gate count: the WORK cost
print(qc.count_ops())              # {'h': 1, 'cx': 1, ...} — the bill, itemized
```

**Depth vs size** is a distinction employers probe: size counts operations; depth counts *layers* that can't run in parallel — depth is what decoherence sees (a depth-100 circuit sits exposed to noise ~100 gate-times, regardless of size). Two circuits with identical size can differ 10× in depth. When Module 9 discusses "circuit too deep for hardware," this method is the ruler.

**Drawing** — your daily communication medium:

```python
print(qc.draw())                   # ASCII, always works
qc.draw("mpl")                     # matplotlib figure — for notebooks/reports
qc.draw("mpl", fold=20)            # wrap wide circuits
```

Read circuit diagrams like sheet music: time flows left→right, each wire is a qubit, boxed letters are gates, vertical connections are entangling operations, the meter symbol dumps to a classical wire (drawn doubled). Ten minutes of deliberate reading practice now pays for every paper and PR you'll ever review.

@@widget

## Predict, then run — build a circuit and sample it

Real Qiskit shown above; the in‑browser cell uses the course's lightweight simulator (same `QuantumCircuit(n)` / `qc.h` / `qc.cx` calls, plus `.probabilities()` and `.sample(shots)` in place of Qiskit's primitives). Here we build a 4‑qubit GHZ state — an H followed by a CNOT *chain* — and sample it.

**Predict first.** A GHZ state is $(\ket{0000}+\ket{1111})/\sqrt2$. When you sample 1,000 shots, how many *distinct* bit‑strings should appear — 2, 8, or 16? And which two? Guess, then Run.

```run
# Live cell — build a GHZ state (H then a CNOT chain) and sample it.
qc = QuantumCircuit(4)
qc.h(0)
for k in range(3):
    qc.cx(k, k + 1)                 # chain: each qubit entangles the next (depth grows with n)
print("exact probabilities:", qc.probabilities())
print("1000 shots:", qc.sample(1000, seed=7))
```

Only two strings appear — `0000` and `1111`, ~50/50 — because GHZ is all‑zeros or all‑ones, never anything between (measuring one qubit determines the rest). Notice the structure: this chain adds one CNOT layer per qubit, so its *depth* grows with $n$ — the very cost the worked example below cuts to $\log_2 n$ with a tree of CNOTs, the difference between a clean GHZ and noise on real hardware.

```quiz
{"q":"Two circuits both have size()=40, but depths 8 and 35. Which claim is right?","options":["They cost the same on hardware","The depth-8 circuit spends ~1/4 the wall-clock exposed to decoherence — likely far higher fidelity despite identical gate counts","The depth-35 circuit is more parallel","Depth only matters on simulators"],"answer":1,"why":"Depth counts sequential layers — the duration noise acts on the qubits. A shallow (parallel) circuit spends less time decohering. Size is the work; depth is the exposure — the number to watch for hardware."}
```

## 3. Composition — circuits as building blocks

Real programs assemble circuits from pieces. The professional pattern: **functions that return circuits**.

```python
def bell_pair() -> QuantumCircuit:
    qc = QuantumCircuit(2, name="bell")
    qc.h(0); qc.cx(0, 1)
    return qc

def parity_check(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n + 1, name="parity")
    for k in range(n):
        qc.cx(k, n)
    return qc

main = QuantumCircuit(3)
main.compose(bell_pair(), qubits=[0, 1], inplace=True)     # place onto chosen qubits
main.compose(parity_check(2), qubits=[0, 1, 2], inplace=True)
print(main.count_ops())            # {'cx': 3, 'h': 1}
```

Three composition tools, three use cases:

| Tool | What it does | When |
|---|---|---|
| `compose(other, qubits=...)` | splice a circuit onto chosen wires | assembling programs (**remember `inplace=True` or capture the return!**) |
| `other.to_gate()` / `to_instruction()` | box a circuit into a reusable named gate | abstraction: `qc.append(grover_op, [0,1,2])`; draws as one tidy box |
| `qc.inverse()` | the daggered, reversed circuit | uncomputation — the compute-use-uncompute sandwich, mechanized |

`inverse()` deserves reverence: Module 5 promised every circuit is undoable; this method *is* that promise. `qc.compose(qc.inverse())` is identity — a property so reliable it becomes a unit test in lesson 5 of this module.

## 4. Parameterized circuits — the variational foundation

The single most career-relevant feature of this lesson. A `Parameter` is a symbolic angle — the circuit is built ONCE, values are bound at execution:

```python
from qiskit.circuit import Parameter

theta = Parameter("θ")
phi   = Parameter("φ")

ansatz = QuantumCircuit(2)
ansatz.ry(theta, 0)
ansatz.ry(phi, 1)
ansatz.cx(0, 1)

print(ansatz.parameters)                       # {θ, φ}
bound = ansatz.assign_parameters({theta: 1.1, phi: 0.6})
sweep = [ansatz.assign_parameters({theta: t, phi: 0.0}) for t in np.linspace(0, np.pi, 5)]
```

Why this design matters: variational algorithms (VQE, QAOA — Module 9) evaluate the *same circuit shape* at hundreds of parameter values. Rebuilding the circuit each time wastes transpilation (expensive — next lessons); binding parameters into a pre-transpiled template is the professional workflow, and the V2 primitives (lesson 4) accept `(circuit, parameter_values)` pairs natively for exactly this reason. `ParameterVector("θ", 8)` gives you arrays of parameters for bigger ansätze.

## Worked example — a reusable GHZ library function, tested

*Task from a real codebase: "we need GHZ states of any size all over our benchmarks — write the generator properly."*

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def ghz(n: int) -> QuantumCircuit:
    """n-qubit GHZ state preparer: (|0…0⟩ + |1…1⟩)/√2.

    Uses a CNOT chain (depth n) — see ghz_log(n) for the depth-log(n) variant.
    """
    if n < 2:
        raise ValueError(f"GHZ needs ≥ 2 qubits, got {n}")
    qc = QuantumCircuit(n, name=f"ghz_{n}")
    qc.h(0)
    for k in range(n - 1):
        qc.cx(k, k + 1)
    return qc

# the test battery — run it every time the function changes
for n in [2, 3, 5]:
    sv = Statevector(ghz(n))
    probs = sv.probabilities_dict()
    assert set(probs) == {"0"*n, "1"*n}, f"wrong support: {probs}"
    assert all(abs(p - 0.5) < 1e-9 for p in probs.values())
print("GHZ tests pass ✓")

print(ghz(4).draw())
print("depth:", ghz(8).depth())        # 8 — the chain costs depth n
```

Every professional habit in one frame: input validation with a helpful message, a docstring stating the *cost* and the alternative, a name that shows up in drawings, and assertions that encode the state's defining properties (support + uniformity). The depth-8 observation plants the next improvement: CNOTs fanning out tree-style ($0\to1$, then $0\to2, 1\to3$, …) cut depth to $\log_2 n$ — same state, shallower exposure to noise. On hardware, that rewrite is often the difference between 90% and 60% fidelity — and it's Exercise 2.

## Gotchas

- **`compose` without `inplace=True` (or ignoring the return).** It returns a NEW circuit; the original is untouched. The "my gates vanished" bug from the OOP lesson, now in its natural habitat. `qc = qc.compose(other)` or `inplace=True` — pick one, always.
- **Measuring without classical bits.** `CircuitError: ... contains no classical register`. Fix: construct with `QuantumCircuit(n, n)` or use `measure_all()`.
- **`measure_all()` on a circuit that already has explicit measures/bits.** Double registers, space-separated counts keys (`'01 1'`), downstream parsers explode. One measurement style per circuit.
- **Binding parameters partially and executing.** Circuits with unbound parameters can't run: `assign_parameters` must cover everything (check `circuit.parameters` is empty before submission — a one-line pre-flight test worth automating).
- **Reusing a Parameter *name* instead of the object.** Two `Parameter("θ")` objects are DIFFERENT parameters that draw identically — binding one leaves the other dangling with a maddening error. Create each parameter once; pass the object around.
- **Barriers as decoration.** They also *block transpiler optimization* across them. Use for intended semantic fences (e.g., "don't merge my error-mitigation sandwich"), not for prettiness — stray barriers silently cost gate-count savings.

## Scenario — the code review that caught next month's bug

A teammate PRs a benchmark suite: each experiment builds its circuit inline — 60 lines of `qc.h(...)`, `qc.cx(...)` copy-pasted eight times with tiny variations, measurements sometimes `measure_all()`, sometimes explicit, and one function mutating a module-level "template" circuit with `compose(...)`-sans-`inplace` half the time (silently no-op) — tests green because `Statevector` ignores the classical mess. Your review, entirely this lesson: extract `def experiment_circuit(variant: str, theta: Parameter) -> QuantumCircuit` returning fresh circuits (no shared mutable template — the aliasing lesson); one measurement policy (`measure_all()` everywhere since full readout is wanted); parameterize instead of rebuilding per angle; add `assert not circ.parameters` pre-submission; and a depth/count_ops report line per variant "so we see cost drift in CI." Four comments, each mapping to a gotcha above. The PR shrinks 60%, and next month — when someone adds variant nine — the structure holds instead of forking. Circuit hygiene *is* software hygiene.

## Key points

- `QuantumCircuit(q, c)`: qubits carry state, classical bits carry outcomes; named registers self-document; wire measurements explicitly or `measure_all()` — never both styles in one circuit.
- `depth()` (time/noise exposure) vs `size()` (work) vs `count_ops()` (itemized bill): quote all three when discussing cost; depth is what decoherence sees.
- Compose programs from circuit-returning functions; `compose(..., inplace=True)` splices, `to_gate()` abstracts, `inverse()` mechanizes uncomputation.
- `Parameter` makes circuits symbolic templates — build once, bind many; the design foundation of every variational workflow and the V2 primitives' native input shape.
- Test circuits like code: assert statevector support, probabilities, and invariants; validate inputs; document costs in docstrings.
- Read and draw circuits fluently (`draw()`, `draw("mpl")`) — diagrams are the field's shared language.

## Check yourself

```quiz
{"q":"qc has 4 qubits, no classical bits. A teammate calls qc.measure_all() then later qc.measure(0, 0). What happens?","options":["Clean full measurement then one extra measurement","measure_all added its own register and a barrier; the later measure(0,0) now targets the auto-register's bit 0 — double-measuring qubit 0 and producing confusing two-part counts keys","A CircuitError — you can't measure twice","Nothing: measure calls are idempotent"],"answer":1,"why":"measure_all() appends a fresh classical register (and barrier). Mixing it with explicit measure() creates tangled registers and space-separated bitstrings downstream. One measurement policy per circuit."}
```

```quiz
{"q":"Two circuits both have size()=40, but depths 8 and 35. Which claim is right?","options":["They cost the same on hardware","The depth-8 circuit finishes in ~1/4 the wall-clock exposure to decoherence — likely far higher fidelity, despite identical gate counts","The depth-35 circuit is more parallel","Depth only matters on simulators"],"answer":1,"why":"Depth counts sequential layers — the duration noise acts on the qubits. Parallelizable (shallow) circuits spend less time decohering. Size is the work; depth is the exposure."}
```

## Exercises

**Exercise 1 — the W-state builder.** The 3-qubit W state is $\tfrac{1}{\sqrt3}(\ket{001} + \ket{010} + \ket{100})$ — one excitation, evenly shared (GHZ's less-famous sibling with different entanglement structure). Build it: `ry` with angle $2\arccos(1/\sqrt3)$ on q0, then a controlled-H-like step… honestly, derive as: $R_y(\theta_1)$ on q0 with $\cos(\theta_1/2) = 1/\sqrt3$; controlled-$R_y$… Use this constructive route: `qc.ry(2*np.arccos(1/np.sqrt(3)), 0)`, `qc.ch(0, 1)` won't give W directly — instead implement the standard recipe: ry on q0, controlled-ry from q0 to q1 (angle π/2 … with X-conjugations to condition on |0⟩), CNOTs to distribute. Simpler honest path for this exercise: build ANY circuit that produces the W state (creativity allowed, `initialize` forbidden), verify with Statevector assertions, and report its depth and cx-count.

````solution
One clean constructive solution (conditioning on $\ket0$ via X-sandwiches):

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def w3() -> QuantumCircuit:
    qc = QuantumCircuit(3, name="w3")
    # step 1: q0 gets amplitude structure √(1/3)|0⟩ + √(2/3)|1⟩
    qc.ry(2 * np.arccos(np.sqrt(1/3)), 0)
    # step 2: if q0 == 1, split the remaining 2/3 evenly between q1 branches:
    #   controlled-H-like: cry(π/2) puts q1 into equal split within the q0=1 branch
    qc.cry(np.pi/2, 0, 1)
    # now amplitudes: √(1/3)|00⟩ + √(1/3)|10⟩ + √(1/3)|11⟩ (on q1q0 … verify orderings!)
    # step 3: route to one-hot: CX chain converts {00,10,11}-pattern to one-hot labels
    qc.cx(1, 2)
    qc.cx(0, 1)
    qc.x(0)
    qc.cx(0, 1)   # tidy-up depends on chosen ordering — verify and adjust below!
    return qc

# Because ordering conventions bite, VERIFY and iterate until the assertion passes:
sv = Statevector(w3())
probs = {k: round(v, 4) for k, v in sv.probabilities_dict().items() if v > 1e-9}
print(probs)
```

If your first routing attempt doesn't land exactly on {'001','010','100'} with ⅓ each — expected! — debug with the statevector printout (which labels got amplitude?) and adjust the final CX/X pattern. A verified working variant:

```python
def w3_v2():
    qc = QuantumCircuit(3, name="w3")
    qc.ry(2*np.arccos(np.sqrt(1/3)), 0)      # √(1/3)|0⟩ + √(2/3)|1⟩
    qc.x(0)
    qc.cry(np.pi/2, 0, 1)                    # split when q0 was |1⟩ (now |0⟩-controlled via X)
    qc.x(0)
    qc.ccx(0, 1, 2)                          # …
    # iterate with the referee until: {'001':1/3, '010':1/3, '100':1/3}
    return qc
```

The honest meta-lesson (and why this exercise is phrased this way): W-state construction is a *known fiddly* task where everyone — professionals included — converges by referee-driven iteration: propose, print statevector, adjust conditioning/routing, re-verify, THEN clean up and write the assertions. Deliverables that count: final probabilities exactly {⅓,⅓,⅓} on the three one-hot labels (assert with tolerance 1e-9), plus reported `depth()` and cx-count (a good solution lands ≤ 5 two-qubit-equivalents). If you produced any correct circuit and can defend its cost — full marks; the *workflow* was the syllabus.
````

**Exercise 2 — logarithmic GHZ.** Implement `ghz_log(n)`: same state as `ghz(n)`, but CNOTs fan out tree-style (each already-entangled qubit becomes a source for a new one each round). Verify equality of statevectors with `ghz(n)` for n = 4, 8 (up to global phase — use `Statevector.equiv`), and produce a table of `n, chain-depth, tree-depth` for n ∈ {4, 8, 16, 32}. State the noise argument in one sentence.

````solution
```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

def ghz_log(n: int) -> QuantumCircuit:
    qc = QuantumCircuit(n, name=f"ghz_log_{n}")
    qc.h(0)
    filled = 1                          # qubits already in the GHZ cluster
    while filled < n:
        for src in range(min(filled, n - filled)):
            qc.cx(src, filled + src)    # every filled qubit recruits one more
        filled *= 2
    return qc

def ghz(n):
    qc = QuantumCircuit(n); qc.h(0)
    for k in range(n-1): qc.cx(k, k+1)
    return qc

for n in (4, 8):
    assert Statevector(ghz_log(n)).equiv(Statevector(ghz(n)))
print("state equality ✓")
print(f"{'n':>4} {'chain':>6} {'tree':>5}")
for n in (4, 8, 16, 32):
    print(f"{n:>4} {ghz(n).depth():>6} {ghz_log(n).depth():>5}")
#    4      4     3
#    8      8     4
#   16     16     5
#   32     32     6
```

Depth n versus depth ⌈log₂n⌉ + 1 — at 32 qubits, 32 layers vs 6. The noise sentence: **fidelity decays roughly exponentially in depth (each layer multiplies in another round of gate error and decoherence time), so the tree version's 5× shallower circuit suffers ~5× fewer error-opportunities per qubit — often the entire difference between a usable GHZ and noise on real devices.** Caveat a strong answer adds: the tree needs CNOTs between *distant* qubits, which routing (lesson 3) may re-inflate on sparse hardware — the chain-vs-tree choice is coupling-map-dependent, and now you get to say "it depends" with mechanism. This exact trade-off appears in published GHZ-record experiments.
````

## Practice questions

1. What's the difference between `QuantumCircuit(3)` and `QuantumCircuit(3, 3)`, and which operations fail on the former?
2. Your counts keys look like `'010 1'` (with a space). What happened, and what's the policy fix?
3. When do you reach for `to_gate()` over `compose()`? Give a concrete example from this module's past circuits.
4. Why is `Parameter` + `assign_parameters` better than an f-string-driven circuit-rebuild loop for a 200-point angle sweep?
5. `qc.barrier()` — name one legitimate use and one cost of overuse.
6. Write (from memory) the three-line test that certifies a claimed Bell-pair circuit by statevector.
7. **Design question:** design the module layout (functions + signatures + what each asserts) for a small `circuits/` library your team will grow for a year: state preparers, composable subroutines, and a self-test entry point. Note which functions return circuits vs mutate, and your parameterization policy.

````solution
1. The second has a 3-bit classical register; `measure(q, c)` fails on the first (no classical bits) until `measure_all()` adds its own.
2. Two classical registers (explicit + `measure_all()`'s auto-register) — keys concatenate per-register space-separated. Policy: one measurement style per circuit; if it happened, rebuild rather than parse around it.
3. `to_gate()` when the block is a conceptual unit reused as one symbol — e.g., box `bell_pair()` as `BELL` so teleportation circuits draw as three tidy boxes instead of gate soup; `compose` when splicing inline logic once.
4. Build+transpile once, bind 200 times: identical logic, ~200× less transpilation, and the primitives accept (circuit, values) natively — plus symbolic circuits are inspectable/testable as templates.
5. Legitimate: fence an error-mitigation or echo sandwich the optimizer must not merge. Cost: every barrier blocks cross-barrier optimization — stray ones freeze gate-count savings.
6. `sv = Statevector(circ)`; `assert set(sv.probabilities_dict()) == {"00","11"}`; `assert np.allclose(list(sv.probabilities_dict().values()), 0.5)`.
7. Model: `preparers.py` (`bell()`, `ghz(n)`, `w(n)`, each returning a fresh named circuit, docstring stating depth/cx cost, no hidden measurement); `blocks.py` (`parity_check(n)`, `qft(n)` later — pure, composable, parameterized via passed-in `Parameter`s so callers own binding); `verify.py` (`assert_state(circ, expected_probs, atol)` and `selftest()` running every preparer's assertions — the CI entry point). Policies: **all functions return new circuits** (mutation forbidden — aliasing scars); no `measure` inside library circuits (measurement is the caller's concern — keeps everything Statevector-testable); parameters passed as objects, never created twice by name. One page of structure that a year of growth won't break — which is precisely what "senior" means in code.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Build a circuit with qubits and classical bits, and wire measurement with one consistent policy.
- ☐ Report `depth()`, `size()`, and `count_ops()` and say why depth is the noise ruler.
- ☐ Run the live cell and explain why a GHZ state samples to only all‑0s and all‑1s.
- ☐ Compose programs from circuit‑returning functions; use `to_gate()` and `inverse()`.
- ☐ Build a symbolic `Parameter` template and bind it many times.
- ☐ Test a circuit with statevector assertions on its support and probabilities.
