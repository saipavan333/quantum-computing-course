# Python III: classes & objects

Open any Qiskit program and the first real line is `qc = QuantumCircuit(2)` — you're *constructing an object*. Then `qc.h(0)`, `qc.measure_all()`, `qc.depth()` — you're *calling its methods*. Qiskit is object-oriented through and through, and people who skip OOP read quantum code like tourists with a phrasebook. One lesson is enough to change that permanently: you'll build classes, understand `self`, and — the real goal — *read any library's objects fluently*.

## 1. Objects: data + behavior, traveling together

You've used objects all along. A string carries data (`"hello"`) *and* behavior (`.upper()`, `.split()`); a list carries items and knows how to `.append()`. That bundling is the whole idea:

> An **object** = state (attributes) + operations on that state (methods).
> A **class** = the blueprint objects are built from.

`"abc"` is an object of class `str`; `[1,2]` of class `list`; and `qc` will be an object of class `QuantumCircuit`. `type(x)` names the class; `dir(x)` lists everything the object can do (try `dir("abc")` — scroll the treasure).

## 2. Writing a class — anatomy with a purpose

We'll build something genuinely useful: an experiment logbook entry. Read every line's comment:

```python
class RunResult:
    """One quantum-experiment run: counts plus metadata."""      # class docstring

    def __init__(self, counts, backend, shots=None):             # constructor
        self.counts = counts                                     # attributes: data
        self.backend = backend                                   #   stored ON the object
        self.shots = shots if shots is not None else sum(counts.values())

    def prob(self, bits):                                        # a method
        """Probability of one outcome (zero-safe)."""
        return self.counts.get(bits, 0) / self.shots

    def top(self, k=3):
        """The k most frequent outcomes."""
        ranked = sorted(self.counts.items(), key=lambda kv: kv[1], reverse=True)
        return ranked[:k]

    def __repr__(self):                                          # how it prints
        return f"RunResult({self.backend}, {self.shots} shots, {len(self.counts)} outcomes)"
```

Using it:

```python
run = RunResult({"00": 2011, "01": 396, "10": 402, "11": 1191}, "ibm_kingston")
print(run)                 # RunResult(ibm_kingston, 4000 shots, 4 outcomes)
print(run.prob("11"))      # 0.29775
print(run.top(2))          # [('00', 2011), ('11', 1191)]
print(run.backend)         # ibm_kingston — attributes read with a dot
```

@@diagram:class-object|One class, many objects: the blueprint defines attributes and methods; each constructed object carries its own data. Methods receive the object itself as `self`.

The pieces, named precisely:

- `__init__` — the **constructor**, run automatically by `RunResult(...)`. Its job: receive arguments, store them as attributes.
- `self` — **the object itself**, always the first parameter of every method. `run.prob("11")` is secretly `RunResult.prob(run, "11")`: Python passes the object in as `self`. That's the entire mystery of `self`; there is no more.
- Attributes (`self.counts`) vs local variables (`ranked`): attributes persist on the object; locals evaporate when the method returns.
- `__repr__` — a **dunder** ("double-underscore") method customizing built-in behavior; this one controls printing. Others exist (`__len__`, `__eq__`, `__add__` — how `+` works on your types); recognize the pattern, learn them on demand.

## 3. Objects are references — the aliasing rule, again

Last lesson's list-aliasing rule applies to all objects: `run2 = run` creates a second label on the *same* object — `run2.shots = 0` changes what `run.shots` shows. Methods that modify the object ("in place", returning `None`) versus methods that return a *new* object is a distinction every library documents, Qiskit included: `qc.compose(other)` **returns a new circuit** unless you pass `inplace=True` — forgetting this produces the classic "my gates disappeared" bug you'll now never file.

## 4. Inheritance — read it, don't rush to write it

A class can extend another: `class NoisyRunResult(RunResult):` inherits everything and adds/overrides what it needs. One honest professional note: beginners over-write inheritance and under-write plain functions. What you *must* have is reading fluency, because libraries are inheritance forests — in Qiskit, `HGate` and `CXGate` are subclasses of `Gate`, itself an `Instruction`; docs will say "accepts any `Instruction`" and you'll know `HGate` qualifies. That "is-a" reading skill is 90% of what inheritance demands of you.

```python
class NoisyRunResult(RunResult):
    """RunResult that knows its readout-error rate."""
    def __init__(self, counts, backend, readout_err, shots=None):
        super().__init__(counts, backend, shots)     # run the parent's constructor
        self.readout_err = readout_err

    def prob_corrected(self, bits):
        """Crude first-order readout correction (illustrative)."""
        raw = self.prob(bits)                        # inherited method, just works
        n = len(bits)
        return min(1.0, raw / (1 - self.readout_err) ** n)
```

`super().__init__(...)` = "do the parent's setup first." That single idiom covers most inheritance you'll ever write.

## 5. Reading a library class like a professional

The skill this lesson actually exists for. Given any unfamiliar object `obj`:

1. `type(obj)` → its class; the docs page to open.
2. `obj?` in Jupyter (or `help(obj)`) → docstring, constructor signature.
3. `dir(obj)` → method inventory; ignore dunders on the first pass.
4. In docs, read the constructor's parameters first, then the 3–5 methods your task needs. Nobody learns all 100 methods; professionals learn *entry points*.

Dry-run it on Qiskit (installed since Module 0 — go ahead):

```python
from qiskit import QuantumCircuit
qc = QuantumCircuit(2)        # construct: 2 qubits
qc.h(0)                       # methods add gates...
qc.cx(0, 1)                   # ...modifying qc IN PLACE (note: returns the instruction)
print(type(qc))               # <class 'qiskit.circuit.quantumcircuit.QuantumCircuit'>
print(qc.num_qubits, qc.depth())   # 2 2  — attributes & query methods
print(qc.draw())              # ASCII circuit art — an object rendering itself
```

You just did real quantum programming — three lessons of Python turned `QuantumCircuit` from incantation into "an object with a constructor and gate-adding methods." Module 7 will feel like meeting a colleague, not a wall.

## Worked example — a Bloch-state class that earns its keep

Wrap Module 1–2 math into an object (this class reappears as a testing fixture in Module 7):

```python
import math, cmath

class QubitState:
    """A pure qubit state cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩."""

    def __init__(self, theta=0.0, phi=0.0):
        self.theta = theta
        self.phi = phi

    @property                       # computed attribute: no () needed to read
    def alpha(self):
        return math.cos(self.theta / 2)

    @property
    def beta(self):
        return cmath.exp(1j * self.phi) * math.sin(self.theta / 2)

    def probs(self):
        return {"0": abs(self.alpha)**2, "1": abs(self.beta)**2}

    def overlap(self, other):
        """⟨self|other⟩ — Module 2's inner product, conjugating self."""
        return (self.alpha.conjugate() * other.alpha +
                self.beta.conjugate() * other.beta)

    def __repr__(self):
        return f"QubitState(θ={self.theta:.3f}, φ={self.phi:.3f})"

plus  = QubitState(theta=math.pi/2, phi=0.0)          # |+⟩
plus_i = QubitState(theta=math.pi/2, phi=math.pi/2)   # |+i⟩
print(plus.probs())                        # {'0': 0.5000000000000001, '1': 0.4999999999999999}
print(abs(plus.overlap(plus_i))**2)        # 0.5000... — the Y-basis blindness result!
```

Everything meaningful here is *prior knowledge wearing a class*: half-angle parametrization (trig), $e^{i\varphi}$ phases (Euler), conjugated inner products (Dirac), probability as $|z|^2$ (complex). The new ingredient — `@property` — makes `alpha` a computed attribute (read as `plus.alpha`, no parentheses), keeping θ, φ as the single source of truth so amplitudes can never fall out of sync. That "derive, don't duplicate" design instinct is what code interviews call *maintaining invariants*.

## Gotchas

- **Forgetting `self` in the parameter list.** `def prob(bits):` inside a class → `TypeError: prob() takes 1 positional argument but 2 were given` (Python passed the object; your signature had no seat for it). This error message means "add `self`" — decode it once, save an hour forever.
- **Forgetting `self.` when storing.** `counts = counts` in `__init__` binds a local that evaporates; the object ends up hollow and later methods crash with `AttributeError`. Constructor rule: inputs you'll need later get `self.`.
- **Calling methods without parentheses.** `run.top` is the method object (prints as `<bound method...>`); `run.top()` calls it. If output looks like `<bound method RunResult.top of ...>`, you forgot `()`.
- **Mutating shared objects.** Passing the same counts dict into two `RunResult`s means edits through one show in the other (aliasing). Defensive constructors copy: `self.counts = dict(counts)`.
- **Confusing in-place vs returning methods.** `list.sort()` mutates and returns `None`; `sorted(list)` returns new. Qiskit mirrors both styles (`qc.h(0)` mutates; `qc.compose(other)` returns new). Check the docs' "Returns:" line before assuming.
- **Class-level mutable attributes.** Defining `log = []` at class body level (outside `__init__`) shares one list across ALL instances — cousin of the default-argument trap. Instance data belongs in `__init__`.

## Scenario — the code review that reads like X-ray vision

You review a teammate's PR: a `CalibrationTracker` class. Three findings, each straight from this lesson: (1) `__init__` takes `history=[]` — the mutable-default trap; every tracker instance will share one history list, corrupting per-device logs (fix: `None` sentinel). (2) `def latest(self)` returns `self.history.sort()[-1]` — but `.sort()` returns `None`; crash on first call (fix: `sorted(self.history)[-1]`, no mutation). (3) The class stores both `error_rate` and `fidelity = 1 - error_rate` as attributes set in the constructor — duplicated state that will drift; you suggest a `@property` for fidelity. The teammate's reply: "how did you spot all that without running it?" Answer: these aren't cleverness, they're *pattern recognition* — the same five object bugs cycle through every codebase, and now through your checklist.

## Key points

- Object = attributes + methods; class = blueprint; `SomeClass(...)` runs `__init__`, and `self` is simply the object being operated on.
- Store constructor inputs with `self.name = ...`; attributes persist, locals don't; `__repr__` controls printing (write one — future-you debugging says thanks).
- Objects are references: assignment aliases; copy deliberately; know whether each method mutates in place or returns new (Qiskit uses both styles).
- Inheritance reads as "is-a" (`HGate` is-an `Instruction`); `super().__init__()` chains constructors; prefer plain functions when in doubt, but read class trees fluently.
- `@property` computes attributes on demand — single source of truth, no drifting duplicates.
- Interrogate any object: `type()`, `?`/`help()`, `dir()`, then docs' constructor + the few methods your task needs. This is how professionals learn libraries.

## Check yourself

```quiz
{"q":"Inside class Foo:  def bar(self, x): return self.k * x  — what is self?","options":["A Python keyword meaning 'private'","The object the method was called on: f.bar(3) passes f as self automatically","The class Foo itself","A required global variable"],"answer":1,"why":"f.bar(3) is sugar for Foo.bar(f, 3). self is just the first parameter receiving the object — convention, not keyword (though never rename it)."}
```

```quiz
{"q":"qc2 = qc.compose(other) leaves qc unchanged, but qc.h(0) modifies qc. What's the lesson?","options":["Qiskit is inconsistent and buggy","Some methods return a new object, others mutate in place — check each method's docs ('Returns:') instead of assuming","compose only works with inplace=True","h(0) also returns a new circuit"],"answer":1,"why":"Both styles are legitimate API design; libraries mix them. The professional habit is verifying mutate-vs-return per method — the 'my gates disappeared' bug is exactly this assumption failing."}
```

## Exercises

**Exercise 1 — build `ShotBudget`.** A class tracking your monthly QPU allowance: constructor takes `total_seconds` (default 600 — the free plan) ; method `charge(shots, sec_per_shot=0.002)` deducts and raises `ValueError` if insufficient; property `remaining_minutes`; a `__repr__` worth reading. Demo: charge two jobs, print state, then trigger (and catch) the over-budget error.

````solution
```python
class ShotBudget:
    """Track a monthly QPU time allowance."""

    def __init__(self, total_seconds=600):
        self.total = total_seconds
        self.used = 0.0

    def charge(self, shots, sec_per_shot=0.002):
        cost = shots * sec_per_shot
        if self.used + cost > self.total:
            raise ValueError(f"insufficient budget: need {cost:.1f}s, "
                             f"have {self.total - self.used:.1f}s")
        self.used += cost
        return cost

    @property
    def remaining_minutes(self):
        return (self.total - self.used) / 60

    def __repr__(self):
        pct = 100 * self.used / self.total
        return f"ShotBudget({self.remaining_minutes:.1f} min left, {pct:.0f}% used)"

budget = ShotBudget()
budget.charge(50_000)                      # 100 s
budget.charge(100_000)                     # 200 s
print(budget)                              # ShotBudget(5.0 min left, 50% used)
try:
    budget.charge(200_000)                 # would need 400 s > 300 s left
except ValueError as e:
    print("blocked:", e)
```

Grading yourself: attributes initialized in `__init__` ✓; the guard raises a *specific* exception with an informative message (not a print — callers decide how to react) ✓; `@property` derives rather than stores ✓; `__repr__` answers "what would I want to see while debugging" ✓. Raising-instead-of-printing is the API-design decision interviewers probe with "what should this do on invalid input?"
````

**Exercise 2 — object autopsy on Qiskit.** In a notebook: construct `qc = QuantumCircuit(3)`, add `qc.h(0)`, `qc.cx(0, 1)`, `qc.cx(1, 2)`. Using only interrogation tools (no docs): find (a) three data attributes and their values; (b) three query methods and their outputs; (c) whether `qc.copy()` mutates or returns; (d) the class's inheritance chain (`type(qc).__mro__`). Write one sentence on what the object "is."

````solution
```python
from qiskit import QuantumCircuit
qc = QuantumCircuit(3)
qc.h(0); qc.cx(0, 1); qc.cx(1, 2)

# (a) attributes
print(qc.num_qubits, qc.num_clbits)     # 3 0
print(len(qc.data))                     # 3  — the instruction list itself!

# (b) query methods
print(qc.depth())                       # 3
print(qc.count_ops())                   # OrderedDict([('h', 1), ('cx', 2)])
print(qc.size())                        # 3

# (c) copy semantics
qc2 = qc.copy()
qc2.h(2)
print(qc.size(), qc2.size())            # 3 4 → copy() RETURNS a new circuit ✓

# (d) lineage
print([c.__name__ for c in type(qc).__mro__])
# ['QuantumCircuit', 'object']  (plus possibly mixins by version)
```

Sentence: *a `QuantumCircuit` is an object holding an ordered list of instructions (`.data`) over registers of qubits/clbits, exposing mutating gate-methods and non-mutating queries.* Everything Module 7 does — composing, transpiling, drawing — is operations on that instruction list. You reverse-engineered the heart of a major library with four built-in tools; that skill transfers to every library you'll ever meet.
````

## Practice questions

1. What exactly happens, step by step, when Python executes `r = RunResult(counts, "ibm_torino")`?
2. Why does `print(run.prob)` show `<bound method ...>` instead of a number?
3. A constructor sets `self.data = data` where `data` is a caller's dict. Name the risk and the one-word-ish fix.
4. When would you choose a plain function over a method/class? Give the design smell of over-OOP.
5. What does `@property` buy over storing `fidelity` as a normal attribute alongside `error_rate`?
6. Decode: `class EstimatorV2(BasePrimitiveV2):` — what can you infer without reading any docs?
7. **Design question:** design (attributes, methods, properties — signatures + one-line docstrings) a `Sweep` class that manages running the same experiment over a list of angle values, storing per-angle counts, and producing a `best_angle()` by a metric function the *caller* supplies. Note which parts mutate and which return new data.

````solution
1. Python creates a blank `RunResult` object → calls `RunResult.__init__(new_obj, counts, "ibm_torino")` → the method stores attributes onto `new_obj` via `self.` → the object is bound to the name `r`.
2. Missing parentheses: `run.prob` is the method object; `run.prob("00")` calls it.
3. Aliasing: caller's later edits mutate the object's data (and vice versa). Fix: defensive copy — `self.data = dict(data)`.
4. Stateless transformations of inputs (counts→probs) are functions; a class earns its existence only when data and behavior must *persist together across calls*. Smell: classes with one method and no state ("a function in a costume").
5. Derivation-on-read from one source of truth: `error_rate` updates can never leave a stale `fidelity`; no synchronization bug class exists.
6. EstimatorV2 *is-a* BasePrimitiveV2: it inherits that interface, so anywhere accepting a `BasePrimitiveV2` accepts an `EstimatorV2`; shared behavior lives in the parent; V2 naming hints at a versioned API family.
7. Model design:
```python
class Sweep:
    """Run one parametrized experiment across many angle values."""
    def __init__(self, angles, runner):        # runner: angle -> counts (caller-supplied)
        self.angles = list(angles)             # defensive copy
        self.results = {}                      # angle -> counts, filled by run()
    def run(self):                             # MUTATES: fills self.results
        """Execute runner for every angle not yet run (resumable)."""
    def probs(self, angle):                    # returns new dict
        """Normalized probabilities for one angle."""
    def best_angle(self, metric):              # returns value, no mutation
        """argmax over angles of metric(probs) — metric supplied by caller."""
    def __repr__(self): ...
```
Key design wins to self-check: the experiment executor and the ranking metric are *injected* (caller-supplied callables — lambdas!), so the class knows nothing about Qiskit or the objective and is trivially testable with fakes; `run()` is the lone mutator and is resumable; queries return fresh data. This is dependency injection — and nearly the literal shape of the parameter sweeps you'll run in Module 9's VQE.
````
