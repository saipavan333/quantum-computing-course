/* runner.js — in-browser runnable Python (playbook §3, §3.1, §5.9).
   Lazy-loads Pyodide once (shared across all Run buttons), injects NumPy and a
   pure-Python quantum simulator `qsim` so learners run REAL quantum code with no
   local setup and no Qiskit (which can't load in Pyodide). Captures stdout, does
   a lightweight auto-grade via a leading `# expect: TEXT` line, and degrades
   gracefully to a friendly message + the code when the runtime can't load. */
(window.QCC_FEATURES = window.QCC_FEATURES || []).push(function (QCC) {
  "use strict";
  var PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

  /* pure-Python quantum simulator injected into every session */
  var QSIM = [
    "import numpy as np",
    "class QuantumCircuit:",
    "    def __init__(self, n):",
    "        self.n=n; self.s=np.zeros(2**n,dtype=complex); self.s[0]=1.0",
    "    def _ax(self,q): return self.n-1-q",
    "    def _apply1(self,U,q):",
    "        s=self.s.reshape([2]*self.n); s=np.moveaxis(s,self._ax(q),0)",
    "        sh=s.shape; s=(U@s.reshape(2,-1)).reshape((2,)+sh[1:])",
    "        self.s=np.moveaxis(s,0,self._ax(q)).reshape(2**self.n)",
    "    def _apply2(self,U,c,t):",
    "        s=self.s.reshape([2]*self.n); s=np.moveaxis(s,[self._ax(c),self._ax(t)],[0,1])",
    "        sh=s.shape; s=(U@s.reshape(4,-1)).reshape((2,2)+sh[2:])",
    "        self.s=np.moveaxis(s,[0,1],[self._ax(c),self._ax(t)]).reshape(2**self.n)",
    "    def _apply3(self,U,a,b,c):",
    "        s=self.s.reshape([2]*self.n); s=np.moveaxis(s,[self._ax(a),self._ax(b),self._ax(c)],[0,1,2])",
    "        sh=s.shape; s=(U@s.reshape(8,-1)).reshape((2,2,2)+sh[3:])",
    "        self.s=np.moveaxis(s,[0,1,2],[self._ax(a),self._ax(b),self._ax(c)]).reshape(2**self.n)",
    "    def h(self,q): self._apply1(np.array([[1,1],[1,-1]])/np.sqrt(2),q); return self",
    "    def x(self,q): self._apply1(np.array([[0,1],[1,0]],complex),q); return self",
    "    def y(self,q): self._apply1(np.array([[0,-1j],[1j,0]]),q); return self",
    "    def z(self,q): self._apply1(np.array([[1,0],[0,-1]],complex),q); return self",
    "    def s_gate(self,q): self._apply1(np.array([[1,0],[0,1j]]),q); return self",
    "    def t(self,q): self._apply1(np.array([[1,0],[0,np.exp(1j*np.pi/4)]]),q); return self",
    "    def rx(self,th,q):",
    "        c,s=np.cos(th/2),np.sin(th/2); self._apply1(np.array([[c,-1j*s],[-1j*s,c]]),q); return self",
    "    def ry(self,th,q):",
    "        c,s=np.cos(th/2),np.sin(th/2); self._apply1(np.array([[c,-s],[s,c]],complex),q); return self",
    "    def rz(self,th,q): self._apply1(np.array([[np.exp(-1j*th/2),0],[0,np.exp(1j*th/2)]]),q); return self",
    "    def cx(self,c,t): self._apply2(np.array([[1,0,0,0],[0,1,0,0],[0,0,0,1],[0,0,1,0]],complex),c,t); return self",
    "    def cz(self,c,t): self._apply2(np.diag([1,1,1,-1]).astype(complex),c,t); return self",
    "    def ccx(self,a,b,c): U=np.eye(8,dtype=complex); U[[6,7]]=U[[7,6]]; self._apply3(U,a,b,c); return self",
    "    def ccz(self,a,b,c): self._apply3(np.diag([1,1,1,1,1,1,1,-1]).astype(complex),a,b,c); return self",
    "    def toffoli(self,a,b,c): return self.ccx(a,b,c)",
    "    def cp(self,th,c,t): self._apply2(np.diag([1,1,1,np.exp(1j*th)]).astype(complex),c,t); return self",
    "    def cphase(self,th,c,t): return self.cp(th,c,t)",
    "    def crz(self,th,c,t): self._apply2(np.diag([1,1,np.exp(-1j*th/2),np.exp(1j*th/2)]).astype(complex),c,t); return self",
    "    def swap(self,a,b): self.cx(a,b); self.cx(b,a); self.cx(a,b); return self",
    "    def statevector(self): return self.s.copy()",
    "    def probabilities(self):",
    "        p=np.abs(self.s)**2",
    "        return {format(i,'0'+str(self.n)+'b'):round(float(p[i]),6) for i in range(2**self.n) if p[i]>1e-12}",
    "    def sample(self,shots=1024,seed=None):",
    "        rng=np.random.default_rng(seed); p=np.abs(self.s)**2; p=p/p.sum()",
    "        d=rng.choice(2**self.n,size=shots,p=p); out={}",
    "        for x in d:",
    "            k=format(x,'0'+str(self.n)+'b'); out[k]=out.get(k,0)+1",
    "        return dict(sorted(out.items()))",
    "print  # keep",
    ""
  ].join("\n");

  var pyReady = null;   // shared promise
  function loadPyodide() {
    if (pyReady) return pyReady;
    pyReady = new Promise(function (resolve, reject) {
      if (location.protocol === "file:") { reject(new Error("file")); return; }
      var s = document.createElement("script");
      s.src = PYODIDE_URL + "pyodide.js";
      s.onload = function () {
        window.loadPyodide({ indexURL: PYODIDE_URL }).then(function (py) {
          return py.loadPackage("numpy").then(function () { py.runPython(QSIM); return py; });
        }).then(resolve).catch(reject);
      };
      s.onerror = function () { reject(new Error("network")); };
      document.head.appendChild(s);
    });
    return pyReady;
  }

  function run(block) {
    var edit = block.querySelector(".run-edit");
    var code = edit ? edit.value : decodeURIComponent(block.getAttribute("data-code") || "");
    var out = block.querySelector(".run-out");
    var btn = block.querySelector(".run-btn");
    // auto-grade: leading "# expect: TEXT"
    var expect = null;
    code = code.replace(/^#\s*expect:\s*(.+)\n/, function (_, t) { expect = t.trim(); return ""; });
    out.hidden = false; out.className = "run-out"; out.textContent = "Loading Python runtime (first run only)…";
    btn.disabled = true; btn.textContent = "…";
    loadPyodide().then(function (py) {
      var buf = [];
      py.setStdout({ batched: function (s) { buf.push(s); } });
      py.setStderr({ batched: function (s) { buf.push(s); } });
      try {
        py.runPython(code);
        var text = buf.join("\n").replace(/\n{3,}/g, "\n\n").trim() || "(no output)";
        if (expect != null) {
          var ok = text.indexOf(expect) >= 0;
          out.innerHTML = QCC.escapeHtml(text) + '\n\n<span class="' + (ok ? "ok" : "fail") + '">' +
            (ok ? "✓ expected output found" : "✗ expected to contain: " + QCC.escapeHtml(expect)) + "</span>";
        } else out.textContent = text;
      } catch (e) {
        out.className = "run-out err"; out.textContent = String(e.message || e);
      }
      btn.disabled = false; btn.textContent = "▶ Run";
    }).catch(function (err) {
      out.className = "run-out err";
      out.textContent = err && err.message === "file"
        ? "In-browser Python is disabled when opening from a local file (file://). Host the course (see DEPLOY.md) or copy this code into your own Python — every example is verified to run."
        : "Couldn't load the Python runtime (it downloads once and needs an internet connection). You appear to be offline. Copy this code into your local Python — every example is verified to run.";
      btn.disabled = false; btn.textContent = "▶ Run";
    });
  }

  /* turn every runnable block into an editable cell (edit the code, then Run) */
  QCC.onRender(function (root) {
    var blocks = (root && root.querySelectorAll) ? root.querySelectorAll(".run-block") : [];
    Array.prototype.forEach.call(blocks, function (block) {
      if (block.dataset.enhanced) return; block.dataset.enhanced = "1";
      var pre = block.querySelector("pre");
      var code = decodeURIComponent(block.getAttribute("data-code") || "");
      var ta = document.createElement("textarea");
      ta.className = "run-edit"; ta.spellcheck = false; ta.value = code;
      ta.setAttribute("aria-label", "Editable Python code — change it, then press Run");
      ta.rows = Math.min(28, Math.max(4, code.split("\n").length));
      ta.addEventListener("keydown", function (e) {
        if (e.key === "Tab") {
          e.preventDefault();
          var s = ta.selectionStart, en = ta.selectionEnd;
          ta.value = ta.value.slice(0, s) + "    " + ta.value.slice(en);
          ta.selectionStart = ta.selectionEnd = s + 4;
        }
      });
      if (pre) pre.replaceWith(ta); else block.insertBefore(ta, block.firstChild);
      var hint = block.querySelector(".run-hint"); if (hint) hint.textContent = "editable · runs in your browser";
    });
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".run-btn");
    if (btn) { e.preventDefault(); run(btn.closest(".run-block")); }
  });
});
