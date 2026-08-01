# Python II: collections, functions & errors

One variable holds one value; real programs juggle thousands — 1,024 shot results, a dictionary of counts, a list of gate angles. Today: Python's containers (lists, tuples, dicts), the slicing syntax every quantum example uses, **functions** (the single biggest upgrade to your code), and how to read error messages without fear. This is where your code starts looking like a professional's.

## Start here — the intuition

When you have more than one of something, you need a **container**. Three cover almost everything. A **list** is an ordered, changeable row of items (`[0.5, 0.3, 0.15]`) you index from 0 and *slice* with `[start:stop]`. A **dict** maps **keys to values** (`{"00": 2011, "11": 1191}`) — and that is *exactly* the shape of a quantum measurement result, a histogram of bitstrings to counts. A **tuple** is a frozen list, great for bundling a few things together.

Then comes the biggest upgrade to your code: the **function** — a named recipe you write once and reuse forever. Functions are the unit of reuse, of testing, and of *thought*: a program built from ten well‑named functions reads like a paragraph. The lesson's live cell writes the one function every quantum notebook eventually contains — turning a counts dict into probabilities with error bars.

## Lists, dicts, tuples

**Lists** are 0‑indexed, negative‑from‑end, and sliced `[start:stop:step]` (stop exclusive): `data[::-1]` reverses — practically a Qiskit idiom because of qubit‑ordering. **Comprehensions** build a list in one line: `[p**2 for p in probs if p > 0.1]`. **Dicts** hold labeled data with `.keys()`, `.values()`, `.items()`, and `.get(key, default)` to survive missing keys; a *dict comprehension* converts counts→probs. **Tuples** are immutable and unpack cleanly (`q, r = divmod(17, 5)`) — Qiskit's V2 primitives take tuple "PUBs," so tuple literacy is on the job description.

@@diagram:list-slicing|Slicing [start:stop]: indices label the FENCES between items, start-inclusive, stop-exclusive. Once you see the fences, off-by-ones disappear.

## Functions and errors

Write a recipe with `def name(params):`, a `"""docstring"""`, and `return`. **Defaults and keyword arguments** are Qiskit's API style (`shots_needed(epsilon=0.03)`). **Scope**: names inside a function stay inside — data in through parameters, out through `return` (sealed pipes → testable code). **Errors** are diagnoses: read the traceback's *last line first* (the type and message), then walk up to your line. Catch the *specific* exception you can handle (`except KeyError:`), never a bare `except:` that swallows your own typos.

## Predict, then run — the counts→probs converter

The live cell turns a measurement histogram into probabilities and ranks the outcomes.

**Predict first.** The counts are `{"00": 2011, "01": 396, "10": 402, "11": 1191}` over 4000 shots. Which two outcomes dominate, and roughly what probabilities? And what will `probs.get("111", 0)` return for an outcome that never occurred? Guess, then Run.

```run
# Live cell — the counts dict IS a quantum histogram. Turn it into probabilities.
counts = {"00": 2011, "01": 396, "10": 402, "11": 1191}

shots = sum(counts.values())
probs = {bits: c / shots for bits, c in counts.items()}        # dict comprehension

ranked = sorted(probs.items(), key=lambda kv: kv[1], reverse=True)   # by probability, high first
print(f"{shots} shots, {len(counts)} outcomes")
for bits, p in ranked[:3]:
    se = (p * (1 - p) / shots) ** 0.5
    print(f"  |{bits}>  {p:.4f} +/- {2*se:.4f}")

print("p('111') =", probs.get("111", 0.0))                    # .get survives a missing outcome
```

The `sorted(..., key=lambda kv: kv[1], reverse=True)` uses a `lambda` — a one‑line unnamed function ("given a pair, return its second element") — to rank by probability. Everything else is a dict comprehension, slicing `[:3]`, f‑strings, and the standard‑error formula, composed. And `probs.get("111", 0)` returns `0.0` instead of crashing, because zero‑count outcomes simply aren't keys — Module 3's "zero observed ≠ impossible," now as code.

```quiz
{"q":"Your analysis crashes with KeyError: '011' on some runs but not others. The professional fix is:","options":["Wrap the whole script in try/except: pass","Use counts.get('011', 0) — outcomes with zero counts are absent from results dicts, which is expected behavior","Always run more shots so every outcome appears","Convert the dict to a list first"],"answer":1,"why":"Zero-count outcomes simply aren't keys. .get with a default handles the legitimate case; bare except hides real bugs; more shots only lowers (never zeroes) the chance."}
```

## Level up — gotchas the pros watch for

- **Mutating while iterating.** Removing items inside `for item in mylist:` skips elements — build a new list with a filtered comprehension.
- **Copy vs alias.** `b = a` makes both names point at the *same* list; `b.append(9)` changes "both." True copy: `a.copy()` or `a[:]`.
- **`counts["101"]` KeyError on clean data.** Zero‑count outcomes aren't keys — use `.get(bits, 0)` in every analysis function.
- **Default‑argument mutables.** `def f(x, log=[])` shares one list across all calls; use `log=None` then `if log is None: log = []`.
- **Bare `except:`.** Swallows `NameError`s and typos with the error you meant — always name the exception.

## Level up — the traceback that wasn't scary

Week one, you run a teammate's script on your data and get a 40‑line traceback. Read the last line: `KeyError: '0110'`, then walk up to *your project's* highest line: `p = counts["0110"] / shots`. Diagnosis in 60 seconds: your smoke test used fewer shots and that outcome never occurred; the script assumed it always would. Fix: `counts.get("0110", 0)` plus a warning. You push a one‑line patch and the teammate thanks you — the same crash had been randomly killing their overnight batches for a month. Reading tracebacks bottom‑up is a reputation skill.

## Key points

- Lists: 0‑indexed, negative‑from‑end, sliced `[start:stop:step]`; `[::-1]` reverses — a quantum‑bitstring daily special.
- Dicts hold labeled data (measurement counts); `.items()` to loop, `.get(k, 0)` to survive missing outcomes; comprehensions convert counts→probs in one line.
- Tuples are immutable; their unpacking and PUB‑shape make them Qiskit's argument currency.
- Functions: `def`, docstring, parameters (defaults/keywords), `return`; sealed‑pipe scope; the unit of reuse, testing, and thought.
- Imports bring in modules (`import numpy as np`); your own `.py` files import the same way.
- Tracebacks read bottom‑first; catch specific exceptions you can handle, let the rest crash loudly.

## Check yourself

```quiz
{"q":"data = [5, 6, 7, 8, 9]. What is data[1:3] + data[-1:]?","options":["[6, 7, 9]","[6, 7, 8, 9]","[5, 6, 9]","[6, 7] and an IndexError"],"answer":0,"why":"data[1:3] = [6, 7] (stop-exclusive); data[-1:] = [9] (slice from the last). List + list concatenates: [6, 7, 9]."}
```

## Exercises

**Exercise 1 — build `marginal`.** In the live cell, add `marginal(probs, position)` returning the probability that the bit at `position` (0 = leftmost) is `"1"`, summing over the rest. Confirm `marginal(probs, 0)` ≈ 0.398 for the counts above.

````solution
```python
def marginal(probs, position):
    return sum(p for bits, p in probs.items() if bits[position] == "1")
print(round(marginal(probs, 0), 4))   # 0.3983  (10 and 11: (402+1191)/4000)
```
It uses a *generator expression* inside `sum` (a comprehension without brackets), and string indexing `bits[position]`. You've implemented Module 3's marginalization as reusable software.
````

**Exercise 2 — compare two runs.** Write `compare(counts_a, counts_b, bits)` printing each run's probability ± 2 SE for `bits` (using `.get`), the difference, its SE ($\sqrt{SE_a^2 + SE_b^2}$), and a verdict "distinguishable (≥2σ)" or "consistent (<2σ)". Test `{"0":520,"1":480}` vs `{"0":466,"1":534}` on `"0"`.

````solution
```python
def prob_se(counts, bits):
    shots = sum(counts.values()); p = counts.get(bits, 0) / shots
    return p, (p*(1-p)/shots)**0.5
def compare(a, b, bits):
    pa, sa = prob_se(a, bits); pb, sb = prob_se(b, bits)
    sig = abs(pa-pb) / (sa**2+sb**2)**0.5
    print(f"diff={pa-pb:+.4f}, {sig:.2f} sigma ->", "distinguishable" if sig>=2 else "consistent")
compare({"0":520,"1":480}, {"0":466,"1":534}, "0")   # ~2.42 sigma -> distinguishable
```
A small pure helper reused twice, zero‑safe `.get`, Module 3's comparison procedure — this is the tool you'll use to decide whether error mitigation "actually helped" in Module 9.
````

## Practice questions

1. What do `nums[::2]`, `nums[1::2]`, `nums[::-1]` give for `[0,1,2,3,4,5]`?
2. Convert to a comprehension: `out = []` / `for c in counts.values(): out.append(c/shots)`.
3. Why does `b = a; b.append(5)` change `a` when `a` is a list, and the fix?
4. Signature (with defaults) for `run_experiment(circuit, shots=1024, seed=None)`, called changing only the seed.
5. Concrete failure mode of `except:` vs `except KeyError:`.
6. Translate: `sorted(probs.items(), key=lambda kv: kv[1], reverse=True)[:1]`.
7. **Design question:** sketch a `histogram_utils` module (signatures + docstrings) with 4 functions you'd want before Module 7.

````solution
1. `[0,2,4]`, `[1,3,5]`, `[5,4,3,2,1,0]`.
2. `out = [c / shots for c in counts.values()]`.
3. Both names alias one list object; fix: `b = a.copy()`.
4. `def run_experiment(circuit, shots=1024, seed=None): ...`; call `run_experiment(qc, seed=7)`.
5. Bare `except` also catches your typos' `NameError`/`TypeError`, so bugs run the fallback silently.
6. "Sort the (bits, prob) pairs by probability, largest first, and keep the single most likely."
7. `counts_to_probs(counts)`, `top_k(probs, k=5)`, `marginal(probs, position)`, `compare_outcome(a, b, bits)` — pure (dict in, data out), Qiskit‑independent so they work on sim and hardware alike; a fifth, `expect_parity(probs)`, previews Module 9's expectation values.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Index and slice a list (including `[::-1]`) and build a comprehension.
- ☐ Use a dict as a histogram: `.items()`, `.get(k, 0)`, and a counts→probs comprehension.
- ☐ Write a function with a docstring, default/keyword arguments, and `return`.
- ☐ Run the live cell and explain the `lambda` sort key and `.get` default.
- ☐ Read a traceback bottom‑line first and catch a specific exception.
- ☐ Explain copy vs alias and the mutable‑default trap.
