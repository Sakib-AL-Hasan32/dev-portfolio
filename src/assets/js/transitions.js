/**
 * Page-level chrome: scroll progress bar, back-to-top button, and a fallback
 * page transition for browsers without cross-document View Transitions.
 */
import { $, reducedMotion, rafThrottle } from './utils.js';

function scrollChrome() {
  const bar = $('[data-scroll-progress]');
  const toTop = $('[data-to-top]');
  const update = rafThrottle(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    bar?.style.setProperty('--p', p.toFixed(4));
    if (toTop) {
      toTop.style.setProperty('--p', p.toFixed(4));
      toTop.classList.toggle('is-visible', scrollY > 600);
    }
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();

  toTop?.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    // Move focus to the top for keyboard users without scrolling again.
    $('.skip-link')?.focus({ preventScroll: true });
  });
}

function fallbackTransitions() {
  const html = document.documentElement;
  if (!html.classList.contains('no-vt') || reducedMotion()) return;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // in-page anchor
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(() => (location.href = url.href), 240);
  });

  // Restored from back/forward cache → undo the leaving state.
  addEventListener('pageshow', (e) => {
    if (e.persisted) document.body.classList.remove('is-leaving');
  });
}

export function initChrome() {
  scrollChrome();
  fallbackTransitions();
}
