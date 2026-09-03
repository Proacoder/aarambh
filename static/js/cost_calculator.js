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
  
  if (collegeSelect) {
    collegeSelect.innerHTML = COLLEGES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }
  
  try {
    const dRes = await fetch('/api/districts');
    if (dRes.ok) {
      const districts = await dRes.json();
      if (districtSelect && Array.isArray(districts)) {
        districtSelect.innerHTML = districts.map(d => `<option value="${d}">${d}</option>`).join('');
      }
    }
  } catch (e) {
    console.error('Failed to load districts', e);
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

  function renderCostBar(label, amount, maxAmount, color) {
    const pct = Math.min(100, (amount / maxAmount) * 100);
    return `
      <div class="cost-bar-row mb-2">
        <div class="flex-between mb-1">
          <span class="text-small">${label}</span>
          <span class="text-small" style="font-weight:600">₹${amount.toLocaleString('en-IN')}</span>
        </div>
        <div style="background:var(--bg-card);border-radius:6px;height:12px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:6px;transition:width 0.8s ease"></div>
        </div>
      </div>
    `;
  }

  // Calculate Mock Logic
  function calculateMock(data) {
    // Generate dummy breakdown
    const tuition = 45000;
    const hostel = data.accommodation === 'pgRoom' ? 60000 : 30000;
    const food = data.food === 'selfCooking' ? 25000 : 40000;
    const travel = 5000;
    const misc = 10000;
    
    const gross = tuition + hostel + food + travel + misc;
    let scholarship = 0;
    const matchedScholarships = [];
    
    if (data.category !== 'OPEN' || data.income <= 800000) {
      scholarship += tuition * 0.5; // 50% tuition off
      matchedScholarships.append({ name: "Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna", amount: `₹${(tuition*0.5).toLocaleString('en-IN')} (50% Tuition)` });
    }
    if (data.category === 'SC' || data.category === 'ST') {
      scholarship += tuition * 0.5; // remaining 50%
      matchedScholarships.push({ name: "Government of India Post-Matric Scholarship", amount: `₹${(tuition*0.5).toLocaleString('en-IN')} (Full Tuition)` });
    }
    if (data.accommodation === 'govtHostel') {
      matchedScholarships.push({ name: "Dr. Panjabrao Deshmukh Hostel Maintenance Allowance", amount: "₹30,000/yr" });
      scholarship += 30000;
    }
    
    const net = Math.max(0, gross - scholarship);
    const monthly = Math.round(net / 12);
    const incomePct = data.income > 0 ? Math.round((net / data.income) * 100) : 0;
    
    const maxAmount = Math.max(tuition, hostel, food, travel, misc);
    const breakdown = [
      { label: "Tuition Fees", amount: tuition, color: "#4F7A45" },
      { label: "Accommodation", amount: hostel, color: "#D9A441" },
      { label: "Food & Mess", amount: food, color: "#4F6FAF" },
      { label: "Local Travel", amount: travel, color: "#8E5F7B" },
      { label: "Books & Misc", amount: misc, color: "#A87A5B" }
    ];
    
    const cname = document.getElementById('cost-college').options[document.getElementById('cost-college').selectedIndex]?.text || "Target College";
    
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
      matchedScholarships: matchedScholarships.length ? matchedScholarships : [{ name: "No specific schemes matched", amount: "" }]
    };
  }

  const calcBtn = document.getElementById('calculate-btn');
  if (calcBtn) {
    calcBtn.addEventListener('click', async () => {
      const payload = {
        homeDistrict: document.getElementById('cost-home-district').value,
        collegeId: document.getElementById('cost-college').value,
        accommodation: document.getElementById('cost-accommodation').value,
        food: document.getElementById('cost-food').value,
        income: parseFloat(document.getElementById('cost-income').value || 0),
        category: document.getElementById('cost-category').value
      };

      // Try API, fallback to mock
      let result;
      try {
        const res = await fetch('/api/cost-calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          result = await res.json();
        } else {
          result = calculateMock(payload);
        }
      } catch (e) {
        result = calculateMock(payload);
      }

      // Render Results
      const resSection = document.getElementById('cost-results');
      resSection.classList.remove('hidden');
      
      document.getElementById('cost-college-name').textContent = result.collegeName;
      document.getElementById('cost-tier-badge').textContent = result.tier;
      document.getElementById('cost-route').textContent = result.route;
      
      document.getElementById('cost-net-annual').textContent = `₹${result.netAnnual.toLocaleString('en-IN')}`;
      document.getElementById('cost-gross').textContent = `₹${result.gross.toLocaleString('en-IN')}`;
      document.getElementById('cost-scholarship').textContent = `-₹${result.scholarshipTotal.toLocaleString('en-IN')}`;
      document.getElementById('cost-net').textContent = `₹${result.netAnnual.toLocaleString('en-IN')}`;
      document.getElementById('cost-monthly').textContent = `₹${result.monthly.toLocaleString('en-IN')}`;
      
      const pctEl = document.getElementById('cost-income-pct');
      pctEl.textContent = `${result.incomePct}%`;
      
      const maxAmount = Math.max(...result.breakdown.map(b => b.amount));
      document.getElementById('cost-bars').innerHTML = result.breakdown.map(b => 
        renderCostBar(b.label, b.amount, maxAmount, b.color)
      ).join('');
      
      const msgEl = document.getElementById('affordability-msg');
      if (result.incomePct < 25) {
        msgEl.textContent = "✅ This option looks quite affordable for your family budget.";
        msgEl.style.backgroundColor = "rgba(79, 122, 69, 0.1)";
        msgEl.style.color = "var(--success)";
      } else if (result.incomePct <= 40) {
        msgEl.textContent = "⚠️ This will require careful financial planning.";
        msgEl.style.backgroundColor = "rgba(217, 164, 65, 0.1)";
        msgEl.style.color = "var(--warning)";
      } else {
        msgEl.textContent = "🚨 This is a high burden. We strongly suggest looking at govt colleges or applying for more scholarships.";
        msgEl.style.backgroundColor = "rgba(184, 87, 60, 0.1)";
        msgEl.style.color = "var(--terracotta)";
      }
      
      document.getElementById('cost-scholarship-list').innerHTML = result.matchedScholarships.map(s => `
        <div class="flex-between mb-2" style="padding:0.75rem;background:var(--bg-card);border-radius:8px;border:1px solid var(--border)">
          <span style="font-weight:600">${s.name}</span>
          <span class="badge badge-gold">${s.amount}</span>
        </div>
      `).join('');
      
      resSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
});
