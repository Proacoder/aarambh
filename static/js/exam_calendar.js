document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('exam-calendar-container');
  if (!container) return;

  async function fetchExams() {
    try {
      const response = await fetch('/api/exam-calendar');
      if (response.ok) {
        const data = await response.json();
        return data.exams || [];
      }
    } catch (e) {
      console.warn('Failed to fetch from API, using fallback data', e);
    }
    // Fallback data
    return [
      {
        id: "mht-cet",
        name: "MHT-CET 2025",
        conductingBody: "State CET Cell, Maharashtra",
        description: "Entrance exam for Engineering, Pharmacy, and Agriculture degree courses in Maharashtra.",
        registrationStart: "Feb 2025",
        registrationEnd: "Mar 2025",
        examMonth: "May 2025",
        resultMonth: "June 2025",
        counsellingMonth: "July 2025",
        eligibility: "12th Science (PCM/PCB)",
        officialUrl: "https://cetcell.mahacet.org",
        forEducationLevel: ["12th"],
        riasecDomains: ["realistic", "investigative"],
        tips: ["Start mock tests in January", "Focus on 11th & 12th state board syllabus"]
      },
      {
        id: "iti-admission",
        name: "Maharashtra ITI Admission",
        conductingBody: "DVET Maharashtra",
        description: "Centralized admission process for Government and Private ITIs across Maharashtra.",
        registrationStart: "June 2025",
        registrationEnd: "July 2025",
        examMonth: "Merit Based",
        resultMonth: "July 2025",
        counsellingMonth: "August 2025",
        eligibility: "10th Pass",
        officialUrl: "https://admission.dvet.gov.in",
        forEducationLevel: ["10th", "12th"],
        riasecDomains: ["realistic"],
        tips: ["Keep Caste Certificate & Non-creamy layer ready", "No entrance exam, admission is based on 10th marks"]
      },
      {
        id: "polytechnic",
        name: "Polytechnic (Diploma) Admission",
        conductingBody: "DTE Maharashtra",
        description: "Admission to 3-year Diploma in Engineering and Technology.",
        registrationStart: "June 2025",
        registrationEnd: "July 2025",
        examMonth: "Merit Based",
        resultMonth: "July 2025",
        counsellingMonth: "August 2025",
        eligibility: "10th Pass",
        officialUrl: "https://poly24.dtemaharashtra.gov.in",
        forEducationLevel: ["10th"],
        riasecDomains: ["realistic", "investigative"],
        tips: ["Good alternative to 11th/12th for early entry into engineering", "EBC scholarship available for Open category"]
      }
    ];
  }

  function renderExamCard(exam) {
    const domainBadges = (exam.riasecDomains || []).map(d => 
      `<span class="badge badge-outline">${d.charAt(0).toUpperCase() + d.slice(1)}</span>`
    ).join(' ');
    
    const tips = (exam.tips || []).map(t => `<li class="text-small">${t}</li>`).join('');
    
    return `
      <div class="card mb-3 animate-on-scroll exam-card" data-levels='${JSON.stringify(exam.forEducationLevel || [])}'>
        <div class="flex-between flex-wrap gap-2 mb-2">
          <div>
            <h3 style="margin-bottom:4px">${exam.name}</h3>
            <p class="text-small text-muted">${exam.conductingBody}</p>
          </div>
          <div class="flex gap-1 flex-wrap">${domainBadges}</div>
        </div>
        
        <p class="text-small mb-3">${exam.description}</p>
        
        <div class="grid-2 md-grid-4 gap-2 mb-3">
          <div style="padding:0.5rem;background:var(--bg-card);border-radius:8px;text-align:center">
            <div class="text-small text-muted">📝 Registration</div>
            <div style="font-weight:600;font-size:0.85rem">${exam.registrationStart} - ${exam.registrationEnd}</div>
          </div>
          <div style="padding:0.5rem;background:var(--bg-card);border-radius:8px;text-align:center">
            <div class="text-small text-muted">📅 Exam</div>
            <div style="font-weight:600;font-size:0.85rem">${exam.examMonth}</div>
          </div>
          <div style="padding:0.5rem;background:var(--bg-card);border-radius:8px;text-align:center">
            <div class="text-small text-muted">📊 Result</div>
            <div style="font-weight:600;font-size:0.85rem">${exam.resultMonth}</div>
          </div>
          <div style="padding:0.5rem;background:var(--bg-card);border-radius:8px;text-align:center">
            <div class="text-small text-muted">🎓 Counselling</div>
            <div style="font-weight:600;font-size:0.85rem">${exam.counsellingMonth}</div>
          </div>
        </div>
        
        <div class="flex-between flex-wrap gap-2 align-end">
          <div>
            <span class="text-small text-muted">Eligibility: </span>
            <span class="badge badge-paper">${exam.eligibility}</span>
          </div>
          <a href="${exam.officialUrl}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">🔗 Official Portal</a>
        </div>
        
        ${tips ? `<div class="mt-3" style="padding:0.75rem;background:var(--bg-card);border-radius:8px;border-left:3px solid var(--primary)"><p class="text-small" style="font-weight:600;margin-bottom:4px">💡 Tips:</p><ul style="margin:0;padding-left:1.2rem">${tips}</ul></div>` : ''}
      </div>
    `;
  }

  const exams = await fetchExams();
  container.innerHTML = exams.map(renderExamCard).join('');
  
  // Setup Intersection Observer for newly added elements
  if (window.setupScrollAnimations) {
    window.setupScrollAnimations();
  } else {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('slide-up'));
  }

  // Filter logic
  const filterBtns = document.getElementById('exam-filter-btns');
  if (filterBtns) {
    filterBtns.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      const filter = btn.dataset.filter;
      
      document.querySelectorAll('#exam-filter-btns [data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.exam-card').forEach(card => {
        if (filter === 'all') {
          card.style.display = '';
        } else {
          const levels = JSON.parse(card.dataset.levels || '[]');
          card.style.display = levels.includes(filter) ? '' : 'none';
        }
      });
    });
  }
});
