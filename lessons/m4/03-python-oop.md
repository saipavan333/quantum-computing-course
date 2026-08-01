# Python III: classes & objects

Open any Qiskit program and the first real line is `qc = QuantumCircuit(2)` — you're *constructing an object*. Then `qc.h(0)`, `qc.measure_all()`, `qc.depth()` — you're *calling its methods*. Qiskit is object‑oriented through and through, and people who skip OOP read quantum code like tourists with a phrasebook. One lesson is enough to change that permanently.

## Start here — the intuition

You've used objects all along without noticing. A string carries data (`"hello"`) *and* behavior (`.upper()`); a list carries items and knows how to `.append()`. That bundling is the whole idea: an **object** = data (attributes) + operations on that data (methods), and a **class** is the blueprint objects are built from. `qc` will be an object of class `QuantumCircuit`.

Two things unlock reading any quantum code. First, `self` is not magic: it's just **the object itself**, handed to every method automatically — `run.prob("11")` is secretly `RunResult.prob(run, "11")`. That's the entire mystery. Second, and the real goal: you rarely need to *write* big classes, but you must **read** a library's objects fluently — `type(obj)`, `dir(obj)`, `help(obj)`, then learn the constructor and the three‑to‑five methods your task needs. Nobody learns all 100 methods; professionals learn entry points.

## Writing a class

`__init__` is the **constructor** (run automatically by `ClassName(...)`); it stores arguments as attributes with `self.name = ...`. Methods take `self` first. `@property` makes a *computed* attribute (read with no parentheses) so derived values can't drift from their source. `__repr__` controls how the object prints. Inheritance reads as "is‑a" (`HGate` is‑an `Instruction`), and `super().__init__(...)` chains to the parent's constructor — but prefer plain functions when in doubt; reading class trees matters more than writing them.

@@diagram:class-object|One class, many objects: the blueprint defines attributes and methods; each constructed object carries its own data. Methods receive the object itself as `self`.

## Predict, then run — the qubit math, wearing a class

The live cell wraps everything from Modules 1–2 (θ/φ parametrization, $e^{i\varphi}$ phases, conjugated inner products, $|z|^2$) into one `QubitState` object.

**Predict first.** `plus` is $\ket+$ and `plus_i` is $\ket{+i}$. What are $\ket+$'s measurement probabilities, and what should $|\braket{+}{+i}|^2$ be? Guess, then Run.

```run
# Live cell — wrap the qubit math in a CLASS: data (theta, phi) + behavior (probs, overlap).
import math, cmath

class QubitState:
    """A pure qubit cos(theta/2)|0> + e^{i phi} sin(theta/2)|1>."""
    def __init__(self, theta=0.0, phi=0.0):
        self.theta = theta; self.phi = phi
    @property
    def alpha(self): return math.cos(self.theta / 2)          # computed attribute
    @property
    def beta(self):  return cmath.exp(1j * self.phi) * math.sin(self.theta / 2)
    def probs(self): return {"0": round(abs(self.alpha)**2, 3), "1": round(abs(self.beta)**2, 3)}
    def overlap(self, other):                                  # <self|other>, conjugating self
        return self.alpha.conjugate()*other.alpha + self.beta.conjugate()*other.beta
    def __repr__(self): return f"QubitState(theta={self.theta:.2f}, phi={self.phi:.2f})"

plus   = QubitState(theta=math.pi/2, phi=0.0)                  # |+>
plus_i = QubitState(theta=math.pi/2, phi=math.pi/2)           # |+i>
print(plus, "->", plus.probs())
print("|<+|+i>|^2 =", round(abs(plus.overlap(plus_i))**2, 3))
```

Everything here is prior knowledge wearing a class: half‑angle parametrization (trig), $e^{i\varphi}$ (Euler), conjugated inner products (Dirac), $|z|^2$ (complex). The one new ingredient — `@property` — keeps θ, φ as the single source of truth so `alpha` and `beta` can never fall out of sync. "Derive, don't duplicate" is what interviews call *maintaining invariants*. And $|\braket{+}{+i}|^2 = 0.5$ is the Y‑basis blindness result from Module 2, now computed by an object.

```quiz
{"q":"Inside class Foo:  def bar(self, x): return self.k * x  — what is self?","options":["A Python keyword meaning 'private'","The object the method was called on: f.bar(3) passes f as self automatically","The class Foo itself","A required global variable"],"answer":1,"why":"f.bar(3) is sugar for Foo.bar(f, 3). self is just the first parameter receiving the object — convention, not keyword (though never rename it)."}
```

## Reading a library class like a professional

The skill this lesson exists for. Given any unfamiliar object: `type(obj)` → its class (the docs page to open); `help(obj)` → docstring and constructor; `dir(obj)` → method inventory (ignore dunders first pass); then read the constructor's parameters and the few methods your task needs. Run it on Qiskit: `qc = QuantumCircuit(2)` constructs, `qc.h(0)`/`qc.cx(0,1)` add gates *in place*, `qc.num_qubits`/`qc.depth()` query, `qc.draw()` renders. You just did real quantum programming — `QuantumCircuit` is now "an object with a constructor and gate‑adding methods," not an incantation.

## Level up — gotchas the pros watch for

- **Forgetting `self` in the signature.** `def prob(bits):` → `TypeError: takes 1 positional argument but 2 were given` — decode it once as "add `self`."
- **Forgetting `self.` when storing.** `counts = counts` binds a local that evaporates; later methods crash with `AttributeError`.
- **Calling methods without `()`.** `run.top` is the method object; `run.top()` calls it.
- **Mutating shared objects.** Passing the same dict into two objects aliases it; defensive constructors copy (`self.counts = dict(counts)`).
- **In‑place vs returning.** `list.sort()` mutates and returns `None`; `sorted()` returns new. Qiskit mixes both (`qc.h(0)` mutates; `qc.compose(other)` returns new) — check the docs' "Returns:".
- **Class‑level mutable attributes.** A `log = []` in the class body is shared across all instances; instance data belongs in `__init__`.

## Level up — the code review that reads like X-ray vision

You review a `CalibrationTracker` PR: (1) `__init__(self, history=[])` — the mutable‑default trap, every instance shares one list (fix: `None` sentinel); (2) `latest()` returns `self.history.sort()[-1]` — but `.sort()` returns `None`, so it crashes (fix: `sorted(...)[-1]`); (3) it stores both `error_rate` and `fidelity = 1 - error_rate` — duplicated state that will drift (fix: a `@property`). "How did you spot all that without running it?" These aren't cleverness — the same five object bugs cycle through every codebase, and now through your checklist.

## Key points

- Object = attributes + methods; class = blueprint; `SomeClass(...)` runs `__init__`, and `self` is just the object being operated on.
- Store constructor inputs with `self.name = ...`; attributes persist, locals don't; `__repr__` controls printing.
- Objects are references: assignment aliases; copy deliberately; know whether each method mutates or returns new.
- Inheritance reads "is‑a"; `super().__init__()` chains constructors; prefer plain functions when unsure.
- `@property` computes attributes on demand — single source of truth, no drift.
- Interrogate any object: `type()`, `help()`, `dir()`, then the constructor + the few methods you need.

## Check yourself

```quiz
{"q":"qc2 = qc.compose(other) leaves qc unchanged, but qc.h(0) modifies qc. What's the lesson?","options":["Qiskit is inconsistent and buggy","Some methods return a new object, others mutate in place — check each method's docs ('Returns:') instead of assuming","compose only works with inplace=True","h(0) also returns a new circuit"],"answer":1,"why":"Both styles are legitimate API design; libraries mix them. Verifying mutate-vs-return per method prevents the classic 'my gates disappeared' bug."}
```

## Exercises

**Exercise 1 — build `ShotBudget`.** In the live cell, write a class tracking a QPU allowance: `__init__(self, total_seconds=600)`; `charge(self, shots, sec_per_shot=0.002)` that deducts and raises `ValueError` if insufficient; a `@property remaining_minutes`; and a useful `__repr__`. Charge two jobs, print, then trigger and catch the over‑budget error.

````solution
```python
class ShotBudget:
    def __init__(self, total_seconds=600): self.total = total_seconds; self.used = 0.0
    def charge(self, shots, sec_per_shot=0.002):
        cost = shots * sec_per_shot
        if self.used + cost > self.total:
            raise ValueError(f"need {cost:.1f}s, have {self.total-self.used:.1f}s")
        self.used += cost; return cost
    @property
    def remaining_minutes(self): return (self.total - self.used) / 60
    def __repr__(self): return f"ShotBudget({self.remaining_minutes:.1f} min left)"
b = ShotBudget(); b.charge(50_000); b.charge(100_000); print(b)
try: b.charge(200_000)
except ValueError as e: print("blocked:", e)
```
Raising a *specific* exception with a message (not a print) lets the caller decide how to react — the API‑design decision interviewers probe with "what should this do on invalid input?"
````

**Exercise 2 — object autopsy.** Interrogate a Qiskit circuit with only built‑in tools: after `qc = QuantumCircuit(3); qc.h(0); qc.cx(0,1); qc.cx(1,2)`, find three attributes, three query methods, whether `qc.copy()` mutates or returns, and the class lineage `type(qc).__mro__`.

````solution
```python
from qiskit import QuantumCircuit
qc = QuantumCircuit(3); qc.h(0); qc.cx(0,1); qc.cx(1,2)
print(qc.num_qubits, len(qc.data))     # 3, 3 (the instruction list)
print(qc.depth(), qc.count_ops())      # 3, {'h':1,'cx':2}
qc2 = qc.copy(); qc2.h(2); print(qc.size(), qc2.size())   # 3 4 -> copy RETURNS new
```
A `QuantumCircuit` is an object holding an ordered list of instructions over qubit/clbit registers, with mutating gate‑methods and non‑mutating queries. You reverse‑engineered a major library's core with four built‑in tools — a skill that transfers to every library.
````

## Practice questions

1. Step by step, what happens when Python runs `r = RunResult(counts, "ibm_torino")`?
2. Why does `print(run.prob)` show `<bound method ...>`?
3. A constructor sets `self.data = data` from a caller's dict — the risk and the fix?
4. When choose a plain function over a class? The smell of over‑OOP?
5. What does `@property` buy over storing `fidelity` alongside `error_rate`?
6. Decode `class EstimatorV2(BasePrimitiveV2):` without docs.
7. **Design question:** design a `Sweep` class that runs one parametrized experiment over a list of angles, stores per‑angle counts, and finds `best_angle(metric)` where `metric` is caller‑supplied. Which parts mutate vs return?

````solution
1. Python makes a blank object → calls `__init__(new_obj, counts, "ibm_torino")` → the method stores attributes via `self.` → binds it to `r`.
2. Missing `()`: `run.prob` is the method object; `run.prob("00")` calls it.
3. Aliasing — later edits leak both ways; fix: `self.data = dict(data)`.
4. Stateless input→output transforms are functions; a class earns its keep only when data and behavior must persist together. Smell: one‑method, no‑state classes.
5. Derivation‑on‑read from one source of truth: `fidelity` can never go stale.
6. `EstimatorV2` is‑a `BasePrimitiveV2` — it inherits that interface, so anything accepting the parent accepts it; V2 hints at a versioned API family.
7. `__init__(self, angles, runner)` (defensive‑copy angles; `runner`: angle→counts); `run()` MUTATES (fills `self.results`, resumable); `probs(angle)` returns new; `best_angle(metric)` returns a value (no mutation). The runner and metric are *injected* callables (lambdas), so the class knows nothing about Qiskit and is trivially testable — nearly the shape of Module 9's VQE sweeps.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Explain object vs class, and what `self` is.
- ☐ Write a class with `__init__`, a method, a `@property`, and `__repr__`.
- ☐ Run the live cell and explain why `alpha`/`beta` are properties, not stored.
- ☐ Distinguish methods that mutate in place from those that return new objects.
- ☐ Interrogate an unknown object with `type()`, `dir()`, `help()`.
- ☐ Spot the mutable‑default and stored‑duplicate‑state bugs.
