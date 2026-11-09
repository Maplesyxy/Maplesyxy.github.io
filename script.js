(function () {
  const root = document.documentElement;
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

  // Nav highlight
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // Reveal
  const items = document.querySelectorAll('.pub, .card, .timeline li, .awards li, .facts div');
  if ('IntersectionObserver' in window) {
    items.forEach(el => el.classList.add('reveal'));
    const rev = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => rev.observe(el));
  }

  // Clickable experience card (Mantis): whole card opens the site, inner links still work.
  document.querySelectorAll('.is-link').forEach(card => {
    const main = card.querySelector('a.stretched');
    if (!main) return;
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      window.open(main.href, '_blank', 'noopener');
    });
  });

  // Tilt (pointer devices only)
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (fine && !reduced && window.VanillaTilt) {
    VanillaTilt.init(document.querySelectorAll('.tilt'), { max: 5, speed: 600, perspective: 900, scale: 1.01, glare: true, 'max-glare': 0.1, gyroscope: false });
  }

  // Section wipe: a wind gust shakes a large maple leaf at the top-right, then it tumbles across
  // the whole viewport as one section hands over to the next. Driven by scroll position, no timers.
  const leaf = document.querySelector('.leaf-wipe');
  const wind = document.querySelector('.wind');
  const windLines = wind ? [...wind.querySelectorAll('i')] : [];
  const ground = document.getElementById('contact');
  const boundaries = ['experience', 'research', 'projects', 'organizations', 'awards', 'contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  if (leaf && !reduced && boundaries.length) {
    let ticking = false;
    const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight, vw = window.innerWidth, y = window.scrollY;
      // The wipe for a boundary plays while its top edge travels from the bottom of the viewport
      // up to 35% from the top: p = 0 when it enters, p = 1 when the new section has taken over.
      let active = null, p = 0;
      for (const el of boundaries) {
        const top = el.getBoundingClientRect().top;
        const q = (vh - top) / (vh * 0.65);
        if (q > 0 && q < 1) { active = el; p = q; break; }
      }
      if (!active) {
        leaf.classList.remove('on'); wind?.classList.remove('on');
        if (ground) ground.classList.toggle('landed', ground.getBoundingClientRect().top < vh * 0.7);
        return;
      }
      leaf.classList.add('on');
      const size = Math.min(vw, vh) * 0.92;
      let x, ty, rot, sc;
      if (p < 0.3) {
        // Gust: the leaf hangs just above the top-right corner and shivers harder as the wind builds.
        const g = p / 0.3;
        wind?.classList.add('on');
        windLines.forEach((el, i) => el.style.setProperty('--w', ((g * 1.4 + i * 0.17) % 1.2).toFixed(3)));
        x = vw * 0.82 + Math.sin(g * 28) * 10 * g;
        ty = -size * 0.28 + Math.sin(g * 22) * 8 * g;
        rot = -20 + Math.sin(g * 34) * 14 * g;
        sc = 0.9 + 0.1 * g;
      } else {
        // Fall: tumble diagonally through the middle of the page and out the bottom-left.
        const f = ease((p - 0.3) / 0.7);
        if (wind) { wind.classList.toggle('on', f < 0.35); windLines.forEach((el, i) => el.style.setProperty('--w', (0.42 + f * 0.9 + i * 0.1).toFixed(3))); }
        x = vw * 0.82 - f * vw * 0.95 + Math.sin(f * Math.PI * 2.2) * vw * 0.08;
        ty = -size * 0.28 + f * (vh + size * 0.9);
        rot = -20 + f * 520 + Math.sin(f * Math.PI * 4) * 16;
        sc = 1 + Math.sin(f * Math.PI) * 0.18;
      }
      leaf.style.transform = `translate3d(${x}px, ${ty}px, 0) rotate(${rot}deg) scale(${sc})`;
      if (ground) ground.classList.toggle('landed', active === ground && p > 0.85);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  } else if (ground) {
    ground.classList.add('landed');
  }
})();
