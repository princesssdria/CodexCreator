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
