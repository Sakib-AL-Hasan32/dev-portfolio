/**
 * Hero & headline effects: split-text entrance, continuous gradient across split chars,
 * the self-typing API request chip and the portrait parallax.
 */
import { $, $$, reducedMotion, pointerFx, rafThrottle } from './utils.js';

/* ---------- Split text ---------- */

function split(el) {
  const text = el.textContent.trim().replace(/\s+/g, ' ');
  const baseDelay = parseFloat(el.dataset.splitDelay || '0') + 0.15;
  el.setAttribute('aria-label', text);
  el.textContent = '';
  let ci = 0;
  text.split(' ').forEach((word, wi, words) => {
    const w = document.createElement('span');
    w.className = 'word';
    w.setAttribute('aria-hidden', 'true');
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'char';
      c.textContent = ch;
      c.style.setProperty('--ci', ci++);
      c.style.setProperty('--d', `${baseDelay}s`);
      w.appendChild(c);
    }
    el.appendChild(w);
    if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el.classList.add('is-split');
}

/** Give every char of a gradient line its slice of one continuous gradient. */
function alignGradient(line) {
  const chars = $$('.char', line);
  if (!chars.length) return;
  // offsetLeft ignores the entrance transforms, so this is safe mid-animation.
  const first = chars[0].offsetLeft;
  const last = chars[chars.length - 1];
  line.style.setProperty('--lw', `${last.offsetLeft + last.offsetWidth - first}px`);
  for (const c of chars) c.style.setProperty('--cx', `${c.offsetLeft - first}px`);
}

/* ---------- Typing chip ---------- */

function typeLoop(el) {
  const full = el.dataset.type;
  if (reducedMotion()) return;
  let i = 0;
  let deleting = false;
  el.textContent = '';
  el.classList.add('is-typing');
  const step = () => {
    if (!el.isConnected) return; // page was swapped away: stop typing
    if (!deleting) {
      el.textContent = full.slice(0, ++i);
      if (i === full.length) {
        deleting = true;
        return setTimeout(step, 4200);
      }
      return setTimeout(step, 55 + Math.random() * 60);
    }
    el.textContent = full.slice(0, --i);
    if (i === 0) {
      deleting = false;
      return setTimeout(step, 500);
    }
    return setTimeout(step, 22);
  };
  setTimeout(step, 1400);
}

/* ---------- Portrait parallax ---------- */

function parallax() {
  const hero = $('.hero');
  const target = $('[data-parallax]');
  if (!hero || !target || !pointerFx()) return;
  const move = rafThrottle((e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    target.style.setProperty('--ry', `${x * 10}deg`);
    target.style.setProperty('--rx', `${-y * 8}deg`);
  });
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', () => {
    target.style.setProperty('--ry', '0deg');
    target.style.setProperty('--rx', '0deg');
  });
}

export function initHero() {
  $$('[data-split]').forEach(split);

  const gradLines = $$('.hero__line--grad.is-split');
  if (gradLines.length) {
    const align = () => gradLines.forEach(alignGradient);
    align();
    document.fonts?.ready.then(align);
    addEventListener('resize', rafThrottle(align));
  }

  $$('[data-type]').forEach(typeLoop);
  parallax();
}
