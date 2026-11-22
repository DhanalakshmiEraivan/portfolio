/* ═══════════════════════════════════════════════════════════
   QUADRA · V15 INNER PAGES
   Journey jump highlighting, gentle mockup drift, timeline
   reveal triggers and graceful image fallbacks.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function boot() {
    /* journey tabs: highlight the stage currently in view */
    var jumps = doc.querySelectorAll('.cg-jump[href^="#"]');
    if (jumps.length && 'IntersectionObserver' in window) {
      var links = {};
      Array.prototype.forEach.call(jumps, function (a) {
        links[a.getAttribute('href').slice(1)] = a;
      });
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var a = links[en.target.id];
          if (!a) return;
          Array.prototype.forEach.call(jumps, function (x) {
            x.classList.remove('is-active');
            x.removeAttribute('aria-current');
          });
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '-38% 0px -52% 0px' });
      Object.keys(links).forEach(function (id) {
        var el = doc.getElementById(id);
        if (el) spy.observe(el);
      });
    }

    /* timeline connector draws in when scrolled into view */
    var lines = doc.querySelectorAll('.v-timeline');
    if (lines.length && 'IntersectionObserver' in window) {
      var tl = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('is-in');
          tl.unobserve(en.target);
        });
      }, { threshold: 0.25 });
      Array.prototype.forEach.call(lines, function (el) { tl.observe(el); });
    }

    /* soft drift on hero visual stacks */
    if (!reduce) {
      Array.prototype.forEach.call(doc.querySelectorAll('[data-v15-drift]'), function (stack) {
        var items = stack.querySelectorAll('.v-shot, .mk-phone, .mk-browser, .mk-tablet');
        var raf = null;
        stack.addEventListener('pointermove', function (e) {
          if (raf) return;
          raf = window.requestAnimationFrame(function () {
            raf = null;
            var cx = (e.clientX / window.innerWidth - .5) * 2;
            var cy = (e.clientY / window.innerHeight - .5) * 2;
            Array.prototype.forEach.call(items, function (el, i) {
              var depth = ((i % 3) + 1) * 2.6;
              el.style.setProperty('--drift-x', (cx * depth).toFixed(2) + 'px');
              el.style.setProperty('--drift-y', (cy * depth).toFixed(2) + 'px');
            });
          });
        });
        stack.addEventListener('pointerleave', function () {
          Array.prototype.forEach.call(items, function (el) {
            el.style.setProperty('--drift-x', '0px');
            el.style.setProperty('--drift-y', '0px');
          });
        });
      });
    }

    /* graceful fallback if a photo fails to load */
    var imgs = doc.querySelectorAll('.v-shot img, .showcase-card img, .cr-intern-media img, .web-cat-media img, .ed-moment img');
    Array.prototype.forEach.call(imgs, function (img) {
      img.addEventListener('error', function () {
        if (img.parentElement) img.parentElement.classList.add('is-missing');
        img.style.display = 'none';
      });
    });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
