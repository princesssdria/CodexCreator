const MAX_BRIGHTNESS = 300;
const MAX_LEVEL = 20;
const LEVEL_XP = 100;

const positiveActions = [
  { id: 'study', label: '📚 Study session', points: 10, energy: -5, discipline: 8, xp: 14 },
  { id: 'attend_class', label: '🎓 Attend class', points: 12, energy: -4, discipline: 7, xp: 12 },
  { id: 'assignment', label: '🧠 Complete assignment', points: 15, energy: -8, discipline: 10, xp: 18 },
  { id: 'review_notes', label: '📝 Review notes', points: 8, energy: -3, discipline: 6, xp: 10 },
  { id: 'start_early', label: '⏰ Start task early', points: 10, energy: -2, discipline: 12, xp: 14 },
  { id: 'drink_water', label: '💧 Drink water', points: 6, energy: 8, discipline: 2, xp: 6 },
  { id: 'sleep', label: '😴 Sleep 7–8 hours', points: 12, energy: 16, discipline: 5, xp: 10 },
  { id: 'workout', label: '🏃 Workout', points: 12, energy: 10, discipline: 7, xp: 12 },
  { id: 'limit_phone', label: '📵 No phone for 1 hour', points: 12, energy: 0, discipline: 14, xp: 12 },
  { id: 'wake_time', label: '🌅 Wake up on time', points: 15, energy: 9, discipline: 10, xp: 15 },
  { id: 'self_care', label: '💖 Self-care routine', points: 12, energy: 9, discipline: 4, xp: 9 },
  { id: 'journal', label: '📓 Journal', points: 8, energy: 4, discipline: 3, xp: 8 },
  { id: 'outside', label: '🌿 Going outside', points: 10, energy: 11, discipline: 3, xp: 10 },
  { id: 'clean_room', label: '🧼 Clean room', points: 10, energy: -2, discipline: 8, xp: 10 },
  { id: 'laundry', label: '🧺 Do laundry', points: 8, energy: -2, discipline: 6, xp: 8 },
  { id: 'meal_prep', label: '🥗 Meal prep', points: 12, energy: -1, discipline: 8, xp: 11 },
  { id: 'music', label: '🎵 Listen to music', points: 5, energy: 6, discipline: 0, xp: 5 },
  { id: 'fruits_veggies', label: '🥦 Ate fruits and veggies', points: 9, energy: 7, discipline: 4, xp: 8 }
];

const debuffActions = [
  { id: 'procrastination', label: '📉 Procrastination Spiral', points: -15, energy: -10, discipline: -15, xp: -8 },
  { id: 'missed_deadline', label: '📉 Missed Deadline', points: -25, energy: -12, discipline: -18, xp: -15 },
  { id: 'burnout', label: '🧠 Burnout', points: -30, energy: -20, discipline: -10, xp: -18 },
  { id: 'overthinking', label: '🧠 Overthinking', points: -10, energy: -6, discipline: -6, xp: -6 },
  { id: 'low_motivation', label: '🧠 Low Motivation', points: -12, energy: -8, discipline: -8, xp: -8 },
  { id: 'brain_fog', label: '🧠 Brain Fog', points: -15, energy: -12, discipline: -10, xp: -9 },
  { id: 'late_sleep', label: '🌙 Stayed up past 2 AM', points: -14, energy: -14, discipline: -4, xp: -7 },
  { id: 'phone_binge', label: '📱 Too much phone use', points: -12, energy: -5, discipline: -14, xp: -7 }
];

const state = {
  brightness: 100,
  energy: 100,
  discipline: 100,
  streak: 0,
  xp: 0,
  level: 1,
  status: 'Balanced',
  statusEffects: [],
  log: [],
  counters: {
    lateSleep: 0,
    phoneBinge: 0,
    burnout: 0
  }
};

const el = {
  actionsList: document.getElementById('actionsList'),
  debuffList: document.getElementById('debuffList'),
  brightnessValue: document.getElementById('brightnessValue'),
  brightnessNumber: document.getElementById('brightnessNumber'),
  energyNumber: document.getElementById('energyNumber'),
  disciplineNumber: document.getElementById('disciplineNumber'),
  brightnessBar: document.getElementById('brightnessBar'),
  energyBar: document.getElementById('energyBar'),
  disciplineBar: document.getElementById('disciplineBar'),
  levelValue: document.getElementById('levelValue'),
  xpValue: document.getElementById('xpValue'),
  streakValue: document.getElementById('streakValue'),
  statusValue: document.getElementById('statusValue'),
  statusDescription: document.getElementById('statusDescription'),
  tipsMessage: document.getElementById('tipsMessage'),
  actionLog: document.getElementById('actionLog'),
  activeEffects: document.getElementById('activeEffects'),
  resetButton: document.getElementById('resetButton'),
  xpPopLayer: document.getElementById('xpPopLayer'),
  hero: document.querySelector('.hero')
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createActionButton(action, isDebuff) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'action-btn';
  button.innerHTML = `<span>${action.label}</span><span class="points-chip">${action.points > 0 ? '+' : ''}${action.points} ✨</span>`;

  button.addEventListener('click', () => {
    applyAction(action, isDebuff);
    animateButton(button);
  });

  return button;
}

function renderActionButtons() {
  positiveActions.forEach((action) => {
    el.actionsList.appendChild(createActionButton(action, false));
  });

  debuffActions.forEach((action) => {
    el.debuffList.appendChild(createActionButton(action, true));
  });
}

function currentMultiplier() {
  return 1 + Math.min(state.streak, 10) * 0.05;
}

function applyAction(action, isDebuff) {
  const multiplier = isDebuff ? 1 : currentMultiplier();
  const deltaPoints = Math.round(action.points * multiplier);
  const deltaXp = Math.round(action.xp * multiplier);

  state.brightness = clamp(state.brightness + deltaPoints, 0, MAX_BRIGHTNESS);
  state.energy = clamp(state.energy + action.energy, 0, 150);
  state.discipline = clamp(state.discipline + action.discipline, 0, 150);

  if (isDebuff) {
    state.streak = Math.max(0, state.streak - 1);
  } else {
    state.streak += 1;
  }

  applyXp(deltaXp);
  registerTrigger(action.id, isDebuff);
  updateStatus();
  pushLog(`${action.label}: ${deltaPoints > 0 ? '+' : ''}${deltaPoints} BP`);
  spawnXpPopup(`${deltaPoints > 0 ? '+' : ''}${deltaPoints} ✨`);
  render();
}

function applyXp(amount) {
  state.xp = clamp(state.xp + amount, 0, LEVEL_XP * 3);

  while (state.xp >= LEVEL_XP && state.level < MAX_LEVEL) {
    state.xp -= LEVEL_XP;
    state.level += 1;
    el.hero.classList.remove('level-up');
    void el.hero.offsetWidth;
    el.hero.classList.add('level-up');
    pushLog(`🎉 Level up! You reached Level ${state.level}.`);
  }
}

function registerTrigger(actionId, isDebuff) {
  if (!isDebuff) {
    if (actionId === 'sleep') state.counters.lateSleep = Math.max(0, state.counters.lateSleep - 1);
    if (actionId === 'limit_phone') state.counters.phoneBinge = Math.max(0, state.counters.phoneBinge - 1);
    if (actionId === 'outside') state.counters.burnout = Math.max(0, state.counters.burnout - 1);
    return;
  }

  if (actionId === 'late_sleep') state.counters.lateSleep += 1;
  if (actionId === 'phone_binge') state.counters.phoneBinge += 1;
  if (actionId === 'burnout') state.counters.burnout += 1;
}

function updateStatus() {
  const effects = [];

  if (state.counters.lateSleep >= 3) effects.push('Exhausted: everything costs more effort.');
  if (state.counters.phoneBinge >= 2) effects.push('Distracted: task rewards are reduced.');
  if (state.counters.burnout >= 2 || state.energy < 35) effects.push('Burned Out: XP gain reduced.');
  if (state.discipline < 50 && state.streak < 2) effects.push('Unmotivated: lower streak bonus.');
  if (state.discipline < 45 && state.energy < 45) effects.push('Overstimulated: random focus drops.');

  let mainStatus = 'Balanced';
  if (effects.length > 0) {
    mainStatus = effects[0].split(':')[0];
  } else if (state.streak >= 10 && state.brightness >= 220) {
    mainStatus = 'Glow Mode';
    effects.push('Glow Mode: max brightness multiplier active.');
  } else if (state.streak >= 7 && state.discipline >= 110) {
    mainStatus = 'Disciplined';
    effects.push('Disciplined: debuff impact reduced.');
  } else if (state.streak >= 5 && state.energy >= 90) {
    mainStatus = 'Locked In';
    effects.push('Locked In: +20% productivity gains.');
  }

  state.status = mainStatus;
  state.statusEffects = effects;
}

function progressVisual(value, max) {
  const pct = (value / max) * 100;
  return `${clamp(pct, 0, 100)}%`;
}

function brightnessFilter() {
  if (state.brightness >= 250) return 'drop-shadow(0 0 9px #c66fff)';
  if (state.brightness >= 180) return 'drop-shadow(0 0 8px #62c7ff)';
  if (state.brightness >= 120) return 'drop-shadow(0 0 6px #5cfd9a)';
  if (state.brightness >= 70) return 'drop-shadow(0 0 2px #ffe77e)';
  return 'drop-shadow(0 0 2px #ff8f67)';
}

function render() {
  el.brightnessValue.textContent = `${state.brightness} 🔆`;
  el.brightnessNumber.textContent = `${state.brightness}`;
  el.energyNumber.textContent = `${state.energy}`;
  el.disciplineNumber.textContent = `${state.discipline}`;
  el.levelValue.textContent = `${state.level}`;
  el.xpValue.textContent = `${state.xp} / ${LEVEL_XP}`;
  el.streakValue.textContent = `${state.streak} 🔥 (${currentMultiplier().toFixed(2)}x)`;
  el.statusValue.textContent = `${state.status}`;
  el.statusDescription.textContent = `You are ${state.status}.`;
  el.statusDescription.className = 'status-box';

  if (state.status.includes('Burned Out')) {
  el.statusDescription.classList.add('status-burned');
  } else if (state.status.includes('Balanced')) {
  el.statusDescription.classList.add('status-balanced');
  } else if (state.status.includes('Locked In')) {
  el.statusDescription.classList.add('status-locked');
  } else if (state.status.includes('Unmotivated')) {
  el.statusDescription.classList.add('status-unmotivated');
  }
  if (el.tipsMessage) {
  el.tipsMessage.style.opacity = 0;
  setTimeout(() => {
    el.tipsMessage.textContent = getTipsForStatus(state.status);
    el.tipsMessage.style.opacity = 1;
  }, 150);
}

  el.brightnessBar.style.width = progressVisual(state.brightness, MAX_BRIGHTNESS);
  el.energyBar.style.width = progressVisual(state.energy, 150);
  el.disciplineBar.style.width = progressVisual(state.discipline, 150);
  el.brightnessBar.style.filter = brightnessFilter();

  renderEffects();
  renderLog();
}

function getTipsForStatus(status) {
  if (status === 'Burned Out') {
    return 'Focus on yourself. Get rest, drink water, and avoid overloading your schedule.';
  }

  if (status === 'Balanced') {
    return 'Keep going! Maintain your habits and stay consistent.';
  }

  if (status === 'Locked In') {
    return "You're in a great flow. Keep pushing but remember to rest when needed.";
  }

  if (status === 'Unmotivated') {
    return 'Start small. Even one completed task can build momentum.';
  }

  return 'Tips will appear here based on your status.';
}

function buildStatusDescription() {
  if (state.statusEffects.length === 0) {
    return 'Keep stacking habits for stronger bonuses.';
  }

  return state.statusEffects.join(' ');
}

function renderEffects() {
  el.activeEffects.innerHTML = '';
  const effects = state.statusEffects.length > 0 ? state.statusEffects : ['Balanced: all stats are slightly boosted.'];
  effects.forEach((effect) => {
    const li = document.createElement('li');
    li.textContent = effect;
    el.activeEffects.appendChild(li);
  });
}

function pushLog(entry) {
  state.log.unshift(`${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — ${entry}`);
  state.log = state.log.slice(0, 8);
}

function renderLog() {
  el.actionLog.innerHTML = '';

  if (state.log.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No actions yet. Start a habit to begin your run.';
    el.actionLog.appendChild(li);
    return;
  }

  state.log.forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    el.actionLog.appendChild(li);
  });
}

function spawnXpPopup(text) {
  const pop = document.createElement('span');
  pop.className = 'xp-pop';
  pop.textContent = text;
  pop.style.left = `${Math.random() * 50 + 25}vw`;
  pop.style.top = `${Math.random() * 35 + 35}vh`;
  el.xpPopLayer.appendChild(pop);

  window.setTimeout(() => {
    pop.remove();
  }, 900);
}

function animateButton(button) {
  button.style.transform = 'scale(0.98)';
  window.setTimeout(() => {
    button.style.transform = '';
  }, 120);
}

function resetDay() {
  state.brightness = 100;
  state.energy = 100;
  state.discipline = 100;
  state.streak = 0;
  state.xp = 0;
  state.level = 1;
  state.status = 'Balanced';
  state.statusEffects = [];
  state.log = [];
  state.counters = { lateSleep: 0, phoneBinge: 0, burnout: 0 };
  render();
}

el.resetButton.addEventListener('click', resetDay);

renderActionButtons();
updateStatus();
render();
const BASE_SCORE = 100;
const MAX_SCORE = 150;
const MIN_SCORE = 0;

const habits = [
  { id: 'sleep_7h', label: 'Slept at least 7 hours (+10)', points: 10 },
  { id: 'made_bed', label: 'Made the bed (+5)', points: 5 },
  { id: 'fruits_veggies', label: 'Ate fruits and veggies (+9)', points: 9 },
  { id: 'hydrated', label: 'Drank enough water (+8)', points: 8 },
  { id: 'nature_time', label: 'Got reconnected with the world (+7)', points: 7 },
  { id: 'study_block', label: 'Completed focused 45-minute study block (+12)', points: 12 },
  { id: 'exercise', label: 'Did 20+ minutes of exercise (+10)', points: 10 }
];

const debuffs = [
  { id: 'skip_meal', label: 'Skipped a meal (-12)', points: -12 },
  { id: 'up_past_2am', label: 'Stayed up past 2 AM (-15)', points: -15 },
  { id: 'doom_scroll', label: 'Doom-scrolled for over an hour (-8)', points: -8 },
  { id: 'no_breaks', label: 'No real break during study/work (-6)', points: -6 }
];

const habitForm = document.getElementById('habitForm');
const debuffForm = document.getElementById('debuffForm');
const scoreValue = document.getElementById('scoreValue');
const progressBar = document.getElementById('progressBar');
const progressShell = document.querySelector('.progress-shell');
const statusButton = document.getElementById('statusButton');
const statusMessage = document.getElementById('statusMessage');

function renderChecklist(items, formEl) {
  items.forEach((item) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'check-item';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = item.id;
    input.dataset.points = String(item.points);

    const text = document.createElement('span');
    text.textContent = item.label;

    wrapper.append(input, text);
    formEl.appendChild(wrapper);
  });
}

function getScore() {
  const allChecks = document.querySelectorAll('input[type="checkbox"]:checked');
  const delta = Array.from(allChecks).reduce((sum, input) => {
    return sum + Number(input.dataset.points || 0);
  }, 0);

  return Math.min(MAX_SCORE, Math.max(MIN_SCORE, BASE_SCORE + delta));
}

function getProgressColor(score) {
  if (score >= 90) return '#2ca94f';
  if (score >= 70) return '#c2b83e';
  return '#d64545';
}

function updateScoreUI() {
  const score = getScore();
  const pct = (score / MAX_SCORE) * 100;
  const color = getProgressColor(score);

  scoreValue.textContent = String(score);
  progressBar.style.width = `${pct}%`;
  progressBar.style.backgroundColor = color;
  progressShell.setAttribute('aria-valuenow', String(score));
}

function generateStatus() {
  const score = getScore();
  let message = '';

  if (score >= 120) {
    message = 'Heroic momentum! Your mind and body are in sync. Strategy: keep your strongest habit streak alive tomorrow.';
  } else if (score >= 95) {
    message = 'Steady and sharp. You are managing the day well. Strategy: add one deep-focus study sprint tomorrow to gain an edge.';
  } else if (score >= 70) {
    message = 'Your focus is wobbling a bit. Strategy: lock in sleep and hydration first thing tomorrow.';
  } else {
    message = 'Your focus is flagging. Strategy: prioritize a 20-minute walk tomorrow and a consistent bedtime tonight.';
  }

  statusMessage.textContent = `Score: ${score}. ${message}`;
}

renderChecklist(habits, habitForm);
renderChecklist(debuffs, debuffForm);

document.addEventListener('change', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.type === 'checkbox') {
    updateScoreUI();
  }
});

statusButton.addEventListener('click', generateStatus);

updateScoreUI();
