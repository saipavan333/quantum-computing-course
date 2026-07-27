# The quantum worldview: superposition & measurement

Everything before this lesson was tooling. Now the physics begins — and it begins with an experiment so strange that a century of the world's best minds have not made it feel normal, only *precise*. Your goal today is not to feel comfortable (nobody does) but to replace vague mystery with the exact rules of the game: what superposition actually claims, what measurement actually does, and where the boundary of the weirdness sits. Everything in Modules 5–11 is these rules, applied.

## 1. The experiment that broke classical physics

**The double-slit experiment.** Fire particles — electrons, photons, even large molecules — one at a time at a barrier with two slits, with a detection screen behind.

Classical expectation: each particle goes through one slit or the other; the screen accumulates two piles, one behind each slit.

What actually happens: each particle lands at a single point (particle-like), but the *accumulated pattern* over thousands of single particles is an **interference pattern** — alternating stripes of many/few detections, the signature of waves passing through *both* slits and recombining. One particle at a time. Each particle interferes *with itself*.

@@diagram:double-slit|One particle at a time, yet stripes: each detection is a point, but the pattern is wave interference. Watch the slits and the stripes vanish.

It gets stranger, in exactly the way that matters for computing:

- **Add a detector at the slits** (to see which slit each particle used): the stripes vanish; you get the two boring piles. *Knowing the path destroys the interference.*
- The particle is not "secretly going through one slit." If it were, the stripes couldn't exist: the stripe pattern has *gaps* — places particles reach with one slit open but NOT with both. Opening a second route made some destinations *less* reachable. No "it went one way, we just don't know which" story survives that arithmetic.

You already own the mathematics of this: two paths, amplitudes $a_1$ and $a_2$, total probability $|a_1 + a_2|^2$ — and the cross-term $2\,\mathrm{Re}(a_1^* a_2)$ (algebra lesson's $2ab$!) can be *negative*. Amplitudes first, square second. Classical probability adds $|a_1|^2 + |a_2|^2$ and can never make a gap. That cross-term is the entire difference between classical and quantum — and quantum computing is the engineering discipline of that cross-term.

## 2. The rules of the game (informal statement)

Quantum mechanics, stripped to the four rules this course uses (each gets formalized over the next three lessons):

**Rule 1 — State.** An isolated system's state is a unit vector $\ket\psi$ in a complex vector space. A system with $d$ perfectly distinguishable configurations gets a $d$-dimensional space; the distinguishable configurations form an orthonormal basis; the system may be in any *linear combination* (superposition) of them.

**Rule 2 — Evolution.** While unobserved, states change by unitary (norm-preserving, reversible, linear) transformations: $\ket\psi \to U\ket\psi$. Deterministic — clockwork, in fact. All randomness enters at Rule 3.

**Rule 3 — Measurement.** Measuring in an orthonormal basis $\{\ket{b_k}\}$ yields outcome $k$ with probability $p(k) = |\braket{b_k}{\psi}|^2$ (the **Born rule**), and the state *becomes* $\ket{b_k}$ — the notorious "collapse." Measurement is random, irreversible, and destructive of superposition.

**Rule 4 — Composition.** Multiple systems combine by tensor product (Module 6's opening act; dimensions multiply, $2^n$ arrives).

Notice the strange split personality: unobserved systems evolve smoothly and reversibly (Rule 2); observation is abrupt and random (Rule 3). Why the universe has two regimes — and what exactly counts as "measurement" — is a genuinely open interpretational question. Here's the professional stance: **the rules' predictions are unambiguous and verified to eleven decimal places; the interpretation debate does not change any number you will ever compute.** This course computes.

## 3. What superposition is — and the three things it isn't

$\ket\psi = \alpha\ket0 + \beta\ket1$ says the system is in a genuine, single, definite state — it's just that this state is a *linear combination* of the basis states, with complex weights. The system is not confused; your classical vocabulary is.

The three wrong stories, and the experiment that kills each:

| Wrong story | Why it fails |
|---|---|
| "It's really 0 or 1, we just don't know" (ignorance) | Ignorance can't interfere: a coin under a cup makes no stripes. The double-slit gaps — and the H-gate's clean return $H\ket+ = \ket0$ — require *both* components to exist and cancel. |
| "It's both 0 and 1 simultaneously" (doubling) | One qubit measured always yields exactly one bit; nothing is doubled. The state is *one* vector, not two values. |
| "It rapidly flickers between 0 and 1" (dynamics) | Superpositions are stationary in time absent evolution; the relative phase — which flickering can't encode — is measurable (you computed it in the Dirac lesson). |

The honest sentence, worth memorizing for interviews: *"A superposition is a definite state that assigns complex amplitudes to each classical possibility; measurement samples a possibility with probability amplitude-squared, and amplitudes — unlike probabilities — can cancel."*

## 4. What measurement does — the strangest rule, operationally

Three features of Rule 3, each with computational consequences:

**It's basis-relative.** "Measure" always means "in some orthonormal basis" (the vector-spaces lesson made this concrete). Hardware measures the computational basis; measuring anything else = rotate the state first with gates, then measure — a trick you'll use in every advanced module.

**It's irreversible and lossy.** Post-measurement, the state is the basis vector you got; $\alpha, \beta$ are gone. One qubit yields at most **one bit** per measurement (Holevo's theorem makes this rigorous for $n$ qubits → $n$ bits). This is why "$2^n$ amplitudes = free exponential parallelism" is false advertising: nature computes with exponential state but pays out one sample per run.

**It's genuinely random.** Not pseudo-random, not chaos-hiding-determinism: identically prepared states give statistically independent outcomes (Bell tests — Module 6 — close the "hidden information" loophole). Your Module 3 statistics toolkit isn't a workaround; it's the *permanent* interface to quantum computers.

The computational moral, stated once and echoed all course: **a quantum algorithm must choreograph interference (Rule 2) so that, by measurement time (Rule 3), amplitude has concentrated on the answer.** Superposition alone is a random-number generator. Interference is the algorithm.

## Worked example — interference you can now compute, twice

*The Mach–Zehnder interferometer* — double-slit physics in circuit form, and literally the H-P(φ)-H pipeline you built in NumPy last lesson.

A photon hits a half-silvered mirror (50/50 beam splitter): paths $A$ (reflected) and $B$ (transmitted). Beam splitter action, as a matrix on path-amplitudes: exactly $H$ (up to phase conventions). A phase shifter $\varphi$ sits in path $B$: matrix $P(\varphi) = \mathrm{diag}(1, e^{i\varphi})$. The paths recombine at a second beam splitter ($H$ again), then detectors watch the two outputs.

**Compute** (all Module 2–4 machinery):

$$\ket{\text{out}} = H\,P(\varphi)\,H\ket0 = \begin{pmatrix} \cos(\varphi/2)\,e^{i\varphi/2} \\ -i\sin(\varphi/2)\,e^{i\varphi/2}\end{pmatrix} \quad(\text{after simplifying})$$

$$p(\text{detector } 0) = \cos^2(\varphi/2) \qquad p(\text{detector } 1) = \sin^2(\varphi/2)$$

At $\varphi = 0$: detector 0 fires *always* — though each beam splitter individually is 50/50! The two routes to detector 1 canceled exactly. At $\varphi = \pi$: certainty flips to detector 1. In between: the smooth interference dial you plotted in NumPy.

**Now the punchline you couldn't have earlier.** Block one path (equivalent: measure which path — Rule 3 collapses the superposition). The state entering the second splitter is a basis state, not a superposition; compute $H\ket0$: 50/50. **Interference gone, exactly as the double-slit promised** — and you didn't have to take anyone's word for it; you computed both scenarios yourself. This one worked example *is* the conceptual core of quantum computing: superposition + phase + recombination = programmable certainty; observation en route = coin flips.

## Gotchas

- **"Quantum computers try all answers in parallel."** They *represent* all inputs in superposition, but readout samples ONE outcome. Without interference concentrating amplitude, you get a uniformly random answer — indistinguishable from guessing. (This misconception is an interview landmine; you now defuse it with the Holevo one-bit-per-qubit fact.)
- **Treating collapse as a physical force.** Collapse is the update rule for *your* description after obtaining information — whether it's "physical" is interpretation, not physics-you-compute. What matters operationally: post-measurement state = observed basis vector; superposition information gone.
- **"Measurement requires a conscious observer."** A stray air molecule bumping the qubit "measures" it just fine (decoherence, Module 9). Anything that *records* which-path information kills interference — consciousness never enters the equations.
- **Confusing randomness of outcomes with randomness of evolution.** Rule 2 is perfectly deterministic; two identical circuits produce *identical states*. Only the final sampling (Rule 3) is random. Debugging implication: differing histograms across identical noiseless-simulator runs = shot noise, never "quantum randomness in the gates."
- **Assuming superposition is fragile because it's 'exotic'.** It's fragile because interference requires *isolation*: any leaked which-path record (into environment, ancilla, or log file) decoheres it. Fragility is an engineering statement — hence dilution refrigerators — not a mystical one.
- **Skipping the amplitude/probability order of operations.** Amplitudes add, THEN square. Squaring path probabilities separately and adding gives classical (stripe-free) predictions — the exact calculational error that distinguishes wrong classical intuition from quantum arithmetic.

## Scenario — explaining your job at a dinner table (a real skill)

Every quantum professional faces the dinner-table question; botching it with "particles in two places at once" invites a week of follow-up mysticism. The trained answer, using only this lesson: *"A quantum computer's memory holds a list of complex numbers — weights over all the possible answers. Its operations rotate that whole list at once, and — the key part — weights can cancel like waves. A good quantum program makes the wrong answers cancel and the right answer's weight grow. When we read out, we get one answer, most likely the right one. The hard parts are that reading destroys the list, and that stray vibrations read it accidentally — which is why the chip lives in a fridge colder than space."* Six sentences, zero mysticism, one canceled-waves metaphor that's *literally accurate*. The ability to compress the rules without deforming them is tested in interviews ("explain superposition to a customer") because customer-facing correctness is a paid skill.

## Key points

- The double-slit result — single particles, interference stripes, stripes killed by which-path detection — is the irreducible quantum fact; "it secretly took one path" cannot explain the gaps.
- Four rules: states are unit vectors (superposition = linear combination); evolution is unitary and deterministic; measurement is basis-relative sampling by $|\braket{b}{\psi}|^2$ with collapse; systems compose by tensor product.
- Superposition ≠ ignorance, ≠ "both at once", ≠ flickering: it's one definite vector with complex weights that can interfere.
- Measurement yields one bit per qubit, destroys the superposition, and is irreducibly random — statistics is the permanent interface (Module 3 was not optional).
- Algorithm = engineered interference: concentrate amplitude on the answer *before* measuring; superposition without interference is a random-number generator.
- Interpretation debates don't change computable predictions; professionals compute (and say so, politely).

## Check yourself

```quiz
{"q":"In the double-slit experiment, why can't 'each particle really goes through one slit, we just don't know which' be correct?","options":["Because particles are too small to track","Because the two-slit pattern has locations with FEWER detections than one slit alone produces — ignorance about a definite path can only add probabilities, never cancel them","Because particles split in half, one half per slit","Because detectors always disturb particles mechanically"],"answer":1,"why":"Ignorance mixes probabilities: p = p₁ + p₂ ≥ each alone. The observed dark fringes need amplitude cancellation — a definite-but-unknown path cannot produce them."}
```

```quiz
{"q":"A qubit in (|0⟩ + |1⟩)/√2 is measured; you get '1'. You immediately measure again in the same basis. What happens?","options":["50/50 again — the state is still a superposition","Certainly '1' — the first measurement collapsed the state to |1⟩","Certainly '0' — measurements alternate","The qubit is destroyed and cannot be re-measured"],"answer":1,"why":"Collapse: post-measurement the state IS |1⟩, and measuring a basis state in its own basis is deterministic. Repeatability of immediate re-measurement is a defining feature of the measurement rule."}
```

## Exercises

**Exercise 1 — the which-path calculation.** Using the Mach–Zehnder pipeline: (a) compute the output probabilities at $\varphi = 0$ with both paths open (do the matrix arithmetic $H P(0) H\ket0$ by hand — note $P(0) = I$). (b) Now model "a detector watched path B": the superposition after the first splitter collapses to $\ket0$ or $\ket1$ (50% each); compute each case through the second splitter and combine the statistics classically. (c) State the difference in one sentence, and verify both in NumPy.

````solution
(a) $HP(0)H = HH = I$, so the output is $\ket0$: detector 0 fires with probability **1**. (Interference at work: two 50/50 elements composing to certainty.)

(b) Case collapse→$\ket0$: second splitter gives $H\ket0 = \ket+$ → 50/50. Case collapse→$\ket1$: $H\ket1 = \ket-$ → 50/50. Classical mixture of the cases: $\tfrac12(50/50) + \tfrac12(50/50) = $ **50/50**.

(c) Sentence: with paths unobserved the amplitudes recombine and cancel into certainty; with which-path information extracted, only probabilities remain, and probabilities can't cancel — 100/0 becomes 50/50.

```python
import numpy as np
H = np.array([[1, 1], [1, -1]]) / np.sqrt(2)
ket0 = np.array([1, 0], dtype=complex); ket1 = np.array([0, 1], dtype=complex)
print(np.abs(H @ H @ ket0)**2)                     # [1. 0.]  — both paths open
mix = 0.5*np.abs(H @ ket0)**2 + 0.5*np.abs(H @ ket1)**2
print(mix)                                          # [0.5 0.5] — path watched
```

You have now computed decoherence's essence: *measurement (by anything) converts amplitude addition into probability addition.* Module 9's noise models are this exercise with more decimal places.
````

**Exercise 2 — design a superposition test.** A vendor hands you a black-box qubit source claiming "each qubit is in $(\ket0+\ket1)/\sqrt2$." A skeptic counters "it's a classical coin: each qubit is secretly $\ket0$ or $\ket1$, 50% each." Design the experiment that decides — specify preparation, the gate(s), the measurement, and the two predicted histograms. (Hint: computational-basis measurement CANNOT distinguish them — show why — so you need one gate.)

````solution
Computational-basis measurement gives 50/50 for both hypotheses (superposition: $|1/\sqrt2|^2$ each; coin: by construction) — provably indistinguishable there, which is why the skeptic's story survives casual testing.

**The decisive experiment**: apply $H$, then measure.

- Superposition hypothesis: $H\ket+ = \ket0$ → histogram **100% "0"** (up to hardware noise).
- Coin hypothesis: half the runs are $H\ket0 = \ket+$ (50/50), half are $H\ket1 = \ket-$ (50/50) → histogram **50/50**.

Maximally different predictions — a few hundred shots settle it beyond argument (Module 3: distinguishing 1.0 from 0.5 at 3σ needs only ~a dozen shots; run 500 for a plot worth showing). The deep content: $H$ converts *phase coherence* into *population difference* — it makes the invisible visible. This experiment (in its many guises: Ramsey interference, randomized benchmarking's cousin) is performed daily in every quantum lab on Earth, and you just designed it from first principles.

Bonus rigor a hiring panel would love: the coin-model can be patched to survive THIS test (let the coin decide ±: half $\ket+$, half $\ket-$)… but then measuring in the $\pm$ basis distinguishes *that*; iterating patches leads to "the hidden variable must predict every basis" — which Bell's theorem (Module 6) kills wholesale. Knowing the escalation ladder is what separates "did the reading" from "owns the argument."
````

## Practice questions

1. State the four rules from memory, one line each. (Do it on paper — this is the course's constitution.)
2. Why do interference stripes require amplitudes rather than probabilities? Point to the specific term in $|a_1 + a_2|^2$.
3. What does "measurement is basis-relative" permit you to do computationally, given hardware that only measures one fixed basis?
4. Give the post-measurement state and the one-sentence justification: $\ket\psi = \tfrac{\sqrt3}{2}\ket0 + \tfrac12\ket1$, measured, outcome "0".
5. A colleague's slide says "n qubits store 2ⁿ bits." Correct the claim precisely (two sentences, cite the readout limit).
6. Where does the randomness in quantum computing enter — Rule 2 or Rule 3 — and what debugging consequence follows?
7. **Design question:** the Mach–Zehnder with $\varphi$ unknown is handed to you as a black box (you may send single photons and count detector clicks; you may also insert one extra known phase shifter of your choosing). Design a protocol to estimate $\varphi$ to ±0.05 rad, including the shot budget (Module 3 arithmetic) and the sign-ambiguity fix (Euler-lesson memory).

````solution
1. State = unit vector in ℂᵈ; evolution = unitary, deterministic, reversible; measurement = basis-relative Born-rule sampling with collapse; composition = tensor product.
2. $|a_1+a_2|^2 = |a_1|^2 + |a_2|^2 + 2\mathrm{Re}(a_1^* a_2)$ — the cross-term can be negative (dark fringes); probabilities alone lack any negative term.
3. Rotate the state with gates before the fixed measurement: measuring in basis B = apply the unitary mapping B to the computational basis, then measure. All bases are one rotation away.
4. State becomes $\ket0$; collapse replaces the state with the observed basis vector, amplitudes discarded.
5. "n qubits' *state* requires 2ⁿ complex amplitudes to describe, but a measurement extracts at most n classical bits (Holevo). The exponential lives in the description and the interference dynamics, not in retrievable storage."
6. Rule 3 only. Consequently: identical noiseless simulations differ only in sampling — fix seeds to compare logic, and never chase "gate randomness," which doesn't exist.
7. Protocol: send $n$ photons, measure click fraction at detector 0 → $\hat p = \cos^2(\varphi/2)$, invert: $\hat\varphi = 2\arccos\sqrt{\hat p}$. Error propagation near mid-fringe: $|d p/d\varphi| = \tfrac12|\sin\varphi| \le \tfrac12$, so $\sigma_\varphi \approx 2\sigma_p$ at worst-useful slope; targeting $\sigma_\varphi \le 0.025$ (so ±2σ ≈ 0.05) needs $\sigma_p \approx 0.0125$ → $n \approx p(1-p)/\sigma_p^2 \le 0.25/0.000156 \approx 1600$ shots. Sign ambiguity ($\cos$ even): insert the known $+\pi/2$ shifter and re-run ~400 shots; whether $\hat p$ rises or falls fixes the sign (the Euler-lesson trick, now with an error budget). Full credit requires: the inversion formula, a shot count derived not guessed, and the two-setting disambiguation — that triple is, once again, baby phase estimation, and you keep reinventing it because it IS the field's master pattern.
````
