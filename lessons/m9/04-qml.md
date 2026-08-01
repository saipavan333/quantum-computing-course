# Quantum machine learning: promise vs reality

Quantum machine learning is the field's most hyped and most misunderstood corner — which makes calibrated understanding of it unusually valuable. You'll be asked about QML in interviews, in meetings, by executives who read a headline. This lesson gives you the actual mechanisms (feature maps, quantum kernels, variational classifiers), the genuine open questions (barren plateaus, data-loading, whether any advantage exists), and the ability to discuss QML credibly without either breathless hype or reflexive dismissal.

## Start here — the intuition

Machine learning is mostly about **similarity**: things that are "close" in some clever feature space get the same label. QML's core idea is to use a quantum computer to build that feature space. You **encode** each data point as a quantum state (data → rotation angles), and then either measure how *similar* two encoded points are (a quantum **kernel**, handed to an ordinary classifier) or train a small circuit to output the label directly (a **variational classifier**).

The hope: the quantum state lives in an exponentially large space, so maybe patterns that were tangled become separable — a quantum version of the "kernel trick." The reality check, which is most of this lesson: getting classical data *into* that space is expensive, training big quantum models stalls (barren plateaus), and classical ML is a ferociously good competitor. So the honest 2026 answer is "elegant mechanisms, no demonstrated advantage on real data — and the most promising use is on data that is *already* quantum."

## The landscape — what "QML" actually refers to

QML is an umbrella, and conflating its parts is the root of most confusion:

| | Classical data | Quantum data |
|---|---|---|
| **Classical algorithm** | ordinary ML (not QML) | learning about quantum systems classically |
| **Quantum algorithm** | *the hyped quadrant*: quantum models on classical data | learning quantum states/processes — the most promising |

The headline hype targets the bottom-left (quantum models classifying your spreadsheets), where advantage is *least* established. The genuinely promising quadrant is bottom-right — QML on inherently quantum data (states from experiments, simulations) — where the data-loading bottleneck vanishes because the data is already quantum. Keeping these straight is the first mark of literacy.

## The one picture: encode → measure similarity (or a label)

To process classical data $\vec x$ on a quantum computer, encode it with a **feature map** $U_\phi(\vec x)$ — a circuit that loads the data as rotation angles. Then two model families:

- **Quantum kernel methods.** Compute a similarity matrix $K_{ij} = |\langle\phi(\vec x_i)|\phi(\vec x_j)\rangle|^2$ (overlaps of encoded points), then feed it to a *classical* SVM. The quantum computer only estimates kernel entries; classical ML does the learning.
- **Variational quantum classifiers.** A feature map followed by a trainable ansatz, measured to produce a label, trained by a hybrid loop — structurally VQE with a classification cost, and it inherits VQE's barren plateaus.

@@diagram:qml-pipeline|QML pipeline: classical data → feature map (encode as quantum state) → quantum kernel (overlaps → classical SVM) OR variational ansatz (trained by hybrid loop) → label. The quantum part encodes/measures; classical ML often does the learning.

@@widget

## Predict, then run — a quantum kernel

The live cell encodes numbers as single-qubit rotations and computes the quantum kernel (similarity) between them.

**Predict first.** A point is always perfectly similar to itself, so the diagonal is $1.0$. As two inputs get further apart in angle, should their kernel value rise or fall? Guess, then Run and read the matrix.

```run
# Live cell — a quantum kernel: similarity |<phi(x1)|phi(x2)>|^2 of encoded points.
import numpy as np

def feature(x):
    qc = QuantumCircuit(1); qc.ry(x, 0)          # encode a number as a rotation angle
    return qc.statevector()

def kernel(x1, x2):
    return abs(np.vdot(feature(x1), feature(x2)))**2

pts = [0.0, 0.5, 1.0, 3.0]
print("quantum kernel (similarity) matrix:")
for a in pts:
    print("  ", "  ".join(f"{kernel(a, b):.3f}" for b in pts))
```

That matrix is exactly what you'd hand to a classical SVM (`kernel="precomputed"`). It *works* — it's a valid similarity measure. Whether it's *better* than a classical kernel on real data is a completely different question, and the answer (below) is usually no.

```quiz
{"q":"A QML classifier achieves 85% accuracy on a dataset. What single piece of information most determines whether this is impressive?","options":["The number of qubits used","The classical baseline: what accuracy does the best classical model achieve on the SAME data? (usually equal or higher) — plus how the classical data was loaded","The circuit depth","The number of shots"],"answer":1,"why":"85% is meaningless without the classical baseline on identical data. QML must beat mature classical ML, not chance. Missing baseline (and ignoring O(N) data-loading cost) is the signature of a hype result."}
```

## The hard problems — why QML advantage is elusive

- **Data loading.** Encoding $N$ classical points into quantum states costs $O(N)$ (or needs QRAM, which doesn't practically exist) — the same debt that sank the "quantum FFT accelerator." If loading costs as much as classical processing, the advantage evaporates before computation. Arguably QML's deepest problem.
- **Barren plateaus.** Variational classifiers suffer the same exponentially-vanishing gradients as VQE — worse for expressive feature maps and deep ansätze. Trainability doesn't scale.
- **Classical competition.** Deep learning is staggeringly effective and mature. QML must beat the *best* classical models on the same task — and hasn't, on natural data. Several proposed quantum-ML speedups were even "de-quantized" (matched by classical algorithms).
- **No clear advantage on real data.** The provable QML advantages are on contrived datasets engineered to favor quantum methods. On images, tabular data, or language, classical wins decisively.

## Level up — a quantum kernel that "works" (and what that means)

Build a quantum-kernel SVM on a small dataset and it will classify above chance. But a classical RBF kernel typically matches or beats it on natural data, and runs in microseconds versus the quantum kernel's $O(\text{samples}^2)$ overlap evaluations. "It works" and "it's advantageous" are entirely different claims, and the control experiment — a classical baseline on identical data — is what separates them. Every QML result needs that control; its absence is the tell of hype. The genuinely interesting demos are the rare cases where a quantum kernel beats *all* classical kernels on a dataset with the right structure (e.g. an XOR/parity rule matching a $ZZ$-entangling feature map) — and even those are mostly engineered rather than natural.

## Level up — how to talk about QML

Since you *will* be asked, the framing that signals expertise:

> "QML has elegant mechanisms — feature maps encode data into exponentially large Hilbert spaces, quantum kernels compute similarities that are classically hard to evaluate. But three obstacles keep it from demonstrated advantage on real problems: loading classical data is expensive (often $O(N)$, erasing speedups), variational models hit barren plateaus at scale, and classical ML is a formidable, mature competitor — some proposed quantum speedups have even been de-quantized. The most promising direction is QML on inherently quantum data, where loading is free. As of 2026, QML is a rich research area, not a deployed advantage — and I'd be skeptical of any product claiming otherwise."

Mechanisms, specific obstacles, the quantum-data nuance, and honest skepticism — worth more in an interview than any amount of enthusiasm.

## Level up — gotchas the pros watch for

- **Conflating QML's quadrants.** Advantage claims must specify which; a headline about "quantum AI" almost always means the hyped, weak quadrant.
- **Ignoring data-loading cost.** Speedup analyses that skip the $O(N)$ encoding are the QML version of the QFT/database fallacies. Always ask "how does the data get in?"
- **No classical baseline.** 85% accuracy is meaningless without the classical model's score on the same data.
- **Barren plateaus in classifiers.** Deep/expressive variational classifiers train poorly at scale for the same reason as VQE.
- **"De-quantized" obliviousness.** Several proposed quantum-ML speedups were later matched classically; cite a speedup only after checking it survived.
- **Overclaiming near-term.** QML on real hardware in 2026 is small-scale demonstration, not production ML.

## Key points

- QML spans quadrants; the hyped one (quantum models on classical data) has the least demonstrated advantage, the promising one (quantum models on quantum data) sidesteps data-loading.
- Feature maps encode classical data as quantum states (rotation angles); the hope is exponential-space separability, the catch is matching the map's geometry to the data.
- Two model families: quantum kernels (overlaps → classical SVM; provable advantage only on contrived data) and variational classifiers (VQE-with-a-label; inherits barren plateaus).
- Core obstacles: data loading ($O(N)$), barren plateaus, formidable classical ML, and de-quantization of several proposed speedups.
- No clear advantage on natural data as of 2026; every QML result needs a classical baseline on identical data — its absence signals hype.
- The marketable skill is calibrated assessment: mechanisms + specific obstacles + quantum-data nuance + honest skepticism.

## Check yourself

```quiz
{"q":"Which QML setting has the most defensible case for eventual quantum advantage?","options":["Classifying ordinary images with a variational quantum classifier","Quantum models applied to inherently QUANTUM data (states from experiments/simulations), where the expensive classical-data-loading step is absent","Any task, since Hilbert space is exponentially large","Replacing deep learning on tabular business data"],"answer":1,"why":"Quantum data avoids the O(N) classical-data-loading bottleneck that undermines most QML speedups, and the data's native quantum structure is where quantum methods have a structural fit. The classical-data quadrants face mature classical competition and loading costs."}
```

## Exercises

**Exercise 1 — the mandatory baseline (conceptual, in the live cell).** Extend the kernel cell to build a full kernel matrix over a small labeled set, and describe how you'd hand it to `sklearn.svm.SVC(kernel="precomputed")` and compare against an RBF SVM on the *same* data. On which kind of dataset would the quantum kernel plausibly win, and why?

````solution
```python
# K_train[i,j] = kernel(x_i, x_j); classical: SVC(kernel="precomputed").fit(K_train, y)
# Compare to SVC(kernel="rbf").fit(X, y). On natural data, RBF usually matches/beats
# the quantum kernel and runs ~1000x faster. The quantum kernel becomes competitive
# only when its feature-map geometry matches the label rule -- e.g. an XOR/parity
# dataset aligned with a ZZ-entangling map, which defeats a linear kernel.
```
The quantum kernel helps only when its induced geometry matches the data's structure — and for natural data you rarely know that in advance, while RBF is a robust default. That is the whole QML story in one experiment; the mandatory-baseline habit is the single most important QML skill.
````

**Exercise 2 — feel a barren plateau (conceptual).** Describe how you'd measure the variance of a variational classifier's cost gradient (via parameter-shift on random parameters) as qubit count grows $n = 2, 4, 6, 8$, and what you'd expect to see. What does it mean for training a large model, and name one mitigation.

````solution
```python
# For each n: sample random parameters, compute the parameter-shift gradient of one
# parameter, take the variance over many samples. Expect variance to fall roughly
# exponentially with n (a straight line on a log axis).
```
At large $n$, gradients are exponentially close to zero *everywhere* — the optimizer sees a flat landscape and stalls, and you'd need exponentially many shots just to resolve the gradient from noise. This is a fundamental (not merely engineering) obstacle. One literature mitigation: **local cost functions** (measure observables on few qubits) provably have milder plateaus; others are physics-informed ansätze and identity-block initializations.
````

## Practice questions

1. Name the four QML quadrants and identify which is most hyped and which is most promising.
2. What does a feature map do, and what determines whether it helps?
3. In a quantum-kernel SVM, which part is quantum and which is classical?
4. Why is data loading arguably QML's deepest obstacle for classical data?
5. What does "de-quantization" mean and why is it relevant to QML claims?
6. Why must every QML accuracy result be paired with a classical baseline on the same data?
7. **Design question:** a startup pitches a "quantum neural network" for fraud detection on transaction data. Design your due-diligence checklist — questions about data loading, baselines, barren plateaus, hardware, and advantage claims — and which answers make you more vs less skeptical.

````solution
1. (classical/classical) = ordinary ML; (classical/quantum) = classical learning about quantum systems; (quantum/classical) = MOST HYPED, weak; (quantum/quantum) = MOST PROMISING.
2. Encodes classical data into a quantum state (rotation angles), aiming for separability in the large Hilbert space; helps only if the map's geometry matches the data's structure.
3. Quantum: estimating kernel entries (feature-map overlaps $|\langle\phi(x_i)|\phi(x_j)\rangle|^2$). Classical: the SVM that learns the decision boundary from the precomputed matrix.
4. Encoding $N$ classical points costs $O(N)$ (no practical QRAM), which can equal or exceed classical processing — the speedup dies before computation, and it's unavoidable for classical data.
5. Finding a classical algorithm that matches a proposed quantum speedup; several QML speedups were de-quantized, so any claimed advantage must be checked against a classical equivalent.
6. QML must beat mature classical ML, not chance; without the classical score on identical data (usually higher), the number can't establish advantage.
7. Ask: (a) data loading — cost per sample? (skeptical if hand-waved/$O(N)$); (b) baseline — head-to-head vs the client's XGBoost? (skeptical if absent); (c) barren plateaus — does training stall as it scales? (skeptical if deep generic ansätze); (d) hardware — NISQ-runnable or needs fault tolerance? (skeptical if nonexistent hardware); (e) framing — demonstrated advantage or research prototype? The meta-answer: honest hedged claims *increase* credibility; confident advantage claims on classical data *decrease* it — the inverse of naive due diligence.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Draw the four QML quadrants and say which is hyped and which is promising.
- ☐ Explain what a feature map does and when it helps.
- ☐ Run the live kernel cell and say which part would be quantum vs classical in a real classifier.
- ☐ Name QML's core obstacles (data loading, barren plateaus, classical competition, de-quantization).
- ☐ Explain why every QML result needs a classical baseline on the same data.
- ☐ Give the calibrated QML stance to a non-expert without hype or dismissiveness.
