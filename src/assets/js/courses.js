/**
 * Phones (one-column course list): the last course card is shown only partly, fading out
 * towards a "See more" button. Tapping it smoothly unfolds the card (and "See less" folds it
 * back). The collapsed look itself is pure CSS (html.js + no .is-open), so there is no flash;
 * this script only animates the height between the two states.
 */
import { $, reducedMotion } from './utils.js';

const mqStacked = matchMedia('(max-width: 700px)');
const DURATION = 700;

export function initCourses() {
  const list = $('.courses');
  const btn = $('[data-courses-more]');
  if (!list || !btn || list.children.length < 3) return;

  const card = list.lastElementChild;
  const label = $('[data-courses-more-label]', btn);
  card.id ||= 'course-more';
  btn.setAttribute('aria-controls', card.id);

  let busy = false;
  const done = (fn) => {
    let called = false;
    const finish = () => {
      if (called) return;
      called = true;
      card.removeEventListener('transitionend', onEnd);
      fn();
      busy = false;
    };
    const onEnd = (e) => e.target === card && e.propertyName === 'max-height' && finish();
    card.addEventListener('transitionend', onEnd);
    setTimeout(finish, DURATION + 150); // in case transitionend never fires
  };

  btn.addEventListener('click', () => {
    if (busy) return;
    const open = !list.classList.contains('is-open');
    btn.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'See less' : 'See more';

    if (reducedMotion() || !mqStacked.matches) {
      list.classList.toggle('is-open', open);
      card.style.maxHeight = '';
      return;
    }

    busy = true;
    if (open) {
      // From the collapsed height up to the card's full height, then release the limit.
      card.style.maxHeight = `${card.offsetHeight}px`;
      list.classList.add('is-open');
      void card.offsetHeight;
      card.style.maxHeight = `${card.scrollHeight}px`;
      done(() => (card.style.maxHeight = ''));
    } else {
      // From the full height back down to the collapsed height set in CSS.
      card.style.maxHeight = `${card.offsetHeight}px`;
      void card.offsetHeight;
      list.classList.remove('is-open');
      card.style.maxHeight = '';
      // Keep the card in view if the reader had scrolled past its top.
      const top = card.getBoundingClientRect().top;
      if (top < 90) scrollBy({ top: top - 110, behavior: 'smooth' });
      done(() => {});
    }
  });
}
