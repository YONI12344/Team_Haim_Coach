/* ===== app.js — Running Coach Web App ===== */

// ── Storage helpers ──────────────────────────────────────────────────────────
const RUNS_KEY = 'runCoach_runs';
const PLAN_KEY = 'runCoach_plan';

function loadRuns() {
  try { return JSON.parse(localStorage.getItem(RUNS_KEY)) || []; }
  catch { return []; }
}

function saveRuns(runs) {
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
}

function loadPlan() {
  try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || null; }
  catch { return null; }
}

function savePlan(plan) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
}

// ── Navigation ────────────────────────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('nav button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });
}

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');

  const btn = document.querySelector(`nav button[data-page="${pageId}"]`);
  if (btn) btn.classList.add('active');

  if (pageId === 'page-dashboard') renderDashboard();
  if (pageId === 'page-progress')  renderProgress();
  if (pageId === 'page-plan') restoreSavedPlan();
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ── Utility: format duration mm:ss or hh:mm:ss ────────────────────────────────
function fmtDuration(totalSecs) {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function parseDuration(str) {
  // Accepts hh:mm:ss or mm:ss
  const parts = str.trim().split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function calcPace(distKm, totalSecs) {
  if (!distKm || !totalSecs) return '—';
  const secsPerKm = totalSecs / distKm;
  const m = Math.floor(secsPerKm / 60);
  const s = Math.round(secsPerKm % 60);
  return `${m}:${String(s).padStart(2,'0')} /km`;
}

function getWeekKey(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  const runs = loadRuns();

  const totalRuns = runs.length;
  const totalKm   = runs.reduce((s, r) => s + (parseFloat(r.distance) || 0), 0);
  const totalSecs = runs.reduce((s, r) => s + (parseInt(r.durationSecs) || 0), 0);

  // This week's km
  const today    = new Date();
  const mondayTs = (() => {
    const d = new Date(today);
    d.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();
  const weekKm = runs
    .filter(r => new Date(r.date).getTime() >= mondayTs)
    .reduce((s, r) => s + (parseFloat(r.distance) || 0), 0);

  document.getElementById('stat-total-runs').textContent = totalRuns;
  document.getElementById('stat-total-km').textContent   = totalKm.toFixed(1);
  document.getElementById('stat-week-km').textContent    = weekKm.toFixed(1);
  document.getElementById('stat-total-time').textContent =
    totalSecs > 0 ? fmtDuration(totalSecs) : '0:00';

  // Recent runs table
  const tbody = document.getElementById('recent-runs-tbody');
  const last5 = runs.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  if (last5.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:1.5rem">No runs logged yet. Start logging your runs!</td></tr>`;
  } else {
    tbody.innerHTML = last5.map(r => `
      <tr>
        <td>${r.date}</td>
        <td>${parseFloat(r.distance).toFixed(2)} km</td>
        <td>${fmtDuration(r.durationSecs)}</td>
        <td><span class="pace-pill">${calcPace(parseFloat(r.distance), r.durationSecs)}</span></td>
      </tr>
    `).join('');
  }
}

// ── Run Logger ────────────────────────────────────────────────────────────────
function initRunLogger() {
  // Set today as default date
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('run-date').value = today;

  document.getElementById('run-form').addEventListener('submit', e => {
    e.preventDefault();
    const date     = document.getElementById('run-date').value;
    const distance = parseFloat(document.getElementById('run-distance').value);
    const durStr   = document.getElementById('run-duration').value;
    const notes    = document.getElementById('run-notes').value.trim();

    if (!date || isNaN(distance) || distance <= 0) {
      showToast('⚠️ Please fill in date and a valid distance.');
      return;
    }

    const durationSecs = parseDuration(durStr);
    if (durationSecs === null || durationSecs <= 0) {
      showToast('⚠️ Duration format: mm:ss or hh:mm:ss');
      return;
    }

    const runs = loadRuns();
    runs.push({ id: Date.now(), date, distance, durationSecs, notes });
    saveRuns(runs);
    showToast('✅ Run logged successfully!');
    e.target.reset();
    document.getElementById('run-date').value = today;
  });
}

// ── Progress View ─────────────────────────────────────────────────────────────
function renderProgress() {
  renderRunsTable();
  renderMileageChart();
}

function renderRunsTable() {
  const runs = loadRuns().slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const tbody = document.getElementById('runs-tbody');

  if (runs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty-state">
        <div class="empty-icon">🏃</div>
        <p>No runs logged yet. Head to the Run Logger tab to add your first run!</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = runs.map(r => `
    <tr>
      <td>${r.date}</td>
      <td>${parseFloat(r.distance).toFixed(2)}</td>
      <td>${fmtDuration(r.durationSecs)}</td>
      <td><span class="pace-pill">${calcPace(parseFloat(r.distance), r.durationSecs)}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.notes || '—'}</td>
      <td><button class="btn btn-danger btn-sm" data-id="${r.id}">Delete</button></td>
    </tr>
  `).join('');

  tbody.querySelectorAll('button[data-id]').forEach(btn => {
    btn.addEventListener('click', () => deleteRun(parseInt(btn.dataset.id)));
  });
}

function deleteRun(id) {
  const runs = loadRuns().filter(r => r.id !== id);
  saveRuns(runs);
  renderProgress();
  renderDashboard();
  showToast('🗑️ Run deleted.');
}

function renderMileageChart() {
  const canvas = document.getElementById('mileageChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Gather last 8 weeks
  const runs = loadRuns();
  const weekMap = {};
  runs.forEach(r => {
    const wk = getWeekKey(r.date);
    weekMap[wk] = (weekMap[wk] || 0) + (parseFloat(r.distance) || 0);
  });

  // Build sorted list of up to 8 weeks
  const allWeeks = Object.keys(weekMap).sort();
  const weeks    = allWeeks.slice(-8);
  const values   = weeks.map(w => weekMap[w]);

  // Canvas sizing
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.offsetWidth  || 600;
  const H   = canvas.offsetHeight || 220;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const padL = 50, padR = 20, padT = 20, padB = 48;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  // Background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#f4f7f5';
  ctx.fillRect(0, 0, W, H);

  if (weeks.length === 0) {
    ctx.fillStyle = '#5a7060';
    ctx.font = '14px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Log some runs to see your weekly mileage chart!', W / 2, H / 2);
    return;
  }

  const maxVal = Math.max(...values, 5);
  const yStep  = niceStep(maxVal);
  const yMax   = Math.ceil(maxVal / yStep) * yStep;

  // Grid lines
  ctx.strokeStyle = '#d0ddd5';
  ctx.lineWidth   = 1;
  ctx.setLineDash([4, 4]);
  for (let v = 0; v <= yMax; v += yStep) {
    const y = padT + chartH - (v / yMax) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();

    ctx.fillStyle = '#5a7060';
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(v.toFixed(0) + ' km', padL - 6, y + 4);
  }
  ctx.setLineDash([]);

  // Bars
  const barCount  = weeks.length;
  const barWidth  = Math.min(48, (chartW / barCount) * 0.6);
  const barSpacing = chartW / barCount;

  weeks.forEach((wk, i) => {
    const val  = values[i];
    const barH = (val / yMax) * chartH;
    const x    = padL + i * barSpacing + barSpacing / 2 - barWidth / 2;
    const y    = padT + chartH - barH;

    // Gradient bar
    const grad = ctx.createLinearGradient(0, y, 0, padT + chartH);
    grad.addColorStop(0, '#1a8a4a');
    grad.addColorStop(1, '#1e6fa8');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
    ctx.fill();

    // Value label on bar
    if (val > 0) {
      ctx.fillStyle = '#1c2a22';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val.toFixed(1), x + barWidth / 2, y - 5);
    }

    // Week label (Mon date)
    ctx.fillStyle = '#5a7060';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    const label = wk.slice(5); // MM-DD
    ctx.fillText(label, x + barWidth / 2, padT + chartH + 16);
    ctx.fillText('Wk', x + barWidth / 2, padT + chartH + 28);
  });

  // X-axis line
  ctx.strokeStyle = '#d0ddd5';
  ctx.lineWidth   = 1.5;
  ctx.beginPath();
  ctx.moveTo(padL, padT + chartH);
  ctx.lineTo(padL + chartW, padT + chartH);
  ctx.stroke();

  // Chart title
  ctx.fillStyle = '#136636';
  ctx.font = 'bold 13px Segoe UI, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Weekly Mileage (km)', padL, padT - 6);
}

function niceStep(maxVal) {
  const rawStep = maxVal / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const candidates = [1, 2, 2.5, 5, 10].map(f => f * magnitude);
  return candidates.find(s => maxVal / s <= 6) || candidates[candidates.length - 1];
}

// ── Training Plan Generator ───────────────────────────────────────────────────
const PLAN_TEMPLATES = {
  '5k': {
    beginner: {
      weeks: 8,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 2 + w * 0.3,  label: `Easy Run ${(2 + w * 0.3).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest / Walk' },
        { type: 'easy',     dist: 2 + w * 0.3,  label: `Easy Run ${(2 + w * 0.3).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'easy',     dist: 2 + w * 0.2,  label: `Easy Run ${(2 + w * 0.2).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 3 + w * 0.4,  label: `Long Run ${(3 + w * 0.4).toFixed(1)} km` },
      ]
    },
    intermediate: {
      weeks: 8,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 4 + w * 0.3,  label: `Easy Run ${(4 + w * 0.3).toFixed(1)} km` },
        { type: 'interval', label: `Intervals: 6×400m @ 5K pace` },
        { type: 'easy',     dist: 4,             label: `Easy Run 4 km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'tempo',    dist: 3 + w * 0.2,  label: `Tempo Run ${(3 + w * 0.2).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 6 + w * 0.4,  label: `Long Run ${(6 + w * 0.4).toFixed(1)} km` },
      ]
    },
    advanced: {
      weeks: 8,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 6,             label: `Easy Run 6 km` },
        { type: 'interval', label: `Intervals: 8×400m @ mile pace` },
        { type: 'easy',     dist: 5,             label: `Easy Run 5 km` },
        { type: 'tempo',    dist: 4 + w * 0.3,  label: `Tempo Run ${(4 + w * 0.3).toFixed(1)} km` },
        { type: 'easy',     dist: 5,             label: `Easy Run 5 km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 8 + w * 0.5,  label: `Long Run ${(8 + w * 0.5).toFixed(1)} km` },
      ]
    }
  },
  '10k': {
    beginner: {
      weeks: 10,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 4 + w * 0.4,  label: `Easy Run ${(4 + w * 0.4).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest / Walk' },
        { type: 'easy',     dist: 4 + w * 0.3,  label: `Easy Run ${(4 + w * 0.3).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'easy',     dist: 3 + w * 0.2,  label: `Easy Run ${(3 + w * 0.2).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 5 + w * 0.6,  label: `Long Run ${(5 + w * 0.6).toFixed(1)} km` },
      ]
    },
    intermediate: {
      weeks: 10,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 6 + w * 0.3,  label: `Easy Run ${(6 + w * 0.3).toFixed(1)} km` },
        { type: 'interval', label: `Intervals: 5×1 km @ 10K pace` },
        { type: 'easy',     dist: 6,             label: `Easy Run 6 km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'tempo',    dist: 5 + w * 0.3,  label: `Tempo Run ${(5 + w * 0.3).toFixed(1)} km` },
        { type: 'easy',     dist: 4,             label: `Easy Run 4 km` },
        { type: 'long',     dist: 8 + w * 0.6,  label: `Long Run ${(8 + w * 0.6).toFixed(1)} km` },
      ]
    },
    advanced: {
      weeks: 10,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 8,             label: `Easy Run 8 km` },
        { type: 'interval', label: `Intervals: 6×1 km @ 10K pace` },
        { type: 'easy',     dist: 7,             label: `Easy Run 7 km` },
        { type: 'tempo',    dist: 6 + w * 0.3,  label: `Tempo Run ${(6 + w * 0.3).toFixed(1)} km` },
        { type: 'easy',     dist: 6,             label: `Easy Run 6 km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 12 + w * 0.6, label: `Long Run ${(12 + w * 0.6).toFixed(1)} km` },
      ]
    }
  },
  'half': {
    beginner: {
      weeks: 12,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 5 + w * 0.4,  label: `Easy Run ${(5 + w * 0.4).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'easy',     dist: 5 + w * 0.3,  label: `Easy Run ${(5 + w * 0.3).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'easy',     dist: 4 + w * 0.2,  label: `Easy Run ${(4 + w * 0.2).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 8 + w * 0.9,  label: `Long Run ${(8 + w * 0.9).toFixed(1)} km` },
      ]
    },
    intermediate: {
      weeks: 12,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 8 + w * 0.3,  label: `Easy Run ${(8 + w * 0.3).toFixed(1)} km` },
        { type: 'interval', label: `Intervals: 4×1600m @ half pace` },
        { type: 'easy',     dist: 8,             label: `Easy Run 8 km` },
        { type: 'tempo',    dist: 6 + w * 0.4,  label: `Tempo Run ${(6 + w * 0.4).toFixed(1)} km` },
        { type: 'easy',     dist: 6,             label: `Easy Run 6 km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 12 + w * 0.8, label: `Long Run ${(12 + w * 0.8).toFixed(1)} km` },
      ]
    },
    advanced: {
      weeks: 12,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 10,            label: `Easy Run 10 km` },
        { type: 'interval', label: `Intervals: 5×1600m @ 10K pace` },
        { type: 'easy',     dist: 10,            label: `Easy Run 10 km` },
        { type: 'tempo',    dist: 10 + w * 0.3, label: `Tempo Run ${(10 + w * 0.3).toFixed(1)} km` },
        { type: 'easy',     dist: 8,             label: `Easy Run 8 km` },
        { type: 'easy',     dist: 6,             label: `Easy Run 6 km` },
        { type: 'long',     dist: 16 + w * 0.5, label: `Long Run ${(16 + w * 0.5).toFixed(1)} km` },
      ]
    }
  },
  'marathon': {
    beginner: {
      weeks: 18,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 6 + w * 0.3,  label: `Easy Run ${(6 + w * 0.3).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'easy',     dist: 6 + w * 0.3,  label: `Easy Run ${(6 + w * 0.3).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'easy',     dist: 5 + w * 0.2,  label: `Easy Run ${(5 + w * 0.2).toFixed(1)} km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 12 + w * 0.9, label: `Long Run ${(12 + w * 0.9).toFixed(1)} km` },
      ]
    },
    intermediate: {
      weeks: 18,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 10 + w * 0.3, label: `Easy Run ${(10 + w * 0.3).toFixed(1)} km` },
        { type: 'interval', label: `Intervals: 6×1 km @ 10K pace` },
        { type: 'easy',     dist: 10,            label: `Easy Run 10 km` },
        { type: 'tempo',    dist: 8 + w * 0.4,  label: `Tempo Run ${(8 + w * 0.4).toFixed(1)} km` },
        { type: 'easy',     dist: 8,             label: `Easy Run 8 km` },
        { type: 'rest',     label: 'Rest' },
        { type: 'long',     dist: 16 + w * 0.9, label: `Long Run ${(16 + w * 0.9).toFixed(1)} km` },
      ]
    },
    advanced: {
      weeks: 18,
      weeklyPattern: (w) => [
        { type: 'easy',     dist: 12,            label: `Easy Run 12 km` },
        { type: 'interval', label: `Intervals: 8×1 km @ marathon pace` },
        { type: 'easy',     dist: 12,            label: `Easy Run 12 km` },
        { type: 'tempo',    dist: 12 + w * 0.3, label: `Tempo Run ${(12 + w * 0.3).toFixed(1)} km` },
        { type: 'easy',     dist: 10,            label: `Easy Run 10 km` },
        { type: 'easy',     dist: 8,             label: `Easy Run 8 km` },
        { type: 'long',     dist: 22 + w * 0.5, label: `Long Run ${(22 + w * 0.5).toFixed(1)} km` },
      ]
    }
  }
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const GOAL_LABELS = { '5k': '5K', '10k': '10K', 'half': 'Half Marathon', 'marathon': 'Marathon' };
const LEVEL_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

function generatePlan(goal, level, daysPerWeek) {
  const template = PLAN_TEMPLATES[goal][level];
  const totalWeeks = template.weeks;
  const plan = [];

  for (let w = 0; w < totalWeeks; w++) {
    const isDeload = (w + 1) % 4 === 0;
    const allDays = template.weeklyPattern(isDeload ? Math.max(0, w - 1) : w);

    // Pick days based on user's availability
    const selectedDays = selectDays(allDays, parseInt(daysPerWeek));

    plan.push({ week: w + 1, isDeload, days: selectedDays });
  }
  return { goal, level, daysPerWeek, generatedAt: Date.now(), weeks: plan };
}

function selectDays(allDays, count) {
  // allDays is a 7-element Mon-Sun array
  // Priority: long run (Sun), rest days (skip), then spread runs evenly
  const result = [];
  const runDays = allDays.filter(d => d.type !== 'rest');
  const maxRuns = Math.min(count, runDays.length);

  // Always include the long run if count >= 2
  const longIdx = allDays.findIndex(d => d.type === 'long');
  const picked  = new Set();
  if (maxRuns >= 1 && longIdx !== -1) picked.add(longIdx);

  // Fill remaining slots with highest priority (interval > tempo > easy)
  const priority = ['interval', 'tempo', 'easy'];
  for (const type of priority) {
    if (picked.size >= maxRuns) break;
    allDays.forEach((d, i) => {
      if (picked.size < maxRuns && d.type === type && !picked.has(i)) picked.add(i);
    });
  }

  // Build final 7-day array
  for (let i = 0; i < 7; i++) {
    if (picked.has(i)) {
      result.push({ ...allDays[i], dayName: DAY_NAMES[i] });
    } else {
      result.push({ type: 'rest', label: 'Rest', dayName: DAY_NAMES[i] });
    }
  }
  return result;
}

function initPlanGenerator() {
  document.getElementById('plan-form').addEventListener('submit', e => {
    e.preventDefault();
    const goal  = document.getElementById('plan-goal').value;
    const level = document.getElementById('plan-level').value;
    const days  = document.getElementById('plan-days').value;

    const plan = generatePlan(goal, level, days);
    savePlan(plan);
    renderPlan(plan);
    showToast('🗓️ Training plan generated!');
  });
}

function restoreSavedPlan() {
  const plan = loadPlan();
  if (plan) {
    // Restore form values
    document.getElementById('plan-goal').value  = plan.goal;
    document.getElementById('plan-level').value = plan.level;
    document.getElementById('plan-days').value  = plan.daysPerWeek;
    renderPlan(plan);
  }
}

function renderPlan(plan) {
  const container = document.getElementById('plan-output');
  if (!plan || !plan.weeks) { container.innerHTML = ''; return; }

  const typeClass = { easy: 'day-easy', tempo: 'day-tempo', interval: 'day-interval', long: 'day-long', rest: 'day-rest' };

  const html = `
    <div class="section-header" style="margin-top:1.5rem">
      <div class="section-title" style="font-size:1.1rem">
        📋 ${GOAL_LABELS[plan.goal]} — ${LEVEL_LABELS[plan.level]} — ${plan.daysPerWeek} days/week
        <span class="tag tag-green" style="margin-left:.5rem">${plan.weeks.length} weeks</span>
      </div>
    </div>
    ${plan.weeks.map(week => `
      <div class="week-block">
        <div class="week-header">
          Week ${week.week}
          ${week.isDeload ? '<span class="week-badge">Recovery Week</span>' : ''}
        </div>
        <div class="week-days">
          ${week.days.map(day => `
            <div class="day-cell">
              <div class="day-name">${day.dayName}</div>
              <div class="${typeClass[day.type] || ''}">${day.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  `;

  container.innerHTML = html;
}

// ── App Bootstrap ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initRunLogger();
  initPlanGenerator();
  navigateTo('page-dashboard');

  // Redraw chart on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const progressPage = document.getElementById('page-progress');
      if (progressPage && progressPage.classList.contains('active')) renderMileageChart();
    }, 250);
  });
});
