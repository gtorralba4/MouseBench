/* Scroll Wheel Test — event counting, reverse detection, jitter analysis and live chart. */
(function () {
  'use strict';

  var zone = document.getElementById('scrollZone');
  var chart = document.getElementById('scrollChart');
  var cctx = chart.getContext('2d');
  var timerTxt = document.getElementById('swTimer');

  var duration = 15;
  var running = false;
  var counting = false;
  var startAt = 0;
  var tick = null;

  var data = { events: 0, up: 0, down: 0, rev: 0, deltas: 0, horiz: 0 };
  var lastSign = null;   // '', 'up', 'down'
  var deltas = [];       // rolling window for chart
  var hasSkips = false;

  function el(id) { return document.getElementById(id); }

  function setDur(d) {
    duration = d;
    document.querySelectorAll('.pill[data-dur]').forEach(function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-dur'), 10) === d);
    });
  }
  document.querySelectorAll('.pill[data-dur]').forEach(function (b) {
    b.addEventListener('click', function () { if (!running) setDur(parseInt(b.getAttribute('data-dur'), 10)); });
  });

  function resetData() {
    data = { events: 0, up: 0, down: 0, rev: 0, deltas: 0, horiz: 0 };
    lastSign = null;
    deltas = [];
    hasSkips = false;
    el('swEvents').textContent = '0';
    el('swUp').textContent = '0';
    el('swDown').textContent = '0';
    el('swRev').textContent = '0';
    el('swDeltas').textContent = '0';
    el('swHoriz').textContent = '0';
    el('swResult').style.display = 'none';
    zone.classList.remove('live');
    drawChart();
  }

  function stop() {
    running = false;
    counting = false;
    clearInterval(tick);
    zone.classList.remove('live');
    timerTxt.textContent = '';
    el('swStart').textContent = T('sw_start', 'Start test');
    report();
  }

  function report() {
    if (data.events === 0) {
      el('swResult').style.display = 'none';
      return;
    }
    var revRatio = data.rev / Math.max(1, data.events);
    var healthy = data.rev === 0 && !hasSkips;
    var title, sub;
    if (healthy) {
      title = T('sw_ok_t', 'Wheel input looks stable');
      sub = T('sw_ok_s', 'No direction reversals or skipped ticks were detected this run.');
    } else if (revRatio > 0.08) {
      title = T('sw_rev_t', 'Reverse ticks detected');
      sub = T('sw_rev_s', 'The signal flipped direction while scrolling one way — common with a dirty encoder. Try cleaning it.');
    } else {
      title = T('sw_irr_t', 'Slight irregularities');
      sub = hasSkips ? T('sw_irr_s_skip', 'Some wheel events appear dropped between ticks — check for stutter while scrolling.') : T('sw_irr_s', 'A few reversals spotted. Keep your scroll steady on the next run.');
    }
    el('swResTitle').textContent = title;
    el('swResText').textContent = sub;
    el('swResEvents').textContent = fmt.int(data.events) + T('sw_chip_events', ' events');
    el('swResRevs').textContent = fmt.int(data.rev) + T('sw_chip_revs', ' reversals');
    el('swResHoriz').textContent = fmt.int(data.horiz) + T('sw_chip_horiz', ' horizontal');
    el('swResult').style.display = 'block';
    el('swResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function armTimer() {
    counting = true;
    startAt = performance.now();
    tick = setInterval(function () {
      var left = duration - (performance.now() - startAt) / 1000;
      if (left <= 0) { timerTxt.textContent = ''; stop(); return; }
      timerTxt.textContent = fmt.dec(left, 1) + T('sw_left', 's left');
    }, 100);
  }

  function start() {
    if (running) { stop(); return; }
    resetData();
    running = true;
    counting = false;
    zone.classList.add('live');
    el('swStart').textContent = T('sw_stop', 'Stop');
    timerTxt.textContent = T('sw_arm', 'Start scrolling to begin the timer');
  }

  function drawChart() {
    var w = chart.width = chart.clientWidth;
    var h = chart.height = 90;
    cctx.clearRect(0, 0, w, h);
    if (!deltas.length) {
      cctx.fillStyle = '#94a3b8';
      cctx.font = '13px system-ui';
      cctx.fillText(T('sw_chart', 'Scroll to see the signal chart'), 14, h / 2 + 4);
      return;
    }
    var n = Math.min(deltas.length, 140);
    var slice = deltas.slice(-n);
    var bw = w / n;
    var maxAbs = 320;
    slice.forEach(function (d) {
      var hgt = Math.min(h / 2, Math.abs(d) / maxAbs * (h / 2));
      var y = h / 2 - ((d < 0 ? 0 : hgt));
      if (d < 0) y = h / 2;
      cctx.fillStyle = d < 0 ? '#0d9488' : d > 0 ? '#16a34a' : '#94a3b8';
      cctx.fillRect(bw, y, Math.max(1, bw - 1), Math.max(1, hgt));
    });
  }

  zone.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (!running) return;
    if (!counting) armTimer();
    data.events++;
    var dy = Math.round(e.deltaY);
    var dx = Math.round(e.deltaX);
    data.deltas += Math.abs(dy);
    if (dx !== 0) data.horiz++;

    var sign = dy < 0 ? 'up' : dy > 0 ? 'down' : null;
    if (sign) {
      if (sign === 'up') data.up++; else data.down++;
      if (lastSign !== null && lastSign !== sign) data.rev++;
      lastSign = sign;
    }

    // skip detection: sudden large step >300 between events
    if (Math.abs(dy) > 320) hasSkips = true;

    deltas.push(dy);
    if (deltas.length > 300) deltas.shift();

    el('swEvents').textContent = fmt.int(data.events);
    el('swUp').textContent = fmt.int(data.up);
    el('swDown').textContent = fmt.int(data.down);
    el('swRev').textContent = fmt.int(data.rev);
    el('swDeltas').textContent = fmt.int(data.deltas);
    el('swHoriz').textContent = fmt.int(data.horiz);
    drawChart();
  }, { passive: false });

  el('swStart').addEventListener('click', start);
  el('swReset').addEventListener('click', function () { if (!running) resetData(); });

  window.addEventListener('resize', drawChart);
  drawChart();
})();