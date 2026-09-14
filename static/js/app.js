const CareerMitra = {
  lang: localStorage.getItem('cm-lang') || 'mr',
  translations: {},

  async loadTranslations(lang) {
    try {
      const response = await fetch(`/api/translations/${lang}`);
      if (!response.ok) throw new Error('Translation fetch failed');
      
      const data = await response.json();
      this.translations = data;
      this.lang = lang;
      localStorage.setItem('cm-lang', lang);
      
      this.applyTranslations();
      this.updateLangToggleState();
      
      // Dispatch event in case other modules need to re-render
      document.dispatchEvent(new CustomEvent('cm-lang-changed', { detail: lang }));
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  },

  t(key, params = {}) {
    let text = this.translations[key] || key;
    
    // Handle template strings like "{current} of {total}"
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${param}}`, 'g'), value);
    }
    return text;
  },

  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.placeholder = this.t(key);
        } else {
          el.value = this.t(key);
        }
      } else if (el.tagName === 'OPTION') {
        el.textContent = this.t(key);
      } else {
        // preserve child nodes if there's any rich content inside, but usually it's just text
        // for simplicity, just replacing textContent. 
        // If there's nested HTML, might need a more complex approach.
        el.textContent = this.t(key);
      }
    });
  },
  
  updateLangToggleState() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === this.lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
};

// Setup Language Toggle
function setupLanguageToggle() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-btn');
    if (btn) {
      const newLang = btn.getAttribute('data-lang');
      if (newLang && newLang !== CareerMitra.lang) {
        CareerMitra.loadTranslations(newLang);
      }
    }
  });
}

// Scroll Animation (IntersectionObserver)
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-up');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Count-Up Animation
function setupCountUpAnimations() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCountUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count-target]').forEach(el => {
    observer.observe(el);
  });
}

function animateCountUp(element) {
  const target = parseFloat(element.getAttribute('data-count-target'));
  const duration = 1500; // 1.5s
  let startTime = null;

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    
    const current = easeOutCubic(progress) * target;
    
    // check if it's an integer
    if (target % 1 === 0) {
      element.textContent = Math.floor(current);
    } else {
      element.textContent = current.toFixed(1);
    }

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = target; // Ensure exact final value
    }
  }
  window.requestAnimationFrame(step);
}

// Ripple effect on buttons (adds a little tactile "wow" to every tap)
function setupRippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .ripple');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${(e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2}px`;
    ripple.style.top = `${(e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2}px`;

    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

// Small confetti burst used to celebrate reaching the roadmap page
CareerMitra.celebrate = function celebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colors = ['#D4A843', '#C75B3A', '#2B4C7E', '#3A7D44', '#E8C876'];
  const container = document.createElement('div');
  container.className = 'confetti-layer';
  document.body.appendChild(container);

  const pieceCount = 36;
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.animationDuration = `${2.2 + Math.random() * 1.2}s`;
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 160}px`);
    piece.style.setProperty('--spin', `${(Math.random() - 0.5) * 720}deg`);
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 3800);
};

// Mobile Bottom Nav & Active Highlights
function setupMobileBottomNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.classList.remove('active');
  });

  if (path === '/' || path === '') {
    const el = document.getElementById('bnav-home');
    if (el) el.classList.add('active');
  } else if (path.includes('onboarding') || path.includes('assessment')) {
    const el = document.getElementById('bnav-journey');
    if (el) el.classList.add('active');
  } else if (path.includes('dashboard') || path.includes('roadmap')) {
    const el = document.getElementById('bnav-matches');
    if (el) el.classList.add('active');
  } else if (path.includes('career-aunty') || path.includes('mitra-tai')) {
    const el = document.getElementById('bnav-tai');
    if (el) el.classList.add('active');
  }
}

async function checkReturningUserHero() {
  const banner = document.getElementById('returning-user-banner');
  if (!banner) return;

  try {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const profile = await res.json();
      if (profile && profile.name) {
        const nameEl = document.getElementById('user-greeting-name');
        if (nameEl) nameEl.textContent = `👋 ${CareerMitra.t('welcome_back') || 'स्वागत आहे परत'}, ${profile.name}!`;
        banner.classList.remove('hidden');
      }
    }
  } catch (err) {
    // Session is empty
  }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('ServiceWorker registration successful');
    }).catch(err => {
      console.error('ServiceWorker registration failed: ', err);
    });
  });
}

// Global Mitra AI Slide-Over Controller
function setupGlobalMitraSlideover() {
  const triggerBtn = document.getElementById('global-mitra-trigger');
  const bnavBtn = document.getElementById('bnav-tai-trigger');
  const closeBtn = document.getElementById('close-mitra-slideover');
  const overlay = document.getElementById('mitra-slideover-overlay');
  const slideover = document.getElementById('mitra-global-slideover');
  const form = document.getElementById('slideover-chat-form');
  const input = document.getElementById('slideover-user-input');
  const stream = document.getElementById('slideover-messages-stream');
  const micBtn = document.getElementById('slideover-mic-btn');

  let avatar = null;
  const avatarBox = document.getElementById('slideover-mitra-avatar');
  if (avatarBox && window.MitraCharacter) {
    avatar = new MitraCharacter(avatarBox, { size: 44 });
  }

  function openSlideover() {
    if (!slideover || !overlay) return;
    slideover.classList.add('active');
    overlay.classList.add('active');
    if (avatar) avatar.setState('idle');
    if (input) input.focus();
  }

  function closeSlideover() {
    if (!slideover || !overlay) return;
    slideover.classList.remove('active');
    overlay.classList.remove('active');
  }

  triggerBtn?.addEventListener('click', openSlideover);
  bnavBtn?.addEventListener('click', openSlideover);
  closeBtn?.addEventListener('click', closeSlideover);
  overlay?.addEventListener('click', closeSlideover);

  // Send message
  async function sendSlideoverMessage(text) {
    if (!text.trim() || !stream) return;

    // Append user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble bubble-user fade-in';
    userBubble.innerHTML = `<p class="text-xs mb-0">${text}</p>`;
    stream.appendChild(userBubble);
    stream.scrollTop = stream.scrollHeight;

    if (avatar) avatar.setState('thinking');

    // Append typing indicator
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble bubble-tai fade-in text-xs text-muted';
    typingBubble.id = 'slideover-typing';
    typingBubble.innerHTML = `<em>Mitra is thinking... 🤔</em>`;
    stream.appendChild(typingBubble);
    stream.scrollTop = stream.scrollHeight;

    try {
      const res = await fetch('/api/mitra-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language: CareerMitra.lang || 'mr'
        })
      });

      const data = await res.json();
      typingBubble.remove();

      const taiBubble = document.createElement('div');
      taiBubble.className = 'chat-bubble bubble-tai fade-in';
      taiBubble.innerHTML = `<p class="text-xs mb-0">${data.reply.replace(/\n/g, '<br/>')}</p>`;
      stream.appendChild(taiBubble);
      stream.scrollTop = stream.scrollHeight;

      if (avatar) {
        avatar.setState('talking');
        setTimeout(() => avatar.setState('idle'), 3000);
      }

      // Voice read aloud if synthesis is available
      if (window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance(data.reply.replace(/[*#]/g, ''));
        utter.lang = CareerMitra.lang === 'mr' ? 'mr-IN' : (CareerMitra.lang === 'hi' ? 'hi-IN' : 'en-IN');
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      typingBubble.remove();
      const errBubble = document.createElement('div');
      errBubble.className = 'chat-bubble bubble-tai fade-in text-xs';
      errBubble.innerHTML = `<p class="text-xs mb-0">माफ करा, कृपया पुन्हा प्रयत्न करा. मी सदैव तुमच्या सोबत आहे!</p>`;
      stream.appendChild(errBubble);
      if (avatar) avatar.setState('idle');
    }
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    input.value = '';
    sendSlideoverMessage(val);
  });

  // Quick Chips
  document.querySelectorAll('.slideover-quick-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      sendSlideoverMessage(chip.dataset.prompt);
    });
  });

  // Speech to text mic
  if (micBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
      recognition.lang = CareerMitra.lang === 'mr' ? 'mr-IN' : (CareerMitra.lang === 'hi' ? 'hi-IN' : 'en-US');
      micBtn.style.background = '#EF4444';
      micBtn.style.color = '#fff';
      if (avatar) avatar.setState('listening');
      recognition.start();
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (input) input.value = transcript;
      micBtn.style.background = '';
      micBtn.style.color = '';
      sendSlideoverMessage(transcript);
    };

    recognition.onerror = () => {
      micBtn.style.background = '';
      micBtn.style.color = '';
      if (avatar) avatar.setState('idle');
    };
  }

  // Mobile Drawer Toggle
  const mobileToggle = document.getElementById('mobile-drawer-toggle');
  const mobileClose = document.getElementById('mobile-drawer-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-drawer-overlay');

  mobileToggle?.addEventListener('click', () => {
    if (mobileDrawer) mobileDrawer.style.display = 'flex';
    if (mobileOverlay) mobileOverlay.style.display = 'block';
  });

  const closeMobile = () => {
    if (mobileDrawer) mobileDrawer.style.display = 'none';
    if (mobileOverlay) mobileOverlay.style.display = 'none';
  };
  mobileClose?.addEventListener('click', closeMobile);
  mobileOverlay?.addEventListener('click', closeMobile);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  CareerMitra.loadTranslations(CareerMitra.lang);
  setupLanguageToggle();
  setupScrollAnimations();
  setupCountUpAnimations();
  setupRippleEffect();
  setupMobileBottomNav();
  checkReturningUserHero();
  setupGlobalMitraSlideover();
});

