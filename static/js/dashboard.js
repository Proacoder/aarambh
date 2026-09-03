const CAREER_ICONS = {
  code: '💻', book: '📚', heart: '❤️', leaf: '🌿',
  wrench: '🔧', shield: '🛡️', coins: '💰',
  hammer: '🔨', rocket: '🚀', palette: '🎨',
  default: '✨'
};

let map = null;

async function initDashboard() {
  const spinner = document.getElementById('loading-spinner');
  const content = document.getElementById('dashboard-content');

  try {
    const profileRes = await fetch('/api/profile');
    if (!profileRes.ok) {
      window.location.href = '/onboarding';
      return;
    }
    const profile = await profileRes.json();
    if (!profile) {
      window.location.href = '/onboarding';
      return;
    }

    const dashRes = await fetch('/api/dashboard');
    if (!dashRes.ok) {
      window.location.href = '/onboarding';
      return;
    }
    const data = await dashRes.json();

    if (spinner) spinner.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    const nameEl = document.getElementById('dash-user-name');
    if (nameEl) nameEl.textContent = `${profile.name}'s Top Matches`;
    const distEl = document.getElementById('dash-user-district');
    if (distEl) distEl.textContent = `Targeting options near ${profile.district} District | Class: ${profile.className}`;

    renderCareerCards(data.matches || []);
    renderCollegeCards(data.colleges || []);
    renderSchemeCards(data.schemes || []);

    if (data.districtCenter) {
      initMap(data.districtCenter, data.radiusKm || 50, data.colleges || []);
    }

    setupStickyCTA(data.matches || []);
  } catch (error) {
    console.error('Dashboard init error:', error);
    if (spinner) {
      spinner.innerHTML = `<p class="text-muted">${CareerMitra.t('error_loading_dashboard') || 'Something went wrong loading your matches. Please try again.'}</p>`;
    }
  }
}

function renderCareerCards(matches) {
  const container = document.getElementById('career-matches');
  if (!container) return;
  container.innerHTML = '';

  if (matches.length === 0) {
    container.innerHTML = `<div class="empty-state">${CareerMitra.t('no_schemes') || 'No matches found yet.'}</div>`;
    return;
  }

  matches.forEach((match, i) => {
    const card = document.createElement('div');
    card.className = `card card-career animate-on-scroll stagger-${(i % 4) + 1}`;

    const icon = CAREER_ICONS[match.icon] || CAREER_ICONS.default;
    const matchPct = Math.round(match.matchPct);

    const rankBadgeText = i === 0 
      ? (CareerMitra.t('best_match_badge') || '🥇 BEST MATCH')
      : (i === 1 ? (CareerMitra.t('strong_match_badge') || '🥈 STRONG MATCH') : (CareerMitra.t('good_match_badge') || '🥉 GOOD MATCH'));
    const rankClass = i === 0 ? 'badge-gold' : (i === 1 ? 'badge-indigo' : 'badge-paper');

    const askPrompt = encodeURIComponent(`माझ्यासाठी ${match.name} हे करिअर कसं योग्य आहे? (Why does ${match.name} suit me?)`);

    card.innerHTML = `
      <div class="flex-between align-center mb-2">
        <span class="badge ${rankClass}">${rankBadgeText}</span>
        <span class="match-pct-text text-bold" style="color: var(--terracotta);">${matchPct}%</span>
      </div>
      
      <div class="career-header flex align-center gap-2 mb-2">
        <div class="icon-circle" style="font-size:1.25rem;">${icon}</div>
        <h3>${match.name}</h3>
      </div>
      
      <p class="career-desc text-muted mb-3">${match.description}</p>
      
      <div class="mb-3">
        <div class="flex-between text-small text-muted mb-1">
          <span>${CareerMitra.t('match_label') || 'Match'}</span>
          <span>${matchPct}%</span>
        </div>
        <div class="match-pct-bar-wrap">
          <div class="match-pct-bar" data-target="${matchPct}"></div>
        </div>
      </div>

      <div class="match-badge text-small mb-3">
        ✓ ${CareerMitra.t('why_match') || 'Why this fits you'}: ${(match.topDims || []).join(', ')}
      </div>

      <div class="flex flex-column gap-2">
        <a href="/roadmap?careerId=${match.id}" class="btn btn-primary ripple text-center">${CareerMitra.t('view_roadmap') || 'View Roadmap →'}</a>
        <button class="btn btn-gold btn-sm ripple tai-ask-trigger" data-prompt="${askPrompt}">
          👩‍🏫 Ask Mitra Tai why this suits me
        </button>
      </div>
    `;
    container.appendChild(card);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const barFill = card.querySelector('.match-pct-bar');
        if (barFill) barFill.style.width = `${matchPct}%`;
      }, 150 + i * 80);
    });
  });

  document.querySelectorAll('.tai-ask-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      window.location.href = `/career-aunty?prompt=${prompt}`;
    });
  });
}

function initMap(center, radiusKm, colleges) {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  if (map) {
    map.remove();
    map = null;
  }

  map = L.map('map', { scrollWheelZoom: false }).setView([center.lat, center.lng], 9);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  L.circle([center.lat, center.lng], {
    color: '#3D2B1F',
    fillColor: '#D9A441',
    fillOpacity: 0.12,
    weight: 2,
    radius: radiusKm * 1000,
  }).addTo(map);

  const studentIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#B8573C; width:18px; height:18px; border-radius:50%; border:3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);'></div>",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  L.marker([center.lat, center.lng], { icon: studentIcon }).addTo(map)
    .bindPopup(`<b>${CareerMitra.t('map_your_location') || 'Your district'}</b>`);

  colleges.forEach((college, index) => {
    const isHighRelevance = college.relevance >= 2;
    const color = isHighRelevance ? '#4F7A45' : '#4F6FAF';

    const collegeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style='background-color:${color}; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);'></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([college.lat, college.lng], { icon: collegeIcon }).addTo(map);
    marker.bindPopup(`
      <strong>${college.name}</strong><br/>
      ${college.distanceKm != null ? college.distanceKm + ' km away' : ''}<br/>
      ₹${college.annualFee}/yr<br/>
      ${(college.courses || []).join(', ')}
    `);

    college._marker = marker;
  });

  setTimeout(() => map && map.invalidateSize(), 400);
}

function renderCollegeCards(colleges) {
  const container = document.getElementById('college-cards');
  if (!container) return;
  container.innerHTML = '';

  if (colleges.length === 0) {
    container.innerHTML = `<div class="empty-state">${CareerMitra.t('no_colleges') || 'No matching institutions found nearby yet.'}</div>`;
    return;
  }

  colleges.forEach((college, index) => {
    const card = document.createElement('div');
    card.className = 'card card-college';

    const askPrompt = encodeURIComponent(`मला ${college.name} या कॉलेजबद्दल माहिती सांगा (Tell me about ${college.name})`);

    card.innerHTML = `
      <div class="flex-between align-start mb-2">
        <h4>${college.name}</h4>
        <div class="flex gap-1 flex-wrap">
          <span class="badge badge-paper">${college.type}</span>
          <span class="badge badge-outline">${college.category}</span>
        </div>
      </div>
      <div class="flex gap-4 mb-2">
        <span class="text-small text-muted">📍 ${college.distanceKm != null ? college.distanceKm + ' km' : '—'}</span>
        <span class="text-small text-muted">💰 ₹${college.annualFee}/yr</span>
      </div>
      <p class="text-small mb-3"><strong>Courses:</strong> ${(college.courses || []).join(', ')}</p>
      
      <div class="flex flex-wrap gap-2 align-center">
        <button class="btn btn-secondary btn-sm view-on-map-btn" data-index="${index}">${CareerMitra.t('view_on_map') || 'View on map'}</button>
        <a href="/career-aunty?prompt=${askPrompt}" class="btn btn-link text-small flex align-center gap-1">
          <span>👩‍🏫</span> <span>Ask Mitra Tai</span>
        </a>
      </div>
    `;

    container.appendChild(card);
  });

  document.querySelectorAll('.view-on-map-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      const college = colleges[idx];
      if (college && college._marker && map) {
        document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
        map.flyTo([college.lat, college.lng], 13);
        setTimeout(() => college._marker.openPopup(), 700);
      }
    });
  });
}

function renderSchemeCards(schemes) {
  const container = document.getElementById('scheme-cards');
  if (!container) return;
  container.innerHTML = '';

  if (schemes.length === 0) {
    container.innerHTML = `<div class="empty-state">${CareerMitra.t('no_schemes') || 'No matching schemes for this profile yet.'}</div>`;
    return;
  }

  schemes.forEach(scheme => {
    const card = document.createElement('div');
    card.className = 'card card-scheme';

    let docsHtml = '';
    if (scheme.requiredDocs && scheme.requiredDocs.length) {
      docsHtml = `<div class="eligibility-list mt-2 mb-2">` + scheme.requiredDocs.map(doc =>
        `<div class="eligibility-item"><span class="eligibility-icon eligibility-pass">✓</span><span>${doc}</span></div>`
      ).join('') + `</div>`;
    }

    const askPrompt = encodeURIComponent(`मला ${scheme.name} या शिष्यवृत्तीबद्दल माहिती सांगा (Explain ${scheme.name})`);

    card.innerHTML = `
      <div class="flex-between align-start mb-1">
        <h4>${scheme.name}</h4>
        <span class="badge badge-gold">MahaDBT</span>
      </div>
      <p class="text-small text-muted mb-2">${scheme.provider}</p>
      <p class="text-small mb-2"><strong>Benefit:</strong> ${scheme.benefit}</p>
      <p class="text-small text-muted"><strong>Required Documents:</strong></p>
      ${docsHtml}
      <div class="flex align-center flex-wrap gap-2 mt-3">
        <a href="${scheme.applyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">${CareerMitra.t('official_link') || 'Official portal'}</a>
        <a href="/career-aunty?prompt=${askPrompt}" class="btn btn-link text-small flex align-center gap-1">
          <span>👩‍🏫</span> <span>Ask Mitra Tai</span>
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

function setupStickyCTA(matches) {
  const wrap = document.getElementById('sticky-cta');
  const ctaBtn = document.getElementById('sticky-cta-btn');
  if (!wrap || !ctaBtn) return;

  let bestMatchId = sessionStorage.getItem('cm-first-match');
  if (!bestMatchId && matches.length > 0) {
    bestMatchId = matches[0].id;
  }

  if (bestMatchId) {
    ctaBtn.setAttribute('href', `/roadmap?careerId=${bestMatchId}`);
    wrap.classList.remove('hidden');
  } else {
    wrap.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboard-content')) {
    initDashboard();
  }
});

