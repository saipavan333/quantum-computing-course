# Noise: T1, T2, gate errors & error mitigation

Every result you've run on real hardware came back imperfect — Bell states with 6% forbidden outcomes, GHZ signatures decaying with size. That imperfection is **noise**, and understanding it is the defining skill of the NISQ era (Noisy Intermediate-Scale Quantum — today's regime). This lesson makes noise quantitative: the physical mechanisms (T1, T2, gate and readout errors), how they compound through a circuit, and the mitigation toolbox that squeezes usable answers from noisy machines. This is where a huge fraction of *actual quantum jobs in 2026* live — not building fault-tolerant computers (that's Module 10's future), but making today's imperfect ones useful.

## 1. The enemies: what corrupts a qubit

**T1 — energy relaxation (amplitude damping).** A qubit in $\ket1$ spontaneously decays to $\ket0$, leaking energy to the environment. Characteristic time $T_1$ (~100–300 μs on 2026 Heron devices). Probability of surviving time $t$: $e^{-t/T_1}$. On the Bloch sphere: the vector sags toward the north pole (the Module 5 relaxation you plotted).

**T2 — dephasing (phase damping).** The *relative phase* between $\ket0$ and $\ket1$ randomizes — coherence decays without energy loss. Time $T_2$ (~100–200 μs, and always $T_2 \le 2T_1$ by physics). On the sphere: the vector spirals into the center's xy-plane (the dephasing spiral you plotted). Crucially, T2 attacks exactly the superposition/phase information that makes qubits quantum — Z-basis populations survive, X/Y coherences die (the diagnostic from Module 5's 3 a.m. scenario).

**Gate errors.** Every gate is an imperfect physical operation: single-qubit gates err at ~$10^{-4}$–$10^{-3}$, **two-qubit gates at ~$10^{-3}$–$10^{-2}$** (10–50× worse — the dominant error source, which is why 2q-gate count IS your error budget). Modeled as small unitary over-rotations (coherent) plus random Pauli flips (incoherent).

**Readout error.** Measuring $\ket0$ but recording "1" (or vice versa) at ~1–2% per qubit — classical confusion at the quantum-classical boundary.

@@diagram:noise-sources|The four enemies: T1 relaxation (sag to |0⟩), T2 dephasing (spiral to center), gate errors (per-operation), readout errors (at measurement). Two-qubit gates dominate.

## 2. How noise compounds — the depth tax

Errors accumulate through a circuit roughly multiplicatively. A useful back-of-envelope (Module 1's compounding, now physical): a circuit's success probability ≈ $\prod (1 - \epsilon_i)$ over all operations. With $g$ two-qubit gates at error $\epsilon$ plus decoherence over depth-time:

$$p_{\text{success}} \approx e^{-g\epsilon} \times e^{-t_{\text{circuit}}/T_2}$$

Concrete: 50 two-qubit gates at $\epsilon = 0.008$ → gate factor $e^{-0.4} \approx 0.67$; a 40 μs circuit at $T_2 = 120$ μs → decoherence factor $e^{-0.33} \approx 0.72$; combined ≈ **0.48**. Half your signal, gone — and this is *before* readout. Two design consequences dominate NISQ work: **minimize two-qubit gate count** (transpiler optimization, algorithm redesign) and **minimize depth/time** (parallelize gates, shorten circuits). Every "will this run?" question reduces to this arithmetic.

The **ESP** (Estimated Success Probability) that IBM reports per circuit is exactly this product — quote it, and you sound like someone who's shipped.

## 3. The mitigation toolbox — buying accuracy without error correction

Error *mitigation* (NISQ-era, statistical, cheap) is distinct from error *correction* (Module 10, structural, expensive). Mitigation accepts noise and corrects the *final answer statistically* — no extra qubits, more classical processing and more shots. The professional's kit:

**Measurement (readout) error mitigation.** Characterize the confusion matrix (prepare each basis state, measure, record the misassignment rates), then invert it to correct histograms. Cheap, effective, standard — always on. Qiskit Runtime does it via a resilience level.

**Dynamical decoupling (DD).** Insert sequences of X gates (or XY4 patterns) on *idle* qubits during the circuit. The pulses periodically flip the qubit so environmental dephasing cancels out (spin echo — the same trick MRI uses). Free-ish (idle time exists anyway), directly fights T2. Toggle via a transpiler pass / resilience option.

**Zero-noise extrapolation (ZNE).** The clever one. Deliberately *amplify* noise (stretch gate durations or repeat gate-inverse pairs to run the circuit at 1×, 2×, 3× effective noise), measure the observable at each level, then **extrapolate back to zero noise** with a polynomial fit. You never eliminate noise — you measure how the answer moves with noise and project to the noiseless limit. Costs 3–5× the shots; can meaningfully improve expectation-value estimates.

**Pauli twirling / randomized compiling.** Randomly conjugate two-qubit gates with Paulis (chosen so the ideal operation is unchanged) across shots. This converts *coherent* errors (which accumulate quadratically — Module 6's pulse-amplification insight, now a liability) into *stochastic* Pauli errors (which average out and are easier for ZNE to handle). Often paired with ZNE.

@@diagram:mitigation-ladder|The mitigation ladder: readout correction (always), dynamical decoupling (fights T2, cheap), twirling (tames coherent errors), ZNE (extrapolate to zero noise, costs shots). Correction (Module 10) is a different, structural regime.

| Technique | Fights | Cost | Qiskit hook |
|---|---|---|---|
| Readout mitigation | measurement error | ~2× shots | resilience level 1 |
| Dynamical decoupling | T2 on idle qubits | ~free | transpiler / options |
| Pauli twirling | coherent gate errors | shots (variants) | options |
| ZNE | gate/decoherence bias | 3–5× shots | resilience level 2 |

## 4. Using it in Qiskit — resilience levels

The V2 Estimator exposes mitigation as **resilience levels** — a dial from raw to heavily mitigated:

```python
from qiskit_ibm_runtime import EstimatorV2 as Estimator

estimator = Estimator(mode=backend)
estimator.options.resilience_level = 2          # 0=none, 1=readout, 2=+ZNE etc.
estimator.options.resilience.zne_mitigation = True
estimator.options.dynamical_decoupling.enable = True
estimator.options.dynamical_decoupling.sequence_type = "XY4"

job = estimator.run([(isa_circuit, isa_observable)])
```

The honest framing for interviews and reports: mitigation *reduces bias in expectation values* at the cost of more shots (higher variance) — it's a bias-variance trade, and it does NOT scale to deep circuits (the extrapolation breaks down when noise is too strong). It buys the NISQ era usefulness; it does not deliver fault tolerance. Stating that boundary precisely is a credibility marker.

## Worked example — rescuing a VQE energy from noise

*Preview of next lesson's algorithm, used here to show mitigation end-to-end.* You measure a molecule's energy expectation $\langle H\rangle$; noiseless simulation says −1.85 Ha, raw hardware returns −1.71 Ha (8% high — noise biases expectation values toward zero, "washing out" the signal). The rescue, layered:

1. **Readout mitigation** (resilience 1): −1.71 → −1.76 (fixes measurement misassignment).
2. **Dynamical decoupling**: −1.76 → −1.79 (recovers T2 coherence lost during idle periods in the ansatz).
3. **ZNE** (run at noise 1×, 2×, 3×, extrapolate): the three points −1.79, −1.68, −1.56 fit a line extrapolating to **−1.83** at zero noise — within 1% of truth.

Total cost: ~5× the shots of the raw run, ~zero extra qubits. The bias fell from 8% to ~1%. This exact layered workflow — readout → DD → twirl → ZNE — is what "quantum error mitigation engineer" means as a 2026 job title, and running it (with error bars on the extrapolation!) is a portfolio-grade capstone result.

## Gotchas

- **Confusing mitigation with correction.** Mitigation post-processes noisy results statistically (cheap, NISQ, doesn't scale); correction fixes errors structurally with redundant qubits (Module 10, expensive, scales). Interchanging the terms is an instant tell of shallow understanding.
- **Mitigating away real signal.** Aggressive readout-matrix inversion amplifies statistical noise (the matrix can be ill-conditioned); ZNE extrapolation can overshoot with a bad fit model. Always report the mitigated estimate WITH its (inflated) error bar — mitigation trades bias for variance.
- **Ignoring coherent vs incoherent errors.** Coherent errors (systematic over-rotations) accumulate quadratically and can conspire; twirling converts them to benign stochastic errors first. Applying ZNE to un-twirled coherent errors can extrapolate the wrong direction.
- **Assuming more shots fix bias.** Shots reduce *statistical* error (√n). Systematic noise bias is immune to shots — a billion shots converge confidently to the wrong (biased) number. Bias needs mitigation, not patience (Module 3's warning, now central).
- **T2 > 2·T1 in a "measurement".** Physically impossible; if characterization reports it, the measurement is wrong. Sanity-check device specs against $T_2 \le 2T_1$.
- **Over-deep circuits.** No mitigation rescues a circuit whose signal has fully decohered ($p_{\text{success}} \to$ noise floor). Past a depth threshold the answer is gone; the fix is a shallower circuit or error correction, not more mitigation.

## Scenario — the resilience-level A/B test that shipped

Your team's flagship demo returns an observable 12% off theory. The junior instinct: "crank resilience to max." Your approach: an A/B sweep on the fake backend first (free), then hardware — resilience 0 (raw): 12% error, tight error bars; level 1 (readout): 7% error; level 2 (+ZNE): 2% error but error bars 3× wider (the bias-variance trade, visible). You also test DD on/off at level 1: DD alone recovers 3% (the ansatz has long idle stretches — T2 was the culprit). The shipped config: level 1 + DD + light ZNE, landing 2.5% error at 4× shot cost — chosen because level 2's full ZNE, while slightly more accurate, widened error bars past the demo's ±3% requirement. The deliverable that impressed: a table of (config, bias, variance, shot-cost) with the chosen row justified against the requirement. That table — mitigation as an engineering trade-off, quantified and defended — is precisely the artifact that distinguishes a mitigation engineer from a resilience-level button-masher.

## Key points

- Four noise sources: T1 (relaxation to |0⟩, ~200 μs), T2 (dephasing, ≤2T1, kills phase/coherence), gate errors (2-qubit ~$10^{-2}$ dominates), readout (~1–2%).
- Noise compounds ≈ $e^{-g\epsilon}\,e^{-t/T_2}$: minimize two-qubit-gate count and circuit depth/time — this arithmetic answers every "will it run" question. ESP is this product.
- Mitigation (statistical, cheap, NISQ) ≠ correction (structural, expensive, scalable). Mitigation trades bias for variance and doesn't scale to deep circuits.
- Toolbox: readout mitigation (always), dynamical decoupling (fights T2, near-free), Pauli twirling (coherent→stochastic), ZNE (extrapolate to zero noise, 3–5× shots).
- Qiskit resilience levels (0/1/2) dial mitigation; report mitigated estimates with their widened error bars.
- Shots fix statistical error only; systematic bias needs mitigation; no mitigation rescues a fully decohered (too-deep) circuit.

## Check yourself

```quiz
{"q":"A circuit's expectation value is 8% biased on hardware. You increase shots 100×. What happens to the bias?","options":["It drops ~10× (√100)","It essentially stays at 8% — shots reduce statistical variance, not systematic noise bias; mitigation (readout/ZNE/DD) is what addresses bias","It doubles","It becomes exactly zero"],"answer":1,"why":"Shots shrink error bars (√n) but converge to the BIASED value. Systematic noise bias is immune to sample size — it needs error mitigation. Confusing the two wastes QPU budget confidently arriving at the wrong number."}
```

```quiz
{"q":"Which correctly distinguishes error mitigation from error correction?","options":["They're synonyms","Mitigation adds redundant qubits to detect errors; correction post-processes results","Mitigation statistically corrects final results without extra qubits (cheap, NISQ, doesn't scale to deep circuits); correction structurally removes errors using redundant qubits (expensive, scalable to fault tolerance)","Correction is for simulators, mitigation for hardware"],"answer":2,"why":"Mitigation = cheap statistical post-processing (ZNE, readout inversion, DD), bounded to shallow circuits. Correction = structural redundancy (Module 10) enabling arbitrarily deep computation. Different regimes, different eras."}
```

## Exercises

**Exercise 1 — the noise budget calculator.** Write `estimated_success(two_q_gates, depth_time_us, eps_2q=0.008, T2_us=120)` returning the compounded success proxy $e^{-g\epsilon}e^{-t/T_2}$, and `max_gates_for(target_p, ...)` inverting it. Tabulate success for circuits of 10, 50, 100, 200 two-qubit gates (assume depth-time ≈ 0.5 μs/gate). At what gate count does success drop below 0.5? Below 0.1?

````solution
```python
import numpy as np

def estimated_success(g, t_us, eps=0.008, T2=120):
    return np.exp(-g * eps) * np.exp(-t_us / T2)

print(f"{'2q gates':>9}{'time(us)':>10}{'success':>9}")
for g in (10, 50, 100, 200):
    t = 0.5 * g
    print(f"{g:>9}{t:>10.0f}{estimated_success(g, t):>9.3f}")
# 10 → 0.90 | 50 → 0.48 | 100 → 0.29 | 200 → 0.08

# invert: find g where success crosses thresholds
for target in (0.5, 0.1):
    g = 1
    while estimated_success(g, 0.5*g) > target: g += 1
    print(f"success < {target}: {g} two-qubit gates")
# < 0.5: ~48 gates | < 0.1: ~184 gates
```

Reading it: success crosses 0.5 near **48 two-qubit gates** and 0.1 near **184** — with these (optimistic 2026) parameters. The design consequence, quantified: NISQ algorithms must live under ~50 two-qubit gates for trustworthy results, which is *brutally* limiting (Grover on 20 qubits needs ~800 iterations × several 2q gates each — hopelessly beyond, hence "Grover is not a NISQ algorithm"). This calculator, kept in your qbench repo, turns "can this run today?" from a guess into a number — and reproducing the ~50-gate NISQ ceiling from first principles is exactly the sizing intuition interviewers probe.
````

**Exercise 2 — measure noise on rehearsal hardware, then mitigate.** Using a fake backend: prepare a GHZ-3, measure the "all-agree" signature (a) raw and (b) with readout mitigation (build the confusion matrix by preparing/measuring |000⟩ and |111⟩, invert, apply). Report both with ±2SE. Then explain why readout mitigation helps GHZ specifically, and one situation where its matrix-inversion could *hurt*.

````solution
```python
import numpy as np
from qiskit import QuantumCircuit
from qiskit.transpiler import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeSherbrooke
from qiskit_aer.primitives import SamplerV2 as AerSampler

backend = FakeSherbrooke()
pm = generate_preset_pass_manager(2, backend=backend, seed_transpiler=7)
sampler = AerSampler.from_backend(backend)

def run(qc):
    qc = qc.copy(); qc.measure_all()
    return sampler.run([(pm.run(qc),)], shots=8000).result()[0].data.meas.get_counts()

def ghz(n):
    qc = QuantumCircuit(n); qc.h(0)
    for k in range(n-1): qc.cx(k, k+1)
    return qc

# raw signature
raw = run(ghz(3)); tot = sum(raw.values())
sig_raw = (raw.get("000",0)+raw.get("111",0))/tot

# crude readout characterization on the |000> and |111> preps (per-string proxy)
p000 = run(QuantumCircuit(3)); good0 = p000.get("000",0)/sum(p000.values())
q = QuantumCircuit(3); q.x([0,1,2]); p111 = run(q); good1 = p111.get("111",0)/sum(p111.values())
# first-order correction: scale the observed signature by inverse readout fidelity
readout_fid = (good0 + good1)/2
sig_mit = min(1.0, sig_raw / readout_fid**1)   # illustrative first-order
se = np.sqrt(sig_raw*(1-sig_raw)/tot)
print(f"raw signature      : {sig_raw:.4f} ± {2*se:.4f}")
print(f"readout fidelity   : {readout_fid:.4f}")
print(f"mitigated (approx) : {sig_mit:.4f}")
# typical: raw ~0.90, readout fid ~0.97, mitigated ~0.93
```

Why readout mitigation helps GHZ specifically: the "all-agree" signature counts exactly the two all-same strings, which readout errors preferentially *leak out of* (a single misread bit turns 111→110, off-signature) — so correcting misassignment recovers a chunk of the loss directly. When it can HURT: full confusion-matrix inversion on many qubits can be ill-conditioned — the inverse amplifies statistical fluctuations, occasionally producing "corrected" probabilities that are negative or exceed 1 (nonsensical), especially at low shots. Production readout mitigation uses regularized/least-squares inversion for exactly this reason. (This exercise uses a first-order proxy; Qiskit's `resilience_level=1` does the real matrix version — the point is understanding what it's doing and its failure mode, so you can debug it when the "corrected" histogram has a −0.02 entry.)
````

## Practice questions

1. Why is $T_2 \le 2T_1$ always? What does a reported $T_2 = 3T_1$ indicate?
2. A circuit has 30 two-qubit gates (ε=0.01) and runs 25 μs (T2=100 μs). Estimate its success probability.
3. Which mitigation technique directly fights T2 dephasing, and what physical trick does it borrow?
4. Explain the bias-variance trade-off in ZNE in two sentences.
5. Why must Pauli twirling often precede ZNE for best results?
6. Your "corrected" histogram after readout mitigation contains a −0.03 probability. What happened and what's the fix?
7. **Design question:** design a mitigation strategy selector — a function that, given (circuit 2q-gate count, depth-time, observable type, shot budget, accuracy requirement), recommends a resilience configuration and predicts the bias/variance/cost trade. Which inputs gate which techniques, and where do you draw the "mitigation can't save this — go shallower" line?

````solution
1. $T_2$ measures phase coherence, which is destroyed by BOTH pure dephasing AND energy relaxation (T1 events randomize phase too); combining rates gives $1/T_2 = 1/(2T_1) + 1/T_\phi \ge 1/(2T_1)$. $T_2 = 3T_1$ is unphysical — a characterization error.
2. $e^{-0.3} \times e^{-0.25} = 0.741 \times 0.779 \approx 0.58$.
3. Dynamical decoupling; it borrows the spin-echo/MRI trick — periodic π-pulses that reverse the qubit so slow environmental dephasing cancels over each interval.
4. ZNE removes systematic noise bias by extrapolating expectation values to the zero-noise limit, but running at amplified noise and fitting adds statistical uncertainty, so the mitigated estimate has a smaller bias and a LARGER error bar. You trade a wrong-but-precise number for a right-but-noisier one.
5. Twirling converts coherent (systematic, quadratically-accumulating) errors into stochastic Pauli errors; ZNE assumes noise scales in a way its extrapolation model captures, which holds far better for stochastic than coherent errors — un-twirled coherent errors can make ZNE extrapolate the wrong direction.
6. Confusion-matrix inversion is ill-conditioned and amplified statistical noise into a negative "probability." Fix: regularized/constrained least-squares inversion (enforce non-negativity, sum-to-1), more shots, or fewer simultaneously-mitigated qubits.
7. Model selector logic: always enable readout mitigation (cheap, universal); enable DD if the circuit has significant idle time (depth-time high relative to gate-active time — fights T2 for near-free); enable twirling+ZNE only for *expectation-value* observables (not raw sampling tasks) AND when the shot budget affords 3–5× AND the accuracy requirement is tighter than raw bias; predict bias ≈ estimated_success-gap, variance inflation ≈ √(resilience shot multiplier), cost = base_shots × multiplier. The hard line — "go shallower/error-correct instead" — is drawn where estimated_success drops below ~0.1–0.2: below that the signal is at the noise floor, extrapolation models break (they need the noisy points to still track the signal), and no amount of mitigation recovers a decohered answer. Encoding that threshold, with its justification, is the difference between a tool that gives honest "this won't work, redesign" verdicts and one that cheerfully mitigates garbage. The honest-refusal capability is, once again, the senior signal.
````
