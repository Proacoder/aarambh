/* ==========================================================================
   CareerMitra — SkillQuest Gamified Missions Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const MISSIONS = [
    {
      id: "m1",
      badge: "FOUNDATION",
      title: "MS-CIT Digital Literacy Challenge",
      titleMr: "एमएस-सीआयटी डिजिटल साक्षरता चाचणी",
      desc: "Master essential spreadsheets, basic word processing, and Maharashtra government citizen portals.",
      descMr: "महाराष्ट्र शासनाचे नागरिक पोर्टल आणि कॉम्प्युटर मूलभूत कौशल्यांची चाचणी.",
      xp: 150,
      question: "महाराष्ट्र शासनाचे उत्पन्न व अधिवास दाखल्यांसाठी अधिकृत पोर्टल कोणते आहे?",
      questionEn: "What is the official Maharashtra government portal for online income and domicile certificates?",
      options: [
        { text: "आपले सरकार (Aaple Sarkar)", correct: true },
        { text: "फेसबुक (Facebook)", correct: false },
        { text: "आयआरसीटीसी (IRCTC)", correct: false },
        { text: "अॅमेझॉन (Amazon)", correct: false }
      ],
      badgeReward: "b1"
    },
    {
      id: "m2",
      badge: "CAREER DNA",
      title: "RIASEC Career Discovery Quiz",
      titleMr: "रियासेक (RIASEC) करिअर शोध चाचणी",
      desc: "Discover how realistic, investigative, and artistic strengths translate into high-paying Maharashtra jobs.",
      descMr: "तुमच्या आवडीनिवडीनुसार कोणत्या तांत्रिक किंवा वैद्यकीय क्षेत्रात संधी आहेत ते ओळखा.",
      xp: 150,
      question: "रियासेक (RIASEC) पद्धतीमध्ये 'रिअॅलिस्टिक (R)' क्षेत्रातील काम कोणत्या स्वरूपाचे असते?",
      questionEn: "In RIASEC framework, what does the 'Realistic' domain primarily involve?",
      options: [
        { text: "यंत्रे, टूल्स, मशिनरी आणि प्रॅक्टिकल काम (Tools, Machinery & Hands-on work)", correct: true },
        { text: "केवळ कविता लिहिणे (Only poetry writing)", correct: false },
        { text: "केवळ शेअर मार्केट ट्रेडिंग (Only stock trading)", correct: false },
        { text: "काहीही न करणे (Idle work)", correct: false }
      ],
      badgeReward: "b2"
    },
    {
      id: "m3",
      badge: "FINANCIAL AID",
      title: "MahaDBT & Scholarship Packet Quest",
      titleMr: "महाडीबीटी शिष्यवृत्ती कागदपत्र मिशन",
      desc: "Assemble Domicile Certificate, Income Certificate (< ₹8 Lakhs), and Aadhaar-Bank link.",
      descMr: "ईबीसी ५०% फी सवलतीसाठी लागणाऱ्या मूळ प्रमाणपत्रांची अचूक माहिती.",
      xp: 150,
      question: "महाडीबीटीवर ईबीसी (EBC) फी सवलतीसाठी कोणाचा उत्पन्नाचा दाखला ग्राह्य धरला जातो?",
      questionEn: "Whose income certificate is officially accepted for EBC fee reimbursement on MahaDBT?",
      options: [
        { text: "तहसीलदार किंवा उपविभागीय अधिकारी (Tahsildar / SDO)", correct: true },
        { text: "शाळेचे मुख्याध्यापक (School Principal only)", correct: false },
        { text: "स्थानिक किराणा दुकानदार (Local shopkeeper)", correct: false },
        { text: "कोणताही साध्या कागदावर सही (Plain paper note)", correct: false }
      ],
      badgeReward: "b3"
    },
    {
      id: "m4",
      badge: "REGIONAL GK",
      title: "Maharashtra Industrial Hub Knowledge",
      titleMr: "महाराष्ट्र औद्योगिक केंद्र ज्ञान चाचणी",
      desc: "Identify key MIDC clusters for automobile, biotechnology, and agricultural technology.",
      descMr: "चाकण, औरंगाबाद आणि नागपूर MIDC मधील नोकरीच्या संधी ओळखा.",
      xp: 150,
      question: "महाराष्ट्राची 'ऑटोमोबाईल राजधानी' म्हणून कोणती MIDC ओळखली जाते?",
      questionEn: "Which industrial area is celebrated as the Automobile Capital of Maharashtra?",
      options: [
        { text: "चाकण - पिंपरी चिंचवड / पुणे (Chakan - Pune)", correct: true },
        { text: "गोवा (Goa)", correct: false },
        { text: "शिमला (Shimla)", correct: false },
        { text: "चंदिगढ (Chandigarh)", correct: false }
      ],
      badgeReward: "b4"
    }
  ];

  const BADGES = [
    { id: "b1", icon: "🌱", title: "Digital Pioneer", titleMr: "डिजिटल पायनियर", desc: "Completed MS-CIT Quest" },
    { id: "b2", icon: "🧬", title: "DNA Explorer", titleMr: "करिअर शोधक", desc: "Mastered RIASEC Profile" },
    { id: "b3", icon: "💰", title: "Scholarship Pro", titleMr: "शिष्यवृत्ती मास्टर", desc: "MahaDBT Doc Expert" },
    { id: "b4", icon: "🏆", title: "Maharashtra Star", titleMr: "महाराष्ट्र स्टार", desc: "Aced Regional Knowledge" }
  ];

  function getStorageData() {
    try {
      return JSON.parse(localStorage.getItem('cm-skillquest') || '{"completedMissions":[], "xp":0}');
    } catch {
      return { completedMissions: [], xp: 0 };
    }
  }

  function saveStorageData(data) {
    localStorage.setItem('cm-skillquest', JSON.stringify(data));
  }

  function getRank(xp) {
    if (xp >= 600) return { rank: "Level 4 Master Architect", rankMr: "पातळी ४: करिअर मास्टर", next: 600, pct: 100 };
    if (xp >= 450) return { rank: "Level 3 Pioneer", rankMr: "पातळी ३: पायनियर", next: 600, pct: Math.round((xp / 600) * 100) };
    if (xp >= 300) return { rank: "Level 2 Explorer", rankMr: "पातळी २: शोधक", next: 450, pct: Math.round((xp / 450) * 100) };
    if (xp >= 150) return { rank: "Level 1 Starter", rankMr: "पातळी १: आरंभ", next: 300, pct: Math.round((xp / 300) * 100) };
    return { rank: "Novice", rankMr: "नवशिका (Novice)", next: 150, pct: 0 };
  }

  function getActiveLang() {
    return (window.CareerMitra && window.CareerMitra.lang) || localStorage.getItem('cm-lang') || 'mr';
  }

  function renderSkillQuest() {
    const data = getStorageData();
    const lang = getActiveLang();
    const rankInfo = getRank(data.xp);

    // 1. Update Rank & XP UI
    const rankEl = document.getElementById('sq-rank-title');
    const xpTextEl = document.getElementById('sq-xp-text');
    const xpProgressEl = document.getElementById('sq-xp-progress');

    if (rankEl) rankEl.textContent = lang === 'mr' ? rankInfo.rankMr : rankInfo.rank;
    if (xpTextEl) xpTextEl.textContent = `${data.xp} / 600 XP`;
    if (xpProgressEl) xpProgressEl.style.width = `${rankInfo.pct}%`;

    // 2. Render Missions
    const container = document.getElementById('sq-missions-container');
    if (container) {
      container.innerHTML = MISSIONS.map(m => {
        const isDone = data.completedMissions.includes(m.id);
        const title = lang === 'mr' ? m.titleMr : m.title;
        const desc = lang === 'mr' ? m.descMr : m.desc;

        return `
          <div class="card p-4 glass-card mb-3 slide-up" style="border-radius: 16px; border-left: 5px solid ${isDone ? '#2e7d32' : 'var(--gold)'}; transition: all 0.2s ease;">
            <div class="flex-between align-center flex-wrap gap-2 mb-2">
              <div class="flex align-center gap-2">
                <span class="badge ${isDone ? 'badge-gold' : 'badge-paper'}" style="font-weight:700;">${m.badge}</span>
                <strong style="font-size: 1.1rem; color: var(--earth-brown);">${title}</strong>
              </div>
              <div>
                ${isDone 
                  ? `<span class="badge" style="background:#e8f5e9; color:#2e7d32; font-weight:700;">✅ ${t('sq_completed', 'Completed (+150 XP)')}</span>`
                  : `<button type="button" class="btn btn-primary btn-sm sq-start-btn ripple" data-mission="${m.id}">
                      <span>⚔️</span> <span>${t('sq_start_mission', 'Start Mission')}</span>
                     </button>`
                }
              </div>
            </div>
            <p class="text-small text-muted mb-2">${desc}</p>
            <div class="flex-between align-center text-xs text-muted">
              <span>🎁 ${t('sq_reward', 'Reward:')} +${m.xp} XP</span>
              <span>⚡ ${t('sq_status', 'Status:')} ${isDone ? t('sq_done', 'Done') : t('sq_active', 'Active')}</span>
            </div>

            <!-- Embedded Quest Question Card (Hidden by default, shown when clicked) -->
            <div id="quest-box-${m.id}" class="card p-3 mt-3 hidden" style="background: var(--bg); border: 2px dashed var(--primary); border-radius: 14px;">
              <strong class="text-sm block mb-2" style="color: var(--primary);">${t('sq_question_label', '🎯 Quest Question:')}</strong>
              <p class="text-small mb-3 font-bold">${lang === 'mr' ? m.question : m.questionEn}</p>
              <div class="flex-column gap-2" id="options-${m.id}">
                ${m.options.map((opt, idx) => `
                  <button type="button" class="btn btn-outline btn-sm text-left sq-opt-btn" data-mission="${m.id}" data-correct="${opt.correct}" style="border-radius: 10px; padding: 0.6rem 1rem; font-weight: 600;">
                    ${String.fromCharCode(65 + idx)}) ${opt.text}
                  </button>
                `).join('')}
              </div>
              <div id="feedback-${m.id}" class="text-xs font-bold mt-2 hidden"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 3. Render Badges
    const badgeGrid = document.getElementById('sq-badges-grid');
    if (badgeGrid) {
      badgeGrid.innerHTML = BADGES.map(b => {
        const isUnlocked = data.completedMissions.length >= 1; // Unlocks progressively
        const missionObj = MISSIONS.find(m => m.badgeReward === b.id);
        const unlockedThis = missionObj ? data.completedMissions.includes(missionObj.id) : false;
        const title = lang === 'mr' ? b.titleMr : b.title;

        return `
          <div class="card p-3 glass-card text-center hover-lift" style="border-radius: 16px; border: 2px solid ${unlockedThis ? 'var(--gold)' : 'var(--border)'}; opacity: ${unlockedThis ? 1 : 0.45}; transition: all 0.2s ease;">
            <div style="font-size: 2.5rem; margin-bottom: 0.4rem; filter: ${unlockedThis ? 'drop-shadow(0 4px 8px rgba(217,164,65,0.4))' : 'grayscale(1)'};">${b.icon}</div>
            <strong class="text-xs font-bold block mb-1" style="color: ${unlockedThis ? 'var(--terracotta)' : 'var(--text-muted)'};">${title}</strong>
            <span class="text-xs text-muted block">${unlockedThis ? `🏆 ${t('sq_unlocked', 'Unlocked')}` : `🔒 ${t('sq_locked', 'Locked')}`}</span>
          </div>
        `;
      }).join('');
    }
  }

  // Handle Start Mission Click
  document.addEventListener('click', (e) => {
    const startBtn = e.target.closest('.sq-start-btn');
    if (startBtn) {
      const missionId = startBtn.getAttribute('data-mission');
      const box = document.getElementById(`quest-box-${missionId}`);
      if (box) {
        box.classList.toggle('hidden');
      }
      return;
    }

    // Handle Option Selection Click
    const optBtn = e.target.closest('.sq-opt-btn');
    if (optBtn) {
      const missionId = optBtn.getAttribute('data-mission');
      const isCorrect = optBtn.getAttribute('data-correct') === 'true';
      const feedback = document.getElementById(`feedback-${missionId}`);

      if (isCorrect) {
        optBtn.style.background = '#2e7d32';
        optBtn.style.color = '#fff';
        optBtn.style.borderColor = '#2e7d32';

        if (feedback) {
          feedback.classList.remove('hidden');
          feedback.style.color = '#2e7d32';
          feedback.textContent = '🎉 बरोबर उत्तर! +१५० XP मिळाले आणि नवीन बॅज अनलॉक झाला!';
        }

        // Save progress
        const data = getStorageData();
        if (!data.completedMissions.includes(missionId)) {
          data.completedMissions.push(missionId);
          data.xp += 150;
          saveStorageData(data);
        }

        if (window.CareerMitra && window.CareerMitra.toast) {
          window.CareerMitra.toast('Mission Completed! +150 XP Awarded 🎉', 'success');
        }

        setTimeout(() => {
          renderSkillQuest();
        }, 1200);

      } else {
        optBtn.style.background = '#ea4335';
        optBtn.style.color = '#fff';
        optBtn.style.borderColor = '#ea4335';

        if (feedback) {
          feedback.classList.remove('hidden');
          feedback.style.color = '#ea4335';
          feedback.textContent = '❌ चुकीचा पर्याय. कृपया पुन्हा प्रयत्न करा!';
        }
      }
    }
  });

  // Reset Progress Button
  const resetBtn = document.getElementById('sq-reset-progress-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('सर्व प्रगती आणि XP रीसेट करायचे का? (Reset SkillQuest XP?)')) {
        localStorage.removeItem('cm-skillquest');
        renderSkillQuest();
        if (window.CareerMitra && window.CareerMitra.toast) {
          window.CareerMitra.toast('SkillQuest progress reset.', 'info');
        }
      }
    });
  }

  document.addEventListener('cm-lang-changed', renderSkillQuest);

  renderSkillQuest();
});
