/* Reaction Time Test — 5 rounds, green-light stimulus, high-res timing. */
(function () {
  'use strict';

  var zone = document.getElementById('rtZone');
  var text = document.getElementById('rtText');
  var sub = document.getElementById('rtSub');
  var result = document.getElementById('rtResult');
  var label = document.getElementById('rtRoundLabel');

  var TRIALS = 5;
  var rounds = [];
  var phase = 'idle';       // idle | waiting | go
  var goAt = 0;
  var waitTimer = null;

  function setPhase(p) {
    phase = p;
    zone.className = 'flash-zone ' + (p === 'go' ? 'go' : p === 'waiting' ? 'ready' : 'idle');
  }

  function setText(t, s) {
    text.textContent = t;
    if (s !== undefined) sub.textContent = s;
  }

  function ms(x) { return fmt.dec(x, 0) + ' ms'; }

  function refreshStats() {
    if (!rounds.length) return;
    var avg = rounds.reduce(function (a, b) { return a + b; }, 0) / rounds.length;
    var best = Math.min.apply(null, rounds);
    var worst = Math.max.apply(null, rounds);
    var variance = rounds.reduce(function (a, b) { return a + (b - avg) * (b - avg); }, 0) / rounds.length;
    document.getElementById('rtAvg').textContent = ms(avg);
    document.getElementById('rtBest').textContent = ms(best);
    document.getElementById('rtWorst').textContent = ms(worst);
    document.getElementById('rtStd').textContent = ms(Math.sqrt(variance));
  }

  function rank(avg) {
    if (avg < 200) return { t: T('rt_r1', 'Lightning fast!'), c: 'ok' };
    if (avg < 240) return { t: T('rt_r2', 'Very good'), c: 'ok' };
    if (avg < 300) return { t: T('rt_r3', 'Typical human'), c: '' };
    return { t: T('rt_r4', 'Needs practice (or a better monitor)'), c: 'warn' };
  }

  function finish() {
    setPhase('idle');
    label.textContent = T('rt_done_l', 'Complete');
    setText(T('rt_done_t', 'All done!'), T('rt_done_s', 'View your results below.'));
    var avg = rounds.reduce(function (a, b) { return a + b; }, 0) / rounds.length;
    var chip = document.getElementById('rtResRank');
    var r = rank(avg);
    chip.textContent = r.t;
    chip.className = 'chip ' + r.c;
    document.getElementById('rtResAvg').textContent = ms(avg);
    document.getElementById('rtResBest').textContent = T('rt_best_pre', 'Best ') + ms(Math.min.apply(null, rounds));
    var list = document.getElementById('rtList');
    list.innerHTML = '';
    rounds.forEach(function (t, i) {
      var li = document.createElement('li');
      li.innerHTML = '<strong>' + T('rt_round', 'Round ') + (i + 1) + ':</strong> ' + ms(t);
      list.appendChild(li);
    });
    result.style.display = 'block';
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function onStimulus() {
    goAt = performance.now();
    setPhase('go');
    setText(T('rt_click', 'Click!'), '');
  }

  function scheduleStimulus() {
    clearTimeout(waitTimer);
    var delay = 1000 + Math.random() * 2500;
    waitTimer = setTimeout(function () {
      // paint the green synchronously, timestamped by rAF
      requestAnimationFrame(function () {
        if (phase !== 'waiting') return;
        goAt = performance.now();
        setPhase('go');
        setText(T('rt_click', 'Click!'), '');
      });
    }, delay);
  }

  function startRound() {
    if (rounds.length >= TRIALS) {
      restart();
      return;
    }
    label.textContent = T('rt_round', 'Round ') + (rounds.length + 1) + T('rt_of', ' of ') + TRIALS;
    setPhase('waiting');
    setText(T('rt_wait', 'Wait for green…'), T('rt_wait_s', 'Click the instant it changes — not before.'));
    scheduleStimulus();
  }

  function arrive() {
    setPhase('idle');
    setText(T('rt_start', 'Start'), T('rt_start_s', 'Click to begin the round.'));
    label.textContent = rounds.length >= TRIALS ? T('rt_done_l', 'Complete') : T('rt_round', 'Round ') + (rounds.length + 1) + T('rt_of', ' of ') + TRIALS;
  }

  function restart() {
    clearTimeout(waitTimer);
    rounds = [];
    result.style.display = 'none';
    document.getElementById('rtAvg').textContent = '—';
    document.getElementById('rtBest').textContent = '—';
    document.getElementById('rtWorst').textContent = '—';
    document.getElementById('rtStd').textContent = '—';
    arrive();
  }

  zone.addEventListener('pointerdown', function () {
    clearTimeout(waitTimer);
    if (phase === 'waiting') {
      // early click — discarded
      setPhase('idle');
      setText(T('rt_soon', 'Too soon!'), T('rt_soon_s', 'Click to try again.'));
    } else if (phase === 'go') {
      var t = performance.now() - goAt;
      rounds.push(t);
      refreshStats();
      if (rounds.length >= TRIALS) { finish(); return; }
      setPhase('idle');
      setText(T('rt_got', 'Got it — ') + ms(t), T('rt_next', 'Click for the next round.'));
      setTimeout(startRound, 650);
    } else {
      startRound();
    }
  });

  document.getElementById('rtAgain').addEventListener('click', restart);
  document.getElementById('rtReset').addEventListener('click', restart);

  restart();
})();