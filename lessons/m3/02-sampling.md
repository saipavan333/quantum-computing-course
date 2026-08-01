# Expectation, variance & sampling: why shots matter

Every quantum job you submit asks one question: **how many shots?** Too few and your results are noise wearing a lab coat; too many and you burn a 10‑minute QPU budget on decimals nobody needs. The answer is a formula — precision improves as $1/\sqrt n$ — and this lesson derives it, teaches you to wield it, and makes "add error bars" a reflex. This is what separates people who *run* quantum circuits from people who can *defend their results*.

## Start here — the intuition

Three ideas, one law. **Expectation** is the long‑run average, $\mathbb{E}[X]=\sum x_k p_k$ — and a quantum expectation value $\langle A\rangle = \bra\psi A\ket\psi$ is *the same weighted average*, which is all VQE (Module 9) ever estimates. **Variance** $p(1-p)$ measures spread and peaks at the fair coin — maximum uncertainty at $p=\tfrac12$, zero at $p\in\{0,1\}$. And the law that runs the whole industry: your estimate's error bar is the **standard error** $\mathrm{SE}=\sqrt{p(1-p)/n}$, which shrinks as $1/\sqrt n$.

Read that last fact like a professional and one consequence dominates: **10× more precision costs 100× more shots.** The square‑root discount never improves — it's brutal, sublinear, and non‑negotiable, and it silently prices every quantum experiment you'll ever plan. The reflex it should install: never quote a probability without its $\pm$.

## Expectation, variance, and the standard error

$\mathbb{E}[X]=\sum_k x_k p_k$ is the probability‑weighted average — a die gives $\tfrac{1+\cdots+6}{6}=3.5$, a value you can never roll (expectation is where averages *converge*, not a prediction of one draw). It's linear with *no* independence needed: $\mathbb{E}[aX+b]=a\mathbb{E}[X]+b$ and $\mathbb{E}[X+Y]=\mathbb{E}[X]+\mathbb{E}[Y]$ — free money. **Variance** $\mathrm{Var}(X)=\mathbb{E}[X^2]-(\mathbb{E}[X])^2$ measures spread; for a Bernoulli($p$) qubit measurement it is $p(1-p)$, and *for independent variables only*, variances add.

@@diagram:shots-convergence|The 1/√n law: quadrupling shots only halves the error bar. Precision is bought on a square-root discount that never improves.

@@widget

Run $n$ independent shots and let $\hat p = \tfrac{\text{count of 1s}}{n}$. It's **unbiased** ($\mathbb{E}[\hat p]=p$ — frequency converges to probability, the law of large numbers in one line), and because independent variances add, $\mathrm{Var}(\hat p)=\frac{p(1-p)}{n}$, giving the box you must memorize:

$$\mathrm{SE} = \sqrt{\frac{p(1-p)}{n}}$$

Worst case $p(1-p)=0.25$ gives the universal rule of thumb $\mathrm{SE}\le\tfrac{0.5}{\sqrt n}$ — at 1,024 shots, no probability is trustworthy beyond about $\pm1.6\%$. The **95% confidence interval** is roughly $\hat p\pm2\,\mathrm{SE}$ (the central limit theorem makes $\hat p$'s wobble bell‑shaped, so $\pm2\sigma\approx95\%$ is a safe default).

## Predict, then run — watch the 1/√n law shrink the bars

The live cell estimates $p=0.3$ at four shot counts and prints each 95% interval.

**Predict first.** Going from 1,000 to 100,000 shots is 100× more data. Does the error bar shrink by 100×, or by 10×? And will every interval still contain the true 0.3? Guess, then Run.

```run
# Live cell — the 1/sqrt(n) law: 100x the shots buys only 10x the precision.
import numpy as np
rng = np.random.default_rng(42)
p_true = 0.3

print("      n     p_hat      95% interval (+/-2SE)      half-width")
for n in [100, 1_000, 10_000, 100_000]:
    est = (rng.random(n) < p_true).mean()
    se  = np.sqrt(est * (1 - est) / n)
    print(f"{n:>7}   {est:.4f}   [{est-2*se:.4f}, {est+2*se:.4f}]     {2*se:.4f}")
```

Each half‑width shrinks by only ~$\sqrt{10}\approx3.2$× per line — 100× the shots, 10× the precision, the law live. And every interval *contains* 0.3: honest error bars are the whole difference between a measurement and an anecdote. Inverting the formula sizes a budget — to resolve $\pm\varepsilon$ at ~95% confidence you need $n\ge\frac{4p(1-p)}{\varepsilon^2}\le\frac{1}{\varepsilon^2}$: about 100 shots for $\pm10\%$, ~1,100 for $\pm3\%$, 10,000 for $\pm1\%$, a million for $\pm0.1\%$.

```quiz
{"q":"You have an estimate with error bar ±4% from 1,000 shots and need ±1%. Roughly how many shots?","options":["2,000 — double it","4,000 — quadruple it","16,000 — error scales as 1/√n, so 4× precision costs 16×","1,000,000"],"answer":2,"why":"Shrinking the error bar by a factor of 4 requires 4² = 16× the shots. 1/√n is a square-root discount that never improves — the single most important number-sense in quantum experiments."}
```

## Level up — the quantum connection, made exact

Measure a Hermitian observable $A$ (Module 2) on $\ket\psi$: outcomes are eigenvalues $\lambda_k$ with probabilities $|\braket{\lambda_k}{\psi}|^2$, so $\langle A\rangle = \sum_k\lambda_k|\braket{\lambda_k}{\psi}|^2 = \bra\psi A\ket\psi$ — the Dirac "sandwich." When Module 9's VQE "estimates $\langle H\rangle$," it computes exactly this weighted average from samples, with the very error bars above. Estimating one energy to chemical accuracy can demand *millions* of shots — the $1/\sqrt n$ law is why near‑term quantum chemistry is so shot‑hungry.

## Level up — adjudicating the histogram fight

A Bell run gives $p(00)=0.487, p(11)=0.471$ at 1,024 shots; a labmate cries "asymmetric device!" Error bars first: $\mathrm{SE}\approx\sqrt{0.48\cdot0.52/1024}\approx0.0156$, so each is $\pm0.031$ at $\pm2\mathrm{SE}$. The difference is 0.016; the SE *of the difference* is $\sqrt{\mathrm{SE}_1^2+\mathrm{SE}_2^2}\approx0.022$ (variances add). The gap is $0.016/0.022\approx0.7$ SE — deep in random‑wobble territory. Verdict: no evidence of asymmetry; resolving a real 1.6% gap would need $n\approx\tfrac{9\times0.25}{0.016^2}\approx8{,}800$ shots each. Noticing was fine; *concluding* was the error — and the gap between them is one $\sqrt n$.

## Level up — gotchas the pros watch for

- **Quoting probabilities without error bars.** $\hat p=0.247$ says nothing; $0.247\pm0.027$ says something.
- **Comparing points, not intervals.** Two histograms differing by under ~2 combined SEs are the same result.
- **"Double the shots to double precision."** No — $\sqrt n$ means doubling buys 1.41×; say "quadruple for double."
- **±2SE isn't a guarantee.** ~1 in 20 honest runs lands outside; a lone 2.5σ blip is a Tuesday, recurring 5σ is a result.
- **Tiny counts break the plug‑in SE.** Distrust any estimate built on fewer than ~20 counts (zero events would falsely give SE 0).
- **Systematic error is a different enemy.** Shots cure *statistical* noise only; miscalibrated readout converges confidently to the *wrong* number (Module 9 mitigates that).

## Key points

- $\mathbb{E}[X]=\sum x_k p_k$; quantum $\langle A\rangle = \bra\psi A\ket\psi$ is the same average, estimated from shots.
- Bernoulli variance $p(1-p)$ peaks at the fair coin; independent variances add — the engine of all error analysis.
- $\mathrm{SE}=\sqrt{p(1-p)/n}$: unbiased center, $1/\sqrt n$ shrinkage, $\pm2\mathrm{SE}\approx95\%$ confidence.
- Shot sizing: $n\approx1/\varepsilon^2$ worst case for $\pm\varepsilon$; distinguishing hypotheses needs their gap $\gg$ combined SE (~3σ).
- Compare by intervals, not points; sub‑2σ differences are noise until proven otherwise.
- Shots fix statistical error only; systematic bias converges confidently to wrong answers — know which enemy you fight.

## Check yourself

```quiz
{"q":"Histogram A gives p̂ = 0.52 and B gives p̂ = 0.49, each from 400 shots (SE ≈ 0.025 each). The right conclusion is:","options":["A's probability is genuinely higher","The difference (0.03) is about 0.85 combined standard errors — statistically indistinguishable; more shots or no claim","B ran on a noisier device","3% is always significant"],"answer":1,"why":"SE of the difference = √(0.025² + 0.025²) ≈ 0.035; a 0.03 gap is under one sigma — pure wobble. Claims need ~2–3σ of separation."}
```

## Exercises

**Exercise 1 — expectation and variance, by hand then by simulation.** A rigged die shows 6 with probability 0.5 and each of 1–5 with 0.1. (a) $\mathbb{E}[X]$ and $\mathrm{Var}(X)$ by hand. (b) Simulate 100,000 rolls to confirm. (c) SE of the *mean* of 100 rolls, in one sentence.

````solution
(a) $\mathbb{E}=0.1(1{+}2{+}3{+}4{+}5)+0.5(6)=4.5$; $\mathbb{E}[X^2]=0.1(55)+0.5(36)=23.5$, so $\mathrm{Var}=23.5-20.25=3.25$ (σ≈1.80).
```python
import numpy as np
rng = np.random.default_rng(0)
rolls = rng.choice(np.arange(1,7), size=100_000, p=[0.1]*5+[0.5])
print(rolls.mean(), rolls.var())   # ≈ 4.5, ≈ 3.25
```
(c) $\mathrm{SE}=\sigma/\sqrt{100}=1.803/10\approx0.18$: "averaging 100 rolls, my mean lands within ~0.18 of 4.5 typically, ~0.36 (2SE) in 95% of runs." The general $\mathrm{SE}=\sigma/\sqrt n$ holds for *any* variable; $\sqrt{p(1-p)/n}$ is its Bernoulli special case.
````

**Exercise 2 — design before running.** Certify a gate's error rate is below 0.5%, with preliminary data near 0.3%. (a) Why is worst‑case $n=1/\varepsilon^2$ oversized here? (b) Size $n$ so $\pm2\mathrm{SE}$ at $p=0.003$ is under the gap to 0.005. (c) What does your design do if the truth is exactly 0.005?

````solution
(a) Worst case assumes $p(1-p)=0.25$; near 0.003 it's ~0.003 — 83× smaller variance, so rare events are cheaper to pin down absolutely. (b) $2\sqrt{0.003\cdot0.997/n}\le0.002 \Rightarrow n\ge\tfrac{4(0.00299)}{4\times10^{-6}}\approx2{,}991$ → run ~5,000–7,000 for headroom and ≥20 error events. (c) If truth sits on the threshold, the interval straddles it ~half the time at any $n$ — no finite experiment certifies "strictly below" a boundary the truth lies on. Honest report: "consistent with threshold; cannot certify." Designing experiments that can *fail honestly* is a credibility marker interviewers probe for.
````

## Practice questions

1. Expectation and variance of a fair coin (0/1), then of measuring $\ket+$ in the computational basis — coincidence?
2. Shots to know a probability near 0.5 to $\pm0.5\%$?
3. Two independent estimates have SEs 0.02 and 0.03 — SE of their difference?
4. Why do variances (not standard deviations) add for independent variables?
5. "Zero errors in 200 shots, so the rate is 0%" — rewrite honestly.
6. Your rarest interesting outcome has $p\approx0.2\%$ — what's wrong with 1,024 shots?
7. **Design question:** 10 QPU min/month, ~2 ms/shot (~300k shots). Allocate across weekly ±2% calibration on ~0.5 probabilities, one 6%‑vs‑3% experiment at 3σ, and exploration. Show arithmetic.

````solution
1. Fair coin: $\mathbb{E}=0.5$, Var $=0.25$. Measuring $\ket+$: $p=0.5$ each — identical. Not coincidence: a qubit measured in a mismatched basis *is* Bernoulli.
2. $n\approx\tfrac{4(0.25)}{0.005^2}=40{,}000$.
3. $\sqrt{0.02^2+0.03^2}\approx0.036$.
4. Independence kills the cross‑term in $\mathbb{E}[(X+Y-\mu)^2]$, leaving the squared spreads; adding σs is the $\sqrt{a^2+b^2}\ne a+b$ triangle fact and overcounts by up to √2.
5. "Zero in 200 shots: consistent with rates up to ~1.5% at 95% (rule of three, $p\lesssim3/n$); more shots needed to certify sub‑percent."
6. Expected count $\approx1024\times0.002\approx2$ events — relative SE ~70%; need ≥10,000 shots for ~20 expected events.
7. Defensible: (i) $\pm2\%$ at 0.5 → $n=2{,}500$/check ×4 = 10k; (ii) gap 0.03 at $p\approx0.06$ → $n\gtrsim\tfrac{9(0.0564)}{0.0009}\approx560$, ×5 replicates ≈ 10k; (iii) ~280k left, but reserve ~20% for re‑runs → spend ~220k on exploration. Fixed obligations sized by formula first, discovery gets the surplus, reserve because queue realities are certainties.
````

## Mastery checklist — you are ready to move on when you can

- ☐ Compute expectation and variance, and state Bernoulli variance $p(1-p)$.
- ☐ Explain why independent variances add (and standard deviations don't).
- ☐ Write and use $\mathrm{SE}=\sqrt{p(1-p)/n}$ and the $\pm2\mathrm{SE}$ interval.
- ☐ Run the live cell and explain why 100× shots buys only 10× precision.
- ☐ Size a shot budget for a target precision or a hypothesis test.
- ☐ Distinguish statistical noise from systematic bias.
