/**
 * Navigation: scrolled state, sliding active indicator, scroll-spy, mobile menu.
 */
import { $, $$, rafThrottle } from './utils.js';

export function initNav() {
  const nav = $('[data-nav]');
  if (!nav) return;

  /* ---------- Scrolled state ---------- */
  const onScroll = rafThrottle(() => nav.classList.toggle('is-scrolled', scrollY > 24));
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Sliding indicator ---------- */
  const linksWrap = $('[data-nav-links]', nav);
  const indicator = $('.nav__indicator', nav);
  const links = $$('.nav__link', nav);
  let active = links.find((l) => l.classList.contains('is-active')) || null;

  function moveTo(link, instant = false) {
    if (!indicator) return;
    if (!link || !linksWrap.offsetParent) {
      indicator.style.setProperty('--io', '0');
      return;
    }
    if (instant) indicator.classList.add('no-anim');
    indicator.style.setProperty('--ix', `${link.offsetLeft}px`);
    indicator.style.setProperty('--iw', `${link.offsetWidth}px`);
    indicator.style.setProperty('--io', '1');
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => indicator.classList.remove('no-anim')));
  }

  function setActive(id) {
    const next = links.find((l) => l.dataset.spy === id) || null;
    if (next === active) return;
    active = next;
    for (const l of links) {
      const on = l === active;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    }
    for (const l of $$('.mmenu__link')) l.classList.toggle('is-active', l.dataset.spy === id);
    moveTo(active);
  }

  linksWrap?.addEventListener('pointerover', (e) => {
    const link = e.target.closest('.nav__link');
    if (link) moveTo(link);
  });
  linksWrap?.addEventListener('pointerleave', () => moveTo(active));
  linksWrap?.addEventListener('focusin', (e) => {
    const link = e.target.closest('.nav__link');
    if (link) moveTo(link);
  });
  linksWrap?.addEventListener('focusout', () => moveTo(active));

  moveTo(active, true);
  addEventListener('resize', rafThrottle(() => moveTo(active, true)));
  document.fonts?.ready.then(() => moveTo(active, true));

  /* ---------- Scroll-spy (home page sections) ---------- */
  const sections = $$('[data-section]');
  if (sections.length && document.body.dataset.page === 'home') {
    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) visible.set(en.target.id, en.isIntersecting);
        // The last section in document order that crosses the middle band wins.
        const current = sections.filter((s) => visible.get(s.id)).pop();
        if (current) setActive(current.id);
      },
      { rootMargin: '-42% 0px -52% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    // Bottom of page → last section (contact can be shorter than the band).
    addEventListener(
      'scroll',
      rafThrottle(() => {
        if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) setActive(sections[sections.length - 1].id);
      }),
      { passive: true },
    );
  }

  /* ---------- Mobile menu ---------- */
  const burger = $('[data-menu-toggle]', nav);
  const menu = $('[data-mobile-menu]');
  if (!burger || !menu) return;
  let open = false;
  let closeTimer;

  const focusables = () => [burger, ...$$('a, button', menu)];

  function openMenu() {
    clearTimeout(closeTimer);
    open = true;
    menu.hidden = false;
    menu.getBoundingClientRect(); // commit initial clip-path before transitioning
    menu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.documentElement.style.overflow = 'hidden';
    setTimeout(() => $('a', menu)?.focus({ preventScroll: true }), 250);
  }

  function closeMenu(returnFocus = true) {
    if (!open) return;
    open = false;
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.documentElement.style.overflow = '';
    closeTimer = setTimeout(() => (menu.hidden = true), 700);
    if (returnFocus) burger.focus({ preventScroll: true });
  }

  burger.addEventListener('click', () => (open ? closeMenu() : openMenu()));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') closeMenu();
    if (e.key === 'Tab') {
      const f = focusables();
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  matchMedia('(min-width: 921px)').addEventListener('change', (e) => e.matches && closeMenu(false));
}
