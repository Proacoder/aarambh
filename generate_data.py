import json
import random

careers = [
    {
        "id": "software_developer",
        "title": {"en": "Software Developer", "hi": "सॉफ्टवेयर डेवलपर", "mr": "सॉफ्टवेअर डेव्हलपर"},
        "desc": {"en": "Build apps and websites.", "hi": "ऐप्स और वेबसाइट बनाएं।", "mr": "अॅप्स आणि वेबसाइट्स तयार करा."},
        "matchCriteria": {"aptitude_logical": 4, "interest_technical": 5, "minClass": "Class 12 pass"}
    },
    {
        "id": "teacher",
        "title": {"en": "Teacher", "hi": "शिक्षक", "mr": "शिक्षक"},
        "desc": {"en": "Educate the next generation.", "hi": "अगली पीढ़ी को शिक्षित करें।", "mr": "पुढच्या पिढीला शिक्षित करा."},
        "matchCriteria": {"aptitude_verbal": 5, "interest_academic": 4, "minClass": "Graduate"}
    },
    {
        "id": "nurse",
        "title": {"en": "Nurse", "hi": "नर्स", "mr": "नर्स (परिचारिका)"},
        "desc": {"en": "Care for the sick and injured.", "hi": "बीमार और घायलों की देखभाल करें।", "mr": "आजारी आणि जखमींची काळजी घ्या."},
        "matchCriteria": {"interest_healthcare": 5, "minClass": "Class 12 pass"}
    },
    {
        "id": "agriculture_officer",
        "title": {"en": "Agriculture Officer", "hi": "कृषि अधिकारी", "mr": "कृषी अधिकारी"},
        "desc": {"en": "Work with farmers and land.", "hi": "किसानों और जमीन के साथ काम करें।", "mr": "शेतकरी आणि जमिनीसोबत काम करा."},
        "matchCriteria": {"interest_agriculture": 5, "minClass": "Graduate"}
    },
    {
        "id": "polytechnic_engineer",
        "title": {"en": "Polytechnic Engineer", "hi": "पॉलिटेक्निक इंजीनियर", "mr": "पॉलिटेक्निक इंजिनिअर"},
        "desc": {"en": "Practical engineering work.", "hi": "व्यावहारिक इंजीनियरिंग का काम।", "mr": "प्रात्यक्षिक अभियांत्रिकी काम."},
        "matchCriteria": {"interest_technical": 4, "interest_vocational": 4, "minClass": "Class 10 pass"}
    },
    {
        "id": "government_services",
        "title": {"en": "Government Services", "hi": "सरकारी सेवाएं", "mr": "सरकारी सेवा"},
        "desc": {"en": "Work in civil services.", "hi": "सिविल सेवा में काम करें।", "mr": "नागरी सेवेत काम करा."},
        "matchCriteria": {"interest_publicService": 5, "minClass": "Graduate"}
    },
    {
        "id": "banking_finance",
        "title": {"en": "Banking & Finance", "hi": "बैंकिंग और वित्त", "mr": "बँकिंग आणि वित्त"},
        "desc": {"en": "Manage money and financial systems.", "hi": "पैसे और वित्तीय प्रणालियों का प्रबंधन करें।", "mr": "पैसे आणि वित्तीय प्रणाली व्यवस्थापित करा."},
        "matchCriteria": {"interest_business": 5, "aptitude_logical": 4, "minClass": "Graduate"}
    },
    {
        "id": "skilled_trades",
        "title": {"en": "Skilled Trades (Electrician, Plumber)", "hi": "कुशल व्यापार (इलेक्ट्रीशियन, प्लंबर)", "mr": "कुशल व्यवसाय (इलेक्ट्रिशियन, प्लंबर)"},
        "desc": {"en": "Practical manual work.", "hi": "व्यावहारिक शारीरिक कार्य।", "mr": "प्रात्यक्षिक शारीरिक काम."},
        "matchCriteria": {"interest_vocational": 5, "minClass": "Class 10 below"}
    },
    {
        "id": "entrepreneur",
        "title": {"en": "Entrepreneur", "hi": "उद्यमी", "mr": "उद्योजक"},
        "desc": {"en": "Start and run your own business.", "hi": "अपना खुद का व्यवसाय शुरू करें और चलाएं।", "mr": "स्वतःचा व्यवसाय सुरू करा आणि चालवा."},
        "matchCriteria": {"interest_business": 4, "interest_creative": 3, "minClass": "Class 10 pass"}
    },
    {
        "id": "design_creative",
        "title": {"en": "Design & Creative", "hi": "डिज़ाइन और रचनात्मक", "mr": "डिझाइन आणि क्रिएटिव्ह"},
        "desc": {"en": "Create art, graphics, or designs.", "hi": "कला, ग्राफिक्स या डिज़ाइन बनाएं।", "mr": "कला, ग्राफिक्स किंवा डिझाइन तयार करा."},
        "matchCriteria": {"interest_creative": 5, "minClass": "Class 12 pass"}
    }
]

with open('c:/Users/jasht/OneDrive/Desktop/Careermitra/data/careers.json', 'w', encoding='utf-8') as f:
    json.dump(careers, f, ensure_ascii=False, indent=2)

districts = ["Mumbai", "Thane", "Pune", "Nashik", "Nagpur", "Kolhapur", "Satara", "Solapur", "Sangli", "Ahmednagar", "Ratnagiri", "Chhatrapati Sambhajinagar"]
types = ["University", "College", "Polytechnic", "Institute"]
courses = ["Engineering", "Arts", "Science", "Commerce", "Agriculture", "Nursing", "ITI"]

colleges = []
for i in range(1, 43):
    district = random.choice(districts)
    t = random.choice(types)
    c = random.choice(courses)
    name_en = f"Maharashtra {c} {t} - {district}"
    colleges.append({
        "id": f"col-{i}",
        "name": {
            "en": name_en,
            "hi": f"महाराष्ट्र {c} {t} - {district}",
            "mr": f"महाराष्ट्र {c} {t} - {district}"
        },
        "district": district,
        "type": t,
        "courses": [c],
        "website": f"https://example.com/col-{i}"
    })

with open('c:/Users/jasht/OneDrive/Desktop/Careermitra/data/colleges.json', 'w', encoding='utf-8') as f:
    json.dump(colleges, f, ensure_ascii=False, indent=2)
