/**
 * AARAMBH - Career & Side Income Comparison Engine
 * Supports side-by-side comparison, earn-while-you-learn micro-gigs & multilingual rendering
 */

let allCareers = [];
let selectedCareerIds = ['elec_tech', 'software_dev', 'agri_tech'];

function getActiveLang() {
  return (window.CareerMitra && window.CareerMitra.lang) || localStorage.getItem('cm-lang') || 'en';
}

async function initCareerCompare() {
  try {
    const res = await fetch('/api/careers/compare');
    if (res.ok) {
      allCareers = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch comparison data:', err);
  }

  renderSelector();
  renderComparisonMatrix();
  renderSideIncomeSection();

  document.addEventListener('cm-lang-changed', () => {
    renderSelector();
    renderComparisonMatrix();
    renderSideIncomeSection();
  });
}

function renderSelector() {
  const container = document.getElementById('career-selector-grid');
  if (!container) return;

  const lang = getActiveLang();
  container.innerHTML = '';

  allCareers.forEach(c => {
    const isSelected = selectedCareerIds.includes(c.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'} flex align-center gap-2 p-2`;
    btn.style.borderRadius = '20px';
    btn.style.fontSize = '0.9rem';

    const name = lang === 'mr' ? c.nameMr : c.nameEn;
    btn.innerHTML = `<span>${c.icon}</span> <span>${name}</span> ${isSelected ? '✓' : '+'}`;

    btn.addEventListener('click', () => {
      toggleCareerSelection(c.id);
    });

    container.appendChild(btn);
  });
}

function toggleCareerSelection(id) {
  if (selectedCareerIds.includes(id)) {
    if (selectedCareerIds.length <= 1) return; // keep at least 1
    selectedCareerIds = selectedCareerIds.filter(x => x !== id);
  } else {
    if (selectedCareerIds.length >= 3) {
      selectedCareerIds.shift(); // keep max 3
    }
    selectedCareerIds.push(id);
  }

  renderSelector();
  renderComparisonMatrix();
  renderSideIncomeSection();
}

function renderComparisonMatrix() {
  const container = document.getElementById('comparison-matrix-container');
  if (!container) return;

  const lang = getActiveLang();
  const selectedCareers = allCareers.filter(c => selectedCareerIds.includes(c.id));

  if (selectedCareers.length === 0) {
    container.innerHTML = `<div class="text-center p-4 text-muted">Select careers above to compare.</div>`;
    return;
  }

  let html = `
    <div class="card p-4 overflow-x-auto" style="border-radius: 16px;">
      <table class="table w-100" style="min-width: 650px; border-collapse: separate; border-spacing: 0;">
        <thead>
          <tr>
            <th style="width: 20%; background: var(--bg-card); font-weight: 700; border-bottom: 2px solid var(--gold-light);">
              ${lang === 'mr' ? 'तुलना मुद्दे' : 'Feature'}
            </th>
  `;

  selectedCareers.forEach(c => {
    const name = lang === 'mr' ? c.nameMr : c.nameEn;
    html += `
      <th style="width: ${80 / selectedCareers.length}%; text-align: center; background: rgba(217,164,65,0.08); border-bottom: 2px solid var(--gold); border-radius: 12px 12px 0 0;">
        <div style="font-size: 1.8rem; margin-bottom: 4px;">${c.icon}</div>
        <div style="font-weight: 700; color: var(--earth-brown); font-size: 1rem;">${name}</div>
        <div class="text-small text-muted" style="font-weight: 500;">${c.category}</div>
      </th>
    `;
  });

  html += `
          </tr>
        </thead>
        <tbody>
          <!-- Row 1: Duration -->
          <tr>
            <td style="font-weight: 600; color: var(--earth-brown);">⏱️ ${lang === 'mr' ? 'कालावधी' : 'Duration'}</td>
  `;
  selectedCareers.forEach(c => {
    html += `<td class="text-center">${c.duration}</td>`;
  });

  html += `
          </tr>
          <!-- Row 2: Starting Salary -->
          <tr>
            <td style="font-weight: 600; color: var(--earth-brown);">💰 ${lang === 'mr' ? 'शुरुवातीचा पगार' : 'Starting Salary'}</td>
  `;
  selectedCareers.forEach(c => {
    html += `<td class="text-center"><span class="badge" style="background: rgba(79,122,69,0.15); color: var(--green); font-weight: 700; padding: 4px 10px; border-radius: 8px;">${c.startingSalary}</span></td>`;
  });

  html += `
          </tr>
          <!-- Row 3: Growth Outlook -->
          <tr>
            <td style="font-weight: 600; color: var(--earth-brown);">📈 ${lang === 'mr' ? 'वाढ व मागणी' : 'Growth & Demand'}</td>
  `;
  selectedCareers.forEach(c => {
    html += `<td class="text-center" style="font-weight: 600; color: var(--indigo);">${c.growthRate}</td>`;
  });

  html += `
          </tr>
          <!-- Row 4: Minimum Qualification -->
          <tr>
            <td style="font-weight: 600; color: var(--earth-brown);">🎓 ${lang === 'mr' ? 'किमान पात्रता' : 'Min Qualification'}</td>
  `;
  selectedCareers.forEach(c => {
    html += `<td class="text-center">${c.minQualification}</td>`;
  });

  html += `
          </tr>
          <!-- Row 5: Side Income Opportunities -->
          <tr>
            <td style="font-weight: 600; color: var(--earth-brown);">💡 ${lang === 'mr' ? 'साइड कमाई वाटा' : 'Side Income Options'}</td>
  `;
  selectedCareers.forEach(c => {
    const gigCount = c.sideIncomeGigs ? c.sideIncomeGigs.length : 0;
    html += `
      <td class="text-center">
        <span style="font-weight: 700; color: var(--terracotta);">${gigCount} ${lang === 'mr' ? 'उपलब्ध वाटा' : 'Active Gigs'}</span>
      </td>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

function renderSideIncomeSection() {
  const container = document.getElementById('side-income-cards-grid');
  if (!container) return;

  const lang = getActiveLang();
  const selectedCareers = allCareers.filter(c => selectedCareerIds.includes(c.id));
  container.innerHTML = '';

  selectedCareers.forEach(c => {
    const careerName = lang === 'mr' ? c.nameMr : c.nameEn;
    (c.sideIncomeGigs || []).forEach(gig => {
      const gigTitle = lang === 'mr' ? gig.titleMr : gig.titleEn;
      const gigDesc = lang === 'mr' ? gig.descMr : gig.descEn;

      const card = document.createElement('div');
      card.className = 'card p-3 glass-card hover-lift flex-column justify-between';
      card.style.borderRadius = '14px';
      card.style.background = 'var(--bg-card)';
      card.style.border = '1px solid var(--border)';

      card.innerHTML = `
        <div>
          <div class="flex-between align-center mb-2">
            <span class="badge" style="font-size: 0.75rem; background: rgba(217,164,65,0.15); color: var(--earth-brown); border-radius: 12px; padding: 2px 8px;">
              ${c.icon} ${careerName}
            </span>
            <span class="text-small text-muted">⏱️ ${gig.hours}</span>
          </div>

          <h4 class="h5 mb-2" style="color: var(--earth-brown); font-weight: 600;">
            ${gigTitle}
          </h4>
          <p class="text-small text-muted mb-3" style="line-height: 1.5;">
            ${gigDesc}
          </p>
        </div>

        <div class="pt-2 flex-between align-center" style="border-top: 1px dashed var(--border-light);">
          <div>
            <div class="text-tiny text-muted">${lang === 'mr' ? 'अंदाजे मासिक कमाई' : 'Est. Monthly Income'}</div>
            <div style="font-weight: 700; color: var(--green); font-size: 1rem;">${gig.estEarning}</div>
          </div>
          <button type="button" class="btn btn-sm btn-outline" style="border-radius: 8px;" onclick="alert('${lang === 'mr' ? 'हे काम सुरू करण्यासाठी तुमच्या मित्र ताईशी बोला किंवा स्थानिक केंद्राशी संपर्क साधा!' : 'To start this micro-gig, talk to Mitra Tai or visit your local skill center!'}')">
            ${lang === 'mr' ? 'शुरू करा 🚀' : 'Start Gig 🚀'}
          </button>
        </div>
      `;

      container.appendChild(card);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('comparison-matrix-container')) {
    initCareerCompare();
  }
});
