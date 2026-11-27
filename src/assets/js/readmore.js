/**
 * Phones: the About text is shown only partly, fading out towards a "Read more" button —
 * the same look and motion as the "See more" in Experience & Learning (courses.js).
 * The collapsed look is pure CSS (html.js + no .is-open), so there is no flash; this script
 * only animates the height between the two states.
 */
import { $, reducedMotion } from './utils.js';

const mqPhone = matchMedia('(max-width: 640px)');
const DURATION = 700;

export function initReadMore() {
  const box = $('.about__text');
  const btn = $('[data-readmore]');
  const prose = box && $('.prose', box);
  if (!box || !btn || !prose) return;

  const label = $('[data-readmore-label]', btn);
  prose.id ||= 'about-prose';
  btn.setAttribute('aria-controls', prose.id);

  let busy = false;
  const done = (fn) => {
    let called = false;
    const finish = () => {
      if (called) return;
      called = true;
      prose.removeEventListener('transitionend', onEnd);
      fn();
      busy = false;
    };
    const onEnd = (e) => e.target === prose && e.propertyName === 'max-height' && finish();
    prose.addEventListener('transitionend', onEnd);
    setTimeout(finish, DURATION + 150); // in case transitionend never fires
  };

  btn.addEventListener('click', () => {
    if (busy) return;
    const open = !box.classList.contains('is-open');
    btn.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Read less' : 'Read more';

    if (reducedMotion() || !mqPhone.matches) {
      box.classList.toggle('is-open', open);
      prose.style.maxHeight = '';
      return;
    }

    busy = true;
    if (open) {
      // From the collapsed height up to the full text height, then release the limit.
      prose.style.maxHeight = `${prose.offsetHeight}px`;
      box.classList.add('is-open');
      void prose.offsetHeight;
      prose.style.maxHeight = `${prose.scrollHeight}px`;
      done(() => (prose.style.maxHeight = ''));
    } else {
      // From the full height back down to the collapsed height set in CSS.
      prose.style.maxHeight = `${prose.offsetHeight}px`;
      void prose.offsetHeight;
      box.classList.remove('is-open');
      prose.style.maxHeight = '';
      // Keep the text in view if the reader had scrolled past its top.
      const top = prose.getBoundingClientRect().top;
      if (top < 90) scrollBy({ top: top - 110, behavior: 'smooth' });
      done(() => {});
    }
  });
}
