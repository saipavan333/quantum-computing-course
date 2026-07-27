# Shor's algorithm & why RSA cares

This is the algorithm that created the field's urgency. In 1994 Peter Shor showed a quantum computer can factor an $n$-digit number in time polynomial in $n$ — exponentially faster than any known classical method — which means a large enough quantum computer breaks RSA, the encryption securing most of the internet. It's the reason governments fund quantum research and NIST standardized post-quantum cryptography. It's also, mechanically, a victory lap for this whole module: **Shor = clever number theory + QPE on modular multiplication + a classical cleanup**. You've built every piece; today you see the assembly, then compute the sober resource estimates that separate the threat's reality from its timeline.

## 1. The reduction — factoring becomes period-finding

Shor's first move is pure classical number theory, no quantum yet: **factoring reduces to finding the period of a function.** To factor $N$:

1. Pick random $a < N$; if $\gcd(a, N) \neq 1$, you already found a factor (lucky — Euclid's algorithm, classical, instant). Otherwise:
2. Find the **period** $r$ of $f(x) = a^x \bmod N$ — the smallest $r > 0$ with $a^r \equiv 1 \pmod N$.
3. If $r$ is even and $a^{r/2} \not\equiv -1 \pmod N$ (holds with probability ≥ ½ over random $a$ — retry otherwise), then $\gcd(a^{r/2} \pm 1, N)$ are nontrivial factors of $N$.

Why step 3 works, in one line: $a^r \equiv 1$ means $a^r - 1 = (a^{r/2}-1)(a^{r/2}+1) \equiv 0 \pmod N$, so $N$ shares factors with those terms — extractable by gcd. Everything here is classical and fast. **The one hard part is step 2** — finding $r$ — which is classically as hard as factoring itself, but which a quantum computer does efficiently. That's the entire quantum payload: *period-finding*.

## 2. The quantum core — QPE on modular multiplication

The period $r$ hides in the eigenphases of the unitary $U_a\ket{y} = \ket{a y \bmod N}$ ("multiply by $a$, mod $N$"). Its eigenvalues are $e^{2\pi i s/r}$ for $s = 0, 1, \ldots, r-1$ — **phases that are multiples of $1/r$**. So: run QPE on $U_a$, measure an eigenphase $\approx s/r$, and recover $r$ classically. That's it. Shor *is* QPE (last lesson) pointed at modular multiplication.

Two beautiful exploits make it practical:

- **No eigenstate needed** (last lesson's exploit #1, now paying off): the eigenstates of $U_a$ are hard to prepare, but their equal superposition is trivial — it's just $\ket1$. Feed $\ket1$; QPE samples a random $s/r$; linearity handles the rest. This is *why* Shor feeds the humble $\ket1$.
- **Efficient controlled powers** (last lesson's gotcha #1, now essential): QPE needs controlled $U_a^{2^k} = $ "multiply by $a^{2^k} \bmod N$." Naively that's $2^k$ multiplications — exponential death. Instead, **classically precompute** $a^{2^k} \bmod N$ by repeated squaring (each is the previous squared, mod N — fast), then implement one controlled-multiply-by-that-constant. Modular arithmetic in reversible circuits is the bulk of Shor's gate count.

@@diagram:shor-pipeline|Shor's assembly line: classical reduction (factor → period) → QPE on modular multiplication (the quantum core, feeding |1⟩) → measured phase s/r → continued fractions → period r → gcd → factors. Quantum does ONE job: period-finding.

## 3. From measured phase to period — continued fractions

QPE returns a $t$-bit estimate of $s/r$ for a random $s$. Recovering the exact fraction $s/r$ from a noisy decimal is a classical gem — the **continued fraction expansion** finds the best rational approximation with bounded denominator. With $t \approx 2n + 1$ counting qubits (n = bit-length of N), the estimate is precise enough that continued fractions return $r$ reliably; a couple of repetitions handle the cases where $s$ and $r$ share factors (giving a divisor of $r$ — retry or combine).

The full classical cleanup: measure $\to$ continued-fraction $\to$ candidate $r$ $\to$ check $a^r \equiv 1$ $\to$ compute $\gcd(a^{r/2}\pm1, N)$. All polynomial-time and pre-existing (Euclid, ~300 BCE, closes the loop on 21st-century cryptography).

## 4. Running it — factoring 15, and reading the sober edition

The textbook demo (small enough to simulate, real enough to show the machine):

```python
# Factoring N=15 with a=7. Period of 7^x mod 15: 7,4,13,1,... → r=4.
# Qiskit exposes Shor primitives, but the honest small demo uses QPE on U_7:
from fractions import Fraction

def classical_period_from_phase(measured_int, t, N=15):
    phase = measured_int / 2**t
    frac = Fraction(phase).limit_denominator(N)     # continued fractions, one call
    return frac.denominator

# QPE on U_a with a=7, N=15 needs ~4 system qubits + 8 counting qubits.
# (Full modular-multiply circuit is ~30 lines; conceptually:)
#   qc.h(counting); controlled-U_7^{2^k} for each k; QFT†(counting); measure
# A measured counting value of 64 (t=8) → phase 0.25 → Fraction → r=4:
print(classical_period_from_phase(64, 8))            # 4  → r=4
# then: 7^2 mod 15 = 4;  gcd(4-1,15)=3,  gcd(4+1,15)=5  →  15 = 3 × 5 ✓
```

**The sober edition — factoring RSA-2048** (the number that matters):

| Quantity | RSA-2048 (2048-bit N) | Source of the number |
|---|---|---|
| Logical qubits | ~4,000–6,000 | ~2n system + counting + arithmetic ancillas |
| Toffoli/T gates | ~$10^9$–$10^{10}$ | modular exponentiation dominates |
| Circuit depth | ~$10^9$+ | sequential modular arithmetic |
| **Physical qubits (fault-tolerant)** | **~1–20 million** | logical × surface-code overhead (Module 10) |
| Runtime estimate | hours to days | on a machine that does not yet exist |

2026 reality: the largest numbers factored by *pure* Shor on real hardware are tiny (15, 21, and contested larger cases riddled with shortcuts). The gap to RSA-2048 is ~six orders of magnitude in qubit count and requires fault tolerance (Module 10) not yet demonstrated at scale. The honest timeline (per expert surveys and IBM/Google roadmaps): **cryptographically relevant Shor is likely 2035–2040+, not imminent** — but "harvest now, decrypt later" (adversaries storing encrypted traffic to crack post-quantum-computer) makes the migration urgent *today*, which is why NIST finalized post-quantum cryptography standards (ML-KEM, ML-DSA — lattice-based, Shor-resistant) and why banks and governments are migrating now. Being able to hold both truths — *not soon* AND *migrate now* — is the mark of someone who actually understands the threat model.

## Worked example — the complete factoring of 21, narrated

*Factor N = 21, walking every stage so the assembly is concrete.*

**Reduce**: pick $a = 2$. $\gcd(2, 21) = 1$ ✓ (no free factor). Need period of $2^x \bmod 21$: $2, 4, 8, 16, 11, 1, \ldots$ → **r = 6**.

**Quantum (what QPE does)**: eigenphases of $U_2$ are multiples of $1/6$. With $t \approx 9$ counting qubits, a run samples, say, phase $\approx 0.333 = 2/6$; another might give $0.833 = 5/6$. Each is $s/6$ for random $s$.

**Continued fractions**: $\text{Fraction}(0.333).\text{limit\_denominator}(21) = 1/3$ — denominator 3, a *divisor* of r, not r itself (here $s=2$ shared factor 2 with $r=6$). Retry: phase $0.833 \to 5/6$, denominator **6** ✓. (The retry-on-shared-factor step is why Shor runs a handful of times, not once.)

**Finish classically**: $r = 6$ even ✓; $a^{r/2} = 2^3 = 8$; $8 \not\equiv -1 \equiv 20 \pmod{21}$ ✓; $\gcd(8-1, 21) = \gcd(7, 21) = 7$ and $\gcd(8+1, 21) = \gcd(9, 21) = 3$. **21 = 3 × 7** ✓.

Count the quantum contribution: it found *one number* (the period 6). Everything else — the random $a$, the gcd's, the continued fractions, the retry logic — is classical arithmetic older than computers. Shor is not "a quantum algorithm"; it's a classical algorithm with a single quantum subroutine that does the one thing classical computers can't do fast: read a period out of modular exponentiation's phase structure. That framing is both the correct mental model and the exact answer to "explain Shor" in an interview.

## Gotchas

- **"Shor factors by trying all divisors in superposition."** No — it never tries divisors. It finds a *period* via eigenphase sampling; factors fall out of classical gcd. The parallelism myth's final and most seductive form; refuse it precisely.
- **Underestimating modular exponentiation.** The controlled-$U_a^{2^k}$ modular arithmetic is ~90% of Shor's gates and depth — the QFT is the cheap part. "Shor is just a QFT" is half-right and operationally backwards; the arithmetic is the engineering mountain.
- **The 4-qubit-factored-35 headlines.** Many "we factored N on a quantum computer" claims use compiled/simplified circuits that presuppose the answer or exploit N's special structure — not scalable Shor. Read such papers with the "does this scale?" filter; it's a genuine literacy test the field applies to itself.
- **Conflating logical and physical qubits in threat estimates.** RSA-2048 needs ~few thousand *logical* qubits but ~millions of *physical* ones (error-correction overhead, Module 10). Quoting the logical number as "we're almost there" is the most common public misunderstanding — and correcting it calmly is a mark of expertise.
- **Forgetting the retries.** Even with perfect QPE, ~half of random $a$'s give useless (odd $r$, or $a^{r/2}\equiv-1$) periods, and shared factors between $s$ and $r$ need retries. Shor is a *probabilistic* algorithm expected to succeed in $O(1)$ repetitions — not one-shot.
- **Assuming Grover and Shor threaten crypto equally.** Grover *quadratically* weakens symmetric crypto (double the key: fixed — AES-256 fine); Shor *exponentially* breaks public-key (RSA/ECC: dead, migrate to lattices). Different threats, different responses — Module 8's two headline algorithms, precisely distinguished.

## Scenario — the CISO briefing you'll actually give

A bank's Chief Information Security Officer asks your quantum team: *"Do we need to panic about Shor?"* The briefing that demonstrates mastery, five sentences: (1) Shor will eventually break our RSA and ECC — the math is certain, the machine is not yet built. (2) Credible estimates put cryptographically-relevant quantum computers at 2035+, requiring millions of error-corrected physical qubits versus today's few hundred noisy ones — roughly a million-fold gap. (3) BUT: adversaries can record our encrypted traffic today and decrypt it later ("harvest now, decrypt later"), so data needing secrecy beyond ~10 years is *already* at risk. (4) The response is not quantum — it's migrating to NIST's post-quantum standards (ML-KEM for key exchange, ML-DSA for signatures — lattice-based, believed Shor-resistant), which we should begin now, prioritizing long-lived secrets. (5) Symmetric crypto (AES) only needs bigger keys (Grover, not Shor) — a cheap fix. The CISO leaves with a calibrated threat model and an action plan; you've translated a quantum algorithm into a risk decision. That translation — algorithm to business consequence — is the highest-paid skill in the applied-quantum job market, and this scenario is a real interview format for quantum-security roles.

## Key points

- Shor = classical reduction (factoring → period-finding) + quantum period-finding (QPE on $U_a: \ket y \to \ket{ay \bmod N}$) + classical cleanup (continued fractions, gcd). Quantum does ONE job.
- The period lives in $U_a$'s eigenphases (multiples of $1/r$); feed $\ket1$ (no eigenstate prep — QPE samples), and implement controlled powers via classically-precomputed repeated squaring (never loop $2^k$ multiplies).
- Continued fractions recover $r$ from the noisy phase estimate; retries handle odd/degenerate periods and shared $s,r$ factors — Shor is probabilistic, $O(1)$ expected repetitions.
- Modular exponentiation is ~90% of the circuit; the QFT is cheap. Resource estimates for RSA-2048: ~few thousand logical / ~millions physical qubits, ~$10^9$–$10^{10}$ Toffolis — a machine ~2035+.
- Threat model: Shor exponentially breaks public-key crypto (migrate to NIST post-quantum lattice standards now, for harvest-now-decrypt-later); Grover only quadratically dents symmetric (bigger keys suffice).
- "Explain Shor" = the assembly narrative (reduction → QPE → cleanup) + the honest timeline + the logical-vs-physical distinction. That triple is the interview-grade answer.

## Check yourself

```quiz
{"q":"What single task does the quantum part of Shor's algorithm actually perform?","options":["It tries all possible factors of N in superposition and measures a divisor","It finds the PERIOD r of a^x mod N by estimating an eigenphase (multiple of 1/r) of the modular-multiplication unitary — factors then come from classical gcd","It computes gcd(a, N) faster than Euclid","It directly outputs the prime factors via interference"],"answer":1,"why":"Quantum does period-finding only (QPE on U_a). The reduction to period-finding and the extraction of factors via gcd are classical. 'Tries all factors' is the parallelism myth in its most tempting costume."}
```

```quiz
{"q":"An executive reads 'RSA-2048 needs only ~5000 qubits' and concludes today's 1000-qubit machines are close. The correction:","options":["The estimate is wrong; it needs 5000 classical bits","That's ~5000 LOGICAL qubits; fault-tolerant error correction requires ~1000× more PHYSICAL qubits (millions), none of which exist yet at the needed quality — a ~1000-fold gap, plus fault tolerance itself is unproven at scale","Current machines can already do it","Qubit count is irrelevant to Shor"],"answer":1,"why":"Logical (error-corrected) vs physical (raw) qubits differ by the surface-code overhead (~1000×, Module 10). Today's ~1000 NOISY physical qubits are many orders from ~millions of error-corrected ones. Conflating the two is the field's most common public misread."}
```

## Exercises

**Exercise 1 — the classical skeleton of Shor, fully working.** Implement the entire *classical* wrapper — `shor_classical(N)` — that would call a quantum period-finder, but substitute a brute-force `period(a, N)` for the quantum step (fine for small N). Include: random $a$ selection, gcd shortcut, period-finding, the even-$r$ / $a^{r/2}\ne-1$ checks, gcd extraction, and retry logic. Factor 15, 21, 35, and 91, reporting attempts needed. This IS Shor minus the quantum subroutine — building it proves you understand what the quantum part must deliver.

````solution
```python
from math import gcd
import random

def period(a, N):                              # QUANTUM part in real Shor; brute here
    r, x = 1, a % N
    while x != 1:
        x = (x * a) % N; r += 1
    return r

def shor_classical(N, max_attempts=30, seed=0):
    random.seed(seed)
    if N % 2 == 0: return (2, N // 2)
    for attempt in range(1, max_attempts + 1):
        a = random.randrange(2, N)
        g = gcd(a, N)
        if g > 1:                              # lucky classical hit
            return (g, N // g, f"gcd shortcut, attempt {attempt}")
        r = period(a, N)
        if r % 2 != 0:                         # odd period — retry
            continue
        y = pow(a, r // 2, N)
        if y == N - 1:                         # a^{r/2} ≡ -1 — retry
            continue
        f1, f2 = gcd(y - 1, N), gcd(y + 1, N)
        if 1 < f1 < N:
            return (f1, N // f1, f"a={a}, r={r}, attempt {attempt}")
    return None

for N in (15, 21, 35, 91):
    print(N, "→", shor_classical(N))
# 15 → (3, 5, 'a=..., r=4, attempt k')
# 21 → (3, 7, ...)   35 → (5, 7, ...)   91 → (7, 13, ...)
```

Running it, you'll see some N solve on attempt 1, others need 2–4 (odd periods and the $-1$ case get rejected — the retry logic earning its place). The pedagogical payoff: **every line here is classical and older than quantum computing except the one call to `period()`** — which brute-force does in $O(r)$ but real Shor does in $\text{poly}(\log N)$. You've now delineated *exactly* where the quantum advantage enters: a single subroutine, swappable, whose only job is returning $r$ fast. Anyone who's built this wrapper can never again believe "quantum tries all the factors."
````

**Exercise 2 — resource-estimate reality check.** Build a function `shor_resources(n_bits)` estimating, for factoring an n-bit RSA modulus: logical qubits (~$2n + O(\log n)$), Toffoli count (~$n^3$ order-of-magnitude for schoolbook modular exponentiation), and physical qubits at surface-code overhead (assume ~1500 physical per logical at code distance ~25 — Module 10's ballpark). Tabulate for n = 15 (toy), 128, 512, 1024, 2048. Then answer: at a generous $10^6$ Toffoli/second logical rate, runtime for RSA-2048? Compare to the age of the universe if you used schoolbook $n^3$ naively vs the ~$n^2\log n$ of good implementations.

````solution
```python
def shor_resources(n):
    logical = 2*n + 3                                   # rough: 2n + ancillas
    toffoli_schoolbook = n**3                            # order of magnitude
    toffoli_good = int(n**2 * max(1, (n).bit_length()))  # ~n² log n (better arithmetic)
    physical = logical * 1500                            # surface-code overhead ballpark
    return logical, toffoli_good, toffoli_schoolbook, physical

print(f"{'n':>5}{'logical':>9}{'Tof(good)':>14}{'Tof(school)':>16}{'physical':>12}")
for n in (15, 128, 512, 1024, 2048):
    lo, tg, ts, ph = shor_resources(n)
    print(f"{n:>5}{lo:>9}{tg:>14,}{ts:>16,}{ph:>12,}")
# 2048 → logical ~4099, Tof(good) ~4.6e7·… ≈ 10⁷–10⁹ range, physical ~6.1 million

n = 2048
_, tg, ts, _ = shor_resources(n)
rate = 1e6                                              # logical Toffoli/sec (generous)
print(f"good impl runtime: {tg/rate:.1f} s  (~{tg/rate/3600:.2f} h)")
print(f"schoolbook n³ = {ts:,} → {ts/rate/3600:.1f} h")
```

Reading the table: physical qubits for RSA-2048 land in the **millions** (matching the sober-edition table), logical in the low thousands. Runtime at $10^6$ logical-Toffoli/s: the good ~$n^2\log n$ implementation gives ~$10^7$–$10^8$ Toffolis ≈ **tens of seconds to hours of logical computation** — but that "logical rate" hides the error-correction cycle cost, which stretches wall-clock to *hours-to-days* on the hypothetical machine. The naive-vs-good arithmetic comparison is the punchline: schoolbook $n^3 \approx 8.6\times10^9$ vs good $\approx 5\times10^7$ — a ~170× gap that is *the difference between feasible and infeasible*, which is why a huge fraction of Shor research is optimizing modular arithmetic circuits, not the QFT. Deliverable insight: the threat's timeline is gated by (a) physical qubit counts we're ~10⁶ away from and (b) arithmetic-circuit efficiency that active research keeps improving — quoting both, with numbers, is how you brief a room without hype or complacency.
````

## Practice questions

1. Why does finding the period of $a^x \bmod N$ let you factor $N$? Give the two-line algebraic reason.
2. Why can Shor feed $\ket1$ to QPE instead of a hard-to-prepare eigenstate?
3. What goes catastrophically wrong if you implement controlled-$U_a^{2^k}$ by looping the controlled-multiply $2^k$ times?
4. A QPE run yields phase 0.2 for factoring with N = 21. What does continued-fractions give, and is it a usable period?
5. Distinguish Grover's and Shor's cryptographic threats and the correct defense against each.
6. Why is "we factored 35 with 8 qubits" not evidence that RSA is nearly broken?
7. **Design question:** you're asked to build a "quantum readiness" assessment tool for an enterprise: inputs are their crypto inventory (algorithms, key sizes, data-secrecy-lifetimes); output is a prioritized migration plan. Sketch the decision logic — which assets are urgent, which are safe, how Shor vs Grover estimates and the harvest-now-decrypt-later horizon feed the priorities.

````solution
1. $a^r \equiv 1 \pmod N \Rightarrow (a^{r/2}-1)(a^{r/2}+1) \equiv 0 \pmod N$, so (for even $r$, non-degenerate) $N$ shares a nontrivial factor with $a^{r/2}\pm1$, extracted by gcd.
2. $\ket1$ is an equal superposition of exactly the eigenstates of $U_a$ whose eigenphases are the multiples of $1/r$; QPE on a superposition samples one eigenphase (weighted by $|c_j|^2$), and any $s/r$ suffices for the classical recovery.
3. Depth becomes $O(2^k)$ per counting qubit — exponential in $t$, so the circuit is exponentially deep: the polynomial-time advantage evaporates. Must use classically-precomputed $a^{2^k}\bmod N$ as a single controlled-constant-multiply.
4. $\text{Fraction}(0.2).\text{limit\_denominator}(21) = 1/5$ → candidate $r = 5$; check $2^5 = 32 \equiv 11 \not\equiv 1 \pmod{21}$ — NOT the period (0.2 was a poor sample or wrong $a$); retry. (For $a=2$, $r=6$; a phase near $s/6$ was expected — 0.2 ≈ 1/5 signals a bad run, exactly the retry case.)
5. Grover: quadratic speedup on brute-force key search → symmetric crypto (AES); defense = double key length (AES-256). Shor: exponential period-finding → public-key (RSA/ECC); defense = migrate to post-quantum (lattice-based ML-KEM/ML-DSA). Wrong-pairing these is a classic error.
6. Small-N demonstrations typically compile the circuit using foreknowledge of the answer or N's special structure, and don't include the fault-tolerant overhead; they don't scale to 2048-bit N (millions of physical qubits, unproven fault tolerance). "Does the method scale without knowing the answer?" is the filter.
7. Model tool logic: classify each asset by (crypto type × key size × secrecy-lifetime). URGENT: public-key (RSA/ECC) protecting data whose secrecy must outlast ~2035 minus migration time — because harvest-now-decrypt-later means the clock already runs; prioritize by (secrecy-lifetime − years-to-CRQC + migration-effort). SAFE-ish: symmetric crypto ≥ 256-bit (Grover-resistant); short-lived secrets (secrecy horizon < ~5 years) even under RSA. The tool computes, per asset, a risk score = P(exposed before secrecy expires) driven by the CRQC-timeline distribution (with uncertainty bands, not a point estimate) and ranks migrations accordingly; it outputs "migrate now / plan / monitor" tiers. Design sophistication to flag: the timeline is UNCERTAIN, so the tool should take a probability distribution over CRQC-arrival and show risk under optimistic/pessimistic scenarios — because the honest deliverable to an enterprise is a hedged decision, not false precision. This tool is a real product category (post-quantum readiness assessment) and describing it well is a quantum-security-consulting interview in miniature.
````
