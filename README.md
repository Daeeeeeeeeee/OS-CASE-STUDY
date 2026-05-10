# ⚙️ CPU Scheduling Simulator
### OS Case Study · Process Management

> An interactive, browser-based CPU Scheduling Simulator that visualizes seven scheduling algorithms with real-time Gantt charts and performance metrics.

---

## 📹 Video Demonstration

> 🔗 **[Watch the Demo Video](#)**
> *(Replace this link with your actual video URL — YouTube, Google Drive, etc.)*

---

## 📁 Repository Contents

| File | Description |
|------|-------------|
| `cpu_scheduling.html` | Main application — open this in any browser to run |
| `style.css` | All UI styles and theming |
| `script.js` | All scheduling algorithm logic and rendering |
| `run.bat` | **Windows launcher** — double-click to open the app |
| `run.sh` | **macOS / Linux launcher** — run in terminal to open the app |
| `README.md` | This file |

---

## 🚀 How to Run the Program

The simulator is a **pure web application** — no installation, no server, no internet connection required after downloading.

---

### ✅ Option 1 — Windows (Easiest)

1. Download or clone this repository
2. **Double-click `run.bat`**
3. The simulator opens automatically in your default browser

---

### ✅ Option 2 — macOS / Linux

1. Download or clone this repository
2. Open a terminal in the project folder
3. Make the script executable (first time only):
   ```bash
   chmod +x run.sh
   ```
4. Run it:
   ```bash
   ./run.sh
   ```
5. The simulator opens automatically in your default browser

---

### ✅ Option 3 — Any OS (Manual)

1. Download or clone this repository
2. Open your browser (Chrome, Firefox, Edge, Safari — any modern browser)
3. Press **Ctrl + O** (or **Cmd + O** on Mac) → **File → Open**
4. Navigate to the project folder and open **`cpu_scheduling.html`**

---

### ✅ Option 4 — Clone via Git

```bash
git clone https://github.com/Daeeeeeeeeee/OS-CASE-STUDY.git
cd OS-CASE-STUDY

# Windows
run.bat

# macOS / Linux
chmod +x run.sh && ./run.sh
```

---

## 🧠 Algorithms Implemented

| Algorithm | Type | Key Characteristic |
|-----------|------|--------------------|
| **FCFS** — First-Come, First-Served | Non-Preemptive | Processes run in arrival order |
| **SJF** — Shortest Job First | Non-Preemptive | Shortest burst runs first |
| **SRT** — Shortest Remaining Time | Preemptive | Preempts if shorter job arrives |
| **RR** — Round Robin | Preemptive | Fixed time quantum, cyclic |
| **Priority (NP)** — Priority Scheduling | Non-Preemptive | Highest priority runs first |
| **Priority (P)** — Priority Scheduling | Preemptive | Preempts on higher priority arrival |
| **Priority + RR** — Priority with Round Robin | Preemptive | Priority tiers + RR within each tier |

---

## 🖥️ How to Use the Simulator

1. **Select an algorithm** from the left sidebar
2. **Configure processes** — set Burst Time, Arrival Time, and Priority (if applicable)
3. Set the **Time Quantum** for Round Robin algorithms
4. Click **▶ Run Simulation**
5. View the **Gantt Chart** (execution timeline) and **Results Table** (WT, TAT, CT)

---

## 📊 Output Metrics

| Metric | Formula |
|--------|---------|
| **Completion Time (CT)** | Time when process finishes execution |
| **Turnaround Time (TAT)** | CT − Arrival Time |
| **Waiting Time (WT)** | TAT − Burst Time |

---

## 🛠️ Technical Details

- **Language:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Dependencies:** None — no frameworks, no npm, no build step
- **Browser Support:** Chrome, Firefox, Edge, Safari (any modern browser)
- **Internet Required:** Only for Google Fonts (cosmetic only — works offline too)

---

## 📄 License

This project was created as an academic case study for an Operating Systems course.
