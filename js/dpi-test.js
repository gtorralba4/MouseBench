/* Mouse DPI Test — measure movementX over a user-selected drag distance. */
(function () {
  'use strict';

  var stage = document.getElementById('rulerStage');
  var cursorEl = document.getElementById('rulerCursor');
  var startLine = document.getElementById('rulerStart');
  var endLine = document.getElementById('rulerEnd');
  var hint = document.getElementById('dpiHint');
  var result = document.getElementById('dpiResult');
  var unitSelect = document.getElementById('dpiUnit');
  var distSelect = document.getElementById('dpiDist');
  var hintDist = document.getElementById('dpiHintDist');
  var spanLabel = document.getElementById('dpiSpan');

  var CANVAS_SPAN = 96; // stage's logical px per column later; see below
  var PRESETS = [400, 800, 1200, 1600, 2000, 3200];
  var DIST_PRESETS = { in: [1, 2, 3, 4, 5], cm: [2.5, 5, 7.5, 10, 12.5] };
  var lastUnit = 'in';

  var tracking = false;
  var px = 0;
  var samples = [];
  var last = null;

  function render() {
    var gap = endLine.offsetLeft - startLine.offsetLeft;
    var frac = gap > 0 ? Math.min(1, px / gap) : 0;
    cursorEl.style.left = (startLine.offsetLeft - 2 + gap * frac) + 'px';
  }

  // Scale the start..end gap to the window so the ruler reflects the chosen
  // physical drag length proportionally on screen.
  function updateRuler() {
    var lenIn = physicalInches();
    var pct = Math.min(0.72, Math.max(0.12, 0.45 * (lenIn / 3)));
    startLine.style.left = '6%';
    endLine.style.left = (6 + pct * 100) + '%';
    var gap = endLine.offsetLeft - startLine.offsetLeft;
    if (gap > 0) spanLabel.textContent = T('dpi_span_pre', 'On-screen span ≈ ') + fmt.int(gap) + T('dpi_span_win', ' px (window ') + fmt.int(window.innerWidth) + ' px)';
    else spanLabel.textContent = '';
    render();
  }

  function setStatus(txt) {
    var S = window.L10N || {};
    document.getElementById('dpiStatus').textContent = S['st_' + txt] || txt;
  }

  function labelFor(unit, v) {
    if (unit === 'cm') return (v % 1 === 0 ? String(v) : String(Number(v.toFixed(1)))) + T('u_cm', ' cm');
    return v + (v === 1 ? T('u_in1', ' inch') : T('u_inN', ' inches'));
  }

  function currentUnit() { return unitSelect.value; }

  function physicalInches() {
    var v = parseFloat(distSelect.value);
    return currentUnit() === 'cm' ? v / 2.54 : v;
  }

  function nearestPreset(unit, inches) {
    var presets = DIST_PRESETS[unit];
    var best = presets[2], bd = Infinity;
    presets.forEach(function (v) {
      var inL = v / (unit === 'cm' ? 2.54 : 1);
      var d = Math.abs(inL - inches);
      if (d < bd) { bd = d; best = v; }
    });
    return best;
  }

  function renderDistances(inches) {
    var unit = currentUnit();
    distSelect.innerHTML = '';
    DIST_PRESETS[unit].forEach(function (v) {
      var o = document.createElement('option');
      o.value = v;
      o.textContent = labelFor(unit, v);
      if (v === nearestPreset(unit, inches)) o.selected = true;
      distSelect.appendChild(o);
    });
    updateHint();
  }

  function updateHint() {
    hintDist.textContent = labelFor(currentUnit(), parseFloat(distSelect.value));
  }

  function nearest(dpi) {
    var best = PRESETS[0], bd = Math.abs(PRESETS[0] - dpi);
    PRESETS.forEach(function (p) {
      var d = Math.abs(p - dpi);
      if (d < bd) { bd = d; best = p; }
    });
    return best;
  }

  function drawPresets() {
    var wrap = document.getElementById('dpiPresets');
    PRESETS.forEach(function (p) {
      var c = document.createElement('span');
      c.className = 'chip';
      c.textContent = p + ' DPI';
      c.dataset.dpi = p;
      wrap.appendChild(c);
    });
  }

  function updateUnitLabels() {
    var cm = currentUnit() === 'cm';
    document.getElementById('dpiStatLabel').textContent = cm ? T('dpi_stat_cm', 'Estimated DPCM') : T('dpi_stat_in', 'Estimated DPI');
    document.getElementById('dpiResSub').textContent = cm ? T('dpi_sub_cm', 'estimated dots per centimetre (DPCM)') : T('dpi_sub_in', 'estimated DPI / CPI');
  }

  function onMove(e) {
    if (!tracking) return;
    var mx = (typeof e.movementX === 'number') ? e.movementX : 0;
    px += Math.abs(mx);
    document.getElementById('dpiPx').textContent = fmt.int(px);
    render();
  }

  function finish() {
    if (!tracking) return;
    tracking = false;
    var inches = physicalInches();
    var dpi = Math.round(px / inches);
    var dpcm = Math.round(px / (inches * 2.54));
    var metric = currentUnit() === 'cm';
    samples.push(metric ? dpcm : dpi);
    last = metric ? dpcm : dpi;
    document.getElementById('dpiValue').textContent = (metric ? dpcm : dpi) || '—';
    document.getElementById('dpiLast').textContent = samples.length ? fmt.int(samples[samples.length - 1]) : '—';
    setStatus('released');

    var chipWrap = document.getElementById('dpiPresets');
    var chips = chipWrap.querySelectorAll('.chip');
    if (chips.length) {
      var near = nearest(dpi);
      chips.forEach(function (c) {
        c.classList.toggle('ok', parseInt(c.dataset.dpi, 10) === near);
      });
    }

    document.getElementById('dpiResValue').textContent = metric ? (dpcm || '—') : (dpi || '—');
    document.getElementById('dpiResNearest').textContent = metric
      ? (dpi ? '≈ ' + dpi + ' DPI — ' + T('dpi_vendor', 'vendor standard (per inch)') : T('dpi_none', 'No reading — try again'))
      : (dpi ? T('dpi_closest', 'Closest preset: ') + nearest(dpi) + ' DPI' : T('dpi_none', 'No reading — try again'));
    document.getElementById('dpiResNote').textContent = dpi
      ? (metric
          ? dpcm + ' ' + T('dpi_note_cm_tail', 'DPCM counts the dots per centimetre you moved. Most vendors quote DPI (dots per inch), so DPCM ≈ DPI ÷ 2.54 — the metric number ranks the same speed. Estimated, not hardware-exact.')
          : T('dpi_note_in', 'Estimated, not hardware-exact'))
      : T('dpi_note_none', 'Press-and-hold inside the ruler, then drag.');
    result.style.display = 'block';
    render();
  }

  function begin(e) {
    tracking = true;
    px = 0;
    document.getElementById('dpiPx').textContent = '0';
    hint.style.display = 'none';
    setStatus('measuring…');
    // consume any co-located move immediately
    onMove(e);
  }

  stage.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    begin(e);
  });
  stage.addEventListener('mousedown', function (e) {
    e.preventDefault();
    if (!window.PointerEvent) begin(e);
  });

  window.addEventListener('pointermove', onMove);
  if (!window.PointerEvent) {
    window.addEventListener('mousemove', onMove);
  }

  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);
  window.addEventListener('mouseup', finish);

  document.getElementById('dpiAgain').addEventListener('click', function () {
    result.style.display = 'none';
    hint.style.display = '';
    updateRuler();
  });

  distSelect.addEventListener('change', function () {
    updateHint();
    updateRuler();
    result.style.display = 'none';
  });

  unitSelect.addEventListener('change', function () {
    var oldVal = parseFloat(distSelect.value);
    var curIn = lastUnit === 'cm' ? oldVal / 2.54 : oldVal;
    lastUnit = unitSelect.value;
    renderDistances(curIn);
    updateUnitLabels();
    updateRuler();
    result.style.display = 'none';
    setStatus('idle');
  });

  window.addEventListener('resize', updateRuler);

  renderDistances(3);
  updateUnitLabels();
  updateRuler();
  drawPresets();
  render();
  setStatus('idle');
})();