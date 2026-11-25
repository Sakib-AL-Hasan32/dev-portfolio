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

/* ---------- "Back" that returns you to where you were ---------- */

const RETURN_KEYS = { project: 'pf:return:project', projects: 'pf:return:projects' };
const cleanUrl = (u) => u.split('#')[0];
const isDetailPath = (p) => /\/projects\/[^/]+\/?$/.test(p);
const isProjectsPath = (p) => /\/projects\/?$/.test(p);

function store(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — Back falls back to a normal link */
  }
}

function read(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
}

/** On Home and Projects: remember the page + scroll position when a project (or the projects page) is opened. */
function rememberOrigin() {
  const page = document.body.dataset.page;
  if (page !== 'home' && page !== 'projects') return;
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      const origin = { url: cleanUrl(location.href), y: Math.round(scrollY) };
      if (isDetailPath(url.pathname)) store(RETURN_KEYS.project, origin);
      else if (page === 'home' && isProjectsPath(url.pathname)) store(RETURN_KEYS.projects, origin);
    },
    true,
  );
}

/** [data-back] links: go back to the remembered page, at the remembered scroll position. */
function backLinks() {
  const link = document.querySelector('[data-back]');
  if (!link) return;
  const page = document.body.dataset.page;
  const origin = read(page === 'project' ? RETURN_KEYS.project : RETURN_KEYS.projects);
  if (!origin?.url) return;
  const target = new URL(origin.url);
  if (target.origin !== location.origin || cleanUrl(target.href) === cleanUrl(location.href)) return;

  link.href = target.href;
  const label = link.querySelector('span');
  if (label && page === 'project') label.textContent = isProjectsPath(target.pathname) ? 'All projects' : 'Back to home';

  // Navigate to the remembered page (with the reverse "back" animation) and restore its scroll
  // position on arrival. A normal navigation animates more reliably than history.back().
  link.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    store('pf:back', 1);
    store('pf:restore', origin);
  });
}

export function initChrome() {
  scrollChrome();
  fallbackTransitions();
  rememberOrigin();
  backLinks();
}
