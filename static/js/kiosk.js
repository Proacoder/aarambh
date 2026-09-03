/**
 * AARAMBH - CPM Kiosk Mode Interactive Controller
 * Touch-optimized, 1-minute quick scan, instant ticket generator, Marathi TTS audio
 */

(function() {
  let kioskTimer = null;
  let remainingSeconds = 300; // 5 min session safety timer
  let scanStep = 1;
  const scanData = {
    classLevel: '10th',
    preference: 'tech',
    name: 'विद्यार्थी',
    district: 'पुणे'
  };

  function startKioskTimer() {
    clearInterval(kioskTimer);
    remainingSeconds = 300;
    const timerDisplay = document.getElementById('kiosk-timer-sec');

    kioskTimer = setInterval(() => {
      remainingSeconds--;
      if (timerDisplay) {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        timerDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }

      if (remainingSeconds <= 0) {
        clearInterval(kioskTimer);
        alert('कियोस्क सत्र समाप्त झाले आहे. नवीन विद्यार्थ्यासाठी रीसेट करत आहोत.');
        sessionStorage.clear();
        window.location.reload();
      }
    }, 1000);
  }

  function setupQuickScan() {
    const startScanBtn = document.getElementById('btn-start-quick-scan');
    const modal = document.getElementById('kiosk-scan-modal');
    const closeBtn = document.getElementById('close-scan-modal');
    const step1 = document.getElementById('scan-step-1');
    const step2 = document.getElementById('scan-step-2');
    const step3 = document.getElementById('scan-step-3');
    const ticketBox = document.getElementById('scan-result-ticket');

    startScanBtn?.addEventListener('click', () => {
      if (modal) modal.style.display = 'flex';
      showStep(1);
    });

    closeBtn?.addEventListener('click', () => {
      if (modal) modal.style.display = 'none';
    });

    function showStep(s) {
      scanStep = s;
      if (step1) step1.style.display = s === 1 ? 'block' : 'none';
      if (step2) step2.style.display = s === 2 ? 'block' : 'none';
      if (step3) step3.style.display = s === 3 ? 'block' : 'none';
      if (ticketBox) ticketBox.style.display = s === 4 ? 'block' : 'none';
    }

    // Step 1: Stage Pick
    document.querySelectorAll('.kiosk-stage-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        scanData.classLevel = btn.dataset.val;
        showStep(2);
      });
    });

    // Step 2: Preference Pick
    document.querySelectorAll('.kiosk-pref-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        scanData.preference = btn.dataset.val;
        showStep(3);
      });
    });

    // Step 3: Name & District Submit
    document.getElementById('scan-form-step3')?.addEventListener('submit', (e) => {
      e.preventDefault();
      scanData.name = document.getElementById('kiosk-student-name')?.value || 'विद्यार्थी';
      scanData.district = document.getElementById('kiosk-student-district')?.value || 'महाराष्ट्र';

      renderKioskTicket();
      showStep(4);
    });
  }

  function renderKioskTicket() {
    const nameEl = document.getElementById('ticket-name');
    const districtEl = document.getElementById('ticket-district');
    const archetypeEl = document.getElementById('ticket-archetype');
    const collegeEl = document.getElementById('ticket-colleges');
    const aidEl = document.getElementById('ticket-aid');

    if (nameEl) nameEl.textContent = scanData.name;
    if (districtEl) districtEl.textContent = scanData.district;

    let archetype = "The Practical Tech Builder (अभियांत्रिकी व तंत्रज्ञान)";
    let colleges = `शासकीय तंत्रनिकेतन (Govt Polytechnic), ${scanData.district} & शासकीय ITI`;
    let aid = "राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती (५०% - १००% फी माफी)";

    if (scanData.preference === 'agri') {
      archetype = "Agri-Tech & Rural Enterprise Innovator";
      colleges = `कृषी महाविद्यालय, ${scanData.district} & कृषी तंत्रज्ञान केंद्र`;
      aid = "MahaDBT कृषी विद्यापीठ वसतिगृह व फी सवलत";
    } else if (scanData.preference === 'health') {
      archetype = "Healthcare & Paramedical Pioneer";
      colleges = `शासकीय वैद्यकीय महाविद्यालय (GMC Paramedical), ${scanData.district}`;
      aid = "स्वाधार वसतिगृह भत्ता योजना (₹५१,०००/वर्ष)";
    } else if (scanData.preference === 'govt') {
      archetype = "Public Administration & Civil Leader";
      colleges = `शासकीय पदवी महाविद्यालय, ${scanData.district}`;
      aid = "डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता";
    }

    if (archetypeEl) archetypeEl.textContent = archetype;
    if (collegeEl) collegeEl.textContent = colleges;
    if (aidEl) aidEl.textContent = aid;
  }

  // Audio Guidance
  function setupKioskAudio() {
    const synth = window.speechSynthesis;
    document.querySelectorAll('.kiosk-listen-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!synth) return;
        synth.cancel();
        const text = btn.dataset.text;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'mr-IN';
        utter.rate = 0.95;
        synth.speak(utter);
      });
    });
  }

  // Print Ticket
  document.getElementById('btn-print-kiosk-ticket')?.addEventListener('click', () => {
    window.print();
  });

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    startKioskTimer();
    setupQuickScan();
    setupKioskAudio();
  });
})();
