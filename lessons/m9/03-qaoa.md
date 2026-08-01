# QAOA: quantum optimization

QAOA (Quantum Approximate Optimization Algorithm) is VQE's cousin pointed at combinatorial optimization — scheduling, routing, portfolio selection, the problems businesses actually pay to solve. It's the algorithm most often invoked when companies pitch "quantum advantage for optimization," which makes understanding both its mechanism *and* its sober reality a directly marketable skill. You'll encode a real problem (MaxCut) into a quantum Hamiltonian, build the alternating-operator circuit, read solutions from samples, and — critically — say honestly where QAOA stands versus classical solvers in 2026.

## Start here — the intuition

You're splitting a group of people into two teams, and you want to *maximize* the number of rivalries that end up split across the two teams (so the teams are as "cut apart" as possible). With a handful of people you could try every split; with hundreds, the number of splits explodes.

QAOA's move: put *all* splits into superposition at once, then **nudge** the good ones — stamp better splits with distinguishing phases (the "cost" step), let amplitude flow between splits (the "mix" step), and repeat. After a couple of rounds, measuring the register tends to hand you a *good* split. You then check a handful of the splits it returns and keep the best. It's a tunable machine that samples good solutions — not a magic box that spits out the perfect one, and (honestly, in 2026) not yet a winner against mature classical optimizers.

## The problem class — combinatorial optimization

Many valuable problems are "assign discrete choices (bits) to optimize a cost." **MaxCut** is the canonical example: split a graph's vertices into two groups to maximize the edges crossing between groups. It's NP-hard in general — the hoped-for quantum niche. Encode a cut as a bit per vertex ($0$ = group A, $1$ = group B); an edge $(i,j)$ is cut when its endpoints differ. Using $\pm1$ spins $z_i$, the cost to maximize is

$$C(z) = \sum_{(i,j)\in E} \frac{1 - z_i z_j}{2}.$$

Promote each $z_i$ to a Pauli $Z$ and it becomes a **cost Hamiltonian** $H_C = \sum_{(i,j)\in E} \tfrac{1 - Z_iZ_j}{2}$, whose best-cut assignment is the eigenstate QAOA hunts.

## The one picture: encode → phase → mix → sample

Start from the uniform superposition $\ket{+}^{\otimes n}$ (all cuts equally weighted), then alternate two operators for $p$ rounds:

- **Cost layer** $e^{-i\gamma H_C}$ — applies a phase proportional to each cut's quality (write the problem into phases). For MaxCut it's a $ZZ$-rotation on each edge.
- **Mixer layer** $e^{-i\beta H_M}$, $H_M = \sum_i X_i$ — rotations that let amplitude *flow between* cuts (without the mixer, phases could never interfere into a solution). This is an `rx` on every qubit.

$$\ket{\vec\gamma, \vec\beta} = \prod_{\ell=1}^{p} e^{-i\beta_\ell H_M}\, e^{-i\gamma_\ell H_C}\; \ket{+}^{\otimes n}$$

@@diagram:qaoa-circuit|QAOA: start in uniform superposition, then alternate cost layers (phase good solutions) and mixer layers (let amplitude flow) for p rounds. Classical optimizer tunes the 2p angles; deeper p → better approximation, more noise.

@@widget

The $2p$ angles are the variational parameters — a classical optimizer tunes them to maximize $\langle H_C\rangle$, exactly VQE's loop. More rounds $p$ = more expressive (provably optimal as $p\to\infty$) but deeper = more noise, so the NISQ sweet spot is small $p$ (1–3).

## Predict, then run — QAOA on a triangle

The live cell builds QAOA $p=1$ on the in‑browser simulator (the $ZZ$ rotation is `cx · rz · cx`), scans the two angles, and reports the best expected cut plus the most‑likely bitstrings.

**Predict first.** A triangle has 3 edges, but any 2‑group split can cut at most **2** of them (one edge always stays within a group). So the true MaxCut is 2. What fraction of that do you think $p=1$ QAOA reaches on average? Guess, then Run.

```run
# Live cell — QAOA p=1 MaxCut on a triangle. Edit `edges` to try other graphs.
import numpy as np

edges = [(0,1), (1,2), (0,2)]                 # triangle; true MaxCut = 2
n = 3
Cdiag = np.array([sum(((x>>i)&1) != ((x>>j)&1) for i,j in edges) for x in range(2**n)], float)

def qaoa_state(gamma, beta):
    qc = QuantumCircuit(n)
    for q in range(n): qc.h(q)                 # uniform superposition over cuts
    for (i,j) in edges:                        # cost layer: e^{-i gamma Zi Zj}
        qc.cx(i, j); qc.rz(2*gamma, j); qc.cx(i, j)
    for q in range(n): qc.rx(2*beta, q)        # mixer: let amplitude flow
    return qc

def expected_cut(gamma, beta):
    p = np.abs(qaoa_state(gamma, beta).statevector())**2
    return float((p * Cdiag).sum())

grid = np.linspace(0, np.pi, 25)
best_val, g, b = max((expected_cut(gg, bb), gg, bb) for gg in grid for bb in grid)
print(f"best expected cut = {best_val:.3f} of max {int(Cdiag.max())}  (ratio {best_val/Cdiag.max():.2f})")

# sample-and-score: at the optimal angles, the likeliest bitstrings ARE good cuts
probs = qaoa_state(g, b).probabilities()
for bits, p in sorted(probs.items(), key=lambda kv: -kv[1])[:3]:
    print(f"  {bits}  cut={int(Cdiag[int(bits,2)])}  prob={p:.3f}")
```

The *expected* cut is below the optimum (that's the "Approximate" in QAOA), but the likeliest measured bitstrings are the cut‑2 solutions — so you sample and keep the best. Increasing $p$ pushes the expected value toward the optimum, at the cost of depth.

```quiz
{"q":"After optimizing QAOA's angles, how do you extract the solution to your MaxCut problem?","options":["Read the final expectation value ⟨H_C⟩ — that's the answer","Sample the circuit many times, score each measured bitstring's cut value classically, and keep the best — QAOA produces a distribution peaked on good cuts","Measure a single qubit","Run QPE on the result"],"answer":1,"why":"QAOA outputs a distribution over bitstrings peaked on good solutions. ⟨H_C⟩ is the optimization TARGET; the deliverable is the best sampled bitstring, verified classically."}
```

## Level up — the honest state of quantum optimization

This matters as much as the mechanism. The sober 2026 reality:

- **No demonstrated advantage.** Despite the hype, QAOA has not been shown to beat the best classical algorithms (Goemans–Williamson, simulated annealing, commercial solvers) on any practically relevant problem. Classical optimization is a mature, ferociously optimized field.
- **Depth vs noise strangles it.** Good approximations need larger $p$, but each round adds two‑qubit gates (the noise‑dominant kind), and NISQ noise caps useful $p$ at ~1–3 — often too shallow for advantage.
- **Warm‑starting and hybrids.** Active research initializes QAOA from classical solutions or interleaves classical steps — acknowledging pure QAOA rarely wins.
- **Still worth learning.** QAOA is a leading NISQ *candidate*, a superb vehicle for the encode–phase–mix–sample pattern, and the encoding skill (problem → Ising Hamiltonian) transfers to quantum annealing and future algorithms.

Interview‑winning framing: *"QAOA elegantly maps optimization to a tunable quantum circuit, but as of 2026 it hasn't beaten classical solvers on useful instances — the depth needed for advantage exceeds what NISQ noise permits. A promising direction and a transferable skill, not a deployed advantage."*

## Level up — gotchas the pros watch for

- **Reading the energy instead of sampling bitstrings.** The expectation value is the optimization target; the deliverable is the best *sampled* bitstring, scored classically.
- **Sign / maximize‑vs‑minimize conventions.** Verify on a graph with a known optimum before trusting results.
- **Little‑endian bitstring scoring.** Map sampled bits back to vertices respecting qubit ordering — the recurring ordering tax.
- **Expecting the optimum deterministically.** QAOA returns a *distribution* peaked on good solutions; sample enough, keep the best, quote the approximation ratio.
- **Deep $p$ on NISQ hardware.** Past the noise threshold, deeper QAOA gets *worse* on hardware.
- **Claiming advantage.** "We solved MaxCut on a quantum computer" is a demo; "we beat Gurobi/simulated annealing on a useful instance" is the (unmet) bar. Benchmark against real classical solvers, not brute force.

## Level up — the client pitch you have to sanity-check

Sales wants to pitch QAOA to a logistics client for vehicle routing. Your assessment memo, distilled: (1) routing maps to a QUBO/Ising Hamiltonian — encodable, the skill transfers; (2) but the instances have thousands of variables, needing depth and qubit counts far beyond NISQ, and even at feasible sizes QAOA hasn't beaten the client's existing OR‑Tools/Gurobi solver in any published benchmark; (3) honest recommendation: not a near‑term advantage — pitching it as one risks credibility when it underperforms their classical stack. Constructive alternative: a small exploratory pilot framed as research. Translating hype into honest engineering guidance is a real, well‑paid function.

## Key points

- QAOA solves combinatorial optimization (MaxCut canonical) by encoding cost into a Hamiltonian $H_C$ whose optimal eigenstate is the best solution.
- Ansatz: uniform superposition, then alternate cost layers $e^{-i\gamma H_C}$ ($ZZ$ rotations on edges) and mixer layers $e^{-i\beta H_M}$ (`rx`) for $p$ rounds; $2p$ angles.
- Optimize angles to maximize $\langle H_C\rangle$ (VQE‑style loop), then SAMPLE and score bitstrings — QAOA outputs a distribution peaked on good solutions, not the answer directly.
- Larger $p$ → better approximation but more noise; NISQ caps useful $p$ at ~1–3.
- 2026 reality: no demonstrated advantage over mature classical solvers; depth‑vs‑noise is the barrier. A leading candidate and transferable skill, not a deployed win.
- The valued competence is building it AND assessing it honestly against real classical baselines.

## Check yourself

```quiz
{"q":"A colleague claims their p=1 QAOA 'beat classical MaxCut'. What's the most important question to ask?","options":["How many qubits?","Beat WHAT classical method — brute force (trivial to beat at scale) or a real solver like Goemans-Williamson / simulated annealing? On a useful-sized instance? As of 2026, no QAOA has beaten mature classical solvers on practical problems","What's the gate error rate?","Did you use enough shots?"],"answer":1,"why":"The honest bar is beating a MATURE classical baseline on a relevant instance — not brute force, not nothing. QAOA demos routinely 'work' without approaching advantage. Interrogating the baseline is the literacy test."}
```

## Exercises

**Exercise 1 — bigger graph, and the p sweep.** In the live cell, change `edges` to a 4‑cycle `[(0,1),(1,2),(2,3),(3,0)]` (optimum = 4, bipartite) and `n = 4`. Report the best expected cut and the top bitstrings (the split `0101`/`1010` should dominate). Then add a second QAOA round ($p=2$: a second `gamma`/`beta` pair) and confirm the expected cut climbs toward 4.

````solution
```python
# 4-cycle: p=1 expected cut ~3 (ratio 0.75), best sampled = 4 with high probability;
# p=2 raises the expected value toward 4. Deeper p = better approximation, more gates
# (and on real hardware, past a point, more noise than the added depth is worth).
```
The expected value is the *average* quality; the best of many samples is what you keep. The gap between them, and how $p$ shrinks it, is the whole story of "Approximate" in QAOA.
````

**Exercise 2 — the honest benchmark.** For a 10‑vertex random graph, compare QAOA $p=1$ (simulated) against (a) brute force ($2^{10}=1024$, feasible) and (b) a classical local search with random restarts, on both best‑cut‑found and wall‑clock. Write the two‑paragraph honest conclusion you'd put in a report.

````solution
```python
# brute force finds the optimum in ~ms; local search matches it in ~ms; QAOA p=1
# simulated finds a near-optimal cut (ratio ~0.8-0.95) in seconds of classical
# simulation and would need a real QPU for any speed benefit -- absent at this size.
```
Conclusion: at demonstrable sizes, trivial classical methods match or beat QAOA in wall‑clock; at sizes where classical methods struggle, QAOA needs qubits/depth beyond NISQ, and no published result beats mature solvers on practical instances. QAOA is a research‑stage algorithm and a valuable encoding skill — not a current optimization advantage. That paragraph, backed by your own numbers, is a credible technical assessment.
````

## Practice questions

1. How is a MaxCut instance encoded into a cost Hamiltonian? What do the qubits and $Z$ operators represent?
2. What are the roles of the cost and mixer layers, and why does QAOA fail without the mixer?
3. Why do you SAMPLE and score bitstrings rather than reading the expectation value as the answer?
4. Explain the depth‑vs‑noise ceiling on $p$.
5. What is an approximation ratio, and why does the best‑sampled solution often beat the expected value?
6. A demo claims QAOA advantage by beating brute‑force search. Why is this not meaningful?
7. **Design question:** a client has a 500‑variable portfolio‑optimization problem. Assess QAOA's applicability: the encoding path, qubit/depth requirements vs NISQ reality, the honest recommendation, and one constructive alternative. What would make you reconsider in 5 years?

````solution
1. One qubit per vertex ($0/1$ = group); $Z_i$ reads vertex $i$'s group as $\pm1$; edge terms $(1-Z_iZ_j)/2$ count cut edges, so the Hamiltonian's max eigenstate is the best cut.
2. Cost phases each cut by quality (writes the objective into phases); mixer drives transitions so amplitude flows toward good cuts. Without the mixer, phased amplitudes never redistribute — you'd measure the uniform distribution.
3. QAOA prepares a distribution peaked on good solutions; the expectation is the average quality (the optimization target), while the solution is the best measured bitstring, verified classically.
4. Larger $p$ improves approximation but adds two‑qubit gates each round; past a noise threshold the added noise outweighs the added expressibility, capping useful $p$ at ~1–3.
5. Ratio = achieved/optimum, reflecting the *expected* cut; sampling many times and keeping the best exploits the distribution's tail — the optimum often appears with decent probability even when the mean is below it.
6. Brute force is trivially beatable at scale and irrelevant as a baseline; meaningful advantage means beating mature solvers on practically‑sized instances — a bar QAOA hasn't cleared.
7. Encode portfolio selection as a QUBO (binary asset choices, return linear, risk quadratic $ZZ$, constraints as penalties) → Ising. Requirements: 500+ well‑connected qubits with deep circuits and heavy routing — beyond reliable NISQ; no demonstrated advantage even at feasible sizes. Recommendation: not near‑term; don't pitch as production advantage; offer a research pilot or quantum‑inspired classical methods. Reconsider IF fault‑tolerant/high‑fidelity hardware reaches ~1000+ connected qubits AND a published benchmark beats the client's classical baseline — name those two triggers, not vague optimism.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Encode a MaxCut instance as a cost Hamiltonian and say what qubits and $Z$'s represent.
- ☐ Explain the cost layer and mixer layer, and why the mixer is essential.
- ☐ Run the live QAOA cell, read the approximation ratio, and find the best cut by sampling.
- ☐ Explain why the best sampled bitstring beats the expected value, and how $p$ changes both.
- ☐ State the depth‑vs‑noise ceiling and the NISQ sweet spot for $p$.
- ☐ Give the honest 2026 assessment vs mature classical solvers — mechanism and sobriety together.
