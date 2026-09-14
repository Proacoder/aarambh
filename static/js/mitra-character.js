/**
 * AARAMBH - Mitra Saathi Animated Character Engine
 * Modular, interactive SVG avatar state machine
 * Supports: idle (breathing/blinking), listening, thinking, talking, celebrating
 */

class MitraCharacter {
  constructor(containerId, options = {}) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.size = options.size || 130;
    this.state = 'idle';
    this.speakingInterval = null;
    this.blinkInterval = null;
    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="mitra-saathi-wrap" style="width: ${this.size}px; height: ${this.size}px; position: relative; display: inline-flex; align-items: center; justify-content: center;">
        <div class="mitra-aura" style="position: absolute; inset: -6px; border-radius: 50%; background: radial-gradient(circle, rgba(217,164,65,0.35) 0%, rgba(184,87,60,0.15) 55%, transparent 70%); animation: mitraAuraPulse 3.5s infinite ease-in-out;"></div>
        
        <svg viewBox="0 0 100 100" width="100%" height="100%" class="mitra-saathi-svg" style="filter: drop-shadow(0 6px 16px rgba(61,43,31,0.18));">
          <defs>
            <radialGradient id="mitraFaceGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFEAD6" />
              <stop offset="100%" stop-color="#F5CBA7" />
            </radialGradient>
            <linearGradient id="mitraHairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2C1810" />
              <stop offset="100%" stop-color="#150B07" />
            </linearGradient>
            <linearGradient id="mitraAttire" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#B8573C" />
              <stop offset="100%" stop-color="#8B3D2B" />
            </linearGradient>
            <linearGradient id="mitraGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F5D77F" />
              <stop offset="100%" stop-color="#D9A441" />
            </linearGradient>
          </defs>

          <!-- Outer Decorative Ring -->
          <circle cx="50" cy="50" r="47" fill="none" stroke="url(#mitraGoldBorder)" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6" />

          <!-- Torso & Traditional Saree / Attire -->
          <path d="M18 90 Q 50 78 82 90 L 88 100 L 12 100 Z" fill="url(#mitraAttire)" />
          <path d="M34 82 L 50 100 L 66 82 Z" fill="url(#mitraGoldBorder)" opacity="0.9" />

          <!-- Neck -->
          <rect x="44" y="66" width="12" height="14" rx="4" fill="url(#mitraFaceGrad)" />

          <!-- Face -->
          <ellipse cx="50" cy="48" rx="26" ry="28" fill="url(#mitraFaceGrad)" class="mitra-face-base" />

          <!-- Hair -->
          <path d="M24 45 C 22 25, 34 14, 50 14 C 66 14, 78 25, 76 45 C 76 34, 66 22, 50 22 C 34 22, 24 34, 24 45 Z" fill="url(#mitraHairGrad)" />
          
          <!-- Bindi -->
          <circle cx="50" cy="38" r="2.2" fill="#B8573C" />

          <!-- Left Eyebrow & Eye -->
          <path d="M36 39 Q 41 37 45 40" stroke="#2C1810" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <ellipse cx="40" cy="45" rx="3.5" ry="4" fill="#2C1810" class="mitra-eye-left" />
          <circle cx="41.5" cy="43.5" r="1.2" fill="#FFFFFF" />

          <!-- Right Eyebrow & Eye -->
          <path d="M55 40 Q 59 37 64 39" stroke="#2C1810" stroke-width="1.8" fill="none" stroke-linecap="round" />
          <ellipse cx="60" cy="45" rx="3.5" ry="4" fill="#2C1810" class="mitra-eye-right" />
          <circle cx="61.5" cy="43.5" r="1.2" fill="#FFFFFF" />

          <!-- Specs / Smart Glasses (Symbol of knowledge & guidance) -->
          <rect x="33" y="40" width="14" height="10" rx="3" fill="none" stroke="#5C4033" stroke-width="1.4" opacity="0.85" />
          <rect x="53" y="40" width="14" height="10" rx="3" fill="none" stroke="#5C4033" stroke-width="1.4" opacity="0.85" />
          <line x1="47" y1="44" x2="53" y2="44" stroke="#5C4033" stroke-width="1.4" opacity="0.85" />

          <!-- Nose -->
          <path d="M50 48 Q 51.5 53 49 55" stroke="#D4A373" stroke-width="1.5" fill="none" stroke-linecap="round" />

          <!-- Mouth -->
          <path d="M43 63 Q 50 68 57 63" stroke="#B8573C" stroke-width="2.2" fill="none" stroke-linecap="round" class="mitra-mouth" />

          <!-- Gentle Blush -->
          <circle cx="34" cy="52" r="4" fill="#F43F5E" opacity="0.25" />
          <circle cx="66" cy="52" r="4" fill="#F43F5E" opacity="0.25" />
        </svg>

        <div class="mitra-badge-pill" style="position: absolute; bottom: 2px; right: 2px; padding: 2px 8px; border-radius: 999px; font-size: 10px; background: var(--green); color: #fff; font-weight: 700; border: 1.5px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
          Saathi
        </div>
      </div>
    `;

    this.mouth = this.container.querySelector('.mitra-mouth');
    this.eyeLeft = this.container.querySelector('.mitra-eye-left');
    this.eyeRight = this.container.querySelector('.mitra-eye-right');
    this.statusBadge = this.container.querySelector('.mitra-badge-pill');

    this.startBlinking();
  }

  startBlinking() {
    clearInterval(this.blinkInterval);
    this.blinkInterval = setInterval(() => {
      if (this.state === 'idle' || this.state === 'talking') {
        this.blink();
      }
    }, 3600);
  }

  blink() {
    if (!this.eyeLeft || !this.eyeRight) return;
    this.eyeLeft.setAttribute('ry', '0.5');
    this.eyeRight.setAttribute('ry', '0.5');
    setTimeout(() => {
      this.eyeLeft.setAttribute('ry', '4');
      this.eyeRight.setAttribute('ry', '4');
    }, 140);
  }

  setState(newState) {
    this.state = newState;
    clearInterval(this.speakingInterval);

    if (!this.mouth || !this.statusBadge) return;

    if (newState === 'talking') {
      this.statusBadge.textContent = 'Speaking...';
      this.statusBadge.style.background = 'var(--indigo)';
      let toggle = false;
      this.speakingInterval = setInterval(() => {
        toggle = !toggle;
        this.mouth.setAttribute('d', toggle ? 'M42 62 Q 50 71 58 62 Z' : 'M43 63 Q 50 68 57 63');
        this.mouth.setAttribute('fill', toggle ? '#8B3D2B' : 'none');
      }, 180);
    } else if (newState === 'thinking') {
      this.statusBadge.textContent = 'Thinking 🤔';
      this.statusBadge.style.background = 'var(--gold)';
      this.mouth.setAttribute('d', 'M45 64 Q 50 63 55 65');
      this.mouth.setAttribute('fill', 'none');
    } else if (newState === 'listening') {
      this.statusBadge.textContent = 'Listening 🎙️';
      this.statusBadge.style.background = '#EF4444';
      this.mouth.setAttribute('d', 'M46 63 A 4 4 0 0 0 54 63');
      this.mouth.setAttribute('fill', 'none');
    } else if (newState === 'celebrating') {
      this.statusBadge.textContent = 'Bravo! 🎉';
      this.statusBadge.style.background = 'var(--green)';
      this.mouth.setAttribute('d', 'M41 61 Q 50 73 59 61 Z');
      this.mouth.setAttribute('fill', '#B8573C');
    } else {
      // idle
      this.statusBadge.textContent = 'Online ✨';
      this.statusBadge.style.background = 'var(--green)';
      this.mouth.setAttribute('d', 'M43 63 Q 50 68 57 63');
      this.mouth.setAttribute('fill', 'none');
    }
  }

  destroy() {
    clearInterval(this.speakingInterval);
    clearInterval(this.blinkInterval);
  }
}

// Global Exposure
window.MitraCharacter = MitraCharacter;
