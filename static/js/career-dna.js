/**
 * AARAMBH - Career DNA Radar Visualization Engine
 * Renders an animated 6-axis RIASEC radar chart on HTML5 Canvas
 */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('careerDnaCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  const labels = [
    'Realistic (R)',
    'Investigative (I)',
    'Artistic (A)',
    'Social (S)',
    'Enterprising (E)',
    'Conventional (C)'
  ];

  const targetValues = [0.94, 0.82, 0.52, 0.64, 0.70, 0.58];
  let progress = 0;

  function drawRadar(t) {
    ctx.clearRect(0, 0, width, height);

    const totalAxes = labels.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // 1. Concentric Guide Polygons
    const levels = 4;
    for (let l = 1; l <= levels; l++) {
      const levelRadius = (radius / levels) * l;
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(61, 43, 31, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Radial Axis Lines & Labels
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(61, 43, 31, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label Positioning
      const labelDist = radius + 22;
      const lx = centerX + Math.cos(angle) * labelDist;
      const ly = centerY + Math.sin(angle) * labelDist;

      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = '#6B5744';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], lx, ly);
    }

    // 3. User RIASEC Polygon Data
    ctx.beginPath();
    const vertices = [];
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const val = targetValues[i] * t;
      const r = radius * val;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      vertices.push({ x, y });
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill Gradient
    const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
    grad.addColorStop(0, 'rgba(217, 164, 65, 0.5)');
    grad.addColorStop(1, 'rgba(184, 87, 60, 0.25)');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = '#B8573C';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Vertices Dots
    vertices.forEach(v => {
      ctx.beginPath();
      ctx.arc(v.x, v.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#D9A441';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // Entrance Animation
  function animate() {
    progress += 0.035;
    if (progress > 1) progress = 1;

    // Smooth cubic easing
    const eased = 1 - Math.pow(1 - progress, 3);
    drawRadar(eased);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
});
