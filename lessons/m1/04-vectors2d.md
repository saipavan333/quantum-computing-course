# Vectors: arrows, components & dot products

Time to meet the main character. A quantum state *is a vector*. Not "is like a vector," not "can be visualized as" — the state of a qubit is literally a vector with two entries, and every quantum operation is something done to vectors. Learn vectors in friendly 2D first, where you can draw everything, and the quantum versions become the same pictures with richer numbers.

## 1. Two views of one object

A **vector** is a quantity with magnitude and direction. Two equivalent representations:

- **Geometric**: an arrow. Length = magnitude, orientation = direction.
- **Algebraic**: a list of components — how far the arrow reaches along each axis. The arrow "3 right, 2 up" is $\vec v = \begin{pmatrix} 3 \\ 2 \end{pmatrix}$.

@@diagram:vector-components|One vector, two languages: the arrow (geometry) and its components (algebra). Fluency means translating both ways without thinking.

We write vectors as columns (that convention pays off when matrices arrive next module). The vector's tail sits at the origin unless said otherwise; what matters is displacement, not position.

## 2. The two operations vectors allow

**Addition — tip to tail.** Algebraically, add matching components:

$$\begin{pmatrix} 3 \\ 2 \end{pmatrix} + \begin{pmatrix} 1 \\ -4 \end{pmatrix} = \begin{pmatrix} 4 \\ -2 \end{pmatrix}$$

Geometrically: walk the first arrow, then the second from where you stopped; the sum points from start to finish.

**Scaling — stretch or flip.** Multiply every component by a number (a **scalar**):

$$2.5\begin{pmatrix} 3 \\ 2 \end{pmatrix} = \begin{pmatrix} 7.5 \\ 5 \end{pmatrix} \qquad (-1)\begin{pmatrix} 3 \\ 2 \end{pmatrix} = \begin{pmatrix} -3 \\ -2 \end{pmatrix}$$

Positive scalars stretch/shrink; negative ones also reverse direction.

**Combining both** gives the **linear combination** — the most important construction in this entire course:

$$a\,\vec u + b\,\vec v$$

Preview in plain sight: a qubit state is $\alpha\ket0 + \beta\ket1$ — a linear combination of two special vectors with scalars $\alpha, \beta$. *Superposition is a linear combination.* When Module 5 says that sentence, you'll shrug — you've been doing it since today.

## 3. Length (norm)

The **norm** $\lVert\vec v\rVert$ is the arrow's length — Pythagoras on components:

$$\left\lVert\begin{pmatrix} 3 \\ 4 \end{pmatrix}\right\rVert = \sqrt{3^2 + 4^2} = \sqrt{25} = 5$$

A **unit vector** has norm 1. To *normalize* a vector (make it unit-length, keep its direction), divide by its norm: $\hat v = \vec v / \lVert\vec v\rVert$. For the example: $\hat v = \begin{pmatrix} 0.6 \\ 0.8 \end{pmatrix}$ — check: $0.36 + 0.64 = 1$ ✓.

Look at that check again: *sum of squared components equals 1*. That is normalization from Lesson 2 wearing geometric clothes. **Quantum states are unit vectors** — the "probabilities sum to 1" rule and "the arrow has length 1" are the same statement. This is the module's punchline, two lessons early.

## 4. The dot product — multiplication for vectors

The **dot product** of two vectors is a single number:

$$\vec u \cdot \vec v = u_1 v_1 + u_2 v_2$$

Example: $\begin{pmatrix}3\\2\end{pmatrix}\cdot\begin{pmatrix}1\\-4\end{pmatrix} = 3 - 8 = -5$.

The geometric meaning is the payoff:

$$\vec u \cdot \vec v = \lVert\vec u\rVert\,\lVert\vec v\rVert\cos\theta$$

where $\theta$ is the angle between the arrows. So the dot product measures **alignment**:

| Configuration | $\cos\theta$ | Dot product |
|---|---|---|
| Same direction ($\theta = 0$) | $1$ | maximal positive |
| Perpendicular ($\theta = \pi/2$) | $0$ | **zero** |
| Opposite ($\theta = \pi$) | $-1$ | maximal negative |

Perpendicular vectors — dot product zero — get a special name: **orthogonal**. For unit vectors the dot product is simply $\cos\theta$: a number in $[-1, 1]$ scoring "how much does $\vec u$ point along $\vec v$?" — 1 for identical, 0 for unrelated directions, −1 for opposite.

@@diagram:dot-projection|The dot product as overlap: project one arrow onto the other. Orthogonal arrows have zero shadow — zero overlap.

**Why quantum cares, precisely:** the quantum inner product (Module 2) generalizes the dot product, and the **overlap between two states determines the probability of mistaking one for the other**. Orthogonal states — overlap zero — are perfectly distinguishable: that's why $\ket0$ and $\ket1$ can encode a reliable bit. Non-orthogonal states cannot be told apart reliably even in principle, which is the engine behind quantum cryptography (BB84 leans entirely on this).

Also pocket this: the dot product of a vector with itself is its norm squared, $\vec v \cdot \vec v = \lVert\vec v\rVert^2$ — one formula, two concepts unified.

## 5. Basis vectors — coordinates are dot products

Define $\hat e_1 = \begin{pmatrix}1\\0\end{pmatrix}$ (pure x) and $\hat e_2 = \begin{pmatrix}0\\1\end{pmatrix}$ (pure y). They're unit-length, mutually orthogonal, and every 2D vector decomposes as

$$\begin{pmatrix}3\\2\end{pmatrix} = 3\,\hat e_1 + 2\,\hat e_2$$

Notice: the coefficient of $\hat e_1$ equals $\vec v \cdot \hat e_1 = 3$. **Components are dot products with basis vectors** — "how much of $\vec v$ points along this axis?" In quantum language (soon): *amplitudes are inner products with basis states*, $\alpha = \braket{0}{\psi}$. Same idea, fancier hats.

```python
import numpy as np
u = np.array([3, 2])
v = np.array([1, -4])
print(u + v)               # [ 4 -2]
print(2.5 * u)             # [7.5 5. ]
print(np.dot(u, v))        # -5
print(np.linalg.norm(u))   # 3.605551275463989
print(u / np.linalg.norm(u))  # [0.83205029 0.5547002 ]  ← normalized
```

(NumPy gets its own lesson in Module 4; this is a taste so the math and the code grow together.)

## Worked example — overlap as "confusability"

Two unit vectors: $\hat a = \begin{pmatrix}1\\0\end{pmatrix}$ and $\hat b = \begin{pmatrix}\tfrac{1}{\sqrt2}\\ \tfrac{1}{\sqrt2}\end{pmatrix}$ (the 45° direction).

**Overlap**: $\hat a \cdot \hat b = 1\cdot\tfrac{1}{\sqrt2} + 0 = \tfrac{1}{\sqrt2} \approx 0.707$. Since both are unit vectors this equals $\cos\theta$, giving $\theta = 45°$ — consistent with the picture.

**The quantum reading** (which becomes literal in Module 5): if a qubit is in "state $\hat b$" and you measure "is it $\hat a$?", the probability of YES is the overlap *squared*: $\left(\tfrac{1}{\sqrt2}\right)^2 = \tfrac12$. A 45°-tilted state answers a vertical-or-horizontal question with a coin flip. Overlap 1 → certainty; overlap 0 (orthogonal) → certain NO; everything between → probabilistic. One dot product, squared, is already the Born rule.

```python
import numpy as np
a = np.array([1, 0])
b = np.array([1, 1]) / np.sqrt(2)
overlap = np.dot(a, b)
print(overlap, overlap**2)   # 0.7071067811865475 0.4999999999999999
```

## Gotchas

- **Adding norms instead of vectors.** $\lVert\vec u + \vec v\rVert \ne \lVert\vec u\rVert + \lVert\vec v\rVert$ in general (walk 3 north then 4 east: you're 5 from home, not 7). Equality only when perfectly aligned — this is the triangle inequality.
- **Dot product outputs a number, not a vector.** Writing $\vec u \cdot \vec v = \begin{pmatrix}3\\-8\end{pmatrix}$ (component-wise product) is a different operation. The dot product *sums* those products: $-5$.
- **Forgetting to normalize.** Overlap-as-$\cos\theta$ and probability-as-overlap² both require unit vectors. With unnormalized vectors, divide by the norms first — or your "probability" exceeds 1 and nonsense follows.
- **Zero dot product means orthogonal, not zero vectors.** $\begin{pmatrix}1\\1\end{pmatrix}\cdot\begin{pmatrix}1\\-1\end{pmatrix} = 0$ with both vectors alive and well.
- **Sign blindness.** Negative dot product carries information: the vectors point *against* each other. In quantum interference, that sign is the difference between reinforcement and cancellation.
- **Position vs displacement.** Vectors encode displacement; sliding an arrow around doesn't change it. Two arrows are equal iff same length and direction.

## Scenario — the recommendation engine that's secretly quantum prep

A friend building a movie-recommendation feature asks for help. Each user is a vector of genre affinities, e.g. Ana $= (0.9, 0.1, 0.4)$ over (sci-fi, romance, comedy); Ben $= (0.8, 0.2, 0.5)$. How similar are they? You normalize both and take the dot product: ~0.99 — nearly identical taste; recommend across. A third user Cleo $=(0.1, 0.95, 0.2)$ scores ~0.25 against Ana — different planet. This is **cosine similarity**, the workhorse of search engines and LLM embeddings, and it is *exactly* the computation you'll do between quantum states, where it's called fidelity/overlap. Same math funds two careers: if quantum winters ever come, your dot-product fluency cashes out in ML. That's not a joke — it's a genuine hiring overlap between the fields.

## Key points

- A vector is one object with two faces: arrow (length + direction) and component column; translate freely between them.
- Only two operations exist — add components, scale components — and their combination $a\vec u + b\vec v$ (linear combination) is the skeleton of superposition.
- Norm = $\sqrt{\text{sum of squared components}}$; unit vectors have norm 1; quantum states are unit vectors — normalization *is* geometry.
- Dot product $= u_1v_1 + u_2v_2 = \lVert u\rVert\lVert v\rVert\cos\theta$: an alignment score. Zero = orthogonal = perfectly distinguishable (quantum-speak).
- For unit vectors, overlap² = probability of "mistaking" one state for the other — the Born rule in embryo.
- Components are dot products with basis vectors: $v_1 = \vec v\cdot\hat e_1$ — the template for "amplitude = inner product with basis state".

## Check yourself

```quiz
{"q":"Vectors u = (2, -1) and v = (1, 2). Their dot product is:","options":["(2, -2) — multiply component-wise","0 — they are orthogonal","4 — add all four numbers","-4"],"answer":1,"why":"u·v = 2·1 + (-1)·2 = 2 - 2 = 0. A single number, and zero means perpendicular — these two arrows meet at 90° even though neither looks 'axis-aligned'."}
```

```quiz
{"q":"A qubit-like unit vector has components (0.6, 0.8). Interpreted quantum-style, the probability associated with the second component is:","options":["0.8","0.64 — the square of 0.8","0.4","Cannot be determined without the angle"],"answer":1,"why":"Squared components of a unit vector act as probabilities: 0.6² + 0.8² = 0.36 + 0.64 = 1. The vector is normalized, so the squares are a valid probability pair."}
```

## Exercises

**Exercise 1 — build and verify.** Given $\vec u = \begin{pmatrix}1\\3\end{pmatrix}$, $\vec v = \begin{pmatrix}2\\-1\end{pmatrix}$: compute (a) $2\vec u - \vec v$, (b) $\lVert 2\vec u - \vec v\rVert$, (c) the angle between $\vec u$ and $\vec v$ via the dot-product formula. Verify all three in NumPy.

````solution
(a) $2\vec u - \vec v = \begin{pmatrix}2\\6\end{pmatrix} - \begin{pmatrix}2\\-1\end{pmatrix} = \begin{pmatrix}0\\7\end{pmatrix}$.

(b) $\lVert(0,7)\rVert = 7$.

(c) $\vec u\cdot\vec v = 2 - 3 = -1$; $\lVert u\rVert = \sqrt{10}$, $\lVert v\rVert = \sqrt5$; $\cos\theta = \tfrac{-1}{\sqrt{50}} \approx -0.1414$, so $\theta = \arccos(-0.1414) \approx 1.7127$ rad $\approx 98.1°$ — slightly past perpendicular, consistent with the small negative dot product.

```python
import numpy as np
u, v = np.array([1, 3]), np.array([2, -1])
w = 2*u - v
print(w, np.linalg.norm(w))                       # [0 7] 7.0
ct = np.dot(u, v) / (np.linalg.norm(u)*np.linalg.norm(v))
print(np.degrees(np.arccos(ct)))                  # 98.13010235415598
```

Habit check: did you compute by hand *first*? The pros' order is hand → code → compare, because when they disagree you learn something either way.
````

**Exercise 2 — the distinguishability ladder.** Normalize $\vec a = \begin{pmatrix}3\\1\end{pmatrix}$ and $\vec b = \begin{pmatrix}1\\3\end{pmatrix}$, compute their overlap and its square, and answer: if these were quantum states, could you reliably tell them apart in a single measurement? What pair of vectors *would* be reliably distinguishable?

````solution
Both have norm $\sqrt{10}$: $\hat a = \tfrac{1}{\sqrt{10}}(3,1)$, $\hat b = \tfrac{1}{\sqrt{10}}(1,3)$.

Overlap: $\hat a\cdot\hat b = \tfrac{3 + 3}{10} = 0.6$. Squared: $0.36$.

Interpretation: a measurement asking "is this $\hat a$?" applied to state $\hat b$ answers YES 36% of the time — a substantial confusion rate. **No single measurement reliably distinguishes them**; overlap 0.6 means they're geometrically "similar enough to be confused," and no cleverness evades that (a theorem you'll meet as the Helstrom bound's intuition).

Reliably distinguishable pair: any *orthogonal* pair, e.g. $\tfrac{1}{\sqrt2}(1,1)$ and $\tfrac{1}{\sqrt2}(1,-1)$ — overlap $\tfrac{1-1}{2}=0$, confusion probability $0^2 = 0$. This is exactly why encoding bits into orthogonal states ($\ket0,\ket1$) works, and why an eavesdropper measuring non-orthogonal BB84 states *must* introduce detectable errors. One dot product explains a cryptography industry.
````

## Practice questions

1. Compute $\begin{pmatrix}4\\-2\end{pmatrix} + 3\begin{pmatrix}-1\\2\end{pmatrix}$ and sketch the tip-to-tail picture mentally: which quadrant does the result point into?
2. Normalize $\begin{pmatrix}5\\12\end{pmatrix}$ and verify the squared components sum to 1.
3. Why is $\vec v\cdot\vec v$ always non-negative, and what does it equal geometrically?
4. Give a nonzero vector orthogonal to $\begin{pmatrix}2\\5\end{pmatrix}$, and the recipe you used.
5. Two unit vectors have dot product $-1$. What's the geometric relationship, and (quantum preview) what would interference between them do?
6. Explain in one sentence why "quantum states are unit vectors" and "probabilities sum to 1" are the same fact.
7. **Design question:** define a "similarity search" for a tiny library of four taste-vectors of your choosing: pick the vectors, normalize them, choose a query vector, rank the library by overlap, and state which result a threshold of 0.8 would return. (You've just designed a nearest-neighbor engine — and rehearsed quantum state comparison.)

````solution
1. $(4,-2) + (-3,6) = (1, 4)$: first quadrant (right and up).
2. Norm $= \sqrt{25+144} = 13$; $\hat v = (\tfrac{5}{13}, \tfrac{12}{13})$; squares: $\tfrac{25+144}{169} = 1$ ✓.
3. $\vec v\cdot\vec v = v_1^2 + v_2^2$ — a sum of squares, hence $\ge 0$; it equals $\lVert\vec v\rVert^2$, the squared length.
4. Swap components, negate one: $(−5, 2)$ (or $(5,−2)$). Check: $2\cdot(−5) + 5\cdot2 = 0$ ✓.
5. They're antiparallel (θ = π, opposite directions); as amplitudes they'd cancel maximally — destructive interference, the "$-$" that makes quantum algorithms work.
6. A state's components are amplitudes whose squares are outcome probabilities, so unit norm ($\sum$ squares $= 1$) *is* total probability 1.
7. Any coherent construction earns full marks. Model: library A=(0.9,0.1,0.4), B=(0.8,0.2,0.5), C=(0.1,0.95,0.2), D=(0.5,0.5,0.5) — normalize each; query q=(1,0,0.3) normalized. Overlaps ≈ A:0.985, B:0.955, D:0.79, C:0.20 → ranking A > B > D > C; a 0.8 threshold admits A and B only. Design points to notice: normalization prevents "louder" vectors from cheating the ranking, and the threshold trades recall vs precision — the same trade-off you'll make when calling two quantum states "the same" up to hardware noise.
````
