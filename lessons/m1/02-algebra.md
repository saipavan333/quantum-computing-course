# Algebra: variables, equations & functions

Algebra is the skill of moving symbols around *without knowing what they equal yet*. Quantum computing is written entirely in this language: states are symbols like $\alpha$ and $\beta$, gates are functions, and "find the angle that makes this probability 0.3" is an equation to solve. This lesson makes symbol-pushing automatic, introduces function notation you'll see in every lesson after this one, and adds the summation symbol $\Sigma$ — the single most common notation in quantum mechanics.

## 1. Variables and expressions

A **variable** is a name for a number you haven't pinned down: $x$, $\theta$ (theta), $\alpha$ (alpha). Quantum texts love Greek letters; here are the ones this course uses (say them out loud once — reading math silently with "squiggle" placeholders caps your speed forever):

| Symbol | Name | Typical quantum meaning |
|---|---|---|
| $\alpha, \beta$ | alpha, beta | amplitudes of $\ket{0},\ket{1}$ |
| $\theta, \varphi$ | theta, phi | angles on the Bloch sphere |
| $\psi, \phi$ | psi, phi | quantum states |
| $\lambda$ | lambda | eigenvalues, phases |
| $\Sigma$ | capital sigma | "sum of" |

**Working with expressions** — the legal moves:

- Expand: $2(x + 3) = 2x + 6$ (distribute).
- Collect: $3x + 5x = 8x$ (like terms only: $3x + 5x^2$ doesn't combine).
- Factor: $x^2 + 3x = x(x+3)$ (distribution, reversed).
- The binomial square you must know cold: $(a+b)^2 = a^2 + 2ab + b^2$. That middle term $2ab$ is — no exaggeration — where quantum interference comes from (you'll see it explicitly in Module 5).

## 2. Solving equations — do unto both sides

An equation states two expressions are equal. You may do anything to it *as long as you do it to both sides*. Solve $3x + 5 = 20$:

$$3x + 5 = 20 \;\xrightarrow{-5}\; 3x = 15 \;\xrightarrow{\div 3}\; x = 5$$

**Check by substituting back**: $3(5)+5 = 20$ ✓. Professionals always substitute back; it's a free correctness proof.

**With squares** — solve $x^2 = \tfrac{1}{4}$: $x = \tfrac12$ **or** $x = -\tfrac12$. Squares hide signs; remember both roots. Quantum example you'll actually meet: "amplitude $\alpha$ satisfies $|\alpha|^2 = 0.25$" allows $\alpha = \pm\tfrac12$ (and, after Module 2, complex options too).

**Two unknowns need two equations.** If $\alpha^2 + \beta^2 = 1$ and $\alpha = \beta$, substitute: $2\alpha^2 = 1$, so $\alpha^2 = \tfrac12$, $\alpha = \tfrac{1}{\sqrt2}$. You have just *derived* the famous equal-superposition amplitude rather than memorizing it. That equation $\alpha^2+\beta^2=1$ is called **normalization** and you'll solve variants of it for the rest of the course.

## 3. Functions — machines with a name

A **function** takes an input and returns an output, deterministically. $f(x) = x^2$ means "the machine named $f$ squares its input": $f(3) = 9$, $f(-3)=9$, $f(\sqrt2) = 2$.

@@diagram:function-machine|A function is a machine: input in, rule applied, output out. Composition feeds one machine into the next — exactly how quantum gates chain.

Things professionals read fluently:

- $f(g(x))$ — **composition**: apply $g$ first, then $f$. If $f(x)=x+1$ and $g(x)=2x$: $f(g(3)) = f(6) = 7$, but $g(f(3)) = g(4) = 8$. **Order matters.** Quantum gates compose exactly like this, and their order matters exactly like this (Module 6 exploits it; Qiskit bugs are born from forgetting it).
- $f^{-1}$ — the **inverse**: the machine run backwards, undoing $f$: if $f(x) = 2x$ then $f^{-1}(x) = x/2$, and $f^{-1}(f(x)) = x$. Not every function has one ($x^2$ loses the sign, so it's not invertible over all reals). Preview with teeth: *every* quantum gate has an inverse — quantum computing is reversible by physical law (Module 5).
- Multi-input functions: $f(x, y) = x^2 + y^2$. Fine and common.

**Graphs** turn functions into pictures: plot input on the horizontal axis, output on the vertical. A straight line is $f(x) = mx + b$ (slope $m$, intercept $b$); $f(x)=x^2$ is a U-shaped parabola. You'll graph sine waves next lesson and probability curves in Module 3 — reading graphs is half of reading papers.

## 4. Summation notation — $\Sigma$, the workhorse

Quantum states over $n$ qubits are sums with $2^n$ terms; nobody writes them out. Instead:

$$\sum_{k=1}^{4} k^2 = 1^2 + 2^2 + 3^2 + 4^2 = 30$$

Read: "sum, as $k$ runs from 1 to 4, of $k^2$." The variable $k$ is a counter that exists only inside the sum. Rules that transfer work:

$$\sum_k (a_k + b_k) = \sum_k a_k + \sum_k b_k \qquad \sum_k c\,a_k = c\sum_k a_k$$

(sums split over addition; constants factor out — you'll reuse both as "linearity" for matrices and gates.)

The quantum shape you'll see a hundred times, starting Module 5:

$$\ket{\psi} = \sum_{k=0}^{2^n - 1} a_k \ket{k}, \qquad \sum_{k} |a_k|^2 = 1$$

Don't decode the kets yet — just recognize the grammar: *a state is a sum of basis pieces, each weighted by an amplitude, and the squared weights total 1 (normalization again).*

Python speaks fluent sigma:

```python
total = sum(k**2 for k in range(1, 5))   # range(1,5) = 1,2,3,4
print(total)                              # 30
```

## Worked example — solving a normalization problem like a pro

*A qubit state has amplitudes $\alpha$ (for outcome 0) and $\beta = 2\alpha$ (for outcome 1). Find the measurement probabilities.*

**Set up.** Normalization: $\alpha^2 + \beta^2 = 1$. Substitute the relationship $\beta = 2\alpha$:

$$\alpha^2 + (2\alpha)^2 = \alpha^2 + 4\alpha^2 = 5\alpha^2 = 1 \;\Rightarrow\; \alpha^2 = \tfrac15$$

**Interpret.** Probabilities are the squared amplitudes: $p(0) = \alpha^2 = \tfrac15 = 20\%$ and $p(1) = 4\alpha^2 = \tfrac45 = 80\%$. Sanity check: $0.2 + 0.8 = 1$ ✓. Notice we never needed $\alpha$ itself ($\pm\tfrac{1}{\sqrt5}$) — the *squares* were the question. Spotting what the question actually needs is an algebra skill, not a quantum one.

```python
alpha_sq = 1 / 5
print(alpha_sq, 4 * alpha_sq, alpha_sq + 4 * alpha_sq)   # 0.2 0.8 1.0
```

## Gotchas

- **$(a+b)^2 = a^2 + b^2$** — the classic. It's $a^2 + 2ab + b^2$. In quantum settings, dropping the cross-term $2ab$ literally deletes interference from your calculation and gives clean-looking wrong answers.
- **Forgetting the negative root.** $x^2 = 9$ has two solutions. Any time you "unsquare", write $\pm$ and then decide from context which apply.
- **Treating composition as commutative.** $f(g(x)) \ne g(f(x))$ in general. Later: $HX \ne XH$ for gates — same disease, expensive symptoms.
- **Dividing both sides by something that could be zero.** From $x\cdot a = x \cdot b$ you may NOT conclude $a=b$ (maybe $x=0$). Check the zero case separately.
- **Sigma index confusion.** $\sum_{k=0}^{n-1}$ has $n$ terms, not $n-1$. Off-by-one here becomes off-by-one in Python `range()` — same fix: count both endpoints carefully.
- **Reading Greek as noise.** If you can't *say* $\varphi$ ("phi"), you'll skip it while reading and lose the thread. Use the table in Section 1 until it's automatic.

## Scenario — the whiteboard moment

First-round interview, quantum software internship. The interviewer writes: "$\ket\psi$ has $p(0) = 3\,p(1)$. What are the probabilities, and give one valid amplitude pair." No physics knowledge actually required — they're screening algebra under mild pressure. You: let $p(1) = q$, then $p(0) = 3q$, and $3q + q = 1$ (probabilities sum to 1), so $q = \tfrac14$: $p(0)=75\%$, $p(1)=25\%$. Amplitudes: any pair with $|\alpha|^2 = \tfrac34, |\beta|^2 = \tfrac14$, e.g. $\alpha = \tfrac{\sqrt3}{2}, \beta = \tfrac12$. You mention the $\pm$ freedom ("$-\tfrac12$ works too — sign won't change probabilities") and the interviewer's pen ticks a box: *knows squares hide signs*. The two normalization drills you did today are, verbatim, interview screens.

## Key points

- Equations bend to one law: same operation, both sides — and substituting back is a free correctness check.
- Normalization $\alpha^2 + \beta^2 = 1$ (later $\sum_k |a_k|^2 = 1$) is *the* recurring equation of this course; you solved it three ways today.
- Un-squaring introduces $\pm$: squares destroy sign information, which is also why probabilities can't recover amplitude signs.
- $f(g(x))$: apply the inner machine first; composition order matters — the algebraic root of "gate order matters".
- Inverses undo: $f^{-1}(f(x)) = x$; every quantum gate will turn out to have one.
- $\sum_{k=0}^{n-1} a_k$ is compressed addition with $n$ terms; it's linear (splits over $+$, constants factor out), and Python's `sum(... for k in range(n))` mirrors it exactly.

## Check yourself

```quiz
{"q":"If α² + β² = 1 and β = 3α, what is the probability associated with β (i.e. β²)?","options":["0.9","0.75","0.3","0.1"],"answer":0,"why":"α² + 9α² = 10α² = 1 gives α² = 0.1, so β² = 9α² = 0.9. Substitution then normalization — the pattern of the course."}
```

```quiz
{"q":"f(x) = x + 2 and g(x) = 3x. What is g(f(1)), and what does the result illustrate?","options":["5 — composition order is irrelevant","9 — apply f first, then g; order matters since f(g(1)) = 5","9 — apply g first, then f","6 — multiply the two functions"],"answer":1,"why":"g(f(1)) = g(3) = 9, while f(g(1)) = f(3) = 5. Inner function first; swapping the order changes the answer — exactly like quantum gates."}
```

## Exercises

**Exercise 1 — normalization with three outcomes.** A 3-outcome system has amplitudes $a$, $2a$, $\sqrt3\,a$ (all real, positive). Find each probability, then verify the three sum to 1, then do it again in Python with a list and `sum()`.

````solution
Normalization: $a^2 + 4a^2 + 3a^2 = 8a^2 = 1 \Rightarrow a^2 = \tfrac18$.

Probabilities: $\tfrac18 = 12.5\%$, $\;4a^2 = \tfrac12 = 50\%$, $\;3a^2 = \tfrac38 = 37.5\%$. Sum: $0.125+0.5+0.375 = 1$ ✓.

```python
import math
a = 1 / math.sqrt(8)
amps = [a, 2*a, math.sqrt(3)*a]
probs = [x**2 for x in amps]
print(probs)          # [0.125, 0.5, 0.375]  (up to float dust)
print(sum(probs))     # 0.9999999999999999
```

Note the float dust on the sum — recognized, not feared (previous lesson). The structure `probs = squares of amps; sum(probs) == 1` is precisely what quantum states will demand with 2ⁿ entries instead of 3.
````

**Exercise 2 — inverse hunting.** For each machine, find the inverse or explain why none exists: (a) $f(x) = 4x - 6$, (b) $g(x) = x^2$ over all real inputs, (c) $h(x) = \tfrac{1}{x}$ for $x \neq 0$.

````solution
(a) Solve $y = 4x - 6$ for $x$: $x = \tfrac{y+6}{4}$, so $f^{-1}(x) = \tfrac{x+6}{4}$. Check: $f^{-1}(f(2)) = f^{-1}(2) = 2$ ✓.

(b) **No inverse**: $g(3) = g(-3) = 9$, so from output 9 you can't recover the input — information (the sign) was destroyed. A function must be one-to-one to invert. (Restricted to $x \ge 0$, $\sqrt x$ works.)

(c) $h$ is its own inverse: $\tfrac{1}{1/x} = x$. Self-inverse machines exist! Preview: most famous quantum gates (X, H, Z, CNOT) are self-inverse — apply twice, get identity — and you'll exploit that for "uncomputation" tricks in Module 8.

The moral for quantum computing: gates must be invertible, so nothing like (b) — nothing that *destroys information* — can be a quantum gate. Measurement is the lone, dramatic exception.
````

## Practice questions

1. Solve $5x - 7 = 2x + 8$ and verify by substitution.
2. Expand $(\alpha + \beta)^2$ and mark the term that would vanish if you (wrongly) assumed squares distribute over sums.
3. With $f(x) = x^2$ and $g(x) = x+1$, compute both compositions at $x=2$ and state the general lesson.
4. Evaluate $\sum_{k=0}^{3} 2^k$ by hand, and write the one-line Python equivalent.
5. If $|\alpha|^2 = 0.36$, list every real value $\alpha$ can take.
6. Why must a quantum gate be an invertible function? (One sentence, using this lesson's vocabulary.)
7. **Design question:** create a 4-outcome normalization puzzle of your own (relationships between amplitudes) whose probabilities come out to 10%, 20%, 30%, 40%, then solve it to confirm.

````solution
1. $3x = 15 \Rightarrow x = 5$. Check: $25 - 7 = 18 = 10 + 8$ ✓.
2. $\alpha^2 + 2\alpha\beta + \beta^2$; the cross-term $2\alpha\beta$ is the one naive distribution misses — and it's the interference term.
3. $f(g(2)) = f(3) = 9$; $g(f(2)) = g(4) = 5$. Composition is order-sensitive; always evaluate inside-out.
4. $1 + 2 + 4 + 8 = 15$. `sum(2**k for k in range(4))`. (Also $2^4 - 1$ — powers of two sum to one-less-than-the-next, a pattern worth pocketing.)
5. $\alpha = 0.6$ or $\alpha = -0.6$.
6. Quantum evolution can't destroy information (it must be reversible), so a gate must be a function with an inverse — one-to-one, like (a) and (c) above, never like $x^2$.
7. One clean construction: let $p$-targets be $0.1, 0.2, 0.3, 0.4$. Amplitude relationships: $b = \sqrt2\,a,\; c = \sqrt3\,a,\; d = 2a$. Then $a^2(1+2+3+4) = 10a^2 = 1$, so $a^2 = 0.1$ and the four probabilities land exactly on target. Any set of multipliers $\sqrt{r_k}$ with ratios $r_k$ proportional to desired probabilities works — recognizing *that* is the design insight.
````
