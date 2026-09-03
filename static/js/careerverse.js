/**
 * AARAMBH - 3D Careerverse Cosmos Engine
 * Powered by Three.js WebGL: orbital starfield, career constellations, raycasting
 */

(function() {
  const container = document.getElementById('careerverse-webgl-container');
  if (!container || !window.THREE) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b14, 0.0018);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 30, 110);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xd9a441, 2, 200);
  pointLight.position.set(0, 20, 20);
  scene.add(pointLight);

  // 1. Starfield Particles (1500 background stars)
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPos = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i += 3) {
    starPos[i] = (Math.random() - 0.5) * 400;
    starPos[i + 1] = (Math.random() - 0.5) * 300;
    starPos[i + 2] = (Math.random() - 0.5) * 400;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    transparent: true,
    opacity: 0.75
  });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // 2. Career Nodes Data (Bilingual)
  const careerNodesData = [
    // Tech & Engineering (Blue/Cyan)
    { id: 'c1', name: 'Software Developer', nameMr: 'सॉफ्टवेअर डेव्हलपर', domain: 'tech', cluster: 'Tech & Engineering', clusterMr: 'तंत्रज्ञान व अभियांत्रिकी', color: 0x38bdf8, pos: [-35, 15, -10], salary: '₹4.5 - 9.0 LPA', edu: 'B.E. / BCA / Polytechnic Diploma', eduMr: 'बी.ई. / बीसीए / पॉलिटेक्निक डिप्लोमा', desc: 'Build web applications, cloud systems, and AI models for Maharashtra startups.', descMr: 'वेब ॲप्लिकेशन्स, क्लाउड सिस्टीम आणि सॉफ्टवेअर तयार करा.' },
    { id: 'c2', name: 'Embedded IoT Engineer', nameMr: 'इंबेडेड आयओटी इंजिनिअर', domain: 'tech', cluster: 'Tech & Engineering', clusterMr: 'तंत्रज्ञान व अभियांत्रिकी', color: 0x38bdf8, pos: [-25, 25, 10], salary: '₹4.0 - 7.5 LPA', edu: 'Diploma in Electronics / E&TC', eduMr: 'इलेक्ट्रॉनिक्स / ई अँड टीसी डिप्लोमा', desc: 'Design microcontrollers and smart hardware for automotive & manufacturing plants.', descMr: 'मायक्रो-कंट्रोलर आणि स्मार्ट इलेक्ट्रॉनिक्स डिझाईन करा.' },
    { id: 'c3', name: 'Mechanical CAD Designer', nameMr: 'मॅकेनिकल कॅड डिझायनर', domain: 'tech', cluster: 'Tech & Engineering', clusterMr: 'तंत्रज्ञान व अभियांत्रिकी', color: 0x38bdf8, pos: [-40, 5, 20], salary: '₹3.2 - 5.5 LPA', edu: 'Diploma in Mechanical / ITI Draughtsman', eduMr: 'मॅकेनिकल डिप्लोमा / आयटीआय ड्राफ्ट्समन', desc: 'Draft 3D parts and precision assemblies for Pune & Chakan industrial clusters.', descMr: '३डी भाग आणि औद्योगिक डिझाईन्स तयार करा.' },

    // Agri-Tech (Emerald Green)
    { id: 'c4', name: 'Precision Farming Specialist', nameMr: 'स्मार्ट कृषी तंत्रज्ञान तज्ज्ञ', domain: 'agri', cluster: 'Agri-Tech & Biotech', clusterMr: 'कृषी व जैवतंत्रज्ञान', color: 0x34d399, pos: [30, 20, -15], salary: '₹3.6 - 6.5 LPA', edu: 'B.Sc. Agriculture / Agri-Diploma', eduMr: 'बी.एससी. कृषी / कृषी डिप्लोमा', desc: 'Deploy automated drip irrigation, drone soil sensing, and climate telemetry.', descMr: 'ठिबक सिंचन, ड्रोन माती चाचणी आणि आधुनिक शेती तंत्रज्ञान वापरा.' },
    { id: 'c5', name: 'Solar Agripump Technician', nameMr: 'सोलर पंप व सौर ऊर्जा तंत्रज्ञ', domain: 'agri', cluster: 'Agri-Tech & Biotech', clusterMr: 'कृषी व जैवतंत्रज्ञान', color: 0x34d399, pos: [40, 8, 15], salary: '₹2.8 - 4.8 LPA', edu: 'ITI Electrician / Solar Tech Cert', eduMr: 'आयटीआय इलेक्ट्रिशियन / सोलर प्रमाणपत्र', desc: 'Install and service PM-KUSUM solar pumps and solar microgrids across villages.', descMr: 'गावागावात सोलर पंप व सौर ऊर्जा प्रकल्प बसवा व दुरुस्त करा.' },

    // Healthcare (Coral/Red)
    { id: 'c6', name: 'Medical Lab Technologist (DMLT)', nameMr: 'मेडिकल लॅब तंत्रज्ञ (DMLT)', domain: 'health', cluster: 'Healthcare & Paramedical', clusterMr: 'आरोग्य व पॅरामेडिकल', color: 0xf87171, pos: [15, -20, 20], salary: '₹2.5 - 4.5 LPA', edu: 'DMLT / B.Sc. Medical Lab', eduMr: 'डीएमएलटी / बी.एससी. मेडिकल लॅब', desc: 'Run clinical pathology, blood diagnostics, and microbiology tests in hospitals.', descMr: 'रुग्णालयात रक्ताच्या चाचण्या आणि निदान चाचण्या करा.' },
    { id: 7, name: 'Community Health Nurse (GNM)', nameMr: 'समुदाय आरोग्य परिचारिका (GNM)', domain: 'health', cluster: 'Healthcare & Paramedical', clusterMr: 'आरोग्य व पॅरामेडिकल', color: 0xf87171, pos: [28, -15, -20], salary: '₹3.0 - 5.0 LPA', edu: 'GNM / B.Sc. Nursing (Govt College)', eduMr: 'जीएनएम / बी.एससी. नर्सिंग', desc: 'Deliver healthcare, maternal care, and immunization programs in rural health centers.', descMr: 'प्राथमिक आरोग्य केंद्रात रुग्णसेवा आणि आरोग्य मोहीम राबवा.' },

    // Public Service (Gold/Amber)
    { id: 'c8', name: 'MPSC Administrative Officer', nameMr: 'एमपीएससी प्रशासकीय अधिकारी', domain: 'govt', cluster: 'Public Service & Law', clusterMr: 'प्रशासकीय व सरकारी सेवा', color: 0xfbbf24, pos: [-15, -25, -15], salary: '₹6.0 - 12.0 LPA + Perks', edu: 'Any Graduate Degree (BA/B.Sc/B.E.)', eduMr: 'कोणतीही पदवी (बी.ए. / बी.एससी. / बी.ई.)', desc: 'Serve in Maharashtra State civil services (Tehsildar, BDO, Dy Collector).', descMr: 'तहसीलदार, गट विकास अधिकारी किंवा उपजिल्हाधिकारी म्हणून सेवा करा.' },
    { id: 'c9', name: 'Talathi & Revenue Inspector', nameMr: 'तलाठी व महसूल निरीक्षक', domain: 'govt', cluster: 'Public Service & Law', clusterMr: 'प्रशासकीय व सरकारी सेवा', color: 0xfbbf24, pos: [-5, -18, 25], salary: '₹3.5 - 6.0 LPA', edu: 'Graduation + MS-CIT Computer Cert', eduMr: 'पदवीधर + MS-CIT संगणक प्रमाणपत्र', desc: 'Administer land records (7/12 extracts), agricultural crop surveys, and village revenue.', descMr: '७/१२ उतारे, पिकांचे पंचनामे आणि महसूल नोंदी सांभाळा.' }
  ];

  const clickableMeshes = [];
  const nodeGroup = new THREE.Group();

  careerNodesData.forEach(item => {
    // Glowing Sphere
    const sphereGeo = new THREE.SphereGeometry(3.5, 24, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: item.color,
      emissive: item.color,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(item.pos[0], item.pos[1], item.pos[2]);
    sphere.userData = item;

    // Outer Halo Ring
    const ringGeo = new THREE.RingGeometry(4.2, 4.8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: item.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    sphere.add(ring);

    nodeGroup.add(sphere);
    clickableMeshes.push(sphere);
  });

  scene.add(nodeGroup);

  // Constellation connecting lines
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xd9a441,
    transparent: true,
    opacity: 0.22
  });

  for (let i = 0; i < careerNodesData.length - 1; i++) {
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...careerNodesData[i].pos),
      new THREE.Vector3(...careerNodesData[i + 1].pos)
    ]);
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
  }

  // 3. Mouse Drag Orbit Controls (Zero-dependency custom orbit)
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;

  const canvasEl = renderer.domElement;

  canvasEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  canvasEl.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    targetRotationY += deltaX * 0.005;
    targetRotationX += deltaY * 0.005;
  });

  // Touch Support
  canvasEl.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }
  });
  canvasEl.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMouseX;
    const deltaY = e.touches[0].clientY - prevMouseY;
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;

    targetRotationY += deltaX * 0.006;
    targetRotationX += deltaY * 0.006;
  });
  canvasEl.addEventListener('touchend', () => { isDragging = false; });

  // Wheel Zoom
  canvasEl.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.08;
    camera.position.z = Math.max(45, Math.min(180, camera.position.z));
  }, { passive: false });

  // 4. Raycaster Node Click
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvasEl.addEventListener('click', (e) => {
    const rect = canvasEl.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableMeshes, false);

    if (intersects.length > 0) {
      const selected = intersects[0].object.userData;
      showCareerFlyout(selected);
    }
  });

  function showCareerFlyout(data) {
    const flyout = document.getElementById('careerverse-flyout');
    if (!flyout) return;

    const lang = (window.CareerMitra && window.CareerMitra.lang) || localStorage.getItem('cm-lang') || 'en';

    document.getElementById('flyout-cluster').textContent = (lang === 'mr' && data.clusterMr) ? data.clusterMr : data.cluster;
    document.getElementById('flyout-title').textContent = (lang === 'mr' && data.nameMr) ? data.nameMr : data.name;
    document.getElementById('flyout-desc').textContent = (lang === 'mr' && data.descMr) ? data.descMr : data.desc;
    document.getElementById('flyout-salary').textContent = data.salary;
    document.getElementById('flyout-education').textContent = (lang === 'mr' && data.eduMr) ? data.eduMr : data.edu;
    document.getElementById('flyout-mitra-link').href = `/career-aunty?prompt=${encodeURIComponent('मला ' + (data.nameMr || data.name) + ' या करिअरबद्दल सांगा')}`;

    flyout.classList.remove('hidden');
  }

  document.getElementById('btn-close-flyout')?.addEventListener('click', () => {
    document.getElementById('careerverse-flyout')?.classList.add('hidden');
  });

  // HUD Filter buttons
  document.querySelectorAll('.galaxy-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.galaxy-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const domain = btn.dataset.constellation;

      clickableMeshes.forEach(mesh => {
        if (domain === 'all' || mesh.userData.domain === domain) {
          mesh.visible = true;
        } else {
          mesh.visible = false;
        }
      });
    });
  });

  // Resize handler
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 5. Render Loop with gentle floating orbit
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Smooth inertia rotation
    nodeGroup.rotation.y += (targetRotationY - nodeGroup.rotation.y) * 0.08;
    nodeGroup.rotation.x += (targetRotationX - nodeGroup.rotation.x) * 0.08;

    // Ambient cosmos drift
    starField.rotation.y += 0.0003;
    starField.rotation.x += 0.0001;

    renderer.render(scene, camera);
  }

  animate();
})();
