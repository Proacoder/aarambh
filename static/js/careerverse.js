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

  // 2. Career Nodes Data
  const careerNodesData = [
    // Tech & Engineering (Blue/Cyan)
    { id: 'c1', name: 'Software Developer', domain: 'tech', cluster: 'Tech & Engineering', color: 0x38bdf8, pos: [-35, 15, -10], salary: '₹4.5 - 9.0 LPA', edu: 'B.E. / BCA / Polytechnic Diploma', desc: 'Build web applications, cloud systems, and AI models for Maharashtra startups.' },
    { id: 'c2', name: 'Embedded IoT Engineer', domain: 'tech', cluster: 'Tech & Engineering', color: 0x38bdf8, pos: [-25, 25, 10], salary: '₹4.0 - 7.5 LPA', edu: 'Diploma in Electronics / E&TC', desc: 'Design microcontrollers and smart hardware for automotive & manufacturing plants.' },
    { id: 'c3', name: 'Mechanical CAD Designer', domain: 'tech', cluster: 'Tech & Engineering', color: 0x38bdf8, pos: [-40, 5, 20], salary: '₹3.2 - 5.5 LPA', edu: 'Diploma in Mechanical / ITI Draughtsman', desc: 'Draft 3D parts and precision assemblies for Pune & Chakan industrial clusters.' },

    // Agri-Tech (Emerald Green)
    { id: 'c4', name: 'Precision Farming Specialist', domain: 'agri', cluster: 'Agri-Tech & Biotech', color: 0x34d399, pos: [30, 20, -15], salary: '₹3.6 - 6.5 LPA', edu: 'B.Sc. Agriculture / Agri-Diploma', desc: 'Deploy automated drip irrigation, drone soil sensing, and climate telemetry.' },
    { id: 'c5', name: 'Solar Agripump Technician', domain: 'agri', cluster: 'Agri-Tech & Biotech', color: 0x34d399, pos: [40, 8, 15], salary: '₹2.8 - 4.8 LPA', edu: 'ITI Electrician / Solar Tech Cert', desc: 'Install and service PM-KUSUM solar pumps and solar microgrids across villages.' },

    // Healthcare (Coral/Red)
    { id: 'c6', name: 'Medical Lab Technologist (DMLT)', domain: 'health', cluster: 'Healthcare & Paramedical', color: 0xf87171, pos: [15, -20, 20], salary: '₹2.5 - 4.5 LPA', edu: 'DMLT / B.Sc. Medical Lab', desc: 'Run clinical pathology, blood diagnostics, and microbiology tests in hospitals.' },
    { id: 'c7', name: 'Community Health Nurse (GNM)', domain: 'health', cluster: 'Healthcare & Paramedical', color: 0xf87171, pos: [28, -15, -20], salary: '₹3.0 - 5.0 LPA', edu: 'GNM / B.Sc. Nursing (Govt College)', desc: 'Deliver healthcare, maternal care, and immunization programs in rural health centers.' },

    // Public Service (Gold/Amber)
    { id: 'c8', name: 'MPSC Administrative Officer', domain: 'govt', cluster: 'Public Service & Law', color: 0xfbbf24, pos: [-15, -25, -15], salary: '₹6.0 - 12.0 LPA + Perks', edu: 'Any Graduate Degree (BA/B.Sc/B.E.)', desc: 'Serve in Maharashtra State civil services (Tehsildar, BDO, Dy Collector).' },
    { id: 'c9', name: 'Talathi & Revenue Inspector', domain: 'govt', cluster: 'Public Service & Law', color: 0xfbbf24, pos: [-5, -18, 25], salary: '₹3.5 - 6.0 LPA', edu: 'Graduation + MS-CIT Computer Cert', desc: 'Administer land records (7/12 extracts), agricultural crop surveys, and village revenue.' }
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

    document.getElementById('flyout-cluster').textContent = data.cluster;
    document.getElementById('flyout-title').textContent = data.name;
    document.getElementById('flyout-desc').textContent = data.desc;
    document.getElementById('flyout-salary').textContent = data.salary;
    document.getElementById('flyout-education').textContent = data.edu;
    document.getElementById('flyout-mitra-link').href = `/career-aunty?prompt=${encodeURIComponent('मला ' + data.name + ' या करिअरबद्दल सांगा')}`;

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
