/**
 * One / two projects per row (phones only — the button is hidden on larger screens).
 *
 * The choice lives on <html> as the `cols-2` class (set before first paint by the inline
 * head script from localStorage), so it applies to the home page's featured grid and the
 * projects page alike, and survives in-site navigation.
 *
 * Switching animates every card from its old spot to its new one with a same-document
 * View Transition; browsers without it get a quick fade instead.
 */
import { $$, reducedMotion, EASE_OUT } from './utils.js';

const KEY = 'pf:cols';
const root = document.documentElement;

const isTwo = () => root.classList.contains('cols-2');
const visibleCards = () => $$('.featured__grid .pcard, .projects-grid .pcard:not(.is-hidden)');

function syncButtons() {
  const two = isTwo();
  $$('[data-view-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(two));
    b.setAttribute('aria-label', two ? 'Show one project per row' : 'Show two projects per row');
  });
}

/** Flip the layout while keeping the pressed button where it was on screen. */
function applyLayout(two, anchor) {
  const before = anchor.getBoundingClientRect().top;
  root.classList.toggle('cols-2', two);
  syncButtons();
  const drift = anchor.getBoundingClientRect().top - before;
  if (Math.abs(drift) > 1) scrollBy({ top: drift, behavior: 'instant' });
}

async function morph(two, anchor) {
  const cards = visibleCards();
  const pill = anchor.querySelector('.view-toggle__pill');
  cards.forEach((c, i) => (c.style.viewTransitionName = `pcard-${i}`));
  if (pill) pill.style.viewTransitionName = 'view-toggle-pill';
  root.classList.add('vt-cols');
  try {
    await document.startViewTransition(() => applyLayout(two, anchor)).finished;
  } catch {
    /* a transition that is skipped still applies the change */
  } finally {
    cards.forEach((c) => (c.style.viewTransitionName = ''));
    if (pill) pill.style.viewTransitionName = '';
    root.classList.remove('vt-cols');
  }
}

function fade(two, anchor) {
  const grid = anchor.closest('section, .container')?.querySelector('.featured__grid, .projects-grid');
  applyLayout(two, anchor);
  visibleCards().forEach((c, i) =>
    c.animate(
      { opacity: [0, 1], translate: ['0 14px', '0 0'] },
      { duration: 420, delay: Math.min(i, 8) * 35, easing: EASE_OUT, fill: 'backwards' },
    ),
  );
  grid?.animate({ opacity: [0.6, 1] }, { duration: 300 });
}

let busy = false;

export function initViewToggle() {
  const buttons = $$('[data-view-toggle]');
  if (!buttons.length) return;
  syncButtons();
  buttons.forEach((btn) =>
    btn.addEventListener('click', async () => {
      if (busy) return;
      busy = true;
      const two = !isTwo();
      try {
        localStorage.setItem(KEY, two ? '2' : '1');
      } catch {
        /* private mode: the choice just isn't remembered */
      }
      if (reducedMotion()) applyLayout(two, btn);
      else if (document.startViewTransition) await morph(two, btn);
      else fade(two, btn);
      busy = false;
    }),
  );
}
