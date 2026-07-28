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
    { id: "vqe-lab", icon: "📉", title: "VQE Optimization Lab", desc: "A 2-parameter energy landscape — step gradient descent to a minimum." }
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
      when: "Use it whenever you want to sanity-check a circuit idea before writing real Qiskit code, or to build intuition for how gate order and CNOT placement change outcomes."
    },
    "bloch-sandbox": {
      what: "A free-form single-qubit state explorer — rotate by any angle about any axis, jump to the six cardinal states, and freeze a second “reference” vector to compare against.",
      why: "Every single-qubit gate is a rotation of the Bloch vector; once you can predict where a rotation lands, gates like H, S, and T stop being memorized symbols and become obviously-necessary moves.",
      how: "Pick an axis (X/Y/Z), set an angle with the slider, click “Apply rotation” to actually move the state using the exact rotation formula, and click “Save as reference” to pin the current position in grey for comparison.",
      where: "Pairs with Module 5 (“The Bloch sphere”) and Module 6 (“The single-qubit gate set”) — the in-lesson Bloch widget there uses fixed gate buttons; this sandbox lets you dial in any rotation.",
      when: "Use it to build the rotation intuition needed for calibrating real hardware pulses, or any time a lesson says “rotate by θ about the X-axis” and you want to see it rather than imagine it."
    },
    "grover-lab": {
      what: "A full amplitude-amplification simulator where you choose the register size (2–4 qubits) and mark any subset of items, then step through the oracle-plus-diffusion cycle and watch the probability of hitting a marked item climb.",
      why: "Grover's algorithm is the canonical example of a real quantum speedup, and the only way to build real intuition for “why does over-rotating hurt” is to keep clicking past the optimal iteration count and watch performance fall back down.",
      how: "Choose a qubit count, toggle any number of marked items in the grid, then click “Apply oracle + diffusion” repeatedly — the bar chart shows every amplitude live, and the line chart below tracks total success probability across iterations.",
      where: "Follows Module 8's “Grover's search: quadratic speedup” — the in-lesson widget there is fixed at 8 states and 1 marked item; this lab generalizes both.",
      when: "Reach for it whenever you need to reason about how the number of marked items or register size changes the optimal iteration count — a question that comes up constantly in quantum algorithms interviews."
    },
    "qft-lab": {
      what: "A generalized quantum Fourier transform explorer — pick a register size up to 4 qubits and any period that divides it, and see exactly which output frequencies light up.",
      why: "The QFT is the engine inside Shor's algorithm, and its “peaks appear at multiples of N/r” behavior is the entire reason quantum computers can find periods — and therefore factor numbers — exponentially faster than classical ones.",
      how: "Choose a qubit count, then pick a period r from the buttons (only valid divisors of N are offered) — the top row shows the input pattern, the bottom row shows the QFT's output magnitudes, with the true peaks highlighted in green.",
      where: "Extends Module 8's “The quantum Fourier transform” and directly sets up “Shor's algorithm &amp; why RSA cares” — the in-lesson Shor widget uses this exact peak-finding step, just with the arithmetic done for you.",
      when: "Use it right before or during the Shor's algorithm lesson to see the period-finding step in isolation, separate from the modular-arithmetic bookkeeping."
    },
    "qec-lab": {
      what: "A working repetition-code simulator for both bit-flip and phase-flip errors — encode a logical qubit into three physical qubits, inject an error (chosen or random), read the syndrome, and correct it.",
      why: "Every real quantum computer today is noisy, and error correction is the entire reason the field believes useful, large-scale quantum computing is possible at all — this lab shows the core majority-vote trick that all more advanced codes (like the surface code) build on.",
      how: "Pick a code type, set the logical bit, either choose which physical qubit to flip or click “🎲 Random error” for a surprise, then click “Detect &amp; correct” to watch the syndrome get read and the error undone.",
      where: "Matches Module 10's “From repetition codes to stabilizers” and “The surface code &amp; logical qubits” — this lab is the repetition code from that first lesson, made interactive.",
      when: "Use it to build intuition before tackling the surface code, which is the same idea scaled up to catch both error types at once."
    },
    "vqe-lab": {
      what: "A 2-parameter variational landscape you can literally see — a color-coded energy heatmap with a marker that steps downhill via real gradient descent.",
      why: "VQE and every other near-term “variational” quantum algorithm (QAOA included) works by having a classical optimizer walk a landscape shaped by measurements from a quantum circuit; this lab isolates and visualizes that classical half of the loop, usually the hardest part to picture.",
      how: "Click “Gradient step” repeatedly to watch the marker descend toward a minimum (blue = lower energy), adjust the learning-rate slider to see how step size changes the path, and “Reset” to start over from the same point.",
      where: "Follows Module 9's “VQE: the variational workhorse” and pairs naturally with “QAOA: quantum optimization” right after it — the in-lesson VQE widget is the 1-parameter version of this same idea.",
      when: "Revisit this whenever a lesson mentions “the optimizer got stuck in a local minimum” — you can literally engineer that situation here by starting from a different point."
    }
  };
  function infoPanel(info) {
    if (!info) return "";
    var order = [["What", info.what], ["Why", info.why], ["How", info.how], ["Where", info.where], ["When", info.when]];
    return '<dl class="info-panel">' + order.map(function (pair) { return "<dt>" + pair[0] + "</dt><dd>" + pair[1] + "</dd>"; }).join("") + "</dl>";
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
    function render() {
      var html = head("Circuit Builder Lab", "Pick a tool, click cells to place gates (CNOT: click control then target in the same column), then run an exact simulation.") + infoPanel(LAB_INFO.circuit);
      html += '<div class="widget"><div class="widget-controls">' +
        TOOLS.map(function (t) { return '<button class="wbtn tsel" data-t="' + t + '" type="button">' + t + "</button>"; }).join("") + "</div>";
      html += '<div class="circuit-grid">';
      for (var r = 0; r < NQ; r++) {
        html += '<div class="circuit-row"><span class="circuit-qlabel">q' + r + ": |0⟩</span>";
        for (var c = 0; c < NS; c++) {
          var g = singleGates[r + "," + c];
          var cnot = cnots.filter(function (x) { return x.col === c && (x.control === r || x.target === r); })[0];
          var label = g || (cnot ? (cnot.control === r ? "●" : "⊕") : "·");
          var cls = "circuit-cell" + (g ? " has-gate" : "") + (cnot ? " has-cnot" : "");
          html += '<button class="' + cls + '" data-r="' + r + '" data-c="' + c + '" type="button">' + label + "</button>";
        }
        html += "</div>";
      }
      html += "</div>";
      html += '<div class="widget-controls"><button class="btn primary" id="circ-run" type="button">▶ Run simulation</button>' +
        '<button class="btn" id="circ-clear" type="button">Clear circuit</button></div>' +
        '<canvas class="widget-canvas" id="circ-canvas" width="700" height="220" aria-label="Bar chart of measurement probabilities for the simulated circuit"></canvas>' +
        '<div class="widget-read" id="circ-read" aria-live="polite">Pick a tool, click cells to place gates, then run.</div></div>';
      QCC.setContent(page(html), "Circuit Builder Lab", { view: "lab" });
      setActive();
      document.querySelectorAll(".tsel").forEach(function (b) { b.onclick = function () { tool = b.dataset.t; if (tool !== "CNOT") pendingControl = null; setActive(); }; });
      document.querySelectorAll(".circuit-cell").forEach(function (b) { b.onclick = function () { cellClick(+b.dataset.r, +b.dataset.c); }; });
      document.getElementById("circ-run").onclick = runSim;
      document.getElementById("circ-clear").onclick = function () { singleGates = {}; cnots = []; pendingControl = null; render(); };
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
      render();
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

  var LAB_RENDER = { circuit: labCircuit, "bloch-sandbox": labBloch, "grover-lab": labGrover, "qft-lab": labQft, "qec-lab": labQec, "vqe-lab": labVqe };

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
