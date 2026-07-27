# Numbers, fractions, exponents & logarithms

Every formula in quantum computing is built from a small set of number operations, and the field has favorites it uses constantly: $\tfrac{1}{\sqrt{2}}$, $2^n$, $10^{-3}$, $\log_2 N$. This lesson rebuilds them from zero — not as school drills, but as the working vocabulary you'll use to read hardware spec sheets and algorithm complexities. If school math left scars, good news: you only need a curated slice of it, and you'll use every piece within weeks.

## 1. The number line, negatives & absolute value

Numbers live on a line: negatives left of zero, positives right.

@@diagram:number-line|The number line. Distance from zero is absolute value; direction is sign.

- **Adding** moves you right (positive) or left (negative): $3 + (-5) = -2$.
- **Multiplying by a negative flips direction**: $(-2) \times 3 = -6$, and $(-2)\times(-3) = 6$ (two flips = back to positive).
- **Absolute value** $|x|$ is distance from zero, ignoring direction: $|-7| = 7$, $|3| = 3$.

Why quantum cares: amplitudes can be negative (that's how cancellation works), but *probabilities* come from a squared absolute value — always non-negative. The whole measurement rule of quantum mechanics ($p = |a|^2$, Module 5) leans on these two ideas.

## 2. Fractions — division you haven't done yet

$\tfrac{3}{4}$ means "3 divided by 4", i.e. $0.75$. Rules, with the *why*:

| Operation | Rule | Why it works |
|---|---|---|
| Multiply | $\frac{a}{b}\cdot\frac{c}{d} = \frac{ac}{bd}$ | "a quarter of a half" = quarter × half |
| Divide | $\frac{a}{b} \div \frac{c}{d} = \frac{a}{b}\cdot\frac{d}{c}$ | dividing by x = multiplying by 1/x |
| Add/subtract | need a **common denominator**: $\frac{1}{2}+\frac{1}{3} = \frac{3}{6}+\frac{2}{6}=\frac{5}{6}$ | can only count pieces of the same size |
| Simplify | cancel common factors: $\frac{6}{8} = \frac{3}{4}$ | multiplying top & bottom by the same thing changes nothing |

**Percentages are fractions in costume**: $x\% = \tfrac{x}{100}$. So a 2.5% error rate is $0.025$; and a probability of $0.5$ is 50%. You'll translate between these constantly when reading measurement histograms.

## 3. Exponents — repeated multiplication and far beyond

$2^3 = 2\cdot2\cdot2 = 8$. The base rules (memorize by *using*, not chanting):

$$a^m \cdot a^n = a^{m+n} \qquad \frac{a^m}{a^n} = a^{m-n} \qquad (a^m)^n = a^{mn}$$

Three extensions that scare people but follow logically:

- $a^0 = 1$ — because $a^n / a^n = a^{n-n} = a^0$ and anything divided by itself is 1.
- $a^{-n} = \frac{1}{a^n}$ — negative exponent means "divide instead of multiply": $10^{-3} = 0.001$.
- $a^{1/2} = \sqrt{a}$ — because $(a^{1/2})^2 = a^{1}$, so $a^{1/2}$ is the number that squares to $a$.

**Roots**: $\sqrt{a}$ is the non-negative number whose square is $a$. Key values you'll see weekly: $\sqrt{2} \approx 1.414$, so $\tfrac{1}{\sqrt 2} \approx 0.707$. Useful identity: $\tfrac{1}{\sqrt 2} = \tfrac{\sqrt 2}{2}$ (multiply top and bottom by $\sqrt 2$).

**Why $2^n$ rules quantum computing**: $n$ qubits have $2^n$ basis states (Module 6). The growth is violent and you should feel it:

| $n$ qubits | $2^n$ states |
|---|---|
| 10 | 1,024 |
| 20 | ~1 million |
| 30 | ~1 billion |
| 50 | ~$10^{15}$ (a quadrillion) |
| 300 | more than atoms in the observable universe |

This single table explains both why quantum computers might be powerful *and* why simulating them classically hits a wall around 30–40 qubits (Module 7 makes this concrete in RAM gigabytes).

## 4. Scientific notation — the language of spec sheets

Very large/small numbers get written as $c \times 10^k$: the speed of light is $3\times 10^8$ m/s; a good two-qubit gate error rate is $2.03 \times 10^{-3}$ (that's $0.00203$, about 1 error per 500 gates). Python writes this as `2.03e-3`.

To multiply, multiply the fronts and add the exponents: $(2\times10^{-3})\cdot(3\times10^{-3}) = 6\times10^{-6}$. You'll do exactly this when estimating how errors compound through a circuit.

## 5. Logarithms — exponents asked backwards

$\log_2 8$ asks: "2 to *what power* gives 8?" Answer: 3. That's all a logarithm is.

$$\log_2(2^n) = n \qquad 2^{\log_2 x} = x$$

The rules mirror exponent rules (because they *are* exponent rules, reversed):

$$\log(ab) = \log a + \log b \qquad \log(a/b) = \log a - \log b \qquad \log(a^k) = k\log a$$

Where you'll use it, concretely:

- "How many qubits to represent $N$ possibilities?" → $\lceil\log_2 N\rceil$ (the ceiling — round up). A database of 1,000,000 items needs $\log_2 10^6 \approx 20$ qubits to index.
- Algorithm costs: Grover's search does about $\sqrt N$ steps; Shor's factoring runs in time polynomial in $\log N$ (the number of *digits*, not the size of the number) — that gap is the entire drama of Module 8.
- Decibels, error budgets, and "orders of magnitude" talk in engineering meetings.

## Worked example — the most famous number in quantum computing

The equal-superposition amplitude is $\tfrac{1}{\sqrt 2}$. Let's own it completely.

**By hand.** Its decimal: $\sqrt 2 \approx 1.41421$, so $\tfrac{1}{\sqrt2} \approx 0.70711$. Its square, by exponent rules: $\left(\tfrac{1}{\sqrt 2}\right)^2 = \tfrac{1^2}{(\sqrt2)^2} = \tfrac{1}{2}$. So if a qubit has amplitude $\tfrac{1}{\sqrt2}$ on outcome "0", the probability of measuring 0 is $|0.7071|^2 = 0.5 = 50\%$. And two such outcomes give total probability $\tfrac12 + \tfrac12 = 1$ ✓ — probabilities must sum to 1, and they do. You've just pre-verified the smoke-test output from the setup lesson (`{'0': 0.4999…, '1': 0.4999…}`) with pure arithmetic.

**In Python** (type it — the habit starts now):

```python
import math
a = 1 / math.sqrt(2)
print(a)          # 0.7071067811865475
print(a ** 2)     # 0.4999999999999999  ← not exactly 0.5!
```

That `0.4999…` is not a math error — computers store decimals in binary with finite precision, so tiny rounding appears (about $10^{-16}$ relative error). Professionals compare floats with tolerances, never with `==`. You'll meet this again in Module 4; today, just recognize it so it never spooks you.

## Gotchas

- **$\sqrt{a+b} \ne \sqrt a + \sqrt b$.** Check: $\sqrt{9+16}=5$ but $3+4=7$. Roots don't distribute over addition; neither does squaring: $(a+b)^2 = a^2 + 2ab + b^2$, not $a^2+b^2$. This exact mistake breaks quantum probability calculations (cross-terms are where interference lives!).
- **$2^{-3}$ is not negative.** It's $\tfrac18$. Negative exponent = reciprocal, not negative result.
- **$\log_2$ vs $\log_{10}$ vs $\ln$.** Same idea, different base (CS defaults to base 2, Python's `math.log` defaults to natural log $\ln$; use `math.log2`). Off-by-base errors silently wreck qubit-count estimates.
- **Dividing fractions by "dividing across".** $\tfrac{1}{2} \div \tfrac{1}{4}$ is $2$ (how many quarters fit in a half), not $\tfrac{1}{8}$. Flip-and-multiply.
- **Reading `1e-3` as "1 times e".** In code, `e` is scientific notation ($\times 10^{k}$), unrelated to Euler's number $e\approx2.718$ (which you'll meet properly in Module 2).
- **Trusting float equality.** `0.1 + 0.2 == 0.3` is `False` in Python. Compare with a tolerance (`abs(x - y) < 1e-9`).

## Scenario — reading a real calibration sheet

You're evaluating which IBM backend to use. The calibration data says: median two-qubit gate error $2.03\times10^{-3}$, readout error $1.2\times10^{-2}$, and your circuit needs 40 two-qubit gates and one readout per qubit. Quick professional arithmetic: each two-qubit gate *succeeds* with probability about $1 - 0.00203 = 0.99797$. Forty of them: $0.99797^{40}$. Using logs to estimate (log of a product = sum of logs): $40 \times \log(0.99797) \approx 40\times(-0.00203) = -0.0812$, so success $\approx e^{-0.0812}\approx 0.922$ — roughly **92%**, before even counting the ~1% readout errors. Conclusion you can defend in a meeting: "gate errors will cost us about 8% signal; readout adds another point or so; we're fine at this depth, but doubling circuit depth would start to hurt." Every step was this lesson: scientific notation, exponents, logs, percentages.

### ▶ Run it live

The most famous number in quantum computing, computed in your browser (click **Run** — the Python runtime loads once):

```run
# expect: 0.7071
import math
print("1/sqrt(2) =", round(1/math.sqrt(2), 4))
print("its square =", round((1/math.sqrt(2))**2, 4), "(a 50% probability)")
```

## Key points

- Probabilities are squared absolute values, so they're never negative; amplitudes *can* be negative — that difference powers interference.
- Exponent laws: add exponents when multiplying same bases; $a^0=1$; $a^{-n}=1/a^n$; $a^{1/2}=\sqrt a$.
- $2^n$ growth is the heart of quantum scaling: ~30 qubits already exceeds a billion states (and your RAM).
- Scientific notation $c\times10^k$ (code: `2.03e-3`) is how error rates and specs are written; multiply fronts, add exponents.
- $\log_2 N$ = "how many qubit-doublings to reach $N$"; qubits needed to index $N$ items = $\lceil\log_2 N\rceil$.
- Floats round at the ~16th digit: compare with tolerance, never `==`.

## Check yourself

```quiz
{"q":"A qubit outcome has amplitude -1/√2. What is the probability of that outcome?","options":["-0.5, which signals an error","0.5 — the square of the absolute value","0.707","It cannot be computed for negative amplitudes"],"answer":1,"why":"p = |a|² = (1/√2)² = 1/2. The sign vanishes when squaring — negative amplitudes are legal and essential; negative probabilities don't exist."}
```

```quiz
{"q":"Your database has 4 billion (≈ 2³²) entries. Roughly how many qubits are needed to index every entry?","options":["4 billion","32","2 billion","64"],"answer":1,"why":"Indexing N items needs log₂N qubits: log₂(2³²) = 32. Each added qubit doubles the addressable states — that's the whole magic of exponential state space."}
```

## Exercises

**Exercise 1 — by hand, then verify.** Compute without a calculator: (a) $\left(\tfrac{1}{2}\right)^{5}$, (b) $\tfrac{3}{4}+\tfrac{1}{6}$, (c) $\log_2 64$, (d) $(3\times10^{-3})^2$. Then verify all four in Python.

````solution
(a) $\left(\tfrac12\right)^5 = \tfrac{1}{2^5} = \tfrac{1}{32} = 0.03125$.

(b) Common denominator 12: $\tfrac{9}{12} + \tfrac{2}{12} = \tfrac{11}{12} \approx 0.9167$.

(c) $2^6 = 64$, so $\log_2 64 = 6$.

(d) Square the front, double the exponent's action: $9\times10^{-6}$ — i.e. 0.000009.

```python
import math
print((1/2)**5)              # 0.03125
print(3/4 + 1/6)             # 0.9166666666666666
print(math.log2(64))         # 6.0
print((3e-3)**2)             # 9e-06
```

If (d) tripped you: $(c\times10^k)^2 = c^2 \times 10^{2k}$ — both parts get squared. This pattern (square the amplitude-like part) is literally the Born rule's arithmetic shape.
````

**Exercise 2 — the error-budget estimate.** A circuit uses 100 two-qubit gates, each with error rate $5\times10^{-3}$. (a) Estimate the overall success probability using the log/exponent trick from the Scenario. (b) The team can halve the error rate OR halve the gate count. Which helps more, and what does the math say?

````solution
(a) Per-gate success $= 1 - 0.005 = 0.995$. Overall $\approx 0.995^{100}$. Log-estimate: $100 \times (-0.005) = -0.5$, so success $\approx e^{-0.5} \approx 0.607$ — about **61%**. (Exact: $0.995^{100} = 0.6058$; the estimate is excellent because errors are small.)

(b) They're mathematically **equivalent to first order**: success $\approx e^{-(\text{gates} \times \text{error})}$, and both options change the product gates×error from $0.5$ to $0.25$, giving $e^{-0.25}\approx 0.779$ either way. The professional follow-up: in practice you compare *which is cheaper to achieve* — halving gate count is a compiler/algorithm problem (often free-ish, Module 7's transpiler), halving hardware error is a physics problem (years and millions). This "product of exposures" reasoning is exactly how error budgets are argued in real teams.
````

## Practice questions

1. Why can a probability never be negative even though amplitudes can?
2. Simplify $\dfrac{2^{10}\cdot 2^{-4}}{2^{3}}$ to a single power of 2, then to a number.
3. Write $0.00072$ in scientific notation and as Python float literal.
4. Without a calculator: is $\log_2(1{,}000{,}000)$ closer to 10, 20, or 30? Justify with a power of 2 you know.
5. A histogram shows outcome "11" occurred 253 times in 1024 shots. Express that as a fraction, decimal, and percentage.
6. Explain to a non-programmer why `0.1 + 0.2 == 0.3` is `False` in Python, in two sentences.
7. **Design question:** you must present "why 300 qubits can't be simulated classically" to a manager in 60 seconds using only this lesson's math. Draft the three sentences you'd say, with the numbers you'd quote.

````solution
1. Probability is $|a|^2$ — a squared distance from zero — and squares of real (or absolute values of complex) numbers are non-negative by construction.
2. $2^{10-4-3} = 2^3 = 8$.
3. $7.2\times10^{-4}$; in Python `7.2e-4`.
4. Closer to 20: $2^{20} = 1{,}048{,}576 \approx 10^6$. (Handy anchor: $2^{10}\approx10^3$.)
5. $\tfrac{253}{1024} \approx 0.2471 \approx 24.7\%$.
6. Computers store decimals in binary, and 0.1 and 0.2 have no exact binary representation — like ⅓ has no exact decimal. The stored values are off by ~$10^{-17}$, so their sum misses 0.3 by a hair, and `==` demands exactness.
7. Model answer: "Each qubit doubles the number of amplitudes we'd have to track, so 300 qubits means $2^{300}$ numbers — that's about $10^{90}$, more numbers than there are atoms in the observable universe (~$10^{80}$). Even storing one amplitude per atom, using every atom that exists, falls short by ten orders of magnitude. So past a few dozen qubits we don't simulate quantum computers — we have to build them." (Three sentences, two quotable numbers, one punchline — that's the format executives remember.)
````
