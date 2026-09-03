let currentQuestion = 0;
let answers = {};
let questions = [];

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
    alert(CareerMitra.t('error_loading_assessment') || 'Error loading assessment. Please try again.');
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
    progressText.textContent = CareerMitra.t('assessment_progress', { current: index + 1, total: questions.length });
  }

  const questionText = document.getElementById('question-text');
  if (questionText) {
    questionText.textContent = CareerMitra.t(question.key);
  }

  const optionsContainer = document.getElementById('options-container');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const optionBtn = document.createElement('button');
      optionBtn.type = 'button';
      optionBtn.className = 'option';
      optionBtn.textContent = i;
      optionBtn.dataset.value = i;
      optionBtn.dataset.qid = question.id;
      optionBtn.setAttribute('role', 'radio');
      optionBtn.setAttribute('aria-checked', answers[question.id] === i ? 'true' : 'false');

      if (answers[question.id] === i) {
        optionBtn.classList.add('selected');
      }

      optionsContainer.appendChild(optionBtn);
    }
  }

  const backBtn = document.getElementById('btn-prev');
  if (backBtn) {
    backBtn.disabled = index === 0;
  }

  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) {
    nextBtn.textContent = index === questions.length - 1
      ? (CareerMitra.t('see_results_btn') || 'See My Matches')
      : (CareerMitra.t('next_btn') || 'Next');
    nextBtn.disabled = !answers[question.id];
  }

  container.classList.remove('slide-in-right', 'slide-out-left', 'slide-in-left', 'slide-out-right');
  void container.offsetWidth; // trigger reflow
  container.classList.add('slide-in-right');
}

function selectOption(questionId, value) {
  answers[questionId] = parseInt(value, 10);

  document.querySelectorAll('#options-container .option').forEach(btn => {
    const isSelected = btn.dataset.value == value;
    btn.classList.toggle('selected', isSelected);
    btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
  });

  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) nextBtn.disabled = false;
}

function nextQuestion() {
  const question = questions[currentQuestion];
  if (!answers[question.id]) return;

  const container = document.getElementById('question-container');

  if (currentQuestion < questions.length - 1) {
    container.classList.add('slide-out-left');
    setTimeout(() => {
      currentQuestion++;
      renderQuestion(currentQuestion);
    }, 200);
  } else {
    submitAssessment();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    const container = document.getElementById('question-container');
    container.classList.add('slide-out-right');
    setTimeout(() => {
      currentQuestion--;
      renderQuestion(currentQuestion);
      container.classList.remove('slide-in-right');
      container.classList.add('slide-in-left');
    }, 200);
  }
}

async function submitAssessment() {
  try {
    const btn = document.getElementById('btn-next');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner"></span>';
    }

    const res = await fetch('/api/assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });

    if (!res.ok) throw new Error('Failed to submit assessment');

    const data = await res.json();
    if (data.matches && data.matches.length > 0) {
      sessionStorage.setItem('cm-first-match', data.matches[0].careerId);
    }

    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Submit error:', error);
    alert(CareerMitra.t('error_submitting') || 'Error submitting answers.');
    const btn = document.getElementById('btn-next');
    if (btn) {
      btn.disabled = false;
      btn.textContent = CareerMitra.t('see_results_btn') || 'See My Matches';
    }
  }
}

function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const option = e.target.closest('#options-container .option');
    if (option) {
      selectOption(option.dataset.qid, option.dataset.value);
    }

    if (e.target.closest('#btn-next')) {
      nextQuestion();
    }
    if (e.target.closest('#btn-prev')) {
      prevQuestion();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const nextBtn = document.getElementById('btn-next');
      if (nextBtn && !nextBtn.disabled) nextQuestion();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('question-container')) {
    initAssessment();
  }
});
