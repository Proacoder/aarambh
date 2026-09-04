/* ==========================================================================
   CareerMitra — Core Application JS
   ========================================================================== */

const CareerMitra = {
  lang: localStorage.getItem('cm-lang') || 'en',
  translations: {},
  isAuthenticated: false,

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
      document.dispatchEvent(new CustomEvent('cm-lang-changed', { detail: lang }));
    } catch (error) {
      console.error('Error loading translations:', error);
    }
  },

  t(key, params = {}) {
    let text = (this.translations && this.translations[key]) ? this.translations[key] : key;
    for (const [param, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${param}}`, 'g'), value);
    }
    return text;
  },

  hasTranslation(key) {
    return Boolean(this.translations && this.translations[key]);
  },

  applyTranslations() {
    document.documentElement.lang = this.lang;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!this.hasTranslation(key)) return;
      const translated = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.placeholder = translated;
        } else {
          el.value = translated;
        }
      } else if (el.tagName === 'OPTION') {
        el.textContent = translated;
      } else {
        const userImg = el.querySelector('img');
        const iconSpan = el.querySelector('span:first-child');
        if (userImg) {
          const textSpan = el.querySelector('span') || document.createElement('span');
          textSpan.textContent = translated;
          el.innerHTML = '';
          el.appendChild(userImg);
          el.appendChild(document.createTextNode(' '));
          el.appendChild(textSpan);
        } else if (iconSpan && iconSpan.textContent.trim().length <= 4 && !iconSpan.hasAttribute('data-i18n')) {
          const iconHTML = iconSpan.outerHTML;
          el.innerHTML = `${iconHTML} ${translated}`;
        } else {
          el.textContent = translated;
        }
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (this.hasTranslation(key)) {
        el.placeholder = this.t(key);
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (this.hasTranslation(key)) {
        el.title = this.t(key);
      }
    });
  },
  
  updateLangToggleState() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.lang);
    });
  },

  currentAudio: null,

  speak(text, lang, options = {}) {
    if (!text) return;
    const targetLang = lang || this.lang || 'mr';
    const cleanText = text.replace(/[*#`_~]/g, '').trim();
    if (!cleanText) return;

    this.stopSpeech();

    if (options.onStart) options.onStart();

    // 1. Primary Engine: Server-side Neural TTS (/api/tts)
    try {
      const url = `/api/tts?lang=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(url);
      this.currentAudio = audio;

      audio.onplay = () => {
        if (options.onPlay) options.onPlay();
      };

      audio.onended = () => {
        this.currentAudio = null;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        this.fallbackWebSpeech(cleanText, targetLang, options);
      };

      audio.play().catch(() => {
        this.currentAudio = null;
        this.fallbackWebSpeech(cleanText, targetLang, options);
      });
    } catch (e) {
      this.fallbackWebSpeech(cleanText, targetLang, options);
    }
  },

  fallbackWebSpeech(text, lang, options = {}) {
    if (!('speechSynthesis' in window)) {
      if (options.onError) options.onError();
      if (options.onEnd) options.onEnd();
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    let matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang));
    if (!matchedVoice && lang === 'mr') {
      matchedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.includes('IN')));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = lang === 'mr' ? 'hi-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN');
    }

    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      if (options.onPlay) options.onPlay();
    };

    utterance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      if (options.onError) options.onError();
      if (options.onEnd) options.onEnd();
    };

    window.speechSynthesis.speak(utterance);
  },

  stopSpeech() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
};

// =========================================================================
// Navigation — Hamburger, Drawer, Sticky scroll
// =========================================================================
function setupNavigation() {
  const hamburger = document.getElementById('hamburger-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');

  if (hamburger && drawer && overlay) {
    hamburger.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      drawer.classList.toggle('open');
      overlay.classList.toggle('visible');
      hamburger.classList.toggle('active');
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    overlay.addEventListener('click', () => {
      drawer.classList.remove('open');
      overlay.classList.remove('visible');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    });

    // Close drawer on link click
    drawer.querySelectorAll('.drawer-link, .drawer-cta').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        overlay.classList.remove('visible');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Sticky nav scroll effect
  const nav = document.getElementById('main-nav');
  if (nav) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      nav.classList.toggle('scrolled', scrollY > 60);
      lastScroll = scrollY;
    }, { passive: true });
  }
}

// =========================================================================
// Auth-Aware UI
// =========================================================================
async function setupAuthUI() {
  try {
    const res = await fetch('/api/check-auth');
    if (!res.ok) return;
    const data = await res.json();
    
    CareerMitra.isAuthenticated = data.authenticated;
    CareerMitra.isGuest = data.isGuest;
    CareerMitra.user = data.user;

    const navUseNow = document.getElementById('nav-use-now');
    const logoutBtn = document.getElementById('drawer-logout-btn');
    const heroUseNow = document.getElementById('hero-use-now-btn');
    const navRight = document.querySelector('.nav-right');
    const mobileDrawer = document.getElementById('mobile-drawer');
    
    if (data.authenticated) {
      function updateAuthButtonText() {
        const dashText = CareerMitra.t('nav_dashboard') || 'Dashboard';
        if (navUseNow) {
          if (!data.isGuest && data.user && data.user.picture) {
            navUseNow.innerHTML = `<img src="${data.user.picture}" alt="" style="width:20px; height:20px; border-radius:50%; vertical-align:middle; margin-right:4px;"> <span>${dashText}</span>`;
          } else {
            navUseNow.textContent = `📊 ${dashText}`;
          }
          navUseNow.href = '/dashboard';
          navUseNow.setAttribute('data-i18n', 'nav_dashboard');
        }
        if (heroUseNow && data.hasProfile) {
          heroUseNow.innerHTML = `📊 <span>${dashText}</span>`;
          heroUseNow.href = '/dashboard';
          heroUseNow.setAttribute('data-i18n', 'nav_dashboard');
        }
      }
      updateAuthButtonText();
      document.addEventListener('cm-lang-changed', updateAuthButtonText);

      // If user is in Guest Mode, provide immediate option to do OAuth
      if (data.isGuest) {
        if (navRight && !document.getElementById('nav-google-connect')) {
          const connectBtn = document.createElement('a');
          connectBtn.id = 'nav-google-connect';
          connectBtn.href = '/login/google';
          connectBtn.className = 'btn btn-outline btn-sm desktop-only';
          connectBtn.style.cssText = 'border-color:#4285F4; color:#4285F4; font-weight:600; padding:0.35rem 0.75rem; border-radius:18px; display:inline-flex; align-items:center; gap:6px; font-size:0.8rem; background:rgba(66,133,244,0.08); text-decoration:none;';
          connectBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg> <span>Connect Google</span>`;
          if (navUseNow) {
            navRight.insertBefore(connectBtn, navUseNow);
          }
        }

        if (mobileDrawer && !document.getElementById('drawer-google-connect')) {
          const drawerConnect = document.createElement('a');
          drawerConnect.id = 'drawer-google-connect';
          drawerConnect.href = '/login/google';
          drawerConnect.className = 'drawer-link';
          drawerConnect.style.cssText = 'color:#4285F4; font-weight:600; display:flex; align-items:center; gap:8px;';
          drawerConnect.innerHTML = `<span>🔗</span> <span>Sign in with Google</span>`;
          if (logoutBtn) {
            mobileDrawer.insertBefore(drawerConnect, logoutBtn);
          }
        }
      }

      // Show logout button in mobile drawer
      if (logoutBtn) {
        logoutBtn.style.display = 'flex';
        logoutBtn.addEventListener('click', async () => {
          await fetch('/api/logout', { method: 'POST' });
          sessionStorage.clear();
          window.location.href = '/login';
        });
      }

      // Show logout button in desktop navbar
      const navLogoutBtn = document.getElementById('nav-logout-btn');
      if (navLogoutBtn) {
        navLogoutBtn.classList.remove('hidden');
        navLogoutBtn.addEventListener('click', async () => {
          await fetch('/api/logout', { method: 'POST' });
          sessionStorage.clear();
          window.location.href = '/login';
        });
      }
    }
  } catch (err) {
    // Not critical
  }
}

// =========================================================================
// Language Toggle
// =========================================================================
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

// =========================================================================
// Scroll Animations (IntersectionObserver)
// =========================================================================
function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('slide-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// =========================================================================
// Count-Up Animation
// =========================================================================
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
  const duration = 1500;
  let startTime = null;

  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const current = easeOutCubic(progress) * target;
    element.textContent = target % 1 === 0 ? Math.floor(current) : current.toFixed(1);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = target;
    }
  }
  window.requestAnimationFrame(step);
}

// =========================================================================
// Ripple Effect
// =========================================================================
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

// =========================================================================
// Toast Notifications
// =========================================================================
CareerMitra.toast = function(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span> <span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
};

// =========================================================================
// Confetti Celebration
// =========================================================================
CareerMitra.celebrate = function celebrate() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#D4A843', '#C75B3A', '#2B4C7E', '#3A7D44', '#E8C876'];
  const container = document.createElement('div');
  container.className = 'confetti-layer';
  document.body.appendChild(container);
  for (let i = 0; i < 36; i++) {
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

// =========================================================================
// Mobile Bottom Nav & Active Highlights
// =========================================================================
function setupMobileBottomNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));

  if (path === '/' || path === '') {
    document.getElementById('bnav-home')?.classList.add('active');
  } else if (path.includes('dashboard') || path.includes('assessment')) {
    document.getElementById('bnav-matches')?.classList.add('active');
  } else if (path.includes('cost-calculator') || path.includes('kharcha')) {
    document.getElementById('bnav-kharcha')?.classList.add('active');
  } else if (path.includes('career-aunty') || path.includes('mitra-tai')) {
    document.getElementById('bnav-tai')?.classList.add('active');
  } else if (path.includes('roadmap')) {
    document.getElementById('bnav-roadmap')?.classList.add('active');
  }

  // Also highlight active desktop nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (href !== '/' && path.startsWith(href))) {
      link.style.color = 'var(--turmeric)';
    }
  });
}

// =========================================================================
// Returning User Hero Check
// =========================================================================
async function checkReturningUserHero() {
  const banner = document.getElementById('returning-user-banner');
  if (!banner) return;

  try {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const profile = await res.json();
      if (profile && profile.name) {
        const nameEl = document.getElementById('user-greeting-name');
        if (nameEl) nameEl.textContent = `👋 ${CareerMitra.t('welcome_back') || 'Welcome back'}, ${profile.name}!`;
        banner.classList.remove('hidden');
        // Hide main hero content on returning user
        const mainHero = document.getElementById('main-hero-content');
        if (mainHero) mainHero.style.display = 'none';
      }
    }
  } catch (err) {
    // Session is empty — that's fine for public landing page
  }
}

// =========================================================================
// Smooth Scroll for anchor links
// =========================================================================
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// =========================================================================
// PWA Install Prompt System (Add to Home Screen)
// =========================================================================
let deferredInstallPrompt = null;

function setupPWAInstall() {
  const desktopBtn = document.getElementById('pwa-install-btn-desktop');
  const drawerBtn = document.getElementById('pwa-install-btn-drawer');
  const banner = document.getElementById('pwa-install-banner');
  const actionBtn = document.getElementById('pwa-install-action');
  const dismissBtn = document.getElementById('pwa-install-dismiss');

  // If already installed and running standalone, hide buttons
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (isStandalone) {
    return;
  }

  // Capture beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;

    if (desktopBtn) desktopBtn.classList.remove('hidden');
    if (drawerBtn) drawerBtn.classList.remove('hidden');

    const isDismissed = sessionStorage.getItem('cm-pwa-dismissed');
    if (!isDismissed && banner) {
      setTimeout(() => {
        banner.classList.remove('hidden');
      }, 2500);
    }
  });

  async function triggerInstall() {
    if (!deferredInstallPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt (e.g. iOS Safari)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        CareerMitra.toast('To install on iPhone/iPad: Tap Share 📤 then "Add to Home Screen" ➕', 'info', 6000);
      } else {
        CareerMitra.toast('To install, open browser menu (⋮) and choose "Install App" or "Add to Home screen".', 'info', 5000);
      }
      return;
    }

    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;

    if (choice && choice.outcome === 'accepted') {
      CareerMitra.toast('CareerMitra installed on your device! 🎉', 'success');
      if (banner) banner.classList.add('hidden');
      if (desktopBtn) desktopBtn.classList.add('hidden');
      if (drawerBtn) drawerBtn.classList.add('hidden');
    }
    deferredInstallPrompt = null;
  }

  if (actionBtn) actionBtn.addEventListener('click', triggerInstall);
  if (desktopBtn) desktopBtn.addEventListener('click', triggerInstall);
  if (drawerBtn) drawerBtn.addEventListener('click', triggerInstall);

  if (dismissBtn && banner) {
    dismissBtn.addEventListener('click', () => {
      banner.classList.add('hidden');
      sessionStorage.setItem('cm-pwa-dismissed', 'true');
    });
  }

  window.addEventListener('appinstalled', () => {
    CareerMitra.toast('CareerMitra is now installed as a Web App! 🚀', 'success');
    if (banner) banner.classList.add('hidden');
    if (desktopBtn) desktopBtn.classList.add('hidden');
    if (drawerBtn) drawerBtn.classList.add('hidden');
    deferredInstallPrompt = null;
  });
}

// =========================================================================
// Service Worker
// =========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      // SW registered
    }).catch(err => {
      console.error('ServiceWorker registration failed: ', err);
    });
  });
}

// =========================================================================
// Init
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {
  CareerMitra.loadTranslations(CareerMitra.lang);
  setupLanguageToggle();
  setupNavigation();
  setupScrollAnimations();
  setupCountUpAnimations();
  setupRippleEffect();
  setupMobileBottomNav();
  setupSmoothScroll();
  setupAuthUI();
  checkReturningUserHero();
  setupPWAInstall();
});
