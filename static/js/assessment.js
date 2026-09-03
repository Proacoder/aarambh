/**
 * AARAMBH - Visual Scenario & Psychometric Assessment Engine
 * Supports scenario cards, progress tracking, and navigation to Career DNA
 */

let currentQuestion = 0;
let answers = {};
let questions = [];

const optionIcons = ['🛠️', '🔬', '🎨', '🤝', '💼', '📊'];

async function initAssessment() {
  try {
    const profileRes = await fetch('/api/profile');
    if (!profileRes.ok) {
      window.location.href = '/onboarding';
      return;
    }
    const profile = await profileRes.json();
    if (!profile) {
      window.location.href = '/onboarding';
      return;
    }

    const qRes = await fetch('/api/assessment/questions');
    if (!qRes.ok) throw new Error('Failed to load questions');
    questions = await qRes.json();

    if (!questions || questions.length === 0) {
      console.error('No questions available');
      return;
    }

    renderQuestion(currentQuestion);
    setupEventListeners();
  } catch (error) {
    console.error('Assessment init error:', error);
    // Graceful fallback
    renderQuestion(currentQuestion);
  }
}

function renderQuestion(index) {
  const container = document.getElementById('question-container');
  if (!container) return;

  const question = questions[index];
  if (!question) return;

  const progressBar = document.getElementById('progress-bar-fill');
  if (progressBar) {
    const pct = ((index + 1) / questions.length) * 100;
    progressBar.style.width = `${pct}%`;
  }

  const progressText = document.getElementById('progress-text');
  if (progressText) {
    progressText.textContent = `Question ${index + 1} of ${questions.length}`;
  }

  const questionText = document.getElementById('question-text');
  if (questionText) {
    questionText.textContent = question.textEn || question.text || (window.CareerMitra ? CareerMitra.t(question.key) : 'Choose the activity you enjoy most:');
  }

  const optionsContainer = document.getElementById('options-container');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';

    const opts = question.options || [];
    if (opts.length > 0 && typeof opts[0] === 'object' && (opts[0].textEn || opts[0].text)) {
      // Render as rich visual choice cards
      optionsContainer.className = 'scenario-cards-list flex-column gap-2 mt-4';
      opts.forEach((opt, optIdx) => {
        const val = optIdx + 1;
        const isSelected = answers[question.id] === val;
        const card = document.createElement('div');
        card.className = `card p-3 glass-card hover-lift flex align-center gap-3 cursor-pointer ${isSelected ? 'selected' : ''}`;
        card.style.border = isSelected ? '2px solid var(--gold)' : '1px solid var(--border)';
        card.style.background = isSelected ? 'rgba(217, 164, 65, 0.12)' : 'var(--bg-card)';
        card.style.borderRadius = '12px';

        const icon = optionIcons[optIdx % optionIcons.length];
        const text = opt.textEn || opt.text || opt;

        card.innerHTML = `
          <div style="font-size: 1.5rem; width: 40px; height: 40px; border-radius: 8px; background: rgba(217,164,65,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${icon}
          </div>
          <div style="flex: 1; font-weight: 500; font-size: 0.95rem;">${text}</div>
          <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}; display: flex; align-items: center; justify-content: center;">
            ${isSelected ? '<div style="width: 10px; height: 10px; border-radius: 50%; background: var(--gold);"></div>' : ''}
          </div>
        `;

        card.addEventListener('click', () => {
          selectOption(question.id, val);
        });

        optionsContainer.appendChild(card);
      });
    } else {
      // Fallback 1 to 5 rating scale
      optionsContainer.className = 'likert-scale mt-4 flex justify-between gap-2';
      for (let i = 1; i <= 5; i++) {
        const optionBtn = document.createElement('button');
        optionBtn.type = 'button';
        optionBtn.className = `btn btn-outline ${answers[question.id] === i ? 'btn-primary' : ''}`;
        optionBtn.textContent = i;
        optionBtn.dataset.value = i;
        optionBtn.dataset.qid = question.id;
        optionBtn.style.flex = '1';

        optionBtn.addEventListener('click', () => {
          selectOption(question.id, i);
        });

        optionsContainer.appendChild(optionBtn);
      }
    }
  }

  const backBtn = document.getElementById('btn-prev');
  if (backBtn) {
    backBtn.disabled = index === 0;
  }

  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) {
    nextBtn.textContent = index === questions.length - 1
      ? 'Unlock My Career DNA 🧬'
      : 'Next Question →';
    nextBtn.disabled = !answers[question.id];
  }
}

function selectOption(questionId, value) {
  answers[questionId] = parseInt(value, 10);
  renderQuestion(currentQuestion);

  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) nextBtn.disabled = false;
}

function nextQuestion() {
  const question = questions[currentQuestion];
  if (!answers[question.id]) return;

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion(currentQuestion);
  } else {
    submitAssessment();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion(currentQuestion);
  }
}

async function submitAssessment() {
  const btn = document.getElementById('btn-next');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Analyzing Career DNA...';
  }

  try {
    const res = await fetch('/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        sessionStorage.setItem('cm-first-match', data.matches[0].careerId);
      }
    }

    // Direct to Career DNA visualizer
    window.location.href = '/career-dna';
  } catch (error) {
    console.error('Submit error:', error);
    window.location.href = '/career-dna';
  }
}

function setupEventListeners() {
  document.getElementById('btn-next')?.addEventListener('click', nextQuestion);
  document.getElementById('btn-prev')?.addEventListener('click', prevQuestion);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('question-container')) {
    initAssessment();
  }
});
