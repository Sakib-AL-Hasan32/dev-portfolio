/**
 * Pointer effects (mouse devices only, disabled with reduced motion):
 *  - spotlight: cursor-following border/glow on [data-spotlight]
 *  - tilt: subtle 3D tilt on [data-tilt]
 *  - magnetic: buttons drift toward the cursor on [data-magnetic]
 *  - cursor glow in the page background
 */
import { $, $$, pointerFx, rafThrottle } from './utils.js';

function spotlight() {
  let current = null;
  const update = rafThrottle((e) => {
    const el = e.target.closest?.('[data-spotlight]');
    if (!el) return;
    current = el;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
  document.addEventListener('pointermove', update, { passive: true });
  document.addEventListener('pointerleave', () => (current = null));
}

function tilt() {
  for (const card of $$('[data-tilt]')) {
    const move = rafThrottle((e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${x * 7}deg`);
      card.style.setProperty('--rx', `${-y * 6}deg`);
    });
    card.addEventListener('pointerenter', () => card.classList.add('is-tilting'));
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-tilting');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  }
}

function magnetic() {
  for (const el of $$('[data-magnetic]')) {
    const strength = 0.28;
    const move = rafThrottle((e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', `${(e.clientX - (r.left + r.width / 2)) * strength}px`);
      el.style.setProperty('--ty', `${(e.clientY - (r.top + r.height / 2)) * strength}px`);
    });
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    });
  }
}

function cursorGlow() {
  const glow = $('[data-cursor-glow]');
  if (!glow) return;
  const move = rafThrottle((e) => {
    glow.style.setProperty('--gx', `${e.clientX}px`);
    glow.style.setProperty('--gy', `${e.clientY}px`);
    glow.classList.add('is-on');
  });
  addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('is-on'));
}

export function initEffects() {
  if (!pointerFx()) return;
  spotlight();
  tilt();
  magnetic();
  cursorGlow();
}
