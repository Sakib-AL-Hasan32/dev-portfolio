/**
 * Skills explorer: accessible tabs (click, arrow keys, Home/End) with a sliding
 * indicator, a cross-fade between panels and staggered tile entrances.
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
      { opacity: [0, 1], scale: ['0.86', '1'], translate: ['0 16px', '0 0'] },
      { duration: 560, delay: delay + 80 + j * 45, easing: EASE_SPRING, fill: 'backwards' },
    ),
  );
}

export function initSkills() {
  const root = $('[data-skillset]');
  if (!root) return;
  const nav = $('.skillset__nav', root);
  const tabs = $$('.skillset__tab', root);
  const panels = $$('.skillset__panel', root);
  const indicator = $('.skillset__indicator', root);
  let active = Math.max(0, tabs.findIndex((t) => t.classList.contains('is-active')));

  function moveIndicator(instant = false) {
    if (!indicator || getComputedStyle(indicator).display === 'none') return;
    const tab = tabs[active];
    if (instant) indicator.classList.add('no-anim');
    indicator.style.setProperty('--iy', `${tab.offsetTop}px`);
    indicator.style.setProperty('--ih', `${tab.offsetHeight}px`);
    indicator.style.setProperty('--io', '1');
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.remove('no-anim')));
  }

  function select(i, { focus = false } = {}) {
    if (i === active) return;
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
    animateTiles(panels[i], 60);

    // Mobile: keep the chosen tab visible in the horizontal row (without scrolling the page).
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: tabs[i].offsetLeft - 8, behavior: reducedMotion() ? 'auto' : 'smooth' });
    }
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => select(i)));

  nav.addEventListener('keydown', (e) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
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
