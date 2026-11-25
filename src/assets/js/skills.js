/**
 * Skills explorer: accessible tabs (click, arrow keys, Home/End) with a sliding pill,
 * a smooth height change between categories and staggered tile entrances.
 */
import { $, $$, reducedMotion, rafThrottle, EASE_SPRING, EASE_OUT } from './utils.js';

export function animateTiles(panel, delay = 0) {
  if (reducedMotion()) return;
  $('.skillset__head', panel)?.animate(
    { opacity: [0, 1], translate: ['0 10px', '0 0'] },
    { duration: 500, delay, easing: EASE_OUT, fill: 'backwards' },
  );
  $$('.tile', panel).forEach((tile, j) =>
    tile.animate(
      { opacity: [0, 1], scale: ['0.9', '1'], translate: ['0 14px', '0 0'] },
      { duration: 520, delay: delay + 60 + j * 40, easing: EASE_SPRING, fill: 'backwards' },
    ),
  );
}

export function initSkills() {
  const root = $('[data-skillset]');
  if (!root) return;
  const nav = $('.skillset__nav', root);
  const stage = $('.skillset__stage', root);
  const tabs = $$('.skillset__tab', root);
  const panels = $$('.skillset__panel', root);
  const indicator = $('.skillset__indicator', root);
  let active = Math.max(0, tabs.findIndex((t) => t.classList.contains('is-active')));

  function moveIndicator(instant = false) {
    const tab = tabs[active];
    if (instant) indicator.classList.add('no-anim');
    indicator.style.setProperty('--ix', `${tab.offsetLeft}px`);
    indicator.style.setProperty('--iw', `${tab.offsetWidth}px`);
    indicator.style.setProperty('--io', '1');
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.remove('no-anim')));
  }

  /** Keep the active tab in view inside the scrollable bar, without scrolling the page. */
  function revealTab(tab) {
    if (nav.scrollWidth <= nav.clientWidth) return;
    const left = tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2;
    nav.scrollTo({ left, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }

  function select(i, { focus = false } = {}) {
    if (i === active) return;
    const from = stage.offsetHeight;
    active = i;

    tabs.forEach((t, k) => {
      const on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p, k) => {
      const on = k === i;
      p.classList.toggle('is-active', on);
      if (on) p.removeAttribute('aria-hidden');
      else p.setAttribute('aria-hidden', 'true');
    });

    if (focus) tabs[i].focus({ preventScroll: true });
    moveIndicator();
    revealTab(tabs[i]);

    if (reducedMotion()) return;
    // Smoothly grow/shrink the card to the new category's height.
    const to = stage.offsetHeight;
    if (from !== to) {
      stage.animate({ height: [`${from}px`, `${to}px`] }, { duration: 450, easing: EASE_OUT });
    }
    animateTiles(panels[i], 40);
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));

  nav.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = null;
    if (e.key in keys) next = (active + keys[e.key] + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next == null) return;
    e.preventDefault();
    select(next, { focus: true });
  });

  moveIndicator(true);
  document.fonts?.ready.then(() => moveIndicator(true));
  addEventListener('resize', rafThrottle(() => moveIndicator(true)));
}
