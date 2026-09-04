document.addEventListener('DOMContentLoaded', async () => {
  const COLLEGES = [
    {"id": "clg-gp-nashik", "name": "Government Polytechnic, Nashik"},
    {"id": "clg-kkwagh-nashik", "name": "K. K. Wagh Institute of Engineering Education & Research"},
    {"id": "clg-giti-nashik", "name": "Government Industrial Training Institute (ITI), Nashik"},
    {"id": "clg-ndmvp-pharmacy-nashik", "name": "NDMVP Samaj's College of Pharmacy"},
    {"id": "clg-agri-nashik", "name": "K.K. Wagh College of Agriculture"},
    {"id": "clg-snjb-nashik", "name": "SNJB's Late Sau. KB Jain College of Engineering, Chandwad"},
    {"id": "clg-gp-pune", "name": "Government Polytechnic, Pune"},
    {"id": "clg-giti-aundh-pune", "name": "Government ITI, Aundh, Pune"},
    {"id": "clg-coep-pune", "name": "College of Engineering Pune Technological University (COEP)"},
    {"id": "clg-aissms-pharmacy-pune", "name": "AISSMS College of Pharmacy"},
    {"id": "clg-agri-pune", "name": "College of Agriculture, Pune"},
    {"id": "clg-dypatil-pune", "name": "Dr. D.Y. Patil Institute of Technology, Pimpri"},
    {"id": "clg-gp-kolhapur", "name": "Government Polytechnic, Kolhapur"},
    {"id": "clg-giti-kolhapur", "name": "Government ITI, Kolhapur"},
    {"id": "clg-rit-kolhapur", "name": "Rajaram Bapu Institute of Technology"},
    {"id": "clg-bvp-pharmacy-kolhapur", "name": "Bharati Vidyapeeth College of Pharmacy"},
    {"id": "clg-agri-kolhapur", "name": "College of Agriculture, Kolhapur"},
    {"id": "clg-csiber-kolhapur", "name": "CSIBER Kolhapur"},
    {"id": "clg-gp-nagpur", "name": "Government Polytechnic, Nagpur"},
    {"id": "clg-giti-nagpur", "name": "Government ITI, Nagpur"},
    {"id": "clg-vnit-nagpur", "name": "Visvesvaraya National Institute of Technology (VNIT)"},
    {"id": "clg-pharma-nagpur", "name": "Department of Pharmaceutical Sciences, RTMNU"},
    {"id": "clg-agri-nagpur", "name": "College of Agriculture, Nagpur"},
    {"id": "clg-ramdeobaba-nagpur", "name": "Shri Ramdeobaba College of Engineering and Management"},
    {"id": "clg-gp-sambhajinagar", "name": "Government Polytechnic, Chhatrapati Sambhajinagar"},
    {"id": "clg-giti-sambhajinagar", "name": "Government ITI, Chhatrapati Sambhajinagar"},
    {"id": "clg-gcoe-sambhajinagar", "name": "Government College of Engineering, Chhatrapati Sambhajinagar"},
    {"id": "clg-gcop-sambhajinagar", "name": "Government College of Pharmacy, Chhatrapati Sambhajinagar"},
    {"id": "clg-agri-badnapur", "name": "College of Agriculture, Badnapur"},
    {"id": "clg-jnec-sambhajinagar", "name": "Jawaharlal Nehru Engineering College (JNEC)"}
  ];

  // 1. Fetch districts and populate dropdown
  const districtSelect = document.getElementById('cost-home-district');
  const collegeSelect = document.getElementById('cost-college');
  
  if (collegeSelect && collegeSelect.options.length <= 1) {
    collegeSelect.innerHTML = COLLEGES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }
  
  try {
    const dRes = await fetch('/api/districts');
    if (dRes.ok) {
      const districts = await dRes.json();
      if (districtSelect && Array.isArray(districts) && districts.length > 0) {
        districtSelect.innerHTML = districts.map(d => `<option value="${d}">${d}</option>`).join('');
      }
    }
  } catch (e) {
    console.warn('Using default districts list', e);
  }

  // Pre-fill profile details
  try {
    const pRes = await fetch('/api/profile');
    if (pRes.ok) {
      const profile = await pRes.json();
      if (profile && profile.district && districtSelect) {
        districtSelect.value = profile.district;
      }
      if (profile && profile.income) {
        const incomeInput = document.getElementById('cost-income');
        if (incomeInput) incomeInput.value = profile.income;
      }
      if (profile && profile.category) {
        const catSelect = document.getElementById('cost-category');
        if (catSelect) {
          const match = Array.from(catSelect.options).find(o => o.value.includes(profile.category) || profile.category.includes(o.value));
          if (match) catSelect.value = match.value;
        }
      }
    }
  } catch (e) {
    console.warn('No profile found to prefill', e);
  }

  function fmt(val) {
    const num = Number(val);
    return isNaN(num) ? '0' : num.toLocaleString('en-IN');
  }

  function renderCostBar(label, amount, maxAmount, color) {
    const safeMax = Math.max(1, maxAmount);
    const safeAmt = Number(amount) || 0;
    const pct = Math.min(100, Math.round((safeAmt / safeMax) * 100));
    return `
      <div class="cost-bar-row mb-2">
        <div class="flex-between mb-1">
          <span class="text-small">${label}</span>
          <span class="text-small" style="font-weight:600">₹${fmt(safeAmt)}</span>
        </div>
        <div style="background:var(--bg-card);border-radius:6px;height:12px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:6px;transition:width 0.8s ease"></div>
        </div>
      </div>
    `;
  }

  // Calculate Mock Logic (Client-side fallback)
  function calculateMock(data) {
    const tuition = 45000;
    const hostel = data.accommodation === 'pgRoom' ? 60000 : 30000;
    const food = data.food === 'selfCooking' ? 25000 : 40000;
    const travel = 5000;
    const misc = 10000;
    
    const gross = tuition + hostel + food + travel + misc;
    let scholarship = 0;
    const matchedScholarships = [];
    
    if (data.category !== 'OPEN' || data.income <= 800000) {
      scholarship += tuition * 0.5;
      matchedScholarships.push({ name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna", amount: `₹${fmt(tuition * 0.5)} (50% Tuition Aid)` });
    }
    if (data.category === 'SC' || data.category === 'ST') {
      scholarship += tuition * 0.5;
      matchedScholarships.push({ name: "Government of India Post-Matric Scholarship", amount: `₹${fmt(tuition * 0.5)} (Full Tuition Aid)` });
    }
    if (data.accommodation === 'govtHostel') {
      matchedScholarships.push({ name: "Dr. Panjabrao Deshmukh Hostel Maintenance Allowance", amount: "₹30,000/yr" });
      scholarship += 30000;
    }
    
    const net = Math.max(0, gross - scholarship);
    const monthly = Math.round(net / 12);
    const incomePct = data.income > 0 ? Math.round((net / data.income) * 100) : 0;
    
    const breakdown = [
      { label: "Tuition Fees", amount: tuition, color: "#4F7A45" },
      { label: "Accommodation", amount: hostel, color: "#D9A441" },
      { label: "Food & Mess", amount: food, color: "#4F6FAF" },
      { label: "Local Travel", amount: travel, color: "#8E5F7B" },
      { label: "Books & Misc", amount: misc, color: "#A87A5B" }
    ];
    
    const clgEl = document.getElementById('cost-college');
    const cname = clgEl?.options[clgEl.selectedIndex]?.text || "Target College";
    
    return {
      netAnnual: net,
      gross: gross,
      scholarshipTotal: scholarship,
      monthly: monthly,
      incomePct: incomePct,
      collegeName: cname,
      route: `${data.homeDistrict} to College City`,
      tier: "Govt / Aided",
      breakdown: breakdown,
      matchedScholarships: matchedScholarships.length ? matchedScholarships : [{ name: "No specific government schemes matched", amount: "Standard Fees Apply" }]
    };
  }

  function renderResults(result) {
    const resSection = document.getElementById('cost-results');
    if (!resSection || !result) return;

    // Show results section
    resSection.classList.remove('hidden');

    // 1. College Header
    const clgNameEl = document.getElementById('cost-college-name');
    if (clgNameEl) clgNameEl.textContent = result.collegeName || "Target College";

    const tierBadgeEl = document.getElementById('cost-tier-badge');
    if (tierBadgeEl) {
      tierBadgeEl.textContent = result.tier || "Govt / Aided";
      tierBadgeEl.style.display = "inline-block";
    }

    const routeEl = document.getElementById('cost-route');
    if (routeEl) routeEl.textContent = result.route || "Local Commute";

    // 2. Totals
    const netAnnualEl = document.getElementById('cost-net-annual');
    if (netAnnualEl) netAnnualEl.textContent = `₹${fmt(result.netAnnual)}`;

    const grossEl = document.getElementById('cost-gross');
    if (grossEl) grossEl.textContent = `₹${fmt(result.gross)}`;

    const schEl = document.getElementById('cost-scholarship');
    if (schEl) schEl.textContent = `-₹${fmt(result.scholarshipTotal)}`;

    const netEl = document.getElementById('cost-net');
    if (netEl) netEl.textContent = `₹${fmt(result.netAnnual)}`;

    // 3. Family Impact
    const monthlyEl = document.getElementById('cost-monthly');
    if (monthlyEl) monthlyEl.textContent = `₹${fmt(result.monthly)}`;

    const pctEl = document.getElementById('cost-income-pct');
    if (pctEl) pctEl.textContent = `${result.incomePct || 0}%`;

    // 4. Breakdown Bars
    const breakdown = Array.isArray(result.breakdown) && result.breakdown.length > 0
      ? result.breakdown
      : [
          { label: "Tuition Fees", amount: 45000, color: "#4F7A45" },
          { label: "Accommodation", amount: 30000, color: "#D9A441" },
          { label: "Food & Mess", amount: 35000, color: "#4F6FAF" },
          { label: "Travel & Misc", amount: 15000, color: "#8E5F7B" }
        ];

    const amounts = breakdown.map(b => Number(b.amount) || 0);
    const maxAmount = Math.max(1, ...amounts);

    const barsContainer = document.getElementById('cost-bars');
    if (barsContainer) {
      barsContainer.innerHTML = breakdown.map(b =>
        renderCostBar(b.label, Number(b.amount) || 0, maxAmount, b.color || '#4F7A45')
      ).join('');
    }

    // 5. Affordability message
    const msgEl = document.getElementById('affordability-msg');
    if (msgEl) {
      const pct = Number(result.incomePct) || 0;
      if (pct < 25) {
        msgEl.textContent = "✅ This option looks quite affordable for your family budget.";
        msgEl.style.backgroundColor = "rgba(79, 122, 69, 0.12)";
        msgEl.style.color = "var(--success)";
      } else if (pct <= 40) {
        msgEl.textContent = "⚠️ This will require careful financial planning & budgeting.";
        msgEl.style.backgroundColor = "rgba(217, 164, 65, 0.15)";
        msgEl.style.color = "var(--warning)";
      } else {
        msgEl.textContent = "🚨 High financial burden. We strongly suggest looking at govt polytechnics or applying for hostel subsidies.";
        msgEl.style.backgroundColor = "rgba(184, 87, 60, 0.12)";
        msgEl.style.color = "var(--terracotta)";
      }
    }

    // 6. Matched Scholarships list
    const schList = document.getElementById('cost-scholarship-list');
    if (schList) {
      const schemes = (Array.isArray(result.matchedScholarships) && result.matchedScholarships.length > 0)
        ? result.matchedScholarships
        : [{ name: "No specific government schemes matched", amount: "Standard Fees" }];

      schList.innerHTML = schemes.map(s => `
        <div class="flex-between align-center mb-2 p-3" style="background:var(--bg-card);border-radius:8px;border:1px solid var(--border-light)">
          <span style="font-weight:600;font-size:0.9rem">${s.name || "Government Scholarship Scheme"}</span>
          <span class="badge badge-gold" style="font-size:0.75rem">${s.amount || "Tuition Aid"}</span>
        </div>
      `).join('');
    }

    // Smooth scroll down to results
    resSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const calcBtn = document.getElementById('calculate-btn');
  if (calcBtn) {
    calcBtn.addEventListener('click', async (e) => {
      if (e) e.preventDefault();

      const originalText = calcBtn.innerHTML;
      calcBtn.disabled = true;
      calcBtn.innerHTML = '<span>⏳ Calculating Expenses...</span>';

      const homeDistrict = document.getElementById('cost-home-district')?.value || 'Pune';
      const clgSelect = document.getElementById('cost-college');
      const collegeId = clgSelect?.value || 'clg-gp-pune';
      const collegeSelectedText = clgSelect?.options[clgSelect.selectedIndex]?.text || "Government Polytechnic, Pune";

      const accommodation = document.getElementById('cost-accommodation')?.value || 'govtHostel';
      const food = document.getElementById('cost-food')?.value || 'collegeMess';
      const incomeInputVal = document.getElementById('cost-income')?.value;
      const income = parseFloat(incomeInputVal || 150000) || 150000;
      const category = document.getElementById('cost-category')?.value || 'OPEN';

      const payload = {
        homeDistrict,
        collegeId,
        accommodation,
        accommodationType: accommodation,
        food,
        foodType: food,
        income,
        familyIncome: income,
        category
      };

      let result;
      try {
        const res = await fetch('/api/cost-calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const apiRes = await res.json();
          if (apiRes && (apiRes.totals || apiRes.netAnnual)) {
            const colors = ["#4F7A45", "#D9A441", "#4F6FAF", "#8E5F7B", "#A87A5B", "#6B5744", "#3D2B1F", "#E0D5C8"];
            let bidx = 0;
            const bdown = [];
            const bSource = apiRes.breakdown || {};
            for (const [key, val] of Object.entries(bSource)) {
              bdown.push({
                label: val.label || key,
                amount: typeof val.annual === 'number' ? val.annual : (typeof val === 'number' ? val : 0),
                color: colors[bidx % colors.length]
              });
              bidx++;
            }

            const matchedSch = (apiRes.matchedScholarships || []).map(s => ({
              name: s.name || s.title || "Scholarship Scheme",
              amount: s.benefit || s.amount || "Tuition Aid"
            }));

            const totals = apiRes.totals || {};
            const college = apiRes.college || {};
            const familyImpact = apiRes.familyImpact || {};

            result = {
              netAnnual: totals.netAnnual ?? apiRes.netAnnual ?? 0,
              gross: totals.grossAnnual ?? apiRes.gross ?? 0,
              scholarshipTotal: totals.scholarshipDeduction ?? apiRes.scholarshipTotal ?? 0,
              monthly: totals.netMonthly ?? apiRes.monthly ?? 0,
              incomePct: familyImpact.incomePercentage ?? apiRes.incomePct ?? 20,
              collegeName: college.name || apiRes.collegeName || collegeSelectedText,
              route: apiRes.route || `${apiRes.homeDistrict || homeDistrict} to ${college.district || 'College City'} (${apiRes.distanceKm || 15} km)`,
              tier: apiRes.costTier || apiRes.tier || "Govt / Aided",
              breakdown: bdown.length ? bdown : calculateMock(payload).breakdown,
              matchedScholarships: matchedSch.length ? matchedSch : [{ name: "No specific government schemes matched", amount: "Standard Fees" }]
            };
          } else {
            result = calculateMock(payload);
          }
        } else {
          result = calculateMock(payload);
        }
      } catch (err) {
        console.warn("Using fallback calculation:", err);
        result = calculateMock(payload);
      } finally {
        calcBtn.disabled = false;
        calcBtn.innerHTML = originalText;
      }

      // Render the normalized result
      try {
        renderResults(result);
      } catch (renderErr) {
        console.error("Render error:", renderErr);
        // Fallback render
        renderResults(calculateMock(payload));
      }
    });
  }
});
