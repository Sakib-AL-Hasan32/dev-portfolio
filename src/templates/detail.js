/** Reusable project detail template — every /projects/<slug>/ page is generated from this. */
import { esc, asArray, normImage, normFeature, assetUrl, statusLabel, formatDate, paragraphs } from './util.js';
import { icon } from './icons.js';
import { cover, tags, statusBadge } from './components.js';

function links(p, cls = 'btn') {
  const list = [
    p.githubUrl && { href: p.githubUrl, label: 'GitHub Repository', ico: 'github', primary: true },
    p.liveUrl && { href: p.liveUrl, label: 'Live Demo', ico: 'globe', primary: !p.githubUrl },
    p.demoUrl && { href: p.demoUrl, label: 'Demo', ico: 'play' },
    p.docsUrl && { href: p.docsUrl, label: 'Documentation', ico: 'doc' },
  ].filter(Boolean);
  return list
    .map(
      (l) =>
        `<a class="${cls} ${l.primary ? 'btn--primary' : 'btn--ghost'}" href="${esc(l.href)}" target="_blank" rel="noopener">${icon(l.ico, { size: 18 })}<span>${esc(l.label)}</span>${icon('arrow-up-right', { size: 16, cls: 'btn__arrow' })}</a>`,
    )
    .join('');
}

function section(id, eyebrow, title, body) {
  return `<section class="dsec" id="${id}" aria-labelledby="${id}-title" data-reveal>
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h2 class="dsec__title" id="${id}-title">${esc(title)}</h2>
    ${body}
  </section>`;
}

function pagerCard(p, dir, root) {
  return `<a class="pager__card pager__card--${dir}" href="${root}projects/${p.slug}/" data-spotlight>
    <span class="pager__dir">${dir === 'prev' ? `${icon('arrow-left', { size: 16 })} Previous` : `Next ${icon('arrow-right', { size: 16 })}`}</span>
    <span class="pager__title">${esc(p.title)}</span>
    <span class="pager__cat">${esc(p.category)}</span>
  </a>`;
}

/**
 * "GitHub" card: the project's repository link (githubUrl in src/data/projects.js), or a
 * "coming soon" note until one is added. Rendered twice: in the sidebar after "On this page"
 * (wide screens) and after "How it's built" (one-column layout); CSS shows the right one.
 */
function githubCard(p, where) {
  const url = p.githubUrl;
  const repo = url ? url.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/+$/, '') : '';
  const body = url
    ? `<a class="gh-card__repo" href="${esc(url)}" target="_blank" rel="noopener">
        <span class="gh-card__ico">${icon('github', { size: 20 })}</span>
        <span class="gh-card__text"><b>${esc(repo || 'Repository')}</b><small>View source on GitHub</small></span>
        ${icon('arrow-up-right', { size: 16, cls: 'gh-card__go' })}
      </a>`
    : `<div class="gh-card__repo is-empty">
        <span class="gh-card__ico">${icon('github', { size: 20 })}</span>
        <span class="gh-card__text"><b>Repository</b><small>Link coming soon</small></span>
        <span class="gh-card__soon">Soon</span>
      </div>`;
  return `<div class="aside-card gh-card gh-card--${where}">
    <p class="aside-card__title">GitHub</p>
    ${body}
  </div>`;
}

/**
 * @param {object} p project
 * @param {{root:string, prev?:object, next?:object}} o
 */
export function projectDetail(p, { root, prev, next }) {
  const features = asArray(p.features).map(normFeature);
  const images = [...asArray(p.gallery), ...asArray(p.screenshots)].map((img, i) => normImage(img, `${p.title} screenshot ${i + 1}`));
  const concepts = asArray(p.concepts);
  const challenges = asArray(p.challenges);
  const solutions = asArray(p.solutions);
  const linkHtml = links(p);

  const facts = [
    ['Category', esc(p.category)],
    p.status && ['Status', esc(statusLabel(p.status))],
    p.role && ['Role', esc(p.role)],
    p.architecture && ['Architecture', esc(p.architecture)],
    p.date && ['Date', esc(formatDate(p.date))],
  ].filter(Boolean);

  /* Overview */
  const overview = section(
    'overview',
    'Overview',
    'What it is',
    `<div class="prose">${paragraphs(p.fullDescription || p.shortDescription)}</div>
    ${p.problem || p.motivation ? `<div class="callouts">
      ${p.problem ? `<div class="callout">${icon('target', { size: 20 })}<div><h3>The problem</h3><p>${esc(p.problem)}</p></div></div>` : ''}
      ${p.motivation ? `<div class="callout">${icon('bulb', { size: 20 })}<div><h3>Why I built it</h3><p>${esc(p.motivation)}</p></div></div>` : ''}
    </div>` : ''}`,
  );

  /* Features */
  const featureHtml = features.length
    ? section(
        'features',
        'Key features',
        'What it does',
        `<ul class="features">${features
          .map(
            (f, i) => `<li class="feature" data-reveal data-spotlight style="--i:${i % 3}">
            <span class="feature__num">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="feature__title">${esc(f.title)}</h3>
            ${f.description ? `<p class="feature__desc">${esc(f.description)}</p>` : ''}
          </li>`,
          )
          .join('')}</ul>`,
      )
    : '';

  /* Technical implementation */
  const tech = section(
    'implementation',
    'Technical implementation',
    'How it’s built',
    `<div class="impl">
      <div class="impl__block">
        <h3 class="impl__label">${icon('layers', { size: 16 })} Technologies</h3>
        ${tags(p.technologies)}
      </div>
      ${p.architecture ? `<div class="impl__block"><h3 class="impl__label">${icon('network', { size: 16 })} Architecture</h3><p class="impl__value">${esc(p.architecture)}</p></div>` : ''}
      ${p.role ? `<div class="impl__block"><h3 class="impl__label">${icon('user', { size: 16 })} My role</h3><p class="impl__value">${esc(p.role)}</p></div>` : ''}
      ${concepts.length ? `<div class="impl__block impl__block--wide"><h3 class="impl__label">${icon('cpu', { size: 16 })} Key concepts</h3><ul class="concepts">${concepts.map((c) => `<li>${icon('check', { size: 14 })}${esc(c)}</li>`).join('')}</ul></div>` : ''}
    </div>`,
  );

  /* Challenges & solutions */
  const cs =
    challenges.length || solutions.length
      ? section(
          'challenges',
          'Challenges & solutions',
          'Problems I solved',
          `<div class="cs">
        ${challenges.length ? `<div class="cs__col"><h3>${icon('alert', { size: 18 })} Challenges</h3><ul>${challenges.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
        ${solutions.length ? `<div class="cs__col cs__col--ok"><h3>${icon('check-circle', { size: 18 })} Solutions</h3><ul>${solutions.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></div>` : ''}
      </div>`,
        )
      : '';

  /* Gallery */
  const gallery = images.length
    ? section(
        'gallery',
        'Gallery',
        'Screens & visuals',
        `<div class="gallery" data-gallery>${images
          .map(
            (img, i) => `<figure class="gallery__item" data-reveal="clip" style="--i:${i % 3}">
            <button type="button" class="gallery__btn" data-lightbox="${i}" aria-label="Open image ${i + 1} of ${images.length}">
              <img src="${esc(assetUrl(root, img.src))}" alt="${esc(img.alt)}" loading="lazy" decoding="async">
              <span class="gallery__zoom">${icon('zoom-in', { size: 20 })}</span>
            </button>
            ${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ''}
          </figure>`,
          )
          .join('')}</div>`,
      )
    : '';

  const toc = [
    ['overview', 'Overview'],
    features.length && ['features', 'Key features'],
    ['implementation', 'Implementation'],
    (challenges.length || solutions.length) && ['challenges', 'Challenges'],
    images.length && ['gallery', 'Gallery'],
  ].filter(Boolean);

  return `<main id="main" class="detail">
  <section class="detail-hero container">
    <a class="back-link" href="${root}projects/" data-back>${icon('arrow-left', { size: 16 })}<span>All projects</span></a>
    <div class="detail-hero__head">
      <div class="pcard__meta" data-reveal><span class="badge">${esc(p.category)}</span>${statusBadge(p.status)}${p.date ? `<span class="badge badge--plain">${icon('calendar', { size: 13 })} ${esc(formatDate(p.date))}</span>` : ''}</div>
      <h1 class="detail-hero__title" data-split>${esc(p.title)}</h1>
      <p class="detail-hero__lead" data-reveal style="--i:1">${esc(p.shortDescription)}</p>
      <div data-reveal style="--i:2">${tags(p.technologies)}</div>
      ${linkHtml ? `<div class="detail-hero__links" data-reveal style="--i:3">${linkHtml}</div>` : ''}
    </div>
    <div class="detail-hero__cover">${cover(p, { root, eager: true, large: true })}</div>
  </section>

  <div class="container detail-body">
    <aside class="detail-aside">
      <div class="aside-card">
        <p class="aside-card__title">Project facts</p>
        <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        ${linkHtml ? `<div class="aside-card__links">${links(p, 'btn btn--sm btn--block')}</div>` : ''}
      </div>
      <nav class="toc" aria-label="On this page" data-toc>
        <p class="aside-card__title">On this page</p>
        <ul>${toc.map(([id, label]) => `<li><a href="#${id}" data-toc-link="${id}">${label}</a></li>`).join('')}</ul>
      </nav>
      ${githubCard(p, 'aside')}
    </aside>
    <div class="detail-main">
      ${overview}
      ${featureHtml}
      ${tech}
      ${githubCard(p, 'inline')}
      ${cs}
      ${gallery}
    </div>
  </div>

  ${prev || next ? `<nav class="pager container" aria-label="More projects">
    ${prev ? pagerCard(prev, 'prev', root) : '<span></span>'}
    <a class="pager__all" href="${root}projects/">${icon('grid', { size: 18 })}<span>All projects</span></a>
    ${next ? pagerCard(next, 'next', root) : '<span></span>'}
  </nav>` : ''}
  ${images.length ? `<script type="application/json" data-gallery-data>${JSON.stringify(images.map((i) => ({ src: assetUrl(root, i.src), alt: i.alt, caption: i.caption || '' }))).replace(/</g, '\\u003c')}</script>` : ''}
</main>`;
}
