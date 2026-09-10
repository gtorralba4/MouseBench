/* Aim & Memory Challenge — canvas game: memorize numbered circles, click them in order. */
(function () {
  'use strict';

  var canvas = document.getElementById('aimCanvas');
  var ctx = canvas.getContext('2d');
  var overlay = document.getElementById('aimOverlay');
  var resultPanel = document.getElementById('aimResult');

  var DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  var W = 0, H = 0; // CSS pixels

  function resize() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- difficulty ----
  function levelConfig(L) {
    return {
      n: Math.min(3 + (L - 1), 10),
      r: Math.max(15, Math.round(38 - (L - 1) * 2.1)),
      visible: Math.max(520, 2600 - (L - 1) * 170),
      maxMistakes: 3
    };
  }

  // ---- state ----
  var S = {
    phase: 'idle',        // idle | memorize | play | over
    level: 0,
    circles: [],          // {x,y,r,num, solved, flash, flashT}
    next: 0,              // next number to click (1-based)
    mistakes: 0,          // mistakes this level
    totalMistakes: 0,
    memorizeEnd: 0,
    levelStart: 0,
    levelTime: 0,
    totalTime: 0,
    score: 0,
    best: window.store.get('mbt_aim_best', null),
    feedbackQueue: []     // transient flashes
  };
  var transitionTimer = null;

  function statLevel() { document.getElementById('statLevel').textContent = S.phase === 'over' ? S.level : S.level || '—'; }
  function statCircles() {
    var el = document.getElementById('statCircles');
    if (S.phase === 'play' && S.circles.length) el.textContent = (S.next) + ' / ' + S.circles.length;
    else el.textContent = S.level ? levelConfig(S.level).n : '—';
  }
  function statMistakes() { document.getElementById('statMistakes').textContent = S.totalMistakes; }
  function statBest() {
    document.getElementById('statBest').textContent = S.best ? S.best.score + ' (' + S.best.level + ')' : '—';
  }

  function placeCircles(L) {
    var cfg = levelConfig(L);
    var pad = cfg.r + 14;
    var tries = 0, list = [];
    while (list.length < cfg.n && tries < 400) {
      tries++;
      var x = pad + Math.random() * (W - pad * 2);
      var y = pad + Math.random() * (H - pad * 2);
      var ok = list.every(function (c) {
        var dx = c.x - x, dy = c.y - y;
        return Math.hypot(dx, dy) >= (c.r + cfg.r + 16);
      });
      if (ok) {
        list.push({ x: x, y: y, r: cfg.r, num: list.length + 1, solved: false, flash: null, flashT: 0 });
      }
    }
    S.circles = list;
    S.next = 0;
    S.mistakes = 0;
    S.phase = 'memorize';
    S.memorizeEnd = performance.now() + cfg.visible;
  }

  function startLevel(L) {
    S.level = L;
    placeCircles(L);
    S.levelStart = performance.now();
    statLevel(); statCircles(); statMistakes();
    requestAnimationFrame(loop);
  }

  function startRun() {
    resultPanel.style.display = 'none';
    overlay.classList.add('hidden');
    S.score = 0; S.totalTime = 0; S.totalMistakes = 0; S.level = 0;
    startLevel(1);
  }

  function endRun() {
    S.phase = 'over';
    if (!S.best || S.score > S.best.score) {
      S.best = { score: S.score, level: S.level };
      window.store.set('mbt_aim_best', S.best);
    }
    var acc = S.next > 0 ? Math.round((S.next / (S.next + S.totalMistakes)) * 100) : 0;
    document.getElementById('resScore').textContent = fmt.int(S.score);
    document.getElementById('resLevel').textContent = T('aim_cleared', 'Cleared ') + S.level + (S.level === 1 ? T('aim_round1', ' round') : T('aim_roundN', ' rounds'));
    document.getElementById('resTime').textContent = T('aim_time', 'Time ') + fmt.dec(S.totalTime / 1000, 1) + 's';
    document.getElementById('resAcc').textContent = T('aim_acc', 'Accuracy ') + acc + '%';
    document.getElementById('resBest').textContent = T('aim_best', 'Best ') + S.best.score + ' (lvl ' + S.best.level + ')';
    resultPanel.style.display = 'block';
    statLevel(); statCircles(); statBest();
  }

  function hitTest(x, y) {
    for (var i = S.circles.length - 1; i >= 0; i--) {
      var c = S.circles[i];
      if (c.solved) continue;
      if (Math.hypot(c.x - x, c.y - y) <= c.r) return i;
    }
    return -1;
  }

  function flash(idx, color, ms) {
    var c = S.circles[idx];
    if (!c) return;
    c.flash = color;
    c.flashT = performance.now() + ms;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (S.phase !== 'play') return;
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    var idx = hitTest(x, y);

    if (idx === -1) {
      S.mistakes++; S.totalMistakes++;
      statMistakes();
      // generic miss flash: outline the whole stage edge
      S.feedbackQueue.push({ x: x, y: y, t: performance.now() + 500 });
      if (S.mistakes >= levelConfig(S.level).maxMistakes) { endRun(); requestAnimationFrame(loop); }
      return;
    }

    var circle = S.circles[idx];
    if (circle.num === S.next + 1) {
      circle.solved = true;
      flash(idx, '#16a34a', 240);
      S.next++;
      statCircles();
      if (S.next === S.circles.length) {
        // level cleared
        S.levelTime = performance.now() - S.levelStart;
        S.totalTime += S.levelTime;
        var cfg = levelConfig(S.level);
        var slow = Math.max(0, Math.floor((S.levelTime - cfg.n * 1200) / 25));
        S.score += cfg.n * 100 - S.mistakes * 30 - slow;
        transitionTimer = setTimeout(function () {
          if (S.phase === 'over' || S.phase === 'idle') return;
          if (S.level >= 12) { endRun(); requestAnimationFrame(loop); }
          else startLevel(S.level + 1);
        }, 900);
        S.phase = 'paused'; // block clicks during transition
      }
    } else {
      S.mistakes++; S.totalMistakes++;
      flash(idx, '#dc2626', 260);
      statMistakes();
      if (S.mistakes >= levelConfig(S.level).maxMistakes) { endRun(); requestAnimationFrame(loop); }
    }
  });

  // ---- render loop ----
  function loop(now) {
    if (S.phase === 'idle') return;
    if (S.phase === 'memorize') {
      if (now >= S.memorizeEnd) {
        S.phase = 'play';
        S.levelStart = performance.now(); // timing starts once numbers hide
      }
    }
    draw(now);
    requestAnimationFrame(loop);
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, W, H);

    var cfg = S.phase !== 'idle' ? levelConfig(S.level) : null;

    // memorize countdown ring (front and centre, easy to read at a glance)
    if (S.phase === 'memorize' && cfg) {
      var remain = Math.max(0, S.memorizeEnd - now) / cfg.visible;
      var cx = W - 46, cy = 42, rad = 21;
      ctx.fillStyle = '#0d1626';
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2a3950';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(cx, cy, rad - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, rad - 2, -Math.PI / 2, -Math.PI / 2 + remain * Math.PI * 2);
      ctx.stroke();
      ctx.lineCap = 'butt';
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(Math.ceil((cfg.visible * remain) / 1000) + 's', cx, cy + 1);
    }

    // live time spent clicking this run's circles
    if (S.phase === 'play') {
      var elapsedMs = S.totalTime + (performance.now() - S.levelStart);
      ctx.fillStyle = 'rgba(241,245,249,.85)';
      ctx.font = '700 15px system-ui, sans-serif';
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText(fmt.dec(elapsedMs / 1000, 1) + 's', W - 14, 14);
    }

    S.circles.forEach(function (c) {
      var inMemorize = S.phase === 'memorize';
      var flashCol = (c.flash && now < c.flashT) ? c.flash : null;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      if (c.solved) {
        ctx.fillStyle = '#16a34a'; ctx.fill();
        ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2; ctx.stroke();
        return;
      }
      if (flashCol) {
        ctx.fillStyle = flashCol; ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(148,163,184,.08)'; ctx.fill();
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke();
      }
      if (inMemorize) {
        ctx.fillStyle = '#f1f5f9';
        ctx.font = '700 ' + Math.round(c.r * 1.02) + 'px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(c.num), c.x, c.y + 1);
      }
    });

    // miss feedback
    S.feedbackQueue = S.feedbackQueue.filter(function (f) { return now < f.t; });
    S.feedbackQueue.forEach(function (f) {
      ctx.strokeStyle = 'rgba(220,38,38,.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 18, 0, Math.PI * 2);
      ctx.stroke();
    });

    // play instruction line
    if (S.phase === 'play') {
      ctx.fillStyle = 'rgba(241,245,249,.6)';
      ctx.font = '600 14px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(T('aim_click', 'Click ') + (S.next + 1), W / 2, 12);
    }
  }

  function resetRun() {
    clearTimeout(transitionTimer);
    S.phase = 'idle';
    S.level = 0;
    S.circles = [];
    S.next = 0;
    S.score = 0;
    S.totalTime = 0;
    S.totalMistakes = 0;
    resultPanel.style.display = 'none';
    overlay.classList.remove('hidden');
    statLevel(); statCircles(); statMistakes(); statBest();
  }

  document.getElementById('startAim').addEventListener('click', startRun);
  document.getElementById('playAgainAim').addEventListener('click', startRun);
  document.getElementById('aimReset').addEventListener('click', resetRun);
  document.getElementById('copyAim').addEventListener('click', function () {
    var text = T('aim_copy1', 'Aim & Memory Challenge — score ') + S.score + T('aim_copy2', ', cleared ') + S.level + T('aim_copy3', ' rounds, best ') +
      (S.best ? S.best.score : S.score) + T('aim_copy4', '. Beat it at MouseBench!');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { alert(T('aim_copied', 'Result copied to clipboard.')); });
    } else {
      prompt(T('aim_copy_p', 'Copy your result:'), text);
    }
  });

  statLevel(); statCircles(); statMistakes(); statBest();
})();