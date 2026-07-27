# Expectation, variance & sampling: why shots matter

Every quantum job you ever submit will ask one question: **how many shots?** Too few and your results are noise wearing a lab coat; too many and you burn your 10-minute QPU budget on decimal places nobody needs. The answer is a formula — precision improves as $1/\sqrt{n}$ — and this lesson derives it, teaches you to wield it, and makes "add error bars" a reflex. This is the lesson that separates people who *run* quantum circuits from people who can *defend their results*.

## 1. Expectation — the long-run average

A random variable $X$ takes values $x_k$ with probabilities $p_k$. Its **expectation** (mean) is the probability-weighted average:

$$\mathbb{E}[X] = \sum_k x_k\, p_k$$

Die roll: $\mathbb{E} = \tfrac{1+2+\cdots+6}{6} = 3.5$. Note: 3.5 is not a possible outcome — expectation is where averages *converge*, not a prediction of one draw.

Properties (linearity — these hold with **no independence assumptions**, which makes them free money):

$$\mathbb{E}[aX + b] = a\,\mathbb{E}[X] + b \qquad \mathbb{E}[X + Y] = \mathbb{E}[X] + \mathbb{E}[Y]$$

**Quantum connection, made exact.** Measure observable $A$ (Hermitian, Module 2) on state $\ket\psi$: outcomes are eigenvalues $\lambda_k$, probabilities $|\braket{\lambda_k}{\psi}|^2$. The expectation is

$$\langle A\rangle = \sum_k \lambda_k\, |\braket{\lambda_k}{\psi}|^2 = \bra\psi A\ket\psi$$

— the "sandwich" from the Dirac lesson. When Module 9's VQE "estimates $\langle H\rangle$," it is computing exactly this weighted average, from samples, with the error bars you're about to learn.

## 2. Variance and standard deviation — the spread

Expectation says where the center is; **variance** says how far draws stray from it:

$$\mathrm{Var}(X) = \mathbb{E}\big[(X - \mathbb{E}[X])^2\big] = \mathbb{E}[X^2] - (\mathbb{E}[X])^2$$

(The second form is the computational shortcut — "mean of squares minus square of mean.") Its square root $\sigma = \sqrt{\mathrm{Var}}$ — the **standard deviation** — has the same units as $X$ and means, roughly, "typical distance from the mean."

For a Bernoulli($p$) variable (one qubit measurement, $X \in \{0,1\}$):

$$\mathbb{E}[X] = p \qquad \mathrm{Var}(X) = \mathbb{E}[X^2] - p^2 = p - p^2 = p(1-p)$$

That $p(1-p)$ curve peaks at $p = \tfrac12$ (maximum uncertainty — a fair coin is the least predictable bit) and vanishes at $p \in \{0, 1\}$ (deterministic outcomes have zero spread). Memorize it; it prices every shot budget below.

**For independent variables** — and only then — variances add: $\mathrm{Var}(X + Y) = \mathrm{Var}(X) + \mathrm{Var}(Y)$. Shots are independent, so this rule powers everything next.

## 3. The law that runs the industry: $1/\sqrt{n}$

Run $n$ independent shots; let $\hat p = \tfrac{\text{count of 1s}}{n}$ be the observed frequency — your **estimator** of the true $p$. Two questions decide everything:

**Is it centered right?** $\mathbb{E}[\hat p] = \tfrac{1}{n}\sum \mathbb{E}[X_i] = p$ ✓ — unbiased. Frequency converges to probability (the law of large numbers, in one line of linearity).

**How wide is its wobble?** Independence lets variances add:

$$\mathrm{Var}(\hat p) = \frac{1}{n^2}\sum_{i=1}^n \mathrm{Var}(X_i) = \frac{p(1-p)}{n} \qquad\Longrightarrow\qquad \boxed{\;\mathrm{SE} = \sqrt{\frac{p(1-p)}{n}}\;}$$

SE — the **standard error** — is the standard deviation *of your estimate*. Read the formula like a professional:

- Precision scales as $1/\sqrt n$: **10× more precision costs 100× more shots.** Sublinear, brutal, non-negotiable.
- Worst case $p(1-p) = 0.25$ gives the universal rule of thumb $\mathrm{SE} \le \tfrac{0.5}{\sqrt n}$: with 1,024 shots, no estimated probability is trustworthy beyond about $\pm 1.6\%$.
- The **95% confidence interval** is roughly $\hat p \pm 2\,\mathrm{SE}$ (the central limit theorem says $\hat p$'s wobble is approximately bell-shaped for decent $n$ — the deep reason ±2σ ≈ 95% is a safe default).

@@diagram:shots-convergence|The 1/√n law: quadrupling shots only halves the error bar. Precision is bought on a square-root discount that never improves.

```python
import numpy as np
rng = np.random.default_rng(42)
p_true = 0.3
for n in [100, 1_000, 10_000, 100_000]:
    est = (rng.random(n) < p_true).mean()
    se  = np.sqrt(est * (1 - est) / n)
    print(f"n={n:>6}  p̂={est:.4f}  ±2SE=[{est-2*se:.4f}, {est+2*se:.4f}]")
# n=   100  p̂=0.2600  ±2SE=[0.1723, 0.3477]
# n=  1000  p̂=0.2990  ±2SE=[0.2700, 0.3280]
# n= 10000  p̂=0.3007  ±2SE=[0.2915, 0.3099]
# n=100000  p̂=0.3007  ±2SE=[0.2978, 0.3036]
```

Watch the interval shrink by ~√10 ≈ 3.2× per line — the law, live. And notice every interval *contains* 0.3: honest error bars are the difference between measurement and anecdote.

## 4. Sizing a shot budget — the professional workflow

The question "how many shots?" inverts the SE formula. To resolve a probability to precision $\pm\varepsilon$ (at ~95% confidence, i.e. $2\,\mathrm{SE} \le \varepsilon$):

$$n \ge \frac{4\,p(1-p)}{\varepsilon^2} \;\le\; \frac{1}{\varepsilon^2} \;\;(\text{worst case } p = \tfrac12)$$

| Target precision $\varepsilon$ | Worst-case shots $1/\varepsilon^2$ |
|---|---|
| ±10% | 100 |
| ±3% | ~1,100 |
| ±1% | 10,000 |
| ±0.1% | 1,000,000 |

Three professional refinements: (1) if you know roughly where $p$ lives (say ~0.05), use $p(1-p) \approx 0.0475$ and save ~5× the worst-case budget; (2) distinguishing two hypotheses $p_1$ vs $p_2$ needs their gap to span several SEs: $n \gtrsim \tfrac{9\,p(1-p)}{(p_1 - p_2)^2}$ for a ~3σ call; (3) estimating *many* outcome probabilities from one histogram shares the same shots, but rare outcomes have relatively noisier estimates (a $p = 0.001$ outcome at 4,000 shots yields ~4 counts — ±100% relative error).

## Worked example — reproducing the intern's histogram fight

The welcome lesson's Priya saw a Bell experiment return $p(00) = 0.487$, $p(11) = 0.471$, $p(01)+p(10) = 0.042$ at 1,024 shots. A labmate claims "00 and 11 have different probabilities — the device is asymmetric!" Adjudicate.

**Error bars first.** SE for $\hat p \approx 0.48$ at $n = 1024$: $\sqrt{0.48\cdot0.52/1024} \approx 0.0156$. So: $p(00) = 0.487 \pm 0.031$ and $p(11) = 0.471 \pm 0.031$ (±2SE).

**Compare properly.** The difference is $0.016$; the SE *of the difference* is $\sqrt{\mathrm{SE}_1^2 + \mathrm{SE}_2^2} \approx 0.022$ (variances add for independent estimates). The observed gap is $0.016 / 0.022 \approx 0.7$ standard errors — deep inside "random wobble" territory (anything under ~2 is unremarkable).

**Verdict**: no evidence of asymmetry at this shot count. To *actually* resolve a 1.6% asymmetry you'd need $n \approx \tfrac{9 \times 0.25}{0.016^2} \approx 8{,}800$ shots per histogram. The labmate wasn't wrong to notice; they were wrong to conclude — and the difference between those is exactly one $\sqrt{n}$.

## Gotchas

- **Quoting probabilities without error bars.** $\hat p = 0.247$ means nothing; $0.247 \pm 0.027$ means something. Reviewers, interviewers, and physics itself will hold you to this.
- **Comparing point estimates instead of intervals.** Two histograms differing by less than ~2 combined SEs are *the same result*. The Worked example's mistake is committed weekly on real teams.
- **Doubling shots to "double precision."** Precision goes as $\sqrt n$: doubling shots buys 1.41×, not 2×. Budget accordingly and say "quadruple for double" in planning meetings.
- **Treating SE as guaranteed bounds.** ±2SE is ~95% confidence — 1 in 20 honest experiments lands outside. A single 2.5σ blip is a Tuesday, not a discovery; recurring 5σ is a result.
- **Ignoring that $\hat p$ appears inside its own SE.** For very small counts (0–5 events) the plug-in SE misleads (estimated SE of zero events is zero — absurd). Rare-outcome statistics need care: as a rule of thumb, distrust any estimate built on fewer than ~20 counts.
- **Forgetting systematic errors.** Shots cure *statistical* noise only. Miscalibrated readout biases every shot identically — a million shots converge confidently to the *wrong* number. Error bars from this lesson cover randomness, not bias; Module 9's mitigation handles the rest.

## Scenario — the budget that saved the demo

Your team demos a 5-qubit algorithm Friday; the success signature is outcome `10110` standing out above a noise floor of ~2% per competing outcome, expected signal ~8%. QPU time is billed per shot and the Open Plan clock is ticking. The junior plan: "run 100,000 shots to be safe" (≈ minutes of QPU — the whole month's budget). Your plan: need to distinguish 8% from 2% — gap 0.06, take $p(1-p) \approx 0.08\cdot0.92 \approx 0.074$; a 3σ call needs $n \gtrsim \tfrac{9\times0.074}{0.06^2} \approx 185$ — call it 1,000 shots for headroom and pretty plots, which costs seconds. The demo runs, the bar chart shows $7.9\% \pm 1.7\%$ against $2.1\% \pm 0.9\%$, the error bars don't overlap, and the claim survives questioning because the bars were *on the slide*. Statistical literacy converted directly into budget, and budget into a second demo slot.

## Key points

- $\mathbb{E}[X] = \sum x_k p_k$; quantum expectation $\langle A\rangle = \bra\psi A\ket\psi$ is the same weighted average, estimated from shots.
- Bernoulli variance $p(1-p)$ maxes at fair-coin; variances add across independent shots — the engine of all error analysis.
- Standard error $\mathrm{SE} = \sqrt{p(1-p)/n}$: unbiased center, $1/\sqrt n$ shrinkage, ±2SE ≈ 95% confidence.
- Shot sizing: $n \approx 1/\varepsilon^2$ worst case for ±ε; distinguishing hypotheses needs the gap ≫ combined SE (aim ~3σ).
- Compare results by intervals, not points; differences under ~2σ are noise until proven otherwise.
- Shots fix statistical error only — systematic bias converges confidently to wrong answers; know which enemy you're fighting.

## Check yourself

```quiz
{"q":"You have an estimate with error bar ±4% from 1,000 shots and need ±1%. Roughly how many shots?","options":["2,000 — double it","4,000 — quadruple it","16,000 — error scales as 1/√n, so 4× precision costs 16×","1,000,000"],"answer":2,"why":"Shrinking the error bar by a factor of 4 requires 4² = 16× the shots: 1/√n is a square-root discount that never improves."}
```

```quiz
{"q":"Histogram A gives p̂ = 0.52 and histogram B gives p̂ = 0.49, each from 400 shots (SE ≈ 0.025 each). The right conclusion is:","options":["A's probability is genuinely higher","The difference (0.03) is about 0.85 combined standard errors — statistically indistinguishable; more shots or no claim","B was run on a noisier device","The difference is exactly 3%, which is always significant"],"answer":1,"why":"SE of the difference = √(0.025² + 0.025²) ≈ 0.035; a 0.03 gap is under one sigma — pure wobble territory. Claims need ~2–3σ."}
```

## Exercises

**Exercise 1 — expectation and variance by hand, then by simulation.** A rigged die shows 6 with probability 0.5 and each of 1–5 with probability 0.1. (a) Compute $\mathbb{E}[X]$ and $\mathrm{Var}(X)$ by hand. (b) Simulate 100,000 rolls and confirm both. (c) Give the SE of the *mean* of 100 rolls and interpret it in a sentence.

````solution
(a) $\mathbb{E}[X] = 0.1(1+2+3+4+5) + 0.5(6) = 1.5 + 3.0 = 4.5$.
$\mathbb{E}[X^2] = 0.1(1+4+9+16+25) + 0.5(36) = 5.5 + 18 = 23.5$; $\mathrm{Var} = 23.5 - 4.5^2 = 23.5 - 20.25 = 3.25$ (σ ≈ 1.80).

(b)
```python
import numpy as np
rng = np.random.default_rng(0)
faces = np.arange(1, 7)
p = [0.1]*5 + [0.5]
rolls = rng.choice(faces, size=100_000, p=p)
print(rolls.mean(), rolls.var())    # ≈ 4.5, ≈ 3.25
```

(c) $\mathrm{SE} = \sigma/\sqrt{100} = 1.803/10 \approx 0.18$. Sentence: "averaging 100 rolls, my sample mean typically lands within ~0.18 of 4.5, and within ~0.36 (2SE) in 95% of experiments." Note the general form used here — $\mathrm{SE} = \sigma/\sqrt n$ works for *any* random variable, with the Bernoulli case $\sqrt{p(1-p)/n}$ as its most-used special case.
````

**Exercise 2 — design the experiment before running it.** You must certify that a gate's error rate is below 0.5% ($p_{\text{err}} < 0.005$), and preliminary data suggests it's around 0.3%. (a) Why is the worst-case $n = 1/\varepsilon^2$ rule badly oversized here? (b) Size $n$ so that ±2SE at $p = 0.003$ is smaller than the distance to the 0.005 threshold. (c) What does your design do if the true rate is exactly 0.005? (An honest limitation — name it.)

````solution
(a) Worst-case assumes $p(1-p) = 0.25$; near $p = 0.003$, $p(1-p) \approx 0.003$ — about 83× smaller variance. Rare events are *cheaper* to pin down in absolute terms (though harsher in relative terms).

(b) Need $2\sqrt{0.003\cdot0.997/n} \le 0.002$ (the 0.005 − 0.003 gap): $n \ge \tfrac{4 \times 0.002991}{0.000004} \approx 2{,}991$ → run ~3,000–5,000 shots (round up for headroom; also ensures ~9–15 error events, above the ~"20 counts" comfort line only at the top of that range — a tension worth noticing and resolving toward 7,000).

(c) If truth sits exactly at the threshold, your interval will straddle it roughly half the time no matter the $n$ — no finite experiment can certify "strictly below" a boundary the truth sits on. Honest report: "consistent with threshold; cannot certify." Designing experiments that *can fail honestly* is a professional credibility marker — and interviewers deliberately probe for it with exactly this setup.
````

## Practice questions

1. Compute the expectation and variance of a fair coin (values 0/1), then of measuring $\ket+$ in the computational basis. Coincidence?
2. Estimate: how many shots to know a probability near 0.5 to ±0.5%?
3. Two independent estimates have SEs of 0.02 and 0.03. What's the SE of their difference?
4. Why do variances (not standard deviations) add for independent variables? What goes wrong if you add σs?
5. A colleague reports "zero errors in 200 shots, so the error rate is 0%." Rewrite their claim honestly (rough upper bound: with $p = 0.015$, zero events in 200 shots has probability $\approx e^{-3} \approx 5\%$).
6. Your histogram's rarest interesting outcome has true probability ~0.2%. What's wrong with a 1,024-shot run, numerically?
7. **Design question:** you get 10 QPU minutes/month; a shot takes ~2 ms of QPU time (~300k shots/month all-in). Allocate a monthly budget across: (i) calibration checks needing ±2% on ~0.5 probabilities, weekly; (ii) one main experiment distinguishing 6% vs 3% outcomes at 3σ; (iii) exploratory runs. Show the arithmetic and defend the split.

````solution
1. Fair coin: $\mathbb E = 0.5$, Var $= 0.25$. Measuring $\ket+$: outcomes 0/1 with $p = |1/\sqrt2|^2 = 0.5$ each — identical numbers. Not coincidence: a qubit measured in a mismatched basis IS a Bernoulli process; the physics chooses the $p$.
2. $n \approx \tfrac{4(0.25)}{0.005^2} = 40{,}000$.
3. $\sqrt{0.02^2 + 0.03^2} = \sqrt{0.0013} \approx 0.036$.
4. Independence kills cross-terms in $\mathbb E[(X+Y - \mu_X - \mu_Y)^2]$, leaving the two squared spreads; adding σs double-counts (it's the $\sqrt{a^2+b^2} \ne a+b$ triangle fact again). Adding σs overestimates combined noise by up to √2.
5. "Zero errors in 200 shots: consistent with any error rate up to roughly 1.5% at 95% confidence (the 'rule of three': $p \lesssim 3/n$). More shots required to certify sub-percent rates."
6. Expected count $\approx 1024 \times 0.002 \approx 2$ events: relative SE ~70%, far below the ~20-count comfort line. You'd need ≥10,000 shots (≥20 expected events) to say anything quantitative.
7. Model allocation (any defensible arithmetic scores): (i) ±2% at p≈0.5 needs $n = 4(0.25)/0.0004 = 2{,}500$/check × 4 weeks = 10k shots. (ii) gap 0.03 at p≈0.06: $n \ge 9(0.0564)/0.0009 \approx 560$ → with headroom and replication ×5 runs ≈ 10k shots. (iii) remainder ≈ 280k shots for exploration — but hold ~20% of the month in reserve for re-runs after the inevitable surprise, so spend ~220k. The defense: fixed obligations sized by formula first, discovery gets the surplus, reserve because queue realities and mistakes are certainties, not risks. This is *precisely* the mental spreadsheet a working quantum engineer maintains.
````
