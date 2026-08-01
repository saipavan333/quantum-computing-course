# The quantum worldview: superposition & measurement

Everything before this lesson was tooling. Now the physics begins — and it begins with an experiment so strange that a century of the world's best minds have not made it feel normal, only *precise*. Your goal today is not to feel comfortable (nobody does) but to replace vague mystery with the exact rules of the game: what superposition actually claims, what measurement actually does, and where the boundary of the weirdness sits. Everything in Modules 5–11 is these rules, applied.

## Start here — the intuition

Fire single particles — one electron at a time — at a barrier with two slits, and record where each lands on a screen behind. Classically you'd expect two piles, one behind each slit. Instead, the dots pile up into **stripes** — bright bands and, crucially, *dark* bands where almost nothing lands. Bands of "nothing" appear even though each particle went through alone. Each particle behaves as if it explored *both* slits and interfered with itself, like a wave.

Here's the part that matters for computing. Those dark bands are places a particle could reach with *one* slit open, but *not* with both. Opening a second route made some destinations **less** reachable. No "it really went through one slit, we just don't know which" story can produce that — ignorance can only add chances, never cancel them. Something is adding and *cancelling*, and it isn't probabilities. It's **amplitudes**.

@@diagram:double-slit|One particle at a time, yet stripes: each detection is a point, but the pattern is wave interference. Watch the slits and the stripes vanish.

You already own the math: two paths with amplitudes $a_1, a_2$ give total probability $|a_1 + a_2|^2 = |a_1|^2 + |a_2|^2 + 2\,\mathrm{Re}(a_1^* a_2)$, and that cross-term can be **negative** (dark fringe). Amplitudes first, square second. That single cross-term is the entire difference between classical and quantum — and quantum computing is the engineering discipline of that cross-term. (And if you add a detector at the slits to see which path each particle takes, the stripes vanish: *knowing the path destroys the interference.*)

## The rules of the game

Quantum mechanics, stripped to the four rules this course uses:

- **Rule 1 — State.** An isolated system's state is a unit vector $\ket\psi$ in a complex vector space; a system with $d$ distinguishable configurations gets a $d$-dimensional space, and may be in any *superposition* (linear combination) of them.
- **Rule 2 — Evolution.** While unobserved, states change by unitary (norm-preserving, reversible, linear) maps $\ket\psi \to U\ket\psi$. Deterministic clockwork. All randomness enters at Rule 3.
- **Rule 3 — Measurement.** Measuring in an orthonormal basis $\{\ket{b_k}\}$ yields outcome $k$ with probability $p(k) = |\braket{b_k}{\psi}|^2$ (the **Born rule**), and the state *becomes* $\ket{b_k}$ — "collapse." Random, irreversible, destructive of superposition.
- **Rule 4 — Composition.** Multiple systems combine by tensor product (Module 6; dimensions multiply, $2^n$ arrives).

Unobserved systems evolve smoothly and reversibly (Rule 2); observation is abrupt and random (Rule 3). Why the universe has two regimes is a genuinely open interpretational question — but the professional stance is: **the rules' predictions are verified to eleven decimal places; the interpretation debate does not change any number you will ever compute.** This course computes.

@@widget

## What superposition is — and the three things it isn't

$\ket\psi = \alpha\ket0 + \beta\ket1$ is a genuine, single, definite state — just a *linear combination* of basis states with complex weights. The three wrong stories, and what kills each:

| Wrong story | Why it fails |
|---|---|
| "It's really 0 or 1, we just don't know" (ignorance) | Ignorance can't interfere: a coin under a cup makes no stripes. The dark fringes — and $H\ket+ = \ket0$ — need *both* components to exist and cancel. |
| "It's both 0 and 1 simultaneously" (doubling) | One qubit measured always yields exactly one bit; nothing is doubled. The state is *one* vector, not two values. |
| "It rapidly flickers between 0 and 1" (dynamics) | Superpositions are stationary absent evolution; the relative phase — which flickering can't encode — is measurable. |

Worth memorizing: *"A superposition is a definite state that assigns complex amplitudes to each classical possibility; measurement samples a possibility with probability amplitude-squared, and amplitudes — unlike probabilities — can cancel."*

## What measurement does

Three features of Rule 3, each with computational consequences. It's **basis-relative** — "measure" always means "in some orthonormal basis"; hardware measures the computational basis, so measuring anything else = rotate first with gates, then measure. It's **irreversible and lossy** — post-measurement the state is the basis vector you got; one qubit yields at most **one bit** (Holevo), which is why "$2^n$ amplitudes = free exponential parallelism" is false advertising. And it's **genuinely random** — identically prepared states give independent outcomes, so Module 3's statistics is the *permanent* interface to quantum computers.

The moral, echoed all course: **a quantum algorithm choreographs interference (Rule 2) so that, by measurement time (Rule 3), amplitude has concentrated on the answer.** Superposition alone is a random-number generator; interference is the algorithm.

## Predict, then run — the Mach-Zehnder interferometer

The double-slit in circuit form. A photon hits a 50/50 beam splitter (that's exactly an $H$), picks up a phase $\varphi$ in one arm, hits a second beam splitter ($H$), then two detectors watch. The live cell computes the detector probabilities.

**Predict first.** Each beam splitter alone is 50/50. So when you chain two of them with $\varphi = 0$ between, what will detector 0 read — still 50/50, or something else? Guess, then Run.

```run
# Live cell — a Mach-Zehnder interferometer. H = a 50/50 beam splitter.
import numpy as np

# One beam splitter alone is a fair coin:
qc = QuantumCircuit(1); qc.h(0)
print("single splitter  H|0> :", {k: round(v,3) for k,v in qc.probabilities().items()})

# But TWO splitters with a phase between them INTERFERE:
def mach_zehnder(phi):
    qc = QuantumCircuit(1)
    qc.h(0)              # first beam splitter
    qc.rz(phi, 0)        # phase phi in one arm
    qc.h(0)              # second beam splitter
    return qc.probabilities()

print("\nH . phase(phi) . H |0>:")
for phi in [0, np.pi/2, np.pi]:
    p = mach_zehnder(phi)
    print(f"  phi={phi:.2f}   det0={p.get('0',0):.3f}   det1={p.get('1',0):.3f}")
# phi=0 -> det0 = 1.000: the two routes to detector 1 cancel exactly.
# phi=pi -> det1 = 1.000. In between, a smooth interference dial.
```

At $\varphi = 0$ detector 0 fires *every time* — though each splitter alone is a coin flip. The two routes to detector 1 canceled. Now imagine blocking one arm (equivalently, measuring which path): the state entering the second splitter is a basis state, $H$ sends it back to 50/50, and the interference is gone — exactly as the double-slit promised. Superposition + phase + recombination = programmable certainty; observation en route = coin flips. That sentence is the conceptual core of quantum computing.

```quiz
{"q":"A qubit in (|0⟩ + |1⟩)/√2 is measured; you get '1'. You immediately measure again in the same basis. What happens?","options":["50/50 again — the state is still a superposition","Certainly '1' — the first measurement collapsed the state to |1⟩","Certainly '0' — measurements alternate","The qubit is destroyed and cannot be re-measured"],"answer":1,"why":"Collapse: post-measurement the state IS |1⟩, and measuring a basis state in its own basis is deterministic. Repeatability of immediate re-measurement is a defining feature of the measurement rule."}
```

## Level up — gotchas the pros watch for

- **"Quantum computers try all answers in parallel."** They *represent* all inputs in superposition, but readout samples ONE outcome; without interference concentrating amplitude, you get a uniformly random answer (the Holevo one-bit-per-qubit fact defuses this interview landmine).
- **Treating collapse as a physical force.** Collapse is the update rule for *your* description after obtaining information; operationally, post-measurement state = observed basis vector, superposition gone.
- **"Measurement requires a conscious observer."** A stray air molecule "measures" a qubit just fine (decoherence, Module 9). Anything that *records* which-path information kills interference; consciousness never enters the equations.
- **Confusing randomness of outcomes with randomness of evolution.** Rule 2 is deterministic; two identical noiseless circuits produce identical states. Differing histograms across identical runs = shot noise, never "gate randomness."
- **Amplitude/probability order of operations.** Amplitudes add, *then* square; squaring path probabilities separately and adding gives classical (stripe-free) predictions — the exact error that separates classical intuition from quantum arithmetic.

## Level up — explaining your job at a dinner table

The trained answer, six sentences, zero mysticism: *"A quantum computer's memory holds a list of complex numbers — weights over all the possible answers. Its operations rotate that whole list at once, and — the key part — weights can cancel like waves. A good quantum program makes the wrong answers cancel and the right answer's weight grow. When we read out, we get one answer, most likely the right one. The hard parts are that reading destroys the list, and that stray vibrations read it accidentally — which is why the chip lives in a fridge colder than space."* Compressing the rules without deforming them is a paid skill; interviews test it ("explain superposition to a customer").

## Key points

- The double-slit result — single particles, interference stripes, stripes killed by which-path detection — is the irreducible quantum fact; "it secretly took one path" cannot explain the dark fringes.
- Four rules: states are unit vectors (superposition = linear combination); evolution is unitary and deterministic; measurement is basis-relative sampling by $|\braket{b}{\psi}|^2$ with collapse; systems compose by tensor product.
- Superposition ≠ ignorance, ≠ "both at once", ≠ flickering: one definite vector with complex weights that can interfere.
- Measurement yields one bit per qubit, destroys the superposition, and is irreducibly random — statistics is the permanent interface.
- Algorithm = engineered interference: concentrate amplitude on the answer *before* measuring; superposition without interference is a random-number generator.
- Interpretation debates don't change computable predictions; professionals compute.

## Check yourself

```quiz
{"q":"In the double-slit experiment, why can't 'each particle really goes through one slit, we just don't know which' be correct?","options":["Because particles are too small to track","Because the two-slit pattern has locations with FEWER detections than one slit alone produces — ignorance about a definite path can only add probabilities, never cancel them","Because particles split in half, one half per slit","Because detectors always disturb particles mechanically"],"answer":1,"why":"Ignorance mixes probabilities: p = p₁ + p₂ ≥ each alone. The observed dark fringes need amplitude cancellation — a definite-but-unknown path cannot produce them."}
```

## Exercises

**Exercise 1 — the which-path calculation.** In the live cell, confirm $\varphi=0$ gives detector 0 with probability 1 (interference). Then model "a detector watched a path": the superposition after the first splitter collapses to $\ket0$ or $\ket1$ (50% each); send each through a second $H$ and combine the statistics classically. Show you get 50/50, and state the difference in one sentence.

````solution
```python
import numpy as np
H = np.array([[1,1],[1,-1]])/np.sqrt(2); k0=np.array([1,0],complex); k1=np.array([0,1],complex)
print(np.abs(H @ H @ k0)**2)                          # [1. 0.] both paths open
mix = 0.5*np.abs(H@k0)**2 + 0.5*np.abs(H@k1)**2
print(mix)                                            # [0.5 0.5] path watched
```
With paths unobserved the amplitudes recombine and cancel into certainty; with which-path information extracted, only probabilities remain, and probabilities can't cancel — 100/0 becomes 50/50. You've just computed decoherence's essence: measurement converts amplitude addition into probability addition.
````

**Exercise 2 — design a superposition test.** A vendor's black-box source claims each qubit is $(\ket0+\ket1)/\sqrt2$; a skeptic says it's a classical coin (secretly $\ket0$ or $\ket1$, 50/50). Computational-basis measurement can't tell them apart (both give 50/50). Design the one-gate experiment that decides.

````solution
Apply $H$, then measure. Superposition: $H\ket+ = \ket0$ → **100% "0"**. Coin: half the runs are $H\ket0=\ket+$ (50/50), half $H\ket1=\ket-$ (50/50) → **50/50**. Maximally different — a few hundred shots settle it. $H$ converts phase coherence into a population difference, making the invisible visible (this is the daily bread of every quantum lab — Ramsey interference). The coin model can be patched to survive this test, but then a $\pm$-basis measurement distinguishes *that*, and iterating leads to "the hidden variable must predict every basis" — which Bell's theorem (Module 6) kills wholesale.
````

## Practice questions

1. State the four rules from memory, one line each.
2. Why do interference stripes require amplitudes rather than probabilities? Point to the specific term in $|a_1 + a_2|^2$.
3. What does "measurement is basis-relative" let you do, given hardware that only measures one fixed basis?
4. Give the post-measurement state and justification: $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac12\ket1$, measured, outcome "0".
5. A colleague's slide says "n qubits store $2^n$ bits." Correct it precisely (cite the readout limit).
6. Where does the randomness enter — Rule 2 or Rule 3 — and what debugging consequence follows?
7. **Design question:** the Mach–Zehnder with $\varphi$ unknown is a black box (send single photons, count clicks; you may insert one extra known phase shifter). Design a protocol to estimate $\varphi$ to ±0.05 rad, with the shot budget and the sign-ambiguity fix.

````solution
1. State = unit vector in $\mathbb{C}^d$; evolution = unitary/deterministic/reversible; measurement = basis-relative Born-rule sampling with collapse; composition = tensor product.
2. $|a_1+a_2|^2 = |a_1|^2 + |a_2|^2 + 2\mathrm{Re}(a_1^* a_2)$ — the cross-term can be negative (dark fringes); probabilities alone have no negative term.
3. Rotate the state with gates before the fixed measurement: measuring in basis $B$ = apply the unitary mapping $B$ to the computational basis, then measure.
4. State becomes $\ket0$; collapse replaces the state with the observed basis vector, amplitudes discarded.
5. "$n$ qubits' *state* needs $2^n$ complex amplitudes to describe, but a measurement extracts at most $n$ classical bits (Holevo). The exponential lives in the description and the interference dynamics, not in retrievable storage."
6. Rule 3 only; consequently identical noiseless simulations differ only in sampling — fix seeds to compare logic, and never chase "gate randomness."
7. Send $n$ photons, measure click fraction at detector 0 $\to \hat p = \cos^2(\varphi/2)$, invert $\hat\varphi = 2\arccos\sqrt{\hat p}$. Near mid-fringe $|dp/d\varphi| \le \tfrac12$, so $\sigma_\varphi \approx 2\sigma_p$; targeting $\pm0.05$ needs $\sigma_p \approx 0.0125 \Rightarrow n \approx 0.25/\sigma_p^2 \approx 1600$ shots. Fix the $\cos$ sign ambiguity by inserting a known $+\pi/2$ shifter and re-running ~400 shots — whether $\hat p$ rises or falls fixes the sign. (Baby phase estimation, again.)
````

## Mastery checklist — you are ready to move on when you can

- ☐ Explain why the double-slit dark fringes rule out "it secretly took one path."
- ☐ State the four rules from memory, one line each.
- ☐ Give the three things superposition is *not*, and the experiment that kills each.
- ☐ Run the Mach-Zehnder cell and explain why two 50/50 splitters can yield 100/0.
- ☐ Explain what measurement does (basis-relative, one bit, random) and why statistics is the permanent interface.
- ☐ Say the one-sentence definition of superposition, and give the dinner-table explanation without mysticism.
