/* ═══════════════════════════════════════════════════════════
   V6 · splash cursor · flex carousel · infinite menu · decay
        cards · elastic mesh · masked headings · quote popup
   ═══════════════════════════════════════════════════════════ */
(function () {
  var Q = window.Quadra;
  if (!Q) return;
  var doc = document;
  var fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reducedMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var canHover = function () { return fineMQ.matches && !reducedMQ.matches; };
  var isReduced = function () { return reducedMQ.matches; };
  var raf = function (fn) { return window.requestAnimationFrame(fn); };

  /* ── Splash cursor · dark-blue ink trail ────────────────── */
  function splashCursor() {
    var canvas = Q.$('[data-splash]');
    if (!canvas || !canHover() || isReduced()) {
      if (canvas) canvas.style.display = 'none';
      return;
    }
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0, pts = [], running = false;
    var lastX = null, lastY = null;
    var COLORS = [[10, 42, 110], [8, 123, 232], [26, 72, 200], [76, 150, 245], [5, 22, 62]];

    function size() {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    function add(x, y, vx, vy, radius) {
      if (pts.length > 190) pts.splice(0, pts.length - 190);
      pts.push({ x: x, y: y, vx: vx, vy: vy, r: radius, c: COLORS[(Math.random() * COLORS.length) | 0], life: 1 });
    }

    function frame() {
      if (!pts.length) { ctx.clearRect(0, 0, w, h); running = false; return; }
      running = true;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.085)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      for (var i = pts.length - 1; i >= 0; i--) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.93; p.vy *= 0.93;
        p.life -= 0.014;
        if (p.life <= 0) { pts.splice(i, 1); continue; }
        var r = p.r * (0.35 + p.life * 0.75);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + (0.5 * p.life).toFixed(3) + ')');
        g.addColorStop(0.55, 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',' + (0.2 * p.life).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + p.c[0] + ',' + p.c[1] + ',' + p.c[2] + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf(frame);
    }
    function kick() { if (!running) raf(frame); }

    doc.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var x = e.clientX, y = e.clientY;
      if (lastX !== null) {
        var dx = x - lastX, dy = y - lastY;
        var dist = Math.min(64, Math.sqrt(dx * dx + dy * dy));
        if (dist > 0.5) {
          var n = clamp(1 + Math.floor(dist / 16), 1, 3);
          for (var i = 0; i < n; i++) {
            var t = i / n;
            add(lastX + dx * t + (Math.random() - 0.5) * 7,
                lastY + dy * t + (Math.random() - 0.5) * 7,
                dx * 0.03 + (Math.random() - 0.5) * 0.7,
                dy * 0.03 + (Math.random() - 0.5) * 0.7,
                9 + Math.random() * 20);
          }
          kick();
        }
      }
      lastX = x; lastY = y;
    }, { passive: true });

    doc.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      for (var i = 0; i < 14; i++) {
        var a = Math.random() * Math.PI * 2, sp = 0.8 + Math.random() * 3.6;
        add(e.clientX, e.clientY, Math.cos(a) * sp, Math.sin(a) * sp, 12 + Math.random() * 30);
      }
      kick();
    }, { passive: true });

    doc.documentElement.classList.add('splash-live');
  }

  /* ── Flex lens carousel · How we work (WebGL2) ──────────── */
  function lensCarousel() {
    var root = Q.$('[data-lens]');
    if (!root) return;
    var stage = Q.$('[data-lens-stage]', root);
    if (!stage) return;
    var section = root.parentNode;
    while (section && section.nodeType === 1 && !(section.classList && section.classList.contains('method'))) section = section.parentNode;
    var fallback = section ? Q.$('[data-lens-fallback]', section) : null;
    var itemNodes = section ? Q.$$('[data-lens-item]', section) : [];
    var items = itemNodes.map(function (fig) {
      var img = Q.$('img', fig);
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? (img.getAttribute('alt') || '') : '',
        name: fig.getAttribute('data-name') || '',
        desc: fig.getAttribute('data-desc') || ''
      };
    });
    if (items.length < 2) return;
    var total = items.length;

    var liveEl = Q.$('[data-lens-live]', root);
    var nameEl = Q.$('[data-lens-name]', root);
    var descEl = Q.$('[data-lens-desc]', root);
    var numEl = Q.$('[data-lens-num]', root);
    var pauseBtn = Q.$('[data-lens-pause]', root);
    var pauseUse = pauseBtn ? Q.$('[data-lens-pause-use]', pauseBtn) : null;
    var pauseLabel = pauseBtn ? Q.$('[data-lens-pause-label]', pauseBtn) : null;
    var prevBtn = Q.$('[data-lens-prev]', root);
    var nextBtn = Q.$('[data-lens-next]', root);
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var reels = [];
    if (numEl) {
      numEl.textContent = '';
      for (var dgt = 0; dgt < 2; dgt++) {
        var digit = document.createElement('span');
        digit.className = 'lens-digit';
        var reel = document.createElement('span');
        reel.className = 'lens-reel';
        for (var v = 0; v < 10; v++) {
          var cell = document.createElement('span');
          cell.textContent = String(v);
          reel.appendChild(cell);
        }
        digit.appendChild(reel);
        numEl.appendChild(digit);
        reels.push(reel);
      }
    }

    // ── WebGL2 setup ───────────────────────────────────────
    var canvas = document.createElement('canvas');
    canvas.className = 'lens-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    var gl = null;
    try {
      gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    } catch (err) { gl = null; }
    if (!gl) { root.setAttribute('data-lens-failed', 'no-webgl2'); return; }

    var CARD_VS = `#version 300 es
in vec3 position;
in vec2 uv;
uniform vec4 uRect;
uniform vec2 uResolution;
out vec2 vUv;
out vec2 vLocal;
void main() {
  vUv = uv;
  vLocal = vec2(position.x, -position.y) * uRect.zw;
  vec2 px = uRect.xy + vLocal;
  gl_Position = vec4(px.x / uResolution.x * 2.0 - 1.0, 1.0 - px.y / uResolution.y * 2.0, 0.0, 1.0);
}`;

    var CARD_FS = `#version 300 es
precision highp float;
uniform sampler2D tMap;
uniform vec2 uSize;
uniform vec2 uImage;
uniform float uRadius;
uniform float uAlpha;
uniform float uReady;
uniform float uShift;
uniform float uDpr;
uniform vec3 uPlaceholder;
in vec2 vUv;
in vec2 vLocal;
out vec4 fragColor;

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float sd = roundedBox(vLocal, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
  float mask = clamp(0.5 - sd * uDpr, 0.0, 1.0);
  vec2 local = vLocal / uSize + 0.5;
  float cardAspect = uSize.x / uSize.y;
  float imageAspect = uImage.x / max(uImage.y, 1.0);
  vec2 scale = imageAspect > cardAspect ? vec2(cardAspect / imageAspect, 1.0) : vec2(1.0, imageAspect / cardAspect);
  scale /= 1.08;
  vec2 uv = vec2(local.x, 1.0 - local.y);
  uv = (uv - 0.5) * scale + 0.5;
  uv.x += uShift * (1.0 - scale.x) * 0.5;
  vec3 image = texture(tMap, uv).rgb;
  vec3 color = mix(uPlaceholder, image, uReady);
  float alpha = mask * uAlpha;
  fragColor = vec4(color * alpha, alpha);
}`;

    var LENS_VS = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

    var LENS_FS = `#version 300 es
precision highp float;
uniform sampler2D tScene;
uniform vec2 uResolution;
uniform float uDpr;
uniform vec2 uCenter;
uniform vec2 uHalf;
uniform float uAngle;
uniform float uExponent;
uniform float uInner;
uniform float uOuter;
uniform float uFlow;
uniform float uCurl;
uniform float uDispersion;
uniform float uStrength;
uniform float uSceneAlpha;
out vec4 fragColor;

void main() {
  vec2 frag = gl_FragCoord.xy / uDpr;
  vec2 uv = frag / uResolution;
  vec2 rel = frag - vec2(uCenter.x, uResolution.y - uCenter.y);
  float ca = cos(uAngle);
  float sa = sin(uAngle);
  vec2 local = vec2(ca * rel.x + sa * rel.y, -sa * rel.x + ca * rel.y);
  vec2 k = max(abs(local) / uHalf, vec2(1e-5));
  float nd = pow(pow(k.x, uExponent) + pow(k.y, uExponent), 1.0 / uExponent);
  vec2 grad = pow(k, vec2(uExponent - 1.0)) * sign(local) / uHalf * pow(nd, 1.0 - uExponent);
  float glen = max(length(grad), 1e-6);
  float edge = (nd - 1.0) / glen;
  vec2 outward = grad / glen;
  vec2 normal = vec2(ca * outward.x - sa * outward.y, sa * outward.x + ca * outward.y);
  vec2 along = vec2(-normal.y, normal.x);

  float t = clamp((edge + uInner) / (uInner + uOuter), 0.0, 1.0);
  float ramp = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  float slope = 16.0 * t * t * (1.0 - t) * (1.0 - t);
  float reachX = rel.x / (uResolution.x * 0.5);
  float side = smoothstep(0.02, 0.3, abs(reachX)) * (uCurl == 0.0 ? sign(reachX) : uCurl);
  float lift = ramp * side * uFlow * uStrength;
  vec2 swirl = along * along.y * side * slope * uFlow * uStrength * 0.35;
  vec2 drift = vec2(0.0, -lift) - swirl;
  vec2 shifted = uv + drift / uResolution;

  vec2 texels = uResolution * uDpr;
  vec2 gx = dFdx(shifted);
  vec2 gy = dFdy(shifted);
  gx *= min(1.0, 3.0 / max(length(gx * texels), 1e-4));
  gy *= min(1.0, 3.0 / max(length(gy * texels), 1e-4));

  vec4 color = textureGrad(tScene, shifted, gx, gy);
  vec2 spread = vec2(0.0, side * slope * uFlow * uStrength) / uResolution * uDispersion;
  float spreadPx = length(spread * texels);
  if (color.a > 0.002 && spreadPx > 0.25) {
    vec3 base = color.rgb / color.a;
    vec3 sumColor = vec3(0.0);
    vec3 sumWeight = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float s = (float(i) + 0.5) / 12.0;
      vec4 c = textureGrad(tScene, shifted + spread * (s - 0.5), gx, gy);
      vec3 w = max(1.0 - abs(vec3(s) - vec3(0.15, 0.5, 0.85)) * 2.6, 0.0) * c.a;
      sumColor += c.rgb * (w / max(c.a, 0.002));
      sumWeight += w;
    }
    vec3 split = mix(base, sumColor / max(sumWeight, vec3(1e-4)), clamp(sumWeight * 2.0, 0.0, 1.0));
    color.rgb = mix(color.rgb, clamp(split, 0.0, 1.0) * color.a, smoothstep(0.25, 1.5, spreadPx));
  }
  fragColor = color * uSceneAlpha;
}`;

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
      return s;
    }
    function link(vsSrc, fsSrc) {
      var p = gl.createProgram();
      gl.attachShader(p, compile(gl.VERTEX_SHADER, vsSrc));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fsSrc));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
      return p;
    }
    var cardProg, lensProg;
    try {
      cardProg = link(CARD_VS, CARD_FS);
      lensProg = link(LENS_VS, LENS_FS);
    } catch (err) {
      root.setAttribute('data-lens-failed', 'shader');
      return;
    }

    function locs(program, names) {
      var u = {};
      names.forEach(function (n) { u[n] = gl.getUniformLocation(program, n); });
      return u;
    }
    var cardU = locs(cardProg, ['tMap', 'uRect', 'uResolution', 'uSize', 'uImage', 'uRadius', 'uAlpha', 'uReady', 'uShift', 'uDpr', 'uPlaceholder']);
    var lensU = locs(lensProg, ['tScene', 'uResolution', 'uDpr', 'uCenter', 'uHalf', 'uAngle', 'uExponent', 'uInner', 'uOuter', 'uFlow', 'uCurl', 'uDispersion', 'uStrength', 'uSceneAlpha']);

    // quad (1×1, centred) and fullscreen triangle
    var quadVao = gl.createVertexArray();
    var quadBuf = gl.createBuffer();
    var quadIdx = gl.createBuffer();
    gl.bindVertexArray(quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -0.5, -0.5, 0, 0, 0,
       0.5, -0.5, 0, 1, 0,
       0.5,  0.5, 0, 1, 1,
      -0.5,  0.5, 0, 0, 1
    ]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    var aCardPos = gl.getAttribLocation(cardProg, 'position');
    var aCardUv = gl.getAttribLocation(cardProg, 'uv');
    gl.enableVertexAttribArray(aCardPos);
    gl.vertexAttribPointer(aCardPos, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(aCardUv);
    gl.vertexAttribPointer(aCardUv, 2, gl.FLOAT, false, 20, 12);

    var triVao = gl.createVertexArray();
    var triBuf = gl.createBuffer();
    gl.bindVertexArray(triVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, triBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aLensPos = gl.getAttribLocation(lensProg, 'position');
    gl.enableVertexAttribArray(aLensPos);
    gl.vertexAttribPointer(aLensPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // offscreen scene
    var fbo = gl.createFramebuffer();
    var rtTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, rtTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var rtW = 2;
    var rtH = 2;
    function allocRT(w, h) {
      rtW = w; rtH = h;
      gl.bindTexture(gl.TEXTURE_2D, rtTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rtTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // ── state ─────────────────────────────────────────────
    var width = 1, height = 1, dpr = 1;
    var pos = 0, goal = 0, vel = 0, mode = 'spring', wheelAt = 0;
    var activeIndex = -1, ready = false;
    var focusIndex = -1, focusTarget = 0, focusT = 0, focusV = 0, focusPending = -1;
    var pointer = { down: false, dragging: false, x: 0, y: 0, startX: 0, startY: 0, startPos: 0, id: -1, touch: false, over: false, samples: [] };
    var intro = { kind: 'rise', t: 0, running: false, done: false };
    var autoplay = !reduced, interval = 4.6, paused = false, autoAt = performance.now();
    var interactedAt = -Infinity, hasFocus = false;
    var visible = true, alive = true, dirty = true, raf = 0, last = performance.now();
    var energy = 0, deform = 0, deformVel = 0, lastPos = 0;
    var layout = null, resnap = true, hoverAttr = '';
    var instances = [];

    var slots = items.map(function (item) {
      var tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([205, 206, 198, 255]));
      var slot = { tex: tex, image: [1200, 1500], aspect: 0.8, loaded: false, failed: false, ready: 0, color: [0.62, 0.63, 0.6] };
      var image = new Image();
      // Same-origin local assets: avoid unnecessary CORS mode for file/static previews.
      image.decoding = 'async';
      image.onload = function () {
        if (!alive) return;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        slot.image = [image.naturalWidth || 1, image.naturalHeight || 1];
        slot.aspect = slot.image[0] / slot.image[1];
        slot.loaded = true;
        slot.ready = 1; // Required by the shader to replace its grey placeholder with the photo.
        try {
          var probe = document.createElement('canvas');
          probe.width = 8;
          probe.height = 8;
          var ctx = probe.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(image, 0, 0, 8, 8);
            var data = ctx.getImageData(0, 0, 8, 8).data;
            var avg = [0, 0, 0];
            for (var i = 0; i < data.length; i += 4) {
              avg[0] += data[i];
              avg[1] += data[i + 1];
              avg[2] += data[i + 2];
            }
            slot.color = [avg[0] / 64 / 255, avg[1] / 64 / 255, avg[2] / 64 / 255];
          }
        } catch (err) { /* keep grey placeholder */ }
        dirty = true;
        start();
      };
      image.onerror = function () {
        slot.failed = true;
        dirty = true;
        start();
      };
      image.src = new URL(item.src, document.baseURI).href;
      return slot;
    });

    function wrap(value, size) {
      return ((((value + size / 2) % size) + size) % size) - size / 2;
    }
    function clamp01(v) { return Math.min(Math.max(v, 0), 1); }
    function easeOut(v) { return 1 - Math.pow(1 - clamp01(v), 3); }
    function easeOutQuint(v) { return 1 - Math.pow(1 - clamp01(v), 5); }
    function easeInOut(v) {
      var t = clamp01(v);
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function metrics() {
      var cardH = Math.max(24, (width < 720 ? 0.62 : 0.6) * height);
      var widths = [];
      var centers = [];
      var cursor = 0;
      for (var i = 0; i < slots.length; i++) {
        var w = (slots[i].aspect || 0.8) * cardH;
        widths.push(w);
        centers.push(cursor + w / 2);
        cursor += w + 12;
      }
      return { cardH: cardH, widths: widths, centers: centers, gap: 12, loop: Math.max(cursor, 1) };
    }
    function nearest(m, at) {
      var best = 0;
      var bestDist = Infinity;
      for (var i = 0; i < m.centers.length; i++) {
        var dist = Math.abs(wrap(m.centers[i] - at, m.loop));
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      return best;
    }
    function snapPoint(m, at) {
      var i = nearest(m, at);
      return at + wrap(m.centers[i] - at, m.loop);
    }
    function remap(from, to, at) {
      var i = nearest(from, at);
      var offset = wrap(at - from.centers[i], from.loop);
      var cycles = Math.round((at - offset - from.centers[i]) / from.loop);
      return cycles * to.loop + to.centers[i] + offset * (to.widths[i] / from.widths[i]);
    }
    function step(m, delta) {
      var at = snapPoint(m, goal);
      var index = nearest(m, at);
      var n = m.centers.length;
      for (var k = 0; k < Math.abs(delta); k++) {
        var next = (index + (delta > 0 ? 1 : n - 1)) % n;
        var distance = delta > 0
          ? m.widths[index] / 2 + m.gap + m.widths[next] / 2
          : -(m.widths[next] / 2 + m.gap + m.widths[index] / 2);
        at += distance;
        index = next;
      }
      goal = at;
      mode = 'spring';
      dirty = true;
      start();
    }
    function goTo(m, index) {
      var i = ((index % m.centers.length) + m.centers.length) % m.centers.length;
      goal = goal + wrap(m.centers[i] - goal, m.loop);
      mode = 'spring';
      dirty = true;
      start();
    }

    function setActive(index, silent) {
      activeIndex = index;
      var item = items[index];
      if (!item) return;
      root.setAttribute('data-lens-active', String(index));
      if (nameEl) nameEl.textContent = item.name;
      if (descEl) descEl.textContent = item.desc;
      if (reels.length) {
        var str = index + 1 < 10 ? '0' + (index + 1) : String(index + 1);
        for (var k = 0; k < reels.length; k++) {
          reels[k].style.transform = 'translateY(' + (-Number(str.charAt(k)) * 10) + '%)';
        }
      }
      if (liveEl && !silent) {
        liveEl.textContent = 'Stage ' + (index + 1) + ' of ' + total + ', ' + item.name + '. ' + item.desc;
      }
    }

    function openFocus(index) {
      focusIndex = index;
      focusPending = -1;
      focusTarget = 1;
      root.setAttribute('data-lens-focus', '1');
      dirty = true;
      start();
    }
    function closeFocus() {
      focusPending = -1;
      if (focusTarget === 0) return false;
      focusTarget = 0;
      root.removeAttribute('data-lens-focus');
      dirty = true;
      start();
      return true;
    }
    function skipIntro() {
      if (intro.running) intro.t = 1;
    }
    function introEffects() {
      var e = { scene: 1, strength: 1, card: null };
      if (!intro.done && !intro.running) { e.scene = 0; e.strength = 0; return e; }
      var t = intro.running ? intro.t : 1;
      if (t >= 1) return e;
      if (intro.kind === 'fade') { e.scene = t; e.strength = t; return e; }
      e.strength = easeInOut((t - 0.3) / 0.65);
      e.card = function (rel) {
        var delay = Math.min(Math.abs(rel) / (width * 0.6), 1) * 0.34;
        var local = clamp01((t - delay) / 0.6);
        return {
          alpha: clamp01(local * 4),
          y: (1 - easeOutQuint(local)) * height * 0.62,
          scale: 0.5 + 0.5 * easeInOut((local - 0.18) / 0.82)
        };
      };
      return e;
    }

    function applySize() {
      width = Math.max(1, stage.clientWidth);
      height = Math.max(1, stage.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(1800000 / (width * height)));
      if (!(dpr > 0.4)) dpr = 0.4;
      canvas.width = Math.max(2, Math.round(width * dpr));
      canvas.height = Math.max(2, Math.round(height * dpr));
      allocRT(canvas.width, canvas.height);
      dirty = true;
      start();
    }

    function pointOf(e) {
      var rect = stage.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    function hitRect(x, y) {
      for (var i = 0; i < instances.length; i++) {
        var inst = instances[i];
        if (x >= inst.x0 && x <= inst.x1 && y >= inst.y0 && y <= inst.y1) return inst;
      }
      return null;
    }

    function paintPause() {
      if (!pauseBtn) return;
      pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      if (pauseLabel) pauseLabel.textContent = paused ? 'Play' : 'Pause';
      if (pauseUse) pauseUse.setAttribute('href', paused ? '#i-play' : '#i-pause');
    }

    var resizePending = false;
    function scheduleSize() {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(function () { resizePending = false; applySize(); });
    }

    // ── frame ─────────────────────────────────────────────
    function frame(now) {
      raf = 0;
      if (!alive) return;
      var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      var m = metrics();
      var animating = false;

      if (resnap) {
        goal = snapPoint(m, goal);
        pos = goal;
        vel = 0;
        resnap = false;
      } else if (layout && layout.loop !== m.loop) {
        pos = remap(layout, m, pos);
        goal = remap(layout, m, goal);
        animating = true;
      }
      layout = m;

      if (intro.running) {
        intro.t += dt / (intro.kind === 'rise' ? 2.1 : 0.35);
        if (intro.t >= 1) {
          intro.t = 1;
          intro.running = false;
          intro.done = true;
        }
        animating = true;
      }

      if (mode === 'wheel' && now - wheelAt > 150) {
        goal = snapPoint(m, goal);
        mode = 'spring';
      }

      if (!pointer.dragging) {
        var stiffness = 55;
        var damping = 2 * Math.sqrt(stiffness);
        var substeps = Math.ceil(dt / (1 / 240));
        var h = dt / substeps;
        for (var s = 0; s < substeps; s++) {
          var acc = stiffness * (goal - pos) - damping * vel;
          vel += acc * h;
          pos += vel * h;
        }
        if (Math.abs(goal - pos) < 0.05 && Math.abs(vel) < 0.5) {
          pos = goal;
          vel = 0;
        } else {
          animating = true;
        }
      } else {
        animating = true;
      }

      if (Math.abs(pos) > m.loop * 8) {
        var shift = Math.round(pos / m.loop) * m.loop;
        pos -= shift;
        goal -= shift;
        pointer.startPos -= shift;
      }

      var current = nearest(m, pos);
      if (current !== activeIndex) setActive(current);

      if (focusPending >= 0 && mode === 'spring' && Math.abs(goal - pos) < 1.5 && Math.abs(vel) < 30) {
        if (current === focusPending) openFocus(current);
        else focusPending = -1;
      }

      if (autoplay && !paused && intro.done && focusTarget === 0 && focusT < 0.01 && !pointer.over && !pointer.down && !hasFocus && mode === 'spring' && Math.abs(goal - pos) < 1 && now - interactedAt > 3000 && now - autoAt > interval * 1000) {
        autoAt = now;
        step(m, 1);
      }

      var travel = Math.abs(pos - lastPos) / dt;
      lastPos = pos;
      var energyTarget = Math.min(travel / 2600, 1);
      energy += (energyTarget - energy) * (1 - Math.exp(-dt / (energyTarget > energy ? 0.07 : 0.35)));
      if (energy > 0.001) animating = true;
      var push = Math.max(-1, Math.min(1, vel / 2200));
      var deformStiffness = 120;
      var deformDamping = 2 * Math.sqrt(deformStiffness) * 0.32;
      deformVel += (deformStiffness * (push - deform) - deformDamping * deformVel) * dt;
      deform += deformVel * dt;

      var focusStiffness = 64;
      focusV += (focusStiffness * (focusTarget - focusT) - 2 * Math.sqrt(focusStiffness) * focusV) * dt;
      focusT += focusV * dt;
      if (Math.abs(focusTarget - focusT) < 0.0005 && Math.abs(focusV) < 0.001) {
        focusT = focusTarget;
        focusV = 0;
      } else {
        animating = true;
      }

      for (var r = 0; r < slots.length; r++) {
        if (slots[r].loaded && slots[r].ready < 1) {
          slots[r].ready = Math.min(1, slots[r].ready + dt / 0.45);
          animating = true;
        }
      }

      var focusAmount = clamp01(focusT);
      var focusEase = easeInOut(focusAmount);
      var focusW = focusIndex >= 0 && focusIndex < m.widths.length ? m.widths[focusIndex] : m.cardH;
      var focusScale = Math.max(1, Math.min(1.3, (height * 0.84) / m.cardH, (width * 0.92) / focusW));
      var effects = introEffects();
      var shrink = 1 - 0.2 * energy;
      var homeX = width / 2;
      var homeY = height / 2;
      var draws = [];

      for (var i = 0; i < slots.length; i++) {
        var w = m.widths[i];
        var baseRel = wrap(m.centers[i] - pos, m.loop);
        for (var k = -3; k <= 3; k++) {
          var rel = baseRel + k * m.loop;
          if (Math.abs(rel) - w / 2 > width + 40) continue;
          var fx = effects.card ? effects.card(rel) : null;
          var x = homeX + rel;
          var y = homeY + (fx ? fx.y : 0);
          var scale = shrink * (fx ? fx.scale : 1);
          var alpha = fx ? fx.alpha : 1;
          if (focusAmount > 0) {
            if (i === focusIndex && Math.abs(rel) < w) {
              scale *= 1 + (focusScale - 1) * focusEase;
            } else {
              var order = Math.min(Math.abs(rel) / width, 1) * 0.25;
              var part = easeInOut(focusAmount * 1.25 - order);
              x += Math.sign(rel) * part * width * 0.7;
              alpha *= 1 - part;
            }
          }
          var cw = w * scale;
          var ch = m.cardH * scale;
          if (alpha <= 0.001 || x + cw / 2 < -40 || x - cw / 2 > width + 40) continue;
          draws.push({ i: i, rel: rel, x: x, y: y, cw: cw, ch: ch, alpha: alpha });
        }
      }
      draws.sort(function (a, b) { return Math.abs(b.rel) - Math.abs(a.rel); });

      if (dirty || animating || intro.running || !ready) {
        dirty = false;
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, rtW, rtH);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(cardProg);
        gl.bindVertexArray(quadVao);
        gl.uniform1i(cardU.tMap, 0);
        gl.uniform2f(cardU.uResolution, width, height);
        gl.uniform1f(cardU.uDpr, dpr);
        gl.uniform1f(cardU.uRadius, 0);
        instances = [];
        for (var d = 0; d < draws.length; d++) {
          var draw = draws[d];
          var slot = slots[draw.i];
          gl.uniform4f(cardU.uRect, draw.x, draw.y, draw.cw + 2, draw.ch + 2);
          gl.uniform2f(cardU.uSize, draw.cw, draw.ch);
          gl.uniform2f(cardU.uImage, slot.image[0], slot.image[1]);
          gl.uniform1f(cardU.uAlpha, draw.alpha);
          gl.uniform1f(cardU.uReady, slot.ready);
          gl.uniform1f(cardU.uShift, reduced ? 0 : Math.max(-1, Math.min(1, draw.rel / (width * 0.75))));
          gl.uniform3fv(cardU.uPlaceholder, slot.color);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, slot.tex);
          gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
          instances.push({
            index: draw.i,
            x0: draw.x - draw.cw / 2,
            x1: draw.x + draw.cw / 2,
            y0: draw.y - draw.ch / 2,
            y1: draw.y + draw.ch / 2
          });
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(lensProg);
        gl.bindVertexArray(triVao);
        var halfW = (0.74 * width) / 2;
        var halfH = (1.18 * width) / 2;
        var inner = Math.max(4, 0.38 * (halfW + halfH) * 0.5);
        gl.uniform1i(lensU.tScene, 0);
        gl.uniform2f(lensU.uResolution, width, height);
        gl.uniform1f(lensU.uDpr, dpr);
        gl.uniform2f(lensU.uCenter, homeX - deform * 14, homeY);
        gl.uniform2f(lensU.uHalf, Math.max(halfW, 1), Math.max(halfH, 1));
        gl.uniform1f(lensU.uAngle, (62 * Math.PI) / 180);
        gl.uniform1f(lensU.uExponent, 2);
        gl.uniform1f(lensU.uInner, inner);
        gl.uniform1f(lensU.uOuter, inner * 1.6);
        gl.uniform1f(lensU.uFlow, 0.34 * (halfW + halfH) * 0.45);
        gl.uniform1f(lensU.uCurl, 0);
        gl.uniform1f(lensU.uDispersion, 0.45 * 0.12);
        gl.uniform1f(lensU.uStrength, effects.strength * (1 - focusEase));
        gl.uniform1f(lensU.uSceneAlpha, effects.scene);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, rtTex);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);

        if (!ready) {
          ready = true;
          root.setAttribute('data-lens-ready', '');
        }
      }

      var nextHover = '';
      if (pointer.over && !pointer.dragging && intro.done) {
        if (focusTarget > 0) nextHover = 'close';
        else if (hitRect(pointer.x, pointer.y)) nextHover = 'open';
      }
      if (nextHover !== hoverAttr) {
        hoverAttr = nextHover;
        if (nextHover) root.setAttribute('data-hover', nextHover);
        else root.removeAttribute('data-hover');
      }

      if (visible && alive && (animating || intro.running || pointer.down || (autoplay && !paused))) {
        raf = requestAnimationFrame(frame);
      }
    }

    function start() {
      if (raf || !visible || !alive) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    // ── input ─────────────────────────────────────────────
    function onDown(e) {
      if (e.button !== undefined && e.button > 0) return;
      skipIntro();
      var p = pointOf(e);
      pointer.down = true;
      pointer.id = e.pointerId;
      pointer.touch = e.pointerType === 'touch';
      pointer.startX = p[0];
      pointer.startY = p[1];
      pointer.x = p[0];
      pointer.y = p[1];
      pointer.startPos = pos;
      pointer.dragging = false;
      pointer.samples = [{ x: p[0], t: performance.now() }];
      interactedAt = performance.now();
      if (Math.abs(vel) > 40) { goal = pos; vel = 0; }
      dirty = true;
      start();
    }
    function onMove(e) {
      var p = pointOf(e);
      pointer.x = p[0];
      pointer.y = p[1];
      pointer.over = true;
      if (pointer.down && e.pointerId === pointer.id) {
        var dx = p[0] - pointer.startX;
        var dy = p[1] - pointer.startY;
        var slop = pointer.touch ? 10 : 5;
        if (!pointer.dragging) {
          if (pointer.touch && Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) {
            pointer.down = false;
            return;
          }
          if (Math.abs(dx) > slop) {
            pointer.dragging = true;
            pointer.startX = p[0];
            pointer.startPos = pos;
            closeFocus();
            try { stage.setPointerCapture(e.pointerId); } catch (err) { /* capture unavailable */ }
            stage.setAttribute('data-dragging', '');
          }
        }
        if (pointer.dragging) {
          pos = pointer.startPos - (p[0] - pointer.startX);
          goal = pos;
          vel = 0;
          var now = performance.now();
          pointer.samples.push({ x: p[0], t: now });
          while (pointer.samples.length > 2 && now - pointer.samples[0].t > 100) pointer.samples.shift();
          interactedAt = now;
        }
      }
      dirty = true;
      start();
    }
    function onUp(e) {
      if (!pointer.down || e.pointerId !== pointer.id) return;
      pointer.down = false;
      stage.removeAttribute('data-dragging');
      var m = metrics();
      interactedAt = performance.now();
      if (pointer.dragging) {
        pointer.dragging = false;
        var now = performance.now();
        var first = pointer.samples[0];
        var lastSample = pointer.samples[pointer.samples.length - 1];
        var velocity = 0;
        if (first && lastSample && lastSample.t > first.t && now - lastSample.t < 70) {
          velocity = -((lastSample.x - first.x) / (lastSample.t - first.t)) * 1000;
        }
        vel = velocity;
        goal = snapPoint(m, pos + velocity * 0.32);
        if (Math.abs(velocity) > 400 && Math.abs(goal - pos) < 1) step(m, velocity > 0 ? 1 : -1);
        mode = 'spring';
        start();
        return;
      }
      if (closeFocus()) return;
      var p = pointOf(e);
      var hit = hitRect(p[0], p[1]);
      if (!hit) return;
      var current = nearest(m, pos);
      if (hit.index === current && Math.abs(goal - pos) < 2) {
        openFocus(hit.index);
      } else {
        var rel = (hit.x0 + hit.x1) / 2 - width / 2;
        goal = snapPoint(m, pos + rel);
        mode = 'spring';
        focusPending = hit.index;
      }
      dirty = true;
      start();
    }
    function onLeave() {
      pointer.over = false;
      dirty = true;
      start();
    }
    function onCancel() {
      pointer.down = false;
      pointer.dragging = false;
      stage.removeAttribute('data-dragging');
      var m = metrics();
      goal = snapPoint(m, pos);
      mode = 'spring';
      start();
    }
    function onWheel(e) {
      if (e.ctrlKey) return;
      var dx = e.deltaX;
      var dy = e.deltaY;
      if (e.shiftKey && Math.abs(dx) < Math.abs(dy)) { dx = dy; dy = 0; }
      if (Math.abs(dx) <= Math.abs(dy)) return;
      e.preventDefault();
      skipIntro();
      interactedAt = performance.now();
      if (closeFocus()) return;
      var delta = Math.max(-120, Math.min(120, dx));
      goal += delta * 1.25;
      mode = 'wheel';
      wheelAt = performance.now();
      start();
    }
    function onKey(e) {
      var m = metrics();
      var now = performance.now();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        skipIntro();
        closeFocus();
        interactedAt = now;
        step(m, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        skipIntro();
        closeFocus();
        interactedAt = now;
        step(m, -1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        closeFocus();
        goTo(m, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        closeFocus();
        goTo(m, slots.length - 1);
      } else if (e.key === 'Escape') {
        if (closeFocus()) e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (closeFocus()) return;
        var a = nearest(m, pos);
        if (a >= 0) openFocus(a);
      }
    }

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('pointercancel', onCancel);
    stage.addEventListener('wheel', onWheel, { passive: false });
    stage.addEventListener('keydown', onKey);
    stage.addEventListener('focus', function () { hasFocus = true; });
    stage.addEventListener('blur', function () { hasFocus = false; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && focusTarget > 0 && !root.contains(document.activeElement)) closeFocus();
    });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        autoAt = performance.now();
        interactedAt = performance.now();
        paintPause();
        dirty = true;
        start();
      });
    }
    function nudge(dir) {
      var m = metrics();
      closeFocus();
      interactedAt = performance.now();
      step(m, dir);
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { nudge(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { nudge(1); });

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) start();
    });
    if ('ResizeObserver' in window) {
      new ResizeObserver(scheduleSize).observe(stage);
    } else {
      window.addEventListener('resize', scheduleSize);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) start();
      }, { rootMargin: '160px 0px' }).observe(stage);
    }

    if (reduced) {
      autoplay = false;
      if (pauseBtn) pauseBtn.hidden = true;
    }
    paintPause();
    setActive(0, true);
    stage.appendChild(canvas);
    if (fallback) fallback.hidden = true;
    applySize();
    root.setAttribute('data-lens-boot', '');
    intro.kind = reduced ? 'fade' : 'rise';
    intro.running = true;
    intro.t = 0;
    goal = snapPoint(metrics(), goal);
    pos = goal;
    requestAnimationFrame(frame);
  }

  /* ── Infinite menu · client notes ───────────────────────── */
  function infiniteMenu() {
    var root = Q.$('[data-imenu]');
    if (!root) return;
    var wheel = Q.$('[data-imenu-wheel]', root);
    var stage = Q.$('[data-imenu-stage]', root);
    var panel = Q.$('[data-imenu-panel]', root);
    var tabs = Q.$$('[data-imenu-tab]', root);
    if (!wheel || !stage || !panel || !tabs.length) return;

    var $ = function (sel) { return Q.$(sel, panel); };
    var fCount = $('[data-imenu-count]');
    var fKicker = $('[data-imenu-kicker]');
    var fQuote = $('[data-imenu-quote]');
    var fAvatar = $('[data-imenu-avatar]');
    var fName = $('[data-imenu-name]');
    var fRole = $('[data-imenu-role]');
    var fYear = $('[data-imenu-year]');
    var dotsWrap = Q.$('[data-imenu-dots]', root);
    var prev = Q.$('[data-imenu-prev]', root);
    var next = Q.$('[data-imenu-next]', root);
    var autoBtn = Q.$('[data-imenu-auto]', root);
    var n = tabs.length;
    var step = 360 / n;
    var AUTO_MS = 6200;
    var reduced = isReduced();
    var cur = 0, rot = 0, timer = null, auto = true, focusPaused = false;
    var dragging = false, dragStart = 0, rotStart = 0, moved = 0;

    tabs.forEach(function (tab, i) { tab.style.setProperty('--a', (i * step) + 'deg'); });

    var dots = [];
    if (dotsWrap) {
      tabs.forEach(function (tab, i) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Read client note ' + (i + 1));
        b.addEventListener('click', function () { activate(i); });
        dotsWrap.appendChild(b);
        dots.push(b);
      });
      dotsWrap.removeAttribute('aria-hidden');
    }

    function paint() {
      var t = tabs[cur];
      fCount.textContent = pad(cur + 1);
      fKicker.textContent = t.getAttribute('data-kicker') || 'Client note';
      fQuote.textContent = t.getAttribute('data-quote') || '';
      var photo = t.getAttribute('data-photo') || '';
      if (fAvatar && fAvatar.tagName === 'IMG') {
        if (photo) fAvatar.src = photo;
        fAvatar.alt = 'Portrait of ' + (t.getAttribute('data-name') || 'client');
      } else if (fAvatar) {
        fAvatar.textContent = t.getAttribute('data-initials') || '';
      }
      fName.textContent = t.getAttribute('data-name') || '';
      fRole.textContent = t.getAttribute('data-role') || '';
      fYear.textContent = t.getAttribute('data-year') || '';
      panel.setAttribute('data-theme', t.getAttribute('data-theme') || 'blue');
      panel.classList.remove('is-flip');
      void panel.offsetWidth;
      panel.classList.add('is-flip');
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === cur);
        d.setAttribute('aria-pressed', i === cur ? 'true' : 'false');
      });
      tabs.forEach(function (tab, i) { tab.classList.toggle('is-active', i === cur); });
    }

    function targetFor(i) {
      var base = i * step;
      var k = Math.round((rot - base) / 360);
      return base + k * 360;
    }

    function rotateTo(deg, animate) {
      rot = deg;
      wheel.style.transition = animate && !reduced ? '' : 'none';
      wheel.style.transform = 'rotateY(' + (-rot).toFixed(2) + 'deg)';
    }

    function activate(i, opts) {
      cur = ((i % n) + n) % n;
      rotateTo(targetFor(cur), true);
      paint();
      if (!opts || !opts.quiet) schedule(9000);
    }

    function schedule(ms) {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, ms);
    }

    function tick() {
      if (!auto || focusPaused || dragging || doc.hidden) {
        schedule(1200);
        return;
      }
      activate(cur + 1, { quiet: true });
      schedule(AUTO_MS);
    }

    function paintAuto() {
      if (!autoBtn) return;
      autoBtn.setAttribute('aria-pressed', auto ? 'false' : 'true');
      autoBtn.classList.toggle('is-paused', !auto);
      var label = Q.$('[data-imenu-auto-label]', autoBtn);
      if (label) label.textContent = auto ? 'Auto' : 'Paused';
      autoBtn.setAttribute('aria-label', auto ? 'Pause automatic client notes' : 'Resume automatic client notes');
    }

    if (autoBtn) {
      autoBtn.addEventListener('click', function () {
        auto = !auto;
        paintAuto();
        if (auto) schedule(1400);
        else window.clearTimeout(timer);
      });
      paintAuto();
    }

    if (prev) prev.addEventListener('click', function () { activate(cur - 1); });
    if (next) next.addEventListener('click', function () { activate(cur + 1); });

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i); });
    });
    stage.addEventListener('focusin', function (e) {
      focusPaused = !!(e.target.matches && e.target.matches(':focus-visible'));
    });
    stage.addEventListener('focusout', function (e) {
      if (!stage.contains(e.relatedTarget)) {
        focusPaused = false;
        if (auto) schedule(1600);
      }
    });

    stage.addEventListener('pointerdown', function (e) {
      if (!canHover()) return;
      dragging = true;
      moved = 0;
      dragStart = e.clientX;
      rotStart = rot;
      wheel.style.transition = 'none';
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      moved = e.clientX - dragStart;
      rotateTo(rotStart - moved * 0.26, false);
    });
    window.addEventListener('pointerup', function () {
      if (!dragging) return;
      dragging = false;
      var idx = Math.round(rot / step);
      rotateTo(targetFor(((idx % n) + n) % n), true);
      activate(((idx % n) + n) % n, { quiet: true });
      schedule(9000);
    });

    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); activate(cur + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); activate(cur - 1); }
    });

    doc.addEventListener('visibilitychange', function () { if (!doc.hidden && auto) schedule(2000); });

    if (reduced) {
      wheel.style.transition = 'none';
      activate(0, { quiet: true });
      schedule(5200);
      return;
    }

    rot = 0;
    rotateTo(0, false);
    paint();
    schedule(5200);
  }

  /* ── Decay cards · pointer light + lace draw-in ─────────── */
  function decayCards() {
    var cards = Q.$$('[data-decay]');
    if (!cards.length) return;
    if (canHover()) {
      cards.forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          var px = clamp((e.clientX - r.left) / r.width, 0, 1);
          var py = clamp((e.clientY - r.top) / r.height, 0, 1);
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
          card.style.setProperty('--rx', ((0.5 - py) * 3.6).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((px - 0.5) * 4.4).toFixed(2) + 'deg');
        }, { passive: true });
        card.addEventListener('pointerleave', function () {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
        });
      });
    }
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.22 });
    cards.forEach(function (c) { io.observe(c); });
  }

  /* ── Masked headings ────────────────────────────────────── */
  function maskedHeadings() {
    var els = Q.$$('[data-masked]');
    if (!els.length) return;
    var ticking = false;

    /* clip-path hides the box from IntersectionObserver, so use geometry */
    function sweep() {
      ticking = false;
      var vh = window.innerHeight;
      els.forEach(function (el) {
        if (el.classList.contains('is-mask')) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.88 && r.bottom > vh * 0.06) {
          el.classList.add('is-in', 'is-mask');
        }
      });
    }
    function request() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(sweep);
    }

    sweep();
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    window.addEventListener('load', request);
  }

  /* ── Elastic mesh · dot field in the tech band ──────────── */
  function elasticMesh() {
    var canvas = Q.$('[data-mesh]');
    if (!canvas) return;
    var host = canvas.parentElement;
    var ctx = canvas.getContext('2d');
    if (!host || !ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, dots = [], mx = -9999, my = -9999, inView = false;
    var rafId = null, last = 0;

    function build() {
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      var gap = W < 700 ? 30 : 38;
      for (var y = gap / 2; y < H; y += gap) {
        for (var x = gap / 2; x < W; x += gap) dots.push([x, y]);
      }
      draw(performance.now());
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      var wave = isReduced() ? 0 : 1;
      for (var i = 0; i < dots.length; i++) {
        var x = dots[i][0], y = dots[i][1];
        var dx = x - mx, dy = y - my;
        var d2 = dx * dx + dy * dy;
        var inf = Math.exp(-d2 / 15000);
        var ox = Math.sin(y * 0.018 + t * 0.0007) * 1.6 * wave + (dx / (Math.sqrt(d2) + 1)) * inf * 24;
        var oy = Math.cos(x * 0.016 + t * 0.0006) * 1.6 * wave + (dy / (Math.sqrt(d2) + 1)) * inf * 24;
        var a = 0.1 + inf * 0.42;
        ctx.fillStyle = 'rgba(8,96,190,' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(x + ox, y + oy, 1 + inf * 2.2, 0, 6.283);
        ctx.fill();
      }
    }

    function loop(now) {
      rafId = null;
      if (!inView) return;
      if (now - last < 34) { rafId = raf(loop); return; }
      last = now;
      draw(now);
      rafId = raf(loop);
    }

    build();
    window.addEventListener('resize', function () {
      window.clearTimeout(canvas._meshT);
      canvas._meshT = window.setTimeout(build, 180);
    });
    host.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    }, { passive: true });
    host.addEventListener('pointerleave', function () { mx = my = -9999; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView && !isReduced() && rafId === null) rafId = raf(loop);
        if (!inView) { window.cancelAnimationFrame(rafId); rafId = null; }
      }, { threshold: 0 }).observe(canvas);
    } else {
      inView = true;
      if (!isReduced()) rafId = raf(loop);
    }
  }

  /* ── Marquee words · per-word colour on hover ───────────── */
  function marqueeWords() {
    var palette = ['#087BE8', '#6324C8', '#16A34A', '#F28B16', '#0E9AA7', '#D4547A'];
    var k = 0;
    Q.$$('.about-marquee li, .tech-rows li').forEach(function (li) {
      if (li.querySelector('.mw-word')) return;
      var textNodes = [];
      [].slice.call(li.childNodes).forEach(function (node) {
        if (node.nodeType === 3 && node.nodeValue.trim()) textNodes.push(node);
      });
      textNodes.forEach(function (node) {
        var words = node.nodeValue.trim().split(/\s+/);
        var frag = doc.createDocumentFragment();
        if (li.firstChild !== node) frag.appendChild(doc.createTextNode(' '));
        words.forEach(function (w, wi) {
          var span = doc.createElement('span');
          span.className = 'mw-word';
          span.textContent = w;
          span.style.setProperty('--wc', palette[k++ % palette.length]);
          span.style.transitionDelay = (wi * 45) + 'ms';
          frag.appendChild(span);
          if (wi < words.length - 1) frag.appendChild(doc.createTextNode(' '));
        });
        node.parentNode.replaceChild(frag, node);
      });
    });
  }

  /* ── Quote popup ────────────────────────────────────────── */
  function quotePopup() {
    var dlg = doc.getElementById('quoteDialog');
    if (!dlg) return;
    var form = Q.$('[data-quote-form]', dlg);
    var status = Q.$('[data-quote-status]', dlg);
    var seen = false;
    try { seen = !!window.sessionStorage.getItem('qf-quote-open'); } catch (e) { seen = false; }

    function open() {
      if (typeof dlg.showModal === 'function') {
        if (!dlg.open) dlg.showModal();
      } else {
        dlg.setAttribute('open', '');
      }
      doc.documentElement.classList.add('quote-open');
      try { window.sessionStorage.setItem('qf-quote-open', '1'); } catch (e) {}
    }
    function close() {
      if (typeof dlg.close === 'function' && dlg.open) dlg.close();
      else dlg.removeAttribute('open');
      doc.documentElement.classList.remove('quote-open');
    }

    Q.$$('[data-quote-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    Q.$$('[data-quote-close]', dlg).forEach(function (btn) { btn.addEventListener('click', close); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('close', function () { doc.documentElement.classList.remove('quote-open'); });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = new FormData(form);
        var name = String(data.get('name') || '').trim();
        var email = String(data.get('email') || '').trim();
        var service = String(data.get('service') || '').trim();
        var budget = String(data.get('budget') || '').trim();
        var message = String(data.get('message') || '').trim();
        if (!name || !email || !message) {
          status.textContent = 'Please add your name, email and a one-line brief.';
          status.classList.add('is-error');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          status.textContent = 'That email address does not look complete.';
          status.classList.add('is-error');
          return;
        }
        status.classList.remove('is-error');
        status.textContent = 'Sending your quote request securely…';
        var submit = Q.$('button[type="submit"]', form);
        if (submit) submit.disabled = true;
        var fields = window.QuadraForms.values(form);
        fields.topic = 'Project quote';
        window.QuadraForms.submit('quote', fields).then(function () {
          status.textContent = 'Your quote request has been sent successfully.';
          form.reset();
          window.setTimeout(close, 1500);
        }).catch(function (err) {
          status.textContent = err.message + ' Please email info@quadrafroynsolutions.in.';
          status.classList.add('is-error');
        }).finally(function () { if (submit) submit.disabled = false; });
      });
    }

    if (!seen && !isReduced()) {
      window.setTimeout(open, 3000);
    }
  }

  /* ── Boot ───────────────────────────────────────────────── */
  var baseStart = Q.start;
  Q.start = function () {
    if (typeof baseStart === 'function') baseStart();
    splashCursor();
    lensCarousel();
    infiniteMenu();
    decayCards();
    maskedHeadings();
    elasticMesh();
    marqueeWords();
    quotePopup();
  };
})();
