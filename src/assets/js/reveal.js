/**
 * Scroll-triggered reveals, count-up numbers and the achievements timeline progress.
 * Reveals use the Web Animations API on `translate` / `scale` / `clip-path`, so they
 * never override an element's own CSS transitions or hover transforms.
 */
import { $, $$, reducedMotion, rafThrottle, clamp, cssNum, EASE_OUT } from './utils.js';
import { animateTiles } from './skills.js';

const VARIANTS = {
  up: { translate: ['0 34px', '0 0'] },
  left: { translate: ['-48px 0', '0 0'] },
  right: { translate: ['48px 0', '0 0'] },
  scale: { scale: ['0.94', '1'], translate: ['0 24px', '0 0'] },
  clip: { clipPath: ['inset(100% 0 0 0 round 16px)', 'inset(0 0 0 0 round 16px)'] },
};

let observer = null;

function reveal(el) {
  el.classList.add('is-revealed');
  if (reducedMotion()) return;
  const variant = VARIANTS[el.dataset.reveal] || VARIANTS.up;
  const delay = cssNum(el, '--i') * 90;
  el.animate({ opacity: [0, 1], ...variant }, { duration: 950, delay, easing: EASE_OUT, fill: 'backwards' });

  // Skills explorer: tabs slide in, then the active panel's tiles pop in one by one.
  if (el.matches('[data-skillset]')) {
    $$('.skillset__tab', el).forEach((tab, j) =>
      tab.animate(
        { opacity: [0, 1], translate: ['0 12px', '0 0'] },
        { duration: 600, delay: delay + 150 + j * 45, easing: EASE_OUT, fill: 'backwards' },
      ),
    );
    const panel = $('.skillset__panel.is-active', el);
    if (panel) animateTiles(panel, delay + 250);
  }
}

/** Mark an element as revealed without animating (used when filtering shows a card). */
export function markRevealed(el) {
  observer?.unobserve(el);
  el.classList.add('is-revealed');
}

function countUp(el) {
  const target = parseFloat(el.dataset.count);
  if (!Number.isFinite(target)) return;
  const decimals = Number(el.dataset.decimals || 0);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const format = (v) => `${prefix}${v.toFixed(decimals)}${suffix}`;
  if (reducedMotion()) {
    el.textContent = format(target);
    return;
  }
  const duration = 1800;
  const start = performance.now();
  const tick = (now) => {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t); // easeOutExpo
    el.textContent = format(target * eased);
    if (t < 1) requestAnimationFrame(tick);
  };
  el.textContent = format(0);
  requestAnimationFrame(tick);
}

function initTimeline() {
  const tl = $('[data-timeline]');
  if (!tl) return;
  const fill = $('[data-timeline-fill]', tl);
  const items = $$('.tl-item', tl);
  const update = rafThrottle(() => {
    const r = tl.getBoundingClientRect();
    const line = innerHeight * 0.62;
    fill.style.setProperty('--tp', clamp((line - r.top) / r.height, 0, 1).toFixed(4));
    for (const it of items) {
      const node = it.querySelector('.tl-item__node');
      it.classList.toggle('is-lit', node.getBoundingClientRect().top < line);
    }
  });
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}

export function initReveal() {
  const els = $$('[data-reveal]');
  const counters = $$('[data-count]');

  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('is-revealed'));
    counters.forEach(countUp);
  } else {
    observer = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          observer.unobserve(en.target);
          reveal(en.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    els.forEach((e) => observer.observe(e));

    const countIO = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          countIO.unobserve(en.target);
          countUp(en.target);
        }
      },
      { threshold: 0.6 },
    );
    counters.forEach((c) => countIO.observe(c));
  }

  initTimeline();
}
