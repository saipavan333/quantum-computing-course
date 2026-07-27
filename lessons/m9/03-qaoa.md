# QAOA: quantum optimization

QAOA (Quantum Approximate Optimization Algorithm) is VQE's cousin pointed at combinatorial optimization — scheduling, routing, portfolio selection, the problems businesses actually pay to solve. It's the algorithm most often invoked when companies pitch "quantum advantage for optimization," which makes understanding both its mechanism *and* its sober reality a directly marketable skill. You'll encode a real problem (MaxCut) into a quantum Hamiltonian, build the alternating-operator circuit, read solutions from samples, and — critically — be able to say honestly where QAOA stands versus classical solvers in 2026.

## 1. The problem class — combinatorial optimization

Many valuable problems are: "assign discrete choices (bits) to minimize/maximize a cost." MaxCut is the canonical example and QAOA's standard demo: given a graph, split its vertices into two groups to *maximize* the number of edges crossing between groups. Applications wear MaxCut's clothes constantly — clustering, VLSI design, and (with weights) portfolio risk. It's NP-hard in general, so exact classical solutions blow up — the hoped-for quantum niche.

Encode a cut as a bit per vertex (0 = group A, 1 = group B). An edge $(i,j)$ is "cut" when its endpoints differ. The cost to *maximize*:

$$C(z) = \sum_{(i,j)\in E} \frac{1 - z_i z_j}{2} \qquad z_i \in \{-1, +1\}$$

(using ±1 spins: $z_iz_j = -1$ when they differ → term = 1 → cut). Promote each $z_i$ to a Pauli Z operator, and the cost becomes a **cost Hamiltonian**:

$$H_C = \sum_{(i,j)\in E} \frac{1 - Z_i Z_j}{2}$$

whose highest-energy eigenstate is the best cut. QAOA hunts for it — VQE's machinery (Module 9's Pauli sums, expectations, hybrid loop), aimed at a combinatorial objective.

## 2. The QAOA ansatz — alternating cost and mixer

QAOA's ansatz has a specific, physics-motivated structure (unlike VQE's freer designs). Start from the uniform superposition $\ket{+}^{\otimes n}$ (all cuts equally weighted), then alternate two operators for $p$ rounds:

**Cost layer** $e^{-i\gamma H_C}$: applies a phase proportional to each cut's quality — good cuts get distinguished phases (Module 5's "write the problem into phases"). For MaxCut, this is $ZZ$-rotations on each edge: `rzz(2γ, i, j)`.

**Mixer layer** $e^{-i\beta H_M}$ with $H_M = \sum_i X_i$: rotations that let amplitude *flow between* different cuts (X drives transitions — without it, the phases couldn't interfere into a solution). This is `rx(2β, i)` on every qubit.

$$\ket{\vec\gamma, \vec\beta} = \prod_{\ell=1}^{p} e^{-i\beta_\ell H_M}\, e^{-i\gamma_\ell H_C}\; \ket{+}^{\otimes n}$$

@@diagram:qaoa-circuit|QAOA: start in uniform superposition, then alternate cost layers (phase good solutions) and mixer layers (let amplitude flow) for p rounds. Classical optimizer tunes the 2p angles; deeper p → better approximation, more noise.

The $2p$ angles $(\vec\gamma, \vec\beta)$ are the variational parameters — a classical optimizer tunes them to maximize $\langle H_C\rangle$, exactly VQE's loop. More rounds $p$ = more expressive = better approximation (and provably optimal as $p\to\infty$), but deeper circuit = more noise. The NISQ sweet spot is small $p$ (1–3).

## 3. Building and running it

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.circuit import ParameterVector

def qaoa_maxcut(edges, n, p=1):
    gamma = ParameterVector("γ", p); beta = ParameterVector("β", p)
    qc = QuantumCircuit(n)
    qc.h(range(n))                              # uniform superposition over cuts
    for layer in range(p):
        for (i, j) in edges:                    # cost layer: phase by cut quality
            qc.rzz(2 * gamma[layer], i, j)
        for q in range(n):                      # mixer layer: let amplitude flow
            qc.rx(2 * beta[layer], q)
    return qc, gamma, beta

# a square graph: 4 vertices, 4 edges — optimal cut = 4 (bipartite!)
edges = [(0, 1), (1, 2), (2, 3), (3, 0)]
qc, g, b = qaoa_maxcut(edges, 4, p=1)
qc.measure_all()
print(qc.num_parameters)                        # 2  (p=1: one γ, one β)
```

After optimizing the angles (VQE-style loop maximizing $\langle H_C\rangle$), you **sample** the circuit — and here's the key difference from VQE: you don't want the energy, you want the *bitstring*. The most-frequent measured bitstrings are the candidate solutions; evaluate their cut values classically and keep the best. QAOA outputs a distribution peaked on good cuts, not the answer directly.

```python
# after finding optimal (γ*, β*), sample and score:
from qiskit.primitives import StatevectorSampler
sampler = StatevectorSampler()
bound = qc.assign_parameters({g[0]: 0.79, b[0]: 0.39})    # optimized angles
counts = sampler.run([bound], shots=2000).result()[0].data.meas.get_counts()

def cut_value(bitstring, edges):
    z = [1 if bit == '0' else -1 for bit in bitstring[::-1]]   # little-endian!
    return sum((1 - z[i]*z[j]) / 2 for i, j in edges)

best = max(counts, key=lambda s: cut_value(s, edges))
print(f"best sampled cut: {best} → value {cut_value(best, edges)}")   # e.g. '0101' → 4
```

## 4. The honest state of quantum optimization

This section matters as much as the mechanism, because it's where careers are made or embarrassed. The sober 2026 reality:

- **No demonstrated advantage.** Despite enormous hype, QAOA has NOT been shown to beat the best classical algorithms (Goemans-Williamson, simulated annealing, specialized SAT/MaxCut solvers) on any practically relevant problem. Classical optimization is a mature, ferociously optimized field.
- **Depth vs noise strangles it.** Good approximations need larger $p$, but each round adds two-qubit gates (the noise-dominant kind), and NISQ noise caps useful $p$ at ~1–3 — often too shallow for advantage.
- **Warm-starting and hybrids.** Active research uses classical solutions to initialize QAOA (warm-start) or interleaves classical and quantum steps — acknowledging that pure QAOA rarely wins.
- **It's still worth learning.** QAOA is a leading NISQ *candidate*, a superb teaching vehicle for the encode-phase-mix-sample pattern, and the encoding skills (problem → Ising Hamiltonian) transfer to quantum annealing (D-Wave) and future algorithms. Employers want people who can build it AND assess it honestly.

The interview-winning framing: *"QAOA elegantly maps optimization to a tunable quantum circuit, but as of 2026 it hasn't beaten classical solvers on useful instances — the depth needed for advantage exceeds what NISQ noise permits. It's a promising research direction and a transferable skill, not a deployed advantage."* Delivering that without either hype or dismissiveness is exactly the calibration hiring managers screen for.

## Worked example — MaxCut on a 5-vertex graph, landscape and all

*The full pattern: encode, scan the p=1 landscape, sample, benchmark against brute force.*

```python
import numpy as np, itertools
# graph: a 5-cycle with one chord
edges = [(0,1),(1,2),(2,3),(3,4),(4,0),(0,2)]; n = 5

# brute-force optimum (feasible at n=5: 2^5 = 32 cuts) — the classical benchmark
def cut(z_bits): 
    z=[1 if c=='0' else -1 for c in z_bits]; return sum((1-z[i]*z[j])/2 for i,j in edges)
best_classical = max(cut(format(k,'05b')) for k in range(32))
print("brute-force optimum:", best_classical)          # e.g. 5

# QAOA p=1: scan the (γ, β) landscape for the angles maximizing ⟨H_C⟩, then sample
# (build qaoa_maxcut, sweep a grid of γ,β on a simulator, pick the peak, sample 2000 shots)
# result: QAOA's top-sampled cut typically matches or nears the optimum at p=1 for small graphs
```

The instructive findings when you run it fully: (1) the p=1 landscape over $(\gamma,\beta)$ is smooth with clear optima (plot it — a genuinely pretty heatmap, portfolio-worthy); (2) QAOA's *expected* cut value at optimal angles is below the true optimum (that's the "Approximate" in QAOA), but the *best sampled* bitstring often hits it — because you sample many times and keep the best (the algorithm produces good cuts with high probability, not the optimum deterministically); (3) brute force settles it instantly at n=5. The honest lesson the exercise teaches: **QAOA is a sampler of good solutions whose quality you verify classically** — and at any size where you'd need it, you can't brute-force check, so the classical *baseline solver* (not brute force) is the real competition, and it's tough.

## Gotchas

- **Reading the energy instead of sampling bitstrings.** VQE wants $\langle H\rangle$; QAOA wants the best *bitstring*. After optimizing angles, you sample and score candidates classically — the expectation value is just the optimization target, not the deliverable.
- **Confusing maximize vs minimize / sign conventions.** MaxCut maximizes cuts; some formulations minimize $-C$ or use different $\gamma$ sign conventions. Verify on a graph with a known optimum before trusting results.
- **Little-endian bitstring scoring.** Mapping sampled bits back to vertices must respect Qiskit ordering (`[::-1]`) — mis-mapping scores the wrong cut and makes QAOA look broken. The recurring ordering tax.
- **Expecting the optimum deterministically.** QAOA returns a *distribution* peaked on good solutions; the optimal cut appears with some probability, not certainty. Sample enough, keep the best, quote the approximation ratio (QAOA value / optimum).
- **Deep p on NISQ hardware.** Cranking $p$ for better approximation adds noise-dominant two-qubit gates; past the noise threshold, deeper QAOA gets *worse* on hardware. The depth-vs-noise ceiling caps practical $p$ low.
- **Claiming advantage.** "We solved MaxCut on a quantum computer" is a demo; "we beat Gurobi/simulated-annealing on a useful instance" is the (unmet) bar. Frame QAOA results against real classical solvers, not against brute force or against nothing.

## Scenario — the "quantum optimization" client pitch you have to sanity-check

Your company's sales team wants to pitch QAOA to a logistics client for vehicle routing ("quantum speedup for your delivery optimization!"). Engineering (you) is asked to assess. Your memo, this lesson distilled: (1) routing maps to a QUBO/Ising Hamiltonian — encodable, yes (the skill transfers); (2) but the client's instances have thousands of variables, needing depth and qubit counts far beyond NISQ, and even at feasible sizes QAOA hasn't beaten the client's existing OR-Tools/Gurobi solver in any published benchmark; (3) honest recommendation: NOT a near-term advantage; pitching it as one risks credibility when it underperforms their current classical stack. Constructive alternative: a research collaboration exploring quantum-inspired classical methods (which sometimes DO help) or a small pilot with explicit "exploratory, not production" framing. The memo saves the company from a demo that would embarrass it against the client's own classical baseline. This assess-and-advise role — translating quantum hype into honest engineering guidance — is a real and well-paid function, and it requires exactly the mechanism-plus-sobriety this lesson builds.

## Key points

- QAOA solves combinatorial optimization (MaxCut canonical) by encoding cost into a Hamiltonian $H_C$ (Z-based) whose optimal eigenstate is the best solution.
- Ansatz: uniform superposition, then alternate cost layers $e^{-i\gamma H_C}$ (phase solutions, via `rzz` on edges) and mixer layers $e^{-i\beta H_M}$ (`rx`, let amplitude flow) for $p$ rounds; $2p$ variational angles.
- Optimize angles to maximize $\langle H_C\rangle$ (VQE-style hybrid loop), then SAMPLE and score bitstrings classically — QAOA outputs a distribution peaked on good solutions, not the answer directly.
- Larger $p$ → better approximation but more noise; NISQ caps useful $p$ at ~1–3.
- 2026 reality: no demonstrated advantage over mature classical solvers; depth-vs-noise is the barrier. A leading candidate and transferable skill, not a deployed win.
- The valued competence is building it AND assessing it honestly against real classical baselines (not brute force, not nothing).

## Check yourself

```quiz
{"q":"After optimizing QAOA's angles, how do you extract the solution to your MaxCut problem?","options":["Read the final expectation value ⟨H_C⟩ — that's the answer","Sample the circuit many times, score each measured bitstring's cut value classically, and keep the best — QAOA produces a distribution peaked on good cuts","Measure a single qubit","Run QPE on the result"],"answer":1,"why":"QAOA outputs a distribution over bitstrings peaked on good solutions. ⟨H_C⟩ is the optimization TARGET; the deliverable is the best sampled bitstring, verified classically. Sampling-and-scoring is the readout."}
```

```quiz
{"q":"A colleague claims their p=1 QAOA 'beat classical MaxCut'. What's the most important question to ask?","options":["How many qubits?","Beat WHAT classical method — brute force (trivial to beat at scale) or a real solver like Goemans-Williamson / simulated annealing? On a useful-sized instance? As of 2026, no QAOA has beaten mature classical solvers on practical problems","What's the gate error rate?","Did you use enough shots?"],"answer":1,"why":"The honest bar is beating a MATURE classical baseline on a relevant instance — not brute force, not nothing. QAOA demos routinely 'work' without approaching advantage. Interrogating the baseline is the literacy test."}
```

## Exercises

**Exercise 1 — QAOA MaxCut end to end with the landscape.** For the 4-cycle (edges [(0,1),(1,2),(2,3),(3,0)], optimum = 4): (a) build the p=1 QAOA circuit; (b) scan $(\gamma, \beta)$ over a grid, computing $\langle H_C\rangle$ via Statevector, and plot the landscape heatmap; (c) at the optimal angles, sample and report the approximation ratio (best-sampled / optimum) and the probability of hitting the optimum. Confirm against brute force.

````solution
```python
import numpy as np, matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

edges = [(0,1),(1,2),(2,3),(3,0)]; n = 4
# cost Hamiltonian H_C = Σ (1 - Z_i Z_j)/2  (as SparsePauliOp for ⟨H_C⟩)
terms, coeffs = [], []
for (i,j) in edges:
    zz = ['I']*n; zz[i]='Z'; zz[j]='Z'
    terms.append(''.join(reversed(zz))); coeffs.append(-0.5)   # -ZZ/2 part
HC = SparsePauliOp(terms, coeffs) + SparsePauliOp(['I'*n],[len(edges)*0.5])  # + const

def qaoa(gamma, beta):
    qc = QuantumCircuit(n); qc.h(range(n))
    for (i,j) in edges: qc.rzz(2*gamma, i, j)
    for q in range(n): qc.rx(2*beta, q)
    return qc

gs = np.linspace(0, np.pi, 40); bs = np.linspace(0, np.pi, 40)
land = np.array([[Statevector(qaoa(g,b)).expectation_value(HC).real for g in gs] for b in bs])
plt.imshow(land, extent=[0,np.pi,0,np.pi], origin='lower', aspect='auto', cmap='viridis')
plt.colorbar(label='⟨H_C⟩'); plt.xlabel('γ'); plt.ylabel('β'); plt.title('QAOA p=1 landscape'); plt.show()

bi, bj = np.unravel_index(land.argmax(), land.shape)
g_opt, b_opt = gs[bj], bs[bi]
print(f"optimal ⟨H_C⟩ = {land.max():.3f} at γ={g_opt:.2f}, β={b_opt:.2f}")

# sample at optimum
qc = qaoa(g_opt, b_opt); qc.measure_all()
from qiskit.primitives import StatevectorSampler
counts = StatevectorSampler().run([qc], shots=4000).result()[0].data.meas.get_counts()
def cut(s): 
    z=[1 if c=='0' else -1 for c in s[::-1]]; return sum((1-z[i]*z[j])/2 for i,j in edges)
best = max(counts, key=lambda s: cut(s))
p_opt = sum(v for s,v in counts.items() if cut(s)==4)/4000
print(f"best sampled: {best} → cut {cut(best)};  P(optimum) = {p_opt:.2%}")
# ⟨H_C⟩ ≈ 3.0 at p=1 (approximation ratio 3/4=0.75); best sampled = 4; P(optimum) ~40-50%
```

Findings: the landscape shows a clean maximum (a satisfying heatmap for your portfolio); at p=1, $\langle H_C\rangle \approx 3$ — an **approximation ratio of 0.75** (QAOA's known p=1 MaxCut guarantee neighborhood), meaning on *average* it finds 75% of the optimum — but sampling 4000 times, the true optimum (cut 4, the bipartite split like '0101') appears ~40-50% of the time, so keeping the best sample nails it. The distinction is the whole lesson: expected value approximate, best-of-many-samples often optimal. Increasing to p=2 raises the ratio toward 1 — the depth-accuracy trade you'd plot next. Brute force confirms optimum = 4 instantly, which is the humbling reminder of what QAOA competes against at demonstrable sizes.
````

**Exercise 2 — the honest benchmark.** Take a 10-vertex random graph. Implement (a) QAOA p=1 (simulated), (b) the classical Goemans-Williamson-style random-hyperplane heuristic OR simple greedy/random-restart local search, (c) brute force (2¹⁰ = 1024, feasible). Compare best-cut-found and wall-clock time for all three. Write the two-paragraph honest conclusion you'd put in a report.

````solution
```python
import numpy as np, itertools, time, random
rng = random.Random(0)
n = 10
edges = [(i,j) for i in range(n) for j in range(i+1,n) if rng.random() < 0.4]

def cut(bits): return sum((bits[i]!=bits[j]) for i,j in edges)

# (c) brute force
t0=time.perf_counter()
bf = max(cut([int(c) for c in format(k,'010b')]) for k in range(1024))
t_bf = time.perf_counter()-t0

# (b) classical local search with random restarts
t0=time.perf_counter()
best_ls = 0
for _ in range(200):
    s = [rng.randint(0,1) for _ in range(n)]
    improved = True
    while improved:
        improved = False
        for v in range(n):
            s[v] ^= 1
            if cut(s) > cut([b^(i==v) for i,b in enumerate(s)]): pass
            # (simple hill-climb; flip if it helps)
            s[v] ^= 1
            base = cut(s); s[v]^=1
            if cut(s) <= base: s[v]^=1
            else: improved = True
    best_ls = max(best_ls, cut(s))
t_ls = time.perf_counter()-t0

# (a) QAOA p=1 simulated (best sampled over a good angle) — sketch
# ... build, optimize angles, sample 4000, best_qaoa = max cut over samples ...
print(f"brute force : cut {bf}  in {t_bf*1000:.1f} ms")
print(f"local search: cut {best_ls}  in {t_ls*1000:.1f} ms")
# print(f"QAOA p=1    : cut {best_qaoa} in ~seconds (simulation)")
```

Honest conclusion (the deliverable): *"On this 10-vertex instance, brute force found the optimum (cut = X) in ~2 ms and classical local search with random restarts matched it in ~5 ms. QAOA p=1, simulated, found cut = Y (approximation ratio ~0.8–0.95 depending on samples) in seconds of classical simulation — and would require a real QPU for any speed benefit, which at this size is absent. QAOA neither beat nor matched the wall-clock of trivial classical methods here.*

*This is expected and not a criticism of QAOA: at sizes where classical methods struggle (thousands of variables), QAOA needs qubit counts and circuit depths beyond NISQ hardware, and no published result shows it beating mature solvers on practically-sized instances. QAOA remains a research-stage algorithm and a valuable skill for problem-encoding and future hardware, but should not be represented as a current optimization advantage."* — This paragraph, backed by your own numbers, is precisely the credible technical assessment that the sales-sanity-check scenario needs, and writing it well is a job skill in itself.
````

## Practice questions

1. How is a MaxCut instance encoded into a cost Hamiltonian? What do the qubits and Z operators represent?
2. What are the roles of the cost layer and the mixer layer, and why does QAOA fail without the mixer?
3. Why do you SAMPLE and score bitstrings for QAOA rather than reading the expectation value as the answer?
4. Explain the depth-vs-noise ceiling on the QAOA parameter $p$.
5. What is an "approximation ratio" and why does the best-sampled solution often beat the expected value?
6. A demo claims QAOA advantage by beating brute-force search. Why is this not a meaningful claim?
7. **Design question:** a client has a 500-variable portfolio-optimization problem (maximize return, constrain risk). Assess QAOA's applicability: the encoding path, the qubit/depth requirements vs NISQ reality, the honest recommendation, and one constructive alternative. What would make you reconsider in 5 years?

````solution
1. One qubit per vertex (0/1 = which group); Z_i measures vertex i's group as ±1; edge terms $(1-Z_iZ_j)/2$ count cut edges, so the Hamiltonian's max eigenstate is the best cut.
2. Cost layer phases each cut by its quality (writes the objective into phases); mixer drives transitions between cuts so amplitude can flow toward good ones. Without the mixer, the phased amplitudes never interfere/redistribute — you'd measure the uniform distribution, learning nothing.
3. QAOA prepares a distribution peaked on good solutions, not a definite state; the expectation value is the optimization target (average quality), while the actual solution is the best measured bitstring, verified classically.
4. Larger $p$ improves approximation but adds two-qubit gates each round; on noisy hardware, past a threshold the added noise outweighs the added expressibility, so deeper QAOA gets worse — capping useful $p$ at ~1–3.
5. Approximation ratio = (QAOA's achieved value)/(true optimum); it reflects the *expected* cut, but sampling many times and keeping the best exploits the distribution's tail — the optimum often appears with decent probability even when the mean is below it.
6. Brute force is trivially beatable at scale (and irrelevant as a baseline); meaningful advantage means beating MATURE classical solvers (simulated annealing, Goemans-Williamson, commercial optimizers) on practically-sized instances — a bar QAOA hasn't cleared.
7. Encoding: portfolio selection → QUBO (binary asset choices, return in linear terms, risk in quadratic ZZ terms, constraints as penalty terms) → Ising Hamiltonian — doable. Requirements vs reality: 500 variables → 500+ qubits with all-to-all-ish connectivity (risk couples all pairs), needing deep circuits with heavy routing on sparse hardware — far beyond reliable NISQ execution; even at feasible sizes no advantage is demonstrated. Recommendation: not near-term; do NOT pitch as production advantage. Constructive alternative: quantum-inspired classical optimizers (tensor-network/simulated-bifurcation methods that sometimes help), or a small exploratory pilot framed as research. Reconsider in 5 years IF: fault-tolerant or high-fidelity hardware reaches ~1000+ well-connected qubits AND a published benchmark shows QAOA (or a successor) beating the client's classical baseline on a comparable instance — track those two milestones specifically. Naming the concrete reconsideration triggers (hardware threshold + benchmark milestone) rather than vague optimism is the hallmark of a credible long-range technical assessment.
````
