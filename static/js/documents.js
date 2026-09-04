/* ==========================================================================
   CareerMitra — Document Readiness Tracker Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const DOCUMENT_CATEGORIES = [
    {
      id: "academic",
      category: "Academic Records",
      categoryMr: "शैक्षणिक कागदपत्रे",
      icon: "📚",
      docs: [
        { 
          id: "ssc-marksheet", 
          name: "10th (SSC) Marksheet & Passing Certificate (Original + 3 Xerox)", 
          nameMr: "१०वी (SSC) मूळ गुणपत्रिका व सनद (Original + ३ सत्यप्रत)",
          where: "School Office / DigiLocker", 
          whereMr: "शाळा कार्यालय / डिजीलॉकर",
          time: "Same day", 
          cost: "Free",
          mandatory: true
        },
        { 
          id: "hsc-marksheet", 
          name: "12th (HSC) Marksheet / ITI Transcript", 
          nameMr: "१२वी (HSC) गुणपत्रिका किंवा आयटीआय उत्तीर्ण दाखला",
          where: "Junior College / MSBTE Portal", 
          whereMr: "कनिष्ठ महाविद्यालय / MSBTE",
          time: "Same day", 
          cost: "Free",
          mandatory: false
        },
        { 
          id: "school-leaving", 
          name: "School Leaving Certificate / Transfer Certificate (TC/LC)", 
          nameMr: "शाळा सोडल्याचा दाखला (Leaving Certificate - TC/LC)",
          where: "Last Attended School / College", 
          whereMr: "शेवटची शाळा / कनिष्ठ महाविद्यालय",
          time: "3-5 days", 
          cost: "₹50 - ₹100",
          mandatory: true
        },
        { 
          id: "migration-cert", 
          name: "Migration Certificate (For CBSE/ICSE or other state boards)", 
          nameMr: "मायग्रेशन प्रमाणपत्र (CBSE/ICSE किंवा इतर बोर्डांसाठी)",
          where: "Divisional Board Office", 
          whereMr: "विभागीय शिक्षण मंडळ कार्यालय",
          time: "7-10 days", 
          cost: "₹100 - ₹200",
          mandatory: false
        }
      ]
    },
    {
      id: "identity",
      category: "Identity & Residence",
      categoryMr: "ओळख व अधिवास दाखले",
      icon: "🪪",
      docs: [
        { 
          id: "aadhaar", 
          name: "Aadhaar Card (Active Mobile & Bank Link)", 
          nameMr: "आधार कार्ड (मोबाईल व बँकेशी संलग्न असणे आवश्यक)",
          where: "Aadhaar Seva Kendra / Post Office", 
          whereMr: "आधार सेवा केंद्र / टपाल कार्यालय",
          time: "7-15 days", 
          cost: "Free / ₹50 for update",
          mandatory: true
        },
        { 
          id: "domicile", 
          name: "Maharashtra State Domicile Certificate (Age, Nationality & Domicile)", 
          nameMr: "महाराष्ट्र राज्य अधिवास (Domicile) प्रमाणपत्र",
          where: "Tahsildar Office / Aaple Sarkar Portal / Setu", 
          whereMr: "तहसीलदार कार्यालय / आपले सरकार पोर्टल / सेतू केंद्र",
          time: "7-15 days", 
          cost: "₹33 - ₹50",
          mandatory: true
        },
        { 
          id: "nationality", 
          name: "Indian Nationality Certificate (or mentioned on School LC)", 
          nameMr: "भारतीय नागरिकत्व प्रमाणपत्र (किंवा LC वर उल्लेख)",
          where: "Tahsildar / Sub-Divisional Magistrate", 
          whereMr: "तहसीलदार कार्यालय / LC वर 'Indian' उल्लेख",
          time: "7 days", 
          cost: "₹50",
          mandatory: true
        }
      ]
    },
    {
      id: "financial",
      category: "Income & Bank DBT",
      categoryMr: "उत्पन्न व बँक DBT कागदपत्रे",
      icon: "💰",
      docs: [
        { 
          id: "income-cert", 
          name: "Income Certificate issued by Tahsildar (Current Financial Year)", 
          nameMr: "तहसीलदारांचा चालू आर्थिक वर्षाचा उत्पन्नाचा दाखला (< ₹८ लाख)",
          where: "Tahsildar Office / MahaOnline Setu", 
          whereMr: "तहसीलदार कार्यालय / सेतू केंद्र / आपले सरकार",
          time: "7-15 days", 
          cost: "₹33 - ₹50",
          mandatory: true
        },
        { 
          id: "bank-passbook", 
          name: "Nationalized Bank Account Passbook (NPCI Aadhar Mapping Active)", 
          nameMr: "राष्ट्रीयकृत बँकेचे पासबुक (NPCI आधार DBT मॅपिंग सक्रिय)",
          where: "SBI, Bank of Maharashtra, Bank of Baroda etc.", 
          whereMr: "बँक ऑफ महाराष्ट्र, SBI किंवा राष्ट्रीयकृत बँक",
          time: "Same day", 
          cost: "Free",
          mandatory: true
        },
        { 
          id: "ration-card", 
          name: "Ration Card (Yellow / Orange / White) with Student's Name", 
          nameMr: "रेशन कार्ड (पिवळे किंवा केसरी) विद्यार्थ्याच्या नावासह",
          where: "Tehsil Supply Office", 
          whereMr: "तहसील पुरवठा कार्यालय",
          time: "15 days", 
          cost: "Free",
          mandatory: false
        }
      ]
    },
    {
      id: "reservation",
      category: "Caste & Reservation",
      categoryMr: "जात व आरक्षण कागदपत्रे",
      icon: "📜",
      docs: [
        { 
          id: "caste-cert", 
          name: "Caste Certificate (For SC / ST / VJNT / OBC / SBC / SEBC)", 
          nameMr: "सक्षम प्राधिकाऱ्यांनी दिलेले जातीचे मूळ प्रमाणपत्र",
          where: "Sub-Divisional Officer (SDO) / Aaple Sarkar", 
          whereMr: "उपविभागीय अधिकारी (SDO) / आपले सरकार",
          time: "21-30 days", 
          cost: "₹50",
          mandatory: false
        },
        { 
          id: "caste-validity", 
          name: "Caste Validity Certificate (Tribe Validity for ST)", 
          nameMr: "जात पडताळणी प्रमाणपत्र (Caste Validity / Tribe Validity)",
          where: "Divisional Caste Scrutiny Committee / BARTI / CCVIS", 
          whereMr: "विभागीय जात पडताळणी समिती / बार्टी CCVIS पोर्टल",
          time: "30-60 days", 
          cost: "₹100",
          mandatory: false
        },
        { 
          id: "non-creamy", 
          name: "Non-Creamy Layer (NCL) Certificate valid up to 31st March of next FY", 
          nameMr: "नॉन-क्रिमिलेअर (NCL) प्रमाणपत्र (OBC/VJNT/SBC/SEBC साठी)",
          where: "Tahsildar Office / Setu Seva Kendra", 
          whereMr: "तहसीलदार कार्यालय / सेतू केंद्र",
          time: "7-15 days", 
          cost: "₹50",
          mandatory: false
        },
        { 
          id: "ews-cert", 
          name: "Economically Weaker Section (EWS) Certificate (For General Category)", 
          nameMr: "आर्थिकदृष्ट्या दुर्बल घटक (EWS) प्रमाणपत्र (१०% आरक्षण)",
          where: "Tahsildar / Collector Office", 
          whereMr: "तहसीलदार कार्यालय",
          time: "15-21 days", 
          cost: "₹50",
          mandatory: false
        }
      ]
    },
    {
      id: "hostel",
      category: "Hostel & Other Documents",
      categoryMr: "वसतिगृह व इतर कागदपत्रे",
      icon: "🏠",
      docs: [
        { 
          id: "photos", 
          name: "Passport Size Photographs (White Background, Recent - 8 Copies)", 
          nameMr: "पासपोर्ट आकाराचे रंगीत छायाचित्रे (८ प्रती, पांढरी पार्श्वभूमी)",
          where: "Local Photo Studio", 
          whereMr: "स्थानिक फोटो स्टुडिओ",
          time: "1 hour", 
          cost: "₹50 - ₹100",
          mandatory: true
        },
        { 
          id: "gap-affidavit", 
          name: "Educational Gap Certificate / Affidavit (If gap after 10th/12th)", 
          nameMr: "गॅप सर्टिफिकेट (१०वी/१२वीनंतर शिक्षणात खंड असल्यास प्रतिज्ञापत्र)",
          where: "Local Notary / Advocate Office (₹100 Stamp Paper)", 
          whereMr: "स्थानिक नोटरी / वकील कार्यालय (₹१०० स्टॅम्प पेपर)",
          time: "Same day", 
          cost: "₹150 - ₹250",
          mandatory: false
        },
        { 
          id: "hostel-cert", 
          name: "Registered Rent Agreement or Private Hostel Certificate (for Panjabrao/Swadhar)", 
          nameMr: "नोंदणीकृत भाडेकरार किंवा वसतिगृह प्रमाणपत्र (पंजाबराव/स्वाधार योजनेसाठी)",
          where: "Hostel Warden / Sub-Registrar Office", 
          whereMr: "वसतिगृह अधीक्षक किंवा घरमालक भाडेकरार",
          time: "1-2 days", 
          cost: "₹100 - ₹300",
          mandatory: false
        }
      ]
    }
  ];

  let activeTab = 'all';

  function getActiveLang() {
    return (window.CareerMitra && window.CareerMitra.lang) || localStorage.getItem('cm-lang') || 'mr';
  }

  function renderDocuments() {
    const saved = JSON.parse(localStorage.getItem('cm-docs') || '{}');
    const container = document.getElementById('doc-checklist');
    if (!container) return;

    const lang = getActiveLang();
    const t = (k, fb) => (window.CareerMitra && window.CareerMitra.hasTranslation && window.CareerMitra.hasTranslation(k)) ? window.CareerMitra.t(k) : fb;

    let totalDocs = 0;
    let checkedDocs = 0;

    // Count overall progress
    DOCUMENT_CATEGORIES.forEach(cat => {
      cat.docs.forEach(doc => {
        totalDocs++;
        if (saved[doc.id]) checkedDocs++;
      });
    });

    // Filter categories by active tab
    const categoriesToShow = activeTab === 'all' 
      ? DOCUMENT_CATEGORIES 
      : DOCUMENT_CATEGORIES.filter(c => c.id === activeTab);

    container.innerHTML = categoriesToShow.map(cat => {
      const catTitle = lang === 'mr' ? cat.categoryMr : cat.category;

      const docsHtml = cat.docs.map(doc => {
        const checked = Boolean(saved[doc.id]);
        const title = lang === 'mr' ? doc.nameMr : doc.name;
        const where = lang === 'mr' ? doc.whereMr : doc.where;

        return `
          <div class="doc-item flex align-start gap-3 mb-3 p-3 slide-up" style="border-radius: 14px; background: var(--bg-card); border: 2px solid ${checked ? '#2e7d32' : 'var(--border)'}; transition: all 0.2s ease;">
            <input type="checkbox" id="doc-${doc.id}" class="doc-check" data-id="${doc.id}" ${checked ? 'checked' : ''} style="margin-top: 4px; width: 22px; height: 22px; accent-color: #2e7d32; cursor: pointer;">
            <div style="flex: 1;">
              <div class="flex-between align-start flex-wrap gap-1">
                <label for="doc-${doc.id}" style="font-weight: 700; font-size: 1rem; cursor: pointer; color: ${checked ? '#2e7d32' : 'var(--text)'}; ${checked ? 'text-decoration: line-through; opacity: 0.8;' : ''}">
                  ${title}
                </label>
                ${doc.mandatory ? `<span class="badge badge-paper text-xs" style="color:var(--terracotta); font-weight:700;">${t('doc_mandatory', 'Mandatory')}</span>` : ''}
              </div>
              <div class="flex gap-3 mt-2 flex-wrap text-small text-muted">
                <span>📍 <strong>${t('doc_where', 'Where to get:')}</strong> ${where}</span>
                <span>⏱️ <strong>${t('doc_time', 'Time:')}</strong> ${doc.time}</span>
                <span>💵 <strong>${t('doc_cost', 'Fee:')}</strong> ${doc.cost}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="card p-4 glass-card mb-3 slide-up" style="border-radius: 18px;">
          <h3 class="mb-3 text-md font-bold flex align-center gap-2" style="color: var(--earth-brown);">
            <span>${cat.icon}</span> <span>${catTitle}</span>
          </h3>
          ${docsHtml}
        </div>
      `;
    }).join('');

    // Update Progress Bar
    const progressText = document.getElementById('doc-progress-text');
    const pct = totalDocs > 0 ? Math.round((checkedDocs / totalDocs) * 100) : 0;
    if (progressText) {
      progressText.textContent = `${checkedDocs} / ${totalDocs} (${pct}%)`;
    }

    const progressBar = document.getElementById('doc-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }
  }

  // Handle document toggle
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

  // Handle Category Filter Tabs
  document.querySelectorAll('.doc-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.doc-tab-btn').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');

      activeTab = btn.getAttribute('data-cat') || 'all';
      renderDocuments();
    });
  });

  // Reset Progress Button
  const resetBtn = document.getElementById('doc-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const lang = getActiveLang();
      const confirmMsg = lang === 'mr' 
        ? "तुम्हाला सर्व कागदपत्रांची निवड रीसेट करायची आहे का?" 
        : "Are you sure you want to reset your checklist progress?";
      if (confirm(confirmMsg)) {
        localStorage.removeItem('cm-docs');
        renderDocuments();
        if (window.CareerMitra && window.CareerMitra.toast) {
          window.CareerMitra.toast('Checklist reset successfully.', 'info');
        }
      }
    });
  }

  // Print Checklist Button
  const printBtn = document.getElementById('doc-print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  document.addEventListener('cm-lang-changed', renderDocuments);

  renderDocuments();
});
