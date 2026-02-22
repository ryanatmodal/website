(function () {
  'use strict';

  /* ── DOM refs ── */
  const microIn   = document.getElementById('mv-micro');
  const fixedIn   = document.getElementById('mv-fixed');
  const pctSlider = document.getElementById('mv-pct');
  const penSlider = document.getElementById('mv-penalty');
  const pctVal    = document.getElementById('mv-pct-val');
  const penVal    = document.getElementById('mv-penalty-val');
  const resultNum = document.getElementById('mv-result-num');
  const resultSub = document.getElementById('mv-result-sub');
  const canvas    = document.getElementById('mv-canvas');
  const ctx       = canvas.getContext('2d');

  /* ── Read CSS vars at runtime ── */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || null;
  }

  /* ── High-DPI canvas setup ── */
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const W = wrap.clientWidth;
    const H = 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { W, H };
  }

  /* ── Core draw ── */
  function draw() {
    const { W, H } = resizeCanvas();

    const micro   = parseFloat(microIn.value)   || 45;
    const fixed   = parseFloat(fixedIn.value)   || 18;
    const pct     = parseFloat(pctSlider.value) / 100; // 0–1
    const penalty = parseFloat(penSlider.value) / 100; // 1.0–2.0

    /* Layout margins */
    const ml = 52, mr = 16, mt = 16, mb = 38;
    const cW = W - ml - mr;
    const cH = H - mt - mb;

    /* Scale */
    const yMax   = micro * 1.2;
    const xTotal = 60; // minutes

    function xPx(min) { return ml + (min / xTotal) * cW; }
    function yPx(val) { return mt + (1 - val / yMax) * cH; }

    /* Clear */
    ctx.clearRect(0, 0, W, H);

    /* ── Grid & axes ── */
    ctx.strokeStyle = 'rgba(0,0,0,.07)';
    ctx.lineWidth = 1;
    // horizontal grid lines (4 steps)
    for (let i = 0; i <= 4; i++) {
      const v = (yMax / 4) * i;
      const y = yPx(v);
      ctx.beginPath(); ctx.moveTo(ml, y); ctx.lineTo(ml + cW, y); ctx.stroke();
    }

    /* Axis labels */
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px DM Mono, monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const v = (yMax / 4) * i;
      ctx.fillText('$' + v.toFixed(0), ml - 6, yPx(v) + 4);
    }
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px DM Mono, monospace'; // Added bold for emphasis
    ctx.textAlign = 'center';

    // Calculate the center of the chart area
    // ml is left margin, cW is chart width
    const centerX = ml + (cW / 2);
    const labelY = mt + cH + 22; // Positioned below the axis

    ctx.fillText('TRIP DURATION', centerX, labelY);

    /* ── Baseline dotted line ── */
    const darkColor = cssVar('--dark') || '#0f172a';
    ctx.save();
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = darkColor;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(xPx(0), yPx(micro));
    ctx.lineTo(xPx(60), yPx(micro));
    ctx.stroke();
    ctx.restore();

    /* ── Step function ── */
    // Valley occupies pct of 60 min, centered.
    const valleyWidth = pct * 60;
    const valleyStart = (60 - valleyWidth) / 2;
    const valleyEnd   = valleyStart + valleyWidth;

    // Step points: [0, micro] -> cliff down at valleyStart -> [fixed] -> cliff up at valleyEnd -> [micro] at 60
    const pts = [
      [0,           micro],
      [valleyStart, micro],
      [valleyStart, fixed],
      [valleyEnd,   fixed],
      [valleyEnd,   micro],
      [60,          micro],
    ];

    const primaryColor = cssVar('--primary') || '#2563eb';

    /* Filled area under step */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xPx(pts[0][0]), yPx(0));
    pts.forEach(([m, v]) => ctx.lineTo(xPx(m), yPx(v)));
    ctx.lineTo(xPx(60), yPx(0));
    ctx.closePath();
    ctx.fillStyle = primaryColor;
    ctx.globalAlpha = 0.08;
    ctx.fill();
    ctx.restore();

    /* Stroke step function */
    ctx.save();
    ctx.beginPath();
    pts.forEach(([m, v], i) => {
      if (i === 0) ctx.moveTo(xPx(m), yPx(v));
      else ctx.lineTo(xPx(m), yPx(v));
    });
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.restore();

    /* ── Compute savings ── */
    // Area A: pure micro over 60 min
    const areaA = micro;
    // Area B: step function integral
    const microTime = 60 - valleyWidth;
    const fixedTime = valleyWidth;
    const blended = ((micro / 60) * microTime) + ((fixed / 60) * fixedTime);
    const areaB = blended * penalty;
    // Savings multiple
    const savingsMultiple = (areaA / areaB);

    /* ── Update result ── */
    const pctSavings = ((1 - 1 / savingsMultiple) * 100).toFixed(1);
    document.getElementById('mv-result-pct').textContent = pctSavings + '%';
    resultNum.textContent = savingsMultiple.toFixed(2) + '×';
    resultSub.textContent =
      `Area A (baseline): $${areaA.toFixed(2)} · Area B (multimodal): $${areaB.toFixed(2)}`;
  }

  /* ── Slider display updates ── */
  function updateLabels() {
    pctVal.textContent = pctSlider.value + '%';
    penVal.textContent = (parseFloat(penSlider.value) / 100).toFixed(2) + '×';
  }

  /* ── Event wiring ── */
  [microIn, fixedIn, pctSlider, penSlider].forEach(el => {
    el.addEventListener('input', () => { updateLabels(); draw(); });
  });

  window.addEventListener('resize', draw);

  /* ── Init ── */
  updateLabels();
  draw();

})();