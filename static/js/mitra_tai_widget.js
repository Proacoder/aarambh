/* ==========================================================================
   CareerMitra — Global Floating Mitra Tai Voice AI & Game Tutorial Engine
   ========================================================================== */

(function () {
  'use strict';

  // Trilingual UI strings for the Game Tour HUD
  const TOUR_I18N = {
    mr: {
      taiTitle: 'मित्र ताई',
      taiSubtitle: 'एआय करिअर मार्गदर्शक',
      badgePrefix: '🎮 करिअर गाईड • टप्पा',
      ofWord: '/',
      prev: 'मागील',
      next: 'पुढील',
      finish: 'पूर्ण झाले',
      listen: 'ऐका',
      close: 'बंद करा',
      pill: '🎮 गाईड',
      startTourBtn: '🎮 संपूर्ण गेम ट्युटोरियल सुरू करा',
      speakPageBtn: '🎙️ या पानाची माहिती ऐका',
      askPh: 'काहीही विचारा...',
      asking: 'विचारत आहे...',
      completedToast: '🎉 ट्युटोरियल पूर्ण झाले! अभिनंदन!',
      closedToast: 'ट्युटोरियल बंद केले.',
      defaultGuide: "नमस्कार! मी मित्र ताई आहे. या पानावरील माहिती समजून घेण्यासाठी '🎮 संपूर्ण गेम ट्युटोरियल सुरू करा' वर क्लिक करा."
    },
    hi: {
      taiTitle: 'मित्र ताई',
      taiSubtitle: 'एआई करियर मेंटर',
      badgePrefix: '🎮 करियर गाइड • कदम',
      ofWord: '/',
      prev: 'पिछला',
      next: 'अगला',
      finish: 'समाप्त',
      listen: 'सुनें',
      close: 'बंद करें',
      pill: '🎮 गाइड',
      startTourBtn: '🎮 संपूर्ण गेम ट्यूटोरियल शुरू करें',
      speakPageBtn: '🎙️ इस पृष्ठ की जानकारी सुनें',
      askPh: 'कुछ भी पूछें...',
      asking: 'पूछ रहा है...',
      completedToast: '🎉 ट्यूटोरियल पूरा हुआ! बधाई!',
      closedToast: 'ट्यूटोरियल बंद किया गया।',
      defaultGuide: "नमस्ते! मैं मित्र ताई हूँ। इस पृष्ठ की जानकारी समझने के लिए '🎮 संपूर्ण गेम ट्यूटोरियल शुरू करें' पर क्लिक करें।"
    },
    en: {
      taiTitle: 'Mitra Tai',
      taiSubtitle: 'AI Career Mentor',
      badgePrefix: '🎮 CAREER GUIDE • STEP',
      ofWord: 'OF',
      prev: 'Previous',
      next: 'Next',
      finish: 'Finish',
      listen: 'Listen',
      close: 'Close',
      pill: '🎮 Tour',
      startTourBtn: '🎮 Start Game Tutorial Tour',
      speakPageBtn: '🎙️ Speak Page Guide',
      askPh: 'Ask anything to Mitra Tai...',
      asking: 'Asking...',
      completedToast: '🎉 Tutorial Quest Completed! Great job!',
      closedToast: 'Tutorial closed.',
      defaultGuide: "Hello! I am Mitra Tai. Click '🎮 Start Game Tutorial Tour' to explore this page step-by-step."
    }
  };

  // Comprehensive Game-Style Multi-Step Walkthroughs for Every Page
  const PAGE_TOURS = {
    '/': [
      {
        selector: '#hero-use-now-btn, .nav-cta, .hero-ctas',
        title: { mr: '🚀 करिअर प्रवास सुरू करा', hi: '🚀 करियर यात्रा शुरू करें', en: '🚀 Start Your Career Path' },
        text: {
          mr: "येथे 'आता सुरू करा' वर क्लिक करा. तुमचे नाव, इयत्ता आणि जिल्ह्यावरून तुमचा करिअर प्रवास १ मिनिटात सुरू होतो.",
          hi: "यहाँ 'शुरू करें' पर क्लिक करें। आपका नाम, कक्षा और जिले के आधार पर आपकी करियर यात्रा 1 मिनट में शुरू हो जाएगी।",
          en: "Click 'Use Now' to begin. Enter your class, district, and interests to generate a personalized career match in just 1 minute."
        }
      },
      {
        selector: '#how-it-works, .how-it-works',
        title: { mr: '🗺️ ४ टप्प्यांचा सोपा प्रवास', hi: '🗺️ 4-चरणीय सरल यात्रा', en: '🗺️ 4-Step Road to Success' },
        text: {
          mr: "येथे करिअरमित्राची पद्धत पहा: प्राथमिक माहिती भरणे, लहान अभिरुची चाचणी देणे, जुळणारी कॉलेजेस पाहणे आणि थेट रोडमॅप मिळवणे.",
          hi: "करियरमित्र की प्रक्रिया: जानकारी भरें, त्वरित मूल्यांकन दें, योग्य कॉलेज देखें और चरणबद्ध रोडमैप प्राप्त करें।",
          en: "See how CareerMitra works: fill your profile, take a 3-minute quiz, discover nearby colleges, and download an actionable roadmap."
        }
      },
      {
        selector: '.lang-toggle',
        title: { mr: '🌐 ३ भाषांमध्ये उपलब्ध', hi: '🌐 3 भाषाओं में उपलब्ध', en: '🌐 Trilingual Voice Support' },
        text: {
          mr: "मराठी, हिंदी किंवा इंग्रजीमध्ये संपूर्ण वेबसाइट आणि आवाज बदलण्यासाठी येथे एका क्लिकवर भाषा बदला.",
          hi: "मराठी, हिंदी या अंग्रेजी में पूरी वेबसाइट और आवाज बदलने के लिए यहां क्लिक करें।",
          en: "Easily switch the entire website text and voice assistance between Marathi, Hindi, and English anytime."
        }
      },
      {
        selector: '#main-nav .nav-links',
        title: { mr: '🧭 सर्व करिअर साधने', hi: '🧭 सभी करियर उपकरण', en: '🧭 Exploration Tools Hub' },
        text: {
          mr: "येथून महाविद्यालये, स्मार्ट खर्चा कॅल्क्युलेटर, शासकीय शिष्यवृत्ती योजना आणि मित्र ताई मार्गदर्शन एका क्लिकवर उघडा.",
          hi: "यहाँ से कॉलेज डायरेक्टरी, स्मार्ट खर्चा कैलकुलेटर, सरकारी योजनाएं और मित्रा ताई का मार्गदर्शन तुरंत खोलें।",
          en: "Access colleges directory, smart expense calculator, scholarship schemes, and Mitra Tai guidance directly from this navigation hub."
        }
      }
    ],

    '/dashboard': [
      {
        selector: '.nba-banner, .nba-card',
        title: { mr: '⚡ पुढील महत्त्वाचा टप्पा', hi: '⚡ अगला सबसे महत्वपूर्ण कदम', en: '⚡ Next Best Action' },
        text: {
          mr: "हा तुमचा सर्वात महत्त्वाचा कृती टप्पा आहे! प्रवेश अर्ज, परीक्षा किंवा कागदपत्रे गोळा करण्याचे तातडीचे काम येथे दिसते.",
          hi: "यह आपका प्राथमिक एक्शन बैनर है! प्रवेश परीक्षा, जाति प्रमाणपत्र या आवेदन फॉर्म से जुड़ा सबसे जरूरी काम यहां दिखता है।",
          en: "Your high-priority action card! Track immediate upcoming milestones such as CAP registration, entrance exams, or certificate collection."
        }
      },
      {
        selector: '#dash-matches-grid, .career-matches-grid, .match-card',
        title: { mr: '🎯 टॉप करिअर शिफारसी', hi: '🎯 शीर्ष करियर सिफारिशें', en: '🎯 Top Career Recommendations' },
        text: {
          mr: "तुमच्या मानसशास्त्रीय क्षमतेनुसार तुमच्यासाठी सर्वाधिक सुसंगत असणारे करिअर पर्याय येथे टक्केवारीसह दिले आहेत.",
          hi: "आपके व्यक्तित्व और अभिरुचि के अनुसार सबसे उपयुक्त करियर विकल्प यहां मैच प्रतिशत के साथ दिए गए हैं।",
          en: "Your personalized career tracks calculated from your RIASEC aptitude profile, showing exact fit percentages and career paths."
        }
      },
      {
        selector: '#maharashtra-map, .map-container',
        title: { mr: '🗺️ महाराष्ट्र औद्योगिक नकाशा', hi: '🗺️ महाराष्ट्र औद्योगिक नक्शा', en: '🗺️ Regional Industry & Jobs Map' },
        text: {
          mr: "या नकाशावर क्लिक करून पुणे, चाकण, छत्रपती संभाजीनगर आणि विदर्भातील औद्योगिक केंद्रे व नोकरीच्या संधी तपासा.",
          hi: "इस नक्शे पर क्लिक करके पुणे, चाकण, छत्रपति संभाजीनगर और विदर्भ के औद्योगिक केंद्रों और रोजगार अवसरों को देखें।",
          en: "Interactive Maharashtra district map highlighting industrial corridors (Chakan Auto, Aurangabad Pharma, Vidarbha Agri-Tech) and local job hubs."
        }
      },
      {
        selector: '.quick-feature-grid, .quick-features',
        title: { mr: '🛠️ उपयुक्त करिअर साधने', hi: '🛠️ त्वरित उपयोगी उपकरण', en: '🛠️ Quick Feature Launchpad' },
        text: {
          mr: "खर्चा कॅल्क्युलेटर, शासकीय योजना, करिअर डीएनए, कागदपत्र लॉकर आणि बायोडाटा बिल्डर येथे त्वरित उपलब्ध आहेत.",
          hi: "खर्चा कैलकुलेटर, सरकारी योजनाएं, करियर डीएनए, दस्तावेज ट्रैकर और बायोडाटा बिल्डर यहां 1-क्लिक में उपलब्ध हैं।",
          en: "Instant shortcuts to the Smart Kharcha Calculator, Government Schemes Directory, Career DNA, Document Locker, and Resume Builder."
        }
      }
    ],

    '/schemes': [
      {
        selector: '#scheme-search-input',
        title: { mr: '🔍 जलद योजना शोध', hi: '🔍 त्वरित योजना खोज', en: '🔍 Instant Scheme Search' },
        text: {
          mr: "येथे योजनेचे नाव शोधा. उदा. 'ईबीसी', 'पंजाबराव', 'स्वाधार' किंवा 'अल्पसंख्याक' लिहून थेट पात्रता तपासा.",
          hi: "योजना का नाम खोजें। जैसे 'ईबीसी', 'हॉस्टल', 'स्वाधार' या 'अल्पसंख्यक' लिखकर तुरंत खोजें।",
          en: "Search any Maharashtra government scholarship or allowance by typing keywords like 'EBC', 'Hostel', or 'Swadhar'."
        }
      },
      {
        selector: '#scheme-category-filters',
        title: { mr: '🏷️ प्रवर्गानुसार फिल्टर', hi: '🏷️ श्रेणी के अनुसार फिल्टर', en: '🏷️ Category Filtering' },
        text: {
          mr: "ओपन, ईबीसी, एससी, एसटी, ओबीसी, अल्पसंख्याक किंवा दिव्यांग प्रवर्ग निवडून तुम्हाला लागू होणाऱ्या योजना पहा.",
          hi: "ओपन, ईबीसी, एससी, एसटी, ओबीसी, अल्पसंख्यक या दिव्यांग बटन पर क्लिक करके सिर्फ अपने लिए लागू योजनाएं देखें।",
          en: "Filter schemes by category: OPEN/EBC, SC, ST, OBC, Minority, or PWD to see exact subsidies meant for you."
        }
      },
      {
        selector: '#scheme-benefit-filter, #scheme-income-filter',
        title: { mr: '💰 सवलतीचा प्रकार व उत्पन्न मर्यादा', hi: '💰 लाभ का प्रकार व आय सीमा', en: '💰 Benefit & Income Ceiling' },
        text: {
          mr: "ट्युशन फी माफी, वसतिगृह भत्ता किंवा कौटुंबिक उत्पन्न मर्यादा निवडून अचूक योजना शोधा.",
          hi: "ट्यूशन फीस छूट, हॉस्टल भत्ता या पारिवारिक आय सीमा चुनकर सबसे सही सरकारी योजनाएं खोजें।",
          en: "Narrow down by benefit type (tuition fee waiver, hostel stipend) and family income limit (below ₹8 Lakhs / ₹2.5 Lakhs)."
        }
      },
      {
        selector: '#schemes-cards-grid, .scheme-card',
        title: { mr: '📋 पात्रता, कागदपत्रे व थेट अर्ज', hi: '📋 पात्रता, दस्तावेज व सीधा आवेदन', en: '📋 Eligibility & Direct Portal Links' },
        text: {
          mr: "प्रत्येक योजनेची पात्रता अटी, लागणारी कागदपत्रे आणि महाडीबीटी पोर्टलवर थेट अर्ज करण्याची लिंक येथे दिली आहे.",
          hi: "प्रत्येक योजना की पात्रता शर्तें, जरूरी दस्तावेज और महाडीबीटी पोर्टल पर सीधे आवेदन करने की लिंक यहां मिलेगी।",
          en: "Review specific eligibility conditions, required Tahsildar certificates, and click direct links to apply on MahaDBT."
        }
      }
    ],

    '/cost-calculator': [
      {
        selector: '#calc-form, .calculator-form',
        title: { mr: '📝 कॉलेज व राहण्याची निवड', hi: '📝 कॉलेज व आवास का चयन', en: '📝 Choose College & Accommodation' },
        text: {
          mr: "तुमचे मूळ जिल्हा, टार्गेट कॉलेज, कोर्स, तसेच वसतिगृह किंवा भाड्याने खोली आणि मेस निवडा.",
          hi: "अपना गृह जिला, लक्षित कॉलेज, कोर्स, और छात्रावास या कमरे का विकल्प यहां चुनें।",
          en: "Select your home district, target college, engineering/diploma stream, and living preference (hostel, rented room, mess)."
        }
      },
      {
        selector: '#breakdown-card, .breakdown-card',
        title: { mr: '📊 एकूण खर्चाचा अंदाज', hi: '📊 कुल अनुमानित खर्च', en: '📊 Full Annual Cost Estimate' },
        text: {
          mr: "शिक्षण फी, खोली भाडे, मेस जेवण आणि प्रवास खर्चाचा एकूण वार्षिक प्राथमिक अंदाज येथे तयार होतो.",
          hi: "कॉलेज फीस, कमरे का किराया, भोजन और यात्रा व्यय का विस्तृत वार्षिक बजट यहां तैयार होता है।",
          en: "See an itemized yearly breakdown of academic tuition fees, room rent, food mess, and travel expenses."
        }
      },
      {
        selector: '#subsidies-card, .subsidy-item, #family-impact-card',
        title: { mr: '🎓 शासकीय शिष्यवृत्ती वजावट', hi: '🎓 सरकारी छात्रवृत्ति कटौती', en: '🎓 MahaDBT Fee Subsidies Deducted' },
        text: {
          mr: "महाराष्ट्र शासनाची ईबीसी ५०% फी माफी किंवा पंजाबराव देशमुख वसतिगृह भत्ता येथे आपोआप वजा केला जातो.",
          hi: "महाराष्ट्र सरकार की ईबीसी 50% फीस छूट या पंजाबराव देशमुख हॉस्टल भत्ता यहां अपने आप घटा दिया जाता है।",
          en: "Official government concessions (like EBC 50% waiver or ₹30,000 Panjabrao Deshmukh hostel grant) are automatically subtracted."
        }
      },
      {
        selector: '#family-impact-card, .impact-summary',
        title: { mr: '💡 कुटुंबाचा निव्वळ मासिक भार', hi: '💡 परिवार का वास्तविक मासिक खर्च', en: '💡 Net Family Out-of-Pocket Cost' },
        text: {
          mr: "शासकीय मदतीनंतर तुमच्या कुटुंबाला दरमहा आणि दरवर्षी खरोखर किती पैसे लागतील त्याचा अचूक ताळेबंद येथे मिळतो.",
          hi: "सरकारी सब्सिडी के बाद आपके परिवार को प्रति माह और प्रति वर्ष वास्तव में कितना खर्च आएगा, यह यहां स्पष्ट दिखता है।",
          en: "The true bottom-line: exact net monthly and yearly expenses your family will need to manage after all government subsidies."
        }
      }
    ],

    '/roadmap': [
      {
        selector: '.roadmap-timeline, .timeline-phase:nth-child(1), #roadmap-timeline',
        title: { mr: '📅 ३० दिवसांचे तातडीचे काम', hi: '📅 30 दिनों का जरूरी काम', en: '📅 Immediate 30-Day Checklist' },
        text: {
          mr: "प्रवेशापूर्वी तहसीलदारांकडून अधिवास, उत्पन्नाचा दाखला आणि जात वैधता प्रमाणपत्र गोळा करण्याची संपूर्ण कृती येथे आहे.",
          hi: "प्रवेश से पहले तहसीलदार से अधिवास प्रमाण पत्र, आय प्रमाण पत्र और जाति वैधता जुटाने की चरणबद्ध सूची यहां है।",
          en: "Actionable 30-day checklist for securing Aaple Sarkar Domicile, Income certificate, and bank-Aadhaar seeding."
        }
      },
      {
        selector: '.timeline-phase:nth-child(2), .roadmap-phase:nth-child(2)',
        title: { mr: '🎓 प्रवेश परीक्षा व कॅप राऊंड', hi: '🎓 प्रवेश परीक्षा व कैप राउंड', en: '🎓 Entrance & CAP Seat Allocation' },
        text: {
          mr: "सीईटी नोंदणी, कॉलेजचे पसंतीक्रम भरणे आणि प्रवेश पक्का करण्याचे मार्गदर्शन येथे दिले आहे.",
          hi: "सीईटी रजिस्ट्रेशन, कॉलेज विकल्प फॉर्म भरना और सीट पक्की करने का पूरा मार्गदर्शन यहां दिया गया है।",
          en: "Key guidelines for MHT-CET/Polytechnic registration, CAP option form strategy, and seat acceptance."
        }
      },
      {
        selector: '#btn-export-pdf, .roadmap-actions',
        title: { mr: '📥 पीडीएफ कृती आराखडा डाऊनलोड', hi: '📥 पीडीएफ रोडमैप डाउनलोड करें', en: '📥 Download PDF Roadmap' },
        text: {
          mr: "हा वैयक्तिक करिअर रोडमॅप एका क्लिकवर पीडीएफ स्वरूपात डाऊनलोड करा आणि आपल्या जवळ ठेवा.",
          hi: "यह व्यक्तिगत करियर रोडमैप एक क्लिक में पीडीएफ के रूप में डाउनलोड करके अपने पास सुरक्षित रखें।",
          en: "Export this personalized multi-phase action plan as a clean PDF to share with parents, mentors, or school counselors."
        }
      }
    ],

    '/tutorials': [
      {
        selector: '.tutorials-hero .flex-center, .category-filter-pills',
        title: { mr: '🏷️ विषय निवडा', hi: '🏷️ विषय चुनें', en: '🏷️ Select Topic Filter' },
        text: {
          mr: "महाडीबीटी शिष्यवृत्ती, पॉलिटेक्निक प्रवेश, सीईटी किंवा दाखले काढण्याचे व्हिडिओ पाहण्यासाठी श्रेणी निवडा.",
          hi: "महाडीबीटी छात्रवृत्ति, पॉलिटेक्निक प्रवेश, या प्रमाण पत्र बनवाने के वीडियो देखने के लिए श्रेणी चुनें।",
          en: "Filter video guides by categories: Scholarships (MahaDBT/EBC), Polytechnic/Engg Admissions, Entrance Exams, or Citizen Documents."
        }
      },
      {
        selector: '#tutorial-search, .search-bar',
        title: { mr: '🔍 व्हिडिओ शोध', hi: '🔍 वीडियो खोजें', en: '🔍 Search Any Guide' },
        text: {
          mr: "कोणत्याही फॉर्मचे नाव किंवा विषयाचा कीवर्ड लिहून संबंधित व्हिडिओ ट्युटोरियल त्वरित शोधा.",
          hi: "किसी भी फॉर्म का नाम या विषय लिखकर संबंधित वीडियो ट्यूटोरियल तुरंत खोजें।",
          en: "Search specific topics (e.g. 'EBC', 'Income Certificate', 'Option Form', 'Police Bharti') to find quick walkthroughs."
        }
      },
      {
        selector: '#tutorials-grid, .tutorial-card',
        title: { mr: '▶️ थेट व्हिडिओ मार्गदर्शक', hi: '▶️ वीडियो गाइड देखें', en: '▶️ Embedded Step-by-Step Guides' },
        text: {
          mr: "येथे क्लिक करून महाडीबीटी फॉर्म किंवा उत्पन्नाचा दाखला काढण्याचे व्हिडिओ थेट आपल्या भाषेत पहा.",
          hi: "यहां क्लिक करके महाडीबीटी फॉर्म या आय प्रमाण पत्र बनाने के वीडियो सीधे अपनी भाषा में देखें।",
          en: "Watch official step-by-step video guides with clear spoken explanations and visual demonstrations."
        }
      }
    ],

    '/documents': [
      {
        selector: '#doc-readiness-bar, .doc-readiness-card',
        title: { mr: '📈 प्रवेश सज्जता मीटर', hi: '📈 प्रवेश तैयारी मीटर', en: '📈 Documentation Readiness Score' },
        text: {
          mr: "तुमची किती कागदपत्रे तयार आहेत त्याचा स्कोअर येथे पहा. १००% सज्जता झाल्यावर प्रवेशाला कोणतीही अडचण येत नाही.",
          hi: "आपके कितने दस्तावेज तैयार हैं उसका रियल-टाइम स्कोर यहां देखें। 100% तैयारी होने पर प्रवेश में कोई रुकावट नहीं आती।",
          en: "Live readiness percentage tracker. Reaching 100% ensures you won't face disqualification or seat cancellations during CAP verification."
        }
      },
      {
        selector: '#doc-category-tabs, .doc-tabs',
        title: { mr: '📁 विभागनिहाय वर्गीकरण', hi: '📁 श्रेणीवार दस्तावेज', en: '📁 Categorized Checklists' },
        text: {
          mr: "शैक्षणिक गुणपत्रिका, आधार-बँक लिंकिंग, उत्पन्न दाखला आणि जात वैधता कागदपत्रे टॅब निवडून तपासा.",
          hi: "शैक्षणिक मार्कशीट, आधार-बैंक लिंकिंग, आय प्रमाण पत्र और जाति प्रमाण पत्र टैब चुनकर देखें।",
          en: "Switch between Academic marksheets, Identity proof, Financial income documents, Reservation certificates, and Hostel allotments."
        }
      },
      {
        selector: '#doc-checklist-container, .doc-checklist',
        title: { mr: '☑️ कागदपत्रांची पडताळणी', hi: '☑️ दस्तावेजों की जांच', en: '☑️ Interactive Tick Check' },
        text: {
          mr: "जे प्रमाणपत्र मिळाले त्यावर टिक करा. तुमची प्रगती आपोआप सेव्ह होते आणि तुम्ही प्रिंटही काढू शकता.",
          hi: "जो प्रमाण पत्र मिल जाए उस पर टिक करें। आपकी प्रगति अपने आप सहेज ली जाती है।",
          en: "Check off certificates as you obtain them. Your checklist is auto-saved locally and can be printed anytime."
        }
      },
      {
        selector: '#doc-official-portals',
        title: { mr: '🏛️ शासकीय अधिकृत पोर्टल्स', hi: '🏛️ सरकारी आधिकारिक पोर्टल', en: '🏛️ Official Portals' },
        text: {
          mr: "आपले सरकार, डिजीलॉकर आणि महाडीबीटीवर थेट जाऊन प्रमाणपत्र डाऊनलोड किंवा अर्ज करा.",
          hi: "आपले सरकार, डिजिलॉकर और महाडीबीटी पर सीधे जाकर प्रमाण पत्र डाउनलोड या आवेदन करें।",
          en: "Direct quick links to Aaple Sarkar (for Income/Domicile), DigiLocker, MahaDBT, and BARTI."
        }
      }
    ],

    '/skill-quest': [
      {
        selector: '.skill-quest-page .glass-card:first-child',
        title: { mr: '⭐ तुमचा दर्जा व एक्सपी', hi: '⭐ आपका स्तर और एक्सपी', en: '⭐ Your Rank & XP Bar' },
        text: {
          mr: "सध्याचा दर्जा, जमा झालेले गुण आणि पुढील पातळी गाठण्यासाठी आवश्यक प्रगती येथे दिसेल.",
          hi: "वर्तमान स्तर, अर्जित अंक और अगले स्तर तक पहुँचने की प्रगति यहां प्रदर्शित होती है।",
          en: "Track your current readiness rank (Novice to Master Architect) and experience points earned from career quests."
        }
      },
      {
        selector: '#sq-missions-container, .mission-item',
        title: { mr: '⚔️ व्यावहारिक करिअर आव्हाने', hi: '⚔️ व्यावहारिक करियर चुनौतियां', en: '⚔️ Practical Career Quests' },
        text: {
          mr: "'सुरू करा' वर क्लिक करा. कॉम्प्युटर साक्षरता, करिअर आणि शिष्यवृत्तीचे प्रश्न सोडवून गुण मिळवा.",
          hi: "'प्रारंभ करें' पर क्लिक करें। कंप्यूटर साक्षरता और छात्रवृत्ति के सवाल हल करके अंक कमाएं।",
          en: "Click 'Start Mission' to solve real-world questions on MS-CIT, MahaDBT documents, and industrial clusters to earn XP."
        }
      },
      {
        selector: '#sq-badges-grid, .badge-card',
        title: { mr: '🏆 यश पदके', hi: '🏆 उपलब्धियां और पदक', en: '🏆 Unlock Badges & Medals' },
        text: {
          mr: "प्रत्येक मिशन यशस्वीपणे पूर्ण केल्यानंतर नवीन डिजिटल पदक अनलॉक होते.",
          hi: "प्रत्येक मिशन सफलतापूर्वक पूरा करने के बाद नया डिजिटल पदक अनलॉक होता है।",
          en: "Showcase unlocked credentials like Digital Pioneer, DNA Explorer, and Scholarship Pro as you complete missions."
        }
      }
    ],

    '/resume-builder': [
      {
        selector: '.resume-form-col',
        title: { mr: '✏️ माहिती भरा किंवा नमुना लोड करा', hi: '✏️ विवरण भरें या नमूना लोड करें', en: '✏️ Fill Form or One-Click Preset' },
        text: {
          mr: "आयटीआय, डिप्लोमा किंवा शेतीसाठी १-क्लिक नमुना लोड करा किंवा तुमचे नाव, शिक्षण व कौशल्ये भरा.",
          hi: "आईटीआई, डिप्लोमा या कृषि के लिए 1-क्लिक प्रीसेट लोड करें अथवा अपनी जानकारी दर्ज करें।",
          en: "Use one-click presets for ITI, Polytechnic Diploma, or Agriculture, or customize your own experience and skills."
        }
      },
      {
        selector: '#resume-paper, .printable-resume',
        title: { mr: '📄 रिअल-टाइम एटीएस प्रिव्ह्यू', hi: '📄 रियल-टाइम एटीएस पूर्वावलोकन', en: '📄 Live Single-Page A4 Sheet' },
        text: {
          mr: "तुम्ही डाव्या बाजूला माहिती बदलताच उजव्या बाजूला एक-पानी प्रमाणित बायोडाटा तयार होतो.",
          hi: "जैसे ही आप बाएं फॉर्म में बदलाव करेंगे, दाईं ओर 1-पेज का बायोडाटा तुरंत अपडेट होगा।",
          en: "Watch your single-page professional ATS resume update in real time with perfect typography and spacing."
        }
      },
      {
        selector: '#btn-export-resume-pdf, #btn-print-resume',
        title: { mr: '📥 पीडीएफ डाऊनलोड किंवा थेट प्रिंट', hi: '📥 पीडीएफ डाउनलोड या प्रिंट करें', en: '📥 Download A4 PDF or Vector Print' },
        text: {
          mr: "एका क्लिकवर ए४ पीडीएफ डाऊनलोड करा किंवा थेट प्रिंट काढून मुलाखतीसाठी तयार व्हा.",
          hi: "एक क्लिक में A4 PDF डाउनलोड करें या सीधे प्रिंट करके इंटरव्यू के लिए तैयार हो जाएं।",
          en: "Download a crisp A4 PDF or trigger instant vector print to take along to job interviews or apprenticeship drives."
        }
      }
    ],

    '/all-colleges': [
      {
        selector: '#college-search-input',
        title: { mr: '🔍 कॉलेज व शहर शोध', hi: '🔍 कॉलेज व शहर खोजें', en: '🔍 Search Colleges & Cities' },
        text: {
          mr: "महाविद्यालयाचे नाव, जिल्हा किंवा शहराचे नाव लिहून इन्स्टिट्यूट शोधा.",
          hi: "कॉलेज का नाम, जिला या शहर लिखकर तुरंत संस्थान खोजें।",
          en: "Quickly search colleges by institute name, taluka, or district."
        }
      },
      {
        selector: '#district-filter-select, .college-filters',
        title: { mr: '📍 जिल्हानिहाय निवड', hi: '📍 जिलावार फिल्टर', en: '📍 District & Course Filter' },
        text: {
          mr: "तुमच्या किंवा शेजारील जिल्ह्यातील अभियांत्रिकी, फार्मसी किंवा डिप्लोमा कॉलेजेस निवडा.",
          hi: "अपने या नजदीकी जिले के इंजीनियरिंग, फार्मेसी या डिप्लोमा कॉलेज फिल्टर करें।",
          en: "Filter colleges by district to find government, aided, and private institutes within your preferred mobility radius."
        }
      },
      {
        selector: '#colleges-grid, .college-grid',
        title: { mr: '🏫 फी, वसतिगृह आणि सुविधा', hi: '🏫 फीस, हॉस्टल और सुविधाएं', en: '🏫 Verified Subsidized Colleges' },
        text: {
          mr: "प्रत्येक कॉलेजची शासकीय फी, शासकीय वसतिगृह उपलब्धता आणि मान्यता स्थिती येथे तपासा.",
          hi: "प्रत्येक कॉलेज की सरकारी फीस, छात्रावास उपलब्धता और मान्यता की स्थिति यहां देखें।",
          en: "Check accurate government-subsidized fee structures, hostel bed availability, and official DTE/MSBTE codes."
        }
      }
    ],

    '/career-dna': [
      {
        selector: '.dna-summary-card, .dna-header',
        title: { mr: '🧬 तुमचा करिअर डीएनए', hi: '🧬 आपका करियर डीएनए', en: '🧬 Career Personality Breakdown' },
        text: {
          mr: "तुमच्या व्यक्तिमत्त्वाचे सामर्थ्य प्रॅक्टिकल, संशोधक, कलात्मक किंवा सामाजिक पैलूंमध्ये कसे विभागले आहे ते येथे दिसते.",
          hi: "आपके व्यक्तित्व की ताकत व्यावहारिक, खोजी, कलात्मक या सामाजिक पहलुओं में कैसे विभाजित है, यहां देखें।",
          en: "Overview of your top RIASEC strengths, identifying where your natural problem-solving instincts shine."
        }
      },
      {
        selector: '.dna-chart-container, #dna-chart',
        title: { mr: '📊 क्षमता आलेख', hi: '📊 क्षमता आलेख', en: '📊 Holland-Code Radar Graph' },
        text: {
          mr: "हा व्हिज्युअल आलेख तुमच्या प्रमुख क्षमतांची ताकद स्पष्ट करतो.",
          hi: "यह दृश्य आलेख आपकी प्रमुख क्षमताओं के संतुलन को स्पष्ट रूप से दर्शाता है।",
          en: "Visual radar chart demonstrating your affinity across realistic, investigative, artistic, social, enterprising, and conventional domains."
        }
      },
      {
        selector: '.domain-breakdown, .domain-card',
        title: { mr: '🎯 सुसंगत नोकऱ्या व अभ्यासक्रम', hi: '🎯 सुसंगत नौकरियां व पाठ्यक्रम', en: '🎯 Tailored Job & Study Roles' },
        text: {
          mr: "या क्षमतेनुसार महाराष्ट्रातील कोणत्या कंपन्या आणि अभ्यासक्रमात तुम्हाला सर्वाधिक यश मिळेल ते येथे शिका.",
          hi: "इस क्षमता के आधार पर महाराष्ट्र की किन कंपनियों और पाठ्यक्रमों में आपको सबसे ज्यादा सफलता मिलेगी, यहां जानें।",
          en: "Target career tracks in Maharashtra that match your specific DNA blueprint for high job satisfaction and growth."
        }
      }
    ],

    '/kiosk': [
      {
        selector: '.kiosk-lang-bar',
        title: { mr: '🗣️ १-टच भाषा बदल', hi: '🗣️ 1-टच भाषा चयन', en: '🗣️ 1-Touch Language Switching' },
        text: {
          mr: "मराठी, हिंदी किंवा इंग्रजीवर स्पर्श करून संपूर्ण किओस्क भाषा त्वरित बदला.",
          hi: "मराठी, हिंदी या अंग्रेजी पर स्पर्श करके पूरे कियोस्क की भाषा तुरंत बदलें।",
          en: "Large touchscreen buttons to instantly toggle all kiosk screens and spoken voice between Marathi, Hindi, and English."
        }
      },
      {
        selector: '.kiosk-grid',
        title: { mr: '📱 मोठ्या टचस्क्रीन टाइल्स', hi: '📱 बड़ी टचस्क्रीन टाइल्स', en: '📱 Touch Career Navigation' },
        text: {
          mr: "करिअर चाचणी, मित्र ताई, कॉलेज शोध किंवा खर्चा कॅल्क्युलेटरवर स्पर्श करून मार्गदर्शन मिळवा.",
          hi: "करियर मूल्यांकन, मित्रा ताई, कॉलेज खोज या खर्चा कैलकुलेटर पर स्पर्श करके मार्गदर्शन प्राप्त करें।",
          en: "Large accessible touch tiles designed for walk-up public kiosks in rural schools and Gram Panchayats."
        }
      },
      {
        selector: '#kiosk-timer-pill, #btn-kiosk-logout',
        title: { mr: '⏱️ गोपनीयता आणि ऑटो-रीसेट', hi: '⏱️ गोपनीयता व ऑटो-रीसेट', en: '⏱️ Auto-Reset & Privacy Shield' },
        text: {
          mr: "विद्यार्थ्याचे काम झाल्यावर 'सत्र संपवा' दाबा किंवा १५ मिनिटांच्या निष्क्रियतेनंतर डेटा आपोआप पुसला जातो.",
          hi: "काम पूरा होने पर 'सत्र समाप्त करें' दबाएं, अथवा 15 मिनट निष्क्रिय रहने पर डेटा अपने आप सुरक्षित रीसेट हो जाता है।",
          en: "Inactivity countdown timer automatically wipes all personal data to ensure complete privacy for the next student."
        }
      }
    ]
  };

  // Sound Synthesizer (Web Audio API)
  function playTourChime(type = 'advance') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'advance') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'finish') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          const startTime = ctx.currentTime + idx * 0.09;
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.22, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
          osc.start(startTime);
          osc.stop(startTime + 0.35);
        });
      }
    } catch (e) {
      // AudioContext might be muted
    }
  }

  // Active audio player instance
  let activeAudio = null;
  let isSpeaking = false;
  let isTourActive = false;
  let currentTourSteps = [];
  let currentStepIdx = 0;
  let tourElements = {};

  function getActiveLang() {
    return (window.CareerMitra && window.CareerMitra.lang) || localStorage.getItem('cm-lang') || 'mr';
  }

  function getTourStepsForCurrentPage() {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    return PAGE_TOURS[path] || PAGE_TOURS['/'];
  }

  // Pure Trilingual Speech Function with CareerMitra.speak & Fallback
  function speakTourText(text) {
    stopTourSpeech();
    const lang = getActiveLang();

    const showWaves = () => {
      isSpeaking = true;
      const waves = document.getElementById('tour-audio-waves');
      if (waves) waves.classList.remove('hidden');
      const widgetWaves = document.getElementById('tai-audio-waves');
      if (widgetWaves) widgetWaves.classList.remove('hidden');
    };

    const hideWaves = () => {
      isSpeaking = false;
      const waves = document.getElementById('tour-audio-waves');
      if (waves) waves.classList.add('hidden');
      const widgetWaves = document.getElementById('tai-audio-waves');
      if (widgetWaves) widgetWaves.classList.add('hidden');
    };

    if (window.CareerMitra && window.CareerMitra.speak) {
      window.CareerMitra.speak(text, lang, {
        onStart: showWaves,
        onPlay: showWaves,
        onEnd: hideWaves,
        onError: hideWaves
      });
    } else {
      try {
        const url = `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
        activeAudio = new Audio(url);
        activeAudio.onplay = showWaves;
        activeAudio.onended = hideWaves;
        activeAudio.onerror = () => {
          fallbackWebSpeech(text, lang);
        };
        activeAudio.play().catch(() => {
          fallbackWebSpeech(text, lang);
        });
      } catch (err) {
        fallbackWebSpeech(text, lang);
      }
    }
  }

  function fallbackWebSpeech(text, lang) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Look for exact regional voice
    let matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(lang));

    // If Marathi requested and no 'mr' voice exists on Windows, fallback to Hindi voice (which reads Devanagari accurately!)
    if (!matchedVoice && lang === 'mr') {
      matchedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().startsWith('hi') || v.lang.includes('IN')));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang;
    } else {
      utterance.lang = lang === 'mr' ? 'hi-IN' : (lang === 'hi' ? 'hi-IN' : 'en-IN');
    }

    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    utterance.onstart = () => {
      isSpeaking = true;
      const waves = document.getElementById('tour-audio-waves');
      if (waves) waves.classList.remove('hidden');
      const widgetWaves = document.getElementById('tai-audio-waves');
      if (widgetWaves) widgetWaves.classList.remove('hidden');
    };

    utterance.onend = utterance.onerror = () => {
      isSpeaking = false;
      const waves = document.getElementById('tour-audio-waves');
      if (waves) waves.classList.add('hidden');
      const widgetWaves = document.getElementById('tai-audio-waves');
      if (widgetWaves) widgetWaves.classList.add('hidden');
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopTourSpeech() {
    if (window.CareerMitra && window.CareerMitra.stopSpeech) {
      window.CareerMitra.stopSpeech();
    }
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    const waves = document.getElementById('tour-audio-waves');
    if (waves) waves.classList.add('hidden');
    const widgetWaves = document.getElementById('tai-audio-waves');
    if (widgetWaves) widgetWaves.classList.add('hidden');
  }

  // Start the Game Tutorial
  function startGameTour() {
    const steps = getTourStepsForCurrentPage();
    if (!steps || steps.length === 0) return;

    closeWidget();
    endGameTour(false);

    currentTourSteps = steps;
    currentStepIdx = 0;
    isTourActive = true;

    const lang = getActiveLang();
    const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;

    const root = document.createElement('div');
    root.id = 'game-tour-root';
    root.className = 'game-tour-root';

    root.innerHTML = `
      <div id="game-tour-backdrop" class="game-tour-backdrop"></div>
      <div id="game-tour-spotlight" class="game-tour-spotlight"></div>
      <div id="game-tour-pointer" class="game-tour-pointer">👇</div>
      
      <div id="game-tour-dialog" class="game-tour-dialog slide-up" role="dialog" aria-modal="true">
        <div class="game-tour-header">
          <span class="game-tour-badge" id="tour-step-badge">🎮 QUEST TUTORIAL • 1 / 4</span>
          <button type="button" id="tour-btn-close" class="game-tour-close" title="${i18n.close}">✕</button>
        </div>

        <div class="game-tour-speaker-row">
          <div class="game-tour-avatar">👩‍🏫</div>
          <div>
            <h4 class="game-tour-title" id="tour-feature-title">Feature Title</h4>
            <div id="tour-audio-waves" class="game-tour-audio-waves hidden">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <p class="game-tour-body" id="tour-feature-text"></p>

        <div class="game-tour-footer">
          <button type="button" id="tour-btn-prev" class="game-tour-btn-nav game-tour-btn-prev">
            <span>⬅️</span> <span id="tour-prev-label">${i18n.prev}</span>
          </button>
          
          <button type="button" id="tour-btn-replay" class="game-tour-btn-nav game-tour-btn-replay" title="${i18n.listen}">
            <span>🔊</span> <span id="tour-listen-label">${i18n.listen}</span>
          </button>

          <button type="button" id="tour-btn-next" class="game-tour-btn-nav game-tour-btn-next">
            <span id="tour-next-label">${i18n.next}</span> <span>➡️</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    tourElements = {
      root,
      backdrop: document.getElementById('game-tour-backdrop'),
      spotlight: document.getElementById('game-tour-spotlight'),
      pointer: document.getElementById('game-tour-pointer'),
      dialog: document.getElementById('game-tour-dialog'),
      stepBadge: document.getElementById('tour-step-badge'),
      title: document.getElementById('tour-feature-title'),
      text: document.getElementById('tour-feature-text'),
      prevBtn: document.getElementById('tour-btn-prev'),
      prevLabel: document.getElementById('tour-prev-label'),
      nextBtn: document.getElementById('tour-btn-next'),
      nextLabel: document.getElementById('tour-next-label'),
      replayBtn: document.getElementById('tour-btn-replay'),
      listenLabel: document.getElementById('tour-listen-label'),
      closeBtn: document.getElementById('tour-btn-close'),
      waves: document.getElementById('tour-audio-waves')
    };

    tourElements.closeBtn.addEventListener('click', () => endGameTour(true));
    tourElements.backdrop.addEventListener('click', () => endGameTour(true));
    tourElements.nextBtn.addEventListener('click', nextTourStep);
    tourElements.prevBtn.addEventListener('click', prevTourStep);
    tourElements.replayBtn.addEventListener('click', () => {
      const step = currentTourSteps[currentStepIdx];
      const curLang = getActiveLang();
      const speakTxt = (step.title[curLang] || step.title.mr || step.title.en) + ". " + (step.text[curLang] || step.text.mr || step.text.en);
      speakTourText(speakTxt);
    });

    window.addEventListener('keydown', handleKeyNav);
    window.addEventListener('resize', repositionCurrentStep);
    window.addEventListener('scroll', repositionCurrentStep, { passive: true });

    playTourChime('advance');
    renderTourStep(0);
  }

  function handleKeyNav(e) {
    if (!isTourActive) return;
    if (e.key === 'Escape') {
      endGameTour(true);
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      nextTourStep();
    } else if (e.key === 'ArrowLeft') {
      prevTourStep();
    }
  }

  function nextTourStep() {
    if (currentStepIdx < currentTourSteps.length - 1) {
      currentStepIdx++;
      playTourChime('advance');
      renderTourStep(currentStepIdx);
    } else {
      playTourChime('finish');
      const lang = getActiveLang();
      const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;
      if (window.CareerMitra && window.CareerMitra.toast) {
        window.CareerMitra.toast(i18n.completedToast, 'success');
      }
      endGameTour(false);
    }
  }

  function prevTourStep() {
    if (currentStepIdx > 0) {
      currentStepIdx--;
      playTourChime('advance');
      renderTourStep(currentStepIdx);
    }
  }

  function findTargetElement(selector) {
    const selectors = selector.split(',').map(s => s.trim());
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null && el.getBoundingClientRect().width > 0) {
        return el;
      }
    }
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function renderTourStep(index) {
    if (!isTourActive) return;
    const step = currentTourSteps[index];
    if (!step) return;

    const lang = getActiveLang();
    const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;
    const total = currentTourSteps.length;

    // 1. Pure localized Badge & Labels
    tourElements.stepBadge.textContent = `${i18n.badgePrefix} ${index + 1} ${i18n.ofWord} ${total}`;
    tourElements.prevLabel.textContent = i18n.prev;
    tourElements.listenLabel.textContent = i18n.listen;

    const titleText = step.title[lang] || step.title.mr || step.title.en;
    const descText = step.text[lang] || step.text.mr || step.text.en;
    tourElements.title.textContent = titleText;
    tourElements.text.textContent = descText;

    tourElements.prevBtn.disabled = (index === 0);
    if (index === total - 1) {
      tourElements.nextLabel.textContent = i18n.finish;
    } else {
      tourElements.nextLabel.textContent = i18n.next;
    }

    // 2. Position Spotlight over Target Element
    const targetEl = findTargetElement(step.selector);

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        positionSpotlightAndDialog(targetEl);
      }, 140);
    } else {
      positionCenterFallback();
    }

    // 3. Spoken Voice Guidance
    const speechNarration = `${titleText}. ${descText}`;
    speakTourText(speechNarration);
  }

  function positionSpotlightAndDialog(targetEl) {
    if (!isTourActive || !tourElements.spotlight) return;

    const rect = targetEl.getBoundingClientRect();
    const padding = 10;
    const top = rect.top + window.scrollY - padding;
    const left = rect.left + window.scrollX - padding;
    const width = rect.width + padding * 2;
    const height = rect.height + padding * 2;

    tourElements.spotlight.style.top = `${top}px`;
    tourElements.spotlight.style.left = `${left}px`;
    tourElements.spotlight.style.width = `${Math.max(width, 40)}px`;
    tourElements.spotlight.style.height = `${Math.max(height, 40)}px`;
    tourElements.spotlight.style.display = 'block';

    tourElements.pointer.style.top = `${top - 38}px`;
    tourElements.pointer.style.left = `${left + width / 2}px`;
    tourElements.pointer.style.display = 'block';

    const dialogHeight = tourElements.dialog.offsetHeight || 250;
    const dialogWidth = Math.min(window.innerWidth * 0.92, 440);
    let dialogTop = top + height + 16;
    let dialogLeft = Math.max(16, Math.min(left + (width / 2) - (dialogWidth / 2), window.innerWidth - dialogWidth - 16));

    const viewportBottom = window.scrollY + window.innerHeight;
    if (dialogTop + dialogHeight > viewportBottom && top - dialogHeight - 16 > window.scrollY) {
      dialogTop = top - dialogHeight - 16;
      tourElements.pointer.textContent = '👆';
      tourElements.pointer.style.top = `${top + height + 4}px`;
    } else {
      tourElements.pointer.textContent = '👇';
    }

    tourElements.dialog.style.top = `${dialogTop}px`;
    tourElements.dialog.style.left = `${dialogLeft}px`;
  }

  function positionCenterFallback() {
    if (!isTourActive) return;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;
    const boxW = Math.min(viewWidth * 0.8, 400);
    const boxH = 200;

    tourElements.spotlight.style.top = `${window.scrollY + (viewHeight / 2) - 100}px`;
    tourElements.spotlight.style.left = `${(viewWidth / 2) - (boxW / 2)}px`;
    tourElements.spotlight.style.width = `${boxW}px`;
    tourElements.spotlight.style.height = `${boxH}px`;
    tourElements.pointer.style.display = 'none';

    const dialogWidth = Math.min(viewWidth * 0.92, 440);
    tourElements.dialog.style.top = `${window.scrollY + (viewHeight / 2) + 120}px`;
    tourElements.dialog.style.left = `${(viewWidth / 2) - (dialogWidth / 2)}px`;
  }

  function repositionCurrentStep() {
    if (!isTourActive) return;
    const step = currentTourSteps[currentStepIdx];
    if (!step) return;
    const targetEl = findTargetElement(step.selector);
    if (targetEl) {
      positionSpotlightAndDialog(targetEl);
    }
  }

  function endGameTour(cancelled = false) {
    isTourActive = false;
    stopTourSpeech();

    window.removeEventListener('keydown', handleKeyNav);
    window.removeEventListener('resize', repositionCurrentStep);
    window.removeEventListener('scroll', repositionCurrentStep);

    const root = document.getElementById('game-tour-root');
    if (root) root.remove();

    if (cancelled && window.CareerMitra && window.CareerMitra.toast) {
      const lang = getActiveLang();
      const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;
      window.CareerMitra.toast(i18n.closedToast, 'info');
    }
  }

  // =========================================================================
  // Floating Mitra Tai Assistant Widget Setup
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initWidget();
  });

  function initWidget() {
    if (document.getElementById('mitra-tai-floating-widget')) return;

    const lang = getActiveLang();
    const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;

    const widget = document.createElement('div');
    widget.id = 'mitra-tai-floating-widget';
    widget.className = 'mitra-tai-widget';

    widget.innerHTML = `
      <!-- Speech Assistant Card -->
      <div id="mitra-tai-speech-card" class="mitra-tai-card hidden slide-up">
        <div class="mitra-tai-card-header flex-between align-center">
          <div class="flex align-center gap-2">
            <span class="mitra-avatar-sm">👩‍🏫</span>
            <div>
              <strong id="tai-widget-card-title" class="text-sm block leading-tight">${i18n.taiTitle}</strong>
              <span id="tai-widget-card-subtitle" class="text-xs text-muted">${i18n.taiSubtitle}</span>
            </div>
          </div>
          <div class="flex align-center gap-1">
            <button type="button" id="tai-btn-audio" class="tai-header-btn" title="${i18n.listen}">🔊</button>
            <button type="button" id="tai-btn-close" class="tai-header-btn" title="${i18n.close}">✕</button>
          </div>
        </div>

        <!-- Audio Wave Indicator -->
        <div id="tai-audio-waves" class="tai-audio-waves hidden">
          <span></span><span></span><span></span><span></span><span></span>
        </div>

        <!-- Message Body -->
        <div class="mitra-tai-card-body">
          <!-- Prominent Game Tour Launch Button -->
          <button type="button" id="tai-btn-start-game-tour" class="btn btn-gold btn-sm w-full mb-3 flex-center gap-2" style="font-weight:700; border-radius:12px; box-shadow:0 4px 15px rgba(217,164,65,0.4); padding:0.6rem 1rem;">
            <span>🎮</span> <span id="tai-start-tour-label">${i18n.startTourBtn}</span>
          </button>

          <p id="tai-guide-text" class="text-small mb-3" style="line-height: 1.5;"></p>

          <!-- Quick Action Buttons -->
          <div class="flex gap-2 flex-wrap mb-3">
            <button type="button" id="tai-btn-speak" class="btn btn-primary btn-xs" style="border-radius:12px; font-weight:600;">
              <span>🎙️</span> <span id="tai-speak-page-label">${i18n.speakPageBtn}</span>
            </button>
          </div>

          <!-- Ask Question Form -->
          <div class="tai-chat-input-wrap flex gap-2">
            <input type="text" id="tai-chat-input" class="form-input text-xs" placeholder="${i18n.askPh}" style="padding:0.45rem 0.75rem; border-radius:12px;">
            <button type="button" id="tai-chat-send" class="btn btn-gold btn-xs ripple" style="border-radius:12px; padding:0.45rem 0.8rem;">
              <span>💬</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Avatar Trigger Circle with Attached Tour Pill -->
      <div style="position: relative; display: inline-block;">
        <button type="button" id="mitra-tai-trigger-btn" class="mitra-tai-trigger ripple" aria-label="Open Mitra Tai Voice Assistant" title="Mitra Tai - Career Guidance">
          <span class="mitra-trigger-avatar">👩‍🏫</span>
          <span class="mitra-trigger-badge">AI</span>
        </button>
        <!-- 1-Click Game Tour Trigger Pill -->
        <span id="mitra-tour-pill-badge" class="mitra-trigger-tour-pill" title="Start Interactive Page Tutorial">${i18n.pill}</span>
      </div>
    `;

    document.body.appendChild(widget);

    const triggerBtn = document.getElementById('mitra-tai-trigger-btn');
    const tourPillBadge = document.getElementById('mitra-tour-pill-badge');
    const speechCard = document.getElementById('mitra-tai-speech-card');
    const closeBtn = document.getElementById('tai-btn-close');
    const audioBtn = document.getElementById('tai-btn-audio');
    const speakBtn = document.getElementById('tai-btn-speak');
    const gameTourBtn = document.getElementById('tai-btn-start-game-tour');
    const chatInput = document.getElementById('tai-chat-input');
    const chatSend = document.getElementById('tai-chat-send');

    triggerBtn.addEventListener('click', () => {
      const isClosed = speechCard.classList.contains('hidden');
      if (isClosed) {
        openWidget();
      } else {
        closeWidget();
      }
    });

    tourPillBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      startGameTour();
    });

    closeBtn.addEventListener('click', closeWidget);
    audioBtn.addEventListener('click', toggleAudio);
    speakBtn.addEventListener('click', speakCurrentGuide);
    gameTourBtn.addEventListener('click', startGameTour);

    chatSend.addEventListener('click', sendQuestion);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendQuestion();
    });

    // Handle language change dynamically
    document.addEventListener('cm-lang-changed', () => {
      updateWidgetText();
      if (isTourActive) {
        renderTourStep(currentStepIdx);
      }
    });
  }

  function getPageGuide() {
    const steps = getTourStepsForCurrentPage();
    const lang = getActiveLang();
    const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;
    if (steps && steps.length > 0) {
      const first = steps[0];
      return (first.text[lang] || first.text.mr || first.text.en);
    }
    return i18n.defaultGuide;
  }

  function updateWidgetText() {
    const lang = getActiveLang();
    const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;

    const titleEl = document.getElementById('tai-widget-card-title');
    if (titleEl) titleEl.textContent = i18n.taiTitle;

    const subtitleEl = document.getElementById('tai-widget-card-subtitle');
    if (subtitleEl) subtitleEl.textContent = i18n.taiSubtitle;

    const textEl = document.getElementById('tai-guide-text');
    if (textEl) textEl.textContent = getPageGuide();

    const pillEl = document.getElementById('mitra-tour-pill-badge');
    if (pillEl) pillEl.textContent = i18n.pill;

    const startTourLabel = document.getElementById('tai-start-tour-label');
    if (startTourLabel) startTourLabel.textContent = i18n.startTourBtn;

    const speakPageLabel = document.getElementById('tai-speak-page-label');
    if (speakPageLabel) speakPageLabel.textContent = i18n.speakPageBtn;

    const input = document.getElementById('tai-chat-input');
    if (input) input.placeholder = i18n.askPh;
  }

  function openWidget() {
    const card = document.getElementById('mitra-tai-speech-card');
    if (!card) return;
    card.classList.remove('hidden');
    updateWidgetText();
  }

  function closeWidget() {
    const card = document.getElementById('mitra-tai-speech-card');
    if (!card) return;
    card.classList.add('hidden');
    stopTourSpeech();
  }

  function toggleAudio() {
    if (isSpeaking) {
      stopTourSpeech();
    } else {
      speakCurrentGuide();
    }
  }

  function speakCurrentGuide() {
    const text = getPageGuide();
    speakTourText(text);
  }

  async function sendQuestion() {
    const input = document.getElementById('tai-chat-input');
    const query = (input?.value || '').trim();
    if (!query) return;

    const lang = getActiveLang();
    const i18n = TOUR_I18N[lang] || TOUR_I18N.mr;

    const textEl = document.getElementById('tai-guide-text');
    if (textEl) {
      textEl.innerHTML = `<em>${i18n.asking}</em>`;
    }
    input.value = '';

    try {
      const lang = getActiveLang();
      const res = await fetch('/api/mitra-tai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, lang })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || "माहिती उपलब्ध आहे.";
        if (textEl) textEl.textContent = reply;
        speakTourText(reply);
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      const lang = getActiveLang();
      const fallback = lang === 'mr'
        ? "माफ करा, नेटवर्क जोडणी तपासा किंवा डावीकडील टूल्स वापरा."
        : (lang === 'hi' ? "क्षमा करें, नेटवर्क कनेक्शन जांचें।" : "Sorry, please check your network connection.");
      if (textEl) textEl.textContent = fallback;
    }
  }

  // Global export
  window.CareerMitraTour = {
    start: startGameTour,
    close: endGameTour
  };

})();
