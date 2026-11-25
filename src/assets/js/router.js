/**
 * Seamless in-site navigation (no full page reload).
 *
 * Internal links are fetched in the background and only the page content is swapped
 * (header, menu, main, footer), so the background, theme and scripts stay alive.
 * - Opening a project from a card: the card's cover glides into the project page's cover.
 * - Going back from a project: the project cover glides back into its card.
 * - Other pages: the old content fades out, the new content eases in.
 * - Browser Back/Forward work the same way and restore the exact scroll position.
 * If anything goes wrong, it falls back to a normal page load.
 */
import { reducedMotion, EASE_OUT } from './utils.js';

const SWAP = ['header.nav', '#mobile-menu', 'main', 'footer.footer', '#page-end'];
const LEAVE_MS = 320;

const isDetail = (p) => /\/projects\/[^/]+\/?$/.test(p);
const slugOf = (p) => (p.match(/\/projects\/([^/]+)\/?$/) || [])[1];
const clean = (u) => u.split('#')[0];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

let initPage = () => {};
let pageCtrl = null;
let busy = false;
let curPath = location.pathname;
let curPage = clean(location.href); // current page URL without #hash
let curIdx = history.state?.idx ?? 0;
// Scroll position of each history entry, kept in memory: writing to history while scrolling
// (replaceState) cancels smooth scrolling in Chrome, so we never do that.
const scrollPos = {};

/**
 * Run the page initialisers so that every listener they add to window/document is tied to
 * this page; the next swap aborts them all (no duplicated scroll/click handlers).
 */
function runInit() {
  pageCtrl?.abort();
  pageCtrl = new AbortController();
  const signal = pageCtrl.signal;
  const orig = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (this === window || this === document) {
      options = typeof options === 'object' && options ? { ...options, signal: options.signal || signal } : { capture: !!options, signal };
    }
    return orig.call(this, type, listener, options);
  };
  try {
    initPage();
  } finally {
    EventTarget.prototype.addEventListener = orig;
  }
}

/* ---------- Flying cover ---------- */

function makeFly(el) {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (!r.width || r.bottom < 0 || r.top > innerHeight) return null;
  const fly = el.cloneNode(true);
  fly.removeAttribute('style');
  fly.className = 'cover-fly';
  fly.setAttribute('aria-hidden', 'true');
  Object.assign(fly.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  document.body.appendChild(fly);
  fly.animate([{ scale: '1' }, { scale: '1.03' }], { duration: LEAVE_MS, easing: EASE_OUT, fill: 'forwards' });
  return fly;
}

async function landFly(fly, target) {
  if (!fly) return;
  const fadeOut = () =>
    fly
      .animate({ opacity: [1, 0] }, { duration: 200, fill: 'forwards' })
      .finished.catch(() => {})
      .then(() => fly.remove());
  if (!target) return fadeOut();
  const from = fly.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  fly.getAnimations().forEach((a) => a.cancel());
  target.style.visibility = 'hidden';
  await fly
    .animate(
      [
        { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` },
        { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: getComputedStyle(target).borderRadius },
      ],
      { duration: 560, easing: EASE_OUT, fill: 'forwards' },
    )
    .finished.catch(() => {});
  target.style.visibility = '';
  await fadeOut();
}

/* ---------- Navigation ---------- */

async function go(href, { push = true, back = false, y = null } = {}) {
  if (busy) return;
  busy = true;
  const target = new URL(href, location.href);
  const fromPath = curPath;
  const motion = !reducedMotion();

  const request = fetch(target.href, { credentials: 'same-origin' }).then((r) => {
    if (!r.ok || !(r.headers.get('content-type') || '').includes('text/html')) throw new Error(`HTTP ${r.status}`);
    return r.text();
  });

  // Leaving: pick the cover that will fly, fade the current content.
  let fly = null;
  let landOn = null;
  if (motion) {
    if (isDetail(target.pathname) && !isDetail(fromPath)) {
      fly = makeFly(document.querySelector(`.pcard[data-slug="${slugOf(target.pathname)}"] .pcard__media`));
      landOn = 'detail';
    } else if (isDetail(fromPath) && !isDetail(target.pathname)) {
      fly = makeFly(document.querySelector('.detail-hero__cover'));
      landOn = slugOf(fromPath);
    }
    document.body.classList.add(back ? 'is-leaving-back' : 'is-leaving');
  }

  let html;
  try {
    [html] = await Promise.all([request, motion ? wait(LEAVE_MS) : null]);
  } catch {
    location.href = target.href; // fall back to a normal navigation
    return;
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if (!doc.querySelector('main')) {
    location.href = target.href;
    return;
  }

  if (push) {
    scrollPos[curIdx] = scrollY; // remember where we were on the page we are leaving
    curIdx += 1;
    history.pushState({ idx: curIdx, from: clean(location.href) }, '', target.href);
  }

  // Swap the page content.
  const root = document.documentElement;
  root.classList.remove('enter', 'enter-back', 'enter-cover');
  if (motion) root.classList.add(fly ? 'enter-cover' : back ? 'enter-back' : 'enter');
  for (const sel of SWAP) {
    const cur = document.querySelector(sel);
    const next = doc.querySelector(sel);
    if (cur && next) cur.replaceWith(document.importNode(next, true));
  }
  document.title = doc.title;
  document.body.dataset.page = doc.body.dataset.page || '';
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
  if (desc) document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  document.body.classList.remove('is-leaving', 'is-leaving-back');
  curPath = target.pathname;
  curPage = clean(target.href);

  // Scroll: remembered position (Back link / history), a #section, or the top.
  let top = y;
  if (push) {
    try {
      const r = JSON.parse(sessionStorage.getItem('pf:restore'));
      if (r && r.url === clean(target.href)) {
        top = r.y;
        sessionStorage.removeItem('pf:restore');
      }
    } catch {
      /* ignore */
    }
  }
  const anchor = target.hash && document.getElementById(decodeURIComponent(target.hash.slice(1)));
  if (anchor && top == null) anchor.scrollIntoView({ behavior: 'instant' });
  else scrollTo({ top: top ?? 0, left: 0, behavior: 'instant' });
  scrollPos[curIdx] = scrollY;

  runInit();

  // Landing: glide the cover into its place on the new page.
  if (fly) {
    let dest = null;
    if (landOn === 'detail') dest = document.querySelector('.detail-hero__cover');
    else {
      const card = document.querySelector(`.pcard[data-slug="${landOn}"]`);
      if (card) {
        card.classList.add('is-revealed');
        dest = card.querySelector('.pcard__media');
      }
    }
    landFly(fly, dest);
  }
  busy = false;
}

export function initRouter(init) {
  initPage = init;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  history.replaceState({ ...(history.state || {}), idx: curIdx }, '');

  // Track the scroll position of the current entry (memory only; see scrollPos).
  let t;
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(t);
      t = setTimeout(() => (scrollPos[curIdx] = scrollY), 120);
    },
    { passive: true },
  );

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (/\.[a-z0-9]+$/i.test(url.pathname) && !/\.html?$/i.test(url.pathname)) return; // files (pdf, images…)
    if (url.pathname === location.pathname && url.search === location.search) return; // same-page #anchor
    e.preventDefault();
    go(url.href, { back: a.hasAttribute('data-back') });
  });

  window.addEventListener('popstate', (e) => {
    // Same page, only the #hash changed (e.g. "View My Projects" -> #projects): let the browser scroll.
    if (clean(location.href) === curPage) return;
    const idx = e.state?.idx ?? 0;
    const back = idx < curIdx;
    scrollPos[curIdx] = scrollY;
    curIdx = idx;
    go(location.href, { push: false, back, y: scrollPos[idx] ?? 0 });
  });

  runInit();
}
