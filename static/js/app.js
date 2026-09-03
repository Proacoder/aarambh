const CareerMitra = {
  lang: localStorage.getItem('cm-lang') || 'en',
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

// Init
document.addEventListener('DOMContentLoaded', () => {
  CareerMitra.loadTranslations(CareerMitra.lang);
  setupLanguageToggle();
  setupScrollAnimations();
  setupCountUpAnimations();
  setupRippleEffect();
});
