/* Quantum Computing: Zero to Professional — course manifest
   Structure: modules -> lessons. Lesson content lives in content/m*.js (compiled
   from lessons/<module>/<nn>-<id>.md by tools/build.js). */
window.COURSE = {
  title: "Quantum Computing: Zero to Professional",
  tagline: "From school math to running real quantum hardware — no stone unturned.",
  version: "1.0.0",
  updated: "2026-07-03",
  modules: [
    {
      id: "m0", title: "Start Here", icon: "🚀",
      blurb: "What you're signing up for, why it's worth it, and getting your lab running.",
      lessons: [
        { id: "welcome", title: "Your mission: from zero to quantum professional", mins: 25,
          summary: "What quantum computing actually is, what jobs exist, what's hype, and exactly how this course takes you from nothing to employable." },
        { id: "setup", title: "Set up your lab: Python, VS Code, Jupyter & Qiskit", mins: 45,
          summary: "Install and verify every tool you'll use: Python 3.12, VS Code, Jupyter, Qiskit 2.x, and a free IBM Quantum account with real-hardware access." }
      ]
    },
    {
      id: "m1", title: "School Math, Rebuilt", icon: "🧮",
      blurb: "Every piece of school math quantum computing rests on — rebuilt from zero with intuition first.",
      lessons: [
        { id: "numbers", title: "Numbers, fractions, exponents & logarithms", mins: 60,
          summary: "The number line, fractions, negatives, powers, roots and logs — the raw material of every formula ahead." },
        { id: "algebra", title: "Algebra: variables, equations & functions", mins: 60,
          summary: "Reading and manipulating symbols fluently: solving equations, function notation f(x), and graphs — the language every later lesson speaks." },
        { id: "trig", title: "Trigonometry & the unit circle", mins: 70,
          summary: "Angles, radians, sine and cosine as coordinates on a circle — the exact machinery that describes qubit states." },
        { id: "vectors2d", title: "Vectors: arrows, components & dot products", mins: 60,
          summary: "Vectors as arrows and as lists of numbers, adding and scaling them, and the dot product as overlap — the geometric soul of quantum states." }
      ]
    },
    {
      id: "m2", title: "The Math of Quantum", icon: "📐",
      blurb: "Complex numbers and linear algebra — the actual mathematics quantum mechanics is written in.",
      lessons: [
        { id: "complex", title: "Complex numbers & the complex plane", mins: 70,
          summary: "The number i, complex arithmetic, conjugates and magnitude — amplitudes in quantum computing are complex numbers, so this is non-negotiable." },
        { id: "euler", title: "Polar form & Euler's formula", mins: 70,
          summary: "e^(iθ) as a point on a circle: the single most-used identity in quantum computing, and why 'phase' means 'angle'." },
        { id: "matrices", title: "Matrices: the machines of linear algebra", mins: 80,
          summary: "Matrices as transformations, matrix multiplication done right, identity and inverse — quantum gates ARE matrices." },
        { id: "vector-spaces", title: "Vector spaces, basis & linear combinations", mins: 70,
          summary: "Basis vectors, span, linear independence and coordinates in C² — superposition is literally a linear combination." },
        { id: "dirac", title: "Inner products, norms & Dirac notation", mins: 70,
          summary: "The inner product as overlap, unit vectors, orthonormal bases, and the |ket⟩ ⟨bra| notation every quantum paper and library uses." },
        { id: "eigen", title: "Eigenvalues, Hermitian & unitary matrices", mins: 80,
          summary: "Eigenvectors as a matrix's 'own directions', Hermitian matrices as measurements, unitary matrices as evolution — the two matrix families that run quantum mechanics." }
      ]
    },
    {
      id: "m3", title: "Probability & Statistics", icon: "🎲",
      blurb: "Quantum computers output samples, not answers. Probability is how you read them.",
      lessons: [
        { id: "probability", title: "Probability: outcomes, rules & distributions", mins: 60,
          summary: "Sample spaces, events, the addition and multiplication rules, independence and conditional probability — measurement outcomes obey these exactly." },
        { id: "sampling", title: "Expectation, variance & sampling: why shots matter", mins: 60,
          summary: "Random variables, expectation, variance, and how estimates sharpen with more samples — this is why every quantum job has a 'shots' parameter and what it costs you." }
      ]
    },
    {
      id: "m4", title: "Python From Zero", icon: "🐍",
      blurb: "The language of quantum software, taught from your very first line of code.",
      lessons: [
        { id: "python-basics", title: "Python I: variables, types & control flow", mins: 90,
          summary: "Your first programs: variables, numbers, strings, booleans, if/else, and loops — written and run on your own machine." },
        { id: "python-structures", title: "Python II: collections, functions & errors", mins: 90,
          summary: "Lists, dicts, tuples, slicing, writing functions, imports, and handling errors — the working vocabulary of real code." },
        { id: "python-oop", title: "Python III: classes & objects", mins: 75,
          summary: "Objects, methods, constructors and inheritance-lite — exactly enough OOP to read and write Qiskit code fluently." },
        { id: "numpy", title: "NumPy & matplotlib: math at speed", mins: 90,
          summary: "Arrays, matrix products, complex numbers in code, and plotting — you will verify every quantum computation by hand with NumPy." }
      ]
    },
    {
      id: "m5", title: "Quantum Mechanics for Computation", icon: "⚛️",
      blurb: "The four rules of the quantum world, taught through qubits — no fluff, no mysticism.",
      lessons: [
        { id: "quantum-world", title: "The quantum worldview: superposition & measurement", mins: 70,
          summary: "What experiments actually show, what superposition does and does not mean, and why measurement is the strangest — and most important — rule." },
        { id: "qubit", title: "The qubit: state vectors & the Born rule", mins: 80,
          summary: "A qubit's state as a unit vector in C², amplitudes to probabilities via |amplitude|², normalization, and computing measurement statistics by hand." },
        { id: "bloch", title: "The Bloch sphere: every qubit state on a globe", mins: 75,
          summary: "The (θ, φ) parametrization that maps every single-qubit state onto a sphere — the visualization you'll use for the rest of your career." },
        { id: "evolution", title: "Gates as unitary evolution & the phase that matters", mins: 75,
          summary: "Why gates must be unitary, global vs relative phase (one is meaningless, one is everything), and interference as the engine of quantum speedup." }
      ]
    },
    {
      id: "m6", title: "Qubits Together", icon: "🔗",
      blurb: "Multi-qubit systems: where quantum computing stops being a curiosity and becomes a superpower.",
      lessons: [
        { id: "single-gates", title: "The single-qubit gate set: X, Y, Z, H, S, T & rotations", mins: 85,
          summary: "Every standard single-qubit gate: its matrix, its Bloch-sphere action, its use cases, and the algebraic identities professionals use daily." },
        { id: "tensor", title: "Tensor products: how qubits combine", mins: 80,
          summary: "The ⊗ operation that builds multi-qubit states, why n qubits need 2ⁿ amplitudes, and Qiskit's qubit-ordering convention that trips up everyone." },
        { id: "two-qubit-gates", title: "CNOT, CZ, SWAP & controlled operations", mins: 80,
          summary: "The gates that create correlation: controlled operations as 'if statements', their matrices, circuit identities, and hardware costs." },
        { id: "entanglement", title: "Entanglement, Bell states & no-cloning", mins: 85,
          summary: "States that cannot be described qubit-by-qubit: the four Bell states, how to create and measure them, why you can't copy quantum data, and what Bell tests prove." },
        { id: "protocols", title: "Teleportation & superdense coding", mins: 80,
          summary: "The two protocols that showcase entanglement as a resource — built gate by gate, run in code, and defended against every 'faster than light?' misconception." }
      ]
    },
    {
      id: "m7", title: "Programming Real Quantum Computers", icon: "💻",
      blurb: "Qiskit 2.x from first circuit to real 156-qubit hardware — the professional workflow.",
      lessons: [
        { id: "qiskit-circuits", title: "Qiskit fundamentals: building & visualizing circuits", mins: 90,
          summary: "QuantumCircuit end to end: registers, gates, measurement, barriers, drawing, composing and parameterizing circuits — the core API you'll use every day." },
        { id: "simulation", title: "Simulation: Statevector, Aer & debugging", mins: 85,
          summary: "Exact statevector simulation, shot-based sampling with Aer, memory limits (why ~30 qubits is the wall), and a professional debugging workflow for wrong circuits." },
        { id: "transpilation", title: "Transpilation: from ideal circuits to ISA circuits", mins: 85,
          summary: "What actually happens between your circuit and the chip: basis-gate rewriting, qubit routing over coupling maps, optimization levels, and reading transpiled output." },
        { id: "real-hardware", title: "Running on real hardware: primitives & Runtime", mins: 90,
          summary: "SamplerV2 and EstimatorV2, PUBs, jobs, sessions and batches, the free Open Plan workflow, and interpreting noisy results from a real 156-qubit Heron." },
        { id: "quantum-swe", title: "Quantum software engineering: projects, tests, Git", mins: 75,
          summary: "Structuring quantum projects, unit-testing circuits, version control, environments, and the habits that make employers trust your code." }
      ]
    },
    {
      id: "m8", title: "The Canonical Algorithms", icon: "🧠",
      blurb: "The algorithms that made the field — each one built from scratch, run in code, and interrogated.",
      lessons: [
        { id: "deutsch-jozsa", title: "Oracles, Deutsch–Jozsa & Bernstein–Vazirani", mins: 90,
          summary: "The query model, phase kickback (the trick behind almost everything), and your first two provable quantum speedups." },
        { id: "grover", title: "Grover's search: quadratic speedup", mins: 90,
          summary: "Amplitude amplification geometrically and in code: the oracle, the diffuser, why exactly ~(π/4)√N iterations, and when Grover is actually useful." },
        { id: "qft", title: "The quantum Fourier transform", mins: 85,
          summary: "The QFT as a basis change, its O(n²) circuit, why it's exponentially faster than FFT — and why you can't just read the answer out." },
        { id: "qpe", title: "Quantum phase estimation", mins: 85,
          summary: "The algorithm that powers Shor and quantum chemistry: estimating eigenphases with controlled powers and an inverse QFT, with precision/qubit trade-offs." },
        { id: "shor", title: "Shor's algorithm & why RSA cares", mins: 95,
          summary: "Factoring via period finding: the number theory, the quantum core, running it in code, and the honest resource estimates for breaking RSA-2048." }
      ]
    },
    {
      id: "m9", title: "The NISQ Era", icon: "🌡️",
      blurb: "Today's noisy hardware: what noise does, how to fight it, and the algorithms designed to survive it.",
      lessons: [
        { id: "noise", title: "Noise: T1, T2, gate errors & error mitigation", mins: 90,
          summary: "Decoherence times, gate and readout errors, how noise compounds through a circuit, and the mitigation toolbox (twirling, ZNE, DD) that makes hardware results usable." },
        { id: "vqe", title: "VQE: the variational workhorse", mins: 90,
          summary: "Hybrid quantum-classical optimization: Hamiltonians as Pauli sums, ansatz design, measuring expectation values, and finding a molecule's ground-state energy in code." },
        { id: "qaoa", title: "QAOA: quantum optimization", mins: 85,
          summary: "Encoding MaxCut into a cost Hamiltonian, alternating cost/mixer layers, reading solutions from samples — and the honest state of quantum optimization." },
        { id: "qml", title: "Quantum machine learning: promise vs reality", mins: 75,
          summary: "Feature maps, quantum kernels, variational classifiers, barren plateaus — what QML can and can't do in 2026, so you can talk about it credibly." }
      ]
    },
    {
      id: "m10", title: "Error Correction & Fault Tolerance", icon: "🛡️",
      blurb: "How quantum computing gets from noisy prototypes to world-changing machines.",
      lessons: [
        { id: "qec", title: "From repetition codes to stabilizers", mins: 90,
          summary: "Protecting quantum data without looking at it: the 3-qubit code, syndrome measurement, and the stabilizer formalism that describes every real code." },
        { id: "surface-code", title: "The surface code & logical qubits", mins: 85,
          summary: "The code the big roadmaps bet on: the qubit lattice, threshold ~1%, code distance, decoding, and the physical-to-logical qubit overhead arithmetic." },
        { id: "ftqc", title: "Fault tolerance & the road to useful quantum computing", mins: 80,
          summary: "Transversal gates, magic-state distillation, qLDPC codes, and the 2026 roadmaps (IBM Starling, Google, Quantinuum) read with a professional's skepticism." }
      ]
    },
    {
      id: "m11", title: "Become the Professional", icon: "💼",
      blurb: "The industry map, a portfolio that gets interviews, and how to pass them.",
      lessons: [
        { id: "landscape", title: "The 2026 hardware & industry landscape", mins: 75,
          summary: "Superconducting vs trapped-ion vs neutral-atom vs photonic — real numbers (fidelities, speeds, qubit counts), the major players, and how to evaluate roadmap claims." },
        { id: "capstones", title: "Capstone portfolio: three projects that get interviews", mins: 120,
          summary: "Three fully-specified portfolio projects — hardware benchmarking suite, VQE chemistry study, QEC simulator — with milestones, stretch goals, and README standards." },
        { id: "career", title: "Getting hired: interviews, resume, community", mins: 90,
          summary: "The 2026 job map ($75k–120k entry roles), a 40-question interview bank with answers, resume framing for career-changers, and where the community actually lives." }
      ]
    }
  ]
};
