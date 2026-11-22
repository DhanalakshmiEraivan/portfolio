/* ═══════════════════════════════════════════════════════════
   QUADRA · CORE
   Navigation, reveals, cinematic work stack, video and dialogs.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var Q = window.Quadra = window.Quadra || {};
  var doc = document;
  var root = doc.documentElement;

  Q.$ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  Q.$$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));
  };
  Q.reduced = function () {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  Q.saveData = function () {
    var c = navigator.connection;
    return !!(c && (c.saveData || /2g/.test(c.effectiveType || '')));
  };
  Q.clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };
  Q.on = function (el, ev, fn, opts) {
    if (el) el.addEventListener(ev, fn, opts || false);
  };
  Q.ready = function (fn) {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  /* ── Header state ──────────────────────────────────────── */
  function header() {
    var el = Q.$('#siteHeader');
    if (!el) return;
    var update = function () {
      el.classList.toggle('is-scrolled', window.scrollY > 36);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ── Split headings into words ─────────────────────────── */
  function splitHeadings() {
    Q.$$('[data-split]').forEach(function (heading) {
      if (heading.dataset.split === 'done') return;
      var index = 0;
      var walker = doc.createTreeWalker(heading, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);

      nodes.forEach(function (node) {
        var text = node.nodeValue;
        if (!text || !text.trim()) return;
        var frag = doc.createDocumentFragment();
        text.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(doc.createTextNode(' '));
            return;
          }
          var word = doc.createElement('span');
          word.className = 'w';
          var inner = doc.createElement('span');
          inner.className = 'w-i';
          inner.style.setProperty('--i', index++);
          inner.textContent = part;
          word.appendChild(inner);
          frag.appendChild(word);
        });
        node.parentNode.replaceChild(frag, node);
      });
      heading.dataset.split = 'done';
    });
  }

  /* ── Reveals ───────────────────────────────────────────── */
  function reveals() {
    var targets = Q.$$('[data-reveal], [data-split]');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseFloat(el.getAttribute('data-delay') || '0');
        if (delay) {
          el.style.transitionDelay = delay + 'ms';
          setTimeout(function () { el.style.transitionDelay = ''; }, delay + 1600);
        }
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -9% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }

  function workReveals() {
    var items = Q.$$('[data-work-item]');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── Mobile menu ───────────────────────────────────────── */
  function menu() {
    var wrap = Q.$('#mobileMenu');
    var burger = Q.$('.nav-burger');
    if (!wrap || !burger) return;
    var sheet = Q.$('.mobile-sheet', wrap);
    var isOpen = false;
    var lastFocus = null;

    function focusable() {
      return Q.$$('a[href], button:not([disabled])', sheet).filter(function (el) {
        return el.offsetParent !== null;
      });
    }
    function open() {
      lastFocus = doc.activeElement;
      isOpen = true;
      wrap.classList.add('is-open');
      wrap.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      doc.body.classList.add('menu-open');
      setTimeout(function () {
        var close = Q.$('.mobile-close', wrap);
        if (close) close.focus();
      }, 90);
    }
    function close() {
      if (!isOpen) return;
      isOpen = false;
      wrap.classList.remove('is-open');
      wrap.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      doc.body.classList.remove('menu-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    Q.on(burger, 'click', function () { isOpen ? close() : open(); });
    Q.$$('[data-menu-close]', wrap).forEach(function (el) {
      Q.on(el, 'click', close);
    });
    Q.$$('.mobile-nav a', wrap).forEach(function (a) { Q.on(a, 'click', close); });

    doc.addEventListener('keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusable();
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (isOpen && window.innerWidth > 980) close();
    });
  }

  /* ── Scroll spy ────────────────────────────────────────── */
  function scrollSpy() {
    var links = Q.$$('.nav-primary .nav-link[data-spy]');
    if (!links.length) return;
    var sections = links.map(function (a) {
      return doc.getElementById(a.getAttribute('data-spy'));
    }).filter(Boolean);
    var ticking = false;

    function update() {
      ticking = false;
      var line = window.scrollY + window.innerHeight * 0.38;
      var found = null;
      sections.forEach(function (s) {
        var top = s.getBoundingClientRect().top + window.scrollY;
        if (top <= line) found = s;
      });
      links.forEach(function (a) {
        var on = !!found && a.getAttribute('data-spy') === found.id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }

  /* ── Hero video ────────────────────────────────────────── */
  function heroVideo() {
    var video = Q.$('#heroVideo');
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    var ready = function () { video.classList.add('is-ready'); };
    var play = function () {
      if (!video.paused) return;
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () {});
    };

    video.addEventListener('loadeddata', ready);
    video.addEventListener('playing', ready);
    video.addEventListener('canplay', play);
    video.addEventListener('error', ready);
    video.addEventListener('stalled', play);
    setTimeout(ready, 3200);

    // autoplay can be refused until the first gesture; retry quietly
    doc.addEventListener('pointerdown', play, { passive: true });
    doc.addEventListener('keydown', play);

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) video.pause();
      else play();
    });
    window.addEventListener('pageshow', play);
    window.addEventListener('focus', play);

    play();
  }

  /* ── Lazy background videos ────────────────────────────── */
  function lazyVideos() {
    var videos = Q.$$('video[data-src]');
    if (!videos.length) return;
    var off = Q.reduced() || Q.saveData();

    videos.forEach(function (video) {
      if (off) return;
      var loaded = false;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!loaded) {
              loaded = true;
              video.src = video.getAttribute('data-src');
              video.load();
            }
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
          } else {
            video.pause();
          }
        });
      }, { rootMargin: '280px 0px', threshold: 0.01 });
      io.observe(video);
      video.addEventListener('playing', function () { video.classList.add('is-ready'); });
      video.addEventListener('error', function () { video.classList.remove('is-ready'); });
    });

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) {
        videos.forEach(function (v) { v.pause(); });
      }
    });
  }

  /* ── Scroll-driven stack + parallax ────────────────────── */
  function scrollMotion() {
    var cards = Q.$$('[data-work-card]');
    var parallax = Q.$$('[data-parallax]');
    if (!cards.length && !parallax.length) return;

    var ticking = false;
    var stickyQuery = window.matchMedia('(min-width: 901px)');

    function update() {
      ticking = false;
      var vh = window.innerHeight;

      if (!Q.reduced() && stickyQuery.matches) {
        cards.forEach(function (card, i) {
          var next = cards[i + 1];
          if (!next) {
            card.style.setProperty('--cover', '0');
            return;
          }
          var cardTop = card.getBoundingClientRect().top;
          var nextTop = next.getBoundingClientRect().top;
          var start = vh * 0.94;
          var end = cardTop + 16;
          var span = Math.max(80, start - end);
          var p = Q.clamp((start - nextTop) / span, 0, 1);
          card.style.setProperty('--cover', p.toFixed(3));
        });
      } else {
        cards.forEach(function (card) { card.style.setProperty('--cover', '0'); });
      }

      if (!Q.reduced()) {
        parallax.forEach(function (el) {
          var host = el.closest('[data-parallax-host]') || el.parentElement;
          if (!host) return;
          var r = host.getBoundingClientRect();
          if (r.bottom < -120 || r.top > vh + 120) return;
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.08;
          var offset = ((r.top + r.height / 2) - vh / 2) / vh * speed * 220;
          el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
        });
      }
    }

    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
  }

  /* ── Card spotlight ────────────────────────────────────── */
  function spotlight() {
    if (window.matchMedia('(hover: none)').matches) return;
    Q.$$('[data-work-card]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ── Dialogs ───────────────────────────────────────────── */
  function dialogs() {
    var dlg = Q.$('#siteDialog');
    if (!dlg) return;
    var content = Q.$('[data-dialog-content]', dlg);
    var closeBtn = Q.$('.dialog-close', dlg);
    var lastFocus = null;
    var reel = Q.$('#studioReel');

    function pauseVideos() {
      Q.$$('video', content).forEach(function (v) { v.pause(); });
      if (reel) reel.pause();
    }
    function resumeReel() {
      if (!reel || Q.reduced() || Q.saveData()) return;
      var p = reel.play();
      if (p && p.catch) p.catch(function () {});
    }

    function open(id, trigger) {
      var tpl = doc.getElementById(id);
      if (!tpl) return;
      lastFocus = trigger || doc.activeElement;
      content.innerHTML = '';
      content.appendChild(tpl.content.cloneNode(true));
      dlg.classList.toggle('dialog--video', id === 'tpl-reel');
      if (typeof dlg.showModal === 'function') {
        if (!dlg.open) dlg.showModal();
      } else {
        dlg.setAttribute('open', '');
      }
      doc.body.classList.add('modal-open');
      pauseVideos();
      var video = Q.$('video', content);
      if (video) {
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
      }
      if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 60);
    }

    function close() {
      var video = Q.$('video', content);
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
      if (typeof dlg.close === 'function' && dlg.open) dlg.close();
      else dlg.removeAttribute('open');
      doc.body.classList.remove('modal-open');
      content.innerHTML = '';
      resumeReel();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    Q.$$('[data-dialog]').forEach(function (btn) {
      Q.on(btn, 'click', function () {
        open('tpl-' + btn.getAttribute('data-dialog'), btn);
      });
    });

    Q.on(closeBtn, 'click', close);
    Q.on(dlg, 'click', function (e) { if (e.target === dlg) close(); });
    Q.on(dlg, 'cancel', function (e) { e.preventDefault(); close(); });
    Q.on(dlg, 'close', function () {
      doc.body.classList.remove('modal-open');
      if (content) content.innerHTML = '';
    });
    Q.on(content, 'click', function (e) {
      var link = e.target.closest('[data-close-dialog]');
      if (!link) return;
      e.preventDefault();
      close();
      setTimeout(function () {
        var contact = doc.getElementById('contact');
        if (contact) contact.scrollIntoView({ behavior: Q.reduced() ? 'auto' : 'smooth' });
      }, 80);
    });
  }

  /* ── Copy email ────────────────────────────────────────── */
  function copyEmail() {
    Q.$$('[data-copy]').forEach(function (btn) {
      var label = Q.$('[data-copy-label]', btn) || btn;
      var initial = label.textContent;
      var timer = null;
      function done() {
        label.textContent = 'Copied';
        btn.classList.add('is-copied');
        clearTimeout(timer);
        timer = setTimeout(function () {
          label.textContent = initial;
          btn.classList.remove('is-copied');
        }, 2200);
      }
      Q.on(btn, 'click', function () {
        var text = btn.getAttribute('data-copy');
        function fallback() {
          var ta = doc.createElement('textarea');
          ta.value = text;
          ta.setAttribute('readonly', '');
          ta.style.position = 'fixed';
          ta.style.top = '-1000px';
          ta.style.opacity = '0';
          doc.body.appendChild(ta);
          ta.select();
          try { doc.execCommand('copy'); done(); } catch (err) { /* no-op */ }
          doc.body.removeChild(ta);
        }
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done).catch(fallback);
        } else {
          fallback();
        }
      });
    });
  }

  /* ── Magnetic buttons ──────────────────────────────────── */
  function magnetic() {
    if (Q.reduced() || window.matchMedia('(hover: none)').matches) return;
    Q.$$('[data-magnetic]').forEach(function (el) {
      var strength = 9;
      Q.on(el, 'pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * strength * 2;
        var y = ((e.clientY - r.top) / r.height - 0.5) * strength;
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      });
      var reset = function () { el.style.transform = ''; };
      Q.on(el, 'pointerleave', reset);
      Q.on(el, 'blur', reset);
    });
  }

  /* ── Marquee (single line, seamless) ───────────────────── */
  function marquees() {
    Q.$$('[data-marquee]').forEach(function (wrap) {
      var track = Q.$('[data-marquee-track]', wrap);
      var group = Q.$('[data-marquee-group]', wrap);
      if (!track || !group) return;
      var targetWidth = wrap.clientWidth || window.innerWidth;
      var firstHalf = [group];
      var guard = 0;

      while (track.scrollWidth < targetWidth && guard < 8) {
        var copy = group.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.removeAttribute('data-marquee-group');
        track.appendChild(copy);
        firstHalf.push(copy);
        guard++;
      }
      firstHalf.forEach(function (node) {
        var clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.removeAttribute('data-marquee-group');
        track.appendChild(clone);
      });
    });
  }

  /* ── Footer wordmark ───────────────────────────────────── */
  function footerStage() {
    var mark = Q.$('[data-footer-wordmark]');
    if (!mark) return;
    var label = (mark.textContent || '').trim();
    if (!label) return;
    var stage = mark.closest('[data-footer-stage]') || mark.parentElement;
    mark.textContent = '';

    label.split('').forEach(function (ch, i) {
      var span = doc.createElement('span');
      span.className = 'fw-letter';
      span.style.setProperty('--li', i);
      span.setAttribute('aria-hidden', 'true');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      mark.appendChild(span);
    });

    if (Q.reduced() || !('IntersectionObserver' in window)) {
      if (stage) stage.classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (stage) stage.classList.add('is-in');
        io.disconnect();
      });
    }, { threshold: 0.16 });
    io.observe(mark);
  }

  /* ── Year ──────────────────────────────────────────────── */
  function year() {
    var now = new Date().getFullYear();
    Q.$$('.footer-bottom span[data-year]').forEach(function (el) { el.textContent = now; });
  }

  Q.start = function () {
    root.classList.add('is-ready', 'is-loaded');
    header();
    splitHeadings();
    reveals();
    workReveals();
    footerStage();
    menu();
    scrollSpy();
    heroVideo();
    lazyVideos();
    scrollMotion();
    spotlight();
    dialogs();
    copyEmail();
    magnetic();
    marquees();
    year();
  };
})();
