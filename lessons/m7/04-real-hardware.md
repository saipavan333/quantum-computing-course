# Running on real hardware: primitives & Runtime

Today your code leaves the simulator and executes on a physical quantum processor — 156 superconducting qubits at 15 millikelvin, controlled by microwave pulses, queued behind researchers worldwide. The interface is **Qiskit Runtime's V2 primitives**: `SamplerV2` (get bit-string samples) and `EstimatorV2` (get expectation values). Master their input format (PUBs), the execution modes, and the budget discipline of the free Open Plan, and you have the exact workflow used on paid enterprise plans — just with more zeros on the invoice.

## 1. The service, the backends, the budget

```python
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()                     # reads your saved account (M0 setup)
backend = service.least_busy(operational=True, simulator=False)
print(backend.name, backend.num_qubits)              # e.g. ibm_kingston 156

# due diligence — TODAY's calibration:
props = backend.properties()
print(backend.status().pending_jobs)                 # queue length
```

**The Open Plan contract** (2026): free, **10 minutes of QPU time per 28 days**, access to 100+ qubit Heron-class devices (e.g. `ibm_kingston`: 156 qubits, median 2q error ~2×10⁻³), jobs run in `mode="job"` or batch (sessions are reserved for paid plans). Ten minutes sounds tiny; it's not: QPU time is *execution* time — a 4,000-shot job of a modest circuit costs ~3–10 QPU-seconds. Your budget is roughly 60–150 experiments/month **if** you follow the discipline: simulate → rehearse on fake backend → run once on hardware. (Heavy users: after 20 minutes of lifetime usage you can opt into a 180-min/12-month promo — IBM likes persistent learners.)

## 2. PUBs — the V2 input format

Primitives take **PUBs** (Primitive Unified Blocs) — tuples bundling a circuit with everything it needs:

**Sampler PUB**: `(circuit,)` or `(circuit, parameter_values)` or `(circuit, parameter_values, shots)`
**Estimator PUB**: `(circuit, observables)` or `(circuit, observables, parameter_values, precision)`

@@diagram:primitives-pub|One PUB = one circuit + its parameter values (+ shots/observables). A job takes a LIST of PUBs; parameter arrays broadcast — one transpiled circuit, many bindings, one queue wait.

The design reason you already know: parameterized circuits (lesson 1) bind values at execution — a *single* transpiled circuit template with an *array* of parameter sets rides one job through the queue. Broadcasting rules mirror NumPy's: pass a (50, 2) array of parameter values with one 2-parameter circuit, get 50 results. This is how sweeps and variational loops stay queue-efficient.

## 3. SamplerV2 — bit-strings from the real world

The full professional sequence — every line load-bearing:

```python
from qiskit import QuantumCircuit
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler

# 1. logical circuit (with measurements!)
bell = QuantumCircuit(2)
bell.h(0); bell.cx(0, 1)
bell.measure_all()

# 2. transpile to ISA for THIS backend (mandatory)
service = QiskitRuntimeService()
backend = service.least_busy(operational=True, simulator=False)
pm = generate_preset_pass_manager(optimization_level=3, backend=backend, seed_transpiler=7)
isa_bell = pm.run(bell)

# 3. submit
sampler = Sampler(mode=backend)
job = sampler.run([(isa_bell,)], shots=4096)         # a LIST of PUBs
print(job.job_id(), job.status())

# 4. results (blocks until done — queue time happens here)
result = job.result()
counts = result[0].data.meas.get_counts()            # [0] = first PUB; .meas = measure_all's register
print(counts)      # {'00': 1949, '11': 1907, '01': 121, '10': 119}  ← real hardware speaking
```

Anatomy of the result path — `result[0].data.meas.get_counts()` — because everyone stumbles here once: `result[k]` is the k-th PUB's result; `.data` holds per-classical-register fields; **`.meas`** is the register name `measure_all()` creates (explicit registers appear under their own names — `result[0].data.result` for a register named "result"); `.get_counts()` aggregates shots into the familiar dict. There is also `.get_bitstrings()` — the raw per-shot list, gold for correlation analysis.

And look at those counts: ~5.8% of shots landed on outcomes the Bell state forbids. That's not failure — that's *physics you can now measure*: readout error (~1%/qubit) + gate errors + decoherence, previewing Module 9. Report it as you were trained: $p(\text{valid}) = 0.941 \pm 0.007$.

## 4. EstimatorV2 — expectation values as a service

Half of quantum applications (all of Module 9) want $\langle\psi|O|\psi\rangle$, not histograms. Estimator does the basis-changes, sampling, and averaging for you:

```python
from qiskit.quantum_info import SparsePauliOp
from qiskit_ibm_runtime import EstimatorV2 as Estimator

obs = SparsePauliOp(["ZZ", "XX"], coeffs=[1.0, 1.0])    # measure ⟨ZZ⟩ + ⟨XX⟩

bell_nomeas = QuantumCircuit(2)
bell_nomeas.h(0); bell_nomeas.cx(0, 1)                  # NO measure_all for Estimator!
isa = pm.run(bell_nomeas)
obs_isa = obs.apply_layout(isa.layout)                  # observables must follow the layout!

estimator = Estimator(mode=backend)
job = estimator.run([(isa, obs_isa)], precision=0.02)   # target ±0.02 — it picks shots
ev = job.result()[0].data.evs
print(ev)          # ~1.92 (ideal: ⟨ZZ⟩+⟨XX⟩ = 2 for Φ+ — the dual-basis correlation!)
```

Two V2-specific rules that bite everyone: **Estimator circuits carry no measurements** (it appends its own basis rotations), and **observables must be layout-mapped** (`apply_layout`) — your `ZZ` refers to logical qubits 0,1, but post-transpile those live on physical qubits 56,57; forgetting this measures the wrong wires and returns noise-flavored garbage with no error message. The `precision` argument is Module 3 as an API: you specify the standard error you want; it computes the shots.

## 5. Execution modes & queue craft

| Mode | What | When | Open Plan |
|---|---|---|---|
| `mode=backend` (job) | one independent job | single experiments | ✓ |
| `Batch` | jobs submitted together, scheduled as a block | many independent circuits (sweeps, tomography) | ✓ |
| `Session` | exclusive device window across iterative jobs | variational loops (VQE) needing low latency | paid plans |

```python
from qiskit_ibm_runtime import Batch
with Batch(backend=backend) as batch:
    sampler = Sampler(mode=batch)
    jobs = [sampler.run([(circ,)], shots=2048) for circ in isa_circuits]
results = [j.result() for j in jobs]
```

Queue craft that marks experienced users: check `pending_jobs` before choosing a backend; submit non-urgent jobs and retrieve later (`service.job("id")` — jobs persist; never babysit a queue); batch related circuits; log the job ID + transpilation metadata (last lesson's record) with every submission. Queues run minutes-to-hours — architecture your workflow around *asynchrony*, not around waiting.

@@diagram:job-lifecycle|A hardware job's life: transpile locally → submit → queue (minutes–hours) → execute (seconds) → results persist server-side. Design for retrieval-later, never for watching the spinner.

## Worked example — your first real-hardware experiment, end to end

*The rite of passage, fully annotated: Bell state + CHSH-style correlation check on a real QPU, with budget accounting.*

```python
# stage 0 (free): preflight passed on FakeSherbrooke — 0.94 predicted validity (last lessons)
# stage 1: the two circuits (Z-basis and X-basis correlation checks)
zz = QuantumCircuit(2); zz.h(0); zz.cx(0, 1); zz.measure_all()
xx = QuantumCircuit(2); xx.h(0); xx.cx(0, 1); xx.h(0); xx.h(1); xx.measure_all()

isa_zz, isa_xx = pm.run(zz), pm.run(xx)
print("2q gates:", [sum(v for k, v in c.count_ops().items() if k in ("ecr","cz"))
                    for c in (isa_zz, isa_xx)])       # sanity: 1 each — no routing surprises

# stage 2: ONE batch, both circuits, 4096 shots each  (~5–8 QPU-seconds total)
with Batch(backend=backend) as batch:
    sampler = Sampler(mode=batch)
    jz = sampler.run([(isa_zz,)], shots=4096)
    jx = sampler.run([(isa_xx,)], shots=4096)

for label, job in [("ZZ", jz), ("XX", jx)]:
    counts = job.result()[0].data.meas.get_counts()
    total = sum(counts.values())
    agree = (counts.get("00", 0) + counts.get("11", 0)) / total
    se = (agree * (1 - agree) / total) ** 0.5
    print(f"{label}-basis agreement: {agree:.4f} ± {2*se:.4f}")
# ZZ-basis agreement: 0.9490 ± 0.0069
# XX-basis agreement: 0.9345 ± 0.0077
```

Read the deliverable like the professional you now are: agreement in *two incompatible bases simultaneously* at ~94% — impossible classically above ~50% for the X-check without conspiracy (Module 6) — from a chip you addressed over the internet, with honest error bars, for about eight seconds of your monthly budget. The gap from 100% is next module's syllabus. Screenshot the histogram; that image is the traditional "my first entanglement on real hardware" trophy — and a legitimate portfolio artifact.

## Gotchas

- **Submitting non-ISA circuits.** `IBMInputValueError: circuits do not match the target hardware`. The transpile step is mandatory; the error message now reads as an old friend.
- **Forgetting `apply_layout` on Estimator observables.** No error, wrong wires, garbage expectations. The transpiled circuit's layout must be applied to every observable. (This is the #1 silent V2 mistake in the wild.)
- **Measurements with Estimator / none with Sampler.** Estimator adds its own (yours break it); Sampler samples yours (none = nothing to return). Opposite rules, same root: know what each primitive does.
- **Wrong result-register name.** `result[0].data.meas` exists only because `measure_all()` names its register "meas"; explicit `ClassicalRegister(2, "c")` lives at `.data.c`. `AttributeError: 'DataBin' object has no attribute 'meas'` means: check your register names.
- **Babysitting queues / losing job IDs.** Jobs persist server-side; `service.job(job_id)` retrieves any time. A lost ID with no metadata log = an unexplainable data point = a rerun you couldn't afford.
- **Burning budget on parameter sweeps as separate jobs.** Fifty jobs = fifty queue waits and fifty overheads. One PUB with a (50, k) parameter array = one wait. The broadcasting exists precisely for you.

## Scenario — the 10-minute month, allocated like an engineer

A student plans their first hardware month: "I'll run everything I've built!" — 40 circuits × 8k shots, naively ~50 separate jobs. Your mentorship, applying three modules: first, *nothing goes to hardware that hasn't passed the three-stage preflight* — that filters 40 candidate runs to 12 that are actually informative (the rest were answerable free on simulators). Second, batch by theme: one Bell/GHZ characterization batch (4 circuits), one interference-sweep job using ONE parameterized circuit with a 25-point angle array (the PUB broadcast — counts as one queue wait, ~15 QPU-s), one algorithm demo. Third, budget arithmetic before submission: ~12 circuits × 4k shots × ~2ms ≈ 100 QPU-seconds ≈ **1.6 of the 10 minutes** — leaving margin for the one guaranteed re-run (there's always one: a register-name typo, a layout surprise). Month's end: every result has error bars, job IDs, and transpilation metadata; two anomalies became Module 9 discussion material instead of mysteries. The allocation habit — *filter, batch, broadcast, budget, log* — is indistinguishable from how funded research groups run thousand-dollar-per-hour machines.

## Key points

- V2 primitives are the interface: SamplerV2 → counts/bitstrings (circuits WITH measurements), EstimatorV2 → expectation values (circuits WITHOUT; observables `apply_layout`-ed, `precision` picks shots).
- PUBs bundle (circuit, params, shots/observables); parameter arrays broadcast — sweeps ride one job; jobs take LISTS of PUBs.
- ISA-transpile against the exact target first (level 3, seeded), log layout + 2q count as metadata; result path: `result[k].data.<register>.get_counts()`.
- Open Plan: 10 QPU-min/28 days on 156-qubit Herons — 60–150 disciplined experiments; job + Batch modes (Sessions are paid-tier).
- Queue craft: least_busy + pending_jobs, batch related work, retrieve by job ID asynchronously, never babysit.
- Real results come with forbidden outcomes (~5%): that's measurable physics (readout + gates + decoherence), always reported with ±2SE — and it's Module 9's front door.

## Check yourself

```quiz
{"q":"Your Estimator job returns expectation values near zero for a Bell state's ZZ (ideal: +1). Circuits transpiled fine, no errors raised. Prime suspect?","options":["The device is broken","You forgot obs.apply_layout(isa.layout) — the observable is measuring the wrong physical qubits","Shots were too low","ZZ is not a valid observable"],"answer":1,"why":"Post-transpile, logical qubits live on physical indices chosen by layout. An un-mapped observable measures unrelated wires — returning noise-centered values with no error message. The silent classic."}
```

```quiz
{"q":"You need a 30-point angle sweep of one parameterized circuit on hardware. The budget-correct submission is:","options":["30 separate jobs, one per angle","One Sampler PUB: (isa_circuit, params_array_30xK) — parameter broadcasting, one queue wait","A Session (you're on the Open Plan)","Re-transpile the circuit 30 times with values baked in"],"answer":1,"why":"PUB parameter broadcasting executes all bindings within one job: one queue wait, one transpilation, minimal overhead. Thirty jobs waste queue time; Sessions aren't in the free tier; baking values discards the template design."}
```

## Exercises

**Exercise 1 — the interference sweep on real hardware (or its faithful rehearsal).** Build the H–P(φ)–H circuit with `phi = Parameter("φ")`, measure, ISA-transpile, and submit ONE Sampler PUB with 21 values of φ in $[0, 2\pi]$ (2048 shots each). Plot measured $p(0)$ vs φ against the $\cos^2(\varphi/2)$ curve with ±2SE bars. (No budget this month? Run the identical code against `AerSimulator.from_backend(FakeSherbrooke())` — the code path is the point.) Quantify: average absolute deviation from theory, and the visibility $\tfrac{p_{max} - p_{min}}{p_{max} + p_{min}}$.

````solution
```python
import numpy as np, matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit.transpiler import generate_preset_pass_manager

phi = Parameter("φ")
qc = QuantumCircuit(1)
qc.h(0); qc.p(phi, 0); qc.h(0); qc.measure_all()

# backend = real, or the honest stand-in:
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
from qiskit_aer import AerSimulator
from qiskit_aer.primitives import SamplerV2 as AerSampler
backend = FakeSherbrooke()
pm = generate_preset_pass_manager(3, backend=backend, seed_transpiler=7)
isa = pm.run(qc)

phis = np.linspace(0, 2*np.pi, 21).reshape(-1, 1)      # (21, 1) parameter array
sampler = AerSampler.from_backend(backend)              # real: SamplerV2(mode=backend)
job = sampler.run([(isa, phis)], shots=2048)
res = job.result()[0]

p0, err = [], []
for k in range(21):
    counts = res.data.meas.get_counts(k)                # k-th parameter binding!
    tot = sum(counts.values()); p = counts.get("0", 0) / tot
    p0.append(p); err.append(2*np.sqrt(p*(1-p)/tot))

grid = np.linspace(0, 2*np.pi, 300)
plt.errorbar(phis.ravel(), p0, yerr=err, fmt="o", capsize=3, label="hardware/rehearsal")
plt.plot(grid, np.cos(grid/2)**2, label="theory cos²(φ/2)")
plt.xlabel("φ (rad)"); plt.ylabel("p(0)"); plt.legend(); plt.grid(alpha=0.3); plt.show()

dev = np.mean(np.abs(np.array(p0) - np.cos(phis.ravel()/2)**2))
vis = (max(p0) - min(p0)) / (max(p0) + min(p0))
print(f"mean |deviation| = {dev:.4f}, visibility = {vis:.4f}")
# typical: deviation ~0.01–0.03, visibility ~0.95–0.98 (ideal: 0, 1)
```

The two summary numbers are the professional deliverable: mean deviation says "how honest is the device to theory"; **visibility** (fringe contrast) is THE standard interferometer quality metric — hardware papers quote it in abstracts. Note `get_counts(k)`: broadcast results index by parameter set. You've now executed the course's oldest running example — Euler's formula → NumPy pipeline → real quantum machine — as one continuous thread. That thread is your understanding.
````

**Exercise 2 — GHZ size ladder: where does the magic die?** Prepare GHZ states of n = 2, 3, 4, 5 (chain version), Sampler with 4096 shots each in ONE batch (or fake-backend rehearsal), and compute per-n: $p(\text{all-0}) + p(\text{all-1})$ with ±2SE, and the transpiled 2q-gate count. Plot fidelity-proxy vs n. At the observed decay rate, extrapolate: at what n does the GHZ signature drop below 50%?

````solution
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
from qiskit_aer.primitives import SamplerV2 as AerSampler

def ghz(n):
    qc = QuantumCircuit(n); qc.h(0)
    for k in range(n-1): qc.cx(k, k+1)
    qc.measure_all(); return qc

backend = FakeSherbrooke()
pm = generate_preset_pass_manager(3, backend=backend, seed_transpiler=7)
sampler = AerSampler.from_backend(backend)

print(" n  2q  signature ±2SE")
sig = {}
for n in (2, 3, 4, 5):
    isa = pm.run(ghz(n))
    twoq = sum(v for k, v in isa.count_ops().items() if k in ("ecr","cx","cz"))
    counts = sampler.run([(isa,)], shots=4096).result()[0].data.meas.get_counts()
    tot = sum(counts.values())
    s = (counts.get("0"*n, 0) + counts.get("1"*n, 0)) / tot
    se = np.sqrt(s*(1-s)/tot)
    sig[n] = s
    print(f"{n:>2} {twoq:>3}  {s:.4f} ± {2*se:.4f}")
# typical: n=2: .95 | n=3: .92 | n=4: .88 | n=5: .84   (device-dependent)
```

Extrapolation: the signature decays roughly geometrically per added qubit (each adds ~1 two-qubit gate + readout): fit $s(n) \approx s_2 \cdot r^{n-2}$; typical $r \approx 0.95$–0.96 → drop below 0.5 around $n \approx 2 + \ln(0.5/0.95)/\ln(0.96) \approx$ **17–20 qubits**. (Published GHZ records push further only with error mitigation, dynamical decoupling, and hand-tuned layouts — all Module 9 fare.) What you built is a genuine *device benchmark*: a one-number-per-size summary of multi-qubit coherence, with error bars, reproducible from a job ID. Put the plot in your portfolio repo — this exact ladder, at larger n with mitigation, is your capstone's opening act (Module 11).
````

## Practice questions

1. Sampler vs Estimator: which for (a) a Bell-test histogram, (b) a VQE energy, (c) raw per-shot bitstrings for correlation mining?
2. Write the result-access path for a Sampler job whose circuit used `ClassicalRegister(3, "syndrome")`.
3. Why does Estimator take a `precision` argument instead of `shots`, and what lesson from Module 3 is it encoding?
4. Your job sat in queue 3 hours; execution took 6 seconds. Which number does your Open-Plan budget charge, and what workflow implication follows?
5. Name the three things you log with every hardware submission, and the failure each explains later.
6. A 60-point sweep needs error bars of ±1% per point. Shots per point? Total QPU-seconds at 2 ms/shot? Fits in a free month?
7. **Design question:** design `run_hardware(circuits, labels, shots, backend)` — your team's single gateway function for all QPU submissions: what it validates before submitting, what it logs, what it returns, and the two abuse patterns it should refuse.

````solution
1. (a) Sampler; (b) Estimator; (c) Sampler with `.get_bitstrings()`.
2. `job.result()[0].data.syndrome.get_counts()` — registers surface under their own names.
3. Precision = target standard error; the primitive inverts SE = √(p(1−p)/n)-style arithmetic (for the observable's variance) to choose shots — Module 3's shot-sizing formula, productized.
4. Only execution (~6 s) charges QPU time; queue is free. Implication: asynchrony is cheap, so submit-and-retrieve-later beats babysitting, and batching amortizes queue waits, not budget.
5. Job ID (retrieval), transpilation metadata: layout + 2q count + seeds (result explanation/regression diffing), calibration timestamp (device-vs-code attribution).
6. ±1% at worst-case p: n = 1/ε² = 10,000 shots/point ×60 = 600k shots ≈ 1200 QPU-s = 20 min — exceeds the 10-min plan. Options in a defensible answer: relax to ±1.5% (267k shots ≈ 8.9 min — fits), exploit known p ≈ small to shrink variance, or split across two months. The arithmetic-first reflex is the point.
7. Model: validates — every circuit is ISA for THIS backend (basis + coupling check), has measurements, parameter-free (all bound), estimated QPU cost = Σshots×duration_est fits remaining monthly budget (tracked in a local ledger file), preflight-passed flag present in metadata. Logs — job IDs ↔ labels, full transpilation record, calibration snapshot timestamp, git commit of the code. Returns — job handles + a written manifest (JSON) enabling retrieve-later analysis with zero human memory. Refuses — (i) sweep-as-N-jobs when one broadcast PUB would do (auto-rewrites or errors with instructions), (ii) submissions exceeding X% of remaining monthly budget without an override flag (the "one experiment eats the month" pattern). A gateway function is a policy document that executes — and writing it is how a junior becomes the person the team trusts with the QPU keys.
````
