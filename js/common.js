/* Shared site behaviors. Vanilla JS, zero dependencies. */
(function () {
  'use strict';

  // Dropdowns (main nav + language switcher). Only one open at a time.
  function wireDropdown(toggleId, panelId) {
    var t = document.getElementById(toggleId);
    var p = document.getElementById(panelId);
    if (!t || !p) return;
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = !p.classList.contains('open');
      document.querySelectorAll('.nav-panel.open').forEach(function (el) { el.classList.remove('open'); });
      document.querySelectorAll('.nav-toggle[aria-expanded]').forEach(function (el) { el.setAttribute('aria-expanded', 'false'); });
      if (willOpen) p.classList.add('open');
      t.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!p.contains(e.target) && !t.contains(e.target)) {
        p.classList.remove('open');
        t.setAttribute('aria-expanded', 'false');
      }
    });
  }
  wireDropdown('navToggle', 'navPanel');
  wireDropdown('langToggle', 'langPanel');

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

  // Number formatting — locale derived from <html lang="…"> so decimal-comma/de/ES
  var _fmtLocale = ({de: 'de-DE', es: 'es-ES'}[document.documentElement.lang] || 'en-US');
  window.fmt = {
    int: function (n) { return Math.round(n).toLocaleString(_fmtLocale); },
    dec: function (n, d) { return n.toLocaleString(_fmtLocale, { maximumFractionDigits: d == null ? 2 : d, minimumFractionDigits: d == null ? 2 : d }); }
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