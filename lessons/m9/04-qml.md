# Quantum machine learning: promise vs reality

Quantum machine learning is the field's most hyped and most misunderstood corner — which makes calibrated understanding of it unusually valuable. You'll be asked about QML in interviews, in meetings, by executives who read a headline. This lesson gives you the actual mechanisms (feature maps, quantum kernels, variational classifiers), the genuine open questions (barren plateaus, data-loading, whether any advantage exists), and — most importantly — the ability to discuss QML credibly without either breathless hype or reflexive dismissal. Knowing precisely what QML can and cannot do in 2026 is itself a marketable skill.

## 1. The landscape — what "QML" actually refers to

QML is an umbrella over several distinct ideas, and conflating them is the root of most confusion. The four quadrants:

| | Classical data | Quantum data |
|---|---|---|
| **Classical algorithm** | ordinary ML (not QML) | learning about quantum systems classically |
| **Quantum algorithm** | *the hyped quadrant*: quantum models on classical data | learning quantum states/processes — the most promising |

The headline hype targets the bottom-left: quantum models classifying your images/spreadsheets. This is where advantage is *least* established. The genuinely promising quadrant is bottom-right — quantum ML applied to inherently quantum data (states from experiments, quantum simulations) — where the data-loading bottleneck (Section 4) vanishes because the data is already quantum. Keeping these straight is the first mark of literacy.

## 2. Feature maps — encoding data into quantum states

The foundation: to process classical data $\vec x$ on a quantum computer, encode it into a quantum state via a **feature map** — a parameterized circuit $U_\phi(\vec x)$ that "loads" the data as rotation angles:

```python
from qiskit.circuit import QuantumCircuit, ParameterVector
import numpy as np

def feature_map(x, n):
    """Encode a length-n classical vector into a quantum state (ZZ-style)."""
    qc = QuantumCircuit(n)
    for i in range(n):
        qc.h(i)
        qc.rz(2 * x[i], i)                    # data → rotation angle
    for i in range(n - 1):
        qc.cx(i, i + 1)
        qc.rz(2 * (np.pi - x[i]) * (np.pi - x[i+1]), i + 1)   # nonlinear feature
        qc.cx(i, i + 1)
    return qc
```

The idea's appeal: this maps data into an exponentially large Hilbert space (the $2^n$ amplitudes), potentially making patterns separable that weren't classically — a quantum analogue of the kernel trick. The catch, foreshadowed: the map's usefulness depends entirely on whether its geometry matches your data's structure, and that's rarely guaranteed. A feature map that doesn't fit your data is worse than useless.

## 3. Two model families

**Quantum kernel methods.** Compute a kernel (similarity) matrix $K_{ij} = |\langle\phi(\vec x_i)|\phi(\vec x_j)\rangle|^2$ — the overlap between feature-mapped data points (Module 2's inner product, at scale) — then feed it to a *classical* support vector machine. The quantum computer only estimates kernel entries; classical ML does the learning. Elegant, and has provable advantage on *artificially constructed* datasets (built to be quantum-easy, classically-hard) — but no advantage demonstrated on natural data.

**Variational quantum classifiers (VQC).** A feature map followed by a trainable ansatz (Module 9's parameterized circuit), measured to produce a label; train the ansatz parameters by a hybrid loop to minimize classification loss. Structurally VQE with a classification cost function — and it inherits VQE's barren plateaus.

@@diagram:qml-pipeline|QML pipeline: classical data → feature map (encode as quantum state) → quantum kernel (overlaps → classical SVM) OR variational ansatz (trained by hybrid loop) → label. The quantum part encodes/measures; classical ML often does the learning.

```python
# quantum kernel sketch: overlap of two feature-mapped points
from qiskit.quantum_info import Statevector
def kernel_entry(x1, x2, n):
    s1 = Statevector(feature_map(x1, n))
    s2 = Statevector(feature_map(x2, n))
    return abs(s1.inner(s2))**2              # |⟨φ(x1)|φ(x2)⟩|²
# build the full K matrix, hand to sklearn.svm.SVC(kernel='precomputed')
```

## 4. The hard problems — why QML advantage is elusive

The honest obstacles, each an active research frontier and each an interview-worthy talking point:

**Data loading.** Encoding $N$ classical data points into quantum states costs $O(N)$ (or needs QRAM, which doesn't practically exist) — the same debt that sank the "quantum FFT accelerator" (Module 8). If loading the data costs as much as classical processing, the advantage evaporates before computation begins. This is arguably QML's deepest problem.

**Barren plateaus.** VQC training suffers the same exponentially-vanishing gradients as VQE (Module 9) — worse for expressive feature maps and deep ansätze. Trainability doesn't scale.

**Classical competition.** Classical ML (deep learning especially) is staggeringly effective and mature. QML must beat not a strawman but the best classical models on the same task — and hasn't, on natural data. Recent results even "de-quantized" several proposed quantum-ML speedups (found classical algorithms achieving the same).

**No clear advantage on real data.** The provable QML advantages are on contrived datasets engineered to favor quantum methods. On ImageNet, tabular data, or language, classical wins decisively. The most defensible optimism is for quantum data (quadrant bottom-right) and specific structured problems — not general ML.

## 5. How to talk about QML — the calibrated stance

Since you WILL be asked, here's the framing that signals expertise:

> *"QML has elegant mechanisms — feature maps encode data into exponentially large Hilbert spaces, quantum kernels compute similarities classically-hard to evaluate. But three obstacles keep it from demonstrated advantage on real problems: loading classical data is expensive (often O(N), erasing speedups), variational models hit barren plateaus at scale, and classical ML is a formidable, mature competitor — some proposed quantum speedups have even been 'de-quantized.' The most promising direction is QML on inherently quantum data, where loading is free. As of 2026, QML is a rich research area, not a deployed advantage — and I'd be skeptical of any product claiming otherwise."*

That paragraph — mechanisms, specific obstacles, the quantum-data nuance, and honest skepticism — is worth more in an interview than any amount of enthusiasm. It demonstrates you can be trusted to assess quantum claims, which is precisely what applied-quantum roles need. The opposite (uncritical QML hype) is a fast rejection.

## Worked example — a quantum kernel classifier that "works" (and what that means)

*Build a quantum-kernel SVM on a small dataset, get good accuracy, then interrogate whether it means anything.*

```python
import numpy as np
from sklearn.svm import SVC
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
# (feature_map + kernel_entry from above)

X, y = make_classification(n_samples=40, n_features=2, n_informative=2,
                           n_redundant=0, random_state=1)
X = np.pi * (X - X.min()) / (X.max() - X.min())          # scale to rotation range
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=1)

def kernel_matrix(A, B, n=2):
    return np.array([[kernel_entry(a, b, n) for b in B] for a in A])

Ktr = kernel_matrix(Xtr, Xtr); Kte = kernel_matrix(Xte, Xtr)
clf = SVC(kernel="precomputed").fit(Ktr, ytr)
print("quantum-kernel accuracy:", clf.score(Kte, yte))    # e.g. 0.83

# the honest control: a CLASSICAL SVM on the same data
print("classical RBF accuracy:", SVC(kernel="rbf").fit(Xtr, ytr).score(Xte, yte))  # e.g. 0.92
```

The result that teaches: the quantum kernel *works* (classifies above chance) — but the classical RBF kernel matches or beats it on this natural dataset, and ran in microseconds versus the quantum kernel's $O(\text{samples}^2)$ overlap evaluations. "It works" and "it's advantageous" are entirely different claims, and the control experiment (classical baseline on identical data) is what separates them. Every QML result you produce or evaluate needs that control — its absence is the tell of hype. The genuinely interesting QML demos are the rare cases where a quantum kernel beats all classical kernels on a dataset with the right structure — and even those are, so far, mostly engineered rather than natural.

## Gotchas

- **Conflating QML's quadrants.** "QML" spans quantum-models-on-classical-data (least promising) and quantum-models-on-quantum-data (most promising). Advantage claims must specify which — a headline about "quantum AI" almost always means the hyped, weak quadrant.
- **Ignoring the data-loading cost.** Speedup analyses that skip the $O(N)$ encoding of classical data are the QML equivalent of the QFT/database fallacies. Always ask "how does the data get in?"
- **No classical baseline.** A QML model hitting 85% accuracy is meaningless without the classical model's score on the same data (usually higher). Missing baseline = hype.
- **Barren plateaus in VQC.** Deep/expressive variational classifiers train poorly at scale for the same reason as VQE. Trainability is not free.
- **"De-quantized" obliviousness.** Several proposed quantum-ML speedups were later matched by classical algorithms (Tang's work on recommendation systems, etc.). Citing a quantum speedup without checking whether it survived de-quantization is a knowledge gap.
- **Overclaiming near-term.** QML on real hardware in 2026 is small-scale demonstration. Presenting it as production-ready ML is the fastest way to lose technical credibility.

## Scenario — the executive who read a QML headline

Your CTO forwards an article: "Quantum AI to revolutionize drug discovery — 1000× faster!" and asks: "Should we invest?" Your response, this lesson applied: (1) separate the claims — quantum computing for *chemistry simulation* (VQE-style, genuinely promising for quantum data/molecules, Module 9) is real research; quantum *machine learning* on classical drug-screening data is the hyped, weak quadrant with no demonstrated advantage and severe data-loading obstacles. (2) The "1000×" almost certainly refers to a contrived benchmark or conflates the two. (3) Recommendation: the chemistry-simulation angle merits monitoring and maybe a research collaboration (it's where quantum's structural advantage is most defensible); the QML-on-classical-data angle is not investable as near-term advantage. (4) Offer to evaluate any specific vendor claim against the "what's the classical baseline / how does data load / did it survive de-quantization" checklist. The CTO gets a decision framework instead of a yes/no, and you've demonstrated the single most valuable QML skill: **triaging hype into its real and unreal components.** This advisory capability is why companies keep quantum-literate people on staff even before advantage arrives.

## Key points

- QML spans quadrants; the hyped one (quantum models on classical data) has the least demonstrated advantage, the promising one (quantum models on quantum data) sidesteps data-loading.
- Feature maps encode classical data as quantum states (rotation angles); the hope is exponential-space separability, the catch is matching the map's geometry to the data.
- Two model families: quantum kernels (overlaps → classical SVM; provable advantage only on contrived data) and variational classifiers (VQE-with-a-label; inherits barren plateaus).
- Core obstacles: data loading ($O(N)$, often kills speedups), barren plateaus (trainability), formidable classical ML, and de-quantization of several proposed speedups.
- No clear advantage on natural data as of 2026; every QML result needs a classical baseline on identical data — its absence signals hype.
- The marketable skill is calibrated assessment: mechanisms + specific obstacles + quantum-data nuance + honest skepticism, delivered without hype or dismissiveness.

## Check yourself

```quiz
{"q":"A QML classifier achieves 85% accuracy on a dataset. What single piece of information most determines whether this is impressive?","options":["The number of qubits used","The classical baseline: what accuracy does the best classical model achieve on the SAME data? (usually equal or higher) — plus how the classical data was loaded","The circuit depth","The number of shots"],"answer":1,"why":"85% is meaningless without the classical baseline on identical data. QML must beat mature classical ML, not chance. Missing baseline (and ignoring O(N) data-loading cost) is the signature of a hype result."}
```

```quiz
{"q":"Which QML setting has the most defensible case for eventual quantum advantage?","options":["Classifying ordinary images with a variational quantum classifier","Quantum models applied to inherently QUANTUM data (states from experiments/simulations), where the expensive classical-data-loading step is absent","Any task, since Hilbert space is exponentially large","Replacing deep learning on tabular business data"],"answer":1,"why":"Quantum data avoids the O(N) classical-data-loading bottleneck that undermines most QML speedups, and the data's native quantum structure is where quantum methods have a structural fit. The classical-data quadrants face mature classical competition and loading costs."}
```

## Exercises

**Exercise 1 — the mandatory baseline.** Build a quantum-kernel SVM (Section-Worked-Example style) and a classical SVM (RBF and linear kernels) on three small datasets: (a) `make_classification` (natural-ish), (b) `make_moons` (nonlinear), (c) a hand-built dataset where a ZZ-feature-map structure should help (e.g., labels depending on parity/XOR of features). Compare accuracies and runtimes. Report where (if anywhere) the quantum kernel is competitive and why.

````solution
```python
import numpy as np, time
from sklearn.svm import SVC
from sklearn.datasets import make_classification, make_moons
from sklearn.model_selection import train_test_split
# (feature_map, kernel_entry, kernel_matrix from the lesson)

def evaluate(X, y, name):
    X = np.pi * (X - X.min(0)) / (X.max(0) - X.min(0) + 1e-9)
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.3, random_state=0)
    t0=time.perf_counter()
    Ktr, Kte = kernel_matrix(Xtr, Xtr), kernel_matrix(Xte, Xtr)
    qacc = SVC(kernel="precomputed").fit(Ktr, ytr).score(Kte, yte); tq=time.perf_counter()-t0
    racc = SVC(kernel="rbf").fit(Xtr, ytr).score(Xte, yte)
    lacc = SVC(kernel="linear").fit(Xtr, ytr).score(Xte, yte)
    print(f"{name:16} quantum={qacc:.2f}({tq*1000:.0f}ms)  rbf={racc:.2f}  linear={lacc:.2f}")

Xa, ya = make_classification(n_samples=40, n_features=2, n_informative=2, n_redundant=0, random_state=1)
Xm, ym = make_moons(n_samples=40, noise=0.15, random_state=1)
# XOR-parity dataset (2 features): label = sign of product — quantum-friendly structure
rng = np.random.default_rng(3); Xx = rng.uniform(-1,1,(40,2)); yx = (Xx[:,0]*Xx[:,1] > 0).astype(int)
for X,y,nm in [(Xa,ya,"classification"),(Xm,ym,"moons"),(Xx,yx,"xor-parity")]:
    evaluate(X, y, nm)
```

Typical findings: on `make_classification` and `moons`, the classical RBF kernel matches or beats the quantum kernel and runs ~1000× faster (microseconds vs the quantum kernel's O(n²) statevector overlaps). On the XOR-parity dataset — engineered so the ZZ-entangling feature map's structure aligns with the label rule — the quantum kernel becomes competitive with or beats the *linear* kernel (which fails on XOR) and rivals RBF. The honest conclusion: **the quantum kernel helps only when its feature-map geometry matches the data's structure** — and for natural data, you rarely know that in advance, while RBF is a robust default. This is the whole QML story in one experiment: quantum methods can win on structurally-matched (often contrived) data, lose on generic data, and always cost more per evaluation. The mandatory-baseline habit you just practiced is the single most important QML skill.
````

**Exercise 2 — feel a barren plateau.** For a variational quantum classifier ansatz, compute the variance of the cost gradient (via parameter-shift or finite difference on random parameters) as a function of qubit count n = 2, 4, 6, 8. Plot variance vs n on a log scale and observe the exponential decay. Explain what this means for training a large VQC and one mitigation from the literature.

````solution
```python
import numpy as np, matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, SparsePauliOp

def random_ansatz(n, depth, params):
    qc = QuantumCircuit(n); idx=0
    for _ in range(depth):
        for q in range(n): qc.ry(params[idx], q); idx+=1
        for q in range(n-1): qc.cx(q, q+1)
    return qc

def grad_variance(n, samples=60):
    depth = n                                     # scale depth with n
    obs = SparsePauliOp(["Z"+"I"*(n-1)])          # a local-ish cost
    rng = np.random.default_rng(0); grads=[]
    npar = n*depth
    for _ in range(samples):
        p = rng.uniform(0, 2*np.pi, npar)
        # parameter-shift gradient of the FIRST parameter
        pp = p.copy(); pp[0]+=np.pi/2; pm=p.copy(); pm[0]-=np.pi/2
        ep = Statevector(random_ansatz(n,depth,pp)).expectation_value(obs).real
        em = Statevector(random_ansatz(n,depth,pm)).expectation_value(obs).real
        grads.append((ep-em)/2)
    return np.var(grads)

ns=[2,4,6,8]; v=[grad_variance(n) for n in ns]
plt.semilogy(ns, v, "o-"); plt.xlabel("qubits n"); plt.ylabel("Var(∂cost) (log)")
plt.title("Barren plateau: gradient variance vanishes with n"); plt.grid(alpha=0.3); plt.show()
for n,vv in zip(ns,v): print(f"n={n}: grad variance = {vv:.2e}")
# roughly exponential decay: each +2 qubits shrinks variance by a large factor
```

The plot shows gradient variance falling roughly exponentially with n (a straight line on log-y). What it means for training: at large n, gradients are exponentially close to zero *everywhere* — the optimizer sees a flat landscape, random parameter guesses produce near-identical (near-zero-gradient) cost values, and gradient-based training stalls with no direction to descend. You'd need exponentially many shots just to *resolve* the gradient from shot noise — infeasible. This is why generic, expressive VQCs (and VQE ansätze) don't scale, and it's a fundamental (not merely engineering) obstacle. One literature mitigation: **local cost functions** (measure observables on few qubits, like the single-Z above rather than a global parity) provably have milder plateaus; others include physics-informed ansätze that restrict to a small, structured parameter manifold, and clever (identity-block) initializations. Reproducing the plateau yourself — watching variance collapse as you add qubits — converts "barren plateau" from a buzzword into a phenomenon you've measured, which is exactly the depth interviewers probe when QML comes up.
````

## Practice questions

1. Name the four QML quadrants and identify which is most hyped and which is most promising.
2. What does a feature map do, and what determines whether it helps?
3. In a quantum-kernel SVM, which part is quantum and which is classical?
4. Why is data loading arguably QML's deepest obstacle for classical data?
5. What does "de-quantization" mean and why is it relevant to QML claims?
6. Why must every QML accuracy result be paired with a classical baseline on the same data?
7. **Design question:** a startup pitches you a "quantum neural network" for fraud detection on transaction data. Design your due-diligence checklist: the specific questions you'd ask about data loading, baselines, barren plateaus, hardware requirements, and advantage claims — and the answers that would make you more vs less skeptical.

````solution
1. (classical algo / classical data) = ordinary ML; (classical algo / quantum data) = classical learning about quantum systems; (quantum algo / classical data) = MOST HYPED, weak; (quantum algo / quantum data) = MOST PROMISING.
2. It encodes classical data into a quantum state (as rotation angles), aiming for separability in the large Hilbert space; it helps only if the map's induced geometry matches the data's structure — otherwise it's noise.
3. Quantum: estimating kernel entries (feature-map overlaps $|\langle\phi(x_i)|\phi(x_j)\rangle|^2$). Classical: the SVM that learns the decision boundary from the precomputed kernel matrix.
4. Encoding N classical points into quantum states costs O(N) (no practical QRAM), which can equal or exceed the cost of classical processing — the speedup dies before computation, and unlike the algorithm, this cost is unavoidable for classical data.
5. De-quantization = finding a classical algorithm that matches a proposed quantum speedup's performance; several QML speedups (e.g., recommendation systems) were de-quantized, so a claimed quantum advantage must be checked against whether a classical equivalent exists.
6. QML must beat mature classical ML, not chance; without the classical model's score on identical data (usually higher), the accuracy number can't establish advantage — it's the mandatory control.
7. Checklist: (a) Data loading — "how do transactions get into quantum states, and what's that cost per sample?" More skeptical if hand-waved or O(N); less if they have a genuine structural encoding or use quantum-native features. (b) Baseline — "what accuracy/AUC does the client's current classical model (XGBoost, etc.) achieve on the same data?" More skeptical if no head-to-head; less if they show competitive-or-better against a strong baseline. (c) Barren plateaus — "how many qubits, and does training stall as you scale?" More skeptical if deep generic ansätze at scale; less if local costs / structured ansätze / small n with honest scaling caveats. (d) Hardware — "does this need fault tolerance or run on today's NISQ devices, and at what fidelity?" More skeptical if it requires nonexistent hardware; less if a real demonstrated small-scale result. (e) Advantage framing — "is this a demonstrated advantage or a research prototype?" More skeptical of "revolutionary/1000×"; less if they say "exploratory, competitive on structured subsets, not yet beating production classical." The meta-answer: honest hedged claims INCREASE credibility; confident advantage claims on classical data DECREASE it — the inverse of how naive due diligence works, and knowing that inversion is the expertise.
````
