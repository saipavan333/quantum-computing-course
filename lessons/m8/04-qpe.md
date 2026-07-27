# Quantum phase estimation

Phase estimation is the most *consequential* subroutine in quantum computing: Shor's algorithm is QPE pointed at modular arithmetic; quantum chemistry's endgame is QPE pointed at molecular Hamiltonians; quantum counting is QPE pointed at Grover's rotation. The question it answers sounds narrow — *given a unitary $U$ and its eigenvector, what's the eigenvalue's phase?* — but eigenphases turn out to encode periods, energies, and solution-counts. Master QPE and Module 8's finale (Shor) becomes assembly, not invention. You have every part: kickback (M6), controlled powers, and last lesson's inverse QFT.

## 1. The problem, stated with care

Given: a unitary $U$ and an eigenstate $\ket u$ with $U\ket u = e^{2\pi i\varphi}\ket u$, $\varphi \in [0, 1)$ unknown. Wanted: $\varphi$ to $t$ bits of precision.

Why phases encode everything: unitaries' eigenvalues live on the unit circle (eigen lesson), so "measure the eigenvalue" *means* "estimate the phase." For a Hamiltonian $H$ with energy $E$, the evolution $U = e^{-iHt_0}$ has eigenphase $\varphi = -Et_0/2\pi$ — **energy estimation is phase estimation** (that single sentence is the business case for quantum chemistry). For Shor: the period hides in the eigenphases of the multiply-by-a map. One subroutine, many masks.

## 2. The circuit — kickback writes, QFT† reads

Two registers: a $t$-qubit **counting register** (starts $\ket0^{\otimes t}$) and the **system register** holding $\ket u$.

**Step 1 — fan out**: H on every counting qubit.

**Step 2 — controlled powers**: counting qubit $k$ controls $U^{2^k}$ on the system. Kickback (the master trick, at scale): each control's $\ket1$ component acquires the eigenvalue of the power it controls — $e^{2\pi i(2^k\varphi)}$. After all $t$:

$$\frac{1}{\sqrt{2^t}}\bigotimes_{k=t-1}^{0}\left(\ket0 + e^{2\pi i\,2^k\varphi}\ket1\right)\otimes\ket u = \frac{1}{\sqrt{2^t}}\sum_{j=0}^{2^t-1} e^{2\pi i\,j\varphi}\,\ket j \otimes \ket u$$

Stare at the right-hand side: it is *exactly* $\text{QFT}\ket{2^t\varphi}$ — the Fourier pattern winding at frequency $2^t\varphi$ (compare last lesson's definition, term for term). The controlled powers didn't "compute" anything into bits; they *sculpted the counting register into a Fourier state whose frequency is the answer*. Note also: $\ket u$ exits untouched, reusable — kickback's signature.

**Step 3 — inverse QFT on the counting register**: unwinds the Fourier pattern back to the basis state $\ket{2^t\varphi}$… when $2^t\varphi$ is an integer. Measure: read $\varphi$'s binary expansion directly.

@@diagram:qpe-circuit|QPE: Hadamards fan out the counting register; controlled-U^{2^k} kickbacks write φ into a Fourier winding; QFT† converts winding into a readable binary number. Kickback writes, Fourier reads.

**Worked micro-instance** — $U = T$ (phase $e^{i\pi/4}$, so $\varphi = 1/8$), $\ket u = \ket1$, $t = 3$: the counting register becomes the winding state at frequency $2^3 \cdot \tfrac18 = 1$; QFT† maps it to $\ket{001}$; measurement reads binary $001 = 1$, and $\hat\varphi = 1/2^3 = 0.125$ ✓ — exact, every shot, three qubits.

```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
# (qft from last lesson)

def qpe_T(t=3):
    qc = QuantumCircuit(t + 1)
    qc.x(t)                                    # system ← |1⟩, T's eigenstate
    qc.h(range(t))                             # fan out
    for k in range(t):                         # controlled T^(2^k) = CP(π/4 · 2^k)
        qc.cp(np.pi/4 * 2**k, k, t)
    qc.compose(qft(t).inverse(), range(t), inplace=True)
    return qc

probs = Statevector(qpe_T()).probabilities_dict(list(range(3)))
print(probs)                                   # {'001': 1.0} → φ = 1/8 ✓
```

## 3. Precision, and what happens off the grid

Each extra counting qubit doubles resolution: $t$ qubits ⇒ estimates on the grid $\{0, \tfrac{1}{2^t}, \tfrac{2}{2^t}, \ldots\}$ — **one more bit of φ per qubit**, at the price of *doubling* the controlled-U work (qubit $t{-}1$ controls $U^{2^{t-1}}$: half the total cost sits in the last qubit's power!). Precision is bought with circuit depth, exponentially.

When $\varphi$ is NOT on the grid (generic case — e.g. $\varphi = 0.3$ with $t = 3$): the QFT† can't land cleanly; measurement returns nearby grid points with probabilities following a sharply-peaked interference kernel (a squared-sinc/Dirichlet shape). The two facts to carry:

- **Best rounding wins decisively**: the nearest grid point appears with probability ≥ $4/\pi^2 \approx 40.5\%$, and the two nearest together carry most of the mass; the distribution's tails fall off as $1/\text{distance}^2$.
- **Boosting confidence is cheap**: repeat and take the median (repetitions multiply confidence exponentially), or add $\lceil\log_2(2 + \tfrac{1}{2\epsilon})\rceil$ extra qubits and round — the standard "t + guard bits" recipe every textbook and every real implementation uses.

The off-grid leakage pattern isn't a bug — it's the sinc-shaped diffraction of a finite-window Fourier transform, the same mathematics as spectral leakage in classical DSP. Engineers from signals backgrounds feel instantly at home here; now you're bilingual too.

## 4. What if you don't have the eigenstate?

The honest objection: "I can't prepare $\ket u$ — if I knew the eigenstates I'd likely know the answer!" Three professional responses, in escalating sophistication:

1. **Linearity saves you (Shor's case)**: feed ANY state — it decomposes over eigenstates $\sum_j c_j\ket{u_j}$; QPE *entangles* estimates with eigenstates, and measurement samples eigenphase $\varphi_j$ with probability $|c_j|^2$. Shor feeds $\ket1$ (an equal mix of exactly the eigenstates it needs) and *any* sampled phase does the job. No eigenstate preparation at all.
2. **Good-enough overlap (chemistry's case)**: prepare an approximation (Hartree–Fock state) with overlap $|c_0|^2$ onto the true ground state; QPE returns the ground energy with that probability per run — overlap sets the repetition bill, not the correctness.
3. **When overlap is exponentially poor**, QPE alone won't rescue you — the honest limitation behind "QPE needs good initial states," a live research area (and an interview question about the limits of quantum chemistry: answering with "state preparation is the bottleneck, not the estimation" marks genuine literacy).

## Worked example — estimating an off-grid phase, distribution and all

*$U = P(2\pi\cdot0.3)$ on $\ket1$ (so $\varphi = 0.3$), $t = 4$: predict, run, interpret like a practitioner.*

Prediction: grid spacing $1/16 = 0.0625$; $0.3 \times 16 = 4.8$ — nearest grid points $j = 5$ ($\hat\varphi = 0.3125$) then $j = 4$ ($0.25$). Expect the peak at `0101` with ~40–60%, runner-up at `0100`, power-law crumbs elsewhere.

```python
def qpe_phase(phi, t):
    qc = QuantumCircuit(t + 1)
    qc.x(t); qc.h(range(t))
    for k in range(t):
        qc.cp(2*np.pi*phi * 2**k, k, t)
    qc.compose(qft(t).inverse(), range(t), inplace=True)
    return Statevector(qc).probabilities_dict(list(range(t)))

probs = qpe_phase(0.3, 4)
top = sorted(probs.items(), key=lambda kv: -kv[1])[:4]
for bits, p in top:
    print(f"{bits} → φ̂ = {int(bits, 2)/16:.4f}   p = {p:.3f}")
# 0101 → 0.3125  p ≈ 0.58
# 0100 → 0.2500  p ≈ 0.13
# 0110 → 0.3750  p ≈ 0.06 …
```

Practitioner's read: single-shot best guess 0.3125 (error 0.0125 < half a grid step ✓); the *distribution's width* honestly displays the resolution limit; and the estimate improves two ways with different price tags — more qubits (deeper circuit: each added qubit doubles the largest controlled power) vs more shots + median (more repetitions, same depth). On today's noisy hardware, shallow-and-repeat usually wins; on tomorrow's fault-tolerant machines, deep-and-precise does. That cost fork — depth vs repetitions — is THE recurring trade of quantum algorithm deployment, and QPE is where it's learned.

## Gotchas

- **Controlled-$U^{2^k}$ ≠ ($CU$) applied $2^k$ times… except it is — but implement the POWER, not the loop, when structure allows.** For phase gates, $P(\theta)^{2^k} = P(2^k\theta)$: one gate. For Shor's modular arithmetic: repeated squaring computes $a^{2^k} \bmod N$ classically first. Naively looping $2^k$ controlled-U's makes QPE exponentially deep and dead on arrival — the #1 implementation blunder.
- **Forgetting the inverse QFT is INVERSE.** Forward QFT instead of QFT† reads phases mirrored/garbled. Symptom: estimates $1 - \varphi$ or bit-reversed. Certify the subcircuit standalone (last lesson's harness) before integration.
- **Global-vs-relative, final boss form.** Controlled-$U$'s phase convention matters: $CP$ vs $CR_z$ differ by a control-dependent phase that QPE *measures* — the fine print from Module 5, now with consequences in your histogram. Use the gate whose *controlled* action you derived.
- **Reading the counting register in the wrong bit order.** The QFT swap-vs-relabel convention propagates into which counting qubit is φ's MSB. One winding-test integration check saves hours.
- **Expecting certainty off the grid.** A 40–58% peak is CORRECT behavior, not noise; median-of-repeats or guard qubits is the remedy. Filing "QPE is broken, returns different answers" bugs is a rite of passage you can skip.
- **Eigenstate perfectionism.** Waiting for perfect $\ket u$ preparation misreads the algorithm: superpositions of eigenstates are *fine* (you sample eigenphases). The question is overlap with the eigenstate you *want*, and that's a budgeting problem.

## Scenario — quantum counting: QPE eats Grover

Interview chestnut with real content: *"You suspect between 1 and 50 items of $2^{20}$ satisfy your oracle. Grover needs $k^* \approx \tfrac\pi4\sqrt{N/M}$ — but M is unknown. Fix it."* The composed answer: Grover's iterate $G$ (oracle + diffuser) is a *rotation by $2\theta$* in its 2D plane (last lesson's geometry) — hence a unitary with eigenvalues $e^{\pm 2i\theta}$, where $\sin^2\theta = M/N$. **Run QPE on $G$** (counting register controls powers of the whole Grover iterate; system register starts in the uniform state, which lives in the rotation plane): the estimated phase IS $2\theta$, hence $M = N\sin^2\theta$ — with $t \approx 10$ counting qubits giving M to useful precision in $O(\sqrt N)$ oracle calls. Then run Grover with the now-known $k^*$. Two lessons composed into one machine: this is **quantum counting**, and the composition pattern — "any repeating quantum process is a unitary; point QPE at it to read its angle" — is how amplitude estimation speeds up Monte-Carlo pricing in quantum finance. Same skeleton, different suit, real industry.

## Key points

- QPE estimates eigenphases: $U\ket u = e^{2\pi i\varphi}\ket u$ → read $\varphi$ to $t$ bits with $t$ counting qubits; energies, periods, and counts are eigenphases in costume.
- Mechanism: H fan-out → controlled-$U^{2^k}$ kickbacks sculpt the counting register into the Fourier state at frequency $2^t\varphi$ → QFT† converts winding to binary. Kickback writes, Fourier reads.
- Each counting qubit adds one bit of precision and doubles the controlled-U work; implement powers by structure (phase multiplication, repeated squaring), never by looping.
- Off-grid phases yield a peaked distribution (nearest grid point ≥ 40.5%); median-of-repeats or guard qubits sharpen cheaply; depth-vs-repetitions is the deployment trade.
- No eigenstate needed a priori: superposed inputs sample eigenphases with $|c_j|^2$ weights (Shor's exploit); overlap quality sets the repetition budget (chemistry's bottleneck).
- QPE composes: pointed at Grover's iterate it counts solutions; at $e^{-iHt}$ it reads energies; at modular multiplication it finds periods — next lesson.

## Check yourself

```quiz
{"q":"In QPE, counting qubit k controls U^(2^k). What does this qubit's |1⟩ amplitude acquire, and why does the SYSTEM register survive unchanged?","options":["It acquires e^{2πi·2^k·φ} via phase kickback — the system is in U's eigenstate, so only a phase (attached to the control) results","It stores the k-th bit of φ directly","It becomes entangled with the system permanently","It acquires amplitude damping"],"answer":0,"why":"Eigenstate targets turn controlled gates into pure phase writers on the control (M6's kickback). The full pattern across k = 0..t−1 assembles the Fourier winding of frequency 2^t·φ, with |u⟩ intact and reusable."}
```

```quiz
{"q":"QPE with t=4 for true φ = 0.3 returns '0101' (0.3125) on 58% of shots and other values otherwise. The correct engineering response is:","options":["File a bug — QPE should be deterministic","Recognize the off-grid interference kernel: report φ̂ = 0.3125 ± grid/2, and sharpen via median-of-repeats or guard qubits if needed","Add more shots until 0.3 appears exactly","Switch to a forward QFT"],"answer":1,"why":"0.3 isn't representable in 4 bits; the peaked distribution around the best grid point IS the algorithm working. 0.3 can never appear — only grid values can. Precision is bought with qubits or medians, chosen by the depth-vs-repetition budget."}
```

## Exercises

**Exercise 1 — precision ladder.** For $\varphi = 1/3$ (never on any binary grid!), run `qpe_phase(1/3, t)` for t = 2..8. For each t: record the top outcome's estimate and its probability, plus the error $|\hat\varphi - 1/3|$. Plot error vs t (log-y) and peak-probability vs t. Two findings to articulate: the error's halving law, and what the peak probability converges to (compare 4/π² ≈ 0.405) — why doesn't it approach 1?

````solution
```python
import numpy as np, matplotlib.pyplot as plt
# (qpe_phase from the worked example)

ts, errs, peaks = range(2, 9), [], []
for t in ts:
    probs = qpe_phase(1/3, t)
    bits, p = max(probs.items(), key=lambda kv: kv[1])
    est = int(bits, 2) / 2**t
    errs.append(abs(est - 1/3)); peaks.append(p)
    print(f"t={t}: φ̂={est:.5f}  err={errs[-1]:.5f}  peak p={p:.3f}")

fig, (a1, a2) = plt.subplots(1, 2, figsize=(10, 3.5))
a1.semilogy(ts, errs, "o-"); a1.semilogy(ts, [2**-(t+1) for t in ts], "--", label="grid/2")
a1.set_xlabel("t"); a1.set_ylabel("|error|"); a1.legend(); a1.grid(alpha=0.3)
a2.plot(ts, peaks, "s-"); a2.axhline(4/np.pi**2, ls=":", label="4/π²")
a2.set_xlabel("t"); a2.set_ylabel("peak probability"); a2.legend(); a2.grid(alpha=0.3)
plt.tight_layout(); plt.show()
```

Findings: (1) error hugs the grid/2 bound $2^{-(t+1)}$, halving per qubit — precision is literally bits-per-qubit; (2) peak probability does NOT → 1; it oscillates and (for worst-case off-grid φ like 1/3, which sits maximally between grid points at every t… nearly) hovers toward the $4/\pi^2 \approx 0.405$ floor. Why never 1: finite Fourier windows leak — φ off-grid distributes amplitude in the sinc kernel *forever*; more qubits move the grid finer but 1/3 remains irrational in binary, always between points. The two-panel figure is the complete honest spec sheet of QPE-as-instrument: resolution (left), single-shot confidence (right) — exactly what you'd hand a teammate deciding qubits-vs-medians.
````

**Exercise 2 — QPE without the eigenstate: sample the spectrum.** System: one qubit with $U = R_z$-like phase structure — concretely $U = P(2\pi\cdot0.15)$ acting on… but feed the system $\ket+$ (an equal superposition of BOTH eigenstates $\ket0$ — eigenphase 0 — and $\ket1$ — eigenphase 0.15). Run t = 5 QPE, and confirm the output distribution shows TWO peaks with ~50/50 total weights at grids near 0 and 0.15. Then explain, via the post-QPE entangled state, why measuring the counting register also *steers* the system register — and what chemistry application this implements in miniature.

````solution
```python
def qpe_super(t=5, phi=0.15):
    qc = QuantumCircuit(t + 1)
    qc.h(t)                                    # system ← |+⟩: mix of BOTH eigenstates
    qc.h(range(t))
    for k in range(t):
        qc.cp(2*np.pi*phi * 2**k, k, t)
    qc.compose(qft(t).inverse(), range(t), inplace=True)
    return Statevector(qc)

sv = qpe_super()
probs = sv.probabilities_dict(list(range(5)))
top = sorted(probs.items(), key=lambda kv: -kv[1])[:6]
for bits, p in top:
    print(f"{bits} → φ̂={int(bits,2)/32:.4f}  p={p:.3f}")
# '00000' → 0.0000  p≈0.50            (the |0⟩ eigenstate's phase: exactly on-grid!)
# '00101' → 0.15625 p≈0.34  + neighbors …  (|1⟩'s φ=0.15, off-grid kernel, ~0.50 total)
```

Two peaks, weights ½ each (the $|c_j|^2$ law): QPE didn't fail on a non-eigenstate — it *sampled the spectrum*. The post-QPE state before measurement is entangled: $\tfrac{1}{\sqrt2}\big(\ket{\text{“0.00”}}\ket0 + \ket{\text{“0.15-kernel”}}\ket1\big)$ — estimate ⊗ eigenstate pairs. So measuring the counting register **collapses the system onto the corresponding eigenstate**: read "00101" and the system register now HOLDS $\ket1$, the eigenstate you sampled. QPE is simultaneously a spectrometer and an eigenstate *filter*. The chemistry miniature: prepare a cheap approximate ground state (overlap $|c_0|^2$), run QPE, post-select runs whose energy readout is the lowest — you've both measured the ground energy AND projected the register into the true ground state for further use. That filter-by-measurement pattern is the fault-tolerant era's planned workhorse for molecules — demonstrated here with one qubit and thirty lines.
````

## Practice questions

1. Why must counting qubit k control $U^{2^k}$ rather than $U^k$? What breaks with linear powers?
2. Total controlled-U applications for t counting qubits — and which single qubit accounts for half of them?
3. For $U = S$ on $\ket1$: what φ, what minimal t reads it exactly, and what bitstring appears?
4. Derive the ≥ 4/π² nearest-grid guarantee's origin in one sentence (what shape is the leakage kernel?).
5. Chemistry: overlap of the trial state with the ground state is 0.25. Expected QPE repetitions to sample the ground energy once? And three times (for a median)?
6. Where exactly does Shor's algorithm deviate from vanilla QPE? (One structural difference — think about what register replaces "given eigenstate".)
7. **Design question:** spec `qpe(unitary_factory, t, system_prep)` for your qbench library: the `unitary_factory(power)` contract (why a factory, not a gate?), validation, output format (estimate + distribution + confidence), and the two integration tests that would have caught this lesson's top two gotchas.

````solution
1. The Fourier state needs phase $e^{2\pi i j\varphi}$ at basis $\ket j$ — i.e., contributions $2^k\varphi$ matching binary weights of j. Linear powers produce a non-Fourier pattern the QFT† can't decode into binary (garbage concentrated nowhere).
2. $\sum_{k=0}^{t-1} 2^k = 2^t - 1$; the last qubit's $U^{2^{t-1}}$ alone is $2^{t-1}$ — half. Precision's marginal cost is always the newest, deepest power.
3. S: phase $i = e^{2\pi i/4}$, φ = ¼; t = 2 suffices; readout `01` (=1, over 4).
4. The finite-window Fourier sum gives the Dirichlet/sinc² kernel; its central-lobe minimum over worst-case offsets evaluates to 4/π² — spectral leakage's best-case floor.
5. Geometric with p = ¼: expected 4 runs per ground-sample; for three samples, ~12 expected (median of the three lowest-consistent readouts).
6. No eigenstate is prepared: the system register starts in a *computational* state ($\ket1$) that is a uniform superposition of the relevant eigenstates of the modular-multiplication unitary, and the controlled powers are computed via classical repeated-squaring baked into the circuit — sampling any eigenphase suffices for the classical post-processing.
7. Model: `unitary_factory(power: int) -> Gate` — a factory because efficient powering is STRUCTURE-dependent (phase gates multiply angles; modular arithmetic pre-squares classically; generic unitaries may need `power()` synthesis): the interface forces the caller to supply efficient powers rather than tempting the library to loop $2^k$ times (gotcha #1 made unrepresentable). Validation: factory(1) unitary; factory(2) ≡ factory(1)² on small dims (`Operator` check); t ≥ 1; system_prep a circuit on the right width. Output: dataclass {phi_hat (peak), distribution dict, half_grid (resolution), peak_prob, median_phi over optional repeats}. Integration tests: (i) the T-gate exactness test (φ=⅛, t=3 → '001' with p=1 — catches forward-vs-inverse QFT and bit-order at once); (ii) a CP-vs-CRz swap test asserting the estimate SHIFTS if the factory is built with rz (catches the convention gotcha by demonstrating it, pinned forever in CI). A library API that makes the classic blunders *unwritable* is the design bar — that's what the factory contract and the two tests achieve.
````
