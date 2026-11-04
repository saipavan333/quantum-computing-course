# Hamiltonian simulation & Trotterization

## The simple version

**In plain English.** Hamiltonian simulation means using a quantum computer to imitate how a physical system, like a molecule or a magnet, changes over time. The rule for that change is called the Hamiltonian, H. You can't build e^(−iHt) as one gate, but you can build its simple pieces. Trotterization slices the time into r thin steps and alternates the pieces in each step. More steps mean a smaller error but more gates, and on real hardware more gates mean more noise.

**The everyday picture: walking diagonally across a city grid.**

| In the picture | In the real thing |
|---|---|
| The straight diagonal line you want | The exact evolution e^(−iHt) |
| Streets that only go east or north | The pieces you can build: e^(−iA·dt) and e^(−iB·dt) |
| Zig-zagging one block east, one block north | One Trotter step |
| Smaller blocks hug the diagonal better | More steps r: smaller error |
| More corners to turn | More gates, so more hardware noise |

**Where the picture breaks.** On a grid, east-then-north lands at the same corner as north-then-east. Quantum pieces that don't commute land in slightly different places depending on the order, and that mismatch is exactly the Trotter error. The second-order trick (half a step of A, a full step of B, half a step of A) cancels the biggest part of it, which a zig-zag walk can't do.

@@diagram:p2-hamsim|The exact evolution compared with 1, 4 and 8 rounds of alternating slices. Doubling the slices halves the first-order error and quarters the second-order error.

@@viz:trotter-error

## Going deeper

Simulating how a quantum system changes over time is the job quantum computers were first proposed for, and it is still the application most experts expect to pay off first. Chemistry, materials and magnets all come down to one operation: apply $e^{-iHt}$ to a state, where $H$ is the system's Hamiltonian (its energy operator). This lesson shows how to turn that one smooth evolution into a circuit of ordinary gates (Trotterization), how big the error is, what it costs in CNOTs, and why noise sets a hard limit on how far you can push it today. It also places the task in complexity terms (BQP) and introduces the language for noise you need at the same time (quantum channels).

## Start here — the intuition

A Hamiltonian is a sum of simple pieces, for example a magnet's $H = J\sum Z_iZ_{i+1} + h\sum X_i$: neighbors want to align (the $ZZ$ terms) and a sideways field wants to flip them (the $X$ terms). Each piece on its own is easy to turn into gates. The trouble is that the pieces don't commute, so $e^{-i(A+B)t} \ne e^{-iAt}e^{-iBt}$. The fix is to slice time thinly: do a little of $A$, a little of $B$, and repeat. The thinner the slices, the closer you get to the real evolution, and you pay for every slice in gates.

> **School-kid analogy.** On a tightrope you can't lean and step at the same instant, so you alternate tiny leans and tiny steps. Big chunks ("lean a lot, then walk a lot") send you off the rope; tiny alternating slices trace the smooth path you wanted. Order matters because leaning changes where your next step lands: the two moves don't commute.

## The problem, and why it matters

Given $H$ on $n$ qubits and a time $t$, prepare $e^{-iHt}\ket{\psi_0}$ and measure something (magnetization, energy, a correlation). Classically you store $2^n$ amplitudes, so exact simulation stops in the 30s (Module 1's RAM table). Feynman suggested in 1982 using quantum hardware for this, and Lloyd (1996) showed that any *local* Hamiltonian (a sum of terms each acting on a few qubits) can be simulated efficiently on a quantum computer. That puts the problem in **BQP**: the class of problems a quantum computer solves in polynomial time with bounded error probability (say at most 1/3, which repetition shrinks).

Be precise about what that does and doesn't say. In BQP means quantum can do it efficiently. It does **not** prove classical computers can't: nobody has proved BQP ≠ BPP (BPP is the classical counterpart). The case for quantum advantage in simulation rests on decades of failing to find efficient general classical methods, plus strong complexity evidence. That is why each "advantage" claim gets attacked with better classical algorithms, and why some of those attacks succeed (worked example below).

## Trotter–Suzuki — the formulas and their errors

Split $H = A + B$ (here $A$ = the $X$ terms, $B$ = the $ZZ$ terms). With $r$ steps of size $dt = t/r$:

- **First order (Lie–Trotter):** $e^{-iHt} \approx \left(e^{-iA\,dt}e^{-iB\,dt}\right)^r$, error $O\!\left(\tfrac{t^2}{r}\,\|[A,B]\|\right)$. Double $r$, halve the error.
- **Second order (symmetric Suzuki):** $e^{-iHt} \approx \left(e^{-iA\,dt/2}e^{-iB\,dt}e^{-iA\,dt/2}\right)^r$, error $O\!\left(\tfrac{t^3}{r^2}\right)$. Double $r$, quarter the error, for almost the same gates (the trailing half‑step merges with the next step's leading one).
- **The commutator is the whole story.** If $[A,B] = 0$ the splitting is exact. Error comes only from non‑commutation, which is why careful bounds are written in terms of nested commutators (Childs et al. 2021).

Each piece becomes gates directly: $e^{-i\theta X} = R_x(2\theta)$, and $e^{-i\theta Z_aZ_b} = \text{CX}_{ab}\,R_z(2\theta)_b\,\text{CX}_{ab}$. The CNOT pair writes the parity $a \oplus b$ onto qubit $b$, $R_z$ phases that parity, and the second CNOT undoes the bookkeeping. So one first‑order step of an $n$‑qubit chain costs $2(n-1)$ CNOTs.

@@diagram:trotter-step|One first-order Trotter step: single-qubit X rotations, then a ZZ interaction (CX–Rz–CX) on each neighboring pair. Repeat r times with dt = t/r; the error shrinks like 1/r while the CNOT count grows like r.

## Predict, then run — watch the error shrink

The cell evolves a 3‑qubit transverse‑field Ising chain from $\ket{000}$ for $t = 1$ and compares Trotter circuits (built from the course simulator's own gates) with the exact $e^{-iHt}$ computed from the eigenvalues of $H$.

**Predict first.** When $r$ doubles, by what factor should the first‑order error shrink? The second‑order error? Guess, then Run.

```run
# expect: 2nd order x4.0
# Live cell: Trotterize a 3-qubit transverse-field Ising chain and compare to the exact answer.
import numpy as np
n, J, h, t = 3, 1.0, 0.8, 1.0          # H = J*(Z0Z1 + Z1Z2) + h*(X0 + X1 + X2), evolve for time t

# exact answer: build H as a matrix and exponentiate it via its eigenvalues
I2 = np.eye(2); X = np.array([[0, 1], [1, 0]]); Z = np.diag([1, -1])
def op(single, q):                     # put a 1-qubit matrix on qubit q of n
    out = np.array([[1.0]])
    for k in reversed(range(n)):       # qsim is little-endian: qubit 0 is the rightmost factor
        out = np.kron(out, single if k == q else I2)
    return out
H = sum(J * op(Z, q) @ op(Z, q + 1) for q in range(n - 1)) + sum(h * op(X, q) for q in range(n))
E, V = np.linalg.eigh(H)
psi0 = np.zeros(2**n); psi0[0] = 1.0
exact = V @ (np.exp(-1j * E * t) * (V.conj().T @ psi0))

def zz(qc, theta, a, b):               # exp(-i*theta*Z_a Z_b) = CX, Rz(2*theta) on target, CX
    qc.cx(a, b); qc.rz(2 * theta, b); qc.cx(a, b)

def trotter(r, order):
    dt = t / r
    qc = QuantumCircuit(n)
    for _ in range(r):
        if order == 1:                 # e^{-iA dt} e^{-iB dt}
            for q in range(n): qc.rx(2 * h * dt, q)
            for q in range(n - 1): zz(qc, J * dt, q, q + 1)
        else:                          # e^{-iA dt/2} e^{-iB dt} e^{-iA dt/2}
            for q in range(n): qc.rx(h * dt, q)
            for q in range(n - 1): zz(qc, J * dt, q, q + 1)
            for q in range(n): qc.rx(h * dt, q)
    return qc.statevector()

print(" r   CNOTs   1st-order error   2nd-order error")
prev = None
for r in (1, 2, 4, 8, 16):
    e1 = np.linalg.norm(trotter(r, 1) - exact)
    e2 = np.linalg.norm(trotter(r, 2) - exact)
    print(f"{r:2d}   {2 * (n - 1) * r:5d}   {e1:15.5f}   {e2:15.6f}")
    if prev: ratios = (prev[0] / e1, prev[1] / e2)
    prev = (e1, e2)
print(f"\nerror shrink when r doubles: 1st order x{ratios[0]:.2f}, 2nd order x{ratios[1]:.2f}")
```

**What to look for.** Both columns shrink toward zero, which also proves the gate recipe is right. First order shrinks ×2.01 per doubling and second order ×4.02, exactly the $1/r$ and $1/r^2$ laws. At $r = 16$, second order is about 30× more accurate than first order for the same 64 CNOTs. That is why production codes default to second order or higher.

## Level up — the real trade-off: Trotter error vs hardware noise

More steps mean less Trotter error but more gates, and on real hardware every gate adds noise. The precise language for "noise acting on a state" is a **quantum channel**: a map on density matrices $\rho$ (Module 9's description of a possibly mixed state), $\mathcal E(\rho) = \sum_k K_k\,\rho\,K_k^\dagger$, where the **Kraus operators** satisfy $\sum_k K_k^\dagger K_k = I$. A unitary gate is the one‑Kraus‑operator special case. The single‑qubit depolarizing channel $\mathcal E(\rho) = (1-p)\,\rho + p\,\tfrac{I}{2}$ is the standard worst‑case noise model, and it is what a "1% error per gate" figure usually means. Papers on noise, mitigation and QEC are all written in this language.

The cell below uses a deliberately crude model: each CNOT independently "succeeds" with probability $1-p$, so the noisy fidelity is roughly the Trotter fidelity times $(1-p)^{\#\text{CNOT}}$. It is a toy, used because it makes the optimum visible in ten lines; a real study would simulate the channel on $\rho$.

```run
# expect: sweet spot: r = 2
# Live cell: more Trotter steps cut Trotter error but add gate noise. Where is the sweet spot?
# Toy noise model (said plainly): every CNOT independently succeeds with probability 1 - p.
import numpy as np
n, J, h, t = 3, 1.0, 0.8, 1.0
I2 = np.eye(2); X = np.array([[0, 1], [1, 0]]); Z = np.diag([1, -1])
def op(single, q):
    out = np.array([[1.0]])
    for k in reversed(range(n)):
        out = np.kron(out, single if k == q else I2)
    return out
H = sum(J * op(Z, q) @ op(Z, q + 1) for q in range(n - 1)) + sum(h * op(X, q) for q in range(n))
E, V = np.linalg.eigh(H)
psi0 = np.zeros(2**n); psi0[0] = 1.0
exact = V @ (np.exp(-1j * E * t) * (V.conj().T @ psi0))

def trotter1(r):
    dt = t / r; qc = QuantumCircuit(n)
    for _ in range(r):
        for q in range(n): qc.rx(2 * h * dt, q)
        for q in range(n - 1):
            qc.cx(q, q + 1); qc.rz(2 * J * dt, q + 1); qc.cx(q, q + 1)
    return qc.statevector()

p = 0.01                                # 1% CNOT error, a deliberately noisy device
best = None
print(" r   Trotter fidelity   noise factor   total")
for r in (1, 2, 4, 8, 16, 32):
    f_trot = abs(np.vdot(exact, trotter1(r)))**2
    f_noise = (1 - p) ** (2 * (n - 1) * r)
    total = f_trot * f_noise
    print(f"{r:2d}   {f_trot:16.4f}   {f_noise:12.4f}   {total:.4f}")
    if best is None or total > best[1]: best = (r, total)
print(f"\nsweet spot: r = {best[0]}  (total fidelity {best[1]:.3f})")

# Real scale: a 100-qubit chain has 99 ZZ terms -> 198 CNOTs per first-order step.
steps = np.log(0.5) / (198 * np.log(1 - 2e-3))
print(f"100-qubit chain at 99.8% CNOT fidelity: fidelity falls below 0.5 after ~{steps:.1f} Trotter steps")
```

**What to look for.** Total fidelity peaks at $r = 2$ (about 0.84) and then *falls* as you add steps: noise beats accuracy. The last line is the real‑scale sobering point: a 100‑qubit chain at 99.8% CNOT fidelity drops below 50% fidelity after fewer than two first‑order steps. That is why every serious hardware demonstration leans on error mitigation (Module 9) and on layouts that use fewer CNOTs per interaction.

## Worked example — reading a utility claim at 127 qubits

In 2023 IBM ran a Trotterized "kicked Ising" model (single‑qubit X rotations plus ZZ interactions, this lesson's step) on the 127‑qubit Eagle processor *ibm_kyiv*, and measured magnetizations with error mitigation (probabilistic error cancellation and zero‑noise extrapolation) in a regime the authors said was beyond brute‑force classical simulation (Kim et al., *Nature* 618, 500, 2023). Walk it like a senior engineer:

1. **What was simulated?** A 2D transverse‑field Ising model on the heavy‑hex lattice. The ZZ angle was chosen so each interaction needs one CNOT, and each qubit has at most three neighbors, so a full step runs in three parallel CNOT layers. That is this lesson's gate‑budget arithmetic, optimized.
2. **What was claimed?** Accurate *expectation values* beyond brute‑force classical methods, called "utility". Not a proven speedup, and the authors said so.
3. **What happened next?** Classical groups soon reproduced the observables with approximate methods. Begušić, Gray and Chan, for example, used sparse Pauli dynamics and tensor networks (arXiv:2308.05077) and reported results orders of magnitude faster than the experiment.
4. **The lesson.** "Beyond brute force" is not "beyond all classical methods". The BQP‑vs‑classical gap is a belief backed by evidence, not a theorem, so each concrete claim gets stress‑tested. Google's 2025 Quantum Echoes result (Module 0) was built to be *verifiable* partly for this reason.

## Level up — beyond Trotter

Trotter is simple and needs no extra qubits, but its cost grows polynomially in $1/\varepsilon$. Fault‑tolerant‑era methods do better: **qubitization** and quantum signal processing (Low & Chuang 2019) reach near‑optimal cost, with logarithmic dependence on $1/\varepsilon$, using a "block encoding" of $H$ and some ancilla qubits. These are what chemistry resource estimates assume today. For now, know the name, what it buys (precision cheaply) and what it costs (ancillas, and deeper circuits that need error correction).

## Level up — gotchas the pros watch for

- **Counting $r$ but not CNOTs.** The cost is CNOTs × steps; two Hamiltonians with the same $r$ can differ 10× in hardware cost because of connectivity.
- **Trusting the worst‑case bound.** Textbook bounds are loose; real Trotter error for a given state is often much smaller (Childs et al. 2021). Measure it on a small instance, as the live cell does.
- **Forgetting the ordering choice.** Grouping commuting terms, and which group sits in the middle of a second‑order step, changes the error constant.
- **Calling a demo an advantage.** Ask whether the observable is classically hard for *all* known methods, not just state‑vector simulation.

## Key points

- Hamiltonian simulation = applying $e^{-iHt}$. Local Hamiltonians can be simulated efficiently on a quantum computer (Lloyd 1996), so the problem is in BQP; classical hardness is believed, not proven.
- First‑order Trotter error scales like $t^2/r$ (halves when $r$ doubles); second order like $t^3/r^2$ (quarters), at nearly the same gate cost.
- Gate recipe: $e^{-i\theta X} = R_x(2\theta)$; $e^{-i\theta ZZ} = \text{CX}\,R_z(2\theta)\,\text{CX}$. An $n$‑qubit chain costs $2(n-1)$ CNOTs per step.
- Error comes only from non‑commuting terms; commuting pieces split exactly.
- Noise is described by channels $\rho \mapsto \sum K\rho K^\dagger$. More steps mean less Trotter error but more noise, so there is an optimal $r$; at 99.8% gate fidelity, deep circuits on 100 qubits need mitigation.
- Utility claims (IBM 2023) were partly matched by classical methods, which is why verifiable experiments and honest framing matter.

## Check yourself

```quiz
{"q": "You double the number of Trotter steps r in a SECOND-order formula. Roughly what happens to the approximation error?", "options": ["It halves", "It quarters", "It stays the same", "It doubles"], "answer": 1, "why": "Second-order (symmetric) Trotter error scales like 1/r², so doubling r divides it by about 4 — the live cell shows ×4.02. 'Halves' is the first-order law (1/r). 'Stays the same' would only happen if the terms commuted (then the error is zero at any r). 'Doubles' confuses the error with the gate cost, which is what doubles."}
```

```quiz
{"q": "Which statement about Hamiltonian simulation and BQP is correct?", "options": ["It is proven that no classical computer can simulate local Hamiltonians efficiently", "Local Hamiltonian simulation is in BQP; classical hardness is strongly believed but unproven", "Hamiltonian simulation is easy classically, so it is not a quantum application", "It is only in BQP when the Hamiltonian's terms commute"], "answer": 1, "why": "Lloyd (1996) showed efficient quantum simulation, so the problem is in BQP. Nobody has proved BQP ≠ BPP, so 'proven classically impossible' overstates it — which is why IBM's 2023 experiment could be partly matched classically. It is not classically easy in general (exact simulation needs 2ⁿ amplitudes and no general efficient method is known). Commuting terms make simulation trivial; they are not a requirement."}
```

```quiz
{"q": "A 50-qubit chain Trotter step costs 2(n−1) CNOTs. At 99.8% CNOT fidelity, roughly how many first-order steps before fidelity drops below 0.5 (toy model)?", "options": ["About 3.5", "About 35", "About 350", "About 0.35"], "answer": 0, "why": "98 CNOTs per step: solve 0.998^(98k) = 0.5, so k = ln 0.5 / (98 · ln 0.998) ≈ 3.5. 35 and 350 forget that every step multiplies in 98 noisy gates. 0.35 would mean the first step alone fails, which needs a much worse gate. The point: without mitigation, only shallow circuits work today."}
```

## Exercises

**Exercise 1 — warm-up: bound vs reality.** Change `t` from 1.0 to 2.0 in the first live cell and rerun. The worst‑case bound $t^2/r$ allows the $r = 16$ first‑order error to grow about 4×. Does it? And does the ×2‑per‑doubling law still hold at large $r$?

````solution
Measured: the $r = 16$ error goes from about 0.053 to about 0.066, only ~1.3×, far below the 4× the bound allows. The $t^2/r$ formula is a *worst‑case bound* over all states. The actual error for this initial state is much smaller (gotcha 2 below, and the point of Childs et al. 2021). The ×2‑per‑doubling law does hold once $r$ is large (0.142 → 0.066 from $r = 8$ to $16$), but at $r = 1, 2$ the steps are so coarse that the error has saturated near its maximum. Practical reading: a bound gives you a safe $r$; measuring on a small instance gives you the $r$ you actually need, often far fewer steps.
````

**Exercise 2 — transfer: a new Hamiltonian.** Add a $YY$ coupling, $H = J\sum (Z_iZ_{i+1} + Y_iY_{i+1}) + h\sum X_i$. Build $e^{-i\theta YY}$ by rotating $Y$ into $Z$ with $R_x$ gates around the existing `zz` helper, rebuild `H` with a `Y` matrix, and confirm the first‑order error still halves when $r$ doubles.

````solution
```python
Y = np.array([[0, -1j], [1j, 0]])
H = sum(J * (op(Z, q) @ op(Z, q + 1) + op(Y, q) @ op(Y, q + 1)) for q in range(n - 1)) \
    + sum(h * op(X, q) for q in range(n))
def yy(qc, theta, a, b):
    qc.rx(np.pi / 2, a); qc.rx(np.pi / 2, b)     # rotate Y into Z
    zz(qc, theta, a, b)
    qc.rx(-np.pi / 2, a); qc.rx(-np.pi / 2, b)   # rotate back
# inside each step, after the ZZ loop:  for q in range(n - 1): yy(qc, J * dt, q, q + 1)
```

$R_x(\pm\pi/2)$ conjugation maps $Y$ to $\pm Z$, so a $ZZ$ rotation in the rotated frame is a $YY$ rotation in the original one. Either rotation direction works here, because the sign appears on both qubits and cancels in $Y \otimes Y$ (try it). The error halves per doubling again. Self‑test: delete the rotate‑back line and the error stops converging (it sits near 1.5 for every $r$), because you are no longer simulating $H$. Each step now costs $4(n-1)$ CNOTs, so the noise sweet spot moves to smaller $r$.
````

**Exercise 3 — stretch: find the optimum analytically.** In the toy model, total infidelity $\approx c/r^2 + k\,p\,r$ for first order (Trotter amplitude error $\sim 1/r$ gives infidelity $\sim 1/r^2$; $k = 2(n-1)$ CNOTs per step). Minimize over $r$ and check against the second live cell.

````solution
$\frac{d}{dr}\left(\frac{c}{r^2} + kpr\right) = -\frac{2c}{r^3} + kp = 0 \Rightarrow r^* = \left(\frac{2c}{kp}\right)^{1/3}$. From the cell, $1 - F_{\text{trot}} \approx 0.022$ at $r = 4$, so $c \approx 0.35$. With $k = 4$, $p = 0.01$: $r^* = (0.7/0.04)^{1/3} \approx 2.6$, between the cell's two best values ($r = 2$ and $r = 4$, both about 0.83). The cube‑root law says the optimum moves slowly with noise: 8× better gates only double the useful $r$.
````

## Practice questions

1. Write $e^{-i(A+B)t}$ to first order in Trotter steps and state the error scaling.
2. Why is the splitting exact when $[A, B] = 0$?
3. Give the gate sequence for $e^{-i\theta Z_0Z_1}$ and say what each gate does.
4. How many CNOTs does one first‑order step of a 20‑qubit Ising chain need?
5. Define BQP in one sentence, and say what "in BQP" does *not* imply.
6. Write the depolarizing channel, and its Kraus form at $p = 0$.
7. **Design question:** you have a 99.5% CNOT device and want the magnetization at $t = 3$ for a 12‑qubit chain. Outline how you would choose the formula order and $r$, and what you would verify classically first.

````solution
1. $\left(e^{-iA t/r}e^{-iB t/r}\right)^r$, error $O(t^2\|[A,B]\|/r)$.
2. If $A$ and $B$ commute, $e^{-i(A+B)t} = e^{-iAt}e^{-iBt}$ exactly (the correction terms in the Baker–Campbell–Hausdorff expansion are all commutators, so they vanish).
3. CX(0→1) writes the parity onto qubit 1; $R_z(2\theta)$ on qubit 1 applies $e^{\mp i\theta}$ by parity; CX(0→1) restores qubit 1.
4. $2 \times 19 = 38$.
5. Problems a quantum computer solves in polynomial time with error at most 1/3. It does not imply classical computers can't solve them efficiently (BQP vs BPP is open).
6. $\mathcal E(\rho) = (1-p)\rho + p\,I/2$; at $p = 0$ there is one Kraus operator, $K = I$ (no noise).
7. Second order (better accuracy per CNOT); estimate $r$ from the error‑vs‑noise trade‑off (Exercise 3) with $p = 0.005$, $k = 22$. Verify on 12 qubits classically first: $2^{12}$ amplitudes is trivial, so compute the exact answer and the noiseless Trotter answer to separate Trotter error from hardware error. Then run with mitigation (ZNE) and report error bars.
````

## Interview questions

1. **(junior)** What is Trotterization and why is it needed?
2. **(mid)** Your first‑order simulation is too inaccurate and you can't afford more steps. What are your options?
3. **(senior)** A vendor claims quantum advantage for a 100‑qubit dynamics simulation. What do you ask?

````solution
1. A Hamiltonian is a sum of non‑commuting terms, so $e^{-iHt}$ can't be applied one term at a time exactly. Trotterization slices time into $r$ small steps and applies each term's exponential for one slice; each is a short gate sequence. The error shrinks as $r$ grows, so you trade gates for accuracy.
2. Switch to second order (error falls like $1/r^2$ at almost the same cost); reorder or group terms to shrink the commutator constant; use a layout where each interaction needs fewer CNOTs; measure the actual Trotter error on a small instance, since worst‑case bounds overestimate it. In the fault‑tolerant era, use qubitization or QSP.
3. Is the observable hard for *all* known classical methods (tensor networks, Pauli propagation), not just brute force? What is the error budget, split into Trotter error, hardware noise and mitigation bias? Can the result be verified (repeated, or checked against a classically solvable limit)? What are the depth and CNOT count, and do they fit the device's fidelity? Has an independent classical group tried to reproduce it? The 2023 IBM utility experiment is the case study: real progress, partly matched classically soon after.
````

## Sources

- S. Lloyd, "Universal Quantum Simulators", *Science* 273, 1073–1078 (1996), doi:10.1126/science.273.5278.1073
- A. M. Childs, Y. Su, M. C. Tran, N. Wiebe, S. Zhu, "A Theory of Trotter Error", *Phys. Rev. X* 11, 011020 (2021), arXiv:1912.08854
- Y. Kim et al., "Evidence for the utility of quantum computing before fault tolerance", *Nature* 618, 500–505 (2023), doi:10.1038/s41586-023-06096-3
- T. Begušić, J. Gray, G. K.‑L. Chan, classical simulation of the 127‑qubit kicked‑Ising experiment, arXiv:2308.05077
- G. H. Low and I. L. Chuang, "Hamiltonian Simulation by Qubitization", *Quantum* 3, 163 (2019), doi:10.22331/q-2019-07-12-163
- M. A. Nielsen and I. L. Chuang, *Quantum Computation and Quantum Information*, 10th anniversary ed., Cambridge University Press (2010): quantum simulation, the class BQP, and quantum operations (Kraus operators)

## Mastery checklist — you are ready to move on when you can

- ☐ Write first‑ and second‑order Trotter formulas and state how each error scales with $r$ and $t$.
- ☐ Compile $e^{-i\theta ZZ}$ and $e^{-i\theta X}$ into gates and count CNOTs per step.
- ☐ Run the live cell and explain the ×2 and ×4 shrink factors.
- ☐ Say what "in BQP" means and what it does not prove.
- ☐ Write a channel in Kraus form and explain why noise creates an optimal step count.
- ☐ Critique a utility or advantage claim using the 2023 IBM case.

## In one line

To simulate nature, slice time into small steps of buildable pieces; more slices are more accurate but cost more gates.
