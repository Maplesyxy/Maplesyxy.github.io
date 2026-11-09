(function () {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ----- Theme -----
  const toggle = document.querySelector('.theme-toggle');
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  if (stored === 'dark' || stored === 'light') root.setAttribute('data-theme', stored);
  toggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  // ----- Clickable Mantis card -----
  document.querySelectorAll('.is-link').forEach(card => {
    const main = card.querySelector('a.stretched');
    if (!main) return;
    card.addEventListener('click', e => { if (e.target.closest('a')) return; window.open(main.href, '_blank', 'noopener'); });
  });

  // ----- Split headings into characters (keeps the plain text for assistive tech) -----
  const splitTargets = [...document.querySelectorAll('[data-split]')];
  splitTargets.forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = '';
    text.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
      const word = document.createElement('span'); word.className = 'word'; word.setAttribute('aria-hidden', 'true');
      [...part].forEach(ch => {
        const clip = document.createElement('span'); clip.className = 'split-clip';
        const c = document.createElement('span'); c.className = 'char'; c.textContent = ch;
        clip.appendChild(c); word.appendChild(clip);
      });
      el.appendChild(word);
    });
  });

  // ----- Nav highlight -----
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (!e.isIntersecting) return; links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // ----- Tilt (pointer devices only) -----
  if (fine && !reduced && window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('.tilt'), { max: 5, speed: 600, perspective: 900, scale: 1.01, glare: true, 'max-glare': 0.1, gyroscope: false });
  }

  // ----- Scroll choreography: Lenis smooth scroll + GSAP ScrollTrigger -----
  const hasMotionStack = !reduced && window.gsap && window.ScrollTrigger && window.Lenis;
  if (!hasMotionStack) {
    // Static fallback: everything visible, nothing animated.
    document.querySelectorAll('.char').forEach(c => { c.style.transform = 'none'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // Scroll velocity drives: skew on cards, ticker speed, and the hairline walls sliding past.
  let vel = 0;
  const walls = [...document.querySelectorAll('.wall')];
  const tickerTweens = [];
  lenis.on('scroll', ({ velocity, scroll }) => {
    vel = gsap.utils.clamp(-1, 1, velocity / 60);
    root.style.setProperty('--vel', (vel * 1.6).toFixed(3));
    walls.forEach((w, i) => w.style.setProperty('--wall-y', `${(-scroll * (i ? 0.35 : 0.5)) % 140}px`));
    tickerTweens.forEach(tw => tw.timeScale(gsap.utils.clamp(-4, 4, 1 + velocity / 25)));
  });
  gsap.ticker.add(() => {
    vel *= 0.9; root.style.setProperty('--vel', (vel * 1.6).toFixed(3));
    tickerTweens.forEach(tw => { const ts = tw.timeScale(); tw.timeScale(ts + (1 - ts) * 0.08); });
  });
  document.querySelectorAll('.card, .pub, .timeline .what, .awards li').forEach(el => el.classList.add('skew'));

  // Hero: the panel lifts and fades while the photo zooms as you scroll away.
  gsap.to('.hero-panel', { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: true } });
  gsap.to('.hero-bg img', { scale: 1.18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.scroll-cue', { opacity: 0, scrollTrigger: { trigger: '.hero', start: '10% top', end: '30% top', scrub: true } });

  // Headline characters rise in, staggered, when each heading scrolls into view.
  splitTargets.forEach(el => {
    const chars = el.querySelectorAll('.char');
    gsap.set(chars, { yPercent: 110 });
    const inHero = el.closest('.hero');
    gsap.to(chars, {
      yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: { each: 0.028, from: 'start' },
      delay: inHero ? 0.2 : 0,
      scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 88%', once: true }
    });
  });

  // Cards and list rows: batch reveal with a small lift.
  const revealEls = gsap.utils.toArray('.pub, .card, .timeline li, .awards li, .facts div');
  gsap.set(revealEls, { autoAlpha: 0, y: 28 });
  ScrollTrigger.batch(revealEls, {
    start: 'top 92%', once: true,
    onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, overwrite: true })
  });

  // Prose paragraphs drift in a touch later than their heading.
  gsap.utils.toArray('.prose p, .section-note').forEach(p => {
    gsap.from(p, { autoAlpha: 0, y: 18, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: p, start: 'top 90%', once: true } });
  });

  // Tickers: endless horizontal marquee; the track is duplicated so it can loop seamlessly.
  document.querySelectorAll('.ticker').forEach(t => {
    const track = t.querySelector('.ticker-track');
    const clone = track.cloneNode(true); t.appendChild(clone);
    const w = track.offsetWidth + 28;
    gsap.set([track, clone], { x: i => i * w, yPercent: -50 });
    const tw = gsap.to([track, clone], { x: `-=${w}`, duration: w / 60, ease: 'none', repeat: -1, modifiers: { x: gsap.utils.unitize(x => (parseFloat(x) % (w * 2) + w * 2) % (w * 2) - w) } });
    tickerTweens.push(tw);
  });

  // Section dividers draw themselves in from the left.
  gsap.utils.toArray('.section').forEach(sec => {
    gsap.fromTo(sec, { '--rule': '0%' }, { '--rule': '100%', ease: 'none', scrollTrigger: { trigger: sec, start: 'top 95%', end: 'top 55%', scrub: true } });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
