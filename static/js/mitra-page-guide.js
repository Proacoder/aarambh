/**
 * AARAMBH — Universal Top Mitra Tai Voice Guidance Model
 * Embeds empathetic, step-by-step guidance in Marathi, Hindi & English at the top of every page.
 * Powered by Web Speech Synthesis + Web Speech Recognition + Backend NVIDIA NIM API.
 */

(function() {
  const PAGE_GUIDES = {
    'index': {
      title: '🌾 स्वागत आहे! करिअरची योग्य दिशा शोधूया',
      text_mr: 'नमस्कार! मी मित्र ताई आहे. तुमची आवड, क्षमता आणि परिस्थितीनुसार योग्य करिअर निवडण्यासाठी खालील "माझा प्रवास सुरू करा" बटण दाबा. किंवा वरून 3D Careerverse, खर्च नियोजन आणि शिष्यवृत्ती शोधा!',
      text_hi: 'नमस्ते! मैं मित्र ताई हूँ। अपनी रुचि और क्षमता के अनुसार सही करियर खोजने के लिए नीचे "मेरी यात्रा शुरू करें" पर क्लिक करें। ऊपर दिए गए 3D Careerverse और स्कॉलरशिप टूल्स भी देखें!',
      text_en: 'Welcome! I am Mitra, your Career Saathi. Click "Begin My Journey" below to discover your optimal career pathway, or explore our 3D Careerverse and PathPocket financial planner above.'
    },
    'onboarding': {
      title: '📝 प्रोफाइल नोंदणी • सोप्या ४ पायऱ्या',
      text_mr: 'येथे तुमची प्राथमिक माहिती भरा — नाव, जिल्हा आणि वर्ग. या माहितीच्या आधारे आम्ही तुमच्या गावाजवळची शासकीय कॉलेजेस आणि महाडीबीटी शिष्यवृत्ती शोधून देऊ.',
      text_hi: 'यहाँ अपनी सामान्य जानकारी भरें — नाम, जिला और कक्षा। इसके आधार पर हम आपके जिले के सरकारी कॉलेज और MahaDBT छात्रवृत्ति ढूँढेंगे।',
      text_en: 'Fill in your basic details here — name, district, and current class. This helps us find nearby government colleges and MahaDBT scholarships tailored to you.'
    },
    'assessment': {
      title: '🧭 आवड व कल चाचणी • (RIASEC Scenario Test)',
      text_mr: 'घाबरू नका, इथे कोणतेही चुकीचे उत्तर नाही! दिलेल्या पर्यायांपैकी जे काम करायला तुम्हाला मनापासून आवडेल ते निवडा. यावरून तुमचा अचूक Career DNA तयार होईल.',
      text_hi: 'घबराएं नहीं, यहाँ कोई गलत उत्तर नहीं है! जो काम करना आपको सच में पसंद है, उसे चुनें। इससे आपका सही Career DNA बनेगा।',
      text_en: 'Do not worry, there are no wrong answers! Choose the options that feel most natural to you. This builds your personalized Career DNA.'
    },
    'career_dna': {
      title: '🧬 तुमचा Career DNA • क्षमता व कल विश्लेषण',
      text_mr: 'अभिनंदन! हा तुमचा ६-दिशांचा Career DNA चार्ट आहे. जो भाग सर्वात मोठा आहे (जसे Practical Tech किंवा Social Enterprise), त्या क्षेत्रातील करिअर तुमच्यासाठी सर्वोत्तम ठरेल.',
      text_hi: 'बधाई हो! यह आपका 6-दिशाओं वाला Career DNA चार्ट है। जो हिस्सा सबसे बड़ा है, उस क्षेत्र का करियर आपके लिए सबसे फायदेमंद रहेगा।',
      text_en: 'Congratulations! This is your 6-axis Career DNA chart. The strongest dimensions indicate career fields where you will excel naturally.'
    },
    'dashboard': {
      title: '🎯 तुमचे करिअर कमांड सेंटर • शिफारसी व संस्था',
      text_mr: 'येथे तुमच्यासाठी सर्वोत्तम करिअर मार्ग, जवळची शासकीय कॉलेजेस, त्यांचे अंतर आणि पात्र महाडीबीटी शिष्यवृत्तींची संपूर्ण माहिती दिली आहे.',
      text_hi: 'यहाँ आपके लिए बेस्ट करियर विकल्प, नजदीकी सरकारी कॉलेज, उनकी दूरी और पात्र MahaDBT छात्रवृत्ति की पूरी जानकारी दी गई है।',
      text_en: 'This is your Command Center! Explore your matched career pathways, nearby polytechnics/colleges with maps, and eligible financial aid.'
    },
    'roadmap': {
      title: '🗺️ करिअर रोडमॅप • १०वी/१२वी ते नोकरीपर्यंतची दिशा',
      text_mr: 'हा तुमचा टप्प्याटप्प्याचा करिअर रोडमॅप आहे. परीक्षेची तयारी, अर्ज प्रक्रिया आणि शिष्यवृत्तीचे टप्पे पहा. हा रोडमॅप PDF स्वरूपात डाऊनलोड करून पालक व शिक्षकांना दाखवा.',
      text_hi: 'यह आपका स्टेप-बाय-स्टेप करियर रोडमॅप है। परीक्षा, फॉर्म और स्कॉलरशिप के चरण देखें और PDF डाउनलोड करके माता-पिता व शिक्षकों को दिखाएं।',
      text_en: 'This is your step-by-step career milestone roadmap. Review immediate actions, required certifications, and download the PDF for parents and teachers.'
    },
    'cost_calculator': {
      title: '💰 PathPocket • खर्च व १००% शिष्यवृत्ती नियोजन',
      text_mr: 'शिक्षणाचा खरा खर्च किती येईल? ट्युशन फी, हॉस्टेल, मेस आणि एसटी बस प्रवासाचा हिशोब करा. महाडीबीटी सवलती वजा करून निव्वळ खर्च तपासा.',
      text_hi: 'शिक्षा का वास्तविक खर्च कितना होगा? ट्यूशन फीस, हॉस्टल, मेस और बस पास का हिसाब लगाएं। MahaDBT छूट घटाकर शुद्ध खर्च देखें।',
      text_en: 'Plan out-of-pocket education costs accurately. Calculate tuition, hostel, mess, and ST bus travel with automatic MahaDBT fee waiver deductions.'
    },
    'resume_builder': {
      title: '📄 ResumeMitra • व्यावसायिक बायोडाटा तयार करा',
      text_mr: 'ITI अप्रेंटिसशिप, डिप्लोमा किंवा नोकरीसाठी तुमचा पहिला ATS-फ्रेंडली बायोडाटा (Resume) तयार करा. माहिती भरा आणि तात्काळ PDF डाऊनलोड करा.',
      text_hi: 'ITI अप्रेंटिसशिप, डिप्लोमा या नौकरी के लिए अपना पहला प्रोफेशनल बायोडाटा तैयार करें और 1-क्लिक में PDF डाउनलोड करें।',
      text_en: 'Build your first ATS-friendly professional resume for ITI apprenticeships, polytechnics, or jobs, and download as an A4 PDF.'
    },
    'skill_quest': {
      title: '⚡ SkillQuest • करिअर कौशल्ये व गेम मिशन',
      text_mr: 'करिअरमध्ये यशस्वी होण्यासाठी आवश्यक कौशल्ये शिका! दररोज छोटी मिशन्स पूर्ण करा, XP पॉईंट्स कमवा आणि सन्मान बॅजेस अनलॉक करा.',
      text_hi: 'करियर में सफल होने के लिए जरूरी हुनर सीखें! छोटे-छोटे मिशन पूरे करें, XP कमाएं और नए बैज अनलॉक करें।',
      text_en: 'Master foundational real-world career skills! Complete micro-quests, earn XP points, and unlock certified readiness badges.'
    },
    'careerverse': {
      title: '🌌 3D Careerverse • करिअर आकाशगंगा एक्सप्लोर करा',
      text_mr: 'माऊसने स्क्रीन फिरवा किंवा झूम करा! तंत्रज्ञान, कृषी, वैद्यकीय व शासकीय क्षेत्रातील ताऱ्यांवर क्लिक करून पात्रता, वेतन आणि मार्ग तपासा.',
      text_hi: 'माउस से स्क्रीन घुमाएं या जूम करें! टेक, एग्रीकल्चर, मेडिकल और सरकारी क्षेत्र के तारों पर क्लिक करके सैलरी और रास्ते देखें।',
      text_en: 'Orbit and explore our 3D WebGL career cosmos! Click on any star node to inspect prerequisites, salary ranges, and growth potential.'
    },
    'kiosk': {
      title: '🖥️ सार्वजनिक कियोस्क केंद्र • त्वरित करिअर मार्गदर्शन',
      text_mr: 'शाळा, ग्रामपंचायत व डिजिटल सेवा केंद्रांसाठी! "१ मिनिटांत करिअर स्कॅन" सुरू करा आणि तात्काळ करिअर पावती प्रिंट करा.',
      text_hi: 'स्कूल और डिजिटल सेवा केंद्रों के लिए! "1 मिनट में करियर स्कैन" शुरू करें और तुरंत करियर रसीद प्रिंट करें।',
      text_en: 'Designed for school computer labs and public kiosks! Launch a 1-minute quick scan and print an official career summary receipt.'
    },
    'parent_mode': {
      title: '👨‍👩‍👦 पालक संवाद • आई-वडिलांसाठी मार्गदर्शन',
      text_mr: 'आई-वडिलांच्या मनातील शंका — हॉस्टेल सुरक्षितता, खर्च आणि मुलींचे शिक्षण — याबद्दल सोप्या मराठीत मार्गदर्शन ऐकण्यासाठी खालील बटणे दाबा.',
      text_hi: 'माता-पिता के मन के सवाल — हॉस्टल सुरक्षा, खर्च और बेटियों की पढ़ाई — आसान भाषा में समझने के लिए नीचे दिए बटन दबाएं।',
      text_en: 'Clear, empathetic guidance addressing parental concerns about hostel safety, financial aid, and diploma vs degree career pathways.'
    },
    'documents': {
      title: '📋 कागदपत्र ट्रॅकर • प्रवेशाची संपूर्ण तयारी',
      text_mr: 'अधिवास (Domicile), उत्पन्न दाखला, जात प्रमाणपत्र आणि आधार कार्ड तहसील किंवा सेतू केंद्रातून वेळेत मिळवण्यासाठी येथे चेकलिस्ट तपासा.',
      text_hi: 'डोमिसाइल, आय प्रमाण पत्र, जाति प्रमाण पत्र और आवश्यक दस्तावेजों की सूची यहाँ चेक करें ताकि कोई भी फॉर्म भरने से न छूटे।',
      text_en: 'Track essential admission documents (Domicile, Income Certificate, Caste Validity) from Tehsil offices to ensure readiness.'
    },
    'exam_calendar': {
      title: '📅 परीक्षा व प्रवेश कॅलेंडर • अंतिम मुदत चुकवू नका',
      text_mr: '१०वी, १२वी, MHT-CET, ITI प्रवेश आणि महाडीबीटी शिष्यवृत्ती अर्जांच्या महत्त्वाच्या तारखा येथे तपासा आणि वेळेवर नोंदणी करा.',
      text_hi: '10वीं, 12वीं, MHT-CET, ITI और स्कॉलरशिप आवेदन की महत्वपूर्ण तारीखें यहाँ देखें और समय पर रजिस्ट्रेशन करें।',
      text_en: 'Never miss critical admission dates for MHT-CET, ITI CAP rounds, polytechnic forms, and MahaDBT scholarship portals.'
    },
    'guider': {
      title: '👨‍🏫 मार्गदर्शक व शिक्षक केंद्र • थेट विद्यार्थी नोंदणी',
      text_mr: 'शिक्षकांसाठी: स्मार्टफोन नसलेल्या ग्रामीण विद्यार्थ्यांची येथे थेट नोंदणी करा, चाचणी सुरू करा आणि समुपदेशन अहवाल डाऊनलोड करा.',
      text_hi: 'शिक्षकों के लिए: ग्रामीण छात्रों का सीधा रजिस्ट्रेशन करें, टेस्ट शुरू करवाएं और काउंसलिंग रिपोर्ट देखें।',
      text_en: 'For teachers and counselors: Register rural students directly without requiring personal phones and manage counseling rosters.'
    }
  };

  // Detect current page key
  function getPageKey() {
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    if (!path) return 'index';
    if (path.includes('onboarding')) return 'onboarding';
    if (path.includes('assessment')) return 'assessment';
    if (path.includes('career-dna')) return 'career_dna';
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('roadmap')) return 'roadmap';
    if (path.includes('cost-calculator') || path.includes('kharcha')) return 'cost_calculator';
    if (path.includes('resume-builder')) return 'resume_builder';
    if (path.includes('skill-quest')) return 'skill_quest';
    if (path.includes('careerverse')) return 'careerverse';
    if (path.includes('kiosk')) return 'kiosk';
    if (path.includes('parent-mode')) return 'parent_mode';
    if (path.includes('documents')) return 'documents';
    if (path.includes('exam-calendar')) return 'exam_calendar';
    if (path.includes('guider')) return 'guider';
    return 'index';
  }

  let guideAvatar = null;
  let currentLang = localStorage.getItem('cm-lang') || 'mr';

  function renderTopGuideBanner() {
    const key = getPageKey();
    const guide = PAGE_GUIDES[key] || PAGE_GUIDES['index'];
    const container = document.getElementById('mitra-top-page-guide');
    if (!container) return;

    const activeText = guide[`text_${currentLang}`] || guide['text_mr'];

    container.innerHTML = `
      <div class="card glass-card mitra-top-guide-banner mb-4 slide-up" style="border-radius: 20px; border: 2px solid rgba(217, 164, 65, 0.45); background: linear-gradient(135deg, rgba(255, 253, 248, 0.95), rgba(250, 244, 235, 0.95)); box-shadow: 0 8px 30px rgba(61, 43, 31, 0.08); padding: 1.25rem 1.5rem; position: relative;">
        <div class="flex align-center gap-3 flex-wrap md-flex-nowrap">
          
          <!-- Mitra Animated Avatar -->
          <div class="flex-shrink-0 flex-center" style="position: relative;">
            <div id="top-mitra-avatar-box" style="width: 58px; height: 58px; border-radius: 50%; background: #ffffff; border: 2px solid var(--gold); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(217, 164, 65, 0.25);"></div>
            <span class="mitra-pulse-dot" style="position: absolute; bottom: 2px; right: 2px; border: 2px solid #fff;"></span>
          </div>

          <!-- Guidance Text -->
          <div style="flex: 1; min-width: 250px;">
            <div class="flex align-center gap-2 mb-1 flex-wrap">
              <span class="badge badge-gold text-xs" style="font-weight: 700; padding: 0.2rem 0.65rem;">👩‍🏫 मित्र ताईंचे मार्गदर्शन</span>
              <span class="text-xs text-muted font-bold" id="top-guide-title">${guide.title}</span>
            </div>
            <p id="top-guide-text" class="text-small mb-0" style="color: var(--earth-brown); line-height: 1.55; font-weight: 500;">
              ${activeText}
            </p>
          </div>

          <!-- Audio & Action Buttons -->
          <div class="flex align-center gap-2 flex-wrap flex-shrink-0">
            <!-- Listen Readout Button -->
            <button id="btn-top-guide-listen" class="btn btn-primary btn-sm ripple flex align-center gap-1" style="font-size: 0.85rem; border-radius: 999px; padding: 0.5rem 1.1rem;">
              <span id="guide-listen-icon">🔊</span> <span id="guide-listen-label">मार्गदर्शन ऐका</span>
            </button>

            <!-- Ask Question Voice/Text Button -->
            <button id="btn-top-guide-ask" class="btn btn-outline btn-sm ripple flex align-center gap-1" style="font-size: 0.85rem; border-radius: 999px; padding: 0.5rem 1rem;">
              <span>🎙️</span> <span>शंका विचारा</span>
            </button>

            <!-- Mini Language Selector -->
            <div class="flex gap-1" style="background: rgba(61,43,31,0.06); padding: 3px; border-radius: 999px;">
              <button class="top-guide-lang-btn ${currentLang === 'mr' ? 'active' : ''}" data-l="mr" style="border:none; background:${currentLang === 'mr' ? '#ffffff' : 'transparent'}; border-radius:999px; padding:2px 8px; font-size:11px; font-weight:700; cursor:pointer; color:var(--earth-brown);">मरा</button>
              <button class="top-guide-lang-btn ${currentLang === 'hi' ? 'active' : ''}" data-l="hi" style="border:none; background:${currentLang === 'hi' ? '#ffffff' : 'transparent'}; border-radius:999px; padding:2px 8px; font-size:11px; font-weight:700; cursor:pointer; color:var(--earth-brown);">हिं</button>
              <button class="top-guide-lang-btn ${currentLang === 'en' ? 'active' : ''}" data-l="en" style="border:none; background:${currentLang === 'en' ? '#ffffff' : 'transparent'}; border-radius:999px; padding:2px 8px; font-size:11px; font-weight:700; cursor:pointer; color:var(--earth-brown);">EN</button>
            </div>
          </div>

        </div>
      </div>
    `;

    // Instantiate Avatar
    const avatarEl = document.getElementById('top-mitra-avatar-box');
    if (avatarEl && window.MitraCharacter) {
      guideAvatar = new MitraCharacter(avatarEl, { size: 52 });
    }

    setupTopGuideActions(guide);
  }

  function setupTopGuideActions(guide) {
    const listenBtn = document.getElementById('btn-top-guide-listen');
    const askBtn = document.getElementById('btn-top-guide-ask');
    const listenIcon = document.getElementById('guide-listen-icon');
    const listenLabel = document.getElementById('guide-listen-label');

    // Speech Synthesis
    let isSpeaking = false;
    listenBtn?.addEventListener('click', () => {
      if (!window.speechSynthesis) return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        isSpeaking = false;
        if (guideAvatar) guideAvatar.setState('idle');
        if (listenIcon) listenIcon.textContent = '🔊';
        if (listenLabel) listenLabel.textContent = currentLang === 'mr' ? 'मार्गदर्शन ऐका' : (currentLang === 'hi' ? 'सुने' : 'Listen');
        return;
      }

      const text = guide[`text_${currentLang}`] || guide['text_mr'];
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLang === 'mr' ? 'mr-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
      utter.rate = 0.95;

      utter.onstart = () => {
        isSpeaking = true;
        if (guideAvatar) guideAvatar.setState('talking');
        if (listenIcon) listenIcon.textContent = '⏹️';
        if (listenLabel) listenLabel.textContent = currentLang === 'mr' ? 'थांबवा (Stop)' : 'Stop';
      };

      utter.onend = () => {
        isSpeaking = false;
        if (guideAvatar) guideAvatar.setState('idle');
        if (listenIcon) listenIcon.textContent = '🔊';
        if (listenLabel) listenLabel.textContent = currentLang === 'mr' ? 'पुन्हा ऐका' : (currentLang === 'hi' ? 'फिर से सुने' : 'Listen Again');
      };

      utter.onerror = () => {
        isSpeaking = false;
        if (guideAvatar) guideAvatar.setState('idle');
      };

      window.speechSynthesis.speak(utter);
    });

    // Ask Mitra (Trigger Global Slide-Over or Voice)
    askBtn?.addEventListener('click', () => {
      const globalTrigger = document.getElementById('global-mitra-trigger');
      if (globalTrigger) {
        globalTrigger.click();
      } else {
        window.location.href = '/career-aunty';
      }
    });

    // Language Toggle
    document.querySelectorAll('.top-guide-lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLang = btn.dataset.l;
        localStorage.setItem('cm-lang', currentLang);
        renderTopGuideBanner();
      });
    });
  }

  // Global listener for language change from navbar
  document.addEventListener('cm-lang-changed', (e) => {
    currentLang = e.detail || 'mr';
    renderTopGuideBanner();
  });

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    renderTopGuideBanner();
  });
})();
