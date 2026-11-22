/* ═══════════════════════════════════════════════════════════
   QUADRA · MOTION
   Text systems, cursor, circular gallery, stacked reviews,
   typing rotators and draggable stamp.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var Q = window.Quadra;
  if (!Q) return;
  var doc = document;

  var reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function mod(n, m) { return ((n % m) + m) % m; }
  function canHover() { return fineMQ.matches && !reducedMQ.matches; }
  function isReduced() { return reducedMQ.matches; }
  function raf(fn) { return window.requestAnimationFrame(fn); }

  /* ── Rotating roles ────────────────────────────────────── */
  function rotatingRoles() {
    var el = Q.$('[data-rotator]');
    if (!el) return;
    var words = ['AI products', 'data platforms', 'developer tools', 'design systems'];
    var idx = 0;
    var busy = false;
    var visible = true;
    var timer = null;

    function cycle() {
      if (busy || !visible || doc.hidden || reducedMQ.matches) return;
      var current = Q.$('.rotator-word', el);
      if (!current) return;
      busy = true;
      current.classList.add('is-out');
      setTimeout(function () {
        idx = (idx + 1) % words.length;
        var next = doc.createElement('span');
        next.className = 'rotator-word is-in';
        next.textContent = words[idx];
        el.innerHTML = '';
        el.appendChild(next);
        busy = false;
      }, 540);
    }

    timer = window.setInterval(cycle, 4200);
    if (el.closest('.hero')) {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
        }, { threshold: 0.1 }).observe(el.closest('.hero'));
      }
    }
    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) window.clearInterval(timer);
      else timer = window.setInterval(cycle, 4200);
    });
  }

  /* ── Variable proximity lead ───────────────────────────── */
  function splitWords(el, charClass) {
    var text = el.textContent || '';
    var chars = [];
    el.textContent = '';
    var frag = doc.createDocumentFragment();
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(doc.createTextNode(' '));
        return;
      }
      var word = doc.createElement('span');
      word.className = 'prox-word';
      for (var i = 0; i < part.length; i++) {
        var ch = doc.createElement('span');
        ch.className = charClass;
        ch.textContent = part.charAt(i);
        word.appendChild(ch);
        chars.push(ch);
      }
      frag.appendChild(word);
    });
    el.appendChild(frag);
    return chars;
  }

  function proximity() {
    var lead = Q.$('[data-proximity]');
    if (!lead || !fineMQ.matches || reducedMQ.matches) return;
    var chars = splitWords(lead, 'prox-char');
    if (!chars.length) return;
    var centers = [];
    var near = [];
    var mx = -9999;
    var my = -9999;
    var ticking = false;
    var hero = lead.closest('.hero') || lead;
    var radius = 130;

    function measure() {
      centers = chars.map(function (c) {
        var r = c.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
    }

    function paint() {
      ticking = false;
      for (var i = 0; i < chars.length; i++) {
        var c = centers[i];
        if (!c) continue;
        var dx = mx - c[0];
        var dy = my - c[1];
        var d = Math.sqrt(dx * dx + dy * dy);
        var v = d < radius ? 1 - d / radius : 0;
        v = v * v * (3 - 2 * v);
        if (v < 0.004) v = 0;
        if (Math.abs(v - near[i]) < 0.025) continue;
        near[i] = v;
        chars[i].style.setProperty('--near', v.toFixed(3));
      }
    }

    function request() {
      if (ticking) return;
      ticking = true;
      raf(paint);
    }

    function reset() {
      mx = my = -9999;
      for (var i = 0; i < chars.length; i++) {
        if (near[i]) {
          near[i] = 0;
          chars[i].style.setProperty('--near', '0');
        }
      }
    }

    hero.addEventListener('pointerenter', measure);
    hero.addEventListener('pointermove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      request();
    }, { passive: true });
    hero.addEventListener('pointerleave', reset);
    window.addEventListener('resize', function () {
      measure();
      reset();
    });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);
    measure();
    window.setTimeout(measure, 2800);
  }

  /* ── Warp-on-hover capability titles ───────────────────── */
  function warpText() {
    if (!fineMQ.matches || reducedMQ.matches) return;
    Q.$$('.cap').forEach(function (cap) {
      var h = Q.$('h3', cap);
      if (!h) return;
      var chars = splitWords(h, 'warp-char');
      if (!chars.length) return;
      var centers = [];
      var active = [];

      function measure() {
        centers = chars.map(function (c) {
          var r = c.getBoundingClientRect();
          return [r.left + r.width / 2, r.top + r.height / 2];
        });
      }

      function reset() {
        chars.forEach(function (c, i) {
          if (!active[i]) return;
          active[i] = false;
          c.style.setProperty('--wx', '0');
          c.style.setProperty('--wy', '0');
          c.style.setProperty('--ws', '0');
        });
      }

      cap.addEventListener('pointerenter', measure);
      cap.addEventListener('pointermove', function (e) {
        if (!centers.length) measure();
        for (var i = 0; i < chars.length; i++) {
          var c = centers[i];
          if (!c) continue;
          var dx = e.clientX - c[0];
          var dy = e.clientY - c[1];
          var d = Math.sqrt(dx * dx + dy * dy);
          var v = d < 110 ? (1 - d / 110) * (1 - d / 110) : 0;
          if (v < 0.01) {
            if (active[i]) {
              active[i] = false;
              chars[i].style.setProperty('--wx', '0');
              chars[i].style.setProperty('--wy', '0');
              chars[i].style.setProperty('--ws', '0');
            }
            continue;
          }
          active[i] = true;
          chars[i].style.setProperty('--wx', ((dx > 0 ? 1 : -1) * v * 2.2).toFixed(2));
          chars[i].style.setProperty('--wy', (-v * 2.8).toFixed(2));
          chars[i].style.setProperty('--ws', (v * 0.9).toFixed(2));
        }
      }, { passive: true });
      cap.addEventListener('pointerleave', reset);
      window.addEventListener('resize', function () {
        measure();
        reset();
      });
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(measure);
    });
  }

  /* ── Shatter type on the work heading ──────────────────── */
  function shatterType() {
    var accents = Q.$$('[data-shatter]');
    if (!accents.length || reducedMQ.matches) return;

    accents.forEach(function (acc) {
      var walker = doc.createTreeWalker(acc, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      var count = 0;

      nodes.forEach(function (node) {
        var text = node.nodeValue;
        if (!text || !text.trim()) return;
        var frag = doc.createDocumentFragment();
        for (var i = 0; i < text.length; i++) {
          var ch = text.charAt(i);
          if (/\s/.test(ch)) {
            frag.appendChild(doc.createTextNode(ch));
            continue;
          }
          var shard = doc.createElement('span');
          shard.className = 'shard';
          shard.style.setProperty('--i', count);
          shard.style.setProperty('--dx', ((count % 3) - 1) * 2 + 'px');
          shard.style.setProperty('--dy', -(3 + (count % 4)) + 'px');
          shard.style.setProperty('--rot', ((count % 5) - 2) * 1.8 + 'deg');
          shard.textContent = ch;
          frag.appendChild(shard);
          count++;
        }
        node.parentNode.replaceChild(frag, node);
      });

      var heading = acc.closest('h2') || acc;
      var timer = null;
      function fire() {
        if (reducedMQ.matches) return;
        acc.classList.remove('is-shatter');
        void acc.offsetWidth;
        acc.classList.add('is-shatter');
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          acc.classList.remove('is-shatter');
        }, 1100);
      }
      heading.addEventListener('pointerenter', fire);
      heading.addEventListener('focusin', fire);
    });
  }

  /* ── Magic buttons ─────────────────────────────────────── */
  function magicButtons() {
    if (!canHover()) return;
    Q.$$('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ── Hero reflective card tilt ─────────────────────────── */
  function heroTilt() {
    var host = Q.$('[data-tilt]');
    if (!host || !canHover()) return;
    var media = Q.$('[data-tilt-media]', host) || host;
    var sheen = host;

    function move(e) {
      var r = host.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      media.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
      media.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg');
      sheen.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1));
      sheen.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1));
    }
    function reset() {
      media.style.setProperty('--ry', '0deg');
      media.style.setProperty('--rx', '0deg');
      sheen.style.setProperty('--gx', '50');
      sheen.style.setProperty('--gy', '50');
    }
    host.addEventListener('pointermove', move, { passive: true });
    host.addEventListener('pointerleave', reset);
    host.addEventListener('blur', reset, true);
  }

  /* ── Ghost cursor ──────────────────────────────────────── */
  function ghostCursor() {
    var el = Q.$('[data-ghost]');
    if (!el || !canHover()) return;
    var ring = Q.$('.ghost-ring', el);
    var dot = Q.$('.ghost-dot', el);
    var label = Q.$('[data-ghost-label]', el);
    var hero = Q.$('.hero');
    if (!ring || !dot) return;

    var tx = -100;
    var ty = -100;
    var rx = tx;
    var ry = ty;
    var dx = tx;
    var dy = ty;
    var running = false;
    var visible = false;

    function frame() {
      running = false;
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      dx += (tx - dx) * 0.38;
      dy += (ty - dy) * 0.38;
      ring.style.transform = 'translate3d(' + rx.toFixed(1) + 'px,' + ry.toFixed(1) + 'px,0)';
      dot.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      if (visible) running = raf(frame);
    }

    function kick() {
      if (!running) running = raf(frame);
    }

    function hide() {
      visible = false;
      el.classList.remove('is-visible', 'is-label', 'is-text');
    }

    document.addEventListener('pointermove', function (e) {
      if (!fineMQ.matches || reducedMQ.matches || e.pointerType === 'touch') return;
      if (!hero || !hero.contains(e.target)) {
        hide();
        return;
      }
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        rx = tx;
        ry = ty;
        dx = tx;
        dy = ty;
        visible = true;
        el.classList.add('is-visible');
      }

      var labelled = e.target.closest('[data-cursor-label]');
      var isText = e.target.closest('[data-cursor-text]');
      var interactive = e.target.closest('a, button');
      var text = labelled ? labelled.getAttribute('data-cursor-label') : (interactive ? 'Go' : '');
      if (label) label.textContent = text || '';
      el.classList.toggle('is-label', !!text);
      el.classList.toggle('is-text', !text && !!isText);
      kick();
    }, { passive: true });

    document.addEventListener('pointerdown', function () {
      if (visible) el.classList.add('is-down');
    });
    document.addEventListener('pointerup', function () {
      el.classList.remove('is-down');
    });
    document.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', function () {
      if (!hero) return;
      var r = hero.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) hide();
    }, { passive: true });
  }

  /* ── Folder archive ────────────────────────────────────── */
  function folder() {
    var box = Q.$('[data-folder]');
    if (!box) return;
    var toggle = Q.$('[data-folder-toggle]', box);
    var files = Q.$('.folder-files', box);
    if (!toggle || !files) return;
    var open = false;

    function set(state, refocus) {
      open = state;
      box.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      files.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (!open && refocus) toggle.focus();
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      set(!open, false);
    });

    Q.$$('a, [data-dialog]', files).forEach(function (el) {
      el.addEventListener('click', function () { set(false, false); });
    });

    document.addEventListener('click', function (e) {
      if (open && !box.contains(e.target)) set(false, false);
    });
    document.addEventListener('keydown', function (e) {
      if (open && e.key === 'Escape') set(false, true);
    });
  }

  /* ── Circular gallery + lightbox ───────────────────────── */
  function circularGallery() {
    var stage = Q.$('[data-gallery-stage]');
    if (!stage) return;
    var slots = Q.$$('[data-ring-slot]', stage);
    var cards = Q.$$('[data-ring-card]', stage);
    var n = cards.length;
    if (!n) return;

    var titleEl = Q.$('[data-ring-title]');
    var metaEl = Q.$('[data-ring-meta]');
    var indexEl = Q.$('[data-ring-index]');
    var prevBtn = Q.$('[data-ring-prev]');
    var nextBtn = Q.$('[data-ring-next]');

    var rotation = 0;
    var target = 0;
    var index = -1;
    var running = false;
    var started = false;
    var live = false;
    var dragging = false;
    var moved = false;
    var suppress = false;
    var startX = 0;
    var startY = 0;
    var lastX = 0;
    var lastT = 0;
    var velocity = 0;
    var wheelTimer = null;

    function step() { return (Math.PI * 2) / n; }

    function metrics() {
      var w = stage.clientWidth || 1;
      var h = stage.clientHeight || 1;
      var spread = w < 720 ? w * 0.24 : Math.min(w * 0.31, 620);
      var lift = clamp(h * 0.045, 16, 40);
      var radius = w < 720 ? 14 : 15;
      return { spread: spread, lift: lift, radius: radius };
    }

    function activeFrom(rot) {
      return mod(Math.round(-rot / step()), n);
    }

    function updateInfo() {
      var card = cards[index];
      if (!card) return;
      var title = card.getAttribute('data-title') || '';
      if (titleEl) titleEl.textContent = title;
      if (metaEl) metaEl.textContent = card.getAttribute('data-meta') || '';
      if (indexEl) indexEl.textContent = pad(index + 1);
      cards.forEach(function (c, i) {
        var t = c.getAttribute('data-title') || '';
        c.setAttribute('aria-label', i === index ? 'Open ' + t + ' study' : 'Bring ' + t + ' to the front');
      });
    }

    function render() {
      var m = metrics();
      var s = step();
      var nextIndex = activeFrom(rotation);

      for (var i = 0; i < n; i++) {
        var angle = i * s + rotation;
        var norm = Math.atan2(Math.sin(angle), Math.cos(angle));
        var depth = Math.cos(norm);
        var x = Math.sin(angle) * m.spread;
        var y = -(1 - Math.cos(angle)) * m.lift;
        var scale = 1 - (Math.abs(norm) / Math.PI) * 0.42;
        var opacity = depth < -0.15 ? 0 : clamp(0.74 + depth * 0.28, 0.42, 1);
        var slot = slots[i];
        if (!slot) continue;
        slot.style.transform =
          'translate(-50%, -50%) translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' +
          ' rotate(' + (norm * m.radius).toFixed(2) + 'deg)' +
          ' rotateY(' + (-norm * 6).toFixed(2) + 'deg)' +
          ' scale(' + scale.toFixed(3) + ')';
        slot.style.opacity = opacity.toFixed(3);
        slot.style.zIndex = String(10 + Math.round(depth * 10));
        slot.style.pointerEvents = opacity > 0.34 ? 'auto' : 'none';
        slot.classList.toggle('is-active', i === nextIndex);
        var card = cards[i];
        if (card) card.tabIndex = opacity > 0.5 ? 0 : -1;
      }

      if (nextIndex !== index) {
        index = nextIndex;
        updateInfo();
      }
    }

    function loop() {
      running = false;
      if (!live) return;
      if (!dragging) {
        var diff = target - rotation;
        if (reducedMQ.matches) {
          rotation = target;
        } else {
          rotation += diff * 0.13;
          if (Math.abs(diff) < 0.0008) rotation = target;
        }
      }
      render();
      if (!reducedMQ.matches && Math.abs(target - rotation) > 0.0008) kick();
    }

    function kick() {
      if (running || !live) return;
      running = true;
      raf(loop);
    }

    function goTo(i) {
      var s = step();
      var desired = -mod(i, n) * s;
      var turns = Math.round((rotation - desired) / (Math.PI * 2));
      target = desired + turns * Math.PI * 2;
      kick();
    }

    function stepBy(dir) {
      var s = step();
      var current = mod(Math.round(-target / s), n);
      goTo(mod(current + dir, n));
    }

    /* Auto-advance — pauses for hover, focus, drag, hidden tab and reduced motion */
    var autoTimer = null;
    var hovered = false;
    var focused = false;
    var resumeAt = 0;
    var AUTO_MS = 5200;

    function autoOk() {
      return live && !reducedMQ.matches && !dragging && !hovered && !focused && !doc.hidden &&
        !document.body.classList.contains('modal-open') &&
        (!window.performance || window.performance.now() >= resumeAt);
    }

    function scheduleAuto() {
      window.clearTimeout(autoTimer);
      autoTimer = null;
      if (!autoOk()) return;
      autoTimer = window.setTimeout(function () {
        autoTimer = null;
        if (!autoOk()) { scheduleAuto(); return; }
        stepBy(1);
        scheduleAuto();
      }, AUTO_MS);
    }

    function holdAuto(ms) {
      resumeAt = (window.performance ? window.performance.now() : Date.now()) + (ms || 0);
      scheduleAuto();
    }

    stage.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') { hovered = true; scheduleAuto(); }
    });
    stage.addEventListener('pointerleave', function () {
      hovered = false;
      scheduleAuto();
    });
    stage.addEventListener('focusin', function () {
      focused = true;
      scheduleAuto();
    });
    stage.addEventListener('focusout', function (e) {
      if (!stage.contains(e.relatedTarget)) {
        focused = false;
        scheduleAuto();
      }
    });
    doc.addEventListener('visibilitychange', scheduleAuto);
    reducedMQ.addEventListener('change', scheduleAuto);

    /* Drag */
    stage.addEventListener('pointerdown', function (e) {
      if (!live) return;
      if (e.target.closest('.gallery-arrow')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = e.clientX;
      startY = e.clientY;
      lastT = window.performance.now();
      velocity = 0;
      target = rotation;
      stage.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!moved) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
          dragging = false;
          stage.classList.remove('is-dragging');
          return;
        }
        if (Math.abs(dx) < 6) return;
        moved = true;
      }
      var delta = e.clientX - lastX;
      rotation += delta * 0.006;
      lastX = e.clientX;
      var now = window.performance.now();
      velocity = delta / Math.max(16, now - lastT);
      lastT = now;
      render();
    }, { passive: true });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      if (!moved) return;
      suppress = true;
      window.setTimeout(function () { suppress = false; }, 80);
      var s = step();
      var glide = clamp(velocity * 9, -s * 0.7, s * 0.7);
      target = Math.round((rotation + glide) / s) * s;
      kick();
      holdAuto(7000);
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    stage.addEventListener('click', function (e) {
      if (!suppress) return;
      e.stopPropagation();
      e.preventDefault();
      suppress = false;
    }, true);

    stage.addEventListener('wheel', function (e) {
      if (!live) return;
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 0.9) return;
      e.preventDefault();
      rotation -= e.deltaX * 0.0028;
      target = rotation;
      render();
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(function () {
        var s = step();
        target = Math.round(rotation / s) * s;
        kick();
        holdAuto(7000);
      }, 120);
    }, { passive: false });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBy(-1);
        holdAuto(9000);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepBy(1);
        holdAuto(9000);
      }
    });

    if (prevBtn) prevBtn.addEventListener('click', function () { stepBy(-1); holdAuto(9000); });
    if (nextBtn) nextBtn.addEventListener('click', function () { stepBy(1); holdAuto(9000); });

    cards.forEach(function (card, i) {
      card.addEventListener('click', function () {
        holdAuto(9000);
        if (i !== index) {
          goTo(i);
          return;
        }
        openLightbox(i);
      });
    });

    /* Resize */
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        render();
      }, 120);
    });

    /* Lightbox */
    var lightbox = Q.$('#lightbox');
    var lbImg = Q.$('[data-lightbox-img]', lightbox || doc);
    var lbTitle = Q.$('[data-lightbox-title]', lightbox || doc);
    var lbMeta = Q.$('[data-lightbox-meta]', lightbox || doc);
    var lbCount = Q.$('[data-lightbox-count]', lightbox || doc);
    var lbPrev = Q.$('[data-lightbox-prev]', lightbox || doc);
    var lbNext = Q.$('[data-lightbox-next]', lightbox || doc);
    var lbClose = Q.$('.lightbox-close', lightbox || doc);
    var lbTrigger = null;
    var lbIndex = 0;

    function paintLightbox() {
      var card = cards[lbIndex];
      if (!card || !lightbox) return;
      var img = Q.$('img', card);
      if (img && lbImg) {
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt || '';
      }
      if (lbTitle) lbTitle.textContent = card.getAttribute('data-title') || '';
      if (lbMeta) lbMeta.textContent = card.getAttribute('data-meta') || '';
      if (lbCount) lbCount.textContent = pad(lbIndex + 1) + ' / ' + pad(n);
    }

    function openLightbox(i) {
      if (!lightbox) {
        goTo(i);
        return;
      }
      lbIndex = i;
      lbTrigger = cards[i];
      paintLightbox();
      if (typeof lightbox.showModal === 'function') {
        if (!lightbox.open) lightbox.showModal();
      } else {
        lightbox.setAttribute('open', '');
      }
      document.body.classList.add('modal-open');
      if (lbClose) window.setTimeout(function () { lbClose.focus(); }, 60);
    }

    function closeLightbox() {
      if (!lightbox) return;
      if (typeof lightbox.close === 'function' && lightbox.open) lightbox.close();
      else lightbox.removeAttribute('open');
    }

    if (lightbox) {
      if (lbClose) lbClose.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
      });
      lightbox.addEventListener('cancel', function (e) {
        e.preventDefault();
        closeLightbox();
      });
      lightbox.addEventListener('close', function () {
        document.body.classList.remove('modal-open');
        if (lbTrigger && lbTrigger.focus) lbTrigger.focus();
      });
      if (lbPrev) lbPrev.addEventListener('click', function () {
        lbIndex = mod(lbIndex - 1, n);
        paintLightbox();
      });
      if (lbNext) lbNext.addEventListener('click', function () {
        lbIndex = mod(lbIndex + 1, n);
        paintLightbox();
      });
      lightbox.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          lbIndex = mod(lbIndex - 1, n);
          paintLightbox();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          lbIndex = mod(lbIndex + 1, n);
          paintLightbox();
        }
      });
    }

    /* Boot gallery */
    render();
    updateInfo();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var entry = entries[0];
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            live = true;
            stage.classList.add('is-live');
            render();
          }
          live = true;
          kick();
          scheduleAuto();
        } else {
          live = false;
          window.clearTimeout(autoTimer);
        }
      }, { threshold: 0.14 }).observe(stage);
    } else {
      started = true;
      live = true;
      stage.classList.add('is-live');
      scheduleAuto();
    }
  }

  /* ── Scroll-stacked review cards ───────────────────────── */
  function reviews() {
    var stack = Q.$('[data-reviews]');
    if (!stack) return;
    var cards = Q.$$('[data-tcard]', stack);
    if (!cards.length) return;
    var ticking = false;

    function update() {
      ticking = false;
      var wide = window.innerWidth > 900 && !reducedMQ.matches;
      cards.forEach(function (card, i) {
        var depth = 0;
        var next = cards[i + 1];
        if (wide && next) {
          var stick = 96 + i * 18;
          var nextTop = next.getBoundingClientRect().top;
          depth = clamp(1 - (nextTop - (stick + 18)) / (window.innerHeight * 0.55), 0, 1);
        }
        card.style.setProperty('--depth', depth.toFixed(3));
      });
    }

    function request() {
      if (ticking) return;
      ticking = true;
      raf(update);
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    reducedMQ.addEventListener('change', request);
    update();
  }

  /* ── Typing rotators ───────────────────────────────────── */
  function typing() {
    Q.$$('[data-typing]').forEach(function (el) {
      var words = (el.getAttribute('data-words') || el.textContent || '')
        .split('|').map(function (w) { return w.trim(); }).filter(Boolean);
      if (!words.length) return;
      if (reducedMQ.matches) { el.textContent = words[0]; return; }
      var wi = 0, ci = 0, deleting = false, timer = null, alive = true;

      function tick() {
        if (!alive || doc.hidden) return;
        var word = words[wi];
        ci += deleting ? -1 : 1;
        el.textContent = word.slice(0, ci);
        var delay = deleting ? 42 : 72;
        if (!deleting && ci === word.length) { deleting = true; delay = 2100; }
        else if (deleting && ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          delay = 360;
        }
        timer = window.setTimeout(tick, delay);
      }

      tick();
      doc.addEventListener('visibilitychange', function () {
        window.clearTimeout(timer);
        if (!doc.hidden) { alive = true; tick(); } else { alive = false; }
      });
      reducedMQ.addEventListener('change', function () {
        if (reducedMQ.matches) {
          window.clearTimeout(timer);
          alive = false;
          el.textContent = words[0];
        }
      });
    });
  }

  /* ── Magic hover rows ──────────────────────────────────── */
  function magicRows() {
    if (!canHover()) return;
    Q.$$('[data-magic]').forEach(function (row) {
      row.addEventListener('pointermove', function (e) {
        var r = row.getBoundingClientRect();
        row.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        row.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  }

  /* ── Draggable, rotatable sticker ──────────────────────── */
  function dragStamp() {
    var el = Q.$('[data-drag-stamp]');
    if (!el) return;
    var host = el.closest('.contact') || el.parentElement;
    var dx = 0, dy = 0, rot = -9;
    var startX = 0, startY = 0, baseX = 0, baseY = 0;
    var lastX = 0, lastT = 0, spin = 0, dragging = false, rafId = null;

    function paint() {
      el.style.setProperty('--dx', dx.toFixed(1) + 'px');
      el.style.setProperty('--dy', dy.toFixed(1) + 'px');
      el.style.setProperty('--rot', rot.toFixed(2) + 'deg');
    }

    function bounds() {
      var r = host.getBoundingClientRect();
      return { x: Math.max(80, r.width * 0.62), y: Math.max(120, r.height * 0.34) };
    }

    function clampPos() {
      var b = bounds();
      dx = clamp(dx, -b.x, b.x);
      dy = clamp(dy, -b.y * 0.7, b.y);
    }

    function glide() {
      rafId = null;
      if (Math.abs(spin) < 0.05) return;
      rot += spin;
      spin *= 0.94;
      paint();
      rafId = raf(glide);
    }

    el.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      dragging = true;
      el.classList.add('is-dragging');
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
      startX = e.clientX;
      startY = e.clientY;
      baseX = dx;
      baseY = dy;
      lastX = e.clientX;
      lastT = performance.now();
      e.preventDefault();
    });

    el.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dx = baseX + (e.clientX - startX);
      dy = baseY + (e.clientY - startY);
      clampPos();
      var now = performance.now();
      var dt = Math.max(12, now - lastT);
      spin = ((e.clientX - lastX) / dt) * 1.6;
      rot += (e.clientX - lastX) * 0.32;
      lastX = e.clientX;
      lastT = now;
      paint();
    });

    function stop() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      if (rafId === null) rafId = raf(glide);
    }
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);

    el.addEventListener('keydown', function (e) {
      var step = e.shiftKey ? 34 : 14;
      if (e.key === 'ArrowLeft') { dx -= step; }
      else if (e.key === 'ArrowRight') { dx += step; }
      else if (e.key === 'ArrowUp') { dy -= step; }
      else if (e.key === 'ArrowDown') { dy += step; }
      else if (e.key === 'q' || e.key === 'Q') { rot -= 8; }
      else if (e.key === 'e' || e.key === 'E') { rot += 8; }
      else return;
      e.preventDefault();
      clampPos();
      paint();
    });

    el.addEventListener('dblclick', function () {
      dx = dy = 0;
      rot = -9;
      paint();
    });

    paint();
  }

  /* ── Method · scroll-driven horizontal rail ────────────── */
  function methodRail() {
    var track = Q.$('[data-method]');
    if (!track) return;
    var rail = Q.$('[data-method-rail]', track);
    if (!rail) return;
    var cards = Q.$$('[data-method-card]', rail);
    if (!cards.length) return;
    var bar = Q.$('[data-method-bar]', track);
    var count = Q.$('[data-method-count]', track);
    var desktop = window.matchMedia('(min-width: 901px)');
    var ticking = false;
    var active = -1;

    function padNum(n) { return n < 10 ? '0' + n : '' + n; }

    function update() {
      ticking = false;
      if (!desktop.matches || reducedMQ.matches) {
        rail.style.transform = '';
        if (bar) bar.style.transform = '';
        cards.forEach(function (card) { card.classList.remove('is-current'); });
        active = -1;
        return;
      }
      var header = Q.$('.site-header');
      var sticky = header ? header.offsetHeight : 76;
      var rect = track.getBoundingClientRect();
      var distance = track.offsetHeight - (window.innerHeight - sticky);
      var progress = distance > 0 ? clamp((sticky - rect.top) / distance, 0, 1) : 0;
      var last = cards[cards.length - 1];
      var max = Math.max(0, last.offsetLeft + last.offsetWidth + 46 - window.innerWidth);
      rail.style.transform = 'translate3d(' + (-progress * max).toFixed(1) + 'px,0,0)';

      var index = Math.min(cards.length - 1, Math.round(progress * (cards.length - 1)));
      if (bar) bar.style.transform = 'scaleX(' + ((index + 1) / cards.length).toFixed(3) + ')';
      if (index !== active) {
        active = index;
        cards.forEach(function (card, i) { card.classList.toggle('is-current', i === index); });
        if (count) count.textContent = padNum(index + 1);
      }
    }

    function request() {
      if (ticking) return;
      ticking = true;
      raf(update);
    }

    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    reducedMQ.addEventListener('change', request);
    update();
  }

  /* ── Signature S-wave · draw the hairline on arrival ───── */
  function waveDraw() {
    var waves = Q.$$('[data-wave]');
    if (!waves.length) return;
    if (isReduced() || !('IntersectionObserver' in window)) {
      waves.forEach(function (w) { w.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: .3 });
    waves.forEach(function (w) { io.observe(w); });
  }

  /* ── Boot ──────────────────────────────────────────────── */
  function startMotion() {
    rotatingRoles();
    waveDraw();
    proximity();
    warpText();
    shatterType();
    magicButtons();
    magicRows();
    heroTilt();
    folder();
    circularGallery();
    typing();
    dragStamp();
  }

  var baseStart = Q.start;
  Q.start = function () {
    if (typeof baseStart === 'function') baseStart();
    startMotion();
  };
})();
