/* Shared site behaviors. Vanilla JS, zero dependencies. */
(function () {
  'use strict';

  // Dropdown nav
  var toggle = document.getElementById('navToggle');
  var panel = document.getElementById('navPanel');
  if (toggle && panel) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && !toggle.contains(e.target)) panel.classList.remove('open');
    });
  }

  // Theme toggle (persists raw string, matching the inline bootstrap in <head>)
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    var rootEl = document.documentElement;
    themeBtn.setAttribute('aria-pressed', String(rootEl.getAttribute('data-theme')) === 'dark');
    themeBtn.addEventListener('click', function () {
      rootEl.classList.add('theme-switching');
      var next = String(rootEl.getAttribute('data-theme')) === 'dark' ? 'light' : 'dark';
      rootEl.setAttribute('data-theme', next);
      themeBtn.setAttribute('aria-pressed', next === 'dark');
      try { localStorage.setItem('mbt', next); } catch (e) {}
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          rootEl.classList.remove('theme-switching');
        });
      });
    });
  }

  // Prefers-reduced-motion respect
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Number formatting
  window.fmt = {
    int: function (n) { return Math.round(n).toLocaleString('en-US'); },
    dec: function (n, d) { return n.toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d, minimumFractionDigits: d == null ? 2 : d }); }
  };

  // Safe localStorage helpers (private browsing may throw)
  window.store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ }
    }
  };

  // Live-string localization. Spanish pages set window.L10N before their tool
  // script runs; T(key, englishFallback) returns the translation when present.
  window.T = function (key, en) {
    var d = window.L10N;
    return (d && Object.prototype.hasOwnProperty.call(d, key)) ? d[key] : en;
  };

  // Simple helper to animate a numeric value toward a target (for live CPS meters)
  window.animateTo = function (target, cb, duration) {
    var start = performance.now();
    var from = cb.target !== undefined ? cb.target : 0;
    cb.target = target;
    function tick(now) {
      var t = Math.min(1, (now - start) / (duration || 120));
      var eased = 1 - Math.pow(1 - t, 3);
      cb(from + (target - from) * eased);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  // Returns a random integer in [min, max]
  window.randInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
})();