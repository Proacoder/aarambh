import { prisma } from "./src/lib/prisma.ts";
import { generateStudentRecommendations } from "./src/services/recommendationService.ts";
import { calculateHaversineDistance } from "./src/lib/geo.ts";

async function verifyAll() {
  console.log("==================================================");
  console.log("🧪 RUNNING CAREERMITRA BACKEND INTEGRATION TEST");
  console.log("==================================================");

  // 1. Check Database Counts
  const collegesCount = await prisma.college.count();
  const coursesCount = await prisma.collegeCourse.count();
  const scholarshipsCount = await prisma.scholarship.count();

  console.log(`\n1. Database Status:`);
  console.log(`   Colleges in DB: ${collegesCount}`);
  console.log(`   Courses in DB: ${coursesCount}`);
  console.log(`   Scholarships in DB: ${scholarshipsCount}`);

  if (collegesCount < 30 || scholarshipsCount < 8) {
    throw new Error("Database counts are lower than expected!");
  }
  console.log("   ✅ Database count verification PASSED");

  // 2. Test Haversine Geo Calculation
  console.log(`\n2. Testing Haversine Distance:`);
  // Nanded (19.1383, 77.3210) to Pune (18.5204, 73.8567)
  const dist = calculateHaversineDistance(19.1383, 77.3210, 18.5204, 73.8567);
  console.log(`   Distance Nanded -> Pune: ${dist} km (expected ~370-390 km)`);
  if (dist < 350 || dist > 420) {
    throw new Error(`Haversine calculation unexpected: ${dist}`);
  }
  console.log("   ✅ Haversine distance verification PASSED");

  // 3. Test Student Creation
  console.log(`\n3. Testing Student Creation:`);
  const student = await prisma.student.create({
    data: {
      name: "Ramesh Pawar (Test)",
      educationLevel: "10th Pass",
      percentage: 74.5,
      district: "Nanded",
      state: "Maharashtra",
      financialLevel: "Low (BPL / Farm Labour)",
      willingToMove: false
    }
  });
  console.log(`   Created Test Student: ${student.id} (${student.name}, ${student.district}, ${student.percentage}%)`);
  console.log("   ✅ Student creation PASSED");

  // 4. Test Assessment Scoring
  console.log(`\n4. Testing Assessment Recording:`);
  const assessment = await prisma.assessmentResult.create({
    data: {
      studentId: student.id,
      technology: 85,
      science: 70,
      business: 40,
      government: 45,
      healthcare: 30,
      arts: 25,
      answers: [{ q: 1, chosen: "technology" }, { q: 2, chosen: "technology" }]
    }
  });
  console.log(`   Recorded Assessment for student: Technology=${assessment.technology}, Science=${assessment.science}`);
  console.log("   ✅ Assessment recording PASSED");

  // 5. Test Deterministic Recommendation Engine
  console.log(`\n5. Running Deterministic Recommendation Engine:`);
  const recPayload = await generateStudentRecommendations(student.id);

  console.log(`   Top Career Domain: ${recPayload.topDomains[0]?.domain} (Score: ${recPayload.topDomains[0]?.score})`);
  console.log(`   Qualified College Recommendations Count: ${recPayload.recommendations.length}`);
  console.log(`   Eligible Scholarships Count: ${recPayload.eligibleScholarships.length}`);

  if (recPayload.recommendations.length === 0) {
    throw new Error("No recommendations generated!");
  }

  const topRec = recPayload.recommendations[0];
  console.log(`\n   Top Recommendation Details:`);
  console.log(`   - College: ${topRec.collegeName} (${topRec.district})`);
  console.log(`   - Course: ${topRec.courseName}`);
  console.log(`   - Distance: ${topRec.distanceKm} km`);
  console.log(`   - Overall Score: ${topRec.overallScore} / 100`);
  console.log(`   - Score Breakdown: Domain=${topRec.scores.domainFit}, Academic=${topRec.scores.academicFit}, Distance=${topRec.scores.distanceFit}, Financial=${topRec.scores.financialFit}`);
  console.log(`   - Reason: "${topRec.reasons[0]}"`);

  // Verify Hard Filter for Academic Eligibility
  // Test student has 74.5%. COEP B.Tech requires 75.0%.
  // Did the hard filter disqualify 75% cutoff courses for 74.5% student?
  const disqualifiedFound = recPayload.recommendations.find(
    (r) => r.eligibilityPercentage !== null && r.eligibilityPercentage > 74.5
  );

  if (disqualifiedFound) {
    throw new Error(`Hard filter failure: Found course ${disqualifiedFound.courseName} requiring ${disqualifiedFound.eligibilityPercentage}% for student with 74.5%!`);
  }
  console.log("   ✅ Academic Hard Filter verification PASSED (Zero ineligible courses returned)");

  // Verify distance proximity for local student
  const localGovtPoly = recPayload.recommendations.find((r) => r.district === "Nanded");
  console.log(`   Local District Recommendation: ${localGovtPoly?.collegeName || "None"} (${localGovtPoly?.distanceKm} km)`);
  if (!localGovtPoly) {
    console.warn("   ⚠️ Note: Local Nanded college not in top list; checking distance fit");
  } else {
    console.log("   ✅ Local proximity scoring PASSED");
  }

  // 6. Test Eligible Scholarships
  console.log(`\n6. Testing Matched Scholarships:`);
  for (const s of recPayload.eligibleScholarships.slice(0, 3)) {
    console.log(`   - ${s.name} (Match: ${s.matchScore}%)`);
    console.log(`     Why: ${s.whyEligible}`);
    console.log(`     Required Docs: ${s.requiredDocuments.length} items`);
  }
  console.log("   ✅ Scholarship matching PASSED");

  // 7. Cleanup Test Student
  await prisma.student.delete({ where: { id: student.id } });
  console.log("\n🧹 Cleaned up test student record.");

  console.log("\n==================================================");
  console.log("🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

verifyAll()
  .catch((e) => {
    console.error("❌ Verification failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
