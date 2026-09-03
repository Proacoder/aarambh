/**
 * AARAMBH - Visual Scenario & Psychometric Assessment Engine
 * Supports scenario cards, progress tracking, language switching & Career DNA integration
 */

let currentQuestion = 0;
let answers = {};
let questions = [];

const optionIcons = ['🛠️', '🔬', '🎨', '🤝', '💼', '📊'];

// Full 10 bilingual questions fallback
const LOCAL_FALLBACK_QUESTIONS = [
  {
    id: 1, key: "q1",
    textEn: "1. What kind of activities do you enjoy most in your free time?",
    textMr: "१. तुमच्या फावल्या वेळेत तुम्हाला कोणत्या गोष्टी करायला सर्वात जास्त आवडतात?",
    options: [
      { id: 1, textEn: "🛠️ Building, repairing machinery or fixing electrical tools", textMr: "🛠️ यंत्रसामग्री दुरुस्त करणे किंवा इलेक्ट्रिकल उपकरणे जोडणे", domain: "realistic" },
      { id: 2, textEn: "🔬 Solving scientific puzzles, math problems or researching online", textMr: "🔬 वैज्ञानिक कोडी सोडवणे, गणिताचे प्रश्न किंवा ऑनलाइन संशोधन", domain: "investigative" },
      { id: 3, textEn: "🎨 Drawing, painting, writing stories, music or video editing", textMr: "🎨 चित्रे काढणे, कथा लिहिणे, संगीत किंवा व्हिडिओ संपादन", domain: "artistic" },
      { id: 4, textEn: "🤝 Helping neighbors, teaching children, or community service", textMr: "🤝 शेजाऱ्यांना मदत करणे, मुलांना शिकवणे किंवा समाजसेवा", domain: "social" }
    ]
  },
  {
    id: 2, key: "q2",
    textEn: "2. Which work environment excites you the most?",
    textMr: "२. कोणते कामाचे वातावरण तुम्हाला सर्वात जास्त आकर्षित करते?",
    options: [
      { id: 1, textEn: "🌾 Outdoor field, engineering site, workshop or farm", textMr: "🌾 शेतजमीन, अभियांत्रिकी साइट, वर्कशॉप किंवा मैदान", domain: "realistic" },
      { id: 2, textEn: "💻 Research lab, computer software workstation, or tech desk", textMr: "💻 संशोधन प्रयोगशाळा, संगणक सॉफ्टवेअर वर्कस्टेशन", domain: "investigative" },
      { id: 3, textEn: "🎬 Creative studio, media house, or design office", textMr: "🎬 क्रिएटिव्ह स्टुडिओ, मीडिया हाऊस किंवा डिझाईन ऑफिस", domain: "artistic" },
      { id: 4, textEn: "🏫 Hospital, primary health center, school, or NGO office", textMr: "🏫 रुग्णालय, प्राथमिक आरोग्य केंद्र, शाळा किंवा स्वयंसेवी संस्था", domain: "social" }
    ]
  },
  {
    id: 3, key: "q3",
    textEn: "3. How do you approach solving a complex problem?",
    textMr: "३. एखादी गुंतागुंतीची समस्या सोडवताना तुम्ही कसा मार्ग निवडता?",
    options: [
      { id: 1, textEn: "🔧 Hands-on testing, opening up components and physical trial", textMr: "🔧 स्वतः हाताने हाताळून, भाग उघडून प्रत्यक्ष प्रयोग करणे", domain: "realistic" },
      { id: 2, textEn: "📊 Data analysis, logical deduction, and step-by-step investigation", textMr: "📊 डेटा विश्लेषण, तर्कशुद्ध विचार आणि टप्प्याटप्प्याने तपास", domain: "investigative" },
      { id: 3, textEn: "💼 Strategic negotiation, team direction, and decisive action", textMr: "💼 धोरणात्मक वाटाघाटी, नेतृत्व आणि जलद निर्णय", domain: "enterprising" },
      { id: 4, textEn: "📋 Checking rules, standard procedures, and organized documentation", textMr: "📋 नियम, मानक पद्धती आणि दस्तऐवजीकरण तपासणे", domain: "conventional" }
    ]
  },
  {
    id: 4, key: "q4",
    textEn: "4. Which subjects or skills did you naturally excel at in school?",
    textMr: "४. शाळेत असताना कोणत्या विषयात किंवा कौशल्यात तुम्ही आपोआप पुढे होतात?",
    options: [
      { id: 1, textEn: "📐 Physics, Applied Mechanics, Technical Drawing or Workshop", textMr: "📐 भौतिकशास्त्र, यांत्रिकी, तांत्रिक आलेखन किंवा वर्कशॉप", domain: "realistic" },
      { id: 2, textEn: "🧪 Chemistry, Biology, Mathematics or Computer Coding", textMr: "🧪 रसायनशास्त्र, जीवशास्त्र, गणित किंवा कोडिंग", domain: "investigative" },
      { id: 3, textEn: "🗣️ Languages, History, Civics, Group Discussions & Public Speaking", textMr: "🗣️ भाषा, इतिहास, नागरिकशास्त्र, वादविवाद आणि भाषण", domain: "social" },
      { id: 4, textEn: "📑 Bookkeeping, Accounting, Economics, or Office Practices", textMr: "📑 बहीखाता, लेखाशास्त्र, अर्थशास्त्र किंवा कार्यालयीन पद्धती", domain: "conventional" }
    ]
  },
  {
    id: 5, key: "q5",
    textEn: "5. Where do you see yourself making the biggest impact in 5 years?",
    textMr: "५. ५ वर्षांनंतर स्वतःला कुठे काम करताना पाहताना तुम्हाला आनंद होईल?",
    options: [
      { id: 1, textEn: "⚙️ Managing an engineering workshop, tech unit or project", textMr: "⚙️ इंजिनिअरिंग वर्कशॉप, टेक युनिट किंवा प्रकल्प व्यवस्थापन", domain: "realistic" },
      { id: 2, textEn: "🔬 Leading medical, agricultural, or software research", textMr: "🔬 वैद्यकीय, कृषी किंवा सॉफ्टवेअर संशोधात नेतृत्व करणे", domain: "investigative" },
      { id: 3, textEn: "🏪 Running your own enterprise, retail business or venture", textMr: "🏪 स्वतःचा व्यवसाय, व्यापार किंवा संस्था चालवणे", domain: "enterprising" },
      { id: 4, textEn: "🏛️ Serving as a government civil servant or MPSC administrative officer", textMr: "🏛️ प्रशासकीय अधिकारी किंवा एमपीएससी अधिकारी म्हणून सेवा", domain: "conventional" }
    ]
  },
  {
    id: 6, key: "q6",
    textEn: "6. How comfortable are you with new technology and physical equipment?",
    textMr: "६. नवीन तंत्रज्ञान आणि मशिनरी वापरताना तुम्हाला काय वाटते?",
    options: [
      { id: 1, textEn: "🛠️ Very eager — I love operating engines, electronic circuits & tools", textMr: "🛠️ खूप उत्सुक — मला इंजिन, सर्किट आणि टूल्स वापरायला आवडतात", domain: "realistic" },
      { id: 2, textEn: "💻 Fascinated — I like understanding the internal code & logic", textMr: "💻 उत्सुक — मला त्याच्यामागील लॉजिक आणि कोड समजायला आवडतो", domain: "investigative" },
      { id: 3, textEn: "🎨 Creative — I like using digital tools for art, animation & media", textMr: "🎨 सर्जनशील — मला कला, ॲनिमेशन आणि फोटोग्राफीसाठी साधने आवडतात", domain: "artistic" },
      { id: 4, textEn: "📑 Systematic — I prefer structured office software & Excel tools", textMr: "📑 पद्धतशीर — मला एक्सेल, फायलिंग आणि ऑफिस सॉफ्टवेअर आवडतात", domain: "conventional" }
    ]
  },
  {
    id: 7, key: "q7",
    textEn: "7. When interacting with people in your community, what role suits you best?",
    textMr: "७. तुमच्या गावात किंवा शहरात लोकांसोबत काम करताना तुमची भूमिका काय असते?",
    options: [
      { id: 1, textEn: "🧑‍🏫 Counselor / Teacher — listening, guiding, healthcare & advice", textMr: "🧑‍🏫 मार्गदर्शक / शिक्षक — ऐकून घेणे, सल्ला देणे, आरोग्य आणि शिक्षण", domain: "social" },
      { id: 2, textEn: "📢 Organizer / Leader — convincing others, driving campaigns", textMr: "📢 संघटक / नेता — लोकांना पटवून देणे, कार्यक्रम आणि नेतृत्व", domain: "enterprising" },
      { id: 3, textEn: "🛠️ Specialist — fixing technical breakdown or infrastructure", textMr: "🛠️ तज्ज्ञ — तांत्रिक अडचणी दुरुस्त करणे किंवा पायाभूत कामे", domain: "realistic" },
      { id: 4, textEn: "📝 Accountant — managing funds, maintaining lists & records", textMr: "📝 हिशोबनीस — निधी व्यवस्थापन, याद्या आणि अधिकृत नोंदी ठेवणे", domain: "conventional" }
    ]
  },
  {
    id: 8, key: "q8",
    textEn: "8. How do you feel about managing financial records and budgets?",
    textMr: "८. आर्थिक नोंदी, कागदपत्रे आणि नियमांचे पालन करण्याबद्दल तुमचे काय मत आहे?",
    options: [
      { id: 1, textEn: "📊 Very meticulous — I enjoy precise accounting & budgeting", textMr: "📊 अत्यंत अचूक — मला अचूक हिशोब, फायलिंग आणि बजेट आवडते", domain: "conventional" },
      { id: 2, textEn: "💰 Business-minded — I focus on profit margins, sales & expansion", textMr: "💰 व्यवसायिक — माझे लक्ष नफा, विक्री आणि वाढीवर असते", domain: "enterprising" },
      { id: 3, textEn: "🔬 Analytical — I treat budget data as numbers to find insights", textMr: "🔬 विश्लेषणात्मक — मी निष्कर्षांसाठी आकडेवारीचा अभ्यास करतो", domain: "investigative" },
      { id: 4, textEn: "🤝 Community-focused — I ensure funds directly benefit families", textMr: "🤝 समाजकेंद्रित — निधीचा गरजूंना फायदा होईल याची मी काळजी घेतो", domain: "social" }
    ]
  },
  {
    id: 9, key: "q9",
    textEn: "9. When expressing your original ideas, which medium do you prefer?",
    textMr: "९. तुमच्या कल्पना मांडण्यासाठी तुम्ही कोणते माध्यम निवडाल?",
    options: [
      { id: 1, textEn: "🎨 Visual Arts / Design — posters, videos, music or UI design", textMr: "🎨 दृश्य कला / डिझाईन — पोस्टर, व्हिडिओ, संगीत, हस्तकला", domain: "artistic" },
      { id: 2, textEn: "📐 Physical Models — building a working prototype or 3D model", textMr: "📐 भौतिक मॉडेल्स — काम करणारा प्रोटोटाइप किंवा मॉडेल तयार करणे", domain: "realistic" },
      { id: 3, textEn: "📝 Written Reports — research paper, documentation or technical essay", textMr: "📝 लिखित अहवाल — संशोधन पेपर, दस्तऐवजीकरण किंवा निबंध", domain: "investigative" },
      { id: 4, textEn: "🎤 Speeches & Presentations — pitching in front of an audience", textMr: "🎤 भाषणे आणि सादरीकरण — श्रोत्यांसमोर मत मांडणे", domain: "enterprising" }
    ]
  },
  {
    id: 10, key: "q10",
    textEn: "10. In a group project or development drive, what is your strength?",
    textMr: "१०. गटात किंवा विकासकामात सहभागी होताना तुमची सर्वात मोठी ताकद कोणती असते?",
    options: [
      { id: 1, textEn: "📢 Motivational Leadership — inspiring team members & delegating", textMr: "📢 प्रेरणादायी नेतृत्व — सहकाऱ्यांना प्रोत्साहन देणे आणि नियोजन", domain: "enterprising" },
      { id: 2, textEn: "🛠️ Execution & Construction — doing actual physical work reliably", textMr: "🛠️ प्रत्यक्ष अंमलबजावणी — प्रत्यक्ष काम विश्वासाने पूर्ण करणे", domain: "realistic" },
      { id: 3, textEn: "🤝 Empathy & Harmony — keeping everyone united & caring for all", textMr: "🤝 एकता आणि सहकार्य — सर्वांना एकत्र ठेवणे आणि काळजी घेणे", domain: "social" },
      { id: 4, textEn: "📝 Record Keeping — keeping track of costs & official letters", textMr: "📝 नोंदवही व्यवस्थापन — उपस्थिती, खर्च आणि पत्रव्यवहार नोंदवणे", domain: "conventional" }
    ]
  }
];

async function initAssessment() {
  try {
    const qRes = await fetch('/api/assessment/questions');
    if (qRes.ok) {
      const data = await qRes.json();
      if (Array.isArray(data) && data.length > 0) {
        questions = data;
      }
    }
  } catch (e) {
    console.warn('API questions fetch failed, using local fallback:', e);
  }

  if (!questions || questions.length === 0) {
    questions = LOCAL_FALLBACK_QUESTIONS;
  }

  renderQuestion(currentQuestion);
  setupEventListeners();

  // Re-render when language changes
  document.addEventListener('cm-lang-changed', () => {
    renderQuestion(currentQuestion);
  });
}

function getActiveLang() {
  return (window.CareerMitra && window.CareerMitra.lang) || localStorage.getItem('cm-lang') || 'en';
}

function renderQuestion(index) {
  const container = document.getElementById('question-container');
  if (!container) return;

  const question = questions[index];
  if (!question) return;

  const lang = getActiveLang();

  // Progress Bar & Count
  const progressBar = document.getElementById('progress-bar-fill');
  if (progressBar) {
    const pct = ((index + 1) / questions.length) * 100;
    progressBar.style.width = `${pct}%`;
  }

  const progressText = document.getElementById('progress-text');
  if (progressText) {
    if (lang === 'mr') {
      progressText.textContent = `प्रश्न ${index + 1} पैकी ${questions.length}`;
    } else if (lang === 'hi') {
      progressText.textContent = `प्रश्न ${index + 1} में से ${questions.length}`;
    } else {
      progressText.textContent = `Question ${index + 1} of ${questions.length}`;
    }
  }

  // Question Text
  const questionText = document.getElementById('question-text');
  if (questionText) {
    let qStr = '';
    if (lang === 'mr' && question.textMr) {
      qStr = question.textMr;
    } else if (lang === 'hi' && question.textHi) {
      qStr = question.textHi;
    } else {
      qStr = question.textEn || question.text || (window.CareerMitra ? CareerMitra.t(question.key) : 'Choose the activity you enjoy most:');
    }
    questionText.textContent = qStr;
  }

  // Options Container
  const optionsContainer = document.getElementById('options-container');
  if (optionsContainer) {
    optionsContainer.innerHTML = '';

    const opts = question.options || [];
    if (opts.length > 0 && typeof opts[0] === 'object') {
      // Render visual choice cards
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
        
        let optText = '';
        if (lang === 'mr' && opt.textMr) {
          optText = opt.textMr;
        } else if (lang === 'hi' && opt.textHi) {
          optText = opt.textHi;
        } else {
          optText = opt.textEn || opt.text || (typeof opt === 'string' ? opt : `Option ${val}`);
        }

        card.innerHTML = `
          <div style="font-size: 1.5rem; width: 40px; height: 40px; border-radius: 8px; background: rgba(217,164,65,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${icon}
          </div>
          <div style="flex: 1; font-weight: 500; font-size: 0.95rem; color: var(--earth-brown);">${optText}</div>
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
      // Likert 1-5 fallback
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
    if (index === questions.length - 1) {
      nextBtn.textContent = lang === 'mr' ? 'माझे करिअर DNA उघडा 🧬' : 'Unlock My Career DNA 🧬';
    } else {
      nextBtn.textContent = lang === 'mr' ? 'पुढील प्रश्न →' : 'Next Question →';
    }
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

// Guaranteed execution even if DOMContentLoaded has already fired
function startAssessmentEngine() {
  if (document.getElementById('question-container')) {
    initAssessment();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startAssessmentEngine);
} else {
  startAssessmentEngine();
}
