document.addEventListener('DOMContentLoaded', () => {
  const DOCUMENT_CATEGORIES = [
    {
      category: "Academic Records",
      icon: "📚",
      docs: [
        { id: "ssc-marksheet", name: "10th (SSC) Marksheet - Original + 3 Xerox", where: "School Office", time: "Same day", cost: "Free" },
        { id: "hsc-marksheet", name: "12th (HSC) Marksheet (if applicable)", where: "Junior College", time: "Same day", cost: "Free" },
        { id: "school-leaving", name: "School Leaving / Transfer Certificate (LC/TC)", where: "School Office", time: "3-5 days", cost: "₹50-100" },
        { id: "migration-cert", name: "Migration Certificate", where: "Board Office / School", time: "7-10 days", cost: "₹100-200" }
      ]
    },
    {
      category: "Identity & Residence",
      icon: "🪪",
      docs: [
        { id: "aadhaar", name: "Aadhaar Card (linked to bank account)", where: "Aadhaar Seva Kendra", time: "7-15 days", cost: "Free" },
        { id: "domicile", name: "Maharashtra Domicile Certificate", where: "Tahsildar Office / MahaOnline / Setu", time: "7-15 days", cost: "₹50" },
        { id: "nationality", name: "Nationality Certificate", where: "Tahsildar Office", time: "7-15 days", cost: "₹50" }
      ]
    },
    {
      category: "Financial Documents",
      icon: "💰",
      docs: [
        { id: "income-cert", name: "Income Certificate (Current FY - from Tahsildar)", where: "Tahsildar Office / Setu Seva Kendra", time: "7-15 days", cost: "₹50" },
        { id: "bank-passbook", name: "Bank Passbook (NPCI active for DBT)", where: "Any Nationalized Bank", time: "Same day", cost: "Free" },
        { id: "ration-card", name: "Ration Card (Yellow/Orange/White)", where: "Tehsil Supply Office", time: "15-30 days", cost: "Free" }
      ]
    },
    {
      category: "Category / Reservation",
      icon: "📜",
      docs: [
        { id: "caste-cert", name: "Caste Certificate (if SC/ST/OBC/NT/SBC)", where: "Tahsildar Office / Setu", time: "15-30 days", cost: "₹50" },
        { id: "caste-validity", name: "Caste Validity Certificate", where: "Scrutiny Committee (Divisional level)", time: "30-60 days", cost: "₹100" },
        { id: "non-creamy", name: "Non-Creamy Layer Certificate (OBC/NT/SBC)", where: "Tahsildar Office", time: "7-15 days", cost: "₹50" }
      ]
    },
    {
      category: "Photos & Misc",
      icon: "📸",
      docs: [
        { id: "photos", name: "Passport Size Color Photos (5 copies)", where: "Any Photo Studio", time: "Same day", cost: "₹50-100" },
        { id: "gap-cert", name: "Gap Certificate (if gap year taken)", where: "Notary / Affidavit", time: "Same day", cost: "₹100-200" }
      ]
    }
  ];

  function renderDocuments() {
    const saved = JSON.parse(localStorage.getItem('cm-docs') || '{}');
    const container = document.getElementById('doc-checklist');
    if (!container) return;
    
    let totalDocs = 0;
    let checkedDocs = 0;
    
    container.innerHTML = DOCUMENT_CATEGORIES.map(cat => {
      const docsHtml = cat.docs.map(doc => {
        totalDocs++;
        const checked = saved[doc.id] || false;
        if (checked) checkedDocs++;
        return `
          <div class="doc-item flex align-start gap-3 mb-3" style="padding:0.75rem;border-radius:8px;background:var(--bg-card);border:1px solid var(--border)">
            <input type="checkbox" id="doc-${doc.id}" class="doc-check" data-id="${doc.id}" ${checked ? 'checked' : ''} style="margin-top:4px;width:20px;height:20px;accent-color:var(--primary);cursor:pointer">
            <div style="flex:1">
              <label for="doc-${doc.id}" style="font-weight:600;cursor:pointer;${checked ? 'text-decoration:line-through;opacity:0.6' : ''}">${doc.name}</label>
              <div class="flex gap-3 mt-1 flex-wrap">
                <span class="text-small text-muted">📍 ${doc.where}</span>
                <span class="text-small text-muted">⏱️ ${doc.time}</span>
                <span class="text-small text-muted">💵 ${doc.cost}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      return `
        <div class="card mb-3 animate-on-scroll">
          <h3 class="mb-3">${cat.icon} ${cat.category}</h3>
          ${docsHtml}
        </div>
      `;
    }).join('');
    
    // Update progress
    const progressText = document.getElementById('doc-progress-text');
    if (progressText) progressText.textContent = `${checkedDocs} / ${totalDocs}`;
    
    const progressBar = document.getElementById('doc-progress-bar');
    if (progressBar) progressBar.style.width = `${totalDocs > 0 ? (checkedDocs/totalDocs)*100 : 0}%`;
  }

  // Handle document check toggle
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('doc-check')) {
      const docId = e.target.getAttribute('data-id');
      const isChecked = e.target.checked;
      
      const saved = JSON.parse(localStorage.getItem('cm-docs') || '{}');
      saved[docId] = isChecked;
      localStorage.setItem('cm-docs', JSON.stringify(saved));
      
      renderDocuments();
    }
  });

  // Handle reset button
  const resetBtn = document.getElementById('reset-docs-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your checklist?')) {
        localStorage.removeItem('cm-docs');
        renderDocuments();
      }
    });
  }

  renderDocuments();
});
