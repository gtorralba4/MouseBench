/* Mouse Latency Test — hold the button, frame-synchronized stimulus, measure release-to-go.
   Measures display-to-click latency (incl. reaction + input pipeline) as observed by the browser. */
(function () {
  'use strict';

  var zone = document.getElementById('latZone');
  var text = document.getElementById('latText');
  var sub = document.getElementById('latSub');
  var result = document.getElementById('latResult');
  var label = document.getElementById('latRound');

  var TRIALS = 6;
  var samples = [];
  var phase = 'idle';    // idle | waiting | go | done
  var goAt = 0;
  var waitTimer = null;
  var armed = false;

  function setPhase(p) {
    phase = p;
    // red while arming/waiting, solid green at GO
    zone.className = 'flash-zone ' + (p === 'go' ? 'go' : 'idle');
  }
  function ms(x) { return fmt.dec(x, 0) + ' ms'; }

  function refresh() {
    document.getElementById('latSamples').textContent = samples.length;
    if (!samples.length) return;
    var avg = samples.reduce(function (a, b) { return a + b; }, 0) / samples.length;
    document.getElementById('latAvg').textContent = ms(avg);
    document.getElementById('latMin').textContent = ms(Math.min.apply(null, samples));
    document.getElementById('latMax').textContent = ms(Math.max.apply(null, samples));
  }

  function band(avg) {
    if (avg <= 100) return { t: T('lat_b1', 'Fast pipeline'), c: 'ok' };
    if (avg <= 160) return { t: T('lat_b2', 'Gaming-grade'), c: 'ok' };
    if (avg <= 250) return { t: T('lat_b3', 'Typical'), c: '' };
    return { t: T('lat_b4', 'Sluggish — check display mode'), c: 'warn' };
  }

  function nextRound() {
    if (samples.length >= TRIALS) { finish(); return; }
    label.textContent = T('lat_samp_pre', 'Sample ') + (samples.length + 1) + T('lat_samp_of', ' of ') + TRIALS;
    setPhase('idle');
    text.textContent = T('lat_hold', 'Click & hold — release on green');
    sub.textContent = T('lat_hold_sub', 'Keep the button held until the colour flips.');
  }

  function finish() {
    armed = false;
    setPhase('idle');
    label.textContent = T('lat_done_l', 'Complete');
    text.textContent = T('lat_done_t', 'Done!');
    sub.textContent = T('lat_done_s', 'Results below.');
    var avg = samples.reduce(function (a, b) { return a + b; }, 0) / samples.length;
    document.getElementById('latRes').textContent = ms(avg);
    var chip = document.getElementById('latResBand');
    var b = band(avg);
    chip.textContent = b.t;
    chip.className = 'chip ' + b.c;
    document.getElementById('latResMin').textContent = T('lat_fastest', 'Fastest ') + ms(Math.min.apply(null, samples));
    var list = document.getElementById('latList');
    list.innerHTML = '';
    samples.forEach(function (t, i) {
      var li = document.createElement('li');
      li.innerHTML = '<strong>' + T('lat_samp_pre', 'Sample ') + (i + 1) + ':</strong> ' + ms(t);
      list.appendChild(li);
    });
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function arm() {
    clearTimeout(waitTimer);
    armed = true;
    setPhase('waiting');
    text.textContent = T('lat_wait', 'Hold… waiting for green');
    sub.textContent = T('lat_wait_s', 'Do not release yet.');
    var delay = 600 + Math.random() * 1200;
    waitTimer = setTimeout(function () {
      requestAnimationFrame(function () {
        if (!armed) return;
        goAt = performance.now();
        setPhase('go');
        text.textContent = T('lat_now', 'Release now!');
        sub.textContent = '';
      });
    }, delay);
  }

  function abort(msg) {
    armed = false;
    clearTimeout(waitTimer);
    setPhase('idle');
    text.textContent = msg;
    sub.textContent = T('lat_again_s', 'Click and hold again to retry this sample.');
  }

  zone.addEventListener('pointerdown', function () {
    if (phase === 'go') return; // wait for the release
    if (phase === 'waiting') return; // already armed — treat as noise
    nextRound();
    arm();
  });

  function release() {
    clearTimeout(waitTimer);
    if (!armed) return;
    if (phase === 'go') {
      var t = performance.now() - goAt;
      samples.push(t);
      refresh();
      armed = false;
      setPhase('idle');
      text.textContent = T('lat_got', 'Got it — ') + ms(t);
      sub.textContent = T('lat_next', 'Click and hold again for the next sample.');
      setTimeout(function () {
        if (samples.length >= TRIALS) { finish(); return; }
        text.textContent = T('lat_hold', 'Click & hold — release on green');
        sub.textContent = T('lat_hold_sub', 'Keep the button held until the colour flips.');
      }, 500);
    } else if (phase === 'waiting') {
      abort(T('lat_early', 'Released too soon!'));
    }
  }

  zone.addEventListener('pointerup', release);
  zone.addEventListener('pointercancel', function () { if (armed) abort(T('lat_cancel', 'Cancelled — try again.')); });
  document.addEventListener('mouseup', release);

  function resetSamples() {
    armed = false;
    clearTimeout(waitTimer);
    samples = [];
    result.style.display = 'none';
    document.getElementById('latAvg').textContent = '—';
    document.getElementById('latMin').textContent = '—';
    document.getElementById('latMax').textContent = '—';
    document.getElementById('latSamples').textContent = '0';
    nextRound();
  }

  document.getElementById('latAgain').addEventListener('click', resetSamples);
  document.getElementById('latReset').addEventListener('click', resetSamples);

  nextRound();
})();