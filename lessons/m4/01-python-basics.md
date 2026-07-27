# Python I: variables, types & control flow

Python is the native language of quantum computing — Qiskit, Cirq, PennyLane, every major framework speaks it. It's also the most beginner-friendly serious language ever built, which is why we can go from "never coded" to "reading quantum SDK source" in four lessons. Today: your first programs, the data types (including Python's built-in complex numbers — a gift to our field), decisions, and loops. Type everything. **Reading code is not learning code.**

## 1. Running Python: three doors

With your venv active (setup lesson ritual), you have three ways in:

| Door | Start it | Best for |
|---|---|---|
| REPL | `python` in terminal | one-liners, experiments (exit: `exit()`) |
| Script | save `hello.py`, run `python hello.py` | real programs, anything reusable |
| Notebook | `jupyter notebook` or VS Code `.ipynb` | course work: code + notes + plots together |

This course assumes notebooks (Shift+Enter runs a cell), but everything works in all three.

```python
print("Hello, quantum world")
```

`print(...)` displays things. In notebooks, the last expression in a cell also auto-displays without `print` — handy, and worth knowing so you're not confused why bare `2+2` shows output.

## 2. Variables — names for values

```python
shots = 1024
backend_name = "ibm_kingston"
error_rate = 2.03e-3          # scientific notation, Module 1 style
is_calibrated = True
```

A variable is created by assignment (`=`), and it's just a *label stuck onto a value*. Rules: names use letters, digits, underscores; can't start with a digit; case-sensitive (`Shots` ≠ `shots`). Convention (worth adopting on day 1 — employers read your style): `snake_case` for variables and functions, `UPPER_CASE` for constants, descriptive over short — `num_qubits`, not `nq`.

Reassignment just moves the label: after `shots = 2048`, the old 1024 is gone. And `=` is assignment, not equality-testing — that's `==` (Section 5).

## 3. Types — the shape of a value

Every value has a **type**, and `type()` reveals it:

```python
print(type(1024))        # <class 'int'>      whole numbers, unlimited size
print(type(0.5))         # <class 'float'>    decimals (64-bit, ~16 digits — Module 1's dust)
print(type("qubit"))     # <class 'str'>      text
print(type(True))        # <class 'bool'>     True / False
print(type(1 + 2j))      # <class 'complex'>  !!! built into the language
```

That last line deserves a beat of gratitude: most languages need libraries for complex numbers; Python has them natively — `z.real`, `z.imag`, `z.conjugate()`, `abs(z)` all just work, exactly as you used them in Module 2.

**Numbers and their operators:**

```python
print(7 + 3, 7 - 3, 7 * 3)   # 10 4 21
print(7 / 2)                  # 3.5      true division — always float
print(7 // 2, 7 % 2)          # 3 1      floor division, remainder (mod)
print(2 ** 10)                # 1024     power — your 2ⁿ key
```

`%` (mod) will matter more than you'd guess: parity checks (`bit % 2`), angle wrapping (`theta % (2*math.pi)`), and Shor's algorithm (Module 8) is essentially modular arithmetic as a career.

**Strings** hold text; **f-strings** are how professionals format output — master them today:

```python
name = "Bell state"
p00 = 0.4871
print(f"{name}: p(00) = {p00:.3f} ({p00*100:.1f}%)")
# Bell state: p(00) = 0.487 (48.7%)
```

The `{expression:format}` syntax: `.3f` = 3 decimal places; `.1%` would even do percent for you. Every histogram, log line, and report you produce will run through f-strings.

**Conversions** are explicit: `int("42")`, `float("0.5")`, `str(1024)`. Python won't silently mix text and numbers: `"shots: " + 1024` is a `TypeError`; write `f"shots: {1024}"`.

## 4. Booleans and comparisons — the raw material of decisions

```python
print(3 < 5, 3 == 3, 3 != 5)     # True True True
print(0.1 + 0.2 == 0.3)          # False!  Module 1's float dust — never == floats
print(abs((0.1 + 0.2) - 0.3) < 1e-9)   # True — the professional comparison
```

Combine with `and`, `or`, `not`:

```python
fidelity = 0.97
queue_len = 12
ok_to_submit = fidelity > 0.95 and queue_len < 50
print(ok_to_submit)              # True
```

Chained comparisons read like math: `0 <= p <= 1` checks both bounds in one expression — use it for probability sanity checks.

## 5. `if` / `elif` / `else` — decisions

```python
error_rate = 0.007

if error_rate < 0.005:
    print("excellent gate")
elif error_rate < 0.01:
    print("usable gate")          # ← this branch runs
else:
    print("recalibrate")
```

Two structural rules that define Python:

- The colon `:` opens a block.
- **Indentation IS the syntax.** The indented lines belong to the branch; un-indenting ends it. Four spaces is the universal standard (editors insert them when you press Tab). Misaligned indentation is either a `IndentationError` or — worse — a program that runs with the wrong logic.

Branches are exclusive top-down: the first true condition wins, the rest are skipped. Any number of `elif`s; `else` is the catch-all.

@@diagram:py-flow|Control flow: conditions choose one path (if/elif/else); loops send execution back around (for/while) until done.

## 6. Loops — repetition without copy-paste

**`for` — iterate over a known collection.** The workhorse, with `range()`:

```python
for k in range(5):        # 0, 1, 2, 3, 4  — starts at 0, END EXCLUSIVE
    print(k, 2**k)
```

`range(5)` yields 0–4: five values, zero-indexed, end-exclusive — the same convention as Module 2's $\sum_{k=0}^{n-1}$, which is why sums translate to loops so cleanly. Variants: `range(2, 8)` → 2..7; `range(0, 10, 2)` → evens.

**`while` — repeat until a condition fails.** For "keep going until converged" — the shape of every optimizer loop in Module 9:

```python
p = 1.0
steps = 0
while p > 0.01:
    p = p / 2
    steps += 1        # shorthand for steps = steps + 1
print(steps, p)        # 7 0.0078125
```

**Loop controls**: `break` exits the loop now; `continue` skips to the next iteration. A `while True:` + `break` pattern is idiomatic for "loop until something inside decides we're done."

**Accumulator pattern** — the single most common loop shape you'll write:

```python
total = 0.0
for k in range(1, 11):
    total += 1 / k**2
print(total)     # 1.5497677... (approaching π²/6 ≈ 1.6449 — an infinite sum, sampled)
```

Start an accumulator, update it per iteration, read it after. Estimating $\langle A \rangle$ from shots (Module 3!) is exactly this pattern.

## Worked example — simulate a qubit measurement, from scratch

You know the math (Bernoulli, Module 3). Now build it with today's tools only — no NumPy, no Qiskit, just `random`:

```python
import random
random.seed(7)                 # reproducibility — professional default

p1 = 0.3                       # P(measure 1) — e.g. |β|² of some state
shots = 1000
count_ones = 0

for shot in range(shots):
    if random.random() < p1:   # random.random(): uniform in [0, 1)
        count_ones += 1

estimate = count_ones / shots
se = (estimate * (1 - estimate) / shots) ** 0.5
print(f"p̂(1) = {estimate:.3f} ± {2*se:.3f}  (true: {p1})")
# p̂(1) = 0.301 ± 0.029  (true: 0.3)
```

Read what happened: a loop of Bernoulli trials (Module 3), an accumulator, the standard-error formula (Module 3 again), an f-string report with error bars — *all four of this course's threads in 12 lines you wrote yourself.* This tiny program is structurally identical to what Qiskit's samplers do; when you meet them in Module 7, they'll feel like an old friend with better hardware.

## Gotchas

- **`=` vs `==`.** Assignment vs comparison. `if p = 0.5:` is a syntax error (Python protects you); the reverse mistake `p == 0.5` on its own line silently does nothing.
- **Indentation drift.** Mixing tabs and spaces, or un-indenting one line of a block, changes *meaning* without necessarily erroring. Configure VS Code: spaces, width 4 (default is fine). If logic "ignores" a line, check its indentation first.
- **`range(n)` off-by-one.** It ends at $n-1$. "Loop 1 to 10 inclusive" is `range(1, 11)`. Mirror of the $\Sigma$ index gotcha from Module 1 — same fix: count endpoints.
- **Float `==`.** Never. Tolerance compare: `abs(a - b) < 1e-9` (or `math.isclose(a, b)` — even better).
- **Integer division surprises.** `7 / 2` is 3.5 (float), `7 // 2` is 3. Qubit-index arithmetic wants `//`; probabilities want `/`. Pick deliberately.
- **Shadowing built-ins.** Naming a variable `sum`, `type`, `list`, or `max` silently buries the built-in function for the rest of the session. If a built-in "stops working," you probably renamed it — restart the kernel and rename your variable.

## Scenario — the shot-budget calculator you'll actually reuse

It's Module 3's shot-sizing formula, productized in 15 lines. A teammate asks "how many shots for ±1% on a probability near 0.2?" — you open a notebook and this script answers any such question forever:

```python
import math

def shots_needed(p_guess, epsilon):        # (functions get formal next lesson —
    var = p_guess * (1 - p_guess)          #  read this as a labeled recipe)
    return math.ceil(4 * var / epsilon**2)

for eps in [0.10, 0.03, 0.01, 0.005]:
    n = shots_needed(0.2, eps)
    print(f"±{eps:.1%} needs {n:>8,} shots")
# ±10.0% needs       64 shots
# ± 3.0% needs      712 shots
# ± 1.0% needs    6,400 shots
# ± 0.5% needs   25,600 shots
```

The loop sweeps precisions; the f-string's `:>8,` right-aligns with thousands separators (yes, that's built in). Twenty minutes into learning loops, you own a tool working engineers reach for weekly. Keep this notebook — Module 7 will import its logic before real hardware runs.

## Key points

- Three ways to run Python (REPL, script, notebook); notebooks are the course home; `print()` and f-strings (`f"{x:.3f}"`) are your output voice.
- Core types: `int`, `float`, `str`, `bool`, and native `complex` — with `abs()`, `.conjugate()`, `.real/.imag` matching Module 2 exactly.
- `if/elif/else` with colon + 4-space indentation: first true branch wins; indentation is syntax, not decoration.
- `for k in range(n)` iterates 0..n−1 (end-exclusive, matching $\Sigma$ conventions); `while` repeats until a condition fails; `break`/`continue` steer.
- The accumulator pattern (init → update in loop → read after) implements every sum, count, and average — including shot statistics.
- Floats compare by tolerance (`math.isclose`), never `==`; `/` vs `//` is a deliberate choice.

## Check yourself

```quiz
{"q":"What does this print?  \n\nfor k in range(3):\n    print(2**k)","options":["1 2 4 (on separate lines)","2 4 8","1 2 4 8","0 1 2"],"answer":0,"why":"range(3) yields k = 0, 1, 2, and 2⁰=1, 2¹=2, 2²=4. Zero-indexed, end-exclusive — always."}
```

```quiz
{"q":"Why is  if abs(p - 0.5) < 1e-9:  preferred over  if p == 0.5:  when p came from arithmetic?","options":["It runs faster","Floating-point arithmetic carries ~16th-digit rounding, so exact equality fails for mathematically-equal values; tolerance comparison is robust","== is not valid Python for floats","abs() converts p to an integer"],"answer":1,"why":"0.1 + 0.2 ≠ 0.3 in float-land by ~1e-17. Any float produced by computation must be compared within a tolerance (or with math.isclose)."}
```

## Exercises

**Exercise 1 — FizzBuzz, quantum edition.** Loop `n` from 1 to 20. Print `n` followed by: `"Z"` if `n` is divisible by 3, `"X"` if divisible by 5, `"ZX"` if divisible by both, nothing extra otherwise. (Divisibility: `n % 3 == 0`.) This is the most famous screening exercise in software interviews — in its usual form, a real fraction of applicants can't write it. Be the applicant who can.

````solution
```python
for n in range(1, 21):
    label = ""
    if n % 3 == 0:
        label += "Z"
    if n % 5 == 0:
        label += "X"
    print(n, label)
```

Output highlights: 3→Z, 5→X, 15→ZX, 20→X. Design points worth absorbing: (1) building the label with two independent `if`s (not `if/elif`) handles the "both" case for free — `elif` would wrongly make the conditions exclusive; (2) the string accumulator (`label += ...`) is the accumulator pattern wearing text clothes; (3) checking the divisible-by-15 case explicitly (`n % 15 == 0`) also works but adds a third condition to maintain — fewer moving parts wins code review.
````

**Exercise 2 — Grover iteration counter (a real formula, one module early).** Grover's algorithm (Module 8) needs about $\tfrac{\pi}{4}\sqrt{N}$ iterations to search $N$ items. Write a loop over `n_qubits` from 2 to 20 (so $N = 2^{\text{qubits}}$) printing a neat table: qubits, $N$, and the iteration count rounded to an integer (`round()`). At what qubit count does the iteration count first exceed one million?

````solution
```python
import math

print(f"{'qubits':>6} {'N':>12} {'iterations':>12}")
for n_qubits in range(2, 21):
    N = 2 ** n_qubits
    iters = round((math.pi / 4) * math.sqrt(N))
    print(f"{n_qubits:>6} {N:>12,} {iters:>12,}")
```

Reading the table: 20 qubits → N ≈ 1,048,576 → ~804 iterations; a million iterations isn't reached by 20 qubits — extend the range and you'll find it needs $\sqrt N \gtrsim 1.27\text{M}$, i.e. $N \approx 1.6\times10^{12}$: **41 qubits**. Two lessons smuggled in: the $\sqrt N$ speedup's concrete feel (a million-item search in 804 quantum steps!), and the professional habit of answering "when does X exceed Y" by printing a table and *looking*, before reaching for algebra.
````

## Practice questions

1. What's the difference between `7 / 2`, `7 // 2`, and `7 % 2` — values *and* types?
2. Predict the output: `x = 5; x += 3; x *= 2; print(x)`.
3. Write the one-line condition that checks a variable `p` is a valid probability.
4. Why does `while p > 0.01:` risk an infinite loop that `for k in range(100):` cannot? Name the guard you'd add.
5. What does `f"{0.4871:.1%}"` produce? (Try it.)
6. A loop prints nothing and you expected 10 lines. Give three distinct one-glance checks from this lesson.
7. **Design question:** sketch (in code) a "device health check" script: given `error_rate`, `queue_len`, and `t_since_calibration_hours`, print exactly one verdict — `"submit"`, `"submit with caution"`, or `"wait"` — using thresholds you choose and justify in comments.

````solution
1. `3.5` (float, true division), `3` (int, floor), `1` (int, remainder).
2. `16` — (5+3)=8, then ×2.
3. `0 <= p <= 1` (chained comparison).
4. If the body never makes the condition false (e.g., forgot `p = p/2`), `while` spins forever; `range` has a built-in end. Guard: a max-iteration counter (`and steps < 10_000`) — every production `while` loop deserves one.
5. `'48.7%'` — the `%` format multiplies by 100 and appends the sign.
6. Is the loop body actually indented under the `for`? Is the range empty (`range(10, 5)` yields nothing)? Did an earlier cell fail so the loop never ran / kernel needs restart?
7. Model answer:
```python
error_rate, queue_len, t_since_cal = 0.006, 30, 26

# thresholds: gate error <0.5% is clean; queue <50 tolerable; cal <24h fresh
if error_rate < 0.005 and queue_len < 50 and t_since_cal < 24:
    print("submit")
elif error_rate < 0.01 and queue_len < 100:
    print("submit with caution")   # usable but log the compromise
else:
    print("wait")
```
Grading yourself: one verdict guaranteed (if/elif/else exclusivity ✓), thresholds visible and justified (comments ✓), condition order from strictest to loosest (✓ — reversed order would let weak checks steal strict cases). That last point is real interview bait.
````
