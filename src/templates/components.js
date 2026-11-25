/** Reusable UI pieces rendered at build time. */
import { esc, asArray, assetUrl, statusLabel, hueFor, slugify } from './util.js';
import { icon, categoryIcon } from './icons.js';

const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/';

/* ───────────────────────── Project cover ───────────────────────── */

/**
 * Real thumbnail when available, otherwise a generated "terminal window" cover.
 * @param {object} p project
 * @param {{root:string, eager?:boolean, large?:boolean}} o
 */
export function cover(p, { root, eager = false, large = false }) {
  const label = `~/projects/${esc(p.slug)}`;
  if (p.thumbnail) {
    return `<div class="cover cover--img${large ? ' cover--lg' : ''}">
      <img class="cover__img" src="${esc(assetUrl(root, p.thumbnail))}" alt="${esc(p.title)} cover" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    </div>`;
  }
  const lines = [62, 38, 74, 46, 28];
  return `<div class="cover${large ? ' cover--lg' : ''}" style="--h:${hueFor(p.slug)}" role="img" aria-label="${esc(p.title)} — generated cover">
    <div class="cover__bar"><span class="cover__dots"><i></i><i></i><i></i></span><span class="cover__path">${label}</span></div>
    <div class="cover__lines" aria-hidden="true">${lines.map((w, i) => `<i style="--w:${w}%;--d:${i}"></i>`).join('')}</div>
    <div class="cover__glyph" aria-hidden="true">${icon(categoryIcon(p.category), { size: large ? 168 : 120 })}</div>
    <div class="cover__title" aria-hidden="true">${esc(p.title)}</div>
  </div>`;
}

/* ───────────────────────── Tags & badges ───────────────────────── */

export function tags(list, max = Infinity) {
  const items = asArray(list);
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return `<ul class="tags" aria-label="Technologies">${shown.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}${
    rest > 0 ? `<li class="tag tag--more" title="${esc(items.slice(max).join(', '))}">+${rest}</li>` : ''
  }</ul>`;
}

export function statusBadge(status) {
  if (!status) return '';
  return `<span class="badge badge--status badge--${esc(slugify(status))}"><i class="badge__dot"></i>${esc(statusLabel(status))}</span>`;
}

/* ───────────────────────── Project card ───────────────────────── */

/**
 * @param {object} p
 * @param {{root:string, index?:number, featured?:boolean}} o
 */
export function projectCard(p, { root, index = 0, featured = false }) {
  const href = `${root}projects/${p.slug}/`;
  const search = [p.title, p.shortDescription, p.category, ...asArray(p.technologies)].join(' ').toLowerCase();
  return `<article class="pcard${featured ? ' pcard--featured' : ''}" data-reveal data-tilt data-spotlight style="--i:${index % 4}"
    data-category="${esc(p.category)}" data-tech="${esc(asArray(p.technologies).join('|'))}" data-search="${esc(search)}">
    <div class="pcard__media vt-cover" style="--vt:cover-${esc(p.slug)}">${cover(p, { root })}</div>
    <div class="pcard__body">
      <div class="pcard__meta"><span class="badge">${esc(p.category)}</span>${statusBadge(p.status)}</div>
      <h3 class="pcard__title">${esc(p.title)}</h3>
      <p class="pcard__desc">${esc(p.shortDescription)}</p>
      ${tags(p.technologies, featured ? 5 : 4)}
      <div class="pcard__actions">
        <a class="btn btn--sm btn--soft pcard__cta" href="${href}" aria-label="View details: ${esc(p.title)}">View Details ${icon('arrow-right', { size: 16, cls: 'btn__arrow' })}</a>
        ${p.githubUrl ? `<a class="icon-btn icon-btn--sm pcard__gh" href="${esc(p.githubUrl)}" target="_blank" rel="noopener" aria-label="${esc(p.title)} on GitHub">${icon('github', { size: 17 })}</a>` : ''}
      </div>
    </div>
  </article>`;
}

/* ───────────────────────── Skills ───────────────────────── */

function skillIcon(s) {
  const fallback = icon(s.icon || 'code', { size: 16 });
  if (!s.devicon) return `<span class="chip__ico">${fallback}</span>`;
  return `<span class="chip__ico${s.mono ? ' chip__ico--mono' : ''}"><img src="${DEVICON}${s.devicon}.svg" alt="" width="16" height="16" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('is-fallback')">${fallback}</span>`;
}

/** Bento grid: groups are paired in rows; the busier group of a pair gets the wider column. */
export function skillsGrid(groups) {
  const spans = [];
  for (let i = 0; i < groups.length; i += 2) {
    const a = groups[i].items.length;
    const b = groups[i + 1]?.items.length;
    if (b == null) spans.push(12);
    else if (a === b) spans.push(6, 6);
    else spans.push(a > b ? 7 : 5, a > b ? 5 : 7);
  }
  return groups
    .map(
      (g, i) => `<article class="skill-card" data-reveal data-spotlight style="--span:${spans[i]};--i:${i % 2}">
      <header class="skill-card__head">
        <span class="skill-card__icon">${icon(g.icon, { size: 20 })}</span>
        <span class="skill-card__num">${String(i + 1).padStart(2, '0')}</span>
      </header>
      <h3 class="skill-card__title">${esc(g.title)}</h3>
      <p class="skill-card__blurb">${esc(g.blurb)}</p>
      <ul class="chips">${g.items.map((s, j) => `<li class="chip" style="--j:${j}">${skillIcon(s)}<span>${esc(s.name)}</span></li>`).join('')}</ul>
    </article>`,
    )
    .join('');
}

/** Infinite logo marquee built from every skill that has a logo. */
export function marquee(groups) {
  const seen = new Set();
  const items = groups
    .flatMap((g) => g.items)
    .filter((s) => s.devicon && !seen.has(s.devicon) && seen.add(s.devicon));
  const row = (list) =>
    list
      .map(
        (s) =>
          `<li class="marquee__item"><span class="chip__ico${s.mono ? ' chip__ico--mono' : ''}"><img src="${DEVICON}${s.devicon}.svg" alt="" width="22" height="22" loading="lazy" decoding="async" onerror="this.parentNode.classList.add('is-fallback')">${icon(s.icon || 'code', { size: 20 })}</span>${esc(s.name.replace(/ (Development|Integration)$/, ''))}</li>`,
      )
      .join('');
  const half = Math.ceil(items.length / 2);
  const a = items.slice(0, half);
  const b = items.slice(half);
  const track = (list, rev) =>
    `<div class="marquee__row${rev ? ' marquee__row--rev' : ''}"><ul class="marquee__track">${row(list)}</ul><ul class="marquee__track" aria-hidden="true">${row(list)}</ul></div>`;
  return `<div class="marquee" aria-label="Technologies I work with">${track(a)}${track(b, true)}</div>`;
}

/* ───────────────────────── Training & achievements ───────────────────────── */

export function trainingCards(list) {
  return list
    .map(
      (t) => `<article class="training" data-reveal data-spotlight>
      <div class="training__main">
        <span class="badge badge--accent">${icon('graduation', { size: 14 })} ${esc(t.type)}</span>
        <h3 class="training__provider">${esc(t.provider)}</h3>
        <p class="training__program">${esc(t.program)}</p>
        <ul class="checklist">${t.points.map((pt, i) => `<li data-reveal style="--i:${i + 1}">${icon('check', { size: 16 })}<span>${esc(pt)}</span></li>`).join('')}</ul>
        ${t.certificateUrl ? `<a class="btn btn--sm btn--ghost" href="${esc(t.certificateUrl)}" target="_blank" rel="noopener">View certificate ${icon('external', { size: 15 })}</a>` : ''}
      </div>
      <dl class="training__stats">
        ${t.stats
          .map(
            (s) => `<div class="stat">
          <dt class="stat__label">${esc(s.label)}</dt>
          <dd class="stat__value" data-count="${s.value}" data-decimals="${s.decimals || 0}" data-prefix="${esc(s.prefix || '')}" data-suffix="${esc(s.suffix || '')}">${esc(s.prefix || '')}${s.value}${esc(s.suffix || '')}</dd>
        </div>`,
          )
          .join('')}
      </dl>
    </article>`,
    )
    .join('');
}

export function achievementsTimeline(list) {
  return `<div class="timeline" data-timeline>
    <div class="timeline__track" aria-hidden="true"><span class="timeline__fill" data-timeline-fill></span></div>
    ${list
      .map(
        (a, i) => `<article class="tl-item${i % 2 ? ' tl-item--right' : ''}">
        <span class="tl-item__node" aria-hidden="true">${icon(a.icon || 'award', { size: 18 })}</span>
        <div class="tl-card${a.highlight ? ' tl-card--highlight' : ''}" data-reveal="${i % 2 ? 'right' : 'left'}" data-spotlight>
          <span class="badge${a.highlight ? ' badge--gold' : ''}">${esc(a.badge)}</span>
          <h3 class="tl-card__title">${esc(a.title)}</h3>
          <p class="tl-card__summary">${esc(a.summary)}</p>
          <ul class="tl-card__list">${a.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
          ${a.certificateUrl ? `<a class="btn btn--sm btn--ghost" href="${esc(a.certificateUrl)}" target="_blank" rel="noopener">View certificate ${icon('external', { size: 15 })}</a>` : ''}
        </div>
      </article>`,
      )
      .join('')}
  </div>`;
}
