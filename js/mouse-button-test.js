/* Mouse Button Test — interactive diagram, double-click detection, wheel log. */
(function () {
  'use strict';

  var svg = document.getElementById('mouseDiagram');
  var logEl = document.getElementById('eventLog');
  var faultMsg = document.getElementById('faultMsg');

  var MODELS = {
    3: ['left', 'right', 'middle'],
    5: ['left', 'right', 'middle', 'back', 'fwd'],
    9: ['left', 'right', 'middle', 'back', 'fwd', 's1', 's2', 's3', 's4', 's5', 's6']
  };
  var NAME = { left: 'Left', right: 'Right', middle: 'Middle (wheel)', back: 'Side · Back', fwd: 'Side · Forward', s1: 'Thumb 1', s2: 'Thumb 2', s3: 'Thumb 3', s4: 'Thumb 4', s5: 'Thumb 5', s6: 'Thumb 6' };
  function lname(region) {
    var S = window.L10N || {};
    var k = 'btn_' + region;
    return Object.prototype.hasOwnProperty.call(S, k) ? S[k] : NAME[region];
  }

  var state = {
    model: 3,
    tested: {},            // region name -> true
    clicks: 0,
    doubles: 0,
    scroll: 0,
    log: []
  };

  var els = {};
  document.querySelectorAll('[data-region]').forEach(function (el) {
    els[el.getAttribute('data-region')] = el;
  });

  function regionEl(region) {
    return els[region] || null;
  }

  function isActive(region) {
    return MODELS[state.model].indexOf(region) !== -1;
  }

  function paint(region, fill, stroke) {
    var el = regionEl(region);
    if (!el) return;
    el.setAttribute('fill', fill);
    el.setAttribute('stroke', stroke);
  }

  function paintPressed(region) {
    paint(region, '#bfdbfe', '#2563eb');
  }
  function paintReleased(region) {
    var el = regionEl(region);
    if (!el) return;
    if (state.tested[region]) { paint(region, '#bbf7d0', '#16a34a'); }
    else { paint(region, '#ffffff', '#93c5fd'); }
  }
  function paintFault(region) {
    paint(region, '#fecaca', '#dc2626');
    setTimeout(function () {
      // restore to released state after fault flash
      paintReleased(region);
    }, 260);
  }

  function updateCoverage() {
    var active = MODELS[state.model];
    var done = active.filter(function (r) { return state.tested[r]; }).length;
    document.getElementById('coverage').textContent = done + '/' + active.length;
  }

  function popcount(u) {
    var c = 0;
    while (u) { c += u & 1; u >>= 1; }
    return c;
  }

  function pushLog(msg) {
    state.log.unshift(msg);
    if (state.log.length > 12) state.log.pop();
    logEl.innerHTML = '';
    state.log.forEach(function (line) {
      var li = document.createElement('li');
      li.textContent = line;
      logEl.appendChild(li);
    });
  }

  function ts() {
    return new Date().toTimeString().slice(0, 8);
  }

  // Wheel arrows highlight
  function arrow(dir) {
    svg.querySelector('[data-wheel="up"]').setAttribute('fill', dir === 'up' ? '#16a34a' : '#94a3b8');
    svg.querySelector('[data-wheel="down"]').setAttribute('fill', dir === 'down' ? '#16a34a' : '#94a3b8');
  }

  // ---- model switching ----
  document.querySelectorAll('.pill[data-model]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.model = parseInt(btn.getAttribute('data-model'), 10);
      document.querySelectorAll('.pill[data-model]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      svg.setAttribute('data-model', state.model);
      // repaint all regions to their correct idle/tested state
      Object.keys(els).forEach(function (r) {
        if (!isActive(r)) return;
        var el = els[r];
        el.setAttribute('fill', state.tested[r] ? '#bbf7d0' : '#ffffff');
        el.setAttribute('stroke', state.tested[r] ? '#16a34a' : '#cbd5e1');
        if (r !== 'left' && r !== 'right') { /* non-path zones keep vivid idle fill */ }
      });
      updateCoverage();
      pushLog(ts() + '  ' + T('mbt_switch', 'Switched to the ') + state.model + T('mbt_btn', '-button diagram'));
    });
  });

  // ---- input events ----
  document.addEventListener('mousedown', function (e) {
    var button = e.button;
    state.clicks++;
    document.getElementById('totalClicks').textContent = fmt.int(state.clicks);
    document.getElementById('rawButton').textContent = button;
    document.getElementById('heldBtns').textContent = popcount(e.buttons);

    // find a region for this button value on the current model
    var region = null;
    MODELS[state.model].some(function (r) {
      var el = regionEl(r);
      if (el && parseInt(el.getAttribute('data-btn'), 10) === button) { region = r; return true; }
      return false;
    });

    if (region) {
      state.tested[region] = true;
      paintPressed(region);
      updateCoverage();
      pushLog(ts() + '  ' + lname(region) + T('mbt_down', ' down (button ') + button + ')');
    } else {
      pushLog(ts() + '  ' + T('mbt_noregion1', 'Button ') + button + T('mbt_noregion2', ' pressed — no matching zone on this model'));
    }
  });

  document.addEventListener('mouseup', function (e) {
    var region = null;
    MODELS[state.model].some(function (r) {
      var el = regionEl(r);
      if (el && parseInt(el.getAttribute('data-btn'), 10) === e.button) { region = r; return true; }
      return false;
    });
    if (region) {
      paintReleased(region);
      pushLog(ts() + '  ' + lname(region) + T('mbt_up', ' up'));
    }
  });

  document.addEventListener('dblclick', function () {
    state.doubles++;
    document.getElementById('doubleClicks').textContent = fmt.int(state.doubles);
    pushLog(ts() + '  ' + T('mbt_dbl', 'Double-click detected (') + fmt.int(state.doubles) + ')');
    // hint: if doubles rise while single-clicking, likely bounce
    if (state.doubles > 1 && state.clicks < state.doubles * 2 + 3) {
      faultMsg.style.display = 'block';
      faultMsg.className = 'notice';
      faultMsg.innerHTML = T('mbt_fault', 'The double-click counter is climbing faster than your click rate — the left switch may be <strong>bouncing</strong>. Pause between single clicks and reset to confirm.');
    }
  });

  svg.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // Side buttons (3/4) trigger browser back/forward — block that default so the test stays on the page
  var side = function (e) {
    if (e.button === 3 || e.button === 4) e.preventDefault();
  };
  ['mousedown', 'mouseup', 'auxclick'].forEach(function (type) {
    document.addEventListener(type, side, true);
  });

  svg.addEventListener('wheel', function (e) {
    e.preventDefault();
    var dir = e.deltaY < 0 ? 'up' : 'down';
    arrow(dir);
    state.scroll += Math.abs(e.deltaY);
    document.getElementById('scrollDist').textContent = fmt.int(state.scroll);
    document.getElementById('lastWheel').textContent = (dir === 'up' ? T('dir_up', 'up') : T('dir_down', 'down')) + ' (Δ ' + Math.round(e.deltaY) + ')';
    document.getElementById('rawDelta').textContent = Math.round(e.deltaY) + T('mbt_mode', ' / mode ') + e.deltaMode;
    pushLog(ts() + '  ' + T('mbt_wheel', 'Wheel ') + dir + '  Δ ' + Math.round(e.deltaY));
  });

  // ---- reset ----
  document.getElementById('resetSession').addEventListener('click', function () {
    state.clicks = 0; state.doubles = 0; state.scroll = 0; state.log = []; state.tested = {};
    faultMsg.style.display = 'none';
    document.getElementById('totalClicks').textContent = '0';
    document.getElementById('doubleClicks').textContent = '0';
    document.getElementById('scrollDist').textContent = '0';
    document.getElementById('lastWheel').textContent = '—';
    document.getElementById('heldBtns').textContent = '0';
    document.getElementById('lastBtn').textContent = '—';
    document.getElementById('rawButton').textContent = '—';
    document.getElementById('rawDelta').textContent = '—';
    Object.keys(els).forEach(function (r) {
      els[r].setAttribute('fill', '#ffffff');
      els[r].setAttribute('stroke', '#cbd5e1');
    });
    arrow(null);
    pushLog(ts() + '  ' + T('mbt_reset', 'Session reset'));
  });

  updateCoverage();
  pushLog(ts() + '  ' + T('mbt_ready', 'Ready — click your mouse buttons. Right-click is enabled inside the diagram.'));
})();