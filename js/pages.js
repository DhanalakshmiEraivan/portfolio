/* ═══════════════════════════════════════════════════════════
   QUADRA · INNER PAGE FEATURES
   Progress, reveals, counters, tabs, filters, lightbox, forms.
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var doc = document;
  var Q = window.Quadra || {};
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* Scroll progress bar */
  function progress() {
    var bar = $('.page-progress span');
    if (!bar) return;
    var update = function () {
      var max = doc.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = 'scaleX(' + Math.max(0, Math.min(1, ratio)) + ')';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* Reveal on scroll */
  function reveals() {
    var items = $$('[data-reveal]');
    if (!items.length || reduced) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
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
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Small, factual counters (data-count) */
  function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;
    var run = function (el) {
      var target = Number(el.getAttribute('data-count'));
      if (!isFinite(target)) return;
      var pad = el.getAttribute('data-pad') === 'true';
      var dur = reduced ? 0 : 900;
      var start = performance.now();
      var tick = function (now) {
        var t = dur ? Math.min(1, (now - start) / dur) : 1;
        var eased = 1 - Math.pow(1 - t, 3);
        var val = Math.round(target * eased);
        el.textContent = pad && val < 10 ? '0' + val : String(val);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  /* Tabs */
  function tabs() {
    $$('[data-tabs]').forEach(function (root) {
      var buttons = $$('[data-tab]', root);
      var panels = $$('[data-panel]', root);
      if (!buttons.length) return;
      var select = function (id) {
        buttons.forEach(function (b) {
          var on = b.getAttribute('data-tab') === id;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.tabIndex = on ? 0 : -1;
        });
        panels.forEach(function (p) {
          p.classList.toggle('is-open', p.getAttribute('data-panel') === id);
        });
      };
      buttons.forEach(function (btn, i) {
        btn.addEventListener('click', function () { select(btn.getAttribute('data-tab')); });
        btn.addEventListener('keydown', function (e) {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          var next = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length];
          next.focus();
          select(next.getAttribute('data-tab'));
        });
      });
      select(buttons[0].getAttribute('data-tab'));
    });
  }

  /* Gallery filters */
  function filters() {
    $$('[data-filter-group]').forEach(function (group) {
      var buttons = $$('[data-filter]', group);
      var items = $$('[data-cat]');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var cat = btn.getAttribute('data-filter');
          buttons.forEach(function (b) {
            b.classList.toggle('is-active', b === btn);
            b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
          });
          items.forEach(function (item) {
            var show = cat === 'all' || item.getAttribute('data-cat') === cat;
            item.hidden = !show;
          });
          doc.dispatchEvent(new CustomEvent('quadra:filter'));
        });
      });
    });
  }

  /* Careers role search + department filter */
  function roleSearch() {
    var search = $('[data-role-search]');
    var buttons = $$('[data-role-filter]');
    var roles = $$('.c-role');
    var count = $('[data-role-count]');
    if (!roles.length) return;
    var dept = 'all';
    var apply = function () {
      var query = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      roles.forEach(function (role) {
        var matchDept = dept === 'all' || role.getAttribute('data-dept') === dept;
        var matchText = !query || role.textContent.toLowerCase().indexOf(query) > -1;
        role.hidden = !(matchDept && matchText);
        if (!role.hidden) shown++;
      });
      if (count) count.textContent = shown;
      var empty = $('[data-role-empty]');
      if (empty) empty.hidden = shown > 0;
    };
    if (search) search.addEventListener('input', apply);
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        dept = btn.getAttribute('data-role-filter');
        buttons.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply();
      });
    });
    apply();
  }

  /* Gallery lightbox */
  function lightbox() {
    var dialog = $('[data-lightbox]');
    if (!dialog) return;
    var img = $('[data-lb-img]', dialog);
    var title = $('[data-lb-title]', dialog);
    var meta = $('[data-lb-meta]', dialog);
    var current = 0;
    var items = [];

    var collect = function () {
      items = $$('.g-item').filter(function (item) { return !item.hidden; });
    };
    var show = function (i) {
      if (!items.length) return;
      current = (i + items.length) % items.length;
      var item = items[current];
      var source = $('img', item);
      img.src = source.getAttribute('src');
      img.alt = source.getAttribute('alt') || '';
      title.textContent = item.getAttribute('data-title') || '';
      meta.textContent = item.getAttribute('data-cat-label') || '';
    };
    var open = function (i) {
      collect();
      show(i);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    };

    $$('.g-item').forEach(function (item) {
      item.addEventListener('click', function () {
        collect();
        open(items.indexOf(item));
      });
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
      });
    });

    var close = function () { if (dialog.open) dialog.close(); };
    $$('[data-lb-close]', dialog).forEach(function (b) { b.addEventListener('click', close); });
    var prev = $('[data-lb-prev]', dialog);
    var next = $('[data-lb-next]', dialog);
    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    doc.addEventListener('quadra:filter', function () { collect(); });
  }

  /* Sticky subnav active state */
  function subnav() {
    var nav = $('[data-subnav]');
    if (!nav) return;
    var links = $$('a[href^="#"]', nav);
    if (!links.length) return;
    var sections = links.map(function (link) {
      return doc.getElementById(link.getAttribute('href').slice(1));
    }).filter(Boolean);
    var update = function () {
      var y = window.scrollY + 160;
      var active = 0;
      sections.forEach(function (section, i) { if (section.offsetTop <= y) active = i; });
      links.forEach(function (link, i) { link.classList.toggle('is-active', i === active); });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  /* Pointer tilt on feature cards */
  function tilt() {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (x * 5).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* Copy email */
  function copy() {
    $$('[data-copy]').forEach(function (btn) {
      var original = btn.getAttribute('data-copy-label') ? $('[data-copy-label]', btn) : null;
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () {
          btn.classList.add('is-copied');
          if (original) original.textContent = 'Copied';
          setTimeout(function () {
            btn.classList.remove('is-copied');
            if (original) original.textContent = 'Copy email';
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(done);
        } else {
          done();
        }
      });
    });
  }

  /* Server-backed forms */
  function forms() {
    $$('form[data-mailto]').forEach(function (form) {
      var status = $('.p-form-status', form);
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var fields = window.QuadraForms.values(form);
        fields.topic = fields.topic || form.getAttribute('data-topic') || 'Website enquiry';
        if (status) { status.classList.remove('is-error'); status.textContent = 'Sending your message securely…'; }
        var button = $('button[type="submit"]', form);
        if (button) button.disabled = true;
        try {
          await window.QuadraForms.submit('contact', fields);
          if (status) status.textContent = 'Thank you. Your message has been sent to QuadraFroyn Solutions.';
          form.reset();
        } catch (err) {
          if (status) { status.textContent = err.message + ' You can also email info@quadrafroynsolutions.in.'; status.classList.add('is-error'); }
        } finally { if (button) button.disabled = false; }
      });
    });
  }

  /* Careers application dialog */
  function careerApplications() {
    var dialog = $('#careerApplyDialog');
    var form = $('#careerApplyForm');
    if (!dialog || !form) return;
    var roleInput = $('#careerApplyRole');
    var roleSelect = $('#careerApplyRoleDisplay');
    var status = $('#careerApplyStatus');
    function open(role) {
      if (roleInput) roleInput.value = role || '';
      if (roleSelect) {
        var match = Array.prototype.find.call(roleSelect.options, function (o) {
          return o.text.toLowerCase() === String(role || '').toLowerCase();
        });
        roleSelect.value = match ? match.value : (role ? 'General / Other' : '');
      }
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      document.body.classList.add('modal-open');
    }
    function close() {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      document.body.classList.remove('modal-open');
    }
    $$('[data-apply-role]').forEach(function (button) {
      button.addEventListener('click', function () { open(button.getAttribute('data-apply-role')); });
    });
    $$('[data-apply-close]', dialog).forEach(function (button) { button.addEventListener('click', close); });
    dialog.addEventListener('click', function (event) { if (event.target === dialog) close(); });
    dialog.addEventListener('close', function () { document.body.classList.remove('modal-open'); });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var fields = window.QuadraForms.values(form);
      fields.role = fields.role_display || fields.role || 'General application';
      if (status) status.textContent = 'Sending your application securely…';
      var submit = $('button[type="submit"]', form);
      if (submit) submit.disabled = true;
      window.QuadraForms.submit('career_application', fields).then(function () {
        if (status) status.textContent = 'Application sent successfully. Thank you for your interest.';
        form.reset();
      }).catch(function (err) {
        if (status) status.textContent = err.message + ' Please email info@quadrafroynsolutions.in if the issue continues.';
      }).finally(function () { if (submit) submit.disabled = false; });
    });
  }

  /* Back to top */
  function backTop() {
    var btn = $('[data-top]');
    if (!btn) return;
    var update = function () { btn.classList.toggle('is-on', window.scrollY > 700); };
    update();
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* Nav dropdown + active page link */
  function nav() {
    var drop = $('.nav-drop');
    if (drop) {
      doc.addEventListener('click', function (e) {
        if (!drop.contains(e.target)) drop.removeAttribute('open');
      });
      doc.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') drop.removeAttribute('open');
      });
    }
    var path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-primary a, .mobile-nav a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0];
      if (href && href === path) a.classList.add('is-active');
    });
  }

  /* Close other FAQs when one opens */
  function faqs() {
    $$('.p-faq details').forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        $$('.p-faq details').forEach(function (other) {
          if (other !== item) other.removeAttribute('open');
        });
      });
    });
  }

  /* Year */
  function year() {
    var node = $('[data-year]');
    if (node) node.textContent = new Date().getFullYear();
  }

  function start() {
    progress();
    reveals();
    counters();
    tabs();
    filters();
    roleSearch();
    lightbox();
    subnav();
    tilt();
    copy();
    forms();
    careerApplications();
    backTop();
    nav();
    faqs();
    year();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
