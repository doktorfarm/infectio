// Landing page motion (see flair.css). Reduced motion: nothing here runs, the page stays static.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const root = document.documentElement;
  root.classList.add('flair-js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const raf = (fn) => { let queued = false; return (...a) => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; fn(...a); }); }; };

  // --- split a heading into words, each inside a mask; --i drives the stagger ---
  function split(el) {
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(' '); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.textContent = part; i.style.setProperty('--i', n++);
            w.append(i); frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') walk(child);
      });
    };
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    walk(el);
    $$('.w', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
    el.classList.add('split');
  }
  const heroTitle = $('.hero h1');
  if (heroTitle) split(heroTitle);
  $$('.section-heading h2,.story-heading h2,.how-section h2,#cta-title,.faq-section h2,.recall h2').forEach((h) => { h.dataset.split = ''; split(h); });

  // --- one observer for everything that starts when it scrolls into view ---
  const watch = (els, cls, opts, once = true) => {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      e.target.classList.toggle(cls, e.isIntersecting);
      if (e.isIntersecting && once) io.unobserve(e.target);
    }), opts);
    els.forEach((el) => io.observe(el));
  };
  watch($$('[data-split]'), 'in', { threshold: 0.3 });
  const bento = $('.bento');
  if (bento) { $$('.feature', bento).forEach((f, i) => f.style.setProperty('--i', i)); watch([bento], 'in', { threshold: 0.15 }); }
  const stage = $('.story-stage');
  if (stage) watch([stage], 'in-view', { threshold: 0.35 }, false); // scenes replay each time the section returns
  const recall = $('.recall');
  if (recall) watch([recall], 'in', { threshold: 0.35 }); // the forgetting curve draws itself

  // ---- microbes: cocci, bacilli and spiked viruses drift, shy away from the cursor and pass a glow to
  // ---- their neighbours (an outbreak). Clicking starts one. Paused off-screen and in background tabs.
  function startBiome(host) {
    const canvas = document.createElement('canvas');
    canvas.className = 'biome'; canvas.setAttribute('aria-hidden', 'true');
    host.prepend(canvas);
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, P = [], ripples = [], frameId = 0, visible = true, last = performance.now(), nextOutbreak = last + 2200;
    const mouse = { x: -9999, y: -9999 };
    const rnd = (a, b) => a + Math.random() * (b - a);
    const kinds = ['coccus', 'virus', 'bacillus', 'coccus', 'virus', 'bacillus'];

    function resize() {
      const r = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(34, Math.max(10, (w * h) / 46000)));
      P = Array.from({ length: n }, (_, i) => ({
        k: kinds[i % kinds.length], x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.14, 0.14), vy: rnd(-0.1, 0.1),
        r: rnd(7, 21), a: rnd(0, 6.28), va: rnd(-0.004, 0.004), z: rnd(0.45, 1), ph: rnd(0, 6.28), glow: 0, gen: 0, spreadAt: 0, spikes: Math.round(rnd(9, 13)),
      }));
    }
    resize();
    new ResizeObserver(raf(resize)).observe(host);

    host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    host.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    host.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a,button')) return;
      const r = host.getBoundingClientRect();
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t0: performance.now() });
    });

    function ignite(p, gen, now) { p.glow = 1; p.gen = gen; p.spreadAt = gen < 4 ? now + 260 : 0; }

    function shape(p, t) {
      const g = p.glow, a = 0.28 + 0.5 * p.z;
      const stroke = 'rgba(' + Math.round(120 - g * 60) + ',' + Math.round(185 + g * 25) + ',255,' + (a + g * 0.5) + ')';
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.a);
      const r = p.r * (0.8 + p.z * 0.5);
      ctx.lineWidth = 1.2 + g;
      ctx.strokeStyle = stroke;
      if (g > 0.02) {
        const halo = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * (2.2 + g * 2));
        halo.addColorStop(0, 'rgba(53,208,245,' + 0.32 * g + ')'); halo.addColorStop(1, 'rgba(53,208,245,0)');
        ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, r * (2.2 + g * 2), 0, 6.283); ctx.fill();
      }
      const fill = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r * 1.2);
      fill.addColorStop(0, 'rgba(120,190,255,' + (0.2 + g * 0.2) + ')'); fill.addColorStop(1, 'rgba(40,110,255,0.05)');
      ctx.fillStyle = fill;
      if (p.k === 'coccus') {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(r * 0.25, -r * 0.1, r * 0.3, 0, 6.283); ctx.stroke();
      } else if (p.k === 'bacillus') {
        const L = r * 1.5, wd = r * 0.62;
        ctx.beginPath(); ctx.arc(-L, 0, wd, Math.PI / 2, -Math.PI / 2); ctx.arc(L, 0, wd, -Math.PI / 2, Math.PI / 2); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-L * 0.6, 0); ctx.lineTo(L * 0.6, 0); ctx.setLineDash([2, 5]); ctx.stroke(); ctx.setLineDash([]);
      } else {
        const core = r * 0.6, dir = p.ph > 3 ? 1 : -1;
        ctx.beginPath();
        for (let k = 0; k < p.spikes; k++) { const an = (k / p.spikes) * 6.283 + t * 0.00018 * dir; ctx.moveTo(Math.cos(an) * core, Math.sin(an) * core); ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
        ctx.stroke();
        ctx.fillStyle = stroke;
        for (let k = 0; k < p.spikes; k++) { const an = (k / p.spikes) * 6.283 + t * 0.00018 * dir; ctx.beginPath(); ctx.arc(Math.cos(an) * r, Math.sin(an) * r, 1.6 + g, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(0, 0, core, 0, 6.283); ctx.fill(); ctx.stroke();
      }
      ctx.restore();
    }

    function frame(now) {
      frameId = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(48, now - last); last = now;
      ctx.clearRect(0, 0, w, h);
      // outbreaks start on their own now and then
      if (now > nextOutbreak && P.length) { ignite(P[(Math.random() * P.length) | 0], 0, now); nextOutbreak = now + rnd(4200, 7200); }
      // spread to neighbours
      for (const p of P) if (p.spreadAt && now >= p.spreadAt) {
        p.spreadAt = 0;
        for (const q of P) if (q !== p && q.glow < 0.25 && (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < 190 * 190) ignite(q, p.gen + 1, now);
      }
      // ripples from clicks
      ripples = ripples.filter((r) => now - r.t0 < 1100);
      for (const r of ripples) {
        const k = (now - r.t0) / 1100, rad = k * 320;
        ctx.strokeStyle = 'rgba(110,215,255,' + 0.5 * (1 - k) + ')'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.283); ctx.stroke();
        for (const p of P) { const d = Math.hypot(p.x - r.x, p.y - r.y); if (p.glow < 0.3 && Math.abs(d - rad) < 22) ignite(p, 2, now); }
      }
      // move
      const step = dt * 0.96;
      for (const p of P) {
        p.x += (p.vx + Math.sin(now * 0.0004 + p.ph) * 0.05) * step * p.z;
        p.y += (p.vy + Math.cos(now * 0.0003 + p.ph) * 0.05) * step * p.z;
        p.a += p.va * step;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 150 && d > 0.1) { const f = ((150 - d) / 150) * 0.9; p.x += (dx / d) * f * 2; p.y += (dy / d) * f * 2; }
        if (p.x < -40) p.x = w + 40; if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40; if (p.y > h + 40) p.y = -40;
        p.glow *= Math.pow(0.9895, dt / 16);
        if (p.glow < 0.01) p.glow = 0;
      }
      // contact lines: faint between near microbes, bright along an outbreak
      ctx.lineWidth = 1;
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b = P[j], d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d2 > 170 * 170) continue;
        const k = 1 - Math.sqrt(d2) / 170, g = Math.max(a.glow, b.glow);
        ctx.strokeStyle = g > 0.05 ? 'rgba(80,215,255,' + (0.1 + k * 0.45 * g) + ')' : 'rgba(110,170,255,' + k * 0.16 + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      for (const p of P) shape(p, now);
      frameId = requestAnimationFrame(frame);
    }
    const kick = () => { if (!frameId && visible && !document.hidden) { last = performance.now(); frameId = requestAnimationFrame(frame); } };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(host);
    document.addEventListener('visibilitychange', kick);
    kick();
  }

  // --- hero: microbes, spotlight, tilt, count-up ---
  const hero = $('.hero');
  const band = $('.hero-band');
  if (hero && band) {
    startBiome(band);

    const mock = $('.mockup', hero);
    const move = raf((e) => {
      const r = band.getBoundingClientRect();
      band.style.setProperty('--px', ((e.clientX - r.left) / r.width) * 100 + '%');
      band.style.setProperty('--py', ((e.clientY - r.top) / r.height) * 100 + '%');
      if (mock && innerWidth > 760) {
        const m = mock.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (m.left + m.width / 2)) / (innerWidth / 2)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (m.top + m.height / 2)) / (innerHeight / 2)));
        mock.style.setProperty('--ry', dx * 7 + 'deg');
        mock.style.setProperty('--rx', -dy * 5 + 'deg');
      }
    });
    band.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') move(e); });
    band.addEventListener('pointerleave', () => { if (mock) { mock.style.setProperty('--ry', '0deg'); mock.style.setProperty('--rx', '0deg'); } });

    // numbers in the preview count up once it has arrived
    $$('.mock-metrics b,.mock-modes b', hero).forEach((el) => {
      const target = Number(el.textContent);
      if (!Number.isFinite(target) || !/^\d+$/.test(el.textContent.trim())) return;
      el.textContent = '0';
      const start = performance.now() + 900, dur = 1300;
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / dur));
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // --- feature cards: spotlight follows the pointer ---
  $$('.feature').forEach((card) => card.addEventListener('pointermove', raf((e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
  })));

  // --- primary buttons lean toward the cursor ---
  if (matchMedia('(pointer: fine)').matches) $$('.hero .button,.cta-banner .button,.nav-cta').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.translate = ((e.clientX - r.left) / r.width - 0.5) * 10 + 'px ' + ((e.clientY - r.top) / r.height - 0.5) * 8 + 'px';
    });
    btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
  });

  // --- scroll progress bar and a navbar shadow once the page moves ---
  const bar = document.createElement('div');
  bar.className = 'flair-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.append(bar);
  const nav = $('.navbar');
  const onScroll = raf(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', scrollY > 8);
  });
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
}
