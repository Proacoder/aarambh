/* 
  CareerMitra 3-Column Dashboard JS
  Integrates:
  - Left: Tools Panel (Matches, Kharcha, Docs, Exams)
  - Center: Dark Leaflet Map (Dharmik's styling & markers)
  - Right: Mitra Tai AI Companion Chat
*/

let darkMap = null;
let mapMarkers = {};
let dashboardData = null;

// Dharmik's Maharashtra Cities / Regional Hubs Data
const REGIONAL_HUBS = [
  { name: 'Mumbai', region: 'Konkan Division', lat: 19.0760, lng: 72.8777, sector: 'tech', color: '#6366F1', icon: '🏙️', desc: 'Financial & IT Capital. Top engineering, medical & arts institutes.', jobs: '150K+', colleges: 45 },
  { name: 'Pune', region: 'Pune Division', lat: 18.5204, lng: 73.8567, sector: 'education', color: '#10B981', icon: '🎓', desc: 'Oxford of the East. IT, Auto & Manufacturing hub with top engineering colleges.', jobs: '120K+', colleges: 60 },
  { name: 'Nashik', region: 'Nashik Division', lat: 19.9975, lng: 73.7898, sector: 'manufacturing', color: '#F59E0B', icon: '🍷', desc: 'Auto, Pharma & Agricultural engineering center.', jobs: '45K+', colleges: 22 },
  { name: 'Nagpur', region: 'Vidarbha Division', lat: 21.1458, lng: 79.0882, sector: 'tech', color: '#EC4899', icon: '🍊', desc: 'Central logistics, AI & government tech hub of Vidarbha.', jobs: '40K+', colleges: 28 },
  { name: 'Chhatrapati Sambhajinagar', region: 'Marathwada Division', lat: 19.8762, lng: 75.3433, sector: 'manufacturing', color: '#8B5CF6', icon: '🏰', desc: 'Industrial hub for Auto & Engineering polytechnics in Marathwada.', jobs: '35K+', colleges: 18 },
  { name: 'Kolhapur', region: 'Pune Division', lat: 16.7050, lng: 74.2433, sector: 'manufacturing', color: '#EF4444', icon: '⚙️', desc: 'Foundry, Textiles & Agriculture machinery center.', jobs: '25K+', colleges: 15 },
  { name: 'Satara', region: 'Pune Division', lat: 17.6805, lng: 74.0183, sector: 'tourism', color: '#14B8A6', icon: '🏔️', desc: 'Government engineering outreach & eco-tourism hub.', jobs: '18K+', colleges: 11 },
  { name: 'Ratnagiri', region: 'Konkan Division', lat: 16.9902, lng: 73.3120, sector: 'tourism', color: '#3B82F6', icon: '🌊', desc: 'Fisheries, Horticulture & Coastal polytechnics.', jobs: '12K+', colleges: 8 }
];

document.addEventListener('DOMContentLoaded', async () => {
  setupToolTabs();
  setupMitraTaiChat();
  setupMapFilters();

  await loadDashboardData();
  initDarkMap();
  setupKharchaEmbed();
  setupDocsEmbed();
  setupExamsEmbed();

  document.addEventListener('cm-lang-changed', () => {
    if (window.CareerMitra) {
      CareerMitra.applyTranslations();
    }
    if (dashboardData) {
      renderLeftMatches(dashboardData.matches || []);
      renderLeftColleges(dashboardData.colleges || []);
    }
  });
});

// ---------------------------------------------------------------------------
// 1. Tool Tabs (Left Panel)
// ---------------------------------------------------------------------------
function setupToolTabs() {
  const btns = document.querySelectorAll('.tool-tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tool-tab-content').forEach(c => c.classList.add('hidden'));
      const target = document.getElementById(`tab-content-${tab}`);
      if (target) target.classList.remove('hidden');
    });
  });
}

// ---------------------------------------------------------------------------
// 2. Load Dashboard Data from API
// ---------------------------------------------------------------------------
async function loadDashboardData() {
  try {
    const res = await fetch('/api/dashboard');
    if (!res.ok) throw new Error("Dashboard fetch failed");
    dashboardData = await res.json();

    if (dashboardData.profile) {
      document.getElementById('dash-user-title').textContent = `${dashboardData.profile.name}'s Navigator`;
      document.getElementById('dash-user-subtitle').textContent = `Stage: ${dashboardData.profile.className || '10th'} | Home: ${dashboardData.profile.district || 'Maharashtra'}`;
    }

    renderLeftMatches(dashboardData.matches || []);
    renderLeftColleges(dashboardData.colleges || []);
  } catch (err) {
    console.warn("Using fallback client data for dashboard:", err);
  }
}

function renderLeftMatches(matches) {
  const container = document.getElementById('left-career-matches');
  if (!container) return;
  container.innerHTML = '';

  const t = window.CareerMitra ? window.CareerMitra.t : (key) => key;
  const lang = window.CareerMitra ? window.CareerMitra.lang : 'en';

  if (matches.length === 0) {
    container.innerHTML = `<div class="text-small text-muted p-2" data-i18n="dash_no_matches">No matches generated yet. Take the assessment!</div>`;
    if (window.CareerMitra) CareerMitra.applyTranslations();
    return;
  }

  matches.forEach(m => {
    const div = document.createElement('div');
    div.className = 'p-2 style-card mb-1';
    div.style.cssText = 'background:var(--bg-card); border-radius:8px; border:1px solid var(--border);';
    
    const name = (lang === 'mr' && m.nameMr) ? m.nameMr : (lang === 'hi' && m.nameHi) ? m.nameHi : m.name;
    const desc = (lang === 'mr' && m.descMr) ? m.descMr : (lang === 'hi' && m.descHi) ? m.descHi : m.description;

    div.innerHTML = `
      <div class="flex-between align-center mb-1">
        <strong class="text-small" style="color:var(--primary);">${name}</strong>
        <span class="badge badge-gold text-small">${m.matchPct || 90}% <span data-i18n="dash_match_pct_label">Match</span></span>
      </div>
      <p class="text-small text-muted mb-0" style="font-size:0.75rem;">${desc || ''}</p>
    `;
    container.appendChild(div);
  });
  if (window.CareerMitra) CareerMitra.applyTranslations();
}

function renderLeftColleges(colleges) {
  const container = document.getElementById('left-college-list');
  if (!container) return;
  container.innerHTML = '';
  
  const lang = window.CareerMitra ? window.CareerMitra.lang : 'en';

  colleges.forEach(c => {
    const div = document.createElement('div');
    div.className = 'p-2 mb-1';
    div.style.cssText = 'background:var(--bg-card); border-radius:8px; border:1px solid var(--border);';
    
    const name = (lang === 'mr' && c.nameMr) ? c.nameMr : (lang === 'hi' && c.nameHi) ? c.nameHi : c.name;

    div.innerHTML = `
      <div class="flex-between align-center">
        <strong class="text-small" style="font-size:0.8rem;">${name}</strong>
        <span class="badge badge-paper text-small">${c.district}</span>
      </div>
      <div class="flex-between text-small text-muted mt-1" style="font-size:0.75rem;">
        <span>📏 ${c.distanceKm || 10} km</span>
        <span>💵 ₹${c.annualFee || 'Subsidized'}/<span data-i18n="dash_yr">yr</span></span>
      </div>
    `;
    container.appendChild(div);
  });
  if (window.CareerMitra) CareerMitra.applyTranslations();
}

// ---------------------------------------------------------------------------
// 3. Center Panel: Dark Leaflet Map (Dharmik's implementation)
// ---------------------------------------------------------------------------
function initDarkMap() {
  const mapEl = document.getElementById('dark-map');
  if (!mapEl || typeof L === 'undefined') return;

  darkMap = L.map('dark-map', {
    center: [19.5, 76.0],
    zoom: 7,
    zoomControl: true,
    attributionControl: false
  });

  // Dark CartoDB Tiles (from Dharmik's home.html)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 18
  }).addTo(darkMap);

  // Load Maharashtra GeoJSON Boundary
  fetch('https://raw.githubusercontent.com/datameet/maps/master/States/maharashtra.geojson')
    .then(r => r.json())
    .then(data => {
      L.geoJSON(data, {
        style: {
          color: '#6366F1',
          weight: 2,
          opacity: 0.8,
          fillColor: '#6366F1',
          fillOpacity: 0.05
        }
      }).addTo(darkMap);
    })
    .catch(() => {
      console.log("GeoJSON fallback polygon");
    });

  // Place Regional Hub Markers
  REGIONAL_HUBS.forEach(city => addCityMarker(city));

  // Place College Pins if available
  if (dashboardData && dashboardData.colleges) {
    dashboardData.colleges.forEach(c => {
      if (c.lat && c.lng) {
        const collegeIcon = L.divIcon({
          html: `<div style="background:#10B981; width:12px; height:12px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 8px #10B981;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker([c.lat, c.lng], { icon: collegeIcon })
          .addTo(darkMap)
          .bindPopup(`<b>${c.name}</b><br/>District: ${c.district}<br/>Fee: ₹${c.annualFee}/yr`, { className: 'cm-popup' });
      }
    });
  }

  document.getElementById('map-pin-count').textContent = `${REGIONAL_HUBS.length} Regional Hubs Active`;
}

function addCityMarker(city) {
  const lang = window.CareerMitra ? window.CareerMitra.lang : 'en';
  
  const markerHtml = `
    <div style="
      width:34px; height:34px; border-radius:50%;
      background:${city.color}22;
      border:2px solid ${city.color};
      display:flex; align-items:center; justify-content:center;
      font-size:15px;
      box-shadow:0 0 12px ${city.color}40;
    ">${city.icon}</div>`;

  const icon = L.divIcon({ html: markerHtml, className: '', iconSize: [34, 34], iconAnchor: [17, 17] });

  const name = (lang === 'mr' && city.nameMr) ? city.nameMr : (lang === 'hi' && city.nameHi) ? city.nameHi : city.name;
  const region = (lang === 'mr' && city.regionMr) ? city.regionMr : (lang === 'hi' && city.regionHi) ? city.regionHi : city.region;
  const desc = (lang === 'mr' && city.descMr) ? city.descMr : (lang === 'hi' && city.descHi) ? city.descHi : city.desc;

  const popupHtml = `
    <div class="popup-title" style="font-weight:700; font-size:0.95rem; color:#f8fafc;">${city.icon} ${name}</div>
    <div class="popup-region" style="font-size:0.75rem; color:#94a3b8; margin-bottom:4px;">${region}</div>
    <p style="font-size:0.75rem; color:#cbd5e1; margin-bottom:6px; line-height:1.4;">${desc}</p>
    <div class="popup-stat" style="font-size:0.75rem; color:#10b981;">
      <strong><span data-i18n="dash_jobs">Jobs:</span> ${city.jobs}</strong> | <strong><span data-i18n="dash_colleges">Colleges:</span> ${city.colleges}</strong>
    </div>`;

  const marker = L.marker([city.lat, city.lng], { icon })
    .addTo(darkMap)
    .bindPopup(popupHtml, { maxWidth: 240, className: 'cm-popup' });
    
  marker.on('popupopen', () => {
    if(window.CareerMitra) CareerMitra.applyTranslations();
  });

  mapMarkers[city.name] = { marker, city };
}

function setupMapFilters() {
  const chips = document.querySelectorAll('#map-sector-chips .chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('on'));
      chip.classList.add('on');

      const sector = chip.getAttribute('data-sector');
      REGIONAL_HUBS.forEach(city => {
        const item = mapMarkers[city.name];
        if (!item) return;
        if (sector === 'all' || city.sector === sector) {
          item.marker.addTo(darkMap);
        } else {
          item.marker.removeFrom(darkMap);
        }
      });
    });
  });

  const searchInput = document.getElementById('mapSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      REGIONAL_HUBS.forEach(city => {
        const item = mapMarkers[city.name];
        if (!item) return;
        if (city.name.toLowerCase().includes(q) || city.region.toLowerCase().includes(q)) {
          item.marker.addTo(darkMap);
          if (q.length > 2) darkMap.panTo([city.lat, city.lng]);
        } else {
          item.marker.removeFrom(darkMap);
        }
      });
    });
  }
}

// ---------------------------------------------------------------------------
// 4. Right Panel: Mitra Tai AI Companion Chat
// ---------------------------------------------------------------------------
function setupMitraTaiChat() {
  const form = document.getElementById('tai-chat-form');
  const input = document.getElementById('tai-input');
  const messages = document.getElementById('tai-messages');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    appendUserMessage(text);
    input.value = '';

    appendThinkingMessage();

    try {
      const res = await fetch('/api/mitra-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      removeThinkingMessage();
      appendTaiMessage(data.reply || "मला समजले नाही, कृपया पुन्हा विचारा.");
    } catch (err) {
      removeThinkingMessage();
      appendTaiMessage("माझे AI सर्व्हर जोडता आले नाही. पुन्हा प्रयत्न करा.");
    }
  });

  // Prompt Chips
  document.querySelectorAll('.prompt-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      input.value = prompt;
      form.dispatchEvent(new Event('submit'));
    });
  });
}

function appendUserMessage(text) {
  const messages = document.getElementById('tai-messages');
  const div = document.createElement('div');
  div.className = 'message user-msg flex justify-end gap-2 my-1';
  div.innerHTML = `
    <div class="msg-bubble p-2 text-small" style="background:var(--primary); color:#fff; border-radius:12px; max-width:80%;">
      ${text}
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function appendTaiMessage(text) {
  const messages = document.getElementById('tai-messages');
  const div = document.createElement('div');
  div.className = 'message tai-msg flex align-start gap-2 my-1';
  div.innerHTML = `
    <span style="font-size:1.4rem;">👩‍🏫</span>
    <div class="msg-bubble p-2 text-small" style="background:#fff; border-radius:12px; box-shadow:0 2px 6px rgba(0,0,0,0.05); color:#333; max-width:85%;">
      ${text}
    </div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function appendThinkingMessage() {
  const messages = document.getElementById('tai-messages');
  const div = document.createElement('div');
  div.id = 'tai-thinking';
  div.className = 'message tai-msg flex align-start gap-2 my-1 text-muted text-small';
  div.innerHTML = `<span>👩‍🏫</span> <em>विचार करत आहे... (Thinking)</em>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeThinkingMessage() {
  const el = document.getElementById('tai-thinking');
  if (el) el.remove();
}

// ---------------------------------------------------------------------------
// 5. Left Panel Embed Helpers (Kharcha, Docs, Exams)
// ---------------------------------------------------------------------------
function setupKharchaEmbed() {
  const select = document.getElementById('left-cost-college');
  if (!select) return;

  const colleges = (dashboardData && dashboardData.colleges) || [
    { id: 'clg-gp-pune', name: 'Government Polytechnic, Pune' },
    { id: 'clg-gp-nashik', name: 'Government Polytechnic, Nashik' },
    { id: 'clg-coep-pune', name: 'COEP Technological University, Pune' }
  ];

  select.innerHTML = colleges.map(c => `<option value="${c.id || c.name}">${c.name}</option>`).join('');

  document.getElementById('left-calc-btn')?.addEventListener('click', async () => {
    const collegeId = select.value;
    const accom = document.getElementById('left-cost-accom').value;

    try {
      const res = await fetch('/api/cost-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeId, accommodationType: accom })
      });
      const data = await res.json();
      
      const resDiv = document.getElementById('left-cost-result');
      resDiv.classList.remove('hidden');
      document.getElementById('left-net-annual').textContent = `₹${(data.totals?.netAnnual || 45000).toLocaleString('en-IN')}`;
      document.getElementById('left-net-monthly').textContent = `₹${(data.totals?.netMonthly || 3750).toLocaleString('en-IN')}`;
      document.getElementById('left-income-impact').textContent = `Family Impact: ~${data.familyImpact?.incomePercentage || 25}% of monthly income`;
    } catch (e) {
      console.warn("Kharcha embed fallback");
    }
  });
}

function setupDocsEmbed() {
  const container = document.getElementById('left-doc-checklist');
  if (!container) return;

  const docs = [
    { id: '10th', name: '10th SSC Marksheet' },
    { id: 'income', name: 'Tahsildar Income Certificate' },
    { id: 'domicile', name: 'Maharashtra Domicile Cert' },
    { id: 'aadhaar', name: 'Aadhaar (Bank Linked)' }
  ];

  container.innerHTML = docs.map(d => `
    <div class="flex align-center gap-2 p-2" style="background:var(--bg-card); border-radius:6px; font-size:0.8rem;">
      <input type="checkbox" checked style="accent-color:var(--primary);">
      <span>${d.name}</span>
    </div>
  `).join('');
}

function setupExamsEmbed() {
  const container = document.getElementById('left-exam-list');
  if (!container) return;

  const exams = [
    { name: 'MHT-CET (Engineering)', date: 'April - May 2026' },
    { name: 'DTE Polytechnic CAP', date: 'June - July 2026' },
    { name: 'MahaDBT Scholarship', date: 'August 2026' }
  ];

  container.innerHTML = exams.map(e => `
    <div class="p-2" style="background:var(--bg-card); border-radius:6px; border:1px solid var(--border);">
      <strong class="text-small">${e.name}</strong>
      <div class="text-small text-muted">🗓️ ${e.date}</div>
    </div>
  `).join('');
}
