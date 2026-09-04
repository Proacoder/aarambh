import { prisma } from "../src/lib/prisma.ts";

async function main() {
  console.log("🌱 Starting CareerMitra database seeding...");

  // Clean existing seedable records (preserving referential integrity)
  await prisma.recommendation.deleteMany();
  await prisma.collegeCourse.deleteMany();
  await prisma.college.deleteMany();
  await prisma.scholarship.deleteMany();

  console.log("🧹 Cleaned existing colleges, courses, scholarships, and recommendations.");

  // 1. Seed Realistic Regional Maharashtra Colleges
  const collegesData = [
    {
      name: "Government College of Engineering, Karad",
      district: "Satara",
      state: "Maharashtra",
      type: "Government Engineering College",
      latitude: 17.3103,
      longitude: 74.1844,
      description: "Premier autonomous government engineering institution in Western Maharashtra, known for strong rural outreach, affordable fees, and high placements.",
      courses: [
        { name: "B.Tech in Computer Science and Engineering", eligibilityPercentage: 60.0, durationYears: 4, approximateFees: 82000 },
        { name: "B.Tech in Civil and Environmental Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 78000 },
        { name: "B.Tech in Electrical Engineering", eligibilityPercentage: 55.0, durationYears: 4, approximateFees: 78000 },
        { name: "B.Tech in Mechanical Engineering", eligibilityPercentage: 55.0, durationYears: 4, approximateFees: 78000 },
        { name: "M.Tech in Structural Engineering", eligibilityPercentage: 60.0, durationYears: 2, approximateFees: 65000 }
      ]
    },
    {
      name: "Government College of Engineering, Aurangabad",
      district: "Chhatrapati Sambhajinagar",
      state: "Maharashtra",
      type: "Government Engineering College",
      latitude: 19.8665,
      longitude: 75.3218,
      description: "Leading government autonomous technical institute in Marathwada region established in 1960. Excellent laboratory infrastructure and low hostel charges.",
      courses: [
        { name: "B.Tech in Computer Science and Engineering", eligibilityPercentage: 65.0, durationYears: 4, approximateFees: 80000 },
        { name: "B.Tech in Information Technology", eligibilityPercentage: 62.0, durationYears: 4, approximateFees: 80000 },
        { name: "B.Tech in Electronics and Telecommunication", eligibilityPercentage: 55.0, durationYears: 4, approximateFees: 76000 },
        { name: "B.Tech in Civil Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 76000 },
        { name: "Master of Computer Applications (MCA)", eligibilityPercentage: 50.0, durationYears: 2, approximateFees: 45000 }
      ]
    },
    {
      name: "Government College of Engineering, Amravati",
      district: "Amravati",
      state: "Maharashtra",
      type: "Government Engineering College",
      latitude: 20.9413,
      longitude: 77.7557,
      description: "Established in 1964, a prominent government autonomous engineering college serving Vidarbha rural youth with subsidized education.",
      courses: [
        { name: "B.Tech in Computer Science and Engineering", eligibilityPercentage: 60.0, durationYears: 4, approximateFees: 79000 },
        { name: "B.Tech in Electrical Engineering", eligibilityPercentage: 52.0, durationYears: 4, approximateFees: 75000 },
        { name: "B.Tech in Mechanical Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 75000 },
        { name: "B.Tech in Civil Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 75000 }
      ]
    },
    {
      name: "Government College of Engineering, Chandrapur",
      district: "Chandrapur",
      state: "Maharashtra",
      type: "Government Engineering College",
      latitude: 19.9822,
      longitude: 79.3015,
      description: "Only government engineering college in Chandrapur/Gadchiroli tribal belt, providing high scholarship quotas and rural student training.",
      courses: [
        { name: "B.Tech in Computer Engineering", eligibilityPercentage: 55.0, durationYears: 4, approximateFees: 68000 },
        { name: "B.Tech in Mining Engineering", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 65000 },
        { name: "B.Tech in Electrical Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 65000 },
        { name: "B.Tech in Mechanical Engineering", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 65000 }
      ]
    },
    {
      name: "Government College of Engineering, Jalgaon",
      district: "Jalgaon",
      state: "Maharashtra",
      type: "Government Engineering College",
      latitude: 21.0028,
      longitude: 75.5491,
      description: "Autonomous government institute serving Khandesh region with high academic standards, incubation center, and active placement cell.",
      courses: [
        { name: "B.Tech in Computer Engineering", eligibilityPercentage: 58.0, durationYears: 4, approximateFees: 72000 },
        { name: "B.Tech in Electronics & Telecommunication", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 70000 },
        { name: "B.Tech in Civil Engineering", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 70000 },
        { name: "B.Tech in Mechanical Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 70000 }
      ]
    },
    {
      name: "Government Polytechnic, Pune",
      district: "Pune",
      state: "Maharashtra",
      type: "Government Polytechnic",
      latitude: 18.5362,
      longitude: 73.8346,
      description: "One of the oldest and most prestigious polytechnic colleges in Maharashtra, providing high-employability 3-year diplomas after Class 10.",
      courses: [
        { name: "Diploma in Computer Engineering", eligibilityPercentage: 65.0, durationYears: 3, approximateFees: 8500 },
        { name: "Diploma in Information Technology", eligibilityPercentage: 60.0, durationYears: 3, approximateFees: 8500 },
        { name: "Diploma in Electrical Engineering", eligibilityPercentage: 55.0, durationYears: 3, approximateFees: 8000 },
        { name: "Diploma in Mechanical Engineering", eligibilityPercentage: 55.0, durationYears: 3, approximateFees: 8000 },
        { name: "Diploma in Civil Engineering", eligibilityPercentage: 50.0, durationYears: 3, approximateFees: 8000 }
      ]
    },
    {
      name: "Government Polytechnic, Nanded",
      district: "Nanded",
      state: "Maharashtra",
      type: "Government Polytechnic",
      latitude: 19.1624,
      longitude: 77.3098,
      description: "Premier government polytechnic in Marathwada offering industry-aligned diploma courses with full government fee waivers for eligible categories.",
      courses: [
        { name: "Diploma in Computer Engineering", eligibilityPercentage: 55.0, durationYears: 3, approximateFees: 7800 },
        { name: "Diploma in Mechanical Engineering", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7500 },
        { name: "Diploma in Civil Engineering", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7500 },
        { name: "Diploma in Electrical Engineering", eligibilityPercentage: 48.0, durationYears: 3, approximateFees: 7500 },
        { name: "Diploma in Electronics & Telecommunication", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7500 }
      ]
    },
    {
      name: "Government Polytechnic, Nagpur",
      district: "Nagpur",
      state: "Maharashtra",
      type: "Government Polytechnic",
      latitude: 21.1578,
      longitude: 79.0625,
      description: "Autonomous government polytechnic established in 1914, highly reputed for vocational and engineering diploma excellence in Vidarbha.",
      courses: [
        { name: "Diploma in Computer Engineering", eligibilityPercentage: 60.0, durationYears: 3, approximateFees: 8200 },
        { name: "Diploma in Automobile Engineering", eligibilityPercentage: 48.0, durationYears: 3, approximateFees: 7800 },
        { name: "Diploma in Civil Engineering", eligibilityPercentage: 48.0, durationYears: 3, approximateFees: 7800 },
        { name: "Diploma in Packaging Technology", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7800 }
      ]
    },
    {
      name: "Government Polytechnic, Ratnagiri",
      district: "Ratnagiri",
      state: "Maharashtra",
      type: "Government Polytechnic",
      latitude: 16.9945,
      longitude: 73.3075,
      description: "Government technical institute catering to coastal Konkan students with subsidized technical diplomas and hostel accommodation.",
      courses: [
        { name: "Diploma in Computer Engineering", eligibilityPercentage: 52.0, durationYears: 3, approximateFees: 7500 },
        { name: "Diploma in Mechanical Engineering", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7200 },
        { name: "Diploma in Civil Engineering", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7200 },
        { name: "Diploma in Chemical Engineering", eligibilityPercentage: 46.0, durationYears: 3, approximateFees: 7500 }
      ]
    },
    {
      name: "Government Polytechnic, Solapur",
      district: "Solapur",
      state: "Maharashtra",
      type: "Government Polytechnic",
      latitude: 17.6715,
      longitude: 75.9123,
      description: "Government institute in Solapur known for textile, electrical, and computer technology diploma education for rural students.",
      courses: [
        { name: "Diploma in Computer Technology", eligibilityPercentage: 54.0, durationYears: 3, approximateFees: 7800 },
        { name: "Diploma in Textile Manufacture", eligibilityPercentage: 42.0, durationYears: 3, approximateFees: 7200 },
        { name: "Diploma in Electrical Engineering", eligibilityPercentage: 48.0, durationYears: 3, approximateFees: 7500 },
        { name: "Diploma in Civil Engineering", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7500 }
      ]
    },
    {
      name: "Government Polytechnic, Yavatmal",
      district: "Yavatmal",
      state: "Maharashtra",
      type: "Government Polytechnic",
      latitude: 20.3951,
      longitude: 78.1256,
      description: "Serving agrarian families of Yavatmal with career-focused engineering diplomas and direct job apprentice pathways.",
      courses: [
        { name: "Diploma in Computer Engineering", eligibilityPercentage: 50.0, durationYears: 3, approximateFees: 7200 },
        { name: "Diploma in Mechanical Engineering", eligibilityPercentage: 42.0, durationYears: 3, approximateFees: 7000 },
        { name: "Diploma in Civil Engineering", eligibilityPercentage: 42.0, durationYears: 3, approximateFees: 7000 },
        { name: "Diploma in Electrical Engineering", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 7000 }
      ]
    },
    {
      name: "Government Industrial Training Institute (ITI), Aundh",
      district: "Pune",
      state: "Maharashtra",
      type: "Government ITI / Vocational",
      latitude: 18.5621,
      longitude: 73.8087,
      description: "Top-tier government ITI offering fast-track vocational trades, direct industry apprenticeships, and solar/EV technician certifications.",
      courses: [
        { name: "Electrician Trade Certificate", eligibilityPercentage: 40.0, durationYears: 2, approximateFees: 3200 },
        { name: "Fitter & Machinist Trade", eligibilityPercentage: 38.0, durationYears: 2, approximateFees: 3200 },
        { name: "Solar Technician & Renewable Energy", eligibilityPercentage: 40.0, durationYears: 1, approximateFees: 2800 },
        { name: "Computer Operator and Programming Assistant (COPA)", eligibilityPercentage: 45.0, durationYears: 1, approximateFees: 3000 }
      ]
    },
    {
      name: "Government Industrial Training Institute (ITI), Nanded",
      district: "Nanded",
      state: "Maharashtra",
      type: "Government ITI / Vocational",
      latitude: 19.1450,
      longitude: 77.3150,
      description: "Affordable vocational training for 10th pass rural students with stipend-backed apprenticeships in MIDC industries.",
      courses: [
        { name: "Electrician Trade Certificate", eligibilityPercentage: 38.0, durationYears: 2, approximateFees: 2900 },
        { name: "Mechanic Motor Vehicle (MMV)", eligibilityPercentage: 38.0, durationYears: 2, approximateFees: 2900 },
        { name: "Welder & Fabrication Trade", eligibilityPercentage: 35.0, durationYears: 1, approximateFees: 2500 },
        { name: "COPA (Computer Operator)", eligibilityPercentage: 42.0, durationYears: 1, approximateFees: 2800 }
      ]
    },
    {
      name: "Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri",
      district: "Ahmednagar",
      state: "Maharashtra",
      type: "State Agricultural University",
      latitude: 19.3908,
      longitude: 74.6508,
      description: "Foremost state agricultural university in Western Maharashtra, pioneer in drip irrigation, horticulture, and rural agronomy entrepreneurship.",
      courses: [
        { name: "B.Sc. (Hons) Agriculture", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 26000 },
        { name: "B.Tech in Agricultural Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 38000 },
        { name: "B.Sc. (Hons) Horticulture", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 24000 },
        { name: "Diploma in Agriculture (Krishi Padavika)", eligibilityPercentage: 42.0, durationYears: 2, approximateFees: 12000 }
      ]
    },
    {
      name: "Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola",
      district: "Akola",
      state: "Maharashtra",
      type: "State Agricultural University",
      latitude: 20.7061,
      longitude: 77.0375,
      description: "Prestigious agricultural university catering to Vidarbha farmers and students with subsidized education, organic farming, and agribusiness.",
      courses: [
        { name: "B.Sc. (Hons) Agriculture", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 25000 },
        { name: "B.Tech in Agricultural Engineering", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 36000 },
        { name: "B.Sc. (Hons) Forestry", eligibilityPercentage: 45.0, durationYears: 4, approximateFees: 22000 },
        { name: "Diploma in Agriculture", eligibilityPercentage: 40.0, durationYears: 2, approximateFees: 11000 }
      ]
    },
    {
      name: "Vasantrao Naik Marathwada Krishi Vidyapeeth (VNMKV), Parbhani",
      district: "Parbhani",
      state: "Maharashtra",
      type: "State Agricultural University",
      latitude: 19.2558,
      longitude: 76.7825,
      description: "Dedicated agricultural university in Marathwada delivering specialized programs in drought-resilient crops, agri-food processing, and rural dairy farming.",
      courses: [
        { name: "B.Sc. (Hons) Agriculture", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 25000 },
        { name: "B.Tech in Food Technology", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 35000 },
        { name: "B.Sc. (Hons) Community Science", eligibilityPercentage: 45.0, durationYears: 4, approximateFees: 18000 },
        { name: "Diploma in Agriculture", eligibilityPercentage: 40.0, durationYears: 2, approximateFees: 11000 }
      ]
    },
    {
      name: "Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth (DBSKKV), Dapoli",
      district: "Ratnagiri",
      state: "Maharashtra",
      type: "State Agricultural University",
      latitude: 17.7570,
      longitude: 73.1865,
      description: "Premier coastal agricultural university specialized in coastal horticulture (Mango/Cashew), fisheries, and agro-tourism technologies.",
      courses: [
        { name: "B.Sc. (Hons) Agriculture", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 24000 },
        { name: "Bachelor of Fisheries Science (B.F.Sc.)", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 26000 },
        { name: "B.Tech in Agricultural Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 36000 }
      ]
    },
    {
      name: "Government Medical College & Hospital (GMC), Miraj",
      district: "Sangli",
      state: "Maharashtra",
      type: "Government Medical College",
      latitude: 16.8258,
      longitude: 74.6469,
      description: "Reputed government medical institute in southern Maharashtra with tertiary hospital facilities, low MBBS fees, and nursing training.",
      courses: [
        { name: "MBBS (Bachelor of Medicine & Bachelor of Surgery)", eligibilityPercentage: 60.0, durationYears: 5.5, approximateFees: 115000 },
        { name: "B.Sc. Nursing", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 22000 },
        { name: "Diploma in Medical Laboratory Technology (DMLT)", eligibilityPercentage: 48.0, durationYears: 2, approximateFees: 14000 }
      ]
    },
    {
      name: "Government Medical College (GMC), Latur",
      district: "Latur",
      state: "Maharashtra",
      type: "Government Medical College",
      latitude: 18.4024,
      longitude: 76.5742,
      description: "Premier medical college in Marathwada offering government-subsidized medical, paramedical, and nursing degrees through NEET.",
      courses: [
        { name: "MBBS (Bachelor of Medicine & Bachelor of Surgery)", eligibilityPercentage: 60.0, durationYears: 5.5, approximateFees: 112000 },
        { name: "B.Sc. Nursing", eligibilityPercentage: 48.0, durationYears: 4, approximateFees: 21000 },
        { name: "General Nursing and Midwifery (GNM)", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 12000 }
      ]
    },
    {
      name: "Government Medical College & Hospital, Chhatrapati Sambhajinagar",
      district: "Chhatrapati Sambhajinagar",
      state: "Maharashtra",
      type: "Government Medical College",
      latitude: 19.8988,
      longitude: 75.3125,
      description: "One of Maharashtra's largest government healthcare colleges with specialized hospital wards, paramedical diplomas, and free medical training for qualified students.",
      courses: [
        { name: "MBBS (Bachelor of Medicine & Bachelor of Surgery)", eligibilityPercentage: 62.0, durationYears: 5.5, approximateFees: 118000 },
        { name: "B.Sc. Nursing", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 23000 },
        { name: "Diploma in Medical Laboratory Technology (DMLT)", eligibilityPercentage: 50.0, durationYears: 2, approximateFees: 15000 }
      ]
    },
    {
      name: "Government Medical College (GMC), Nagpur",
      district: "Nagpur",
      state: "Maharashtra",
      type: "Government Medical College",
      latitude: 21.1350,
      longitude: 79.0975,
      description: "Historic government medical college established in 1947, sprawling campus with top medical facilities, subsidized hostel, and high clinical exposure.",
      courses: [
        { name: "MBBS (Bachelor of Medicine & Bachelor of Surgery)", eligibilityPercentage: 65.0, durationYears: 5.5, approximateFees: 120000 },
        { name: "Bachelor of Physiotherapy (B.P.Th)", eligibilityPercentage: 52.0, durationYears: 4.5, approximateFees: 32000 },
        { name: "B.Sc. Nursing", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 22000 }
      ]
    },
    {
      name: "Government College of Pharmacy, Karad",
      district: "Satara",
      state: "Maharashtra",
      type: "Government Pharmacy College",
      latitude: 17.2915,
      longitude: 74.1920,
      description: "Top-ranked government pharmacy college in Maharashtra, training rural students for pharmaceutical research, QA/QC, and community pharmacy.",
      courses: [
        { name: "Bachelor of Pharmacy (B.Pharm)", eligibilityPercentage: 55.0, durationYears: 4, approximateFees: 34000 },
        { name: "Diploma in Pharmacy (D.Pharm)", eligibilityPercentage: 48.0, durationYears: 2, approximateFees: 12000 },
        { name: "Master of Pharmacy (M.Pharm)", eligibilityPercentage: 58.0, durationYears: 2, approximateFees: 42000 }
      ]
    },
    {
      name: "Government College of Pharmacy, Amravati",
      district: "Amravati",
      state: "Maharashtra",
      type: "Government Pharmacy College",
      latitude: 20.9388,
      longitude: 77.7612,
      description: "Autonomous government pharmacy institution in Vidarbha delivering accessible pharmaceutical degrees with full state scholarship support.",
      courses: [
        { name: "Bachelor of Pharmacy (B.Pharm)", eligibilityPercentage: 52.0, durationYears: 4, approximateFees: 32000 },
        { name: "Diploma in Pharmacy (D.Pharm)", eligibilityPercentage: 45.0, durationYears: 2, approximateFees: 11000 }
      ]
    },
    {
      name: "COEP Technological University",
      district: "Pune",
      state: "Maharashtra",
      type: "Autonomous State University",
      latitude: 18.5308,
      longitude: 73.8553,
      description: "Maharashtra's premier technological university, established in 1854. Nationally renowned for high package campus placements and innovative student startups.",
      courses: [
        { name: "B.Tech in Computer Engineering", eligibilityPercentage: 75.0, durationYears: 4, approximateFees: 115000 },
        { name: "B.Tech in Artificial Intelligence & Robotics", eligibilityPercentage: 72.0, durationYears: 4, approximateFees: 120000 },
        { name: "B.Tech in Mechanical Engineering", eligibilityPercentage: 65.0, durationYears: 4, approximateFees: 110000 },
        { name: "B.Tech in Civil Engineering", eligibilityPercentage: 60.0, durationYears: 4, approximateFees: 110000 }
      ]
    },
    {
      name: "Shri Guru Gobind Singhji Institute of Engineering & Technology (SGGSIE&T)",
      district: "Nanded",
      state: "Maharashtra",
      type: "Government-Aided Autonomous Institute",
      latitude: 19.1120,
      longitude: 77.2915,
      description: "Centrally renowned government-aided autonomous institute in Nanded with world-class labs, TEQIP funding, and high campus recruitment.",
      courses: [
        { name: "B.Tech in Computer Science and Engineering", eligibilityPercentage: 60.0, durationYears: 4, approximateFees: 82000 },
        { name: "B.Tech in Information Technology", eligibilityPercentage: 58.0, durationYears: 4, approximateFees: 82000 },
        { name: "B.Tech in Electrical Engineering", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 78000 },
        { name: "B.Tech in Textile Technology", eligibilityPercentage: 45.0, durationYears: 4, approximateFees: 75000 }
      ]
    },
    {
      name: "Walchand College of Engineering",
      district: "Sangli",
      state: "Maharashtra",
      type: "Government-Aided Autonomous Institute",
      latitude: 16.8456,
      longitude: 74.6015,
      description: "Estd 1947, one of western India's most reputed government-aided engineering colleges, producing top engineers and civil servants.",
      courses: [
        { name: "B.Tech in Computer Science and Engineering", eligibilityPercentage: 68.0, durationYears: 4, approximateFees: 85000 },
        { name: "B.Tech in Electronics Engineering", eligibilityPercentage: 58.0, durationYears: 4, approximateFees: 82000 },
        { name: "B.Tech in Civil Engineering", eligibilityPercentage: 52.0, durationYears: 4, approximateFees: 80000 },
        { name: "Diploma in Mechanical Engineering", eligibilityPercentage: 55.0, durationYears: 3, approximateFees: 14000 }
      ]
    },
    {
      name: "Fergusson College (Autonomous)",
      district: "Pune",
      state: "Maharashtra",
      type: "Autonomous Arts and Science College",
      latitude: 18.5236,
      longitude: 73.8415,
      description: "Historic college established by Deccan Education Society, premier hub for Pure Sciences, Economics, Psychology, and Civil Services / UPSC aspirants.",
      courses: [
        { name: "B.Sc. in Computer Science", eligibilityPercentage: 60.0, durationYears: 3, approximateFees: 48000 },
        { name: "B.Sc. in Biotechnology", eligibilityPercentage: 55.0, durationYears: 3, approximateFees: 42000 },
        { name: "B.A. in Political Science & Public Administration", eligibilityPercentage: 50.0, durationYears: 3, approximateFees: 12000 },
        { name: "B.A. in Economics", eligibilityPercentage: 50.0, durationYears: 3, approximateFees: 12000 },
        { name: "B.Sc. in Physics & Mathematics", eligibilityPercentage: 50.0, durationYears: 3, approximateFees: 15000 }
      ]
    },
    {
      name: "KTHM College (Arts, Science and Commerce)",
      district: "Nashik",
      state: "Maharashtra",
      type: "Government-Aided College",
      latitude: 20.0058,
      longitude: 73.7745,
      description: "One of largest multi-faculty colleges in North Maharashtra under MVP Samaj, offering affordable degrees, competitive exam cell, and hostel facilities.",
      courses: [
        { name: "B.Sc. in Computer Science", eligibilityPercentage: 50.0, durationYears: 3, approximateFees: 28000 },
        { name: "B.Com in Banking and Financial Services", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 14000 },
        { name: "B.A. in Marathi & History (Civil Services Wing)", eligibilityPercentage: 40.0, durationYears: 3, approximateFees: 8500 },
        { name: "B.Sc. in Microbiology", eligibilityPercentage: 48.0, durationYears: 3, approximateFees: 18000 }
      ]
    },
    {
      name: "Chhatrapati Shahu Institute of Business Education & Research (SIBER)",
      district: "Kolhapur",
      state: "Maharashtra",
      type: "Autonomous Management & Commerce College",
      latitude: 16.6850,
      longitude: 74.2380,
      description: "Autonomous institute dedicated to commerce, rural management, computer applications, and environment studies in Southern Maharashtra.",
      courses: [
        { name: "Bachelor of Business Administration (BBA)", eligibilityPercentage: 48.0, durationYears: 3, approximateFees: 38000 },
        { name: "Bachelor of Computer Applications (BCA)", eligibilityPercentage: 50.0, durationYears: 3, approximateFees: 42000 },
        { name: "Master of Social Work (MSW) - Rural Development", eligibilityPercentage: 45.0, durationYears: 2, approximateFees: 24000 }
      ]
    },
    {
      name: "Tata Institute of Social Sciences (TISS) Rural Campus",
      district: "Dharashiv",
      state: "Maharashtra",
      type: "Specialized Rural Institute",
      latitude: 18.0125,
      longitude: 76.0750,
      description: "Located in Tuljapur (Dharashiv), renowned for social work, sustainable rural livelihood, rural healthcare administration, and microfinance.",
      courses: [
        { name: "B.A. in Social Work (Rural Development)", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 28000 },
        { name: "M.A. in Sustainable Livelihoods & Natural Resources", eligibilityPercentage: 50.0, durationYears: 2, approximateFees: 35000 },
        { name: "Diploma in Rural Healthcare Assistance", eligibilityPercentage: 40.0, durationYears: 1, approximateFees: 12000 }
      ]
    },
    {
      name: "Yashwantrao Chavan Maharashtra Open University (YCMOU)",
      district: "Nashik",
      state: "Maharashtra",
      type: "State Open University",
      latitude: 20.0245,
      longitude: 73.7128,
      description: "Headquartered in Nashik with study centres in every tehsil, enabling rural students to learn while earning with affordable flexible programs.",
      courses: [
        { name: "B.Sc. in Agri-Business Management", eligibilityPercentage: 40.0, durationYears: 3, approximateFees: 12000 },
        { name: "BCA (Bachelor of Computer Applications)", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 18000 },
        { name: "B.Com in Cooperative Banking", eligibilityPercentage: 40.0, durationYears: 3, approximateFees: 8000 },
        { name: "Diploma in Horticulture & Nursery Management", eligibilityPercentage: 35.0, durationYears: 1, approximateFees: 6000 }
      ]
    },
    {
      name: "Sant Gadge Baba Amravati University Campus",
      district: "Amravati",
      state: "Maharashtra",
      type: "State University Campus",
      latitude: 20.9702,
      longitude: 77.7812,
      description: "State university campus offering postgraduate and professional undergraduate programs for eastern Vidarbha rural districts.",
      courses: [
        { name: "B.Tech in Chemical Technology", eligibilityPercentage: 50.0, durationYears: 4, approximateFees: 45000 },
        { name: "Master of Computer Applications (MCA)", eligibilityPercentage: 50.0, durationYears: 2, approximateFees: 38000 },
        { name: "M.Sc. in Biotechnology", eligibilityPercentage: 50.0, durationYears: 2, approximateFees: 25000 }
      ]
    },
    {
      name: "Dr. Babasaheb Ambedkar Marathwada University (BAMU)",
      district: "Chhatrapati Sambhajinagar",
      state: "Maharashtra",
      type: "State University Campus",
      latitude: 19.8970,
      longitude: 75.3140,
      description: "University offering dedicated coaching and academic departments for rural youth, civil services prep, commerce, and computer science.",
      courses: [
        { name: "M.Sc. in Information Technology", eligibilityPercentage: 50.0, durationYears: 2, approximateFees: 22000 },
        { name: "Master of Social Work (MSW)", eligibilityPercentage: 45.0, durationYears: 2, approximateFees: 14000 },
        { name: "B.Voc in Software Development", eligibilityPercentage: 45.0, durationYears: 3, approximateFees: 18000 }
      ]
    }
  ];

  // Insert Colleges and their Courses
  for (const col of collegesData) {
    const { courses, ...collegeFields } = col;
    const createdCollege = await prisma.college.create({
      data: {
        ...collegeFields,
        courses: {
          create: courses
        }
      }
    });
    console.log(`  ✓ Added College: ${createdCollege.name} (${createdCollege.district}) with ${courses.length} courses`);
  }

  // 2. Seed Realistic Central & Maharashtra Scholarships
  const scholarshipsData = [
    {
      name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojna (EBC)",
      provider: "Directorate of Higher & Technical Education, Maharashtra (MahaDBT)",
      description: "50% tuition and examination fee waiver for students belonging to Economically Backward Class (EBC) pursuing Degree or Diploma professional courses.",
      amount: "50% Tuition Fee Reimbursement (Up to ₹50,000/yr)",
      officialUrl: "https://mahadbt.maharashtra.gov.in/",
      eligibility: {
        maxAnnualIncome: 800000,
        minPercentage: 50.0,
        educationLevels: ["12th Pass", "Diploma", "Undergraduate", "Postgraduate"],
        targetCategories: ["OPEN", "EWS", "General"],
        stateDomicile: "Maharashtra",
        ruleDescription: "Family annual income up to ₹8,00,000 and admission through CAP round."
      },
      documents: [
        "Income Certificate from Tahsildar (Current Financial Year)",
        "Maharashtra Domicile Certificate",
        "CAP Allotment Letter / Admission Confirmation",
        "Previous Year Marksheet (Class 10 / 12 / Diploma)",
        "Aadhaar-seeded Bank Account Passbook",
        "Ration Card copy"
      ]
    },
    {
      name: "Government of India Post-Matric Scholarship for SC Students",
      provider: "Social Justice and Special Assistance Dept, Maharashtra (MahaDBT)",
      description: "100% tuition waiver, exam fees, and monthly maintenance allowance for Scheduled Caste students pursuing post-matriculation courses.",
      amount: "100% Tuition Waiver + Maintenance Allowance (₹550 - ₹1200/month)",
      officialUrl: "https://mahadbt.maharashtra.gov.in/",
      eligibility: {
        maxAnnualIncome: 250000,
        minPercentage: 35.0,
        educationLevels: ["10th Pass", "12th Pass", "ITI", "Diploma", "Undergraduate", "Postgraduate"],
        targetCategories: ["SC", "Neo-Buddhist"],
        stateDomicile: "Maharashtra",
        ruleDescription: "SC category student with annual family income up to ₹2.5 Lakhs."
      },
      documents: [
        "Caste Certificate & Caste Validity Certificate",
        "Income Certificate from Competent Authority",
        "Maharashtra Domicile Certificate",
        "Aadhaar Card with NPCI Bank link",
        "SSC / HSC Marksheet",
        "College Admission Fee Receipt"
      ]
    },
    {
      name: "Post-Matric Scholarship for ST Students (Tribal Development)",
      provider: "Tribal Development Department, Maharashtra (MahaDBT)",
      description: "Full fee reimbursement and hostel maintenance allowance for Scheduled Tribe students in ITI, Polytechnic, Engineering, Medical, and Degree courses.",
      amount: "100% Fees + ₹12,000/year Maintenance + Book Grant",
      officialUrl: "https://mahadbt.maharashtra.gov.in/",
      eligibility: {
        maxAnnualIncome: 250000,
        minPercentage: 35.0,
        educationLevels: ["10th Pass", "12th Pass", "ITI", "Diploma", "Undergraduate", "Postgraduate"],
        targetCategories: ["ST"],
        stateDomicile: "Maharashtra",
        ruleDescription: "ST category student with annual family income up to ₹2.5 Lakhs."
      },
      documents: [
        "Tribe Certificate & Tribe Validity Certificate",
        "Income Certificate from Tahsildar",
        "Aadhaar Card and Domicile",
        "Marksheets of previous examinations",
        "Hostel Certificate (if living in hostel)"
      ]
    },
    {
      name: "Dr. Panjabrao Deshmukh Vastigruh Nirvah Bhatta Yojna",
      provider: "Higher & Technical Education Department, Maharashtra",
      description: "Hostel maintenance allowance for children of registered Alpabhudharak (marginal/small landholder farmers) and agricultural labourers studying in professional colleges.",
      amount: "₹20,000 to ₹30,000 per academic year for hostel/mess",
      officialUrl: "https://mahadbt.maharashtra.gov.in/",
      eligibility: {
        maxAnnualIncome: 800000,
        minPercentage: 50.0,
        educationLevels: ["Diploma", "Undergraduate"],
        targetCategories: ["All (Preference to Small Farmers / Agricultural Labourers)"],
        stateDomicile: "Maharashtra",
        ruleDescription: "Ward of registered small farmer (under 2 hectares) or farm labourer living in hostel."
      },
      documents: [
        "Alpabhudharak Shetkari Certificate (7/12 Extract or Talathi Certificate)",
        "Registered Hostel Residence Certificate / Rent Agreement",
        "Family Income Certificate (< ₹8 LPA)",
        "Maharashtra Domicile Certificate",
        "College ID and Bonafide Certificate"
      ]
    },
    {
      name: "AICTE Pragati Scholarship for Girls (Technical Degree & Diploma)",
      provider: "All India Council for Technical Education (AICTE / NSP)",
      description: "Empowers meritorious young women admitted to AICTE approved technical degree or diploma courses with an annual grant for tuition and equipment.",
      amount: "₹50,000 per year for all years of study",
      officialUrl: "https://scholarships.gov.in/",
      eligibility: {
        maxAnnualIncome: 800000,
        minPercentage: 55.0,
        gender: "Female",
        educationLevels: ["10th Pass", "12th Pass", "Diploma", "Undergraduate"],
        targetCategories: ["Female Students"],
        stateDomicile: "All India / Maharashtra",
        ruleDescription: "Female students admitted to 1st year degree/diploma or 2nd year lateral entry in AICTE approved college, family income < 8 LPA."
      },
      documents: [
        "Class 10 / 12 Marksheet with minimum 55%",
        "Admission Allotment Letter from DTE / CAP",
        "Income Certificate issued by Tahsildar/SDO",
        "Aadhaar Card linked Bank Account",
        "Tuition Fee Receipt of current academic year"
      ]
    },
    {
      name: "AICTE Saksham Scholarship for Specially-Abled Students",
      provider: "AICTE / National Scholarship Portal (NSP)",
      description: "Financial grant for differently-abled students having more than 40% disability admitted to technical diploma or degree courses.",
      amount: "₹50,000 per year towards tuition & assistive aids",
      officialUrl: "https://scholarships.gov.in/",
      eligibility: {
        maxAnnualIncome: 800000,
        minPercentage: 45.0,
        disabilityPercentageMin: 40,
        educationLevels: ["Diploma", "Undergraduate"],
        targetCategories: ["Divyang / Specially-Abled"],
        stateDomicile: "All India / Maharashtra",
        ruleDescription: "Students with >= 40% disability admitted to AICTE approved institutions."
      },
      documents: [
        "Disability Certificate (UDID Card or Civil Surgeon Certificate)",
        "Income Certificate (< ₹8 Lakhs)",
        "Admission Letter & Fee Receipt",
        "Previous Qualifying Exam Marksheet"
      ]
    },
    {
      name: "Central Sector Scheme of Scholarship for College & University Students",
      provider: "Department of Higher Education, Ministry of Education (GoI)",
      description: "Merit-cum-means scholarship awarded to students who are above 80th percentile in Class 12 board exams pursuing regular graduation.",
      amount: "₹12,000/yr for Graduation + ₹20,000/yr for Post-Graduation",
      officialUrl: "https://scholarships.gov.in/",
      eligibility: {
        maxAnnualIncome: 450000,
        minPercentage: 75.0,
        educationLevels: ["12th Pass", "Undergraduate"],
        targetCategories: ["General", "OBC", "SC", "ST", "EWS"],
        stateDomicile: "All India / Maharashtra",
        ruleDescription: "Class 12 score above 80th percentile in State Board/CBSE and family income < ₹4.5 Lakhs."
      },
      documents: [
        "HSC (Class 12) Board Marksheet",
        "Income Certificate from Competent Authority",
        "Aadhaar Card",
        "College Admission Verification Certificate",
        "Active Bank Account Passbook"
      ]
    },
    {
      name: "Savitribai Phule Scholarship for VJNT & SBC Girl Students",
      provider: "Other Backward Bahujan Welfare Department, Maharashtra",
      description: "Special state encouragement stipend for girls from VJNT, SBC, and rural communities continuing secondary and higher education.",
      amount: "₹1,500 to ₹6,000 per year direct allowance",
      officialUrl: "https://mahadbt.maharashtra.gov.in/",
      eligibility: {
        maxAnnualIncome: 300000,
        minPercentage: 40.0,
        gender: "Female",
        educationLevels: ["10th Pass", "12th Pass"],
        targetCategories: ["VJNT", "SBC", "OBC"],
        stateDomicile: "Maharashtra",
        ruleDescription: "Girl students studying in recognized school/junior college belonging to VJNT/SBC/OBC."
      },
      documents: [
        "Caste Certificate (VJNT / SBC / OBC)",
        "School / College Bonafide Certificate",
        "Previous Class Marksheet",
        "Aadhaar Card and Student Bank Passbook"
      ]
    },
    {
      name: "Tata Trusts Means Grant & Technical Education Scholarship",
      provider: "Tata Trusts India",
      description: "Need-based grant support for underprivileged rural students pursuing undergraduate degrees in engineering, agriculture, healthcare, and sciences.",
      amount: "₹20,000 to ₹50,000 direct tuition assistance",
      officialUrl: "https://www.tatatrusts.org/",
      eligibility: {
        maxAnnualIncome: 500000,
        minPercentage: 55.0,
        educationLevels: ["Diploma", "Undergraduate"],
        targetCategories: ["Rural Students", "Low Income", "Marginal Farmers"],
        stateDomicile: "All India / Maharashtra",
        ruleDescription: "Undergraduate student from rural/agrarian background with verifiable financial distress."
      },
      documents: [
        "Family Income Certificate or BPL Ration Card",
        "College Fee Structure & Receipts",
        "Class 10, 12, or Diploma Transcripts",
        "Statement of Purpose (Handwritten or typed)",
        "Bank Account Details"
      ]
    }
  ];

  for (const s of scholarshipsData) {
    const createdScholarship = await prisma.scholarship.create({
      data: {
        name: s.name,
        provider: s.provider,
        description: s.description,
        amount: s.amount,
        officialUrl: s.officialUrl,
        eligibility: s.eligibility,
        documents: s.documents
      }
    });
    console.log(`  ✓ Added Scholarship: ${createdScholarship.name}`);
  }

  const collegeCount = await prisma.college.count();
  const courseCount = await prisma.collegeCourse.count();
  const scholarshipCount = await prisma.scholarship.count();

  console.log(`\n🎉 Seed completed successfully!`);
  console.log(`📊 Total Colleges: ${collegeCount}`);
  console.log(`📊 Total Courses: ${courseCount}`);
  console.log(`📊 Total Scholarships: ${scholarshipCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
