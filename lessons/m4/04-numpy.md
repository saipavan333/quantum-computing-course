# NumPy & matplotlib: math at speed

Here's your professional edge in one sentence: **for the rest of this course, you will verify every quantum computation with NumPy** — every gate application, every probability, every interference effect — because a claim you can't check is a claim you don't own. NumPy is Python's array engine (Qiskit is built on it; states and gates *are* NumPy arrays under the hood), and matplotlib turns numbers into the plots your reports and interviews will lean on. This lesson completes your toolbox; everything after it is quantum.

## 1. Arrays — vectors and matrices, executable

```python
import numpy as np

v = np.array([3, 2])                       # a vector (1-D array)
M = np.array([[1, 2], [3, 4]])             # a matrix (2-D array)
psi = np.array([1/np.sqrt(2), 1j/np.sqrt(2)])   # complex qubit state!

print(v.shape, M.shape, psi.dtype)         # (2,) (2, 2) complex128
```

Three attributes tell you everything about an array: `.shape` (dimensions), `.dtype` (number type), `.ndim`. Quantum work runs on `complex128` — NumPy auto-upgrades the moment any entry is complex (`1j` anywhere does it). If your "state" has `dtype float64` and you expected phases, you dropped the `j` somewhere.

@@diagram:ndarray-shape|Array anatomy: shape (2,) is a vector, (2,2) a matrix, (2,1) a column. Most NumPy confusion is a shape confusion — print .shape first, always.

Builders you'll use constantly:

```python
np.zeros(4)              # [0. 0. 0. 0.]         — empty amplitude registers
np.eye(2)                # 2×2 identity           — the do-nothing gate
np.arange(0, 1, 0.25)    # [0. 0.25 0.5 0.75]     — like range, floats allowed
np.linspace(0, np.pi, 5) # [0. 0.785 1.571 2.356 3.142] — n evenly spaced points
```

`linspace` is the parameter-sweep workhorse: "50 angles between 0 and 2π" is one call, and Module 9's optimization landscapes are drawn with it.

## 2. Vectorization — loops without loops

Operations apply **element-wise to whole arrays at once**, in compiled C — typically 10–100× faster than Python loops, and (more important for you) closer to the math notation:

```python
theta = np.linspace(0, np.pi, 5)
print(np.cos(theta / 2) ** 2)          # p(0) for five Bloch angles AT ONCE
# [1.  0.854 0.5  0.146 0. ]  — the θ-sweep from the trig lesson, one line

amps = np.array([0.6, -0.48 + 0.64j])
probs = np.abs(amps) ** 2              # modulus-squared, element-wise
print(probs, probs.sum())              # [0.36 0.64] 1.0  — normalized ✓
```

Aggregations: `.sum()`, `.mean()`, `.max()`, `np.argmax()` (…the *index* of the max — "which outcome is most likely" in one call). Boolean masks combine filtering with statistics:

```python
samples = np.random.default_rng(7).random(10_000) < 0.3    # 10k Bernoulli trials
print(samples.mean())                   # 0.3005 — estimate of p, no loop in sight
```

That one-liner replaces the entire shot-loop from two lessons ago. Write the loop once (you did — good for the soul), then vectorize forever.

## 3. Linear algebra — the quantum toolkit, verified

Every operation from Module 2, executable (this table is worth pinning):

| Math | NumPy | Notes |
|---|---|---|
| $M\vec v$ (apply gate) | `M @ v` | `@` = matrix product; `*` is element-wise — the classic bug |
| $\braket{\phi}{\psi}$ | `np.vdot(phi, psi)` | conjugates the FIRST argument (physics-correct) |
| $\lVert v \rVert$ | `np.linalg.norm(v)` | handles complex properly |
| $M^\dagger$ | `M.conj().T` | dagger = conjugate transpose |
| $M^{-1}$ | `np.linalg.inv(M)` | prefer `solve` in production |
| eigen (Hermitian) | `np.linalg.eigh(M)` | real eigenvalues, sorted |
| $A \otimes B$ | `np.kron(A, B)` | tensor product — Module 6's star, cameo today |
| float-safe compare | `np.allclose(A, B)` | tolerance-aware `==` for arrays |

Watch the full quantum verification loop run — state, gate, evolve, measure statistics:

```python
import numpy as np

ket0 = np.array([1, 0], dtype=complex)
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
S = np.array([[1, 0], [0, 1j]])

psi = H @ ket0                       # create superposition
psi = S @ psi                        # add a 90° relative phase
psi = H @ psi                        # interfere
print(np.round(psi, 4))              # [0.5+0.5j 0.5-0.5j]
print(np.abs(psi)**2)                # [0.5 0.5]

# sanity: is HSH unitary? (it must be — product of unitaries)
U = H @ S @ H
print(np.allclose(U.conj().T @ U, np.eye(2)))    # True
```

That's the S-gate phase-detection experiment from the Dirac lesson, executed. The habit on display — *compose the matrix, check unitarity, apply, square moduli* — is exactly how you'll debug real circuits against theory in Module 7.

One cameo to plant a seed for Module 6: two qubits live in $\mathbb{C}^4$, built by `np.kron`:

```python
ket00 = np.kron(ket0, ket0)          # [1 0 0 0] — the |00⟩ state, 4 amplitudes
print(ket00.shape)                   # (4,)
```

## 4. matplotlib — numbers into arguments

`matplotlib.pyplot` (universally aliased `plt`) makes every plot you'll need this course. The two workhorses:

**Bar charts** — measurement histograms (your daily bread):

```python
import matplotlib.pyplot as plt

counts = {"00": 2011, "01": 396, "10": 402, "11": 1191}
shots = sum(counts.values())
labels = sorted(counts)
probs = [counts[b] / shots for b in labels]
err = [2 * np.sqrt(p * (1 - p) / shots) for p in probs]   # ±2SE — Module 3, on the plot!

plt.bar(labels, probs, yerr=err, capsize=4, color="#7c5cff")
plt.ylabel("probability")
plt.title("Bell state, 4000 shots (±2SE)")
plt.show()
```

**Line plots** — sweeps and convergence curves:

```python
theta = np.linspace(0, 2 * np.pi, 100)
plt.plot(theta, np.cos(theta / 2) ** 2, label="p(0)")
plt.plot(theta, np.sin(theta / 2) ** 2, label="p(1)", linestyle="--")
plt.xlabel("Bloch angle θ (rad)"); plt.ylabel("probability")
plt.legend(); plt.grid(alpha=0.3)
plt.show()
```

The grammar: `plt.plot/bar(...)` draw; `xlabel/ylabel/title/legend` annotate; `show()` renders (notebooks often render anyway — call it regardless; scripts need it). Professional minimums, non-negotiable in this course: **axes labeled, units stated, error bars on measured quantities.** An unlabeled plot in a portfolio review reads as "not ready."

## Worked example — the Rabi calibration plot, end to end

Reproduce the hardware-intern scenario from the trig lesson with synthetic data — the full professional arc: simulate (or load) noisy data, overlay theory, annotate the punchline.

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(3)
t = np.linspace(0, 100, 26)                      # pulse durations (ns)
omega = 2 * np.pi / 80                           # true Rabi rate: period 80 ns
p1_true = np.sin(omega * t / 2) ** 2             # theory curve (trig lesson!)
shots = 200
counts = rng.binomial(shots, p1_true)            # noisy experiment (prob module!)
p1_est = counts / shots
err = 2 * np.sqrt(p1_est * (1 - p1_est) / shots) # ±2SE (sampling lesson!)

t_fine = np.linspace(0, 100, 400)
plt.errorbar(t, p1_est, yerr=err, fmt="o", capsize=3, label=f"data ({shots} shots/pt)")
plt.plot(t_fine, np.sin(omega * t_fine / 2) ** 2, label="theory sin²(Ωt/2)")
plt.axvline(80 / 2, linestyle=":", color="gray")
plt.text(41, 0.06, "π-pulse ≈ 40 ns")
plt.xlabel("pulse duration t (ns)"); plt.ylabel("P(measure 1)")
plt.title("Rabi oscillation — calibration"); plt.legend(); plt.show()
```

Every ingredient is a previous lesson with its sleeves rolled up: $\sin^2(\Omega t/2)$ (trig), binomial shot noise (probability), ±2SE bars (sampling), vectorized curves (today). The figure this code produces is, without exaggeration, the first plot most quantum-hardware employees ever make on the job. Yours took 20 lines.

## Gotchas

- **`*` vs `@`, the sequel.** `M * v` multiplies element-wise with broadcasting — shape may even work out, values silently wrong. Gates apply with `@`. If probabilities look bizarre, audit every `*` touching a matrix.
- **`np.dot` on complex vectors.** No conjugation → wrong inner products (Dirac lesson's bug, now in array form). Overlaps: `np.vdot(bra_side, ket_side)`. Norms: `np.linalg.norm` (which does conjugate).
- **Shape mismatch or silent broadcasting.** (2,) vs (2,1) vs (1,2) behave differently in products. Debug ritual: `print(x.shape)` before blaming the math. Prefer 1-D vectors + `@` for this course; it composes cleanly.
- **Integer dtype trap.** `np.array([1, 0])` is `int64`; then `arr[0] = 0.707` silently truncates to **0**. States and gates: create with `dtype=complex` (or include a `1j`/decimal) from the start.
- **Copy vs view.** Slices are *views*: `b = psi[:2]; b[0] = 9` edits `psi` too. Use `.copy()` when you mean copy — the list-aliasing rule, upgraded to arrays.
- **Plot without labels/errors.** Not a code bug — a credibility bug. Reviewers (and this course's capstone rubric) treat unlabeled axes and bare point-estimates as unfinished work.

## Scenario — "the simulator disagrees with my math"

Module 7, future you: a 2-qubit circuit's simulator output says $p(01) = 0.25$ but your hand-calculation says 0. You bisect with NumPy: build the state step by step (`np.kron` for the initial state, `@` for each gate matrix), printing `np.round(psi, 4)` after every step, and compare against the simulator's intermediate statevector. Three steps in, your hand-math and NumPy agree with each other but not the simulator — until you notice your CNOT matrix assumed the *left* qubit is the control while Qiskit numbers qubits from the *right* (the infamous ordering convention, Module 6). One `np.kron` argument swap later, all three agree everywhere. The moral is the method: **NumPy is your independent referee** — when framework and intuition disagree, twenty lines of array arithmetic settle it. People without this referee stay confused for days; people with it file precise bug reports (occasionally on the framework itself).

### ▶ Run it live

Run real NumPy in the browser — apply a matrix to a vector and take a norm:

```run
# expect: [17
import numpy as np
M = np.array([[1, 2], [3, 4]]); v = np.array([5, 6])
print("M @ v =", M @ v)
print("norm of v =", round(float(np.linalg.norm(v)), 4))
```

## Key points

- Arrays carry `.shape` and `.dtype`; quantum work is `complex128` — check both before checking your math.
- Vectorization replaces loops: element-wise ops, `np.abs(psi)**2` for probabilities, masks + `.mean()` for shot statistics, `linspace` for sweeps.
- The quantum verbs: `@` (apply/compose), `np.vdot` (overlap, conjugates first arg), `M.conj().T` (dagger), `eigh` (observables), `np.kron` (qubits combine), `np.allclose` (float-safe equality).
- `*` is element-wise, `@` is matrix — the single most damaging one-character bug in quantum NumPy.
- matplotlib minimum professional standard: labeled axes, units, error bars (`yerr=2*SE`), legend; bar charts for histograms, line plots for sweeps.
- NumPy is your independent referee: verify every framework result and every hand-derivation against it — the habit that converts confusion into bug reports.

## Check yourself

```quiz
{"q":"psi = np.array([0.6, 0.8j]). Which line computes the measurement probabilities correctly?","options":["psi ** 2","np.abs(psi) ** 2 — modulus first, then square","psi * psi","np.vdot(psi, psi)"],"answer":1,"why":"psi**2 squares complex amplitudes keeping phase ((0.8j)² = −0.64: a negative 'probability'). |z|² needs the modulus: np.abs. (vdot(psi,psi) gives the SUM of probabilities — 1.0 — not the individual ones.)"}
```

```quiz
{"q":"H @ v and H * v differ how?","options":["They're identical for 2×2 H","@ is the matrix product (a gate acting on a state); * is element-wise multiplication with broadcasting — wrong values, often silently","* is faster but equivalent","@ only works for square matrices"],"answer":1,"why":"H @ v computes row-dot-column (real linear algebra). H * v multiplies entry-by-entry, broadcasting shapes — it runs without error and produces meaningless 'states', which is what makes it dangerous."}
```

## Exercises

**Exercise 1 — the gate-zoo verifier.** Build X, Y, Z, H, S as complex arrays. Write `check_gate(name, U)` that verifies: unitarity, whether it's Hermitian, and its eigenvalues (`np.linalg.eigvals`). Run on all five; present as a table. One line each: reconcile S's result with the eigen lesson.

````solution
```python
import numpy as np

gates = {
    "X": np.array([[0, 1], [1, 0]], dtype=complex),
    "Y": np.array([[0, -1j], [1j, 0]]),
    "Z": np.array([[1, 0], [0, -1]], dtype=complex),
    "H": np.array([[1, 1], [1, -1]]) / np.sqrt(2),
    "S": np.array([[1, 0], [0, 1j]]),
}

def check_gate(name, U):
    unitary = np.allclose(U.conj().T @ U, np.eye(2))
    hermitian = np.allclose(U.conj().T, U)
    eig = np.round(np.linalg.eigvals(U), 6)
    print(f"{name}: unitary={unitary}  hermitian={hermitian}  eigenvalues={eig}")

for name, U in gates.items():
    check_gate(name, U)
# X: unitary=True hermitian=True eigenvalues=[ 1.+0.j -1.+0.j]
# Y: unitary=True hermitian=True eigenvalues=[ 1.+0.j -1.+0.j]
# Z: unitary=True hermitian=True eigenvalues=[ 1.+0.j -1.+0.j]
# H: unitary=True hermitian=True eigenvalues=[ 1.+0.j -1.+0.j]
# S: unitary=True hermitian=False eigenvalues=[1.+0.j 0.+1.j]
```

Reconciliation: X, Y, Z, H are the ±1-spectrum club (both gate and observable — eigen lesson's "lucky double membership"); S is unitary-only, eigenvalues $\{1, i\}$ on the unit circle but off the real line, so it evolves states yet defines no measurement. You now possess a reusable gate-linting function — drop it in `stats_utils.py`'s new sibling, `quantum_utils.py`. It will lint your *custom* gates in Module 7, where "why does Qiskit reject my matrix" becomes a solved problem.
````

**Exercise 2 — interference, swept and plotted.** The two-path formula (Euler lesson) says $p(\text{detect}) = \cos^2(\varphi/2)$. Verify it *matricially*: for 60 values of $\varphi$ in $[0, 2\pi]$, build the phase gate $P(\varphi) = \mathrm{diag}(1, e^{i\varphi})$, compute $\ket{\text{out}} = H\,P(\varphi)\,H\ket0$, extract $p(0)$, and plot simulated points against the theoretical curve. They should coincide to float precision.

````solution
```python
import numpy as np
import matplotlib.pyplot as plt

ket0 = np.array([1, 0], dtype=complex)
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

phis = np.linspace(0, 2 * np.pi, 60)
p0 = []
for phi in phis:
    P = np.array([[1, 0], [0, np.exp(1j * phi)]])
    out = H @ P @ H @ ket0
    p0.append(abs(out[0]) ** 2)

plt.plot(phis, p0, "o", markersize=4, label="matrix pipeline H·P(φ)·H|0⟩")
plt.plot(phis, np.cos(phis / 2) ** 2, label="theory cos²(φ/2)")
plt.xlabel("relative phase φ (rad)"); plt.ylabel("p(0)")
plt.title("Interference: phase in, probability out")
plt.legend(); plt.grid(alpha=0.3); plt.show()

print(np.allclose(p0, np.cos(phis / 2) ** 2))    # True — exact agreement
```

The dots land exactly on the curve — derivation and matrix mechanics are the same physics, and you've now *demonstrated* it rather than believed it. This H–phase–H sandwich is a genuine interferometer: the circuit you'll build with real gates in Module 6, run on real hardware in Module 7 (where the dots will sag below the curve — and the sag *is* decoherence, measurable by you). Keep this script; it becomes your hardware-vs-theory comparison template.
````

## Practice questions

1. Predict shapes: `(np.eye(2) @ np.array([1, 0])).shape` and `np.kron(np.eye(2), np.eye(2)).shape`.
2. One line: 1,000 samples of a fair coin and their mean, seeded.
3. Why does `np.array([1, 0]); psi[1] = 1j` throw an error (or corrupt data), and the fix?
4. `np.linalg.eigh` vs `np.linalg.eig` — when is each correct? (Eigen lesson, code edition.)
5. Write the one-liner testing whether matrix `U` is unitary.
6. Your histogram bars need error bars. Give the `yerr` expression for probabilities `p` (array) from `n` shots.
7. **Design question:** spec a `verify_circuit(gates, ket_in, expected_probs)` helper: argument types, the computation pipeline, what it asserts (with tolerances), and what it prints on failure. This function becomes your Module 7 debugging companion — design it like you'll depend on it (you will).

````solution
1. `(2,)` (matrix @ vector = vector) and `(4, 4)` (kron multiplies dimensions — two qubits' operator space).
2. `print((np.random.default_rng(0).random(1000) < 0.5).mean())`.
3. Int dtype: assigning `1j` into an `int64` array raises `TypeError` (complex into int); with a float it would silently truncate instead. Fix: `np.array([1, 0], dtype=complex)`.
4. `eigh` for Hermitian/observables (guaranteed real, sorted, stable); `eig` for general matrices (e.g., unitaries' complex $e^{i\theta}$ spectrum). Feeding a non-Hermitian matrix to `eigh` silently uses one triangle: wrong, no error.
5. `np.allclose(U.conj().T @ U, np.eye(len(U)))`.
6. `yerr = 2 * np.sqrt(p * (1 - p) / n)`.
7. Model spec: `gates`: list of 2ⁿ×2ⁿ complex arrays, applied left-to-right (i.e., composed as `U = gates[-1] @ ... @ gates[0]`); `ket_in`: 1-D complex array; `expected_probs`: dict of bitstring → prob. Pipeline: assert every gate unitary (`allclose`, atol 1e-10) → compose → `psi_out = U @ ket_in` → `probs = np.abs(psi_out)**2` → compare with expected via `np.isclose(..., atol=1e-8)` per outcome. On failure print: which check failed, the full probability vectors side by side (rounded), and the first differing outcome — *because a failed assert without the two vectors printed is a puzzle, not a diagnosis*. Bonus mark for asserting `ket_in` is normalized and for accepting an optional `atol` parameter: tolerances belong to the caller (simulator-vs-theory wants 1e-8; hardware-vs-theory wants 0.05). That last sentence — different referees for different opponents — is the professional design instinct in one line.
````
