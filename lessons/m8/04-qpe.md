# Quantum phase estimation

Phase estimation is the most *consequential* subroutine in quantum computing: Shor's algorithm is QPE pointed at modular arithmetic; quantum chemistry's endgame is QPE pointed at molecular Hamiltonians; quantum counting is QPE pointed at Grover's rotation. The question it answers sounds narrow — *given a unitary $U$ and its eigenvector, what's the eigenvalue's phase?* — but eigenphases turn out to encode periods, energies, and solution‑counts. Master QPE and Module 8's finale (Shor) becomes assembly, not invention. You already have every part: kickback (M6), controlled powers, and last lesson's inverse QFT.

## Start here — the intuition

Picture a spinning wheel with a single painted mark. Each "tick" of a machine turns it by the *same* fixed fraction of a full turn — but you can't watch it spin; you can only glimpse the mark at the end. How do you figure out the turn‑per‑tick?

Clever trick: run several wheels in parallel, tick one once, the next twice, the next four times, and so on — doubling. Then compare all their final positions at once. The doubling makes the small angle add up into something you can read off in binary. That is quantum phase estimation: the "turn per tick" is a unitary's **eigenphase** $\varphi$, and QPE reads it to as many binary digits as you have counting qubits.

Why anyone cares: that eigenphase is a disguise. For a molecule's energy operator it *is* the energy. For Shor's multiply‑by‑a map it *is* the period that cracks RSA. For Grover's rotation it *is* the number of solutions. One subroutine, many masks.

## The problem, stated with care

Given a unitary $U$ and an eigenstate $\ket u$ with $U\ket u = e^{2\pi i\varphi}\ket u$, $\varphi \in [0,1)$ unknown, find $\varphi$ to $t$ bits. Unitaries' eigenvalues live on the unit circle (the eigen lesson), so "measure the eigenvalue" *means* "estimate the phase." For a Hamiltonian $H$ with energy $E$, the evolution $U = e^{-iHt_0}$ has eigenphase $\varphi = -Et_0/2\pi$ — **energy estimation is phase estimation**, the one‑sentence business case for quantum chemistry.

## The one picture: kickback writes, QFT† reads

Two registers: a $t$‑qubit **counting register** (starts $\ket0^{\otimes t}$) and the **system register** holding $\ket u$.

Fan out the counting register with H's. Then counting qubit $k$ controls $U^{2^k}$ on the system. By kickback (the master trick, at scale), each control's $\ket1$ component picks up the eigenvalue of the power it controls, $e^{2\pi i(2^k\varphi)}$. After all $t$:

$$\frac{1}{\sqrt{2^t}}\sum_{j=0}^{2^t-1} e^{2\pi i\,j\varphi}\,\ket j \otimes \ket u$$

Stare at that: it is *exactly* $\text{QFT}\ket{2^t\varphi}$ — the Fourier pattern winding at frequency $2^t\varphi$. The controlled powers didn't compute bits; they *sculpted the counting register into a Fourier state whose frequency is the answer*, leaving $\ket u$ untouched and reusable. So the final move is an **inverse QFT** on the counting register: unwind the winding back into the plain binary number $\ket{2^t\varphi}$, and measure.

@@diagram:qpe-circuit|QPE: Hadamards fan out the counting register; controlled-U^{2^k} kickbacks write φ into a Fourier winding; QFT† converts winding into a readable binary number. Kickback writes, Fourier reads.

@@widget

**Micro‑instance:** $U = T$ (phase $e^{i\pi/4}$, so $\varphi = 1/8$), $\ket u = \ket1$, $t = 3$: the counting register becomes the winding state at frequency $2^3\cdot\tfrac18 = 1$; QFT† maps it to $\ket{001}$; measurement reads $001 = 1$, and $\hat\varphi = 1/2^3 = 0.125$ — exact, every shot, three qubits.

## Predict, then run — read a phase off the register

The live cell builds QPE on the in‑browser simulator (controlled‑phase for $U = P(2\pi\varphi)$, then an inline inverse QFT) and reads $\varphi$ back as bits.

**Predict first.** $U = P(2\pi\cdot\tfrac14)$, three counting qubits. $\tfrac14$ in binary is $0.010$. Which 3‑bit string should the counting register show? Write it, then Run — and afterward change `phi` to `0.3` and `nc` to `4` to watch what happens when the answer is *not* on the grid.

```run
# Live cell — edit and Run. Reads the eigenphase of U = P(2*pi*phi).
import numpy as np

def qpe(phi, nc):
    qc = QuantumCircuit(nc + 1)
    qc.x(nc)                                   # |1> is the eigenstate of P(2*pi*phi)
    for j in range(nc): qc.h(j)                # counting register -> superposition
    for j in range(nc):
        qc.cp(2*np.pi*phi*(2**j), j, nc)       # controlled-U^{2^j}: kickback writes phi
    for k in range(nc // 2): qc.swap(k, nc - 1 - k)   # inverse QFT reads it out...
    for t in range(nc):
        for s in range(t): qc.cp(-np.pi / 2**(t - s), s, t)
        qc.h(t)
    counts = {}                                # marginalize the eigenqubit
    for key, p in qc.probabilities().items():
        counts[key[-nc:]] = counts.get(key[-nc:], 0.0) + p
    return counts

for phi in [1/8, 1/4, 3/8, 1/2]:
    counts = qpe(phi, 3)
    bits = max(counts, key=counts.get)
    print(f"true phi = {phi:.3f}  ->  measured {bits} = {int(bits,2)}/8 = {int(bits,2)/8}")
```

On‑grid phases read out exactly, one shot. Off‑grid (try `phi = 0.3`) the inverse QFT can't land cleanly and you get a *peaked* distribution around the nearest grid point — that's not a bug, it's the finite‑window sinc kernel of any Fourier readout.

```quiz
{"q":"In QPE, counting qubit k controls U^(2^k). What does this qubit's |1⟩ amplitude acquire, and why does the SYSTEM register survive unchanged?","options":["It acquires e^{2πi·2^k·φ} via phase kickback — the system is in U's eigenstate, so only a phase (attached to the control) results","It stores the k-th bit of φ directly","It becomes entangled with the system permanently","It acquires amplitude damping"],"answer":0,"why":"Eigenstate targets turn controlled gates into pure phase writers on the control (M6's kickback). The full pattern across k = 0..t−1 assembles the Fourier winding of frequency 2^t·φ, with |u⟩ intact and reusable."}
```

## Precision, and what happens off the grid

Each extra counting qubit doubles resolution: $t$ qubits give estimates on the grid $\{0, \tfrac{1}{2^t}, \tfrac{2}{2^t}, \ldots\}$ — one more bit of $\varphi$ per qubit, at the price of *doubling* the controlled‑$U$ work (qubit $t{-}1$ controls $U^{2^{t-1}}$: half the total cost sits in the last qubit's power). Precision is bought with circuit depth, exponentially.

When $\varphi$ is not on the grid, measurement returns nearby grid points with probabilities following a sharply‑peaked interference kernel. Two facts to carry: the nearest grid point appears with probability $\ge 4/\pi^2 \approx 40.5\%$ (tails fall off as $1/\text{distance}^2$); and confidence is cheap to boost — repeat and take the median, or add a few "guard" qubits and round. The off‑grid leakage is the same mathematics as spectral leakage in classical DSP — if you have a signals background, you're already fluent.

## Level up — what if you don't have the eigenstate?

"I can't prepare $\ket u$ — if I knew the eigenstates I'd know the answer!" Three responses in escalating sophistication:

1. **Linearity saves you (Shor's case):** feed any state; it decomposes over eigenstates $\sum_j c_j\ket{u_j}$; QPE entangles estimates with eigenstates, and measurement samples eigenphase $\varphi_j$ with probability $|c_j|^2$. Shor feeds $\ket1$ (an equal mix of exactly the eigenstates it needs) and *any* sampled phase does the job.
2. **Good‑enough overlap (chemistry's case):** prepare an approximation (Hartree–Fock) with overlap $|c_0|^2$ onto the true ground state; QPE returns the ground energy with that probability per run — overlap sets the repetition bill, not the correctness.
3. **When overlap is exponentially poor,** QPE alone won't rescue you — the honest limitation behind "QPE needs good initial states," and the reason state preparation, not estimation, is quantum chemistry's real bottleneck.

## Level up — gotchas the pros watch for

- **Controlled‑$U^{2^k}$ — implement the POWER, not a loop.** For phase gates $P(\theta)^{2^k} = P(2^k\theta)$: one gate. For Shor's modular arithmetic, repeated squaring computes $a^{2^k}\bmod N$ classically first. Naively looping $2^k$ controlled‑U's makes QPE exponentially deep and dead on arrival — the #1 implementation blunder.
- **The inverse QFT is INVERSE.** A forward QFT reads phases mirrored/garbled (estimates come out $1-\varphi$ or bit‑reversed). Certify the subcircuit standalone before integration.
- **Global‑vs‑relative, final boss.** $CP$ vs $CR_z$ differ by a control‑dependent phase that QPE *measures*. Use the gate whose controlled action you actually derived — `cp`.
- **Bit order in the readout.** The QFT swap‑vs‑relabel convention decides which counting qubit is $\varphi$'s MSB. One winding‑test integration check saves hours.
- **Expecting certainty off the grid.** A 40–58% peak is correct behavior; median‑of‑repeats or guard qubits is the remedy, not a bug report.

## Level up — quantum counting: QPE eats Grover

Interview chestnut with real content: *"You suspect between 1 and 50 of $2^{20}$ items satisfy your oracle. Grover needs $k^* \approx \tfrac\pi4\sqrt{N/M}$ — but $M$ is unknown. Fix it."* Grover's iterate $G$ is a rotation by $2\theta$ (last module's geometry), hence a unitary with eigenvalues $e^{\pm 2i\theta}$ where $\sin^2\theta = M/N$. **Run QPE on $G$**: the estimated phase is $2\theta$, so $M = N\sin^2\theta$ — with $t \approx 10$ counting qubits giving $M$ to useful precision in $O(\sqrt N)$ oracle calls. Then run Grover with the now‑known $k^*$. This is **quantum counting**, and the pattern — "any repeating quantum process is a unitary; point QPE at it to read its angle" — is exactly how amplitude estimation speeds up Monte‑Carlo pricing in quantum finance.

## Key points

- QPE estimates eigenphases: $U\ket u = e^{2\pi i\varphi}\ket u$ → read $\varphi$ to $t$ bits with $t$ counting qubits; energies, periods, and counts are eigenphases in costume.
- Mechanism: H fan‑out → controlled‑$U^{2^k}$ kickbacks sculpt the counting register into the Fourier state at frequency $2^t\varphi$ → QFT† converts winding to binary. Kickback writes, Fourier reads.
- Each counting qubit adds one bit of precision and doubles the controlled‑$U$ work; implement powers by structure (phase multiplication, repeated squaring), never by looping.
- Off‑grid phases yield a peaked distribution (nearest grid point $\ge 40.5\%$); median‑of‑repeats or guard qubits sharpen cheaply; depth‑vs‑repetitions is the deployment trade.
- No eigenstate needed a priori: superposed inputs sample eigenphases with $|c_j|^2$ weights (Shor's exploit); overlap quality sets the repetition budget (chemistry's bottleneck).
- QPE composes: pointed at Grover's iterate it counts solutions; at $e^{-iHt}$ it reads energies; at modular multiplication it finds periods — next lesson.

## Check yourself

```quiz
{"q":"QPE with t=4 for true φ = 0.3 returns '0101' (0.3125) on 58% of shots and other values otherwise. The correct engineering response is:","options":["File a bug — QPE should be deterministic","Recognize the off-grid interference kernel: report φ̂ = 0.3125 ± grid/2, and sharpen via median-of-repeats or guard qubits if needed","Add more shots until 0.3 appears exactly","Switch to a forward QFT"],"answer":1,"why":"0.3 isn't representable in 4 bits; the peaked distribution around the best grid point IS the algorithm working. 0.3 can never appear — only grid values can. Precision is bought with qubits or medians, chosen by the depth-vs-repetition budget."}
```

## Exercises

**Exercise 1 — precision ladder.** In the live cell, set `phi = 1/3` (never on any binary grid) and run `qpe(1/3, nc)` for `nc = 2..8` (print the top outcome's estimate, its probability, and the error). Two findings to articulate: the error's halving law, and why the peak probability does *not* approach 1.

````solution
```python
# For each nc: top estimate error hugs the grid/2 bound 2^-(nc+1) (one bit per qubit),
# while the peak probability hovers near the 4/pi^2 ~ 0.405 floor for a maximally
# off-grid phase like 1/3 -- because 1/3 is irrational in binary and always lands
# between grid points, so a finite Fourier window leaks amplitude forever.
```

The two facts are the honest spec sheet of QPE as an instrument: resolution (error halves per qubit) and single‑shot confidence (bounded below by the sinc kernel, not by noise). Which knob to turn — more qubits (deeper circuit) or more shots + median (same depth) — is the depth‑vs‑repetitions budget you'll make on every deployment.
````

**Exercise 2 — QPE without the eigenstate: sample the spectrum.** Feed the system register $\ket{+}$ instead of $\ket1$ (replace `qc.x(nc)` with `qc.h(nc)`). Now it is an equal mix of both eigenstates of $P(2\pi\varphi)$: $\ket0$ (eigenphase $0$) and $\ket1$ (eigenphase $\varphi$). Run and confirm two peaks with ~50/50 weight. Then explain why measuring the counting register also *steers* the system register.

````solution
```python
# Replace qc.x(nc) with qc.h(nc): system = |+> = (|0> + |1>)/sqrt2.
# Output shows a peak at 00000 (|0>'s phase 0, on-grid) and a peak near phi (|1>),
# each carrying ~1/2 total weight -- the |c_j|^2 sampling law.
```

The post‑QPE state before measurement is entangled — estimate ⊗ eigenstate pairs — so measuring the counting register **collapses the system onto the matching eigenstate**. QPE is simultaneously a spectrometer and an eigenstate *filter*: prepare a cheap approximate state, run QPE, keep the runs with the lowest energy readout, and you have both measured the ground energy and projected the register into the true ground state. That filter‑by‑measurement pattern is the fault‑tolerant era's planned workhorse for molecules.
````

## Practice questions

1. Why must counting qubit $k$ control $U^{2^k}$ rather than $U^k$? What breaks with linear powers?
2. Total controlled‑$U$ applications for $t$ counting qubits — and which single qubit accounts for half of them?
3. For $U = S$ on $\ket1$: what $\varphi$, what minimal $t$ reads it exactly, and what bitstring appears?
4. Derive the $\ge 4/\pi^2$ nearest‑grid guarantee's origin in one sentence (what shape is the leakage kernel?).
5. Chemistry: overlap of the trial state with the ground state is $0.25$. Expected QPE repetitions to sample the ground energy once? And three times (for a median)?
6. Where exactly does Shor's algorithm deviate from vanilla QPE? (One structural difference — think about what replaces "given eigenstate.")
7. **Design question:** spec `qpe(unitary_factory, t, system_prep)` for your qbench library: the `unitary_factory(power)` contract (why a factory, not a gate?), validation, output format, and the two integration tests that would have caught this lesson's top two gotchas.

````solution
1. The Fourier state needs phase $e^{2\pi i j\varphi}$ at basis $\ket j$ — contributions $2^k\varphi$ matching the binary weights of $j$. Linear powers produce a non‑Fourier pattern the QFT† can't decode into binary.
2. $\sum_{k=0}^{t-1} 2^k = 2^t - 1$; the last qubit's $U^{2^{t-1}}$ alone is $2^{t-1}$ — half. Precision's marginal cost is always the newest, deepest power.
3. $S$: phase $i = e^{2\pi i/4}$, $\varphi = \tfrac14$; $t = 2$ suffices; readout $01$ (= $1$, over $4$).
4. The finite‑window Fourier sum gives the Dirichlet/$\text{sinc}^2$ kernel; its central‑lobe minimum over worst‑case offsets evaluates to $4/\pi^2$ — spectral leakage's best‑case floor.
5. Geometric with $p = \tfrac14$: expected $4$ runs per ground‑sample; for three samples, ~$12$ expected.
6. No eigenstate is prepared: the system register starts in a computational state ($\ket1$) that is a uniform superposition of the modular‑multiplication unitary's relevant eigenstates, and the controlled powers are computed by classical repeated squaring baked into the circuit — sampling any eigenphase suffices.
7. `unitary_factory(power: int) -> Gate` — a factory because efficient powering is structure‑dependent (phase gates multiply angles; modular arithmetic pre‑squares; generic unitaries need synthesis): the interface forces efficient powers rather than tempting a $2^k$ loop (gotcha #1 made unrepresentable). Validation: factory(1) unitary, factory(2) ≡ factory(1)² on small dims, $t \ge 1$, system_prep on the right width. Output: {phi_hat, distribution, half_grid, peak_prob, median_phi}. Tests: (i) the T‑gate exactness test ($\varphi=\tfrac18, t=3 \to$ `001` with $p=1$ — catches forward‑vs‑inverse QFT and bit order at once); (ii) a CP‑vs‑CRz test asserting the estimate shifts if the factory is built with `rz` (pins the convention gotcha in CI). An API that makes the classic blunders unwritable is the design bar.
````

## Mastery checklist — you are ready to move on when you can

- ☐ State what QPE estimates and name three things eigenphases secretly encode (energy, period, count).
- ☐ Explain "kickback writes, QFT† reads" — what the controlled powers build, and what the inverse QFT does to it.
- ☐ Read a known phase off the live cell, and predict the bitstring for any $\varphi = m/2^t$.
- ☐ Explain the off‑grid peaked distribution and the two ways to sharpen it (qubits vs medians).
- ☐ Say why QPE needs no eigenstate up front, and what sets the repetition budget when overlap is imperfect.
- ☐ Point QPE at Grover's iterate and describe how that counts solutions.
