# Numbers, fractions, exponents & logarithms

## The simple version

**In plain English.** Quantum computing reuses a handful of numbers over and over. One is 1/√2, about 0.707, which is the amplitude of a fair 50/50 qubit. Square an amplitude and you get a chance: 0.707 × 0.707 is about 0.5. Another is 2ⁿ, the number of amplitudes that n qubits carry, which doubles with every extra qubit. Tiny numbers like 0.001 (written 10⁻³) describe error rates, and logarithms simply undo powers.

**The everyday picture: rice grains doubling on a chessboard.**

| In the picture | In the real thing |
|---|---|
| One square of the board | One qubit added to the machine |
| Grains on a square: 1, 2, 4, 8 … | Amplitudes to track: 2ⁿ for n qubits |
| Square 31 holds over a billion grains | 30 qubits already need 2³⁰ ≈ 1.07 billion numbers |
| Counting how many doublings got you there | A logarithm: log₂(1,073,741,824) = 30 |

**Where the picture breaks.** Rice grains are things you can pick up one by one. Amplitudes are not little objects inside the chip, and you can't read them out one at a time. The chessboard is also only about growth; it says nothing about squaring an amplitude to get a chance, which is the other habit this lesson builds.

@@diagram:p2-numbers|Left: squaring turns an amplitude into a chance, and the sign disappears. Right: each extra qubit doubles how many numbers describe the state.

## Going deeper

Every formula in quantum computing is built from a small set of number operations, and the field has favorites it uses constantly: $\tfrac{1}{\sqrt{2}}$, $2^n$, $10^{-3}$, $\log_2 N$. This lesson rebuilds them from zero — not as school drills, but as the working vocabulary you'll use to read hardware spec sheets and algorithm complexities. If school math left scars, good news: you only need a curated slice of it, and you'll use every piece within weeks.

## Start here — the intuition

Quantum computing leans on just four number ideas. **$\tfrac{1}{\sqrt2} \approx 0.707$** is the amplitude of an equal superposition — square it and you get $\tfrac12$, a 50% chance. **$2^n$** is how many states $n$ qubits hold, and its growth is *violent* — 30 qubits already beats a billion, 300 qubits beats the number of atoms in the universe. **$10^{-3}$** (scientific notation) is how error rates are written. And **$\log_2 N$** runs $2^n$ backwards: "how many qubits to index $N$ things?"

The one idea that powers the whole measurement rule: a **probability is a squared absolute value** — so it's never negative — while an **amplitude can be negative** (or complex), and *that* difference is what lets quantum outcomes cancel like waves. Hold onto "square the amplitude → get the probability"; it's the arithmetic shape of the Born rule you'll meet in Module 5.

> **School-kid analogy.** Put one grain of rice on the first square of a chessboard, two on the next, four on the next, doubling each time. By square 31 you have over a billion grains on that one square. Every qubit you add is one more square: the number of states doubles each time.

## The essentials, fast

**Absolute value** $|x|$ is distance from zero (sign ignored) — and $p = |a|^2$ is why probabilities are non‑negative. **Exponent laws:** $a^m a^n = a^{m+n}$, $a^0 = 1$, $a^{-n} = \tfrac{1}{a^n}$ (so $10^{-3} = 0.001$), $a^{1/2} = \sqrt a$. Key value: $\tfrac{1}{\sqrt2} = \tfrac{\sqrt2}{2} \approx 0.707$. **Scientific notation** $c \times 10^k$ (Python `2.03e-3`) writes specs; multiply the fronts and add exponents. **Logarithms** ask exponents backwards: $\log_2 8 = 3$ because $2^3 = 8$, and $\log(ab) = \log a + \log b$ — the trick behind estimating how errors compound.

@@diagram:number-line|The number line. Distance from zero is absolute value; direction is sign.

@@widget

## Predict, then run — the numbers quantum lives on

The live cell computes $\tfrac{1}{\sqrt2}$, the $2^n$ growth table, and the qubit counts logs give back.

**Predict first.** How many states does a 30‑qubit machine hold — thousands, millions, or billions? And how many qubits do you need to index a database of a million items? Guess, then Run.

```run
# Live cell — the numbers quantum lives on: 1/sqrt2, 2^n growth, logs.
import math

a = 1 / math.sqrt(2)                       # the equal-superposition amplitude
print("1/sqrt(2) =", round(a, 4), "  its square =", round(a**2, 4), "(a 50% probability)")

print("\nqubits ->  2^n states")           # growth is violent
for n in [10, 20, 30, 50]:
    print(f"  {n:>3}  ->  {2**n:,}")

for N in [1000, 1_000_000, 4_000_000_000]: # logs run it backwards
    print(f"index {N:,} items -> {math.ceil(math.log2(N))} qubits")
```

$\tfrac{1}{\sqrt2}$ squares to $0.5$ (a 50% outcome); 30 qubits already exceed a billion states — which is exactly why classical simulation hits a wall around 30–40 qubits (Module 7 counts the RAM). And $\log_2$ says a million items need only 20 qubits to index, four billion need 32 — every added qubit *doubles* what you can address.

```quiz
{"q":"A qubit outcome has amplitude -1/√2. What is the probability of that outcome?","options":["-0.5, which signals an error","0.5 — the square of the absolute value","0.707","It cannot be computed for negative amplitudes"],"answer":1,"why":"p = |a|² = (1/√2)² = 1/2. The sign vanishes when squaring — negative amplitudes are legal and essential; negative probabilities don't exist."}
```

## Level up — gotchas the pros watch for

- **$\sqrt{a+b} \neq \sqrt a + \sqrt b$** and $(a+b)^2 \neq a^2 + b^2$ — the cross‑term $2ab$ is exactly where interference lives.
- **$2^{-3}$ is not negative** — it's $\tfrac18$ (reciprocal, not negative result).
- **$\log_2$ vs $\ln$.** Python's `math.log` is natural log; use `math.log2` for qubit counts.
- **`1e-3` is scientific notation** ($\times 10^{-3}$), unrelated to Euler's $e$.
- **Float equality.** `0.1 + 0.2 == 0.3` is `False`; compare with a tolerance.

## Level up — reading a real calibration sheet

You're choosing an IBM backend: median two‑qubit gate error $2.03\times10^{-3}$, and your circuit needs 40 two‑qubit gates. Each gate succeeds with probability $\approx 1 - 0.00203$; forty of them is $0.99797^{40}$. Estimate with logs: $40 \times \log(0.99797) \approx -0.081$, so success $\approx e^{-0.081} \approx 0.92$ — about **92%**, before readout errors. The defensible meeting sentence: "gate errors cost ~8% signal here; we're fine at this depth, but doubling depth would start to hurt." Every step was this lesson — scientific notation, exponents, logs, percentages.

## Worked example at real scale — how much RAM does a quantum state need?

A simulator stores one complex amplitude per basis state. In NumPy a `complex128` is 16 bytes (two 8-byte floats). So $n$ qubits need $2^n \times 16$ bytes. Let's size real machines, not toy ones: a 16 GB laptop, a 512 GB server node, and the 50-qubit headline.

```run
# expect: laptop (16 GB) holds 29 qubits
GB = 1e9
for n in (20, 29, 30, 34, 40, 50):
    print(f"{n:2d} qubits -> {2**n * 16 / GB:>18,.3f} GB")

def max_qubits(ram_bytes):
    n = 0
    while 2**(n + 1) * 16 <= ram_bytes:
        n += 1
    return n

print("laptop (16 GB) holds", max_qubits(16 * GB), "qubits")
print("server (512 GB) holds", max_qubits(512 * GB), "qubits")
```

**What to look for.** 30 qubits need about 17.2 GB, so a 16 GB laptop tops out at 29 (and in practice a bit less, because the operating system and the gate arithmetic need room too). A 512 GB node reaches 34. Fifty qubits need about 18 million GB (18 petabytes). Each extra qubit doubles the bill, which is why "just simulate it" stops working in the 30s and why Module 7 introduces tensor-network and sampling tricks.

## Key points

- Probabilities are squared absolute values (never negative); amplitudes *can* be negative — that difference powers interference.
- Exponent laws: add exponents when multiplying same bases; $a^0=1$; $a^{-n}=1/a^n$; $a^{1/2}=\sqrt a$.
- $2^n$ growth is the heart of quantum scaling: ~30 qubits already exceeds a billion states (and your RAM).
- Scientific notation $c\times10^k$ (`2.03e-3`) writes error rates; multiply fronts, add exponents.
- $\log_2 N$ = "qubit‑doublings to reach $N$"; qubits to index $N$ items = $\lceil\log_2 N\rceil$.
- Floats round at the ~16th digit: compare with tolerance, never `==`.

## Check yourself

```quiz
{"q":"Your database has 4 billion (≈ 2³²) entries. Roughly how many qubits are needed to index every entry?","options":["4 billion","32","2 billion","64"],"answer":1,"why":"Indexing N items needs log₂N qubits: log₂(2³²) = 32. Each added qubit doubles the addressable states — that's the whole magic of exponential state space."}
```

```quiz
{"q": "A two-qubit gate has error rate 2×10⁻³ (99.8% fidelity). Roughly what is the chance that a circuit with 100 such gates runs with no gate error at all?", "options": ["About 98%", "About 82%", "About 20%", "About 0.2%"], "answer": 1, "why": "Each gate succeeds with probability 0.998, so 100 in a row succeed with 0.998¹⁰⁰ ≈ 0.819. 98% is what you get if you subtract 100 × 0.0002 (wrong exponent); 20% is 100 × 0.002 = 0.2 read as the success chance instead of the expected number of errors; 0.2% is the single-gate error rate itself. Small per-gate errors compound by multiplication, not addition."}
```

## Exercises

**Exercise 1 — by hand, then verify.** In the live cell, compute and check: (a) $(\tfrac12)^5$, (b) $\tfrac34 + \tfrac16$, (c) $\log_2 64$, (d) $(3\times10^{-3})^2$.

````solution
```python
import math
print((1/2)**5, 3/4 + 1/6, math.log2(64), (3e-3)**2)   # 0.03125 0.9167 6.0 9e-06
```
$(\tfrac12)^5 = \tfrac{1}{32}$; common denominator gives $\tfrac{11}{12}$; $2^6 = 64$ so $\log_2 64 = 6$; and $(c\times10^k)^2 = c^2\times10^{2k}$ — both parts square, the Born rule's arithmetic shape.
````

**Exercise 2 — the error budget.** A circuit uses 100 two‑qubit gates at error $5\times10^{-3}$. Estimate overall success with the log trick. Then: is halving the error rate or halving the gate count better?

````solution
Per‑gate success $0.995$; overall $\approx e^{-100\times0.005} = e^{-0.5} \approx 0.61$ (exact $0.6058$). Halving *either* changes the product gates×error from $0.5$ to $0.25$, giving $e^{-0.25} \approx 0.78$ — **equivalent to first order**. In practice you compare which is *cheaper*: fewer gates is a compiler problem (often free, Module 7), lower error is a physics problem (years, millions). "Product of exposures" is how error budgets are argued.
````

## Practice questions

1. Why can a probability never be negative even though amplitudes can?
2. Simplify $\dfrac{2^{10}\cdot 2^{-4}}{2^{3}}$ to a power of 2, then a number.
3. Write $0.00072$ in scientific notation and as a Python literal.
4. Is $\log_2(1{,}000{,}000)$ closer to 10, 20, or 30? Justify with a power of 2.
5. Outcome "11" occurred 253 times in 1024 shots — as a fraction, decimal, and percentage.
6. Explain to a non‑programmer why `0.1 + 0.2 == 0.3` is `False`.
7. **Design question:** present "why 300 qubits can't be simulated classically" to a manager in three sentences, with the numbers you'd quote.

````solution
1. Probability is $|a|^2$ — a squared distance from zero — non‑negative by construction.
2. $2^{10-4-3} = 2^3 = 8$.
3. $7.2\times10^{-4}$; `7.2e-4`.
4. Closer to 20: $2^{20} = 1{,}048{,}576 \approx 10^6$ (anchor: $2^{10}\approx10^3$).
5. $\tfrac{253}{1024} \approx 0.2471 \approx 24.7\%$.
6. Computers store decimals in binary, and 0.1/0.2 have no exact binary form; the stored values are off by ~$10^{-17}$, so their sum misses 0.3 and `==` demands exactness.
7. "Each qubit doubles the amplitudes we'd track, so 300 qubits means $2^{300} \approx 10^{90}$ numbers — more than the ~$10^{80}$ atoms in the observable universe. Storing one amplitude per atom, using every atom, still falls short by ten orders of magnitude. So past a few dozen qubits we don't simulate quantum computers — we build them."
````

## Interview questions

1. **(junior)** Why does adding one qubit double the memory a state-vector simulator needs?
2. **(mid)** Your team has a 512 GB node. What is the largest exact state-vector simulation you can run, and what would you tell a manager who wants 40 qubits?
3. **(senior)** A vendor quotes 99.9% two-qubit fidelity. Roughly how many two-qubit gates can a circuit have before the chance of an error-free run drops to one half? What does this ignore?

````solution
1. Because $n$ qubits have $2^n$ basis states and the simulator stores one complex amplitude per basis state. Going from $n$ to $n+1$ takes $2^n$ to $2^{n+1}$, exactly double. At 16 bytes per amplitude, 30 qubits is about 17 GB.
2. $2^{34} \times 16 \approx 275$ GB fits; $2^{35} \times 16 \approx 550$ GB does not, so 34 qubits (a bit less in practice for workspace). 40 qubits need about 17.6 TB, 64× more. Options: distribute across many nodes, use a tensor-network or matrix-product-state simulator if the circuit has low entanglement, or sample with a stabilizer simulator if the circuit is mostly Clifford.
3. Solve $0.999^k = 0.5$: $k = \ln 0.5 / \ln 0.999 \approx 693$. So a few hundred two-qubit gates is the practical budget without error correction. It ignores single-qubit and readout errors, crosstalk, idle decoherence during long circuits, and that errors are not all fatal to the answer (some cancel, some are mitigated), so treat it as an order-of-magnitude budget, not a hard wall.
````

## Sources

- NumPy data types (complex128 = two double-precision floats, so 16 bytes; confirm with `np.dtype(np.complex128).itemsize`): https://numpy.org/doc/stable/user/basics.types.html
- M. A. Nielsen and I. L. Chuang, *Quantum Computation and Quantum Information*, 10th anniversary ed., Cambridge University Press (2010), §1.2 (qubits and the $2^n$ state space).

## Mastery checklist — you are ready to move on when you can

- ☐ Explain why $p = |a|^2$ is never negative while amplitudes can be.
- ☐ Use the exponent laws, including $a^{-n}$ and $a^{1/2} = \sqrt a$.
- ☐ Feel the $2^n$ growth and why classical simulation dies ~30–40 qubits.
- ☐ Read and multiply scientific‑notation error rates.
- ☐ Use $\log_2 N$ to get the qubits needed to index $N$ items.
- ☐ Run the live cell and explain why $1/\sqrt2$ squared is a 50% probability.

## In one line

Square an amplitude to get a chance, and remember that every extra qubit doubles the numbers you need.
