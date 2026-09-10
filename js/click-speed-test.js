/* Click Speed Test — timed click counting with live CPS meter. */
(function () {
  'use strict';

  var zone = document.getElementById('cpsZone');
  var zoneText = document.getElementById('cpsZoneText');
  var bar = document.getElementById('cpsBar');
  var result = document.getElementById('cpsResult');

  var duration = 5;
  var spamMode = false;
  var running = false;
  var clicks = 0;
  var startAt = 0;
  var timer = null;
  var best = window.store.get('mbt_cps_best', null);
  var lockUntil = 0;

  function setDur(d) {
    spamMode = d === 'spam';
    duration = spamMode ? 10 : parseInt(d, 10);
    document.querySelectorAll('.pill[data-dur]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-dur') === d);
    });
    document.getElementById('cpsLeft').textContent = fmt.dec(duration, 0);
    document.getElementById('cpsBest').textContent = best ? fmt.dec(best, 1) : '—';
    document.getElementById('cpsHint').textContent = spamMode ? T('cps_hint_spam', 'All buttons count — spam anything!') : T('cps_hint_left', 'Press the left mouse button to click.');
  }

  document.querySelectorAll('.pill[data-dur]').forEach(function (b) {
    b.addEventListener('click', function () { if (!running) setDur(b.getAttribute('data-dur')); });
  });

  function allowedButton(e) {
    return spamMode || e.button === 0;
  }

  function resetZone() {
    zone.classList.remove('active');
    zoneText.textContent = T('cps_idle', 'Start clicking!');
  }

  function end() {
    running = false;
    clearInterval(timer);
    lockUntil = performance.now() + 500;
    var cps = clicks / duration;
    var cpm = clicks * (60 / duration);
    if (best === null || cps > best) {
      best = cps;
      window.store.set('mbt_cps_best', best);
    }
    document.getElementById('cpsLive').textContent = fmt.dec(cps, 1);
    document.getElementById('cpsBest').textContent = fmt.dec(best, 1);
    document.getElementById('cpsResCps').textContent = fmt.dec(cps, 1);
    document.getElementById('cpsResCount').textContent = fmt.int(clicks) + T('cps_clicks', ' clicks');
    document.getElementById('cpsResCpm').textContent = fmt.int(cpm) + ' CPM';
    var rank = cps < 4 ? T('cps_r1', 'Getting started') : cps < 7 ? T('cps_r2', 'Average') : cps < 10 ? T('cps_r3', 'Fast') : T('cps_r4', 'Blistering!');
    var chip = document.getElementById('cpsResRank');
    chip.textContent = rank;
    chip.className = 'chip ' + (cps >= 7 ? 'ok' : cps < 4 ? 'warn' : '');
    bar.style.width = '0%';
    resetZone();
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function start() {
    if (running) return;
    if (performance.now() < lockUntil) return;
    result.style.display = 'none';
    clicks = 0;
    running = true;
    startAt = performance.now();
    zone.classList.add('active');
    zoneText.textContent = T('cps_go', 'Go go go!');
    document.getElementById('cpsClicks').textContent = '0';
    document.getElementById('cpsLive').textContent = '0.0';
    bar.style.width = '100%';
    timer = setInterval(function () {
      var left = duration - (performance.now() - startAt) / 1000;
      if (left <= 0) { document.getElementById('cpsLeft').textContent = '0.0'; end(); return; }
      document.getElementById('cpsLeft').textContent = fmt.dec(left, 1);
      bar.style.width = (left / duration) * 100 + '%';
      document.getElementById('cpsLive').textContent = fmt.dec(clicks / (duration - left), 1);
    }, 50);
  }

  function countClick() {
    clicks++;
    document.getElementById('cpsClicks').textContent = fmt.int(clicks);
  }

  // Counting uses mousedown, not pointerdown: a mouse is one pointer, so the
  // browser fires a single pointerdown for the first button and ignores further
  // buttons pressed while it is held. mousedown fires once per button press,
  // which is what lets Spam mode register multiple buttons at once.
  zone.addEventListener('mousedown', function (e) {
    if (!allowedButton(e)) return;
    e.preventDefault();
    if (!running) { start(); return; }
    countClick();
  });
  zone.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); zone.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true, cancelable: true })); }
  });

  document.addEventListener('mousedown', function (e) {
    if (running && !zone.contains(e.target)) {
      if (!allowedButton(e)) return;
      // allow hammering anywhere on the page for comfort
      countClick();
    }
  });

  // Mirrors the mouse button test: while a run is active, the context menu and
  // side-button back/forward navigation defaults are suppressed so right-click
  // and extra buttons feed the counter instead of the browser.
  document.addEventListener('contextmenu', function (e) {
    if (running) e.preventDefault();
  });
  var side = function (e) {
    if (running && (e.button === 3 || e.button === 4)) e.preventDefault();
  };
  ['mousedown', 'mouseup', 'auxclick'].forEach(function (type) {
    document.addEventListener(type, side, true);
  });

  function reset() {
    running = false;
    clearInterval(timer);
    result.style.display = 'none';
    clicks = 0;
    document.getElementById('cpsClicks').textContent = '0';
    document.getElementById('cpsLive').textContent = '0.0';
    document.getElementById('cpsLeft').textContent = fmt.dec(duration, 0);
    bar.style.width = '100%';
    resetZone();
  }

  document.getElementById('cpsAgain').addEventListener('click', reset);
  document.getElementById('cpsReset').addEventListener('click', reset);

  setDur('5');
})();