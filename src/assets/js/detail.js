/**
 * Project detail page: gallery lightbox (keyboard + swipe) and "On this page" scroll-spy.
 */
import { $, $$ } from './utils.js';

const ICON = {
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
};
const svg = (p) =>
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

function lightbox() {
  const dataEl = $('[data-gallery-data]');
  if (!dataEl) return;
  let images;
  try {
    images = JSON.parse(dataEl.textContent);
  } catch {
    return;
  }
  if (!images.length) return;

  let index = 0;
  let box = null;
  let lastFocus = null;

  function render() {
    const img = images[index];
    const imgEl = $('.lightbox__img', box);
    imgEl.replaceWith(Object.assign(document.createElement('img'), { className: 'lightbox__img', src: img.src, alt: img.alt || '' }));
    $('.lightbox__caption', box).textContent = img.caption || '';
    $('.lightbox__count', box).textContent = `${index + 1} / ${images.length}`;
  }

  const go = (d) => {
    index = (index + d + images.length) % images.length;
    render();
  };

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Tab') {
      const f = $$('button', box);
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }

  function open(i) {
    index = i;
    lastFocus = document.activeElement;
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Image viewer');
    const multi = images.length > 1;
    box.innerHTML = `
      <p class="lightbox__count"></p>
      <figure class="lightbox__figure"><img class="lightbox__img" alt=""><figcaption class="lightbox__caption"></figcaption></figure>
      <button type="button" class="lightbox__btn lightbox__close" aria-label="Close">${svg(ICON.x)}</button>
      ${multi ? `<button type="button" class="lightbox__btn lightbox__prev" aria-label="Previous image">${svg(ICON.left)}</button>
      <button type="button" class="lightbox__btn lightbox__next" aria-label="Next image">${svg(ICON.right)}</button>` : ''}`;
    document.body.appendChild(box);
    render();
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => box.classList.add('is-open'));

    $('.lightbox__close', box).addEventListener('click', close);
    $('.lightbox__prev', box)?.addEventListener('click', () => go(-1));
    $('.lightbox__next', box)?.addEventListener('click', () => go(1));
    box.addEventListener('click', (e) => {
      if (e.target === box) close();
    });

    let startX = null;
    box.addEventListener('pointerdown', (e) => (startX = e.clientX));
    box.addEventListener('pointerup', (e) => {
      if (startX == null || !multi) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      startX = null;
    });

    document.addEventListener('keydown', onKey);
    $('.lightbox__close', box).focus();
  }

  function close() {
    if (!box) return;
    const el = box;
    box = null;
    document.removeEventListener('keydown', onKey);
    el.classList.remove('is-open');
    document.documentElement.style.overflow = '';
    setTimeout(() => el.remove(), 400);
    lastFocus?.focus({ preventScroll: true });
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lightbox]');
    if (btn) open(Number(btn.dataset.lightbox));
  });
}

function tocSpy() {
  const links = $$('[data-toc-link]');
  if (!links.length) return;
  const sections = links.map((l) => document.getElementById(l.dataset.tocLink)).filter(Boolean);
  const visible = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) visible.set(en.target.id, en.isIntersecting);
      const current = sections.find((s) => visible.get(s.id));
      if (!current) return;
      for (const l of links) l.classList.toggle('is-active', l.dataset.tocLink === current.id);
    },
    { rootMargin: '-30% 0px -60% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}

export function initDetail() {
  lightbox();
  tocSpy();
}
