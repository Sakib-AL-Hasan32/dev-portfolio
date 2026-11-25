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
    // Came straight from that page: go back in history (router restores the scroll position).
    if (history.state?.from && cleanUrl(history.state.from) === cleanUrl(target.href)) {
      e.preventDefault();
      history.back();
      return;
    }
    // Otherwise (e.g. after Previous/Next) navigate there and restore its scroll position.
    store('pf:restore', origin);
  });
}

/** Once per visit: scroll progress bar and back-to-top (these elements never change). */
export function initChrome() {
  scrollChrome();
}

/** Per page (re-run after every in-site navigation). */
export function initPageLinks() {
  rememberOrigin();
  backLinks();
}
