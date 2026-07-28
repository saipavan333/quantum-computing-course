/* labs.js — the Interactive Labs section (playbook §3): standalone, full-page
   sandboxes that go further than the in-lesson widgets. Registers its own
   routes (#/labs index, #/lab/:id detail), a distinct "🧪 Interactive Labs"
   block on the home page, and its own sidebar nav group. Canvas-bounded;
   honors prefers-reduced-motion is not needed here (no continuous animation,
   everything is user-stepped). */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var esc = QCC.escapeHtml;

  var LABS = [
    { id: "circuit", icon: "🔧", title: "Circuit Builder", desc: "Place gates on up to 3 qubits and run an exact statevector simulation." },
    { id: "bloch-sandbox", icon: "🌐", title: "Bloch Sphere Sandbox", desc: "Rotate freely about any axis, jump to presets, save a reference to compare." },
    { id: "grover-lab", icon: "🔍", title: "Grover Playground", desc: "Pick the register size and any number of marked items, then amplify." },
    { id: "qft-lab", icon: "🌀", title: "QFT & Period-Finding Lab", desc: "The transform behind Shor's algorithm, for registers up to 4 qubits." },
    { id: "qec-lab", icon: "🛡️", title: "Error Correction Lab", desc: "Bit-flip and phase-flip repetition codes — inject errors, correct them." },
    { id: "vqe-lab", icon: "📉", title: "VQE Optimization Lab", desc: "A 2-parameter energy landscape — step gradient descent to a minimum." },
    { id: "measure-lab", icon: "🎯", title: "Measurement & Basis Lab", desc: "Prepare any qubit, choose a measurement basis, and watch the statistics." },
    { id: "teleport-lab", icon: "📡", title: "Quantum Teleportation Lab", desc: "Send an arbitrary state across the protocol, step by step, and verify it arrives." },
    { id: "qaoa-lab", icon: "🧩", title: "QAOA / Max-Cut Lab", desc: "Tune the circuit angles and watch the cut distribution converge on the best split." },
    { id: "entangle-lab", icon: "🔗", title: "Entanglement Explorer", desc: "Build Bell, GHZ, and W states and compare how they behave under measurement." }
  ];

  function head(title, sub) { return '<div class="feature-head reveal"><h1>' + esc(title) + "</h1><p>" + esc(sub) + "</p></div>"; }
  function page(inner) { return '<div class="page">' + inner + "</div>"; }
  function labById(id) { for (var i = 0; i < LABS.length; i++) if (LABS[i].id === id) return LABS[i]; return null; }

  /* ---------- what/why/how/where/when, one entry per lab ---------- */
  var LAB_INFO = {
    circuit: {
      what: "A click-to-build quantum circuit editor for up to 3 qubits that runs an exact complex-number statevector simulation the moment you hit Run — no approximation, no cloud call.",
      why: "Reading a circuit diagram and predicting its output is one of the most common quantum-computing interview and homework tasks; building your own circuits and seeing the real math work is how that intuition sticks.",
      how: "Pick a gate from the toolbar (CNOT needs two clicks — control then target, in the same column), click a cell on the grid to place it, then press “Run simulation” to see the measurement-probability bar chart and the top three most likely outcomes.",
      where: "Builds on Module 6 (multi-qubit systems, tensor products, CNOT) and Module 7 (Qiskit circuits) — revisit “Qiskit fundamentals: building &amp; visualizing circuits” if a gate's effect surprises you.",
      when: "Use it whenever you want to sanity-check a circuit idea before writing real Qiskit code, or to build intuition for how gate order and CNOT placement change outcomes.",
      legend: [
        { color: "rgba(124,92,255,.6)", text: "A purple cell holds a single-qubit gate (H, X, Y, Z, S, or T) on that wire at that step." },
        { color: "rgba(34,211,238,.6)", text: "A cyan ● is a CNOT control and the cyan ⊕ in the same column is its target; the control decides whether the target flips." },
        { text: "Each grid row is one qubit (q0 at the top), and time runs left to right — all qubits start in |0⟩." },
        { color: "#22d3ee", text: "After you Run, each cyan bar is the probability of measuring that basis state. Labels read q2 q1 q0, so the rightmost digit is q0." }
      ],
      tryThis: [
        "<b>Superposition:</b> select H, click q0 in the first column, and press Run — |000⟩ and |001⟩ each land at ~50%, because H turns a definite 0 into an even 50/50 split.",
        "<b>Entanglement (Bell state):</b> keep that H, then select CNOT and click q0 (control) then q1 (target) in the next column, and Run — now only |000⟩ and |011⟩ appear at 50% each, perfectly correlated.",
        "<b>GHZ state:</b> add one more CNOT with control q0 and target q2 in the following column — only |000⟩ and |111⟩ remain, so all three qubits now rise or fall together."
      ]
    },
    "bloch-sandbox": {
      what: "A free-form single-qubit state explorer — rotate by any angle about any axis, jump to the six cardinal states, and freeze a second “reference” vector to compare against.",
      why: "Every single-qubit gate is a rotation of the Bloch vector; once you can predict where a rotation lands, gates like H, S, and T stop being memorized symbols and become obviously-necessary moves.",
      how: "Pick an axis (X/Y/Z), set an angle with the slider, click “Apply rotation” to actually move the state using the exact rotation formula, and click “Save as reference” to pin the current position in grey for comparison.",
      where: "Pairs with Module 5 (“The Bloch sphere”) and Module 6 (“The single-qubit gate set”) — the in-lesson Bloch widget there uses fixed gate buttons; this sandbox lets you dial in any rotation.",
      when: "Use it to build the rotation intuition needed for calibrating real hardware pulses, or any time a lesson says “rotate by θ about the X-axis” and you want to see it rather than imagine it.",
      legend: [
        { text: "The globe is the Bloch sphere: the north pole is |0⟩, the south pole is |1⟩, and points on the equator are equal superpositions that differ only in phase." },
        { color: "#22d3ee", text: "The cyan arrow is the qubit's current state — the closer it leans toward the north pole, the higher P(0)." },
        { color: "#9aa4bb", text: "The grey arrow (after you Save) is a frozen reference state, so you can compare where you started with where you moved to." }
      ],
      tryThis: [
        "<b>Bit-flip:</b> from |0⟩, set the axis to X and the angle to 180° and Apply — the arrow swings to the south pole (|1⟩). That is exactly what the X gate does.",
        "<b>Make a superposition:</b> from |0⟩, an axis-Y rotation of 90° lands on the equator at |+⟩ — an even superposition, which is the job of the Hadamard.",
        "<b>Pure phase:</b> jump to |+⟩, Save it as a reference, then rotate about Z — the state sweeps around the equator while the grey reference stays put, because a phase change never moves P(0) or P(1)."
      ]
    },
    "grover-lab": {
      what: "A full amplitude-amplification simulator where you choose the register size (2–4 qubits) and mark any subset of items, then step through the oracle-plus-diffusion cycle and watch the probability of hitting a marked item climb.",
      why: "Grover's algorithm is the canonical example of a real quantum speedup, and the only way to build real intuition for “why does over-rotating hurt” is to keep clicking past the optimal iteration count and watch performance fall back down.",
      how: "Choose a qubit count, toggle any number of marked items in the grid, then click “Apply oracle + diffusion” repeatedly — the bar chart shows every amplitude live, and the line chart below tracks total success probability across iterations.",
      where: "Follows Module 8's “Grover's search: quadratic speedup” — the in-lesson widget there is fixed at 8 states and 1 marked item; this lab generalizes both.",
      when: "Reach for it whenever you need to reason about how the number of marked items or register size changes the optimal iteration count — a question that comes up constantly in quantum algorithms interviews.",
      legend: [
        { color: "#fbbf24", text: "A gold bar is a marked (“winner”) item you are searching for." },
        { color: "#22d3ee", text: "A cyan bar is an unmarked item; bars can dip below the center line, meaning a negative amplitude." },
        { color: "#34d399", text: "The green line below tracks P(any marked) after each iteration — it should rise, peak, then fall if you keep going." }
      ],
      tryThis: [
        "<b>One target, 3 qubits:</b> mark a single item and step twice — its gold bar grows and P(marked) climbs to about 94%, and the readout names the optimal step count.",
        "<b>Over-rotation:</b> keep stepping past that optimum — the gold bar shrinks and P falls again, proving that “more iterations” is not “better.” This overshoot is a real Grover trap.",
        "<b>More winners:</b> mark two items, then three — notice the optimal iteration count drops, because the more items match, the faster one is found."
      ]
    },
    "qft-lab": {
      what: "A generalized quantum Fourier transform explorer — pick a register size up to 4 qubits and any period that divides it, and see exactly which output frequencies light up.",
      why: "The QFT is the engine inside Shor's algorithm, and its “peaks appear at multiples of N/r” behavior is the entire reason quantum computers can find periods — and therefore factor numbers — exponentially faster than classical ones.",
      how: "Choose a qubit count, then pick a period r from the buttons (only valid divisors of N are offered) — the top row shows the input pattern, the bottom row shows the QFT's output magnitudes, with the true peaks highlighted in green.",
      where: "Extends Module 8's “The quantum Fourier transform” and directly sets up “Shor's algorithm &amp; why RSA cares” — the in-lesson Shor widget uses this exact peak-finding step, just with the arithmetic done for you.",
      when: "Use it right before or during the Shor's algorithm lesson to see the period-finding step in isolation, separate from the modular-arithmetic bookkeeping.",
      legend: [
        { color: "#7c5cff", text: "The purple top bars are the input register — a “comb” that is non-zero every r steps (that spacing is the period r)." },
        { color: "#34d399", text: "A green bottom bar is a tall QFT output peak; the peaks land at multiples of N/r." },
        { color: "#22d3ee", text: "A cyan bottom bar is a non-peak output. Reading the spacing of the green peaks is how you recover the period." }
      ],
      tryThis: [
        "<b>N=8, r=2:</b> the purple input spikes at 0, 2, 4, 6 and the green output peaks at 0 and 4 — a spacing of N/r = 4.",
        "<b>Switch to r=4:</b> now the input spikes only at 0 and 4, but the output peaks at 0, 2, 4, 6 — a longer period gives more tightly-spaced peaks, a reciprocal relationship.",
        "<b>Set r=1:</b> the input covers every state (no period at all) and the output collapses to a single peak at k=0 — nothing to find."
      ]
    },
    "qec-lab": {
      what: "A working repetition-code simulator for both bit-flip and phase-flip errors — encode a logical qubit into three physical qubits, inject an error (chosen or random), read the syndrome, and correct it.",
      why: "Every real quantum computer today is noisy, and error correction is the entire reason the field believes useful, large-scale quantum computing is possible at all — this lab shows the core majority-vote trick that all more advanced codes (like the surface code) build on.",
      how: "Pick a code type, set the logical bit, either choose which physical qubit to flip or click “🎲 Random error” for a surprise, then click “Detect &amp; correct” to watch the syndrome get read and the error undone.",
      where: "Matches Module 10's “From repetition codes to stabilizers” and “The surface code &amp; logical qubits” — this lab is the repetition code from that first lesson, made interactive.",
      when: "Use it to build intuition before tackling the surface code, which is the same idea scaled up to catch both error types at once.",
      legend: [
        { text: "The three circles are the three physical qubits that together store one logical value." },
        { color: "#f87171", text: "A circle outlined in red is a qubit that got flipped — the error you injected." },
        { text: "The readout gives the syndrome (which qubit disagrees with the majority) and, after you correct, confirms the logical value was restored. For the phase-flip code the symbols switch to + and −." }
      ],
      tryThis: [
        "<b>Detect and fix:</b> use the bit-flip code with logical 0, flip q2 — one circle turns red showing 1, and the syndrome names q2. Hit Detect &amp; correct and the majority vote (0, 0 against 1) restores all three to 0.",
        "<b>Predict first:</b> click “🎲 Random error”, guess the syndrome yourself before correcting, then check whether you were right.",
        "<b>Two error types:</b> switch to the phase-flip code — the same machinery now protects the +/− (phase) information, which is exactly why two different codes are later combined into the full surface code."
      ]
    },
    "vqe-lab": {
      what: "A 2-parameter variational landscape you can literally see — a color-coded energy heatmap with a marker that steps downhill via real gradient descent.",
      why: "VQE and every other near-term “variational” quantum algorithm (QAOA included) works by having a classical optimizer walk a landscape shaped by measurements from a quantum circuit; this lab isolates and visualizes that classical half of the loop, usually the hardest part to picture.",
      how: "Click “Gradient step” repeatedly to watch the marker descend toward a minimum (blue = lower energy), adjust the learning-rate slider to see how step size changes the path, and “Reset” to start over from the same point.",
      where: "Follows Module 9's “VQE: the variational workhorse” and pairs naturally with “QAOA: quantum optimization” right after it — the in-lesson VQE widget is the 1-parameter version of this same idea.",
      when: "Revisit this whenever a lesson mentions “the optimizer got stuck in a local minimum” — you can literally engineer that situation here by starting from a different point.",
      legend: [
        { color: "#3060df", text: "The heatmap is the energy for every pair of parameters θ₁ (horizontal) and θ₂ (vertical); blue means low energy — the good direction." },
        { color: "#e04d4d", text: "Red regions are high energy — where you do not want to end up." },
        { color: "#fbbf24", text: "The gold dot is your current parameters, and the white line traces the path gradient descent has taken so far." }
      ],
      tryThis: [
        "<b>Descend:</b> click “Gradient step” repeatedly and watch the gold dot slide out of a red (high-energy) region into a blue basin as the energy in the readout drops.",
        "<b>Overshoot:</b> max out the learning-rate slider and step — big steps bounce around or jump between basins, showing that too large a rate is unstable.",
        "<b>Local minima:</b> Reset and step with a small rate — a smoother descent, but it settles into whichever basin is nearest rather than the global best."
      ]
    },
    "measure-lab": {
      what: "A full measurement laboratory — prepare any single-qubit state on the Bloch sphere, choose the basis you measure in (Z, X, Y, or any angle), and take shots to watch the statistics emerge.",
      why: "Measurement is the one irreversible step in quantum computing, and the single most common beginner mistake is forgetting that the outcome depends on the basis you measure in — not just the state. This lab makes that dependence impossible to miss.",
      how: "Set the state's polar angle θ and azimuth φ with the sliders, pick a measurement basis, then take one shot or a thousand — the bars show the outcome frequencies and the readout gives the exact Born-rule probabilities for comparison.",
      where: "Reinforces Module 5 (“The qubit: state vectors and the Born rule”) and sets up everything in Modules 7–8 where measurement statistics are the only output you ever get.",
      when: "Come back whenever a result surprises you — the fix is almost always “measure in the right basis.”",
      legend: [
        { color: "#22d3ee", text: "The cyan arrow is the prepared state on the Bloch sphere; north is |0⟩, south is |1⟩." },
        { color: "#fbbf24", text: "The gold axis is the measurement basis — outcomes are the projections of the state onto its two poles." },
        { color: "#34d399", text: "The green/violet bars are the sampled outcome frequencies; the dashed line marks the exact Born-rule probability they converge to." }
      ],
      tryThis: [
        "<b>Eigenstate certainty:</b> prepare |0⟩ (θ = 0) and measure in Z — you get 0 every single time. Now measure the same state in X and it splits 50/50, because |0⟩ is an equal superposition in the X basis.",
        "<b>Match the basis:</b> prepare |+⟩ (θ = 90°, φ = 0) and switch to the X basis — the randomness vanishes and you get one outcome with certainty. The state was definite all along; only the wrong basis made it look random.",
        "<b>Law of large numbers:</b> take single shots and watch them scatter, then take ×1000 and watch the bars snap onto the dashed Born-rule lines."
      ]
    },
    "teleport-lab": {
      what: "A complete, interactive quantum-teleportation protocol — dial in any state to send, run the five stages, see Alice's two classical bits, and verify Bob's qubit ends up in exactly the state you started with.",
      why: "Teleportation is the clearest demonstration that entanglement + 2 classical bits can move a quantum state perfectly — and it is the backbone of quantum networking and measurement-based computing. Doing it end to end, with a verification at the finish, turns a confusing story into a procedure you trust.",
      how: "Set the input state with the θ/φ sliders, then click “Next step” to walk through entanglement, Alice's Bell measurement, the classical bits, and Bob's correction — the fidelity readout confirms Bob's state matches the original.",
      where: "Deepens Module 6's “Teleportation & superdense coding” and uses the entanglement, CNOT, and measurement ideas from all of Module 6.",
      when: "Use it the moment teleportation feels like magic — stepping through it once usually dissolves the mystery.",
      legend: [
        { color: "#22d3ee", text: "The cyan Bloch arrow on the left is the unknown state Alice wants to send (qubit 1)." },
        { color: "#7c5cff", text: "The violet markers are the shared entangled pair (qubits 2 and 3); the wire diagram shows the gates at the current step." },
        { color: "#34d399", text: "The green Bloch arrow on the right is Bob's qubit — after the correction it lands exactly on the cyan one, and the fidelity reads 1.000." }
      ],
      tryThis: [
        "<b>Send |+⟩:</b> set θ = 90°, φ = 0 and step all the way through — watch Bob's green arrow snap onto the cyan input and the fidelity hit 1.000.",
        "<b>Random bits, same result:</b> restart a few times; Alice's two measured bits are different each run (00, 01, 10, 11), yet Bob's correction always reconstructs the exact state — the randomness is in the bits, not the outcome.",
        "<b>Skip the correction:</b> stop before the final step and note Bob's state is wrong until the classical bits tell him which gate to apply — proof the classical channel is essential (no faster-than-light sending)."
      ]
    },
    "qaoa-lab": {
      what: "A real QAOA sandbox — a fixed Max-Cut graph plus the actual p = 1 QAOA circuit, where you tune the two angles γ and β and watch the output probability distribution shift toward the best cut.",
      why: "QAOA is the flagship near-term optimization algorithm, and the leap people struggle with is how tuning two angles biases a quantum measurement toward good answers. Here you turn the knobs and watch the winning bitstrings light up.",
      how: "Drag the γ (cost) and β (mixer) sliders; the bar chart shows the probability of each possible cut, the graph shows the most likely partition, and the readout reports the expected cut value — try to maximize it, or click “Optimize” to let the lab find the best angles.",
      where: "Extends Module 9's “QAOA: quantum optimization” and reuses the Max-Cut problem introduced by the in-lesson QAOA widget, now with the real parameterized circuit behind it.",
      when: "Use it right after the QAOA lesson to feel how the angles, not luck, concentrate probability on good solutions.",
      legend: [
        { color: "#7c5cff", text: "Each bar is the probability of measuring that bitstring (a candidate cut) from the p=1 QAOA circuit at the current angles." },
        { color: "#34d399", text: "Green graph edges are cut by the most-likely partition; the node colors are the two sets." },
        { color: "#fbbf24", text: "The readout's expected cut value is what QAOA actually maximizes — push it toward the graph's true optimum." }
      ],
      tryThis: [
        "<b>Sweep γ:</b> hold β fixed and drag γ — watch the probability mass slosh between bitstrings. Certain angles clearly favor the high-cut solutions.",
        "<b>Let it optimize:</b> click “Optimize” and watch the lab search the γ–β grid for the angles that maximize the expected cut, then read them off.",
        "<b>Compare to brute force:</b> the readout also shows the true maximum cut — see how close the best p=1 angles get, and why deeper circuits (larger p) are needed to close the gap."
      ]
    },
    "entangle-lab": {
      what: "A multi-qubit entanglement explorer — build Bell, GHZ, and W states on 2–3 qubits, measure them many times, and compare how differently these “equally entangled” states behave.",
      why: "Not all entanglement is the same: GHZ and W states are both maximally entangled yet fall apart in completely different ways when you measure or lose a qubit. Seeing that contrast is what separates a textbook definition from real understanding.",
      how: "Pick a state (Bell, GHZ, or W), take shots to build the joint-outcome histogram, and optionally “trace out” a qubit to see what happens to the rest — the readout explains the correlation structure of each state.",
      where: "Builds on Module 6 (Bell states, entanglement) and previews the robustness questions that matter for error correction in Module 10.",
      when: "Use it whenever you need to reason about what a specific entangled state will do under measurement — a frequent interview and research question.",
      legend: [
        { color: "#7c5cff", text: "Each bar is how often a joint measurement outcome (e.g. 000, 111) occurred across your shots." },
        { color: "#34d399", text: "Green highlights the outcomes the chosen state is “allowed” to produce — GHZ only gives all-0s or all-1s, while W gives exactly-one-1 strings." },
        { text: "The readout names the correlation pattern and what measuring or losing one qubit does to the rest." }
      ],
      tryThis: [
        "<b>GHZ is all-or-nothing:</b> pick GHZ on 3 qubits and take ×1000 — you only ever see 000 or 111, never anything in between. All three qubits are locked together.",
        "<b>W is one-hot:</b> switch to W and measure — now you only see 001, 010, 100 (exactly one excitation), a completely different correlation from GHZ.",
        "<b>Fragility test:</b> trace out (discard) one qubit — GHZ collapses to a boring classical mixture, but W stays entangled on the remaining two. That robustness is why W states matter."
      ]
    }
  };
  function infoPanel(info) {
    if (!info) return "";
    var order = [["What", info.what], ["Why", info.why], ["How", info.how], ["Where", info.where], ["When", info.when]];
    var html = '<dl class="info-panel">' + order.map(function (pair) { return "<dt>" + pair[0] + "</dt><dd>" + pair[1] + "</dd>"; }).join("") + "</dl>";
    if (info.legend && info.legend.length) {
      html += '<div class="lab-legend"><h4>How to read the picture</h4><ul>' +
        info.legend.map(function (it) {
          var sw = it.color ? '<span class="lab-swatch" style="background:' + it.color + '"></span>' : '<span class="lab-swatch dot"></span>';
          return "<li>" + sw + "<span>" + it.text + "</span></li>";
        }).join("") + "</ul></div>";
    }
    if (info.tryThis && info.tryThis.length) {
      html += '<div class="lab-try"><h4>Try this — and watch what happens</h4><ol>' +
        info.tryThis.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ol></div>";
    }
    return html;
  }

  /* ============ home-page section + sidebar group ============ */
  QCC.onRender(function (root, ctx) {
    if (!ctx || ctx.view !== "home") return;
    if (root.querySelector(".labs-section")) return;
    var section = document.createElement("div");
    section.className = "labs-section reveal";
    section.innerHTML = '<h2 class="labs-heading">🧪 Interactive Labs</h2>' +
      '<p class="labs-sub">Standalone sandboxes for open-ended practice — richer and freer than the in-lesson widgets.</p>' +
      '<div class="tool-grid">' + LABS.map(function (l) {
        return '<a class="tool-tile" href="#/lab/' + l.id + '"><span class="tool-ic" aria-hidden="true">' + l.icon +
          '</span><span class="tool-tx"><b>' + esc(l.title) + "</b><span>" + esc(l.desc) + "</span></span></a>";
      }).join("") + "</div>";
    var toolGrid = root.querySelector(".tool-grid");
    if (toolGrid && toolGrid.parentNode) toolGrid.parentNode.insertBefore(section, toolGrid.nextSibling);
    else root.querySelector(".page").appendChild(section);
  });

  (function sidebarLabs() {
    var nav = document.getElementById("nav-modules"); if (!nav) return;
    var wrap = document.createElement("div"); wrap.className = "nav-tools nav-labs";
    wrap.innerHTML = '<div class="nav-section-label">🧪 Labs</div>' +
      LABS.map(function (l) { return '<a class="nav-tool" href="#/lab/' + l.id + '">' + l.icon + " <span>" + esc(l.title) + "</span></a>"; }).join("");
    nav.appendChild(wrap);
  })();

  /* ============ index page ============ */
  function viewLabsIndex() {
    var html = head("Interactive Labs", "Six standalone sandboxes — pick one and start experimenting.");
    html += '<div class="tool-grid">' + LABS.map(function (l) {
      return '<a class="tool-tile" href="#/lab/' + l.id + '"><span class="tool-ic" aria-hidden="true">' + l.icon +
        '</span><span class="tool-tx"><b>' + esc(l.title) + "</b><span>" + esc(l.desc) + "</span></span></a>";
    }).join("") + "</div>";
    QCC.setContent(page(html), "Interactive Labs", { view: "labs-index" });
  }

  /* ============ shared complex-number + statevector helpers (circuit lab) ============ */
  function cx(re, im) { return { re: re, im: im || 0 }; }
  function cadd(a, b) { return cx(a.re + b.re, a.im + b.im); }
  function cmul(a, b) { return cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re); }
  function padBits(n, len) { var s = n.toString(2); while (s.length < len) s = "0" + s; return s; }

  /* ============ Lab 1: Circuit Builder ============ */
  function labCircuit() {
    var NQ = 3, NS = 5;
    var singleGates = {}, cnots = [], tool = "H", pendingControl = null;
    var TOOLS = ["H", "X", "Y", "Z", "S", "T", "CNOT", "CLEAR"];
    var GATES = {
      H: [[cx(1 / Math.SQRT2), cx(1 / Math.SQRT2)], [cx(1 / Math.SQRT2), cx(-1 / Math.SQRT2)]],
      X: [[cx(0), cx(1)], [cx(1), cx(0)]],
      Y: [[cx(0), cx(0, -1)], [cx(0, 1), cx(0)]],
      Z: [[cx(1), cx(0)], [cx(0), cx(-1)]],
      S: [[cx(1), cx(0)], [cx(0), cx(0, 1)]],
      T: [[cx(1), cx(0)], [cx(0), cx(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))]]
    };
    function applyGate1(state, target, m) {
      var dim = state.length, out = state.slice();
      for (var i = 0; i < dim; i++) {
        if (((i >> target) & 1) === 1) continue;
        var j = i | (1 << target), a0 = state[i], a1 = state[j];
        out[i] = cadd(cmul(m[0][0], a0), cmul(m[0][1], a1));
        out[j] = cadd(cmul(m[1][0], a0), cmul(m[1][1], a1));
      }
      return out;
    }
    function applyCNOT(state, control, target) {
      var dim = state.length, out = state.slice();
      for (var i = 0; i < dim; i++) if (((i >> control) & 1) === 1) out[i] = state[i ^ (1 << target)];
      return out;
    }
    function simulate() {
      var dim = Math.pow(2, NQ), state = new Array(dim);
      for (var i = 0; i < dim; i++) state[i] = cx(i === 0 ? 1 : 0);
      for (var col = 0; col < NS; col++) {
        for (var row = 0; row < NQ; row++) { var g = singleGates[row + "," + col]; if (g) state = applyGate1(state, row, GATES[g]); }
        cnots.filter(function (c) { return c.col === col; }).forEach(function (c) { state = applyCNOT(state, c.control, c.target); });
      }
      return state;
    }
    /* build the page shell ONCE; cell clicks repaint only the grid so the
       page never scrolls back to the top mid-build */
    function render() {
      var html = head("Circuit Builder Lab", "Pick a tool, click cells to place gates (CNOT: click control then target in the same column), then run an exact simulation.") + infoPanel(LAB_INFO.circuit);
      html += '<div class="widget"><div class="widget-controls">' +
        TOOLS.map(function (t) { return '<button class="wbtn tsel" data-t="' + t + '" type="button">' + t + "</button>"; }).join("") + "</div>";
      html += '<div class="circuit-grid" id="circuit-grid"></div>';
      html += '<div class="widget-controls"><button class="btn primary" id="circ-run" type="button">▶ Run simulation</button>' +
        '<button class="btn" id="circ-clear" type="button">Clear circuit</button></div>' +
        '<canvas class="widget-canvas" id="circ-canvas" width="700" height="220" aria-label="Bar chart of measurement probabilities for the simulated circuit"></canvas>' +
        '<div class="widget-read" id="circ-read" aria-live="polite">Pick a tool, click cells to place gates, then run.</div></div>';
      QCC.setContent(page(html), "Circuit Builder Lab", { view: "lab" });
      setActive();
      document.querySelectorAll(".tsel").forEach(function (b) { b.onclick = function () { tool = b.dataset.t; if (tool !== "CNOT") pendingControl = null; setActive(); }; });
      document.getElementById("circ-run").onclick = runSim;
      document.getElementById("circ-clear").onclick = function () { singleGates = {}; cnots = []; pendingControl = null; paintGrid(); resetOutput(); };
      paintGrid();
    }
    function paintGrid() {
      var grid = document.getElementById("circuit-grid"); if (!grid) return;
      var html = "";
      for (var r = 0; r < NQ; r++) {
        html += '<div class="circuit-row"><span class="circuit-qlabel">q' + r + ": |0⟩</span>";
        for (var c = 0; c < NS; c++) {
          var g = singleGates[r + "," + c];
          var cnot = cnots.filter(function (x) { return x.col === c && (x.control === r || x.target === r); })[0];
          var label = g || (cnot ? (cnot.control === r ? "●" : "⊕") : "·");
          var cls = "circuit-cell" + (g ? " has-gate" : "") + (cnot ? " has-cnot" : "") +
            (pendingControl && pendingControl.row === r && pendingControl.col === c ? " pending" : "");
          html += '<button class="' + cls + '" data-r="' + r + '" data-c="' + c + '" type="button">' + label + "</button>";
        }
        html += "</div>";
      }
      grid.innerHTML = html;
      grid.querySelectorAll(".circuit-cell").forEach(function (b) { b.onclick = function () { cellClick(+b.dataset.r, +b.dataset.c); }; });
    }
    function resetOutput() {
      var cv = document.getElementById("circ-canvas"), ctx = cv && cv.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, 700, 220);
      var readEl = document.getElementById("circ-read");
      if (readEl) readEl.innerHTML = "Pick a tool, click cells to place gates, then run.";
    }
    function setActive() { document.querySelectorAll(".tsel").forEach(function (b) { b.classList.toggle("active", b.dataset.t === tool); }); }
    function cellClick(r, c) {
      if (tool === "CLEAR") {
        delete singleGates[r + "," + c];
        cnots = cnots.filter(function (x) { return !(x.col === c && (x.control === r || x.target === r)); });
      } else if (tool === "CNOT") {
        if (pendingControl && pendingControl.col === c && pendingControl.row !== r) {
          cnots = cnots.filter(function (x) { return x.col !== c; });
          cnots.push({ col: c, control: pendingControl.row, target: r });
          delete singleGates[pendingControl.row + "," + c]; delete singleGates[r + "," + c];
          pendingControl = null;
        } else { pendingControl = { row: r, col: c }; }
      } else {
        singleGates[r + "," + c] = tool;
        cnots = cnots.filter(function (x) { return !(x.col === c && (x.control === r || x.target === r)); });
      }
      paintGrid();
    }
    function runSim() {
      var state = simulate();
      var probs = state.map(function (a) { return a.re * a.re + a.im * a.im; });
      var cv = document.getElementById("circ-canvas"), ctx = cv && cv.getContext("2d");
      var readEl = document.getElementById("circ-read");
      if (ctx) {
        ctx.clearRect(0, 0, 700, 220);
        var n = probs.length, gap = 8, bw = (620 - gap * (n - 1)) / n, x0 = 50;
        var maxP = Math.max(0.05, Math.max.apply(null, probs));
        for (var i = 0; i < n; i++) {
          var h = (probs[i] / maxP) * 150, x = x0 + i * (bw + gap);
          ctx.fillStyle = "#22d3ee"; ctx.fillRect(x, 190 - h, bw, h);
          ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center";
          ctx.fillText(padBits(i, NQ), x + bw / 2, 204);
        }
      }
      var top = probs.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) { return b.p - a.p; }).slice(0, 3);
      readEl.innerHTML = "Most likely outcomes: " + top.map(function (t) { return "|" + padBits(t.i, NQ) + "⟩ (" + (t.p * 100).toFixed(1) + "%)"; }).join(", ") + ".";
    }
    render();
  }

  /* ============ Lab 2: Bloch Sphere Sandbox ============ */
  function labBloch() {
    var v = [0, 0, 1], saved = null, axis = "z", angle = 45;
    var PRESETS = { "|0⟩": [0, 0, 1], "|1⟩": [0, 0, -1], "|+⟩": [1, 0, 0], "|−⟩": [-1, 0, 0], "|i⟩": [0, 1, 0], "|−i⟩": [0, -1, 0] };
    function rotate(ax, deg) {
      var rad = deg * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
      var k = ax === "x" ? [1, 0, 0] : ax === "y" ? [0, 1, 0] : [0, 0, 1];
      var kv = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
      var cross = [k[1] * v[2] - k[2] * v[1], k[2] * v[0] - k[0] * v[2], k[0] * v[1] - k[1] * v[0]];
      v = [v[0] * c + cross[0] * s + k[0] * kv * (1 - c), v[1] * c + cross[1] * s + k[1] * kv * (1 - c), v[2] * c + cross[2] * s + k[2] * kv * (1 - c)];
    }
    function render() {
      var html = head("Bloch Sphere Sandbox", "Rotate freely about any axis by any angle, jump to preset states, and save a reference to compare against.") + infoPanel(LAB_INFO["bloch-sandbox"]);
      html += '<div class="widget"><div class="widget-controls">' +
        Object.keys(PRESETS).map(function (k) { return '<button class="wbtn psel" data-k="' + k + '" type="button">' + k + "</button>"; }).join("") +
        '</div><div class="widget-controls"><label>axis</label>' +
        ["x", "y", "z"].map(function (a) { return '<button class="wbtn axsel" data-a="' + a + '" type="button">' + a.toUpperCase() + "</button>"; }).join("") +
        '<label for="bloch-angle">angle</label><input id="bloch-angle" type="range" min="-180" max="180" value="45" style="flex:1">' +
        '<button class="btn" id="bloch-apply" type="button">Apply rotation</button>' +
        '<button class="btn" id="bloch-save" type="button">Save as reference</button>' +
        '<button class="btn" id="bloch-reset" type="button">Reset</button></div>' +
        '<canvas class="widget-canvas" id="bloch-canvas" width="500" height="360" aria-label="Bloch sphere with the current state and an optional saved reference state"></canvas>' +
        '<div class="widget-read" id="bloch-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "Bloch Sphere Sandbox", { view: "lab" });
      setAxisActive();
      document.querySelectorAll(".psel").forEach(function (b) { b.onclick = function () { v = PRESETS[b.dataset.k].slice(); draw(); }; });
      document.querySelectorAll(".axsel").forEach(function (b) { b.onclick = function () { axis = b.dataset.a; setAxisActive(); }; });
      document.getElementById("bloch-angle").addEventListener("input", function (e) { angle = +e.target.value; });
      document.getElementById("bloch-apply").onclick = function () { rotate(axis, angle); draw(); };
      document.getElementById("bloch-save").onclick = function () { saved = v.slice(); draw(); };
      document.getElementById("bloch-reset").onclick = function () { v = [0, 0, 1]; saved = null; draw(); };
      draw();
    }
    function setAxisActive() { document.querySelectorAll(".axsel").forEach(function (b) { b.classList.toggle("active", b.dataset.a === axis); }); }
    function draw() {
      var cv = document.getElementById("bloch-canvas"), ctx = cv && cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 500, 360);
      var cx0 = 250, cy0 = 180, R = 130;
      function proj(p) { return [cx0 + R * p[0] + R * 0.34 * p[1], cy0 - R * p[2] + R * 0.2 * p[1]]; }
      ctx.strokeStyle = "#2b3448"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(cx0, cy0, R, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#232a3a"; ctx.beginPath(); ctx.ellipse(cx0, cy0, R, R * 0.32, 0, 0, 7); ctx.stroke();
      var zt = proj([0, 0, 1.2]), zb = proj([0, 0, -1.2]);
      ctx.beginPath(); ctx.moveTo(zt[0], zt[1]); ctx.lineTo(zb[0], zb[1]); ctx.stroke();
      ctx.fillStyle = "#6b7688"; ctx.font = "12px Segoe UI, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("|0⟩", zt[0], zt[1] - 6); ctx.fillText("|1⟩", zb[0], zb[1] + 16);
      if (saved) {
        var sp = proj(saved);
        ctx.strokeStyle = "#9aa4bb77"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(sp[0], sp[1]); ctx.stroke();
        ctx.fillStyle = "#9aa4bb"; ctx.beginPath(); ctx.arc(sp[0], sp[1], 5, 0, 7); ctx.fill();
      }
      var tip = proj(v);
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
      ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(tip[0], tip[1], 6, 0, 7); ctx.fill();
      var readEl = document.getElementById("bloch-read"), p0 = (1 + v[2]) / 2;
      readEl.innerHTML = "Bloch vector = (<b>" + v[0].toFixed(2) + ", " + v[1].toFixed(2) + ", " + v[2].toFixed(2) + "</b>) — P(0) = <b>" + p0.toFixed(3) + "</b>" + (saved ? " · reference saved (grey)" : "");
    }
    render();
  }

  /* ============ Lab 3: Grover Playground ============ */
  function labGrover() {
    var qubits = 3, N = 8, marked = {}, amps, iter = 0, history = [];
    marked[5] = true;
    function computeP() { var s = 0; Object.keys(marked).forEach(function (k) { if (+k < N) s += amps[+k] * amps[+k]; }); return s; }
    function reset() {
      N = Math.pow(2, qubits);
      amps = new Array(N); for (var i = 0; i < N; i++) amps[i] = 1 / Math.sqrt(N);
      iter = 0; history = [computeP()];
    }
    function step() {
      Object.keys(marked).forEach(function (k) { var i = +k; if (i < N) amps[i] = -amps[i]; });
      var mean = 0, i2; for (i2 = 0; i2 < N; i2++) mean += amps[i2]; mean /= N;
      for (i2 = 0; i2 < N; i2++) amps[i2] = 2 * mean - amps[i2];
      iter++; history.push(computeP());
    }
    function render() {
      var html = head("Grover Playground", "Pick the register size and mark any items, then step through amplitude amplification. Optimal iterations ≈ (π/4)√N.") + infoPanel(LAB_INFO["grover-lab"]);
      html += '<div class="widget"><div class="widget-controls"><label>qubits</label>' +
        [2, 3, 4].map(function (q) { return '<button class="wbtn qsel" data-q="' + q + '" type="button">' + q + " (" + Math.pow(2, q) + " states)</button>"; }).join("") +
        '</div><div class="widget-controls"><label>marked items (click to toggle)</label></div>' +
        '<div id="grover-marks" class="mark-grid"></div>' +
        '<div class="widget-controls"><button class="btn primary" id="grover-step" type="button">Apply oracle + diffusion</button>' +
        '<button class="btn" id="grover-reset" type="button">Reset</button></div>' +
        '<canvas class="widget-canvas" id="grover-canvas" width="700" height="320" aria-label="Amplitude bars and a running probability chart across Grover iterations"></canvas>' +
        '<div class="widget-read" id="grover-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "Grover Playground", { view: "lab" });
      setQActive();
      document.querySelectorAll(".qsel").forEach(function (b) { b.onclick = function () { qubits = +b.dataset.q; marked = {}; marked[0] = true; setQActive(); reset(); renderMarks(); draw(); }; });
      document.getElementById("grover-step").onclick = function () { step(); draw(); };
      document.getElementById("grover-reset").onclick = function () { reset(); draw(); };
      reset(); renderMarks(); draw();
    }
    function setQActive() { document.querySelectorAll(".qsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.q === qubits); }); }
    function renderMarks() {
      var wrap = document.getElementById("grover-marks"), html2 = "";
      for (var i = 0; i < N; i++) html2 += '<button class="wbtn mark-btn' + (marked[i] ? " active" : "") + '" data-i="' + i + '" type="button">|' + padBits(i, qubits) + "⟩</button>";
      wrap.innerHTML = html2;
      wrap.querySelectorAll(".mark-btn").forEach(function (b) { b.onclick = function () { var i = +b.dataset.i; if (marked[i]) delete marked[i]; else marked[i] = true; reset(); renderMarks(); draw(); }; });
    }
    function draw() {
      var cv = document.getElementById("grover-canvas"), ctx = cv && cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 700, 320);
      var gap = 6, bw = (640 - gap * (N - 1)) / N, x0 = 30, midY = 100, scale = 70;
      ctx.strokeStyle = "#2b3448"; ctx.beginPath(); ctx.moveTo(20, midY); ctx.lineTo(670, midY); ctx.stroke();
      for (var i = 0; i < N; i++) {
        var a = amps[i], h = Math.abs(a) * scale, x = x0 + i * (bw + gap);
        ctx.fillStyle = marked[i] ? "#fbbf24" : "#22d3ee";
        ctx.fillRect(x, a >= 0 ? midY - h : midY, bw, h);
      }
      var x0b = 30, x1b = 670, y0b = 200, y1b = 300;
      ctx.strokeStyle = "#3a4358"; ctx.beginPath(); ctx.moveTo(x0b, y0b); ctx.lineTo(x0b, y1b); ctx.lineTo(x1b, y1b); ctx.stroke();
      ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "left"; ctx.fillText("P(any marked) vs. iteration", x0b, y0b - 6);
      ctx.strokeStyle = "#34d399"; ctx.lineWidth = 2; ctx.beginPath();
      history.forEach(function (p, i2) {
        var px = x0b + (history.length > 1 ? i2 / (history.length - 1) : 0) * (x1b - x0b), py = y1b - p * (y1b - y0b);
        if (i2 === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      var readEl = document.getElementById("grover-read"), optimal = Math.max(1, Math.round(Math.PI / 4 * Math.sqrt(N)));
      readEl.innerHTML = "N = " + N + ", " + Object.keys(marked).length + " marked — iteration <b>" + iter + "</b>, P(any marked) = <b>" + computeP().toFixed(3) + "</b>. Optimal ≈ <b>" + optimal + "</b> iterations.";
    }
    render();
  }

  /* ============ Lab 4: QFT & Period-Finding Lab ============ */
  function labQft() {
    var qubits = 3, N = 8, r = 2;
    function divisors(n) { var d = []; for (var i = 1; i <= n; i++) if (n % i === 0) d.push(i); return d; }
    function computeOutput() {
      var S = [], j; for (j = 0; j < N; j += r) S.push(j);
      var m = S.length, amp = 1 / Math.sqrt(m), out = new Array(N);
      for (var k = 0; k < N; k++) {
        var re = 0, im = 0;
        for (var si = 0; si < S.length; si++) { var ang = 2 * Math.PI * S[si] * k / N; re += amp * Math.cos(ang); im += amp * Math.sin(ang); }
        re /= Math.sqrt(N); im /= Math.sqrt(N); out[k] = Math.hypot(re, im);
      }
      return { S: S, out: out };
    }
    function render() {
      var html = head("QFT & Period-Finding Lab", "The transform behind Shor's algorithm — pick a register size and period, and watch where the output peaks.") + infoPanel(LAB_INFO["qft-lab"]);
      html += '<div class="widget"><div class="widget-controls"><label>qubits</label>' +
        [2, 3, 4].map(function (q) { return '<button class="wbtn qsel" data-q="' + q + '" type="button">' + q + " (" + Math.pow(2, q) + " states)</button>"; }).join("") +
        '</div><div class="widget-controls" id="qft-rsel"></div>' +
        '<canvas class="widget-canvas" id="qft-canvas" width="700" height="320" aria-label="Input comb pattern and QFT output magnitude bars"></canvas>' +
        '<div class="widget-read" id="qft-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "QFT Lab", { view: "lab" });
      setQActive(); renderR(); draw();
      document.querySelectorAll(".qsel").forEach(function (b) { b.onclick = function () { qubits = +b.dataset.q; N = Math.pow(2, qubits); r = divisors(N)[1] || 1; setQActive(); renderR(); draw(); }; });
    }
    function setQActive() { document.querySelectorAll(".qsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.q === qubits); }); }
    function renderR() {
      var wrap = document.getElementById("qft-rsel");
      wrap.innerHTML = '<label>period r</label>' + divisors(N).map(function (d) { return '<button class="wbtn rsel" data-r="' + d + '" type="button">' + d + "</button>"; }).join("");
      wrap.querySelectorAll(".rsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.r === r); b.onclick = function () { r = +b.dataset.r; renderR(); draw(); }; });
    }
    function draw() {
      var cv = document.getElementById("qft-canvas"), ctx = cv && cv.getContext("2d");
      if (!ctx) return;
      var res = computeOutput(), S = res.S, out = res.out;
      ctx.clearRect(0, 0, 700, 320);
      var gap = Math.max(2, Math.min(8, 600 / N / 3)), bw = (600 - gap * (N - 1)) / N, x0 = 50;
      ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "left";
      ctx.fillText("input |j⟩ (period " + r + ")", x0, 14);
      for (var j = 0; j < N; j++) {
        var on = S.indexOf(j) >= 0, x = x0 + j * (bw + gap), h = on ? 60 : 4;
        ctx.fillStyle = on ? "#7c5cff" : "#232a3a";
        ctx.fillRect(x, 100 - h, bw, h);
      }
      ctx.fillText("QFT output |k⟩ amplitude magnitude", x0, 150);
      var maxOut = 0; for (var kk = 0; kk < N; kk++) if (out[kk] > maxOut) maxOut = out[kk];
      var peakThresh = maxOut * 0.9;
      for (var k = 0; k < N; k++) {
        var a = out[k], h2 = a * 140, x2 = x0 + k * (bw + gap), peak = a > peakThresh;
        ctx.fillStyle = peak ? "#34d399" : "#22d3ee";
        ctx.fillRect(x2, 310 - h2, bw, h2);
      }
      var m = N / r, peaks = []; for (var pk = 0; pk < N; pk += m) peaks.push(pk);
      var readEl = document.getElementById("qft-read");
      readEl.innerHTML = "N = " + N + ", period r = <b>" + r + "</b> ⇒ QFT peaks at k = <b>" + peaks.join(", ") + "</b> (multiples of N/r = " + m + ").";
    }
    render();
  }

  /* ============ Lab 5: Error Correction Lab ============ */
  function labQec() {
    var mode = "bit", logical = 0, errAt = -1, corrected = false;
    function symbols() { return mode === "bit" ? ["0", "1"] : ["+", "−"]; }
    function physical() {
      var bits = [logical, logical, logical];
      if (errAt >= 0 && !corrected) bits[errAt] = 1 - bits[errAt];
      return bits;
    }
    function render() {
      var html = head("Error Correction Lab", "Bit-flip and phase-flip repetition codes: encode, inject an error, read the syndrome, and correct it.") + infoPanel(LAB_INFO["qec-lab"]);
      html += '<div class="widget"><div class="widget-controls"><label>code</label>' +
        '<button class="wbtn msel" data-m="bit" type="button">Bit-flip</button>' +
        '<button class="wbtn msel" data-m="phase" type="button">Phase-flip</button>' +
        '</div><div class="widget-controls"><label>logical</label>' +
        '<button class="wbtn lsel" data-l="0" type="button" id="lbl0"></button>' +
        '<button class="wbtn lsel" data-l="1" type="button" id="lbl1"></button>' +
        '<label>error qubit</label>' +
        '<button class="wbtn esel" data-e="-1" type="button">none</button>' +
        '<button class="wbtn esel" data-e="0" type="button">q1</button>' +
        '<button class="wbtn esel" data-e="1" type="button">q2</button>' +
        '<button class="wbtn esel" data-e="2" type="button">q3</button>' +
        '<button class="btn" id="qec-random" type="button">🎲 Random error</button>' +
        '<button class="btn primary" id="qec-correct" type="button">Detect &amp; correct</button></div>' +
        '<canvas class="widget-canvas" id="qec-canvas" width="500" height="220" aria-label="Three physical qubits with the current code, error state, and correction"></canvas>' +
        '<div class="widget-read" id="qec-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "Error Correction Lab", { view: "lab" });
      refreshLabels(); setActive(); draw();
      document.querySelectorAll(".msel").forEach(function (b) { b.onclick = function () { mode = b.dataset.m; errAt = -1; corrected = false; refreshLabels(); setActive(); draw(); }; });
      document.querySelectorAll(".lsel").forEach(function (b) { b.onclick = function () { logical = +b.dataset.l; errAt = -1; corrected = false; setActive(); draw(); }; });
      document.querySelectorAll(".esel").forEach(function (b) { b.onclick = function () { errAt = +b.dataset.e; corrected = false; setActive(); draw(); }; });
      document.getElementById("qec-random").onclick = function () { errAt = Math.floor(Math.random() * 4) - 1; corrected = false; setActive(); draw(); };
      document.getElementById("qec-correct").onclick = function () { corrected = true; draw(); };
    }
    function refreshLabels() { var s = symbols(); var e0 = document.getElementById("lbl0"), e1 = document.getElementById("lbl1"); if (e0) e0.textContent = s[0]; if (e1) e1.textContent = s[1]; }
    function setActive() {
      document.querySelectorAll(".msel").forEach(function (b) { b.classList.toggle("active", b.dataset.m === mode); });
      document.querySelectorAll(".lsel").forEach(function (b) { b.classList.toggle("active", +b.dataset.l === logical); });
      document.querySelectorAll(".esel").forEach(function (b) { b.classList.toggle("active", +b.dataset.e === errAt); });
    }
    function draw() {
      var cv = document.getElementById("qec-canvas"), ctx = cv && cv.getContext("2d");
      if (!ctx) return;
      var bits = physical(), s = symbols();
      ctx.clearRect(0, 0, 500, 220);
      var xs = [110, 250, 390];
      xs.forEach(function (x, i) {
        ctx.strokeStyle = bits[i] !== logical ? "#f87171" : "#2b3448"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, 100, 34, 0, 7); ctx.stroke();
        ctx.fillStyle = "#e6eaf2"; ctx.font = "bold 20px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(s[bits[i]], x, 101);
        ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#9aa4bb"; ctx.font = "11px Segoe UI, sans-serif";
        ctx.fillText("q" + (i + 1), x, 150);
      });
      var readEl = document.getElementById("qec-read");
      var syndrome = (errAt >= 0 && !corrected) ? ("mismatch found on q" + (errAt + 1)) : "no error detected";
      readEl.innerHTML = (mode === "bit" ? "Bit-flip" : "Phase-flip") + " code — logical " + s[logical] + " encoded as " + bits.map(function (b) { return s[b]; }).join("") +
        " — syndrome: <b>" + syndrome + "</b>" + (corrected ? (" — corrected back to " + s[logical] + s[logical] + s[logical] + ".") : ".");
    }
    render();
  }

  /* ============ Lab 6: VQE Optimization Lab ============ */
  function labVqe() {
    var lr = 0.15, theta1 = 0.5, theta2 = 5.5, path = [[theta1, theta2]];
    function E(t1, t2) { return Math.cos(t1) + 0.5 * Math.cos(t2) + 0.3 * Math.cos(t1 - t2); }
    function grad(t1, t2) { return [-Math.sin(t1) - 0.3 * Math.sin(t1 - t2), -0.5 * Math.sin(t2) + 0.3 * Math.sin(t1 - t2)]; }
    function step() {
      var g = grad(theta1, theta2);
      theta1 -= lr * g[0]; theta2 -= lr * g[1];
      theta1 = ((theta1 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      theta2 = ((theta2 % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      path.push([theta1, theta2]);
    }
    function reset() { theta1 = 0.5; theta2 = 5.5; path = [[theta1, theta2]]; }
    function render() {
      var html = head("VQE Optimization Lab", "A 2-parameter energy landscape E(θ₁, θ₂) — step gradient descent and watch it find a minimum.") + infoPanel(LAB_INFO["vqe-lab"]);
      html += '<div class="widget"><div class="widget-controls"><button class="btn primary" id="vqe-step" type="button">Gradient step</button>' +
        '<button class="btn" id="vqe-reset" type="button">Reset</button>' +
        '<label for="vqe-lr">learning rate</label><input id="vqe-lr" type="range" min="1" max="50" value="15" style="flex:1"></div>' +
        '<canvas class="widget-canvas" id="vqe-canvas" width="440" height="440" aria-label="Heatmap of the energy landscape with the gradient descent path traced on it"></canvas>' +
        '<div class="widget-read" id="vqe-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "VQE Lab", { view: "lab" });
      document.getElementById("vqe-step").onclick = function () { step(); draw(); };
      document.getElementById("vqe-reset").onclick = function () { reset(); draw(); };
      document.getElementById("vqe-lr").addEventListener("input", function (e) { lr = +e.target.value / 100; });
      draw();
    }
    function draw() {
      var cv = document.getElementById("vqe-canvas"), ctx = cv && cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, 440, 440);
      var G = 36, cell = 400 / G, x0 = 20, y0 = 20, minE = 999, maxE = -999, vals = [];
      for (var gy = 0; gy < G; gy++) { vals[gy] = []; for (var gx = 0; gx < G; gx++) { var e = E(gx / G * 2 * Math.PI, gy / G * 2 * Math.PI); vals[gy][gx] = e; if (e < minE) minE = e; if (e > maxE) maxE = e; } }
      for (gy = 0; gy < G; gy++) for (gx = 0; gx < G; gx++) {
        var t = (vals[gy][gx] - minE) / (maxE - minE || 1);
        var rr = Math.round(230 * t + 20), bb = Math.round(230 * (1 - t) + 20);
        ctx.fillStyle = "rgb(" + rr + ",80," + bb + ")";
        ctx.fillRect(x0 + gx * cell, y0 + gy * cell, cell + 1, cell + 1);
      }
      ctx.strokeStyle = "#e6eaf2"; ctx.lineWidth = 2; ctx.beginPath();
      path.forEach(function (p, i) {
        var px = x0 + (p[0] / (2 * Math.PI)) * 400, py = y0 + (p[1] / (2 * Math.PI)) * 400;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      });
      ctx.stroke();
      var last = path[path.length - 1], lx = x0 + (last[0] / (2 * Math.PI)) * 400, ly = y0 + (last[1] / (2 * Math.PI)) * 400;
      ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(lx, ly, 6, 0, 7); ctx.fill();
      var readEl = document.getElementById("vqe-read");
      readEl.innerHTML = "step <b>" + (path.length - 1) + "</b>: θ₁ = <b>" + theta1.toFixed(2) + "</b>, θ₂ = <b>" + theta2.toFixed(2) + "</b>, E = <b>" + E(theta1, theta2).toFixed(3) + "</b> (blue = lower energy).";
    }
    render();
  }

  /* ============ Lab 7: Measurement & Basis ============ */
  function labMeasure() {
    var theta = 0, phi = 0, basis = "Z", n0 = 0, n1 = 0;
    var BASES = { Z: [0, 0, 1], X: [1, 0, 0], Y: [0, 1, 0] };
    var LBL = { Z: ["0", "1"], X: ["+", "−"], Y: ["+i", "−i"] };
    function stateVec() { var t = theta * Math.PI / 180, p = phi * Math.PI / 180; return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)]; }
    function pPlus() { var v = stateVec(), n = BASES[basis]; return (1 + (v[0] * n[0] + v[1] * n[1] + v[2] * n[2])) / 2; }
    function render() {
      var html = head("Measurement & Basis Lab", "Prepare any qubit, choose the basis you measure in, and watch the outcome statistics.") + infoPanel(LAB_INFO["measure-lab"]);
      html += '<div class="widget"><div class="widget-controls">' +
        '<label for="ms-t">state θ</label><input id="ms-t" type="range" min="0" max="180" value="0" style="flex:1">' +
        '<label for="ms-p">state φ</label><input id="ms-p" type="range" min="0" max="360" value="0" style="flex:1"></div>' +
        '<div class="widget-controls"><label>measure in</label>' +
        ["Z", "X", "Y"].map(function (b) { return '<button class="wbtn bsel" data-b="' + b + '" type="button">' + b + "</button>"; }).join("") +
        '<button class="btn primary" id="ms-1" type="button">Measure ×1</button>' +
        '<button class="btn" id="ms-many" type="button">Measure ×1000</button>' +
        '<button class="btn" id="ms-reset" type="button">Reset counts</button></div>' +
        '<canvas class="widget-canvas" id="ms-canvas" width="620" height="280" aria-label="The prepared state and measurement axis on a Bloch sphere, with the outcome-frequency bars"></canvas>' +
        '<div class="widget-read" id="ms-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "Measurement & Basis Lab", { view: "lab" });
      setBasisActive();
      document.getElementById("ms-t").addEventListener("input", function (e) { theta = +e.target.value; n0 = n1 = 0; draw(); });
      document.getElementById("ms-p").addEventListener("input", function (e) { phi = +e.target.value; n0 = n1 = 0; draw(); });
      document.querySelectorAll(".bsel").forEach(function (b) { b.onclick = function () { basis = b.dataset.b; n0 = n1 = 0; setBasisActive(); draw(); }; });
      document.getElementById("ms-1").onclick = function () { measure(1); };
      document.getElementById("ms-many").onclick = function () { measure(1000); };
      document.getElementById("ms-reset").onclick = function () { n0 = n1 = 0; draw(); };
      draw();
    }
    function setBasisActive() { document.querySelectorAll(".bsel").forEach(function (b) { b.classList.toggle("active", b.dataset.b === basis); }); }
    function measure(k) { var p = pPlus(); for (var i = 0; i < k; i++) { if (Math.random() < p) n0++; else n1++; } draw(); }
    function draw() {
      var cv = document.getElementById("ms-canvas"), ctx = cv && cv.getContext("2d"); if (!ctx) return;
      ctx.clearRect(0, 0, 620, 280);
      var ox = 150, oy = 140, R = 100, v = stateVec(), n = BASES[basis];
      function proj(p) { return [ox + R * p[0] + R * 0.30 * p[1], oy - R * p[2] + R * 0.18 * p[1]]; }
      ctx.strokeStyle = "#2b3448"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(ox, oy, R, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#232a3a"; ctx.beginPath(); ctx.ellipse(ox, oy, R, R * 0.30, 0, 0, 7); ctx.stroke();
      // measurement axis (gold, both directions)
      var np = proj(n), nn = proj([-n[0], -n[1], -n[2]]);
      ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(nn[0], nn[1]); ctx.lineTo(np[0], np[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#fbbf24"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText(basis + " basis", np[0], np[1] - 8);
      // state vector (cyan)
      var tip = proj(v);
      ctx.strokeStyle = "#22d3ee"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
      ctx.fillStyle = "#22d3ee"; ctx.beginPath(); ctx.arc(tip[0], tip[1], 5, 0, 7); ctx.fill();
      // bars
      var p = pPlus(), total = n0 + n1, f0 = total ? n0 / total : 0, f1 = total ? n1 / total : 0;
      var bx = 360, by = 40, bw = 90, bh = 170, gap = 40;
      ctx.strokeStyle = "#2b3448"; ctx.strokeRect(bx, by, bw, bh); ctx.strokeRect(bx + bw + gap, by, bw, bh);
      ctx.fillStyle = "#34d399"; ctx.fillRect(bx, by + bh - f0 * bh, bw, f0 * bh);
      ctx.fillStyle = "#7c5cff"; ctx.fillRect(bx + bw + gap, by + bh - f1 * bh, bw, f1 * bh);
      // exact Born-rule dashed lines
      ctx.strokeStyle = "#e6eaf2"; ctx.setLineDash([4, 3]); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(bx - 4, by + bh - p * bh); ctx.lineTo(bx + bw + 4, by + bh - p * bh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw + gap - 4, by + bh - (1 - p) * bh); ctx.lineTo(bx + bw + gap + bw + 4, by + bh - (1 - p) * bh); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#9aa4bb"; ctx.font = "12px Segoe UI, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("|" + LBL[basis][0] + "⟩", bx + bw / 2, by + bh + 18); ctx.fillText("|" + LBL[basis][1] + "⟩", bx + bw + gap + bw / 2, by + bh + 18);
      document.getElementById("ms-read").innerHTML = "Exact Born-rule odds in the " + basis + " basis: P(" + LBL[basis][0] + ") = <b>" + p.toFixed(3) + "</b>, P(" + LBL[basis][1] + ") = <b>" + (1 - p).toFixed(3) + "</b>" + (total ? (" — sampled so far: " + (f0 * 100).toFixed(1) + "% / " + (f1 * 100).toFixed(1) + "% over <b>" + total + "</b> shots (dashed = exact)") : " — take shots to sample them.") + ".";
    }
    render();
  }

  /* ============ Lab 8: Quantum Teleportation ============ */
  function labTeleport() {
    var theta = 90, phi = 0, step = 0, bits = [0, 0];
    var STEPS = [
      "Alice holds the unknown state on qubit 1. Qubits 2 &amp; 3 are prepared as a shared Bell pair.",
      "Alice entangles her qubit 1 with her half of the pair (a CNOT), then a Hadamard on qubit 1.",
      "Alice measures qubits 1 &amp; 2, getting two random classical bits.",
      "Alice sends those 2 bits to Bob over an ordinary (classical) channel.",
      "Bob applies Z^b1 X^b2 to qubit 3 — it now holds Alice's exact original state."
    ];
    function inVec() { var t = theta * Math.PI / 180, p = phi * Math.PI / 180; return [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)]; }
    function applyZ(v) { return [-v[0], -v[1], v[2]]; }
    function applyX(v) { return [v[0], -v[1], -v[2]]; }
    // apply X/Z conditionally (m = 0 or 1)
    function applyZ_m(v, m) { return m ? applyZ(v) : v; }
    function applyX_m(v, m) { return m ? applyX(v) : v; }
    function preState(v) { return applyX_m(applyZ_m(v.slice(), bits[0]), bits[1]); }
    function render() {
      var html = head("Quantum Teleportation Lab", "Dial in a state to send, step through the protocol, and verify Bob's qubit matches.") + infoPanel(LAB_INFO["teleport-lab"]);
      html += '<div class="widget"><div class="widget-controls">' +
        '<label for="tp-t">input θ</label><input id="tp-t" type="range" min="0" max="180" value="90" style="flex:1">' +
        '<label for="tp-p">input φ</label><input id="tp-p" type="range" min="0" max="360" value="0" style="flex:1"></div>' +
        '<div class="widget-controls"><button class="btn primary" id="tp-next" type="button">Next step →</button>' +
        '<button class="btn" id="tp-restart" type="button">Restart (new random bits)</button></div>' +
        '<canvas class="widget-canvas" id="tp-canvas" width="640" height="260" aria-label="Alice input state, the protocol wires, and Bob output state on Bloch spheres"></canvas>' +
        '<div class="widget-read" id="tp-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "Quantum Teleportation Lab", { view: "lab" });
      document.getElementById("tp-t").addEventListener("input", function (e) { theta = +e.target.value; draw(); });
      document.getElementById("tp-p").addEventListener("input", function (e) { phi = +e.target.value; draw(); });
      document.getElementById("tp-next").onclick = function () { if (step < STEPS.length - 1) { step++; if (step === 2) bits = [Math.random() < 0.5 ? 1 : 0, Math.random() < 0.5 ? 1 : 0]; } draw(); };
      document.getElementById("tp-restart").onclick = function () { step = 0; bits = [0, 0]; draw(); };
      draw();
    }
    function miniBloch(ctx, ox, oy, R, v, col, label) {
      ctx.strokeStyle = "#2b3448"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ox, oy, R, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#232a3a"; ctx.beginPath(); ctx.ellipse(ox, oy, R, R * 0.3, 0, 0, 7); ctx.stroke();
      var tip = [ox + R * v[0] + R * 0.3 * v[1], oy - R * v[2] + R * 0.18 * v[1]];
      ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tip[0], tip[1]); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tip[0], tip[1], 4, 0, 7); ctx.fill();
      ctx.fillStyle = "#9aa4bb"; ctx.font = "12px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText(label, ox, oy + R + 20);
    }
    function draw() {
      var cv = document.getElementById("tp-canvas"), ctx = cv && cv.getContext("2d"); if (!ctx) return;
      ctx.clearRect(0, 0, 640, 260);
      var v = inVec();
      miniBloch(ctx, 80, 90, 58, v, "#22d3ee", "Alice input |ψ⟩");
      var bob = step < 4 ? preState(v) : v;
      miniBloch(ctx, 560, 90, 58, bob, "#34d399", "Bob qubit 3");
      // wires
      var wy = [55, 90, 125], wx0 = 175, wx1 = 465;
      ["q1", "q2", "q3"].forEach(function (lbl, i) {
        ctx.strokeStyle = "#3a4358"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(wx0, wy[i]); ctx.lineTo(wx1, wy[i]); ctx.stroke();
        ctx.fillStyle = "#9aa4bb"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "right"; ctx.fillText(lbl, wx0 - 4, wy[i] + 3);
      });
      if (step >= 0) { ctx.strokeStyle = "#7c5cff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(240, wy[1]); ctx.lineTo(240, wy[2]); ctx.stroke(); ctx.fillStyle = "#7c5cff"; [1, 2].forEach(function (i) { ctx.beginPath(); ctx.arc(240, wy[i], 4, 0, 7); ctx.fill(); }); }
      if (step >= 1) { ctx.strokeStyle = "#22d3ee"; ctx.beginPath(); ctx.moveTo(300, wy[0]); ctx.lineTo(300, wy[1]); ctx.stroke(); ctx.fillStyle = "#22d3ee"; [0, 1].forEach(function (i) { ctx.beginPath(); ctx.arc(300, wy[i], 4, 0, 7); ctx.fill(); }); ctx.strokeStyle = "#22d3ee"; ctx.strokeRect(320, wy[0] - 11, 22, 22); ctx.fillStyle = "#e6eaf2"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("H", 331, wy[0] + 4); }
      if (step >= 2) { ctx.fillStyle = "#fbbf24"; ctx.font = "bold 12px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("m₁=" + bits[0], 380, wy[0] + 4); ctx.fillText("m₂=" + bits[1], 380, wy[1] + 4); }
      if (step >= 4) { ctx.strokeStyle = "#34d399"; ctx.lineWidth = 2; ctx.strokeRect(430, wy[2] - 11, 30, 22); ctx.fillStyle = "#34d399"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ZX", 445, wy[2] + 4); }
      var fid = (1 + (v[0] * bob[0] + v[1] * bob[1] + v[2] * bob[2])) / 2;
      document.getElementById("tp-read").innerHTML = "<b>Step " + (step + 1) + "/" + STEPS.length + ":</b> " + STEPS[step] +
        " &nbsp;·&nbsp; Bob-vs-input fidelity = <b>" + fid.toFixed(3) + "</b>" + (step >= 4 ? " ✓ perfect" : " (corrections not applied yet)") + ".";
    }
    render();
  }

  /* ============ Lab 9: QAOA / Max-Cut ============ */
  function labQaoa() {
    var NQ = 4;
    var nodes = [[70, 55], [230, 55], [230, 175], [70, 175]];
    var edges = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]];
    var gamma = 0.8, beta = 0.5;
    function cutVal(z) { var c = 0; edges.forEach(function (e) { if (((z >> e[0]) & 1) !== ((z >> e[1]) & 1)) c++; }); return c; }
    function applyRx(state, q, ang) {
      var co = Math.cos(ang), si = Math.sin(ang), out = state.slice();
      for (var i = 0; i < state.length; i++) {
        if ((i >> q) & 1) continue;
        var j = i | (1 << q), a0 = state[i], a1 = state[j];
        // Rx(2ang) = [[cos, -i sin],[-i sin, cos]]
        out[i] = cadd(cmul(cx(co, 0), a0), cmul(cx(0, -si), a1));
        out[j] = cadd(cmul(cx(0, -si), a0), cmul(cx(co, 0), a1));
      }
      return out;
    }
    function qaoaProbs(g, b) {
      var dim = 1 << NQ, amp = 1 / Math.sqrt(dim), state = [];
      for (var i = 0; i < dim; i++) state.push(cx(amp, 0));                 // |+>^n
      for (i = 0; i < dim; i++) { var ph = -g * cutVal(i); state[i] = cmul(state[i], cx(Math.cos(ph), Math.sin(ph))); } // cost
      for (var q = 0; q < NQ; q++) state = applyRx(state, q, b);            // mixer
      return state.map(function (a) { return a.re * a.re + a.im * a.im; });
    }
    function expectedCut(probs) { var e = 0; for (var i = 0; i < probs.length; i++) e += probs[i] * cutVal(i); return e; }
    function bestCut() { var best = 0, bz = 0; for (var z = 0; z < (1 << NQ); z++) { var c = cutVal(z); if (c > best) { best = c; bz = z; } } return { best: best, z: bz }; }
    function render() {
      var html = head("QAOA / Max-Cut Lab", "Tune the p=1 QAOA angles and watch the measurement distribution concentrate on the best cut.") + infoPanel(LAB_INFO["qaoa-lab"]);
      html += '<div class="widget"><div class="widget-controls">' +
        '<label for="qa-g">γ (cost)</label><input id="qa-g" type="range" min="0" max="314" value="80" style="flex:1">' +
        '<label for="qa-b">β (mixer)</label><input id="qa-b" type="range" min="0" max="157" value="50" style="flex:1">' +
        '<button class="btn primary" id="qa-opt" type="button">Optimize angles</button></div>' +
        '<canvas class="widget-canvas" id="qa-canvas" width="700" height="300" aria-label="The Max-Cut graph and the QAOA output probability over all bitstrings"></canvas>' +
        '<div class="widget-read" id="qa-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "QAOA / Max-Cut Lab", { view: "lab" });
      document.getElementById("qa-g").addEventListener("input", function (e) { gamma = +e.target.value / 100; draw(); });
      document.getElementById("qa-b").addEventListener("input", function (e) { beta = +e.target.value / 100; draw(); });
      document.getElementById("qa-opt").onclick = optimize;
      draw();
    }
    function optimize() {
      var bestE = -1, bg = gamma, bb = beta;
      for (var gi = 0; gi <= 40; gi++) for (var bi = 0; bi <= 20; bi++) {
        var g = gi / 40 * Math.PI, b = bi / 20 * Math.PI / 2, e = expectedCut(qaoaProbs(g, b));
        if (e > bestE) { bestE = e; bg = g; bb = b; }
      }
      gamma = bg; beta = bb;
      var gs = document.getElementById("qa-g"), bs = document.getElementById("qa-b");
      if (gs) gs.value = Math.round(gamma * 100); if (bs) bs.value = Math.round(beta * 100);
      draw();
    }
    function draw() {
      var cv = document.getElementById("qa-canvas"), ctx = cv && cv.getContext("2d"); if (!ctx) return;
      ctx.clearRect(0, 0, 700, 300);
      var probs = qaoaProbs(gamma, beta), mc = bestCut();
      // most likely bitstring
      var ml = 0; for (var i = 1; i < probs.length; i++) if (probs[i] > probs[ml]) ml = i;
      // graph
      edges.forEach(function (e) {
        var cut = ((ml >> e[0]) & 1) !== ((ml >> e[1]) & 1);
        ctx.strokeStyle = cut ? "#34d399" : "#2b3448"; ctx.lineWidth = cut ? 3 : 1.5;
        ctx.beginPath(); ctx.moveTo(nodes[e[0]][0], nodes[e[0]][1]); ctx.lineTo(nodes[e[1]][0], nodes[e[1]][1]); ctx.stroke();
      });
      nodes.forEach(function (p, i) {
        ctx.fillStyle = ((ml >> i) & 1) ? "#fbbf24" : "#22d3ee"; ctx.strokeStyle = "#0b0e16"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p[0], p[1], 17, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#0b0e16"; ctx.font = "bold 12px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(String(i), p[0], p[1] + 1); ctx.textBaseline = "alphabetic";
      });
      ctx.fillStyle = "#6b7688"; ctx.font = "11px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.fillText("most-likely cut", 150, 210);
      // probability bars (16)
      var bx0 = 300, n = probs.length, bw = (390 - 4 * (n - 1)) / n, base = 250, H = 200, maxP = Math.max.apply(null, probs);
      for (i = 0; i < n; i++) {
        var h = (probs[i] / (maxP || 1)) * H, x = bx0 + i * (bw + 4);
        ctx.fillStyle = cutVal(i) === mc.best ? "#34d399" : "#7c5cff";
        ctx.fillRect(x, base - h, bw, h);
      }
      ctx.fillStyle = "#9aa4bb"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "left"; ctx.fillText("P(bitstring) — green = an optimal cut", bx0, 32);
      var eC = expectedCut(probs);
      document.getElementById("qa-read").innerHTML = "γ = <b>" + gamma.toFixed(2) + "</b>, β = <b>" + beta.toFixed(2) + "</b> → expected cut = <b>" + eC.toFixed(2) + "</b> (the true maximum is <b>" + mc.best + "</b>). Tune the angles — or hit Optimize — to push the expected value toward the maximum.";
    }
    render();
  }

  /* ============ Lab 10: Entanglement Explorer ============ */
  function labEntangle() {
    var kind = "GHZ", counts = {}, cond = null;
    function config() {
      if (kind === "Bell") return { nq: 2, allowed: ["00", "11"], amp: 1 / Math.SQRT2 };
      if (kind === "GHZ") return { nq: 3, allowed: ["000", "111"], amp: 1 / Math.SQRT2 };
      return { nq: 3, allowed: ["001", "010", "100"], amp: 1 / Math.sqrt(3) }; // W
    }
    function sample(k) { var c = config(); for (var i = 0; i < k; i++) { var pick = c.allowed[Math.floor(Math.random() * c.allowed.length)]; counts[pick] = (counts[pick] || 0) + 1; } draw(); }
    function measureFirst() {
      var c = config();
      // measure qubit 0 (leftmost bit): outcome weighted by how many allowed strings have that bit
      var zeros = c.allowed.filter(function (s) { return s[0] === "0"; }), ones = c.allowed.filter(function (s) { return s[0] === "1"; });
      var pOne = ones.length / c.allowed.length, b = Math.random() < pOne ? "1" : "0";
      var rest = (b === "1" ? ones : zeros).map(function (s) { return s.slice(1); });
      cond = { bit: b, rest: rest };
      draw();
    }
    function render() {
      var html = head("Entanglement Explorer", "Build Bell, GHZ, and W states and compare how they behave under measurement.") + infoPanel(LAB_INFO["entangle-lab"]);
      html += '<div class="widget"><div class="widget-controls"><label>state</label>' +
        ["Bell", "GHZ", "W"].map(function (s) { return '<button class="wbtn ksel" data-k="' + s + '" type="button">' + s + "</button>"; }).join("") +
        '<button class="btn primary" id="en-1" type="button">Measure all ×1</button>' +
        '<button class="btn" id="en-many" type="button">×1000</button>' +
        '<button class="btn" id="en-q0" type="button">Measure only q0</button>' +
        '<button class="btn" id="en-reset" type="button">Reset</button></div>' +
        '<canvas class="widget-canvas" id="en-canvas" width="640" height="260" aria-label="Histogram of joint measurement outcomes for the chosen entangled state"></canvas>' +
        '<div class="widget-read" id="en-read" aria-live="polite"></div></div>';
      QCC.setContent(page(html), "Entanglement Explorer", { view: "lab" });
      setKindActive();
      document.querySelectorAll(".ksel").forEach(function (b) { b.onclick = function () { kind = b.dataset.k; counts = {}; cond = null; setKindActive(); draw(); }; });
      document.getElementById("en-1").onclick = function () { cond = null; sample(1); };
      document.getElementById("en-many").onclick = function () { cond = null; sample(1000); };
      document.getElementById("en-q0").onclick = measureFirst;
      document.getElementById("en-reset").onclick = function () { counts = {}; cond = null; draw(); };
      draw();
    }
    function setKindActive() { document.querySelectorAll(".ksel").forEach(function (b) { b.classList.toggle("active", b.dataset.k === kind); }); }
    function draw() {
      var cv = document.getElementById("en-canvas"), ctx = cv && cv.getContext("2d"); if (!ctx) return;
      ctx.clearRect(0, 0, 640, 260);
      var c = config(), dim = 1 << c.nq, labels = [];
      for (var i = 0; i < dim; i++) { var s = i.toString(2); while (s.length < c.nq) s = "0" + s; labels.push(s); }
      var total = 0; labels.forEach(function (l) { total += counts[l] || 0; });
      var n = dim, x0 = 40, gap = dim > 4 ? 10 : 40, bw = (560 - gap * (n - 1)) / n, base = 200, H = 160, maxC = 1;
      labels.forEach(function (l) { maxC = Math.max(maxC, counts[l] || 0); });
      labels.forEach(function (l, i) {
        var h = ((counts[l] || 0) / maxC) * H, x = x0 + i * (bw + gap);
        var allowed = c.allowed.indexOf(l) >= 0;
        ctx.fillStyle = allowed ? "#34d399" : "#7c5cff";
        if (!(counts[l] || 0) && allowed) { ctx.strokeStyle = "#34d39955"; ctx.setLineDash([3, 3]); ctx.strokeRect(x, base - 10, bw, 10); ctx.setLineDash([]); }
        ctx.fillRect(x, base - h, bw, h);
        ctx.fillStyle = "#6b7688"; ctx.font = "10px Segoe UI, sans-serif"; ctx.textAlign = "center"; ctx.save(); ctx.translate(x + bw / 2, base + 8); if (dim > 4) ctx.rotate(Math.PI / 5); ctx.fillText(l, 0, 6); ctx.restore();
      });
      var msg;
      if (cond) {
        msg = "Measured q0 = <b>" + cond.bit + "</b> → the rest collapses to " + (cond.rest.length === 1 ? ("<b>|" + cond.rest[0] + "⟩</b> with certainty") : ("an equal mix of " + cond.rest.map(function (r) { return "|" + r + "⟩"; }).join(", "))) + ". " +
          (kind === "GHZ" ? "For GHZ, one measurement fixes every other qubit — total lock-step." : kind === "W" ? "For W, seeing a 1 forces the others to 0; seeing a 0 leaves a smaller W still entangled." : "For a Bell pair, measuring one instantly fixes the other.");
      } else {
        msg = kind === "GHZ" ? "GHZ only ever gives <b>000</b> or <b>111</b> — all three qubits rise or fall together (green outlines = allowed but not yet seen)." :
          kind === "W" ? "W only ever gives exactly-one-1 strings (<b>001, 010, 100</b>) — a completely different correlation from GHZ." :
            "A Bell pair only ever gives <b>00</b> or <b>11</b> — perfectly correlated (" + (total ? total + " shots so far" : "take shots to see it") + ").";
      }
      document.getElementById("en-read").innerHTML = msg;
    }
    render();
  }

  var LAB_RENDER = {
    circuit: labCircuit, "bloch-sandbox": labBloch, "grover-lab": labGrover, "qft-lab": labQft, "qec-lab": labQec, "vqe-lab": labVqe,
    "measure-lab": labMeasure, "teleport-lab": labTeleport, "qaoa-lab": labQaoa, "entangle-lab": labEntangle
  };

  /* ============ routes ============ */
  QCC.registerRoute(function (h) {
    var m;
    if (h === "#/labs") { viewLabsIndex(); return true; }
    if ((m = h.match(/^#\/lab\/([\w-]+)$/))) {
      var l = labById(m[1]);
      if (!l || !LAB_RENDER[m[1]]) { viewLabsIndex(); return true; }
      LAB_RENDER[m[1]]();
      return true;
    }
    return false;
  });
});
