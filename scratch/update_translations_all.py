import json, sys
sys.stdout.reconfigure(encoding='utf-8')

# Comprehensive translations dictionary for missing & updated keys
NEW_TRANSLATIONS = {
    # Brand and Header
    "app_tagline": {
        "en": "Rural Student Career Opportunity Navigator",
        "hi": "ग्रामीण छात्र करियर अवसर नेविगेटर",
        "mr": "ग्रामीण विद्यार्थी करिअर संधी दिशादर्शक"
    },
    "back_to_home": {
        "en": "← Back to Home",
        "hi": "← मुख्य पृष्ठ पर वापस जाएं",
        "mr": "← मुख्यपृष्ठावर परत जा"
    },
    "use_now_cta": {
        "en": "Use CareerMitra Now",
        "hi": "करियरमित्र अभी शुरू करें",
        "mr": "करिअरमित्र आता सुरू करा"
    },
    "use_careermitra_now": {
        "en": "🚀 Use CareerMitra Now",
        "hi": "🚀 करियरमित्र अभी शुरू करें",
        "mr": "🚀 करिअरमित्र आता सुरू करा"
    },
    "explore_how": {
        "en": "Explore How It Works",
        "hi": "यह कैसे काम करता है जानें",
        "mr": "हे कसे कार्य करते ते पहा"
    },
    "landing_h1_new": {
        "en": "Your Future Deserves a Clear Path.",
        "hi": "आपके भविष्य को एक स्पष्ट मार्ग मिलना चाहिए।",
        "mr": "तुमच्या भविष्याला एक स्पष्ट दिशा मिळायला हवी."
    },
    "how_subtitle": {
        "en": "Six simple steps to discover your path and build your future.",
        "hi": "अपना मार्ग खोजने और भविष्य बनाने के छह सरल कदम।",
        "mr": "तुमचा मार्ग शोधण्यासाठी आणि भविष्य घडवण्यासाठी ६ सोपे टप्पे."
    },
    "features_title": {
        "en": "Everything You Need to Plan Your Career",
        "hi": "अपने करियर की योजना बनाने के लिए आवश्यक सब कुछ",
        "mr": "तुमचे करिअर घडवण्यासाठी आवश्यक असलेले सर्वकाही"
    },
    "why_title": {
        "en": "Built For Rural Students. By Those Who Understand.",
        "hi": "ग्रामीण छात्रों के लिए निर्मित। उनके द्वारा जो इसे समझते हैं।",
        "mr": "ग्रामीण विद्यार्थ्यांसाठी तयार केले. ग्रामीण समस्या समजणाऱ्यांनी."
    },
    "final_cta_title": {
        "en": "Ready to Start Your Career Journey?",
        "hi": "क्या आप अपनी करियर यात्रा शुरू करने के लिए तैयार हैं?",
        "mr": "तुमचा करिअर प्रवास सुरू करण्यास तयार आहात का?"
    },
    "final_cta_sub": {
        "en": "Join thousands of Maharashtra students discovering their future with CareerMitra.",
        "hi": "करियरमित्र के साथ अपना भविष्य संवारने वाले महाराष्ट्र के हजारों छात्रों से जुड़ें।",
        "mr": "करिअरमित्रासह आपले भविष्य घडवणाऱ्या महाराष्ट्रातील हजारो विद्यार्थ्यांमध्ये सामील व्हा."
    },

    # Journey Steps
    "journey_step1_title": {
        "en": "Tell Us About Yourself",
        "hi": "हमें अपने बारे में बताएं",
        "mr": "तुमची माहिती द्या"
    },
    "journey_step2_title": {
        "en": "Discover Your Strengths",
        "hi": "अपनी ताकत पहचानें",
        "mr": "तुमची ताकद ओळखा"
    },
    "journey_step3_title": {
        "en": "Explore Career Options",
        "hi": "करियर विकल्प खोजें",
        "mr": "करिअर पर्याय शोधा"
    },
    "journey_step4_title": {
        "en": "Find Colleges & Scholarships",
        "hi": "कॉलेज और छात्रवृत्तियां खोजें",
        "mr": "कॉलेजेस व शिष्यवृत्ती शोधा"
    },
    "journey_step5_title": {
        "en": "Understand Your Costs",
        "hi": "अपने खर्च को समझें",
        "mr": "तुमचा खर्च समजून घ्या"
    },
    "step3_d_new": {
        "en": "Get personalized career recommendations based on your interests.",
        "hi": "अपनी रुचियों के आधार पर व्यक्तिगत करियर सिफारिशें प्राप्त करें।",
        "mr": "तुमच्या आवडीनुसार वैयक्तिकृत करिअर शिफारसी मिळवा."
    },
    "step5_d": {
        "en": "Know exactly what education will cost — tuition, hostel, food, travel.",
        "hi": "सटीक रूप से जानें कि शिक्षा पर कितना खर्च होगा — फीस, छात्रावास, भोजन, यात्रा।",
        "mr": "शिक्षणाचा अचूक खर्च जाणून घ्या — फी, वसतिगृह, मेस आणि प्रवास."
    },
    "step6_d": {
        "en": "Your personal roadmap with step-by-step guidance from Mitra Tai.",
        "hi": "मित्र ताई के चरण-दर-चरण मार्गदर्शन के साथ आपका व्यक्तिगत रोडमैप।",
        "mr": "मित्र ताईंच्या चरण-दर-चरण मार्गदर्शनासह तुमचा वैयक्तिक रोडमॅप."
    },
    "step_1_label": {
        "en": "1. Profile Details",
        "hi": "1. प्रोफ़ाइल विवरण",
        "mr": "१. प्राथमिक माहिती"
    },
    "step_2_label": {
        "en": "2. Aptitude Quiz",
        "hi": "2. योग्यता परीक्षा",
        "mr": "२. अभिरुची चाचणी"
    },
    "step_3_label": {
        "en": "3. Career Roadmap",
        "hi": "3. करियर रोडमैप",
        "mr": "३. करिअर रोडमॅप"
    },

    # Features
    "feat_career_discovery": {
        "en": "Career Discovery",
        "hi": "करियर खोज",
        "mr": "करिअर शोध"
    },
    "feat_career_desc": {
        "en": "Understand careers that suit your personality, skills, and interests through our RIASEC assessment.",
        "hi": "हमारे रियासेक मूल्यांकन के माध्यम से अपने व्यक्तित्व और कौशल के अनुकूल करियर को समझें।",
        "mr": "रियासेक चाचणीद्वारे तुमच्या व्यक्तिमत्त्व आणि आवडीला साजेसे करिअर पर्याय ओळखा."
    },
    "feat_college_discovery": {
        "en": "College Discovery",
        "hi": "कॉलेज खोज",
        "mr": "कॉलेज शोध"
    },
    "feat_college_desc": {
        "en": "Find government and private colleges near your district with courses, fees, and distance info.",
        "hi": "अपने जिले के पास सरकारी और निजी कॉलेज खोजें, जिसमें पाठ्यक्रम, फीस और दूरी की जानकारी शामिल है।",
        "mr": "तुमच्या जिल्ह्यातील शासकीय व खाजगी कॉलेजेस, त्यांचे अभ्यासक्रम, फी आणि अंतरासह शोधा."
    },
    "feat_smart_kharcha": {
        "en": "Smart Kharcha",
        "hi": "स्मार्ट खर्चा",
        "mr": "स्मार्ट खर्चा"
    },
    "feat_kharcha_desc": {
        "en": "Get a realistic breakdown of education costs — tuition, hostel, food, travel, and more.",
        "hi": "शिक्षा खर्च का यथार्थवादी विवरण प्राप्त करें — फीस, छात्रावास, भोजन, यात्रा और बहुत कुछ।",
        "mr": "शिक्षणाच्या सर्व खर्चाचे वास्तववादी नियोजन करा — फी, वसतिगृह, मेस आणि प्रवास."
    },
    "feat_scholarships": {
        "en": "Scholarships",
        "hi": "छात्रवृत्तियां",
        "mr": "शिष्यवृत्ती योजना"
    },
    "feat_scholarship_desc": {
        "en": "Discover scholarships you actually qualify for based on your category, income, and education level.",
        "hi": "अपनी श्रेणी, आय और शिक्षा स्तर के आधार पर उन छात्रवृत्तियों की खोज करें जिनके आप पात्र हैं।",
        "mr": "तुमचा प्रवर्ग, उत्पन्न आणि शिक्षण स्तरानुसार तुम्हाला प्रत्यक्ष मिळणाऱ्या शिष्यवृत्ती शोधा."
    },
    "feat_mitra_tai": {
        "en": "Mitra Tai",
        "hi": "मित्र ताई",
        "mr": "मित्र ताई"
    },
    "feat_mitra_desc": {
        "en": "Your AI career guide who understands you. Ask questions in Marathi, Hindi, or English.",
        "hi": "आपकी एआई करियर मार्गदर्शक जो आपको समझती है। मराठी, हिंदी या अंग्रेजी में सवाल पूछें।",
        "mr": "तुमची एआय करिअर मार्गदर्शक. मराठी, हिंदी किंवा इंग्रजीत थेट प्रश्न विचारा."
    },
    "feat_roadmap": {
        "en": "Career Roadmap",
        "hi": "करियर रोडमैप",
        "mr": "करिअर रोडमॅप"
    },
    "feat_roadmap_desc": {
        "en": "A personalized action plan with immediate steps, scholarship deadlines, and long-term goals.",
        "hi": "तत्काल कदम, छात्रवृत्ति की समय सीमा और दीर्घकालिक लक्ष्यों के साथ एक व्यक्तिगत कार्य योजना।",
        "mr": "तातडीचे टप्पे, शिष्यवृत्ती अर्ज आणि दीर्घकालीन उद्दिष्टांसह तयार केलेला कृती आराखडा."
    },

    # Why CareerMitra
    "why_location": {
        "en": "Location-Aware",
        "hi": "स्थान-आधारित",
        "mr": "स्थान-जागरूक"
    },
    "why_location_desc": {
        "en": "Recommendations based on your district. Find colleges and opportunities near you.",
        "hi": "आपके जिले पर आधारित सिफारिशें। अपने नजदीकी कॉलेज और अवसर खोजें।",
        "mr": "तुमच्या जिल्ह्यानुसार शिफारसी. घराभोवतालची महाविद्यालये आणि संधी शोधा."
    },
    "why_financial": {
        "en": "Financially Aware",
        "hi": "आर्थिक दृष्टि से सजग",
        "mr": "आर्थिक परिस्थितीशी सुसंगत"
    },
    "why_financial_desc": {
        "en": "We understand budget constraints. Every recommendation considers your family income.",
        "hi": "हम बजट की सीमाओं को समझते हैं। प्रत्येक सिफारिश आपके पारिवारिक बजट को ध्यान में रखती है।",
        "mr": "आम्ही आर्थिक मर्यादा समजतो. प्रत्येक शिफारस तुमच्या कौटुंबिक उत्पन्नाला अनुकूल असते."
    },
    "why_action": {
        "en": "Action-Oriented",
        "hi": "स्पष्ट कृती योजना",
        "mr": "थेट कृती योजना"
    },
    "why_action_desc": {
        "en": "Not just information — clear next steps. Know exactly what to do and when to do it.",
        "hi": "केवल जानकारी ही नहीं — स्पष्ट अगले कदम। जानें कि क्या करना है और कब करना है।",
        "mr": "फक्त माहिती नाही — पुढचा नेमका मार्ग. काय करावे आणि कधी करावे हे स्पष्ट कळते."
    },
    "why_multi_lang": {
        "en": "Multilingual",
        "hi": "बहुभाषी",
        "mr": "बहुभाषिक"
    },
    "why_multi_desc": {
        "en": "Full support for Marathi, Hindi, and English. Built for Maharashtra's diverse student community.",
        "hi": "मराठी, हिंदी और अंग्रेजी का पूर्ण समर्थन। महाराष्ट्र के छात्रों के लिए विशेष निर्मित।",
        "mr": "मराठी, हिंदी आणि इंग्रजीचा पूर्ण पाठिंबा. महाराष्ट्रातील विद्यार्थ्यांसाठी खास डिझाईन."
    },

    # All Colleges Page
    "nav_colleges_map": {
        "en": "Colleges & Rural Map",
        "hi": "कॉलेज और ग्रामीण नक्शा",
        "mr": "महाविद्यालये व ग्रामीण नकाशा"
    },
    "nav_distribution": {
        "en": "Distribution & Coverage",
        "hi": "वितरण और कवरेज",
        "mr": "जिल्हानिहाय वितरण व व्याप्ती"
    },
    "nav_career_hubs": {
        "en": "Career Hubs",
        "hi": "करियर हब",
        "mr": "करिअर हब्स"
    },
    "nav_live_counter": {
        "en": "65+ Rural & Urban Institutes",
        "hi": "65+ ग्रामीण और शहरी संस्थान",
        "mr": "६५+ ग्रामीण व शहरी संस्था"
    },
    "sidebar_title_colleges": {
        "en": "Colleges & Institutes",
        "hi": "कॉलेज और संस्थान",
        "mr": "महाविद्यालये व शिक्षण संस्था"
    },
    "sidebar_subtitle_colleges": {
        "en": "Subsidized, polytechnics, ITIs & degree colleges",
        "hi": "सरकारी, पॉलिटेक्निक, आईटीआई और डिग्री कॉलेज",
        "mr": "अनुदानित, शासकीय पॉलिटेक्निक, आयटीआय व पदवी महाविद्यालये"
    },
    "sidebar_count_colleges": {
        "en": "0 colleges",
        "hi": "0 कॉलेज",
        "mr": "० कॉलेजेस"
    },
    "badge_all_mh": {
        "en": "All Maharashtra",
        "hi": "संपूर्ण महाराष्ट्र",
        "mr": "संपूर्ण महाराष्ट्र"
    },
    "badge_rural": {
        "en": "Rural Only",
        "hi": "केवल ग्रामीण",
        "mr": "केवळ ग्रामीण भाग"
    },
    "badge_tribal": {
        "en": "Tribal Belts",
        "hi": "आदिवासी क्षेत्र",
        "mr": "आदिवासी पट्टे"
    },
    "badge_govt": {
        "en": "Govt Only",
        "hi": "केवल सरकारी",
        "mr": "केवळ शासकीय"
    },
    "badge_iti": {
        "en": "ITI",
        "hi": "आईटीआई",
        "mr": "आयटीआय"
    },
    "badge_polytechnic": {
        "en": "Polytechnic",
        "hi": "पॉलिटेक्निक",
        "mr": "पॉलिटेक्निक"
    },
    "filter_district": {
        "en": "District",
        "hi": "जिला",
        "mr": "जिल्हा"
    },
    "filter_institute_type": {
        "en": "Institute Type",
        "hi": "संस्थान का प्रकार",
        "mr": "संस्थेचा प्रकार"
    },
    "filter_category": {
        "en": "Category",
        "hi": "प्रवर्ग",
        "mr": "प्रवर्ग"
    },
    "filter_min_qual": {
        "en": "Min Qualification",
        "hi": "न्यूनतम योग्यता",
        "mr": "किमान पात्रता"
    },
    "filter_max_fee": {
        "en": "Max Annual Tuition",
        "hi": "अधिकतम वार्षिक फीस",
        "mr": "कमाल वार्षिक फी"
    },
    "filter_scheme": {
        "en": "Scholarship / Scheme",
        "hi": "छात्रवृत्ति / योजना",
        "mr": "शिष्यवृत्ती / योजना"
    },
    "btn_find_gps": {
        "en": "Find Colleges Near Me (GPS)",
        "hi": "मेरे नजदीकी कॉलेज खोजें (जीपीएस)",
        "mr": "माझ्याजवळील कॉलेजेस शोधा (GPS)"
    },
    "btn_reset": {
        "en": "Reset",
        "hi": "रीसेट",
        "mr": "रीसेट करा"
    },
    "reset_filters": {
        "en": "Reset Filters",
        "hi": "फ़िल्टर रीसेट करें",
        "mr": "फिल्टर्स रीसेट करा"
    },
    "region_all": {
        "en": "All Maharashtra",
        "hi": "संपूर्ण महाराष्ट्र",
        "mr": "संपूर्ण महाराष्ट्र"
    },
    "region_rural": {
        "en": "Rural & Tribal Belts",
        "hi": "ग्रामीण और आदिवासी क्षेत्र",
        "mr": "ग्रामीण व आदिवासी पट्टे"
    },
    "region_vidarbha": {
        "en": "Vidarbha",
        "hi": "विदर्भ",
        "mr": "विदर्भ"
    },
    "region_marathwada": {
        "en": "Marathwada",
        "hi": "मराठवाड़ा",
        "mr": "मराठवाडा"
    },
    "region_khandesh": {
        "en": "North MH / Khandesh",
        "hi": "उत्तर महाराष्ट्र / खानदेश",
        "mr": "उत्तर महाराष्ट्र / खान्देश"
    },
    "region_konkan": {
        "en": "Konkan Coast",
        "hi": "कोंकण तट",
        "mr": "कोकण किनारपट्टी"
    },
    "region_western": {
        "en": "Western MH",
        "hi": "पश्चिम महाराष्ट्र",
        "mr": "पश्चिम महाराष्ट्र"
    },
    "map_dark": {
        "en": "Dark",
        "hi": "डार्क",
        "mr": "गडद"
    },
    "map_streets": {
        "en": "Streets",
        "hi": "सड़कें",
        "mr": "रस्ते"
    },
    "map_satellite": {
        "en": "Satellite",
        "hi": "सैटेलाइट",
        "mr": "उपग्रह"
    },
    "legend_govt": {
        "en": "Government (Subsidized)",
        "hi": "सरकारी (रियायती)",
        "mr": "शासकीय (अनुदानित)"
    },
    "legend_aided": {
        "en": "Aided",
        "hi": "सहायता प्राप्त",
        "mr": "अनुदानित"
    },
    "legend_private": {
        "en": "Private",
        "hi": "निजी",
        "mr": "खाजगी"
    },
    "legend_location": {
        "en": "Your Location",
        "hi": "आपका स्थान",
        "mr": "तुमचे स्थान"
    },
    "dist_hero_title": {
        "en": "Maharashtra College Distribution & Rural Reach",
        "hi": "महाराष्ट्र कॉलेज वितरण और ग्रामीण पहुंच",
        "mr": "महाराष्ट्र महाविद्यालय वितरण व ग्रामीण पोहोच"
    },
    "dist_hero_desc": {
        "en": "Detailed breakdown of higher education and technical institutions across rural talukas, tribal belts, and industrial centers with fee subsidy coverage.",
        "hi": "ग्रामीण तालुकों, आदिवासी क्षेत्रों और औद्योगिक केंद्रों में उच्च और तकनीकी शिक्षा संस्थानों का विस्तृत विवरण।",
        "mr": "ग्रामीण तालुके, आदिवासी पट्टे आणि औद्योगिक केंद्रांमधील उच्च व तंत्रशिक्षण संस्थांचे तपशीलवार विश्लेषण."
    },
    "kpi_institutions": {
        "en": "Institutions Documented",
        "hi": "पंजीकृत संस्थान",
        "mr": "नोंदणीकृत महाविद्यालये"
    },
    "kpi_rural": {
        "en": "Rural & Tribal Talukas",
        "hi": "ग्रामीण और आदिवासी तालुका",
        "mr": "ग्रामीण व आदिवासी तालुके"
    },
    "kpi_govt": {
        "en": "Govt & Low-Fee (<₹10k/yr)",
        "hi": "सरकारी व कम फीस (<₹10k/वर्ष)",
        "mr": "शासकीय व अत्यल्प फी (<₹१० हजार/वर्ष)"
    },
    "kpi_scheme": {
        "en": "MahaDBT Scheme Eligible",
        "hi": "महाडीबीटी योजना पात्र",
        "mr": "महाडीबीटी योजना पात्र"
    },
    "chart_district_title": {
        "en": "Top Districts by College Density",
        "hi": "कॉलेज घनत्व के अनुसार शीर्ष जिले",
        "mr": "सर्वाधिक महाविद्यालये असलेले जिल्हे"
    },
    "chart_type_title": {
        "en": "Government vs. Private vs. Aided",
        "hi": "सरकारी बनाम निजी बनाम सहायता प्राप्त",
        "mr": "शासकीय वि. खाजगी वि. अनुदानित"
    },
    "chart_fee_title": {
        "en": "Annual Fee Brackets",
        "hi": "वार्षिक फीस स्तर",
        "mr": "वार्षिक फी वर्गवारी"
    },
    "chart_stream_title": {
        "en": "Stream & Category Distribution",
        "hi": "शाखा और श्रेणी वितरण",
        "mr": "शाखा आणि प्रवर्गनिहाय वितरण"
    },
    "chart_count": {
        "en": "Count",
        "hi": "संख्या",
        "mr": "संख्या"
    },
    "chart_share": {
        "en": "Share",
        "hi": "हिस्सा",
        "mr": "टक्केवारी"
    },
    "hubs_title": {
        "en": "District Career Hubs",
        "hi": "जिला करियर हब",
        "mr": "जिल्हा करिअर हब्स"
    },
    "hubs_subtitle": {
        "en": "Employment centers & major economic sectors",
        "hi": "रोजगार केंद्र और प्रमुख आर्थिक क्षेत्र",
        "mr": "रोजगार केंद्रे व प्रमुख औद्योगिक क्षेत्रे"
    },
    "hubs_search_placeholder": {
        "en": "Search district or industry hub...",
        "hi": "जिला या औद्योगिक हब खोजें...",
        "mr": "जिल्हा किंवा औद्योगिक हब शोधा..."
    },
    "table_dir_title": {
        "en": "District Higher Education Directory",
        "hi": "जिला उच्च शिक्षा निर्देशिका",
        "mr": "जिल्हा उच्च शिक्षण मार्गदर्शिका"
    },
    "table_dir_hint": {
        "en": "Click any district to explore on map",
        "hi": "नक्शे पर देखने के लिए किसी भी जिले पर क्लिक करें",
        "mr": "नकाशावर पाहण्यासाठी कोणत्याही जिल्ह्यावर क्लिक करा"
    },
    "th_district": {
        "en": "District",
        "hi": "जिला",
        "mr": "जिल्हा"
    },
    "th_region": {
        "en": "Region",
        "hi": "क्षेत्र",
        "mr": "विभाग"
    },
    "th_colleges": {
        "en": "Colleges Tracked",
        "hi": "ट्रैक किए गए कॉलेज",
        "mr": "नोंदणीकृत कॉलेजेस"
    },
    "th_fee": {
        "en": "Lowest Fee",
        "hi": "न्यूनतम फीस",
        "mr": "किमान फी"
    },
    "th_streams": {
        "en": "Key Streams",
        "hi": "प्रमुख शाखाएं",
        "mr": "प्रमुख शाखा"
    },
    "th_focus": {
        "en": "Rural / Tribal Focus",
        "hi": "ग्रामीण / आदिवासी केंद्र",
        "mr": "ग्रामीण / आदिवासी भाग"
    },
    "th_action": {
        "en": "Action",
        "hi": "कार्रवाई",
        "mr": "कृती"
    },
    "stat_colleges": {
        "en": "Colleges Plotted",
        "hi": "दर्ज कॉलेज",
        "mr": "नोंदवलेली कॉलेजेस"
    },
    "stat_rural": {
        "en": "Rural/Tribal",
        "hi": "ग्रामीण/आदिवासी",
        "mr": "ग्रामीण/आदिवासी"
    },
    "btn_open_map": {
        "en": "Open Map",
        "hi": "नक्शा खोलें",
        "mr": "नकाशा उघडा"
    },

    # Schemes Page Keys
    "schemes_header_badge": {
        "en": "MAHADBT • MAHARASHTRA STUDENT SCHEMES DIRECTORY",
        "hi": "महाडीबीटी • महाराष्ट्र छात्र योजना निर्देशिका",
        "mr": "महाडीबीटी • महाराष्ट्र शासन शिष्यवृत्ती व सवलत योजना"
    },
    "schemes_main_title": {
        "en": "Maharashtra Government Student Schemes & Scholarships",
        "hi": "महाराष्ट्र शासन छात्रवृत्ति एवं छूट योजनाएं",
        "mr": "महाराष्ट्र शासन शिष्यवृत्ती व सवलत योजना"
    },
    "schemes_subtitle": {
        "en": "Complete directory of MahaDBT fee concessions, Swadhar hostel subsidies, and monthly allowances.",
        "hi": "महाडीबीटी फीस माफी, स्वाधार छात्रावास भत्ता और मासिक वजीफा योजनाओं की पूरी जानकारी।",
        "mr": "महाडीबीटी फी माफी, स्वाधार वसतिगृह भत्ता व शासकीय विद्यावेतन योजनांची संपूर्ण माहिती व अटी."
    },
    "schemes_calc_btn": {
        "en": "Kharcha Calculator",
        "hi": "खर्चा कैलकुलेटर",
        "mr": "खर्चा कॅल्क्युलेटर"
    },
    "schemes_docs_btn": {
        "en": "Doc Checklist",
        "hi": "दस्तावेज़ चेकलिस्ट",
        "mr": "कागदपत्रे यादी"
    },
    "schemes_showing": {
        "en": "Showing",
        "hi": "दिखाए गए",
        "mr": "दाखवत आहोत"
    },
    "schemes_count_label": {
        "en": "Maharashtra Student Schemes",
        "hi": "महाराष्ट्र छात्र योजनाएं",
        "mr": "महाराष्ट्र विद्यार्थी योजना"
    },
    "schemes_no_match_title": {
        "en": "No Schemes Matched",
        "hi": "कोई योजना नहीं मिली",
        "mr": "कोणतीही योजना जुळली नाही"
    },
    "schemes_no_match_desc": {
        "en": "Try clearing or adjusting your search filters.",
        "hi": "कृपया अपने फ़िल्टर बदलें या खोज शब्द जांचें।",
        "mr": "कृपया तुमचे फिल्टर्स बदला किंवा शोध शब्द तपासा."
    },
    "schemes_filter_cat_label": {
        "en": "Category:",
        "hi": "वर्ग / श्रेणी:",
        "mr": "प्रवर्ग:"
    },
    "schemes_filter_type_label": {
        "en": "Benefit Type:",
        "hi": "लाभ का प्रकार:",
        "mr": "लाभाचा प्रकार:"
    },
    "schemes_filter_income_label": {
        "en": "Family Income Limit:",
        "hi": "पारिवारिक आय सीमा:",
        "mr": "कौटुंबिक उत्पन्न मर्यादा:"
    },
    "schemes_filter_edu_label": {
        "en": "Education Level:",
        "hi": "शिक्षा का स्तर:",
        "mr": "शिक्षण स्तर:"
    },
    "schemes_type_all": {
        "en": "All Types",
        "hi": "सभी प्रकार",
        "mr": "सर्व प्रकार"
    },
    "schemes_type_tuition": {
        "en": "🎓 Tuition Fee Waiver",
        "hi": "🎓 शिक्षण शुल्क छूट",
        "mr": "🎓 ट्युशन फी माफी"
    },
    "schemes_type_hostel": {
        "en": "🏠 Hostel & Food Allowance",
        "hi": "🏠 छात्रावास व भोजन भत्ता",
        "mr": "🏠 वसतिगृह व भोजन भत्ता"
    },
    "schemes_type_stipend": {
        "en": "💵 Stipend & Grants",
        "hi": "💵 वजीफा व अनुदान",
        "mr": "💵 विद्यावेतन व साहित्य भत्ता"
    },
    "schemes_search_ph": {
        "en": "🔍 Search: e.g. EBC, Swadhar, Hostel, OBC, Minority, Fee waiver...",
        "hi": "🔍 खोजें: जैसे EBC, स्वाधार, छात्रावास, OBC, अल्पसंख्यक, फीस माफी...",
        "mr": "🔍 शोधा: उदा. ईबीसी, स्वाधार, वसतिगृह, ओबीसी, अल्पसंख्याक, फी माफी..."
    },
    "filter_all": {
        "en": "All",
        "hi": "सभी",
        "mr": "सर्व"
    },
    "cat_all": {
        "en": "All",
        "hi": "सभी",
        "mr": "सर्व"
    },
    "cat_open": {
        "en": "OPEN / EBC / SEBC",
        "hi": "सामान्य / EBC / SEBC",
        "mr": "खुला प्रवर्ग / ईबीसी / एसईबीसी"
    },
    "cat_sc": {
        "en": "SC",
        "hi": "एससी (अनुसूचित जाति)",
        "mr": "अनुसूचित जाती (SC)"
    },
    "cat_st": {
        "en": "ST",
        "hi": "एसटी (अनुसूचित जनजाति)",
        "mr": "अनुसूचित जमाती (ST)"
    },
    "cat_obc": {
        "en": "OBC / VJNT / SBC",
        "hi": "ओबीसी / वीजेएनटी / एसबीसी",
        "mr": "इतर मागास / विमुक्त / विशेष मागास"
    },
    "cat_minority": {
        "en": "Minority",
        "hi": "अल्पसंख्यक",
        "mr": "अल्पसंख्याक"
    },
    "cat_pwd": {
        "en": "Divyang (PWD)",
        "hi": "दिव्यांग",
        "mr": "दिव्यांग"
    },

    # Tutorials Page Keys
    "tutorials_badge": {
        "en": "MAHARASHTRA ADMISSION & SCHOLARSHIP VIDEO GUIDES",
        "hi": "महाराष्ट्र प्रवेश और छात्रवृत्ति वीडियो गाइड",
        "mr": "महाराष्ट्र प्रवेश व शिष्यवृत्ती व्हिडिओ मार्गदर्शन"
    },
    "tutorials_subtitle": {
        "en": "Step-by-step verified video tutorials for MahaDBT, income certificate, caste validity, and DTE admissions.",
        "hi": "महाडीबीटी, आय प्रमाण पत्र, जाति वैधता और डीटीई प्रवेश के लिए चरण-दर-चरण वीडियो ट्यूटोरियल।",
        "mr": "महाडीबीटी शिष्यवृत्ती, उत्पन्न दाखला, जात वैधता आणि डीटीई प्रवेशाचे सोप्या भाषेतील स्टेप-बाय-स्टेप व्हिडिओ."
    },
    "tut_filter_all": {
        "en": "All",
        "hi": "सभी",
        "mr": "सर्व"
    },
    "tut_filter_scholarships": {
        "en": "🎓 Scholarships",
        "hi": "🎓 छात्रवृत्तियां",
        "mr": "🎓 शिष्यवृत्ती"
    },
    "tut_filter_admissions": {
        "en": "🏫 Admissions",
        "hi": "🏫 प्रवेश प्रक्रिया",
        "mr": "🏫 प्रवेश प्रक्रिया"
    },
    "tut_filter_exams": {
        "en": "📅 Exams",
        "hi": "📅 प्रवेश परीक्षा",
        "mr": "📅 प्रवेश परीक्षा"
    },
    "tut_filter_documents": {
        "en": "📋 Documents",
        "hi": "📋 दस्तावेज़",
        "mr": "📋 कागदपत्रे"
    },
    "tut_watch_btn": {
        "en": "Watch on YouTube →",
        "hi": "YouTube पर देखें →",
        "mr": "YouTube वर पहा →"
    },
    "tut_search_ph": {
        "en": "🔍 Search videos: e.g. MahaDBT, EBC, DTE, Income Certificate, NEET, Hostel...",
        "hi": "🔍 वीडियो खोजें: जैसे MahaDBT, EBC, DTE, आय प्रमाण पत्र, NEET, छात्रावास...",
        "mr": "🔍 व्हिडिओ शोधा: उदा. महाडीबीटी, ईबीसी, डीटीई, उत्पन्न दाखला, नीट, वसतिगृह..."
    },

    # Career DNA Keys
    "dna_badge": {
        "en": "🧬 PSYCHOMETRIC DISCOVERY",
        "hi": "🧬 मनोवैज्ञानिक व्यक्तित्व खोज",
        "mr": "🧬 मानसशास्त्रीय व्यक्तिमत्त्व शोध"
    },
    "dna_title": {
        "en": "Your Career DNA Signature",
        "hi": "आपका करियर डीएनए हस्ताक्षर",
        "mr": "तुमचा करिअर डीएनए आराखडा"
    },
    "dna_subtitle": {
        "en": "An interactive multi-dimensional map of your natural thinking styles, vocational affinities, and practical problem-solving preferences.",
        "hi": "आपकी स्वाभाविक सोच शैली, व्यावसायिक रुझानों और व्यावहारिक समस्या-समाधान प्राथमिकताओं का एक संवादात्मक मानचित्र।",
        "mr": "तुमच्या विचारसरणी, व्यावसायिक अभिरुची आणि प्रत्यक्ष समस्या सोडवण्याच्या पद्धतींचा सविस्तर व्हिज्युअल नकाशा."
    },
    "dna_note": {
        "en": "💡 Note: These scores reflect your current interests and strengths. You can develop new skills and affinities over time.",
        "hi": "💡 नोट: ये स्कोर आपकी वर्तमान रुचियों और ताकतों को दर्शाते हैं। आप समय के साथ नए कौशल विकसित कर सकते हैं।",
        "mr": "💡 टीप: हे गुण तुमच्या सध्याच्या आवडी आणि सामर्थ्याचे दर्शक आहेत. सरावाने तुम्ही नवीन कौशल्येही आत्मसात करू शकता."
    },
    "dna_radar_title": {
        "en": "🕸️ Multi-Dimensional Affinity Radar",
        "hi": "🕸️ बहु-आयामी अभिरुचि रडार",
        "mr": "🕸️ बहुआयामी अभिरुची आलेख"
    },
    "dna_radar_sub": {
        "en": "Visual balance across 6 core RIASEC dimensions.",
        "hi": "6 मुख्य रियासेक आयामों में दृश्य संतुलन।",
        "mr": "६ प्रमुख रियासेक क्षमतांचे व्हिज्युअल संतुलन."
    },
    "dna_archetype_badge": {
        "en": "YOUR DOMINANT ARCHETYPE",
        "hi": "आपका प्रमुख व्यक्तित्व प्रकार",
        "mr": "तुमचे प्रमुख व्यक्तिमत्त्व वैशिष्ट्य"
    },
    "dna_archetype_name": {
        "en": "The Practical Innovator & Builder",
        "hi": "व्यावहारिक नवप्रवर्तक और निर्माता",
        "mr": "प्रॅक्टिकल संशोधक आणि तंत्र-निर्माता"
    },
    "dna_archetype_desc": {
        "en": "You feel most energized when working with real tools, logical systems, and tangible technology. You enjoy understanding how things work under the hood and solving real-world community challenges.",
        "hi": "जब आप वास्तविक उपकरणों, तार्किक प्रणालियों और तकनीक के साथ काम करते हैं तो सबसे अधिक ऊर्जावान महसूस करते हैं। आप चीजों के कार्यप्रणाली को समझने और वास्तविक चुनौतियों को हल करने का आनंद लेते हैं।",
        "mr": "यंत्रे, टूल्स, तांत्रिक साधने आणि कॉम्प्युटर सिस्टीम्स हाताळताना तुमच्यातील उत्साह वाढतो. प्रत्यक्ष कार्यपद्धती समजून घेणे आणि गावातील व समाजातील आव्हाने सोडवणे ही तुमची ताकद आहे."
    },
    "dna_precision": {
        "en": "94% Precision",
        "hi": "94% सटीकता",
        "mr": "९४% अचूकता"
    },
    "dna_overall_match": {
        "en": "Overall Match: 94% Alignment",
        "hi": "समग्र मिलान: 94% संरेखण",
        "mr": "एकूण जुळणी: ९४% सुसंगतता"
    },
    "dna_primary_type": {
        "en": "Primary: Realistic & Tech",
        "hi": "प्राथमिक: व्यावहारिक व तकनीकी",
        "mr": "प्राथमिक: प्रॅक्टिकल व तांत्रिक"
    },
    "dna_dimension_title": {
        "en": "Dimension Breakdown",
        "hi": "आयाम विश्लेषण",
        "mr": "क्षमता निहाय विश्लेषण"
    },
    "dna_dim_realistic": {
        "en": "Realistic (Practical & Engineering)",
        "hi": "व्यावहारिक (प्रायोगिक एवं इंजीनियरिंग)",
        "mr": "प्रॅक्टिकल (प्रत्यक्ष काम व अभियांत्रिकी)"
    },
    "dna_dim_investigative": {
        "en": "Investigative (Analysis & Scientific Logic)",
        "hi": "खोजी (विश्लेषण और वैज्ञानिक तर्क)",
        "mr": "संशोधक (माहिती विश्लेषण व विज्ञान)"
    },
    "dna_dim_enterprising": {
        "en": "Enterprising (Leadership & Commerce)",
        "hi": "उद्यमी (नेतृत्व और व्यवसाय)",
        "mr": "उद्योगशील (नेतृत्व व व्यवसाय व्यवस्थापन)"
    },
    "dna_dim_social": {
        "en": "Social (Teaching & Community Support)",
        "hi": "सामाजिक (शिक्षण और सामुदायिक सेवा)",
        "mr": "सामाजिक (मार्गदर्शन व समाजकार्य)"
    },
    "dna_cta_calculator": {
        "en": "💰 PathPocket Calculator",
        "hi": "💰 खर्चा कैलकुलेटर",
        "mr": "💰 स्मार्ट खर्चा कॅल्क्युलेटर"
    },
    "dna_cta_schemes": {
        "en": "🎓 Govt Schemes",
        "hi": "🎓 सरकारी योजनाएं",
        "mr": "🎓 शासकीय योजना"
    },
    "dna_cta_matches": {
        "en": "Go to My Matches & Command Center →",
        "hi": "मेरे मिलान और कमांड सेंटर पर जाएं →",
        "mr": "माझे करिअर पर्याय पहा →"
    },

    # Documents Page Keys
    "doc_tracker_title": {
        "en": "Admission & Scholarship Document Tracker",
        "hi": "प्रवेश और छात्रवृत्ति दस्तावेज़ ट्रैकर",
        "mr": "प्रवेश व शिष्यवृत्ती कागदपत्रे ट्रॅकर"
    },
    "doc_tracker_subtitle": {
        "en": "Comprehensive checklist of original certificates required for 10th, 12th, Diploma, Degree and MahaDBT scholarships.",
        "hi": "10वीं, 12वीं, डिप्लोमा, डिग्री और महाडीबीटी छात्रवृत्ति के लिए आवश्यक मूल प्रमाणपत्रों की पूरी सूची।",
        "mr": "१०वी, १२वी, पदविका (डिप्लोमा) आणि महाडीबीटी शिष्यवृत्तीसाठी लागणाऱ्या मूळ कागदपत्रांची संपूर्ण यादी."
    },
    "doc_portals_title": {
        "en": "Official Government Portals:",
        "hi": "आधिकारिक सरकारी पोर्टल:",
        "mr": "शासकीय अधिकृत पोर्टल्स:"
    },
    "doc_print_btn": {
        "en": "Print / Save PDF Checklist",
        "hi": "प्रिंट / PDF चेकलिस्ट सेव करें",
        "mr": "प्रिंट / PDF चेकलिस्ट सेव्ह करा"
    },
    "reset_progress_btn": {
        "en": "Reset Checklist",
        "hi": "चेकलिस्ट रीसेट करें",
        "mr": "चेकलिस्ट रीसेट करा"
    },
    "progress_label": {
        "en": "Readiness Progress:",
        "hi": "दस्तावेज़ तत्परता:",
        "mr": "तयार कागदपत्रे पूर्तता:"
    },
    "doc_tab_all": {
        "en": "All",
        "hi": "सभी",
        "mr": "सर्व कागदपत्रे"
    },
    "doc_tab_academic": {
        "en": "📚 Academic Records",
        "hi": "📚 शैक्षणिक दस्तावेज",
        "mr": "📚 शैक्षणिक कागदपत्रे"
    },
    "doc_tab_identity": {
        "en": "🪪 Identity & Domicile",
        "hi": "🪪 पहचान व अधिवास",
        "mr": "🪪 ओळख व अधिवास दाखले"
    },
    "doc_tab_financial": {
        "en": "💰 Income & Bank DBT",
        "hi": "💰 आय व बैंक खाता",
        "mr": "💰 उत्पन्न व बँक DBT"
    },
    "doc_tab_reservation": {
        "en": "📜 Caste & Reservation",
        "hi": "📜 जाति व आरक्षण",
        "mr": "📜 जात व आरक्षण"
    },
    "doc_tab_hostel": {
        "en": "🏠 Hostel & Photos",
        "hi": "🏠 छात्रावास व फोटो",
        "mr": "🏠 वसतिगृह व इतर"
    },
    "doc_mandatory": {
        "en": "Mandatory",
        "hi": "अनिवार्य",
        "mr": "अनिवार्य"
    },
    "doc_where": {
        "en": "Where to get:",
        "hi": "कहाँ मिलेगा:",
        "mr": "कुठे मिळेल:"
    },
    "doc_time": {
        "en": "Time:",
        "hi": "समय:",
        "mr": "लागणारा वेळ:"
    },
    "doc_cost": {
        "en": "Fee:",
        "hi": "शुल्क:",
        "mr": "शासकीय शुल्क:"
    },

    # Parent Mode Keys
    "parent_badge": {
        "en": "FAMILY DIALOGUE • PARENT GUIDANCE",
        "hi": "अभिभावक संवाद • पारिवारिक मार्गदर्शन",
        "mr": "पालक संवाद • कुटुंब मार्गदर्शन"
    },
    "parent_listen": {
        "en": "Listen",
        "hi": "सुनें",
        "mr": "ऐका"
    },
    "parent_cta": {
        "en": "Start Parent Conversation with Mitra Tai →",
        "hi": "मित्र ताई के साथ अभिभावक संवाद शुरू करें →",
        "mr": "मित्रा ताईंशी पालकांचे संभाषण सुरू करा →"
    },

    # Kiosk Mode Keys
    "kiosk_listen_prompt": {
        "en": "Listen",
        "hi": "सुनें",
        "mr": "ऐका"
    },
    "kiosk_confirm_modal_title": {
        "en": "End Student Session?",
        "hi": "क्या छात्र का सत्र समाप्त करें?",
        "mr": "विद्यार्थ्याचे सत्र संपवायचे का?"
    },
    "kiosk_confirm_reset": {
        "en": "Are you sure you want to end this session? All student data will be securely cleared for the next student.",
        "hi": "क्या आप वाकई यह सत्र समाप्त करना चाहते हैं? अगले छात्र के लिए सभी जानकारी सुरक्षित रूप से हटा दी जाएगी।",
        "mr": "तुम्हाला खात्री आहे का की तुम्हाला हे सत्र संपवायचे आहे? पुढील विद्यार्थ्यासाठी सर्व माहिती सुरक्षितपणे पुसली जाईल."
    },
    "kiosk_confirm_cancel": {
        "en": "No, Continue",
        "hi": "नहीं, जारी रखें",
        "mr": "नाही, चालू ठेवा"
    },
    "kiosk_confirm_yes": {
        "en": "Yes, End Session",
        "hi": "हाँ, सत्र समाप्त करें",
        "mr": "होय, सत्र संपवा"
    },

    # SkillQuest Keys
    "sq_badge": {
        "en": "GAMIFIED MISSIONS",
        "hi": "गेमिफाइड मिशन",
        "mr": "गेमिफाईड मिशन्स"
    },
    "sq_start_mission": {
        "en": "Start Mission",
        "hi": "मिशन शुरू करें",
        "mr": "सुरू करा"
    },
    "sq_completed": {
        "en": "Completed (+150 XP)",
        "hi": "पूरा हुआ (+150 XP)",
        "mr": "पूर्ण झाले (+150 XP)"
    },
    "sq_reward": {
        "en": "Reward:",
        "hi": "पुरस्कार:",
        "mr": "बक्षीस:"
    },
    "sq_status": {
        "en": "Status:",
        "hi": "स्थिति:",
        "mr": "स्थिती:"
    },
    "sq_active": {
        "en": "Active",
        "hi": "सक्रिय",
        "mr": "सक्रिय"
    },
    "sq_done": {
        "en": "Done",
        "hi": "पूर्ण",
        "mr": "पूर्ण झाले"
    },
    "sq_question_label": {
        "en": "🎯 Quest Question:",
        "hi": "🎯 मिशन प्रश्न:",
        "mr": "🎯 प्रश्न:"
    },
    "sq_locked": {
        "en": "Locked",
        "hi": "लॉक",
        "mr": "बंद"
    },
    "sq_unlocked": {
        "en": "Unlocked",
        "hi": "अनलॉक",
        "mr": "मिळाले"
    },

    # 3D CareerVerse Keys
    "cv_badge": {
        "en": "3D CAREERVERSE • GALAXY EXPLORER",
        "hi": "3D करियरवर्स • ब्रह्मांड अन्वेषक",
        "mr": "३D करिअरवर्स • आकाशगंगा अन्वेषक"
    },
    "cv_title": {
        "en": "The Interactive Career Cosmos",
        "hi": "संवादात्मक करियर ब्रह्मांड",
        "mr": "संवादी करिअर विश्व"
    },
    "cv_instructions": {
        "en": "Drag to rotate • Scroll to zoom • Tap any glowing star to inspect qualifications & salaries",
        "hi": "घुमाने के लिए ड्रैग करें • ज़ूम करने के लिए स्क्रॉल करें • योग्यता और वेतन देखने के लिए किसी भी चमकते तारे पर टैप करें",
        "mr": "फिरवण्यासाठी फिरवा • झूम करण्यासाठी स्क्रोल करा • पात्रता व वेतन पाहण्यासाठी कोणत्याही चमकणाऱ्या ताऱ्याला स्पर्श करा"
    },
    "cv_control_drag": {
        "en": "🖱️ Left Drag: Orbit",
        "hi": "🖱️ बायां क्लिक: घूमें",
        "mr": "🖱️ फिरवा: कक्षा फिरवा"
    },
    "cv_control_zoom": {
        "en": "🔍 Wheel: Zoom",
        "hi": "🔍 व्हील: ज़ूम करें",
        "mr": "🔍 व्हील: झूम करा"
    },
    "cv_command_center": {
        "en": "Command Center →",
        "hi": "कमांड सेंटर →",
        "mr": "मुख्य केंद्र →"
    },
    "cv_filter_all": {
        "en": "✨ All Constellations",
        "hi": "✨ सभी नक्षत्र",
        "mr": "✨ सर्व नक्षत्र"
    },
    "cv_filter_tech": {
        "en": "💻 Tech & IT",
        "hi": "💻 प्रौद्योगिकी व आईटी",
        "mr": "💻 तंत्रज्ञान व आयटी"
    },
    "cv_filter_health": {
        "en": "⚕️ Healthcare",
        "hi": "⚕️ स्वास्थ्य सेवा",
        "mr": "⚕️ आरोग्य सेवा"
    },
    "cv_filter_agri": {
        "en": "🌾 Agri-Tech",
        "hi": "🌾 कृषि-प्रौद्योगिकी",
        "mr": "🌾 कृषी-तंत्रज्ञान"
    },
    "cv_filter_govt": {
        "en": "🏛️ Public Service",
        "hi": "🏛️ प्रशासनिक सेवा",
        "mr": "🏛️ शासकीय सेवा"
    },
    "cv_qualification": {
        "en": "Qualification:",
        "hi": "योग्यता:",
        "mr": "पात्रता:"
    },
    "cv_entry_salary": {
        "en": "Entry Salary:",
        "hi": "प्रारंभिक वेतन:",
        "mr": "सुरुवातीचे वेतन:"
    }
}

with open('data/translations.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for k, val_dict in NEW_TRANSLATIONS.items():
    for lang in ['en', 'hi', 'mr']:
        if lang in val_dict:
            d[lang][k] = val_dict[lang]

# Save updated json
with open('data/translations.json', 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)

print('Updated translations.json successfully!')
for lang in ['en', 'hi', 'mr']:
    print(f'{lang} now has {len(d[lang])} keys.')
