/** Tiny shared helpers. */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
const mqFine = matchMedia('(hover: hover) and (pointer: fine)');

export const reducedMotion = () => mqReduce.matches;
export const finePointer = () => mqFine.matches;
/** Pointer-driven effects (tilt, magnetic, spotlight, glow) only on mouse devices with motion allowed. */
export const pointerFx = () => mqFine.matches && !mqReduce.matches;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
export const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/** Run fn at most once per animation frame with the latest arguments. */
export function rafThrottle(fn) {
  let frame = 0;
  let args;
  return (...a) => {
    args = a;
    if (!frame)
      frame = requestAnimationFrame(() => {
        frame = 0;
        fn(...args);
      });
  };
}

export function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

/** Number from a CSS custom property on an element (e.g. --i). */
export const cssNum = (el, prop, fallback = 0) => {
  const v = parseFloat(getComputedStyle(el).getPropertyValue(prop));
  return Number.isFinite(v) ? v : fallback;
};
