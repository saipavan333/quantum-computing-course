# Algebra: variables, equations & functions

Algebra is the skill of moving symbols around *without knowing what they equal yet*. Quantum computing is written entirely in this language: states are symbols like $\alpha$ and $\beta$, gates are functions, and "find the angle that makes this probability 0.3" is an equation to solve. This lesson makes symbol‑pushing automatic, introduces function notation you'll see everywhere after, and adds the summation symbol $\Sigma$ — the single most common notation in quantum mechanics.

## Start here — the intuition

Three algebra ideas carry the whole course. First, the one equation you'll solve forever: **normalization**, $\alpha^2 + \beta^2 = 1$ — the squared amplitudes of a state must total 1, because they're probabilities. Given a relationship between amplitudes, you solve this for the actual probabilities. Second, **functions compose, and order matters**: $f(g(x)) \neq g(f(x))$ in general — the algebraic root of "gate order matters" (Module 6 lives on it). Third, **every quantum gate has an inverse** — because quantum evolution can't destroy information, gates must be reversible functions.

Plus one piece of notation you must read fluently: **$\Sigma$ (sigma)**, compressed addition. A quantum state over $n$ qubits is a sum of $2^n$ pieces; nobody writes them out, so learn to read $\sum_k a_k \ket k$ as "a state is a weighted sum of basis pieces, and the squared weights total 1."

## The essentials, fast

**Solve equations** by doing the same thing to both sides, and substitute back to check. **Un‑squaring introduces $\pm$**: $x^2 = \tfrac14$ gives $x = \pm\tfrac12$ (squares hide signs — which is also why probabilities can't recover an amplitude's sign). **The binomial square** $(a+b)^2 = a^2 + 2ab + b^2$ — that cross‑term $2ab$ is *literally* where interference comes from. **Functions** are named machines: $f(x) = x^2$, composed as $f(g(x))$ (inner first), inverted as $f^{-1}$ (undo). **Sigma**: $\sum_{k=1}^{4} k^2 = 30$, linear (splits over $+$, constants factor out).

@@diagram:function-machine|A function is a machine: input in, rule applied, output out. Composition feeds one machine into the next — exactly how quantum gates chain.

@@widget

## Predict, then run — normalization, composition, sigma

The live cell solves a normalization problem, shows composition order mattering, and evaluates a sigma sum.

**Predict first.** A qubit has $\beta = 2\alpha$. Since $\alpha^2 + \beta^2 = 1$, which outcome is more likely and by how much? And will $f(g(1))$ equal $g(f(1))$? Guess, then Run.

```run
# Live cell — algebra is symbol-pushing; the recurring quantum equation is normalization.
import math

# beta = 2*alpha  ->  alpha^2 + (2 alpha)^2 = 5 alpha^2 = 1
alpha_sq = 1/5
print("p(0) = alpha^2 =", alpha_sq, "  p(1) = (2 alpha)^2 =", 4*alpha_sq,
      "  sum =", alpha_sq + 4*alpha_sq)

f = lambda x: x + 2
g = lambda x: 3*x
print("\nf(g(1)) =", f(g(1)), "  g(f(1)) =", g(f(1)), "  -> order matters")

print("\nsum of k^2 for k = 1..4 =", sum(k**2 for k in range(1, 5)))   # 30
```

The normalization solves to $p(0) = 20\%$, $p(1) = 80\%$ (and note we never needed $\alpha$ itself, $\pm\tfrac{1}{\sqrt5}$ — the *squares* were the question). Composition gives $f(g(1)) = 5 \neq g(f(1)) = 9$ — order matters, exactly like quantum gates. And Python's `sum(... for k in range(...))` is $\Sigma$ in code.

```quiz
{"q":"If α² + β² = 1 and β = 3α, what is the probability associated with β (i.e. β²)?","options":["0.9","0.75","0.3","0.1"],"answer":0,"why":"α² + 9α² = 10α² = 1 gives α² = 0.1, so β² = 9α² = 0.9. Substitution then normalization — the pattern of the course."}
```

## Level up — gotchas the pros watch for

- **$(a+b)^2 = a^2 + b^2$** — wrong; it's $a^2 + 2ab + b^2$, and dropping the cross‑term deletes interference.
- **Forgetting the negative root.** $x^2 = 9$ has two solutions; write $\pm$ then decide from context.
- **Composition isn't commutative.** $f(g(x)) \neq g(f(x))$ — later, $HX \neq XH$ for gates.
- **Dividing by something that could be zero.** From $xa = xb$ you can't conclude $a=b$ (maybe $x=0$).
- **Sigma index confusion.** $\sum_{k=0}^{n-1}$ has $n$ terms — the same off‑by‑one as Python's `range()`.

## Level up — the whiteboard moment

Quantum‑internship first round: "$\ket\psi$ has $p(0) = 3\,p(1)$. What are the probabilities, and give one valid amplitude pair?" No physics needed — they're screening algebra under pressure. Let $p(1) = q$; then $3q + q = 1$, so $q = \tfrac14$: $p(0) = 75\%$, $p(1) = 25\%$, and any pair with $|\alpha|^2 = \tfrac34, |\beta|^2 = \tfrac14$ works ($\alpha = \tfrac{\sqrt3}{2}, \beta = \tfrac12$). Mention that $-\tfrac12$ works too ("sign won't change probabilities") and the interviewer ticks *knows squares hide signs*. Today's normalization drills are, verbatim, interview screens.

## Key points

- Equations bend to one law: same operation, both sides — substituting back is a free correctness check.
- Normalization $\alpha^2 + \beta^2 = 1$ (later $\sum_k |a_k|^2 = 1$) is *the* recurring equation of this course.
- Un‑squaring introduces $\pm$: squares destroy sign, which is why probabilities can't recover amplitude signs.
- $f(g(x))$: inner machine first; composition order matters — the root of "gate order matters."
- Every quantum gate has an inverse; measurement is the lone information‑destroying exception.
- $\sum_{k=0}^{n-1} a_k$ is compressed addition with $n$ terms; linear, and mirrored by Python's `sum(... for k in range(n))`.

## Check yourself

```quiz
{"q":"f(x) = x + 2 and g(x) = 3x. What is g(f(1)), and what does it illustrate?","options":["5 — composition order is irrelevant","9 — apply f first, then g; order matters since f(g(1)) = 5","9 — apply g first, then f","6 — multiply the two functions"],"answer":1,"why":"g(f(1)) = g(3) = 9, while f(g(1)) = f(3) = 5. Inner function first; swapping order changes the answer — exactly like quantum gates."}
```

## Exercises

**Exercise 1 — three‑outcome normalization.** In the live cell, a system has amplitudes $a, 2a, \sqrt3\,a$ (real, positive). Find each probability and confirm they sum to 1.

````solution
```python
import math
a = 1/math.sqrt(8); probs = [x**2 for x in [a, 2*a, math.sqrt(3)*a]]
print(probs, sum(probs))   # [0.125, 0.5, 0.375], ~1.0
```
$a^2 + 4a^2 + 3a^2 = 8a^2 = 1$, so probabilities are $12.5\%, 50\%, 37.5\%$. The structure "squares of amplitudes, summing to 1" is exactly what quantum states demand with $2^n$ entries.
````

**Exercise 2 — inverse hunting.** Find the inverse or explain why none exists: (a) $f(x) = 4x - 6$; (b) $g(x) = x^2$ over all reals; (c) $h(x) = \tfrac1x$.

````solution
(a) $f^{-1}(x) = \tfrac{x+6}{4}$. (b) No inverse — $g(3) = g(-3) = 9$ destroys the sign; a function must be one‑to‑one to invert. (c) Self‑inverse ($\tfrac{1}{1/x} = x$) — like the gates X, H, Z, CNOT, which apply‑twice to identity. The moral: gates must be invertible, so nothing that destroys information (like $x^2$) can be a gate; measurement is the exception.
````

## Practice questions

1. Solve $5x - 7 = 2x + 8$ and verify.
2. Expand $(\alpha + \beta)^2$ and mark the term naive distribution misses.
3. With $f(x) = x^2$, $g(x) = x+1$, compute both compositions at $x=2$.
4. Evaluate $\sum_{k=0}^{3} 2^k$ and its one‑line Python.
5. If $|\alpha|^2 = 0.36$, all real values $\alpha$ can take?
6. Why must a quantum gate be an invertible function?
7. **Design question:** build a 4‑outcome normalization puzzle whose probabilities are 10/20/30/40%, then solve to confirm.

````solution
1. $x = 5$; check $18 = 18$.
2. $\alpha^2 + 2\alpha\beta + \beta^2$; the cross‑term $2\alpha\beta$ is the interference term.
3. $f(g(2)) = 9$; $g(f(2)) = 5$ — order‑sensitive.
4. $15$; `sum(2**k for k in range(4))` (also $2^4 - 1$).
5. $\alpha = \pm0.6$.
6. Quantum evolution can't destroy information (reversible), so a gate must have an inverse — one‑to‑one, never like $x^2$.
7. Multipliers $b=\sqrt2 a, c=\sqrt3 a, d=2a$ give $10a^2 = 1$, $a^2 = 0.1$, and probabilities $0.1, 0.2, 0.3, 0.4$. Any $\sqrt{r_k}$ with ratios proportional to the target probabilities works.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Solve a linear equation and substitute back to check.
- ☐ Solve a normalization problem for the probabilities given an amplitude relationship.
- ☐ Explain why un‑squaring gives $\pm$ and why probabilities lose the sign.
- ☐ Compose functions in the right order and explain why order matters.
- ☐ Run the live cell and read a $\Sigma$ sum in both math and Python.
- ☐ Say why every gate is invertible and measurement is the exception.
