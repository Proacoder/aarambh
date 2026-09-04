/* ==========================================================================
   CareerMitra — Kiosk Mode Controller (School & Touchscreen CPM)
   ========================================================================== */

(function () {
  'use strict';

  // State
  let timeoutSeconds = 15 * 60; // 15 minutes
  let remainingSeconds = timeoutSeconds;
  let timerInterval = null;
  let isSpeaking = false;

  const voicePrompts = {
    mr: {
      welcome: "सार्वजनिक करिअर मार्गदर्शन केंद्रात आपले स्वागत आहे. १० वी किंवा १२ वी नंतर काय करावे, मित्रा ताईंशी बोला, कॉलेज खर्च व शिष्यवृत्ती किंवा पालक संवादासाठी समोरील मोठ्या बटनांवर स्पर्श करा.",
      tile1: "नवीन प्रवास: १०वी किंवा १२वी नंतर काय करावे? १ मिनिटात अचूक योग्यता चाचणी द्या.",
      tile2: "मित्रा ताई: माईकवर बोलून कॉलेज, कटऑफ, फी आणि वसतिगृहाबद्दल थेट शंका विचारा.",
      tile3: "खर्च व शिष्यवृत्ती: महा-डीबीटी फी माफी आणि वसतिगृह खर्चाचे अचूक नियोजन करा.",
      tile4: "पालक संवाद: आई-वडिलांसाठी सोप्या भाषेत करिअर आणि सुरक्षिततेचे शासकीय मार्गदर्शन.",
      sessionEnded: "सत्र सुरक्षितपणे संपले आहे. पुढील विद्यार्थ्यासाठी किओस्क तयार आहे."
    },
    hi: {
      welcome: "सार्वजनिक करियर मार्गदर्शन केंद्र में आपका स्वागत है। 10वीं या 12वीं के बाद क्या करें, मित्रा ताई से बात करें, कॉलेज खर्च और छात्रवृत्ति, या अभिभावक संवाद के लिए सामने दिए गए बटनों पर स्पर्श करें।",
      tile1: "नई शुरुआत: 10वीं या 12वीं के बाद क्या करें? 1 मिनट में सटीक योग्यता परीक्षा दें।",
      tile2: "मित्रा ताई: माइक पर बोलकर कॉलेज, कटऑफ, फीस और छात्रावास के बारे में सवाल पूछें।",
      tile3: "खर्च और छात्रवृत्ति: MahaDBT छात्रवृत्ति और छात्रावास खर्च की सटीक योजना बनाएं।",
      tile4: "अभिभावक संवाद: माता-पिता के लिए सरल भाषा में करियर और सुरक्षा मार्गदर्शन।",
      sessionEnded: "सत्र सफलतापूर्वक समाप्त हो गया है। अगले छात्र के लिए किओस्क तैयार है।"
    },
    en: {
      welcome: "Welcome to the Career Guidance Center. Touch any large tile to explore career pathways, talk to Mitra Tai, calculate education costs, or review parent guidance.",
      tile1: "New Journey: Take a 1-minute career aptitude assessment to discover your top matches.",
      tile2: "Talk to Mitra Tai: Voice-assisted AI counseling for colleges, cutoffs, and scholarships.",
      tile3: "Cost & Scholarships: Calculate MahaDBT fee concessions and total living expenses.",
      tile4: "Parent Mode: Clear, practical career and hostel safety advice tailored for parents.",
      sessionEnded: "Session cleared successfully. Kiosk is ready for the next student."
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initInactivityTimer();
    initVoiceAssistance();
    initFullscreenToggle();
    initSessionResetModal();
    syncActiveLanguage();
  });

  // -------------------------------------------------------------------------
  // 1. Language Switcher
  // -------------------------------------------------------------------------
  function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.kiosk-lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedLang = btn.getAttribute('data-lang');
        if (!selectedLang) return;

        langBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (window.CareerMitra && window.CareerMitra.loadTranslations) {
          window.CareerMitra.loadTranslations(selectedLang);
        }

        // Brief voice feedback
        speakText(selectedLang === 'mr' ? 'मराठी भाषा निवडली आहे' : selectedLang === 'hi' ? 'हिंदी भाषा चुनी गई है' : 'English selected');
      });
    });

    document.addEventListener('cm-lang-changed', (e) => {
      const current = e.detail;
      langBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lang') === current);
      });
    });
  }

  function syncActiveLanguage() {
    const current = (window.CareerMitra && window.CareerMitra.lang) || localStorage.getItem('cm-lang') || 'mr';
    document.querySelectorAll('.kiosk-lang-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-lang') === current);
    });
  }

  // -------------------------------------------------------------------------
  // 2. Inactivity Timer (Auto-resets kiosk for shared terminals)
  // -------------------------------------------------------------------------
  function initInactivityTimer() {
    const timerDisplay = document.getElementById('kiosk-timer-display');
    const timerPill = document.getElementById('kiosk-timer-pill');

    function updateTimerUI() {
      const mins = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;
      if (timerDisplay) {
        timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }

      if (timerPill) {
        if (remainingSeconds <= 60) {
          timerPill.classList.add('warning');
        } else {
          timerPill.classList.remove('warning');
        }
      }
    }

    function resetInactivity() {
      remainingSeconds = timeoutSeconds;
      updateTimerUI();
    }

    // Reset timer on user interaction
    ['touchstart', 'click', 'mousemove', 'keypress'].forEach(evt => {
      window.addEventListener(evt, resetInactivity, { passive: true });
    });

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateTimerUI();
      } else {
        // Time expired: auto wipe session
        executeEndSession(true);
      }
    }, 1000);

    updateTimerUI();
  }

  // -------------------------------------------------------------------------
  // 3. Voice Assistance (Web Speech API)
  // -------------------------------------------------------------------------
  function initVoiceAssistance() {
    const mainVoiceBtn = document.getElementById('btn-kiosk-voice-intro');
    if (mainVoiceBtn) {
      mainVoiceBtn.addEventListener('click', () => {
        const lang = (window.CareerMitra && window.CareerMitra.lang) || 'mr';
        const text = voicePrompts[lang]?.welcome || voicePrompts.mr.welcome;
        speakText(text);
      });
    }

    document.querySelectorAll('.kiosk-tile-voice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tileKey = btn.getAttribute('data-tile-voice');
        const lang = (window.CareerMitra && window.CareerMitra.lang) || 'mr';
        const text = voicePrompts[lang]?.[tileKey] || voicePrompts.mr[tileKey];
        if (text) speakText(text);
      });
    });
  }

  function speakText(text) {
    if (!text) return;
    const lang = (window.CareerMitra && window.CareerMitra.lang) || 'mr';
    if (window.CareerMitra && window.CareerMitra.speak) {
      window.CareerMitra.speak(text, lang);
      return;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'mr' ? 'hi-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN');
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Fullscreen Mode
  // -------------------------------------------------------------------------
  function initFullscreenToggle() {
    const fsBtn = document.getElementById('btn-kiosk-fullscreen');
    if (!fsBtn) return;

    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        fsBtn.innerHTML = '<span>⛶</span> <span data-i18n="kiosk_exit_fullscreen">Exit Fullscreen</span>';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        fsBtn.innerHTML = '<span>🖥️</span> <span data-i18n="kiosk_fullscreen_btn">Fullscreen Mode</span>';
      }
    });
  }

  // -------------------------------------------------------------------------
  // 5. Logout & Session Reset
  // -------------------------------------------------------------------------
  function initSessionResetModal() {
    const openModalBtn = document.getElementById('btn-kiosk-logout');
    const modal = document.getElementById('kiosk-reset-modal');
    const confirmBtn = document.getElementById('btn-confirm-kiosk-reset');
    const cancelBtn = document.getElementById('btn-cancel-kiosk-reset');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
      });
    }

    if (cancelBtn && modal) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        executeEndSession(false);
      });
    }
  }

  async function executeEndSession(isAutoTimeout = false) {
    const confirmBtn = document.getElementById('btn-confirm-kiosk-reset');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="btn-spinner"></span> <span>Wiping session...</span>';
    }

    try {
      // 1. Wipe Flask session on server
      await fetch('/api/logout', { method: 'POST' }).catch(() => {});
      await fetch('/api/reset', { method: 'POST' }).catch(() => {});
    } catch (e) {
      console.warn("Session wipe fetch failed:", e);
    }

    // 2. Clear browser storage
    sessionStorage.clear();
    const currentLang = localStorage.getItem('cm-lang') || 'mr';
    localStorage.clear();
    localStorage.setItem('cm-lang', currentLang); // preserve preferred display language

    // 3. Audio / Toast confirmation
    const lang = currentLang;
    const feedbackMsg = voicePrompts[lang]?.sessionEnded || voicePrompts.mr.sessionEnded;
    if (!isAutoTimeout) {
      speakText(feedbackMsg);
    }

    if (window.CareerMitra && window.CareerMitra.toast) {
      window.CareerMitra.toast(feedbackMsg, 'success');
    }

    // 4. Reload clean kiosk
    setTimeout(() => {
      window.location.href = '/kiosk';
    }, 700);
  }

  window.CareerMitraKiosk = {
    resetSession: executeEndSession,
    speak: speakText
  };

})();
