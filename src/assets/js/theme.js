/**
 * Light / dark theme.
 * Initial theme is set before paint by the inline script in <head> (stored choice → system).
 * Switching uses a circular reveal from the toggle via the View Transitions API.
 */
import { $$, reducedMotion } from './utils.js';

const root = document.documentElement;

function stored() {
  try {
    return localStorage.getItem('theme');
  } catch {
    return null;
  }
}

function setTheme(theme, origin) {
  if (root.dataset.theme === theme) return;
  const apply = () => root.setAttribute('data-theme', theme);

  if (!document.startViewTransition || reducedMotion() || !origin) {
    apply();
    return;
  }

  const r = origin.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  root.classList.add('theme-vt');
  const vt = document.startViewTransition(apply);
  vt.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {});
  const cleanup = () => root.classList.remove('theme-vt');
  vt.finished.then(cleanup, cleanup);
}

export function initTheme() {
  for (const btn of $$('[data-theme-toggle]')) {
    btn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage unavailable — theme still switches for this page */
      }
      setTheme(next, btn);
    });
  }

  // Follow the OS setting until the visitor makes an explicit choice.
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!stored()) setTheme(e.matches ? 'dark' : 'light');
  });

  // Keep tabs in sync.
  addEventListener('storage', (e) => {
    if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) setTheme(e.newValue);
  });
}
