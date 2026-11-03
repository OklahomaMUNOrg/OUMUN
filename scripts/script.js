// Fade-in on scroll. Without JavaScript, everything simply shows normally.
document.documentElement.classList.add('js');

const targets = document.querySelectorAll(
  '.intro, .content > :not(.card-grid), .conferences h2, .conf-card, .card, .band-inner, .map-section h2, .map-wrap'
);
targets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

targets.forEach(el => observer.observe(el));

// Hamburger menu toggle. Without JavaScript, the menu is always open on large screens and always closed on small screens.
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.querySelectorAll('.main-nav a, .sub-nav a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
}

// Executive team cards: on touch screens (no hover), tap a card to show or hide its bio.
const officerCards = document.querySelectorAll('.officer');
if (officerCards.length && window.matchMedia('(hover: none)').matches) {
  officerCards.forEach(card => card.addEventListener('click', () => {
    const wasOpen = card.classList.contains('open');
    officerCards.forEach(o => o.classList.remove('open'));
    if (!wasOpen) card.classList.add('open');
  }));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.officer')) officerCards.forEach(o => o.classList.remove('open'));
  });
}