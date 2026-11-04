# Python I: variables, types & control flow

## The simple version

**In plain English.** Python is the language you'll use to write quantum programs. A variable is a name you give to a value, like total = 0. Every value has a type: whole numbers, decimals, text and True/False. An if statement picks which lines run, and a loop runs the same lines again and again. With just these pieces you can already count, add up and make decisions.

**The everyday picture: following a recipe with sticky notes.**

| In the picture | In the real thing |
|---|---|
| A sticky note with a name on it | A variable: a name attached to a value |
| Crossing out a note's number and writing a new one | Reassigning: total = total + k |
| 'If the oven is hot, put the tray in' | An if statement |
| 'Stir 4 times' | A for loop: for k in range(1, 5) |
| Reading the recipe top to bottom | Python running lines in order |

**Where the picture breaks.** A cook can guess what you meant. Python can't: one wrong indent or a missing colon stops the program or, worse, changes which lines are inside the loop. A Python variable is also a label on a value, not a box holding it, which matters later when two names point at the same list.

@@diagram:p2-python-basics|Tracing the loop: k takes the values 1, 2, 3, 4 and total becomes 1, 3, 6, 10. Writing a trace table like this is the fastest way to debug a loop.

## Going deeper

Python is the native language of quantum computing — Qiskit, Cirq, PennyLane, every major framework speaks it. It's also the most beginner‑friendly serious language ever built, which is why we can go from "never coded" to "reading quantum SDK source" in four lessons. Today: your first programs, the data types (including Python's built‑in complex numbers — a gift to our field), decisions, and loops. **Reading code is not learning code — run every cell.**

## Start here — the intuition

Programming is just three ideas stacked together. **Variables** are labels you stick on values (`shots = 1024`). **Types** are the *kind* of value — whole numbers (`int`), decimals (`float`), text (`str`), true/false (`bool`), and — a gift for us — `complex` numbers built right into the language. **Control flow** is how a program makes choices (`if`) and repeats work (`for`, `while`) instead of you copy‑pasting.

The single most important habit to build today: the **accumulator loop** — start a running total, update it a little each time around, read it at the end. Counting measurement outcomes, summing a series, estimating an expectation value — they're all this one shape. And the best cell in this lesson builds a *qubit measurement simulator* from nothing but a loop and a coin flip.

> **School-kid analogy.** Python is a recipe written for a very literal cook. It does exactly what each line says, top to bottom, and nothing else. A loop is "stir 10 times"; an `if` is "if the sauce is too thick, add water".

## Variables, types, and operators

A variable is a label stuck on a value; `snake_case` names, created with `=` (which is assignment — comparison is `==`). Every value has a type, revealed by `type()`: `int` (unlimited size), `float` (~16 digits — Module 1's dust), `str`, `bool`, and native `complex` (`z.real`, `z.conjugate()`, `abs(z)` all just work). Number operators: `+ - *`, true division `/` (always float), floor division `//` and remainder `%` (parity checks, angle wrapping, and Shor's modular arithmetic), and power `**` (your $2^n$ key). **f‑strings** are how you format output: `f"p(00) = {p:.3f} ({p*100:.1f}%)"`.

## Decisions and loops

`if / elif / else` chooses one branch (first true condition wins); the colon opens a block and **indentation IS the syntax** (four spaces). `for k in range(n)` iterates $0..n-1$ (end‑exclusive, matching $\sum_{k=0}^{n-1}$); `while` repeats until a condition fails; `break`/`continue` steer.

@@diagram:py-flow|Control flow: conditions choose one path (if/elif/else); loops send execution back around (for/while) until done.

## Predict, then run — a qubit measurement, from scratch

The live cell builds a measurement simulator with only a loop and `random` — the same thing Qiskit's samplers do, minus the hardware.

**Predict first.** We flip a biased coin 1000 times with $P(1) = 0.3$ and count the ones. Roughly what fraction should come out? And will running it twice give the *same* number (note the `seed`)? Guess, then Run.

```run
# Live cell — simulate a qubit measurement from scratch (a loop + an accumulator).
import random
random.seed(7)                       # reproducibility -- a professional default

p1 = 0.3                             # P(measure 1) = |beta|^2 of some state
shots = 1000
count_ones = 0
for shot in range(shots):
    if random.random() < p1:        # random.random() is uniform in [0, 1)
        count_ones += 1

estimate = count_ones / shots
se = (estimate * (1 - estimate) / shots) ** 0.5
print(f"p_hat(1) = {estimate:.3f} +/- {2*se:.3f}   (true: {p1})")
```

Ten lines, and you've written a loop of Bernoulli trials, an accumulator (`count_ones += 1`), the standard‑error formula, and an f‑string report with error bars — all four threads of this course. This is structurally what a real quantum sampler does; when you meet Qiskit's in Module 7, it'll feel like an old friend with better hardware.

```quiz
{"q":"What does this print?  for k in range(3): print(2**k)","options":["1 2 4 (on separate lines)","2 4 8","1 2 4 8","0 1 2"],"answer":0,"why":"range(3) yields k = 0, 1, 2, and 2⁰=1, 2¹=2, 2²=4. Zero-indexed, end-exclusive — always."}
```

## Level up — gotchas the pros watch for

- **`=` vs `==`.** Assignment vs comparison; `p == 0.5` on its own line silently does nothing.
- **Indentation drift.** Mixing tabs/spaces or un‑indenting a line changes *meaning* — configure your editor to 4 spaces.
- **`range(n)` off‑by‑one.** Ends at $n-1$; "1 to 10 inclusive" is `range(1, 11)`.
- **Float `==`.** Never — `0.1 + 0.2 != 0.3`; use `abs(a-b) < 1e-9` or `math.isclose(a, b)`.
- **`/` vs `//`.** `7/2 = 3.5`, `7//2 = 3`; qubit indices want `//`, probabilities want `/`.
- **Shadowing built‑ins.** Naming a variable `sum`, `list`, or `max` buries the function for the session.

## Level up — the shot-budget calculator you'll reuse

Module 3's shot‑sizing formula, productized: how many shots for ±ε precision on a probability near $p$? A tiny loop over precisions with a helper answers it forever — and Module 7 will import this logic before real hardware runs. Twenty minutes into loops and you own a tool working engineers reach for weekly.

## Key points

- Variables are labels; core types are `int`, `float`, `str`, `bool`, and native `complex` (matching Module 2 exactly).
- `if/elif/else` with colon + 4‑space indentation; first true branch wins; indentation is syntax.
- `for k in range(n)` iterates $0..n-1$; `while` repeats until a condition fails; `break`/`continue` steer.
- The accumulator pattern (init → update in loop → read after) implements every sum, count, and average.
- Floats compare by tolerance (`math.isclose`), never `==`; `/` vs `//` is a deliberate choice.
- f‑strings (`f"{x:.3f}"`) are your output voice.

## Check yourself

```quiz
{"q":"Why is  abs(p - 0.5) < 1e-9  preferred over  p == 0.5  when p came from arithmetic?","options":["It runs faster","Floating-point arithmetic carries ~16th-digit rounding, so exact equality fails for mathematically-equal values; tolerance comparison is robust","== is not valid Python for floats","abs() converts p to an integer"],"answer":1,"why":"0.1 + 0.2 ≠ 0.3 in float-land by ~1e-17. Any float produced by computation must be compared within a tolerance (or with math.isclose)."}
```

```quiz
{"q": "What does  print(0.1 + 0.2 == 0.3)  print in Python?", "options": ["True", "False", "0.3", "An error"], "answer": 1, "why": "Floats are stored in binary, and 0.1 and 0.2 have no exact binary form, so 0.1 + 0.2 is 0.30000000000000004. 'True' assumes exact decimal arithmetic. '0.3' confuses printing the sum with printing the comparison. Nothing errors; the comparison is legal, just unreliable. Compare floats with a tolerance, e.g. math.isclose(a, b)."}
```

## Exercises

**Exercise 1 — FizzBuzz, quantum edition.** In the live cell, loop `n` from 1 to 20 and print `n` with `"Z"` if divisible by 3, `"X"` if by 5, `"ZX"` if both. (Use two independent `if`s building a string, not `if/elif`.)

````solution
```python
for n in range(1, 21):
    label = ""
    if n % 3 == 0: label += "Z"
    if n % 5 == 0: label += "X"
    print(n, label)
```
Two independent `if`s handle "both" for free (`elif` would wrongly make them exclusive); `label += ...` is the accumulator pattern in text clothes. 15 → `ZX`.
````

**Exercise 2 — Grover iteration counter.** Grover needs about $\tfrac{\pi}{4}\sqrt N$ iterations for $N = 2^{\text{qubits}}$. Loop `n_qubits` from 2 to 20 and print a table of qubits, $N$, and rounded iterations. How many iterations at 20 qubits?

````solution
```python
import math
for n in range(2, 21):
    N = 2**n
    print(f"{n:>3} {N:>12,} {round(math.pi/4*math.sqrt(N)):>10,}")
# 20 qubits -> N ~ 1,048,576 -> ~804 iterations: a million-item search in 804 steps.
```
Answering "when does X exceed Y" by printing a table and looking — before reaching for algebra — is a real professional habit.
````

## Practice questions

1. Difference between `7 / 2`, `7 // 2`, `7 % 2` — values and types?
2. Predict: `x = 5; x += 3; x *= 2; print(x)`.
3. One‑line condition that checks `p` is a valid probability.
4. Why does `while p > 0.01:` risk an infinite loop that `for k in range(100):` cannot? What guard?
5. What does `f"{0.4871:.1%}"` produce?
6. A loop prints nothing when you expected 10 lines — three one‑glance checks?
7. **Design question:** sketch a "device health check": given `error_rate`, `queue_len`, `t_since_cal`, print exactly one of `"submit"`, `"submit with caution"`, `"wait"` with justified thresholds.

````solution
1. `3.5` (float), `3` (int), `1` (int).
2. `16` — 8, then ×2.
3. `0 <= p <= 1`.
4. If the body never makes the condition false, `while` spins forever; `range` has a built‑in end. Guard: a max‑iteration counter (`and steps < 10_000`).
5. `'48.7%'`.
6. Is the body indented under the `for`? Is the range empty (`range(10, 5)`)? Did an earlier cell fail so the kernel needs a restart?
7. `if error_rate < 0.005 and queue_len < 50 and t_since_cal < 24: "submit"` / `elif error_rate < 0.01 and queue_len < 100: "submit with caution"` / `else: "wait"` — conditions ordered strictest to loosest, thresholds in comments.
````

## Interview questions

1. **(junior)** What is the difference between `=` and `==` in Python?
2. **(mid)** Your sampling script gives slightly different counts every run, and a test that checks the counts is flaky. How do you fix it without weakening the test?
3. **(senior)** A colleague wants to estimate a probability near 0.5 to within ±1% at about 95% confidence. How many shots, and how does the answer change for ±0.1%?

````solution
1. `=` assigns: `shots = 1000` stores 1000 under the name `shots`. `==` compares and returns `True` or `False`. Writing `if shots = 1000:` is a syntax error in Python, which is a feature: it stops a classic bug.
2. Seed the random generator, for example `rng = np.random.default_rng(42)`, and pass `rng` into the sampling code so every run draws the same numbers. For tests that must use fresh randomness, assert within a statistical tolerance (for example within 4 standard errors of the expected probability) instead of exact counts.
3. Standard error is $\sqrt{p(1-p)/n}$; for 95% use about 2 standard errors, so $n \ge 4p(1-p)/\varepsilon^2 = 4(0.25)/0.01^2 = 10{,}000$ shots. For ±0.1% it is $10^6$ shots: 10× the precision costs 100× the shots. On a cloud QPU with a monthly time budget, that square-root law decides which experiments are affordable.
````

## Sources

- Python tutorial, floating-point arithmetic: https://docs.python.org/3/tutorial/floatingpoint.html
- `math.isclose`: https://docs.python.org/3/library/math.html#math.isclose
- NumPy random Generator (`default_rng`, seeding): https://numpy.org/doc/stable/reference/random/generator.html

## Mastery checklist — you are ready to move on when you can

- ☐ Create variables and name the five core types, including native `complex`.
- ☐ Use `/`, `//`, `%`, `**` correctly and format output with f‑strings.
- ☐ Write `if/elif/else` with correct indentation, and explain "first true branch wins."
- ☐ Write a `for` loop over `range` and a `while` loop with a termination guard.
- ☐ Run the live cell and explain the accumulator pattern in it.
- ☐ Compare floats safely and choose `/` vs `//` deliberately.

## In one line

Variables name values, if statements choose, and loops repeat, and that is enough to start programming.
