# NumPy & matplotlib: math at speed

Here's your professional edge in one sentence: **for the rest of this course, you will verify every quantum computation with NumPy** — every gate, every probability, every interference effect — because a claim you can't check is a claim you don't own. NumPy is Python's array engine (Qiskit is built on it; states and gates *are* NumPy arrays under the hood), and matplotlib turns numbers into the plots your reports and interviews lean on. This lesson completes your toolbox; everything after it is quantum.

## Start here — the intuition

NumPy is the tool that makes math *executable and checkable*. A quantum state is a NumPy array of complex numbers; a gate is a NumPy matrix; "apply the gate" is one symbol, `@`. So instead of trusting a hand calculation or a framework's output, you rebuild it in twenty lines of array arithmetic and see if they agree. **NumPy is your independent referee** — the habit that turns "I think this is right" into "I verified it."

Three reflexes carry the whole lesson. **Vectorize:** operations apply to whole arrays at once (no loops) — `np.abs(psi)**2` gives all the probabilities in one stroke. **Use `@`, never `*`:** `@` is the matrix product (a gate acting on a state); `*` multiplies element‑by‑element and silently produces nonsense. And **`np.vdot` for overlaps** (it conjugates the first argument; `np.dot` doesn't). Get those three and you can check any quantum claim in the course.

## Arrays and the quantum verbs

An array carries `.shape` and `.dtype`; quantum work is `complex128` (a stray missing `1j` shows up as `float64`). Builders: `np.zeros`, `np.eye` (identity = do‑nothing gate), `np.linspace(0, 2*np.pi, 50)` (the parameter‑sweep workhorse). The verbs, each from Module 2:

| Math | NumPy |
|---|---|
| $M\vec v$ (apply gate) | `M @ v` (`*` is the classic bug) |
| $\braket{\phi}{\psi}$ | `np.vdot(phi, psi)` (conjugates first arg) |
| $M^\dagger$ | `M.conj().T` |
| eigen (Hermitian) | `np.linalg.eigh(M)` |
| $A \otimes B$ | `np.kron(A, B)` |
| float‑safe `==` | `np.allclose(A, B)` |

@@diagram:ndarray-shape|Array anatomy: shape (2,) is a vector, (2,2) a matrix, (2,1) a column. Most NumPy confusion is a shape confusion — print .shape first, always.

## Predict, then run — NumPy as referee

The live cell runs a full verification loop (create → phase → interfere) and lints two gates for unitarity/Hermiticity.

**Predict first.** We apply $H$, then $S$, then $H$ to $\ket0$. What probabilities should come out? And is $S$ Hermitian (an observable) or just unitary (a gate)? Guess, then Run.

```run
# Live cell — NumPy is your referee: verify every quantum computation.
import numpy as np
ket0 = np.array([1,0], dtype=complex)
H = np.array([[1,1],[1,-1]]) / np.sqrt(2)
S = np.array([[1,0],[0,1j]])

psi = H @ ket0                       # superposition   (use @, NOT *)
psi = S @ psi                        # 90-degree relative phase
psi = H @ psi                        # interfere
print("state =", np.round(psi, 3))
print("probs =", np.round(np.abs(psi)**2, 3))      # np.abs THEN square

def check(name, U):
    print(f"  {name}: unitary={np.allclose(U.conj().T @ U, np.eye(2))}  "
          f"hermitian={np.allclose(U.conj().T, U)}  eig={np.round(np.linalg.eigvals(U), 3)}")
print("\ngate lint:")
for name, U in [("H", H), ("S", S)]:
    check(name, U)
```

That's the S‑gate phase experiment from the Dirac lesson, executed: $H, S, H$ on $\ket0$ gives $[0.5{+}0.5i,\ 0.5{-}0.5i]$, probabilities 50/50. And the linter confirms $H$ is unitary *and* Hermitian (a gate and an observable) while $S$ is unitary‑only with eigenvalues $\{1, i\}$ on the unit circle — a pure evolver. Compose, check unitarity, apply, square moduli: that's how you'll debug real circuits against theory in Module 7.

```quiz
{"q":"psi = np.array([0.6, 0.8j]). Which line computes the measurement probabilities correctly?","options":["psi ** 2","np.abs(psi) ** 2 — modulus first, then square","psi * psi","np.vdot(psi, psi)"],"answer":1,"why":"psi**2 squares complex amplitudes keeping phase ((0.8j)² = −0.64: a negative 'probability'). |z|² needs the modulus: np.abs. (vdot(psi,psi) gives the SUM of probabilities — 1.0 — not the individual ones.)"}
```

## matplotlib — numbers into figures

`matplotlib.pyplot` (aliased `plt`) makes every plot you need: **bar charts** for measurement histograms (`plt.bar(labels, probs, yerr=err)`) and **line plots** for sweeps (`plt.plot(theta, np.cos(theta/2)**2)`). The professional minimum, non‑negotiable in this course: **labeled axes, units, error bars on measured quantities, a legend.** An unlabeled plot in a portfolio review reads as "not ready."

## Level up — gotchas the pros watch for

- **`*` vs `@`.** `M * v` multiplies element‑wise (shapes may even work out, values silently wrong); gates apply with `@`.
- **`np.dot` on complex vectors.** No conjugation → wrong overlaps; use `np.vdot` (or `np.linalg.norm` for norms).
- **Shape confusion.** (2,) vs (2,1) vs (1,2) differ; `print(x.shape)` before blaming the math.
- **Integer dtype trap.** `np.array([1,0])` is `int64`; assigning `0.707` truncates to 0 — create with `dtype=complex`.
- **Copy vs view.** Slices are views; `.copy()` when you mean copy.
- **Plot without labels/errors.** A credibility bug, not a code bug.

## Level up — "the simulator disagrees with my math"

Future you (Module 7): a 2‑qubit simulator says $p(01) = 0.25$ but your hand math says 0. You bisect with NumPy — build the state with `np.kron`, apply each gate with `@`, print `np.round(psi, 4)` after every step — and find that your CNOT matrix assumed the *left* qubit is the control while Qiskit numbers from the *right*. One `np.kron` swap later, all three agree. The method is the moral: when framework and intuition disagree, twenty lines of array arithmetic settle it — people without this referee stay confused for days; people with it file precise bug reports.

## Key points

- Arrays carry `.shape` and `.dtype`; quantum work is `complex128` — check both before your math.
- Vectorize: element‑wise ops, `np.abs(psi)**2` for probabilities, `linspace` for sweeps.
- Verbs: `@` (apply/compose), `np.vdot` (overlap), `M.conj().T` (dagger), `eigh` (observables), `np.kron` (combine qubits), `np.allclose` (float‑safe `==`).
- `*` is element‑wise, `@` is matrix — the most damaging one‑character bug in quantum NumPy.
- matplotlib minimum: labeled axes, units, error bars, legend.
- NumPy is your referee: verify every framework result and hand‑derivation against it.

## Check yourself

```quiz
{"q":"H @ v and H * v differ how?","options":["They're identical for 2×2 H","@ is the matrix product (a gate acting on a state); * is element-wise multiplication with broadcasting — wrong values, often silently","* is faster but equivalent","@ only works for square matrices"],"answer":1,"why":"H @ v computes row-dot-column (real linear algebra). H * v multiplies entry-by-entry, broadcasting shapes — it runs without error and produces meaningless 'states', which is what makes it dangerous."}
```

## Exercises

**Exercise 1 — the gate‑zoo verifier.** In the live cell, extend `check` to X, Y, Z as well. Present unitarity, Hermiticity, and eigenvalues for all five. Reconcile S's result with the eigen lesson in one line.

````solution
```python
import numpy as np
gates = {"X":np.array([[0,1],[1,0]],complex), "Y":np.array([[0,-1j],[1j,0]]),
         "Z":np.array([[1,0],[0,-1]],complex), "H":np.array([[1,1],[1,-1]])/np.sqrt(2),
         "S":np.array([[1,0],[0,1j]])}
for n,U in gates.items():
    print(n, "unitary", np.allclose(U.conj().T@U, np.eye(2)),
          "hermitian", np.allclose(U.conj().T, U), np.round(np.linalg.eigvals(U),3))
```
X, Y, Z, H are the ±1‑spectrum club (gate *and* observable); S is unitary‑only with eigenvalues $\{1, i\}$ on the unit circle but off the real line — it evolves states yet defines no measurement. You now have a reusable gate‑linter for your custom gates in Module 7.
````

**Exercise 2 — interference, swept.** Verify $p(0) = \cos^2(\varphi/2)$ *matricially*: for 60 values of $\varphi$, build $P(\varphi) = \mathrm{diag}(1, e^{i\varphi})$, compute $H\,P(\varphi)\,H\ket0$, extract $p(0)$, and check it equals the theory to float precision.

````solution
```python
import numpy as np
ket0 = np.array([1,0], complex); H = np.array([[1,1],[1,-1]])/np.sqrt(2)
phis = np.linspace(0, 2*np.pi, 60)
p0 = [abs((H @ np.array([[1,0],[0,np.exp(1j*phi)]]) @ H @ ket0)[0])**2 for phi in phis]
print(np.allclose(p0, np.cos(phis/2)**2))    # True -- exact agreement
```
Derivation and matrix mechanics are the same physics — now demonstrated, not believed. This H–phase–H sandwich is a real interferometer; on hardware (Module 7) the points sag below the curve, and the sag *is* decoherence, measurable by you.
````

## Practice questions

1. Predict shapes: `(np.eye(2) @ np.array([1,0])).shape` and `np.kron(np.eye(2), np.eye(2)).shape`.
2. One line: 1,000 fair‑coin samples and their mean, seeded.
3. Why does `psi = np.array([1,0]); psi[1] = 1j` error or corrupt, and the fix?
4. `eigh` vs `eig` — when each?
5. One‑liner testing whether `U` is unitary.
6. `yerr` expression for probabilities `p` (array) from `n` shots.
7. **Design question:** spec `verify_circuit(gates, ket_in, expected_probs)` — argument types, the pipeline, what it asserts (with tolerances), and what it prints on failure.

````solution
1. `(2,)` and `(4,4)`.
2. `print((np.random.default_rng(0).random(1000) < 0.5).mean())`.
3. `int64` array: assigning `1j` raises `TypeError` (a float would silently truncate). Fix: `dtype=complex`.
4. `eigh` for Hermitian/observables (real, sorted, stable); `eig`/`eigvals` for general matrices (unitaries' $e^{i\theta}$ spectrum).
5. `np.allclose(U.conj().T @ U, np.eye(len(U)))`.
6. `2 * np.sqrt(p * (1 - p) / n)`.
7. `gates`: list of $2^n\times2^n$ complex arrays composed left‑to‑right; `ket_in`: 1‑D complex; `expected_probs`: dict bitstring→prob. Pipeline: assert each gate unitary (atol 1e‑10) → compose → `psi = U @ ket_in` → `probs = np.abs(psi)**2` → compare per outcome (`np.isclose`). On failure print which check failed, the two probability vectors side by side, and the first differing outcome. Accept an optional `atol` — simulator‑vs‑theory wants 1e‑8, hardware‑vs‑theory wants 0.05: different referees for different opponents.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Create complex arrays and check `.shape`/`.dtype` before computing.
- ☐ Apply a gate with `@`, and get probabilities with `np.abs(psi)**2`.
- ☐ Use `np.vdot` for overlaps and `M.conj().T` for the dagger.
- ☐ Run the live cell and lint a gate for unitarity/Hermiticity.
- ☐ Make a labeled bar chart with error bars and a line‑plot sweep.
- ☐ Use NumPy as a referee to reconcile framework output with hand math.
