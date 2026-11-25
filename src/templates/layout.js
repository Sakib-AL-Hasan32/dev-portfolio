/** Page chrome shared by every page: <head>, navigation, background, footer. */
import { site } from '../data/site.js';
import { esc } from './util.js';
import { icon } from './icons.js';

/*
 * Runs before first paint: theme (stored → system), feature flags, and page-transition setup.
 *
 * Page transitions (cross-document View Transitions):
 *  - Only the project card that was clicked gets view-transition-name "project-cover", so that one
 *    cover morphs into the detail page's cover (and back again) while the rest of the page fades.
 *  - Back/forward history navigations get the "back" type, which plays the animation in reverse.
 */
const preloadSrc = function () {
  var d = document.documentElement, t;
  d.classList.add('js');
  try { t = localStorage.getItem('theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  d.setAttribute('data-theme', t);

  // Returning from a project via its Back link: restore the scroll position we left from.
  var restore = function () {
    var r;
    try { r = JSON.parse(sessionStorage.getItem('pf:restore')); sessionStorage.removeItem('pf:restore'); } catch (e) {}
    if (r && r.url === location.href.split('#')[0]) scrollTo({ top: r.y, left: 0, behavior: 'instant' });
  };
  var goingBack = function () {
    try { var b = sessionStorage.getItem('pf:back'); return !!b; } catch (e) { return false; }
  };
  if (!('onpagereveal' in window)) {
    d.classList.add('no-vt');
    addEventListener('DOMContentLoaded', restore);
    return;
  }

  var noop = function () {};
  var slugOf = function (url) { var m = /\/projects\/([^\/?#]+)\/?(?:[?#].*)?$/.exec(url || ''); return m && m[1]; };
  // The named card is marked revealed so it is visible in the transition snapshot.
  var nameCard = function (slug) {
    if (!slug) return null;
    var card = document.querySelector('.pcard[data-slug="' + slug + '"]');
    if (!card || card.classList.contains('is-hidden')) return null;
    card.classList.add('is-revealed');
    var media = card.querySelector('.pcard__media');
    media.style.viewTransitionName = 'project-cover';
    return media;
  };
  var setup = function (v, activation, slug) {
    v.ready.catch(noop);
    v.updateCallbackDone.catch(noop);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { v.skipTransition(); return; }
    if ((activation && activation.navigationType === 'traverse') || goingBack()) d.classList.add('vt-back');
    var media = nameCard(slug);
    var done = function () { d.classList.remove('vt-back'); if (media) media.style.viewTransitionName = ''; };
    v.finished.then(done, done);
  };
  // Leaving this page: name the card whose project we are opening.
  addEventListener('pageswap', function (e) {
    if (!e.viewTransition) return;
    var a = e.activation;
    setup(e.viewTransition, a, a && a.entry && slugOf(a.entry.url));
  });
  // Arriving on this page: when coming back from a project, name its card so the cover flies home.
  addEventListener('pagereveal', function (e) {
    restore();
    if (e.viewTransition) {
      var a = window.navigation && navigation.activation;
      setup(e.viewTransition, a, a && a.from && slugOf(a.from.url));
    }
    try { sessionStorage.removeItem('pf:back'); } catch (err) {}
  });
};
const preload = `(${preloadSrc.toString().replace(/\n\s*\/\/.*$/gm, '').replace(/\s*\n\s*/g, ' ')})();`;

/**
 * @param {{title:string, description?:string, root:string, path?:string, version:string,
 *          type?:string, jsonLd?:object, preconnectCdn?:boolean}} o
 */
export function head(o) {
  const description = o.description || site.description;
  const canonical = site.url ? site.url.replace(/\/$/, '') + '/' + (o.path || '') : '';
  const ld = o.jsonLd ? `<script type="application/ld+json">${JSON.stringify(o.jsonLd)}</script>` : '';
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(o.title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(site.name)}">
<meta name="color-scheme" content="dark light">
<meta name="theme-color" content="#0a0b10" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f6f7fb" media="(prefers-color-scheme: light)">
${canonical ? `<link rel="canonical" href="${esc(canonical)}">\n<meta property="og:url" content="${esc(canonical)}">` : ''}
<meta property="og:type" content="${o.type || 'website'}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(description)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${o.root}assets/images/favicon.svg" type="image/svg+xml">
<script>${preload}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${o.preconnectCdn ? '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>' : ''}
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">
<link rel="stylesheet" href="${o.root}assets/css/styles.css?v=${o.version}">
<script type="module" src="${o.root}assets/js/main.js?v=${o.version}"></script>
${ld}`;
}

/**
 * @param {{root:string, page:'home'|'projects'|'project'|'404'}} o
 */
export function nav({ root, page }) {
  const onHome = page === 'home';
  const href = (id) => {
    if (id === 'projects' && !onHome) return `${root}projects/`;
    if (onHome) return `#${id}`;
    return id === 'home' ? root : `${root}#${id}`;
  };
  const isActive = (id) => (!onHome && id === 'projects' && (page === 'projects' || page === 'project'));
  const links = site.nav
    .map(
      (l) =>
        `<a class="nav__link${isActive(l.id) ? ' is-active' : ''}" href="${href(l.id)}" data-spy="${l.id}"${isActive(l.id) ? ' aria-current="page"' : ''}>${esc(l.label)}</a>`,
    )
    .join('');
  const mobileLinks = site.nav
    .map(
      (l, i) =>
        `<li style="--i:${i}"><a class="mmenu__link${isActive(l.id) ? ' is-active' : ''}" href="${href(l.id)}" data-spy="${l.id}"><span class="mmenu__num">0${i + 1}</span>${esc(l.label)}${icon('arrow-up-right', { size: 22, cls: 'mmenu__arrow' })}</a></li>`,
    )
    .join('');

  return `<header class="nav" data-nav>
  <div class="nav__inner">
    <a class="nav__logo" href="${onHome ? '#home' : root}" aria-label="${esc(site.shortName)} — home">${esc(site.shortName)}<span class="nav__dot">.</span></a>
    <nav class="nav__links" aria-label="Primary" data-nav-links>
      <span class="nav__indicator" aria-hidden="true"></span>
      ${links}
    </nav>
    <div class="nav__actions">
      <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch colour theme">
        <span class="theme-toggle__icon theme-toggle__sun">${icon('sun', { size: 18 })}</span>
        <span class="theme-toggle__icon theme-toggle__moon">${icon('moon', { size: 18 })}</span>
      </button>
      <button class="nav__burger" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
        <span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="mmenu" id="mobile-menu" data-mobile-menu role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="mmenu__panel">
    <ul class="mmenu__list">${mobileLinks}</ul>
    <div class="mmenu__foot">
      <a href="mailto:${esc(site.email)}">${icon('mail', { size: 18 })}${esc(site.email)}</a>
      <div class="mmenu__socials">${socialLinks()}</div>
    </div>
  </div>
</div>`;
}

export function socialLinks(cls = 'icon-btn') {
  const s = site.socials;
  return [
    s.github && `<a class="${cls}" href="${esc(s.github.url)}" target="_blank" rel="noopener" aria-label="GitHub">${icon('github', { size: 18 })}</a>`,
    s.linkedin && `<a class="${cls}" href="${esc(s.linkedin.url)}" target="_blank" rel="noopener" aria-label="LinkedIn">${icon('linkedin', { size: 18 })}</a>`,
    site.email && `<a class="${cls}" href="mailto:${esc(site.email)}" aria-label="Email">${icon('mail', { size: 18 })}</a>`,
  ]
    .filter(Boolean)
    .join('');
}

/** Fixed decorative background + scroll progress + back-to-top. */
export function chrome() {
  return `<div class="bg" aria-hidden="true">
  <div class="bg__grid"></div>
  <div class="bg__blob bg__blob--a"></div>
  <div class="bg__blob bg__blob--b"></div>
  <div class="bg__blob bg__blob--c"></div>
  <div class="bg__glow" data-cursor-glow></div>
  <div class="bg__noise"></div>
</div>
<div class="scroll-progress" aria-hidden="true"><span data-scroll-progress></span></div>
<button class="to-top" type="button" data-to-top aria-label="Back to top">
  <svg class="to-top__ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22" pathLength="100"/></svg>
  ${icon('arrow-up', { size: 18 })}
</button>`;
}

export function footer({ root, page }) {
  const onHome = page === 'home';
  const href = (id) => (id === 'projects' ? `${root}projects/` : onHome ? `#${id}` : id === 'home' ? root : `${root}#${id}`);
  const year = new Date().getFullYear();
  return `<footer class="footer">
  <div class="container footer__inner">
    <div class="footer__brand">
      <a class="nav__logo footer__logo" href="${onHome ? '#home' : root}">${esc(site.shortName)}<span class="nav__dot">.</span></a>
      <p class="footer__name">${esc(site.name)}</p>
      <p class="footer__title">Software Engineer</p>
      <div class="footer__socials">${socialLinks()}</div>
    </div>
    <nav class="footer__nav" aria-label="Footer">
      <p class="footer__heading">Navigate</p>
      <ul>${site.nav.map((l) => `<li><a class="link-u" href="${href(l.id)}">${esc(l.label)}</a></li>`).join('')}</ul>
    </nav>
    <div class="footer__cta">
      <p class="footer__heading">Say hello</p>
      <a class="footer__mail link-u" href="mailto:${esc(site.email)}">${esc(site.email)}</a>
      <p class="footer__loc">${icon('map-pin', { size: 16 })} ${esc(site.location)}</p>
    </div>
  </div>
  <div class="container footer__bottom">
    <p>© ${year} ${esc(site.name)}. All rights reserved.</p>
    <p class="footer__love">Designed and built with care in Bangladesh.</p>
  </div>
</footer>
<div id="page-end" hidden></div>`;
}
