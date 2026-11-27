/**
 * Pause decorative, never-ending animations while they are off screen.
 *
 * The photo ring, orbit rings, floating chips, code-window border, floating degree card,
 * logo marquee and contact glow kept animating even when you were reading another section,
 * which cost work on every frame and made scrolling (e.g. the achievements timeline) less
 * smooth. Each one gets data-offscreen while it's out of view; CSS pauses its animations.
 */
import { $$ } from './utils.js';

const DECOR = ['.hero__visual', '.status-pill', '.scroll-cue', '.code-window', '.edu-card', '.marquee', '.contact__glow'];

let io = null;

export function initOffscreenPause() {
  io?.disconnect(); // previous page's elements (in-site navigation swaps the page)
  io = null;
  if (!('IntersectionObserver' in window)) return;
  const els = $$(DECOR.join(','));
  if (!els.length) return;
  io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) en.target.toggleAttribute('data-offscreen', !en.isIntersecting);
    },
    { rootMargin: '120px 0px' },
  );
  els.forEach((el) => io.observe(el));
}
