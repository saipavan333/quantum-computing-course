# Probability: outcomes, rules & distributions

A quantum computer never hands you "the answer." It hands you a **sample** — one random bit-string drawn from a distribution your circuit engineered. Run 4,000 shots, get 4,000 samples, and *you* infer the answer from their statistics. That makes probability theory not background math but the literal output format of your future job. This lesson builds the rules; the next one teaches you to reason about samples like a professional.

## 1. Sample spaces and events

A random process has a set of possible **outcomes** — the **sample space** $\Omega$. A **probability distribution** assigns each outcome $\omega$ a number $p(\omega)$ obeying two axioms:

$$0 \le p(\omega) \le 1 \qquad \sum_{\omega \in \Omega} p(\omega) = 1$$

That second axiom should look deeply familiar: it *is* the normalization condition you've enforced all course. Quantum states are probability distributions waiting to happen (via $p = |\alpha|^2$), and both worlds tax you the same way: everything sums to 1.

Examples:

| Process | Sample space | Distribution |
|---|---|---|
| Fair coin | {H, T} | $\tfrac12, \tfrac12$ (uniform) |
| Fair die | {1,…,6} | $\tfrac16$ each (uniform) |
| Biased bit | {0, 1} | $p, 1-p$ (**Bernoulli(p)** — the atom of computing) |
| Measure 2 qubits | {00, 01, 10, 11} | $|a_{00}|^2, |a_{01}|^2, |a_{10}|^2, |a_{11}|^2$ |

An **event** is any subset of outcomes: for the 2-qubit space, "the left qubit reads 1" is the event $\{10, 11\}$. An event's probability is the sum over its outcomes:

$$P(\text{left qubit} = 1) = p(10) + p(11)$$

This summing move is called **marginalization** — you'll do it every time you care about some qubits and not others, which is constantly.

## 2. Combining events — the two rules

**Addition (OR) for mutually exclusive events.** If A and B can't both happen: $P(A \text{ or } B) = P(A) + P(B)$. Distinct measurement outcomes are always mutually exclusive (you get one bit-string per shot), so quantum work uses this simple form relentlessly. General form, for overlapping events: $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ — subtract the double-counted overlap.

**Multiplication (AND) for independent events.** Events are **independent** if one occurring tells you nothing about the other. Then:

$$P(A \text{ and } B) = P(A)\,P(B)$$

Two fair coins both heads: $\tfrac12\cdot\tfrac12 = \tfrac14$. Independence is an *assumption to justify*, not a default: it holds for separate shots of a quantum circuit (each shot is a fresh preparation), and it **fails spectacularly for entangled qubits within one shot** — Module 6 will show you qubit pairs where $P(A\text{ and }B) \ne P(A)P(B)$ by the widest margin nature allows. The whole point of entanglement is broken independence.

@@diagram:prob-tree|A probability tree: multiply along branches (AND), add across leaves (OR). Every compound probability question is a walk on this tree.

## 3. Conditional probability — updating on information

$P(A \mid B)$ — "probability of A *given* B" — is what you believe about A after learning B happened:

$$P(A \mid B) = \frac{P(A \text{ and } B)}{P(B)}$$

Worked micro-example: two qubits measured with distribution $p(00) = 0.5$, $p(11) = 0.3$, $p(01) = 0.1$, $p(10) = 0.1$. Given the right bit read 1 (event $\{01, 11\}$, probability 0.4), what's the chance the left bit is also 1?

$$P(\text{left}=1 \mid \text{right}=1) = \frac{p(11)}{p(01) + p(11)} = \frac{0.3}{0.4} = 0.75$$

Learning the right bit *changed* the left bit's odds from $0.4$ to $0.75$ — these qubits are correlated. Conditional probability is also the mathematics of **post-selection** (keep only the shots where an ancilla qubit read 0 — used in error mitigation and teleportation analysis) and of **Bayes' rule**, the inference engine behind quantum error decoding:

$$P(B \mid A) = \frac{P(A \mid B)\,P(B)}{P(A)}$$

— how a decoder converts "I observed syndrome A" into "the most likely error was B" (Module 10 runs on this).

## 4. Random variables and distributions you'll actually meet

A **random variable** attaches a number to each outcome (heads→1, tails→0). The two distribution families that cover 90% of quantum work:

**Bernoulli(p)** — one biased bit. A single qubit measured in a basis IS a Bernoulli draw with $p = |\beta|^2$. Everything about it is determined by one number.

**Binomial(n, p)** — count of 1s in $n$ independent Bernoulli draws. Run $n$ shots and count how many returned "1": that count $k$ follows

$$P(k) = \binom{n}{k} p^k (1-p)^{n-k}$$

where $\binom{n}{k} = \frac{n!}{k!(n-k)!}$ counts which shots were the 1s. You don't need to hand-compute binomials often, but you must know your shot-counts are binomial — next lesson extracts error bars from exactly this fact.

```python
import numpy as np
rng = np.random.default_rng(seed=7)

# simulate 4000 shots of a qubit with p(1) = 0.3
shots = rng.random(4000) < 0.3          # array of True/False
print(shots.sum(), shots.mean())         # ~1200 ones, fraction ≈ 0.3

# empirical two-qubit distribution from counts (Qiskit-style)
counts = {"00": 2011, "01": 396, "10": 402, "11": 1191}
total = sum(counts.values())
probs = {k: v/total for k, v in counts.items()}
print(probs)   # estimated distribution — this dict is your daily bread in Module 7
p_right1 = probs["01"] + probs["11"]                 # marginalize
p_left1_given_right1 = probs["11"] / p_right1        # condition
print(round(p_right1, 3), round(p_left1_given_right1, 3))
```

## Worked example — full analysis of a noisy Bell measurement

A (slightly noisy) entangling circuit yields, over many shots, the distribution $p(00) = 0.47$, $p(11) = 0.47$, $p(01) = 0.03$, $p(10) = 0.03$. Answer a realistic battery of questions.

**(a) Marginal of the left qubit.** $P(L{=}0) = p(00) + p(01) = 0.50$; $P(L{=}1) = 0.50$. Individually, each qubit looks like a fair coin.

**(b) Are the qubits independent?** Test: $P(L{=}0)\,P(R{=}0) = 0.5 \times 0.5 = 0.25$, but $p(00) = 0.47 \ne 0.25$. **Wildly dependent** — knowing one nearly determines the other, despite each alone being a coin flip. (This "individually random, jointly locked" signature is entanglement's fingerprint; the ideal state would have 0.50/0.50 on 00/11.)

**(c) Agreement probability.** $P(\text{same}) = p(00) + p(11) = 0.94$ — the correlation strength a lab would quote.

**(d) Given the qubits disagreed, was it 01 or 10?** $P(01 \mid \text{differ}) = \tfrac{0.03}{0.06} = 0.5$ — the noise is symmetric between the two error types; a useful diagnostic (asymmetry would hint at readout bias on one qubit).

Four questions, four one-line computations — marginalize, test independence, add exclusive events, condition. That's the entire toolkit, and it just characterized a quantum device.

## Gotchas

- **Adding non-exclusive events.** $P(A) + P(B)$ over-counts the overlap unless A, B can't co-occur. Distinct shot outcomes: safe. "Qubit 1 reads 1" and "qubit 2 reads 1": NOT exclusive — use the general formula or marginalize carefully.
- **Multiplying non-independent probabilities.** Within an entangled shot, $P(A)P(B)$ is exactly the wrong answer — it's the answer entanglement exists to violate. Multiply only across independent repetitions (separate shots), not within one.
- **Probabilities of amplitudes vs amplitudes of probabilities.** Probabilities *never* interfere or cancel — they're non-negative and only add. Amplitudes interfere, *then* you square. Compute in amplitude-land until the final measurement; squaring too early silently deletes the quantum.
- **Confusing $P(A\mid B)$ with $P(B\mid A)$.** "Probability the syndrome fires given an error" ≠ "probability of an error given the syndrome fired" — they differ by base rates (Bayes). Decoders, medical tests, and spam filters all live or die on this distinction.
- **Reading empirical frequency as exact probability.** 253 ones in 1024 shots estimates $p \approx 0.247$ — with uncertainty. How much uncertainty is precisely next lesson; until then, resist writing $p = 0.247$ without error bars.
- **Zero observed ≠ impossible.** A 4000-shot run showing no "10" outcomes bounds $p(10)$ near zero but doesn't prove it's zero — rare outcomes hide below your shot budget.

## Scenario — the readout-error budget meeting

A teammate proposes skipping readout-error mitigation "because our readout error is only 1.5% per qubit." The experiment measures 20 qubits per shot and post-selects on all of them being correct. Your probability toolkit, live: per-shot all-correct probability under independence $= (1 - 0.015)^{20} = 0.985^{20} \approx e^{-0.3} \approx 0.74$. So ~26% of shots are corrupted by readout alone — for a histogram where the signal you're hunting is a 5% bump, that's fatal. Recommendation: mitigate (Module 9's measurement-error mitigation is cheap), or redesign to measure fewer qubits. The meeting takes four minutes because one person could compound probabilities correctly. (Bonus subtlety a strong candidate raises: readout errors across qubits aren't perfectly independent — crosstalk — so 0.74 is optimistic. Knowing when the independence assumption *flatters* you is the senior version of knowing the rule.)

## Key points

- A distribution assigns non-negative numbers summing to 1 over a sample space — normalization, again; quantum measurement is sampling from $p = |\text{amplitude}|^2$.
- Events are outcome-sets; their probabilities add when exclusive (distinct outcomes always are); marginalize by summing over what you ignore.
- Multiply probabilities only across independent events — true for separate shots, violently false inside entangled states.
- Condition to update: $P(A\mid B) = P(A\text{ and }B)/P(B)$; post-selection and error decoding are conditioning in costume.
- One qubit's measurement is Bernoulli($|\beta|^2$); $n$-shot counts are Binomial — the statistical model behind every histogram you'll ever screenshot.
- Amplitudes interfere, probabilities don't: stay in amplitude-land until measurement, then square once.

## Check yourself

```quiz
{"q":"A two-qubit distribution has p(00)=0.4, p(01)=0.1, p(10)=0.2, p(11)=0.3. What is P(left qubit = 1)?","options":["0.3","0.5 — sum p(10)+p(11)","0.2","0.6"],"answer":1,"why":"Marginalize: the left qubit reads 1 in outcomes 10 and 11, so 0.2 + 0.3 = 0.5. Summing over the ignored qubit is marginalization."}
```

```quiz
{"q":"Using the same distribution, are the two qubits independent?","options":["Yes — each marginal is well-defined","No — P(L=1)·P(R=1) = 0.5 × 0.4 = 0.20, but p(11) = 0.3 ≠ 0.20","Yes — the probabilities sum to 1","Cannot be determined from a distribution"],"answer":1,"why":"Independence demands joint = product of marginals for every cell. One failed cell (0.3 vs 0.2) is enough: correlated. This test is your entanglement-sniffing reflex (though classical correlation can also cause it — Module 6 sharpens the distinction)."}
```

## Exercises

**Exercise 1 — the post-selection workout.** An experiment on 3 qubits treats the third as a "flag": you keep a shot only if the flag reads 0. The measured distribution is $p(000)=0.32,\; p(010)=0.08,\; p(100)=0.08,\; p(110)=0.32,\; p(001)=0.05,\; p(011)=0.05,\; p(101)=0.05,\; p(111)=0.05$ (rightmost bit = flag). (a) What fraction of shots survives post-selection? (b) What is the post-selected distribution over the first two qubits? (c) In the kept data, are the first two qubits independent?

````solution
(a) Flag = 0 outcomes: $0.32+0.08+0.08+0.32 = 0.80$ — 80% of shots survive (a 20% "post-selection overhead," the price you'd quote).

(b) Condition: divide survivors by 0.8 → $p(00) = 0.4,\; p(01) = 0.1,\; p(10) = 0.1,\; p(11) = 0.4$ (writing left-two-bits only).

(c) Marginals: $P(\text{first}=1) = 0.5$, $P(\text{second}=1) = 0.5$. Product: 0.25. But $p(11) = 0.4 \ne 0.25$ → **dependent** (strongly correlated — same fingerprint as the Bell scenario). Post-selection *revealed* clean correlations that the flag-1 noise was diluting: exactly why the technique is used. The complete move you just executed — filter, renormalize, re-test — is teleportation analysis and flag-qubit error mitigation in miniature.
````

**Exercise 2 — simulate, then trust nothing.** In Python: simulate 10,000 shots of the distribution from Check-yourself ($0.4/0.1/0.2/0.3$), estimate all four probabilities from your own samples, and compute the estimated $P(L=1\mid R=1)$. Compare to the exact value. Run it three times with different seeds and watch the estimates wobble.

````solution
```python
import numpy as np

outcomes = ["00", "01", "10", "11"]
p = [0.4, 0.1, 0.2, 0.3]
for seed in [1, 2, 3]:
    rng = np.random.default_rng(seed)
    shots = rng.choice(outcomes, size=10_000, p=p)
    est = {o: float(np.mean(shots == o)) for o in outcomes}
    pr_r1 = est["01"] + est["11"]
    cond = est["11"] / pr_r1
    print(seed, est, "P(L=1|R=1)≈", round(cond, 4))
```

Exact target: $P(L{=}1\mid R{=}1) = \tfrac{0.3}{0.4} = 0.75$. Typical run: estimates land within ~±0.01 of each true cell, and the conditional within ~±0.015 of 0.75 — different in every seed. Three habits this plants: (1) empirical probabilities are *estimates* that wobble run-to-run; (2) conditionals wobble MORE (you divided two noisy numbers by each other); (3) fixing seeds makes analyses reproducible — a professional default in every notebook you'll ever share. How big should the wobble be, exactly? That question has a formula, and it's the next lesson.
````

## Practice questions

1. For a fair 8-outcome quantum register (3 qubits, uniform), what's the probability the measured bit-string has exactly one 1?
2. Events A and B have $P(A) = 0.5$, $P(B) = 0.4$, $P(A\text{ and }B) = 0.2$. Independent? Also compute $P(A \text{ or } B)$.
3. Why is "the amplitudes of two paths cancel" not expressible in probability language? One sentence.
4. A test for a rare error fires with $P(\text{flag}\mid\text{error}) = 0.99$ but errors occur in only 1% of shots, and $P(\text{flag}\mid\text{no error}) = 0.05$. Given a flag, what's the probability of a real error? (Bayes — compute $P(\text{flag})$ first.)
5. Your 2-qubit histogram shows perfect 50/50 marginals on both qubits. List two joint distributions consistent with this — one independent, one maximally correlated.
6. Post-selection kept 80% of shots in Exercise 1. If the experiment needs 10,000 *kept* shots, how many must you run, and why might you round up further in practice?
7. **Design question:** design a shot-allocation plan to distinguish two hypotheses about a qubit — $p(1) = 0.50$ vs $p(1) = 0.55$ — informally: guess how many shots feel sufficient, defend your guess with the binomial's behavior, and state what you'd compute after next lesson to replace the guess.

````solution
1. Outcomes {001, 010, 100}: $3/8$.
2. $P(A)P(B) = 0.2 = P(A\text{ and }B)$ → independent (a coincidence-proof example that overlap ≠ dependence). $P(A\cup B) = 0.5 + 0.4 - 0.2 = 0.7$.
3. Probabilities are non-negative and only accumulate; cancellation requires signed/complex quantities — amplitudes — which live one squaring *before* probability.
4. $P(\text{flag}) = 0.99(0.01) + 0.05(0.99) = 0.0594$; Bayes: $\tfrac{0.0099}{0.0594} \approx 0.167$ — only ~17%! Rare-event flags are mostly false alarms; this arithmetic is why error decoders weight priors, and why medical-test intuition fails humans so reliably.
5. Independent: uniform $0.25$ each. Maximally correlated: $0.5/0/0/0.5$ on 00/01/10/11. (Same marginals, opposite worlds — marginals alone never certify independence.)
6. $10{,}000 / 0.8 = 12{,}500$ shots; round up because the 80% survival is itself an estimate that fluctuates run-to-run, and falling short means re-queuing a hardware job (expensive in queue time).
7. A defensible guess: hundreds to ~a thousand shots. Reasoning sketch: the gap to detect is 0.05; binomial counts at $n$ shots fluctuate by roughly $\pm\sqrt{n\cdot p(1-p)} \approx \pm 0.5\sqrt{n}$ in raw count, i.e. $\pm 0.5/\sqrt n$ in frequency; you need fluctuation comfortably below 0.05, suggesting $\sqrt n \gg 10$, so $n$ in the several-hundreds. After next lesson you'd compute it properly: standard error $\sqrt{p(1-p)/n}$, choose $n$ so the two hypotheses sit several standard errors apart (e.g. $n \approx 1000$ gives SE ≈ 0.016, a ~3σ separation). The design instinct — "shots buy $\sqrt n$ precision" — is the single most-used sizing rule in quantum experiments.
````
