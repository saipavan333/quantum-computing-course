# VQE: the variational workhorse

The Variational Quantum Eigensolver is the most important NISQ-era algorithm — the one that might deliver real value on today's noisy hardware, and the one most quantum-applications job postings actually want. Its idea is beautiful and pragmatic: since deep algorithms like QPE need fault tolerance we don't have, let a *shallow* quantum circuit and a *classical* optimizer collaborate. The quantum computer does the one thing it's good at (evaluating an energy for a given state); the classical computer does the optimization. VQE finds the lowest eigenvalue of a Hamiltonian — which, for a molecule, is its ground-state energy, the number chemistry is built on.

## 1. The problem and the variational principle

Given a Hermitian operator $H$ (a Hamiltonian — Module 2's observables, at scale), find its smallest eigenvalue $E_0$ (the ground-state energy). Classically, this means diagonalizing a $2^n \times 2^n$ matrix — exponential, hopeless past ~50 spin-orbitals.

VQE leans on the **variational principle** (provable in two lines from the eigen lesson): for ANY state $\ket{\psi}$,

$$\langle\psi| H |\psi\rangle \;\ge\; E_0$$

with equality only when $\ket\psi$ is the ground state. So the ground energy is the *minimum* of the expectation value over all states — and minimizing is what optimizers do. The plan: parametrize a family of states $\ket{\psi(\vec\theta)}$ (an **ansatz**), and hunt for the $\vec\theta$ minimizing $\langle\psi(\vec\theta)|H|\psi(\vec\theta)\rangle$. You'll never search *all* states (that's the exponential space), only the ansatz's slice — so VQE finds the best energy *achievable by your ansatz*, an approximation whose quality is the ansatz's quality.

@@diagram:vqe-loop|The VQE loop: a quantum circuit prepares |ψ(θ)⟩ and measures ⟨H⟩; a classical optimizer proposes better θ; repeat until the energy stops dropping. Hybrid quantum-classical, shallow circuits, NISQ-friendly.

## 2. Hamiltonians as Pauli sums — the bridge to circuits

A quantum computer can't measure an arbitrary $2^n\times2^n$ matrix directly, but it CAN measure Pauli operators (X, Y, Z on each qubit — Module 6). The key fact: **every Hamiltonian decomposes into a weighted sum of Pauli strings** (the eigen lesson's "Paulis are a basis for operators," at n qubits):

$$H = \sum_k c_k\, P_k \qquad P_k \in \{I, X, Y, Z\}^{\otimes n}$$

For the hydrogen molecule H₂ in a minimal basis (mapped to qubits via Jordan–Wigner or parity encoding), $H$ is a handful of terms like:

$$H_{\text{H}_2} = c_0\,II + c_1\,ZI + c_2\,IZ + c_3\,ZZ + c_4\,XX + c_5\,YY$$

with coefficients depending on the bond length. By linearity, $\langle H\rangle = \sum_k c_k\langle P_k\rangle$ — measure each Pauli term's expectation (Module 3's expectation, Module 5's basis rotations), scale by $c_k$, sum. The Estimator primitive (Module 7) does exactly this: hand it $H$ as a `SparsePauliOp` and it measures every term for you.

```python
from qiskit.quantum_info import SparsePauliOp

# H2 at ~0.735 Angstrom (illustrative coefficients, Hartree)
H2 = SparsePauliOp(
    ["II", "ZI", "IZ", "ZZ", "XX"],
    coeffs=[-1.0523, 0.3979, -0.3979, -0.0113, 0.1809]
)
print(H2.num_qubits)                 # 2
# exact ground energy (classical check — only feasible because it's tiny):
import numpy as np
print(min(np.linalg.eigvalsh(H2.to_matrix())))   # ≈ -1.857 Ha  (the target)
```

## 3. The ansatz — designing the state family

The ansatz $\ket{\psi(\vec\theta)}$ is a parameterized circuit (Module 7's `Parameter`s), and its design is where VQE lives or dies:

**Hardware-efficient ansatz**: layers of single-qubit rotations + entangling gates matched to the device's native gates and connectivity. Shallow, runs well on NISQ hardware, but may not reach the true ground state (expressibility limits) and suffers barren plateaus (Section 5).

**Chemistry-inspired ansatz (UCCSD)**: built from the physics of electron excitations — more accurate, provably able to reach the ground state, but deeper (more gates → more noise). The eternal NISQ trade: accuracy vs depth vs noise.

```python
from qiskit.circuit import QuantumCircuit, ParameterVector

def hardware_efficient(n_qubits, layers=1):
    theta = ParameterVector("θ", n_qubits * (layers + 1))
    qc = QuantumCircuit(n_qubits)
    idx = 0
    for q in range(n_qubits):
        qc.ry(theta[idx], q); idx += 1
    for _ in range(layers):
        for q in range(n_qubits - 1):
            qc.cx(q, q + 1)                    # entangle
        for q in range(n_qubits):
            qc.ry(theta[idx], q); idx += 1     # rotate
    return qc

ansatz = hardware_efficient(2, layers=1)
print(ansatz.num_parameters)                  # 4
```

## 4. The optimization loop — hybrid in action

VQE alternates quantum and classical work until convergence:

```python
import numpy as np
from scipy.optimize import minimize
from qiskit.primitives import StatevectorEstimator   # noiseless for learning

estimator = StatevectorEstimator()
ansatz = hardware_efficient(2, layers=1)

def energy(params):
    """The cost function: ⟨ψ(θ)|H|ψ(θ)⟩ — one quantum evaluation."""
    job = estimator.run([(ansatz, H2, params)])
    return job.result()[0].data.evs

# classical optimizer drives the quantum cost function
history = []
result = minimize(
    lambda p: history.append(energy(p)) or energy(p),
    x0=np.random.default_rng(1).uniform(0, 2*np.pi, ansatz.num_parameters),
    method="COBYLA", options={"maxiter": 200}
)
print(f"VQE energy: {result.fun:.4f} Ha   (exact: -1.857)")
# VQE energy: -1.8567 Ha  — converged to chemical accuracy
```

The pieces, each a prior lesson: the ansatz (Module 7 parameters), the cost function (Module 3 expectation via Module 7 Estimator), the optimizer (classical — COBYLA, SPSA, and gradient methods are standard; SPSA is favored on noisy hardware for its noise-robustness). The optimizer treats the quantum computer as a black-box function $\vec\theta \mapsto$ energy, calling it hundreds of times. On real hardware each call costs shots (with error bars — noisy cost functions need noise-aware optimizers like SPSA, and Module 9's mitigation on every evaluation).

## 5. The honest limitations — barren plateaus and beyond

VQE is promising, not proven. The professional must know its failure modes:

**Barren plateaus.** For many ansätze, as qubit count grows, the cost landscape becomes exponentially flat almost everywhere — gradients vanish exponentially, and the optimizer wanders a featureless plain, unable to find the minimum. This is a fundamental scaling obstacle (a major research topic), and it's *why* expressive-but-generic ansätze fail at scale. Mitigations: physics-informed ansätze, clever initialization, local cost functions.

**Optimization hardness.** The classical optimization is non-convex — local minima trap optimizers; results depend on initialization (run from several starting points). Noisy cost evaluations make it harder still.

**Measurement overhead.** A molecule's Hamiltonian can have thousands of Pauli terms; measuring each to precision needs many shots (grouping commuting terms helps — a real optimization problem you'd tackle on the job).

**No proven advantage.** As of 2026, VQE has not demonstrated a clear win over the best classical methods for a useful molecule — classical quantum chemistry (coupled cluster, DMRG) remains formidable. VQE is a leading *candidate* for early advantage, not a delivered one. Saying this plainly is the mark of someone who understands the field rather than its hype.

## Worked example — VQE across the H₂ dissociation curve

*The classic demonstration: compute H₂'s energy vs bond length, tracing the curve that predicts the molecule's equilibrium geometry and bond strength.*

For each bond length $r$, the Hamiltonian's coefficients change; run VQE at each and plot $E(r)$. The curve dips to a minimum at the equilibrium bond length (~0.735 Å) — the depth of that well IS the bond dissociation energy, a chemically meaningful, experimentally verifiable number.

```python
import numpy as np, matplotlib.pyplot as plt
# (coefficients as a function of r come from a chemistry package like PySCF;
#  here we sketch the workflow with a few precomputed points)
bond_lengths = [0.3, 0.5, 0.735, 1.0, 1.5, 2.0, 2.5]
# vqe_energy(r) runs the Section-4 loop with r-dependent H(r):
energies = [run_vqe_at(r) for r in bond_lengths]      # your Section-4 function

plt.plot(bond_lengths, energies, "o-", label="VQE")
plt.axvline(0.735, ls=":", color="gray")
plt.xlabel("bond length (Å)"); plt.ylabel("energy (Ha)")
plt.title("H₂ dissociation curve"); plt.legend(); plt.show()
```

The deliverable — a smooth curve with a well at 0.735 Å reaching −1.857 Ha — is *the* canonical VQE portfolio piece (Module 11's chemistry capstone builds it fully, on hardware with mitigation). It demonstrates the entire hybrid loop, connects a quantum computation to a real chemical prediction, and — done with error bars and a classical-benchmark comparison — shows exactly the judgment employers hire for. Every quantum-chemistry team has a version of this plot on a slide.

## Gotchas

- **Ansatz can't reach the ground state.** If the ansatz's state family doesn't include (a good approximation of) the true ground state, VQE converges to the best *available* energy — above $E_0$, and no optimizer or shots fix it. The error is the ansatz's expressibility, diagnosable by comparing to a classical benchmark on small systems.
- **Barren plateau mistaken for convergence.** A flat landscape gives a stationary optimizer that *looks* converged but sits far above $E_0$. Check gradient magnitudes; if they're vanishing at initialization, the ansatz/qubit-count is in plateau territory.
- **Gradient optimizers on noisy cost functions.** Finite-difference gradients amplify shot noise catastrophically. On hardware, use noise-robust optimizers (SPSA) or parameter-shift gradients with adequate shots.
- **Single random start.** Non-convex landscape → local minima. Run from multiple initializations and take the best; report the spread.
- **Forgetting mitigation per evaluation.** Every cost-function call on hardware is a noisy expectation value (Module 9). Un-mitigated VQE energies are biased high (noise washes out the signal); the whole mitigation stack applies to each evaluation.
- **Claiming quantum advantage.** VQE on 4 qubits reproducing H₂ is a demonstration, not an advantage — classical methods do H₂ instantly. Advantage requires a molecule beyond classical reach with a VQE result that's both accurate AND cheaper — not yet achieved. Frame demos honestly.

## Scenario — the chemistry-team code review

You join a quantum-chemistry team; a colleague's VQE for a 4-qubit molecule converges to −1.79 Ha, but the classical benchmark says −1.86. "The hardware noise is too high," they conclude. Your review, using this lesson: first isolate — run the *identical* VQE on a noiseless statevector simulator. It also returns −1.79. So it's NOT noise — it's the **ansatz**: their hardware-efficient ansatz with 1 layer can't express this molecule's ground state. Fix: add a layer (more expressibility) or switch to UCCSD — noiseless sim now hits −1.858. THEN address noise on hardware (mitigation stack). The diagnosis discipline — *noiseless simulation first isolates ansatz error from noise error* — is the single most valuable VQE debugging habit, and it's Module 7's "exact simulation is the glass-box referee" applied to a variational algorithm. The colleague was about to spend a week fighting noise that wasn't the problem.

## Key points

- VQE finds a Hamiltonian's lowest eigenvalue (a molecule's ground energy) by minimizing $\langle\psi(\vec\theta)|H|\psi(\vec\theta)\rangle$ over an ansatz — the variational principle guarantees this is ≥ $E_0$, with the gap set by ansatz quality.
- Hamiltonians decompose into weighted Pauli sums; $\langle H\rangle = \sum c_k\langle P_k\rangle$, measured term-by-term by the Estimator (each Pauli via a basis rotation).
- Hybrid loop: quantum circuit evaluates energy for given $\vec\theta$; classical optimizer (COBYLA/SPSA) proposes better $\vec\theta$; iterate. Shallow circuits make it NISQ-friendly.
- Ansatz design trades expressibility vs depth vs noise (hardware-efficient = shallow but limited; UCCSD = accurate but deep).
- Failure modes: barren plateaus (exponentially flat landscapes at scale), local minima, measurement overhead, and NO proven advantage yet — VQE is a leading candidate, not a delivered win.
- Debug by isolating: noiseless simulation separates ansatz error from noise error before you fight the wrong problem.

## Check yourself

```quiz
{"q":"VQE converges to an energy ABOVE the true ground state, even on a perfect noiseless simulator. The cause is:","options":["Insufficient shots","The ansatz can't express the true ground state — VQE found the minimum WITHIN its state family, which lies above E₀; a more expressive ansatz is needed","A bug in the optimizer","The variational principle is violated"],"answer":1,"why":"The variational principle guarantees ⟨H⟩ ≥ E₀ always; equality needs the ground state to be reachable by the ansatz. Noiseless convergence above E₀ is definitionally an expressibility limit — add layers or change ansatz, don't chase noise."}
```

```quiz
{"q":"Why is VQE considered NISQ-friendly while QPE (which also finds eigenvalues) is not?","options":["QPE is a classical algorithm","VQE uses shallow parameterized circuits with a classical optimizer doing the heavy lifting, keeping quantum depth low; QPE needs deep coherent circuits (many controlled powers + QFT) requiring fault tolerance","VQE doesn't use qubits","QPE only works on simulators"],"answer":1,"why":"VQE offloads optimization to a classical computer, needing only shallow energy-evaluation circuits — survivable on noisy hardware. QPE's deep coherent circuits decohere on NISQ devices, awaiting error correction (Module 10). Same goal, opposite hardware demands."}
```

## Exercises

**Exercise 1 — build and run VQE for H₂, then break the ansatz.** Implement the full Section-4 loop on the noiseless `StatevectorEstimator`. (a) Confirm convergence to −1.857 Ha with a 1-layer hardware-efficient ansatz. (b) Now use a *zero-entanglement* ansatz (Ry rotations only, no CX) and show it CANNOT reach the ground state — explain why in terms of the XX term. (c) Plot the optimizer's energy trajectory for both.

````solution
```python
import numpy as np, matplotlib.pyplot as plt
from scipy.optimize import minimize
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector
from qiskit.quantum_info import SparsePauliOp
from qiskit.primitives import StatevectorEstimator

H2 = SparsePauliOp(["II","ZI","IZ","ZZ","XX"], coeffs=[-1.0523,0.3979,-0.3979,-0.0113,0.1809])
est = StatevectorEstimator()

def make_ansatz(entangle):
    th = ParameterVector("θ", 4 if entangle else 2)
    qc = QuantumCircuit(2)
    qc.ry(th[0], 0); qc.ry(th[1], 1)
    if entangle:
        qc.cx(0, 1); qc.ry(th[2], 0); qc.ry(th[3], 1)
    return qc

def run(entangle):
    ans = make_ansatz(entangle); hist = []
    def cost(p):
        e = est.run([(ans, H2, p)]).result()[0].data.evs; hist.append(float(e)); return float(e)
    r = minimize(cost, np.random.default_rng(2).uniform(0,2*np.pi,ans.num_parameters), method="COBYLA", options={"maxiter":150})
    return r.fun, hist

e_ent, h_ent = run(True)
e_prod, h_prod = run(False)
print(f"entangling ansatz: {e_ent:.4f}  (exact -1.857)")
print(f"product   ansatz: {e_prod:.4f}  (stuck above)")
plt.plot(h_ent, label=f"entangling → {e_ent:.3f}")
plt.plot(h_prod, label=f"product → {e_prod:.3f}")
plt.axhline(-1.857, ls=":", color="gray", label="exact")
plt.xlabel("evaluation"); plt.ylabel("energy (Ha)"); plt.legend(); plt.show()
# entangling → -1.857 ✓  |  product → ~-1.83 (stuck ~0.03 Ha high)
```

Why the product ansatz fails: without a CX, the state stays a product $\ket{\psi_0}\otimes\ket{\psi_1}$ (Module 6), but H₂'s ground state is *entangled* (the XX term correlates the qubits — $\langle XX\rangle$ needs correlation a product state can't provide). The optimizer minimizes honestly but over a family that excludes the answer — landing ~0.03 Ha high (above "chemical accuracy" of 1.6 mHa, so chemically wrong). This is the ansatz-expressibility lesson made visceral: **the entangling gate isn't decoration, it's what lets the ansatz reach correlated ground states** — and it's exactly the diagnosis from the scenario, now reproduced on demand.
````

**Exercise 2 — noisy VQE with an optimizer shootout.** On a fake backend (or with added sampling noise via `Estimator` with finite `precision`), run VQE for H₂ with two optimizers: COBYLA and SPSA. Compare final energies, evaluation counts, and stability across 3 random seeds. Explain why SPSA is preferred on noisy hardware, and report which you'd deploy with error bars.

````solution
```python
import numpy as np
from qiskit_aer.primitives import EstimatorV2 as AerEstimator
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
# SPSA available via qiskit_algorithms.optimizers or a hand-rolled version
from scipy.optimize import minimize

backend = FakeSherbrooke()
est = AerEstimator.from_backend(backend)   # includes device noise
# ... transpile ansatz + observable (apply_layout!) as in Module 7 ...

def noisy_energy(params, ans_isa, H_isa):
    return est.run([(ans_isa, H_isa, params)], precision=0.01).result()[0].data.evs

# COBYLA (derivative-free, but assumes smooth-ish) vs SPSA (2-eval stochastic gradient)
for name, method in [("COBYLA", "COBYLA")]:   # + a SPSA loop
    finals = []
    for seed in range(3):
        x0 = np.random.default_rng(seed).uniform(0, 2*np.pi, 4)
        r = minimize(lambda p: noisy_energy(p, ans_isa, H_isa), x0, method=method, options={"maxiter":60})
        finals.append(float(r.fun))
    print(name, "finals:", [round(f,3) for f in finals], "spread:", round(np.std(finals),3))
```

Expected shape: COBYLA on noisy evaluations shows larger seed-to-seed spread and can stall (it interprets shot noise as landscape structure); SPSA, which estimates gradients from just two noisy evaluations per step and is designed for stochastic objectives, converges more stably to ~−1.82 to −1.85 (noise-biased high without mitigation) with tighter spread. Why SPSA wins on hardware: it needs only 2 cost evaluations per iteration *regardless of parameter count* (vs finite-difference's 2×n) AND its convergence theory explicitly tolerates noisy function values — it's *built* for exactly this. Deployment answer: SPSA + Module 9 mitigation on each evaluation + multiple seeds, reporting the best energy with an error bar from the seed spread AND the per-evaluation SE. The full artifact — optimizer choice justified by noise-robustness, mitigation layered, results with two kinds of error bar — is precisely the VQE-on-hardware competence the chemistry-applications roles screen for.
````

## Practice questions

1. State the variational principle and why it makes ground-energy-finding a minimization problem.
2. Why must a Hamiltonian be expressed as a Pauli sum for a quantum computer to evaluate its expectation?
3. What does the entangling layer in an ansatz provide that single-qubit rotations cannot?
4. Explain a barren plateau and why it's a *scaling* obstacle specifically.
5. Your VQE gives different energies on 5 random-seed runs. What does this indicate and what's the fix?
6. Why is noiseless simulation the first debugging step for an underperforming VQE?
7. **Design question:** design a VQE experiment plan for a 6-qubit molecule on the free Open Plan (10 QPU-min/month): ansatz choice, optimizer, shot budget per evaluation (Module 3 sizing), mitigation config (Module 9), the noiseless-benchmark step, and how you'd present results honestly against a classical baseline. Where's the budget bottleneck?

````solution
1. For any state, $\langle\psi|H|\psi\rangle \ge E_0$ (expand in the eigenbasis: it's a probability-weighted average of eigenvalues, minimized by putting all weight on the lowest). So minimizing the expectation over states finds $E_0$ — a minimization, which optimizers solve.
2. Hardware measures Pauli observables (via basis rotations); an arbitrary matrix isn't directly measurable, but its Pauli decomposition lets $\langle H\rangle = \sum c_k\langle P_k\rangle$ be assembled from measurable pieces.
3. Correlations/entanglement between qubits — product-state ansätze (rotations only) can't represent entangled ground states, which most molecules have (nonzero $\langle XX\rangle$ etc.).
4. As qubits grow, the cost landscape's gradients vanish exponentially almost everywhere, so the optimizer has no signal to follow — and it's a *scaling* obstacle because the flatness worsens exponentially with system size, precisely where quantum advantage would need to appear.
5. Non-convex landscape with local minima (and/or noise); fix: multi-start (run several seeds, take the best), better initialization, and check for barren-plateau flatness.
6. It isolates ansatz-expressibility error from hardware-noise error — if noiseless VQE also underperforms, the ansatz is the problem and fighting noise wastes effort (the scenario's lesson).
7. Model plan: ansatz — start hardware-efficient (2 layers) for depth, validated against a UCCSD noiseless benchmark for expressibility; optimizer — SPSA (2 evals/step, noise-robust); shots — precision ~0.01 Ha needs the Estimator to size shots per Pauli group (grouped commuting terms cut measurement cost); mitigation — resilience 1 + DD minimum, light ZNE if budget allows. Noiseless benchmark FIRST (free) to confirm the ansatz reaches within chemical accuracy. Budget bottleneck: the optimizer makes hundreds of evaluations × several Pauli groups × thousands of shots each — evaluation count × shots is the killer; SPSA's 2-evals/step and commuting-term grouping are the two levers that make it fit 10 minutes. Present: VQE curve/energy WITH error bars, overlaid on the exact classical value, with an explicit "this molecule is classically tractable — this is a method demonstration, not an advantage claim." The honest baseline comparison is non-negotiable and, done well, is what makes the result publishable rather than promotional.
````
