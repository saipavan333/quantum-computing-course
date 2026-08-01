# Shor's algorithm & why RSA cares

This is the algorithm that created the field's urgency. In 1994 Peter Shor showed a quantum computer can factor an $n$-digit number in time polynomial in $n$ — exponentially faster than any known classical method — which means a large enough quantum computer breaks RSA, the encryption securing most of the internet. It's the reason governments fund quantum research and NIST standardized post-quantum cryptography. It's also, mechanically, a victory lap for this whole module: **Shor = clever number theory + QPE on modular multiplication + a classical cleanup.** You've built every piece; today you see the assembly, then compute the sober resource estimates that separate the threat's reality from its timeline.

## Start here — the intuition

RSA's security rests on one fact: multiplying two big primes is easy, but *un*-multiplying (factoring the product back into its primes) is, classically, brutally slow. Shor doesn't attack the primes head-on. It does something sideways and beautiful: it turns factoring into a **hunt for a repeating rhythm.**

Pick any number $a$ and look at the sequence $a^1, a^2, a^3, \ldots$ all taken mod $N$. That sequence *always eventually cycles*, and the length of its cycle — its **period** $r$ — secretly encodes $N$'s factors (a little algebra pops them out with a gcd). Finding that period is the only hard step, and it is exactly the "hidden rhythm → sharp frequency spike" job you already watched the QFT do. So Shor is: hide the factoring problem inside a period, let quantum period-finding expose it, finish with grade-school number theory. The quantum computer does **one** thing — find a period. Everything else is classical arithmetic older than computers.

## The reduction — factoring becomes period-finding

Pure classical number theory, no quantum yet. To factor $N$:

1. Pick random $a < N$; if $\gcd(a, N) \neq 1$, you already found a factor (lucky — Euclid, instant). Otherwise:
2. Find the **period** $r$ of $f(x) = a^x \bmod N$ — the smallest $r > 0$ with $a^r \equiv 1 \pmod N$.
3. If $r$ is even and $a^{r/2} \not\equiv -1 \pmod N$ (holds with probability $\ge \tfrac12$ over random $a$), then $\gcd(a^{r/2} \pm 1, N)$ are nontrivial factors.

Why step 3 works, in one line: $a^r \equiv 1$ means $a^r - 1 = (a^{r/2}-1)(a^{r/2}+1) \equiv 0 \pmod N$, so $N$ shares factors with those terms — extractable by gcd. Everything here is classical and fast. **The one hard part is step 2** — finding $r$ — classically as hard as factoring itself, but efficient on a quantum computer. That is the entire quantum payload: *period-finding.*

## The one picture: an assembly line with one quantum station

@@diagram:shor-pipeline|Shor's assembly line: classical reduction (factor → period) → QPE on modular multiplication (the quantum core, feeding |1⟩) → measured phase s/r → continued fractions → period r → gcd → factors. Quantum does ONE job: period-finding.

@@widget

The period $r$ hides in the eigenphases of the unitary $U_a\ket{y} = \ket{ay \bmod N}$ ("multiply by $a$, mod $N$"), whose eigenvalues are $e^{2\pi i s/r}$ — **phases that are multiples of $1/r$.** So run QPE on $U_a$ (last lesson), measure an eigenphase $\approx s/r$, recover $r$ classically. Two exploits make it practical:

- **No eigenstate needed** (QPE's exploit #1): the eigenstates of $U_a$ are hard to prepare, but their equal superposition is trivially $\ket1$. Feed $\ket1$; QPE samples a random $s/r$; linearity does the rest.
- **Efficient controlled powers** (QPE's gotcha #1): QPE needs controlled $U_a^{2^k} = $ "multiply by $a^{2^k}\bmod N$." Naively that's $2^k$ multiplications — exponential death. Instead *classically precompute* $a^{2^k}\bmod N$ by repeated squaring, then implement one controlled-multiply-by-that-constant. This modular arithmetic is ~90% of Shor's gate count.

From the measured phase to the period, one more classical gem — the **continued fraction expansion** recovers the exact fraction $s/r$ from the noisy decimal. With $t \approx 2n+1$ counting qubits it's reliable, and a couple of repetitions handle cases where $s$ and $r$ share a factor.

## Predict, then run — factor numbers live

The quantum station's whole output is a single number: the period. So the live cell below runs the *entire classical wrapper* of Shor and stands in a brute-force `find_period` for the quantum step — letting you actually factor numbers and see where quantum plugs in. (The real quantum period-finder is the QFT periodicity demo you ran two lessons ago, scaled up.)

**Predict first.** For $N = 15, a = 7$: the sequence $7, 49\bmod15=4, 28\bmod15=13, 91\bmod15=1,\ldots$ What is the period $r$? Then Run and watch every $N$ factor.

```run
# Live cell — the CLASSICAL wrapper of Shor. find_period() is the ONE step a
# quantum computer would do; here it's brute-forced so you can factor live.
from math import gcd
import random

def find_period(a, N):           # <- the quantum subroutine in real Shor
    r, x = 1, a % N
    while x != 1:
        x = (x * a) % N; r += 1
    return r

def shor(N, seed=1):
    random.seed(seed)
    if N % 2 == 0: return (2, N // 2)
    for _ in range(40):
        a = random.randrange(2, N)
        g = gcd(a, N)
        if g > 1: return (g, N // g)            # lucky: a shares a factor with N
        r = find_period(a, N)                   # quantum step in the real algorithm
        if r % 2: continue                      # need an even period
        y = pow(a, r // 2, N)
        if y == N - 1: continue                 # degenerate case
        f = gcd(y - 1, N)
        if 1 < f < N: return (f, N // f)
    return None

print("period of 7^x mod 15 is r =", find_period(7, 15))
for N in [15, 21, 35, 91, 143]:
    print(N, "=", " x ".join(map(str, shor(N))))
```

Every line is classical and older than quantum computing except the one call to `find_period` — which brute force does in $O(r)$ but real Shor does in $\text{poly}(\log N)$. You've now delineated *exactly* where the quantum advantage enters: a single swappable subroutine whose only job is returning $r$ fast. Anyone who has built this can never again believe "quantum tries all the factors."

```quiz
{"q":"What single task does the quantum part of Shor's algorithm actually perform?","options":["It tries all possible factors of N in superposition and measures a divisor","It finds the PERIOD r of a^x mod N by estimating an eigenphase (multiple of 1/r) of the modular-multiplication unitary — factors then come from classical gcd","It computes gcd(a, N) faster than Euclid","It directly outputs the prime factors via interference"],"answer":1,"why":"Quantum does period-finding only (QPE on U_a). The reduction to period-finding and the extraction of factors via gcd are classical. 'Tries all factors' is the parallelism myth in its most tempting costume."}
```

## Worked example — factoring 21, narrated

**Reduce:** pick $a = 2$. $\gcd(2, 21) = 1$ (no free factor). Period of $2^x \bmod 21$: $2, 4, 8, 16, 11, 1, \ldots$ → **$r = 6$**.

**Quantum (what QPE does):** eigenphases of $U_2$ are multiples of $1/6$. With $t \approx 9$ counting qubits, a run samples, say, phase $\approx 0.833 = 5/6$. Each is $s/6$ for random $s$.

**Continued fractions:** $\text{Fraction}(0.833).\text{limit\_denominator}(21) = 5/6$ — denominator **6**. (A run that sampled $0.333 = 2/6$ would give $1/3$, a *divisor* of $r$ — the retry case.)

**Finish classically:** $r = 6$ even; $a^{r/2} = 2^3 = 8$; $8 \not\equiv -1 \pmod{21}$; $\gcd(8-1, 21) = 7$ and $\gcd(8+1, 21) = 3$. **$21 = 3 \times 7$.**

The quantum contribution was *one number* (the period $6$). Everything else — the random $a$, the gcds, the continued fractions, the retry logic — is classical arithmetic older than computers. Shor is a classical algorithm with a single quantum subroutine that does the one thing classical computers can't do fast.

## Level up — the sober edition: factoring RSA-2048

| Quantity | RSA-2048 (2048-bit $N$) | Source of the number |
|---|---|---|
| Logical qubits | ~4,000–6,000 | ~$2n$ system + counting + arithmetic ancillas |
| Toffoli/T gates | ~$10^9$–$10^{10}$ | modular exponentiation dominates |
| Circuit depth | ~$10^9$+ | sequential modular arithmetic |
| **Physical qubits (fault-tolerant)** | **~1–20 million** | logical × surface-code overhead (Module 10) |
| Runtime estimate | hours to days | on a machine that does not yet exist |

2026 reality: the largest numbers factored by *pure* Shor on real hardware are tiny (15, 21, and contested larger cases riddled with shortcuts). The gap to RSA-2048 is ~six orders of magnitude in qubit count and needs fault tolerance (Module 10) not yet demonstrated at scale. The honest timeline: **cryptographically relevant Shor is likely 2035–2040+, not imminent** — but "harvest now, decrypt later" (adversaries storing encrypted traffic to crack later) makes migration urgent *today*, which is why NIST finalized post-quantum standards (ML-KEM, ML-DSA — lattice-based, Shor-resistant). Holding both truths — *not soon* AND *migrate now* — marks someone who actually understands the threat model.

## Level up — gotchas the pros watch for

- **"Shor factors by trying all divisors in superposition."** No — it never tries divisors. It finds a *period* via eigenphase sampling; factors fall out of classical gcd. The parallelism myth's final, most seductive form.
- **Underestimating modular exponentiation.** The controlled-$U_a^{2^k}$ arithmetic is ~90% of Shor's gates and depth — the QFT is the cheap part. "Shor is just a QFT" is operationally backwards.
- **The "we factored 35 with 4 qubits" headlines.** Many such claims use compiled circuits that presuppose the answer or exploit $N$'s special structure — not scalable Shor. "Does the method scale without knowing the answer?" is the literacy filter.
- **Conflating logical and physical qubits.** RSA-2048 needs a few thousand *logical* qubits but ~millions of *physical* ones (error-correction overhead). Quoting the logical number as "we're almost there" is the most common public misread.
- **Forgetting the retries.** Even with perfect QPE, ~half of random $a$'s give useless periods (odd $r$, or $a^{r/2}\equiv-1$), and shared $s,r$ factors need retries. Shor is *probabilistic*, expected to succeed in $O(1)$ repetitions.
- **Assuming Grover and Shor threaten crypto equally.** Grover *quadratically* dents symmetric crypto (AES-256 fixes it); Shor *exponentially* breaks public-key (RSA/ECC — migrate to lattices). Different threats, different responses.

## Level up — the CISO briefing you'll actually give

A bank's security chief asks: *"Do we need to panic about Shor?"* The five-sentence briefing that shows mastery: (1) Shor will eventually break our RSA and ECC — the math is certain, the machine is not yet built. (2) Credible estimates put cryptographically-relevant machines at 2035+, needing millions of error-corrected qubits vs today's few hundred noisy ones — a ~million-fold gap. (3) BUT adversaries can record encrypted traffic today and decrypt later, so data needing secrecy beyond ~10 years is *already* at risk. (4) The response is not quantum — it's migrating to NIST post-quantum standards (ML-KEM, ML-DSA), starting now, prioritizing long-lived secrets. (5) Symmetric crypto (AES) only needs bigger keys. Translating a quantum algorithm into a risk decision is the highest-paid skill in the applied-quantum market.

## Key points

- Shor = classical reduction (factoring → period-finding) + quantum period-finding (QPE on $U_a: \ket y \to \ket{ay \bmod N}$) + classical cleanup (continued fractions, gcd). Quantum does ONE job.
- The period lives in $U_a$'s eigenphases (multiples of $1/r$); feed $\ket1$ (no eigenstate prep), implement controlled powers via classically-precomputed repeated squaring (never loop $2^k$ multiplies).
- Continued fractions recover $r$ from the noisy phase; retries handle odd/degenerate periods — Shor is probabilistic, $O(1)$ expected repetitions.
- Modular exponentiation is ~90% of the circuit; the QFT is cheap. RSA-2048: ~few thousand logical / ~millions physical qubits, ~$10^9$–$10^{10}$ Toffolis — a machine ~2035+.
- Threat model: Shor exponentially breaks public-key (migrate to NIST post-quantum now, for harvest-now-decrypt-later); Grover only quadratically dents symmetric (bigger keys).
- "Explain Shor" = the assembly narrative (reduction → QPE → cleanup) + the honest timeline + the logical-vs-physical distinction.

## Check yourself

```quiz
{"q":"An executive reads 'RSA-2048 needs only ~5000 qubits' and concludes today's 1000-qubit machines are close. The correction:","options":["The estimate is wrong; it needs 5000 classical bits","That's ~5000 LOGICAL qubits; fault-tolerant error correction requires ~1000× more PHYSICAL qubits (millions), none of which exist yet at the needed quality — a ~1000-fold gap, plus fault tolerance itself is unproven at scale","Current machines can already do it","Qubit count is irrelevant to Shor"],"answer":1,"why":"Logical (error-corrected) vs physical (raw) qubits differ by the surface-code overhead (~1000×, Module 10). Today's ~1000 NOISY physical qubits are many orders from ~millions of error-corrected ones. Conflating the two is the field's most common public misread."}
```

## Exercises

**Exercise 1 — extend the live wrapper.** In the live cell, add an `attempt` counter and print which $a$ and $r$ succeeded for each $N$; then factor $143$, $323$, and $9797$ ($= 97 \times 101$). Which need more than one attempt, and why (odd period or the $a^{r/2}\equiv-1$ rejection)?

````solution
```python
# Add: return (f, N//f, f"a={a}, r={r}, attempt {attempt}") inside the loop,
# enumerate the attempts, and widen the N list.
# 143 = 11 x 13, 323 = 17 x 19, 9797 = 97 x 101 all factor; some N reject the
# first random a (odd r, or a^(r/2) == N-1) and succeed on attempt 2-4 -- the
# retry logic earning its place. Brute-force find_period slows for large N
# (O(r)); that O(r) cost is exactly what the quantum subroutine removes.
```

Every rejection you watch is the algorithm's honesty: Shor is probabilistic, expected to succeed in a small constant number of attempts. The single line that would change on a real quantum computer is `find_period` — poly-time instead of $O(r)$.
````

**Exercise 2 — resource-estimate reality check.** Estimate, for an $n$-bit RSA modulus: logical qubits (~$2n$), Toffoli count (~$n^2\log n$ for good modular arithmetic vs $n^3$ schoolbook), and physical qubits at ~1500 physical per logical. Tabulate for $n = 15, 128, 512, 1024, 2048$, and compute the runtime for RSA-2048 at a generous $10^6$ logical-Toffoli/second.

````solution
```python
def shor_resources(n):
    logical = 2*n + 3
    toffoli_good = n**2 * max(1, n.bit_length())     # ~n^2 log n
    toffoli_school = n**3
    physical = logical * 1500                         # surface-code ballpark
    return logical, toffoli_good, toffoli_school, physical

for n in (15, 128, 512, 1024, 2048):
    lo, tg, ts, ph = shor_resources(n)
    print(f"n={n:>5} logical={lo:>5} Tof_good={tg:>12,} Tof_school={ts:>16,} physical={ph:>10,}")
```

RSA-2048 lands at ~4,000 logical / ~6 million physical qubits and $10^7$–$10^9$ Toffolis. The naive-vs-good arithmetic gap (~$n^3$ vs ~$n^2\log n$, roughly 170×) is *the difference between feasible and infeasible* — which is why a huge fraction of Shor research optimizes modular-arithmetic circuits, not the QFT. The timeline is gated by physical qubit counts we're ~$10^6$ away from and by arithmetic efficiency that keeps improving; quoting both with numbers is how you brief a room without hype or complacency.
````

## Practice questions

1. Why does finding the period of $a^x \bmod N$ let you factor $N$? Give the two-line algebraic reason.
2. Why can Shor feed $\ket1$ to QPE instead of a hard-to-prepare eigenstate?
3. What goes catastrophically wrong if you implement controlled-$U_a^{2^k}$ by looping the controlled-multiply $2^k$ times?
4. A QPE run yields phase $0.2$ for factoring $N = 21$. What does continued-fractions give, and is it a usable period?
5. Distinguish Grover's and Shor's cryptographic threats and the correct defense against each.
6. Why is "we factored 35 with 8 qubits" not evidence that RSA is nearly broken?
7. **Design question:** build a "quantum readiness" assessment tool for an enterprise — inputs are their crypto inventory (algorithms, key sizes, data-secrecy-lifetimes); output is a prioritized migration plan. Sketch the decision logic and how Shor-vs-Grover estimates and the harvest-now-decrypt-later horizon feed the priorities.

````solution
1. $a^r \equiv 1 \pmod N \Rightarrow (a^{r/2}-1)(a^{r/2}+1) \equiv 0 \pmod N$, so for even non-degenerate $r$, $N$ shares a nontrivial factor with $a^{r/2}\pm1$, extracted by gcd.
2. $\ket1$ is an equal superposition of exactly the eigenstates of $U_a$ whose eigenphases are multiples of $1/r$; QPE on a superposition samples one eigenphase, and any $s/r$ suffices for classical recovery.
3. Depth becomes $O(2^k)$ per counting qubit — exponential in $t$ — so the polynomial-time advantage evaporates. Use classically-precomputed $a^{2^k}\bmod N$ as one controlled-constant-multiply.
4. $\text{Fraction}(0.2).\text{limit\_denominator}(21) = 1/5$ → candidate $r = 5$; check $2^5 = 32 \equiv 11 \not\equiv 1 \pmod{21}$ — not the period; retry. ($0.2$ was a poor sample.)
5. Grover: quadratic speedup on brute-force key search → symmetric (AES); defense = double key length (AES-256). Shor: exponential period-finding → public-key (RSA/ECC); defense = migrate to lattice-based ML-KEM/ML-DSA.
6. Small-$N$ demos typically compile using foreknowledge of the answer or special structure, and omit fault-tolerant overhead; they don't scale to 2048-bit $N$ (millions of physical qubits). "Does it scale without knowing the answer?" is the filter.
7. Classify each asset by (crypto type × key size × secrecy-lifetime). URGENT: public-key protecting data whose secrecy must outlast ~2035 minus migration time (harvest-now-decrypt-later starts the clock now); prioritize by (secrecy-lifetime − years-to-CRQC + migration-effort). SAFE-ish: symmetric ≥ 256-bit; short-lived secrets. Compute a risk score = P(exposed before secrecy expires) from a *distribution* over CRQC-arrival (with uncertainty bands, not a point estimate), and output "migrate now / plan / monitor" tiers. The honest deliverable is a hedged decision, not false precision — this is a real product category (post-quantum readiness assessment).
````

## Mastery checklist — you are ready to move on when you can

- ☐ Explain the reduction: why the period of $a^x \bmod N$ hands you $N$'s factors (the gcd argument).
- ☐ Factor a small $N$ in the live cell and point to the exact line the quantum computer would replace.
- ☐ Say what the quantum core does (QPE on $U_a$), why $\ket1$ is fed, and why controlled powers use repeated squaring.
- ☐ Recover a period from a measured phase with continued fractions, and know when to retry.
- ☐ Quote the RSA-2048 resource estimate and the logical-vs-physical distinction without conflating them.
- ☐ Give the CISO briefing: not-soon and migrate-now, Shor vs Grover, and the post-quantum standards.
