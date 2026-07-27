# Python II: collections, functions & errors

One variable holds one value; real programs juggle thousands — 1,024 shot results, a dictionary of counts, a list of gate angles. Today: Python's containers (lists, tuples, dicts), the slicing syntax every quantum example uses, **functions** (the single biggest upgrade to your code), and how to read error messages without fear. This lesson is where your code starts looking like a professional's.

## 1. Lists — ordered, changeable sequences

```python
angles = [0.0, 0.785, 1.571, 2.356]      # list literal
angles.append(3.142)                      # grow at the end
print(len(angles), angles[0], angles[-1]) # 5 0.0 3.142   ← -1 = last!
angles[1] = 0.7854                        # replace by index
```

Indexing starts at **0** (like `range`, like qubit numbering, like $\Sigma_{k=0}$ — the whole ecosystem agrees). Negative indices count from the end: `[-1]` last, `[-2]` second-to-last.

**Slicing** — extract sub-lists with `[start:stop:step]` (stop exclusive, all parts optional):

```python
data = [10, 11, 12, 13, 14, 15]
print(data[1:4])     # [11, 12, 13]
print(data[:3])      # [10, 11, 12]      from the start
print(data[3:])      # [13, 14, 15]      to the end
print(data[::2])     # [10, 12, 14]      every second
print(data[::-1])    # [15, 14, 13, 12, 11, 10]   reversed — the classic trick
```

@@diagram:list-slicing|Slicing [start:stop]: indices label the FENCES between items, start-inclusive, stop-exclusive. Once you see the fences, off-by-ones disappear.

Why you must be fluent: **bit-strings from quantum measurements are sliced constantly** — `bitstring[::-1]` (reverse) is practically a Qiskit idiom, because of a qubit-ordering convention you'll curse and then master in Module 6.

**Loop + list patterns**, including the beloved comprehension:

```python
probs = [0.5, 0.3, 0.15, 0.05]
squared = [p**2 for p in probs]                    # list comprehension
big = [p for p in probs if p > 0.1]                # with a filter
total = sum(probs)                                  # built-in reducers
print(squared, big, total, max(probs))
# enumerate: index and value together — the professional loop
for k, p in enumerate(probs):
    print(f"outcome {k}: {p:.0%}")
```

A comprehension `[expression for item in seq if cond]` is a loop-that-builds-a-list in one readable line — Python's signature move, used in every Qiskit tutorial ever written.

## 2. Tuples — frozen sequences (and multiple return values)

A tuple is an immutable list: `point = (3, 4)`. Index and slice the same; you just can't modify it. Their superpower is **packing/unpacking**:

```python
x, y = (3, 4)                 # unpack
theta, phi = 0.79, 1.57       # parens optional — tuple in disguise
pair = divmod(17, 5)          # many functions return tuples
q, r = divmod(17, 5)          # unpack directly: q=3, r=2
```

Qiskit's V2 primitives take **PUBs** — tuples like `(circuit, observables, params)` — so tuple literacy is directly on the job description (Module 7).

## 3. Dictionaries — labeled data (your histogram's home)

A `dict` maps **keys → values**. This is the exact shape of quantum measurement results:

```python
counts = {"00": 2011, "01": 396, "10": 402, "11": 1191}
print(counts["00"])               # 2011 — lookup by key
counts["11"] += 9                 # update
print(counts.get("111", 0))       # 0 — .get() with default: no crash on missing key

shots = sum(counts.values())
probs = {bits: c / shots for bits, c in counts.items()}   # dict comprehension!
for bits, p in sorted(probs.items()):
    print(f"|{bits}⟩: {p:.4f}")
```

The trio to memorize: `.keys()`, `.values()`, `.items()` (key-value pairs, perfect for loops). The counts→probs conversion above is *the* most common five lines in quantum notebooks — you'll type it (or a helper for it) hundreds of times.

(Also exists: `set` — unordered unique items, great for "which outcomes appeared at all?" — `set(results)`. Nice to recognize, rarely central.)

## 4. Functions — name your recipes

You've been *using* functions all course (`print`, `math.sqrt`). Now write them:

```python
import math

def standard_error(p_hat, n):
    """Standard error of an estimated probability from n shots."""
    return math.sqrt(p_hat * (1 - p_hat) / n)

se = standard_error(0.3, 1024)
print(f"±{2*se:.4f}")            # ±0.0286
```

Anatomy: `def name(parameters):`, an indented body, an optional `"""docstring"""` (one line saying what it does — professionals always write it), and `return` to send back a result. A function without `return` returns `None`.

**Defaults and keyword arguments** — the API style Qiskit uses everywhere:

```python
def shots_needed(p_guess=0.5, epsilon=0.01):
    return math.ceil(4 * p_guess * (1 - p_guess) / epsilon**2)

print(shots_needed())                        # 10000  (all defaults)
print(shots_needed(epsilon=0.03))            # 1112   (name the one you change)
print(shots_needed(0.2, 0.01))               # 6400   (positional)
```

When you later read `SamplerV2(mode=backend)` or `qc.measure_all(inplace=True)`, that's keyword arguments — you already know the grammar.

**Scope**: names created inside a function live only inside it. Data goes in through parameters and out through `return` — treating functions as sealed pipes (rather than reaching for global variables) is the habit that makes code testable, and testability is a hiring signal (Module 7 builds actual tests).

**Why functions matter beyond tidiness**: they're the unit of *reuse* (write the counts→probs converter once, import it forever), the unit of *testing* (assert `standard_error(0.5, 100) == 0.05`), and the unit of *thought* — a program made of ten well-named functions can be read like a paragraph.

## 5. Imports — standing on shoulders

```python
import math                      # full module: math.pi, math.sqrt
from math import pi, sqrt        # cherry-pick names
import numpy as np               # aliased import — universal conventions:
# np (numpy), plt (matplotlib.pyplot) — use them; reviewers expect them
```

Your own `.py` files are modules too: put `standard_error` in `stats_utils.py`, then `from stats_utils import standard_error` in any notebook in the same folder. Congratulations — that's a library. Yours.

## 6. Errors — read the traceback, bottom line first

Errors are not failures; they're *diagnoses*. The reading order professionals use: **last line first** (the error type and message), then walk *up* to find the line of yours that triggered it.

| Exception | Typical cause | First reflex |
|---|---|---|
| `SyntaxError` | typo, missing `:` or `)` | look at/before the caret |
| `NameError` | undefined name / typo / cell not run | spelling; run earlier cells |
| `TypeError` | wrong type (`"a" + 1`) | check each operand's type |
| `IndexError` | index past the end | print `len()`; remember 0-index |
| `KeyError` | dict key absent | `.get(key, default)`; print `.keys()` |
| `ZeroDivisionError` | dividing by 0 | guard the denominator |

**Handling** errors you expect — `try/except`:

```python
def prob_of(counts, bits):
    """Probability of an outcome; 0.0 if it never occurred."""
    try:
        return counts[bits] / sum(counts.values())
    except KeyError:
        return 0.0
```

Two rules of professional exception style: catch the *specific* exception (`except KeyError:`, never bare `except:` which also swallows your typos), and only catch what you can genuinely handle — otherwise let it crash loudly, because silent wrong numbers are far worse than a traceback (in quantum work, *especially* so: a silently-empty histogram looks like physics).

## Worked example — a real analysis helper, start to finish

The function every quantum notebook eventually contains — written with everything from today:

```python
def summarize(counts, top=3):
    """Print the top outcomes of a counts dict with probabilities ± 2SE."""
    shots = sum(counts.values())
    probs = {b: c / shots for b, c in counts.items()}
    ranked = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)
    print(f"{shots} shots, {len(counts)} distinct outcomes")
    for bits, p in ranked[:top]:
        se = (p * (1 - p) / shots) ** 0.5
        print(f"  |{bits}⟩  {p:.4f} ± {2*se:.4f}")

counts = {"00": 2011, "01": 396, "10": 402, "11": 1191}
summarize(counts)
# 4000 shots, 4 distinct outcomes
#   |00⟩  0.5027 ± 0.0158
#   |11⟩  0.2977 ± 0.0145
#   |10⟩  0.1005 ± 0.0095
```

New piece: `sorted(..., key=lambda kv: kv[1], reverse=True)` — `lambda` defines a tiny unnamed function ("given a pair, return its second element") telling `sorted` what to rank by. Lambdas are one-line function literals; you'll meet them as optimizer callbacks in Module 9. Everything else — dict comprehension, slicing `[:top]`, f-strings, the SE formula — is your own toolkit, composed. *This function goes in your `stats_utils.py` today and gets imported in Module 7 for real hardware results.*

## Gotchas

- **Mutating while iterating.** Removing items from a list inside `for item in mylist:` skips elements silently. Build a new list (comprehension with a filter) instead.
- **Copy vs alias.** `b = a` makes both names point at the *same* list — `b.append(9)` changes "both". True copy: `b = a.copy()` (or `a[:]`). This bites everyone exactly once; let yours be today, in a two-line experiment.
- **`counts["101"]` KeyError on clean data.** Outcomes with zero counts simply aren't in the dict (Module 3's "zero observed ≠ impossible", now as an exception). Use `.get(bits, 0)` in every analysis function.
- **Shadowing modules.** Naming your file `math.py` or a variable `np` breaks imports in confusing ways. Check filenames when imports misbehave.
- **Default-argument mutables.** `def f(x, log=[])` shares ONE list across all calls — a famous trap. Use `log=None` then `if log is None: log = []`. (Recognize it now; understand it deeply when classes arrive.)
- **Bare `except:`.** Swallows `NameError`s and typos along with the error you meant, turning bugs into ghosts. Always name the exception.

## Scenario — the traceback that wasn't scary

First week on a project, you run a teammate's analysis script against your data and get a 40-line traceback. Old you closes the laptop. Trained you reads the last line: `KeyError: '0110'` — then walks up to the highest line in *the project's* code (not library internals): `p_target = counts["0110"] / shots`. Diagnosis in 60 seconds: your test run used fewer shots and the target outcome never occurred; the script assumed it always would. Fix: `counts.get("0110", 0)`, plus a printed warning when it's absent. You push the one-line patch with a note; the teammate thanks you because the same crash had been randomly killing their overnight batch runs for a month (it only triggered on low-shot smoke tests — of course). Reading tracebacks bottom-up isn't a survival skill; it's a *reputation* skill.

## Key points

- Lists: 0-indexed, negative-from-end, sliced `[start:stop:step]` (stop-exclusive); `[::-1]` reverses — a quantum-bitstring daily special.
- Dicts hold labeled data — measurement counts live here; `.items()` to loop, `.get(k, 0)` to survive missing outcomes; comprehensions convert counts→probs in one line.
- Tuples are immutable sequences whose unpacking (`q, r = divmod(...)`) and PUB-shape make them Qiskit's argument currency.
- Functions: `def`, docstring, parameters (with defaults/keywords), `return`; sealed-pipe scope; they are the unit of reuse, testing, and thought.
- Imports bring in modules (`import numpy as np` — learn the standard aliases); your own `.py` files import the same way.
- Tracebacks read bottom-first; catch specific exceptions you can handle, let the rest crash loudly — silent wrong data is the real enemy.

## Check yourself

```quiz
{"q":"data = [5, 6, 7, 8, 9]. What is data[1:3] + data[-1:]?","options":["[6, 7, 9]","[6, 7, 8, 9]","[5, 6, 9]","[6, 7] and an IndexError"],"answer":0,"why":"data[1:3] = [6, 7] (stop-exclusive); data[-1:] = [9] (slice from last). List + list concatenates: [6, 7, 9]."}
```

```quiz
{"q":"Your analysis crashes with KeyError: '011' on some runs but not others. The professional fix is:","options":["Wrap the whole script in try/except: pass","Use counts.get('011', 0) — outcomes with zero counts are absent from results dicts, which is expected behavior","Always run more shots so every outcome appears","Convert the dict to a list first"],"answer":1,"why":"Zero-count outcomes simply aren't keys. .get with a default handles the legitimate case; bare except hides real bugs; more shots only lowers (never zeroes) the chance."}
```

## Exercises

**Exercise 1 — build `counts_to_probs` properly.** Write a function `counts_to_probs(counts)` that returns a probability dict, and a function `marginal(probs, position)` that returns the probability that the bit at `position` (0 = leftmost for now) equals `"1"`, summing over everything else. Test on `{"00": 2011, "01": 396, "10": 402, "11": 1191}`: marginal of position 0 should be ≈ 0.398.

````solution
```python
def counts_to_probs(counts):
    """Normalize a counts dict into probabilities."""
    shots = sum(counts.values())
    return {bits: c / shots for bits, c in counts.items()}

def marginal(probs, position):
    """P(bit at `position` == '1'), summing over all other bits."""
    return sum(p for bits, p in probs.items() if bits[position] == "1")

counts = {"00": 2011, "01": 396, "10": 402, "11": 1191}
probs = counts_to_probs(counts)
print(round(marginal(probs, 0), 4))   # 0.3983  ✓ (10 and 11: (402+1191)/4000)
print(round(marginal(probs, 1), 4))   # 0.3967      (01 and 11)
```

Design notes: `marginal` uses a *generator expression* inside `sum` (a comprehension without brackets — same idea, no intermediate list); string indexing `bits[position]` treats the bitstring as a sequence, which it is. You've implemented Module 3's marginalization as reusable software — and yes, this exact pair of helpers appears (with a qubit-ordering twist) in Module 7.
````

**Exercise 2 — defensive statistics.** Extend `summarize` from the Worked example into `compare(counts_a, counts_b, bits)`: it should print each run's probability ± 2SE for outcome `bits` (using `.get`!), the difference, the SE of the difference ($\sqrt{SE_a^2 + SE_b^2}$ — Module 3), and a verdict: `"distinguishable (≥2σ)"` or `"consistent (<2σ)"`. Test with `{"0": 520, "1": 480}` vs `{"0": 466, "1": 534}` on outcome `"0"`.

````solution
```python
def prob_se(counts, bits):
    """(probability, standard error) for one outcome, zero-safe."""
    shots = sum(counts.values())
    p = counts.get(bits, 0) / shots
    se = (p * (1 - p) / shots) ** 0.5
    return p, se

def compare(counts_a, counts_b, bits):
    pa, sa = prob_se(counts_a, bits)
    pb, sb = prob_se(counts_b, bits)
    diff = pa - pb
    se_diff = (sa**2 + sb**2) ** 0.5
    sigmas = abs(diff) / se_diff if se_diff > 0 else float("inf")
    print(f"A: {pa:.4f} ± {2*sa:.4f}")
    print(f"B: {pb:.4f} ± {2*sb:.4f}")
    print(f"diff = {diff:+.4f}, {sigmas:.2f}σ →",
          "distinguishable (≥2σ)" if sigmas >= 2 else "consistent (<2σ)")

compare({"0": 520, "1": 480}, {"0": 466, "1": 534}, "0")
# A: 0.5200 ± 0.0316
# B: 0.4660 ± 0.0316
# diff = +0.0540, 2.42σ → distinguishable (≥2σ)
```

Notice the architecture: a small pure helper (`prob_se`) reused twice, the guard against zero division, the `+` format flag showing the sign, and Module 3's exact comparison procedure now executable on demand. This function is not homework — it's the tool you'll use to decide whether error mitigation "actually helped" in Module 9, where that question is worth money.
````

## Practice questions

1. What do `nums[::2]`, `nums[1::2]`, and `nums[::-1]` produce for `nums = [0,1,2,3,4,5]`?
2. Convert this loop to a comprehension: `out = []` / `for c in counts.values(): out.append(c/shots)`.
3. Why does `b = a; b.append(5)` change `a` when `a` is a list, and what's the fix?
4. Write the function signature (with defaults) for a `run_experiment(circuit, shots=1024, seed=None)` and call it changing only the seed.
5. What's wrong with `except:` compared to `except KeyError:` — give the concrete failure mode.
6. `sorted(probs.items(), key=lambda kv: kv[1], reverse=True)[:1]` — translate to English.
7. **Design question:** design (signatures + docstrings + 3 sentences of rationale) a tiny `histogram_utils` module with 4 functions you'd want before Module 7. Consider what you've repeatedly needed: normalization, marginals, comparison, top-k.

````solution
1. `[0,2,4]`, `[1,3,5]`, `[5,4,3,2,1,0]`.
2. `out = [c / shots for c in counts.values()]`.
3. Both names alias one list object (assignment copies the *label*, not the data); fix: `b = a.copy()`.
4. `def run_experiment(circuit, shots=1024, seed=None): ...` — call: `run_experiment(qc, seed=7)`.
5. Bare `except` also catches `NameError`/`TypeError` from your own typos, so bugs execute the fallback path silently — you debug "weird results" instead of an honest crash.
6. "Sort the outcome-probability pairs by probability, largest first, and keep the single most likely one."
7. Model module:
```python
def counts_to_probs(counts): """Counts → probability dict."""
def top_k(probs, k=5): """k most likely (bits, prob) pairs, sorted."""
def marginal(probs, position): """P(bit at position == '1')."""
def compare_outcome(counts_a, counts_b, bits): """(diff, sigmas) for one outcome across two runs."""
```
Rationale: these four cover 90% of first-pass analysis (normalize → eyeball leaders → collapse to relevant qubits → decide if two runs differ); each is pure (dict in, data out — trivially testable); none depends on Qiskit, so they work on simulator and hardware output alike. A fifth worth arguing for: `expect_parity(probs)` (average ±1 parity), which becomes the expectation-value bridge in Module 9 — full credit for proposing it or any similarly forward-looking member.
````
