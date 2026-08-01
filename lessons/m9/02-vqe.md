# VQE: the variational workhorse

The Variational Quantum Eigensolver is the most important NISQ-era algorithm — the one that might deliver real value on today's noisy hardware, and the one most quantum-applications job postings actually want. Its idea is beautiful and pragmatic: since deep algorithms like QPE need fault tolerance we don't have, let a *shallow* quantum circuit and a *classical* optimizer collaborate. The quantum computer does the one thing it's good at (evaluating an energy for a given state); the classical computer does the optimization. VQE finds the lowest eigenvalue of a Hamiltonian — which, for a molecule, is its ground-state energy, the number chemistry is built on.

## Start here — the intuition

Imagine finding the lowest point in a dark, fog-filled valley. You can't see the whole landscape — it's astronomically vast — but you *can* stand at one spot and read your altitude. So you read it, take a step downhill, read again, repeat. That loop finds the valley floor without ever seeing the whole map.

VQE is exactly this. The "landscape" is every possible quantum state (exponentially huge). The "altitude" at a state is its **energy**, $\langle\psi|H|\psi\rangle$ — and a quantum computer is a very good altimeter for it. A **classical** optimizer plays the hiker, using altitude readings to adjust the circuit's knobs (angles) and walk downhill. The lowest altitude it reaches is the **ground-state energy** — for a molecule, its most stable configuration, the number chemists actually want. Quantum computer = altimeter; classical computer = hiker.

## The variational principle — why downhill works

Given a Hermitian operator $H$ (a Hamiltonian), find its smallest eigenvalue $E_0$. Classically that means diagonalizing a $2^n\times2^n$ matrix — hopeless past ~50 orbitals. VQE leans on the **variational principle** (provable in two lines from the eigen lesson): for *any* state,

$$\langle\psi| H |\psi\rangle \;\ge\; E_0$$

with equality only at the ground state. So the ground energy is the *minimum* of the altitude over all states — and minimizing is what optimizers do. The catch: you don't search all states, only your **ansatz**'s slice — a parametrized family $\ket{\psi(\vec\theta)}$. VQE finds the best energy *achievable by your ansatz*, an approximation whose quality is the ansatz's quality.

@@diagram:vqe-loop|The VQE loop: a quantum circuit prepares |ψ(θ)⟩ and measures ⟨H⟩; a classical optimizer proposes better θ; repeat until the energy stops dropping. Hybrid quantum-classical, shallow circuits, NISQ-friendly.

@@widget

## Hamiltonians as Pauli sums — the bridge to circuits

A quantum computer can't measure an arbitrary matrix, but it *can* measure Pauli operators. The key fact: **every Hamiltonian decomposes into a weighted sum of Pauli strings**, $H = \sum_k c_k P_k$ with $P_k \in \{I,X,Y,Z\}^{\otimes n}$. For the hydrogen molecule H₂ in a minimal basis, $H$ is a handful of terms like $c_0 II + c_1 ZI + c_2 IZ + c_3 ZZ + c_4 XX$. By linearity $\langle H\rangle = \sum_k c_k\langle P_k\rangle$ — measure each Pauli term, scale, sum. (Qiskit's Estimator does this for you from a `SparsePauliOp`.)

## Predict, then run — VQE for a real molecule (H₂)

The live cell finds H₂'s ground energy. The optimizer is a plain coordinate descent (the sandbox has numpy but not scipy) — crude, but it converges, and it makes the hybrid loop transparent. The one line that matters most is the entangling `cx`.

**Predict first.** H₂'s ground state is *entangled* (the $XX$ term correlates the two qubits). So: will a "product" ansatz with rotations but **no** `cx` be able to reach the true ground energy? Guess, then Run and compare the two.

```run
# Live cell — VQE for H2. QuantumCircuit + numpy only (no scipy), so the
# optimizer is a simple coordinate descent. Edit the ansatz and watch.
import numpy as np
I = np.eye(2, dtype=complex); Z = np.array([[1,0],[0,-1]], complex); X = np.array([[0,1],[1,0]], complex)
def K(a, b): return np.kron(a, b)

# H2 near its equilibrium bond length, mapped to 2 qubits (Hartree units):
H = -1.0523*K(I,I) + 0.3979*K(Z,I) - 0.3979*K(I,Z) - 0.0113*K(Z,Z) + 0.1809*K(X,X)
exact = float(np.min(np.linalg.eigvalsh(H)))     # classical check (tiny system only)

def energy(p, entangle):
    qc = QuantumCircuit(2)
    qc.ry(p[0], 0); qc.ry(p[1], 1)               # single-qubit rotations
    if entangle:
        qc.cx(0, 1); qc.ry(p[2], 0); qc.ry(p[3], 1)   # <- the entangling layer
    psi = qc.statevector()
    return float(np.real(psi.conj() @ H @ psi))       # <psi|H|psi>

def vqe(entangle, seed=0):
    rng = np.random.default_rng(seed); p = list(rng.uniform(0, 2*np.pi, 4 if entangle else 2))
    for _ in range(50):                          # coordinate descent = the classical optimizer
        for k in range(len(p)):
            grid = np.linspace(0, 2*np.pi, 73)
            p[k] = float(min(grid, key=lambda v: energy([*p[:k], v, *p[k+1:]], entangle)))
    return energy(p, entangle)

print("exact ground energy   :", round(exact, 4), "Ha")
print("entangling ansatz     :", round(vqe(True), 4), "Ha  <- reaches it")
print("product ansatz (no cx):", round(vqe(False), 4), "Ha  <- stuck above")
```

The product ansatz lands ~0.02 Ha high and *stays* there no matter how long you optimize — because without a `cx` the state is a product $\ket{\psi_0}\otimes\ket{\psi_1}$, and H₂'s ground state is entangled. The entangling gate isn't decoration; it's what lets the ansatz reach correlated ground states. This one experiment is the entire "your ansatz must be expressive enough" lesson, on demand.

```quiz
{"q":"VQE converges to an energy ABOVE the true ground state, even on a perfect noiseless simulator. The cause is:","options":["Insufficient shots","The ansatz can't express the true ground state — VQE found the minimum WITHIN its state family, which lies above E₀; a more expressive ansatz is needed","A bug in the optimizer","The variational principle is violated"],"answer":1,"why":"The variational principle guarantees ⟨H⟩ ≥ E₀ always; equality needs the ground state to be reachable by the ansatz. Noiseless convergence above E₀ is definitionally an expressibility limit — add layers or change ansatz, don't chase noise."}
```

## The ansatz — designing the state family

The ansatz's design is where VQE lives or dies. A **hardware-efficient** ansatz (layers of single-qubit rotations + entangling gates matched to the device) is shallow and NISQ-friendly but may not reach the true ground state and suffers barren plateaus. A **chemistry-inspired** ansatz (UCCSD, built from electron-excitation physics) is more accurate and provably able to reach the ground state, but deeper — more gates, more noise. The eternal NISQ trade: accuracy vs depth vs noise.

## The optimization loop — hybrid in action

On real hardware the cost function is the Estimator measuring $\langle H\rangle = \sum c_k\langle P_k\rangle$, and the optimizer treats the quantum computer as a black-box $\vec\theta \mapsto$ energy, calling it hundreds of times. Standard optimizers: COBYLA, gradient methods, and — favored on noisy hardware — **SPSA**, which estimates a gradient from just two noisy evaluations per step regardless of parameter count, and whose convergence theory explicitly tolerates noisy function values. Each call costs shots with error bars, so noise-aware optimizers plus per-evaluation mitigation (this module) are the norm.

## Level up — the honest limitations

- **Barren plateaus.** For many ansätze, as qubit count grows the cost landscape becomes exponentially flat almost everywhere — gradients vanish, and the optimizer wanders a featureless plain. A fundamental scaling obstacle, and *why* generic expressive ansätze fail at scale. Mitigations: physics-informed ansätze, clever initialization, local cost functions.
- **Optimization hardness.** The landscape is non-convex — local minima trap optimizers; run from several starting points.
- **Measurement overhead.** A molecule's Hamiltonian can have thousands of Pauli terms; grouping commuting terms cuts the shot cost (a real on-the-job optimization).
- **No proven advantage.** As of 2026, VQE has not clearly beaten the best classical methods (coupled cluster, DMRG) for a useful molecule. VQE is a leading *candidate* for early advantage, not a delivered one. Saying so plainly marks understanding over hype.

## Level up — the chemistry-team code review

A colleague's VQE for a 4-qubit molecule converges to $-1.79$ Ha, but the classical benchmark says $-1.86$. "The hardware noise is too high," they conclude. Your review: first **isolate** — run the identical VQE on a *noiseless* statevector simulator. It also returns $-1.79$. So it isn't noise — it's the **ansatz** (too few layers to express this molecule). Fix the ansatz (noiseless sim now hits $-1.858$), *then* address hardware noise. "Noiseless simulation first isolates ansatz error from noise error" is the single most valuable VQE debugging habit — and it's the live cell above, generalized.

## Key points

- VQE finds a Hamiltonian's lowest eigenvalue (a molecule's ground energy) by minimizing $\langle\psi(\vec\theta)|H|\psi(\vec\theta)\rangle$ over an ansatz — the variational principle guarantees $\ge E_0$, with the gap set by ansatz quality.
- Hamiltonians decompose into weighted Pauli sums; $\langle H\rangle = \sum c_k\langle P_k\rangle$, measured term by term.
- Hybrid loop: quantum circuit evaluates energy for given $\vec\theta$; classical optimizer (COBYLA/SPSA) proposes better $\vec\theta$; iterate. Shallow circuits make it NISQ-friendly.
- Ansatz design trades expressibility vs depth vs noise; the entangling layer is what reaches correlated ground states.
- Failure modes: barren plateaus, local minima, measurement overhead, and NO proven advantage yet.
- Debug by isolating: noiseless simulation separates ansatz error from noise error before you fight the wrong problem.

## Check yourself

```quiz
{"q":"Why is VQE considered NISQ-friendly while QPE (which also finds eigenvalues) is not?","options":["QPE is a classical algorithm","VQE uses shallow parameterized circuits with a classical optimizer doing the heavy lifting, keeping quantum depth low; QPE needs deep coherent circuits (many controlled powers + QFT) requiring fault tolerance","VQE doesn't use qubits","QPE only works on simulators"],"answer":1,"why":"VQE offloads optimization to a classical computer, needing only shallow energy-evaluation circuits — survivable on noisy hardware. QPE's deep coherent circuits decohere on NISQ devices, awaiting error correction. Same goal, opposite hardware demands."}
```

## Exercises

**Exercise 1 — trace the optimizer, and break the ansatz.** In the live cell, have `vqe` also return the energy after each full sweep, and print the trajectory for both ansätze. Confirm the entangling one descends to $-1.857$ while the product one plateaus ~$0.02$ Ha high. Explain the plateau in terms of the $XX$ term.

````solution
```python
# Without a cx the state is a product |psi0> x |psi1>; the XX term needs
# correlation a product state can't provide, so <H> is bounded above E0.
# The optimizer minimizes honestly over a family that excludes the answer.
```

The entangling gate is what lets the ansatz represent correlated (entangled) ground states — most molecules have them (nonzero $\langle XX\rangle$). This is ansatz expressibility made visceral.
````

**Exercise 2 — the dissociation curve.** The coefficients of $H$ change with bond length $r$. Sketch (conceptually, or with precomputed coefficients) how you'd run VQE at each $r$ and plot $E(r)$: the curve dips to a minimum at ~0.735 Å, and the depth of that well is the bond dissociation energy — a chemically meaningful, experimentally verifiable number. This plot is the canonical VQE portfolio piece (Module 11's capstone builds it on hardware with mitigation).

````solution
```python
# for r in bond_lengths: build H(r) from a chemistry package (PySCF), run VQE,
# record E(r). Plot E vs r; mark the minimum at ~0.735 Angstrom, depth ~ -1.857 Ha.
# Present WITH error bars and overlaid on the exact classical value, labeled
# "method demonstration, not an advantage claim" (H2 is classically trivial).
```
````

## Practice questions

1. State the variational principle and why it makes ground-energy-finding a minimization problem.
2. Why must a Hamiltonian be expressed as a Pauli sum for a quantum computer to evaluate its expectation?
3. What does the entangling layer in an ansatz provide that single-qubit rotations cannot?
4. Explain a barren plateau and why it's a *scaling* obstacle specifically.
5. Your VQE gives different energies on 5 random-seed runs. What does this indicate and what's the fix?
6. Why is noiseless simulation the first debugging step for an underperforming VQE?
7. **Design question:** design a VQE experiment plan for a 6-qubit molecule on the free Open Plan (10 QPU-min/month): ansatz, optimizer, shot budget per evaluation, mitigation config, the noiseless-benchmark step, and how you'd present results honestly against a classical baseline. Where's the budget bottleneck?

````solution
1. For any state, $\langle\psi|H|\psi\rangle \ge E_0$ (a probability-weighted average of eigenvalues in the eigenbasis, minimized by all-weight on the lowest). Minimizing the expectation finds $E_0$ — a minimization optimizers solve.
2. Hardware measures Pauli observables via basis rotations; an arbitrary matrix isn't directly measurable, but its Pauli decomposition assembles $\langle H\rangle$ from measurable pieces.
3. Correlations/entanglement — product-state ansätze can't represent entangled ground states, which most molecules have.
4. Gradients vanish exponentially almost everywhere as qubits grow, leaving no signal to follow — a *scaling* obstacle because the flatness worsens exponentially with size, exactly where advantage would need to appear.
5. Non-convex landscape with local minima (and/or noise); fix by multi-start, better initialization, and checking for barren-plateau flatness.
6. It isolates ansatz-expressibility error from hardware-noise error — if noiseless VQE also underperforms, the ansatz is the problem.
7. Hardware-efficient ansatz (2 layers) validated against a UCCSD noiseless benchmark; SPSA optimizer (2 evals/step, noise-robust); shots sized per commuting Pauli group to ~0.01 Ha precision; resilience/DD mitigation, light ZNE if budget allows; noiseless benchmark first (free). Bottleneck: evaluation count × Pauli groups × shots — SPSA's 2-evals/step and commuting-term grouping are the levers. Present the energy with error bars against the exact classical value, labeled a demonstration, not an advantage claim.
````

## Mastery checklist — you are ready to move on when you can

- ☐ State the variational principle and why it turns ground-energy into a minimization.
- ☐ Explain the hybrid loop: what the quantum computer evaluates and what the classical optimizer does.
- ☐ Run the live H₂ cell and explain why the product ansatz can't reach the ground energy.
- ☐ Describe the ansatz trade-off (hardware-efficient vs UCCSD) in terms of depth, expressibility, and noise.
- ☐ Explain a barren plateau and why it's a scaling obstacle.
- ☐ Give the noiseless-first debugging habit and why it isolates the real problem.
