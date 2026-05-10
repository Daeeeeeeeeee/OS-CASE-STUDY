/* =========================================================
   CPU Scheduling Simulator — JavaScript
   ========================================================= */

// ─────────── State ───────────
let processes = [];
let selectedAlgo = 'FCFS';
let priorityDir = 'lower'; // 'lower' = lower number means higher priority

/**
 * Reassign every process ID so they are always P1, P2, P3 …
 * in their current order. Called after any add or delete.
 */
function resequencePIDs() {
  processes.forEach((p, i) => { p.id = 'P' + (i + 1); });
}

const COLORS = [
  '#00e5ff', '#ff4081', '#69ff47', '#ffab40', '#ea80fc',
  '#40c4ff', '#ff6e40', '#b2ff59', '#f06292', '#4dd0e1',
  '#aed581', '#ffd54f', '#4fc3f7', '#ce93d8', '#80cbc4'
];

// ─────────── Algorithm Selector ───────────

/**
 * Attach click listeners to all algorithm option tiles.
 * Highlights the selected tile and updates dependent UI.
 */
document.querySelectorAll('.algo-option').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.algo-option').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    selectedAlgo = el.dataset.algo;
    updateUI();
  });
});

/**
 * Attach click listeners to priority direction toggle buttons.
 */
document.querySelectorAll('.toggle-opt').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.toggle-opt').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    priorityDir = el.dataset.dir;
  });
});

/** Sync the topbar chip to the currently selected algorithm name. */
function updateTopbar() {
  const el = document.getElementById('topbarAlgo');
  if (el) el.textContent = algoName();
}

/**
 * Show/hide Time Quantum, Priority Direction, and Priority column
 * based on the currently selected scheduling algorithm.
 */
function updateUI() {
  const needRR  = ['RR', 'PRIORITY_RR'].includes(selectedAlgo);
  const needPri = ['PRIORITY', 'PRIORITY_P', 'PRIORITY_RR'].includes(selectedAlgo);

  document.getElementById('quantumRow').style.display     = needRR  ? '' : 'none';
  document.getElementById('priorityDirRow').style.display = needPri ? '' : 'none';
  document.getElementById('priorityHeader').style.display = needPri ? '' : 'none';

  updateTopbar();

  // Show or hide the priority input column in each table row
  document.querySelectorAll('.priority-cell').forEach(c => {
    c.style.display = needPri ? '' : 'none';
  });
}

// ─────────── Process CRUD ───────────

/** Add a new process row, resequence all PIDs, and re-render the table. */
function addProcess() {
  processes.push({ id: '', at: 0, bt: 1, pri: 1 });
  resequencePIDs();
  renderTable();
}

/** Remove the process at the given index, resequence all PIDs, and re-render. */
function removeProcess(idx) {
  processes.splice(idx, 1);
  resequencePIDs();
  renderTable();
}

/**
 * Re-render the editable process input table from the current
 * `processes` array. Priority column visibility follows selectedAlgo.
 */
function renderTable() {
  const needPri = ['PRIORITY', 'PRIORITY_P', 'PRIORITY_RR'].includes(selectedAlgo);
  const tbody = document.getElementById('processBody');
  tbody.innerHTML = '';

  processes.forEach((p, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" value="${p.id}" readonly style="width:55px; opacity:0.7; cursor:default;"></td>
      <td><input type="number" value="${p.bt}" min="1"
            onchange="processes[${i}].bt=+this.value"
            onblur="if(this.value===''||isNaN(+this.value)||+this.value<1){this.value=1;processes[${i}].bt=1;}"></td>
      <td><input type="number" value="${p.at}" min="0"
            onchange="processes[${i}].at=+this.value"
            onblur="if(this.value===''||isNaN(+this.value)){this.value=0;processes[${i}].at=0;}"></td>
      <td class="priority-cell" style="display:${needPri ? '' : 'none'}">
        <input type="number" value="${p.pri}" min="1" style="width:55px"
            onchange="processes[${i}].pri=+this.value"
            onblur="if(this.value===''||isNaN(+this.value)||+this.value<1){this.value=1;processes[${i}].pri=1;}">
      </td>
      <td><button class="del-btn" onclick="removeProcess(${i})">✕</button></td>
    `;
    tbody.appendChild(row);
  });
}

/** Clear all processes and hide the output section. */
function resetAll() {
  processes = [];
  document.getElementById('output-section').classList.remove('visible');
  renderTable();
}

/**
 * Populate the table with three sample processes on first load
 * so the user can immediately try the simulator.
 */
function initDefault() {
  processes = [
    { id: 'P1', at: 0, bt: 5, pri: 2 },
    { id: 'P2', at: 2, bt: 3, pri: 1 },
    { id: 'P3', at: 4, bt: 4, pri: 3 },
  ];
  renderTable();
}

initDefault();

// ─────────── Validation ───────────

/** Display or clear an inline error message below the process table. */
function showError(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}

/**
 * Read the current DOM values into `processes`, auto-filling any blank
 * or invalid fields with their safe defaults, then validate:
 *  - at least 3 processes
 *  - time quantum ≥ 1 (when applicable)
 * Returns true if all checks pass.
 */
function validate() {
  const rows = document.getElementById('processBody').querySelectorAll('tr');

  // Sync DOM → state, coercing blanks to safe defaults
  processes = Array.from(rows).map((row, i) => {
    const inputs = row.querySelectorAll('input');

    // Burst time is now inputs[1], Arrival time is inputs[2]
    let bt = parseFloat(inputs[1].value);
    if (inputs[1].value === '' || isNaN(bt) || bt < 1) { bt = 1; inputs[1].value = 1; }

    // Arrival time: blank or negative → 0
    let at = parseFloat(inputs[2].value);
    if (inputs[2].value === '' || isNaN(at) || at < 0) { at = 0; inputs[2].value = 0; }

    // Priority: blank or < 1 → 1
    let pri = inputs[3] ? parseFloat(inputs[3].value) : 1;
    if (inputs[3] && (inputs[3].value === '' || isNaN(pri) || pri < 1)) { pri = 1; inputs[3].value = 1; }

    return { id: inputs[0].value.trim() || `P${i + 1}`, at, bt, pri };
  });

  if (processes.length < 3) {
    showError('❌ Minimum 3 processes required.');
    return false;
  }

  // Auto-fix quantum if blank
  const needRR = ['RR', 'PRIORITY_RR'].includes(selectedAlgo);
  if (needRR) {
    const qEl = document.getElementById('quantum');
    if (qEl.value === '' || +qEl.value < 1) qEl.value = 2;
  }

  showError('');
  return true;
}

// ─────────── Scheduling Algorithms ───────────

/**
 * Returns the effective priority value for a process.
 * When priorityDir === 'lower', a smaller number = higher priority (returned as-is).
 * When priorityDir === 'higher', a larger number = higher priority (negated so sort works).
 */
function priorityVal(p) {
  return priorityDir === 'lower' ? p.pri : -p.pri;
}

// ── Helper: merge or push a Gantt segment ──
function pushSeg(timeline, pid, s, e) {
  if (e <= s) return;
  if (timeline.length && timeline[timeline.length - 1].pid === pid)
    timeline[timeline.length - 1].end = e;
  else
    timeline.push({ pid, start: s, end: e });
}

/**
 * FCFS — First-Come, First-Served (Non-preemptive)
 * Processes are sorted by arrival time and executed in order.
 * Returns an array of { pid, start, end } segments.
 */
function fcfs(procs) {
  const sorted = [...procs].sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  const timeline = [];
  let t = 0;

  for (const p of sorted) {
    if (t < p.at) { timeline.push({ pid: 'IDLE', start: t, end: p.at }); t = p.at; }
    timeline.push({ pid: p.id, start: t, end: t + p.bt });
    t += p.bt;
  }
  return timeline;
}

/**
 * SJF — Shortest Job First (Non-preemptive)
 * At each scheduling point, pick the ready process with the shortest burst time.
 * Returns an array of { pid, start, end } segments.
 */
function sjf(procs) {
  const queue   = procs.map(p => ({ ...p })).sort((a, b) => a.at - b.at);
  const ready   = [];
  const timeline = [];
  let t = 0, done = 0, n = queue.length;

  while (done < n) {
    // Move all processes that have arrived by time t into the ready queue
    while (queue.length && queue[0].at <= t) ready.push(queue.shift());

    if (!ready.length) {
      // CPU idle until next process arrives
      const next = queue[0].at;
      timeline.push({ pid: 'IDLE', start: t, end: next });
      t = next;
      continue;
    }

    // Select the process with the shortest burst time
    ready.sort((a, b) => a.bt - b.bt || a.at - b.at);
    const p = ready.shift();
    timeline.push({ pid: p.id, start: t, end: t + p.bt });
    t += p.bt;
    done++;
  }
  return timeline;
}

/**
 * SRT — Shortest Remaining Time (Preemptive SJF)
 * Always runs the ready process with the least remaining burst.
 * Preempts when a newly arriving process has a shorter remaining time.
 * Returns an array of { pid, start, end } segments (merged consecutive).
 */
function srt(procs) {
  const queue   = procs.map(p => ({ ...p, rem: p.bt })).sort((a, b) => a.at - b.at);
  const ready   = [];
  const timeline = [];
  let t = 0, done = 0, n = procs.length;

  while (done < n || ready.length) {
    // Admit newly arrived processes
    while (queue.length && queue[0].at <= t) ready.push(queue.shift());

    if (!ready.length) {
      if (queue.length) { pushSeg(timeline, 'IDLE', t, queue[0].at); t = queue[0].at; }
      else break;
      continue;
    }

    // Pick process with smallest remaining time
    ready.sort((a, b) => a.rem - b.rem);
    const p = ready[0];

    // Run until: process finishes OR next process arrives (whichever is sooner)
    let nextEvent = t + p.rem;
    if (queue.length) nextEvent = Math.min(nextEvent, queue[0].at);

    pushSeg(timeline, p.id, t, nextEvent);
    p.rem -= (nextEvent - t);
    t = nextEvent;

    if (p.rem <= 0) { ready.shift(); done++; }
  }
  return timeline;
}

/**
 * Round Robin (Preemptive)
 * Each process gets a fixed time slice (quantum q).
 * Processes that aren't finished are re-queued at the back.
 * Returns an array of { pid, start, end } segments (merged consecutive).
 */
function roundRobin(procs, q) {
  const arr      = procs.map(p => ({ ...p, rem: p.bt })).sort((a, b) => a.at - b.at);
  const timeline = [];
  const ready    = [];
  const incoming = [...arr];
  const arrived  = new Set();
  let t = 0, done = 0, n = arr.length;

  while (done < n) {
    // Admit newly arrived processes
    incoming
      .filter(p => p.at <= t && !arrived.has(p.id))
      .forEach(p => { arrived.add(p.id); ready.push(p); });

    if (!ready.length) {
      const next = incoming.find(p => !arrived.has(p.id));
      if (!next) break;
      pushSeg(timeline, 'IDLE', t, next.at);
      t = next.at;
      continue;
    }

    const p   = ready.shift();
    const run = Math.min(q, p.rem);
    pushSeg(timeline, p.id, t, t + run);
    t      += run;
    p.rem  -= run;

    // Admit any processes that arrived during this quantum
    incoming
      .filter(pp => pp.at <= t && !arrived.has(pp.id))
      .forEach(pp => { arrived.add(pp.id); ready.push(pp); });

    if (p.rem > 0) ready.push(p); // re-queue unfinished process
    else done++;
  }
  return timeline;
}

/**
 * Priority Scheduling (Non-preemptive)
 * At each scheduling point, pick the ready process with the best priority.
 * Returns an array of { pid, start, end } segments.
 */
function priorityNP(procs) {
  const queue    = procs.map(p => ({ ...p })).sort((a, b) => a.at - b.at);
  const ready    = [];
  const timeline = [];
  let t = 0, done = 0, n = queue.length;

  while (done < n) {
    while (queue.length && queue[0].at <= t) ready.push(queue.shift());

    if (!ready.length) {
      const nx = queue[0].at;
      timeline.push({ pid: 'IDLE', start: t, end: nx });
      t = nx;
      continue;
    }

    // Sort by priority (ties broken by arrival time)
    ready.sort((a, b) => priorityVal(a) - priorityVal(b) || (a.at - b.at));
    const p = ready.shift();
    timeline.push({ pid: p.id, start: t, end: t + p.bt });
    t += p.bt;
    done++;
  }
  return timeline;
}

/**
 * Priority Scheduling (Preemptive)
 * Always runs the ready process with the best priority.
 * Preempts the running process when a higher-priority process arrives.
 * Returns an array of { pid, start, end } segments (merged consecutive).
 */
function priorityPreemptive(procs) {
  const queue    = procs.map(p => ({ ...p, rem: p.bt })).sort((a, b) => a.at - b.at);
  const ready    = [];
  const timeline = [];
  const incoming = [...queue];
  const arrived  = new Set();
  let t = 0, done = 0, n = procs.length;

  while (done < n) {
    incoming
      .filter(p => p.at <= t && !arrived.has(p.id))
      .forEach(p => { arrived.add(p.id); ready.push({ ...p }); });

    if (!ready.length) {
      const nx = incoming.find(p => !arrived.has(p.id));
      if (!nx) break;
      pushSeg(timeline, 'IDLE', t, nx.at);
      t = nx.at;
      continue;
    }

    // Pick best-priority process
    ready.sort((a, b) => priorityVal(a) - priorityVal(b));
    const p = ready[0];

    // Run until: process finishes OR next process arrives
    let nextEvent = t + p.rem;
    const inq = incoming.find(pp => !arrived.has(pp.id) && pp.at > t);
    if (inq) nextEvent = Math.min(nextEvent, inq.at);

    pushSeg(timeline, p.id, t, nextEvent);
    p.rem -= (nextEvent - t);
    t = nextEvent;

    if (p.rem <= 0) { ready.shift(); done++; }
  }
  return timeline;
}

/**
 * Priority Scheduling with Round Robin
 * Processes are grouped by priority level.
 * Round Robin (quantum q) runs within each priority group.
 * A higher-priority group always preempts lower-priority groups.
 * Returns an array of { pid, start, end } segments (merged consecutive).
 */
function priorityRR(procs, q) {
  const arr         = procs.map(p => ({ ...p, rem: p.bt })).sort((a, b) => a.at - b.at);
  const timeline    = [];
  const incoming    = [...arr];
  const arrived     = new Set();
  const readyQueues = {}; // priorityVal → [process, ...]
  let t = 0, done = 0, n = arr.length;

  // Admit all processes that have arrived by time t
  function addArrived() {
    incoming
      .filter(p => p.at <= t && !arrived.has(p.id))
      .forEach(p => {
        arrived.add(p.id);
        const pv = priorityVal(p);
        if (!readyQueues[pv]) readyQueues[pv] = [];
        readyQueues[pv].push({ ...p });
      });
  }

  while (done < n) {
    addArrived();

    // Find the best (numerically smallest) non-empty priority bucket
    const keys = Object.keys(readyQueues)
      .filter(k => readyQueues[k].length)
      .map(Number)
      .sort((a, b) => a - b);

    if (!keys.length) {
      const nx = incoming.find(p => !arrived.has(p.id));
      if (!nx) break;
      pushSeg(timeline, 'IDLE', t, nx.at);
      t = nx.at;
      continue;
    }

    const bestKey = keys[0];
    const p       = readyQueues[bestKey][0];
    const run     = Math.min(q, p.rem);

    pushSeg(timeline, p.id, t, t + run);
    t      += run;
    p.rem  -= run;
    addArrived(); // re-check arrivals after the quantum

    if (p.rem <= 0) { readyQueues[bestKey].shift(); done++; }
    else            { readyQueues[bestKey].shift(); readyQueues[bestKey].push(p); }
  }
  return timeline;
}

// ─────────── Main Simulation Entry Point ───────────

/**
 * Validate inputs, run the selected scheduling algorithm,
 * then render the Gantt chart and results table.
 */
function simulate() {
  if (!validate()) return;

  const q = +document.getElementById('quantum').value || 2;
  let timeline;

  switch (selectedAlgo) {
    case 'FCFS':        timeline = fcfs(processes);               break;
    case 'SJF':         timeline = sjf(processes);                break;
    case 'SRT':         timeline = srt(processes);                break;
    case 'RR':          timeline = roundRobin(processes, q);      break;
    case 'PRIORITY':    timeline = priorityNP(processes);         break;
    case 'PRIORITY_P':  timeline = priorityPreemptive(processes); break;
    case 'PRIORITY_RR': timeline = priorityRR(processes, q);      break;
    default:            timeline = fcfs(processes);
  }

  renderGantt(timeline);
  renderResults(timeline);

  const out = document.getElementById('output-section');
  out.classList.add('visible');
  out.scrollIntoView({ behavior: 'smooth' });
}

// ─────────── Gantt Chart Renderer ───────────

/**
 * Render a proportional Gantt chart with color-coded process blocks
 * and a time-axis below. Uses pixel-based sizing so large burst values
 * always fit — the chart scrolls horizontally rather than squashing.
 * First (0) and last tick are always highlighted.
 */
function renderGantt(timeline) {
  const chart   = document.getElementById('ganttChart');
  const timesEl = document.getElementById('ganttTimes');
  chart.innerHTML = '';
  timesEl.innerHTML = '';

  // Assign a color to each process
  const pidColor = {};
  processes.forEach((p, i) => { pidColor[p.id] = COLORS[i % COLORS.length]; });

  const chartStart = timeline[0].start;
  const chartEnd   = timeline[timeline.length - 1].end;
  const totalTime  = chartEnd - chartStart;

  // Pixel width per time unit — auto-scales so the chart is always readable.
  // Minimum 28px per unit; for large totals we shrink down to 14px but never less.
  const PX_PER_UNIT = Math.max(14, Math.min(48, Math.floor(900 / totalTime)));
  const totalPx = totalTime * PX_PER_UNIT;

  // Size both rows to the same total width so ticks align with blocks
  chart.style.width   = totalPx + 'px';
  timesEl.style.width = totalPx + 'px';

  // ── Blocks ──
  timeline.forEach(seg => {
    const dur    = seg.end - seg.start;
    const isIdle = seg.pid === 'IDLE';
    const block  = document.createElement('div');
    block.className = 'gantt-block tooltip' + (isIdle ? ' idle-block' : '');
    block.style.width      = (dur * PX_PER_UNIT) + 'px';
    block.style.flexShrink = '0';
    block.style.background = isIdle ? '#1a2a40' : pidColor[seg.pid];
    // Only show label if block is wide enough
    block.innerHTML = dur * PX_PER_UNIT >= 20 ? `
      <span class="gantt-label" style="color:${isIdle ? '#4a6fa5' : 'rgba(0,0,0,0.85)'}">
        ${seg.pid}
      </span>` : '';
    block.setAttribute('data-tip',
      `${seg.pid}: [${seg.start} → ${seg.end}] (${dur} unit${dur > 1 ? 's' : ''})`
    );
    chart.appendChild(block);
  });

  // ── Ticks — always include 0 and the last time value ──
  const allTicks = [...new Set(
    [0]
      .concat(timeline.map(s => s.start))
      .concat([chartEnd])
  )].sort((a, b) => a - b);

  // Thin out ticks when there are too many (keep first, last, and evenly spaced ones)
  const MAX_TICKS = 20;
  let visibleTicks = allTicks;
  if (allTicks.length > MAX_TICKS) {
    const step = Math.ceil(totalTime / (MAX_TICKS - 1));
    visibleTicks = allTicks.filter(t =>
      t === 0 || t === chartEnd || t % step === 0
    );
    // Always keep first and last
    if (!visibleTicks.includes(0))       visibleTicks.unshift(0);
    if (!visibleTicks.includes(chartEnd)) visibleTicks.push(chartEnd);
  }

  visibleTicks.forEach(tick => {
    const px   = (tick - chartStart) * PX_PER_UNIT;
    const span = document.createElement('span');
    const isFirst = tick === 0;
    const isLast  = tick === chartEnd;
    span.className   = 'gantt-tick' + (isFirst ? ' tick-first' : '') + (isLast ? ' tick-last' : '');
    span.style.left  = px + 'px';
    span.textContent = tick;
    timesEl.appendChild(span);
  });

  document.getElementById('algoLabel').textContent = algoName();
}

/** Return the human-readable name of the currently selected algorithm. */
function algoName() {
  const names = {
    FCFS:        'First-Come First-Served (FCFS)',
    SJF:         'Shortest Job First — Non-preemptive (SJF)',
    SRT:         'Shortest Remaining Time — Preemptive (SRT)',
    RR:          'Round Robin (RR)',
    PRIORITY:    'Priority Scheduling — Non-preemptive',
    PRIORITY_P:  'Priority Scheduling — Preemptive',
    PRIORITY_RR: 'Priority Scheduling with Round Robin',
  };
  return names[selectedAlgo] || selectedAlgo;
}

// ─────────── Results Table Renderer ───────────

/**
 * Compute per-process Finish Time, Waiting Time, Turnaround Time,
 * and averages from the Gantt timeline, then populate the results table.
 *
 *   Turnaround Time (TAT) = Finish Time − Arrival Time
 *   Waiting Time    (WT)  = TAT − Burst Time
 */
function renderResults(timeline) {
  const needPri = ['PRIORITY', 'PRIORITY_P', 'PRIORITY_RR'].includes(selectedAlgo);
  document.getElementById('resColPri').style.display = needPri ? '' : 'none';

  // Find the last finish time for each process
  const finishMap = {};
  timeline.forEach(seg => {
    if (seg.pid !== 'IDLE')
      finishMap[seg.pid] = Math.max(finishMap[seg.pid] || 0, seg.end);
  });

  const rows = processes.map(p => {
    const ft  = finishMap[p.id] || 0;
    const tat = ft - p.at;
    const wt  = tat - p.bt;
    return { ...p, ft, tat, wt };
  });

  const avgWT  = (rows.reduce((s, r) => s + r.wt,  0) / rows.length).toFixed(2);
  const avgTAT = (rows.reduce((s, r) => s + r.tat, 0) / rows.length).toFixed(2);

  // Summary stat cards
  document.getElementById('avgStats').innerHTML = `
    <div class="stat-card wt">
      <div class="stat-card-label">Avg Waiting Time</div>
      <div class="stat-card-value">${avgWT}</div>
      <div class="stat-card-sub">units per process</div>
    </div>
    <div class="stat-card tat">
      <div class="stat-card-label">Avg Turnaround Time</div>
      <div class="stat-card-value">${avgTAT}</div>
      <div class="stat-card-sub">units per process</div>
    </div>
  `;

  // Per-process rows + inline average rows
  const tbody = document.getElementById('resultsBody');
  tbody.innerHTML = '';

  rows.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.bt}</td>
      <td>${r.at}</td>
      ${needPri ? `<td>${r.pri}</td>` : ''}
      <td style="color:var(--accent2)">${r.wt}</td>
      <td style="color:var(--accent3)">${r.tat}</td>
      <td style="color:var(--accent)">${r.ft}</td>
    `;
    tbody.appendChild(tr);
  });

  // Average row — empty cells under PID/Burst/Arrival, averages under WT and TAT, blank under CT
  const avg = document.createElement('tr');
  avg.className = 'avg-row';
  avg.innerHTML = `
    <td style="color:var(--accent);font-family:'Share Tech Mono'">AVERAGE</td>
    <td></td>
    <td></td>
    ${needPri ? '<td></td>' : ''}
    <td style="color:var(--accent2)">${avgWT}</td>
    <td style="color:var(--accent3)">${avgTAT}</td>
    <td></td>
  `;
  tbody.appendChild(avg);
}
