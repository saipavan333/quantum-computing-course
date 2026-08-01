# Probability: outcomes, rules & distributions

A quantum computer never hands you "the answer." It hands you a **sample** — one random bit‑string drawn from a distribution your circuit engineered. Run 4,000 shots, get 4,000 samples, and *you* infer the answer from their statistics. That makes probability not background math but the literal output format of your future job. This lesson builds the rules; the next teaches you to reason about samples like a professional.

## Start here — the intuition

Only a handful of moves appear again and again, and each maps onto a daily quantum task. **A distribution is non‑negative numbers that sum to 1** over a set of outcomes — which is *exactly* the normalization you've enforced all course, because quantum measurement samples from $p = |\text{amplitude}|^2$. **To focus on some qubits and ignore others, you sum** (marginalize). **To ask "A or B" for outcomes that can't co‑occur, you add; to ask "A and B" for independent things, you multiply** — and the entire point of entanglement is that this multiplication *fails*. **To update on information, you condition** — $P(A\mid B)$ — which is what post‑selection and error‑decoding secretly are.

Hold one contrast above all: **amplitudes interfere, probabilities don't.** Probabilities are non‑negative and only pile up; cancellation needs signed amplitudes, which live one squaring *before* probability. Square too early and you silently delete the quantum.

## The rules, fast

A random process has a **sample space** $\Omega$ of outcomes, each with $p(\omega)$ obeying $0 \le p(\omega) \le 1$ and $\sum p(\omega) = 1$. An **event** is a set of outcomes; its probability is the sum over them — "the left of two qubits reads 1" is $\{10,11\}$, probability $p(10)+p(11)$. That summing‑over‑what‑you‑ignore is **marginalization**, and you do it constantly.

@@diagram:prob-tree|A probability tree: multiply along branches (AND), add across leaves (OR). Every compound probability question is a walk on this tree.

@@widget

Two combining rules. **Addition (OR)** for mutually exclusive events: $P(A\text{ or }B) = P(A)+P(B)$ (distinct shot outcomes are always exclusive; the general form subtracts the overlap $P(A\cap B)$). **Multiplication (AND)** for independent events: $P(A\text{ and }B) = P(A)P(B)$ — two fair coins both heads, $\tfrac12\cdot\tfrac12 = \tfrac14$. Independence is an assumption to *justify*: true for separate shots (each a fresh preparation), and violated as widely as nature allows inside an entangled pair. Finally, **conditioning**: $P(A\mid B) = \frac{P(A\text{ and }B)}{P(B)}$ updates your belief once $B$ is known — the mathematics of post‑selection and, via **Bayes** $P(B\mid A) = \frac{P(A\mid B)P(B)}{P(A)}$, of every error decoder (Module 10).

Two distribution families cover most quantum work. **Bernoulli(p)** — one biased bit; a single qubit measured in a basis IS a Bernoulli draw with $p = |\beta|^2$. **Binomial(n, p)** — the count of 1s in $n$ shots, $P(k) = \binom{n}{k}p^k(1-p)^{n-k}$; you may not hand‑compute it often, but every histogram you screenshot is binomial, and next lesson pulls error bars straight from that fact.

## Predict, then run — marginalize, condition, test independence

The live cell samples a Bernoulli qubit, then turns a Qiskit‑style counts dict into a distribution and runs the three core moves.

**Predict first.** The counts are `00:2011, 01:396, 10:402, 11:1191` out of 4000. Roughly, is $P(\text{right}=1)$ near 0.1, 0.4, or 0.5? And will the two qubits look independent or correlated? Guess, then Run.

```run
# Live cell — measurement is sampling; marginalize, condition, and test independence.
import numpy as np
rng = np.random.default_rng(7)

shots = rng.random(4000) < 0.3                      # a qubit with p(1)=0.3 -> Bernoulli draws
print("ones:", int(shots.sum()), " fraction:", round(float(shots.mean()), 3), "(true 0.3)")

counts = {"00": 2011, "01": 396, "10": 402, "11": 1191}   # Qiskit-style histogram
total = sum(counts.values())
probs = {k: v/total for k, v in counts.items()}
p_right1 = probs["01"] + probs["11"]                 # marginalize over the left qubit
cond     = probs["11"] / p_right1                     # condition: P(left=1 | right=1)
p_left1  = probs["10"] + probs["11"]
print("P(right=1) =", round(p_right1, 3), "  P(left=1 | right=1) =", round(cond, 3))
print("independent? P(L=1)*P(R=1) =", round(p_left1 * p_right1, 3), " vs p(11) =", round(probs["11"], 3))
```

$P(\text{right}=1)\approx0.40$, and conditioning on it lifts the left qubit's odds to $\approx0.75$ — learning one bit changed the other, so they're correlated. The independence test confirms it: $P(L{=}1)P(R{=}1)\approx0.16$ but $p(11)\approx0.30$. That "individually a coin flip, jointly locked" signature is entanglement's fingerprint (Module 6 sharpens classical correlation vs. genuine entanglement).

```quiz
{"q":"A two-qubit distribution has p(00)=0.4, p(01)=0.1, p(10)=0.2, p(11)=0.3. What is P(left qubit = 1)?","options":["0.3","0.5 — sum p(10)+p(11)","0.2","0.6"],"answer":1,"why":"Marginalize: the left qubit reads 1 in outcomes 10 and 11, so 0.2 + 0.3 = 0.5. Summing over the ignored qubit is marginalization — the move you make whenever you care about some qubits and not others."}
```

## Level up — a full noisy-Bell analysis in four one-liners

A slightly noisy entangler yields $p(00)=0.47, p(11)=0.47, p(01)=0.03, p(10)=0.03$. **Marginal:** $P(L{=}0)=0.47+0.03=0.50$ — each qubit alone is a fair coin. **Independent?** $0.5\times0.5=0.25 \ne 0.47$ — wildly dependent. **Agreement:** $p(00)+p(11)=0.94$, the correlation a lab quotes. **Given they disagreed, 01 or 10?** $\tfrac{0.03}{0.06}=0.5$ — symmetric noise (asymmetry would flag readout bias). Four realistic questions, four lines — marginalize, test independence, add exclusive events, condition — and you've just characterized a device.

## Level up — gotchas the pros watch for

- **Adding non‑exclusive events.** "Qubit 1 reads 1" and "qubit 2 reads 1" can co‑occur — $P(A)+P(B)$ over‑counts; marginalize or use the overlap formula.
- **Multiplying non‑independent probabilities.** Inside an entangled shot, $P(A)P(B)$ is the exact answer entanglement exists to violate. Multiply only *across* independent shots.
- **Squaring too early.** Amplitudes interfere then square; probabilities never interfere. Stay in amplitude‑land until measurement.
- **$P(A\mid B) \ne P(B\mid A)$.** "Syndrome fires given an error" vs. "error given the syndrome fired" differ by base rates — decoders, medical tests, and spam filters all hinge on this.
- **Frequency isn't exact probability.** 253/1024 estimates $p\approx0.247$ *with uncertainty* (next lesson quantifies it); zero observed ≠ impossible.

## Level up — the readout-error budget meeting

A teammate wants to skip readout mitigation "because error is only 1.5% per qubit." But the experiment measures 20 qubits and post‑selects on all correct: under independence $(1-0.015)^{20} = 0.985^{20}\approx e^{-0.3}\approx0.74$. So ~26% of shots are corrupted — fatal when hunting a 5% bump. Recommendation: mitigate (Module 9's is cheap), or measure fewer qubits. The senior subtlety: crosstalk makes readout errors *not* perfectly independent, so 0.74 is optimistic — knowing when the independence assumption flatters you is the real skill.

## Key points

- A distribution assigns non‑negative numbers summing to 1; quantum measurement samples from $p=|\text{amplitude}|^2$ — normalization again.
- Events add when exclusive (distinct outcomes always are); marginalize by summing over what you ignore.
- Multiply probabilities only across independent events — true for separate shots, violently false inside entangled states.
- Condition to update: $P(A\mid B)=P(A\text{ and }B)/P(B)$; post‑selection and error decoding are conditioning in costume.
- One qubit's measurement is Bernoulli($|\beta|^2$); $n$‑shot counts are Binomial — the model behind every histogram.
- Amplitudes interfere, probabilities don't: stay in amplitude‑land until measurement, then square once.

## Check yourself

```quiz
{"q":"Using p(00)=0.4, p(01)=0.1, p(10)=0.2, p(11)=0.3, are the two qubits independent?","options":["Yes — each marginal is well-defined","No — P(L=1)·P(R=1) = 0.5 × 0.4 = 0.20, but p(11) = 0.3 ≠ 0.20","Yes — the probabilities sum to 1","Cannot be determined from a distribution"],"answer":1,"why":"Independence demands joint = product of marginals for every cell. One failed cell (0.3 vs 0.2) is enough: correlated. This test is your entanglement-sniffing reflex, though classical correlation can also trip it — Module 6 sharpens the distinction."}
```

## Exercises

**Exercise 1 — the post‑selection workout.** Three qubits, rightmost bit a "flag"; keep a shot only if the flag reads 0. Distribution: $p(000)=0.32, p(010)=0.08, p(100)=0.08, p(110)=0.32, p(001)=0.05, p(011)=0.05, p(101)=0.05, p(111)=0.05$. (a) What fraction survives? (b) The post‑selected distribution over the first two qubits? (c) Are they independent in the kept data?

````solution
(a) Flag=0 outcomes sum to $0.32+0.08+0.08+0.32 = 0.80$ — 80% survive (a 20% post‑selection overhead). (b) Divide survivors by 0.8 → $p(00)=0.4, p(01)=0.1, p(10)=0.1, p(11)=0.4$. (c) Marginals both 0.5, product 0.25, but $p(11)=0.4$ → **dependent**. Post‑selection *revealed* correlations the flag‑1 noise was diluting — filter, renormalize, re‑test is teleportation analysis and flag‑qubit mitigation in miniature.
````

**Exercise 2 — simulate, then trust nothing.** Simulate 10,000 shots of $0.4/0.1/0.2/0.3$, estimate all four probabilities and $P(L{=}1\mid R{=}1)$ from your samples, and run three seeds to watch them wobble.

````solution
```python
import numpy as np
outcomes, p = ["00","01","10","11"], [0.4,0.1,0.2,0.3]
for seed in [1,2,3]:
    rng = np.random.default_rng(seed)
    shots = rng.choice(outcomes, size=10_000, p=p)
    est = {o: float(np.mean(shots==o)) for o in outcomes}
    cond = est["11"]/(est["01"]+est["11"])
    print(seed, "P(L=1|R=1)≈", round(cond,4))
```
Exact target $\tfrac{0.3}{0.4}=0.75$. Estimates land within ~±0.015 and differ every seed. Three habits: empirical probabilities are estimates that wobble; conditionals wobble *more* (you divided two noisy numbers); fixing seeds makes analyses reproducible. How big is the wobble? That's the next lesson.
````

## Practice questions

1. For 3 uniform qubits, probability the bit‑string has exactly one 1?
2. $P(A)=0.5, P(B)=0.4, P(A\text{ and }B)=0.2$ — independent? Also $P(A\text{ or }B)$?
3. Why is "two paths' amplitudes cancel" not expressible in probability language? One sentence.
4. A rare‑error test: $P(\text{flag}\mid\text{error})=0.99$, errors 1% of shots, $P(\text{flag}\mid\text{no error})=0.05$. Given a flag, probability of a real error?
5. Both qubits show 50/50 marginals — give two joint distributions consistent with that, one independent, one maximally correlated.
6. Post‑selection keeps 80%; to get 10,000 kept shots, how many to run, and why round up?
7. **Design question:** how many shots to distinguish $p(1)=0.50$ vs $0.55$? Guess, defend via the binomial, and say what you'd compute after next lesson.

````solution
1. $\{001,010,100\}$: $3/8$.
2. $P(A)P(B)=0.2=P(A\text{ and }B)$ → independent; $P(A\cup B)=0.7$.
3. Probabilities are non‑negative and only accumulate; cancellation needs signed amplitudes, one squaring before probability.
4. $P(\text{flag})=0.99(0.01)+0.05(0.99)=0.0594$; Bayes $\tfrac{0.0099}{0.0594}\approx0.167$ — only ~17%, so rare‑event flags are mostly false alarms.
5. Independent: 0.25 each. Maximally correlated: 0.5/0/0/0.5 on 00/01/10/11 — same marginals, opposite worlds.
6. $10{,}000/0.8=12{,}500$; round up because the 80% survival is itself a fluctuating estimate and falling short means re‑queuing a hardware job.
7. Hundreds to ~a thousand shots. Frequencies fluctuate by $\approx0.5/\sqrt n$, and you need that well under 0.05, so $\sqrt n\gg10$. Next lesson makes it exact: standard error $\sqrt{p(1-p)/n}$; $n\approx1000$ gives SE ≈ 0.016, a ~3σ separation. "Shots buy $\sqrt n$ precision" is the most‑used sizing rule in quantum experiments.
````

## Mastery checklist — you are ready to move on when you can

- ☐ State the two axioms and connect $\sum p = 1$ to quantum normalization.
- ☐ Marginalize a joint distribution down to one qubit.
- ☐ Add exclusive events and multiply independent ones — and say when multiplication fails.
- ☐ Compute a conditional and explain post‑selection as conditioning.
- ☐ Run the live cell and test two qubits for independence.
- ☐ Name the Bernoulli/Binomial models behind a single qubit and a shot count.
