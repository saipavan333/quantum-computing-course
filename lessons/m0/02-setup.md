# Set up your lab: Python, VS Code, Jupyter & Qiskit

Professionals are distinguished less by what they know than by having a working environment they trust. Today you build yours: Python, an editor, notebooks, the Qiskit quantum SDK, and a free account that gives you real quantum-hardware time. Everything here is free. Budget 45 minutes; if something breaks, the Gotchas section is your friend — environment problems are the #1 reason beginners quit, and they are always fixable.

You do **not** need to understand the code you'll type today. This lesson is pure plumbing; understanding starts in Module 1.

@@diagram:setup-flow|The five installs, in dependency order. Green boxes are checkpoints — don't pass one until it works.

## 1. Install Python 3.12

Python is the language of quantum software (Module 4 teaches it from zero). Qiskit 2.x requires Python 3.10 or newer; install **3.12** — new enough for everything, old enough that every library supports it.

**Windows** (your platform, if you're following on the machine this course lives on):

1. Go to `python.org/downloads` → download Python 3.12.x (64-bit installer).
2. Run it. On the FIRST screen, check **"Add python.exe to PATH"** — missing this causes 90% of Windows Python misery.
3. Click *Install Now*.

**macOS**: download the 3.12 installer from python.org (or `brew install python@3.12`).
**Linux**: `sudo apt install python3.12 python3.12-venv python3-pip` (Ubuntu/Debian).

**Checkpoint 1** — open a terminal (Windows: press Win, type `powershell`, Enter) and run:

```bash
python --version
```

You must see `Python 3.12.x`. On macOS/Linux you may need `python3 --version`.

## 2. Install VS Code

Visual Studio Code is the editor most quantum teams use (IBM's own tutorials assume it).

1. Download from `code.visualstudio.com`, install with defaults.
2. Open it → Extensions panel (square icon, left bar) → install **Python** (by Microsoft) and **Jupyter** (by Microsoft).

That's it for now. VS Code becomes your home in Module 4.

## 3. Create your course environment

A **virtual environment** is a private, disposable copy of Python for one project, so this course's libraries never fight with anything else on your machine. Every professional Python project uses one; you might as well start with the professional habit.

In your terminal:

```bash
# make a folder for all course work, then enter it
mkdir quantum-work
cd quantum-work

# create a virtual environment named .venv
python -m venv .venv
```

Activate it — this you'll do **every time** you open a new terminal to work:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

Your prompt now shows `(.venv)` at the left. That prefix means "pip installs go into this project, not into my system."

> **Windows-only trap:** if activation fails with a red "running scripts is disabled" error, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once, answer `Y`, and retry. This lets PowerShell run local scripts like the activator.

## 4. Install Qiskit and friends

With `(.venv)` showing:

```bash
pip install "qiskit[visualization]" qiskit-aer qiskit-ibm-runtime jupyter numpy matplotlib
```

What each piece is (you'll meet them all properly later):

| Package | What it is | Used from |
|---|---|---|
| `qiskit` | The SDK: circuits, gates, transpiler | Module 7 onward |
| `[visualization]` extra | Circuit drawings, histograms, Bloch spheres | Module 5 onward |
| `qiskit-aer` | High-performance simulators (run circuits on *your* CPU) | Module 7 |
| `qiskit-ibm-runtime` | The client that talks to real IBM quantum computers | Module 7 |
| `jupyter` | Notebooks: code + notes + plots in one document | Module 4 onward |
| `numpy` | Fast arrays and matrices — your math-checking engine | Module 4 onward |
| `matplotlib` | Plotting | Module 4 onward |

**Checkpoint 2**:

```bash
python -c "import qiskit; print(qiskit.__version__)"
```

Expect `2.x.y` (2.4 or newer as of mid-2026). Any `2.x` is fine for this course. If you see `1.x`, your pip cached something ancient: run `pip install --upgrade qiskit`.

## 5. First launch of Jupyter

```bash
jupyter notebook
```

A browser tab opens showing your folder. New → Notebook → Python 3. In the first cell type `2 + 2`, press **Shift+Enter**. If `4` appears, notebooks work. Close the tab and press Ctrl+C twice in the terminal to stop the server. (From Module 4 you'll usually open notebooks inside VS Code instead — same engine, nicer editor.)

## 6. Your IBM Quantum account (free real-hardware access)

IBM's **Open Plan** is free and includes **10 minutes of real QPU time every 28 days** on 156-qubit Heron-class processors — enough for every hardware experiment in this course, because you'll do all development on simulators and spend QPU seconds only on final runs (exactly how professionals budget it).

1. Go to `quantum.cloud.ibm.com` and create a free account (no card required).
2. Once signed in, locate your **API token** (account/profile menu).
3. Save it onto your machine so code can authenticate. In a terminal with `(.venv)` active, run `python`, then:

```python
from qiskit_ibm_runtime import QiskitRuntimeService

QiskitRuntimeService.save_account(
    channel="ibm_quantum_platform",
    token="PASTE_YOUR_TOKEN_HERE",
    set_as_default=True,
)
exit()
```

**Checkpoint 3** — prove the connection works:

```python
from qiskit_ibm_runtime import QiskitRuntimeService

service = QiskitRuntimeService()
for backend in service.backends():
    print(backend.name, "-", backend.num_qubits, "qubits")
```

You should see real machine names like `ibm_kingston` or `ibm_torino` with 100+ qubits. Those are actual quantum processors, colder than deep space, and your account can now submit jobs to them. Let that land for a second.

> **Security habit from day 1:** your token is a password. Never paste it into code you'll share or commit to GitHub — `save_account` exists precisely so the token lives in a local config file instead of your scripts.

## 7. The smoke test — one real quantum-ish computation

Type this into a notebook cell (again: understanding comes later; today verifies plumbing):

```python
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

qc = QuantumCircuit(1)      # one qubit
qc.h(0)                     # Hadamard gate: create superposition
state = Statevector(qc)     # exact simulation on your CPU
print(state.probabilities_dict())
```

Expected output:

```text
{'0': 0.4999999999999999, '1': 0.4999999999999999}
```

You just created an equal superposition and computed that measuring it yields 0 or 1 with 50% probability each. By Module 5 you'll derive those numbers by hand; by Module 7 you'll run this on `ibm_kingston` and see real-world imperfection in the results.

## Worked example — a clean session, end to end

This is what starting a study session looks like from now on (60 seconds of ritual):

```bash
cd quantum-work                     # 1. go to your course folder
.venv\Scripts\Activate.ps1          # 2. activate (see the (.venv) prefix)
jupyter notebook                    # 3. launch notebooks (or open VS Code)
```

And ending one: save the notebook, Ctrl+C in the terminal. When lesson code later says "in your environment", it means *this* state: folder + activated venv. Students who skip activation get `ModuleNotFoundError: No module named 'qiskit'`, conclude "it's broken", and lose an evening. The `(.venv)` prefix is your dashboard light — glance at it.

## Gotchas

- **`python` not recognized (Windows):** you skipped "Add to PATH". Re-run the installer → Modify → check the PATH box. Fastest fix, no shame.
- **`ModuleNotFoundError: qiskit`:** almost always an inactive venv (no `(.venv)` in prompt) or VS Code pointed at the wrong interpreter — in VS Code: Ctrl+Shift+P → "Python: Select Interpreter" → pick `.venv`.
- **PowerShell "scripts disabled" red text:** run the `Set-ExecutionPolicy` command from Section 3. One-time fix.
- **Qiskit installs as 1.x:** old pip resolution. `pip install --upgrade pip` then `pip install --upgrade qiskit`. This course's code assumes 2.x and *will not run* on 1.x (the 1→2 transition removed old APIs).
- **Two Pythons fighting (common on macOS):** `python` vs `python3`, system vs brew. Inside an activated venv the ambiguity disappears — one more reason venvs are non-negotiable.
- **Corporate/school networks blocking `quantum.cloud.ibm.com`:** save the account setup for home wifi; everything except Section 6–7's connection test works offline.

## Scenario — the Tuesday-night rescue

Sam sets everything up Monday, works happily, then Tuesday opens VS Code and every cell throws `ModuleNotFoundError: No module named 'qiskit'`. Panic: "it uninstalled itself?" Diagnosis, in professional order: (1) terminal shows no `(.venv)` prefix — but Sam is running notebook cells, not terminal commands, so (2) check VS Code's interpreter in the status bar: it says `Python 3.12 (global)`. There it is. VS Code reopened to a new window and silently picked the system Python, which has no Qiskit. Fix: Ctrl+Shift+P → *Python: Select Interpreter* → choose `.venv\Scripts\python.exe`. Cells run. Total time with a method: 3 minutes. Total time flailing without one: an evening. The lesson generalizes: **environment errors are boring and mechanical — check which Python is running before assuming anything is broken.**

## Key points

- Stack: Python 3.12 + VS Code + a `.venv` virtual environment + `qiskit` 2.x + `qiskit-aer` + `qiskit-ibm-runtime` + Jupyter. All free.
- Activate the venv every session; the `(.venv)` prompt prefix is your confirmation. Most "broken installs" are inactive venvs or a wrong interpreter selection.
- Qiskit 2.x is required — 1.x code and tutorials you find online may use removed APIs (a theme you'll revisit in Module 7).
- IBM's free Open Plan gives 10 minutes of real 156-qubit QPU time per 28 days; develop on simulators, spend hardware seconds like money.
- Your API token is a credential: store via `save_account`, never in shareable code.
- The three checkpoints (Python version, Qiskit import, backend list) prove your lab works end to end.

## Check yourself

```quiz
{"q":"Your notebook throws ModuleNotFoundError for qiskit, but pip said it installed successfully yesterday. Most likely cause?","options":["Qiskit uninstalls itself after 24 hours","The notebook/editor is using a different Python than the venv where qiskit was installed","Your IBM token expired","Jupyter can't run quantum code without internet"],"answer":1,"why":"Installs land in one environment; errors come from running a different one. Check the (.venv) prefix and the editor's selected interpreter first — it's the cause in the vast majority of cases."}
```

```quiz
{"q":"Why do professionals develop on simulators and reserve real QPU time for final runs?","options":["Simulators are more accurate than real hardware","Real-hardware access is metered (e.g., 10 free minutes per 28 days) while simulators are unlimited local compute — and debugging on the QPU wastes the scarce resource","IBM forbids running experiments on hardware","Simulators support more qubits than any real device"],"answer":1,"why":"QPU minutes are the scarce, budgeted resource; simulators cost nothing and catch your bugs. (They're LESS accurate than hardware in one sense — no noise — which is exactly why they're good for logic-debugging.)"}
```

## Exercises

**Exercise 1 — break it, then fix it.** Open a *fresh* terminal, do NOT activate the venv, and run `python -c "import qiskit"`. Read the error carefully. Now activate the venv and rerun. Write one sentence explaining what changed.

````solution
Without activation you ran the *system* Python, which has no qiskit installed, producing `ModuleNotFoundError: No module named 'qiskit'`. After `.venv\Scripts\Activate.ps1` (or `source .venv/bin/activate`), the `python` command resolves to the venv's interpreter, whose `site-packages` contains qiskit — so the import succeeds.

The sentence you should be able to say: **"The error wasn't about qiskit being broken; it was about *which Python* was answering."** You've now seen, on purpose and calmly, the exact failure you'll otherwise meet by accident at a worse time. This deliberate break-and-fix technique is worth applying to every tool you ever adopt.
````

**Exercise 2 — inventory your machines.** Run the Checkpoint-3 backend listing. For each backend printed, note its name and qubit count. Then answer: which one would you pick for a 2-qubit experiment, and why is "the biggest one" not automatically the right answer?

````solution
Typical output includes machines like `ibm_kingston` (156 qubits, Heron r2) and others in the 127–156 range. For a 2-qubit experiment, any of them works — what matters is not size but **queue time and error rates**: a 2-qubit circuit uses 2 qubits whether the chip has 127 or 156.

"Biggest" isn't automatically best because (a) your job may wait longer in a popular machine's queue, and (b) what affects your result is the error rate of the *specific qubits and gates you use*, not the total count. In Module 7 you'll learn to read per-qubit calibration data and let the transpiler pick the best physical qubits. The professional instinct being planted: **choose hardware by the metrics that affect your job, not by the headline number.**
````

## Practice questions

1. What does the `(.venv)` prefix in your prompt actually tell you, mechanically?
2. Why does this course require Qiskit 2.x rather than accepting 1.x?
3. List the three checkpoints of this lesson and what failure at each one would indicate.
4. What is the free Open Plan's QPU allowance, and how does that shape a professional workflow?
5. Your friend pastes their API token directly into a notebook they then upload to GitHub. Explain the problem and the correct pattern.
6. In VS Code, cells use the wrong Python. Give the exact command-palette action that fixes it.
7. **Design question:** sketch a "new machine setup" checklist (ordered steps + verification for each) that would take you from a blank Windows laptop to passing all three checkpoints in under 30 minutes.

````solution
1. The shell's `python`/`pip` now resolve to this project's private interpreter and package folder — installs and imports are scoped to the project.
2. The 1→2 major-version transition removed legacy APIs (e.g., old execution paths); course code written for 2.x errors on 1.x, and 1.x-era tutorials are precisely the outdated material this course replaces.
3. `python --version` (Python installed & on PATH) → `import qiskit; print(version)` (packages installed into the active env) → `service.backends()` listing (account saved, network path to IBM works). Each isolates one layer: interpreter, environment, credentials/network.
4. 10 minutes of QPU time per 28 days: develop and debug on free local simulators, batch hardware runs, and treat QPU seconds as a budget line — mirroring how paid plans are managed in industry.
5. The token is a credential granting use of their account/allowance; public exposure invites abuse. Correct pattern: `QiskitRuntimeService.save_account(...)` once per machine (token lands in local config), code then constructs `QiskitRuntimeService()` with no secrets inline; leaked tokens should be regenerated.
6. Ctrl+Shift+P → "Python: Select Interpreter" → choose the project's `.venv` interpreter.
7. Strong answers order by dependency and verify each layer, e.g.: (1) install Python 3.12 + PATH box → `python --version`; (2) install VS Code + Python/Jupyter extensions → extensions listed; (3) `mkdir quantum-work; python -m venv .venv; activate` → `(.venv)` prefix; (4) `pip install qiskit[...] etc.` → import-version check; (5) Jupyter smoke test → `2+2`; (6) IBM account + `save_account` → backend list. Bonus points for including the PowerShell execution-policy fix and "Select Interpreter" as pre-listed remedies — a checklist that anticipates the two most common failures is a professional's checklist.
````
