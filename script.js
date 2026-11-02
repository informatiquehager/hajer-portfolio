'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'فتح القائمة' : 'إغلاق القائمة');
  navigation.classList.toggle('open', !expanded);
});
navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'فتح القائمة');
}));
const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('[data-category]');
filterButtons.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  filterButtons.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  projectCards.forEach(card => { card.hidden = selected !== 'all' && card.dataset.category !== selected; });
}));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08, rootMargin: '0px 0px 40px 0px' });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('visible'));
}
document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    const previous = button.textContent;
    button.textContent = 'تم النسخ';
    setTimeout(() => { button.textContent = previous; }, 1800);
  } catch { button.textContent = 'حدّد البريد لنسخه'; }
}));

// Scroll indication and contextual navigation, without external libraries.
const progressBar = document.querySelector('.reading-progress');
let scrollScheduled = false;
function updateReadingProgress() {
  const maximum = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar) progressBar.style.width = (maximum > 0 ? Math.min(100, (window.scrollY / maximum) * 100) : 0) + '%';
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) { window.requestAnimationFrame(updateReadingProgress); scrollScheduled = true; }
}, { passive: true });
updateReadingProgress();
if ('IntersectionObserver' in window) {
  const navLinks = [...document.querySelectorAll('#primary-nav a[href^="#"]')];
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.removeAttribute('aria-current'));
        navLinks.find(link => link.getAttribute('href') === '#' + entry.target.id)?.setAttribute('aria-current', 'location');
      }
    });
  }, { rootMargin: '-28% 0px -60% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => navObserver.observe(section));
}
const shareButton = document.querySelector('.share-site');
shareButton?.addEventListener('click', async () => {
  const url = window.location.href.split('#')[0];
  try {
    if (navigator.share) await navigator.share({ title: document.title, url });
    else if (navigator.clipboard) { await navigator.clipboard.writeText(url); shareButton.textContent = 'تم نسخ رابط الموقع'; setTimeout(() => shareButton.textContent = 'مشاركة الموقع ↗', 2000); }
    else window.prompt('انسخ رابط الموقع:', url);
  } catch (error) { if (error.name !== 'AbortError') window.prompt('انسخ رابط الموقع:', url); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation?.classList.contains('open')) {
    navigation.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.focus();
  }
});
