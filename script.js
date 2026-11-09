(function () {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  // Reveal once on entry; siblings stagger via --d. Opacity/transform only, so it stays on the compositor.
  if (reduced || !('IntersectionObserver' in window)) return;
  const groups = ['.timeline li', '.pub', '.cards .card', '.awards li', '.facts div', '.stats-inner div'];
  groups.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', `${Math.min(i % 6, 5) * 0.06}s`); });
  });
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));
})();
