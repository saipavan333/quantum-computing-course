# Noise: T1, T2, gate errors & error mitigation

Every result you've run on real hardware came back imperfect — Bell states with a few percent of forbidden outcomes, GHZ signatures decaying with size. That imperfection is **noise**, and understanding it is the defining skill of the NISQ era (Noisy Intermediate-Scale Quantum — today's regime). This lesson makes noise quantitative: the physical mechanisms (T1, T2, gate and readout errors), how they compound through a circuit, and the mitigation toolbox that squeezes usable answers from noisy machines. This is where a huge fraction of *actual quantum jobs in 2026* live — not building fault-tolerant computers (Module 10's future), but making today's imperfect ones useful.

## Start here — the intuition

A qubit is like a child's spinning top. Two ways it goes wrong on its own: it slowly **falls over** — energy leaks away and $\ket1$ relaxes to $\ket0$ (that's $T_1$) — and it **wobbles out of sync** — the delicate phase that makes it quantum gets scrambled by its jittery surroundings (that's $T_2$). On top of that, every gate you apply is a slightly imperfect shove, and even reading the answer occasionally flips a bit.

You can't stop the noise on today's machines. So the NISQ craft is twofold: **keep circuits short and cheap** (fewer, faster gates = less time to fall over), and **clean up the answer statistically** afterward — error *mitigation*, which recovers a truer number from noisy runs without adding a single qubit. (That's different from error *correction*, next module, which spends many extra qubits to actually remove errors.)

## The enemies: what corrupts a qubit

- **$T_1$ — relaxation.** $\ket1$ decays to $\ket0$, leaking energy. Survival probability at time $t$ is $e^{-t/T_1}$ ($T_1 \approx 100$–$300\,\mu s$ on 2026 hardware). On the Bloch sphere: the vector sags toward the north pole.
- **$T_2$ — dephasing.** The relative phase between $\ket0$ and $\ket1$ randomizes — coherence dies without energy loss ($T_2 \le 2T_1$ always, by physics). $T_2$ attacks exactly the superposition/phase information that makes qubits quantum.
- **Gate errors.** Single-qubit gates err at ~$10^{-4}$–$10^{-3}$; **two-qubit gates at ~$10^{-3}$–$10^{-2}$** (10–50× worse — the dominant source, which is why two-qubit-gate count *is* your error budget).
- **Readout error.** Measuring $\ket0$ but recording "1" at ~1–2% per qubit.

@@diagram:noise-sources|The four enemies: T1 relaxation (sag to |0⟩), T2 dephasing (spiral to center), gate errors (per-operation), readout errors (at measurement). Two-qubit gates dominate.

@@widget

## The depth tax — how noise compounds

Errors accumulate roughly multiplicatively. A useful back-of-envelope: with $g$ two-qubit gates at error $\epsilon$ and a circuit time $t$,

$$p_{\text{success}} \approx e^{-g\epsilon} \times e^{-t/T_2}.$$

Concrete: 50 two-qubit gates at $\epsilon = 0.008$ gives $e^{-0.4}\approx 0.67$; a $40\,\mu s$ circuit at $T_2 = 120\,\mu s$ gives $e^{-0.33}\approx 0.72$; combined $\approx 0.48$ — half your signal gone, before readout. Two design consequences dominate NISQ work: **minimize two-qubit-gate count** and **minimize depth/time**. Every "will this run?" reduces to this arithmetic.

## Predict, then run — decay and zero-noise extrapolation

Noise isn't in the ideal statevector simulator, so the live cell computes the two facts that matter with plain numpy: how fast a qubit decays, and how **zero-noise extrapolation (ZNE)** recovers a truer answer by deliberately running *noisier* and projecting back to zero.

**Predict first.** With $T_1 = 100\,\mu s$, roughly what fraction of an excited qubit survives after one $T_1$ (i.e. $100\,\mu s$)? (Hint: $e^{-1}$.) Then Run.

```run
# Live cell — two noise realities you can compute directly.
import numpy as np

# 1) T1 relaxation: an excited qubit |1> decays to |0> as exp(-t/T1)
T1 = 100e-6                                       # 100 microseconds
print("T1 relaxation of |1>:")
for t in [0, 25e-6, 50e-6, 100e-6, 200e-6]:
    print(f"  t={t*1e6:6.0f} us   P(still excited) = {np.exp(-t/T1):.3f}")

# 2) Zero-noise extrapolation: run the SAME circuit at 1x, 2x, 3x noise, fit a
#    line through the (biased) results, and project back to zero noise.
scales   = np.array([1.0, 2.0, 3.0])
measured = np.array([-1.79, -1.72, -1.65])        # a VQE energy, worse at higher noise
zne = float(np.polyval(np.polyfit(scales, measured, 1), 0.0))
print("\nZero-noise extrapolation:")
print("  measured", measured, "at noise", scales)
print(f"  extrapolated to zero noise = {zne:.3f} Ha   (true ~ -1.85)")
```

You never removed the noise — you measured how the answer *moves* with noise and projected to the noiseless limit. That single idea, plus readout correction and dynamical decoupling, is the NISQ mitigation kit.

```quiz
{"q":"A circuit's expectation value is 8% biased on hardware. You increase shots 100×. What happens to the bias?","options":["It drops ~10× (√100)","It essentially stays at 8% — shots reduce statistical variance, not systematic noise bias; mitigation (readout/ZNE/DD) is what addresses bias","It doubles","It becomes exactly zero"],"answer":1,"why":"Shots shrink error bars (√n) but converge to the BIASED value. Systematic noise bias is immune to sample size — it needs error mitigation. Confusing the two wastes QPU budget confidently arriving at the wrong number."}
```

## The mitigation toolbox — buying accuracy without error correction

Mitigation accepts noise and corrects the *final answer statistically* — no extra qubits, just more classical processing and shots.

- **Readout mitigation.** Characterize the misassignment (confusion) matrix, then invert it to correct histograms. Cheap, standard, always on.
- **Dynamical decoupling (DD).** Insert $X$-pulse sequences on *idle* qubits so environmental dephasing cancels (the spin-echo trick MRI uses). Near-free, directly fights $T_2$.
- **Zero-noise extrapolation (ZNE).** Amplify noise to 1×/2×/3×, measure the observable at each, extrapolate to zero (the live cell). Costs 3–5× shots; improves expectation values.
- **Pauli twirling.** Randomly conjugate two-qubit gates with Paulis so *coherent* errors become *stochastic* ones that ZNE handles better. Often paired with ZNE.

@@diagram:mitigation-ladder|The mitigation ladder: readout correction (always), dynamical decoupling (fights T2, cheap), twirling (tames coherent errors), ZNE (extrapolate to zero noise, costs shots). Correction (Module 10) is a different, structural regime.

In Qiskit these are **resilience levels** on the Estimator (0 = none, 1 = readout, 2 = + ZNE), plus DD and twirling toggles. The honest framing: mitigation *reduces bias in expectation values* at the cost of more shots (higher variance) — a bias-variance trade — and it does **not** scale to deep circuits (extrapolation breaks when noise is too strong). It buys the NISQ era usefulness; it does not deliver fault tolerance.

## Level up — rescuing a VQE energy from noise

You measure a molecule's energy: noiseless simulation says $-1.85$ Ha, raw hardware returns $-1.71$ (8% high — noise washes expectation values toward zero). The layered rescue: readout mitigation $-1.71 \to -1.76$; dynamical decoupling $-1.76 \to -1.79$; ZNE (run at 1×/2×/3×, extrapolate) $\to -1.83$ — within 1% of truth, at ~5× the shots and ~zero extra qubits. This exact workflow — readout → DD → twirl → ZNE, reported *with error bars on the extrapolation* — is what "quantum error mitigation engineer" means as a 2026 job title.

## Level up — gotchas the pros watch for

- **Confusing mitigation with correction.** Mitigation post-processes statistically (cheap, NISQ, doesn't scale); correction fixes errors structurally with redundant qubits (Module 10, expensive, scales). Interchanging the terms is an instant tell.
- **Mitigating away real signal.** Aggressive readout-matrix inversion amplifies statistical noise; ZNE can overshoot with a bad fit. Always report the mitigated estimate *with* its widened error bar.
- **Assuming more shots fix bias.** Shots reduce statistical error ($\sqrt n$); systematic bias is immune — a billion shots converge confidently to the wrong number.
- **$T_2 > 2T_1$ in a "measurement."** Physically impossible; it means the characterization is wrong.
- **Over-deep circuits.** No mitigation rescues a circuit whose signal has fully decohered — the fix is a shallower circuit or error correction.

## Key points

- Four noise sources: $T_1$ (relaxation to $\ket0$), $T_2$ (dephasing, $\le 2T_1$, kills phase/coherence), gate errors (two-qubit ~$10^{-2}$ dominates), readout (~1–2%).
- Noise compounds $\approx e^{-g\epsilon}e^{-t/T_2}$: minimize two-qubit-gate count and depth/time — this arithmetic answers every "will it run."
- Mitigation (statistical, cheap, NISQ) $\neq$ correction (structural, expensive, scalable). Mitigation trades bias for variance and doesn't scale to deep circuits.
- Toolbox: readout mitigation (always), dynamical decoupling (fights $T_2$, near-free), Pauli twirling (coherent → stochastic), ZNE (extrapolate to zero noise, 3–5× shots).
- Report mitigated estimates with their widened error bars; shots fix statistical error only; no mitigation rescues a fully decohered circuit.

## Check yourself

```quiz
{"q":"Which correctly distinguishes error mitigation from error correction?","options":["They're synonyms","Mitigation adds redundant qubits to detect errors; correction post-processes results","Mitigation statistically corrects final results without extra qubits (cheap, NISQ, doesn't scale to deep circuits); correction structurally removes errors using redundant qubits (expensive, scalable to fault tolerance)","Correction is for simulators, mitigation for hardware"],"answer":2,"why":"Mitigation = cheap statistical post-processing (ZNE, readout inversion, DD), bounded to shallow circuits. Correction = structural redundancy (Module 10) enabling arbitrarily deep computation. Different regimes, different eras."}
```

## Exercises

**Exercise 1 — the noise budget calculator.** In the live cell, write `estimated_success(g, t_us, eps=0.008, T2=120)` returning $e^{-g\epsilon}e^{-t/T_2}$, and tabulate success for 10, 50, 100, 200 two-qubit gates (assume ~0.5 μs/gate). At what gate count does success drop below 0.5? Below 0.1?

````solution
```python
import numpy as np
def estimated_success(g, t_us, eps=0.008, T2=120):
    return np.exp(-g*eps) * np.exp(-t_us/T2)
for g in (10, 50, 100, 200):
    print(g, "gates ->", round(estimated_success(g, 0.5*g), 3))
# 10->0.90, 50->0.48, 100->0.29, 200->0.08; crosses 0.5 near ~48 gates, 0.1 near ~184
```
Success crosses 0.5 near **48 two-qubit gates** — so NISQ algorithms must live under ~50 two-qubit gates for trustworthy results. That is why Grover on 20 qubits (~800 iterations) is hopelessly beyond NISQ: this calculator turns "can this run today?" into a number.
````

**Exercise 2 — extrapolation quality.** In the ZNE part of the live cell, change `measured` to a set that curves (e.g. `[-1.79, -1.70, -1.55]`) and compare a linear fit (`deg=1`) to a quadratic (`deg=2`) extrapolation to zero. Which is more trustworthy, and why is *over*-fitting the noise scaling a real risk?

````solution
```python
lin = np.polyval(np.polyfit(scales, measured, 1), 0.0)
quad = np.polyval(np.polyfit(scales, measured, 2), 0.0)   # 3 points, deg 2 = exact fit
```
A degree-2 fit through 3 points passes exactly through them and can swing wildly at $x=0$ (over-fitting the noise, not the signal). With few noise levels, a low-order model with reported uncertainty is safer than a high-order one that hugs the samples — the same bias-variance judgment as everywhere in mitigation.
````

## Practice questions

1. Why is $T_2 \le 2T_1$ always? What does a reported $T_2 = 3T_1$ indicate?
2. A circuit has 30 two-qubit gates ($\epsilon=0.01$) and runs $25\,\mu s$ ($T_2=100\,\mu s$). Estimate its success probability.
3. Which mitigation technique directly fights $T_2$ dephasing, and what physical trick does it borrow?
4. Explain the bias-variance trade-off in ZNE in two sentences.
5. Why must Pauli twirling often precede ZNE for best results?
6. Your "corrected" histogram after readout mitigation contains a $-0.03$ probability. What happened and what's the fix?
7. **Design question:** design a mitigation-strategy selector — given (two-qubit-gate count, depth-time, observable type, shot budget, accuracy requirement), recommend a resilience configuration and predict the bias/variance/cost trade. Where do you draw the "mitigation can't save this — go shallower" line?

````solution
1. $T_2$ is limited by both dephasing and relaxation ($1/T_2 = 1/(2T_1) + 1/T_\phi \ge 1/(2T_1)$), so $T_2 \le 2T_1$; $T_2 = 3T_1$ is unphysical — a characterization error.
2. $e^{-0.3}\times e^{-0.25} = 0.741 \times 0.779 \approx 0.58$.
3. Dynamical decoupling; it borrows the spin-echo/MRI trick — periodic $\pi$-pulses that reverse the qubit so slow dephasing cancels.
4. ZNE removes systematic bias by extrapolating to zero noise, but running at amplified noise and fitting adds statistical uncertainty — smaller bias, larger error bar. You trade a wrong-but-precise number for a right-but-noisier one.
5. Twirling turns coherent errors into stochastic Pauli errors; ZNE's extrapolation model fits stochastic scaling far better, so un-twirled coherent errors can make ZNE extrapolate the wrong way.
6. Confusion-matrix inversion was ill-conditioned and amplified statistical noise into a negative probability. Fix: regularized/constrained least-squares (enforce non-negativity, sum-to-1), more shots, or fewer simultaneously-mitigated qubits.
7. Always enable readout mitigation; enable DD when idle time is significant; enable twirling+ZNE only for expectation-value observables when the budget affords 3–5× and the accuracy need is tighter than raw bias. Predict bias from the success-gap, variance inflation from the shot multiplier, cost = base × multiplier. Draw the "go shallower" line where estimated success drops below ~0.1–0.2 — below that the signal is at the noise floor and extrapolation models break. Encoding that honest-refusal threshold is the senior signal.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Name the four noise sources and which one dominates the error budget.
- ☐ Estimate a circuit's success probability from its two-qubit-gate count and time.
- ☐ Explain why more shots don't fix systematic bias.
- ☐ Distinguish mitigation from correction (cost, scalability, era).
- ☐ Describe ZNE, readout mitigation, and dynamical decoupling, and what each fights.
- ☐ Run the live cell and read a T1 decay and a zero-noise extrapolation.
