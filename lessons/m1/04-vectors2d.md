# Vectors: arrows, components & dot products

Time to meet the main character. A quantum state *is a vector* — not "is like a vector," not "can be pictured as." The state of a qubit is literally a vector with two entries, and every quantum operation is something done to vectors. Learn them in friendly 2D first, where you can draw everything, and the quantum versions become the same pictures with richer numbers.

## Start here — the intuition

Three ideas, and each is a quantum concept two modules early. **A vector has two faces** — an arrow (length + direction) and a column of components — and you translate between them freely. **There are only two things you can do to vectors:** add them (matching components) and scale them (multiply every component by a number); combine both into $a\vec u + b\vec v$, a *linear combination*, and you've written the skeleton of superposition — a qubit is $\alpha\ket0 + \beta\ket1$, a linear combination of two special vectors. **The dot product is an alignment score:** one number saying how much two arrows point the same way — and its square is, quite literally, the probability of mistaking one quantum state for another.

The punchline lands early: a **unit vector** (length 1) has squared components that sum to 1 — which *is* "probabilities sum to 1." Quantum states are unit vectors, so normalization and geometry are the same statement.

## The two faces and the two operations

A vector is a quantity with magnitude and direction. As an arrow, "3 right, 2 up." As algebra, the column $\begin{pmatrix} 3 \\ 2 \end{pmatrix}$ (we write columns — that pays off when matrices arrive next module). Only two operations exist: **addition** (tip‑to‑tail; add matching components) and **scaling** (stretch, or flip if negative). Their combination $a\vec u + b\vec v$ is the single most important construction in the course.

@@diagram:vector-components|One vector, two languages: the arrow (geometry) and its components (algebra). Fluency means translating both ways without thinking.

@@widget

**Length (norm)** is Pythagoras on the components: $\lVert(3,4)\rVert = \sqrt{3^2+4^2} = 5$. A **unit vector** has norm 1; to *normalize*, divide by the norm. Watch the check on $(0.6, 0.8)$: $0.36 + 0.64 = 1$ — sum of squared components equals 1, which is normalization from the algebra lesson wearing geometric clothes.

The **dot product** turns two vectors into one number, $\vec u\cdot\vec v = u_1v_1 + u_2v_2$, and its geometric meaning is the payoff: $\vec u\cdot\vec v = \lVert\vec u\rVert\lVert\vec v\rVert\cos\theta$. So it scores alignment — positive when arrows agree, **zero when perpendicular** (called *orthogonal*), negative when opposed. For unit vectors it's simply $\cos\theta \in [-1,1]$.

## Predict, then run — add, scale, and the overlap that is the Born rule

The live cell does the four operations, then computes the overlap between a vertical state and a 45°‑tilted one and squares it.

**Predict first.** Vectors $\hat a = (1,0)$ and $\hat b = (\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2})$ are both unit length. What's their dot product — and when you *square* it (the quantum "confusability"), do you expect $\tfrac12$, or something smaller? Guess, then Run.

```run
# Live cell — vectors: add, scale, dot, norm, and the overlap that becomes the Born rule.
import numpy as np

u = np.array([3.0, 2.0])
v = np.array([1.0, -4.0])
print("u + v      =", u + v)                 # tip-to-tail
print("2.5 * u    =", 2.5 * u)               # scale
print("u . v      =", np.dot(u, v))          # one number: 3 - 8 = -5
print("||u||      =", round(np.linalg.norm(u), 4))
print("normalize u=", np.round(u/np.linalg.norm(u), 4), "-> squares sum to",
      round(sum((u/np.linalg.norm(u))**2), 4))

a = np.array([1.0, 0.0])                      # a vertical unit state
b = np.array([1.0, 1.0]) / np.sqrt(2)         # a 45-degree unit state
overlap = np.dot(a, b)
print("\noverlap a.b =", round(overlap, 4), "  overlap^2 (=probability) =", round(overlap**2, 4))
```

The overlap is $\tfrac{1}{\sqrt2}\approx0.707$, and squared it is $\tfrac12$: a 45°‑tilted state, asked "are you vertical?", says yes half the time. Overlap 1 → certainty, overlap 0 (orthogonal) → certain no, everything between → probabilistic. That one squared dot product is the **Born rule in embryo** (Module 5 makes it literal) — and it's why $\ket0$ and $\ket1$, being orthogonal, encode a reliable bit while non‑orthogonal states can't be told apart even in principle (the engine under BB84 cryptography).

```quiz
{"q":"Two unit vectors have dot product 0. Read quantum-style, how reliably can you distinguish the two states in a single measurement?","options":["Never — overlap 0 means identical states","Perfectly — orthogonal states have confusion probability 0² = 0","Half the time","Cannot be determined without the angle"],"answer":1,"why":"Zero dot product means orthogonal (perpendicular). Confusion probability is overlap² = 0, so the states are perfectly distinguishable — exactly why bits are encoded in orthogonal states like |0⟩ and |1⟩."}
```

## Level up — components are dot products, and coordinates come for free

Define $\hat e_1 = (1,0)$, $\hat e_2 = (0,1)$: unit‑length, orthogonal, and every vector decomposes as $(3,2) = 3\hat e_1 + 2\hat e_2$. The coefficient of $\hat e_1$ *is* $\vec v\cdot\hat e_1 = 3$ — **a component is a dot product with a basis vector**, answering "how much of $\vec v$ points along this axis?" In quantum language soon: *amplitudes are inner products with basis states*, $\alpha = \braket{0}{\psi}$. Same idea, fancier hats. Also pocket $\vec v\cdot\vec v = \lVert\vec v\rVert^2$ — one formula unifying dot product and length.

## Level up — gotchas the pros watch for

- **Adding norms instead of vectors.** $\lVert\vec u+\vec v\rVert \ne \lVert\vec u\rVert + \lVert\vec v\rVert$ (3 north then 4 east lands you 5 from home, not 7) — the triangle inequality.
- **Dot product is a number, not a vector.** $(3,2)\cdot(1,-4) = -5$, not $(3,-8)$; you *sum* the component products.
- **Forgetting to normalize.** Overlap‑as‑$\cos\theta$ and probability‑as‑overlap² need unit vectors, or your "probability" exceeds 1.
- **Zero dot product means orthogonal, not zero vectors.** $(1,1)\cdot(1,-1) = 0$ with both vectors alive.
- **Sign blindness.** A negative dot product says the arrows oppose — in quantum interference that sign is the whole difference between reinforcement and cancellation.

## Level up — the recommendation engine that's secretly quantum prep

A friend building movie recommendations models each user as a vector of genre affinities: Ana $=(0.9,0.1,0.4)$, Ben $=(0.8,0.2,0.5)$ over (sci‑fi, romance, comedy). How similar? Normalize both, take the dot product: ~0.99, nearly identical taste. Cleo $=(0.1,0.95,0.2)$ scores ~0.25 against Ana — different planet. That's **cosine similarity**, the workhorse of search and LLM embeddings, and it is *exactly* the computation between quantum states, where it's called fidelity/overlap. Same math funds two careers — if quantum winters come, your dot‑product fluency cashes out in ML. A genuine hiring overlap, not a joke.

## Key points

- A vector has two faces — arrow (length + direction) and component column; translate freely.
- Only two operations: add components, scale components. Their combination $a\vec u + b\vec v$ is the skeleton of superposition.
- Norm $= \sqrt{\text{sum of squared components}}$; unit vectors have norm 1; quantum states *are* unit vectors, so normalization is geometry.
- Dot product $= u_1v_1 + u_2v_2 = \lVert u\rVert\lVert v\rVert\cos\theta$: an alignment score; zero = orthogonal = perfectly distinguishable.
- For unit vectors, overlap² = probability of mistaking one state for the other — the Born rule in embryo.
- Components are dot products with basis vectors: $v_1 = \vec v\cdot\hat e_1$ — the template for "amplitude = inner product with basis state."

## Check yourself

```quiz
{"q":"A qubit-like unit vector has components (0.6, 0.8). Quantum-style, the probability tied to the second component is:","options":["0.8","0.64 — the square of 0.8","0.4","Cannot be determined without the angle"],"answer":1,"why":"Squared components of a unit vector act as probabilities: 0.6² + 0.8² = 0.36 + 0.64 = 1. Since it's normalized, the squares are a valid probability pair — and 0.8² = 0.64."}
```

## Exercises

**Exercise 1 — build and verify.** Given $\vec u = \begin{pmatrix}1\\3\end{pmatrix}$, $\vec v = \begin{pmatrix}2\\-1\end{pmatrix}$, compute in the live cell (a) $2\vec u - \vec v$, (b) $\lVert 2\vec u - \vec v\rVert$, (c) the angle between $\vec u$ and $\vec v$.

````solution
```python
import numpy as np
u, v = np.array([1, 3]), np.array([2, -1])
w = 2*u - v
print(w, np.linalg.norm(w))                       # [0 7] 7.0
ct = np.dot(u, v) / (np.linalg.norm(u)*np.linalg.norm(v))
print(np.degrees(np.arccos(ct)))                  # 98.13...
```
(a) $(0,7)$. (b) $7$. (c) $\vec u\cdot\vec v = -1$, norms $\sqrt{10}, \sqrt5$, so $\cos\theta = \tfrac{-1}{\sqrt{50}} \approx -0.141$, $\theta \approx 98.1°$ — just past perpendicular, matching the small negative dot product. Habit: compute by hand *first*, then let code referee.
````

**Exercise 2 — the distinguishability ladder.** Normalize $\vec a = (3,1)$ and $\vec b = (1,3)$, compute overlap and its square. As quantum states, could a single measurement reliably tell them apart? What pair *would* be reliably distinguishable?

````solution
Both have norm $\sqrt{10}$. Overlap $\hat a\cdot\hat b = \tfrac{3+3}{10} = 0.6$; squared $0.36$. A measurement "is this $\hat a$?" applied to $\hat b$ says yes 36% of the time — **no single measurement reliably separates them**. A reliably distinguishable pair is any *orthogonal* one, e.g. $\tfrac{1}{\sqrt2}(1,1)$ and $\tfrac{1}{\sqrt2}(1,-1)$: overlap 0, confusion $0$. Exactly why bits live in orthogonal states, and why a BB84 eavesdropper measuring non‑orthogonal states *must* leave detectable errors.
````

## Practice questions

1. Compute $\begin{pmatrix}4\\-2\end{pmatrix} + 3\begin{pmatrix}-1\\2\end{pmatrix}$; which quadrant does the result point into?
2. Normalize $\begin{pmatrix}5\\12\end{pmatrix}$ and verify the squared components sum to 1.
3. Why is $\vec v\cdot\vec v$ always non‑negative, and what does it equal geometrically?
4. Give a nonzero vector orthogonal to $\begin{pmatrix}2\\5\end{pmatrix}$ and the recipe you used.
5. Two unit vectors have dot product $-1$: geometric relationship, and (quantum preview) what would interference between them do?
6. In one sentence, why are "quantum states are unit vectors" and "probabilities sum to 1" the same fact?
7. **Design question:** define a "similarity search" over four taste‑vectors of your choosing — normalize, pick a query, rank by overlap, and say which a 0.8 threshold returns.

````solution
1. $(1,4)$: first quadrant.
2. Norm $13$; $(\tfrac{5}{13},\tfrac{12}{13})$; squares $\tfrac{169}{169}=1$ ✓.
3. Sum of squares $\ge 0$; equals $\lVert\vec v\rVert^2$.
4. Swap and negate one: $(-5,2)$. Check $2(-5)+5(2)=0$ ✓.
5. Antiparallel ($\theta=\pi$); as amplitudes they cancel maximally — destructive interference, the "$-$" that powers quantum algorithms.
6. Components are amplitudes whose squares are probabilities, so unit norm *is* total probability 1.
7. Any coherent build earns it. Model: A=(0.9,0.1,0.4), B=(0.8,0.2,0.5), C=(0.1,0.95,0.2), D=(0.5,0.5,0.5); query q=(1,0,0.3), all normalized. Overlaps ≈ A:0.985, B:0.955, D:0.79, C:0.20 → A>B>D>C; a 0.8 threshold admits A and B. Normalization stops "louder" vectors cheating; the threshold trades recall vs precision — the same call you'll make deeming two noisy quantum states "the same."
````

## Mastery checklist — you are ready to move on when you can

- ☐ Translate a vector between arrow and component column.
- ☐ Add and scale vectors, and read $a\vec u + b\vec v$ as the shape of superposition.
- ☐ Compute a norm, normalize, and explain why quantum states are unit vectors.
- ☐ Compute a dot product and read its sign as alignment; define orthogonal.
- ☐ Run the live cell and explain why overlap² is a probability of confusion.
- ☐ Say why a component is a dot product with a basis vector.
