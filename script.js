(function () {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Theme
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

  // Clickable Mantis card
  document.querySelectorAll('.is-link').forEach(card => {
    const main = card.querySelector('a.stretched');
    if (!main) return;
    card.addEventListener('click', e => { if (e.target.closest('a')) return; window.open(main.href, '_blank', 'noopener'); });
  });

  // Nav highlight
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (!e.isIntersecting) return; links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id)); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => obs.observe(s));
  }

  // Hero planes: scroll and pointer publish three numbers; CSS transforms do the rest.
  const hero = document.querySelector('.hero');
  if (hero && !reduced) {
    let sy = 0, mx = 0, my = 0, queued = false;
    const apply = () => { hero.style.setProperty('--sy', sy.toFixed(1)); hero.style.setProperty('--mx', mx.toFixed(3)); hero.style.setProperty('--my', my.toFixed(3)); queued = false; };
    const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(apply); } };
    const onScroll = () => { const lim = innerHeight * 1.2; const y = Math.min(scrollY, lim); if (y === sy) return; sy = y; schedule(); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    if (fine) hero.addEventListener('pointermove', e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; schedule(); });
  }

  // Reveal once on entry; siblings stagger via --d. Opacity/transform only, so it stays on the compositor.
  if (reduced || !('IntersectionObserver' in window)) return;
  const groups = ['.timeline li', '.pub', '.cards .card', '.awards li', '.facts div', '.stats-inner div'];
  groups.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${Math.min(i % 6, 5) * 0.06}s`); });
  });
  // Timeline entries re-arm when they leave the viewport, so each one slides in again as you scroll back.
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const sticky = !e.target.matches('.timeline li');
      if (e.isIntersecting) { e.target.classList.add('in'); if (sticky) ro.unobserve(e.target); }
      else if (!sticky && e.boundingClientRect.top > 0) e.target.classList.remove('in');
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
})();
