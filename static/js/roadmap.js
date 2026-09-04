async function initRoadmap() {
  const urlParams = new URLSearchParams(window.location.search);
  const careerId = urlParams.get('careerId') || sessionStorage.getItem('cm-first-match') || '';

  const spinner = document.getElementById('loading-state');
  const content = document.getElementById('roadmap-content');

  try {
    const fetchUrl = careerId ? `/api/roadmap?careerId=${encodeURIComponent(careerId)}` : '/api/roadmap';
    const res = await fetch(fetchUrl);
    if (!res.ok) {
      throw new Error("Failed to load roadmap");
    }
    const data = await res.json();

    if (spinner) spinner.classList.add('hidden');
    if (content) content.classList.remove('hidden');

    renderRoadmap(data);
    setupActions();

    if (window.CareerMitra && typeof CareerMitra.celebrate === 'function') {
      CareerMitra.celebrate();
    }
  } catch (error) {
    console.error('Roadmap init error:', error);
    if (spinner) {
      spinner.innerHTML = `<p class="text-muted">${CareerMitra.t('error_loading_roadmap') || 'Something went wrong building your roadmap. Please try again.'}</p>`;
    }
  }
}

function renderRoadmap(data) {
  const { roadmap, career, profile } = data;

  const subtitle = document.getElementById('roadmap-subtitle');
  if (subtitle) {
    subtitle.textContent = CareerMitra.t('roadmap_for', { name: profile.name, career: career.name });
  }

  const careerDesc = document.getElementById('roadmap-career-desc');
  if (careerDesc) {
    careerDesc.textContent = career.description;
  }

  renderSteps('immediate-steps', roadmap.immediateSteps);
  renderSteps('later-steps', roadmap.laterSteps);
  renderSteps('scholarship-steps', roadmap.scholarshipSteps);

  const collegesList = document.getElementById('nearby-colleges-list');
  if (collegesList) {
    collegesList.innerHTML = '';
    if (!roadmap.nearbyCollegeNames || roadmap.nearbyCollegeNames.length === 0) {
      collegesList.innerHTML = `<p class="text-muted">${CareerMitra.t('no_colleges') || 'No matching institutions found nearby yet.'}</p>`;
    } else {
      roadmap.nearbyCollegeNames.forEach((collegeName, idx) => {
        const step = document.createElement('div');
        step.className = 'roadmap-step fade-in p-3 mb-2';
        step.style.cssText = 'position:relative; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-light); margin-left:12px; box-shadow:var(--shadow-sm);';
        step.innerHTML = `
          <div class="roadmap-step-dot" style="border-color:var(--secondary)"></div>
          <div class="flex align-center gap-2 mb-1">
            <span class="badge badge-gold text-small" style="font-size:0.75rem;">Institute ${idx + 1}</span>
          </div>
          <p class="mb-0" style="font-size:0.95rem; line-height:1.5; color:var(--earth-brown); font-weight:600;">🏛️ ${collegeName}</p>
        `;
        collegesList.appendChild(step);
      });
    }
  }

  const outlookContainer = document.getElementById('long-term');
  if (outlookContainer) {
    outlookContainer.innerHTML = `<p class="roadmap-outlook">${roadmap.longTermOutlook || ''}</p>`;
  }

  populatePdfContent(data);
}

function renderSteps(containerId, stepsArray) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  container.className = 'roadmap-step-container roadmap-timeline-connected';
  const isScholarship = containerId === 'scholarship-steps';

  if (!stepsArray || stepsArray.length === 0 || (stepsArray.length === 1 && stepsArray[0] === '-')) {
    const defaultMsg = isScholarship
      ? (CareerMitra.t('no_schemes') || 'Check MahaDBT portal for general category fee concessions.')
      : (CareerMitra.t('no_steps') || 'Steps are being tailored for your profile. Ask Mitra Tai for immediate advice.');
    container.innerHTML = `<p class="text-muted p-2">${defaultMsg}</p>`;
    return;
  }

  stepsArray.forEach((step, idx) => {
    const stepEl = document.createElement('div');
    stepEl.className = 'roadmap-step fade-in p-3 mb-3';
    stepEl.style.cssText = 'position:relative; background:var(--bg-card); border-radius:10px; border:1px solid var(--border-light); margin-left:12px; box-shadow:var(--shadow-sm);';
    
    const badgeText = isScholarship ? `🎓 Scheme ${idx + 1}` : `Step ${idx + 1}`;
    const badgeClass = isScholarship ? 'badge badge-green text-small' : 'badge badge-gold text-small';

    // Separate title and details if delimited by em dash
    let title = step;
    let detail = '';
    if (step.includes(' — ')) {
      const parts = step.split(' — ');
      title = parts[0];
      detail = parts.slice(1).join(' — ');
    }

    stepEl.innerHTML = `
      <div class="roadmap-step-dot" style="${isScholarship ? 'border-color:var(--success)' : ''}"></div>
      <div class="flex align-center gap-2 mb-1">
        <span class="${badgeClass}" style="font-size:0.75rem;">${badgeText}</span>
      </div>
      <p class="mb-0" style="font-size:0.95rem; line-height:1.5; color:var(--earth-brown); font-weight:600;">${title}</p>
      ${detail ? `<p class="mt-1 mb-0 text-muted text-small" style="line-height:1.4;">${detail}</p>` : ''}
    `;
    container.appendChild(stepEl);
  });
}

function populatePdfContent(data) {
  const pdfContainer = document.getElementById('pdf-content');
  if (!pdfContainer) return;

  const { roadmap, career, profile } = data;

  pdfContainer.innerHTML = `
    <div style="font-family: sans-serif; color: #2C1810; padding: 20px;">
      <h1 style="color: #2B4C7E; border-bottom: 2px solid #E0D5C8; padding-bottom: 10px;">CareerMitra Roadmap</h1>
      <p><strong>Student:</strong> ${profile.name}</p>
      <p><strong>District:</strong> ${profile.district}</p>
      <p><strong>Career Goal:</strong> ${career.name}</p>
      <hr style="border: 0; border-top: 1px solid #E0D5C8; margin: 20px 0;">

      <h2 style="color: #C75B3A; font-size: 1.2rem;">Immediate Steps</h2>
      <ul>${(roadmap.immediateSteps || []).map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #C75B3A; font-size: 1.2rem; margin-top: 20px;">Scholarship & Financial Aid</h2>
      <ul>${(roadmap.scholarshipSteps || []).map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #C75B3A; font-size: 1.2rem; margin-top: 20px;">Later Steps</h2>
      <ul>${(roadmap.laterSteps || []).map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #C75B3A; font-size: 1.2rem; margin-top: 20px;">Recommended Colleges Nearby</h2>
      <ul>${(roadmap.nearbyCollegeNames || []).map(s => `<li>${s}</li>`).join('')}</ul>

      <h2 style="color: #C75B3A; font-size: 1.2rem; margin-top: 20px;">Long Term Outlook</h2>
      <p>${roadmap.longTermOutlook || ''}</p>

      <div style="margin-top: 40px; text-align: center; font-size: 0.9em; color: #6B5744;">
        Generated by CareerMitra
      </div>
    </div>
  `;
}

function setupActions() {
  const pdfBtn = document.getElementById('btn-download-pdf');
  if (pdfBtn) {
    pdfBtn.addEventListener('click', generatePDF);
  }

  const startOverBtn = document.getElementById('btn-start-over');
  if (startOverBtn) {
    startOverBtn.addEventListener('click', startOver);
  }
}

async function generatePDF() {
  const pdfBtn = document.getElementById('btn-download-pdf');
  const originalText = pdfBtn.innerHTML;

  if (typeof html2pdf === 'undefined') {
    alert('PDF library not loaded. Please refresh and try again.');
    return;
  }

  try {
    pdfBtn.innerHTML = `<span class="btn-spinner"></span>`;
    pdfBtn.disabled = true;

    const element = document.getElementById('pdf-content');
    element.style.display = 'block';

    const opt = {
      margin: 10,
      filename: 'careermitra-roadmap.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    await html2pdf().set(opt).from(element).save();

    element.style.display = 'none';
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF.');
  } finally {
    pdfBtn.innerHTML = originalText;
    pdfBtn.disabled = false;
  }
}

async function startOver(e) {
  if (e) e.preventDefault();
  if (!confirm(CareerMitra.t('confirm_start_over') || 'Are you sure you want to start over? All progress will be lost.')) {
    return;
  }

  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    sessionStorage.clear();
    window.location.href = '/onboarding';
  } catch (error) {
    console.error('Reset error:', error);
    sessionStorage.clear();
    window.location.href = '/onboarding';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('roadmap-content')) {
    initRoadmap();
  }
});
