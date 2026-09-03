/**
 * AARAMBH - Visual Scenario & Psychometric Assessment Engine
 * Supports scenario cards, progress tracking, and navigation to Career DNA
 */

let currentQuestion = 0;
let answers = {};
let questions = [];

const optionIcons = ['🛠️', '🔬', '🎨', '🤝', '💼', '📊'];

// Hardcoded fallback questions in case API is unreachable
const LOCAL_FALLBACK_QUESTIONS = [
  { id: 1, key: "q1", textEn: "1. What kind of activities do you enjoy most in your free time?", options: [
    { id: 1, textEn: "🛠️ Building, repairing machinery or fixing electrical tools", domain: "realistic" },
    { id: 2, textEn: "🔬 Solving scientific puzzles, math problems or researching online", domain: "investigative" },
    { id: 3, textEn: "🎨 Drawing, painting, writing stories, music or video editing", domain: "artistic" },
    { id: 4, textEn: "🤝 Helping neighbors, teaching children, or community service", domain: "social" }
  ]},
  { id: 2, key: "q2", textEn: "2. Which work environment excites you the most?", options: [
    { id: 1, textEn: "🌾 Outdoor field, engineering site, workshop or farm", domain: "realistic" },
    { id: 2, textEn: "💻 Research lab, computer software workstation, or tech desk", domain: "investigative" },
    { id: 3, textEn: "🎬 Creative studio, media house, or design office", domain: "artistic" },
    { id: 4, textEn: "🏫 Hospital, primary health center, school, or NGO office", domain: "social" }
  ]},
  { id: 3, key: "q3", textEn: "3. How do you approach solving a complex problem?", options: [
    { id: 1, textEn: "🔧 Hands-on testing, opening up components and physical trial", domain: "realistic" },
    { id: 2, textEn: "📊 Data analysis, logical deduction, and step-by-step investigation", domain: "investigative" },
    { id: 3, textEn: "💼 Strategic negotiation, team direction, and decisive action", domain: "enterprising" },
    { id: 4, textEn: "📋 Checking rules, standard procedures, and organized documentation", domain: "conventional" }
  ]},
  { id: 4, key: "q4", textEn: "4. Which subjects or skills did you naturally excel at in school?", options: [
    { id: 1, textEn: "📐 Physics, Applied Mechanics, Technical Drawing or Workshop", domain: "realistic" },
    { id: 2, textEn: "🧪 Chemistry, Biology, Mathematics or Computer Coding", domain: "investigative" },
    { id: 3, textEn: "🗣️ Languages, History, Civics, Group Discussions & Public Speaking", domain: "social" },
    { id: 4, textEn: "📑 Bookkeeping, Accounting, Economics, or Office Practices", domain: "conventional" }
  ]},
  { id: 5, key: "q5", textEn: "5. Where do you see yourself making the biggest impact in 5 years?", options: [
    { id: 1, textEn: "⚙️ Managing an engineering workshop, tech unit or project", domain: "realistic" },
    { id: 2, textEn: "🔬 Leading medical, agricultural, or software research", domain: "investigative" },
    { id: 3, textEn: "🏪 Running your own enterprise, retail business or venture", domain: "enterprising" },
    { id: 4, textEn: "🏛️ Serving as a government civil servant or MPSC administrative officer", domain: "conventional" }
  ]},
  { id: 6, key: "q6", textEn: "6. How comfortable are you with new technology and physical equipment?", options: [
    { id: 1, textEn: "🛠️ Very eager — I love operating engines, electronic circuits & tools", domain: "realistic" },
    { id: 2, textEn: "💻 Fascinated — I like understanding the internal code & logic", domain: "investigative" },
    { id: 3, textEn: "🎨 Creative — I like using digital tools for art, animation & media", domain: "artistic" },
    { id: 4, textEn: "📑 Systematic — I prefer structured office software & Excel tools", domain: "conventional" }
  ]},
  { id: 7, key: "q7", textEn: "7. When interacting with people in your community, what role suits you best?", options: [
    { id: 1, textEn: "🧑‍🏫 Counselor / Teacher — listening, guiding, healthcare & advice", domain: "social" },
    { id: 2, textEn: "📢 Organizer / Leader — convincing others, driving campaigns", domain: "enterprising" },
    { id: 3, textEn: "🛠️ Specialist — fixing technical breakdown or infrastructure", domain: "realistic" },
    { id: 4, textEn: "📝 Accountant — managing funds, maintaining lists & records", domain: "conventional" }
  ]},
  { id: 8, key: "q8", textEn: "8. How do you feel about managing financial records and budgets?", options: [
    { id: 1, textEn: "📊 Very meticulous — I enjoy precise accounting & budgeting", domain: "conventional" },
    { id: 2, textEn: "💰 Business-minded — I focus on profit margins, sales & expansion", domain: "enterprising" },
    { id: 3, textEn: "🔬 Analytical — I treat budget data as numbers to find insights", domain: "investigative" },
    { id: 4, textEn: "🤝 Community-focused — I ensure funds directly benefit families", domain: "social" }
  ]},
  { id: 9, key: "q9", textEn: "9. When expressing your original ideas, which medium do you prefer?", options: [
    { id: 1, textEn: "🎨 Visual Arts / Design — posters, videos, music or UI design", domain: "artistic" },
    { id: 2, textEn: "📐 Physical Models — building a working prototype or 3D model", domain: "realistic" },
    { id: 3, textEn: "📝 Written Reports — research paper, documentation or technical essay", domain: "investigative" },
    { id: 4, textEn: "🎤 Speeches & Presentations — pitching in front of an audience", domain: "enterprising" }
  ]},
  { id: 10, key: "q10", textEn: "10. In a group project or development drive, what is your strength?", options: [
    { id: 1, textEn: "📢 Motivational Leadership — inspiring team members & delegating", domain: "enterprising" },
    { id: 2, textEn: "🛠️ Execution & Construction — doing actual physical work reliably", domain: "realistic" },
    { id: 3, textEn: "🤝 Empathy & Harmony — keeping everyone united & caring for all", domain: "social" },
    { id: 4, textEn: "📝 Record Keeping — keeping track of costs & official letters", domain: "conventional" }
  ]}
];

async function initAssessment() {
  // Always load questions first — don't block on profile
  try {
    const qRes = await fetch('/api/assessment/questions');
    if (qRes.ok) {
      const data = await qRes.json();
      if (Array.isArray(data) && data.length > 0) {
        questions = data;
      }
    }
  } catch (e) {
    console.warn('API questions fetch failed, using local fallback');
  }

  // If API returned nothing, use hardcoded local fallback
  if (!questions || questions.length === 0) {
    questions = LOCAL_FALLBACK_QUESTIONS;
  }

  renderQuestion(currentQuestion);
  setupEventListeners();
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
