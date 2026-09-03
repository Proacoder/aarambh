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

    card.innerHTML = `
      <div class="career-header flex" style="gap: var(--sp-3); align-items:center;">
        <div class="icon-circle" style="font-size:1.25rem;">${icon}</div>
        <h3>${match.name}</h3>
      </div>
      <p class="career-desc text-muted">${match.description}</p>
      <div>
        <div class="flex-between">
          <span class="text-small text-muted">${CareerMitra.t('match_label') || 'Match'}</span>
          <span class="match-pct-text">${matchPct}%</span>
        </div>
        <div class="match-pct-bar-wrap">
          <div class="match-pct-bar" data-target="${matchPct}"></div>
        </div>
      </div>
      <div class="match-badge">${CareerMitra.t('why_match') || 'Why this fits you'}: ${(match.topDims || []).join(', ')}</div>
      <a href="/roadmap?careerId=${match.id}" class="btn btn-primary ripple mt-2">${CareerMitra.t('view_roadmap') || 'View Roadmap'}</a>
    `;
    container.appendChild(card);

    requestAnimationFrame(() => {
      setTimeout(() => {
        const barFill = card.querySelector('.match-pct-bar');
        if (barFill) barFill.style.width = `${matchPct}%`;
      }, 150 + i * 80);
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
    color: '#2B4C7E',
    fillColor: '#2B4C7E',
    fillOpacity: 0.08,
    weight: 1,
    radius: radiusKm * 1000,
  }).addTo(map);

  const studentIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div style='background-color:#C75B3A; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);'></div>",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  L.marker([center.lat, center.lng], { icon: studentIcon }).addTo(map)
    .bindPopup(`<b>${CareerMitra.t('map_your_location') || 'Your district'}</b>`);

  colleges.forEach((college, index) => {
    const isHighRelevance = college.relevance >= 2;
    const color = isHighRelevance ? '#3A7D44' : '#2B4C7E';

    const collegeIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style='background-color:${color}; width:13px; height:13px; border-radius:50%; border:2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);'></div>`,
      iconSize: [13, 13],
      iconAnchor: [6, 6],
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

    card.innerHTML = `
      <div class="flex-between align-start">
        <h4>${college.name}</h4>
        <div class="flex" style="gap: 6px;">
          <span class="badge">${college.type}</span>
          <span class="badge badge-outline">${college.category}</span>
        </div>
      </div>
      <div class="flex" style="gap: var(--sp-4);">
        <span class="text-small text-muted">📍 ${college.distanceKm != null ? college.distanceKm + ' km' : '—'}</span>
        <span class="text-small text-muted">💰 ₹${college.annualFee}/yr</span>
      </div>
      <p class="text-small"><strong>Courses:</strong> ${(college.courses || []).join(', ')}</p>
      <button class="btn btn-secondary btn-sm mt-2 view-on-map-btn" data-index="${index}">${CareerMitra.t('view_on_map') || 'View on map'}</button>
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
      docsHtml = `<div class="eligibility-list">` + scheme.requiredDocs.map(doc =>
        `<div class="eligibility-item"><span class="eligibility-icon eligibility-pass">✓</span><span>${doc}</span></div>`
      ).join('') + `</div>`;
    }

    card.innerHTML = `
      <h4>${scheme.name}</h4>
      <p class="text-small text-muted">${scheme.provider}</p>
      <p class="text-small"><strong>Benefit:</strong> ${scheme.benefit}</p>
      ${docsHtml}
      <a href="${scheme.applyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm mt-2">${CareerMitra.t('official_link') || 'Official portal'}</a>
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
