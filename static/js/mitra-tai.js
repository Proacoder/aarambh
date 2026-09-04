const MitraTai = {
  recognition: null,
  synthesis: window.speechSynthesis,
  isListening: false,
  isSpeaking: false,
  studentContext: null,
  mouthTimer: null,

  async init() {
    this.setupSpeechRecognition();
    await this.loadContext();
    this.setupEventListeners();
    this.checkUrlPrompt();
  },

  checkUrlPrompt() {
    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt') || params.get('ask');
    if (prompt) {
      setTimeout(() => {
        this.sendMessage(decodeURIComponent(prompt));
      }, 300);
    }
  },

  async loadContext() {
    try {
      const pRes = await fetch('/api/profile');
      if (pRes.ok) {
        const profile = await pRes.json();
        if (profile) {
          document.getElementById('ctx-name').textContent = profile.name || 'Student';
          document.getElementById('ctx-district').textContent = profile.district || 'District';
        }
      }

      const dRes = await fetch('/api/dashboard');
      if (dRes.ok) {
        const dash = await dRes.json();
        this.studentContext = dash;
        if (dash.matches && dash.matches.length > 0) {
          document.getElementById('ctx-match').textContent = dash.matches[0].name;
        }
      }
    } catch (err) {
      console.warn('Could not load student context for Mitra Tai:', err);
    }
  },

  setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const notice = document.getElementById('voice-fallback-notice');
      if (notice) notice.classList.remove('hidden');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateVoiceStatus('listening');
    };

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const inputEl = document.getElementById('user-input');
      if (inputEl && transcript) {
        inputEl.value = transcript;
        this.sendMessage(transcript);
      }
    };

    this.recognition.onerror = (err) => {
      console.warn('Speech recognition error:', err);
      this.isListening = false;
      this.updateVoiceStatus('idle');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (!this.isSpeaking) {
        this.updateVoiceStatus('idle');
      }
    };
  },

  toggleListening() {
    if (!this.recognition) {
      alert('Speech recognition is not available in your browser.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.updateVoiceStatus('idle');
    } else {
      const langMap = { 'mr': 'mr-IN', 'hi': 'hi-IN', 'en': 'en-IN' };
      this.recognition.lang = langMap[CareerMitra.lang] || 'mr-IN';
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  },

  updateVoiceStatus(state) {
    const badge = document.getElementById('voice-status-badge');
    const textEl = document.getElementById('voice-status-text');
    const pulse = document.getElementById('avatar-pulse');
    const soundwave = document.getElementById('soundwave-anim');
    const wrapper = document.getElementById('tai-avatar-wrapper');
    const micBtn = document.getElementById('btn-mic');

    if (!badge || !textEl) return;

    badge.className = `voice-status-badge ${state}`;
    if (wrapper) wrapper.dataset.state = state;
    if (micBtn) micBtn.classList.toggle('mic-active', state === 'listening');

    if (state === 'listening') {
      textEl.textContent = CareerMitra.t('listening_state') || 'Listening...';
      if (pulse) pulse.style.opacity = '1';
      if (soundwave) soundwave.classList.remove('hidden');
      this.stopTalkingMouth();
    } else if (state === 'thinking') {
      textEl.textContent = CareerMitra.t('thinking_state') || 'Mitra Tai is thinking...';
      if (pulse) pulse.style.opacity = '0.5';
      if (soundwave) soundwave.classList.add('hidden');
      this.stopTalkingMouth();
    } else if (state === 'speaking') {
      textEl.textContent = CareerMitra.t('speaking_state') || 'Mitra Tai is speaking...';
      if (pulse) pulse.style.opacity = '1';
      if (soundwave) soundwave.classList.remove('hidden');
      this.startTalkingMouth();
    } else {
      textEl.textContent = CareerMitra.t('tap_to_speak') || 'Tap to Speak';
      if (pulse) pulse.style.opacity = '0';
      if (soundwave) soundwave.classList.add('hidden');
      this.stopTalkingMouth();
    }
  },

  // Animate the SVG mouth path so Mitra Tai visibly "talks" while speaking,
  // independent of whether the browser fires per-word speech boundary events.
  startTalkingMouth() {
    const mouth = document.getElementById('tai-mouth');
    if (!mouth) return;
    this.stopTalkingMouth();
    const frames = ['', 'mouth-mid', 'mouth-open', 'mouth-mid'];
    let i = 0;
    this.mouthTimer = setInterval(() => {
      mouth.classList.remove('mouth-open', 'mouth-mid');
      const frame = frames[i % frames.length];
      if (frame) mouth.classList.add(frame);
      i++;
    }, 130);
  },

  stopTalkingMouth() {
    if (this.mouthTimer) {
      clearInterval(this.mouthTimer);
      this.mouthTimer = null;
    }
    const mouth = document.getElementById('tai-mouth');
    if (mouth) mouth.classList.remove('mouth-open', 'mouth-mid');
  },

  async sendMessage(customText) {
    const inputEl = document.getElementById('user-input');
    const text = customText || (inputEl ? inputEl.value.trim() : '');
    if (!text) return;

    if (inputEl) inputEl.value = '';

    this.appendUserMessage(text);
    this.updateVoiceStatus('thinking');
    this.showTypingIndicator();

    try {
      const payload = {
        message: text,
        language: CareerMitra.lang,
        studentProfile: this.studentContext ? this.studentContext.profile : null,
        careerMatches: this.studentContext ? this.studentContext.matches : null,
        colleges: this.studentContext ? this.studentContext.colleges : null,
        schemes: this.studentContext ? this.studentContext.schemes : null,
      };

      const res = await fetch('/api/mitra-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      this.removeTypingIndicator();
      this.appendTaiMessage(data.reply);
      this.speakText(data.reply);
    } catch (err) {
      console.error('Mitra Tai chat error:', err);
      this.removeTypingIndicator();
      const fallbackMsg = "माफ कर, सध्या नेटवर्क मंद आहे. पण मी तुझ्यासोबत आहे! पुन्हा प्रयत्न कर किंवा खालीलपैकी एका बटणावर दाब.";
      this.appendTaiMessage(fallbackMsg);
      this.updateVoiceStatus('idle');
    }
  },

  showTypingIndicator() {
    const stream = document.getElementById('chat-messages');
    if (!stream) return;
    this.removeTypingIndicator();
    const bubble = document.createElement('div');
    const taiName = (window.CareerMitra && window.CareerMitra.hasTranslation('feat_mitra_tai')) ? window.CareerMitra.t('feat_mitra_tai') : 'Mitra Tai';
    bubble.className = 'chat-bubble bubble-tai fade-in';
    bubble.id = 'tai-typing-bubble';
    bubble.innerHTML = `
      <div class="bubble-header flex align-center gap-2 mb-1">
        <img src="/static/img/mitra-tai.svg" class="bubble-avatar" alt="Tai">
        <strong>${taiName}</strong>
      </div>
      <div class="bubble-typing"><span></span><span></span><span></span></div>
    `;
    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;
  },

  removeTypingIndicator() {
    const el = document.getElementById('tai-typing-bubble');
    if (el) el.remove();
  },

  appendUserMessage(text) {
    const stream = document.getElementById('chat-messages');
    if (!stream) return;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bubble-user fade-in';
    bubble.innerHTML = `<p>${this.escapeHtml(text)}</p>`;
    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;
  },

  appendTaiMessage(rawText) {
    const stream = document.getElementById('chat-messages');
    if (!stream) return;

    const taiName = (window.CareerMitra && window.CareerMitra.hasTranslation('feat_mitra_tai')) ? window.CareerMitra.t('feat_mitra_tai') : 'Mitra Tai';
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bubble-tai fade-in';

    // Simple markdown-style bold text formatting
    const formatted = this.escapeHtml(rawText)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    bubble.innerHTML = `
      <div class="bubble-header flex align-center gap-2 mb-1">
        <img src="/static/img/mitra-tai.svg" class="bubble-avatar" alt="Tai">
        <strong>${taiName}</strong>
      </div>
      <p>${formatted}</p>
    `;
    stream.appendChild(bubble);
    stream.scrollTop = stream.scrollHeight;
  },

  speakText(text) {
    if (!text) {
      this.updateVoiceStatus('idle');
      return;
    }

    const cleanText = text.replace(/[*#`_~]/g, '').trim();

    if (window.CareerMitra && window.CareerMitra.speak) {
      this.isSpeaking = true;
      this.updateVoiceStatus('speaking');
      this.startTalkingMouth();

      window.CareerMitra.speak(cleanText, CareerMitra.lang, {
        onPlay: () => {
          this.isSpeaking = true;
          this.updateVoiceStatus('speaking');
          this.startTalkingMouth();
        },
        onEnd: () => {
          this.isSpeaking = false;
          this.updateVoiceStatus('idle');
          this.stopTalkingMouth();
        },
        onError: () => {
          this.isSpeaking = false;
          this.updateVoiceStatus('idle');
          this.stopTalkingMouth();
        }
      });
      return;
    }

    this.updateVoiceStatus('idle');
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  setupEventListeners() {
    const form = document.getElementById('tai-chat-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    }

    const micBtn = document.getElementById('btn-mic');
    if (micBtn) {
      micBtn.addEventListener('click', () => this.toggleListening());
    }

    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prompt = btn.getAttribute('data-prompt');
        if (prompt) {
          this.sendMessage(prompt);
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('chat-messages')) {
    MitraTai.init();
  }
});
